import { hasInjectionContext as Dr, inject as Un, effectScope as Mr, ref as I, markRaw as Ur, onMounted as Ft, onUnmounted as Wr, watch as Oe, createApp as Fr, readonly as Hr, getCurrentInstance as At, nextTick as Ht, reactive as Kr, renderSlot as q, openBlock as b, createBlock as R, Teleport as Wn, createCommentVNode as O, useId as qr, mergeProps as V, h as Yr, resolveDirective as Kt, withDirectives as Re, resolveDynamicComponent as Je, withCtx as j, normalizeClass as te, createElementBlock as x, createElementVNode as v, defineComponent as J, createTextVNode as M, toDisplayString as $, resolveComponent as tn, computed as Y, unref as h, createVNode as A, onBeforeUnmount as Gr, Fragment as fe, renderList as me, vModelCheckbox as Qr, withModifiers as Ye, vShow as nn } from "vue";
import { addCollection as Zr, Icon as G } from "@iconify/vue";
import { config as rn, addIcons as Jr, on as Xr, applyThemeMode as bt, host as Fn, hostCss as eo, loadCss as to, loadByTagName as no, api as Ne, define as ro } from "@wippy-fe/proxy";
var Lt = "data-wippy-visible";
function on(e) {
  const t = e.getAttribute(Lt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var oo = Object.defineProperty, ao = (e, t, n) => t in e ? oo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, H = (e, t, n) => ao(e, typeof t != "symbol" ? t + "" : t, n), io = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], so = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function an(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function lo(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [s, c] of Object.entries(o)) {
            const i = typeof c == "string" ? an(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? an(r) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function co(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${so} {
${t}
}`;
}
function uo(e, t) {
  const n = co(t);
  n && Hn(e, n, "@wippy-fe/css-variables-bridge");
}
function po(e, t) {
  const r = (t ?? io).map(async (o) => {
    const a = eo[o];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await to(a);
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
function fo(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Hn(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function mo(e, t) {
  Hn(e, t, "@wippy-fe/custom-css");
}
function Kn(e) {
  return e.__wippyHost ?? null;
}
function bo(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function vo(e, t, n) {
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
function $t(e, t) {
  const n = {}, r = [];
  for (const [o, a] of Object.entries(t.properties)) {
    const s = e.getAttribute(o), c = bo(o);
    if (s === null) {
      a.default !== void 0 && (n[c] = a.default);
      continue;
    }
    const i = vo(o, s, a);
    i.error ? r.push(i.error) : n[c] = i.value;
  }
  return { props: n, errors: r };
}
var ho = class {
  constructor(e, t) {
    H(this, "_props"), H(this, "_errors"), H(this, "_content"), H(this, "_hostVisibility"), H(this, "_propsListeners", /* @__PURE__ */ new Set()), H(this, "_contentListeners", /* @__PURE__ */ new Set()), H(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), H(this, "_disposed", !1), H(this, "_emitToDom"), H(this, "props"), H(this, "events"), H(this, "content"), H(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, go = class extends HTMLElement {
  constructor() {
    super(), H(this, "_internals"), H(this, "_contentObserver", null), H(this, "_initialized", !1), H(this, "_container", null), H(this, "_reactive", null), H(this, "_lastProps", null), H(this, "_lastErrors", []), H(this, "_lastContent", null), H(this, "_themeUnsub", null), H(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = on(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Lt])];
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
    return Kn(this);
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
        const a = $t(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, r = a.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new ho(
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
        this.onInit(n), e.inlineCss && fo(n, e.inlineCss);
        try {
          const d = rn?.theming, l = lo(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          uo(n, l);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const d = rn?.theming, l = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join(`
`);
            l && mo(n, l);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && po(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, Jr(Zr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Xr("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: a } = $t(this, e.propsSchema);
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
  _applyTheme(e = Fn.getThemeMode?.()) {
    bt(e, this), this._container && bt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), bt("auto", this), this._container && bt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Lt) {
      const c = this._hostVisible, i = on(this);
      if (i === c)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, c), this.onHostVisibilityChanged(i, c));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: a } = $t(this, r.propsSchema);
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
function yo(e) {
  return e.__wippyHostBus ?? null;
}
function xo(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let qn;
const Yn = (e) => qn = e, ko = () => Dr() && Un(Gn) || qn, Gn = (
  /* istanbul ignore next */
  Symbol()
);
function wo() {
  const e = Mr(!0), t = e.run(() => I({}));
  let n = [], r = [];
  const o = Ur({
    install(a) {
      Yn(o), o._a = a, a.provide(Gn, o), a.config.globalProperties.$pinia = o, r.forEach((s) => n.push(s)), r = [];
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
var So = Object.defineProperty, _o = (e, t, n) => t in e ? So(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Be = (e, t, n) => _o(e, typeof t != "symbol" ? t + "" : t, n), $o = /* @__PURE__ */ Symbol("wippy:emit"), Co = /* @__PURE__ */ Symbol("wippy:props"), To = /* @__PURE__ */ Symbol("wippy:props_error"), Po = /* @__PURE__ */ Symbol("wippy:content"), Oo = /* @__PURE__ */ Symbol("wippy:panel-id"), Ao = /* @__PURE__ */ Symbol("wippy:layout-bus"), Lo = /* @__PURE__ */ Symbol("wippy:host"), Qn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Eo() {
  const e = Un(Qn);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function No(e) {
  const t = Eo();
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
  return Ft(() => (n = !0, a())), Wr(() => {
    n = !1, o = !1;
  }), Oe(t, (s, c) => {
    if (n && c === !1 && s === !0)
      return a();
  }), t;
}
var jo = class extends go {
  constructor() {
    super(...arguments), Be(this, "_vueApp", null), Be(this, "_propsRef", I({})), Be(this, "_errorsRef", I([])), Be(this, "_contentRef", I(null)), Be(this, "_hostVisibilityRef", I(null)), Be(this, "_bridgeAbort", null);
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
      const l = ko(), u = Fr(d.rootComponent);
      this._vueApp = u;
      const p = wo();
      if (d.piniaPlugins)
        for (const m of d.piniaPlugins)
          p.use(m);
      if (u.use(p), d.plugins)
        for (const m of d.plugins)
          u.use(m);
      u.provide(Co, this._propsRef), u.provide(To, this._errorsRef), u.provide($o, this.emitEvent.bind(this)), u.provide(Po, this._contentRef), u.provide(Qn, this._hostVisibilityRef), u.provide(Oo, xo(this)), u.provide(Ao, yo(this)), u.provide(Lo, Kn(this)), d.providers && d.providers(u, this), u.mount(t), l && Yn(l);
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
}, zo = Object.defineProperty, sn = Object.getOwnPropertySymbols, Io = Object.prototype.hasOwnProperty, Ro = Object.prototype.propertyIsEnumerable, ln = (e, t, n) => t in e ? zo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Vo = (e, t) => {
  for (var n in t || (t = {})) Io.call(t, n) && ln(e, n, t[n]);
  if (sn) for (var n of sn(t)) Ro.call(t, n) && ln(e, n, t[n]);
  return e;
};
function Ve(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Et(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), a, s, c;
  if (r && o) {
    if (s = e.length, s != t.length) return !1;
    for (a = s; a-- !== 0; ) if (!Et(e[a], t[a], n)) return !1;
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
  for (a = s; a-- !== 0; ) if (c = p[a], !Et(e[c], t[c], n)) return !1;
  return !0;
}
function Bo(e, t) {
  return Et(e, t);
}
function qt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function F(e) {
  return !Ve(e);
}
function cn(e, t) {
  return null;
}
function Do(e, t, n) {
  return n ? cn() === cn() : Bo(e, t);
}
function we(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Zn(e = {}, t = {}) {
  let n = Vo({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    we(t[o]) && o in e && we(e[o]) ? n[o] = Zn(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Mo(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : Zn(t, n), {});
}
function ie(e, ...t) {
  return qt(e) ? e(...t) : e;
}
function ne(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function ke(e) {
  return ne(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Yt(e, t = "", n = {}) {
  let r = ke(t).split("."), o = r.shift();
  if (o) {
    if (we(e)) {
      let a = Object.keys(e).find((s) => ke(s) === o) || "";
      return Yt(ie(e[a], n), r.join("."), n);
    }
    return;
  }
  return ie(e, n);
}
function Jn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Uo(e) {
  return F(e) && !isNaN(e);
}
function ze(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Wo(...e) {
  return Mo(...e);
}
function Ge(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Fo(e) {
  return ne(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Xn(e) {
  return ne(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function er() {
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
function Le(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [Le(...r)] : Object.entries(r).map(([s, c]) => c ? s : void 0);
        t = a.length ? t.concat(a.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Ho(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Ko(e, t) {
  if (e && t) {
    let n = (r) => {
      Ho(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Ct(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function dn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function un(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function tr(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function qo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Yo(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && qo(e));
}
function pt(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function xt(e, t = {}) {
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
        a ? e.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? xt(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Go(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return xt(r, t), r.append(...n), r;
  }
}
function Xe(e, t) {
  return pt(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Qo(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function Fe(e, t) {
  if (pt(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Nt(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function He(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || dn(document.documentElement) || dn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function nr(e, t) {
  return e ? e.offsetHeight : 0;
}
function Qe(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function rr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Zo(e, t = "", n) {
  pt(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var vt = {};
function Jo(e = "pui_id_") {
  return Object.hasOwn(vt, e) || (vt[e] = 0), vt[e]++, `${e}${vt[e]}`;
}
var Xo = Object.defineProperty, ea = Object.defineProperties, ta = Object.getOwnPropertyDescriptors, kt = Object.getOwnPropertySymbols, or = Object.prototype.hasOwnProperty, ar = Object.prototype.propertyIsEnumerable, pn = (e, t, n) => t in e ? Xo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, be = (e, t) => {
  for (var n in t || (t = {})) or.call(t, n) && pn(e, n, t[n]);
  if (kt) for (var n of kt(t)) ar.call(t, n) && pn(e, n, t[n]);
  return e;
}, Tt = (e, t) => ea(e, ta(t)), Ce = (e, t) => {
  var n = {};
  for (var r in e) or.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && kt) for (var r of kt(e)) t.indexOf(r) < 0 && ar.call(e, r) && (n[r] = e[r]);
  return n;
}, na = er(), Q = na, et = /{([^}]*)}/g, ir = /(\d+\s+[\+\-\*\/]\s+\d+)/g, sr = /var\([^)]+\)/g;
function fn(e) {
  return ne(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function ra(e) {
  return we(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function oa(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function jt(e = "", t = "") {
  return oa(`${ne(e, !1) && ne(t, !1) ? `${e}-` : e}${t}`);
}
function lr(e = "", t = "") {
  return `--${jt(e, t)}`;
}
function aa(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function cr(e, t = "", n = "", r = [], o) {
  if (ne(e)) {
    let a = e.trim();
    if (aa(a)) return;
    if (ze(a, et)) {
      let s = a.replaceAll(et, (c) => {
        let i = c.replace(/{|}/g, "").split(".").filter((d) => !r.some((l) => ze(d, l)));
        return `var(${lr(n, Xn(i.join("-")))}${F(o) ? `, ${o}` : ""})`;
      });
      return ze(s.replace(sr, "0"), ir) ? `calc(${s})` : s;
    }
    return a;
  } else if (Uo(e)) return e;
}
function ia(e, t, n) {
  ne(t, !1) && e.push(`${t}:${n};`);
}
function De(e, t) {
  return e ? `${e}{${t}}` : "";
}
function dr(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, c) {
    let i = [], d = 0, l = "", u = null, p = 0;
    for (; d <= s.length; ) {
      let m = s[d];
      if ((m === '"' || m === "'" || m === "`") && s[d - 1] !== "\\" && (u = u === m ? null : m), !u && (m === "(" && p++, m === ")" && p--, (m === "," || d === s.length) && p === 0)) {
        let S = l.trim();
        S.startsWith("dt(") ? i.push(dr(S, c)) : i.push(r(S)), l = "", d++;
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
var Ie = (...e) => sa(W.getTheme(), ...e), sa = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: a } = W.defaults || {}, { prefix: s, transform: c } = e?.options || a || {}, i = ze(t, et) ? t : `{${t}}`;
    return r === "value" || Ve(r) && c === "strict" ? W.getTokenValue(t) : cr(i, void 0, s, [o.excludedKeyRegex], n);
  }
  return "";
};
function ht(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, a) => {
      var s;
      return r + o + ((s = ie(t[a], { dt: Ie })) != null ? s : "");
    }, "");
    return dr(n, Ie);
  }
  return ie(e, { dt: Ie });
}
function la(e, t = {}) {
  let n = W.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, s = [], c = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: l, path: u } = i.pop();
    for (let p in l) {
      let m = l[p], S = ra(m), P = ze(p, a) ? jt(u) : jt(u, Xn(p));
      if (we(S)) i.push({ node: S, path: P });
      else {
        let _ = lr(P), T = cr(S, P, r, [a]);
        ia(c, _, T);
        let C = P;
        r && C.startsWith(r + "-") && (C = C.slice(r.length + 1)), s.push(C.replace(/-/g, "."));
      }
    }
  }
  let d = c.join("");
  return { value: c, tokens: s, declarations: d, css: De(o, d) };
}
var pe = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return la(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, s, c, i, d, l, u;
  let { preset: p, options: m } = t, S, P, _, T, C, E, f;
  if (F(p) && m.transform !== "strict") {
    let { primitive: y, semantic: L, extend: D } = p, re = L || {}, { colorScheme: he } = re, K = Ce(re, ["colorScheme"]), le = D || {}, { colorScheme: Se } = le, _e = Ce(le, ["colorScheme"]), ge = he || {}, { dark: ce } = ge, $e = Ce(ge, ["dark"]), oe = Se || {}, { dark: ye } = oe, Te = Ce(oe, ["dark"]), de = F(y) ? this._toVariables({ primitive: y }, m) : {}, se = F(K) ? this._toVariables({ semantic: K }, m) : {}, ue = F($e) ? this._toVariables({ light: $e }, m) : {}, ae = F(ce) ? this._toVariables({ dark: ce }, m) : {}, k = F(_e) ? this._toVariables({ semantic: _e }, m) : {}, w = F(Te) ? this._toVariables({ light: Te }, m) : {}, g = F(ye) ? this._toVariables({ dark: ye }, m) : {}, [X, ft] = [(a = de.declarations) != null ? a : "", de.tokens], [mt, $r] = [(s = se.declarations) != null ? s : "", se.tokens || []], [Cr, Tr] = [(c = ue.declarations) != null ? c : "", ue.tokens || []], [Pr, Or] = [(i = ae.declarations) != null ? i : "", ae.tokens || []], [Ar, Lr] = [(d = k.declarations) != null ? d : "", k.tokens || []], [Er, Nr] = [(l = w.declarations) != null ? l : "", w.tokens || []], [jr, zr] = [(u = g.declarations) != null ? u : "", g.tokens || []];
    S = this.transformCSS(e, X, "light", "variable", m, r, o), P = ft;
    let Ir = this.transformCSS(e, `${mt}${Cr}`, "light", "variable", m, r, o), Rr = this.transformCSS(e, `${Pr}`, "dark", "variable", m, r, o);
    _ = `${Ir}${Rr}`, T = [.../* @__PURE__ */ new Set([...$r, ...Tr, ...Or])];
    let Vr = this.transformCSS(e, `${Ar}${Er}color-scheme:light`, "light", "variable", m, r, o), Br = this.transformCSS(e, `${jr}color-scheme:dark`, "dark", "variable", m, r, o);
    C = `${Vr}${Br}`, E = [.../* @__PURE__ */ new Set([...Lr, ...Nr, ...zr])], f = ie(p.css, { dt: Ie });
  }
  return { primitive: { css: S, tokens: P }, semantic: { css: _, tokens: T }, global: { css: C, tokens: E }, style: f };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: a, selector: s }) {
  var c, i, d;
  let l, u, p;
  if (F(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), S = t, { colorScheme: P, extend: _, css: T } = S, C = Ce(S, ["colorScheme", "extend", "css"]), E = _ || {}, { colorScheme: f } = E, y = Ce(E, ["colorScheme"]), L = P || {}, { dark: D } = L, re = Ce(L, ["dark"]), he = f || {}, { dark: K } = he, le = Ce(he, ["dark"]), Se = F(C) ? this._toVariables({ [m]: be(be({}, C), y) }, n) : {}, _e = F(re) ? this._toVariables({ [m]: be(be({}, re), le) }, n) : {}, ge = F(D) ? this._toVariables({ [m]: be(be({}, D), K) }, n) : {}, [ce, $e] = [(c = Se.declarations) != null ? c : "", Se.tokens || []], [oe, ye] = [(i = _e.declarations) != null ? i : "", _e.tokens || []], [Te, de] = [(d = ge.declarations) != null ? d : "", ge.tokens || []], se = this.transformCSS(m, `${ce}${oe}`, "light", "variable", n, o, a, s), ue = this.transformCSS(m, Te, "dark", "variable", n, o, a, s);
    l = `${se}${ue}`, u = [.../* @__PURE__ */ new Set([...$e, ...ye, ...de])], p = ie(T, { dt: Ie });
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
  return o ? `@layer ${ie(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: a }), c = Object.entries(r).reduce((i, [d, l]) => i.push(`${d}="${l}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [d, l]) => {
    if (we(l) && Object.hasOwn(l, "css")) {
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
    if (typeof this.value == "string" && et.test(this.value)) {
      let u = this.value.trim().replace(et, (p) => {
        var m;
        let S = p.slice(1, -1), P = this.tokens[S];
        if (!P) return console.warn(`Token not found for path: ${S}`), "__UNRESOLVED__";
        let _ = P.computed(c, i, d);
        return Array.isArray(_) && _.length === 2 ? `light-dark(${_[0].value},${_[1].value})` : (m = _?.value) != null ? m : "__UNRESOLVED__";
      });
      l = ir.test(u.replace(sr, "0")) ? `calc(${u})` : u;
    }
    return Ve(i.binding) && delete i.binding, d.pop(), { colorScheme: c, path: this.path, paths: i, value: l.includes("__UNRESOLVED__") ? void 0 : l };
  }, s = (c, i, d) => {
    Object.entries(c).forEach(([l, u]) => {
      let p = ze(l, t.variable.excludedKeyRegex) ? i : i ? `${i}.${fn(l)}` : fn(l), m = d ? `${d}.${l}` : l;
      we(u) ? s(u, p, m) : (o[p] || (o[p] = { paths: [], computed: (S, P = {}, _ = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, P.binding, _);
        if (S && S !== "none") for (let T = 0; T < o[p].paths.length; T++) {
          let C = o[p].paths[T];
          if (C.scheme === S) return C.computed(S, P.binding, _);
        }
        return o[p].paths.map((T) => T.computed(T.scheme, P[T.scheme], _));
      } }), o[p].paths.push({ path: m, value: u, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return s(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((c) => c.split(".").filter((i) => !ze(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = e[o]) == null ? void 0 : r.computed(a)].flat().filter((c) => c);
  return s.length === 1 ? s[0].value : s.reduce((c = {}, i) => {
    let d = i, { colorScheme: l } = d, u = Ce(d, ["colorScheme"]);
    return c[l] = u, c;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? De(F(t) ? `${e}${t},${e} ${t}` : e, r) : De(e, De(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, a, s, c) {
  if (F(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let d = this.getColorSchemeOption(o, s);
      t = n === "dark" ? d.reduce((l, { type: u, selector: p }) => (F(p) && (l += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, c, u, t)), l), "") : De(c ?? ":root,:host", t);
    }
    if (i) {
      let d = { name: "primeui" };
      we(i) && (d.name = ie(i.name, { name: e, type: r })), F(d.name) && (t = De(`@layer ${d.name}`, t), a?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, W = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Tt(be({}, t), { options: be(be({}, this.defaults.options), t.options) }), this._tokens = pe.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), Q.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Tt(be({}, this.theme), { preset: e }), this._tokens = pe.createTokens(e, this.defaults), this.clearLoadedStyleNames(), Q.emit("preset:change", e), Q.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Tt(be({}, this.theme), { options: e }), this.clearLoadedStyleNames(), Q.emit("options:change", e), Q.emit("theme:change", this.theme);
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
  return pe.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return pe.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return pe.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return pe.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return pe.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return pe.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return pe.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return pe.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return pe.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), Q.emit(`theme:${t}:load`, e), !this._loadingStyles.size && Q.emit("theme:load"));
} }, Z = {
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
}, ca = `
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
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
function mn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function bn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? mn(Object(n), !0).forEach(function(r) {
      da(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : mn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function da(e, t, n) {
  return (t = ua(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ua(e) {
  var t = pa(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function pa(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function fa(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  At() && At().components ? Ft(e) : t ? e() : Ht(e);
}
var ma = 0;
function ba(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = I(!1), r = I(e), o = I(null), a = rr() ? window.document : void 0, s = t.document, c = s === void 0 ? a : s, i = t.immediate, d = i === void 0 ? !0 : i, l = t.manual, u = l === void 0 ? !1 : l, p = t.name, m = p === void 0 ? "style_".concat(++ma) : p, S = t.id, P = S === void 0 ? void 0 : S, _ = t.media, T = _ === void 0 ? void 0 : _, C = t.nonce, E = C === void 0 ? void 0 : C, f = t.first, y = f === void 0 ? !1 : f, L = t.onMounted, D = L === void 0 ? void 0 : L, re = t.onUpdated, he = re === void 0 ? void 0 : re, K = t.onLoad, le = K === void 0 ? void 0 : K, Se = t.props, _e = Se === void 0 ? {} : Se, ge = function() {
  }, ce = function(ye) {
    var Te = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (c) {
      var de = bn(bn({}, _e), Te), se = de.name || m, ue = de.id || P, ae = de.nonce || E;
      o.value = c.querySelector('style[data-primevue-style-id="'.concat(se, '"]')) || c.getElementById(ue) || c.createElement("style"), o.value.isConnected || (r.value = ye || e, xt(o.value, {
        type: "text/css",
        id: ue,
        media: T,
        nonce: ae
      }), y ? c.head.prepend(o.value) : c.head.appendChild(o.value), Zo(o.value, "data-primevue-style-id", se), xt(o.value, de), o.value.onload = function(k) {
        return le?.(k, {
          name: se
        });
      }, D?.(se)), !n.value && (ge = Oe(r, function(k) {
        o.value.textContent = k, he?.(se);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, $e = function() {
    !c || !n.value || (ge(), Yo(o.value) && c.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return d && !u && fa(ce), {
    id: P,
    name: m,
    el: o,
    css: r,
    unload: $e,
    load: ce,
    isLoaded: Hr(n)
  };
}
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
}
var vn, hn, gn, yn;
function xn(e, t) {
  return ya(e) || ga(e, t) || ha(e, t) || va();
}
function va() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ha(e, t) {
  if (e) {
    if (typeof e == "string") return kn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? kn(e, t) : void 0;
  }
}
function kn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ga(e, t) {
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
function ya(e) {
  if (Array.isArray(e)) return e;
}
function wn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Pt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? wn(Object(n), !0).forEach(function(r) {
      xa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : wn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function xa(e, t, n) {
  return (t = ka(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ka(e) {
  var t = wa(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function wa(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function gt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Sa = function(t) {
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
}, _a = {}, $a = {}, U = {
  name: "base",
  css: Sa,
  style: ca,
  classes: _a,
  inlineStyles: $a,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = r(ht(vn || (vn = gt(["", ""])), t));
    return F(o) ? ba(Ge(o), Pt({
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
      return W.transformCSS(n.name || t.name, "".concat(o).concat(ht(hn || (hn = gt(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return W.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return W.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return W.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return W.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return W.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = ie(this.css, {
        dt: Ie
      }) || "", o = Ge(ht(gn || (gn = gt(["", "", ""])), r, t)), a = Object.entries(n).reduce(function(s, c) {
        var i = xn(c, 2), d = i[0], l = i[1];
        return s.push("".concat(d, '="').concat(l, '"')) && s;
      }, []).join(" ");
      return F(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return W.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [W.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = ht(yn || (yn = gt(["", ""])), ie(this.style, {
        dt: Ie
      })), s = Ge(W.transformCSS(o, a)), c = Object.entries(n).reduce(function(i, d) {
        var l = xn(d, 2), u = l[0], p = l[1];
        return i.push("".concat(u, '="').concat(p, '"')) && i;
      }, []).join(" ");
      F(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(c, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Pt(Pt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ae = er();
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function Sn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function yt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Sn(Object(n), !0).forEach(function(r) {
      Ca(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Sn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ca(e, t, n) {
  return (t = Ta(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ta(e) {
  var t = Pa(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function Pa(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Oa = {
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
    text: [Z.STARTS_WITH, Z.CONTAINS, Z.NOT_CONTAINS, Z.ENDS_WITH, Z.EQUALS, Z.NOT_EQUALS],
    numeric: [Z.EQUALS, Z.NOT_EQUALS, Z.LESS_THAN, Z.LESS_THAN_OR_EQUAL_TO, Z.GREATER_THAN, Z.GREATER_THAN_OR_EQUAL_TO],
    date: [Z.DATE_IS, Z.DATE_IS_NOT, Z.DATE_BEFORE, Z.DATE_AFTER]
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
}, Aa = Symbol();
function La(e, t) {
  var n = {
    config: Kr(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Aa, n), Ea(), Na(e, n), n;
}
var Me = [];
function Ea() {
  Q.clear(), Me.forEach(function(e) {
    return e?.();
  }), Me = [];
}
function Na(e, t) {
  var n = I(!1), r = function() {
    var d;
    if (((d = t.config) === null || d === void 0 ? void 0 : d.theme) !== "none" && !W.isStyleNameLoaded("common")) {
      var l, u, p = ((l = U.getCommonTheme) === null || l === void 0 ? void 0 : l.call(U)) || {}, m = p.primitive, S = p.semantic, P = p.global, _ = p.style, T = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      U.load(m?.css, yt({
        name: "primitive-variables"
      }, T)), U.load(S?.css, yt({
        name: "semantic-variables"
      }, T)), U.load(P?.css, yt({
        name: "global-variables"
      }, T)), U.loadStyle(yt({
        name: "global-style"
      }, T), _), W.setLoadedStyleName("common");
    }
  };
  Q.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = Oe(t.config, function(i, d) {
    Ae.emit("config:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = Oe(function() {
    return t.config.ripple;
  }, function(i, d) {
    Ae.emit("config:ripple:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = Oe(function() {
    return t.config.theme;
  }, function(i, d) {
    n.value || W.setTheme(i), t.config.unstyled || r(), n.value = !1, Ae.emit("config:theme:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !1
  }), c = Oe(function() {
    return t.config.unstyled;
  }, function(i, d) {
    !i && t.config.theme && r(), Ae.emit("config:unstyled:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Me.push(o), Me.push(a), Me.push(s), Me.push(c);
}
var ja = {
  install: function(t, n) {
    var r = Wo(Oa, n);
    La(t, r);
  }
}, ur = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = rr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function za(e, t, n, r, o, a) {
  return a.inline ? q(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (b(), R(Wn, {
    key: 1,
    to: n.appendTo
  }, [q(e.$slots, "default")], 8, ["to"])) : O("", !0);
}
ur.render = za;
var Pe = {
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
function Ia() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = qr();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var _n = U.extend({
  name: "common"
});
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function Ra(e) {
  return mr(e) || Va(e) || fr(e) || pr();
}
function Va(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ue(e, t) {
  return mr(e) || Ba(e, t) || fr(e, t) || pr();
}
function pr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fr(e, t) {
  if (e) {
    if (typeof e == "string") return zt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? zt(e, t) : void 0;
  }
}
function zt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ba(e, t) {
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
function mr(e) {
  if (Array.isArray(e)) return e;
}
function $n(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function z(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? $n(Object(n), !0).forEach(function(r) {
      Ke(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : $n(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ke(e, t, n) {
  return (t = Da(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Da(e) {
  var t = Ma(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function Ma(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ee = {
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
        Q.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        Q.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, a, s, c, i, d, l, u, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, S = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = S || m) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var P = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, _ = P ? (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 || (c = c.pt) === null || c === void 0 ? void 0 : c.originalValue : void 0, T = P ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (l = T || _) === null || l === void 0 || (l = l[this.$.type.name]) === null || l === void 0 || (l = l.hooks) === null || l === void 0 || (u = l.onBeforeCreate) === null || u === void 0 || u.call(l), this.$attrSelector = Ia(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Xe(pt(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = z({
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
      return qt(t) ? t.apply(void 0, r) : V.apply(void 0, r);
    },
    _load: function() {
      Pe.isStyleNameLoaded("base") || (U.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Pe.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Pe.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (_n.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Pe.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      F(t) && U.load(t, z({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!W.isStyleNameLoaded("common")) {
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, s = a.primitive, c = a.semantic, i = a.global, d = a.style;
          U.load(s?.css, z({
            name: "primitive-variables"
          }, this.$styleOptions)), U.load(c?.css, z({
            name: "semantic-variables"
          }, this.$styleOptions)), U.load(i?.css, z({
            name: "global-variables"
          }, this.$styleOptions)), U.loadStyle(z({
            name: "global-style"
          }, this.$styleOptions), d), W.setLoadedStyleName("common");
        }
        if (!W.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var l, u, p, m, S = ((l = this.$style) === null || l === void 0 || (u = l.getComponentTheme) === null || u === void 0 ? void 0 : u.call(l)) || {}, P = S.css, _ = S.style;
          (p = this.$style) === null || p === void 0 || p.load(P, z({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(z({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), _), W.setLoadedStyleName(this.$style.name);
        }
        if (!W.isStyleNameLoaded("layer-order")) {
          var T, C, E = (T = this.$style) === null || T === void 0 || (C = T.getLayerOrderThemeCSS) === null || C === void 0 ? void 0 : C.call(T);
          U.load(E, z({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), W.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = a.css, c = (o = this.$style) === null || o === void 0 ? void 0 : o.load(s, z({
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
      Pe.clearLoadedStyleNames(), Q.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      Q.off("theme:change", this._loadCoreStyles), Q.off("theme:change", this._load), Q.off("theme:change", this._themeScopedListener);
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
      return Yt(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(r) && !!o[r.split(".")[0]], c = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = c.mergeSections, d = i === void 0 ? !0 : i, l = c.mergeProps, u = l === void 0 ? !1 : l, p = a ? s ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, m = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, z(z({}, o), {}, {
        global: p || {}
      })), S = this._getPTDatasets(r);
      return d || !d && m ? u ? this._mergeProps(u, p, m, S) : z(z(z({}, p), m), S) : z(z({}, m), S);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return V(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = r === "root" && F((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && z(z({}, r === "root" && z(z(Ke({}, "".concat(o, "name"), ke(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && Ke({}, "".concat(o, "extend"), ke(this.$.type.name))), {}, Ke({}, "".concat(this.$attrSelector), ""))), {}, Ke({}, "".concat(o, "section"), ke(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return ne(t) || Jn(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(c) {
        var i, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, l = o ? o(c) : c, u = ke(r), p = ke(n.$name);
        return (i = d ? u !== p ? l?.[u] : void 0 : l?.[u]) !== null && i !== void 0 ? i : l;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var a = function(P) {
        return n(P, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, c = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = c.mergeSections, d = i === void 0 ? !0 : i, l = c.mergeProps, u = l === void 0 ? !1 : l, p = a(t.originalValue), m = a(t.value);
        return p === void 0 && m === void 0 ? void 0 : ne(m) ? m : ne(p) ? p : d || !d && m ? u ? this._mergeProps(u, p, m) : z(z({}, p), m) : m;
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
      return this._getPTValue(this.pt, t, z(z({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = V(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, z({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, z(z({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, z(z({}, this.$params), r)), a = this._getOptionValue(_n.inlineStyles, t, z(z({}, this.$params), r));
        return [a, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return ie(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, z({}, n.$params)) || ie(r, z({}, n.$params));
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
        var o = Ue(r, 1), a = o[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return z(z({
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
        var n = Ue(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = Ue(n, 2), o = r[0], a = r[1], s = o.split(":"), c = Ra(s), i = zt(c).slice(1);
        return i?.reduce(function(d, l, u, p) {
          return !d[l] && (d[l] = u === p.length - 1 ? a : {}), d[l];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Ue(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = Ue(n, 2), o = r[0], a = r[1];
        return t[o] = a, t;
      }, {});
    }
  }
}, Ua = `
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
`, Wa = U.extend({
  name: "baseicon",
  css: Ua
});
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function Cn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Tn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Cn(Object(n), !0).forEach(function(r) {
      Fa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Cn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Fa(e, t, n) {
  return (t = Ha(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ha(e) {
  var t = Ka(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function Ka(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Gt = {
  name: "BaseIcon",
  extends: Ee,
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
  style: Wa,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Ve(this.label);
      return Tn(Tn({}, !this.isUnstyled && {
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
function it(e) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, it(e);
}
function Pn(e, t) {
  return Qa(e) || Ga(e, t) || Ya(e, t) || qa();
}
function qa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ya(e, t) {
  if (e) {
    if (typeof e == "string") return On(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? On(e, t) : void 0;
  }
}
function On(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ga(e, t) {
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
function Qa(e) {
  if (Array.isArray(e)) return e;
}
function An(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function B(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? An(Object(n), !0).forEach(function(r) {
      It(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : An(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function It(e, t, n) {
  return (t = Za(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Za(e) {
  var t = Ja(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function Ja(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var N = {
  _getMeta: function() {
    return [we(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], ie(we(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, a;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: Yt,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, c = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var C = N._getOptionValue.apply(N, arguments);
      return ne(C) || Jn(C) ? {
        class: C
      } : C;
    }, d = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, l = d.mergeSections, u = l === void 0 ? !0 : l, p = d.mergeProps, m = p === void 0 ? !1 : p, S = c ? N._useDefaultPT(r, r.defaultPT(), i, a, s) : void 0, P = N._usePT(r, N._getPT(o, r.$name), i, a, B(B({}, s), {}, {
      global: S || {}
    })), _ = N._getPTDatasets(r, a);
    return u || !u && P ? m ? N._mergeProps(r, m, S, P, _) : B(B(B({}, S), P), _) : B(B({}, P), _);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return B(B({}, n === "root" && It({}, "".concat(r, "name"), ke(t.$name))), {}, It({}, "".concat(r, "section"), ke(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var c, i = r ? r(s) : s, d = ke(n);
      return (c = i?.[d]) !== null && c !== void 0 ? c : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(_) {
      return r(_, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var c, i = n._usept || ((c = t.$primevueConfig) === null || c === void 0 ? void 0 : c.ptOptions) || {}, d = i.mergeSections, l = d === void 0 ? !0 : d, u = i.mergeProps, p = u === void 0 ? !1 : u, m = s(n.originalValue), S = s(n.value);
      return m === void 0 && S === void 0 ? void 0 : ne(S) ? S : ne(m) ? m : l || !l && S ? p ? N._mergeProps(t, p, m, S) : B(B({}, m), S) : S;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return N._usePT(t, n, r, o, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = N._getConfig(r, o), s = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    N._loadCoreStyles(n, s), N._loadThemeStyles(n, s), N._loadScopedThemeStyles(n, s), N._removeThemeListeners(n), n.$loadStyles = function() {
      return N._loadThemeStyles(n, s);
    }, N._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Pe.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      U.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), Pe.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!W.isStyleNameLoaded("common")) {
        var s, c, i = ((s = o.$style) === null || s === void 0 || (c = s.getCommonTheme) === null || c === void 0 ? void 0 : c.call(s)) || {}, d = i.primitive, l = i.semantic, u = i.global, p = i.style;
        U.load(d?.css, B({
          name: "primitive-variables"
        }, a)), U.load(l?.css, B({
          name: "semantic-variables"
        }, a)), U.load(u?.css, B({
          name: "global-variables"
        }, a)), U.loadStyle(B({
          name: "global-style"
        }, a), p), W.setLoadedStyleName("common");
      }
      if (!W.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var m, S, P, _, T = ((m = o.$style) === null || m === void 0 || (S = m.getDirectiveTheme) === null || S === void 0 ? void 0 : S.call(m)) || {}, C = T.css, E = T.style;
        (P = o.$style) === null || P === void 0 || P.load(C, B({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (_ = o.$style) === null || _ === void 0 || _.loadStyle(B({
          name: "".concat(o.$style.name, "-style")
        }, a), E), W.setLoadedStyleName(o.$style.name);
      }
      if (!W.isStyleNameLoaded("layer-order")) {
        var f, y, L = (f = o.$style) === null || f === void 0 || (y = f.getLayerOrderThemeCSS) === null || y === void 0 ? void 0 : y.call(f);
        U.load(L, B({
          name: "layer-order",
          first: !0
        }, a)), W.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, a, s, c = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = c.css, d = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, B({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Pe.clearLoadedStyleNames(), Q.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Q.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, a, s) {
    var c, i, d = "on".concat(Fo(n)), l = N._getConfig(o, a), u = r?.$instance, p = N._usePT(u, N._getPT(o == null || (c = o.value) === null || c === void 0 ? void 0 : c.pt, t), N._getOptionValue, "hooks.".concat(d)), m = N._useDefaultPT(u, l == null || (i = l.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], N._getOptionValue, "hooks.".concat(d)), S = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: s
    };
    p?.(u, S), m?.(u, S);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return qt(t) ? t.apply(void 0, r) : V.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(c, i, d, l, u) {
      var p, m, S, P;
      i._$instances = i._$instances || {};
      var _ = N._getConfig(d, l), T = i._$instances[t] || {}, C = Ve(T) ? B(B({}, n), n?.methods) : {};
      i._$instances[t] = B(B({}, T), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: T.$el || i || void 0,
        $style: B({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: _,
        $attrSelector: (p = i.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return N._getPT(_?.pt, void 0, function(f) {
            var y;
            return f == null || (y = f.directives) === null || y === void 0 ? void 0 : y[t];
          });
        },
        isUnstyled: function() {
          var f, y;
          return ((f = i._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.unstyled) !== void 0 ? (y = i._$instances[t]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.unstyled : _?.unstyled;
        },
        theme: function() {
          var f;
          return (f = i._$instances[t]) === null || f === void 0 || (f = f.$primevueConfig) === null || f === void 0 ? void 0 : f.theme;
        },
        preset: function() {
          var f;
          return (f = i._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.dt;
        },
        /* instance's methods */
        ptm: function() {
          var f, y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return N._getPTValue(i._$instances[t], (f = i._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.pt, y, B({}, L));
        },
        ptmo: function() {
          var f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", L = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return N._getPTValue(i._$instances[t], f, y, L, !1);
        },
        cx: function() {
          var f, y, L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (f = i._$instances[t]) !== null && f !== void 0 && f.isUnstyled() ? void 0 : N._getOptionValue((y = i._$instances[t]) === null || y === void 0 || (y = y.$style) === null || y === void 0 ? void 0 : y.classes, L, B({}, D));
        },
        sx: function() {
          var f, y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, D = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return L ? N._getOptionValue((f = i._$instances[t]) === null || f === void 0 || (f = f.$style) === null || f === void 0 ? void 0 : f.inlineStyles, y, B({}, D)) : void 0;
        }
      }, C), i.$instance = i._$instances[t], (m = (S = i.$instance)[c]) === null || m === void 0 || m.call(S, i, d, l, u), i["$".concat(t)] = i.$instance, N._hook(t, c, i, d, l, u), i.$pd || (i.$pd = {}), i.$pd[t] = B(B({}, (P = i.$pd) === null || P === void 0 ? void 0 : P[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(c) {
      var i, d, l, u = c._$instances[t], p = u?.watch, m = function(_) {
        var T, C = _.newValue, E = _.oldValue;
        return p == null || (T = p.config) === null || T === void 0 ? void 0 : T.call(u, C, E);
      }, S = function(_) {
        var T, C = _.newValue, E = _.oldValue;
        return p == null || (T = p["config.ripple"]) === null || T === void 0 ? void 0 : T.call(u, C, E);
      };
      u.$watchersCallback = {
        config: m,
        "config.ripple": S
      }, p == null || (i = p.config) === null || i === void 0 || i.call(u, u?.$primevueConfig), Ae.on("config:change", m), p == null || (d = p["config.ripple"]) === null || d === void 0 || d.call(u, u == null || (l = u.$primevueConfig) === null || l === void 0 ? void 0 : l.ripple), Ae.on("config:ripple:change", S);
    }, a = function(c) {
      var i = c._$instances[t].$watchersCallback;
      i && (Ae.off("config:change", i.config), Ae.off("config:ripple:change", i["config.ripple"]), c._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(c, i, d, l) {
        c.$pd || (c.$pd = {}), c.$pd[t] = {
          name: t,
          attrSelector: Jo("pd")
        }, r("created", c, i, d, l);
      },
      beforeMount: function(c, i, d, l) {
        var u;
        N._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("beforeMount", c, i, d, l), o(c);
      },
      mounted: function(c, i, d, l) {
        var u;
        N._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("mounted", c, i, d, l);
      },
      beforeUpdate: function(c, i, d, l) {
        r("beforeUpdate", c, i, d, l);
      },
      updated: function(c, i, d, l) {
        var u;
        N._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("updated", c, i, d, l);
      },
      beforeUnmount: function(c, i, d, l) {
        var u;
        a(c), N._removeThemeListeners((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance), r("beforeUnmount", c, i, d, l);
      },
      unmounted: function(c, i, d, l) {
        var u;
        (u = c.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), r("unmounted", c, i, d, l);
      }
    };
  },
  extend: function() {
    var t = N._getMeta.apply(N, arguments), n = Pn(t, 2), r = n[0], o = n[1];
    return B({
      extend: function() {
        var s = N._getMeta.apply(N, arguments), c = Pn(s, 2), i = c[0], d = c[1];
        return N.extend(i, B(B(B({}, o), o?.methods), d));
      }
    }, N._extend(r, o));
  }
}, Xa = `
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
`, ei = {
  root: "p-ink"
}, ti = U.extend({
  name: "ripple-directive",
  style: Xa,
  classes: ei
}), ni = N.extend({
  style: ti
});
function st(e) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, st(e);
}
function ri(e) {
  return si(e) || ii(e) || ai(e) || oi();
}
function oi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ai(e, t) {
  if (e) {
    if (typeof e == "string") return Rt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rt(e, t) : void 0;
  }
}
function ii(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function si(e) {
  if (Array.isArray(e)) return Rt(e);
}
function Rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ln(e, t, n) {
  return (t = li(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function li(e) {
  var t = ci(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function ci(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Qt = ni.extend("ripple", {
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
      n || (n = Go("span", Ln(Ln({
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
        if (!this.isUnstyled() && Ct(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !Nt(o) && !Qe(o)) {
          var a = Math.max(tr(r), nr(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var s = He(r), c = t.pageX - s.left + document.body.scrollTop - Qe(o) / 2, i = t.pageY - s.top + document.body.scrollLeft - Nt(o) / 2;
        o.style.top = i + "px", o.style.left = c + "px", !this.isUnstyled() && Ko(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && Ct(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Ct(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? ri(t.children).find(function(n) {
        return Fe(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const di = "data-wippy-overlay-layer";
function br() {
  return typeof window < "u" && typeof window.document < "u";
}
function vr() {
  return br() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ui() {
  return vr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const pi = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let fi = 0;
const wt = /* @__PURE__ */ new WeakMap();
function En(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function mi(e, t) {
  if (!pi.test(e.className))
    return;
  const n = e.style.cssText;
  En(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!wt.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && En(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), wt.set(e, r);
  }
}
function Zt(e) {
  const t = wt.get(e);
  t && (t.disconnect(), wt.delete(e));
}
function bi(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Vt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const St = /* @__PURE__ */ new Set(), Jt = /* @__PURE__ */ new WeakMap();
let Nn = !1, Bt = !1;
function vi() {
  Bt = !1;
  for (const e of St) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && Zt(t);
      St.delete(e), Jt.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Vt(e);
  }
}
function jn() {
  Bt || (Bt = !0, requestAnimationFrame(vi));
}
function hi(e) {
  const t = document.createElement("div");
  t.setAttribute(di, "");
  const n = vr();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Vt(t);
  const r = new MutationObserver((o) => {
    const a = t.__wippyAnchorName;
    for (const s of o) {
      if (a)
        for (const c of Array.from(s.addedNodes))
          c instanceof HTMLElement && mi(c, a);
      for (const c of Array.from(s.removedNodes))
        c instanceof HTMLElement && Zt(c);
    }
    t.isConnected && t.childElementCount > 0 && Vt(t);
  });
  return r.observe(t, { childList: !0 }), Jt.set(t, r), St.add(t), Nn || (Nn = !0, window.addEventListener("scroll", jn, { capture: !0, passive: !0 }), window.addEventListener("resize", jn, { passive: !0 })), t;
}
function zn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = hi(e.hostRoot), ui())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++fi}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function In(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && Zt(t);
    St.delete(e.layer), Jt.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Rn = !1;
function gi() {
  if (Rn)
    return;
  Rn = !0;
  const e = ur;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    br() && (this.hostRoot = bi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || zn(this), this.$watch("inline", (t) => {
      t ? In(this) : zn(this);
    })));
  }, e.render = function() {
    return this.inline ? q(this.$slots, "default", { key: 0 }) : this.mounted ? Yr(Wn, { key: 1, to: this.resolvedTarget || document.body }, [
      q(this.$slots, "default")
    ]) : O("", !0);
  }, e.unmounted = function() {
    In(this);
  };
}
const yi = {
  install: (e) => {
    gi(), e.use(ja, { theme: "none" });
  }
};
var xi = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": r.disabled
    }];
  }
}, ki = U.extend({
  name: "tab",
  classes: xi
}), wi = {
  name: "BaseTab",
  extends: Ee,
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
  style: ki,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, Dt = {
  name: "Tab",
  extends: wi,
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
      return r ? Fe(r, "data-p-disabled") || Fe(r, "data-pc-section") === "activebar" ? this.findNextTab(r) : Xe(r, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, r = n ? t : t.previousElementSibling;
      return r ? Fe(r, "data-p-disabled") || Fe(r, "data-pc-section") === "activebar" ? this.findPrevTab(r) : Xe(r, '[data-pc-name="tab"]') : null;
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
      Qo(n), this.scrollInView(n);
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
      return Do((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
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
      return V(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
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
      return Le({
        active: this.active
      });
    }
  },
  directives: {
    ripple: Qt
  }
};
function Si(e, t, n, r, o, a) {
  var s = Kt("ripple");
  return e.asChild ? q(e.$slots, "default", {
    key: 1,
    dataP: a.dataP,
    class: te(e.cx("root")),
    active: a.active,
    a11yAttrs: a.a11yAttrs,
    onClick: a.onClick
  }) : Re((b(), R(Je(e.as), V({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP,
    onClick: a.onClick
  }, a.attrs), {
    default: j(function() {
      return [q(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[s]]);
}
Dt.render = Si;
var hr = {
  name: "ChevronLeftIcon",
  extends: Gt
};
function _i(e) {
  return Pi(e) || Ti(e) || Ci(e) || $i();
}
function $i() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ci(e, t) {
  if (e) {
    if (typeof e == "string") return Mt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Mt(e, t) : void 0;
  }
}
function Ti(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Pi(e) {
  if (Array.isArray(e)) return Mt(e);
}
function Mt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Oi(e, t, n, r, o, a) {
  return b(), x("svg", V({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), _i(t[0] || (t[0] = [v("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
hr.render = Oi;
var gr = {
  name: "ChevronRightIcon",
  extends: Gt
};
function Ai(e) {
  return ji(e) || Ni(e) || Ei(e) || Li();
}
function Li() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ei(e, t) {
  if (e) {
    if (typeof e == "string") return Ut(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ut(e, t) : void 0;
  }
}
function Ni(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ji(e) {
  if (Array.isArray(e)) return Ut(e);
}
function Ut(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function zi(e, t, n, r, o, a) {
  return b(), x("svg", V({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ai(t[0] || (t[0] = [v("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
gr.render = zi;
var Ii = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, Ri = U.extend({
  name: "tablist",
  classes: Ii
}), Vi = {
  name: "BaseTabList",
  extends: Ee,
  props: {},
  style: Ri,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, yr = {
  name: "TabList",
  extends: Vi,
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
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = Qe(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, s = o - a, c = Math.max(s, 0);
      t.scrollLeft = un(t) ? -1 * c : c;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = Qe(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, s = o + a, c = t.scrollWidth - r, i = Math.min(s, c);
      t.scrollLeft = un(t) ? -1 * i : i;
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
      var n = this.$refs.content, r = Xe(n, '[data-pc-name="tab"][data-p-active="true"]');
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
        var a = Xe(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (r.style.height = nr(a) + "px", r.style.top = He(a).top - He(o).top + "px") : (r.style.width = tr(a) + "px", r.style.left = He(a).left - He(o).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, r = t.content, o = r.scrollTop, a = r.scrollWidth, s = r.scrollHeight, c = r.offsetWidth, i = r.offsetHeight, d = Math.abs(r.scrollLeft), l = [Qe(r), Nt(r)], u = l[0], p = l[1];
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
      return Le({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: hr,
    ChevronRightIcon: gr
  },
  directives: {
    ripple: Qt
  }
}, Bi = ["data-p"], Di = ["aria-label", "tabindex"], Mi = ["data-p"], Ui = ["aria-orientation"], Wi = ["aria-label", "tabindex"];
function Fi(e, t, n, r, o, a) {
  var s = Kt("ripple");
  return b(), x("div", V({
    ref: "list",
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [a.showNavigators && o.isPrevButtonEnabled ? Re((b(), x("button", V({
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
  }), [(b(), R(Je(a.templates.previcon || "ChevronLeftIcon"), V({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, Di)), [[s]]) : O("", !0), v("div", V({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return a.onScroll && a.onScroll.apply(a, arguments);
    }),
    "data-p": a.dataP
  }, e.ptm("content")), [v("div", V({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": a.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [q(e.$slots, "default"), v("span", V({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, Ui)], 16, Mi), a.showNavigators && o.isNextButtonEnabled ? Re((b(), x("button", V({
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
  }), [(b(), R(Je(a.templates.nexticon || "ChevronRightIcon"), V({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, Wi)), [[s]]) : O("", !0)], 16, Bi);
}
yr.render = Fi;
var Hi = `
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
`, Ki = {
  root: function(t) {
    var n = t.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, qi = U.extend({
  name: "tabs",
  style: Hi,
  classes: Ki
}), Yi = {
  name: "BaseTabs",
  extends: Ee,
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
  style: qi,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, xr = {
  name: "Tabs",
  extends: Yi,
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
function Gi(e, t, n, r, o, a) {
  return b(), x("div", V({
    class: e.cx("root")
  }, e.ptmi("root")), [q(e.$slots, "default")], 16);
}
xr.render = Gi;
const Qi = { class: "km-shell" }, Zi = { class: "km-rail" }, Ji = { class: "km-main" }, Xi = /* @__PURE__ */ J({
  __name: "Shell",
  setup(e) {
    return (t, n) => (b(), x("div", Qi, [
      v("aside", Zi, [
        q(t.$slots, "rail")
      ]),
      v("main", Ji, [
        q(t.$slots, "default")
      ])
    ]));
  }
}), es = { class: "km-railhead" }, ts = { class: "km-railhead-title" }, ns = { key: 0 }, rs = { class: "km-railhead-acts" }, os = /* @__PURE__ */ J({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (b(), x("div", es, [
      v("span", ts, [
        M($(e.title), 1),
        e.count !== void 0 ? (b(), x("b", ns, $(e.count), 1)) : O("", !0)
      ]),
      v("div", rs, [
        q(t.$slots, "actions")
      ])
    ]));
  }
});
var Xt = {
  name: "SpinnerIcon",
  extends: Gt
};
function as(e) {
  return cs(e) || ls(e) || ss(e) || is();
}
function is() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ss(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function ls(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function cs(e) {
  if (Array.isArray(e)) return Wt(e);
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ds(e, t, n, r, o, a) {
  return b(), x("svg", V({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), as(t[0] || (t[0] = [v("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Xt.render = ds;
var us = `
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
`, ps = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": F(n.value) && String(n.value).length === 1,
      "p-badge-dot": Ve(n.value) && !r.$slots.default,
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
}, fs = U.extend({
  name: "badge",
  style: us,
  classes: ps
}), ms = {
  name: "BaseBadge",
  extends: Ee,
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
  style: fs,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function lt(e) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, lt(e);
}
function Vn(e, t, n) {
  return (t = bs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function bs(e) {
  var t = vs(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function vs(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var kr = {
  name: "Badge",
  extends: ms,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Le(Vn(Vn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, hs = ["data-p"];
function gs(e, t, n, r, o, a) {
  return b(), x("span", V({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [q(e.$slots, "default", {}, function() {
    return [M($(e.value), 1)];
  })], 16, hs);
}
kr.render = gs;
var ys = `
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
function ct(e) {
  "@babel/helpers - typeof";
  return ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ct(e);
}
function xe(e, t, n) {
  return (t = xs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function xs(e) {
  var t = ks(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function ks(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ws = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", xe(xe(xe(xe(xe(xe(xe(xe(xe({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", xe({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Ss = U.extend({
  name: "button",
  style: ys,
  classes: ws
}), _s = {
  name: "BaseButton",
  extends: Ee,
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
  style: Ss,
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
function ee(e, t, n) {
  return (t = $s(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $s(e) {
  var t = Cs(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function Cs(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var en = {
  name: "Button",
  extends: _s,
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
      return V(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Ve(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return Le(ee(ee(ee(ee(ee(ee(ee(ee(ee(ee({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Le(ee(ee({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Le(ee(ee({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Xt,
    Badge: kr
  },
  directives: {
    ripple: Qt
  }
}, Ts = ["data-p"], Ps = ["data-p"];
function Os(e, t, n, r, o, a) {
  var s = tn("SpinnerIcon"), c = tn("Badge"), i = Kt("ripple");
  return e.asChild ? q(e.$slots, "default", {
    key: 1,
    class: te(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : Re((b(), R(Je(e.as), V({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: j(function() {
      return [q(e.$slots, "default", {}, function() {
        return [e.loading ? q(e.$slots, "loadingicon", V({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (b(), x("span", V({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (b(), R(s, V({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : q(e.$slots, "icon", V({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (b(), x("span", V({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, Ts)) : O("", !0)];
        }), e.label ? (b(), x("span", V({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), $(e.label), 17, Ps)) : O("", !0), e.badge ? (b(), R(c, {
          key: 3,
          value: e.badge,
          class: te(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : O("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
en.render = Os;
const Bn = /* @__PURE__ */ J({
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
    const n = e, r = t, o = At(), a = Y(
      () => Object.prototype.hasOwnProperty.call(o?.vnode.props ?? {}, "active")
    ), s = Y(
      () => n.variant === "danger" ? "danger" : n.variant === "bordered" ? "secondary" : void 0
    ), c = Y(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (i, d) => (b(), R(h(en), {
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
      icon: j(() => [
        A(h(G), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), ve = /* @__PURE__ */ J({
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
    const n = e, r = t, o = Y(
      () => n.variant === "danger" ? "danger" : n.variant === "primary" ? void 0 : "secondary"
    );
    return (a, s) => (b(), R(h(en), {
      type: e.type,
      severity: o.value,
      outlined: e.variant === "ghost",
      loading: e.loading,
      disabled: e.disabled || e.loading,
      size: e.small ? "small" : void 0,
      onClick: s[0] || (s[0] = (c) => r("click"))
    }, {
      default: j(() => [
        e.loading ? (b(), R(h(Xt), {
          key: 0,
          class: "p-button-loading-icon p-button-icon",
          spin: ""
        })) : O("", !0),
        e.icon && !e.loading ? (b(), R(h(G), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : O("", !0),
        q(a.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
}), As = { class: "km-search" }, Ls = ["value", "placeholder"], Dn = /* @__PURE__ */ J({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, o) => (b(), x("div", As, [
      A(h(G), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      v("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: o[0] || (o[0] = (a) => n("update:modelValue", a.target.value))
      }, null, 40, Ls),
      e.modelValue ? (b(), x("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: o[1] || (o[1] = (a) => n("update:modelValue", ""))
      }, [
        A(h(G), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : O("", !0)
    ]));
  }
}), Es = { class: "km-field" }, Ns = { class: "km-field-label" }, js = {
  key: 0,
  class: "km-field-help"
}, je = /* @__PURE__ */ J({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(e) {
    return (t, n) => (b(), x("label", Es, [
      v("span", Ns, $(e.label), 1),
      q(t.$slots, "default"),
      e.help ? (b(), x("small", js, $(e.help), 1)) : O("", !0)
    ]));
  }
}), zs = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], qe = /* @__PURE__ */ J({
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
    return (o, a) => (b(), x("input", {
      class: te(["km-input", e.mono && "mono"]),
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
    }, null, 42, zs));
  }
});
var Is = `
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
`, Rs = {
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
}, Vs = U.extend({
  name: "tag",
  style: Is,
  classes: Rs
}), Bs = {
  name: "BaseTag",
  extends: Ee,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Vs,
  provide: function() {
    return {
      $pcTag: this,
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
function Ds(e, t, n) {
  return (t = Ms(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ms(e) {
  var t = Us(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function Us(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ut(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var wr = {
  name: "Tag",
  extends: Bs,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Le(Ds({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Ws = ["data-p"];
function Fs(e, t, n, r, o, a) {
  return b(), x("span", V({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (b(), R(Je(e.$slots.icon), V({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (b(), x("span", V({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : O("", !0), e.value != null || e.$slots.default ? q(e.$slots, "default", {
    key: 2
  }, function() {
    return [v("span", V({
      class: e.cx("label")
    }, e.ptm("label")), $(e.value), 17)];
  }) : O("", !0)], 16, Ws);
}
wr.render = Fs;
const Hs = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, We = /* @__PURE__ */ J({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (b(), R(h(wr), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: j(() => [
        e.dot ? (b(), x("span", Hs)) : e.icon ? (b(), R(h(G), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : O("", !0),
        q(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), Ks = { class: "km-notice-text" }, _t = /* @__PURE__ */ J({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t, r = (o) => o === "danger" ? "tabler:alert-triangle" : o === "success" ? "tabler:circle-check" : "tabler:info-circle";
    return (o, a) => (b(), x("div", {
      class: te(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      A(h(G), {
        icon: r(e.severity),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      v("span", Ks, [
        q(o.$slots, "default")
      ]),
      v("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: a[0] || (a[0] = (s) => n("dismiss"))
      }, [
        A(h(G), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
});
var qs = `
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
`, Ys = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Gs = U.extend({
  name: "progressspinner",
  style: qs,
  classes: Ys
}), Qs = {
  name: "BaseProgressSpinner",
  extends: Ee,
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
  style: Gs,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Sr = {
  name: "ProgressSpinner",
  extends: Qs,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Zs = ["fill", "stroke-width"];
function Js(e, t, n, r, o, a) {
  return b(), x("div", V({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(b(), x("svg", V({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: a.svgStyle
  }, e.ptm("spin")), [v("circle", V({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, Zs)], 16))], 16);
}
Sr.render = Js;
const Xs = { class: "km-loading" }, el = { key: 0 }, _r = /* @__PURE__ */ J({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (t, n) => (b(), x("div", Xs, [
      A(h(Sr), {
        style: { width: "22px", height: "22px", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (b(), x("span", el, $(e.label), 1)) : O("", !0)
    ]));
  }
}), tl = { class: "km-empty" }, nl = { class: "km-empty-title" }, rl = {
  key: 0,
  class: "km-empty-hint"
}, ol = /* @__PURE__ */ J({
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
    return (r, o) => (b(), x("div", tl, [
      A(h(G), {
        icon: e.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      v("div", nl, $(e.title), 1),
      e.hint ? (b(), x("p", rl, $(e.hint), 1)) : O("", !0),
      e.cta ? (b(), R(ve, {
        key: 1,
        icon: e.ctaIcon,
        onClick: o[0] || (o[0] = (a) => n("cta"))
      }, {
        default: j(() => [
          M($(e.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : O("", !0)
    ]));
  }
}), al = { class: "kx-wcmount" }, il = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, sl = /* @__PURE__ */ J({
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
    const n = e, r = t, o = I(null), a = I(!1);
    let s = null, c = 0;
    const i = /* @__PURE__ */ new Set();
    function d(f) {
      f.composedPath()[0] === s && (f.stopPropagation(), r("change", f.detail));
    }
    function l(f) {
      return f.composedPath()[0] !== s ? !1 : (f.stopPropagation(), !0);
    }
    function u(f) {
      l(f) && r("created", f.detail);
    }
    function p(f) {
      l(f) && r("close", f.detail);
    }
    function m(f) {
      l(f) && r("error", f.detail);
    }
    function S(f) {
      if (typeof f == "string") return f;
      try {
        return JSON.stringify(f ?? {});
      } catch {
        return null;
      }
    }
    function P() {
      if (!s) return;
      const f = S(n.config);
      if (f !== null && s.setAttribute("config", f), n.schema !== void 0 && n.schema !== null) {
        const L = S(n.schema);
        L !== null && s.setAttribute("schema", L);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const L = S(n.meta);
        L !== null && s.setAttribute("meta", L);
      }
      n.provider && s.setAttribute("provider", n.provider), n.label && s.setAttribute("label", n.label);
      const y = n.attrs || {};
      for (const L of [...i])
        (!(L in y) || y[L] == null) && (s.removeAttribute(L), i.delete(L));
      for (const [L, D] of Object.entries(y)) {
        if (D == null) continue;
        const re = typeof D == "object" ? S(D) : String(D);
        re !== null && (s.setAttribute(L, re), i.add(L));
      }
    }
    function _(f = s) {
      f && (f.removeEventListener("config-changed", d), f.removeEventListener("change", d), f.removeEventListener("created", u), f.removeEventListener("close", p), f.removeEventListener("error", m), f === s && (s = null), i.clear());
    }
    async function T(f) {
      if (!customElements.get(f))
        try {
          await no(f, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function C() {
      const f = ++c, y = o.value, L = n.tag;
      if (a.value = !1, !!y && (_(), y.innerHTML = "", !!L))
        try {
          if (await T(L), f !== c || o.value !== y || n.tag !== L) return;
          const D = document.createElement(L);
          D.classList.add("kx-wcmount-surface"), s = D, P(), D.addEventListener("config-changed", d), D.addEventListener("change", d), D.addEventListener("created", u), D.addEventListener("close", p), D.addEventListener("error", m), D.style.display = "block", y.appendChild(D), a.value = !customElements.get(L);
        } catch {
          f === c && (a.value = !0);
        }
    }
    async function E() {
      a.value = !1, await Ht(), await C();
    }
    return Ft(C), Oe(() => n.tag, C), Oe(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], P, { deep: !0 }), Gr(() => {
      c += 1, _();
    }), (f, y) => (b(), x("div", al, [
      a.value ? (b(), x("div", il, [
        y[0] || (y[0] = v("span", null, "This setup panel couldn’t load.", -1)),
        v("button", {
          type: "button",
          onClick: E
        }, "Try again")
      ])) : (b(), x("div", {
        key: 1,
        ref_key: "host",
        ref: o
      }, null, 512))
    ]));
  }
}), ll = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [r, o] of t)
    n[r] = o;
  return n;
}, Mn = /* @__PURE__ */ ll(sl, [["__scopeId", "data-v-3ec70c11"]]);
function Ze(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function cl() {
  const e = I([]), t = I([]), n = I(!0), r = I(!1), o = I("");
  let a = 0;
  async function s() {
    const d = ++a;
    n.value = !0, o.value = "";
    try {
      const [l, u] = await Promise.all([
        Ne.get("/api/v1/security/scopes"),
        Ne.get("/api/v1/security/policies")
      ]);
      if (d !== a) return;
      e.value = l.data?.scopes ?? [], t.value = u.data?.policies ?? [];
    } catch (l) {
      d === a && (o.value = Ze(l, "failed to load security"));
    } finally {
      d === a && (n.value = !1);
    }
  }
  async function c(d) {
    r.value = !0, o.value = "";
    try {
      return await Ne.post("/api/v1/security/scopes", d), await s(), !0;
    } catch (l) {
      return o.value = Ze(l, "failed to save scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  async function i(d) {
    r.value = !0, o.value = "";
    try {
      return await Ne.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(d)}`), await s(), !0;
    } catch (l) {
      return o.value = Ze(l, "failed to delete scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  return { scopes: e, policies: t, loading: n, saving: r, error: o, load: s, saveScope: c, deleteScope: i };
}
function dl() {
  const e = I([]), t = I(!1), n = I(!1), r = I(""), o = I(""), a = I(null);
  let s = 0;
  async function c() {
    const l = ++s;
    t.value = !0, r.value = "";
    try {
      const { data: u } = await Ne.get("/api/v1/security/delegations");
      if (u?.success !== !0 || !Array.isArray(u.delegations))
        throw new Error(u?.error || "Delegation inventory is unconfirmed");
      l === s && (e.value = u.delegations);
    } catch (u) {
      l === s && (r.value = Ze(u, "Could not load act-as grants"));
    } finally {
      l === s && (t.value = !1);
    }
  }
  async function i() {
    if (!a.value || n.value) return;
    const l = a.value;
    n.value = !0, r.value = "", o.value = "";
    try {
      const { data: u } = l.method === "save" ? await Ne.post("/api/v1/security/delegations", l.request) : await Ne.delete("/api/v1/security/delegations", { data: l.request });
      if (u?.success !== !0) throw new Error(u?.error || "Act-as request is unconfirmed");
      a.value = null, o.value = l.method === "save" ? "Act-as grant saved" : "Act-as grant revoked", await c();
    } catch (u) {
      r.value = Ze(u, "Could not confirm act-as request");
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
const ul = {
  class: "ks-delegations",
  "aria-label": "Act-as grants"
}, pl = { class: "ks-builder-head" }, fl = {
  key: 0,
  role: "alert"
}, ml = ["disabled", "inert"], bl = {
  key: 0,
  "aria-label": "Selected operator groups"
}, vl = { class: "ks-delegation-all" }, hl = {
  key: 0,
  class: "ks-field-err"
}, gl = { key: 2 }, yl = {
  key: 4,
  class: "ks-delegation-table"
}, xl = { key: 5 }, kl = /* @__PURE__ */ J({
  __name: "Delegations",
  setup(e, { expose: t }) {
    const n = dl(), { delegations: r, loading: o, saving: a, error: s, confirmation: c, pending: i } = n, d = I(""), l = I(""), u = I(!1), p = I([]), m = Y(() => a.value || !!i.value), S = Y(() => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(l.value.trim())), P = Y(() => !!d.value && p.value.length > 0 && (u.value || S.value));
    function _(E, f) {
      if (!E || typeof E != "object") return;
      const y = E;
      m.value || y.type !== f || typeof y.id != "string" || (f === "user" ? d.value = y.id : y.id && !p.value.some((L) => L.id === y.id) && p.value.push({ id: y.id, label: typeof y.label == "string" ? y.label : y.id }));
    }
    function T(E) {
      s.value = E && typeof E == "object" && "message" in E ? String(E.message) : "Could not load the principal picker";
    }
    async function C() {
      P.value && await n.mutate("save", {
        principal: { kind: "user", id: d.value },
        root: u.value ? "*" : l.value.trim(),
        groups: p.value.map((E) => E.id)
      });
    }
    return t({ load: n.load }), (E, f) => (b(), x("section", ul, [
      v("div", pl, [
        f[7] || (f[7] = v("h2", { class: "ks-builder-title" }, "Act-as grants", -1)),
        A(h(ve), {
          variant: "ghost",
          disabled: h(o) || m.value,
          onClick: h(n).load
        }, {
          default: j(() => [...f[6] || (f[6] = [
            M("Refresh act-as grants", -1)
          ])]),
          _: 1
        }, 8, ["disabled", "onClick"])
      ]),
      f[16] || (f[16] = v("p", null, "Choose which operator groups may select an ordinary user account for execution. Account groups supply its access. An act-as grant also requires administration of the execution root and access to its declared resources.", -1)),
      h(s) ? (b(), x("div", fl, [
        A(h(_t), {
          severity: "danger",
          onDismiss: f[0] || (f[0] = (y) => s.value = "")
        }, {
          default: j(() => [
            M($(h(s)), 1)
          ]),
          _: 1
        })
      ])) : O("", !0),
      h(c) ? (b(), R(h(_t), {
        key: 1,
        "data-test": "delegation-confirmation",
        severity: "success",
        onDismiss: f[1] || (f[1] = (y) => c.value = "")
      }, {
        default: j(() => [
          M($(h(c)), 1)
        ]),
        _: 1
      })) : O("", !0),
      v("fieldset", {
        disabled: m.value,
        inert: m.value,
        class: "ks-delegation-form"
      }, [
        A(h(je), { label: "Execution account" }, {
          default: j(() => [
            A(Mn, {
              tag: "wc-principal-picker",
              attrs: { kinds: "user", placeholder: "Choose execution account…" },
              config: { principal_id: d.value },
              onChange: f[2] || (f[2] = (y) => _(y, "user")),
              onError: T
            }, null, 8, ["config"])
          ]),
          _: 1
        }),
        A(h(je), {
          label: "Operator groups",
          help: "Only members of these groups receive selection permission. This does not change any account membership."
        }, {
          default: j(() => [
            A(Mn, {
              tag: "wc-principal-picker",
              attrs: { kinds: "group", placeholder: "Add operator group…" },
              config: {},
              onChange: f[3] || (f[3] = (y) => _(y, "group")),
              onError: T
            })
          ]),
          _: 1
        }),
        p.value.length ? (b(), x("ul", bl, [
          (b(!0), x(fe, null, me(p.value, (y) => (b(), x("li", {
            key: y.id
          }, [
            v("span", null, [
              M($(y.label) + " ", 1),
              v("small", null, $(y.id), 1)
            ]),
            A(h(ve), {
              variant: "ghost",
              small: "",
              "aria-label": `Remove operator group ${y.label}`,
              onClick: (L) => p.value = p.value.filter((D) => D.id !== y.id)
            }, {
              default: j(() => [...f[8] || (f[8] = [
                M("Remove", -1)
              ])]),
              _: 1
            }, 8, ["aria-label", "onClick"])
          ]))), 128))
        ])) : O("", !0),
        v("label", vl, [
          Re(v("input", {
            "onUpdate:modelValue": f[4] || (f[4] = (y) => u.value = y),
            type: "checkbox",
            "aria-label": "All component roots"
          }, null, 512), [
            [Qr, u.value]
          ]),
          f[9] || (f[9] = M("All component roots", -1))
        ]),
        u.value ? O("", !0) : (b(), R(h(je), {
          key: 1,
          label: "Component root",
          help: "The existing execution component UUID. Selection still requires administration of this root."
        }, {
          default: j(() => [
            A(h(qe), {
              modelValue: l.value,
              "onUpdate:modelValue": f[5] || (f[5] = (y) => l.value = y),
              "aria-label": "Component root",
              placeholder: "Component UUID"
            }, null, 8, ["modelValue"]),
            l.value.trim() && !S.value ? (b(), x("small", hl, "Enter a component UUID or choose all component roots.")) : O("", !0)
          ]),
          _: 1
        })),
        A(h(ve), {
          disabled: !P.value || m.value,
          loading: h(a),
          onClick: C
        }, {
          default: j(() => [...f[10] || (f[10] = [
            M("Save act-as grant", -1)
          ])]),
          _: 1
        }, 8, ["disabled", "loading"])
      ], 8, ml),
      h(i) && !h(a) ? (b(), x("div", gl, [
        f[12] || (f[12] = v("p", null, "The result is unconfirmed. Retry the same request before editing this grant.", -1)),
        A(h(ve), {
          onClick: h(n).submit
        }, {
          default: j(() => [...f[11] || (f[11] = [
            M("Retry act-as request", -1)
          ])]),
          _: 1
        }, 8, ["onClick"])
      ])) : O("", !0),
      h(o) ? (b(), R(h(_r), {
        key: 3,
        label: "Loading act-as grants…"
      })) : h(r).length ? (b(), x("table", yl, [
        f[14] || (f[14] = v("caption", null, "Native act-as grants", -1)),
        f[15] || (f[15] = v("thead", null, [
          v("tr", null, [
            v("th", { scope: "col" }, "Execution account"),
            v("th", { scope: "col" }, "Component root"),
            v("th", { scope: "col" }, "Operator groups"),
            v("th", { scope: "col" }, "Status"),
            v("th", { scope: "col" }, "Actions")
          ])
        ], -1)),
        v("tbody", null, [
          (b(!0), x(fe, null, me(h(r), (y) => (b(), x("tr", {
            key: y.policy_id
          }, [
            v("td", null, $(y.principal.id), 1),
            v("td", null, $(y.root === "*" ? "All component roots" : y.root), 1),
            v("td", null, $(y.groups.join(", ")), 1),
            v("td", null, $(y.active ? "Active" : "Revoked"), 1),
            v("td", null, [
              y.active ? (b(), R(h(ve), {
                key: 0,
                variant: "danger",
                small: "",
                disabled: m.value,
                "aria-label": `Revoke act-as grant for ${y.principal.id} at ${y.root}`,
                onClick: (L) => h(n).mutate("revoke", { principal: y.principal, root: y.root })
              }, {
                default: j(() => [...f[13] || (f[13] = [
                  M("Revoke", -1)
                ])]),
                _: 1
              }, 8, ["disabled", "aria-label", "onClick"])) : O("", !0)
            ])
          ]))), 128))
        ])
      ])) : h(s) ? O("", !0) : (b(), x("p", xl, "No act-as grants."))
    ]));
  }
}), wl = ["draggable"], Sl = { class: "ks-pcard-row" }, _l = { class: "ks-pcard-body" }, $l = { class: "ks-pcard-head" }, Cl = ["title"], Tl = {
  key: 0,
  class: "ks-pcard-comment"
}, Pl = ["title"], Ol = ["aria-label"], Al = {
  key: 0,
  class: "ks-pcard-detail"
}, Ll = {
  key: 0,
  class: "ks-pcard-kv"
}, El = { class: "ks-pcard-kv" }, Nl = { class: "ks-pcard-kv" }, jl = { class: "ks-pcard-tags" }, zl = {
  key: 0,
  class: "ks-pcard-none"
}, Il = { class: "ks-pcard-kv" }, Rl = { class: "ks-pcard-tags" }, Vl = {
  key: 0,
  class: "ks-pcard-none"
}, Ot = /* @__PURE__ */ J({
  __name: "PolicyCard",
  props: {
    policy: {},
    mode: {}
  },
  emits: ["add", "remove"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = I(!1);
    function a(u) {
      n.mode === "locked" || !u.dataTransfer || (u.dataTransfer.setData("text/plain", n.policy.id), u.dataTransfer.effectAllowed = n.mode === "palette" ? "copy" : "move");
    }
    function s(u) {
      return u.includes(":") ? u.split(":").slice(-1)[0] : u;
    }
    function c(u) {
      return Array.isArray(u) ? u.map(String) : typeof u == "string" && u ? [u] : [];
    }
    const i = Y(() => c(n.policy.actions)), d = Y(() => c(n.policy.resources)), l = Y(() => !!n.policy.effect || i.value.length > 0 || d.value.length > 0 || !!n.policy.surface);
    return (u, p) => (b(), x("div", {
      class: te(["ks-pcard", [e.mode, { expanded: o.value }]]),
      draggable: e.mode !== "locked",
      onDragstart: a,
      onDblclick: p[3] || (p[3] = (m) => e.mode === "palette" && r("add"))
    }, [
      v("div", Sl, [
        e.mode === "locked" ? (b(), R(h(G), {
          key: 0,
          icon: "tabler:lock",
          class: "ks-pcard-grip locked",
          "aria-hidden": "true"
        })) : (b(), R(h(G), {
          key: 1,
          icon: "tabler:grip-vertical",
          class: "ks-pcard-grip",
          "aria-hidden": "true"
        })),
        v("div", _l, [
          v("div", $l, [
            v("span", {
              class: "ks-pcard-title",
              title: e.policy.title || s(e.policy.id)
            }, $(e.policy.title || s(e.policy.id)), 9, Cl),
            e.policy.effect ? (b(), x("span", {
              key: 0,
              class: te(["ks-eff", e.policy.effect])
            }, $(e.policy.effect), 3)) : O("", !0)
          ]),
          e.policy.comment ? (b(), x("div", Tl, $(e.policy.comment), 1)) : O("", !0),
          v("div", {
            class: "ks-pcard-id",
            title: e.policy.id
          }, $(e.policy.id), 9, Pl)
        ]),
        l.value ? (b(), x("button", {
          key: 2,
          class: te(["ks-pcard-act detail", { open: o.value }]),
          "aria-label": o.value ? "Hide details" : "Show details",
          onClick: p[0] || (p[0] = Ye((m) => o.value = !o.value, ["stop"]))
        }, [
          A(h(G), {
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })
        ], 10, Ol)) : O("", !0),
        e.mode === "palette" ? (b(), x("button", {
          key: 3,
          class: "ks-pcard-act add",
          "aria-label": "Add policy",
          onClick: p[1] || (p[1] = Ye((m) => r("add"), ["stop"]))
        }, [
          A(h(G), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          })
        ])) : e.mode === "selected" ? (b(), x("button", {
          key: 4,
          class: "ks-pcard-act remove",
          "aria-label": "Remove policy",
          onClick: p[2] || (p[2] = Ye((m) => r("remove"), ["stop"]))
        }, [
          A(h(G), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ])) : O("", !0)
      ]),
      o.value ? (b(), x("div", Al, [
        e.policy.surface || e.policy.intent ? (b(), x("div", Ll, [
          p[4] || (p[4] = v("span", null, "Surface", -1)),
          v("code", null, $(e.policy.surface || e.policy.intent), 1)
        ])) : O("", !0),
        v("div", El, [
          p[5] || (p[5] = v("span", null, "Effect", -1)),
          v("code", {
            class: te(["ks-eff-code", e.policy.effect])
          }, $(e.policy.effect || "—"), 3)
        ]),
        v("div", Nl, [
          p[6] || (p[6] = v("span", null, "Actions", -1)),
          v("div", jl, [
            (b(!0), x(fe, null, me(i.value, (m) => (b(), x("code", { key: m }, $(m), 1))), 128)),
            i.value.length ? O("", !0) : (b(), x("span", zl, "—"))
          ])
        ]),
        v("div", Il, [
          p[7] || (p[7] = v("span", null, "Resources", -1)),
          v("div", Rl, [
            (b(!0), x(fe, null, me(d.value, (m) => (b(), x("code", { key: m }, $(m), 1))), 128)),
            d.value.length ? O("", !0) : (b(), x("span", Vl, "—"))
          ])
        ])
      ])) : O("", !0)
    ], 42, wl));
  }
}), Bl = { class: "ks" }, Dl = { class: "ks-rail-search" }, Ml = { class: "ks-rail-list" }, Ul = {
  key: 0,
  class: "ks-rail-group"
}, Wl = ["onClick"], Fl = { class: "ks-scope-name" }, Hl = { class: "ks-scope-meta" }, Kl = { class: "ks-scope-count" }, ql = ["onClick"], Yl = { class: "ks-scope-name" }, Gl = { class: "ks-scope-meta" }, Ql = { class: "ks-scope-count" }, Zl = {
  key: 0,
  class: "ks-builder"
}, Jl = { class: "ks-builder-head" }, Xl = { class: "ks-builder-title" }, ec = { class: "ks-builder-acts" }, tc = {
  key: 0,
  class: "ks-overlay-warn"
}, nc = { class: "ks-fields" }, rc = {
  key: 0,
  class: "ks-field-err"
}, oc = {
  key: 0,
  class: "ks-pane locked-pane"
}, ac = { class: "ks-pane-head" }, ic = { class: "ks-pane-sub" }, sc = { class: "ks-pane-body" }, lc = {
  key: 0,
  class: "ks-pane-empty"
}, cc = { class: "ks-pane" }, dc = { class: "ks-pane-search" }, uc = { class: "ks-pane-body" }, pc = {
  key: 0,
  class: "ks-pane-empty"
}, fc = { class: "ks-pane-head" }, mc = { class: "ks-pane-sub" }, bc = { class: "ks-pane-body" }, vc = ["onDrop"], hc = {
  key: 0,
  class: "ks-drop-hint"
}, gc = {
  key: 1,
  class: "ks-view"
}, yc = { class: "ks-builder-head" }, xc = { class: "ks-builder-title" }, kc = { class: "ks-builder-acts" }, wc = { class: "ks-view-note" }, Sc = { class: "ks-view-id" }, _c = { class: "ks-pane-body ks-view-list" }, $c = { class: "ks-view-pol-title" }, Cc = {
  key: 1,
  class: "ks-view-pol-comment"
}, Tc = { class: "ks-view-pol-id" }, Pc = {
  key: 0,
  class: "ks-pane-empty"
}, Oc = {
  key: 0,
  class: "ks-ext-block"
}, Ac = { class: "ks-ext-head" }, Lc = { class: "ks-pane-body ks-view-list" }, Ec = { class: "ks-view-pol-title" }, Nc = {
  key: 1,
  class: "ks-view-pol-comment"
}, jc = { class: "ks-view-pol-id" }, zc = /* @__PURE__ */ J({
  __name: "Security",
  setup(e) {
    const t = cl(), { scopes: n, policies: r, loading: o, saving: a, error: s } = t, c = I(""), i = I(""), d = I(null), l = I(null), u = I("scopes"), p = I(null), m = I(!1);
    async function S(k) {
      u.value = String(k), k === "delegations" && (m.value = !0, await Ht(), await p.value?.load());
    }
    No(async () => {
      await t.load(), u.value === "delegations" && await p.value?.load();
    });
    const P = Y(() => {
      const k = {};
      for (const w of r.value) k[w.id] = w;
      return k;
    }), _ = Y(() => {
      const k = c.value.trim().toLowerCase(), w = (g) => !k || g.label.toLowerCase().includes(k) || g.id.toLowerCase().includes(k);
      return {
        custom: n.value.filter((g) => g.source === "custom" && w(g)),
        builtin: n.value.filter((g) => g.source !== "custom" && w(g))
      };
    }), T = Y(() => n.value.find((k) => k.id === d.value) || null), C = Y(() => T.value && T.value.source !== "custom" ? T.value : null), E = Y(() => {
      if (!l.value) return [];
      const k = /* @__PURE__ */ new Set([...l.value.policies, ...l.value.base.map((g) => g.id)]), w = i.value.trim().toLowerCase();
      return r.value.filter((g) => !k.has(g.id) && (!w || (g.title || "").toLowerCase().includes(w) || g.id.toLowerCase().includes(w) || (g.comment || "").toLowerCase().includes(w)));
    }), f = Y(
      () => l.value ? l.value.policies.map((k) => P.value[k] || { id: k }) : []
    );
    function y(k) {
      d.value = k.id, l.value = k.source === "custom" ? { slug: k.slug || "", label: k.label, description: k.description, policies: k.policies.map((w) => w.id), enabled: k.enabled, isNew: !1, target: "", base: [] } : null;
    }
    function L() {
      d.value = null, l.value = { slug: "", label: "", description: "", policies: [], enabled: !0, isNew: !0, target: "", base: [] };
    }
    function D(k) {
      d.value = null, l.value = {
        slug: "",
        label: k.label ? `Copy of ${k.label}` : "",
        description: k.description,
        policies: [...k.policies.map((w) => w.id), ...(k.overlay_policies ?? []).map((w) => w.id)],
        enabled: !0,
        isNew: !0,
        target: "",
        base: []
      };
    }
    function re(k) {
      return k.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    }
    function he(k) {
      d.value = k.id, l.value = {
        slug: k.overlay_slug || re(k.id),
        label: k.label || ae(k.id),
        description: k.description,
        policies: (k.overlay_policies ?? []).map((w) => w.id),
        enabled: !0,
        isNew: !k.overlay_slug,
        target: k.id,
        base: k.policies
      };
    }
    const K = Y(() => !!l.value && l.value.target !== "");
    function le(k) {
      l.value && !l.value.policies.includes(k) && l.value.policies.push(k);
    }
    function Se(k) {
      l.value && (l.value.policies = l.value.policies.filter((w) => w !== k));
    }
    function _e(k) {
      const w = k.dataTransfer?.getData("text/plain");
      w && le(w);
    }
    function ge(k, w) {
      k.stopPropagation();
      const g = k.dataTransfer?.getData("text/plain");
      if (!g || !l.value || g === w) return;
      const X = l.value.policies, ft = X.indexOf(g);
      ft !== -1 && X.splice(ft, 1);
      const mt = X.indexOf(w);
      X.splice(mt === -1 ? X.length : mt, 0, g);
    }
    const ce = Y(() => {
      if (!l.value || !l.value.isNew || l.value.target !== "") return "";
      const k = l.value.slug.trim();
      return k && !/^[a-z0-9][\w.-]*$/i.test(k) ? "Slug must be alphanumeric (with _.-)" : "";
    }), $e = Y(() => !!l.value && l.value.slug.trim() !== "" && !ce.value && l.value.policies.length > 0), oe = I("");
    let ye = null;
    function Te(k) {
      oe.value = k, ye && clearTimeout(ye), ye = setTimeout(() => {
        oe.value = "";
      }, 3e3);
    }
    async function de() {
      if (!l.value || !$e.value) return;
      const k = l.value.slug.trim(), w = l.value.target, g = l.value.label.trim() || k;
      await t.saveScope({
        slug: k,
        target: w,
        label: l.value.label.trim(),
        description: l.value.description.trim(),
        policies: l.value.policies,
        enabled: l.value.enabled
      }) && (d.value = w || `kickside.security.scopes:${k}`, Te(`Saved “${g}”. New scopes appear in user assignment after a moment.`));
    }
    async function se() {
      if (!l.value || l.value.isNew) return;
      const k = K.value;
      if (!await Fn.confirm({
        header: k ? "Remove extension?" : "Delete scope?",
        message: k ? "The scope reverts to platform defaults. Users keep their base policies; only the added extensions are removed." : "This removes the custom scope and its projected security.scope entry.",
        icon: "tabler:trash",
        acceptLabel: k ? "Remove extension" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) return;
      await t.deleteScope(l.value.slug) && (l.value = null, d.value = null);
    }
    function ue(k) {
      return k === "custom" ? "" : k === "builtin" ? "info" : "secondary";
    }
    function ae(k) {
      return k.includes(":") ? k.split(":").slice(-1)[0] : k;
    }
    return (k, w) => (b(), x("div", Bl, [
      A(h(xr), {
        value: u.value,
        "onUpdate:value": S
      }, {
        default: j(() => [
          A(h(yr), { pt: { tabList: { "aria-label": "Security administration" } } }, {
            default: j(() => [
              A(h(Dt), { value: "scopes" }, {
                default: j(() => [...w[12] || (w[12] = [
                  M("Scopes", -1)
                ])]),
                _: 1
              }),
              A(h(Dt), {
                value: "delegations",
                "data-tab": "delegations"
              }, {
                default: j(() => [...w[13] || (w[13] = [
                  M("Act-as grants", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["value"]),
      m.value ? Re((b(), R(kl, {
        key: 0,
        ref_key: "delegationPanel",
        ref: p
      }, null, 512)), [
        [nn, u.value === "delegations"]
      ]) : O("", !0),
      h(s) ? (b(), R(h(_t), {
        key: 1,
        severity: "danger",
        class: "ks-top-notice",
        onDismiss: w[0] || (w[0] = (g) => s.value = "")
      }, {
        default: j(() => [
          M($(h(s)), 1)
        ]),
        _: 1
      })) : oe.value ? (b(), R(h(_t), {
        key: 2,
        severity: "success",
        class: "ks-top-notice",
        onDismiss: w[1] || (w[1] = (g) => oe.value = "")
      }, {
        default: j(() => [
          M($(oe.value), 1)
        ]),
        _: 1
      })) : O("", !0),
      u.value === "scopes" && h(o) && !h(n).length ? (b(), R(h(_r), {
        key: 3,
        label: "Loading security…"
      })) : Re((b(), R(h(Xi), { key: 4 }, {
        rail: j(() => [
          A(h(os), {
            title: "Scopes",
            count: h(n).length
          }, {
            actions: j(() => [
              A(h(Bn), {
                icon: "tabler:plus",
                label: "New scope",
                disabled: h(a),
                onClick: L
              }, null, 8, ["disabled"]),
              A(h(Bn), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: h(o),
                spin: h(o),
                onClick: h(t).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          v("div", Dl, [
            A(h(Dn), {
              modelValue: c.value,
              "onUpdate:modelValue": w[2] || (w[2] = (g) => c.value = g),
              placeholder: "Filter scopes…"
            }, null, 8, ["modelValue"])
          ]),
          v("div", Ml, [
            _.value.custom.length ? (b(), x("div", Ul, "Custom")) : O("", !0),
            (b(!0), x(fe, null, me(_.value.custom, (g) => (b(), x("button", {
              key: g.id,
              class: te(["ks-scope-row", { active: g.id === d.value }]),
              onClick: (X) => y(g)
            }, [
              v("span", Fl, $(g.label || ae(g.id)), 1),
              v("span", Hl, [
                A(h(We), {
                  severity: ue(g.source)
                }, {
                  default: j(() => [
                    M($(g.source), 1)
                  ]),
                  _: 2
                }, 1032, ["severity"]),
                v("span", Kl, $(g.policies.length), 1)
              ])
            ], 10, Wl))), 128)),
            w[14] || (w[14] = v("div", { class: "ks-rail-group" }, "Built-in", -1)),
            (b(!0), x(fe, null, me(_.value.builtin, (g) => (b(), x("button", {
              key: g.id,
              class: te(["ks-scope-row", { active: g.id === d.value }]),
              onClick: (X) => y(g)
            }, [
              v("span", Yl, $(g.label || ae(g.id)), 1),
              v("span", Gl, [
                A(h(We), {
                  severity: ue(g.source)
                }, {
                  default: j(() => [
                    M($(g.source), 1)
                  ]),
                  _: 2
                }, 1032, ["severity"]),
                v("span", Ql, $(g.policies.length), 1)
              ])
            ], 10, ql))), 128))
          ])
        ]),
        default: j(() => [
          l.value ? (b(), x("div", Zl, [
            v("div", Jl, [
              v("div", Xl, [
                A(h(G), {
                  icon: K.value ? "tabler:stack-2" : "tabler:shield-lock",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                v("span", null, $(K.value ? `Extend ${l.value.label || ae(l.value.target)}` : l.value.isNew ? "New scope" : l.value.label || l.value.slug), 1),
                K.value ? (b(), R(h(We), {
                  key: 0,
                  severity: "warn"
                }, {
                  default: j(() => [...w[15] || (w[15] = [
                    M("overlay", -1)
                  ])]),
                  _: 1
                })) : O("", !0)
              ]),
              v("div", ec, [
                !l.value.isNew && !K.value && T.value ? (b(), R(h(ve), {
                  key: 0,
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: h(a),
                  onClick: w[3] || (w[3] = (g) => D(T.value))
                }, {
                  default: j(() => [...w[16] || (w[16] = [
                    M("Duplicate", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])) : O("", !0),
                l.value.isNew ? O("", !0) : (b(), R(h(ve), {
                  key: 1,
                  variant: "danger",
                  small: "",
                  icon: "tabler:trash",
                  disabled: h(a),
                  onClick: se
                }, {
                  default: j(() => [
                    M($(K.value ? "Remove extension" : "Delete"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])),
                A(h(ve), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:device-floppy",
                  loading: h(a),
                  disabled: !$e.value,
                  onClick: de
                }, {
                  default: j(() => [
                    M($(K.value ? "Save extension" : "Save scope"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ]),
            K.value ? (b(), x("div", tc, [
              A(h(G), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              v("span", null, [
                w[17] || (w[17] = M("Extending a platform scope grants the added policies to ", -1)),
                v("b", null, "every user with the " + $(ae(l.value.target)) + " role", 1),
                w[18] || (w[18] = M(". Base policies stay in place — extensions only add access, they can't remove it.", -1))
              ])
            ])) : O("", !0),
            v("div", nc, [
              K.value ? (b(), R(h(je), {
                key: 1,
                label: "Extends"
              }, {
                default: j(() => [
                  A(h(qe), {
                    "model-value": l.value.target,
                    disabled: ""
                  }, null, 8, ["model-value"])
                ]),
                _: 1
              })) : (b(), R(h(je), {
                key: 0,
                label: "Slug",
                help: l.value.isNew ? "Lowercase id; cannot change later." : void 0
              }, {
                default: j(() => [
                  A(h(qe), {
                    modelValue: l.value.slug,
                    "onUpdate:modelValue": w[4] || (w[4] = (g) => l.value.slug = g),
                    disabled: !l.value.isNew,
                    placeholder: "reviewer"
                  }, null, 8, ["modelValue", "disabled"]),
                  ce.value ? (b(), x("span", rc, $(ce.value), 1)) : O("", !0)
                ]),
                _: 1
              }, 8, ["help"])),
              A(h(je), { label: "Label" }, {
                default: j(() => [
                  A(h(qe), {
                    modelValue: l.value.label,
                    "onUpdate:modelValue": w[5] || (w[5] = (g) => l.value.label = g),
                    placeholder: "Reviewer"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              A(h(je), { label: "Description" }, {
                default: j(() => [
                  A(h(qe), {
                    modelValue: l.value.description,
                    "onUpdate:modelValue": w[6] || (w[6] = (g) => l.value.description = g),
                    placeholder: "Read-only reviewer role"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            v("div", {
              class: te(["ks-panes", { three: K.value }])
            }, [
              K.value ? (b(), x("section", oc, [
                v("header", ac, [
                  w[19] || (w[19] = v("span", null, "Base policies", -1)),
                  v("span", ic, $(l.value.base.length) + " · locked", 1)
                ]),
                v("div", sc, [
                  (b(!0), x(fe, null, me(l.value.base, (g) => (b(), R(Ot, {
                    key: g.id,
                    policy: g,
                    mode: "locked"
                  }, null, 8, ["policy"]))), 128)),
                  l.value.base.length ? O("", !0) : (b(), x("div", lc, "No base policies."))
                ])
              ])) : O("", !0),
              v("section", cc, [
                w[20] || (w[20] = v("header", { class: "ks-pane-head" }, [
                  v("span", null, "Available policies"),
                  v("span", { class: "ks-pane-sub" }, "public only · drag or click +")
                ], -1)),
                v("div", dc, [
                  A(h(Dn), {
                    modelValue: i.value,
                    "onUpdate:modelValue": w[7] || (w[7] = (g) => i.value = g),
                    placeholder: "Search policies…"
                  }, null, 8, ["modelValue"])
                ]),
                v("div", uc, [
                  (b(!0), x(fe, null, me(E.value, (g) => (b(), R(Ot, {
                    key: g.id,
                    policy: g,
                    mode: "palette",
                    onAdd: (X) => le(g.id)
                  }, null, 8, ["policy", "onAdd"]))), 128)),
                  E.value.length ? O("", !0) : (b(), x("div", pc, "No matching public policies."))
                ])
              ]),
              v("section", {
                class: "ks-pane drop",
                onDragover: w[9] || (w[9] = Ye(() => {
                }, ["prevent"])),
                onDrop: _e
              }, [
                v("header", fc, [
                  v("span", null, $(K.value ? "Added by you" : "In this scope"), 1),
                  v("span", mc, $(l.value.policies.length) + " " + $(l.value.policies.length === 1 ? "policy" : "policies"), 1)
                ]),
                v("div", bc, [
                  (b(!0), x(fe, null, me(f.value, (g) => (b(), x("div", {
                    key: g.id,
                    onDragover: w[8] || (w[8] = Ye(() => {
                    }, ["prevent"])),
                    onDrop: (X) => ge(X, g.id)
                  }, [
                    A(Ot, {
                      policy: g,
                      mode: "selected",
                      onRemove: (X) => Se(g.id)
                    }, null, 8, ["policy", "onRemove"])
                  ], 40, vc))), 128)),
                  l.value.policies.length ? O("", !0) : (b(), x("div", hc, [
                    A(h(G), {
                      icon: "tabler:drag-drop",
                      "aria-hidden": "true"
                    }),
                    v("span", null, $(K.value ? "Drag policies here to extend this scope." : "Drag policies here to grant them to this scope."), 1)
                  ]))
                ])
              ], 32)
            ], 2)
          ])) : C.value ? (b(), x("div", gc, [
            v("div", yc, [
              v("div", xc, [
                A(h(G), {
                  icon: "tabler:shield",
                  "aria-hidden": "true"
                }),
                v("span", null, $(C.value.label || ae(C.value.id)), 1),
                A(h(We), {
                  severity: ue(C.value.source)
                }, {
                  default: j(() => [
                    M($(C.value.source), 1)
                  ]),
                  _: 1
                }, 8, ["severity"])
              ]),
              v("div", kc, [
                A(h(ve), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:stack-2",
                  onClick: w[10] || (w[10] = (g) => he(C.value))
                }, {
                  default: j(() => [
                    M($(C.value.overlay_slug ? "Edit extension" : "Extend scope"), 1)
                  ]),
                  _: 1
                }),
                A(h(ve), {
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  onClick: w[11] || (w[11] = (g) => D(C.value))
                }, {
                  default: j(() => [...w[21] || (w[21] = [
                    M("Copy to custom scope", -1)
                  ])]),
                  _: 1
                })
              ])
            ]),
            v("p", wc, [
              M($(C.value.source === "builtin" ? "Built-in role — composed from the policies that list its group. You can extend it (add policies) via an overlay; base policies can only change in the owning package." : "Registry-declared scope.") + " ", 1),
              v("span", Sc, $(C.value.id), 1)
            ]),
            v("div", _c, [
              (b(!0), x(fe, null, me(C.value.policies, (g) => (b(), x("div", {
                key: g.id,
                class: "ks-view-pol"
              }, [
                v("span", $c, $(g.title || ae(g.id)), 1),
                g.effect ? (b(), x("span", {
                  key: 0,
                  class: te(["ks-eff", g.effect])
                }, $(g.effect), 3)) : O("", !0),
                g.comment ? (b(), x("div", Cc, $(g.comment), 1)) : O("", !0),
                v("div", Tc, $(g.id), 1)
              ]))), 128)),
              C.value.policies.length ? O("", !0) : (b(), x("div", Pc, "No policies in this scope."))
            ]),
            C.value.overlay_policies && C.value.overlay_policies.length ? (b(), x("div", Oc, [
              v("div", Ac, [
                A(h(G), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                w[22] || (w[22] = v("span", null, "Extensions", -1)),
                A(h(We), { severity: "warn" }, {
                  default: j(() => [
                    M("overlay · " + $(C.value.overlay_policies.length), 1)
                  ]),
                  _: 1
                })
              ]),
              v("div", Lc, [
                (b(!0), x(fe, null, me(C.value.overlay_policies, (g) => (b(), x("div", {
                  key: g.id,
                  class: "ks-view-pol"
                }, [
                  v("span", Ec, $(g.title || ae(g.id)), 1),
                  g.effect ? (b(), x("span", {
                    key: 0,
                    class: te(["ks-eff", g.effect])
                  }, $(g.effect), 3)) : O("", !0),
                  g.comment ? (b(), x("div", Nc, $(g.comment), 1)) : O("", !0),
                  v("div", jc, $(g.id), 1)
                ]))), 128))
              ])
            ])) : O("", !0)
          ])) : (b(), R(h(ol), {
            key: 2,
            icon: "tabler:shield-lock",
            title: "Scopes & roles",
            hint: "Select a scope to inspect it, or create a custom scope by composing public policies.",
            cta: "New scope",
            "cta-icon": "tabler:plus",
            onCta: L
          }))
        ]),
        _: 1
      }, 512)), [
        [nn, u.value === "scopes"]
      ])
    ]));
  }
}), Ic = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;--km-rail-w: 296px;--system-surface-gutter: var(--kickside-system-surface-gutter, 24px)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.km{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--p-content-background);color:var(--p-text-color);font-family:inherit}.km-top-notice{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter)}.km-shell{flex:1;min-height:0;width:100%;margin:0;display:grid;grid-template-columns:var(--km-rail-w) minmax(0,1fr);border-left:1px solid var(--p-content-border-color);border-right:1px solid var(--p-content-border-color)}.km-rail{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid var(--p-content-border-color)}.km-rail-body{flex:1;min-height:0;overflow:auto;padding:6px}.km-main{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.km-railhead{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:0 8px 0 14px;border-bottom:1px solid var(--p-content-border-color)}.km-railhead-title{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;color:var(--p-text-muted-color)}.km-railhead-title b{min-width:18px;padding:1px 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-color);font-size:11px;font-weight:700;text-align:center}.km-railhead-acts{display:inline-flex;align-items:center;gap:2px}.km-input{width:100%;min-width:0;height:34px;padding:0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-input:read-only{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-input:disabled{opacity:.6}.km-input.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.km-textarea{height:auto;min-height:120px;padding:9px 10px;line-height:1.45;resize:vertical}.km-search{position:relative;display:flex;align-items:center;min-width:0}.km-search-ico{position:absolute;left:9px;width:16px;height:16px;color:var(--p-text-muted-color);pointer-events:none}.km-search-input{width:100%;height:34px;padding:0 30px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-search-clear{position:absolute;right:6px;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.km-search-clear:hover{color:var(--p-text-color);background:var(--kx-overlay-hover)}.km-search-clear svg{width:14px;height:14px}.km-select{position:relative;min-width:0;display:flex}.km-select-el{width:100%;height:34px;padding:0 30px 0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;cursor:pointer;appearance:none}.km-select-chev{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.km-field{min-width:0;display:flex;flex-direction:column;gap:5px}.km-field-label{color:var(--p-text-muted-color);font-size:11.5px;font-weight:680}.km-field-help{color:var(--p-text-muted-color);font-size:11.5px;line-height:1.35}.km-pill{max-width:190px;overflow:hidden;text-overflow:ellipsis}.km-pill-dot{width:6px;height:6px;border-radius:50%;background:currentColor}.km-notice{display:flex;align-items:center;gap:9px;padding:9px 10px 9px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-notice svg{width:17px;height:17px;flex:0 0 auto}.km-notice-text{flex:1;min-width:0}.km-notice.is-info{color:var(--p-text-color);background:var(--kx-overlay-subtle)}.km-notice.is-danger{color:var(--p-danger-600, var(--p-danger-500));border-color:color-mix(in srgb,var(--p-danger-500) 32%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 9%,transparent)}.km-notice.is-success{color:var(--p-success-700);border-color:color-mix(in srgb,var(--p-success-500) 36%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-notice-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:inherit;cursor:pointer;opacity:.7}.km-notice-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-notice-x svg{width:14px;height:14px}.km-loading{display:flex;align-items:center;justify-content:center;gap:9px;padding:40px 20px;color:var(--p-text-muted-color);font-size:13px}.km-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 24px;text-align:center}.km-empty-ico{width:30px;height:30px;color:var(--p-text-muted-color)}.km-empty-title{font-size:14px;font-weight:720}.km-empty-hint{margin:0;max-width:340px;color:var(--p-text-muted-color);font-size:12.5px;line-height:1.45}.km-empty .p-button{margin-top:4px}.km-plist{display:flex;flex-direction:column;gap:2px}.km-plist-all{width:100%;height:32px;display:flex;align-items:center;padding:0 10px;border:0;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12.5px;font-weight:640;text-align:left;cursor:pointer}.km-plist-all:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.km-plist-all.on{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.km-plist-empty{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px;color:var(--p-text-muted-color);font-size:12.5px}.km-plist-empty p{margin:0}.km-picker{display:flex;flex-direction:column;gap:18px}.km-picker-sec{display:flex;flex-direction:column;gap:7px}.km-picker-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-picker-list{display:flex;flex-direction:column;gap:4px}.km-picker-item{display:grid;grid-template-columns:32px minmax(0,1fr) 16px;align-items:center;gap:11px;padding:9px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-color);font:inherit;text-align:left;cursor:pointer;transition:border-color .12s ease,background-color .12s ease}.km-picker-item:hover{border-color:color-mix(in srgb,var(--p-primary-color) 50%,var(--p-content-border-color));background:var(--kx-overlay-hover)}.km-picker-ico{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 11%,transparent)}.km-picker-ico svg{width:18px;height:18px}.km-picker-body{min-width:0;display:flex;flex-direction:column;gap:2px}.km-picker-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:660}.km-picker-desc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:11.5px}.km-picker-go{width:16px;height:16px;color:var(--p-text-muted-color)}.km-form{display:flex;flex-direction:column;gap:16px}.km-editor-head{display:flex;align-items:center;gap:11px}.km-editor-head-text{min-width:0}.km-editor-head-title{font-size:14px;font-weight:740}.km-editor-head-sub{margin-top:2px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-form-sec{display:flex;flex-direction:column;gap:10px}.km-form-sec+.km-form-sec{padding-top:16px;border-top:1px solid var(--p-content-border-color)}.km-form-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.km-form-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.km-form-foot{position:sticky;bottom:-16px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:14px 16px;border-top:1px solid var(--p-content-border-color);background:var(--p-content-background)}.km-form-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--p-text-muted-color)}.km-form-foot-sp{flex:1}.km-adv-toggle{display:inline-flex;align-items:center;gap:6px;padding:0;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;cursor:pointer}.km-adv-toggle:hover{color:var(--p-text-color)}.km-adv-chev{width:14px;height:14px;transition:transform .15s ease}.km-adv-toggle.open .km-adv-chev{transform:rotate(90deg)}.km-adv-body{display:flex;flex-direction:column;gap:10px;margin-top:10px}.km-test-result{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:var(--kx-radius-8);font-size:12.5px}.km-test-result svg{width:16px;height:16px;flex:0 0 auto}.km-test-result span{min-width:0;overflow-wrap:anywhere}.km-test-result.testing{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-test-result.ok{color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-test-result.fail{color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 10%,transparent)}.km-probe{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-probe.ok{border-color:color-mix(in srgb,var(--p-success-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 8%,transparent)}.km-probe.fail{border-color:color-mix(in srgb,var(--p-danger-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 8%,transparent)}.km-probe-head{display:flex;flex-wrap:wrap;align-items:center;gap:9px;padding:9px 10px 9px 12px}.km-probe-head>svg{width:17px;height:17px;flex:0 0 auto}.km-probe.ok .km-probe-head>svg{color:var(--p-success-600, var(--p-success-500))}.km-probe.fail .km-probe-head>svg{color:var(--p-danger-600, var(--p-danger-500))}.km-probe-msg{flex:1;min-width:0}.km-probe-time{flex:0 0 auto;padding:1px 7px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.km-probe-adv-btn{flex:0 0 auto}.km-probe-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;opacity:.7}.km-probe-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-probe-x svg{width:14px;height:14px}.km-probe-adv{display:flex;flex-direction:column;gap:10px;padding:10px 12px 12px;border-top:1px solid var(--p-content-border-color)}.km-probe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px 16px}.km-probe-kv{display:flex;align-items:baseline;gap:8px;min-width:0}.km-probe-kv span{flex:0 0 96px;color:var(--p-text-muted-color);font-size:11.5px}.km-probe-kv code{min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px}.km-probe-tokens{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.km-probe-tokens-l{color:var(--p-text-muted-color);font-size:11.5px;margin-right:2px}.km-probe-tok{padding:1px 8px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-variant-numeric:tabular-nums}.km-probe-tok b{color:var(--p-text-color);font-weight:700}.km-probe-out{display:flex;flex-direction:column;gap:4px}.km-probe-out span{color:var(--p-text-muted-color);font-size:11.5px;font-weight:700}.km-probe-out pre{margin:0;max-height:160px;overflow:auto;padding:9px 10px;border-radius:6px;background:var(--kx-overlay-subtle);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.km-tabs{flex:0 0 auto;display:flex;gap:2px;padding:0 12px;border-bottom:1px solid var(--p-content-border-color)}.km-tab{position:relative;display:inline-flex;align-items:center;gap:7px;height:44px;padding:0 12px;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:13px;font-weight:700;cursor:pointer}.km-tab:hover,.km-tab.on{color:var(--p-text-color)}.km-tab.on:after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2px;border-radius:2px 2px 0 0;background:var(--p-primary-color)}.km-tab b{min-width:18px;padding:0 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;text-align:center}.km-tab.on b{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.km-classes{flex:1;min-height:0;display:flex;flex-direction:column}.km-classes-list{display:flex;flex-direction:column;gap:10px;padding:14px 16px}.km-class{flex:0 0 auto;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);overflow:hidden}.km-class-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--kx-overlay-subtle);border-bottom:1px solid var(--p-content-border-color)}.km-class-head-text{flex:1;min-width:0}.km-class-title{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:720}.km-class-ref{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;font-weight:600;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);padding:1px 6px;border-radius:6px}.km-class-desc{margin-top:3px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-class-meta{display:flex;align-items:center;gap:8px;flex:0 0 auto}.km-class-count{color:var(--p-text-muted-color);font-size:11.5px;white-space:nowrap}.km-class-members{display:flex;flex-direction:column}.km-class-member{display:grid;grid-template-columns:58px minmax(0,1.2fr) minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--p-content-border-color)}.km-class-member:last-child{border-bottom:0}.km-class-member.top{background:color-mix(in srgb,var(--p-success-500) 6%,transparent)}.km-class-rank{width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700}.km-class-member-name{font-size:13px;font-weight:620;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-id{color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-pri{color:var(--p-text-muted-color);font-size:11px;justify-self:end;white-space:nowrap}.km-class-empty{padding:12px;color:var(--p-text-muted-color);font-size:12px}@media(max-width:860px){.km-shell{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.km-rail{border-right:0;border-bottom:1px solid var(--p-content-border-color);max-height:40vh}.km-form-grid,.km-form-grid.four{grid-template-columns:1fr}.km-class-member{grid-template-columns:auto minmax(0,1fr) auto}.km-class-member-id{display:none}}@media(max-width:560px){.km-probe-grid{grid-template-columns:1fr}}.ks{height:100%;display:flex;flex-direction:column}.ks-top-notice{margin:8px}.ks-rail-search{padding:8px 10px}.ks-rail-list{padding:0 8px 10px;overflow-y:auto}.ks-rail-group{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--p-text-muted-color);padding:10px 6px 4px}.ks-scope-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:none;border-radius:var(--kx-radius-8);background:transparent;cursor:pointer;text-align:left;color:var(--p-text-color);transition:background .12s;font:inherit}.ks-scope-row:hover{background:var(--kx-overlay-hover)}.ks-scope-row.active{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ks-scope-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-scope-meta{flex:none;display:flex;align-items:center;gap:6px}.ks-scope-count{font-size:11px;font-weight:700;color:var(--p-text-muted-color);min-width:18px;text-align:right}.ks-builder,.ks-view{display:flex;flex-direction:column;height:100%;min-height:0;padding:14px 16px;gap:14px}.ks-builder-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.ks-builder-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:var(--p-text-color)}.ks-builder-acts{display:flex;gap:8px}.ks-fields{display:grid;grid-template-columns:220px 1fr 1fr;gap:12px}.ks-field-err{display:block;margin-top:4px;font-size:11px;color:var(--p-danger-500)}.ks-panes{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ks-pane{display:flex;flex-direction:column;min-height:0;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ks-pane.drop{border-style:dashed}.ks-pane-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:10px 12px 8px;font-size:13px;font-weight:700;color:var(--p-text-color)}.ks-pane-sub{font-size:11px;font-weight:500;color:var(--p-text-muted-color)}.ks-pane-search{padding:0 10px 8px}.ks-pane-body{flex:1;min-height:0;overflow-y:auto;padding:4px 10px 10px;display:flex;flex-direction:column;gap:8px}.ks-pane-empty{padding:16px 8px;font-size:12px;color:var(--p-text-muted-color);text-align:center}.ks-drop-hint{margin:auto;display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px;color:var(--p-text-muted-color);font-size:13px;text-align:center}.ks-drop-hint svg{font-size:28px}.ks-view-note{font-size:12px;color:var(--p-text-muted-color);line-height:1.5;margin:0}.ks-view-id{display:block;margin-top:4px;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--p-text-muted-color);overflow-wrap:anywhere}.ks-view-list{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle);padding:4px 10px}.ks-view-pol{padding:8px 4px;border-bottom:1px solid var(--p-content-border-color)}.ks-view-pol:last-child{border-bottom:none}.ks-view-pol-title{font-size:13px;font-weight:600;color:var(--p-text-color)}.ks-view-pol-comment{font-size:12px;color:var(--p-text-muted-color);margin-top:2px}.ks-view-pol-id{font-size:10.5px;color:var(--p-text-muted-color);font-family:ui-monospace,Menlo,monospace;margin-top:2px;overflow-wrap:anywhere}.ks-eff{font-size:10px;font-weight:700;text-transform:uppercase;padding:1px 6px;border-radius:999px;margin-left:6px}.ks-eff.allow{background:color-mix(in srgb,var(--p-success-600) 14%,transparent);color:var(--p-success-700)}.ks-eff.deny{background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--p-danger-700)}.ks-pcard{display:flex;align-items:flex-start;gap:8px;padding:10px 10px 10px 6px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);cursor:grab;transition:border-color .12s,box-shadow .12s,transform .08s}.ks-pcard:hover{border-color:var(--p-primary-color);box-shadow:0 1px 6px #0000000f}.ks-pcard:active{cursor:grabbing;transform:scale(.997)}.ks-pcard-grip{flex:none;margin-top:2px;color:var(--p-text-muted-color);font-size:15px}.ks-pcard-body{flex:1;min-width:0}.ks-pcard-head{display:flex;align-items:center;gap:8px}.ks-pcard-title{font-weight:600;font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pcard-comment{font-size:12px;color:var(--p-text-muted-color);margin-top:2px;line-height:1.35}.ks-pcard-id{font-size:10.5px;color:var(--p-text-muted-color);margin-top:3px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pcard-act{flex:none;width:24px;height:24px;display:grid;place-items:center;border:none;border-radius:6px;cursor:pointer;background:transparent;color:var(--p-text-muted-color);transition:background .12s,color .12s}.ks-pcard-act.add:hover{background:color-mix(in srgb,var(--p-success-600) 12%,transparent);color:var(--p-success-700)}.ks-pcard-act.remove:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-700)}.ks-pcard{flex-direction:column;align-items:stretch}.ks-pcard-row{display:flex;align-items:flex-start;gap:8px}.ks-pcard.locked{cursor:default;opacity:.9}.ks-pcard.locked:hover{border-color:var(--p-content-border-color);box-shadow:none}.ks-pcard-grip.locked,.ks-pcard-act.detail{color:var(--p-text-muted-color)}.ks-pcard-act.detail svg{transition:transform .15s}.ks-pcard-act.detail.open svg{transform:rotate(90deg)}.ks-pcard-act.detail:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.ks-pcard-detail{margin-top:8px;padding-top:8px;border-top:1px dashed var(--p-content-border-color);display:flex;flex-direction:column;gap:5px}.ks-pcard-kv{display:flex;gap:8px;font-size:11px;align-items:flex-start}.ks-pcard-kv>span{flex:none;width:64px;color:var(--p-text-muted-color);text-transform:uppercase;font-weight:700;letter-spacing:.03em;font-size:10px;padding-top:3px}.ks-pcard-tags{display:flex;flex-wrap:wrap;gap:4px}.ks-pcard-kv code,.ks-eff-code{min-width:0;overflow-wrap:anywhere;font-family:ui-monospace,Menlo,monospace;font-size:10.5px;background:var(--kx-overlay-subtle);padding:1px 5px;border-radius:4px;color:var(--p-text-color)}.ks-eff-code.allow{color:var(--p-success-700)}.ks-eff-code.deny{color:var(--p-danger-700)}.ks-pcard-none{color:var(--p-text-muted-color);font-size:11px}.ks-overlay-warn{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:var(--kx-radius-8);background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);border:1px solid color-mix(in srgb,var(--p-warn-500) 40%,transparent);color:var(--p-text-color);font-size:12.5px;line-height:1.45}.ks-overlay-warn svg{flex:none;margin-top:1px;color:var(--p-warn-600);font-size:18px}.ks-panes.three{grid-template-columns:repeat(3,minmax(0,1fr))}.ks-pane.locked-pane{background:var(--kx-overlay-hover)}.ks-ext-block{margin-top:14px}.ks-ext-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--p-text-color);margin-bottom:6px}.ks-ext-head svg{color:var(--p-warn-600)}.ks-delegations{flex:1;min-height:0;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:16px;color:var(--p-text-color)}.ks-delegation-form{display:flex;flex-direction:column;gap:12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);padding:16px;max-width:720px}.ks-delegation-form ul{list-style:none;margin:0;padding:0}.ks-delegation-form li{display:flex;align-items:center;justify-content:space-between;gap:12px}.ks-delegation-form small{display:block;overflow-wrap:anywhere;color:var(--p-text-muted-color)}.ks-delegation-all{display:flex;align-items:center;gap:8px}.ks-delegation-table{width:100%;border-collapse:collapse;text-align:left}.ks-delegation-table caption{text-align:left;font-weight:600;padding:8px 0}.ks-delegation-table th,.ks-delegation-table td{border-bottom:1px solid var(--p-content-border-color);padding:10px;overflow-wrap:anywhere}', Rc = { props: { type: "object", properties: {} } }, Vc = {
  wippy: Rc
};
class Bc extends jo {
  static get wippyConfig() {
    return {
      propsSchema: Vc.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ic
    };
  }
  static get vueConfig() {
    return { rootComponent: zc, plugins: [yi] };
  }
}
ro(import.meta.url, Bc);
//# sourceMappingURL=index.js.map

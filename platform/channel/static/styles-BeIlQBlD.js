import { hasInjectionContext as Mr, inject as Vt, effectScope as Nr, ref as te, markRaw as Dr, createApp as Rr, readonly as Br, getCurrentInstance as Kt, onMounted as Pn, nextTick as An, watch as we, reactive as Hr, renderSlot as j, openBlock as C, createBlock as me, Teleport as En, createCommentVNode as X, useId as Kr, mergeProps as O, h as Ur, createElementBlock as L, createElementVNode as R, resolveComponent as ie, Fragment as Te, renderList as gt, createVNode as ge, resolveDirective as Wr, createTextVNode as ct, toDisplayString as de, normalizeClass as Je, resolveDynamicComponent as Ut, withCtx as $e, Transition as Gr, normalizeProps as qr, createSlots as Yr, withDirectives as Zr, withModifiers as Jr, defineComponent as Qr, onBeforeUnmount as Xr } from "vue";
import { addCollection as ei } from "@iconify/vue";
import { config as Wt, addIcons as ti, on as ni, applyThemeMode as Qe, host as ri, hostCss as ii, loadCss as oi, loadByTagName as ai } from "@wippy-fe/proxy";
var vt = "data-wippy-visible";
function Gt(t) {
  const e = t.getAttribute(vt);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var si = Object.defineProperty, li = (t, e, n) => e in t ? si(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, z = (t, e, n) => li(t, typeof e != "symbol" ? e + "" : e, n), ui = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], ci = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function qt(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function di(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const n of t)
    if (n)
      for (const [r, i] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && i && typeof i == "object") {
          for (const [s, l] of Object.entries(i)) {
            const a = typeof l == "string" ? qt(s) : null;
            a && e.add(a);
          }
          continue;
        }
        const o = typeof i == "string" ? qt(r) : null;
        o && e.add(o);
      }
  return [...e].sort();
}
function pi(t) {
  if (t.length === 0)
    return "";
  const e = t.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${ci} {
${e}
}`;
}
function fi(t, e) {
  const n = pi(e);
  n && Vn(t, n, "@wippy-fe/css-variables-bridge");
}
function hi(t, e) {
  const r = (e ?? ui).map(async (i) => {
    const o = ii[i];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${i}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await oi(o);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${i}" (${o}):`, s), null;
    }
  });
  return Promise.all(r).then((i) => {
    for (const o of i) {
      if (!o)
        continue;
      const s = document.createElement("style");
      s.textContent = o, s.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(s);
    }
  });
}
function mi(t, e) {
  const n = document.createElement("style");
  n.textContent = e, t.appendChild(n);
}
function Vn(t, e, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const i = new CSSStyleSheet();
    i.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, i];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = e, t.appendChild(r);
}
function gi(t, e) {
  Vn(t, e, "@wippy-fe/custom-css");
}
function jn(t) {
  return t.__wippyHost ?? null;
}
function vi(t) {
  return t.replace(/-([a-z])/g, (e, n) => n.toUpperCase());
}
function yi(t, e, n) {
  switch (n.type) {
    case "string":
      return { value: e };
    case "number": {
      const r = Number.parseFloat(e);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${t}: expected a number` } : { value: r };
    }
    case "integer": {
      const r = Number.parseInt(e, 10);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${t}: expected an integer` } : { value: r };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const r = JSON.parse(e);
        return n.type === "array" && !Array.isArray(r) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: r };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function dt(t, e) {
  const n = {}, r = [];
  for (const [i, o] of Object.entries(e.properties)) {
    const s = t.getAttribute(i), l = vi(i);
    if (s === null) {
      o.default !== void 0 && (n[l] = o.default);
      continue;
    }
    const a = yi(i, s, o);
    a.error ? r.push(a.error) : n[l] = a.value;
  }
  return { props: n, errors: r };
}
var bi = class {
  constructor(t, e) {
    z(this, "_props"), z(this, "_errors"), z(this, "_content"), z(this, "_hostVisibility"), z(this, "_propsListeners", /* @__PURE__ */ new Set()), z(this, "_contentListeners", /* @__PURE__ */ new Set()), z(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), z(this, "_disposed", !1), z(this, "_emitToDom"), z(this, "props"), z(this, "events"), z(this, "content"), z(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(r, i) {
        return n._subscribeProps(r, i);
      }
    }, this.events = {
      emit(r, i) {
        n._disposed || n._emitToDom(r, i);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(r, i) {
        return n._subscribeContent(r, i);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(r, i) {
        return n._subscribeHostVisibility(r, i);
      }
    };
  }
  /** @internal */
  notifyProps(t, e) {
    if (!this._disposed) {
      this._props = t, this._errors = e;
      for (const n of this._propsListeners)
        n(t, e);
    }
  }
  /** @internal */
  notifyContent(t) {
    if (!this._disposed) {
      this._content = t;
      for (const e of this._contentListeners)
        e(t);
    }
  }
  /** @internal */
  notifyHostVisibility(t, e) {
    if (!(this._disposed || t === e)) {
      this._hostVisibility = t;
      for (const n of this._hostVisibilityListeners)
        n(t, e);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(t), e?.immediate && t(this._props, this._errors);
    const n = () => {
      this._propsListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeContent(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), e?.immediate && t(this._content);
    const n = () => {
      this._contentListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeHostVisibility(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), e?.immediate && t(this._hostVisibility, this._hostVisibility);
    const n = () => {
      this._hostVisibilityListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
}, wi = class extends HTMLElement {
  constructor() {
    super(), z(this, "_internals"), z(this, "_contentObserver", null), z(this, "_initialized", !1), z(this, "_container", null), z(this, "_reactive", null), z(this, "_lastProps", null), z(this, "_lastErrors", []), z(this, "_lastContent", null), z(this, "_themeUnsub", null), z(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Gt(this);
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
    const t = this.wippyConfig, e = Object.keys(t.propsSchema.properties), n = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...n, vt])];
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
    return jn(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(t, e) {
    this.dispatchEvent(new CustomEvent(t, {
      bubbles: !0,
      composed: !0,
      detail: e
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
      const t = this.constructor.wippyConfig, e = !!t.contentTemplate;
      let n, r;
      if (this._lastProps !== null)
        n = this._lastProps, r = this._lastErrors;
      else {
        const o = dt(this, t.propsSchema);
        t.validateProps && o.errors.push(...t.validateProps(o.props)), n = o.props, r = o.errors, this._lastProps = n, this._lastErrors = r;
      }
      const i = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = i), this._reactive = new bi(
        { props: n, errors: r, content: i, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, e = this._initialized, n = this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" });
      let r;
      if (e)
        r = this._container;
      else {
        this.onInit(n), t.inlineCss && mi(n, t.inlineCss);
        try {
          const u = Wt?.theming, c = di(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          fi(n, c);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const u = Wt?.theming, c = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            c && gi(n, c);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && hi(n, t.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const a = t.containerClasses ?? [];
        a.length > 0 && r.classList.add(...a), n.appendChild(r), this._container = r, ti(ei);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = ni("@theme", (a) => this._applyTheme(a)));
      const { props: i, errors: o } = dt(this, t.propsSchema);
      t.validateProps && o.push(...t.validateProps(i));
      const s = i;
      this._lastProps = s, this._lastErrors = o;
      let l = null;
      t.contentTemplate && (l = this._extractContent(t.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const a = this._extractContent(t.contentTemplate);
        this._lastContent = a, this._reactive?.notifyContent(a), this.onContentChanged(a);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, s, o, l, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (t) {
      this.onError(t), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: t instanceof Error ? t.message : String(t),
        error: t
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
  _applyTheme(t = ri.getThemeMode?.()) {
    Qe(t, this), this._container && Qe(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Qe("auto", this), this._container && Qe("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, n) {
    if (e === n)
      return;
    if (t === vt) {
      const l = this._hostVisible, a = Gt(this);
      if (a === l)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, l), this.onHostVisibilityChanged(a, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: i, errors: o } = dt(this, r.propsSchema);
    r.validateProps && o.push(...r.validateProps(i));
    const s = i;
    this._lastProps = s, this._lastErrors = o, this._reactive?.notifyProps(s, o), this.onPropsChanged(s, o);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(t) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(t) {
    console.error(`${this.constructor.name} initialization failed:`, t);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(t, e) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(t, e) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(t) {
    return this.querySelector(`template[data-type="${t}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(t) {
  }
};
function Si(t) {
  return t.__wippyHostBus ?? null;
}
function xi(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let zn;
const Fn = (t) => zn = t, Oi = () => Mr() && Vt(Mn) || zn, Mn = (
  /* istanbul ignore next */
  Symbol()
);
function $i() {
  const t = Nr(!0), e = t.run(() => te({}));
  let n = [], r = [];
  const i = Dr({
    install(o) {
      Fn(i), i._a = o, o.provide(Mn, i), o.config.globalProperties.$pinia = i, r.forEach((s) => n.push(s)), r = [];
    },
    use(o) {
      return this._a ? n.push(o) : r.push(o), this;
    },
    _p: n,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return i;
}
var ki = Object.defineProperty, Ci = (t, e, n) => e in t ? ki(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, ke = (t, e, n) => Ci(t, typeof e != "symbol" ? e + "" : e, n), Nn = /* @__PURE__ */ Symbol("wippy:emit"), Dn = /* @__PURE__ */ Symbol("wippy:props"), _i = /* @__PURE__ */ Symbol("wippy:props_error"), Ii = /* @__PURE__ */ Symbol("wippy:content"), Ti = /* @__PURE__ */ Symbol("wippy:panel-id"), Li = /* @__PURE__ */ Symbol("wippy:layout-bus"), Pi = /* @__PURE__ */ Symbol("wippy:host"), Ai = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Ol() {
  const t = Vt(Dn);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function $l() {
  const t = Vt(Nn);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var kl = class extends wi {
  constructor() {
    super(...arguments), ke(this, "_vueApp", null), ke(this, "_propsRef", te({})), ke(this, "_errorsRef", te([])), ke(this, "_contentRef", te(null)), ke(this, "_hostVisibilityRef", te(null)), ke(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, n, r, i, o) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = i ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of r)
      this.emitEvent("invalid", { message: u });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((u, c) => {
      this._propsRef.value = u, this._errorsRef.value = [...c];
      for (const d of c)
        this.emitEvent("invalid", { message: d });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: l.signal });
    const a = (u) => {
      if (l.signal.aborted)
        return;
      const c = Oi(), d = Rr(u.rootComponent);
      this._vueApp = d;
      const p = $i();
      if (u.piniaPlugins)
        for (const h of u.piniaPlugins)
          p.use(h);
      if (d.use(p), u.plugins)
        for (const h of u.plugins)
          d.use(h);
      d.provide(Dn, this._propsRef), d.provide(_i, this._errorsRef), d.provide(Nn, this.emitEvent.bind(this)), d.provide(Ii, this._contentRef), d.provide(Ai, this._hostVisibilityRef), d.provide(Ti, xi(this)), d.provide(Li, Si(this)), d.provide(Pi, jn(this)), u.providers && u.providers(d, this), d.mount(e), c && Fn(c);
    };
    if (s.rootComponent)
      a(s);
    else if (s.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), e.appendChild(u), s.lazyConfig().then((c) => {
        l.signal.aborted || (u.remove(), a(c));
      }).catch((c) => {
        if (l.signal.aborted)
          return;
        const d = c instanceof Error ? c.message : String(c), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", d), u.replaceWith(p), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Ei = Object.defineProperty, Yt = Object.getOwnPropertySymbols, Vi = Object.prototype.hasOwnProperty, ji = Object.prototype.propertyIsEnumerable, Zt = (t, e, n) => e in t ? Ei(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, zi = (t, e) => {
  for (var n in e || (e = {})) Vi.call(e, n) && Zt(t, n, e[n]);
  if (Yt) for (var n of Yt(e)) ji.call(e, n) && Zt(t, n, e[n]);
  return t;
};
function qe(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function yt(t, e, n = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || n.has(t) || n.has(e)) return !1;
  n.add(t).add(e);
  let r = Array.isArray(t), i = Array.isArray(e), o, s, l;
  if (r && i) {
    if (s = t.length, s != e.length) return !1;
    for (o = s; o-- !== 0; ) if (!yt(t[o], e[o], n)) return !1;
    return !0;
  }
  if (r != i) return !1;
  let a = t instanceof Date, u = e instanceof Date;
  if (a != u) return !1;
  if (a && u) return t.getTime() == e.getTime();
  let c = t instanceof RegExp, d = e instanceof RegExp;
  if (c != d) return !1;
  if (c && d) return t.toString() == e.toString();
  let p = Object.keys(t);
  if (s = p.length, s !== Object.keys(e).length) return !1;
  for (o = s; o-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(e, p[o])) return !1;
  for (o = s; o-- !== 0; ) if (l = p[o], !yt(t[l], e[l], n)) return !1;
  return !0;
}
function Fi(t, e) {
  return yt(t, e);
}
function lt(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function P(t) {
  return !qe(t);
}
function ue(t, e) {
  if (!t || !e) return null;
  try {
    let n = t[e];
    if (P(n)) return n;
  } catch {
  }
  if (Object.keys(t).length) {
    if (lt(e)) return e(t);
    if (e.indexOf(".") === -1) return t[e];
    {
      let n = e.split("."), r = t;
      for (let i = 0, o = n.length; i < o; ++i) {
        if (r == null) return null;
        r = r[n[i]];
      }
      return r;
    }
  }
  return null;
}
function Rn(t, e, n) {
  return n ? ue(t, n) === ue(e, n) : Fi(t, e);
}
function ae(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function Bn(t = {}, e = {}) {
  let n = zi({}, t);
  return Object.keys(e).forEach((r) => {
    let i = r;
    ae(e[i]) && i in t && ae(t[i]) ? n[i] = Bn(t[i], e[i]) : n[i] = e[i];
  }), n;
}
function Mi(...t) {
  return t.reduce((e, n, r) => r === 0 ? n : Bn(e, n), {});
}
function Jt(t, e) {
  let n = -1;
  if (P(t)) try {
    n = t.findLastIndex(e);
  } catch {
    n = t.lastIndexOf([...t].reverse().find(e));
  }
  return n;
}
function q(t, ...e) {
  return lt(t) ? t(...e) : t;
}
function U(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function oe(t) {
  return U(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function jt(t, e = "", n = {}) {
  let r = oe(e).split("."), i = r.shift();
  if (i) {
    if (ae(t)) {
      let o = Object.keys(t).find((s) => oe(s) === i) || "";
      return jt(q(t[o], n), r.join("."), n);
    }
    return;
  }
  return q(t, n);
}
function Hn(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function Ni(t) {
  return P(t) && !isNaN(t);
}
function Di(t = "") {
  return P(t) && t.length === 1 && !!t.match(/\S| /);
}
function Se(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function Ri(...t) {
  return Mi(...t);
}
function je(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function J(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in e) t = t.replace(e[n], n);
  }
  return t;
}
function Bi(t) {
  return U(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function Kn(t) {
  return U(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function zt() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, n) {
    let r = t.get(e);
    return r ? r.push(n) : r = [n], t.set(e, r), this;
  }, off(e, n) {
    let r = t.get(e);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(e, n) {
    let r = t.get(e);
    r && r.forEach((i) => {
      i(n);
    });
  }, clear() {
    t.clear();
  } };
}
function _e(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let r = t[n];
      if (!r) continue;
      let i = typeof r;
      if (i === "string" || i === "number") e.push(r);
      else if (i === "object") {
        let o = Array.isArray(r) ? [_e(...r)] : Object.entries(r).map(([s, l]) => l ? s : void 0);
        e = o.length ? e.concat(o.filter((s) => !!s)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function Hi(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function Ki(t, e) {
  if (t && e) {
    let n = (r) => {
      Hi(t, r) || (t.classList ? t.classList.add(r) : t.className += " " + r);
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function pt(t, e) {
  if (t && e) {
    let n = (r) => {
      t.classList ? t.classList.remove(r) : t.className = t.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function bt(t) {
  for (let e of document?.styleSheets) try {
    for (let n of e?.cssRules) for (let r of n?.style) if (t.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function Un(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [n, r] = [t.style.visibility, t.style.display], i = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = i.width || t.offsetWidth, e.height = i.height || t.offsetHeight, t.style.display = r, t.style.visibility = n;
  }
  return e;
}
function Wn() {
  let t = window, e = document, n = e.documentElement, r = e.getElementsByTagName("body")[0], i = t.innerWidth || n.clientWidth || r.clientWidth, o = t.innerHeight || n.clientHeight || r.clientHeight;
  return { width: i, height: o };
}
function wt(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function Ui() {
  let t = document.documentElement;
  return (window.pageXOffset || wt(t)) - (t.clientLeft || 0);
}
function Wi() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function Gi(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function qi(t, e, n = !0) {
  var r, i, o, s;
  if (t) {
    let l = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Un(t), a = l.height, u = l.width, c = e.offsetHeight, d = e.offsetWidth, p = e.getBoundingClientRect(), h = Wi(), m = Ui(), v = Wn(), g, y, w = "top";
    p.top + c + a > v.height ? (g = p.top + h - a, w = "bottom", g < 0 && (g = h)) : g = c + p.top + h, p.left + u > v.width ? y = Math.max(0, p.left + m + d - u) : y = p.left + m, Gi(t) ? t.style.insetInlineEnd = y + "px" : t.style.insetInlineStart = y + "px", t.style.top = g + "px", t.style.transformOrigin = w, n && (t.style.marginTop = w === "bottom" ? `calc(${(i = (r = bt(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? i : "2px"} * -1)` : (s = (o = bt(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? s : "");
  }
}
function Yi(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([n, r]) => t.style[n] = r));
}
function Gn(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function Zi(t, e, n = !0, r = void 0) {
  var i;
  if (t) {
    let o = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Un(t), s = e.offsetHeight, l = e.getBoundingClientRect(), a = Wn(), u, c, d = r ?? "top";
    if (!r && l.top + s + o.height > a.height ? (u = -1 * o.height, d = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = s, o.width > a.width ? c = l.left * -1 : l.left + o.width > a.width ? c = (l.left + o.width - a.width) * -1 : c = 0, t.style.top = u + "px", t.style.insetInlineStart = c + "px", t.style.transformOrigin = d, n) {
      let p = (i = bt(/-anchor-gutter$/)) == null ? void 0 : i.value;
      t.style.marginTop = d === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function qn(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function Ji(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && qn(t));
}
function Le(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function rt(t, e = {}) {
  if (Le(t)) {
    let n = (r, i) => {
      var o, s;
      let l = (o = t?.$attrs) != null && o[r] ? [(s = t?.$attrs) == null ? void 0 : s[r]] : [];
      return [i].flat().reduce((a, u) => {
        if (u != null) {
          let c = typeof u;
          if (c === "string" || c === "number") a.push(u);
          else if (c === "object") {
            let d = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([p, h]) => r === "style" && (h || h === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${h}` : h ? p : void 0);
            a = d.length ? a.concat(d.filter((p) => !!p)) : a;
          }
        }
        return a;
      }, l);
    };
    Object.entries(e).forEach(([r, i]) => {
      if (i != null) {
        let o = r.match(/^on(.+)/);
        o ? t.addEventListener(o[1].toLowerCase(), i) : r === "p-bind" || r === "pBind" ? rt(t, i) : (i = r === "class" ? [...new Set(n("class", i))].join(" ").trim() : r === "style" ? n("style", i).join(";").trim() : i, (t.$attrs = t.$attrs || {}) && (t.$attrs[r] = i), t.setAttribute(r, i));
      }
    });
  }
}
function Qi(t, e = {}, ...n) {
  {
    let r = document.createElement(t);
    return rt(r, e), r.append(...n), r;
  }
}
function Xi(t, e) {
  return Le(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function ut(t, e) {
  return Le(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function se(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function eo(t, e) {
  if (Le(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Ft(t, e = "") {
  let n = Xi(t, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), r = [];
  for (let i of n) getComputedStyle(i).display != "none" && getComputedStyle(i).visibility != "hidden" && r.push(i);
  return r;
}
function to(t, e) {
  let n = Ft(t, e);
  return n.length > 0 ? n[0] : null;
}
function ye(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function no(t, e) {
  let n = Ft(t, e);
  return n.length > 0 ? n[n.length - 1] : null;
}
function ro(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || wt(document.documentElement) || wt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function io(t, e) {
  return t ? t.offsetHeight : 0;
}
function Yn(t, e = []) {
  let n = qn(t);
  return n === null ? e : Yn(n, e.concat([n]));
}
function oo(t) {
  let e = [];
  if (t) {
    let n = Yn(t), r = /(auto|scroll)/, i = (o) => {
      try {
        let s = window.getComputedStyle(o, null);
        return r.test(s.getPropertyValue("overflow")) || r.test(s.getPropertyValue("overflowX")) || r.test(s.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let o of n) {
      let s = o.nodeType === 1 && o.dataset.scrollselectors;
      if (s) {
        let l = s.split(",");
        for (let a of l) {
          let u = ut(o, a);
          u && i(u) && e.push(u);
        }
      }
      o.nodeType !== 9 && i(o) && e.push(o);
    }
  }
  return e;
}
function be(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function ao() {
  return /(android)/i.test(navigator.userAgent);
}
function Zn() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function it(t) {
  return !!(t && t.offsetParent != null);
}
function so() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function lo(t, e = "", n) {
  Le(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
var Xe = {};
function uo(t = "pui_id_") {
  return Object.hasOwn(Xe, t) || (Xe[t] = 0), Xe[t]++, `${t}${Xe[t]}`;
}
function co() {
  let t = [], e = (s, l, a = 999) => {
    let u = i(s, l, a), c = u.value + (u.key === s ? 0 : a) + 1;
    return t.push({ key: s, value: c }), c;
  }, n = (s) => {
    t = t.filter((l) => l.value !== s);
  }, r = (s, l) => i(s).value, i = (s, l, a = 0) => [...t].reverse().find((u) => !0) || { key: s, value: a }, o = (s) => s && parseInt(s.style.zIndex, 10) || 0;
  return { get: o, set: (s, l, a) => {
    l && (l.style.zIndex = String(e(s, !0, a)));
  }, clear: (s) => {
    s && (n(o(s)), s.style.zIndex = "");
  }, getCurrent: (s) => r(s) };
}
var ft = co(), po = Object.defineProperty, fo = Object.defineProperties, ho = Object.getOwnPropertyDescriptors, ot = Object.getOwnPropertySymbols, Jn = Object.prototype.hasOwnProperty, Qn = Object.prototype.propertyIsEnumerable, Qt = (t, e, n) => e in t ? po(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, ee = (t, e) => {
  for (var n in e || (e = {})) Jn.call(e, n) && Qt(t, n, e[n]);
  if (ot) for (var n of ot(e)) Qn.call(e, n) && Qt(t, n, e[n]);
  return t;
}, ht = (t, e) => fo(t, ho(e)), le = (t, e) => {
  var n = {};
  for (var r in t) Jn.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && ot) for (var r of ot(t)) e.indexOf(r) < 0 && Qn.call(t, r) && (n[r] = t[r]);
  return n;
}, mo = zt(), B = mo, ze = /{([^}]*)}/g, Xn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, er = /var\([^)]+\)/g;
function Xt(t) {
  return U(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function go(t) {
  return ae(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function vo(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function St(t = "", e = "") {
  return vo(`${U(t, !1) && U(e, !1) ? `${t}-` : t}${e}`);
}
function tr(t = "", e = "") {
  return `--${St(t, e)}`;
}
function yo(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function nr(t, e = "", n = "", r = [], i) {
  if (U(t)) {
    let o = t.trim();
    if (yo(o)) return;
    if (Se(o, ze)) {
      let s = o.replaceAll(ze, (l) => {
        let a = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((c) => Se(u, c)));
        return `var(${tr(n, Kn(a.join("-")))}${P(i) ? `, ${i}` : ""})`;
      });
      return Se(s.replace(er, "0"), Xn) ? `calc(${s})` : s;
    }
    return o;
  } else if (Ni(t)) return t;
}
function bo(t, e, n) {
  U(e, !1) && t.push(`${e}:${n};`);
}
function Ce(t, e) {
  return t ? `${t}{${e}}` : "";
}
function rr(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(s, l) {
    let a = [], u = 0, c = "", d = null, p = 0;
    for (; u <= s.length; ) {
      let h = s[u];
      if ((h === '"' || h === "'" || h === "`") && s[u - 1] !== "\\" && (d = d === h ? null : h), !d && (h === "(" && p++, h === ")" && p--, (h === "," || u === s.length) && p === 0)) {
        let m = c.trim();
        m.startsWith("dt(") ? a.push(rr(m, l)) : a.push(r(m)), c = "", u++;
        continue;
      }
      h !== void 0 && (c += h), u++;
    }
    return a;
  }
  function r(s) {
    let l = s[0];
    if ((l === '"' || l === "'" || l === "`") && s[s.length - 1] === l) return s.slice(1, -1);
    let a = Number(s);
    return isNaN(a) ? s : a;
  }
  let i = [], o = [];
  for (let s = 0; s < t.length; s++) if (t[s] === "d" && t.slice(s, s + 3) === "dt(") o.push(s), s += 2;
  else if (t[s] === ")" && o.length > 0) {
    let l = o.pop();
    o.length === 0 && i.push([l, s]);
  }
  if (!i.length) return t;
  for (let s = i.length - 1; s >= 0; s--) {
    let [l, a] = i[s], u = t.slice(l + 3, a), c = n(u, e), d = e(...c);
    t = t.slice(0, l) + d + t.slice(a + 1);
  }
  return t;
}
var xe = (...t) => wo(A.getTheme(), ...t), wo = (t = {}, e, n, r) => {
  if (e) {
    let { variable: i, options: o } = A.defaults || {}, { prefix: s, transform: l } = t?.options || o || {}, a = Se(e, ze) ? e : `{${e}}`;
    return r === "value" || qe(r) && l === "strict" ? A.getTokenValue(e) : nr(a, void 0, s, [i.excludedKeyRegex], n);
  }
  return "";
};
function et(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((r, i, o) => {
      var s;
      return r + i + ((s = q(e[o], { dt: xe })) != null ? s : "");
    }, "");
    return rr(n, xe);
  }
  return q(t, { dt: xe });
}
function So(t, e = {}) {
  let n = A.defaults.variable, { prefix: r = n.prefix, selector: i = n.selector, excludedKeyRegex: o = n.excludedKeyRegex } = e, s = [], l = [], a = [{ node: t, path: r }];
  for (; a.length; ) {
    let { node: c, path: d } = a.pop();
    for (let p in c) {
      let h = c[p], m = go(h), v = Se(p, o) ? St(d) : St(d, Kn(p));
      if (ae(m)) a.push({ node: m, path: v });
      else {
        let g = tr(v), y = nr(m, v, r, [o]);
        bo(l, g, y);
        let w = v;
        r && w.startsWith(r + "-") && (w = w.slice(r.length + 1)), s.push(w.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: s, declarations: u, css: Ce(i, u) };
}
var Q = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
  return { type: "class", selector: t, matched: this.pattern.test(t.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(t) {
  return { type: "attr", selector: `:root${t},:host${t}`, matched: this.pattern.test(t.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(t) {
  return { type: "media", selector: t, matched: this.pattern.test(t.trim()) };
} }, system: { pattern: /^system$/, resolve(t) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(t.trim()) };
} }, custom: { resolve(t) {
  return { type: "custom", selector: t, matched: !0 };
} } }, resolve(t) {
  let e = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [t].flat().map((n) => {
    var r;
    return (r = e.map((i) => i.resolve(n)).find((i) => i.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(t, e) {
  return So(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: r, defaults: i }) {
  var o, s, l, a, u, c, d;
  let { preset: p, options: h } = e, m, v, g, y, w, $, f;
  if (P(p) && h.transform !== "strict") {
    let { primitive: b, semantic: x, extend: S } = p, I = x || {}, { colorScheme: M } = I, N = le(I, ["colorScheme"]), V = S || {}, { colorScheme: F } = V, W = le(V, ["colorScheme"]), G = M || {}, { dark: D } = G, K = le(G, ["dark"]), Y = F || {}, { dark: ce } = Y, ne = le(Y, ["dark"]), Z = P(b) ? this._toVariables({ primitive: b }, h) : {}, re = P(N) ? this._toVariables({ semantic: N }, h) : {}, he = P(K) ? this._toVariables({ light: K }, h) : {}, Ze = P(D) ? this._toVariables({ dark: D }, h) : {}, Oe = P(W) ? this._toVariables({ semantic: W }, h) : {}, Bt = P(ne) ? this._toVariables({ light: ne }, h) : {}, Ht = P(ce) ? this._toVariables({ dark: ce }, h) : {}, [wr, Sr] = [(o = Z.declarations) != null ? o : "", Z.tokens], [xr, Or] = [(s = re.declarations) != null ? s : "", re.tokens || []], [$r, kr] = [(l = he.declarations) != null ? l : "", he.tokens || []], [Cr, _r] = [(a = Ze.declarations) != null ? a : "", Ze.tokens || []], [Ir, Tr] = [(u = Oe.declarations) != null ? u : "", Oe.tokens || []], [Lr, Pr] = [(c = Bt.declarations) != null ? c : "", Bt.tokens || []], [Ar, Er] = [(d = Ht.declarations) != null ? d : "", Ht.tokens || []];
    m = this.transformCSS(t, wr, "light", "variable", h, r, i), v = Sr;
    let Vr = this.transformCSS(t, `${xr}${$r}`, "light", "variable", h, r, i), jr = this.transformCSS(t, `${Cr}`, "dark", "variable", h, r, i);
    g = `${Vr}${jr}`, y = [.../* @__PURE__ */ new Set([...Or, ...kr, ..._r])];
    let zr = this.transformCSS(t, `${Ir}${Lr}color-scheme:light`, "light", "variable", h, r, i), Fr = this.transformCSS(t, `${Ar}color-scheme:dark`, "dark", "variable", h, r, i);
    w = `${zr}${Fr}`, $ = [.../* @__PURE__ */ new Set([...Tr, ...Pr, ...Er])], f = q(p.css, { dt: xe });
  }
  return { primitive: { css: m, tokens: v }, semantic: { css: g, tokens: y }, global: { css: w, tokens: $ }, style: f };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: r, set: i, defaults: o, selector: s }) {
  var l, a, u;
  let c, d, p;
  if (P(e) && n.transform !== "strict") {
    let h = t.replace("-directive", ""), m = e, { colorScheme: v, extend: g, css: y } = m, w = le(m, ["colorScheme", "extend", "css"]), $ = g || {}, { colorScheme: f } = $, b = le($, ["colorScheme"]), x = v || {}, { dark: S } = x, I = le(x, ["dark"]), M = f || {}, { dark: N } = M, V = le(M, ["dark"]), F = P(w) ? this._toVariables({ [h]: ee(ee({}, w), b) }, n) : {}, W = P(I) ? this._toVariables({ [h]: ee(ee({}, I), V) }, n) : {}, G = P(S) ? this._toVariables({ [h]: ee(ee({}, S), N) }, n) : {}, [D, K] = [(l = F.declarations) != null ? l : "", F.tokens || []], [Y, ce] = [(a = W.declarations) != null ? a : "", W.tokens || []], [ne, Z] = [(u = G.declarations) != null ? u : "", G.tokens || []], re = this.transformCSS(h, `${D}${Y}`, "light", "variable", n, i, o, s), he = this.transformCSS(h, ne, "dark", "variable", n, i, o, s);
    c = `${re}${he}`, d = [.../* @__PURE__ */ new Set([...K, ...ce, ...Z])], p = q(y, { dt: xe });
  }
  return { css: c, tokens: d, style: p };
}, getPresetC({ name: t = "", theme: e = {}, params: n, set: r, defaults: i }) {
  var o;
  let { preset: s, options: l } = e, a = (o = s?.components) == null ? void 0 : o[t];
  return this.getPreset({ name: t, preset: a, options: l, params: n, set: r, defaults: i });
}, getPresetD({ name: t = "", theme: e = {}, params: n, set: r, defaults: i }) {
  var o, s;
  let l = t.replace("-directive", ""), { preset: a, options: u } = e, c = ((o = a?.components) == null ? void 0 : o[l]) || ((s = a?.directives) == null ? void 0 : s[l]);
  return this.getPreset({ name: l, preset: c, options: u, params: n, set: r, defaults: i });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var n;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (n = t.darkModeSelector) != null ? n : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, n, r) {
  let { cssLayer: i } = e;
  return i ? `@layer ${q(i.order || i.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: i, defaults: o }) {
  let s = this.getCommon({ name: t, theme: e, params: n, set: i, defaults: o }), l = Object.entries(r).reduce((a, [u, c]) => a.push(`${u}="${c}"`) && a, []).join(" ");
  return Object.entries(s || {}).reduce((a, [u, c]) => {
    if (ae(c) && Object.hasOwn(c, "css")) {
      let d = je(c.css), p = `${u}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${p}" ${l}>${d}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: i, defaults: o }) {
  var s;
  let l = { name: t, theme: e, params: n, set: i, defaults: o }, a = (s = t.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, u = Object.entries(r).reduce((c, [d, p]) => c.push(`${d}="${p}"`) && c, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${u}>${je(a)}</style>` : "";
}, createTokens(t = {}, e, n = "", r = "", i = {}) {
  let o = function(l, a = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: a, value: void 0 };
    u.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && ze.test(this.value)) {
      let d = this.value.trim().replace(ze, (p) => {
        var h;
        let m = p.slice(1, -1), v = this.tokens[m];
        if (!v) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let g = v.computed(l, a, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (h = g?.value) != null ? h : "__UNRESOLVED__";
      });
      c = Xn.test(d.replace(er, "0")) ? `calc(${d})` : d;
    }
    return qe(a.binding) && delete a.binding, u.pop(), { colorScheme: l, path: this.path, paths: a, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, s = (l, a, u) => {
    Object.entries(l).forEach(([c, d]) => {
      let p = Se(c, e.variable.excludedKeyRegex) ? a : a ? `${a}.${Xt(c)}` : Xt(c), h = u ? `${u}.${c}` : c;
      ae(d) ? s(d, p, h) : (i[p] || (i[p] = { paths: [], computed: (m, v = {}, g = []) => {
        if (i[p].paths.length === 1) return i[p].paths[0].computed(i[p].paths[0].scheme, v.binding, g);
        if (m && m !== "none") for (let y = 0; y < i[p].paths.length; y++) {
          let w = i[p].paths[y];
          if (w.scheme === m) return w.computed(m, v.binding, g);
        }
        return i[p].paths.map((y) => y.computed(y.scheme, v[y.scheme], g));
      } }), i[p].paths.push({ path: h, value: d, scheme: h.includes("colorScheme.light") ? "light" : h.includes("colorScheme.dark") ? "dark" : "none", computed: o, tokens: i }));
    });
  };
  return s(t, n, r), i;
}, getTokenValue(t, e, n) {
  var r;
  let i = ((l) => l.split(".").filter((a) => !Se(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), o = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = t[i]) == null ? void 0 : r.computed(o)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, a) => {
    let u = a, { colorScheme: c } = u, d = le(u, ["colorScheme"]);
    return l[c] = d, l;
  }, void 0);
}, getSelectorRule(t, e, n, r) {
  return n === "class" || n === "attr" ? Ce(P(e) ? `${t}${e},${t} ${e}` : t, r) : Ce(t, Ce(e ?? ":root,:host", r));
}, transformCSS(t, e, n, r, i = {}, o, s, l) {
  if (P(e)) {
    let { cssLayer: a } = i;
    if (r !== "style") {
      let u = this.getColorSchemeOption(i, s);
      e = n === "dark" ? u.reduce((c, { type: d, selector: p }) => (P(p) && (c += p.includes("[CSS]") ? p.replace("[CSS]", e) : this.getSelectorRule(p, l, d, e)), c), "") : Ce(l ?? ":root,:host", e);
    }
    if (a) {
      let u = { name: "primeui" };
      ae(a) && (u.name = q(a.name, { name: t, type: r })), P(u.name) && (e = Ce(`@layer ${u.name}`, e), o?.layerNames(u.name));
    }
    return e;
  }
  return "";
} }, A = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = ht(ee({}, e), { options: ee(ee({}, this.defaults.options), e.options) }), this._tokens = Q.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.preset) || {};
}, get options() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(t) {
  this.update({ theme: t }), B.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = ht(ee({}, this.theme), { preset: t }), this._tokens = Q.createTokens(t, this.defaults), this.clearLoadedStyleNames(), B.emit("preset:change", t), B.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = ht(ee({}, this.theme), { options: t }), this.clearLoadedStyleNames(), B.emit("options:change", t), B.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(t) {
  this._layerNames.add(t);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(t) {
  return this._loadedStyleNames.has(t);
}, setLoadedStyleName(t) {
  this._loadedStyleNames.add(t);
}, deleteLoadedStyleName(t) {
  this._loadedStyleNames.delete(t);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(t) {
  return Q.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return Q.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Q.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Q.getPresetD(n);
}, getCustomPreset(t = "", e, n, r) {
  let i = { name: t, preset: e, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Q.getPreset(i);
}, getLayerOrderCSS(t = "") {
  return Q.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", r) {
  return Q.transformCSS(t, e, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return Q.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return Q.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), B.emit(`theme:${e}:load`, t), !this._loadingStyles.size && B.emit("theme:load"));
} }, H = {
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
function en(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = xo(t)) || e) {
      n && (t = n);
      var r = 0, i = function() {
      };
      return { s: i, n: function() {
        return r >= t.length ? { done: !0 } : { done: !1, value: t[r++] };
      }, e: function(u) {
        throw u;
      }, f: i };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, s = !0, l = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var u = n.next();
    return s = u.done, u;
  }, e: function(u) {
    l = !0, o = u;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (l) throw o;
    }
  } };
}
function xo(t, e) {
  if (t) {
    if (typeof t == "string") return tn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? tn(t, e) : void 0;
  }
}
function tn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var Oo = {
  filter: function(e, n, r, i, o) {
    var s = [];
    if (!e)
      return s;
    var l = en(e), a;
    try {
      for (l.s(); !(a = l.n()).done; ) {
        var u = a.value;
        if (typeof u == "string") {
          if (this.filters[i](u, r, o)) {
            s.push(u);
            continue;
          }
        } else {
          var c = en(n), d;
          try {
            for (c.s(); !(d = c.n()).done; ) {
              var p = d.value, h = ue(u, p);
              if (this.filters[i](h, r, o)) {
                s.push(u);
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
    return s;
  },
  filters: {
    startsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = J(n.toString()).toLocaleLowerCase(r), o = J(e.toString()).toLocaleLowerCase(r);
      return o.slice(0, i.length) === i;
    },
    contains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = J(n.toString()).toLocaleLowerCase(r), o = J(e.toString()).toLocaleLowerCase(r);
      return o.indexOf(i) !== -1;
    },
    notContains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = J(n.toString()).toLocaleLowerCase(r), o = J(e.toString()).toLocaleLowerCase(r);
      return o.indexOf(i) === -1;
    },
    endsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = J(n.toString()).toLocaleLowerCase(r), o = J(e.toString()).toLocaleLowerCase(r);
      return o.indexOf(i, o.length - i.length) !== -1;
    },
    equals: function(e, n, r) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : J(e.toString()).toLocaleLowerCase(r) == J(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(e, n, r) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : J(e.toString()).toLocaleLowerCase(r) != J(n.toString()).toLocaleLowerCase(r);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (Rn(e, n[r]))
          return !0;
      return !1;
    },
    between: function(e, n) {
      return n == null || n[0] == null || n[1] == null ? !0 : e == null ? !1 : e.getTime ? n[0].getTime() <= e.getTime() && e.getTime() <= n[1].getTime() : n[0] <= e && e <= n[1];
    },
    lt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() < n.getTime() : e < n;
    },
    lte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() <= n.getTime() : e <= n;
    },
    gt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() > n.getTime() : e > n;
    },
    gte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() >= n.getTime() : e >= n;
    },
    dateIs: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() === n.toDateString());
    },
    dateIsNot: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() !== n.toDateString());
    },
    dateBefore: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() < n.getTime());
    },
    dateAfter: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() > n.getTime());
    }
  },
  register: function(e, n) {
    this.filters[e] = n;
  }
}, $o = `
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
function Fe(t) {
  "@babel/helpers - typeof";
  return Fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Fe(t);
}
function nn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function rn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? nn(Object(n), !0).forEach(function(r) {
      ko(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : nn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function ko(t, e, n) {
  return (e = Co(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Co(t) {
  var e = _o(t, "string");
  return Fe(e) == "symbol" ? e : e + "";
}
function _o(t, e) {
  if (Fe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Fe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Io(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Kt() && Kt().components ? Pn(t) : e ? t() : An(t);
}
var To = 0;
function Lo(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = te(!1), r = te(t), i = te(null), o = Zn() ? window.document : void 0, s = e.document, l = s === void 0 ? o : s, a = e.immediate, u = a === void 0 ? !0 : a, c = e.manual, d = c === void 0 ? !1 : c, p = e.name, h = p === void 0 ? "style_".concat(++To) : p, m = e.id, v = m === void 0 ? void 0 : m, g = e.media, y = g === void 0 ? void 0 : g, w = e.nonce, $ = w === void 0 ? void 0 : w, f = e.first, b = f === void 0 ? !1 : f, x = e.onMounted, S = x === void 0 ? void 0 : x, I = e.onUpdated, M = I === void 0 ? void 0 : I, N = e.onLoad, V = N === void 0 ? void 0 : N, F = e.props, W = F === void 0 ? {} : F, G = function() {
  }, D = function(ce) {
    var ne = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var Z = rn(rn({}, W), ne), re = Z.name || h, he = Z.id || v, Ze = Z.nonce || $;
      i.value = l.querySelector('style[data-primevue-style-id="'.concat(re, '"]')) || l.getElementById(he) || l.createElement("style"), i.value.isConnected || (r.value = ce || t, rt(i.value, {
        type: "text/css",
        id: he,
        media: y,
        nonce: Ze
      }), b ? l.head.prepend(i.value) : l.head.appendChild(i.value), lo(i.value, "data-primevue-style-id", re), rt(i.value, Z), i.value.onload = function(Oe) {
        return V?.(Oe, {
          name: re
        });
      }, S?.(re)), !n.value && (G = we(r, function(Oe) {
        i.value.textContent = Oe, M?.(re);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, K = function() {
    !l || !n.value || (G(), Ji(i.value) && l.head.removeChild(i.value), n.value = !1, i.value = null);
  };
  return u && !d && Io(D), {
    id: v,
    name: h,
    el: i,
    css: r,
    unload: K,
    load: D,
    isLoaded: Br(n)
  };
}
function Me(t) {
  "@babel/helpers - typeof";
  return Me = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Me(t);
}
var on, an, sn, ln;
function un(t, e) {
  return Vo(t) || Eo(t, e) || Ao(t, e) || Po();
}
function Po() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ao(t, e) {
  if (t) {
    if (typeof t == "string") return cn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? cn(t, e) : void 0;
  }
}
function cn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Eo(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, o, s, l = [], a = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e !== 0) for (; !(a = (r = o.call(n)).done) && (l.push(r.value), l.length !== e); a = !0) ;
    } catch (c) {
      u = !0, i = c;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw i;
      }
    }
    return l;
  }
}
function Vo(t) {
  if (Array.isArray(t)) return t;
}
function dn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function mt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? dn(Object(n), !0).forEach(function(r) {
      jo(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : dn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function jo(t, e, n) {
  return (e = zo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function zo(t) {
  var e = Fo(t, "string");
  return Me(e) == "symbol" ? e : e + "";
}
function Fo(t, e) {
  if (Me(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Me(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function tt(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var Mo = function(e) {
  var n = e.dt;
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
}, No = {}, Do = {}, E = {
  name: "base",
  css: Mo,
  style: $o,
  classes: No,
  inlineStyles: Do,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(o) {
      return o;
    }, i = r(et(on || (on = tt(["", ""])), e));
    return P(i) ? Lo(je(i), mt({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, e);
  },
  loadStyle: function() {
    var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return A.transformCSS(n.name || e.name, "".concat(i).concat(et(an || (an = tt(["", ""])), r)));
    });
  },
  getCommonTheme: function(e) {
    return A.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return A.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return A.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, r) {
    return A.getCustomPreset(this.name, e, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return A.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = q(this.css, {
        dt: xe
      }) || "", i = je(et(sn || (sn = tt(["", "", ""])), r, e)), o = Object.entries(n).reduce(function(s, l) {
        var a = un(l, 2), u = a[0], c = a[1];
        return s.push("".concat(u, '="').concat(c, '"')) && s;
      }, []).join(" ");
      return P(i) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(o, ">").concat(i, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return A.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [A.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var i = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), o = et(ln || (ln = tt(["", ""])), q(this.style, {
        dt: xe
      })), s = je(A.transformCSS(i, o)), l = Object.entries(n).reduce(function(a, u) {
        var c = un(u, 2), d = c[0], p = c[1];
        return a.push("".concat(d, '="').concat(p, '"')) && a;
      }, []).join(" ");
      P(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(i, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(e) {
    return mt(mt({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, fe = zt();
function Ne(t) {
  "@babel/helpers - typeof";
  return Ne = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ne(t);
}
function pn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function nt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? pn(Object(n), !0).forEach(function(r) {
      Ro(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : pn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Ro(t, e, n) {
  return (e = Bo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Bo(t) {
  var e = Ho(t, "string");
  return Ne(e) == "symbol" ? e : e + "";
}
function Ho(t, e) {
  if (Ne(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Ne(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ko = {
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
    text: [H.STARTS_WITH, H.CONTAINS, H.NOT_CONTAINS, H.ENDS_WITH, H.EQUALS, H.NOT_EQUALS],
    numeric: [H.EQUALS, H.NOT_EQUALS, H.LESS_THAN, H.LESS_THAN_OR_EQUAL_TO, H.GREATER_THAN, H.GREATER_THAN_OR_EQUAL_TO],
    date: [H.DATE_IS, H.DATE_IS_NOT, H.DATE_BEFORE, H.DATE_AFTER]
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
}, Uo = Symbol();
function Wo(t, e) {
  var n = {
    config: Hr(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(Uo, n), Go(), qo(t, n), n;
}
var Ie = [];
function Go() {
  B.clear(), Ie.forEach(function(t) {
    return t?.();
  }), Ie = [];
}
function qo(t, e) {
  var n = te(!1), r = function() {
    var u;
    if (((u = e.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !A.isStyleNameLoaded("common")) {
      var c, d, p = ((c = E.getCommonTheme) === null || c === void 0 ? void 0 : c.call(E)) || {}, h = p.primitive, m = p.semantic, v = p.global, g = p.style, y = {
        nonce: (d = e.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      E.load(h?.css, nt({
        name: "primitive-variables"
      }, y)), E.load(m?.css, nt({
        name: "semantic-variables"
      }, y)), E.load(v?.css, nt({
        name: "global-variables"
      }, y)), E.loadStyle(nt({
        name: "global-style"
      }, y), g), A.setLoadedStyleName("common");
    }
  };
  B.on("theme:change", function(a) {
    n.value || (t.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var i = we(e.config, function(a, u) {
    fe.emit("config:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), o = we(function() {
    return e.config.ripple;
  }, function(a, u) {
    fe.emit("config:ripple:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = we(function() {
    return e.config.theme;
  }, function(a, u) {
    n.value || A.setTheme(a), e.config.unstyled || r(), n.value = !1, fe.emit("config:theme:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = we(function() {
    return e.config.unstyled;
  }, function(a, u) {
    !a && e.config.theme && r(), fe.emit("config:unstyled:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Ie.push(i), Ie.push(o), Ie.push(s), Ie.push(l);
}
var Yo = {
  install: function(e, n) {
    var r = Ri(Ko, n);
    Wo(e, r);
  }
}, Mt = {
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
    this.mounted = Zn();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Zo(t, e, n, r, i, o) {
  return o.inline ? j(t.$slots, "default", {
    key: 0
  }) : i.mounted ? (C(), me(En, {
    key: 1,
    to: n.appendTo
  }, [j(t.$slots, "default")], 8, ["to"])) : X("", !0);
}
Mt.render = Zo;
var pe = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(e) {
    return this._loadedStyleNames.has(e);
  },
  setLoadedStyleName: function(e) {
    this._loadedStyleNames.add(e);
  },
  deleteLoadedStyleName: function(e) {
    this._loadedStyleNames.delete(e);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
};
function Jo() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = Kr();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var fn = E.extend({
  name: "common"
});
function De(t) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, De(t);
}
function Qo(t) {
  return ar(t) || Xo(t) || or(t) || ir();
}
function Xo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ae(t, e) {
  return ar(t) || ea(t, e) || or(t, e) || ir();
}
function ir() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function or(t, e) {
  if (t) {
    if (typeof t == "string") return xt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xt(t, e) : void 0;
  }
}
function xt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function ea(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, o, s, l = [], a = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        a = !1;
      } else for (; !(a = (r = o.call(n)).done) && (l.push(r.value), l.length !== e); a = !0) ;
    } catch (c) {
      u = !0, i = c;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw i;
      }
    }
    return l;
  }
}
function ar(t) {
  if (Array.isArray(t)) return t;
}
function hn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function _(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? hn(Object(n), !0).forEach(function(r) {
      Ve(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : hn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Ve(t, e, n) {
  return (e = ta(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ta(t) {
  var e = na(t, "string");
  return De(e) == "symbol" ? e : e + "";
}
function na(t, e) {
  if (De(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (De(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ye = {
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
      handler: function(e) {
        B.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var r = this;
        B.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return r._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, r, i, o, s, l, a, u, c, d, p = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, h = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, m = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (i = m || h) === null || i === void 0 || (i = i.hooks) === null || i === void 0 || (o = i.onBeforeCreate) === null || o === void 0 || o.call(i);
    var v = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, g = v ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, y = v ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (c = y || g) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (d = c.onBeforeCreate) === null || d === void 0 || d.call(c), this.$attrSelector = Jo(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = ut(Le(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = _({
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
    _hook: function(e) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), r = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), r?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return lt(e) ? e.apply(void 0, r) : O.apply(void 0, r);
    },
    _load: function() {
      pe.isStyleNameLoaded("base") || (E.loadCSS(this.$styleOptions), this._loadGlobalStyles(), pe.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !pe.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (fn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), pe.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      P(e) && E.load(e, _({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!A.isStyleNameLoaded("common")) {
          var r, i, o = ((r = this.$style) === null || r === void 0 || (i = r.getCommonTheme) === null || i === void 0 ? void 0 : i.call(r)) || {}, s = o.primitive, l = o.semantic, a = o.global, u = o.style;
          E.load(s?.css, _({
            name: "primitive-variables"
          }, this.$styleOptions)), E.load(l?.css, _({
            name: "semantic-variables"
          }, this.$styleOptions)), E.load(a?.css, _({
            name: "global-variables"
          }, this.$styleOptions)), E.loadStyle(_({
            name: "global-style"
          }, this.$styleOptions), u), A.setLoadedStyleName("common");
        }
        if (!A.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var c, d, p, h, m = ((c = this.$style) === null || c === void 0 || (d = c.getComponentTheme) === null || d === void 0 ? void 0 : d.call(c)) || {}, v = m.css, g = m.style;
          (p = this.$style) === null || p === void 0 || p.load(v, _({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (h = this.$style) === null || h === void 0 || h.loadStyle(_({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), A.setLoadedStyleName(this.$style.name);
        }
        if (!A.isStyleNameLoaded("layer-order")) {
          var y, w, $ = (y = this.$style) === null || y === void 0 || (w = y.getLayerOrderThemeCSS) === null || w === void 0 ? void 0 : w.call(y);
          E.load($, _({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), A.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, r, i, o = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, s = o.css, l = (i = this.$style) === null || i === void 0 ? void 0 : i.load(s, _({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = l.el;
    },
    _unloadScopedThemeStyles: function() {
      var e;
      (e = this.scopedStyleEl) === null || e === void 0 || (e = e.value) === null || e === void 0 || e.remove();
    },
    _themeChangeListener: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      pe.clearLoadedStyleNames(), B.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      B.off("theme:change", this._loadCoreStyles), B.off("theme:change", this._load), B.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return jt(e, n, r);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(r) && !!i[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, a = l.mergeSections, u = a === void 0 ? !0 : a, c = l.mergeProps, d = c === void 0 ? !1 : c, p = o ? s ? this._useGlobalPT(this._getPTClassValue, r, i) : this._useDefaultPT(this._getPTClassValue, r, i) : void 0, h = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, _(_({}, i), {}, {
        global: p || {}
      })), m = this._getPTDatasets(r);
      return u || !u && h ? d ? this._mergeProps(d, p, h, m) : _(_(_({}, p), h), m) : _(_({}, h), m);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return O(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = "data-pc-", o = r === "root" && P((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return r !== "transition" && _(_({}, r === "root" && _(_(Ve({}, "".concat(i, "name"), oe(o ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), o && Ve({}, "".concat(i, "extend"), oe(this.$.type.name))), {}, Ve({}, "".concat(this.$attrSelector), ""))), {}, Ve({}, "".concat(i, "section"), oe(r)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return U(e) || Hn(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
        var a, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = i ? i(l) : l, d = oe(r), p = oe(n.$name);
        return (a = u ? d !== p ? c?.[d] : void 0 : c?.[d]) !== null && a !== void 0 ? a : c;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: o(e.originalValue),
        value: o(e.value)
      } : o(e, !0);
    },
    _usePT: function(e, n, r, i) {
      var o = function(v) {
        return n(v, r, i);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var s, l = e._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, a = l.mergeSections, u = a === void 0 ? !0 : a, c = l.mergeProps, d = c === void 0 ? !1 : c, p = o(e.originalValue), h = o(e.value);
        return p === void 0 && h === void 0 ? void 0 : U(h) ? h : U(p) ? p : u || !u && h ? d ? this._mergeProps(d, p, h) : _(_({}, p), h) : h;
      }
      return o(e);
    },
    _useGlobalPT: function(e, n, r) {
      return this._usePT(this.globalPT, e, n, r);
    },
    _useDefaultPT: function(e, n, r) {
      return this._usePT(this.defaultPT, e, n, r);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, _(_({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = O(this.$_attrsWithoutPT, this.ptm(n, r));
      return i?.hasOwnProperty("id") && ((e = i.id) !== null && e !== void 0 || (i.id = this.$id)), i;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, _({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, _(_({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var i = this._getOptionValue(this.$style.inlineStyles, e, _(_({}, this.$params), r)), o = this._getOptionValue(fn.inlineStyles, e, _(_({}, this.$params), r));
        return [o, i];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return q(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, _({}, n.$params)) || q(r, _({}, n.$params));
      });
    },
    isUnstyled: function() {
      var e;
      return this.unstyled !== void 0 ? this.unstyled : (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var e, n = Object.keys(((e = this.$.vnode) === null || e === void 0 ? void 0 : e.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(r) {
        var i = Ae(r, 1), o = i[0];
        return n?.includes(o);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return _(_({
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
      var e;
      return {
        nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
      };
    },
    $primevueConfig: function() {
      var e;
      return (e = this.$primevue) === null || e === void 0 ? void 0 : e.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var e = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: e,
          props: e?.$props,
          state: e?.$data,
          attrs: e?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Ae(e, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(e, n) {
        var r = Ae(n, 2), i = r[0], o = r[1], s = i.split(":"), l = Qo(s), a = xt(l).slice(1);
        return a?.reduce(function(u, c, d, p) {
          return !u[c] && (u[c] = d === p.length - 1 ? o : {}), u[c];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Ae(e, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(e, n) {
        var r = Ae(n, 2), i = r[0], o = r[1];
        return e[i] = o, e;
      }, {});
    }
  }
}, ra = `
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
`, ia = E.extend({
  name: "baseicon",
  css: ra
});
function Re(t) {
  "@babel/helpers - typeof";
  return Re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Re(t);
}
function mn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function gn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? mn(Object(n), !0).forEach(function(r) {
      oa(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : mn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function oa(t, e, n) {
  return (e = aa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function aa(t) {
  var e = sa(t, "string");
  return Re(e) == "symbol" ? e : e + "";
}
function sa(t, e) {
  if (Re(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Re(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Pe = {
  name: "BaseIcon",
  extends: Ye,
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
  style: ia,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = qe(this.label);
      return gn(gn({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: e ? void 0 : "img",
        "aria-label": e ? void 0 : this.label,
        "aria-hidden": e
      });
    }
  }
};
function Be(t) {
  "@babel/helpers - typeof";
  return Be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Be(t);
}
function vn(t, e) {
  return da(t) || ca(t, e) || ua(t, e) || la();
}
function la() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ua(t, e) {
  if (t) {
    if (typeof t == "string") return yn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? yn(t, e) : void 0;
  }
}
function yn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function ca(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, o, s, l = [], a = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e !== 0) for (; !(a = (r = o.call(n)).done) && (l.push(r.value), l.length !== e); a = !0) ;
    } catch (c) {
      u = !0, i = c;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw i;
      }
    }
    return l;
  }
}
function da(t) {
  if (Array.isArray(t)) return t;
}
function bn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function T(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? bn(Object(n), !0).forEach(function(r) {
      Ot(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : bn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Ot(t, e, n) {
  return (e = pa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function pa(t) {
  var e = fa(t, "string");
  return Be(e) == "symbol" ? e : e + "";
}
function fa(t, e) {
  if (Be(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Be(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var k = {
  _getMeta: function() {
    return [ae(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], q(ae(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var r, i, o;
    return (r = (e == null || (i = e.instance) === null || i === void 0 ? void 0 : i.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: jt,
  _getPTValue: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var w = k._getOptionValue.apply(k, arguments);
      return U(w) || Hn(w) ? {
        class: w
      } : w;
    }, u = ((e = r.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, c = u.mergeSections, d = c === void 0 ? !0 : c, p = u.mergeProps, h = p === void 0 ? !1 : p, m = l ? k._useDefaultPT(r, r.defaultPT(), a, o, s) : void 0, v = k._usePT(r, k._getPT(i, r.$name), a, o, T(T({}, s), {}, {
      global: m || {}
    })), g = k._getPTDatasets(r, o);
    return d || !d && v ? h ? k._mergeProps(r, h, m, v, g) : T(T(T({}, m), v), g) : T(T({}, v), g);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return T(T({}, n === "root" && Ot({}, "".concat(r, "name"), oe(e.$name))), {}, Ot({}, "".concat(r, "section"), oe(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(s) {
      var l, a = r ? r(s) : s, u = oe(n);
      return (l = a?.[u]) !== null && l !== void 0 ? l : a;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: i(e.originalValue),
      value: i(e.value)
    } : i(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, s = function(g) {
      return r(g, i, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, a = n._usept || ((l = e.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = a.mergeSections, c = u === void 0 ? !0 : u, d = a.mergeProps, p = d === void 0 ? !1 : d, h = s(n.originalValue), m = s(n.value);
      return h === void 0 && m === void 0 ? void 0 : U(m) ? m : U(h) ? h : c || !c && m ? p ? k._mergeProps(e, p, h, m) : T(T({}, h), m) : m;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return k._usePT(e, n, r, i, o);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, o = k._getConfig(r, i), s = {
      nonce: o == null || (e = o.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    k._loadCoreStyles(n, s), k._loadThemeStyles(n, s), k._loadScopedThemeStyles(n, s), k._removeThemeListeners(n), n.$loadStyles = function() {
      return k._loadThemeStyles(n, s);
    }, k._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!pe.isStyleNameLoaded((e = r.$style) === null || e === void 0 ? void 0 : e.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var o;
      E.loadCSS(i), (o = r.$style) === null || o === void 0 || o.loadCSS(i), pe.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, r, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(i != null && i.isUnstyled() || (i == null || (e = i.theme) === null || e === void 0 ? void 0 : e.call(i)) === "none")) {
      if (!A.isStyleNameLoaded("common")) {
        var s, l, a = ((s = i.$style) === null || s === void 0 || (l = s.getCommonTheme) === null || l === void 0 ? void 0 : l.call(s)) || {}, u = a.primitive, c = a.semantic, d = a.global, p = a.style;
        E.load(u?.css, T({
          name: "primitive-variables"
        }, o)), E.load(c?.css, T({
          name: "semantic-variables"
        }, o)), E.load(d?.css, T({
          name: "global-variables"
        }, o)), E.loadStyle(T({
          name: "global-style"
        }, o), p), A.setLoadedStyleName("common");
      }
      if (!A.isStyleNameLoaded((n = i.$style) === null || n === void 0 ? void 0 : n.name) && (r = i.$style) !== null && r !== void 0 && r.name) {
        var h, m, v, g, y = ((h = i.$style) === null || h === void 0 || (m = h.getDirectiveTheme) === null || m === void 0 ? void 0 : m.call(h)) || {}, w = y.css, $ = y.style;
        (v = i.$style) === null || v === void 0 || v.load(w, T({
          name: "".concat(i.$style.name, "-variables")
        }, o)), (g = i.$style) === null || g === void 0 || g.loadStyle(T({
          name: "".concat(i.$style.name, "-style")
        }, o), $), A.setLoadedStyleName(i.$style.name);
      }
      if (!A.isStyleNameLoaded("layer-order")) {
        var f, b, x = (f = i.$style) === null || f === void 0 || (b = f.getLayerOrderThemeCSS) === null || b === void 0 ? void 0 : b.call(f);
        E.load(x, T({
          name: "layer-order",
          first: !0
        }, o)), A.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = e.preset();
    if (r && e.$attrSelector) {
      var i, o, s, l = ((i = e.$style) === null || i === void 0 || (o = i.getPresetTheme) === null || o === void 0 ? void 0 : o.call(i, r, "[".concat(e.$attrSelector, "]"))) || {}, a = l.css, u = (s = e.$style) === null || s === void 0 ? void 0 : s.load(a, T({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    pe.clearLoadedStyleNames(), B.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    B.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, r, i, o, s) {
    var l, a, u = "on".concat(Bi(n)), c = k._getConfig(i, o), d = r?.$instance, p = k._usePT(d, k._getPT(i == null || (l = i.value) === null || l === void 0 ? void 0 : l.pt, e), k._getOptionValue, "hooks.".concat(u)), h = k._useDefaultPT(d, c == null || (a = c.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[e], k._getOptionValue, "hooks.".concat(u)), m = {
      el: r,
      binding: i,
      vnode: o,
      prevVnode: s
    };
    p?.(d, m), h?.(d, m);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), i = 2; i < n; i++)
      r[i - 2] = arguments[i];
    return lt(e) ? e.apply(void 0, r) : O.apply(void 0, r);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, a, u, c, d) {
      var p, h, m, v;
      a._$instances = a._$instances || {};
      var g = k._getConfig(u, c), y = a._$instances[e] || {}, w = qe(y) ? T(T({}, n), n?.methods) : {};
      a._$instances[e] = T(T({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: a,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || a || void 0,
        $style: T({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: g,
        $attrSelector: (p = a.$pd) === null || p === void 0 || (p = p[e]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return k._getPT(g?.pt, void 0, function(f) {
            var b;
            return f == null || (b = f.directives) === null || b === void 0 ? void 0 : b[e];
          });
        },
        isUnstyled: function() {
          var f, b;
          return ((f = a._$instances[e]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.unstyled) !== void 0 ? (b = a._$instances[e]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.unstyled : g?.unstyled;
        },
        theme: function() {
          var f;
          return (f = a._$instances[e]) === null || f === void 0 || (f = f.$primevueConfig) === null || f === void 0 ? void 0 : f.theme;
        },
        preset: function() {
          var f;
          return (f = a._$instances[e]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.dt;
        },
        /* instance's methods */
        ptm: function() {
          var f, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", x = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return k._getPTValue(a._$instances[e], (f = a._$instances[e]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.pt, b, T({}, x));
        },
        ptmo: function() {
          var f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", x = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return k._getPTValue(a._$instances[e], f, b, x, !1);
        },
        cx: function() {
          var f, b, x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (f = a._$instances[e]) !== null && f !== void 0 && f.isUnstyled() ? void 0 : k._getOptionValue((b = a._$instances[e]) === null || b === void 0 || (b = b.$style) === null || b === void 0 ? void 0 : b.classes, x, T({}, S));
        },
        sx: function() {
          var f, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", x = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, S = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return x ? k._getOptionValue((f = a._$instances[e]) === null || f === void 0 || (f = f.$style) === null || f === void 0 ? void 0 : f.inlineStyles, b, T({}, S)) : void 0;
        }
      }, w), a.$instance = a._$instances[e], (h = (m = a.$instance)[l]) === null || h === void 0 || h.call(m, a, u, c, d), a["$".concat(e)] = a.$instance, k._hook(e, l, a, u, c, d), a.$pd || (a.$pd = {}), a.$pd[e] = T(T({}, (v = a.$pd) === null || v === void 0 ? void 0 : v[e]), {}, {
        name: e,
        instance: a._$instances[e]
      });
    }, i = function(l) {
      var a, u, c, d = l._$instances[e], p = d?.watch, h = function(g) {
        var y, w = g.newValue, $ = g.oldValue;
        return p == null || (y = p.config) === null || y === void 0 ? void 0 : y.call(d, w, $);
      }, m = function(g) {
        var y, w = g.newValue, $ = g.oldValue;
        return p == null || (y = p["config.ripple"]) === null || y === void 0 ? void 0 : y.call(d, w, $);
      };
      d.$watchersCallback = {
        config: h,
        "config.ripple": m
      }, p == null || (a = p.config) === null || a === void 0 || a.call(d, d?.$primevueConfig), fe.on("config:change", h), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(d, d == null || (c = d.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), fe.on("config:ripple:change", m);
    }, o = function(l) {
      var a = l._$instances[e].$watchersCallback;
      a && (fe.off("config:change", a.config), fe.off("config:ripple:change", a["config.ripple"]), l._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(l, a, u, c) {
        l.$pd || (l.$pd = {}), l.$pd[e] = {
          name: e,
          attrSelector: uo("pd")
        }, r("created", l, a, u, c);
      },
      beforeMount: function(l, a, u, c) {
        var d;
        k._loadStyles((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance, a, u), r("beforeMount", l, a, u, c), i(l);
      },
      mounted: function(l, a, u, c) {
        var d;
        k._loadStyles((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance, a, u), r("mounted", l, a, u, c);
      },
      beforeUpdate: function(l, a, u, c) {
        r("beforeUpdate", l, a, u, c);
      },
      updated: function(l, a, u, c) {
        var d;
        k._loadStyles((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance, a, u), r("updated", l, a, u, c);
      },
      beforeUnmount: function(l, a, u, c) {
        var d;
        o(l), k._removeThemeListeners((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance), r("beforeUnmount", l, a, u, c);
      },
      unmounted: function(l, a, u, c) {
        var d;
        (d = l.$pd[e]) === null || d === void 0 || (d = d.instance) === null || d === void 0 || (d = d.scopedStyleEl) === null || d === void 0 || (d = d.value) === null || d === void 0 || d.remove(), r("unmounted", l, a, u, c);
      }
    };
  },
  extend: function() {
    var e = k._getMeta.apply(k, arguments), n = vn(e, 2), r = n[0], i = n[1];
    return T({
      extend: function() {
        var s = k._getMeta.apply(k, arguments), l = vn(s, 2), a = l[0], u = l[1];
        return k.extend(a, T(T(T({}, i), i?.methods), u));
      }
    }, k._extend(r, i));
  }
}, ha = `
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
`, ma = {
  root: "p-ink"
}, ga = E.extend({
  name: "ripple-directive",
  style: ha,
  classes: ma
}), va = k.extend({
  style: ga
});
function He(t) {
  "@babel/helpers - typeof";
  return He = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, He(t);
}
function ya(t) {
  return xa(t) || Sa(t) || wa(t) || ba();
}
function ba() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function wa(t, e) {
  if (t) {
    if (typeof t == "string") return $t(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? $t(t, e) : void 0;
  }
}
function Sa(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function xa(t) {
  if (Array.isArray(t)) return $t(t);
}
function $t(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function wn(t, e, n) {
  return (e = Oa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Oa(t) {
  var e = $a(t, "string");
  return He(e) == "symbol" ? e : e + "";
}
function $a(t, e) {
  if (He(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (He(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ka = va.extend("ripple", {
  watch: {
    "config.ripple": function(e) {
      e ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(e) {
    this.remove(e);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(e) {
      e.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(e) {
      e.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(e) {
      var n = this.getInk(e);
      n || (n = Qi("span", wn(wn({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), e.appendChild(n), this.$el = n);
    },
    remove: function(e) {
      var n = this.getInk(e);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(e), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(e) {
      var n = this, r = e.currentTarget, i = this.getInk(r);
      if (!(!i || getComputedStyle(i, null).display === "none")) {
        if (!this.isUnstyled() && pt(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"), !ye(i) && !be(i)) {
          var o = Math.max(Gn(r), io(r));
          i.style.height = o + "px", i.style.width = o + "px";
        }
        var s = ro(r), l = e.pageX - s.left + document.body.scrollTop - be(i) / 2, a = e.pageY - s.top + document.body.scrollLeft - ye(i) / 2;
        i.style.top = a + "px", i.style.left = l + "px", !this.isUnstyled() && Ki(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          i && (!n.isUnstyled() && pt(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && pt(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? ya(e.children).find(function(n) {
        return eo(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function Ke(t) {
  "@babel/helpers - typeof";
  return Ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ke(t);
}
function Ca(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function _a(t, e) {
  for (var n = 0; n < e.length; n++) {
    var r = e[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, Ta(r.key), r);
  }
}
function Ia(t, e, n) {
  return e && _a(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function Ta(t) {
  var e = La(t, "string");
  return Ke(e) == "symbol" ? e : e + "";
}
function La(t, e) {
  if (Ke(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Ke(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var Pa = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Ca(this, t), this.element = e, this.listener = n;
  }
  return Ia(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = oo(this.element);
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
})(), Aa = zt();
const Ea = "data-wippy-overlay-layer";
function sr() {
  return typeof window < "u" && typeof window.document < "u";
}
function lr() {
  return sr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Va() {
  return lr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const ja = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let za = 0;
const at = /* @__PURE__ */ new WeakMap();
function Sn(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Fa(t, e) {
  if (!ja.test(t.className))
    return;
  const n = t.style.cssText;
  Sn(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!at.has(t)) {
    const r = new MutationObserver(() => {
      const i = t.style;
      (i.top !== "auto" || i.left !== "auto" || i.margin !== "0px" || i.getPropertyPriority("top") !== "important" || i.getPropertyPriority("left") !== "important" || i.getPropertyPriority("margin") !== "important" || i.getPropertyPriority("min-width") !== "important" || i.maxWidth !== "stretch" || i.getPropertyPriority("max-width") !== "important") && Sn(t, e);
    });
    r.observe(t, { attributes: !0, attributeFilter: ["style"] }), at.set(t, r);
  }
}
function Nt(t) {
  const e = at.get(t);
  e && (e.disconnect(), at.delete(t));
}
function Ma(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function kt(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const st = /* @__PURE__ */ new Set(), Dt = /* @__PURE__ */ new WeakMap();
let xn = !1, Ct = !1;
function Na() {
  Ct = !1;
  for (const t of st) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && Nt(e);
      st.delete(t), Dt.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && kt(t);
  }
}
function On() {
  Ct || (Ct = !0, requestAnimationFrame(Na));
}
function Da(t) {
  const e = document.createElement("div");
  e.setAttribute(Ea, "");
  const n = lr();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  kt(e);
  const r = new MutationObserver((i) => {
    const o = e.__wippyAnchorName;
    for (const s of i) {
      if (o)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && Fa(l, o);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && Nt(l);
    }
    e.isConnected && e.childElementCount > 0 && kt(e);
  });
  return r.observe(e, { childList: !0 }), Dt.set(e, r), st.add(e), xn || (xn = !0, window.addEventListener("scroll", On, { capture: !0, passive: !0 }), window.addEventListener("resize", On, { passive: !0 })), e;
}
function $n(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Da(t.hostRoot), Va())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++za}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function kn(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && Nt(e);
    st.delete(t.layer), Dt.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let Cn = !1;
function Ra() {
  if (Cn)
    return;
  Cn = !0;
  const t = Mt;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    sr() && (this.hostRoot = Ma(this.$el), this.mounted = !0, this.hostRoot && (this.inline || $n(this), this.$watch("inline", (e) => {
      e ? kn(this) : $n(this);
    })));
  }, t.render = function() {
    return this.inline ? j(this.$slots, "default", { key: 0 }) : this.mounted ? Ur(En, { key: 1, to: this.resolvedTarget || document.body }, [
      j(this.$slots, "default")
    ]) : X("", !0);
  }, t.unmounted = function() {
    kn(this);
  };
}
const Cl = {
  install: (t) => {
    Ra(), t.use(Yo, { theme: "none" });
  }
};
var ur = {
  name: "BlankIcon",
  extends: Pe
};
function Ba(t) {
  return Wa(t) || Ua(t) || Ka(t) || Ha();
}
function Ha() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ka(t, e) {
  if (t) {
    if (typeof t == "string") return _t(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _t(t, e) : void 0;
  }
}
function Ua(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Wa(t) {
  if (Array.isArray(t)) return _t(t);
}
function _t(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Ga(t, e, n, r, i, o) {
  return C(), L("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ba(e[0] || (e[0] = [R("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
ur.render = Ga;
var cr = {
  name: "CheckIcon",
  extends: Pe
};
function qa(t) {
  return Qa(t) || Ja(t) || Za(t) || Ya();
}
function Ya() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Za(t, e) {
  if (t) {
    if (typeof t == "string") return It(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? It(t, e) : void 0;
  }
}
function Ja(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Qa(t) {
  if (Array.isArray(t)) return It(t);
}
function It(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Xa(t, e, n, r, i, o) {
  return C(), L("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), qa(e[0] || (e[0] = [R("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
cr.render = Xa;
var dr = {
  name: "ChevronDownIcon",
  extends: Pe
};
function es(t) {
  return is(t) || rs(t) || ns(t) || ts();
}
function ts() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ns(t, e) {
  if (t) {
    if (typeof t == "string") return Tt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Tt(t, e) : void 0;
  }
}
function rs(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function is(t) {
  if (Array.isArray(t)) return Tt(t);
}
function Tt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function os(t, e, n, r, i, o) {
  return C(), L("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), es(e[0] || (e[0] = [R("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
dr.render = os;
var pr = {
  name: "SearchIcon",
  extends: Pe
};
function as(t) {
  return cs(t) || us(t) || ls(t) || ss();
}
function ss() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ls(t, e) {
  if (t) {
    if (typeof t == "string") return Lt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Lt(t, e) : void 0;
  }
}
function us(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function cs(t) {
  if (Array.isArray(t)) return Lt(t);
}
function Lt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function ds(t, e, n, r, i, o) {
  return C(), L("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), as(e[0] || (e[0] = [R("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
pr.render = ds;
var Rt = {
  name: "SpinnerIcon",
  extends: Pe
};
function ps(t) {
  return gs(t) || ms(t) || hs(t) || fs();
}
function fs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hs(t, e) {
  if (t) {
    if (typeof t == "string") return Pt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pt(t, e) : void 0;
  }
}
function ms(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function gs(t) {
  if (Array.isArray(t)) return Pt(t);
}
function Pt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function vs(t, e, n, r, i, o) {
  return C(), L("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ps(e[0] || (e[0] = [R("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Rt.render = vs;
var fr = {
  name: "TimesIcon",
  extends: Pe
};
function ys(t) {
  return xs(t) || Ss(t) || ws(t) || bs();
}
function bs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ws(t, e) {
  if (t) {
    if (typeof t == "string") return At(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? At(t, e) : void 0;
  }
}
function Ss(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function xs(t) {
  if (Array.isArray(t)) return At(t);
}
function At(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Os(t, e, n, r, i, o) {
  return C(), L("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ys(e[0] || (e[0] = [R("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
fr.render = Os;
var $s = `
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
`, ks = {
  root: "p-iconfield"
}, Cs = E.extend({
  name: "iconfield",
  style: $s,
  classes: ks
}), _s = {
  name: "BaseIconField",
  extends: Ye,
  style: Cs,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, hr = {
  name: "IconField",
  extends: _s,
  inheritAttrs: !1
};
function Is(t, e, n, r, i, o) {
  return C(), L("div", O({
    class: t.cx("root")
  }, t.ptmi("root")), [j(t.$slots, "default")], 16);
}
hr.render = Is;
var Ts = {
  root: "p-inputicon"
}, Ls = E.extend({
  name: "inputicon",
  classes: Ts
}), Ps = {
  name: "BaseInputIcon",
  extends: Ye,
  style: Ls,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, mr = {
  name: "InputIcon",
  extends: Ps,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function As(t, e, n, r, i, o) {
  return C(), L("span", O({
    class: o.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [j(t.$slots, "default")], 16);
}
mr.render = As;
var Es = {
  name: "BaseEditableHolder",
  extends: Ye,
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
      handler: function(e) {
        this.d_value = e;
      }
    },
    defaultValue: function(e) {
      this.d_value = e;
    },
    $formName: {
      immediate: !0,
      handler: function(e) {
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, this.$formName, e)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(e) {
        this.d_value !== e && (this.d_value = e);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(e) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && e !== this.d_value && (this.d_value = e);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(e, n) {
      var r, i;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (r = (i = this.formField).onChange) === null || r === void 0 || r.call(i, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
        n[r] = arguments[r];
      return n.find(P);
    }
  },
  computed: {
    $filled: function() {
      return P(this.d_value);
    },
    $invalid: function() {
      var e, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var e;
      return this.$formNovalidate ? void 0 : this.name || ((e = this.$formControl) === null || e === void 0 ? void 0 : e.name);
    },
    $formControl: function() {
      var e;
      return this.formControl || ((e = this.$pcFormField) === null || e === void 0 ? void 0 : e.formControl);
    },
    $formNovalidate: function() {
      var e;
      return (e = this.$formControl) === null || e === void 0 ? void 0 : e.novalidate;
    },
    $formDefaultValue: function() {
      var e, n;
      return this.findNonEmpty(this.d_value, (e = this.$pcFormField) === null || e === void 0 ? void 0 : e.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var e, n;
      return this.findNonEmpty((e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, gr = {
  name: "BaseInput",
  extends: Es,
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
      var e;
      return (e = this.variant) !== null && e !== void 0 ? e : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var e;
      return (e = this.fluid) !== null && e !== void 0 ? e : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, Vs = `
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
`, js = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": r.size === "small",
      "p-inputtext-lg p-inputfield-lg": r.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, zs = E.extend({
  name: "inputtext",
  style: Vs,
  classes: js
}), Fs = {
  name: "BaseInputText",
  extends: gr,
  style: zs,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function Ue(t) {
  "@babel/helpers - typeof";
  return Ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ue(t);
}
function Ms(t, e, n) {
  return (e = Ns(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ns(t) {
  var e = Ds(t, "string");
  return Ue(e) == "symbol" ? e : e + "";
}
function Ds(t, e) {
  if (Ue(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Ue(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var vr = {
  name: "InputText",
  extends: Fs,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return O(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return _e(Ms({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Rs = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Bs(t, e, n, r, i, o) {
  return C(), L("input", O({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": o.dataP,
    onInput: e[0] || (e[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Rs);
}
vr.render = Bs;
var Hs = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Ks = `
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
`, _n = E.extend({
  name: "virtualscroller",
  css: Ks,
  style: Hs
}), Us = {
  name: "BaseVirtualScroller",
  extends: Ye,
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
  style: _n,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    _n.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function We(t) {
  "@babel/helpers - typeof";
  return We = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, We(t);
}
function In(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ee(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? In(Object(n), !0).forEach(function(r) {
      yr(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : In(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function yr(t, e, n) {
  return (e = Ws(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ws(t) {
  var e = Gs(t, "string");
  return We(e) == "symbol" ? e : e + "";
}
function Gs(t, e) {
  if (We(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (We(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var br = {
  name: "VirtualScroller",
  extends: Us,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var e = this.isBoth();
    return {
      first: e ? {
        rows: 0,
        cols: 0
      } : 0,
      last: e ? {
        rows: 0,
        cols: 0
      } : 0,
      page: e ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: e ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: e ? {
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
    numToleratedItems: function(e) {
      this.d_numToleratedItems = e;
    },
    loading: function(e, n) {
      this.lazy && e !== n && e !== this.d_loading && (this.d_loading = e);
    },
    items: {
      handler: function(e, n) {
        (!n || n.length !== (e || []).length) && (this.init(), this.calculateAutoSize());
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
      it(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = be(this.element), this.defaultHeight = ye(this.element), this.defaultContentWidth = be(this.content), this.defaultContentHeight = ye(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
    scrollTo: function(e) {
      this.element && this.element.scrollTo(e);
    },
    scrollToIndex: function(e) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", i = this.isBoth(), o = this.isHorizontal(), s = i ? e.every(function(S) {
        return S > -1;
      }) : e > -1;
      if (s) {
        var l = this.first, a = this.element, u = a.scrollTop, c = u === void 0 ? 0 : u, d = a.scrollLeft, p = d === void 0 ? 0 : d, h = this.calculateNumItems(), m = h.numToleratedItems, v = this.getContentPosition(), g = this.itemSize, y = function() {
          var I = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, M = arguments.length > 1 ? arguments[1] : void 0;
          return I <= M ? 0 : I;
        }, w = function(I, M, N) {
          return I * M + N;
        }, $ = function() {
          var I = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, M = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: I,
            top: M,
            behavior: r
          });
        }, f = i ? {
          rows: 0,
          cols: 0
        } : 0, b = !1, x = !1;
        i ? (f = {
          rows: y(e[0], m[0]),
          cols: y(e[1], m[1])
        }, $(w(f.cols, g[1], v.left), w(f.rows, g[0], v.top)), x = this.lastScrollPos.top !== c || this.lastScrollPos.left !== p, b = f.rows !== l.rows || f.cols !== l.cols) : (f = y(e, m), o ? $(w(f, g, v.left), c) : $(p, w(f, g, v.top)), x = this.lastScrollPos !== (o ? p : c), b = f !== l), this.isRangeChanged = b, x && (this.first = f);
      }
    },
    scrollInView: function(e, n) {
      var r = this, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var o = this.isBoth(), s = this.isHorizontal(), l = o ? e.every(function(g) {
          return g > -1;
        }) : e > -1;
        if (l) {
          var a = this.getRenderedRange(), u = a.first, c = a.viewport, d = function() {
            var y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, w = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return r.scrollTo({
              left: y,
              top: w,
              behavior: i
            });
          }, p = n === "to-start", h = n === "to-end";
          if (p) {
            if (o)
              c.first.rows - u.rows > e[0] ? d(c.first.cols * this.itemSize[1], (c.first.rows - 1) * this.itemSize[0]) : c.first.cols - u.cols > e[1] && d((c.first.cols - 1) * this.itemSize[1], c.first.rows * this.itemSize[0]);
            else if (c.first - u > e) {
              var m = (c.first - 1) * this.itemSize;
              s ? d(m, 0) : d(0, m);
            }
          } else if (h) {
            if (o)
              c.last.rows - u.rows <= e[0] + 1 ? d(c.first.cols * this.itemSize[1], (c.first.rows + 1) * this.itemSize[0]) : c.last.cols - u.cols <= e[1] + 1 && d((c.first.cols + 1) * this.itemSize[1], c.first.rows * this.itemSize[0]);
            else if (c.last - u <= e + 1) {
              var v = (c.first + 1) * this.itemSize;
              s ? d(v, 0) : d(0, v);
            }
          }
        }
      } else
        this.scrollToIndex(e, i);
    },
    getRenderedRange: function() {
      var e = function(d, p) {
        return Math.floor(d / (p || d));
      }, n = this.first, r = 0;
      if (this.element) {
        var i = this.isBoth(), o = this.isHorizontal(), s = this.element, l = s.scrollTop, a = s.scrollLeft;
        if (i)
          n = {
            rows: e(l, this.itemSize[0]),
            cols: e(a, this.itemSize[1])
          }, r = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var u = o ? a : l;
          n = e(u, this.itemSize), r = n + this.numItemsInViewport;
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
      var e = this.isBoth(), n = this.isHorizontal(), r = this.itemSize, i = this.getContentPosition(), o = this.element ? this.element.offsetWidth - i.left : 0, s = this.element ? this.element.offsetHeight - i.top : 0, l = function(p, h) {
        return Math.ceil(p / (h || p));
      }, a = function(p) {
        return Math.ceil(p / 2);
      }, u = e ? {
        rows: l(s, r[0]),
        cols: l(o, r[1])
      } : l(n ? o : s, r), c = this.d_numToleratedItems || (e ? [a(u.rows), a(u.cols)] : a(u));
      return {
        numItemsInViewport: u,
        numToleratedItems: c
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), r = this.first, i = this.calculateNumItems(), o = i.numItemsInViewport, s = i.numToleratedItems, l = function(c, d, p) {
        var h = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(c + d + (c < p ? 2 : 3) * p, h);
      }, a = n ? {
        rows: l(r.rows, o.rows, s[0]),
        cols: l(r.cols, o.cols, s[1], !0)
      } : l(r, o, s);
      this.last = a, this.numItemsInViewport = o, this.d_numToleratedItems = s, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: o.rows
      }).map(function() {
        return Array.from({
          length: o.cols
        });
      }) : Array.from({
        length: o
      })), this.lazy && Promise.resolve().then(function() {
        var u;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: r.cols
          } : 0 : r,
          last: Math.min(e.step ? e.step : a, ((u = e.items) === null || u === void 0 ? void 0 : u.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), r = e.isHorizontal(), i = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var o = [be(e.element), ye(e.element)], s = o[0], l = o[1];
          (n || r) && (e.element.style.width = s < e.defaultWidth ? s + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || i) && (e.element.style.height = l < e.defaultHeight ? l + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, i = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(i ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, r) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), r = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), i = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), o = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: r,
          top: i,
          bottom: o,
          x: n + r,
          y: i + o
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
      var e = this;
      if (this.element) {
        var n = this.isBoth(), r = this.isHorizontal(), i = this.element.parentElement, o = this.scrollWidth || "".concat(this.element.offsetWidth || i.offsetWidth, "px"), s = this.scrollHeight || "".concat(this.element.offsetHeight || i.offsetHeight, "px"), l = function(u, c) {
          return e.element.style[u] = c;
        };
        n || r ? (l("height", s), l("width", o)) : l("height", s);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var r = this.isBoth(), i = this.isHorizontal(), o = this.getContentPosition(), s = function(a, u, c) {
          var d = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = Ee(Ee({}, e.spacerStyle), yr({}, "".concat(a), (u || []).length * c + d + "px"));
        };
        r ? (s("height", n, this.itemSize[0], o.y), s("width", this.columns || n[1], this.itemSize[1], o.x)) : i ? s("width", this.columns || n, this.itemSize, o.x) : s("height", n, this.itemSize, o.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var r = this.isBoth(), i = this.isHorizontal(), o = e ? e.first : this.first, s = function(c, d) {
          return c * d;
        }, l = function() {
          var c = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Ee(Ee({}, n.contentStyle), {
            transform: "translate3d(".concat(c, "px, ").concat(d, "px, 0)")
          });
        };
        if (r)
          l(s(o.cols, this.itemSize[1]), s(o.rows, this.itemSize[0]));
        else {
          var a = s(o, this.itemSize);
          i ? l(a, 0) : l(0, a);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, r = e.target, i = this.isBoth(), o = this.isHorizontal(), s = this.getContentPosition(), l = function(V, F) {
        return V ? V > F ? V - F : V : 0;
      }, a = function(V, F) {
        return Math.floor(V / (F || V));
      }, u = function(V, F, W, G, D, K) {
        return V <= D ? D : K ? W - G - D : F + D - 1;
      }, c = function(V, F, W, G, D, K, Y, ce) {
        if (V <= K) return 0;
        var ne = Math.max(0, Y ? V < F ? W : V - K : V > F ? W : V - 2 * K), Z = n.getLast(ne, ce);
        return ne > Z ? Z - D : ne;
      }, d = function(V, F, W, G, D, K) {
        var Y = F + G + 2 * D;
        return V >= D && (Y += D + 1), n.getLast(Y, K);
      }, p = l(r.scrollTop, s.top), h = l(r.scrollLeft, s.left), m = i ? {
        rows: 0,
        cols: 0
      } : 0, v = this.last, g = !1, y = this.lastScrollPos;
      if (i) {
        var w = this.lastScrollPos.top <= p, $ = this.lastScrollPos.left <= h;
        if (!this.appendOnly || this.appendOnly && (w || $)) {
          var f = {
            rows: a(p, this.itemSize[0]),
            cols: a(h, this.itemSize[1])
          }, b = {
            rows: u(f.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], w),
            cols: u(f.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], $)
          };
          m = {
            rows: c(f.rows, b.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], w),
            cols: c(f.cols, b.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], $, !0)
          }, v = {
            rows: d(f.rows, m.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: d(f.cols, m.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, g = m.rows !== this.first.rows || v.rows !== this.last.rows || m.cols !== this.first.cols || v.cols !== this.last.cols || this.isRangeChanged, y = {
            top: p,
            left: h
          };
        }
      } else {
        var x = o ? h : p, S = this.lastScrollPos <= x;
        if (!this.appendOnly || this.appendOnly && S) {
          var I = a(x, this.itemSize), M = u(I, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, S);
          m = c(I, M, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, S), v = d(I, m, this.last, this.numItemsInViewport, this.d_numToleratedItems), g = m !== this.first || v !== this.last || this.isRangeChanged, y = x;
        }
      }
      return {
        first: m,
        last: v,
        isRangeChanged: g,
        scrollPos: y
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), r = n.first, i = n.last, o = n.isRangeChanged, s = n.scrollPos;
      if (o) {
        var l = {
          first: r,
          last: i
        };
        if (this.setContentPosition(l), this.first = r, this.last = i, this.lastScrollPos = s, this.$emit("scroll-index-change", l), this.lazy && this.isPageChanged(r)) {
          var a, u, c = {
            first: this.step ? Math.min(this.getPageByFirst(r) * this.step, (((a = this.items) === null || a === void 0 ? void 0 : a.length) || 0) - this.step) : r,
            last: Math.min(this.step ? (this.getPageByFirst(r) + 1) * this.step : i, ((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0)
          }, d = this.lazyLoadState.first !== c.first || this.lazyLoadState.last !== c.last;
          d && this.$emit("lazy-load", c), this.lazyLoadState = c;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var r = this.onScrollPositionChange(e), i = r.isRangeChanged, o = i || (this.step ? this.isPageChanged() : !1);
            o && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(e), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(e);
    },
    onResize: function() {
      var e = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (it(e.element)) {
          var n = e.isBoth(), r = e.isVertical(), i = e.isHorizontal(), o = [be(e.element), ye(e.element)], s = o[0], l = o[1], a = s !== e.defaultWidth, u = l !== e.defaultHeight, c = n ? a || u : i ? a : r ? u : !1;
          c && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = s, e.defaultHeight = l, e.defaultContentWidth = be(e.content), e.defaultContentHeight = ye(e.content), e.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        e.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(e) {
      var n = (this.items || []).length, r = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: r,
        count: n,
        first: r === 0,
        last: r === n - 1,
        even: r % 2 === 0,
        odd: r % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var r = this.loaderArr.length;
      return Ee({
        index: e,
        count: r,
        first: e === 0,
        last: e === r - 1,
        even: e % 2 === 0,
        odd: e % 2 !== 0
      }, n);
    },
    getPageByFirst: function(e) {
      return Math.floor(((e ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(e) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(e ?? this.first) : !0;
    },
    setContentEl: function(e) {
      this.content = e || this.content || ut(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(e) {
      this.element = e;
    },
    contentRef: function(e) {
      this.content = e;
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
      var e = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return e.columns ? n : n.slice(e.appendOnly ? 0 : e.first.cols, e.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var e = this.isBoth(), n = this.isHorizontal();
        if (e || n)
          return this.d_loading && this.loaderDisabled ? e ? this.loaderArr[0] : this.loaderArr : this.columns.slice(e ? this.first.cols : this.first, e ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: Rt
  }
}, qs = ["tabindex"];
function Ys(t, e, n, r, i, o) {
  var s = ie("SpinnerIcon");
  return t.disabled ? (C(), L(Te, {
    key: 1
  }, [j(t.$slots, "default"), j(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: o.loadedColumns
  })], 64)) : (C(), L("div", O({
    key: 0,
    ref: o.elementRef,
    class: o.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    })
  }, t.ptmi("root")), [j(t.$slots, "content", {
    styleClass: o.contentClass,
    items: o.loadedItems,
    getItemOptions: o.getOptions,
    loading: i.d_loading,
    getLoaderOptions: o.getLoaderOptions,
    itemSize: t.itemSize,
    rows: o.loadedRows,
    columns: o.loadedColumns,
    contentRef: o.contentRef,
    spacerStyle: i.spacerStyle,
    contentStyle: i.contentStyle,
    vertical: o.isVertical(),
    horizontal: o.isHorizontal(),
    both: o.isBoth()
  }, function() {
    return [R("div", O({
      ref: o.contentRef,
      class: o.contentClass,
      style: i.contentStyle
    }, t.ptm("content")), [(C(!0), L(Te, null, gt(o.loadedItems, function(l, a) {
      return j(t.$slots, "item", {
        key: a,
        item: l,
        options: o.getOptions(a)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (C(), L("div", O({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: i.spacerStyle
  }, t.ptm("spacer")), null, 16)) : X("", !0), !t.loaderDisabled && t.showLoader && i.d_loading ? (C(), L("div", O({
    key: 1,
    class: o.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (C(!0), L(Te, {
    key: 0
  }, gt(i.loaderArr, function(l, a) {
    return j(t.$slots, "loader", {
      key: a,
      options: o.getLoaderOptions(a, o.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : X("", !0), j(t.$slots, "loadingicon", {}, function() {
    return [ge(s, O({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : X("", !0)], 16, qs));
}
br.render = Ys;
var Zs = `
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
`, Js = {
  root: function(e) {
    var n = e.instance, r = e.props, i = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": r.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": i.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": i.focused || i.overlayVisible,
      "p-select-open": i.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": r.size === "small",
      "p-select-lg p-inputfield-lg": r.size === "large"
    }];
  },
  label: function(e) {
    var n, r = e.instance, i = e.props;
    return ["p-select-label", {
      "p-placeholder": !i.editable && r.label === i.placeholder,
      "p-select-label-empty": !i.editable && !r.$slots.value && (r.label === "p-emptylabel" || ((n = r.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
  option: function(e) {
    var n = e.instance, r = e.props, i = e.state, o = e.option, s = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(o) && r.highlightOnSelect,
      "p-focus": i.focusedOptionIndex === s,
      "p-disabled": n.isOptionDisabled(o)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, Qs = E.extend({
  name: "select",
  style: Zs,
  classes: Js
}), Xs = {
  name: "BaseSelect",
  extends: gr,
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
  style: Qs,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function Ge(t) {
  "@babel/helpers - typeof";
  return Ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ge(t);
}
function el(t) {
  return il(t) || rl(t) || nl(t) || tl();
}
function tl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function nl(t, e) {
  if (t) {
    if (typeof t == "string") return Et(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Et(t, e) : void 0;
  }
}
function rl(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function il(t) {
  if (Array.isArray(t)) return Et(t);
}
function Et(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Tn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ln(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Tn(Object(n), !0).forEach(function(r) {
      ve(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Tn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function ve(t, e, n) {
  return (e = ol(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ol(t) {
  var e = al(t, "string");
  return Ge(e) == "symbol" ? e : e + "";
}
function al(t, e) {
  if (Ge(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Ge(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var sl = {
  name: "Select",
  extends: Xs,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (ft.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? ue(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? ue(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? ue(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, r, i) {
      return this.ptm(i, {
        context: {
          option: e,
          index: r,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(r, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? ue(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return ue(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return ue(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(r) {
        return n.isOptionGroup(r);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && se(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, r = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && se(n.$refs.focusInput);
      };
      setTimeout(function() {
        r();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var r, i;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (r = (i = n.formField).onBlur) === null || r === void 0 || r.call(i, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (ao())
        switch (e.code) {
          case "Backspace":
            this.onBackspaceKey(e, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(e);
            break;
          default:
            e.preventDefault();
            return;
        }
      var r = e.metaKey || e.ctrlKey;
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, this.editable);
          break;
        case "Home":
          this.onHomeKey(e, this.editable);
          break;
        case "End":
          this.onEndKey(e, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Space":
          this.onSpaceKey(e, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e);
          break;
        case "Backspace":
          this.onBackspaceKey(e, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !r && Di(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && se(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var r = this.searchOptions(e, n);
      !r && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && P(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? to(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      se(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? no(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      se(n);
    },
    onOptionSelect: function(e, n) {
      var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var i = this.getOptionValue(n);
        this.updateModel(e, i), r && this.hide(!0);
      }
    },
    onOptionMouseMove: function(e, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(e, n);
    },
    onFilterChange: function(e) {
      var n = e.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: e,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(e) {
      if (!e.isComposing)
        switch (e.code) {
          case "ArrowDown":
            this.onArrowDownKey(e);
            break;
          case "ArrowUp":
            this.onArrowUpKey(e, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(e, !0);
            break;
          case "Home":
            this.onHomeKey(e, !0);
            break;
          case "End":
            this.onEndKey(e, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(e);
            break;
          case "Escape":
            this.onEscapeKey(e);
            break;
          case "Tab":
            this.onTabKey(e);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(e) {
      Aa.emit("overlay-click", {
        originalEvent: e,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(e) {
      switch (e.code) {
        case "Escape":
          this.onEscapeKey(e);
          break;
      }
    },
    onArrowDownKey: function(e) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(e, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, n);
      }
      e.preventDefault();
    },
    onArrowUpKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (e.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), e.preventDefault();
      else {
        var r = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, r), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var r = e.currentTarget;
        e.shiftKey ? r.setSelectionRange(0, e.target.selectionStart) : (r.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var r = e.currentTarget;
        if (e.shiftKey)
          r.setSelectionRange(e.target.selectionStart, r.value.length);
        else {
          var i = r.value.length;
          r.setSelectionRange(i, i), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(e, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(0), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.visibleOptions.length - 1), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(e)), e.preventDefault();
    },
    onSpaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(e);
    },
    onEscapeKey: function(e) {
      this.overlayVisible && this.hide(!0), e.preventDefault(), e.stopPropagation();
    },
    onTabKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (se(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      ft.set("overlay", e, this.$primevue.config.zIndex.overlay), Yi(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && se(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && se(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      ft.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Zi(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = Gn(this.$el) + "px", qi(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var r = n.composedPath();
        e.overlayVisible && e.overlay && !r.includes(e.$el) && !r.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new Pa(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !so() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && it(n) && (this.labelClickListener = function() {
          se(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && it(e) && e.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var e = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          e.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return Ft(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(e) {
      return P(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return Rn(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return Jt(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, r = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(i) {
        return n.isValidOption(i);
      }) : -1;
      return r > -1 ? r + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, r = e > 0 ? Jt(this.visibleOptions.slice(0, e), function(i) {
        return n.isValidOption(i);
      }) : -1;
      return r > -1 ? r : e;
    },
    findSelectedOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findFirstOptionIndex() : e;
    },
    findLastFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findLastOptionIndex() : e;
    },
    searchOptions: function(e, n) {
      var r = this;
      this.searchValue = (this.searchValue || "") + n;
      var i = -1, o = !1;
      return P(this.searchValue) && (i = this.visibleOptions.findIndex(function(s) {
        return r.isOptionExactMatched(s);
      }), i === -1 && (i = this.visibleOptions.findIndex(function(s) {
        return r.isOptionStartsWith(s);
      })), i !== -1 && (o = !0), i === -1 && this.focusedOptionIndex === -1 && (i = this.findFirstFocusedOptionIndex()), i !== -1 && this.changeFocusedOptionIndex(e, i)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        r.searchValue = "", r.searchTimeout = null;
      }, 500), o;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var r = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, i = ut(e.list, 'li[id="'.concat(r, '"]'));
        i ? i.scrollIntoView && i.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : e.virtualScrollerDisabled || e.virtualScroller && e.virtualScroller.scrollToIndex(n !== -1 ? n : e.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(e, n) {
      this.writeValue(n, e), this.$emit("change", {
        originalEvent: e,
        value: n
      });
    },
    flatOptions: function(e) {
      var n = this;
      return (e || []).reduce(function(r, i, o) {
        r.push({
          optionGroup: i,
          group: !0,
          index: o
        });
        var s = n.getOptionGroupChildren(i);
        return s && s.forEach(function(l) {
          return r.push(l);
        }), r;
      }, []);
    },
    overlayRef: function(e) {
      this.overlay = e;
    },
    listRef: function(e, n) {
      this.list = e, n && n(e);
    },
    virtualScrollerRef: function(e) {
      this.virtualScroller = e;
    }
  },
  computed: {
    visibleOptions: function() {
      var e = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var r = Oo.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var i = this.options || [], o = [];
          return i.forEach(function(s) {
            var l = e.getOptionGroupChildren(s), a = l.filter(function(u) {
              return r.includes(u);
            });
            a.length > 0 && o.push(Ln(Ln({}, s), {}, ve({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", el(a))));
          }), this.flatOptions(o);
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
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return P(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      var e = this;
      return this.visibleOptions.filter(function(n) {
        return !e.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return _e(ve({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return _e(ve(ve({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return _e(ve({}, this.size, this.size));
    },
    overlayDataP: function() {
      return _e(ve({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: ka
  },
  components: {
    InputText: vr,
    VirtualScroller: br,
    Portal: Mt,
    InputIcon: mr,
    IconField: hr,
    TimesIcon: fr,
    ChevronDownIcon: dr,
    SpinnerIcon: Rt,
    SearchIcon: pr,
    CheckIcon: cr,
    BlankIcon: ur
  }
}, ll = ["id", "data-p"], ul = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], cl = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], dl = ["data-p"], pl = ["id"], fl = ["id"], hl = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function ml(t, e, n, r, i, o) {
  var s = ie("SpinnerIcon"), l = ie("InputText"), a = ie("SearchIcon"), u = ie("InputIcon"), c = ie("IconField"), d = ie("CheckIcon"), p = ie("BlankIcon"), h = ie("VirtualScroller"), m = ie("Portal"), v = Wr("ripple");
  return C(), L("div", O({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return o.onContainerClick && o.onContainerClick.apply(o, arguments);
    }),
    "data-p": o.containerDataP
  }, t.ptmi("root")), [t.editable ? (C(), L("input", O({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: o.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": i.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": i.focused ? o.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return o.onEditableInput && o.onEditableInput.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, t.ptm("label")), null, 16, ul)) : (C(), L("span", O({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (o.label === "p-emptylabel" ? void 0 : o.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": i.focused ? o.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, t.ptm("label")), [j(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var g;
    return [ct(de(o.label === "p-emptylabel" ? " " : (g = o.label) !== null && g !== void 0 ? g : "empty"), 1)];
  })], 16, cl)), o.isClearIconVisible ? j(t.$slots, "clearicon", {
    key: 2,
    class: Je(t.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [(C(), me(Ut(t.clearIcon ? "i" : "TimesIcon"), O({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: o.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : X("", !0), R("div", O({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? j(t.$slots, "loadingicon", {
    key: 0,
    class: Je(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (C(), L("span", O({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (C(), me(s, O({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : j(t.$slots, "dropdownicon", {
    key: 1,
    class: Je(t.cx("dropdownIcon"))
  }, function() {
    return [(C(), me(Ut(t.dropdownIcon ? "span" : "ChevronDownIcon"), O({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": o.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), ge(m, {
    appendTo: t.appendTo
  }, {
    default: $e(function() {
      return [ge(Gr, O({
        name: "p-anchored-overlay",
        onEnter: o.onOverlayEnter,
        onAfterEnter: o.onOverlayAfterEnter,
        onLeave: o.onOverlayLeave,
        onAfterLeave: o.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: $e(function() {
          return [i.overlayVisible ? (C(), L("div", O({
            key: 0,
            ref: o.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return o.onOverlayClick && o.onOverlayClick.apply(o, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return o.onOverlayKeyDown && o.onOverlayKeyDown.apply(o, arguments);
            }),
            "data-p": o.overlayDataP
          }, t.ptm("overlay")), [R("span", O({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return o.onFirstHiddenFocus && o.onFirstHiddenFocus.apply(o, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), j(t.$slots, "header", {
            value: t.d_value,
            options: o.visibleOptions
          }), t.filter ? (C(), L("div", O({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [ge(c, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: $e(function() {
              return [ge(l, {
                ref: "filterInput",
                type: "text",
                value: i.filterValue,
                onVnodeMounted: o.onFilterUpdated,
                onVnodeUpdated: o.onFilterUpdated,
                class: Je(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": o.focusedOptionId,
                onKeydown: o.onFilterKeyDown,
                onBlur: o.onFilterBlur,
                onInput: o.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), ge(u, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: $e(function() {
                  return [j(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (C(), L("span", O({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (C(), me(a, qr(O({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), R("span", O({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), de(o.filterResultMessageText), 17)], 16)) : X("", !0), R("div", O({
            class: t.cx("listContainer"),
            style: {
              "max-height": o.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [ge(h, O({
            ref: o.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: o.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: o.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), Yr({
            content: $e(function(g) {
              var y = g.styleClass, w = g.contentRef, $ = g.items, f = g.getItemOptions, b = g.contentStyle, x = g.itemSize;
              return [R("ul", O({
                ref: function(I) {
                  return o.listRef(I, w);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), y],
                style: b,
                role: "listbox"
              }, t.ptm("list")), [(C(!0), L(Te, null, gt($, function(S, I) {
                return C(), L(Te, {
                  key: o.getOptionRenderKey(S, o.getOptionIndex(I, f))
                }, [o.isOptionGroup(S) ? (C(), L("li", O({
                  key: 0,
                  id: t.$id + "_" + o.getOptionIndex(I, f),
                  style: {
                    height: x ? x + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [j(t.$slots, "optiongroup", {
                  option: S.optionGroup,
                  index: o.getOptionIndex(I, f)
                }, function() {
                  return [R("span", O({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), de(o.getOptionGroupLabel(S.optionGroup)), 17)];
                })], 16, fl)) : Zr((C(), L("li", O({
                  key: 1,
                  id: t.$id + "_" + o.getOptionIndex(I, f),
                  class: t.cx("option", {
                    option: S,
                    focusedOption: o.getOptionIndex(I, f)
                  }),
                  style: {
                    height: x ? x + "px" : void 0
                  },
                  role: "option",
                  "aria-label": o.getOptionLabel(S),
                  "aria-selected": o.isSelected(S),
                  "aria-disabled": o.isOptionDisabled(S),
                  "aria-setsize": o.ariaSetSize,
                  "aria-posinset": o.getAriaPosInset(o.getOptionIndex(I, f)),
                  onMousedown: function(N) {
                    return o.onOptionSelect(N, S);
                  },
                  onMousemove: function(N) {
                    return o.onOptionMouseMove(N, o.getOptionIndex(I, f));
                  },
                  onClick: e[8] || (e[8] = Jr(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && o.isSelected(S),
                  "data-p-focused": i.focusedOptionIndex === o.getOptionIndex(I, f),
                  "data-p-disabled": o.isOptionDisabled(S)
                }, {
                  ref_for: !0
                }, o.getPTItemOptions(S, f, I, "option")), [t.checkmark ? (C(), L(Te, {
                  key: 0
                }, [o.isSelected(S) ? (C(), me(d, O({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (C(), me(p, O({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : X("", !0), j(t.$slots, "option", {
                  option: S,
                  selected: o.isSelected(S),
                  index: o.getOptionIndex(I, f)
                }, function() {
                  return [R("span", O({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), de(o.getOptionLabel(S)), 17)];
                })], 16, hl)), [[v]])], 64);
              }), 128)), i.filterValue && (!$ || $ && $.length === 0) ? (C(), L("li", O({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [j(t.$slots, "emptyfilter", {}, function() {
                return [ct(de(o.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (C(), L("li", O({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [j(t.$slots, "empty", {}, function() {
                return [ct(de(o.emptyMessageText), 1)];
              })], 16)) : X("", !0)], 16, pl)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: $e(function(g) {
              var y = g.options;
              return [j(t.$slots, "loader", {
                options: y
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), j(t.$slots, "footer", {
            value: t.d_value,
            options: o.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (C(), L("span", O({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), de(o.emptyMessageText), 17)) : X("", !0), R("span", O({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), de(o.selectedMessageText), 17), R("span", O({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return o.onLastHiddenFocus && o.onLastHiddenFocus.apply(o, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, dl)) : X("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, ll);
}
sl.render = ml;
const gl = { class: "kx-wcmount" }, vl = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, yl = /* @__PURE__ */ Qr({
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
  setup(t, { emit: e }) {
    const n = t, r = e, i = te(null), o = te(!1);
    let s = null, l = 0;
    const a = /* @__PURE__ */ new Set();
    function u(f) {
      f.composedPath()[0] === s && (f.stopPropagation(), r("change", f.detail));
    }
    function c(f) {
      return f.composedPath()[0] !== s ? !1 : (f.stopPropagation(), !0);
    }
    function d(f) {
      c(f) && r("created", f.detail);
    }
    function p(f) {
      c(f) && r("close", f.detail);
    }
    function h(f) {
      c(f) && r("error", f.detail);
    }
    function m(f) {
      if (typeof f == "string") return f;
      try {
        return JSON.stringify(f ?? {});
      } catch {
        return null;
      }
    }
    function v() {
      if (!s) return;
      const f = m(n.config);
      if (f !== null && s.setAttribute("config", f), n.schema !== void 0 && n.schema !== null) {
        const x = m(n.schema);
        x !== null && s.setAttribute("schema", x);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const x = m(n.meta);
        x !== null && s.setAttribute("meta", x);
      }
      n.provider && s.setAttribute("provider", n.provider), n.label && s.setAttribute("label", n.label);
      const b = n.attrs || {};
      for (const x of [...a])
        (!(x in b) || b[x] == null) && (s.removeAttribute(x), a.delete(x));
      for (const [x, S] of Object.entries(b)) {
        if (S == null) continue;
        const I = typeof S == "object" ? m(S) : String(S);
        I !== null && (s.setAttribute(x, I), a.add(x));
      }
    }
    function g(f = s) {
      f && (f.removeEventListener("config-changed", u), f.removeEventListener("change", u), f.removeEventListener("created", d), f.removeEventListener("close", p), f.removeEventListener("error", h), f === s && (s = null), a.clear());
    }
    async function y(f) {
      if (!customElements.get(f))
        try {
          await ai(f, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function w() {
      const f = ++l, b = i.value, x = n.tag;
      if (o.value = !1, !!b && (g(), b.innerHTML = "", !!x))
        try {
          if (await y(x), f !== l || i.value !== b || n.tag !== x) return;
          const S = document.createElement(x);
          S.classList.add("kx-wcmount-surface"), s = S, v(), S.addEventListener("config-changed", u), S.addEventListener("change", u), S.addEventListener("created", d), S.addEventListener("close", p), S.addEventListener("error", h), S.style.display = "block", b.appendChild(S), o.value = !customElements.get(x);
        } catch {
          f === l && (o.value = !0);
        }
    }
    async function $() {
      o.value = !1, await An(), await w();
    }
    return Pn(w), we(() => n.tag, w), we(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], v, { deep: !0 }), Xr(() => {
      l += 1, g();
    }), (f, b) => (C(), L("div", gl, [
      o.value ? (C(), L("div", vl, [
        b[0] || (b[0] = R("span", null, "This setup panel couldn’t load.", -1)),
        R("button", {
          type: "button",
          onClick: $
        }, "Try again")
      ])) : (C(), L("div", {
        key: 1,
        ref_key: "host",
        ref: i
      }, null, 512))
    ]));
  }
}), bl = (t, e) => {
  const n = t.__vccOpts || t;
  for (const [r, i] of e)
    n[r] = i;
  return n;
}, _l = /* @__PURE__ */ bl(yl, [["__scopeId", "data-v-3ec70c11"]]);
function Il(t, e) {
  if (t && typeof t == "object") {
    const n = t, r = n.response?.data?.error;
    if (typeof r == "string") return r;
    if (r && typeof r == "object" && typeof r.message == "string")
      return r.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return e;
}
const Tl = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block}*,*:before,*:after{box-sizing:border-box}.kx-cr{display:flex;flex-direction:column;gap:16px;width:100%;padding:6px 0 0;color:var(--p-text-color);font:inherit;font-size:13px}.kx-cr-head{display:flex;align-items:center;gap:12px}.kx-cr-ico{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;flex-shrink:0;background:color-mix(in srgb,var(--p-primary-color) 13%,transparent);color:var(--p-primary-color)}.kx-cr-ico>svg{width:20px;height:20px}.kx-cr-title{display:flex;flex-direction:column;min-width:0}.kx-cr-title h2{margin:0;font-size:16px;font-weight:700}.kx-cr-title span{font-size:12.5px;color:var(--p-text-muted-color)}.kx-field{display:flex;flex-direction:column;gap:6px;min-width:0}.kx-field-lbl{font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.kx-input{width:100%;min-height:36px;padding:6px 10px;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;outline:none;transition:border-color .12s}.kx-input::placeholder{color:var(--p-text-muted-color)}.kx-textarea{min-height:64px;padding:8px 10px;resize:vertical;line-height:1.45}.kx-textarea-lg{min-height:140px}.kx-input[readonly]{color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-content-background) 90%,var(--p-content-border-color))}.kx-input-ro{display:flex;align-items:center;gap:6px;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-content-background) 90%,var(--p-content-border-color))}.kx-field-help{color:var(--p-text-muted-color);font-size:12px;line-height:1.35}.kx-select{width:100%;min-width:0}.kx-note{padding:10px 12px;border:1px solid var(--p-content-border-color);border-radius:8px;color:var(--p-text-muted-color);background:var(--p-content-background)}.kx-adv{border-top:1px solid var(--p-content-border-color);padding-top:4px}.kx-adv-toggle{display:inline-flex;align-items:center;gap:6px;padding:6px 2px;border:none;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12.5px;font-weight:600;cursor:pointer}.kx-adv-toggle:hover{color:var(--p-text-color)}.kx-adv-toggle>svg{width:15px;height:15px}.kx-adv-badge{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-adv-body{display:flex;flex-direction:column;gap:14px;padding:10px 0 4px}.kx-trait-cfg{border:1px solid var(--p-content-border-color);border-radius:10px;padding:10px 12px}.kx-trait-conn{font-weight:400;color:var(--p-text-muted-color)}.kx-id{font-family:ui-monospace,Menlo,monospace;font-size:11px;font-weight:400;color:var(--p-text-muted-color)}.kx-check{display:grid;grid-template-columns:18px minmax(0,1fr);gap:10px;align-items:start;padding:10px 12px;border:1px solid var(--p-content-border-color);border-radius:8px;background:color-mix(in srgb,var(--p-content-background) 92%,var(--p-primary-color));cursor:pointer}.kx-check input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:1px 0 0;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:6px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.kx-check input:before{content:"";width:5px;height:9px;border:solid var(--p-button-primary-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.kx-check input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.kx-check input:checked:before{transform:rotate(45deg) scale(1)}.kx-check input:disabled{opacity:.55;cursor:not-allowed}.kx-check:has(input:disabled){cursor:not-allowed}.kx-check>span{display:flex;flex-direction:column;gap:3px;min-width:0}.kx-check strong{font-size:13px;font-weight:650;color:var(--p-text-color)}.kx-check small{font-size:12px;line-height:1.35;color:var(--p-text-muted-color)}.kx-check-control{align-items:center}.kx-inline-control{display:inline-flex;flex-direction:row;align-items:center;flex-wrap:wrap;gap:7px;max-width:100%;margin-top:7px;color:var(--p-text-muted-color);font-size:12px}.kx-inline-control>span{display:inline;white-space:nowrap}.kx-inline-control-standalone{margin-top:0}.kx-number-sm{flex:0 0 96px;width:96px;min-height:30px;padding:4px 8px}.kx-actions{display:flex;justify-content:flex-end;gap:10px;padding-top:4px}.kx-error{color:var(--p-danger-600, var(--p-danger-500));font-size:12.5px;line-height:1.4}';
export {
  E as B,
  Cl as P,
  ka as R,
  _l as W,
  $l as a,
  kl as b,
  Tl as c,
  P as d,
  Il as e,
  Ye as f,
  _e as g,
  Rt as h,
  qe as l,
  sl as s,
  Ol as u
};
//# sourceMappingURL=styles-BeIlQBlD.js.map

import { hasInjectionContext as Ro, inject as Gn, effectScope as Mo, ref as M, markRaw as Vo, onMounted as Zn, onUnmounted as Bo, watch as Ue, createApp as Uo, readonly as Fo, getCurrentInstance as rn, nextTick as Ho, reactive as Wo, renderSlot as X, openBlock as _, createBlock as Te, Teleport as qn, createCommentVNode as W, useId as Ko, mergeProps as z, h as Yo, createElementBlock as C, createElementVNode as b, createTextVNode as ie, toDisplayString as R, resolveComponent as $t, resolveDirective as Xn, withDirectives as Fe, resolveDynamicComponent as Mt, withCtx as B, normalizeClass as Y, computed as pe, createVNode as w, Transition as Go, Fragment as Ne, defineComponent as Zo, unref as f, vModelText as gt, renderList as vt, withModifiers as qo, isRef as Xo, withKeys as Jo } from "vue";
import { addCollection as Qo, Icon as A } from "@iconify/vue";
import { config as an, addIcons as er, on as tr, applyThemeMode as yt, host as Se, hostCss as nr, loadCss as or, api as ft, define as rr } from "@wippy-fe/proxy";
var Vt = "data-wippy-visible";
function sn(e) {
  const t = e.getAttribute(Vt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var ar = Object.defineProperty, ir = (e, t, n) => t in e ? ar(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, F = (e, t, n) => ir(e, typeof t != "symbol" ? t + "" : t, n), sr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], lr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function ln(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function cr(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [o, r] of Object.entries(n)) {
        if ((o === "@light" || o === "@dark") && r && typeof r == "object") {
          for (const [s, l] of Object.entries(r)) {
            const i = typeof l == "string" ? ln(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof r == "string" ? ln(o) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function dr(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${lr} {
${t}
}`;
}
function ur(e, t) {
  const n = dr(t);
  n && Jn(e, n, "@wippy-fe/css-variables-bridge");
}
function pr(e, t) {
  const o = (t ?? sr).map(async (r) => {
    const a = nr[r];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await or(a);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${r}" (${a}):`, s), null;
    }
  });
  return Promise.all(o).then((r) => {
    for (const a of r) {
      if (!a)
        continue;
      const s = document.createElement("style");
      s.textContent = a, s.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(s);
    }
  });
}
function fr(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Jn(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, r];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", n), o.textContent = t, e.appendChild(o);
}
function mr(e, t) {
  Jn(e, t, "@wippy-fe/custom-css");
}
function Qn(e) {
  return e.__wippyHost ?? null;
}
function hr(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function br(e, t, n) {
  switch (n.type) {
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
        return n.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function It(e, t) {
  const n = {}, o = [];
  for (const [r, a] of Object.entries(t.properties)) {
    const s = e.getAttribute(r), l = hr(r);
    if (s === null) {
      a.default !== void 0 && (n[l] = a.default);
      continue;
    }
    const i = br(r, s, a);
    i.error ? o.push(i.error) : n[l] = i.value;
  }
  return { props: n, errors: o };
}
var gr = class {
  constructor(e, t) {
    F(this, "_props"), F(this, "_errors"), F(this, "_content"), F(this, "_hostVisibility"), F(this, "_propsListeners", /* @__PURE__ */ new Set()), F(this, "_contentListeners", /* @__PURE__ */ new Set()), F(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), F(this, "_disposed", !1), F(this, "_emitToDom"), F(this, "props"), F(this, "events"), F(this, "content"), F(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(o, r) {
        return n._subscribeProps(o, r);
      }
    }, this.events = {
      emit(o, r) {
        n._disposed || n._emitToDom(o, r);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(o, r) {
        return n._subscribeContent(o, r);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(o, r) {
        return n._subscribeHostVisibility(o, r);
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
}, vr = class extends HTMLElement {
  constructor() {
    super(), F(this, "_internals"), F(this, "_contentObserver", null), F(this, "_initialized", !1), F(this, "_container", null), F(this, "_reactive", null), F(this, "_lastProps", null), F(this, "_lastErrors", []), F(this, "_lastContent", null), F(this, "_themeUnsub", null), F(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = sn(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Vt])];
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
    return Qn(this);
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
      let n, o;
      if (this._lastProps !== null)
        n = this._lastProps, o = this._lastErrors;
      else {
        const a = It(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, o = a.errors, this._lastProps = n, this._lastErrors = o;
      }
      const r = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = r), this._reactive = new gr(
        { props: n, errors: o, content: r, hasContent: t, hostVisibility: this._hostVisible },
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
      let o;
      if (t)
        o = this._container;
      else {
        this.onInit(n), e.inlineCss && fr(n, e.inlineCss);
        try {
          const c = an?.theming, d = cr(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          ur(n, d);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = an?.theming, d = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            d && mr(n, d);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && pr(n, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && o.classList.add(...i), n.appendChild(o), this._container = o, er(Qo);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = tr("@theme", (i) => this._applyTheme(i)));
      const { props: r, errors: a } = It(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(r));
      const s = r;
      this._lastProps = s, this._lastErrors = a;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, o, s, a, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Se.getThemeMode?.()) {
    yt(e, this), this._container && yt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), yt("auto", this), this._container && yt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Vt) {
      const l = this._hostVisible, i = sn(this);
      if (i === l)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, l), this.onHostVisibilityChanged(i, l));
      return;
    }
    const o = this.constructor.wippyConfig, { props: r, errors: a } = It(this, o.propsSchema);
    o.validateProps && a.push(...o.validateProps(r));
    const s = r;
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
function yr(e) {
  return e.__wippyHostBus ?? null;
}
function xr(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let eo;
const to = (e) => eo = e, kr = () => Ro() && Gn(no) || eo, no = (
  /* istanbul ignore next */
  Symbol()
);
function wr() {
  const e = Mo(!0), t = e.run(() => M({}));
  let n = [], o = [];
  const r = Vo({
    install(a) {
      to(r), r._a = a, a.provide(no, r), a.config.globalProperties.$pinia = r, o.forEach((s) => n.push(s)), o = [];
    },
    use(a) {
      return this._a ? n.push(a) : o.push(a), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return r;
}
var _r = Object.defineProperty, Sr = (e, t, n) => t in e ? _r(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Ve = (e, t, n) => Sr(e, typeof t != "symbol" ? t + "" : t, n), $r = /* @__PURE__ */ Symbol("wippy:emit"), Cr = /* @__PURE__ */ Symbol("wippy:props"), Pr = /* @__PURE__ */ Symbol("wippy:props_error"), Or = /* @__PURE__ */ Symbol("wippy:content"), Tr = /* @__PURE__ */ Symbol("wippy:panel-id"), Lr = /* @__PURE__ */ Symbol("wippy:layout-bus"), Er = /* @__PURE__ */ Symbol("wippy:host"), oo = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Ar() {
  const e = Gn(oo);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function jr(e) {
  const t = Ar();
  let n = !1, o = null, r = !1;
  function a() {
    if (o)
      return r = !0, o;
    let s;
    try {
      s = Promise.resolve(e());
    } catch (i) {
      s = Promise.reject(i);
    }
    const l = s.finally(() => {
      if (o === l && (o = null, n && r))
        return r = !1, a();
    });
    return o = l, l;
  }
  return Zn(() => (n = !0, a())), Bo(() => {
    n = !1, r = !1;
  }), Ue(t, (s, l) => {
    if (n && l === !1 && s === !0)
      return a();
  }), t;
}
var Nr = class extends vr {
  constructor() {
    super(...arguments), Ve(this, "_vueApp", null), Ve(this, "_propsRef", M({})), Ve(this, "_errorsRef", M([])), Ve(this, "_contentRef", M(null)), Ve(this, "_hostVisibilityRef", M(null)), Ve(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, o, r, a) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = o, this._contentRef.value = r ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of o)
      this.emitEvent("invalid", { message: c });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((c, d) => {
      this._propsRef.value = c, this._errorsRef.value = [...d];
      for (const u of d)
        this.emitEvent("invalid", { message: u });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: l.signal });
    const i = (c) => {
      if (l.signal.aborted)
        return;
      const d = kr(), u = Uo(c.rootComponent);
      this._vueApp = u;
      const p = wr();
      if (c.piniaPlugins)
        for (const m of c.piniaPlugins)
          p.use(m);
      if (u.use(p), c.plugins)
        for (const m of c.plugins)
          u.use(m);
      u.provide(Cr, this._propsRef), u.provide(Pr, this._errorsRef), u.provide($r, this.emitEvent.bind(this)), u.provide(Or, this._contentRef), u.provide(oo, this._hostVisibilityRef), u.provide(Tr, xr(this)), u.provide(Lr, yr(this)), u.provide(Er, Qn(this)), c.providers && c.providers(u, this), u.mount(t), d && to(d);
    };
    if (s.rootComponent)
      i(s);
    else if (s.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), s.lazyConfig().then((d) => {
        l.signal.aborted || (c.remove(), i(d));
      }).catch((d) => {
        if (l.signal.aborted)
          return;
        const u = d instanceof Error ? d.message : String(d), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", u), c.replaceWith(p), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Ir = Object.defineProperty, cn = Object.getOwnPropertySymbols, zr = Object.prototype.hasOwnProperty, Dr = Object.prototype.propertyIsEnumerable, dn = (e, t, n) => t in e ? Ir(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Rr = (e, t) => {
  for (var n in t || (t = {})) zr.call(t, n) && dn(e, n, t[n]);
  if (cn) for (var n of cn(t)) Dr.call(t, n) && dn(e, n, t[n]);
  return e;
};
function De(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Qt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function U(e) {
  return !De(e);
}
function ke(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function ro(e = {}, t = {}) {
  let n = Rr({}, e);
  return Object.keys(t).forEach((o) => {
    let r = o;
    ke(t[r]) && r in e && ke(e[r]) ? n[r] = ro(e[r], t[r]) : n[r] = t[r];
  }), n;
}
function Mr(...e) {
  return e.reduce((t, n, o) => o === 0 ? n : ro(t, n), {});
}
function ce(e, ...t) {
  return Qt(e) ? e(...t) : e;
}
function se(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function xe(e) {
  return se(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function en(e, t = "", n = {}) {
  let o = xe(t).split("."), r = o.shift();
  if (r) {
    if (ke(e)) {
      let a = Object.keys(e).find((s) => xe(s) === r) || "";
      return en(ce(e[a], n), o.join("."), n);
    }
    return;
  }
  return ce(e, n);
}
function ao(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Vr(e) {
  return U(e) && !isNaN(e);
}
function Ie(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Br(...e) {
  return Mr(...e);
}
function Je(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Ur(e) {
  return se(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function io(e) {
  return se(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function so() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let o = e.get(t);
    return o ? o.push(n) : o = [n], e.set(t, o), this;
  }, off(t, n) {
    let o = e.get(t);
    return o && o.splice(o.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let o = e.get(t);
    o && o.forEach((r) => {
      r(n);
    });
  }, clear() {
    e.clear();
  } };
}
function Ke(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let o = e[n];
      if (!o) continue;
      let r = typeof o;
      if (r === "string" || r === "number") t.push(o);
      else if (r === "object") {
        let a = Array.isArray(o) ? [Ke(...o)] : Object.entries(o).map(([s, l]) => l ? s : void 0);
        t = a.length ? t.concat(a.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Fr(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Ct(e, t) {
  if (e && t) {
    let n = (o) => {
      Fr(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function Hr() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Wr(e) {
  typeof e == "string" ? Ct(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, Hr() + "px"), Ct(document.body, e?.className || "p-overflow-hidden"));
}
function Qe(e, t) {
  if (e && t) {
    let n = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function Kr(e) {
  typeof e == "string" ? Qe(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), Qe(document.body, e?.className || "p-overflow-hidden"));
}
function Yr() {
  let e = window, t = document, n = t.documentElement, o = t.getElementsByTagName("body")[0], r = e.innerWidth || n.clientWidth || o.clientWidth, a = e.innerHeight || n.clientHeight || o.clientHeight;
  return { width: r, height: a };
}
function un(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Gr(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, o]) => e.style[n] = o));
}
function lo(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Zr(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function qr(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Zr(e));
}
function Re(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Pt(e, t = {}) {
  if (Re(e)) {
    let n = (o, r) => {
      var a, s;
      let l = (a = e?.$attrs) != null && a[o] ? [(s = e?.$attrs) == null ? void 0 : s[o]] : [];
      return [r].flat().reduce((i, c) => {
        if (c != null) {
          let d = typeof c;
          if (d === "string" || d === "number") i.push(c);
          else if (d === "object") {
            let u = Array.isArray(c) ? n(o, c) : Object.entries(c).map(([p, m]) => o === "style" && (m || m === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? p : void 0);
            i = u.length ? i.concat(u.filter((p) => !!p)) : i;
          }
        }
        return i;
      }, l);
    };
    Object.entries(t).forEach(([o, r]) => {
      if (r != null) {
        let a = o.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), r) : o === "p-bind" || o === "pBind" ? Pt(e, r) : (r = o === "class" ? [...new Set(n("class", r))].join(" ").trim() : o === "style" ? n("style", r).join(";").trim() : r, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = r), e.setAttribute(o, r));
      }
    });
  }
}
function co(e, t = {}, ...n) {
  {
    let o = document.createElement(e);
    return Pt(o, t), o.append(...n), o;
  }
}
function Xr(e, t) {
  return Re(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function Jr(e, t) {
  return Re(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function He(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function Qr(e, t) {
  if (Re(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function uo(e, t = "") {
  let n = Xr(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), o = [];
  for (let r of n) getComputedStyle(r).display != "none" && getComputedStyle(r).visibility != "hidden" && o.push(r);
  return o;
}
function Ze(e, t) {
  let n = uo(e, t);
  return n.length > 0 ? n[0] : null;
}
function pn(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function ea(e, t) {
  let n = uo(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function ta(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || un(document.documentElement) || un(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function po(e, t) {
  return e ? e.offsetHeight : 0;
}
function fn(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function fo() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function mn(e, t = "") {
  return Re(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function mo(e, t = "", n) {
  Re(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var xt = {};
function na(e = "pui_id_") {
  return Object.hasOwn(xt, e) || (xt[e] = 0), xt[e]++, `${e}${xt[e]}`;
}
function oa() {
  let e = [], t = (s, l, i = 999) => {
    let c = r(s, l, i), d = c.value + (c.key === s ? 0 : i) + 1;
    return e.push({ key: s, value: d }), d;
  }, n = (s) => {
    e = e.filter((l) => l.value !== s);
  }, o = (s, l) => r(s).value, r = (s, l, i = 0) => [...e].reverse().find((c) => !0) || { key: s, value: i }, a = (s) => s && parseInt(s.style.zIndex, 10) || 0;
  return { get: a, set: (s, l, i) => {
    l && (l.style.zIndex = String(t(s, !0, i)));
  }, clear: (s) => {
    s && (n(a(s)), s.style.zIndex = "");
  }, getCurrent: (s) => o(s) };
}
var zt = oa(), ra = Object.defineProperty, aa = Object.defineProperties, ia = Object.getOwnPropertyDescriptors, Ot = Object.getOwnPropertySymbols, ho = Object.prototype.hasOwnProperty, bo = Object.prototype.propertyIsEnumerable, hn = (e, t, n) => t in e ? ra(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ge = (e, t) => {
  for (var n in t || (t = {})) ho.call(t, n) && hn(e, n, t[n]);
  if (Ot) for (var n of Ot(t)) bo.call(t, n) && hn(e, n, t[n]);
  return e;
}, Dt = (e, t) => aa(e, ia(t)), _e = (e, t) => {
  var n = {};
  for (var o in e) ho.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && Ot) for (var o of Ot(e)) t.indexOf(o) < 0 && bo.call(e, o) && (n[o] = e[o]);
  return n;
}, sa = so(), J = sa, et = /{([^}]*)}/g, go = /(\d+\s+[\+\-\*\/]\s+\d+)/g, vo = /var\([^)]+\)/g;
function bn(e) {
  return se(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function la(e) {
  return ke(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function ca(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Bt(e = "", t = "") {
  return ca(`${se(e, !1) && se(t, !1) ? `${e}-` : e}${t}`);
}
function yo(e = "", t = "") {
  return `--${Bt(e, t)}`;
}
function da(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function xo(e, t = "", n = "", o = [], r) {
  if (se(e)) {
    let a = e.trim();
    if (da(a)) return;
    if (Ie(a, et)) {
      let s = a.replaceAll(et, (l) => {
        let i = l.replace(/{|}/g, "").split(".").filter((c) => !o.some((d) => Ie(c, d)));
        return `var(${yo(n, io(i.join("-")))}${U(r) ? `, ${r}` : ""})`;
      });
      return Ie(s.replace(vo, "0"), go) ? `calc(${s})` : s;
    }
    return a;
  } else if (Vr(e)) return e;
}
function ua(e, t, n) {
  se(t, !1) && e.push(`${t}:${n};`);
}
function Be(e, t) {
  return e ? `${e}{${t}}` : "";
}
function ko(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, l) {
    let i = [], c = 0, d = "", u = null, p = 0;
    for (; c <= s.length; ) {
      let m = s[c];
      if ((m === '"' || m === "'" || m === "`") && s[c - 1] !== "\\" && (u = u === m ? null : m), !u && (m === "(" && p++, m === ")" && p--, (m === "," || c === s.length) && p === 0)) {
        let v = d.trim();
        v.startsWith("dt(") ? i.push(ko(v, l)) : i.push(o(v)), d = "", c++;
        continue;
      }
      m !== void 0 && (d += m), c++;
    }
    return i;
  }
  function o(s) {
    let l = s[0];
    if ((l === '"' || l === "'" || l === "`") && s[s.length - 1] === l) return s.slice(1, -1);
    let i = Number(s);
    return isNaN(i) ? s : i;
  }
  let r = [], a = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") a.push(s), s += 2;
  else if (e[s] === ")" && a.length > 0) {
    let l = a.pop();
    a.length === 0 && r.push([l, s]);
  }
  if (!r.length) return e;
  for (let s = r.length - 1; s >= 0; s--) {
    let [l, i] = r[s], c = e.slice(l + 3, i), d = n(c, t), u = t(...d);
    e = e.slice(0, l) + u + e.slice(i + 1);
  }
  return e;
}
var wo = (e) => {
  var t;
  let n = D.getTheme(), o = Ut(n, e, void 0, "variable"), r = (t = o?.match(/--[\w-]+/g)) == null ? void 0 : t[0], a = Ut(n, e, void 0, "value");
  return { name: r, variable: o, value: a };
}, ze = (...e) => Ut(D.getTheme(), ...e), Ut = (e = {}, t, n, o) => {
  if (t) {
    let { variable: r, options: a } = D.defaults || {}, { prefix: s, transform: l } = e?.options || a || {}, i = Ie(t, et) ? t : `{${t}}`;
    return o === "value" || De(o) && l === "strict" ? D.getTokenValue(t) : xo(i, void 0, s, [r.excludedKeyRegex], n);
  }
  return "";
};
function kt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((o, r, a) => {
      var s;
      return o + r + ((s = ce(t[a], { dt: ze })) != null ? s : "");
    }, "");
    return ko(n, ze);
  }
  return ce(e, { dt: ze });
}
function pa(e, t = {}) {
  let n = D.defaults.variable, { prefix: o = n.prefix, selector: r = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, s = [], l = [], i = [{ node: e, path: o }];
  for (; i.length; ) {
    let { node: d, path: u } = i.pop();
    for (let p in d) {
      let m = d[p], v = la(m), x = Ie(p, a) ? Bt(u) : Bt(u, io(p));
      if (ke(v)) i.push({ node: v, path: x });
      else {
        let k = yo(x), S = xo(v, x, o, [a]);
        ua(l, k, S);
        let P = x;
        o && P.startsWith(o + "-") && (P = P.slice(o.length + 1)), s.push(P.replace(/-/g, "."));
      }
    }
  }
  let c = l.join("");
  return { value: l, tokens: s, declarations: c, css: Be(r, c) };
}
var be = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    var o;
    return (o = t.map((r) => r.resolve(n)).find((r) => r.matched)) != null ? o : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return pa(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var a, s, l, i, c, d, u;
  let { preset: p, options: m } = t, v, x, k, S, P, N, y;
  if (U(p) && m.transform !== "strict") {
    let { primitive: $, semantic: H, extend: q } = p, te = H || {}, { colorScheme: Q } = te, ne = _e(te, ["colorScheme"]), de = q || {}, { colorScheme: ue } = de, fe = _e(de, ["colorScheme"]), oe = Q || {}, { dark: re } = oe, ve = _e(oe, ["dark"]), le = ue || {}, { dark: me } = le, T = _e(le, ["dark"]), E = U($) ? this._toVariables({ primitive: $ }, m) : {}, K = U(ne) ? this._toVariables({ semantic: ne }, m) : {}, he = U(ve) ? this._toVariables({ light: ve }, m) : {}, Le = U(re) ? this._toVariables({ dark: re }, m) : {}, $e = U(fe) ? this._toVariables({ semantic: fe }, m) : {}, Ee = U(T) ? this._toVariables({ light: T }, m) : {}, mt = U(me) ? this._toVariables({ dark: me }, m) : {}, [Me, Ce] = [(a = E.declarations) != null ? a : "", E.tokens], [Ae, jt] = [(s = K.declarations) != null ? s : "", K.tokens || []], [Ye, ht] = [(l = he.declarations) != null ? l : "", he.tokens || []], [je, Nt] = [(i = Le.declarations) != null ? i : "", Le.tokens || []], [bt, I] = [(c = $e.declarations) != null ? c : "", $e.tokens || []], [g, h] = [(d = Ee.declarations) != null ? d : "", Ee.tokens || []], [Z, Ge] = [(u = mt.declarations) != null ? u : "", mt.tokens || []];
    v = this.transformCSS(e, Me, "light", "variable", m, o, r), x = Ce;
    let No = this.transformCSS(e, `${Ae}${Ye}`, "light", "variable", m, o, r), Io = this.transformCSS(e, `${je}`, "dark", "variable", m, o, r);
    k = `${No}${Io}`, S = [.../* @__PURE__ */ new Set([...jt, ...ht, ...Nt])];
    let zo = this.transformCSS(e, `${bt}${g}color-scheme:light`, "light", "variable", m, o, r), Do = this.transformCSS(e, `${Z}color-scheme:dark`, "dark", "variable", m, o, r);
    P = `${zo}${Do}`, N = [.../* @__PURE__ */ new Set([...I, ...h, ...Ge])], y = ce(p.css, { dt: ze });
  }
  return { primitive: { css: v, tokens: x }, semantic: { css: k, tokens: S }, global: { css: P, tokens: N }, style: y };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: o, set: r, defaults: a, selector: s }) {
  var l, i, c;
  let d, u, p;
  if (U(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), v = t, { colorScheme: x, extend: k, css: S } = v, P = _e(v, ["colorScheme", "extend", "css"]), N = k || {}, { colorScheme: y } = N, $ = _e(N, ["colorScheme"]), H = x || {}, { dark: q } = H, te = _e(H, ["dark"]), Q = y || {}, { dark: ne } = Q, de = _e(Q, ["dark"]), ue = U(P) ? this._toVariables({ [m]: ge(ge({}, P), $) }, n) : {}, fe = U(te) ? this._toVariables({ [m]: ge(ge({}, te), de) }, n) : {}, oe = U(q) ? this._toVariables({ [m]: ge(ge({}, q), ne) }, n) : {}, [re, ve] = [(l = ue.declarations) != null ? l : "", ue.tokens || []], [le, me] = [(i = fe.declarations) != null ? i : "", fe.tokens || []], [T, E] = [(c = oe.declarations) != null ? c : "", oe.tokens || []], K = this.transformCSS(m, `${re}${le}`, "light", "variable", n, r, a, s), he = this.transformCSS(m, T, "dark", "variable", n, r, a, s);
    d = `${K}${he}`, u = [.../* @__PURE__ */ new Set([...ve, ...me, ...E])], p = ce(S, { dt: ze });
  }
  return { css: d, tokens: u, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var a;
  let { preset: s, options: l } = t, i = (a = s?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: i, options: l, params: n, set: o, defaults: r });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var a, s;
  let l = e.replace("-directive", ""), { preset: i, options: c } = t, d = ((a = i?.components) == null ? void 0 : a[l]) || ((s = i?.directives) == null ? void 0 : s[l]);
  return this.getPreset({ name: l, preset: d, options: c, params: n, set: o, defaults: r });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, o) {
  let { cssLayer: r } = t;
  return r ? `@layer ${ce(r.order || r.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: a }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: r, defaults: a }), l = Object.entries(o).reduce((i, [c, d]) => i.push(`${c}="${d}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [c, d]) => {
    if (ke(d) && Object.hasOwn(d, "css")) {
      let u = Je(d.css), p = `${c}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${p}" ${l}>${u}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: a }) {
  var s;
  let l = { name: e, theme: t, params: n, set: r, defaults: a }, i = (s = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, c = Object.entries(o).reduce((d, [u, p]) => d.push(`${u}="${p}"`) && d, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${Je(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", o = "", r = {}) {
  let a = function(l, i = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: i, value: void 0 };
    c.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && et.test(this.value)) {
      let u = this.value.trim().replace(et, (p) => {
        var m;
        let v = p.slice(1, -1), x = this.tokens[v];
        if (!x) return console.warn(`Token not found for path: ${v}`), "__UNRESOLVED__";
        let k = x.computed(l, i, c);
        return Array.isArray(k) && k.length === 2 ? `light-dark(${k[0].value},${k[1].value})` : (m = k?.value) != null ? m : "__UNRESOLVED__";
      });
      d = go.test(u.replace(vo, "0")) ? `calc(${u})` : u;
    }
    return De(i.binding) && delete i.binding, c.pop(), { colorScheme: l, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, s = (l, i, c) => {
    Object.entries(l).forEach(([d, u]) => {
      let p = Ie(d, t.variable.excludedKeyRegex) ? i : i ? `${i}.${bn(d)}` : bn(d), m = c ? `${c}.${d}` : d;
      ke(u) ? s(u, p, m) : (r[p] || (r[p] = { paths: [], computed: (v, x = {}, k = []) => {
        if (r[p].paths.length === 1) return r[p].paths[0].computed(r[p].paths[0].scheme, x.binding, k);
        if (v && v !== "none") for (let S = 0; S < r[p].paths.length; S++) {
          let P = r[p].paths[S];
          if (P.scheme === v) return P.computed(v, x.binding, k);
        }
        return r[p].paths.map((S) => S.computed(S.scheme, x[S.scheme], k));
      } }), r[p].paths.push({ path: m, value: u, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: r }));
    });
  };
  return s(e, n, o), r;
}, getTokenValue(e, t, n) {
  var o;
  let r = ((l) => l.split(".").filter((i) => !Ie(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(o = e[r]) == null ? void 0 : o.computed(a)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, i) => {
    let c = i, { colorScheme: d } = c, u = _e(c, ["colorScheme"]);
    return l[d] = u, l;
  }, void 0);
}, getSelectorRule(e, t, n, o) {
  return n === "class" || n === "attr" ? Be(U(t) ? `${e}${t},${e} ${t}` : e, o) : Be(e, Be(t ?? ":root,:host", o));
}, transformCSS(e, t, n, o, r = {}, a, s, l) {
  if (U(t)) {
    let { cssLayer: i } = r;
    if (o !== "style") {
      let c = this.getColorSchemeOption(r, s);
      t = n === "dark" ? c.reduce((d, { type: u, selector: p }) => (U(p) && (d += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, l, u, t)), d), "") : Be(l ?? ":root,:host", t);
    }
    if (i) {
      let c = { name: "primeui" };
      ke(i) && (c.name = ce(i.name, { name: e, type: o })), U(c.name) && (t = Be(`@layer ${c.name}`, t), a?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, D = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Dt(ge({}, t), { options: ge(ge({}, this.defaults.options), t.options) }), this._tokens = be.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), J.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Dt(ge({}, this.theme), { preset: e }), this._tokens = be.createTokens(e, this.defaults), this.clearLoadedStyleNames(), J.emit("preset:change", e), J.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Dt(ge({}, this.theme), { options: e }), this.clearLoadedStyleNames(), J.emit("options:change", e), J.emit("theme:change", this.theme);
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
  return be.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return be.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return be.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return be.getPresetD(n);
}, getCustomPreset(e = "", t, n, o) {
  let r = { name: e, preset: t, options: this.options, selector: n, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return be.getPreset(r);
}, getLayerOrderCSS(e = "") {
  return be.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", o) {
  return be.transformCSS(e, t, o, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return be.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return be.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), J.emit(`theme:${t}:load`, e), !this._loadingStyles.size && J.emit("theme:load"));
} }, ee = {
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
}, fa = `
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
function gn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function vn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? gn(Object(n), !0).forEach(function(o) {
      ma(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : gn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function ma(e, t, n) {
  return (t = ha(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ha(e) {
  var t = ba(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function ba(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (tt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ga(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  rn() && rn().components ? Zn(e) : t ? e() : Ho(e);
}
var va = 0;
function ya(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = M(!1), o = M(e), r = M(null), a = fo() ? window.document : void 0, s = t.document, l = s === void 0 ? a : s, i = t.immediate, c = i === void 0 ? !0 : i, d = t.manual, u = d === void 0 ? !1 : d, p = t.name, m = p === void 0 ? "style_".concat(++va) : p, v = t.id, x = v === void 0 ? void 0 : v, k = t.media, S = k === void 0 ? void 0 : k, P = t.nonce, N = P === void 0 ? void 0 : P, y = t.first, $ = y === void 0 ? !1 : y, H = t.onMounted, q = H === void 0 ? void 0 : H, te = t.onUpdated, Q = te === void 0 ? void 0 : te, ne = t.onLoad, de = ne === void 0 ? void 0 : ne, ue = t.props, fe = ue === void 0 ? {} : ue, oe = function() {
  }, re = function(me) {
    var T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var E = vn(vn({}, fe), T), K = E.name || m, he = E.id || x, Le = E.nonce || N;
      r.value = l.querySelector('style[data-primevue-style-id="'.concat(K, '"]')) || l.getElementById(he) || l.createElement("style"), r.value.isConnected || (o.value = me || e, Pt(r.value, {
        type: "text/css",
        id: he,
        media: S,
        nonce: Le
      }), $ ? l.head.prepend(r.value) : l.head.appendChild(r.value), mo(r.value, "data-primevue-style-id", K), Pt(r.value, E), r.value.onload = function($e) {
        return de?.($e, {
          name: K
        });
      }, q?.(K)), !n.value && (oe = Ue(o, function($e) {
        r.value.textContent = $e, Q?.(K);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, ve = function() {
    !l || !n.value || (oe(), qr(r.value) && l.head.removeChild(r.value), n.value = !1, r.value = null);
  };
  return c && !u && ga(re), {
    id: x,
    name: m,
    el: r,
    css: o,
    unload: ve,
    load: re,
    isLoaded: Fo(n)
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
var yn, xn, kn, wn;
function _n(e, t) {
  return _a(e) || wa(e, t) || ka(e, t) || xa();
}
function xa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ka(e, t) {
  if (e) {
    if (typeof e == "string") return Sn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Sn(e, t) : void 0;
  }
}
function Sn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function wa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, a, s, l = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (o = a.call(n)).done) && (l.push(o.value), l.length !== t); i = !0) ;
    } catch (d) {
      c = !0, r = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw r;
      }
    }
    return l;
  }
}
function _a(e) {
  if (Array.isArray(e)) return e;
}
function $n(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Rt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? $n(Object(n), !0).forEach(function(o) {
      Sa(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : $n(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Sa(e, t, n) {
  return (t = $a(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $a(e) {
  var t = Ca(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Ca(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (nt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function wt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Pa = function(t) {
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
}, Oa = {}, Ta = {}, V = {
  name: "base",
  css: Pa,
  style: fa,
  classes: Oa,
  inlineStyles: Ta,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, r = o(kt(yn || (yn = wt(["", ""])), t));
    return U(r) ? ya(Je(r), Rt({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return D.transformCSS(n.name || t.name, "".concat(r).concat(kt(xn || (xn = wt(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return D.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return D.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return D.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, o) {
    return D.getCustomPreset(this.name, t, n, o);
  },
  getLayerOrderThemeCSS: function() {
    return D.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = ce(this.css, {
        dt: ze
      }) || "", r = Je(kt(kn || (kn = wt(["", "", ""])), o, t)), a = Object.entries(n).reduce(function(s, l) {
        var i = _n(l, 2), c = i[0], d = i[1];
        return s.push("".concat(c, '="').concat(d, '"')) && s;
      }, []).join(" ");
      return U(r) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(r, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return D.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [D.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var r = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = kt(wn || (wn = wt(["", ""])), ce(this.style, {
        dt: ze
      })), s = Je(D.transformCSS(r, a)), l = Object.entries(n).reduce(function(i, c) {
        var d = _n(c, 2), u = d[0], p = d[1];
        return i.push("".concat(u, '="').concat(p, '"')) && i;
      }, []).join(" ");
      U(s) && o.push('<style type="text/css" data-primevue-style-id="'.concat(r, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return Rt(Rt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Oe = so();
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function Cn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function _t(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Cn(Object(n), !0).forEach(function(o) {
      La(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Cn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function La(e, t, n) {
  return (t = Ea(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ea(e) {
  var t = Aa(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function Aa(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ot(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ja = {
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
    text: [ee.STARTS_WITH, ee.CONTAINS, ee.NOT_CONTAINS, ee.ENDS_WITH, ee.EQUALS, ee.NOT_EQUALS],
    numeric: [ee.EQUALS, ee.NOT_EQUALS, ee.LESS_THAN, ee.LESS_THAN_OR_EQUAL_TO, ee.GREATER_THAN, ee.GREATER_THAN_OR_EQUAL_TO],
    date: [ee.DATE_IS, ee.DATE_IS_NOT, ee.DATE_BEFORE, ee.DATE_AFTER]
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
}, Na = Symbol();
function Ia(e, t) {
  var n = {
    config: Wo(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Na, n), za(), Da(e, n), n;
}
var We = [];
function za() {
  J.clear(), We.forEach(function(e) {
    return e?.();
  }), We = [];
}
function Da(e, t) {
  var n = M(!1), o = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !D.isStyleNameLoaded("common")) {
      var d, u, p = ((d = V.getCommonTheme) === null || d === void 0 ? void 0 : d.call(V)) || {}, m = p.primitive, v = p.semantic, x = p.global, k = p.style, S = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      V.load(m?.css, _t({
        name: "primitive-variables"
      }, S)), V.load(v?.css, _t({
        name: "semantic-variables"
      }, S)), V.load(x?.css, _t({
        name: "global-variables"
      }, S)), V.loadStyle(_t({
        name: "global-style"
      }, S), k), D.setLoadedStyleName("common");
    }
  };
  J.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var r = Ue(t.config, function(i, c) {
    Oe.emit("config:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = Ue(function() {
    return t.config.ripple;
  }, function(i, c) {
    Oe.emit("config:ripple:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = Ue(function() {
    return t.config.theme;
  }, function(i, c) {
    n.value || D.setTheme(i), t.config.unstyled || o(), n.value = !1, Oe.emit("config:theme:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = Ue(function() {
    return t.config.unstyled;
  }, function(i, c) {
    !i && t.config.theme && o(), Oe.emit("config:unstyled:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  We.push(r), We.push(a), We.push(s), We.push(l);
}
var Ra = {
  install: function(t, n) {
    var o = Br(ja, n);
    Ia(t, o);
  }
}, tn = {
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
    this.mounted = fo();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Ma(e, t, n, o, r, a) {
  return a.inline ? X(e.$slots, "default", {
    key: 0
  }) : r.mounted ? (_(), Te(qn, {
    key: 1,
    to: n.appendTo
  }, [X(e.$slots, "default")], 8, ["to"])) : W("", !0);
}
tn.render = Ma;
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
function Va() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Ko();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Pn = V.extend({
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
function Ba(e) {
  return $o(e) || Ua(e) || So(e) || _o();
}
function Ua(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function qe(e, t) {
  return $o(e) || Fa(e, t) || So(e, t) || _o();
}
function _o() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function So(e, t) {
  if (e) {
    if (typeof e == "string") return Ft(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ft(e, t) : void 0;
  }
}
function Ft(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Fa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, a, s, l = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (o = a.call(n)).done) && (l.push(o.value), l.length !== t); i = !0) ;
    } catch (d) {
      c = !0, r = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw r;
      }
    }
    return l;
  }
}
function $o(e) {
  if (Array.isArray(e)) return e;
}
function On(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function L(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? On(Object(n), !0).forEach(function(o) {
      Xe(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : On(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Xe(e, t, n) {
  return (t = Ha(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ha(e) {
  var t = Wa(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function Wa(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (rt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Et = {
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
        J.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var o = this;
        J.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return o._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, o, r, a, s, l, i, c, d, u, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, v = p ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (r = v || m) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (a = r.onBeforeCreate) === null || a === void 0 || a.call(r);
    var x = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, k = x ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, S = x ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 ? void 0 : c.pt;
    (d = S || k) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (u = d.onBeforeCreate) === null || u === void 0 || u.call(d), this.$attrSelector = Va(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Jr(Re(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = L({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), o?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return Qt(t) ? t.apply(void 0, o) : z.apply(void 0, o);
    },
    _load: function() {
      Pe.isStyleNameLoaded("base") || (V.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Pe.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Pe.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Pn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Pe.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      U(t) && V.load(t, L({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!D.isStyleNameLoaded("common")) {
          var o, r, a = ((o = this.$style) === null || o === void 0 || (r = o.getCommonTheme) === null || r === void 0 ? void 0 : r.call(o)) || {}, s = a.primitive, l = a.semantic, i = a.global, c = a.style;
          V.load(s?.css, L({
            name: "primitive-variables"
          }, this.$styleOptions)), V.load(l?.css, L({
            name: "semantic-variables"
          }, this.$styleOptions)), V.load(i?.css, L({
            name: "global-variables"
          }, this.$styleOptions)), V.loadStyle(L({
            name: "global-style"
          }, this.$styleOptions), c), D.setLoadedStyleName("common");
        }
        if (!D.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, u, p, m, v = ((d = this.$style) === null || d === void 0 || (u = d.getComponentTheme) === null || u === void 0 ? void 0 : u.call(d)) || {}, x = v.css, k = v.style;
          (p = this.$style) === null || p === void 0 || p.load(x, L({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(L({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), k), D.setLoadedStyleName(this.$style.name);
        }
        if (!D.isStyleNameLoaded("layer-order")) {
          var S, P, N = (S = this.$style) === null || S === void 0 || (P = S.getLayerOrderThemeCSS) === null || P === void 0 ? void 0 : P.call(S);
          V.load(N, L({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), D.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, o, r, a = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = a.css, l = (r = this.$style) === null || r === void 0 ? void 0 : r.load(s, L({
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
      Pe.clearLoadedStyleNames(), J.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      J.off("theme:change", this._loadCoreStyles), J.off("theme:change", this._load), J.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return en(t, n, o);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(o) && !!r[o.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = l.mergeSections, c = i === void 0 ? !0 : i, d = l.mergeProps, u = d === void 0 ? !1 : d, p = a ? s ? this._useGlobalPT(this._getPTClassValue, o, r) : this._useDefaultPT(this._getPTClassValue, o, r) : void 0, m = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, L(L({}, r), {}, {
        global: p || {}
      })), v = this._getPTDatasets(o);
      return c || !c && m ? u ? this._mergeProps(u, p, m, v) : L(L(L({}, p), m), v) : L(L({}, m), v);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return z(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", a = o === "root" && U((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && L(L({}, o === "root" && L(L(Xe({}, "".concat(r, "name"), xe(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && Xe({}, "".concat(r, "extend"), xe(this.$.type.name))), {}, Xe({}, "".concat(this.$attrSelector), ""))), {}, Xe({}, "".concat(r, "section"), xe(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return se(t) || ao(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, a = function(l) {
        var i, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = r ? r(l) : l, u = xe(o), p = xe(n.$name);
        return (i = c ? u !== p ? d?.[u] : void 0 : d?.[u]) !== null && i !== void 0 ? i : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, o, r) {
      var a = function(x) {
        return n(x, o, r);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, l = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = l.mergeSections, c = i === void 0 ? !0 : i, d = l.mergeProps, u = d === void 0 ? !1 : d, p = a(t.originalValue), m = a(t.value);
        return p === void 0 && m === void 0 ? void 0 : se(m) ? m : se(p) ? p : c || !c && m ? u ? this._mergeProps(u, p, m) : L(L({}, p), m) : m;
      }
      return a(t);
    },
    _useGlobalPT: function(t, n, o) {
      return this._usePT(this.globalPT, t, n, o);
    },
    _useDefaultPT: function(t, n, o) {
      return this._usePT(this.defaultPT, t, n, o);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, L(L({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = z(this.$_attrsWithoutPT, this.ptm(n, o));
      return r?.hasOwnProperty("id") && ((t = r.id) !== null && t !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, L({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, L(L({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, t, L(L({}, this.$params), o)), a = this._getOptionValue(Pn.inlineStyles, t, L(L({}, this.$params), o));
        return [a, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return ce(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, L({}, n.$params)) || ce(o, L({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var r = qe(o, 1), a = r[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return L(L({
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
        var n = qe(t, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, n) {
        var o = qe(n, 2), r = o[0], a = o[1], s = r.split(":"), l = Ba(s), i = Ft(l).slice(1);
        return i?.reduce(function(c, d, u, p) {
          return !c[d] && (c[d] = u === p.length - 1 ? a : {}), c[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = qe(t, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, n) {
        var o = qe(n, 2), r = o[0], a = o[1];
        return t[r] = a, t;
      }, {});
    }
  }
}, Ka = `
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
`, Ya = V.extend({
  name: "baseicon",
  css: Ka
});
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function Tn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ln(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Tn(Object(n), !0).forEach(function(o) {
      Ga(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Tn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Ga(e, t, n) {
  return (t = Za(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Za(e) {
  var t = qa(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function qa(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (at(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var At = {
  name: "BaseIcon",
  extends: Et,
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
  style: Ya,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = De(this.label);
      return Ln(Ln({}, !this.isUnstyled && {
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
function En(e, t) {
  return ei(e) || Qa(e, t) || Ja(e, t) || Xa();
}
function Xa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ja(e, t) {
  if (e) {
    if (typeof e == "string") return An(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? An(e, t) : void 0;
  }
}
function An(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Qa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, a, s, l = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (o = a.call(n)).done) && (l.push(o.value), l.length !== t); i = !0) ;
    } catch (d) {
      c = !0, r = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw r;
      }
    }
    return l;
  }
}
function ei(e) {
  if (Array.isArray(e)) return e;
}
function jn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function j(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? jn(Object(n), !0).forEach(function(o) {
      Ht(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : jn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Ht(e, t, n) {
  return (t = ti(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ti(e) {
  var t = ni(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function ni(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (it(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var O = {
  _getMeta: function() {
    return [ke(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], ce(ke(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var o, r, a;
    return (o = (t == null || (r = t.instance) === null || r === void 0 ? void 0 : r.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: en,
  _getPTValue: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var P = O._getOptionValue.apply(O, arguments);
      return se(P) || ao(P) ? {
        class: P
      } : P;
    }, c = ((t = o.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = c.mergeSections, u = d === void 0 ? !0 : d, p = c.mergeProps, m = p === void 0 ? !1 : p, v = l ? O._useDefaultPT(o, o.defaultPT(), i, a, s) : void 0, x = O._usePT(o, O._getPT(r, o.$name), i, a, j(j({}, s), {}, {
      global: v || {}
    })), k = O._getPTDatasets(o, a);
    return u || !u && x ? m ? O._mergeProps(o, m, v, x, k) : j(j(j({}, v), x), k) : j(j({}, x), k);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return j(j({}, n === "root" && Ht({}, "".concat(o, "name"), xe(t.$name))), {}, Ht({}, "".concat(o, "section"), xe(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, r = function(s) {
      var l, i = o ? o(s) : s, c = xe(n);
      return (l = i?.[c]) !== null && l !== void 0 ? l : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: r(t.originalValue),
      value: r(t.value)
    } : r(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(k) {
      return o(k, r, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, i = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, c = i.mergeSections, d = c === void 0 ? !0 : c, u = i.mergeProps, p = u === void 0 ? !1 : u, m = s(n.originalValue), v = s(n.value);
      return m === void 0 && v === void 0 ? void 0 : se(v) ? v : se(m) ? m : d || !d && v ? p ? O._mergeProps(t, p, m, v) : j(j({}, m), v) : v;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return O._usePT(t, n, o, r, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, a = O._getConfig(o, r), s = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    O._loadCoreStyles(n, s), O._loadThemeStyles(n, s), O._loadScopedThemeStyles(n, s), O._removeThemeListeners(n), n.$loadStyles = function() {
      return O._loadThemeStyles(n, s);
    }, O._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!Pe.isStyleNameLoaded((t = o.$style) === null || t === void 0 ? void 0 : t.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var a;
      V.loadCSS(r), (a = o.$style) === null || a === void 0 || a.loadCSS(r), Pe.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, o, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (t = r.theme) === null || t === void 0 ? void 0 : t.call(r)) === "none")) {
      if (!D.isStyleNameLoaded("common")) {
        var s, l, i = ((s = r.$style) === null || s === void 0 || (l = s.getCommonTheme) === null || l === void 0 ? void 0 : l.call(s)) || {}, c = i.primitive, d = i.semantic, u = i.global, p = i.style;
        V.load(c?.css, j({
          name: "primitive-variables"
        }, a)), V.load(d?.css, j({
          name: "semantic-variables"
        }, a)), V.load(u?.css, j({
          name: "global-variables"
        }, a)), V.loadStyle(j({
          name: "global-style"
        }, a), p), D.setLoadedStyleName("common");
      }
      if (!D.isStyleNameLoaded((n = r.$style) === null || n === void 0 ? void 0 : n.name) && (o = r.$style) !== null && o !== void 0 && o.name) {
        var m, v, x, k, S = ((m = r.$style) === null || m === void 0 || (v = m.getDirectiveTheme) === null || v === void 0 ? void 0 : v.call(m)) || {}, P = S.css, N = S.style;
        (x = r.$style) === null || x === void 0 || x.load(P, j({
          name: "".concat(r.$style.name, "-variables")
        }, a)), (k = r.$style) === null || k === void 0 || k.loadStyle(j({
          name: "".concat(r.$style.name, "-style")
        }, a), N), D.setLoadedStyleName(r.$style.name);
      }
      if (!D.isStyleNameLoaded("layer-order")) {
        var y, $, H = (y = r.$style) === null || y === void 0 || ($ = y.getLayerOrderThemeCSS) === null || $ === void 0 ? void 0 : $.call(y);
        V.load(H, j({
          name: "layer-order",
          first: !0
        }, a)), D.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = t.preset();
    if (o && t.$attrSelector) {
      var r, a, s, l = ((r = t.$style) === null || r === void 0 || (a = r.getPresetTheme) === null || a === void 0 ? void 0 : a.call(r, o, "[".concat(t.$attrSelector, "]"))) || {}, i = l.css, c = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, j({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = c.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Pe.clearLoadedStyleNames(), J.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    J.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, o, r, a, s) {
    var l, i, c = "on".concat(Ur(n)), d = O._getConfig(r, a), u = o?.$instance, p = O._usePT(u, O._getPT(r == null || (l = r.value) === null || l === void 0 ? void 0 : l.pt, t), O._getOptionValue, "hooks.".concat(c)), m = O._useDefaultPT(u, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], O._getOptionValue, "hooks.".concat(c)), v = {
      el: o,
      binding: r,
      vnode: a,
      prevVnode: s
    };
    p?.(u, v), m?.(u, v);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++)
      o[r - 2] = arguments[r];
    return Qt(t) ? t.apply(void 0, o) : z.apply(void 0, o);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(l, i, c, d, u) {
      var p, m, v, x;
      i._$instances = i._$instances || {};
      var k = O._getConfig(c, d), S = i._$instances[t] || {}, P = De(S) ? j(j({}, n), n?.methods) : {};
      i._$instances[t] = j(j({}, S), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: c,
        $modifiers: c?.modifiers,
        $value: c?.value,
        $el: S.$el || i || void 0,
        $style: j({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: k,
        $attrSelector: (p = i.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return O._getPT(k?.pt, void 0, function(y) {
            var $;
            return y == null || ($ = y.directives) === null || $ === void 0 ? void 0 : $[t];
          });
        },
        isUnstyled: function() {
          var y, $;
          return ((y = i._$instances[t]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.unstyled) !== void 0 ? ($ = i._$instances[t]) === null || $ === void 0 || ($ = $.$binding) === null || $ === void 0 || ($ = $.value) === null || $ === void 0 ? void 0 : $.unstyled : k?.unstyled;
        },
        theme: function() {
          var y;
          return (y = i._$instances[t]) === null || y === void 0 || (y = y.$primevueConfig) === null || y === void 0 ? void 0 : y.theme;
        },
        preset: function() {
          var y;
          return (y = i._$instances[t]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.dt;
        },
        /* instance's methods */
        ptm: function() {
          var y, $ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", H = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return O._getPTValue(i._$instances[t], (y = i._$instances[t]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.pt, $, j({}, H));
        },
        ptmo: function() {
          var y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, $ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", H = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return O._getPTValue(i._$instances[t], y, $, H, !1);
        },
        cx: function() {
          var y, $, H = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", q = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (y = i._$instances[t]) !== null && y !== void 0 && y.isUnstyled() ? void 0 : O._getOptionValue(($ = i._$instances[t]) === null || $ === void 0 || ($ = $.$style) === null || $ === void 0 ? void 0 : $.classes, H, j({}, q));
        },
        sx: function() {
          var y, $ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", H = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, q = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return H ? O._getOptionValue((y = i._$instances[t]) === null || y === void 0 || (y = y.$style) === null || y === void 0 ? void 0 : y.inlineStyles, $, j({}, q)) : void 0;
        }
      }, P), i.$instance = i._$instances[t], (m = (v = i.$instance)[l]) === null || m === void 0 || m.call(v, i, c, d, u), i["$".concat(t)] = i.$instance, O._hook(t, l, i, c, d, u), i.$pd || (i.$pd = {}), i.$pd[t] = j(j({}, (x = i.$pd) === null || x === void 0 ? void 0 : x[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, r = function(l) {
      var i, c, d, u = l._$instances[t], p = u?.watch, m = function(k) {
        var S, P = k.newValue, N = k.oldValue;
        return p == null || (S = p.config) === null || S === void 0 ? void 0 : S.call(u, P, N);
      }, v = function(k) {
        var S, P = k.newValue, N = k.oldValue;
        return p == null || (S = p["config.ripple"]) === null || S === void 0 ? void 0 : S.call(u, P, N);
      };
      u.$watchersCallback = {
        config: m,
        "config.ripple": v
      }, p == null || (i = p.config) === null || i === void 0 || i.call(u, u?.$primevueConfig), Oe.on("config:change", m), p == null || (c = p["config.ripple"]) === null || c === void 0 || c.call(u, u == null || (d = u.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Oe.on("config:ripple:change", v);
    }, a = function(l) {
      var i = l._$instances[t].$watchersCallback;
      i && (Oe.off("config:change", i.config), Oe.off("config:ripple:change", i["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, i, c, d) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: na("pd")
        }, o("created", l, i, c, d);
      },
      beforeMount: function(l, i, c, d) {
        var u;
        O._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, c), o("beforeMount", l, i, c, d), r(l);
      },
      mounted: function(l, i, c, d) {
        var u;
        O._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, c), o("mounted", l, i, c, d);
      },
      beforeUpdate: function(l, i, c, d) {
        o("beforeUpdate", l, i, c, d);
      },
      updated: function(l, i, c, d) {
        var u;
        O._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, c), o("updated", l, i, c, d);
      },
      beforeUnmount: function(l, i, c, d) {
        var u;
        a(l), O._removeThemeListeners((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance), o("beforeUnmount", l, i, c, d);
      },
      unmounted: function(l, i, c, d) {
        var u;
        (u = l.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), o("unmounted", l, i, c, d);
      }
    };
  },
  extend: function() {
    var t = O._getMeta.apply(O, arguments), n = En(t, 2), o = n[0], r = n[1];
    return j({
      extend: function() {
        var s = O._getMeta.apply(O, arguments), l = En(s, 2), i = l[0], c = l[1];
        return O.extend(i, j(j(j({}, r), r?.methods), c));
      }
    }, O._extend(o, r));
  }
}, oi = `
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
`, ri = {
  root: "p-ink"
}, ai = V.extend({
  name: "ripple-directive",
  style: oi,
  classes: ri
}), ii = O.extend({
  style: ai
});
function st(e) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, st(e);
}
function si(e) {
  return ui(e) || di(e) || ci(e) || li();
}
function li() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ci(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function di(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ui(e) {
  if (Array.isArray(e)) return Wt(e);
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Nn(e, t, n) {
  return (t = pi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function pi(e) {
  var t = fi(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function fi(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (st(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Co = ii.extend("ripple", {
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
      n || (n = co("span", Nn(Nn({
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
      var n = this, o = t.currentTarget, r = this.getInk(o);
      if (!(!r || getComputedStyle(r, null).display === "none")) {
        if (!this.isUnstyled() && Qe(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !pn(r) && !fn(r)) {
          var a = Math.max(lo(o), po(o));
          r.style.height = a + "px", r.style.width = a + "px";
        }
        var s = ta(o), l = t.pageX - s.left + document.body.scrollTop - fn(r) / 2, i = t.pageY - s.top + document.body.scrollLeft - pn(r) / 2;
        r.style.top = i + "px", r.style.left = l + "px", !this.isUnstyled() && Ct(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!n.isUnstyled() && Qe(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Qe(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? si(t.children).find(function(n) {
        return Qr(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const mi = "data-wippy-overlay-layer";
function Po() {
  return typeof window < "u" && typeof window.document < "u";
}
function Oo() {
  return Po() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function hi() {
  return Oo() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const bi = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let gi = 0;
const Tt = /* @__PURE__ */ new WeakMap();
function In(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function vi(e, t) {
  if (!bi.test(e.className))
    return;
  const n = e.style.cssText;
  In(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Tt.has(e)) {
    const o = new MutationObserver(() => {
      const r = e.style;
      (r.top !== "auto" || r.left !== "auto" || r.margin !== "0px" || r.getPropertyPriority("top") !== "important" || r.getPropertyPriority("left") !== "important" || r.getPropertyPriority("margin") !== "important" || r.getPropertyPriority("min-width") !== "important" || r.maxWidth !== "stretch" || r.getPropertyPriority("max-width") !== "important") && In(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), Tt.set(e, o);
  }
}
function nn(e) {
  const t = Tt.get(e);
  t && (t.disconnect(), Tt.delete(e));
}
function yi(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Kt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Lt = /* @__PURE__ */ new Set(), on = /* @__PURE__ */ new WeakMap();
let zn = !1, Yt = !1;
function xi() {
  Yt = !1;
  for (const e of Lt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && nn(t);
      Lt.delete(e), on.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Kt(e);
  }
}
function Dn() {
  Yt || (Yt = !0, requestAnimationFrame(xi));
}
function ki(e) {
  const t = document.createElement("div");
  t.setAttribute(mi, "");
  const n = Oo();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Kt(t);
  const o = new MutationObserver((r) => {
    const a = t.__wippyAnchorName;
    for (const s of r) {
      if (a)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && vi(l, a);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && nn(l);
    }
    t.isConnected && t.childElementCount > 0 && Kt(t);
  });
  return o.observe(t, { childList: !0 }), on.set(t, o), Lt.add(t), zn || (zn = !0, window.addEventListener("scroll", Dn, { capture: !0, passive: !0 }), window.addEventListener("resize", Dn, { passive: !0 })), t;
}
function Rn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = ki(e.hostRoot), hi())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++gi}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Mn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && nn(t);
    Lt.delete(e.layer), on.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Vn = !1;
function wi() {
  if (Vn)
    return;
  Vn = !0;
  const e = tn;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Po() && (this.hostRoot = yi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Rn(this), this.$watch("inline", (t) => {
      t ? Mn(this) : Rn(this);
    })));
  }, e.render = function() {
    return this.inline ? X(this.$slots, "default", { key: 0 }) : this.mounted ? Yo(qn, { key: 1, to: this.resolvedTarget || document.body }, [
      X(this.$slots, "default")
    ]) : W("", !0);
  }, e.unmounted = function() {
    Mn(this);
  };
}
const _i = {
  install: (e) => {
    wi(), e.use(Ra, { theme: "none" });
  }
};
var To = {
  name: "SpinnerIcon",
  extends: At
};
function Si(e) {
  return Oi(e) || Pi(e) || Ci(e) || $i();
}
function $i() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ci(e, t) {
  if (e) {
    if (typeof e == "string") return Gt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gt(e, t) : void 0;
  }
}
function Pi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Oi(e) {
  if (Array.isArray(e)) return Gt(e);
}
function Gt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ti(e, t, n, o, r, a) {
  return _(), C("svg", z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Si(t[0] || (t[0] = [b("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
To.render = Ti;
var Li = `
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
`, Ei = {
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": U(n.value) && String(n.value).length === 1,
      "p-badge-dot": De(n.value) && !o.$slots.default,
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
}, Ai = V.extend({
  name: "badge",
  style: Li,
  classes: Ei
}), ji = {
  name: "BaseBadge",
  extends: Et,
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
  style: Ai,
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
function Bn(e, t, n) {
  return (t = Ni(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ni(e) {
  var t = Ii(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function Ii(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (lt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Lo = {
  name: "Badge",
  extends: ji,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Ke(Bn(Bn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, zi = ["data-p"];
function Di(e, t, n, o, r, a) {
  return _(), C("span", z({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [X(e.$slots, "default", {}, function() {
    return [ie(R(e.value), 1)];
  })], 16, zi);
}
Lo.render = Di;
var Ri = `
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
function ye(e, t, n) {
  return (t = Mi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Mi(e) {
  var t = Vi(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function Vi(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ct(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Bi = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-button p-component", ye(ye(ye(ye(ye(ye(ye(ye(ye({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", ye({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Ui = V.extend({
  name: "button",
  style: Ri,
  classes: Bi
}), Fi = {
  name: "BaseButton",
  extends: Et,
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
  style: Ui,
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
function ae(e, t, n) {
  return (t = Hi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Hi(e) {
  var t = Wi(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function Wi(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (dt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var G = {
  name: "Button",
  extends: Fi,
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
      return z(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return De(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return Ke(ae(ae(ae(ae(ae(ae(ae(ae(ae(ae({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Ke(ae(ae({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Ke(ae(ae({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: To,
    Badge: Lo
  },
  directives: {
    ripple: Co
  }
}, Ki = ["data-p"], Yi = ["data-p"];
function Gi(e, t, n, o, r, a) {
  var s = $t("SpinnerIcon"), l = $t("Badge"), i = Xn("ripple");
  return e.asChild ? X(e.$slots, "default", {
    key: 1,
    class: Y(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : Fe((_(), Te(Mt(e.as), z({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: B(function() {
      return [X(e.$slots, "default", {}, function() {
        return [e.loading ? X(e.$slots, "loadingicon", z({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (_(), C("span", z({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (_(), Te(s, z({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : X(e.$slots, "icon", z({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (_(), C("span", z({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, Ki)) : W("", !0)];
        }), e.label ? (_(), C("span", z({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), R(e.label), 17, Yi)) : W("", !0), e.badge ? (_(), Te(l, {
          key: 3,
          value: e.badge,
          class: Y(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : W("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
G.render = Gi;
var Eo = {
  name: "TimesIcon",
  extends: At
};
function Zi(e) {
  return Qi(e) || Ji(e) || Xi(e) || qi();
}
function qi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Xi(e, t) {
  if (e) {
    if (typeof e == "string") return Zt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zt(e, t) : void 0;
  }
}
function Ji(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Qi(e) {
  if (Array.isArray(e)) return Zt(e);
}
function Zt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function es(e, t, n, o, r, a) {
  return _(), C("svg", z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Zi(t[0] || (t[0] = [b("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Eo.render = es;
var Ao = {
  name: "WindowMaximizeIcon",
  extends: At
};
function ts(e) {
  return as(e) || rs(e) || os(e) || ns();
}
function ns() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function os(e, t) {
  if (e) {
    if (typeof e == "string") return qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qt(e, t) : void 0;
  }
}
function rs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function as(e) {
  if (Array.isArray(e)) return qt(e);
}
function qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function is(e, t, n, o, r, a) {
  return _(), C("svg", z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ts(t[0] || (t[0] = [b("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ao.render = is;
var jo = {
  name: "WindowMinimizeIcon",
  extends: At
};
function ss(e) {
  return us(e) || ds(e) || cs(e) || ls();
}
function ls() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function cs(e, t) {
  if (e) {
    if (typeof e == "string") return Xt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xt(e, t) : void 0;
  }
}
function ds(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function us(e) {
  if (Array.isArray(e)) return Xt(e);
}
function Xt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function ps(e, t, n, o, r, a) {
  return _(), C("svg", z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ss(t[0] || (t[0] = [b("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
jo.render = ps;
var fs = V.extend({
  name: "focustrap-directive"
}), ms = O.extend({
  style: fs
});
function ut(e) {
  "@babel/helpers - typeof";
  return ut = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ut(e);
}
function Un(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Fn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Un(Object(n), !0).forEach(function(o) {
      hs(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Un(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function hs(e, t, n) {
  return (t = bs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function bs(e) {
  var t = gs(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function gs(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ut(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var vs = ms.extend("focustrap", {
  mounted: function(t, n) {
    var o = n.value || {}, r = o.disabled;
    r || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var o = n.value || {}, r = o.disabled;
    r && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var o = this, r = n.value || {}, a = r.onFocusIn, s = r.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(l) {
        l.forEach(function(i) {
          if (i.type === "childList" && !t.contains(document.activeElement)) {
            var c = function(u) {
              var p = mn(u) ? mn(u, o.getComputedSelector(t.$_pfocustrap_focusableselector)) ? u : Ze(t, o.getComputedSelector(t.$_pfocustrap_focusableselector)) : Ze(u);
              return U(p) ? p : u.nextSibling && c(u.nextSibling);
            };
            He(c(i.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(l) {
        return a && a(l);
      }, t.$_pfocustrap_focusoutlistener = function(l) {
        return s && s(l);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: Fn(Fn({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var o = n.value || {}, r = o.autoFocusSelector, a = r === void 0 ? "" : r, s = o.firstFocusableSelector, l = s === void 0 ? "" : s, i = o.autoFocus, c = i === void 0 ? !1 : i, d = Ze(t, "[autofocus]".concat(this.getComputedSelector(a)));
      c && !d && (d = Ze(t, this.getComputedSelector(l))), He(d);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, r = t.relatedTarget, a = r === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(r)) ? Ze(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      He(a);
    },
    onLastHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, r = t.relatedTarget, a = r === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(r)) ? ea(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      He(a);
    },
    createHiddenFocusableElements: function(t, n) {
      var o = this, r = n.value || {}, a = r.tabIndex, s = a === void 0 ? 0 : a, l = r.firstFocusableSelector, i = l === void 0 ? "" : l, c = r.lastFocusableSelector, d = c === void 0 ? "" : c, u = function(x) {
        return co("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: s,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: x?.bind(o)
        });
      }, p = u(this.onFirstHiddenElementFocus), m = u(this.onLastHiddenElementFocus);
      p.$_pfocustrap_lasthiddenfocusableelement = m, p.$_pfocustrap_focusableselector = i, p.setAttribute("data-pc-section", "firstfocusableelement"), m.$_pfocustrap_firsthiddenfocusableelement = p, m.$_pfocustrap_focusableselector = d, m.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(p), t.append(m);
    }
  }
});
function Hn() {
  Wr({
    variableName: wo("scrollbar.width").name
  });
}
function Wn() {
  Kr({
    variableName: wo("scrollbar.width").name
  });
}
var ys = `
    .p-dialog {
        max-height: 90%;
        transform: scale(1);
        border-radius: dt('dialog.border.radius');
        box-shadow: dt('dialog.shadow');
        background: dt('dialog.background');
        border: 1px solid dt('dialog.border.color');
        color: dt('dialog.color');
        will-change: transform;
    }

    .p-dialog-content {
        overflow-y: auto;
        padding: dt('dialog.content.padding');
        flex-grow: 1;
    }

    .p-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        padding: dt('dialog.header.padding');
    }

    .p-dialog-title {
        font-weight: dt('dialog.title.font.weight');
        font-size: dt('dialog.title.font.size');
    }

    .p-dialog-footer {
        flex-shrink: 0;
        padding: dt('dialog.footer.padding');
        display: flex;
        justify-content: flex-end;
        gap: dt('dialog.footer.gap');
    }

    .p-dialog-header-actions {
        display: flex;
        align-items: center;
        gap: dt('dialog.header.gap');
    }

    .p-dialog-top .p-dialog,
    .p-dialog-bottom .p-dialog,
    .p-dialog-left .p-dialog,
    .p-dialog-right .p-dialog,
    .p-dialog-topleft .p-dialog,
    .p-dialog-topright .p-dialog,
    .p-dialog-bottomleft .p-dialog,
    .p-dialog-bottomright .p-dialog {
        margin: 1rem;
    }

    .p-dialog-maximized {
        width: 100vw !important;
        height: 100vh !important;
        top: 0px !important;
        left: 0px !important;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
    }

    .p-dialog .p-resizable-handle {
        position: absolute;
        font-size: 0.1px;
        display: block;
        cursor: se-resize;
        width: 12px;
        height: 12px;
        right: 1px;
        bottom: 1px;
    }

    .p-dialog-enter-active {
        animation: p-animate-dialog-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-dialog-leave-active {
        animation: p-animate-dialog-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-dialog-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-dialog-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`, xs = {
  mask: function(t) {
    var n = t.position, o = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: o ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, ks = {
  mask: function(t) {
    var n = t.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], r = o.find(function(a) {
      return a === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, r ? "p-dialog-".concat(r) : ""];
  },
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && o.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, ws = V.extend({
  name: "dialog",
  style: ys,
  classes: ks,
  inlineStyles: xs
}), _s = {
  name: "BaseDialog",
  extends: Et,
  props: {
    header: {
      type: null,
      default: null
    },
    footer: {
      type: null,
      default: null
    },
    visible: {
      type: Boolean,
      default: !1
    },
    modal: {
      type: Boolean,
      default: null
    },
    contentStyle: {
      type: null,
      default: null
    },
    contentClass: {
      type: String,
      default: null
    },
    contentProps: {
      type: null,
      default: null
    },
    maximizable: {
      type: Boolean,
      default: !1
    },
    dismissableMask: {
      type: Boolean,
      default: !1
    },
    closable: {
      type: Boolean,
      default: !0
    },
    closeOnEscape: {
      type: Boolean,
      default: !0
    },
    showHeader: {
      type: Boolean,
      default: !0
    },
    blockScroll: {
      type: Boolean,
      default: !1
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    position: {
      type: String,
      default: "center"
    },
    breakpoints: {
      type: Object,
      default: null
    },
    draggable: {
      type: Boolean,
      default: !0
    },
    keepInViewport: {
      type: Boolean,
      default: !0
    },
    minX: {
      type: Number,
      default: 0
    },
    minY: {
      type: Number,
      default: 0
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    maximizeIcon: {
      type: String,
      default: void 0
    },
    minimizeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    maximizeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    _instance: null
  },
  style: ws,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Jt = {
  name: "Dialog",
  extends: _s,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: pe(function() {
        return t._instance;
      })
    };
  },
  data: function() {
    return {
      containerVisible: this.visible,
      maximized: !1,
      focusableMax: null,
      focusableClose: null,
      target: null
    };
  },
  documentKeydownListener: null,
  container: null,
  mask: null,
  content: null,
  headerContainer: null,
  footerContainer: null,
  maximizableButton: null,
  closeButton: null,
  styleElement: null,
  dragging: null,
  documentDragListener: null,
  documentDragEndListener: null,
  lastPageX: null,
  lastPageY: null,
  maskMouseDownTarget: null,
  updated: function() {
    this.visible && (this.containerVisible = this.visible);
  },
  beforeUnmount: function() {
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && zt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && zt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Ct(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), He(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && zt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(t) {
      this.maskMouseDownTarget = t.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var t = function(r) {
        return r && r.querySelector("[autofocus]");
      }, n = this.$slots.footer && t(this.footerContainer);
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && He(n, {
        focusVisible: !0
      });
    },
    maximize: function(t) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", t)) : (this.maximized = !0, this.$emit("maximize", t)), this.modal || (this.maximized ? Hn() : Wn());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Hn();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Wn();
    },
    onKeyDown: function(t) {
      t.code === "Escape" && this.closeOnEscape && !t.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    containerRef: function(t) {
      this.container = t;
    },
    maskRef: function(t) {
      this.mask = t;
    },
    contentRef: function(t) {
      this.content = t;
    },
    headerContainerRef: function(t) {
      this.headerContainer = t;
    },
    footerContainerRef: function(t) {
      this.footerContainer = t;
    },
    maximizableRef: function(t) {
      this.maximizableButton = t ? t.$el : void 0;
    },
    closeButtonRef: function(t) {
      this.closeButton = t ? t.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var t;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", mo(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var o in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(o, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[o], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = n;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    initDrag: function(t) {
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Gr(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", t));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var t = this;
      this.documentDragListener = function(n) {
        if (t.dragging) {
          var o = lo(t.container), r = po(t.container), a = n.pageX - t.lastPageX, s = n.pageY - t.lastPageY, l = t.container.getBoundingClientRect(), i = l.left + a, c = l.top + s, d = Yr(), u = getComputedStyle(t.container), p = parseFloat(u.marginLeft), m = parseFloat(u.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (i >= t.minX && i + o < d.width && (t.lastPageX = n.pageX, t.container.style.left = i - p + "px"), c >= t.minY && c + r < d.height && (t.lastPageY = n.pageY, t.container.style.top = c - m + "px")) : (t.lastPageX = n.pageX, t.container.style.left = i - p + "px", t.lastPageY = n.pageY, t.container.style.top = c - m + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var t = this;
      this.documentDragEndListener = function(n) {
        t.dragging && (t.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !t.isUnstyled && (document.body.style["user-select"] = ""), t.$emit("dragend", n));
      }, window.document.addEventListener("mouseup", this.documentDragEndListener);
    },
    unbindDocumentDragEndListener: function() {
      this.documentDragEndListener && (window.document.removeEventListener("mouseup", this.documentDragEndListener), this.documentDragEndListener = null);
    }
  },
  computed: {
    maximizeIconComponent: function() {
      return this.maximized ? this.minimizeIcon ? "span" : "WindowMinimizeIcon" : this.maximizeIcon ? "span" : "WindowMaximizeIcon";
    },
    ariaLabelledById: function() {
      return this.header != null || this.$attrs["aria-labelledby"] !== null ? this.$id + "_header" : null;
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return Ke({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Co,
    focustrap: vs
  },
  components: {
    Button: G,
    Portal: tn,
    WindowMinimizeIcon: jo,
    WindowMaximizeIcon: Ao,
    TimesIcon: Eo
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
function Kn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Yn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Kn(Object(n), !0).forEach(function(o) {
      Ss(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Kn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Ss(e, t, n) {
  return (t = $s(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $s(e) {
  var t = Cs(e, "string");
  return pt(t) == "symbol" ? t : t + "";
}
function Cs(e, t) {
  if (pt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (pt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ps = ["data-p"], Os = ["aria-labelledby", "aria-modal", "data-p"], Ts = ["id"], Ls = ["data-p"];
function Es(e, t, n, o, r, a) {
  var s = $t("Button"), l = $t("Portal"), i = Xn("focustrap");
  return _(), Te(l, {
    appendTo: e.appendTo
  }, {
    default: B(function() {
      return [r.containerVisible ? (_(), C("div", z({
        key: 0,
        ref: a.maskRef,
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        onMousedown: t[1] || (t[1] = function() {
          return a.onMaskMouseDown && a.onMaskMouseDown.apply(a, arguments);
        }),
        onMouseup: t[2] || (t[2] = function() {
          return a.onMaskMouseUp && a.onMaskMouseUp.apply(a, arguments);
        }),
        "data-p": a.dataP
      }, e.ptm("mask")), [w(Go, z({
        name: "p-dialog",
        onEnter: a.onEnter,
        onAfterEnter: a.onAfterEnter,
        onBeforeLeave: a.onBeforeLeave,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: B(function() {
          return [e.visible ? Fe((_(), C("div", z({
            key: 0,
            ref: a.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": a.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": a.dataP
          }, e.ptmi("root")), [e.$slots.container ? X(e.$slots, "container", {
            key: 0,
            closeCallback: a.close,
            maximizeCallback: function(d) {
              return a.maximize(d);
            },
            initDragCallback: a.initDrag
          }) : (_(), C(Ne, {
            key: 1
          }, [e.showHeader ? (_(), C("div", z({
            key: 0,
            ref: a.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return a.initDrag && a.initDrag.apply(a, arguments);
            })
          }, e.ptm("header")), [X(e.$slots, "header", {
            class: Y(e.cx("title"))
          }, function() {
            return [e.header ? (_(), C("span", z({
              key: 0,
              id: a.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), R(e.header), 17, Ts)) : W("", !0)];
          }), b("div", z({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? X(e.$slots, "maximizebutton", {
            key: 0,
            maximized: r.maximized,
            maximizeCallback: function(d) {
              return a.maximize(d);
            }
          }, function() {
            return [w(s, z({
              ref: a.maximizableRef,
              autofocus: r.focusableMax,
              class: e.cx("pcMaximizeButton"),
              onClick: a.maximize,
              tabindex: e.maximizable ? "0" : "-1",
              unstyled: e.unstyled
            }, e.maximizeButtonProps, {
              pt: e.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: B(function(c) {
                return [X(e.$slots, "maximizeicon", {
                  maximized: r.maximized
                }, function() {
                  return [(_(), Te(Mt(a.maximizeIconComponent), z({
                    class: [c.class, r.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : W("", !0), e.closable ? X(e.$slots, "closebutton", {
            key: 1,
            closeCallback: a.close
          }, function() {
            return [w(s, z({
              ref: a.closeButtonRef,
              autofocus: r.focusableClose,
              class: e.cx("pcCloseButton"),
              onClick: a.close,
              "aria-label": a.closeAriaLabel,
              unstyled: e.unstyled
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: B(function(c) {
                return [X(e.$slots, "closeicon", {}, function() {
                  return [(_(), Te(Mt(e.closeIcon ? "span" : "TimesIcon"), z({
                    class: [e.closeIcon, c.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : W("", !0)], 16)], 16)) : W("", !0), b("div", z({
            ref: a.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": a.dataP
          }, Yn(Yn({}, e.contentProps), e.ptm("content"))), [X(e.$slots, "default")], 16, Ls), e.footer || e.$slots.footer ? (_(), C("div", z({
            key: 1,
            ref: a.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [X(e.$slots, "footer", {}, function() {
            return [ie(R(e.footer), 1)];
          })], 16)) : W("", !0)], 64))], 16, Os)), [[i, {
            disabled: !e.modal
          }]]) : W("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Ps)) : W("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Jt.render = Es;
function As(e, t) {
  if (e && typeof e == "object") {
    const n = e, o = n.response?.data?.error;
    if (typeof o == "string") return o;
    if (o && typeof o == "object" && typeof o.message == "string")
      return o.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return t;
}
function we(e, t) {
  if (e && typeof e == "object") {
    const n = e;
    n.response?.status === 401 && Se.handleError("auth-expired", n);
  }
  return As(e, t);
}
async function js() {
  try {
    const { data: e } = await ft.get("/api/v1/mcp/credentials");
    if (!e?.success) throw new Error(e?.error || "failed to load credentials");
    return {
      credentials: e.credentials || [],
      mcpUrl: typeof e.mcp_url == "string" ? e.mcp_url : ""
    };
  } catch (e) {
    throw new Error(we(e, "could not load credentials"));
  }
}
async function Ns(e) {
  try {
    const t = e ? `/api/v1/mcp/components?parent_id=${encodeURIComponent(e)}` : "/api/v1/mcp/components", { data: n } = await ft.get(t);
    if (!n?.success) throw new Error(n?.error || "failed to load components");
    return n.components || [];
  } catch (t) {
    throw new Error(we(t, "could not load components"));
  }
}
async function Is(e) {
  try {
    const { data: t } = await ft.post("/api/v1/mcp/credentials", e);
    if (!t?.success || !t.credential) throw new Error(t?.error || "create failed");
    return t.credential;
  } catch (t) {
    throw new Error(we(t, "could not create credential"));
  }
}
async function zs(e, t) {
  try {
    const { data: n } = await ft.patch(`/api/v1/mcp/credentials/${e}`, t);
    if (!n?.success) throw new Error(n?.error || "update failed");
  } catch (n) {
    throw new Error(we(n, "could not update credential"));
  }
}
async function Ds(e) {
  try {
    const { data: t } = await ft.delete("/api/v1/mcp/credentials/" + e);
    if (!t?.success) throw new Error(t?.error || "delete failed");
  } catch (t) {
    throw new Error(we(t, "could not delete credential"));
  }
}
const Rs = {
  folder: "tabler:folder",
  workspace: "tabler:folder",
  knowledge_base: "tabler:books",
  agent: "tabler:robot",
  connection: "tabler:plug",
  inbox: "tabler:inbox"
};
function Ms({ credentials: e, reload: t }) {
  const n = M(!1), o = M(!1), r = M(""), a = M(null), s = M({ label: "", ttl: "", traits: [] }), l = M({}), i = M([]), c = M([]), d = M([]), u = M(!1), p = M(""), m = pe(() => {
    const T = typeof location < "u" ? location.origin : "";
    return T && T !== "null" ? `${T.replace(/\/$/, "")}/api/public/mcp` : "/api/public/mcp";
  }), v = pe(() => a.value?.mcp_url || e.value.find((T) => T.mcp_url)?.mcp_url || p.value || m.value), x = pe(() => a.value ? JSON.stringify({ type: "streamable-http", url: v.value, headers: { Authorization: `Bearer ${a.value.token}` } }, null, 2) : ""), k = pe(() => a.value ? `claude mcp add --transport http kickside ${v.value} --header "Authorization: Bearer ${a.value.token}"` : ""), S = pe(() => JSON.stringify({
    traits: s.value.traits,
    trait_contexts: l.value
  }));
  async function P(T, E) {
    u.value = !0;
    try {
      d.value = await Ns(T), E && c.value.push(E);
    } catch (K) {
      d.value = [], r.value = we(K, "could not load components");
    } finally {
      u.value = !1;
    }
  }
  function N() {
    s.value = { label: "", ttl: "", traits: [] }, l.value = {}, i.value = [], c.value = [], r.value = "", a.value = null, n.value = !0, P(void 0, null);
  }
  function y() {
    n.value = !1, a.value = null, r.value = "";
  }
  function $(T) {
    const E = c.value[T];
    c.value = c.value.slice(0, T), P(E?.id, E || null);
  }
  function H() {
    c.value = [], P(void 0, null);
  }
  function q(T) {
    P(T.id, { id: T.id, name: T.name || "" });
  }
  const te = pe(() => c.value.length ? c.value[c.value.length - 1] : null);
  function Q(T) {
    return i.value.some((E) => E.id === T);
  }
  const ne = pe(() => c.value.length === 0), de = pe(() => ne.value ? i.value.length === 0 : Q(te.value.id)), ue = pe(() => ne.value ? i.value.length === 0 ? "Home — full account" : "Scope to home" : Q(te.value.id) ? "Added" : "Add this folder");
  function fe() {
    ne.value ? i.value = [] : oe(te.value);
  }
  function oe(T) {
    Q(T.id) ? i.value = i.value.filter((E) => E.id !== T.id) : i.value.push({ id: T.id, name: T.name || "" });
  }
  function re(T) {
    i.value = i.value.filter((E) => E.id !== T);
  }
  function ve(T) {
    return T.class && Rs[T.class] || "tabler:box";
  }
  function le(T) {
    const E = T.detail;
    !Array.isArray(E?.traits) || !E.trait_contexts || typeof E.trait_contexts != "object" || Array.isArray(E.trait_contexts) || (s.value.traits = E.traits.filter((K) => typeof K == "string"), l.value = E.trait_contexts);
  }
  async function me() {
    const T = s.value.label.trim();
    if (!T) {
      r.value = "A label is required so you can recognize this credential later.";
      return;
    }
    o.value = !0, r.value = "";
    try {
      const E = parseInt(s.value.ttl, 10), K = await Is({
        whitelist_component_ids: i.value.map((he) => he.id),
        label: T,
        allowed_trait_ids: s.value.traits,
        default_active_trait_ids: s.value.traits,
        agent_profile: { trait_contexts: l.value },
        expires_at: E > 0 ? Math.floor(Date.now() / 1e3) + E * 86400 : void 0
      });
      a.value = K, Se.toast({ severity: "success", summary: "Credential created", detail: K.label || K.token_prefix }), await t();
    } catch (E) {
      r.value = we(E, "create failed");
    } finally {
      o.value = !1;
    }
  }
  return {
    createOpen: n,
    saving: o,
    formError: r,
    minted: a,
    form: s,
    whitelist: i,
    crumbs: c,
    children: d,
    browsing: u,
    serverMcpUrl: p,
    browserOrigin: m,
    mcpUrl: v,
    snippet: x,
    claudeCodeCmd: k,
    traitPickerValue: S,
    openCreate: N,
    closeCreate: y,
    browse: P,
    crumbTo: $,
    crumbRoot: H,
    openFolder: q,
    currentFolder: te,
    inWhitelist: Q,
    atRoot: ne,
    scopeActive: de,
    scopeLabel: ue,
    addScope: fe,
    toggleWhitelist: oe,
    removeWhitelist: re,
    classIcon: ve,
    onTraitPickerChange: le,
    submit: me
  };
}
const Vs = {
  active: "Active",
  revoked: "Revoked"
};
function Bs(e) {
  return e ? Vs[e] ?? e : "";
}
function St(e) {
  return (e.name || "").trim() || "Unknown component";
}
const Us = { class: "kx" }, Fs = { class: "kx-head" }, Hs = { class: "kx-head-icon" }, Ws = { class: "kx-head-actions" }, Ks = { class: "kx-search" }, Ys = { class: "kx-connect-strip" }, Gs = { class: "kx-connect-url" }, Zs = {
  key: 0,
  class: "kx-err"
}, qs = { class: "kx-body" }, Xs = {
  key: 0,
  class: "kx-loading"
}, Js = {
  key: 1,
  class: "kx-empty"
}, Qs = { class: "kx-empty-ico" }, el = { class: "kx-empty-actions" }, tl = {
  key: 2,
  class: "kx-empty"
}, nl = { class: "kx-empty-ico" }, ol = { class: "kx-empty-actions" }, rl = {
  key: 3,
  class: "kx-grid"
}, al = { class: "kx-card-head" }, il = { class: "kx-ficon" }, sl = { class: "kx-card-id" }, ll = ["title"], cl = { class: "kx-card-meta" }, dl = {
  key: 0,
  class: "kx-chip kx-tag-sm kx-ver"
}, ul = { class: "kx-card-desc" }, pl = { key: 0 }, fl = { key: 1 }, ml = { class: "kx-modal-head-icon" }, hl = { class: "kx-modal-head-text" }, bl = { class: "kx-modal-head-title" }, gl = { class: "kx-modal-head-sub" }, vl = {
  key: 0,
  class: "kx-modal-body"
}, yl = { class: "kx-field-row" }, xl = { class: "kx-field" }, kl = { class: "kx-field" }, wl = { class: "kx-field" }, _l = {
  key: 0,
  class: "kx-scope-chips"
}, Sl = { class: "kx-scope-chip-name" }, $l = {
  key: 0,
  class: "kx-id"
}, Cl = ["onClick"], Pl = {
  key: 1,
  class: "kx-scope-note"
}, Ol = { key: 0 }, Tl = { key: 1 }, Ll = { class: "kx-browser" }, El = { class: "kx-crumbs" }, Al = { key: 0 }, jl = ["title", "onClick"], Nl = { class: "kx-browser-list" }, Il = {
  key: 0,
  class: "kx-tool-empty"
}, zl = {
  key: 1,
  class: "kx-tool-empty"
}, Dl = ["onClick"], Rl = {
  key: 0,
  class: "kx-id"
}, Ml = ["value", "refresh-key"], Vl = {
  key: 0,
  class: "kx-err inline"
}, Bl = {
  key: 1,
  class: "kx-modal-body"
}, Ul = { class: "kx-field" }, Fl = { class: "kx-token" }, Hl = { class: "kx-field" }, Wl = { class: "kx-token" }, Kl = { class: "kx-field" }, Yl = { class: "kx-snip" }, Gl = { class: "kx-field" }, Zl = { class: "kx-snip" }, ql = { class: "kx-connect-note" }, Xl = { class: "kx-modal-body" }, Jl = { class: "kx-field" }, Ql = /* @__PURE__ */ Zo({
  __name: "mcp",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, n = M(!1), o = M(""), r = M([]), a = M(""), s = M(0);
    let l = 0, i = !1;
    const c = pe(() => {
      const I = a.value.trim().toLowerCase();
      return I ? r.value.filter((g) => (g.label || "").toLowerCase().includes(I)) : r.value;
    }), d = Ms({ credentials: r, reload: () => Ee() }), {
      createOpen: u,
      saving: p,
      formError: m,
      minted: v,
      form: x,
      whitelist: k,
      crumbs: S,
      children: P,
      browsing: N,
      serverMcpUrl: y,
      mcpUrl: $,
      snippet: H,
      claudeCodeCmd: q,
      traitPickerValue: te,
      openCreate: Q,
      closeCreate: ne,
      crumbTo: de,
      crumbRoot: ue,
      openFolder: fe,
      currentFolder: oe,
      inWhitelist: re,
      atRoot: ve,
      scopeActive: le,
      scopeLabel: me,
      addScope: T,
      toggleWhitelist: E,
      removeWhitelist: K,
      classIcon: he,
      onTraitPickerChange: Le,
      submit: $e
    } = d;
    async function Ee() {
      const I = ++l;
      n.value = !0, o.value = "";
      try {
        const g = await js();
        I === l && (r.value = g.credentials, g.mcpUrl && (y.value = g.mcpUrl));
      } catch (g) {
        I === l && (r.value = [], o.value = we(g, "could not load credentials"));
      } finally {
        I === l && (n.value = !1);
      }
    }
    function mt(I) {
      if (!I) return "";
      const g = Math.max(0, Math.round(Date.now() / 1e3 - I));
      if (g < 60) return "just now";
      const h = Math.round(g / 60);
      if (h < 60) return `${h}m ago`;
      const Z = Math.round(h / 60);
      if (Z < 24) return `${Z}h ago`;
      const Ge = Math.round(Z / 24);
      return Ge < 30 ? `${Ge}d ago` : new Date(I * 1e3).toLocaleDateString();
    }
    const Me = M(null), Ce = M(""), Ae = M(!1);
    function jt(I) {
      Me.value = I, Ce.value = I.label || "";
    }
    function Ye() {
      Me.value = null, Ce.value = "";
    }
    async function ht() {
      const I = Me.value;
      if (!I) return;
      const g = Ce.value.trim();
      if (g) {
        Ae.value = !0;
        try {
          await zs(I.credential_id, { label: g }), Se.toast({ severity: "success", summary: "Renamed", detail: g }), Ye(), await Ee();
        } catch (h) {
          o.value = we(h, "rename failed");
        } finally {
          Ae.value = !1;
        }
      }
    }
    async function je(I, g) {
      try {
        await navigator.clipboard.writeText(I), Se.toast({ severity: "success", summary: "Copied", detail: g });
      } catch {
        Se.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    async function Nt(I) {
      if (await Se.confirm({
        message: `Delete “${I.label || I.token_prefix}”? This permanently removes the credential and its token. This can't be undone.`,
        header: "Delete credential",
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await Ds(I.credential_id), Se.toast({ severity: "success", summary: "Deleted", detail: I.label || I.token_prefix }), await Ee();
        } catch (h) {
          o.value = we(h, "delete failed"), Se.toast({ severity: "error", summary: "Delete failed", detail: o.value });
        }
    }
    const bt = pe({
      get: () => Me.value !== null,
      set: (I) => {
        I || Ye();
      }
    });
    return jr(async () => {
      i && (s.value += 1), i = !0, await Ee();
    }), (I, g) => (_(), C("div", Us, [
      b("header", Fs, [
        b("div", Hs, [
          w(f(A), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        g[15] || (g[15] = b("div", { class: "kx-head-text" }, [
          b("h1", { class: "kx-title" }, "MCP credentials"),
          b("p", { class: "kx-head-sub" }, "Tokens an agent can use to act as you, optionally scoped to components you pick.")
        ], -1)),
        b("div", Ws, [
          b("div", Ks, [
            w(f(A), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Fe(b("input", {
              "onUpdate:modelValue": g[0] || (g[0] = (h) => a.value = h),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search credentials…",
              "aria-label": "Search credentials"
            }, null, 512), [
              [gt, a.value]
            ])
          ]),
          w(f(G), {
            type: "button",
            label: "New credential",
            onClick: f(Q)
          }, {
            icon: B(({ class: h }) => [
              w(f(A), {
                icon: "tabler:plus",
                class: Y(h),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["onClick"])
        ])
      ]),
      b("div", Ys, [
        w(f(A), {
          icon: "tabler:world",
          "aria-hidden": "true"
        }),
        g[16] || (g[16] = b("span", { class: "kx-connect-lbl" }, "Endpoint", -1)),
        b("code", Gs, R(f($)), 1),
        w(f(G), {
          type: "button",
          severity: "secondary",
          outlined: "",
          size: "small",
          title: "Copy endpoint URL",
          "aria-label": "Copy endpoint URL",
          onClick: g[1] || (g[1] = (h) => je(f($), "endpoint URL"))
        }, {
          icon: B(({ class: h }) => [
            w(f(A), {
              icon: "tabler:copy",
              class: Y(h),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }),
        g[17] || (g[17] = b("span", { class: "kx-connect-hint" }, "Claude (claude.ai): Settings → Connectors → Add custom connector → paste this URL — sign-in happens here via OAuth, no token needed. Tokens below are for clients without OAuth.", -1))
      ]),
      o.value ? (_(), C("div", Zs, R(o.value), 1)) : W("", !0),
      b("div", qs, [
        n.value && !r.value.length ? (_(), C("div", Xs, [
          w(f(A), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          g[18] || (g[18] = ie(" Loading…", -1))
        ])) : r.value.length ? c.value.length ? (_(), C("div", rl, [
          (_(!0), C(Ne, null, vt(c.value, (h) => (_(), C("div", {
            key: h.credential_id,
            class: "kx-card"
          }, [
            b("div", al, [
              b("span", il, [
                w(f(A), {
                  icon: "tabler:plug-connected",
                  "aria-hidden": "true"
                })
              ]),
              b("div", sl, [
                b("div", {
                  class: "kx-card-name",
                  title: h.label || "(unlabeled)"
                }, R(h.label || "(unlabeled)"), 9, ll),
                b("div", cl, [
                  b("span", {
                    class: Y(["kx-chip kx-tag-sm", (h.whitelist_component_ids?.length || 0) > 0 ? "kx-scope" : "kx-ver"])
                  }, [
                    w(f(A), {
                      icon: (h.whitelist_component_ids?.length || 0) > 0 ? "tabler:lock" : "tabler:world",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    ie(" " + R((h.whitelist_component_ids?.length || 0) > 0 ? `${h.whitelist_component_ids.length} scoped` : "full account"), 1)
                  ], 2),
                  (h.allowed_trait_ids?.length || 0) > 0 ? (_(), C("span", dl, [
                    w(f(A), {
                      icon: "tabler:puzzle",
                      "aria-hidden": "true"
                    }),
                    ie(" " + R(h.allowed_trait_ids.length) + " " + R(h.allowed_trait_ids.length === 1 ? "capability" : "capabilities"), 1)
                  ])) : W("", !0),
                  b("span", {
                    class: Y(["kx-chip kx-tag-sm kx-status", h.status === "active" ? "kx-status-on" : "kx-status-off"])
                  }, R(f(Bs)(h.status)), 3)
                ])
              ]),
              b("div", {
                class: "kx-card-actions",
                onClick: g[3] || (g[3] = qo(() => {
                }, ["stop"]))
              }, [
                w(f(G), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Rename",
                  "aria-label": "Rename",
                  onClick: (Z) => jt(h)
                }, {
                  icon: B(({ class: Z }) => [
                    w(f(A), {
                      icon: "tabler:pencil",
                      class: Y(Z),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                w(f(G), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": "Delete",
                  onClick: (Z) => Nt(h)
                }, {
                  icon: B(({ class: Z }) => [
                    w(f(A), {
                      icon: "tabler:trash",
                      class: Y(Z),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ])
            ]),
            b("div", ul, [
              b("code", null, R(h.token_prefix) + "…", 1),
              h.last_used_at ? (_(), C("span", pl, " · used " + R(mt(h.last_used_at)), 1)) : W("", !0),
              h.expires_at ? (_(), C("span", fl, " · expires " + R(new Date(h.expires_at * 1e3).toLocaleDateString()), 1)) : W("", !0)
            ])
          ]))), 128))
        ])) : (_(), C("div", tl, [
          b("div", nl, [
            w(f(A), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          g[21] || (g[21] = b("div", { class: "kx-empty-title" }, "No matches", -1)),
          b("div", ol, [
            w(f(G), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: g[2] || (g[2] = (h) => a.value = "")
            }, {
              icon: B(({ class: h }) => [
                w(f(A), {
                  icon: "tabler:x",
                  class: Y(h),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (_(), C("div", Js, [
          b("div", Qs, [
            w(f(A), {
              icon: "tabler:plug-connected",
              "aria-hidden": "true"
            })
          ]),
          g[19] || (g[19] = b("div", { class: "kx-empty-title" }, "No credentials yet", -1)),
          g[20] || (g[20] = b("div", { class: "kx-empty-sub" }, "Mint a token an agent can use to act as you — scoped to the components and capabilities you choose.", -1)),
          b("div", el, [
            w(f(G), {
              type: "button",
              label: "New credential",
              onClick: f(Q)
            }, {
              icon: B(({ class: h }) => [
                w(f(A), {
                  icon: "tabler:plus",
                  class: Y(h),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["onClick"])
          ])
        ]))
      ]),
      w(f(Jt), {
        visible: f(u),
        "onUpdate:visible": g[12] || (g[12] = (h) => Xo(u) ? u.value = h : null),
        modal: "",
        class: "kx-dialog kx-modal-xl",
        "aria-label": "New MCP credential",
        pt: t
      }, {
        header: B(() => [
          b("span", ml, [
            w(f(A), {
              icon: "tabler:plug-connected",
              "aria-hidden": "true"
            })
          ]),
          b("span", hl, [
            b("span", bl, R(f(v) ? "Credential created" : "New credential"), 1),
            b("span", gl, R(f(v) ? "Copy the token now — it is shown once." : "Scope it, name it, pick its capabilities."), 1)
          ])
        ]),
        footer: B(() => [
          f(v) ? (_(), Te(f(G), {
            key: 1,
            type: "button",
            label: "Done",
            onClick: f(ne)
          }, {
            icon: B(({ class: h }) => [
              w(f(A), {
                icon: "tabler:check",
                class: Y(h),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["onClick"])) : (_(), C(Ne, { key: 0 }, [
            w(f(G), {
              type: "button",
              label: "Cancel",
              severity: "secondary",
              outlined: "",
              disabled: f(p),
              onClick: f(ne)
            }, null, 8, ["disabled", "onClick"]),
            w(f(G), {
              type: "button",
              label: "Create credential",
              loading: f(p),
              disabled: f(p) || !f(x).label.trim(),
              onClick: f($e)
            }, {
              icon: B(({ class: h }) => [
                w(f(A), {
                  icon: "tabler:check",
                  class: Y(h),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled", "onClick"])
          ], 64))
        ]),
        default: B(() => [
          f(v) ? (_(), C("div", Bl, [
            b("div", Ul, [
              g[26] || (g[26] = b("span", { class: "kx-field-lbl" }, [
                ie("Endpoint URL "),
                b("span", { class: "kx-field-hint-inline" }, "— public MCP endpoint")
              ], -1)),
              b("div", Fl, [
                b("code", null, R(f($)), 1),
                w(f(G), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy URL",
                  "aria-label": "Copy URL",
                  onClick: g[8] || (g[8] = (h) => je(f($), "endpoint URL"))
                }, {
                  icon: B(({ class: h }) => [
                    w(f(A), {
                      icon: "tabler:copy",
                      class: Y(h),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            b("div", Hl, [
              g[27] || (g[27] = b("span", { class: "kx-field-lbl" }, [
                ie("Bearer token "),
                b("span", { class: "kx-field-hint-inline" }, "— shown once")
              ], -1)),
              b("div", Wl, [
                b("code", null, R(f(v).token), 1),
                w(f(G), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy token",
                  "aria-label": "Copy token",
                  onClick: g[9] || (g[9] = (h) => je(f(v).token, "token"))
                }, {
                  icon: B(({ class: h }) => [
                    w(f(A), {
                      icon: "tabler:copy",
                      class: Y(h),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            b("div", Kl, [
              g[28] || (g[28] = b("span", { class: "kx-field-lbl" }, [
                ie("Claude Code "),
                b("span", { class: "kx-field-hint-inline" }, "— one command")
              ], -1)),
              b("div", Yl, [
                b("pre", null, R(f(q)), 1),
                w(f(G), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy command",
                  "aria-label": "Copy command",
                  onClick: g[10] || (g[10] = (h) => je(f(q), "command"))
                }, {
                  icon: B(({ class: h }) => [
                    w(f(A), {
                      icon: "tabler:copy",
                      class: Y(h),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            b("div", Gl, [
              g[29] || (g[29] = b("span", { class: "kx-field-lbl" }, [
                ie("Other clients "),
                b("span", { class: "kx-field-hint-inline" }, "— streamable-http config")
              ], -1)),
              b("div", Zl, [
                b("pre", null, R(f(H)), 1),
                w(f(G), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy config",
                  "aria-label": "Copy config",
                  onClick: g[11] || (g[11] = (h) => je(f(H), "config"))
                }, {
                  icon: B(({ class: h }) => [
                    w(f(A), {
                      icon: "tabler:copy",
                      class: Y(h),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            b("div", ql, [
              w(f(A), {
                icon: "tabler:info-circle",
                "aria-hidden": "true"
              }),
              g[30] || (g[30] = b("span", null, "Connecting from Claude (claude.ai)? You don't need this token — add the endpoint URL as a custom connector and approve the OAuth consent instead.", -1))
            ])
          ])) : (_(), C("div", vl, [
            b("div", yl, [
              b("label", xl, [
                g[22] || (g[22] = b("span", { class: "kx-field-lbl" }, "Label", -1)),
                Fe(b("input", {
                  "onUpdate:modelValue": g[4] || (g[4] = (h) => f(x).label = h),
                  class: "kx-input",
                  type: "text",
                  placeholder: "research-agent"
                }, null, 512), [
                  [gt, f(x).label]
                ])
              ]),
              b("label", kl, [
                g[23] || (g[23] = b("span", { class: "kx-field-lbl" }, [
                  ie("Expires "),
                  b("span", { class: "kx-field-hint-inline" }, "— days")
                ], -1)),
                Fe(b("input", {
                  "onUpdate:modelValue": g[5] || (g[5] = (h) => f(x).ttl = h),
                  class: "kx-input",
                  type: "number",
                  min: "1",
                  placeholder: "never"
                }, null, 512), [
                  [gt, f(x).ttl]
                ])
              ])
            ]),
            b("div", wl, [
              g[25] || (g[25] = b("span", { class: "kx-field-lbl" }, [
                ie("Scope "),
                b("span", { class: "kx-field-hint-inline" }, "— leave empty for full account, or add components to confine it")
              ], -1)),
              f(k).length ? (_(), C("div", _l, [
                (_(!0), C(Ne, null, vt(f(k), (h) => (_(), C("span", {
                  key: h.id,
                  class: "kx-scope-chip"
                }, [
                  w(f(A), {
                    icon: "tabler:lock",
                    "aria-hidden": "true"
                  }),
                  b("span", Sl, [
                    ie(R(f(St)(h)), 1),
                    h.name ? W("", !0) : (_(), C("span", $l, R(h.id), 1))
                  ]),
                  b("button", {
                    class: "kx-scope-chip-x",
                    title: "Remove",
                    "aria-label": "Remove",
                    onClick: (Z) => f(K)(h.id)
                  }, [
                    w(f(A), {
                      icon: "tabler:x",
                      "aria-hidden": "true"
                    })
                  ], 8, Cl)
                ]))), 128))
              ])) : (_(), C("div", Pl, [
                w(f(A), {
                  icon: "tabler:world",
                  "aria-hidden": "true"
                }),
                f(oe) ? (_(), C("span", Ol, 'Full account so far — nothing scoped yet. Use "' + R(f(me)) + '" to confine it to ' + R(f(St)(f(oe))) + ".", 1)) : (_(), C("span", Tl, "Full account — reaches everything you can."))
              ])),
              b("div", Ll, [
                b("div", El, [
                  b("button", {
                    class: "kx-crumb",
                    "aria-label": "Home",
                    onClick: g[6] || (g[6] = //@ts-ignore
                    (...h) => f(ue) && f(ue)(...h))
                  }, [
                    w(f(A), {
                      icon: "tabler:home",
                      "aria-hidden": "true"
                    }),
                    f(ve) ? (_(), C("span", Al, "Home")) : W("", !0)
                  ]),
                  (_(!0), C(Ne, null, vt(f(S), (h, Z) => (_(), C(Ne, {
                    key: h.id
                  }, [
                    w(f(A), {
                      icon: "tabler:chevron-right",
                      class: "kx-crumb-sep",
                      "aria-hidden": "true"
                    }),
                    b("button", {
                      class: "kx-crumb",
                      title: h.name ? void 0 : h.id,
                      onClick: (Ge) => f(de)(Z)
                    }, R(f(St)(h)), 9, jl)
                  ], 64))), 128)),
                  w(f(G), {
                    type: "button",
                    size: "small",
                    class: "kx-crumb-add",
                    severity: f(le) ? void 0 : "secondary",
                    outlined: !f(le),
                    label: f(me),
                    onClick: f(T)
                  }, {
                    icon: B(({ class: h }) => [
                      w(f(A), {
                        icon: f(le) ? "tabler:check" : "tabler:plus",
                        class: Y(h),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"])
                    ]),
                    _: 1
                  }, 8, ["severity", "outlined", "label", "onClick"])
                ]),
                b("div", Nl, [
                  f(N) ? (_(), C("div", Il, [
                    w(f(A), {
                      icon: "tabler:loader-2",
                      class: "spin",
                      "aria-hidden": "true"
                    }),
                    g[24] || (g[24] = ie(" Loading…", -1))
                  ])) : f(P).length ? W("", !0) : (_(), C("div", zl, "Nothing here.")),
                  (_(!0), C(Ne, null, vt(f(P), (h) => (_(), C("div", {
                    key: h.id,
                    class: "kx-browse-row"
                  }, [
                    b("button", {
                      class: "kx-browse-open",
                      onClick: (Z) => f(fe)(h),
                      title: "Open"
                    }, [
                      w(f(A), {
                        icon: f(he)(h),
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      b("span", null, [
                        ie(R(f(St)(h)), 1),
                        h.name?.trim() ? W("", !0) : (_(), C("span", Rl, R(h.id), 1))
                      ])
                    ], 8, Dl),
                    w(f(G), {
                      type: "button",
                      size: "small",
                      severity: f(re)(h.id) ? void 0 : "secondary",
                      outlined: !f(re)(h.id),
                      label: f(re)(h.id) ? "Added" : "Add",
                      onClick: (Z) => f(E)(h)
                    }, {
                      icon: B(({ class: Z }) => [
                        w(f(A), {
                          icon: f(re)(h.id) ? "tabler:check" : "tabler:plus",
                          class: Y(Z),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"])
                      ]),
                      _: 2
                    }, 1032, ["severity", "outlined", "label", "onClick"])
                  ]))), 128))
                ])
              ])
            ]),
            b("wc-agent-trait-picker", {
              value: f(te),
              "refresh-key": s.value,
              "keep-menu-open-on-add": "",
              onChange: g[7] || (g[7] = //@ts-ignore
              (...h) => f(Le) && f(Le)(...h))
            }, null, 40, Ml),
            f(m) ? (_(), C("div", Vl, R(f(m)), 1)) : W("", !0)
          ]))
        ]),
        _: 1
      }, 8, ["visible"]),
      w(f(Jt), {
        visible: bt.value,
        "onUpdate:visible": g[14] || (g[14] = (h) => bt.value = h),
        modal: "",
        class: "kx-dialog",
        header: "Rename credential",
        "aria-label": "Rename credential",
        pt: t
      }, {
        footer: B(() => [
          w(f(G), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: Ae.value,
            onClick: Ye
          }, null, 8, ["disabled"]),
          w(f(G), {
            type: "button",
            label: "Save",
            loading: Ae.value,
            disabled: Ae.value || !Ce.value.trim(),
            onClick: ht
          }, {
            icon: B(({ class: h }) => [
              w(f(A), {
                icon: "tabler:check",
                class: Y(h),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ]),
        default: B(() => [
          b("div", Xl, [
            b("div", Jl, [
              g[31] || (g[31] = b("span", { class: "kx-field-lbl" }, "Label", -1)),
              Fe(b("input", {
                "onUpdate:modelValue": g[13] || (g[13] = (h) => Ce.value = h),
                class: "kx-input",
                type: "text",
                placeholder: "A name you'll recognize",
                onKeydown: Jo(ht, ["enter"])
              }, null, 544), [
                [gt, Ce.value]
              ])
            ])
          ])
        ]),
        _: 1
      }, 8, ["visible"])
    ]));
  }
}), ec = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-card{position:relative;display:flex;flex-direction:column;gap:9px;padding:13px;cursor:pointer;border:1px solid var(--p-content-border-color);border-radius:14px;background:var(--p-content-background);transition:border-color .15s,box-shadow .15s,transform .15s}.kx-card:hover{border-color:color-mix(in srgb,var(--p-primary-color) 40%,var(--p-content-border-color));box-shadow:0 6px 20px color-mix(in srgb,var(--p-text-color) 8%,transparent);transform:translateY(-1px)}.kx-card-head{display:flex;align-items:center;gap:10px;min-width:0}.kx-card-id{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}.kx-card-name{font-size:14px;font-weight:700;letter-spacing:-.01em;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-card-meta{display:flex;gap:6px}.kx-card-desc{font-size:12px;color:var(--p-text-muted-color);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:17px}.kx-card-actions{position:absolute;top:9px;right:9px;display:flex;gap:3px;opacity:0;transition:opacity .12s;background:var(--p-content-background);border-radius:8px}.kx-card:hover .kx-card-actions,.kx-card:focus-within .kx-card-actions{opacity:1}.kx-card .p-button:not(:disabled):hover{transform:none}.kx-card:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-modal-head-icon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-modal-head-icon svg{width:20px;height:20px}.kx-modal-head-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-modal-head-title{font-size:15.5px;font-weight:700;color:var(--p-text-color);line-height:1.2}.kx-modal-head-sub{font-size:12.5px;font-weight:400;color:var(--p-text-muted-color);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-empty.kx-empty-spacious{padding:60px 24px;gap:9px}.kx-empty-spacious .kx-empty-ico{width:58px;height:58px;margin-bottom:5px}.kx-empty-spacious .kx-empty-ico svg{width:27px;height:27px}.kx-empty-spacious .kx-empty-title{font-size:14.5px}.kx-empty-spacious .kx-empty-sub{font-size:12.5px;max-width:360px;line-height:1.55}.kx-empty-ico.primary{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);border:1px solid color-mix(in srgb,var(--p-primary-color) 28%,transparent)}.kx-empty-ico.muted{background:var(--kx-surface-2);color:color-mix(in srgb,var(--p-text-color) 45%,transparent);border:1px solid var(--p-content-border-color)}.kx-empty>.kx-empty-cta{margin-top:8px;padding-inline:16px}.kx-loading.kx-loading-centered{flex:1;display:grid;place-items:center;padding:64px 20px}.kx-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:13px}.kx-loading-inner svg{width:24px;height:24px}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-tone-blue: #2563eb;--kx-tone-violet: #7c3aed;--kx-tone-amber: #b45309}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-tone-blue: #60a5fa;--kx-tone-violet: #a78bfa;--kx-tone-amber: #fbbf24}}:host(.w-theme-dark),:root.w-theme-dark{--kx-tone-blue: #60a5fa;--kx-tone-violet: #a78bfa;--kx-tone-amber: #fbbf24}.kx-tone-blue{color:var(--kx-tone-blue);background-color:color-mix(in srgb,var(--kx-tone-blue) 13%,transparent)}.kx-tone-violet{color:var(--kx-tone-violet);background-color:color-mix(in srgb,var(--kx-tone-violet) 13%,transparent)}.kx-tone-amber{color:var(--kx-tone-amber);background-color:color-mix(in srgb,var(--kx-tone-amber) 13%,transparent)}.kx-tone-neutral{color:var(--p-text-muted-color);background-color:color-mix(in srgb,var(--p-text-color) 10%,transparent)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}.kx{font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{height:34px;width:220px;max-width:40vw;padding:0 10px 0 30px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s}.kx-search-input::placeholder{color:var(--p-text-muted-color)}.kx-body{flex:1;min-height:0;padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px}.kx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,264px),1fr));gap:12px;max-width:1180px}.kx-ficon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-ficon svg{width:20px;height:20px}.kx-card-name{padding-right:64px}.kx-card-meta{flex-wrap:wrap}.kx-card-actions{opacity:.7}.kx-chip{flex:none}.kx-ver{color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.kx-scope{text-transform:uppercase;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent)}.kx-status{text-transform:uppercase;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 14%,transparent)}.kx-dialog{--p-dialog-content-padding: 0;width:min(460px,calc(100vw - 32px))}.kx-dialog.kx-modal-xl{width:min(880px,94vw)}.kx-dialog>.kx-dialog-header{display:flex;align-items:center;gap:12px;padding:16px 20px}.kx-dialog>.kx-dialog-content{padding:0;overflow:auto;display:flex;flex-direction:column;min-height:0}.kx-dialog>.kx-dialog-footer{display:flex;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}.kx-modal-head-sub{white-space:normal;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical}.kx-modal-body{padding:20px;font-size:13.5px;line-height:1.5;color:var(--p-text-color);overflow-y:auto;display:flex;flex-direction:column;gap:18px}.kx-modal-body p{margin:0 0 10px}.kx-modal-body p:last-child{margin-bottom:0}.kx-field{display:flex;flex-direction:column;gap:8px}.kx-field-lbl{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-field-hint-inline{font-weight:400;color:var(--p-text-muted-color)}.kx-input{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s;width:100%}.kx-input::placeholder{color:var(--p-text-muted-color)}.kx-input:disabled{opacity:.6;cursor:default}@media(max-width:640px){.kx-head{padding:16px 16px 12px}.kx-body{padding:6px 16px 16px}.kx-head-actions{margin-left:0;width:100%}.kx-search{flex:1}.kx-card-name{padding-right:32px}}@media(max-width:560px){.kx-search-input{width:100%;max-width:none}}.kx-field-row{display:flex;gap:12px}.kx-field-row>.kx-field{flex:1;min-width:0}.kx-status-on{color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 14%,transparent)}.kx-status-off{color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 14%,transparent)}.kx-tool-empty{color:var(--p-text-muted-color);font-size:13px;padding:4px}.kx-token,.kx-snip{display:flex;align-items:flex-start;gap:8px;border:1px dashed var(--p-primary-color);border-radius:var(--p-form-field-border-radius, 8px);padding:10px 12px;background:color-mix(in srgb,var(--p-primary-color) 6%,transparent)}.kx-token code{color:var(--p-primary-color);font-family:ui-monospace,monospace;word-break:break-all;flex:1}.kx-snip{border-style:solid;border-color:var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 4%,transparent)}.kx-snip pre{margin:0;flex:1;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,monospace;font-size:12px;color:var(--p-text-muted-color)}.kx-browser{border:1px solid var(--p-content-border-color);border-radius:var(--p-form-field-border-radius, 8px);overflow:hidden}.kx-crumbs{display:flex;align-items:center;gap:4px;padding:6px 8px;flex-wrap:wrap;border-bottom:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 3%,transparent)}.kx-crumb{background:none;border:0;color:var(--p-primary-color);cursor:pointer;font:inherit;padding:2px 4px;border-radius:6px;display:inline-flex;align-items:center;gap:4px}.kx-crumb:hover{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent)}.kx-crumb-sep{color:var(--p-text-muted-color)}.kx-crumb-add{margin-left:auto}.kx-browser-list{max-height:200px;overflow-y:auto}.kx-id{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--p-text-muted-color)}.kx-browse-row{display:flex;align-items:center;gap:8px;padding:4px 8px}.kx-browse-row:hover{background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.kx-browse-open{flex:1;display:flex;align-items:center;gap:8px;background:none;border:0;color:var(--p-text-color);cursor:pointer;font:inherit;text-align:left;padding:4px}.kx-scope-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.kx-scope-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 6px 4px 9px;border-radius:999px;font-size:12px;font-weight:500;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent)}.kx-scope-chip svg{width:13px;height:13px}.kx-scope-chip-name{color:var(--p-text-color);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-scope-chip-x{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:0;border-radius:50%;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.kx-scope-chip-x:hover{background:color-mix(in srgb,var(--p-text-color) 12%,transparent);color:var(--p-text-color)}.kx-scope-note{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:8px 10px;border-radius:var(--p-form-field-border-radius, 8px);font-size:12px;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 4%,transparent)}.kx-scope-note svg{width:15px;height:15px;flex:none;color:var(--p-text-muted-color)}@media(prefers-reduced-motion:reduce){.kx-dialog{transition:none}}.kx-connect-strip{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 14px;padding:10px 14px;border:1px solid var(--km-border, var(--p-content-border-color));border-radius:10px;background:color-mix(in srgb,var(--p-text-color) 2%,var(--p-content-background));font-size:12.5px}.kx-connect-strip>svg{width:15px;height:15px;color:var(--p-text-muted-color);flex:none}.kx-connect-lbl{font-weight:600}.kx-connect-url{font-family:var(--km-mono, ui-monospace, monospace);font-size:12px;padding:2px 6px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 5%,transparent);overflow-wrap:anywhere}.kx-connect-hint{flex-basis:100%;color:var(--p-text-muted-color);font-size:12px}.kx-connect-note{display:flex;gap:8px;align-items:flex-start;margin-top:4px;padding:10px 12px;border-radius:8px;background:color-mix(in srgb,var(--p-primary-color) 7%,transparent);color:var(--p-text-color);font-size:12.5px}.kx-connect-note svg{width:15px;height:15px;flex:none;margin-top:1px;color:var(--p-primary-color)}', tc = { props: { type: "object", properties: {} } }, nc = {
  wippy: tc
};
class oc extends Nr {
  static get wippyConfig() {
    return {
      propsSchema: nc.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ec
    };
  }
  static get vueConfig() {
    return { rootComponent: Ql, plugins: [_i] };
  }
}
rr(import.meta.url, oc);
//# sourceMappingURL=index.js.map

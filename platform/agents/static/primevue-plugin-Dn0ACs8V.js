import { hasInjectionContext as fn, inject as Ce, effectScope as hn, ref as L, markRaw as mn, createApp as yn, onMounted as yt, onUnmounted as gn, watch as oe, readonly as bn, getCurrentInstance as We, nextTick as vn, reactive as Sn, renderSlot as be, openBlock as _n, createBlock as wn, Teleport as gt, createCommentVNode as bt, h as Cn } from "vue";
import { addCollection as Tn } from "@iconify/vue";
import { config as He, addIcons as On, on as En, applyThemeMode as fe, host as Pn, hostCss as xn, loadCss as $n } from "@wippy-fe/proxy";
var Pe = "data-wippy-visible";
function Be(e) {
  const t = e.getAttribute(Pe);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var An = Object.defineProperty, Ln = (e, t, n) => t in e ? An(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, v = (e, t, n) => Ln(e, typeof t != "symbol" ? t + "" : t, n), Nn = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], kn = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Ue(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Rn(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [s, l] of Object.entries(o)) {
            const a = typeof l == "string" ? Ue(s) : null;
            a && t.add(a);
          }
          continue;
        }
        const i = typeof o == "string" ? Ue(r) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function jn(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${kn} {
${t}
}`;
}
function Vn(e, t) {
  const n = jn(t);
  n && vt(e, n, "@wippy-fe/css-variables-bridge");
}
function Dn(e, t) {
  const r = (t ?? Nn).map(async (o) => {
    const i = xn[o];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await $n(i);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${i}):`, s), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const i of o) {
      if (!i)
        continue;
      const s = document.createElement("style");
      s.textContent = i, s.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(s);
    }
  });
}
function In(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function vt(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Mn(e, t) {
  vt(e, t, "@wippy-fe/custom-css");
}
function St(e) {
  return e.__wippyHost ?? null;
}
function Fn(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Wn(e, t, n) {
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
function Te(e, t) {
  const n = {}, r = [];
  for (const [o, i] of Object.entries(t.properties)) {
    const s = e.getAttribute(o), l = Fn(o);
    if (s === null) {
      i.default !== void 0 && (n[l] = i.default);
      continue;
    }
    const a = Wn(o, s, i);
    a.error ? r.push(a.error) : n[l] = a.value;
  }
  return { props: n, errors: r };
}
var Hn = class {
  constructor(e, t) {
    v(this, "_props"), v(this, "_errors"), v(this, "_content"), v(this, "_hostVisibility"), v(this, "_propsListeners", /* @__PURE__ */ new Set()), v(this, "_contentListeners", /* @__PURE__ */ new Set()), v(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), v(this, "_disposed", !1), v(this, "_emitToDom"), v(this, "props"), v(this, "events"), v(this, "content"), v(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, Bn = class extends HTMLElement {
  constructor() {
    super(), v(this, "_internals"), v(this, "_contentObserver", null), v(this, "_initialized", !1), v(this, "_container", null), v(this, "_reactive", null), v(this, "_lastProps", null), v(this, "_lastErrors", []), v(this, "_lastContent", null), v(this, "_themeUnsub", null), v(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Be(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Pe])];
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
    return St(this);
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
        const i = Te(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), n = i.props, r = i.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Hn(
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
        this.onInit(n), e.inlineCss && In(n, e.inlineCss);
        try {
          const u = He?.theming, c = Rn(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          Vn(n, c);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = He?.theming, c = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            c && Mn(n, c);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Dn(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const a = e.containerClasses ?? [];
        a.length > 0 && r.classList.add(...a), n.appendChild(r), this._container = r, On(Tn);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = En("@theme", (a) => this._applyTheme(a)));
      const { props: o, errors: i } = Te(this, e.propsSchema);
      e.validateProps && i.push(...e.validateProps(o));
      const s = o;
      this._lastProps = s, this._lastErrors = i;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const a = this._extractContent(e.contentTemplate);
        this._lastContent = a, this._reactive?.notifyContent(a), this.onContentChanged(a);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, s, i, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Pn.getThemeMode?.()) {
    fe(e, this), this._container && fe(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), fe("auto", this), this._container && fe("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Pe) {
      const l = this._hostVisible, a = Be(this);
      if (a === l)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, l), this.onHostVisibilityChanged(a, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: i } = Te(this, r.propsSchema);
    r.validateProps && i.push(...r.validateProps(o));
    const s = o;
    this._lastProps = s, this._lastErrors = i, this._reactive?.notifyProps(s, i), this.onPropsChanged(s, i);
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
function Un(e) {
  return e.__wippyHostBus ?? null;
}
function zn(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let _t;
const wt = (e) => _t = e, Kn = () => fn() && Ce(Ct) || _t, Ct = (
  /* istanbul ignore next */
  Symbol()
);
function Yn() {
  const e = hn(!0), t = e.run(() => L({}));
  let n = [], r = [];
  const o = mn({
    install(i) {
      wt(o), o._a = i, i.provide(Ct, o), i.config.globalProperties.$pinia = o, r.forEach((s) => n.push(s)), r = [];
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
var qn = Object.defineProperty, Gn = (e, t, n) => t in e ? qn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, te = (e, t, n) => Gn(e, typeof t != "symbol" ? t + "" : t, n), Tt = /* @__PURE__ */ Symbol("wippy:emit"), Ot = /* @__PURE__ */ Symbol("wippy:props"), Jn = /* @__PURE__ */ Symbol("wippy:props_error"), Qn = /* @__PURE__ */ Symbol("wippy:content"), Zn = /* @__PURE__ */ Symbol("wippy:panel-id"), Xn = /* @__PURE__ */ Symbol("wippy:layout-bus"), er = /* @__PURE__ */ Symbol("wippy:host"), Et = /* @__PURE__ */ Symbol("wippy:host-visibility");
function yo() {
  const e = Ce(Ot);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function go() {
  const e = Ce(Tt);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function tr() {
  const e = Ce(Et);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function bo(e) {
  const t = tr();
  let n = !1, r = null, o = !1;
  function i() {
    if (r)
      return o = !0, r;
    let s;
    try {
      s = Promise.resolve(e());
    } catch (a) {
      s = Promise.reject(a);
    }
    const l = s.finally(() => {
      if (r === l && (r = null, n && o))
        return o = !1, i();
    });
    return r = l, l;
  }
  return yt(() => (n = !0, i())), gn(() => {
    n = !1, o = !1;
  }), oe(t, (s, l) => {
    if (n && l === !1 && s === !0)
      return i();
  }), t;
}
var vo = class extends Bn {
  constructor() {
    super(...arguments), te(this, "_vueApp", null), te(this, "_propsRef", L({})), te(this, "_errorsRef", L([])), te(this, "_contentRef", L(null)), te(this, "_hostVisibilityRef", L(null)), te(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, i) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of r)
      this.emitEvent("invalid", { message: u });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((u, c) => {
      this._propsRef.value = u, this._errorsRef.value = [...c];
      for (const p of c)
        this.emitEvent("invalid", { message: p });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: l.signal });
    const a = (u) => {
      if (l.signal.aborted)
        return;
      const c = Kn(), p = yn(u.rootComponent);
      this._vueApp = p;
      const d = Yn();
      if (u.piniaPlugins)
        for (const f of u.piniaPlugins)
          d.use(f);
      if (p.use(d), u.plugins)
        for (const f of u.plugins)
          p.use(f);
      p.provide(Ot, this._propsRef), p.provide(Jn, this._errorsRef), p.provide(Tt, this.emitEvent.bind(this)), p.provide(Qn, this._contentRef), p.provide(Et, this._hostVisibilityRef), p.provide(Zn, zn(this)), p.provide(Xn, Un(this)), p.provide(er, St(this)), u.providers && u.providers(p, this), p.mount(t), c && wt(c);
    };
    if (s.rootComponent)
      a(s);
    else if (s.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), t.appendChild(u), s.lazyConfig().then((c) => {
        l.signal.aborted || (u.remove(), a(c));
      }).catch((c) => {
        if (l.signal.aborted)
          return;
        const p = c instanceof Error ? c.message : String(c), d = document.createElement("wippy-error");
        d.setAttribute("title", "Failed to load"), d.setAttribute("message", p), u.replaceWith(d), this.emitEvent("error", { message: p });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, nr = Object.defineProperty, ze = Object.getOwnPropertySymbols, rr = Object.prototype.hasOwnProperty, or = Object.prototype.propertyIsEnumerable, Ke = (e, t, n) => t in e ? nr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ir = (e, t) => {
  for (var n in t || (t = {})) rr.call(t, n) && Ke(e, n, t[n]);
  if (ze) for (var n of ze(t)) or.call(t, n) && Ke(e, n, t[n]);
  return e;
};
function Ve(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function xe(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), i, s, l;
  if (r && o) {
    if (s = e.length, s != t.length) return !1;
    for (i = s; i-- !== 0; ) if (!xe(e[i], t[i], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let a = e instanceof Date, u = t instanceof Date;
  if (a != u) return !1;
  if (a && u) return e.getTime() == t.getTime();
  let c = e instanceof RegExp, p = t instanceof RegExp;
  if (c != p) return !1;
  if (c && p) return e.toString() == t.toString();
  let d = Object.keys(e);
  if (s = d.length, s !== Object.keys(t).length) return !1;
  for (i = s; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, d[i])) return !1;
  for (i = s; i-- !== 0; ) if (l = d[i], !xe(e[l], t[l], n)) return !1;
  return !0;
}
function sr(e, t) {
  return xe(e, t);
}
function Pt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function b(e) {
  return !Ve(e);
}
function $e(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if (b(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Pt(t)) return t(e);
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
function xt(e, t, n) {
  return n ? $e(e, n) === $e(t, n) : sr(e, t);
}
function So(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (xt(e, n)) return !0;
  }
  return !1;
}
function D(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function $t(e = {}, t = {}) {
  let n = ir({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    D(t[o]) && o in e && D(e[o]) ? n[o] = $t(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function ar(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : $t(t, n), {});
}
function _o(e, t) {
  let n = -1;
  if (b(e)) try {
    n = e.findLastIndex(t);
  } catch {
    n = e.lastIndexOf([...e].reverse().find(t));
  }
  return n;
}
function P(e, ...t) {
  return Pt(e) ? e(...t) : e;
}
function I(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Ye(e) {
  return I(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function lr(e, t = "", n = {}) {
  let r = Ye(t).split("."), o = r.shift();
  if (o) {
    if (D(e)) {
      let i = Object.keys(e).find((s) => Ye(s) === o) || "";
      return lr(P(e[i], n), r.join("."), n);
    }
    return;
  }
  return P(e, n);
}
function wo(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function ur(e) {
  return b(e) && !isNaN(e);
}
function Co(e = "") {
  return b(e) && e.length === 1 && !!e.match(/\S| /);
}
function q(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function cr(...e) {
  return ar(...e);
}
function ae(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function C(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in t) e = e.replace(t[n], n);
  }
  return e;
}
function To(e) {
  return I(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function At(e) {
  return I(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function Lt() {
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
function dr(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function qe(e, t) {
  if (e && t) {
    let n = (r) => {
      dr(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function pr() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Oo(e) {
  typeof e == "string" ? qe(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, pr() + "px"), qe(document.body, e?.className || "p-overflow-hidden"));
}
function Ge(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Eo(e) {
  typeof e == "string" ? Ge(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), Ge(document.body, e?.className || "p-overflow-hidden"));
}
function Ae(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let r of n?.style) if (e.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function Nt(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, r] = [e.style.visibility, e.style.display], o = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = o.width || e.offsetWidth, t.height = o.height || e.offsetHeight, e.style.display = r, e.style.visibility = n;
  }
  return t;
}
function kt() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], o = e.innerWidth || n.clientWidth || r.clientWidth, i = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: i };
}
function Le(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function fr() {
  let e = document.documentElement;
  return (window.pageXOffset || Le(e)) - (e.clientLeft || 0);
}
function hr() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function mr(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function Po(e, t, n = !0) {
  var r, o, i, s;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Nt(e), a = l.height, u = l.width, c = t.offsetHeight, p = t.offsetWidth, d = t.getBoundingClientRect(), f = hr(), h = fr(), y = kt(), m, g, S = "top";
    d.top + c + a > y.height ? (m = d.top + f - a, S = "bottom", m < 0 && (m = f)) : m = c + d.top + f, d.left + u > y.width ? g = Math.max(0, d.left + h + p - u) : g = d.left + h, mr(e) ? e.style.insetInlineEnd = g + "px" : e.style.insetInlineStart = g + "px", e.style.top = m + "px", e.style.transformOrigin = S, n && (e.style.marginTop = S === "bottom" ? `calc(${(o = (r = Ae(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? o : "2px"} * -1)` : (s = (i = Ae(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? s : "");
  }
}
function xo(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function $o(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Ao(e, t, n = !0, r = void 0) {
  var o;
  if (e) {
    let i = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Nt(e), s = t.offsetHeight, l = t.getBoundingClientRect(), a = kt(), u, c, p = r ?? "top";
    if (!r && l.top + s + i.height > a.height ? (u = -1 * i.height, p = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = s, i.width > a.width ? c = l.left * -1 : l.left + i.width > a.width ? c = (l.left + i.width - a.width) * -1 : c = 0, e.style.top = u + "px", e.style.insetInlineStart = c + "px", e.style.transformOrigin = p, n) {
      let d = (o = Ae(/-anchor-gutter$/)) == null ? void 0 : o.value;
      e.style.marginTop = p === "bottom" ? `calc(${d ?? "2px"} * -1)` : d ?? "";
    }
  }
}
function Rt(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function yr(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Rt(e));
}
function se(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function ve(e, t = {}) {
  if (se(e)) {
    let n = (r, o) => {
      var i, s;
      let l = (i = e?.$attrs) != null && i[r] ? [(s = e?.$attrs) == null ? void 0 : s[r]] : [];
      return [o].flat().reduce((a, u) => {
        if (u != null) {
          let c = typeof u;
          if (c === "string" || c === "number") a.push(u);
          else if (c === "object") {
            let p = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([d, f]) => r === "style" && (f || f === 0) ? `${d.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? d : void 0);
            a = p.length ? a.concat(p.filter((d) => !!d)) : a;
          }
        }
        return a;
      }, l);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let i = r.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? ve(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Lo(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return ve(r, t), r.append(...n), r;
  }
}
function gr(e, t) {
  return se(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function br(e, t) {
  return se(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function No(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function ko(e, t) {
  if (se(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function jt(e, t = "") {
  let n = gr(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function Ro(e, t) {
  let n = jt(e, t);
  return n.length > 0 ? n[0] : null;
}
function jo(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Vo(e, t) {
  let n = jt(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function Do(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Le(document.documentElement) || Le(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Io(e, t) {
  return e ? e.offsetHeight : 0;
}
function Vt(e, t = []) {
  let n = Rt(e);
  return n === null ? t : Vt(n, t.concat([n]));
}
function Mo(e) {
  let t = [];
  if (e) {
    let n = Vt(e), r = /(auto|scroll)/, o = (i) => {
      try {
        let s = window.getComputedStyle(i, null);
        return r.test(s.getPropertyValue("overflow")) || r.test(s.getPropertyValue("overflowX")) || r.test(s.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let i of n) {
      let s = i.nodeType === 1 && i.dataset.scrollselectors;
      if (s) {
        let l = s.split(",");
        for (let a of l) {
          let u = br(i, a);
          u && o(u) && t.push(u);
        }
      }
      i.nodeType !== 9 && o(i) && t.push(i);
    }
  }
  return t;
}
function Fo(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Wo() {
  return /(android)/i.test(navigator.userAgent);
}
function Dt() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Ho(e, t = "") {
  return se(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function Bo(e) {
  return !!(e && e.offsetParent != null);
}
function Uo() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function vr(e, t = "", n) {
  se(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Sr = Object.defineProperty, _r = Object.defineProperties, wr = Object.getOwnPropertyDescriptors, Se = Object.getOwnPropertySymbols, It = Object.prototype.hasOwnProperty, Mt = Object.prototype.propertyIsEnumerable, Je = (e, t, n) => t in e ? Sr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, O = (e, t) => {
  for (var n in t || (t = {})) It.call(t, n) && Je(e, n, t[n]);
  if (Se) for (var n of Se(t)) Mt.call(t, n) && Je(e, n, t[n]);
  return e;
}, Oe = (e, t) => _r(e, wr(t)), $ = (e, t) => {
  var n = {};
  for (var r in e) It.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && Se) for (var r of Se(e)) t.indexOf(r) < 0 && Mt.call(e, r) && (n[r] = e[r]);
  return n;
}, Cr = Lt(), A = Cr, le = /{([^}]*)}/g, Ft = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Wt = /var\([^)]+\)/g;
function Qe(e) {
  return I(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Tr(e) {
  return D(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Or(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Ne(e = "", t = "") {
  return Or(`${I(e, !1) && I(t, !1) ? `${e}-` : e}${t}`);
}
function Ht(e = "", t = "") {
  return `--${Ne(e, t)}`;
}
function Er(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Bt(e, t = "", n = "", r = [], o) {
  if (I(e)) {
    let i = e.trim();
    if (Er(i)) return;
    if (q(i, le)) {
      let s = i.replaceAll(le, (l) => {
        let a = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((c) => q(u, c)));
        return `var(${Ht(n, At(a.join("-")))}${b(o) ? `, ${o}` : ""})`;
      });
      return q(s.replace(Wt, "0"), Ft) ? `calc(${s})` : s;
    }
    return i;
  } else if (ur(e)) return e;
}
function Pr(e, t, n) {
  I(t, !1) && e.push(`${t}:${n};`);
}
function re(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Ut(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, l) {
    let a = [], u = 0, c = "", p = null, d = 0;
    for (; u <= s.length; ) {
      let f = s[u];
      if ((f === '"' || f === "'" || f === "`") && s[u - 1] !== "\\" && (p = p === f ? null : f), !p && (f === "(" && d++, f === ")" && d--, (f === "," || u === s.length) && d === 0)) {
        let h = c.trim();
        h.startsWith("dt(") ? a.push(Ut(h, l)) : a.push(r(h)), c = "", u++;
        continue;
      }
      f !== void 0 && (c += f), u++;
    }
    return a;
  }
  function r(s) {
    let l = s[0];
    if ((l === '"' || l === "'" || l === "`") && s[s.length - 1] === l) return s.slice(1, -1);
    let a = Number(s);
    return isNaN(a) ? s : a;
  }
  let o = [], i = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") i.push(s), s += 2;
  else if (e[s] === ")" && i.length > 0) {
    let l = i.pop();
    i.length === 0 && o.push([l, s]);
  }
  if (!o.length) return e;
  for (let s = o.length - 1; s >= 0; s--) {
    let [l, a] = o[s], u = e.slice(l + 3, a), c = n(u, t), p = t(...c);
    e = e.slice(0, l) + p + e.slice(a + 1);
  }
  return e;
}
var zo = (e) => {
  var t;
  let n = _.getTheme(), r = ke(n, e, void 0, "variable"), o = (t = r?.match(/--[\w-]+/g)) == null ? void 0 : t[0], i = ke(n, e, void 0, "value");
  return { name: o, variable: r, value: i };
}, G = (...e) => ke(_.getTheme(), ...e), ke = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: i } = _.defaults || {}, { prefix: s, transform: l } = e?.options || i || {}, a = q(t, le) ? t : `{${t}}`;
    return r === "value" || Ve(r) && l === "strict" ? _.getTokenValue(t) : Bt(a, void 0, s, [o.excludedKeyRegex], n);
  }
  return "";
};
function he(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, i) => {
      var s;
      return r + o + ((s = P(t[i], { dt: G })) != null ? s : "");
    }, "");
    return Ut(n, G);
  }
  return P(e, { dt: G });
}
function xr(e, t = {}) {
  let n = _.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: i = n.excludedKeyRegex } = t, s = [], l = [], a = [{ node: e, path: r }];
  for (; a.length; ) {
    let { node: c, path: p } = a.pop();
    for (let d in c) {
      let f = c[d], h = Tr(f), y = q(d, i) ? Ne(p) : Ne(p, At(d));
      if (D(h)) a.push({ node: h, path: y });
      else {
        let m = Ht(y), g = Bt(h, y, r, [i]);
        Pr(l, m, g);
        let S = y;
        r && S.startsWith(r + "-") && (S = S.slice(r.length + 1)), s.push(S.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: s, declarations: u, css: re(o, u) };
}
var T = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return xr(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, s, l, a, u, c, p;
  let { preset: d, options: f } = t, h, y, m, g, S, M, F;
  if (b(d) && f.transform !== "strict") {
    let { primitive: J, semantic: W, extend: N } = d, k = W || {}, { colorScheme: R } = k, H = $(k, ["colorScheme"]), j = N || {}, { colorScheme: B } = j, U = $(j, ["colorScheme"]), V = R || {}, { dark: z } = V, Q = $(V, ["dark"]), K = B || {}, { dark: Z } = K, X = $(K, ["dark"]), x = b(J) ? this._toVariables({ primitive: J }, f) : {}, E = b(H) ? this._toVariables({ semantic: H }, f) : {}, Y = b(Q) ? this._toVariables({ light: Q }, f) : {}, pe = b(z) ? this._toVariables({ dark: z }, f) : {}, ee = b(U) ? this._toVariables({ semantic: U }, f) : {}, Me = b(X) ? this._toVariables({ light: X }, f) : {}, Fe = b(Z) ? this._toVariables({ dark: Z }, f) : {}, [qt, Gt] = [(i = x.declarations) != null ? i : "", x.tokens], [Jt, Qt] = [(s = E.declarations) != null ? s : "", E.tokens || []], [Zt, Xt] = [(l = Y.declarations) != null ? l : "", Y.tokens || []], [en, tn] = [(a = pe.declarations) != null ? a : "", pe.tokens || []], [nn, rn] = [(u = ee.declarations) != null ? u : "", ee.tokens || []], [on, sn] = [(c = Me.declarations) != null ? c : "", Me.tokens || []], [an, ln] = [(p = Fe.declarations) != null ? p : "", Fe.tokens || []];
    h = this.transformCSS(e, qt, "light", "variable", f, r, o), y = Gt;
    let un = this.transformCSS(e, `${Jt}${Zt}`, "light", "variable", f, r, o), cn = this.transformCSS(e, `${en}`, "dark", "variable", f, r, o);
    m = `${un}${cn}`, g = [.../* @__PURE__ */ new Set([...Qt, ...Xt, ...tn])];
    let dn = this.transformCSS(e, `${nn}${on}color-scheme:light`, "light", "variable", f, r, o), pn = this.transformCSS(e, `${an}color-scheme:dark`, "dark", "variable", f, r, o);
    S = `${dn}${pn}`, M = [.../* @__PURE__ */ new Set([...rn, ...sn, ...ln])], F = P(d.css, { dt: G });
  }
  return { primitive: { css: h, tokens: y }, semantic: { css: m, tokens: g }, global: { css: S, tokens: M }, style: F };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: i, selector: s }) {
  var l, a, u;
  let c, p, d;
  if (b(t) && n.transform !== "strict") {
    let f = e.replace("-directive", ""), h = t, { colorScheme: y, extend: m, css: g } = h, S = $(h, ["colorScheme", "extend", "css"]), M = m || {}, { colorScheme: F } = M, J = $(M, ["colorScheme"]), W = y || {}, { dark: N } = W, k = $(W, ["dark"]), R = F || {}, { dark: H } = R, j = $(R, ["dark"]), B = b(S) ? this._toVariables({ [f]: O(O({}, S), J) }, n) : {}, U = b(k) ? this._toVariables({ [f]: O(O({}, k), j) }, n) : {}, V = b(N) ? this._toVariables({ [f]: O(O({}, N), H) }, n) : {}, [z, Q] = [(l = B.declarations) != null ? l : "", B.tokens || []], [K, Z] = [(a = U.declarations) != null ? a : "", U.tokens || []], [X, x] = [(u = V.declarations) != null ? u : "", V.tokens || []], E = this.transformCSS(f, `${z}${K}`, "light", "variable", n, o, i, s), Y = this.transformCSS(f, X, "dark", "variable", n, o, i, s);
    c = `${E}${Y}`, p = [.../* @__PURE__ */ new Set([...Q, ...Z, ...x])], d = P(g, { dt: G });
  }
  return { css: c, tokens: p, style: d };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i;
  let { preset: s, options: l } = t, a = (i = s?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: a, options: l, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, s;
  let l = e.replace("-directive", ""), { preset: a, options: u } = t, c = ((i = a?.components) == null ? void 0 : i[l]) || ((s = a?.directives) == null ? void 0 : s[l]);
  return this.getPreset({ name: l, preset: c, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${P(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: i }), l = Object.entries(r).reduce((a, [u, c]) => a.push(`${u}="${c}"`) && a, []).join(" ");
  return Object.entries(s || {}).reduce((a, [u, c]) => {
    if (D(c) && Object.hasOwn(c, "css")) {
      let p = ae(c.css), d = `${u}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${d}" ${l}>${p}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  var s;
  let l = { name: e, theme: t, params: n, set: o, defaults: i }, a = (s = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, u = Object.entries(r).reduce((c, [p, d]) => c.push(`${p}="${d}"`) && c, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${ae(a)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let i = function(l, a = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: a, value: void 0 };
    u.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && le.test(this.value)) {
      let p = this.value.trim().replace(le, (d) => {
        var f;
        let h = d.slice(1, -1), y = this.tokens[h];
        if (!y) return console.warn(`Token not found for path: ${h}`), "__UNRESOLVED__";
        let m = y.computed(l, a, u);
        return Array.isArray(m) && m.length === 2 ? `light-dark(${m[0].value},${m[1].value})` : (f = m?.value) != null ? f : "__UNRESOLVED__";
      });
      c = Ft.test(p.replace(Wt, "0")) ? `calc(${p})` : p;
    }
    return Ve(a.binding) && delete a.binding, u.pop(), { colorScheme: l, path: this.path, paths: a, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, s = (l, a, u) => {
    Object.entries(l).forEach(([c, p]) => {
      let d = q(c, t.variable.excludedKeyRegex) ? a : a ? `${a}.${Qe(c)}` : Qe(c), f = u ? `${u}.${c}` : c;
      D(p) ? s(p, d, f) : (o[d] || (o[d] = { paths: [], computed: (h, y = {}, m = []) => {
        if (o[d].paths.length === 1) return o[d].paths[0].computed(o[d].paths[0].scheme, y.binding, m);
        if (h && h !== "none") for (let g = 0; g < o[d].paths.length; g++) {
          let S = o[d].paths[g];
          if (S.scheme === h) return S.computed(h, y.binding, m);
        }
        return o[d].paths.map((g) => g.computed(g.scheme, y[g.scheme], m));
      } }), o[d].paths.push({ path: f, value: p, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: o }));
    });
  };
  return s(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((l) => l.split(".").filter((a) => !q(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = e[o]) == null ? void 0 : r.computed(i)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, a) => {
    let u = a, { colorScheme: c } = u, p = $(u, ["colorScheme"]);
    return l[c] = p, l;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? re(b(t) ? `${e}${t},${e} ${t}` : e, r) : re(e, re(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, i, s, l) {
  if (b(t)) {
    let { cssLayer: a } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, s);
      t = n === "dark" ? u.reduce((c, { type: p, selector: d }) => (b(d) && (c += d.includes("[CSS]") ? d.replace("[CSS]", t) : this.getSelectorRule(d, l, p, t)), c), "") : re(l ?? ":root,:host", t);
    }
    if (a) {
      let u = { name: "primeui" };
      D(a) && (u.name = P(a.name, { name: e, type: r })), b(u.name) && (t = re(`@layer ${u.name}`, t), i?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, _ = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Oe(O({}, t), { options: O(O({}, this.defaults.options), t.options) }), this._tokens = T.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), A.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Oe(O({}, this.theme), { preset: e }), this._tokens = T.createTokens(e, this.defaults), this.clearLoadedStyleNames(), A.emit("preset:change", e), A.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Oe(O({}, this.theme), { options: e }), this.clearLoadedStyleNames(), A.emit("options:change", e), A.emit("theme:change", this.theme);
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
  return T.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return T.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return T.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return T.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return T.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return T.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return T.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return T.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return T.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), A.emit(`theme:${t}:load`, e), !this._loadingStyles.size && A.emit("theme:load"));
} }, w = {
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
function Ze(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = $r(e)) || t) {
      n && (e = n);
      var r = 0, o = function() {
      };
      return { s: o, n: function() {
        return r >= e.length ? { done: !0 } : { done: !1, value: e[r++] };
      }, e: function(u) {
        throw u;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var i, s = !0, l = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var u = n.next();
    return s = u.done, u;
  }, e: function(u) {
    l = !0, i = u;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (l) throw i;
    }
  } };
}
function $r(e, t) {
  if (e) {
    if (typeof e == "string") return Xe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xe(e, t) : void 0;
  }
}
function Xe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var Ko = {
  filter: function(t, n, r, o, i) {
    var s = [];
    if (!t)
      return s;
    var l = Ze(t), a;
    try {
      for (l.s(); !(a = l.n()).done; ) {
        var u = a.value;
        if (typeof u == "string") {
          if (this.filters[o](u, r, i)) {
            s.push(u);
            continue;
          }
        } else {
          var c = Ze(n), p;
          try {
            for (c.s(); !(p = c.n()).done; ) {
              var d = p.value, f = $e(u, d);
              if (this.filters[o](f, r, i)) {
                s.push(u);
                break;
              }
            }
          } catch (h) {
            c.e(h);
          } finally {
            c.f();
          }
        }
      }
    } catch (h) {
      l.e(h);
    } finally {
      l.f();
    }
    return s;
  },
  filters: {
    startsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = C(n.toString()).toLocaleLowerCase(r), i = C(t.toString()).toLocaleLowerCase(r);
      return i.slice(0, o.length) === o;
    },
    contains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = C(n.toString()).toLocaleLowerCase(r), i = C(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o) !== -1;
    },
    notContains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = C(n.toString()).toLocaleLowerCase(r), i = C(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o) === -1;
    },
    endsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = C(n.toString()).toLocaleLowerCase(r), i = C(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o, i.length - o.length) !== -1;
    },
    equals: function(t, n, r) {
      return n == null || n === "" ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() === n.getTime() : C(t.toString()).toLocaleLowerCase(r) == C(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(t, n, r) {
      return n == null || n === "" ? !1 : t == null ? !0 : t.getTime && n.getTime ? t.getTime() !== n.getTime() : C(t.toString()).toLocaleLowerCase(r) != C(n.toString()).toLocaleLowerCase(r);
    },
    in: function(t, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (xt(t, n[r]))
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
}, Ar = `
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
function ue(e) {
  "@babel/helpers - typeof";
  return ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ue(e);
}
function et(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function tt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? et(Object(n), !0).forEach(function(r) {
      Lr(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : et(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Lr(e, t, n) {
  return (t = Nr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Nr(e) {
  var t = kr(e, "string");
  return ue(t) == "symbol" ? t : t + "";
}
function kr(e, t) {
  if (ue(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ue(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Rr(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  We() && We().components ? yt(e) : t ? e() : vn(e);
}
var jr = 0;
function Vr(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = L(!1), r = L(e), o = L(null), i = Dt() ? window.document : void 0, s = t.document, l = s === void 0 ? i : s, a = t.immediate, u = a === void 0 ? !0 : a, c = t.manual, p = c === void 0 ? !1 : c, d = t.name, f = d === void 0 ? "style_".concat(++jr) : d, h = t.id, y = h === void 0 ? void 0 : h, m = t.media, g = m === void 0 ? void 0 : m, S = t.nonce, M = S === void 0 ? void 0 : S, F = t.first, J = F === void 0 ? !1 : F, W = t.onMounted, N = W === void 0 ? void 0 : W, k = t.onUpdated, R = k === void 0 ? void 0 : k, H = t.onLoad, j = H === void 0 ? void 0 : H, B = t.props, U = B === void 0 ? {} : B, V = function() {
  }, z = function(Z) {
    var X = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var x = tt(tt({}, U), X), E = x.name || f, Y = x.id || y, pe = x.nonce || M;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(E, '"]')) || l.getElementById(Y) || l.createElement("style"), o.value.isConnected || (r.value = Z || e, ve(o.value, {
        type: "text/css",
        id: Y,
        media: g,
        nonce: pe
      }), J ? l.head.prepend(o.value) : l.head.appendChild(o.value), vr(o.value, "data-primevue-style-id", E), ve(o.value, x), o.value.onload = function(ee) {
        return j?.(ee, {
          name: E
        });
      }, N?.(E)), !n.value && (V = oe(r, function(ee) {
        o.value.textContent = ee, R?.(E);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, Q = function() {
    !l || !n.value || (V(), yr(o.value) && l.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !p && Rr(z), {
    id: y,
    name: f,
    el: o,
    css: r,
    unload: Q,
    load: z,
    isLoaded: bn(n)
  };
}
function ce(e) {
  "@babel/helpers - typeof";
  return ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ce(e);
}
var nt, rt, ot, it;
function st(e, t) {
  return Fr(e) || Mr(e, t) || Ir(e, t) || Dr();
}
function Dr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ir(e, t) {
  if (e) {
    if (typeof e == "string") return at(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? at(e, t) : void 0;
  }
}
function at(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Mr(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, s, l = [], a = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(a = (r = i.call(n)).done) && (l.push(r.value), l.length !== t); a = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Fr(e) {
  if (Array.isArray(e)) return e;
}
function lt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ee(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? lt(Object(n), !0).forEach(function(r) {
      Wr(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : lt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Wr(e, t, n) {
  return (t = Hr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Hr(e) {
  var t = Br(e, "string");
  return ce(t) == "symbol" ? t : t + "";
}
function Br(e, t) {
  if (ce(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ce(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function me(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Ur = function(t) {
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
}, zr = {}, Kr = {}, ne = {
  name: "base",
  css: Ur,
  style: Ar,
  classes: zr,
  inlineStyles: Kr,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, o = r(he(nt || (nt = me(["", ""])), t));
    return b(o) ? Vr(ae(o), Ee({
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
      return _.transformCSS(n.name || t.name, "".concat(o).concat(he(rt || (rt = me(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return _.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return _.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return _.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return _.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return _.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = P(this.css, {
        dt: G
      }) || "", o = ae(he(ot || (ot = me(["", "", ""])), r, t)), i = Object.entries(n).reduce(function(s, l) {
        var a = st(l, 2), u = a[0], c = a[1];
        return s.push("".concat(u, '="').concat(c, '"')) && s;
      }, []).join(" ");
      return b(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return _.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [_.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = he(it || (it = me(["", ""])), P(this.style, {
        dt: G
      })), s = ae(_.transformCSS(o, i)), l = Object.entries(n).reduce(function(a, u) {
        var c = st(u, 2), p = c[0], d = c[1];
        return a.push("".concat(p, '="').concat(d, '"')) && a;
      }, []).join(" ");
      b(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Ee(Ee({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ye = Lt();
function de(e) {
  "@babel/helpers - typeof";
  return de = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, de(e);
}
function ut(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ge(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ut(Object(n), !0).forEach(function(r) {
      Yr(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ut(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Yr(e, t, n) {
  return (t = qr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function qr(e) {
  var t = Gr(e, "string");
  return de(t) == "symbol" ? t : t + "";
}
function Gr(e, t) {
  if (de(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (de(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Jr = {
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
    text: [w.STARTS_WITH, w.CONTAINS, w.NOT_CONTAINS, w.ENDS_WITH, w.EQUALS, w.NOT_EQUALS],
    numeric: [w.EQUALS, w.NOT_EQUALS, w.LESS_THAN, w.LESS_THAN_OR_EQUAL_TO, w.GREATER_THAN, w.GREATER_THAN_OR_EQUAL_TO],
    date: [w.DATE_IS, w.DATE_IS_NOT, w.DATE_BEFORE, w.DATE_AFTER]
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
}, Qr = Symbol();
function Zr(e, t) {
  var n = {
    config: Sn(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Qr, n), Xr(), eo(e, n), n;
}
var ie = [];
function Xr() {
  A.clear(), ie.forEach(function(e) {
    return e?.();
  }), ie = [];
}
function eo(e, t) {
  var n = L(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !_.isStyleNameLoaded("common")) {
      var c, p, d = ((c = ne.getCommonTheme) === null || c === void 0 ? void 0 : c.call(ne)) || {}, f = d.primitive, h = d.semantic, y = d.global, m = d.style, g = {
        nonce: (p = t.config) === null || p === void 0 || (p = p.csp) === null || p === void 0 ? void 0 : p.nonce
      };
      ne.load(f?.css, ge({
        name: "primitive-variables"
      }, g)), ne.load(h?.css, ge({
        name: "semantic-variables"
      }, g)), ne.load(y?.css, ge({
        name: "global-variables"
      }, g)), ne.loadStyle(ge({
        name: "global-style"
      }, g), m), _.setLoadedStyleName("common");
    }
  };
  A.on("theme:change", function(a) {
    n.value || (e.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var o = oe(t.config, function(a, u) {
    ye.emit("config:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = oe(function() {
    return t.config.ripple;
  }, function(a, u) {
    ye.emit("config:ripple:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = oe(function() {
    return t.config.theme;
  }, function(a, u) {
    n.value || _.setTheme(a), t.config.unstyled || r(), n.value = !1, ye.emit("config:theme:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = oe(function() {
    return t.config.unstyled;
  }, function(a, u) {
    !a && t.config.theme && r(), ye.emit("config:unstyled:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  ie.push(o), ie.push(i), ie.push(s), ie.push(l);
}
var to = {
  install: function(t, n) {
    var r = cr(Jr, n);
    Zr(t, r);
  }
}, zt = {
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
    this.mounted = Dt();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function no(e, t, n, r, o, i) {
  return i.inline ? be(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (_n(), wn(gt, {
    key: 1,
    to: n.appendTo
  }, [be(e.$slots, "default")], 8, ["to"])) : bt("", !0);
}
zt.render = no;
const ro = "data-wippy-overlay-layer";
function Kt() {
  return typeof window < "u" && typeof window.document < "u";
}
function Yt() {
  return Kt() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function oo() {
  return Yt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const io = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let so = 0;
const _e = /* @__PURE__ */ new WeakMap();
function ct(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function ao(e, t) {
  if (!io.test(e.className))
    return;
  const n = e.style.cssText;
  ct(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!_e.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && ct(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), _e.set(e, r);
  }
}
function De(e) {
  const t = _e.get(e);
  t && (t.disconnect(), _e.delete(e));
}
function lo(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Re(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const we = /* @__PURE__ */ new Set(), Ie = /* @__PURE__ */ new WeakMap();
let dt = !1, je = !1;
function uo() {
  je = !1;
  for (const e of we) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && De(t);
      we.delete(e), Ie.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Re(e);
  }
}
function pt() {
  je || (je = !0, requestAnimationFrame(uo));
}
function co(e) {
  const t = document.createElement("div");
  t.setAttribute(ro, "");
  const n = Yt();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Re(t);
  const r = new MutationObserver((o) => {
    const i = t.__wippyAnchorName;
    for (const s of o) {
      if (i)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && ao(l, i);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && De(l);
    }
    t.isConnected && t.childElementCount > 0 && Re(t);
  });
  return r.observe(t, { childList: !0 }), Ie.set(t, r), we.add(t), dt || (dt = !0, window.addEventListener("scroll", pt, { capture: !0, passive: !0 }), window.addEventListener("resize", pt, { passive: !0 })), t;
}
function ft(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = co(e.hostRoot), oo())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++so}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function ht(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && De(t);
    we.delete(e.layer), Ie.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let mt = !1;
function po() {
  if (mt)
    return;
  mt = !0;
  const e = zt;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Kt() && (this.hostRoot = lo(this.$el), this.mounted = !0, this.hostRoot && (this.inline || ft(this), this.$watch("inline", (t) => {
      t ? ht(this) : ft(this);
    })));
  }, e.render = function() {
    return this.inline ? be(this.$slots, "default", { key: 0 }) : this.mounted ? Cn(gt, { key: 1, to: this.resolvedTarget || document.body }, [
      be(this.$slots, "default")
    ]) : bt("", !0);
  }, e.unmounted = function() {
    ht(this);
  };
}
const Yo = {
  install: (e) => {
    po(), e.use(to, { theme: "none" });
  }
};
export {
  Wo as $,
  Mo as A,
  ne as B,
  Io as C,
  Po as D,
  lr as E,
  Ko as F,
  _ as G,
  Pt as H,
  Ao as I,
  Co as J,
  se as K,
  Vo as L,
  _o as M,
  A as N,
  To as O,
  Yo as P,
  D as Q,
  Fo as R,
  xo as S,
  jo as T,
  Lo as U,
  ye as V,
  vo as W,
  ko as X,
  Uo as Y,
  Ge as Z,
  vr as _,
  zt as a,
  Do as a0,
  b,
  jt as c,
  No as d,
  Bo as e,
  Ro as f,
  go as g,
  bo as h,
  Ho as i,
  Eo as j,
  xt as k,
  Ve as l,
  Oo as m,
  kt as n,
  qe as o,
  $e as p,
  So as q,
  zo as r,
  Lt as s,
  P as t,
  yo as u,
  $o as v,
  I as w,
  wo as x,
  Ye as y,
  br as z
};
//# sourceMappingURL=primevue-plugin-Dn0ACs8V.js.map

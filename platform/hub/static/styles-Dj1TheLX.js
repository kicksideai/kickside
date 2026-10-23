import { hasInjectionContext as vt, inject as Me, effectScope as yt, ref as N, markRaw as wt, createApp as kt, onMounted as _r, onUnmounted as St, watch as se, readonly as _t, getCurrentInstance as Ue, nextTick as Ct, reactive as Tt, renderSlot as Se, openBlock as Et, createBlock as Ot, Teleport as Cr, createCommentVNode as Tr, h as zt } from "vue";
import { addCollection as Pt } from "@iconify/vue";
import { config as Ke, addIcons as At, on as Lt, applyThemeMode as he, host as $t, hostCss as Nt, loadCss as jt } from "@wippy-fe/proxy";
var Ae = "data-wippy-visible";
function Ye(e) {
  const r = e.getAttribute(Ae);
  return r === "true" ? !0 : r === "false" ? !1 : null;
}
var Rt = Object.defineProperty, It = (e, r, t) => r in e ? Rt(e, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[r] = t, v = (e, r, t) => It(e, typeof r != "symbol" ? r + "" : r, t), Dt = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Vt = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Ge(e) {
  const r = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(r) ? r : null;
}
function Mt(...e) {
  const r = /* @__PURE__ */ new Set();
  for (const t of e)
    if (t)
      for (const [o, n] of Object.entries(t)) {
        if ((o === "@light" || o === "@dark") && n && typeof n == "object") {
          for (const [i, l] of Object.entries(n)) {
            const s = typeof l == "string" ? Ge(i) : null;
            s && r.add(s);
          }
          continue;
        }
        const a = typeof n == "string" ? Ge(o) : null;
        a && r.add(a);
      }
  return [...r].sort();
}
function qt(e) {
  if (e.length === 0)
    return "";
  const r = e.map((t) => `  ${t}: inherit;`).join(`
`);
  return `${Vt} {
${r}
}`;
}
function Ft(e, r) {
  const t = qt(r);
  t && Er(e, t, "@wippy-fe/css-variables-bridge");
}
function Bt(e, r) {
  const o = (r ?? Dt).map(async (n) => {
    const a = Nt[n];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await jt(a);
    } catch (i) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${a}):`, i), null;
    }
  });
  return Promise.all(o).then((n) => {
    for (const a of n) {
      if (!a)
        continue;
      const i = document.createElement("style");
      i.textContent = a, i.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(i);
    }
  });
}
function Ht(e, r) {
  const t = document.createElement("style");
  t.textContent = r, e.appendChild(t);
}
function Er(e, r, t) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(r), e.adoptedStyleSheets = [...e.adoptedStyleSheets, n];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", t), o.textContent = r, e.appendChild(o);
}
function Wt(e, r) {
  Er(e, r, "@wippy-fe/custom-css");
}
function Or(e) {
  return e.__wippyHost ?? null;
}
function Ut(e) {
  return e.replace(/-([a-z])/g, (r, t) => t.toUpperCase());
}
function Kt(e, r, t) {
  switch (t.type) {
    case "string":
      return { value: r };
    case "number": {
      const o = Number.parseFloat(r);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(r, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: r !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(r);
        return t.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: r };
  }
}
function Oe(e, r) {
  const t = {}, o = [];
  for (const [n, a] of Object.entries(r.properties)) {
    const i = e.getAttribute(n), l = Ut(n);
    if (i === null) {
      a.default !== void 0 && (t[l] = a.default);
      continue;
    }
    const s = Kt(n, i, a);
    s.error ? o.push(s.error) : t[l] = s.value;
  }
  return { props: t, errors: o };
}
var Yt = class {
  constructor(e, r) {
    v(this, "_props"), v(this, "_errors"), v(this, "_content"), v(this, "_hostVisibility"), v(this, "_propsListeners", /* @__PURE__ */ new Set()), v(this, "_contentListeners", /* @__PURE__ */ new Set()), v(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), v(this, "_disposed", !1), v(this, "_emitToDom"), v(this, "props"), v(this, "events"), v(this, "content"), v(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = r;
    const t = this;
    this.props = {
      get value() {
        return t._props;
      },
      get errors() {
        return t._errors;
      },
      subscribe(o, n) {
        return t._subscribeProps(o, n);
      }
    }, this.events = {
      emit(o, n) {
        t._disposed || t._emitToDom(o, n);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return t._content;
      },
      subscribe(o, n) {
        return t._subscribeContent(o, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return t._hostVisibility;
      },
      subscribe(o, n) {
        return t._subscribeHostVisibility(o, n);
      }
    };
  }
  /** @internal */
  notifyProps(e, r) {
    if (!this._disposed) {
      this._props = e, this._errors = r;
      for (const t of this._propsListeners)
        t(e, r);
    }
  }
  /** @internal */
  notifyContent(e) {
    if (!this._disposed) {
      this._content = e;
      for (const r of this._contentListeners)
        r(e);
    }
  }
  /** @internal */
  notifyHostVisibility(e, r) {
    if (!(this._disposed || e === r)) {
      this._hostVisibility = e;
      for (const t of this._hostVisibilityListeners)
        t(e, r);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(e, r) {
    if (this._disposed || r?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(e), r?.immediate && e(this._props, this._errors);
    const t = () => {
      this._propsListeners.delete(e), r?.signal?.removeEventListener("abort", t);
    };
    return r?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeContent(e, r) {
    if (this._disposed || r?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), r?.immediate && e(this._content);
    const t = () => {
      this._contentListeners.delete(e), r?.signal?.removeEventListener("abort", t);
    };
    return r?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeHostVisibility(e, r) {
    if (this._disposed || r?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), r?.immediate && e(this._hostVisibility, this._hostVisibility);
    const t = () => {
      this._hostVisibilityListeners.delete(e), r?.signal?.removeEventListener("abort", t);
    };
    return r?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
}, Gt = class extends HTMLElement {
  constructor() {
    super(), v(this, "_internals"), v(this, "_contentObserver", null), v(this, "_initialized", !1), v(this, "_container", null), v(this, "_reactive", null), v(this, "_lastProps", null), v(this, "_lastErrors", []), v(this, "_lastContent", null), v(this, "_themeUnsub", null), v(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Ye(this);
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
    const e = this.wippyConfig, r = Object.keys(e.propsSchema.properties), t = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...r, ...t, Ae])];
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
    return Or(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(e, r) {
    this.dispatchEvent(new CustomEvent(e, {
      bubbles: !0,
      composed: !0,
      detail: r
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
      const e = this.constructor.wippyConfig, r = !!e.contentTemplate;
      let t, o;
      if (this._lastProps !== null)
        t = this._lastProps, o = this._lastErrors;
      else {
        const a = Oe(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), t = a.props, o = a.errors, this._lastProps = t, this._lastErrors = o;
      }
      const n = r ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      r && this._lastContent === null && (this._lastContent = n), this._reactive = new Yt(
        { props: t, errors: o, content: n, hasContent: r, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, r = this._initialized, t = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let o;
      if (r)
        o = this._container;
      else {
        this.onInit(t), e.inlineCss && Ht(t, e.inlineCss);
        try {
          const p = Ke?.theming, c = Mt(
            p?.global?.cssVariables,
            p?.children?.cssVariables
          );
          Ft(t, c);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const p = Ke?.theming, c = [p?.global?.customCSS, p?.children?.customCSS].filter(Boolean).join(`
`);
            c && Wt(t, c);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Bt(t, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const s = e.containerClasses ?? [];
        s.length > 0 && o.classList.add(...s), t.appendChild(o), this._container = o, At(Pt);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Lt("@theme", (s) => this._applyTheme(s)));
      const { props: n, errors: a } = Oe(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(n));
      const i = n;
      this._lastProps = i, this._lastErrors = a;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const s = this._extractContent(e.contentTemplate);
        this._lastContent = s, this._reactive?.notifyContent(s), this.onContentChanged(s);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(t, o, i, a, l, r), this._internals.states.delete("loading"), this._internals.states.add("ready"), r || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = $t.getThemeMode?.()) {
    he(e, this), this._container && he(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), he("auto", this), this._container && he("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, r, t) {
    if (r === t)
      return;
    if (e === Ae) {
      const l = this._hostVisible, s = Ye(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const o = this.constructor.wippyConfig, { props: n, errors: a } = Oe(this, o.propsSchema);
    o.validateProps && a.push(...o.validateProps(n));
    const i = n;
    this._lastProps = i, this._lastErrors = a, this._reactive?.notifyProps(i, a), this.onPropsChanged(i, a);
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
  onPropsChanged(e, r) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(e, r) {
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
function Zt(e) {
  return e.__wippyHostBus ?? null;
}
function Jt(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let zr;
const Pr = (e) => zr = e, Qt = () => vt() && Me(Ar) || zr, Ar = (
  /* istanbul ignore next */
  Symbol()
);
function Xt() {
  const e = yt(!0), r = e.run(() => N({}));
  let t = [], o = [];
  const n = wt({
    install(a) {
      Pr(n), n._a = a, a.provide(Ar, n), a.config.globalProperties.$pinia = n, o.forEach((i) => t.push(i)), o = [];
    },
    use(a) {
      return this._a ? t.push(a) : o.push(a), this;
    },
    _p: t,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: r
  });
  return n;
}
var eo = Object.defineProperty, ro = (e, r, t) => r in e ? eo(e, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[r] = t, ne = (e, r, t) => ro(e, typeof r != "symbol" ? r + "" : r, t), Lr = /* @__PURE__ */ Symbol("wippy:emit"), to = /* @__PURE__ */ Symbol("wippy:props"), oo = /* @__PURE__ */ Symbol("wippy:props_error"), no = /* @__PURE__ */ Symbol("wippy:content"), ao = /* @__PURE__ */ Symbol("wippy:panel-id"), io = /* @__PURE__ */ Symbol("wippy:layout-bus"), so = /* @__PURE__ */ Symbol("wippy:host"), $r = /* @__PURE__ */ Symbol("wippy:host-visibility");
function An() {
  const e = Me(Lr);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function lo() {
  const e = Me($r);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function Ln(e) {
  const r = lo();
  let t = !1, o = null, n = !1;
  function a() {
    if (o)
      return n = !0, o;
    let i;
    try {
      i = Promise.resolve(e());
    } catch (s) {
      i = Promise.reject(s);
    }
    const l = i.finally(() => {
      if (o === l && (o = null, t && n))
        return n = !1, a();
    });
    return o = l, l;
  }
  return _r(() => (t = !0, a())), St(() => {
    t = !1, n = !1;
  }), se(r, (i, l) => {
    if (t && l === !1 && i === !0)
      return a();
  }), r;
}
var $n = class extends Gt {
  constructor() {
    super(...arguments), ne(this, "_vueApp", null), ne(this, "_propsRef", N({})), ne(this, "_errorsRef", N([])), ne(this, "_contentRef", N(null)), ne(this, "_hostVisibilityRef", N(null)), ne(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, r, t, o, n, a) {
    const i = this.constructor.vueConfig;
    this._propsRef.value = t, this._errorsRef.value = o, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const p of o)
      this.emitEvent("invalid", { message: p });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((p, c) => {
      this._propsRef.value = p, this._errorsRef.value = [...c];
      for (const u of c)
        this.emitEvent("invalid", { message: u });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((p) => {
      this._contentRef.value = p;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((p) => {
      this._hostVisibilityRef.value = p;
    }, { signal: l.signal });
    const s = (p) => {
      if (l.signal.aborted)
        return;
      const c = Qt(), u = kt(p.rootComponent);
      this._vueApp = u;
      const d = Xt();
      if (p.piniaPlugins)
        for (const m of p.piniaPlugins)
          d.use(m);
      if (u.use(d), p.plugins)
        for (const m of p.plugins)
          u.use(m);
      u.provide(to, this._propsRef), u.provide(oo, this._errorsRef), u.provide(Lr, this.emitEvent.bind(this)), u.provide(no, this._contentRef), u.provide($r, this._hostVisibilityRef), u.provide(ao, Jt(this)), u.provide(io, Zt(this)), u.provide(so, Or(this)), p.providers && p.providers(u, this), u.mount(r), c && Pr(c);
    };
    if (i.rootComponent)
      s(i);
    else if (i.lazyConfig) {
      const p = document.createElement("wippy-loading");
      p.setAttribute("no-bg", ""), r.appendChild(p), i.lazyConfig().then((c) => {
        l.signal.aborted || (p.remove(), s(c));
      }).catch((c) => {
        if (l.signal.aborted)
          return;
        const u = c instanceof Error ? c.message : String(c), d = document.createElement("wippy-error");
        d.setAttribute("title", "Failed to load"), d.setAttribute("message", u), p.replaceWith(d), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, po = Object.defineProperty, Ze = Object.getOwnPropertySymbols, co = Object.prototype.hasOwnProperty, uo = Object.prototype.propertyIsEnumerable, Je = (e, r, t) => r in e ? po(e, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[r] = t, mo = (e, r) => {
  for (var t in r || (r = {})) co.call(r, t) && Je(e, t, r[t]);
  if (Ze) for (var t of Ze(r)) uo.call(r, t) && Je(e, t, r[t]);
  return e;
};
function qe(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Le(e, r, t = /* @__PURE__ */ new WeakSet()) {
  if (e === r) return !0;
  if (!e || !r || typeof e != "object" || typeof r != "object" || t.has(e) || t.has(r)) return !1;
  t.add(e).add(r);
  let o = Array.isArray(e), n = Array.isArray(r), a, i, l;
  if (o && n) {
    if (i = e.length, i != r.length) return !1;
    for (a = i; a-- !== 0; ) if (!Le(e[a], r[a], t)) return !1;
    return !0;
  }
  if (o != n) return !1;
  let s = e instanceof Date, p = r instanceof Date;
  if (s != p) return !1;
  if (s && p) return e.getTime() == r.getTime();
  let c = e instanceof RegExp, u = r instanceof RegExp;
  if (c != u) return !1;
  if (c && u) return e.toString() == r.toString();
  let d = Object.keys(e);
  if (i = d.length, i !== Object.keys(r).length) return !1;
  for (a = i; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(r, d[a])) return !1;
  for (a = i; a-- !== 0; ) if (l = d[a], !Le(e[l], r[l], t)) return !1;
  return !0;
}
function fo(e, r) {
  return Le(e, r);
}
function Nr(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function b(e) {
  return !qe(e);
}
function $e(e, r) {
  if (!e || !r) return null;
  try {
    let t = e[r];
    if (b(t)) return t;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Nr(r)) return r(e);
    if (r.indexOf(".") === -1) return e[r];
    {
      let t = r.split("."), o = e;
      for (let n = 0, a = t.length; n < a; ++n) {
        if (o == null) return null;
        o = o[t[n]];
      }
      return o;
    }
  }
  return null;
}
function go(e, r, t) {
  return t ? $e(e, t) === $e(r, t) : fo(e, r);
}
function M(e, r = !0) {
  return e instanceof Object && e.constructor === Object && (r || Object.keys(e).length !== 0);
}
function jr(e = {}, r = {}) {
  let t = mo({}, e);
  return Object.keys(r).forEach((o) => {
    let n = o;
    M(r[n]) && n in e && M(e[n]) ? t[n] = jr(e[n], r[n]) : t[n] = r[n];
  }), t;
}
function ho(...e) {
  return e.reduce((r, t, o) => o === 0 ? t : jr(r, t), {});
}
function Nn(e, r) {
  let t = -1;
  if (b(e)) try {
    t = e.findLastIndex(r);
  } catch {
    t = e.lastIndexOf([...e].reverse().find(r));
  }
  return t;
}
function z(e, ...r) {
  return Nr(e) ? e(...r) : e;
}
function q(e, r = !0) {
  return typeof e == "string" && (r || e !== "");
}
function Qe(e) {
  return q(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function xo(e, r = "", t = {}) {
  let o = Qe(r).split("."), n = o.shift();
  if (n) {
    if (M(e)) {
      let a = Object.keys(e).find((i) => Qe(i) === n) || "";
      return xo(z(e[a], t), o.join("."), t);
    }
    return;
  }
  return z(e, t);
}
function jn(e, r = !0) {
  return Array.isArray(e) && (r || e.length !== 0);
}
function bo(e) {
  return b(e) && !isNaN(e);
}
function Rn(e = "") {
  return b(e) && e.length === 1 && !!e.match(/\S| /);
}
function J(e, r) {
  if (r) {
    let t = r.test(e);
    return r.lastIndex = 0, t;
  }
  return !1;
}
function vo(...e) {
  return ho(...e);
}
function ce(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function _(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let r = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let t in r) e = e.replace(r[t], t);
  }
  return e;
}
function In(e) {
  return q(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Rr(e) {
  return q(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function Ir() {
  let e = /* @__PURE__ */ new Map();
  return { on(r, t) {
    let o = e.get(r);
    return o ? o.push(t) : o = [t], e.set(r, o), this;
  }, off(r, t) {
    let o = e.get(r);
    return o && o.splice(o.indexOf(t) >>> 0, 1), this;
  }, emit(r, t) {
    let o = e.get(r);
    o && o.forEach((n) => {
      n(t);
    });
  }, clear() {
    e.clear();
  } };
}
function yo(e, r) {
  return e ? e.classList ? e.classList.contains(r) : new RegExp("(^| )" + r + "( |$)", "gi").test(e.className) : !1;
}
function Xe(e, r) {
  if (e && r) {
    let t = (o) => {
      yo(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [r].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(t));
  }
}
function wo() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Dn(e) {
  typeof e == "string" ? Xe(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, wo() + "px"), Xe(document.body, e?.className || "p-overflow-hidden"));
}
function er(e, r) {
  if (e && r) {
    let t = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [r].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(t));
  }
}
function Vn(e) {
  typeof e == "string" ? er(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), er(document.body, e?.className || "p-overflow-hidden"));
}
function Ne(e) {
  for (let r of document?.styleSheets) try {
    for (let t of r?.cssRules) for (let o of t?.style) if (e.test(o)) return { name: o, value: t.style.getPropertyValue(o).trim() };
  } catch {
  }
  return null;
}
function Dr(e) {
  let r = { width: 0, height: 0 };
  if (e) {
    let [t, o] = [e.style.visibility, e.style.display], n = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", r.width = n.width || e.offsetWidth, r.height = n.height || e.offsetHeight, e.style.display = o, e.style.visibility = t;
  }
  return r;
}
function Vr() {
  let e = window, r = document, t = r.documentElement, o = r.getElementsByTagName("body")[0], n = e.innerWidth || t.clientWidth || o.clientWidth, a = e.innerHeight || t.clientHeight || o.clientHeight;
  return { width: n, height: a };
}
function je(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function ko() {
  let e = document.documentElement;
  return (window.pageXOffset || je(e)) - (e.clientLeft || 0);
}
function So() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function _o(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function Mn(e, r, t = !0) {
  var o, n, a, i;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Dr(e), s = l.height, p = l.width, c = r.offsetHeight, u = r.offsetWidth, d = r.getBoundingClientRect(), m = So(), f = ko(), x = Vr(), g, h, y = "top";
    d.top + c + s > x.height ? (g = d.top + m - s, y = "bottom", g < 0 && (g = m)) : g = c + d.top + m, d.left + p > x.width ? h = Math.max(0, d.left + f + u - p) : h = d.left + f, _o(e) ? e.style.insetInlineEnd = h + "px" : e.style.insetInlineStart = h + "px", e.style.top = g + "px", e.style.transformOrigin = y, t && (e.style.marginTop = y === "bottom" ? `calc(${(n = (o = Ne(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? n : "2px"} * -1)` : (i = (a = Ne(/-anchor-gutter$/)) == null ? void 0 : a.value) != null ? i : "");
  }
}
function qn(e, r) {
  e && (typeof r == "string" ? e.style.cssText = r : Object.entries(r || {}).forEach(([t, o]) => e.style[t] = o));
}
function Fn(e, r) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Bn(e, r, t = !0, o = void 0) {
  var n;
  if (e) {
    let a = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Dr(e), i = r.offsetHeight, l = r.getBoundingClientRect(), s = Vr(), p, c, u = o ?? "top";
    if (!o && l.top + i + a.height > s.height ? (p = -1 * a.height, u = "bottom", l.top + p < 0 && (p = -1 * l.top)) : p = i, a.width > s.width ? c = l.left * -1 : l.left + a.width > s.width ? c = (l.left + a.width - s.width) * -1 : c = 0, e.style.top = p + "px", e.style.insetInlineStart = c + "px", e.style.transformOrigin = u, t) {
      let d = (n = Ne(/-anchor-gutter$/)) == null ? void 0 : n.value;
      e.style.marginTop = u === "bottom" ? `calc(${d ?? "2px"} * -1)` : d ?? "";
    }
  }
}
function Mr(e) {
  if (e) {
    let r = e.parentNode;
    return r && r instanceof ShadowRoot && r.host && (r = r.host), r;
  }
  return null;
}
function Co(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Mr(e));
}
function pe(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function _e(e, r = {}) {
  if (pe(e)) {
    let t = (o, n) => {
      var a, i;
      let l = (a = e?.$attrs) != null && a[o] ? [(i = e?.$attrs) == null ? void 0 : i[o]] : [];
      return [n].flat().reduce((s, p) => {
        if (p != null) {
          let c = typeof p;
          if (c === "string" || c === "number") s.push(p);
          else if (c === "object") {
            let u = Array.isArray(p) ? t(o, p) : Object.entries(p).map(([d, m]) => o === "style" && (m || m === 0) ? `${d.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? d : void 0);
            s = u.length ? s.concat(u.filter((d) => !!d)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(r).forEach(([o, n]) => {
      if (n != null) {
        let a = o.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), n) : o === "p-bind" || o === "pBind" ? _e(e, n) : (n = o === "class" ? [...new Set(t("class", n))].join(" ").trim() : o === "style" ? t("style", n).join(";").trim() : n, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = n), e.setAttribute(o, n));
      }
    });
  }
}
function Hn(e, r = {}, ...t) {
  {
    let o = document.createElement(e);
    return _e(o, r), o.append(...t), o;
  }
}
function To(e, r) {
  return pe(e) ? Array.from(e.querySelectorAll(r)) : [];
}
function Eo(e, r) {
  return pe(e) ? e.matches(r) ? e : e.querySelector(r) : null;
}
function Wn(e, r) {
  e && document.activeElement !== e && e.focus(r);
}
function Un(e, r) {
  if (pe(e)) {
    let t = e.getAttribute(r);
    return isNaN(t) ? t === "true" || t === "false" ? t === "true" : t : +t;
  }
}
function qr(e, r = "") {
  let t = To(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${r},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r}`), o = [];
  for (let n of t) getComputedStyle(n).display != "none" && getComputedStyle(n).visibility != "hidden" && o.push(n);
  return o;
}
function Kn(e, r) {
  let t = qr(e, r);
  return t.length > 0 ? t[0] : null;
}
function Yn(e) {
  if (e) {
    let r = e.offsetHeight, t = getComputedStyle(e);
    return r -= parseFloat(t.paddingTop) + parseFloat(t.paddingBottom) + parseFloat(t.borderTopWidth) + parseFloat(t.borderBottomWidth), r;
  }
  return 0;
}
function Gn(e, r) {
  let t = qr(e, r);
  return t.length > 0 ? t[t.length - 1] : null;
}
function Zn(e) {
  if (e) {
    let r = e.getBoundingClientRect();
    return { top: r.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: r.left + (window.pageXOffset || je(document.documentElement) || je(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Jn(e, r) {
  return e ? e.offsetHeight : 0;
}
function Fr(e, r = []) {
  let t = Mr(e);
  return t === null ? r : Fr(t, r.concat([t]));
}
function Qn(e) {
  let r = [];
  if (e) {
    let t = Fr(e), o = /(auto|scroll)/, n = (a) => {
      try {
        let i = window.getComputedStyle(a, null);
        return o.test(i.getPropertyValue("overflow")) || o.test(i.getPropertyValue("overflowX")) || o.test(i.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let a of t) {
      let i = a.nodeType === 1 && a.dataset.scrollselectors;
      if (i) {
        let l = i.split(",");
        for (let s of l) {
          let p = Eo(a, s);
          p && n(p) && r.push(p);
        }
      }
      a.nodeType !== 9 && n(a) && r.push(a);
    }
  }
  return r;
}
function Xn(e) {
  if (e) {
    let r = e.offsetWidth, t = getComputedStyle(e);
    return r -= parseFloat(t.paddingLeft) + parseFloat(t.paddingRight) + parseFloat(t.borderLeftWidth) + parseFloat(t.borderRightWidth), r;
  }
  return 0;
}
function ea() {
  return /(android)/i.test(navigator.userAgent);
}
function Br() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function ra(e, r = "") {
  return pe(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${r}`) : !1;
}
function ta(e) {
  return !!(e && e.offsetParent != null);
}
function oa() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function Oo(e, r = "", t) {
  pe(e) && t !== null && t !== void 0 && e.setAttribute(r, t);
}
var zo = Object.defineProperty, Po = Object.defineProperties, Ao = Object.getOwnPropertyDescriptors, Ce = Object.getOwnPropertySymbols, Hr = Object.prototype.hasOwnProperty, Wr = Object.prototype.propertyIsEnumerable, rr = (e, r, t) => r in e ? zo(e, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[r] = t, T = (e, r) => {
  for (var t in r || (r = {})) Hr.call(r, t) && rr(e, t, r[t]);
  if (Ce) for (var t of Ce(r)) Wr.call(r, t) && rr(e, t, r[t]);
  return e;
}, ze = (e, r) => Po(e, Ao(r)), A = (e, r) => {
  var t = {};
  for (var o in e) Hr.call(e, o) && r.indexOf(o) < 0 && (t[o] = e[o]);
  if (e != null && Ce) for (var o of Ce(e)) r.indexOf(o) < 0 && Wr.call(e, o) && (t[o] = e[o]);
  return t;
}, Lo = Ir(), $ = Lo, de = /{([^}]*)}/g, Ur = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Kr = /var\([^)]+\)/g;
function tr(e) {
  return q(e) ? e.replace(/[A-Z]/g, (r, t) => t === 0 ? r : "." + r.toLowerCase()).toLowerCase() : e;
}
function $o(e) {
  return M(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function No(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Re(e = "", r = "") {
  return No(`${q(e, !1) && q(r, !1) ? `${e}-` : e}${r}`);
}
function Yr(e = "", r = "") {
  return `--${Re(e, r)}`;
}
function jo(e = "") {
  let r = (e.match(/{/g) || []).length, t = (e.match(/}/g) || []).length;
  return (r + t) % 2 !== 0;
}
function Gr(e, r = "", t = "", o = [], n) {
  if (q(e)) {
    let a = e.trim();
    if (jo(a)) return;
    if (J(a, de)) {
      let i = a.replaceAll(de, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((p) => !o.some((c) => J(p, c)));
        return `var(${Yr(t, Rr(s.join("-")))}${b(n) ? `, ${n}` : ""})`;
      });
      return J(i.replace(Kr, "0"), Ur) ? `calc(${i})` : i;
    }
    return a;
  } else if (bo(e)) return e;
}
function Ro(e, r, t) {
  q(r, !1) && e.push(`${r}:${t};`);
}
function ie(e, r) {
  return e ? `${e}{${r}}` : "";
}
function Zr(e, r) {
  if (e.indexOf("dt(") === -1) return e;
  function t(i, l) {
    let s = [], p = 0, c = "", u = null, d = 0;
    for (; p <= i.length; ) {
      let m = i[p];
      if ((m === '"' || m === "'" || m === "`") && i[p - 1] !== "\\" && (u = u === m ? null : m), !u && (m === "(" && d++, m === ")" && d--, (m === "," || p === i.length) && d === 0)) {
        let f = c.trim();
        f.startsWith("dt(") ? s.push(Zr(f, l)) : s.push(o(f)), c = "", p++;
        continue;
      }
      m !== void 0 && (c += m), p++;
    }
    return s;
  }
  function o(i) {
    let l = i[0];
    if ((l === '"' || l === "'" || l === "`") && i[i.length - 1] === l) return i.slice(1, -1);
    let s = Number(i);
    return isNaN(s) ? i : s;
  }
  let n = [], a = [];
  for (let i = 0; i < e.length; i++) if (e[i] === "d" && e.slice(i, i + 3) === "dt(") a.push(i), i += 2;
  else if (e[i] === ")" && a.length > 0) {
    let l = a.pop();
    a.length === 0 && n.push([l, i]);
  }
  if (!n.length) return e;
  for (let i = n.length - 1; i >= 0; i--) {
    let [l, s] = n[i], p = e.slice(l + 3, s), c = t(p, r), u = r(...c);
    e = e.slice(0, l) + u + e.slice(s + 1);
  }
  return e;
}
var na = (e) => {
  var r;
  let t = k.getTheme(), o = Ie(t, e, void 0, "variable"), n = (r = o?.match(/--[\w-]+/g)) == null ? void 0 : r[0], a = Ie(t, e, void 0, "value");
  return { name: n, variable: o, value: a };
}, Q = (...e) => Ie(k.getTheme(), ...e), Ie = (e = {}, r, t, o) => {
  if (r) {
    let { variable: n, options: a } = k.defaults || {}, { prefix: i, transform: l } = e?.options || a || {}, s = J(r, de) ? r : `{${r}}`;
    return o === "value" || qe(o) && l === "strict" ? k.getTokenValue(r) : Gr(s, void 0, i, [n.excludedKeyRegex], t);
  }
  return "";
};
function xe(e, ...r) {
  if (e instanceof Array) {
    let t = e.reduce((o, n, a) => {
      var i;
      return o + n + ((i = z(r[a], { dt: Q })) != null ? i : "");
    }, "");
    return Zr(t, Q);
  }
  return z(e, { dt: Q });
}
function Io(e, r = {}) {
  let t = k.defaults.variable, { prefix: o = t.prefix, selector: n = t.selector, excludedKeyRegex: a = t.excludedKeyRegex } = r, i = [], l = [], s = [{ node: e, path: o }];
  for (; s.length; ) {
    let { node: c, path: u } = s.pop();
    for (let d in c) {
      let m = c[d], f = $o(m), x = J(d, a) ? Re(u) : Re(u, Rr(d));
      if (M(f)) s.push({ node: f, path: x });
      else {
        let g = Yr(x), h = Gr(f, x, o, [a]);
        Ro(l, g, h);
        let y = x;
        o && y.startsWith(o + "-") && (y = y.slice(o.length + 1)), i.push(y.replace(/-/g, "."));
      }
    }
  }
  let p = l.join("");
  return { value: l, tokens: i, declarations: p, css: ie(n, p) };
}
var C = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  let r = Object.keys(this.rules).filter((t) => t !== "custom").map((t) => this.rules[t]);
  return [e].flat().map((t) => {
    var o;
    return (o = r.map((n) => n.resolve(t)).find((n) => n.matched)) != null ? o : this.rules.custom.resolve(t);
  });
} }, _toVariables(e, r) {
  return Io(e, { prefix: r?.prefix });
}, getCommon({ name: e = "", theme: r = {}, params: t, set: o, defaults: n }) {
  var a, i, l, s, p, c, u;
  let { preset: d, options: m } = r, f, x, g, h, y, F, B;
  if (b(d) && m.transform !== "strict") {
    let { primitive: X, semantic: H, extend: j } = d, R = H || {}, { colorScheme: I } = R, W = A(R, ["colorScheme"]), D = j || {}, { colorScheme: U } = D, K = A(D, ["colorScheme"]), V = I || {}, { dark: Y } = V, ee = A(V, ["dark"]), G = U || {}, { dark: re } = G, te = A(G, ["dark"]), P = b(X) ? this._toVariables({ primitive: X }, m) : {}, O = b(W) ? this._toVariables({ semantic: W }, m) : {}, Z = b(ee) ? this._toVariables({ light: ee }, m) : {}, ge = b(Y) ? this._toVariables({ dark: Y }, m) : {}, oe = b(K) ? this._toVariables({ semantic: K }, m) : {}, He = b(te) ? this._toVariables({ light: te }, m) : {}, We = b(re) ? this._toVariables({ dark: re }, m) : {}, [rt, tt] = [(a = P.declarations) != null ? a : "", P.tokens], [ot, nt] = [(i = O.declarations) != null ? i : "", O.tokens || []], [at, it] = [(l = Z.declarations) != null ? l : "", Z.tokens || []], [st, lt] = [(s = ge.declarations) != null ? s : "", ge.tokens || []], [pt, ct] = [(p = oe.declarations) != null ? p : "", oe.tokens || []], [dt, ut] = [(c = He.declarations) != null ? c : "", He.tokens || []], [mt, ft] = [(u = We.declarations) != null ? u : "", We.tokens || []];
    f = this.transformCSS(e, rt, "light", "variable", m, o, n), x = tt;
    let gt = this.transformCSS(e, `${ot}${at}`, "light", "variable", m, o, n), ht = this.transformCSS(e, `${st}`, "dark", "variable", m, o, n);
    g = `${gt}${ht}`, h = [.../* @__PURE__ */ new Set([...nt, ...it, ...lt])];
    let xt = this.transformCSS(e, `${pt}${dt}color-scheme:light`, "light", "variable", m, o, n), bt = this.transformCSS(e, `${mt}color-scheme:dark`, "dark", "variable", m, o, n);
    y = `${xt}${bt}`, F = [.../* @__PURE__ */ new Set([...ct, ...ut, ...ft])], B = z(d.css, { dt: Q });
  }
  return { primitive: { css: f, tokens: x }, semantic: { css: g, tokens: h }, global: { css: y, tokens: F }, style: B };
}, getPreset({ name: e = "", preset: r = {}, options: t, params: o, set: n, defaults: a, selector: i }) {
  var l, s, p;
  let c, u, d;
  if (b(r) && t.transform !== "strict") {
    let m = e.replace("-directive", ""), f = r, { colorScheme: x, extend: g, css: h } = f, y = A(f, ["colorScheme", "extend", "css"]), F = g || {}, { colorScheme: B } = F, X = A(F, ["colorScheme"]), H = x || {}, { dark: j } = H, R = A(H, ["dark"]), I = B || {}, { dark: W } = I, D = A(I, ["dark"]), U = b(y) ? this._toVariables({ [m]: T(T({}, y), X) }, t) : {}, K = b(R) ? this._toVariables({ [m]: T(T({}, R), D) }, t) : {}, V = b(j) ? this._toVariables({ [m]: T(T({}, j), W) }, t) : {}, [Y, ee] = [(l = U.declarations) != null ? l : "", U.tokens || []], [G, re] = [(s = K.declarations) != null ? s : "", K.tokens || []], [te, P] = [(p = V.declarations) != null ? p : "", V.tokens || []], O = this.transformCSS(m, `${Y}${G}`, "light", "variable", t, n, a, i), Z = this.transformCSS(m, te, "dark", "variable", t, n, a, i);
    c = `${O}${Z}`, u = [.../* @__PURE__ */ new Set([...ee, ...re, ...P])], d = z(h, { dt: Q });
  }
  return { css: c, tokens: u, style: d };
}, getPresetC({ name: e = "", theme: r = {}, params: t, set: o, defaults: n }) {
  var a;
  let { preset: i, options: l } = r, s = (a = i?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: s, options: l, params: t, set: o, defaults: n });
}, getPresetD({ name: e = "", theme: r = {}, params: t, set: o, defaults: n }) {
  var a, i;
  let l = e.replace("-directive", ""), { preset: s, options: p } = r, c = ((a = s?.components) == null ? void 0 : a[l]) || ((i = s?.directives) == null ? void 0 : i[l]);
  return this.getPreset({ name: l, preset: c, options: p, params: t, set: o, defaults: n });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, r) {
  var t;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? r.options.darkModeSelector : (t = e.darkModeSelector) != null ? t : r.options.darkModeSelector) : [];
}, getLayerOrder(e, r = {}, t, o) {
  let { cssLayer: n } = r;
  return n ? `@layer ${z(n.order || n.name || "primeui", t)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: r = {}, params: t, props: o = {}, set: n, defaults: a }) {
  let i = this.getCommon({ name: e, theme: r, params: t, set: n, defaults: a }), l = Object.entries(o).reduce((s, [p, c]) => s.push(`${p}="${c}"`) && s, []).join(" ");
  return Object.entries(i || {}).reduce((s, [p, c]) => {
    if (M(c) && Object.hasOwn(c, "css")) {
      let u = ce(c.css), d = `${p}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${d}" ${l}>${u}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: r = {}, params: t, props: o = {}, set: n, defaults: a }) {
  var i;
  let l = { name: e, theme: r, params: t, set: n, defaults: a }, s = (i = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : i.css, p = Object.entries(o).reduce((c, [u, d]) => c.push(`${u}="${d}"`) && c, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${p}>${ce(s)}</style>` : "";
}, createTokens(e = {}, r, t = "", o = "", n = {}) {
  let a = function(l, s = {}, p = []) {
    if (p.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    p.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && de.test(this.value)) {
      let u = this.value.trim().replace(de, (d) => {
        var m;
        let f = d.slice(1, -1), x = this.tokens[f];
        if (!x) return console.warn(`Token not found for path: ${f}`), "__UNRESOLVED__";
        let g = x.computed(l, s, p);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (m = g?.value) != null ? m : "__UNRESOLVED__";
      });
      c = Ur.test(u.replace(Kr, "0")) ? `calc(${u})` : u;
    }
    return qe(s.binding) && delete s.binding, p.pop(), { colorScheme: l, path: this.path, paths: s, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, i = (l, s, p) => {
    Object.entries(l).forEach(([c, u]) => {
      let d = J(c, r.variable.excludedKeyRegex) ? s : s ? `${s}.${tr(c)}` : tr(c), m = p ? `${p}.${c}` : c;
      M(u) ? i(u, d, m) : (n[d] || (n[d] = { paths: [], computed: (f, x = {}, g = []) => {
        if (n[d].paths.length === 1) return n[d].paths[0].computed(n[d].paths[0].scheme, x.binding, g);
        if (f && f !== "none") for (let h = 0; h < n[d].paths.length; h++) {
          let y = n[d].paths[h];
          if (y.scheme === f) return y.computed(f, x.binding, g);
        }
        return n[d].paths.map((h) => h.computed(h.scheme, x[h.scheme], g));
      } }), n[d].paths.push({ path: m, value: u, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: n }));
    });
  };
  return i(e, t, o), n;
}, getTokenValue(e, r, t) {
  var o;
  let n = ((l) => l.split(".").filter((s) => !J(s.toLowerCase(), t.variable.excludedKeyRegex)).join("."))(r), a = r.includes("colorScheme.light") ? "light" : r.includes("colorScheme.dark") ? "dark" : void 0, i = [(o = e[n]) == null ? void 0 : o.computed(a)].flat().filter((l) => l);
  return i.length === 1 ? i[0].value : i.reduce((l = {}, s) => {
    let p = s, { colorScheme: c } = p, u = A(p, ["colorScheme"]);
    return l[c] = u, l;
  }, void 0);
}, getSelectorRule(e, r, t, o) {
  return t === "class" || t === "attr" ? ie(b(r) ? `${e}${r},${e} ${r}` : e, o) : ie(e, ie(r ?? ":root,:host", o));
}, transformCSS(e, r, t, o, n = {}, a, i, l) {
  if (b(r)) {
    let { cssLayer: s } = n;
    if (o !== "style") {
      let p = this.getColorSchemeOption(n, i);
      r = t === "dark" ? p.reduce((c, { type: u, selector: d }) => (b(d) && (c += d.includes("[CSS]") ? d.replace("[CSS]", r) : this.getSelectorRule(d, l, u, r)), c), "") : ie(l ?? ":root,:host", r);
    }
    if (s) {
      let p = { name: "primeui" };
      M(s) && (p.name = z(s.name, { name: e, type: o })), b(p.name) && (r = ie(`@layer ${p.name}`, r), a?.layerNames(p.name));
    }
    return r;
  }
  return "";
} }, k = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: r } = e;
  r && (this._theme = ze(T({}, r), { options: T(T({}, this.defaults.options), r.options) }), this._tokens = C.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), $.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = ze(T({}, this.theme), { preset: e }), this._tokens = C.createTokens(e, this.defaults), this.clearLoadedStyleNames(), $.emit("preset:change", e), $.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = ze(T({}, this.theme), { options: e }), this.clearLoadedStyleNames(), $.emit("options:change", e), $.emit("theme:change", this.theme);
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
  return C.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", r) {
  return C.getCommon({ name: e, theme: this.theme, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", r) {
  let t = { name: e, theme: this.theme, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return C.getPresetC(t);
}, getDirective(e = "", r) {
  let t = { name: e, theme: this.theme, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return C.getPresetD(t);
}, getCustomPreset(e = "", r, t, o) {
  let n = { name: e, preset: r, options: this.options, selector: t, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return C.getPreset(n);
}, getLayerOrderCSS(e = "") {
  return C.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", r, t = "style", o) {
  return C.transformCSS(e, r, o, t, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", r, t = {}) {
  return C.getCommonStyleSheet({ name: e, theme: this.theme, params: r, props: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, r, t = {}) {
  return C.getStyleSheet({ name: e, theme: this.theme, params: r, props: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: r }) {
  this._loadingStyles.size && (this._loadingStyles.delete(r), $.emit(`theme:${r}:load`, e), !this._loadingStyles.size && $.emit("theme:load"));
} }, S = {
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
function or(e, r) {
  var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!t) {
    if (Array.isArray(e) || (t = Do(e)) || r) {
      t && (e = t);
      var o = 0, n = function() {
      };
      return { s: n, n: function() {
        return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] };
      }, e: function(p) {
        throw p;
      }, f: n };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var a, i = !0, l = !1;
  return { s: function() {
    t = t.call(e);
  }, n: function() {
    var p = t.next();
    return i = p.done, p;
  }, e: function(p) {
    l = !0, a = p;
  }, f: function() {
    try {
      i || t.return == null || t.return();
    } finally {
      if (l) throw a;
    }
  } };
}
function Do(e, r) {
  if (e) {
    if (typeof e == "string") return nr(e, r);
    var t = {}.toString.call(e).slice(8, -1);
    return t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set" ? Array.from(e) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? nr(e, r) : void 0;
  }
}
function nr(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var t = 0, o = Array(r); t < r; t++) o[t] = e[t];
  return o;
}
var aa = {
  filter: function(r, t, o, n, a) {
    var i = [];
    if (!r)
      return i;
    var l = or(r), s;
    try {
      for (l.s(); !(s = l.n()).done; ) {
        var p = s.value;
        if (typeof p == "string") {
          if (this.filters[n](p, o, a)) {
            i.push(p);
            continue;
          }
        } else {
          var c = or(t), u;
          try {
            for (c.s(); !(u = c.n()).done; ) {
              var d = u.value, m = $e(p, d);
              if (this.filters[n](m, o, a)) {
                i.push(p);
                break;
              }
            }
          } catch (f) {
            c.e(f);
          } finally {
            c.f();
          }
        }
      }
    } catch (f) {
      l.e(f);
    } finally {
      l.f();
    }
    return i;
  },
  filters: {
    startsWith: function(r, t, o) {
      if (t == null || t === "")
        return !0;
      if (r == null)
        return !1;
      var n = _(t.toString()).toLocaleLowerCase(o), a = _(r.toString()).toLocaleLowerCase(o);
      return a.slice(0, n.length) === n;
    },
    contains: function(r, t, o) {
      if (t == null || t === "")
        return !0;
      if (r == null)
        return !1;
      var n = _(t.toString()).toLocaleLowerCase(o), a = _(r.toString()).toLocaleLowerCase(o);
      return a.indexOf(n) !== -1;
    },
    notContains: function(r, t, o) {
      if (t == null || t === "")
        return !0;
      if (r == null)
        return !1;
      var n = _(t.toString()).toLocaleLowerCase(o), a = _(r.toString()).toLocaleLowerCase(o);
      return a.indexOf(n) === -1;
    },
    endsWith: function(r, t, o) {
      if (t == null || t === "")
        return !0;
      if (r == null)
        return !1;
      var n = _(t.toString()).toLocaleLowerCase(o), a = _(r.toString()).toLocaleLowerCase(o);
      return a.indexOf(n, a.length - n.length) !== -1;
    },
    equals: function(r, t, o) {
      return t == null || t === "" ? !0 : r == null ? !1 : r.getTime && t.getTime ? r.getTime() === t.getTime() : _(r.toString()).toLocaleLowerCase(o) == _(t.toString()).toLocaleLowerCase(o);
    },
    notEquals: function(r, t, o) {
      return t == null || t === "" ? !1 : r == null ? !0 : r.getTime && t.getTime ? r.getTime() !== t.getTime() : _(r.toString()).toLocaleLowerCase(o) != _(t.toString()).toLocaleLowerCase(o);
    },
    in: function(r, t) {
      if (t == null || t.length === 0)
        return !0;
      for (var o = 0; o < t.length; o++)
        if (go(r, t[o]))
          return !0;
      return !1;
    },
    between: function(r, t) {
      return t == null || t[0] == null || t[1] == null ? !0 : r == null ? !1 : r.getTime ? t[0].getTime() <= r.getTime() && r.getTime() <= t[1].getTime() : t[0] <= r && r <= t[1];
    },
    lt: function(r, t) {
      return t == null ? !0 : r == null ? !1 : r.getTime && t.getTime ? r.getTime() < t.getTime() : r < t;
    },
    lte: function(r, t) {
      return t == null ? !0 : r == null ? !1 : r.getTime && t.getTime ? r.getTime() <= t.getTime() : r <= t;
    },
    gt: function(r, t) {
      return t == null ? !0 : r == null ? !1 : r.getTime && t.getTime ? r.getTime() > t.getTime() : r > t;
    },
    gte: function(r, t) {
      return t == null ? !0 : r == null ? !1 : r.getTime && t.getTime ? r.getTime() >= t.getTime() : r >= t;
    },
    dateIs: function(r, t) {
      return t == null ? !0 : r == null ? !1 : (typeof r == "string" && (r = new Date(r)), typeof t == "string" && (t = new Date(t)), r.toDateString() === t.toDateString());
    },
    dateIsNot: function(r, t) {
      return t == null ? !0 : r == null ? !1 : (typeof r == "string" && (r = new Date(r)), typeof t == "string" && (t = new Date(t)), r.toDateString() !== t.toDateString());
    },
    dateBefore: function(r, t) {
      return t == null ? !0 : r == null ? !1 : (typeof r == "string" && (r = new Date(r)), typeof t == "string" && (t = new Date(t)), r.getTime() < t.getTime());
    },
    dateAfter: function(r, t) {
      return t == null ? !0 : r == null ? !1 : (typeof r == "string" && (r = new Date(r)), typeof t == "string" && (t = new Date(t)), r.getTime() > t.getTime());
    }
  },
  register: function(r, t) {
    this.filters[r] = t;
  }
}, Vo = `
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
  return ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, ue(e);
}
function ar(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function ir(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = arguments[r] != null ? arguments[r] : {};
    r % 2 ? ar(Object(t), !0).forEach(function(o) {
      Mo(e, o, t[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ar(Object(t)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(t, o));
    });
  }
  return e;
}
function Mo(e, r, t) {
  return (r = qo(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function qo(e) {
  var r = Fo(e, "string");
  return ue(r) == "symbol" ? r : r + "";
}
function Fo(e, r) {
  if (ue(e) != "object" || !e) return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(e, r);
    if (ue(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(e);
}
function Bo(e) {
  var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Ue() && Ue().components ? _r(e) : r ? e() : Ct(e);
}
var Ho = 0;
function Wo(e) {
  var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, t = N(!1), o = N(e), n = N(null), a = Br() ? window.document : void 0, i = r.document, l = i === void 0 ? a : i, s = r.immediate, p = s === void 0 ? !0 : s, c = r.manual, u = c === void 0 ? !1 : c, d = r.name, m = d === void 0 ? "style_".concat(++Ho) : d, f = r.id, x = f === void 0 ? void 0 : f, g = r.media, h = g === void 0 ? void 0 : g, y = r.nonce, F = y === void 0 ? void 0 : y, B = r.first, X = B === void 0 ? !1 : B, H = r.onMounted, j = H === void 0 ? void 0 : H, R = r.onUpdated, I = R === void 0 ? void 0 : R, W = r.onLoad, D = W === void 0 ? void 0 : W, U = r.props, K = U === void 0 ? {} : U, V = function() {
  }, Y = function(re) {
    var te = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var P = ir(ir({}, K), te), O = P.name || m, Z = P.id || x, ge = P.nonce || F;
      n.value = l.querySelector('style[data-primevue-style-id="'.concat(O, '"]')) || l.getElementById(Z) || l.createElement("style"), n.value.isConnected || (o.value = re || e, _e(n.value, {
        type: "text/css",
        id: Z,
        media: h,
        nonce: ge
      }), X ? l.head.prepend(n.value) : l.head.appendChild(n.value), Oo(n.value, "data-primevue-style-id", O), _e(n.value, P), n.value.onload = function(oe) {
        return D?.(oe, {
          name: O
        });
      }, j?.(O)), !t.value && (V = se(o, function(oe) {
        n.value.textContent = oe, I?.(O);
      }, {
        immediate: !0
      }), t.value = !0);
    }
  }, ee = function() {
    !l || !t.value || (V(), Co(n.value) && l.head.removeChild(n.value), t.value = !1, n.value = null);
  };
  return p && !u && Bo(Y), {
    id: x,
    name: m,
    el: n,
    css: o,
    unload: ee,
    load: Y,
    isLoaded: _t(t)
  };
}
function me(e) {
  "@babel/helpers - typeof";
  return me = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, me(e);
}
var sr, lr, pr, cr;
function dr(e, r) {
  return Go(e) || Yo(e, r) || Ko(e, r) || Uo();
}
function Uo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ko(e, r) {
  if (e) {
    if (typeof e == "string") return ur(e, r);
    var t = {}.toString.call(e).slice(8, -1);
    return t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set" ? Array.from(e) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? ur(e, r) : void 0;
  }
}
function ur(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var t = 0, o = Array(r); t < r; t++) o[t] = e[t];
  return o;
}
function Yo(e, r) {
  var t = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (t != null) {
    var o, n, a, i, l = [], s = !0, p = !1;
    try {
      if (a = (t = t.call(e)).next, r !== 0) for (; !(s = (o = a.call(t)).done) && (l.push(o.value), l.length !== r); s = !0) ;
    } catch (c) {
      p = !0, n = c;
    } finally {
      try {
        if (!s && t.return != null && (i = t.return(), Object(i) !== i)) return;
      } finally {
        if (p) throw n;
      }
    }
    return l;
  }
}
function Go(e) {
  if (Array.isArray(e)) return e;
}
function mr(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function Pe(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = arguments[r] != null ? arguments[r] : {};
    r % 2 ? mr(Object(t), !0).forEach(function(o) {
      Zo(e, o, t[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : mr(Object(t)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(t, o));
    });
  }
  return e;
}
function Zo(e, r, t) {
  return (r = Jo(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function Jo(e) {
  var r = Qo(e, "string");
  return me(r) == "symbol" ? r : r + "";
}
function Qo(e, r) {
  if (me(e) != "object" || !e) return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(e, r);
    if (me(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(e);
}
function be(e, r) {
  return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
}
var Xo = function(r) {
  var t = r.dt;
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
    padding-right: `.concat(t("scrollbar.width"), `;
}
`);
}, en = {}, rn = {}, ae = {
  name: "base",
  css: Xo,
  style: Vo,
  classes: en,
  inlineStyles: rn,
  load: function(r) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, n = o(xe(sr || (sr = be(["", ""])), r));
    return b(n) ? Wo(ce(n), Pe({
      name: this.name
    }, t)) : {};
  },
  loadCSS: function() {
    var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, r);
  },
  loadStyle: function() {
    var r = this, t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, t, function() {
      var n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return k.transformCSS(t.name || r.name, "".concat(n).concat(xe(lr || (lr = be(["", ""])), o)));
    });
  },
  getCommonTheme: function(r) {
    return k.getCommon(this.name, r);
  },
  getComponentTheme: function(r) {
    return k.getComponent(this.name, r);
  },
  getDirectiveTheme: function(r) {
    return k.getDirective(this.name, r);
  },
  getPresetTheme: function(r, t, o) {
    return k.getCustomPreset(this.name, r, t, o);
  },
  getLayerOrderThemeCSS: function() {
    return k.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = z(this.css, {
        dt: Q
      }) || "", n = ce(xe(pr || (pr = be(["", "", ""])), o, r)), a = Object.entries(t).reduce(function(i, l) {
        var s = dr(l, 2), p = s[0], c = s[1];
        return i.push("".concat(p, '="').concat(c, '"')) && i;
      }, []).join(" ");
      return b(n) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(n, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(r) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return k.getCommonStyleSheet(this.name, r, t);
  },
  getThemeStyleSheet: function(r) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [k.getStyleSheet(this.name, r, t)];
    if (this.style) {
      var n = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = xe(cr || (cr = be(["", ""])), z(this.style, {
        dt: Q
      })), i = ce(k.transformCSS(n, a)), l = Object.entries(t).reduce(function(s, p) {
        var c = dr(p, 2), u = c[0], d = c[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      b(i) && o.push('<style type="text/css" data-primevue-style-id="'.concat(n, '" ').concat(l, ">").concat(i, "</style>"));
    }
    return o.join("");
  },
  extend: function(r) {
    return Pe(Pe({}, this), {}, {
      css: void 0,
      style: void 0
    }, r);
  }
}, ve = Ir();
function fe(e) {
  "@babel/helpers - typeof";
  return fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, fe(e);
}
function fr(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function ye(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = arguments[r] != null ? arguments[r] : {};
    r % 2 ? fr(Object(t), !0).forEach(function(o) {
      tn(e, o, t[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : fr(Object(t)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(t, o));
    });
  }
  return e;
}
function tn(e, r, t) {
  return (r = on(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function on(e) {
  var r = nn(e, "string");
  return fe(r) == "symbol" ? r : r + "";
}
function nn(e, r) {
  if (fe(e) != "object" || !e) return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(e, r);
    if (fe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(e);
}
var an = {
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
    text: [S.STARTS_WITH, S.CONTAINS, S.NOT_CONTAINS, S.ENDS_WITH, S.EQUALS, S.NOT_EQUALS],
    numeric: [S.EQUALS, S.NOT_EQUALS, S.LESS_THAN, S.LESS_THAN_OR_EQUAL_TO, S.GREATER_THAN, S.GREATER_THAN_OR_EQUAL_TO],
    date: [S.DATE_IS, S.DATE_IS_NOT, S.DATE_BEFORE, S.DATE_AFTER]
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
}, sn = Symbol();
function ln(e, r) {
  var t = {
    config: Tt(r)
  };
  return e.config.globalProperties.$primevue = t, e.provide(sn, t), pn(), cn(e, t), t;
}
var le = [];
function pn() {
  $.clear(), le.forEach(function(e) {
    return e?.();
  }), le = [];
}
function cn(e, r) {
  var t = N(!1), o = function() {
    var p;
    if (((p = r.config) === null || p === void 0 ? void 0 : p.theme) !== "none" && !k.isStyleNameLoaded("common")) {
      var c, u, d = ((c = ae.getCommonTheme) === null || c === void 0 ? void 0 : c.call(ae)) || {}, m = d.primitive, f = d.semantic, x = d.global, g = d.style, h = {
        nonce: (u = r.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      ae.load(m?.css, ye({
        name: "primitive-variables"
      }, h)), ae.load(f?.css, ye({
        name: "semantic-variables"
      }, h)), ae.load(x?.css, ye({
        name: "global-variables"
      }, h)), ae.loadStyle(ye({
        name: "global-style"
      }, h), g), k.setLoadedStyleName("common");
    }
  };
  $.on("theme:change", function(s) {
    t.value || (e.config.globalProperties.$primevue.config.theme = s, t.value = !0);
  });
  var n = se(r.config, function(s, p) {
    ve.emit("config:change", {
      newValue: s,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = se(function() {
    return r.config.ripple;
  }, function(s, p) {
    ve.emit("config:ripple:change", {
      newValue: s,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = se(function() {
    return r.config.theme;
  }, function(s, p) {
    t.value || k.setTheme(s), r.config.unstyled || o(), t.value = !1, ve.emit("config:theme:change", {
      newValue: s,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = se(function() {
    return r.config.unstyled;
  }, function(s, p) {
    !s && r.config.theme && o(), ve.emit("config:unstyled:change", {
      newValue: s,
      oldValue: p
    });
  }, {
    immediate: !0,
    deep: !0
  });
  le.push(n), le.push(a), le.push(i), le.push(l);
}
var dn = {
  install: function(r, t) {
    var o = vo(an, t);
    ln(r, o);
  }
}, Jr = {
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
    this.mounted = Br();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function un(e, r, t, o, n, a) {
  return a.inline ? Se(e.$slots, "default", {
    key: 0
  }) : n.mounted ? (Et(), Ot(Cr, {
    key: 1,
    to: t.appendTo
  }, [Se(e.$slots, "default")], 8, ["to"])) : Tr("", !0);
}
Jr.render = un;
const mn = "data-wippy-overlay-layer";
function Qr() {
  return typeof window < "u" && typeof window.document < "u";
}
function Xr() {
  return Qr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function fn() {
  return Xr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const gn = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let hn = 0;
const Te = /* @__PURE__ */ new WeakMap();
function gr(e, r) {
  const t = e.style;
  t.setProperty("position", "fixed", "important"), t.setProperty("inset", "auto", "important"), t.setProperty("margin", "0", "important"), t.setProperty("position-anchor", r), t.setProperty("position-area", "bottom span-right"), t.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), t.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), t.setProperty("max-width", "stretch", "important");
}
function xn(e, r) {
  if (!gn.test(e.className))
    return;
  const t = e.style.cssText;
  gr(e, r), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = t;
    return;
  }
  if (!Te.has(e)) {
    const o = new MutationObserver(() => {
      const n = e.style;
      (n.top !== "auto" || n.left !== "auto" || n.margin !== "0px" || n.getPropertyPriority("top") !== "important" || n.getPropertyPriority("left") !== "important" || n.getPropertyPriority("margin") !== "important" || n.getPropertyPriority("min-width") !== "important" || n.maxWidth !== "stretch" || n.getPropertyPriority("max-width") !== "important") && gr(e, r);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), Te.set(e, o);
  }
}
function Fe(e) {
  const r = Te.get(e);
  r && (r.disconnect(), Te.delete(e));
}
function bn(e) {
  const r = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return r instanceof ShadowRoot ? r : null;
}
function De(e) {
  e.style.top = "0px", e.style.left = "0px";
  const r = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - r.top}px`, e.style.left = `${-window.scrollX - r.left}px`;
}
const Ee = /* @__PURE__ */ new Set(), Be = /* @__PURE__ */ new WeakMap();
let hr = !1, Ve = !1;
function vn() {
  Ve = !1;
  for (const e of Ee) {
    if (!e.isConnected) {
      for (const r of Array.from(e.children))
        r instanceof HTMLElement && Fe(r);
      Ee.delete(e), Be.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && De(e);
  }
}
function xr() {
  Ve || (Ve = !0, requestAnimationFrame(vn));
}
function yn(e) {
  const r = document.createElement("div");
  r.setAttribute(mn, "");
  const t = Xr();
  if (r.style.cssText = t ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", t && r.setAttribute("popover", "manual"), e.appendChild(r), t) {
    try {
      r.showPopover();
    } catch {
    }
    r.matches(":popover-open") || (r.removeAttribute("popover"), r.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  De(r);
  const o = new MutationObserver((n) => {
    const a = r.__wippyAnchorName;
    for (const i of n) {
      if (a)
        for (const l of Array.from(i.addedNodes))
          l instanceof HTMLElement && xn(l, a);
      for (const l of Array.from(i.removedNodes))
        l instanceof HTMLElement && Fe(l);
    }
    r.isConnected && r.childElementCount > 0 && De(r);
  });
  return o.observe(r, { childList: !0 }), Be.set(r, o), Ee.add(r), hr || (hr = !0, window.addEventListener("scroll", xr, { capture: !0, passive: !0 }), window.addEventListener("resize", xr, { passive: !0 })), r;
}
function br(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = yn(e.hostRoot), fn())) {
    const r = e.$el ? e.$el.parentElement : null;
    r && (e.anchorName = `--wippy-a-${++hn}`, e.anchorTrigger = r, r.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function vr(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const r of Array.from(e.layer.children))
      r instanceof HTMLElement && Fe(r);
    Ee.delete(e.layer), Be.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let yr = !1;
function wn() {
  if (yr)
    return;
  yr = !0;
  const e = Jr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Qr() && (this.hostRoot = bn(this.$el), this.mounted = !0, this.hostRoot && (this.inline || br(this), this.$watch("inline", (r) => {
      r ? vr(this) : br(this);
    })));
  }, e.render = function() {
    return this.inline ? Se(this.$slots, "default", { key: 0 }) : this.mounted ? zt(Cr, { key: 1, to: this.resolvedTarget || document.body }, [
      Se(this.$slots, "default")
    ]) : Tr("", !0);
  }, e.unmounted = function() {
    vr(this);
  };
}
const ia = {
  install: (e) => {
    wn(), e.use(dn, { theme: "none" });
  }
};
function we(e) {
  return String(e || "").trim().toLowerCase();
}
function ke(e) {
  if (!e) return [];
  const r = /* @__PURE__ */ new Set(), t = (a) => {
    const i = we(a);
    i && r.add(i);
  };
  if (t(e.full_name), t(e.component), t(e.module), e.org && e.name && t(`${e.org}/${e.name}`), typeof e.organization == "string" && e.name && t(`${e.organization}/${e.name}`), e.organization && typeof e.organization == "object" && e.name) {
    const a = e.organization;
    a.slug && t(`${a.slug}/${e.name}`), a.name && t(`${a.name}/${e.name}`);
  }
  e.namespace && e.name && t(`${e.namespace}/${e.name}`);
  const o = we(e.name);
  o.includes("/") && t(o);
  const n = we(e.id);
  return n.includes("/") && t(n), Array.from(r);
}
function sa(e, r) {
  const t = we(r);
  return t ? ke(e).includes(t) : !1;
}
function la(e) {
  return e ? e >= 1e6 ? (e / 1e6).toFixed(1) + "M" : e >= 1e3 ? (e / 1e3).toFixed(1) + "k" : String(e) : "0";
}
function pa(e) {
  return e ? e >= 1048576 ? (e / 1048576).toFixed(1) + " MB" : e >= 1024 ? (e / 1024).toFixed(1) + " KB" : e + " B" : "";
}
function ca(e) {
  return e?.replace(/[^\s()]+/g, (r) => r.startsWith("LicenseRef-") ? r.slice(11).replace(/-/g, " ") : r) ?? "";
}
const kn = {
  library: "tabler:book-2",
  service: "tabler:server",
  application: "tabler:apps",
  app: "tabler:apps",
  page: "tabler:browser",
  agent: "tabler:robot"
}, wr = [261, 200, 24, 142, 330, 174, 12, 220, 280, 50];
function da(e) {
  const r = String(e.full_name || e.name || e.id || "");
  let t = 0;
  for (let o = 0; o < r.length; o++) t = t * 31 + r.charCodeAt(o) | 0;
  return `hsl(${wr[Math.abs(t) % wr.length]} 70% 56%)`;
}
function ua(e) {
  return kn[String(e.type || "").toLowerCase()] || "tabler:package";
}
function Sn(e) {
  const r = String(e?.type || "").toLowerCase();
  return r === "app" || r === "application";
}
function ma(e) {
  return !(!e || e.deprecated === !0);
}
function L(e) {
  return typeof e == "string" ? e.trim().toLowerCase() : "";
}
function fa(e) {
  if (!e) return !1;
  if (e.is_private === !0 || e.private === !0 || (L(e.visibility) || L(e.module_visibility) || L(e.access)) === "private") return !0;
  const t = e.meta && typeof e.meta == "object" ? e.meta : void 0;
  if (!t) return !1;
  if ((L(t.visibility) || L(t.module_visibility) || L(t.access)) === "private") return !0;
  const n = t.hub && typeof t.hub == "object" ? t.hub : void 0;
  return (n ? L(n.visibility) || L(n.module_visibility) || L(n.access) : "") === "private";
}
function et(e) {
  return e.full_name ? e.full_name : e.component ? e.component : e.org && e.name ? `${e.org}/${e.name}` : e.namespace && e.name ? `${e.namespace}/${e.name}` : "";
}
function ga(e) {
  return e.display_name || et(e) || e.id || "—";
}
function ha(e) {
  return String(e.full_name || e.id || et(e));
}
function xa(e, r) {
  const t = r.trim().toLowerCase();
  return t ? e.filter((o) => {
    const n = (o.display_name || o.name || "").toLowerCase(), a = (o.full_name || "").toLowerCase(), i = (o.description || "").toLowerCase();
    return n.includes(t) || a.includes(t) || i.includes(t);
  }) : e;
}
function ba(e, r) {
  const t = [...e];
  return r === "name" ? t.sort((o, n) => String(o.display_name || o.name).localeCompare(String(n.display_name || n.name))) : r === "recent" ? t.sort((o, n) => String(n.update_time || "").localeCompare(String(o.update_time || ""))) : t.sort((o, n) => (n.total_downloads || 0) - (o.total_downloads || 0));
}
function kr(e, r) {
  return Sn(r(e.component)) ? 0 : String(e.component || "").startsWith("kickside/") ? 1 : 2;
}
function va(e, r) {
  return e.slice().sort((t, o) => {
    const n = kr(t, r) - kr(o, r);
    return n !== 0 ? n : String(t.component || "").localeCompare(String(o.component || ""));
  });
}
function _n(e) {
  return typeof e.is_root == "boolean" ? e.is_root : (e.used_by_count || 0) === 0 && (!e.used_by || e.used_by.length === 0);
}
function ya(e) {
  return _n(e) ? "root" : "transitive";
}
function wa(e) {
  const r = (e.used_by || []).filter(Boolean), t = e.used_by_count ?? r.length;
  return t <= 0 ? "" : r.length > 0 ? `used by ${r.join(", ")}` : `used by ${t} root${t === 1 ? "" : "s"}`;
}
function ka(e) {
  const r = e.meta?.hub?.resolved_modules?.find((n) => n.name === e.component)?.version;
  if (r) return String(r);
  const t = (e.entries || []).find((n) => n.module === e.component && n.module_version)?.module_version;
  if (t) return String(t);
  const o = String(e.version || "").trim();
  return o === "*" || o === ">=v0.0.0" || o === ">=0.0.0" ? "" : o.replace(/^[>=<~^]+v?/, "");
}
function Sa(e) {
  return (e.parameter_name || e.full_id || e.id || e.name || "").trim();
}
function Cn(e) {
  return String(e.path || e.module || "").trim();
}
function _a(e) {
  const r = e.map((a) => ({ ...a, children: [] })), t = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const a of r) {
    const i = Cn(a);
    i && t.set(i, a);
    const l = o.get(a.module) || [];
    l.push(a), o.set(a.module, l);
  }
  const n = [];
  for (const a of r) {
    let i;
    const l = String(a.parent || "").trim();
    if (l && (i = t.get(l) || o.get(l)?.[0]), !i && a.path && a.path.includes("/")) {
      const s = a.path.lastIndexOf("/");
      i = t.get(a.path.slice(0, s));
    }
    i && i !== a ? i.children.push(a) : n.push(a);
  }
  return n;
}
function Ca(e, r) {
  const t = [], o = String(r?.currentVersion || "");
  return o && e.version && (!r?.targetModule || e.module === r.targetModule || e.direct) && o !== String(e.version) && t.push({ label: `upgrade from ${o}`, tone: "upgrade" }), e.installed ? t.push({ label: "installed", tone: "installed" }) : e.shared ? t.push({ label: "shared", tone: "shared" }) : t.push({ label: "new", tone: "new" }), t;
}
function Ta(e, r) {
  return e.transitive === !0 || (e.depth || 0) > 0 ? !0 : !!(r && e.module && e.module !== r);
}
function Ea(e) {
  return String(e.module || e.namespace || "a dependency");
}
function Oa(e) {
  if (!e || typeof e != "object") return [];
  const r = e;
  return Array.isArray(r.required_by) ? r.required_by.map(String).filter(Boolean) : r.required_by && typeof r.required_by == "object" ? Object.values(r.required_by).map(String).filter(Boolean) : typeof r.required_by_text == "string" ? r.required_by_text.split(",").map((t) => t.trim()).filter(Boolean) : [];
}
function za(e) {
  if (!e || typeof e != "object") return [];
  const r = e;
  return r.payload?.execution || r.execution || [];
}
function Pa(e) {
  return String(e.step || "").replace(/[._-]+/g, " ").trim() || "step";
}
function Aa(e) {
  return !!(e?.authenticated && e.expired !== !0);
}
function La(e, r = "Something went wrong") {
  if (e instanceof Error) return e.message;
  if (typeof e == "string") return e;
  if (e && typeof e == "object") {
    const t = e;
    return t.response?.data?.error || t.message || r;
  }
  return r;
}
class E extends Error {
  code;
  status;
  details;
  constructor(r, t, o, n) {
    super(t), this.name = "KeeperHubError", this.code = r, this.status = o, this.details = n;
  }
}
function w(e) {
  return e.then(({ data: r, status: t }) => {
    if (!r || typeof r != "object")
      throw new E("UNKNOWN", "empty or malformed response body", t);
    if (r.success === !1) {
      const n = r;
      throw new E(n.code || "UNKNOWN", n.error || "request failed", t, n.details);
    }
    return r;
  }).catch((r) => {
    if (r instanceof E) throw r;
    const t = r, o = t?.response?.data;
    if (o && o.success === !1)
      throw new E(o.code || "UNKNOWN", o.error || "request failed", t.response?.status, o.details);
    const n = t?.response?.status, a = r instanceof Error && r.message || "network error";
    throw new E(n === 401 ? "UNAUTHORIZED" : n === 403 ? "FORBIDDEN" : "NETWORK", a, n);
  });
}
function $a(e) {
  return {
    securityProjectionStatus() {
      return w(e.get("/api/v1/security/projection"));
    },
    listDependencies(r) {
      const t = {};
      return r?.component && (t.component = r.component), r?.includeEntries === !1 && (t.entries = "0"), r?.includeMigrations === !1 && (t.migrations = "0"), w(e.get("/api/v1/keeper/hub/dependencies", { params: t }));
    },
    browseModules(r) {
      const t = {};
      return r?.query && (t.q = r.query), r?.page && (t.page = r.page), r?.pageSize && (t.page_size = r.pageSize), r?.visibility && (t.visibility = r.visibility), r?.type && (t.type = r.type), r?.sort && (t.sort = r.sort), w(e.get("/api/v1/keeper/hub/browse", { params: t }));
    },
    listVersions(r) {
      return w(e.get("/api/v1/keeper/hub/versions", { params: { module: r } }));
    },
    getReadme(r, t) {
      const o = { module: r };
      return t && (o.version = t), w(e.get("/api/v1/keeper/hub/readme", { params: o }));
    },
    listMigrations(r) {
      const t = {};
      return r && (t.component = r), w(e.get("/api/v1/keeper/hub/migrations", { params: t }));
    },
    planInstall(r) {
      return w(e.post("/api/v1/keeper/hub/dependencies/plan", r));
    },
    install(r) {
      return w(e.post("/api/v1/keeper/hub/dependencies/install", r));
    },
    uninstall(r) {
      return w(e.post("/api/v1/keeper/hub/dependencies/uninstall", r));
    },
    runMigrations(r) {
      return w(e.post("/api/v1/keeper/hub/migrations/run", r));
    },
    requiredSetupStatus(r) {
      return w(e.get("/api/v1/hub/required-setup", { params: { descriptor: r } }));
    },
    applyRequiredSetup(r) {
      return w(e.post("/api/v1/hub/required-setup", { descriptor: r }));
    },
    scan(r) {
      return w(e.post("/api/v1/keeper/hub/scan", r));
    },
    // ── Hub token (manual, native hub.auth seam, admin-set) ──────────────
    authStatus() {
      return w(e.get("/api/v1/hub/auth"));
    },
    authenticate(r) {
      return w(e.post("/api/v1/hub/auth", { token: r }));
    },
    logout() {
      return w(e.delete("/api/v1/hub/auth"));
    },
    async fetchAllByKeyword(r, t = 100) {
      const o = (Array.isArray(r) ? r : [r]).map((c) => c.trim().toLowerCase()).filter(Boolean);
      if (o.length === 0) return [];
      const n = new Set(o), a = [], i = /* @__PURE__ */ new Set(), l = 50;
      async function* s(c) {
        for (let u = 1; u <= l; u++) {
          const d = await w(e.get("/api/v1/keeper/hub/browse", {
            params: { ...c, page: u, page_size: t }
          })), m = d.items || [];
          if (yield m, typeof d.total == "number" && u * t >= d.total || m.length < t) return;
        }
      }
      for (const c of o)
        for await (const u of s({ q: c }))
          for (const d of u) {
            const m = (d.keywords || []).map((h) => String(h).trim().toLowerCase()), f = typeof d.org == "string" ? d.org : typeof d.organization == "string" ? d.organization : d.organization?.slug || d.organization?.name || String(d.full_name || "").split("/")[0], x = String(f || "").trim().toLowerCase();
            if (!m.some((h) => n.has(h)) && !n.has(x)) continue;
            const g = ke(d)[0] || String(d.full_name || d.id || "").trim().toLowerCase();
            !g || i.has(g) || (i.add(g), a.push(d));
          }
      const p = /* @__PURE__ */ new Set();
      for await (const c of s({ visibility: "private" }))
        for (const u of c)
          for (const d of ke(u)) p.add(d);
      for (const c of a)
        ke(c).some((u) => p.has(u)) && (c.visibility = "private");
      return a;
    }
  };
}
const Sr = "registry:v1:", Tn = 3e4, En = 250;
function Na(e) {
  const r = /* @__PURE__ */ new Set();
  for (const t of e) {
    if (t.name !== "required_setup" && t.short_name !== "required_setup") continue;
    const o = String(t.value ?? "").trim() || String(t.default ?? "").trim(), n = o.startsWith(Sr) ? o.slice(Sr.length) : "";
    if (!/^[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+$/.test(n))
      throw new E("INVALID_SETUP_DESCRIPTOR", "The module declares an invalid required setup descriptor.");
    r.add(n);
  }
  return [...r];
}
async function ja(e, r, t = {}) {
  const o = () => {
    if (t.isCurrent && !t.isCurrent())
      throw new E("INSTALL_SUPERSEDED", "Installation is closed or superseded.");
  };
  for (const n of r) {
    o(), t.onPhase?.("Checking required setup…");
    const a = Date.now() + Tn;
    let i;
    for (; !i; ) {
      o();
      try {
        const c = await e.requiredSetupStatus(n);
        o(), c.status !== "building" && (i = c);
      } catch (c) {
        if (!(c instanceof E) || c.status !== 404) throw c;
      }
      if (i) break;
      const p = a - Date.now();
      if (p <= 0)
        throw new E("SETUP_DESCRIPTOR_NOT_VISIBLE", "Required setup does not become available after installation.");
      await new Promise((c) => setTimeout(c, Math.min(En, p)));
    }
    if (i.success && i.ready && i.status === "ready") continue;
    o(), t.onPhase?.(i.pending_label || "Running required setup…");
    const l = await e.applyRequiredSetup(n);
    if (o(), !l.success || !l.ready || l.status !== "ready")
      throw new E("SETUP_INCOMPLETE", l.error || l.detail || "Required setup fails.", void 0, l);
    t.onPhase?.("Verifying required setup…");
    const s = await e.requiredSetupStatus(n);
    if (o(), !s.success || !s.ready || s.status !== "ready")
      throw new E("SETUP_POSTCONDITION_FAILED", s.error || s.detail || "Required setup fails verification.", void 0, s);
  }
}
const Ra = `:root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;--km-chevron: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239aa0a6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6 -6'/></svg>")}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.km-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:7px 13px;border:1px solid var(--p-primary-color);border-radius:8px;font:inherit;font-size:13px;font-weight:700;font-family:Outfit,system-ui,sans-serif;letter-spacing:-.005em;line-height:1.2;white-space:nowrap;cursor:pointer;background:var(--p-primary-color);color:var(--p-primary-contrast-color);transition:background .2s,color .2s,border-color .2s,transform .15s}.km-btn:disabled{opacity:.55;cursor:default}.km-btn:not(:disabled):hover{transform:translateY(-1px)}.km-btn:not(:disabled):active{transform:translateY(0)}.km-btn:not(.km-btn-text):not(.km-btn-outlined):not(.km-btn-secondary):not(.km-btn-danger):hover{background:var(--p-primary-hover-color);border-color:var(--p-primary-hover-color)}.km-btn-secondary{background:color-mix(in srgb,var(--p-text-color) 6%,var(--p-content-background));border-color:var(--p-content-border-color);color:var(--p-text-color)}.km-btn-secondary:not(:disabled):hover{background:color-mix(in srgb,var(--p-text-color) 11%,var(--p-content-background))}.km-btn-outlined{background:transparent;border-color:var(--p-content-border-color);color:var(--p-text-color)}.km-btn-outlined:not(:disabled):hover{background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.km-btn-text{background:transparent;border-color:transparent;color:var(--p-text-color)}.km-btn-text:not(:disabled):hover{background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.km-btn-danger{background:var(--p-danger-500);border-color:var(--p-danger-500);color:var(--p-button-danger-color)}.km-btn-danger:not(:disabled):hover{background:var(--p-danger-600, color-mix(in srgb, var(--p-danger-500) 88%, var(--p-text-color)))}.km-btn-warning{background:var(--p-warn-500);border-color:var(--p-warn-500);color:var(--p-warn-contrast-color)}.km-btn-warning:not(:disabled):hover{background:var(--p-warn-hover-color)}.km-btn-warning.km-btn-outlined{background:transparent;border-color:color-mix(in srgb,var(--p-warn-500) 45%,var(--p-content-border-color));color:var(--p-warn-600, var(--p-warn-500))}.km-btn-warning.km-btn-outlined:not(:disabled):hover{background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.km-btn-text.km-btn-secondary{color:var(--p-text-muted-color)}.km-btn-text.km-btn-danger{background:transparent;border-color:transparent;color:var(--p-danger-500)}.km-btn-text.km-btn-danger:not(:disabled):hover{background:color-mix(in srgb,var(--p-danger-500) 10%,transparent)}.km-btn-sm{font-size:12px;padding:5px 10px}.km-input{width:100%;box-sizing:border-box;background:var(--p-content-background);border:1px solid var(--p-content-border-color);color:var(--p-text-color);border-radius:8px;font:inherit;font-size:13px;padding:9px 12px;transition:border-color .15s,box-shadow .15s}.km-input:enabled:hover{border-color:var(--p-primary-color)}.km-input::placeholder{color:var(--p-text-muted-color)}:host{--km-flash-shadow: 0 0 0 2px color-mix(in srgb, var(--p-primary-color) 35%, transparent), 0 0 0 4px color-mix(in srgb, var(--p-primary-color) 18%, transparent);--km-flame: hsl(24 80% 45%)}@media(prefers-color-scheme:dark){:host{--km-flame: hsl(24 90% 68%)}}.km{--system-surface-gutter: var(--kickside-system-surface-gutter, 24px);font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;min-height:0}.km-scroll{flex:1;min-height:0;overflow-y:auto;scrollbar-gutter:stable}.km-i{width:16px;height:16px}.km-i-xs{width:12px;height:12px}.km-i-sm{width:14px;height:14px}.km-i-lg{width:28px;height:28px}.km-i-xl{width:36px;height:36px}.km-grow{flex:1}.km-min0{min-width:0}.km-block{display:block;margin:0 auto 8px}.km-mono{font-family:ui-monospace,monospace}.km-dim{color:var(--p-text-muted-color);opacity:.85}.km-muted{font-size:13px;color:var(--p-text-muted-color)}.km-accent{color:var(--p-primary-color)}.km-flame{color:var(--km-flame)}.km-mt,.km-mt-sm{margin-top:8px}.km-mb{margin-bottom:12px}.km-ml-auto{margin-left:auto}.km-trunc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-inline{display:inline-flex;align-items:center;gap:4px}.km-row-wrap{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.km-row-tight{display:flex;align-items:center;gap:6px}.km-row-gap{display:flex;gap:8px}.km-stack{display:flex;flex-direction:column;gap:12px}.km-stack-lg{display:flex;flex-direction:column;gap:28px}.km-pills{display:flex;flex-wrap:wrap;gap:6px}.km-2col{display:grid;grid-template-columns:1fr;gap:10px}@media(min-width:760px){.km-2col{grid-template-columns:1fr 1fr}}.km-loading{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--p-text-muted-color);padding:24px 0}.km-center{justify-content:center}.km .km-btn{display:inline-flex;align-items:center;gap:6px}.km-banner{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter);padding:9px 12px;border-radius:8px;font-size:13px;font-weight:600}.km-banner-ok{background:color-mix(in srgb,var(--p-success-500) 14%,transparent);color:var(--p-success-600)}.km-banner-err{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.km-denied{flex:1;display:flex;align-items:center;justify-content:center}.km-denied-box{text-align:center;max-width:360px;padding:24px}.km-denied-icon{width:40px;height:40px;color:var(--p-text-muted-color);opacity:.5;margin:0 auto 8px;display:block}.km-denied-title{font-size:14px;font-weight:600;color:var(--p-text-color);margin-bottom:4px}.km-denied-sub{font-size:12px;color:var(--p-text-muted-color)}.km-list{width:100%;margin:0;padding:16px var(--system-surface-gutter) 28px;display:flex;flex-direction:column;gap:28px}.km-sec-bar{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:4px;flex-wrap:wrap}.km-sec-bar-toolbar{justify-content:flex-start}.km-installed{border-top:1px solid var(--p-content-border-color);padding-top:16px}.km-collapse-head{display:flex;align-items:center;gap:8px;width:100%;padding:4px 0;background:none;border:0;cursor:pointer;text-align:left;color:var(--p-text-color)}.km-collapse-head:hover .km-h2{color:var(--p-primary-color)}.km-h2{font-size:13px;font-weight:600;color:var(--p-text-color)}.km-sub{font-size:11px;color:var(--p-text-muted-color);margin-top:2px}.km-update-count{margin-left:2px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;background:color-mix(in srgb,var(--p-warn-500) 14%,transparent);color:var(--p-warn-600, var(--p-warn-500))}.km-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.km-toggle,.km-check{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--p-text-muted-color);cursor:pointer}.km-toggle input,.km-check input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:0;flex:none;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:6px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.km-toggle input:before,.km-check input:before{content:"";width:5px;height:9px;border:solid var(--p-primary-contrast-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.km-toggle input:checked,.km-check input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.km-toggle input:checked:before,.km-check input:checked:before{transform:rotate(45deg) scale(1)}.km-toggle input:disabled,.km-check input:disabled{opacity:.55;cursor:not-allowed}.km-toggle:has(input:disabled),.km-check:has(input:disabled){cursor:not-allowed}.km-filter{width:200px;font-size:13px}.km-btn-count{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;border-radius:8px;background:color-mix(in srgb,var(--p-primary-contrast-color) 22%,transparent);color:currentColor;font-size:10px;font-weight:800}.km-msg{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0;padding:12px 14px;border-radius:8px;font-size:13px;line-height:1.5}.km-msg>.km-i{flex:none}.km-msg .km-code{flex:none}.km-msg .km-mt{margin:0 0 0 auto}.km-msg-err{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.km-msg-info{background:color-mix(in srgb,var(--p-primary-color) 10%,transparent);color:var(--p-primary-color)}.km-code{font-weight:700;margin-right:4px}.km-empty{margin-top:8px;border:1px dashed var(--p-content-border-color);border-radius:10px;padding:32px;text-align:center}.hub-section-head{display:flex;align-items:center;gap:8px;padding:14px 0 10px}.hub-section-title{font-size:13px;font-weight:600;color:var(--p-text-color)}.hub-section-sub{font-size:11px;color:var(--p-text-muted-color);margin-left:2px}.badge-installed{background:color-mix(in srgb,var(--p-success-500) 16%,transparent);color:var(--p-success-600)}.badge-warn{background:color-mix(in srgb,var(--p-warn-500) 16%,transparent);color:var(--p-warn-600)}.badge-app{background:color-mix(in srgb,var(--p-primary-color) 18%,transparent);color:var(--p-primary-color)}.badge-private{background:color-mix(in srgb,var(--p-help-500) 16%,transparent);color:var(--p-help-600)}.meta-pill{display:inline-flex;align-items:center;gap:3px;font-size:9px;font-weight:500;padding:2px 6px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 7%,transparent);color:var(--p-text-color);border:1px solid var(--p-content-border-color)}.feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:14px}.feat-card{position:relative;display:flex;align-items:stretch;gap:14px;text-align:left;padding:16px 16px 14px 22px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px;cursor:pointer;overflow:hidden;transition:transform .12s ease,border-color .12s,box-shadow .12s}.feat-card:hover{transform:translateY(-1px);border-color:var(--accent);box-shadow:var(--kx-shadow-md)}.feat-strip{position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--accent)}.feat-icon{flex-shrink:0;width:56px;height:56px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}.feat-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.feat-name{font-size:14px;font-weight:700;color:var(--p-text-color)}.feat-org{font-size:11px;font-family:ui-monospace,monospace;color:var(--p-text-muted-color)}.feat-desc{font-size:11px;line-height:1.5;color:var(--p-text-muted-color);margin:4px 0 6px;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.feat-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto}.mod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr));gap:12px}.mod-card{display:flex;align-items:flex-start;gap:12px;text-align:left;padding:12px 14px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:10px;cursor:pointer;transition:border-color .12s,background .12s}.mod-card:hover{border-color:var(--accent);background:color-mix(in srgb,var(--p-text-color) 7%,transparent)}.mod-icon{flex-shrink:0;width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}.mod-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.mod-name{font-size:12px;font-weight:700;color:var(--p-text-color)}.mod-version{font-size:10px;font-family:ui-monospace,monospace;background:color-mix(in srgb,var(--p-text-color) 12%,transparent);color:var(--p-text-color);padding:1px 6px;border-radius:8px}.mod-org{font-size:10px;font-family:ui-monospace,monospace;color:var(--p-text-muted-color)}.mod-desc{font-size:11px;line-height:1.45;color:var(--p-text-muted-color);margin:4px 0 6px;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.mod-foot{display:flex;align-items:center;gap:10px;font-size:10px;color:var(--p-text-muted-color);margin-top:2px}.foot-stat{display:inline-flex;align-items:center;gap:3px}.inst-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 0 12px}.inst-filter{width:min(320px,100%)}.inst-empty{margin-top:0}.inst-list{border:1px solid var(--p-content-border-color);border-radius:14px;overflow:hidden}.inst-row{position:relative;width:100%;display:flex;align-items:center;gap:12px;padding:12px 16px;text-align:left;background:var(--p-content-background);border:none;border-bottom:1px solid var(--p-content-border-color);cursor:pointer;transition:background .12s}.inst-row:last-child{border-bottom:none}.inst-row:hover{background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.inst-strip{position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent);opacity:0;transition:opacity .12s}.inst-row:hover .inst-strip{opacity:1}.inst-icon{width:34px;height:34px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:11px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}.inst-name{font-size:13px;font-weight:500;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.inst-id{font-size:11px;font-family:ui-monospace,monospace;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.inst-update{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color)}.inst-update.available,.inst-update.planning,.inst-update.updating{background:color-mix(in srgb,var(--p-warn-500) 14%,transparent);color:var(--p-warn-600, var(--p-warn-500))}.inst-update.updated{background:color-mix(in srgb,var(--p-success-500) 14%,transparent);color:var(--p-success-600, var(--p-success-500))}.inst-update.blocked,.inst-update.failed{background:color-mix(in srgb,var(--p-danger-500) 13%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.inst-update-msg{margin-top:3px;font-size:11px;line-height:1.35;color:var(--p-danger-600, var(--p-danger-500));overflow-wrap:anywhere}.inst-ver{flex-shrink:0;font-size:10px;font-family:ui-monospace,monospace;padding:2px 7px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-color)}.inst-migs{flex-shrink:0;width:112px;text-align:right;font-size:11px;color:var(--p-text-muted-color)}@media(max-width:720px){.inst-migs{display:none}}.inst-actions{display:flex;align-items:center;gap:2px;flex-shrink:0;opacity:0;transition:opacity .12s}.inst-row:hover .inst-actions,.inst-row:focus-within .inst-actions{opacity:1}.km-chev{flex-shrink:0;color:var(--p-text-muted-color);opacity:.6}.km-icon-btn{width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;border:1px solid transparent;background:transparent;color:var(--p-text-muted-color);cursor:pointer;transition:background .15s,color .15s}.km-icon-btn:hover{color:var(--p-text-color);background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.km-icon-btn:disabled{opacity:.4;cursor:default}.km-danger:hover,.km-danger-fg{color:var(--p-danger-600, var(--p-danger-500))}.provides-pill{font-size:11px;font-family:ui-monospace,monospace;padding:2px 8px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 6%,transparent);color:var(--p-text-color);border:1px solid var(--p-content-border-color)}.d-page{width:100%;margin:0;padding:18px var(--system-surface-gutter) 28px}.d-back{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--p-text-muted-color);background:none;border:0;cursor:pointer;margin-bottom:14px}.d-back:hover{color:var(--p-text-color)}.d-hero{display:flex;gap:16px;align-items:flex-start;position:relative;overflow:hidden;padding:18px 20px;margin-bottom:16px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px}.d-hero:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--accent)}.d-hero-icon{flex-shrink:0;width:56px;height:56px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--accent)}.d-hero-name{font-size:18px;font-weight:700;color:var(--p-text-color)}.d-ver{font-size:11px;font-family:ui-monospace,monospace;padding:1px 7px;border-radius:8px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-color)}.d-hero-org{font-size:12px;font-family:ui-monospace,monospace;color:var(--p-text-muted-color);margin-top:2px}.d-hero-desc{font-size:13px;line-height:1.55;color:var(--p-text-muted-color);margin:8px 0 0}.d-hero-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px}.d-link{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--p-text-muted-color);text-decoration:none;padding:5px 10px;border-radius:8px;border:1px solid var(--p-content-border-color)}.d-link:hover{color:var(--p-text-color);border-color:var(--accent)}.d-grid{display:grid;grid-template-columns:224px minmax(0,1fr);gap:16px;align-items:start}@media(max-width:600px){.d-grid{grid-template-columns:minmax(0,1fr)}}.d-side{display:flex;flex-direction:column;gap:14px}.d-block{padding:12px 14px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px}.d-block-title{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--p-text-muted-color);margin-bottom:8px}.d-block-title.d-accent,.d-accent-i{color:var(--accent)}.d-row{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px}.d-row-i{width:14px;height:14px;color:var(--accent);flex-shrink:0}.d-row-k{color:var(--p-text-muted-color)}.d-row-v{margin-left:auto;color:var(--p-text-color);font-weight:600}.km-dep-list{display:flex;flex-direction:column;gap:4px}.km-dep{display:flex;align-items:center;gap:8px;font-size:11px;font-family:ui-monospace,monospace;color:var(--p-text-color)}.d-cfg-name{display:block;font-family:ui-monospace,monospace;font-size:13px;font-weight:600;color:var(--p-text-color);word-break:break-word}.d-cfg-desc{display:block;font-size:12px;line-height:1.5;color:var(--p-text-muted-color);margin-top:3px}.d-sub{font-size:12px;color:var(--p-text-muted-color);margin:-2px 0 10px}.d-field{display:flex;gap:11px;align-items:flex-start;padding:12px 14px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-left-width:3px;border-radius:8px}.d-field-env{border-left-color:var(--accent)}.d-field-req{border-left-color:color-mix(in srgb,var(--p-text-color) 28%,transparent)}.d-field-i{flex-shrink:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}.d-field-i-req{background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color)}.d-main{min-width:0}.d-tabs{display:flex;gap:2px;border-bottom:1px solid var(--p-content-border-color);margin-bottom:16px}.d-tab{padding:8px 14px;font-size:13px;font-weight:600;color:var(--p-text-muted-color);background:none;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;cursor:pointer}.d-tab:hover:not(:disabled){color:var(--p-text-color)}.d-tab:disabled{opacity:.4;cursor:not-allowed}.d-tab.active{color:var(--accent);border-bottom-color:var(--accent)}.d-tab-body{min-height:120px}.d-empty{text-align:center;padding:40px 0;color:var(--p-text-muted-color);font-size:13px}.km-group-head{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--p-text-color);margin-bottom:6px}.d-entry{padding:8px 10px;border-radius:8px;background:var(--p-content-background);border:1px solid var(--p-content-border-color)}.d-entry-name{font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.d-entry-id{font-size:11px;font-family:ui-monospace,monospace;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.d-vers{display:flex;flex-direction:column;border:1px solid var(--p-content-border-color);border-radius:10px;overflow:hidden}.d-ver-row{display:flex;align-items:center;gap:10px;padding:9px 12px}.d-ver-row+.d-ver-row{border-top:1px solid var(--p-content-border-color)}.d-ver-tag{font-size:12px;font-family:ui-monospace,monospace;font-weight:600;color:var(--p-text-color)}.km-dialog>.km-dialog-content{padding:0;display:flex;flex-direction:column;min-height:0;overflow:hidden}.km-dialog-2p{width:min(940px,calc(100vw - 40px));height:min(88vh,760px);max-height:92%}.km-dialog-content-2p{flex:1;min-height:0}.km-dialog>.km-modal-head{display:flex;align-items:center;justify-content:space-between;font-size:15px;font-weight:700;color:var(--p-text-color);padding:16px 18px;border-bottom:1px solid var(--p-content-border-color)}.km-modal-body{display:flex;flex-direction:column;gap:16px;padding:18px;overflow-y:auto}.km-dialog>.km-modal-foot{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}.km-label{display:block;margin-bottom:4px;font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.km-w-full{width:100%}.km-ver-select{width:9rem}.km-row-between{display:flex;align-items:center;justify-content:space-between;gap:12px}.km-panel{border:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 4%,var(--p-content-background));border-radius:10px;padding:12px;font-size:12px}.km-panel-ok{border-color:color-mix(in srgb,var(--p-success-500) 35%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 8%,var(--p-content-background))}.km-panel-head{display:flex;align-items:center;gap:8px;font-size:12px}.km-panel-title{font-weight:600;color:var(--p-text-color)}.km-trans{margin-top:8px;max-height:112px;overflow:auto;display:flex;flex-wrap:wrap;gap:6px}.km-trans-pill{font-size:9px;font-family:ui-monospace,monospace;padding:2px 6px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-color)}.km-req-head{display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:12px;font-weight:500;color:var(--p-text-color)}.km-req-list{display:flex;flex-direction:column;gap:10px;max-height:288px;overflow:auto;padding-right:4px}.km-req-meta{display:flex;align-items:center;gap:8px;margin-bottom:4px}.km-req-name{font-size:11px;color:var(--p-text-color)}.km-req-flag{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--p-warn-600)}.km-req-input{font-size:12px}.km-input.km-req-warn{border-color:var(--p-warn-500)}.km-req-desc{margin-top:6px;font-size:11px;color:var(--p-text-muted-color)}.km-req-from{margin-top:2px;font-size:10px;color:var(--p-text-muted-color)}.km-ul{margin:6px 0 0;padding-left:20px;list-style:disc;font-size:11px;color:var(--p-text-muted-color)}.km-uninstall-target{font-size:13px;color:var(--p-text-color)}.km-uninstall-preview{display:flex;flex-direction:column;gap:10px}.km-preview-block{border:1px solid var(--p-content-border-color);border-radius:8px;overflow:hidden}.km-preview-title{padding:8px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 4%,transparent)}.km-preview-row{display:flex;align-items:center;gap:8px;padding:7px 10px;font-size:12px;border-top:1px solid var(--p-content-border-color)}.km-running{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:10px;border:1px solid color-mix(in srgb,var(--p-primary-color) 30%,transparent);background:color-mix(in srgb,var(--p-primary-color) 6%,transparent);font-size:13px}.km-running-label{font-weight:500;color:var(--p-text-color)}.rm{font-size:13px;line-height:1.65;color:var(--p-text-color)}.rm h1,.rm h2,.rm h3,.rm h4{font-weight:700;color:var(--p-text-color);line-height:1.3;margin:1.4em 0 .5em}.rm h1{font-size:20px;padding-bottom:6px;border-bottom:1px solid var(--p-content-border-color)}.rm h2{font-size:16px;padding-bottom:4px;border-bottom:1px solid var(--p-content-border-color)}.rm h3{font-size:14px}.rm h4{font-size:13px}.rm p{margin:.7em 0;color:var(--p-text-muted-color)}.rm a{color:var(--p-primary-color);text-decoration:none}.rm a:hover{text-decoration:underline}.rm ul,.rm ol{margin:.7em 0;padding-left:1.5em;color:var(--p-text-muted-color)}.rm ul{list-style:disc outside}.rm ol{list-style:decimal outside}.rm li{margin:.25em 0;padding-left:.2em}.rm li::marker{color:var(--p-text-muted-color)}.rm hr{border:0;border-top:1px solid var(--p-content-border-color);margin:1.4em 0}.rm strong{color:var(--p-text-color);font-weight:700}.rm .rm-code{font-family:ui-monospace,monospace;font-size:.88em;background:color-mix(in srgb,var(--p-text-color) 7%,transparent);color:var(--p-text-color);padding:1px 5px;border-radius:6px;border:1px solid var(--p-content-border-color)}.rm .rm-pre{background:color-mix(in srgb,var(--p-text-color) 7%,transparent);border:1px solid var(--p-content-border-color);border-radius:10px;padding:12px 14px;overflow-x:auto;margin:.9em 0}.rm .rm-pre code{font-family:ui-monospace,monospace;font-size:12px;line-height:1.55;color:var(--p-text-color);background:none;border:0;padding:0}.rm table{border-collapse:collapse;margin:1em 0;font-size:12px;width:100%}.rm th,.rm td{border:1px solid var(--p-content-border-color);padding:6px 10px;text-align:left}.rm th{background:color-mix(in srgb,var(--p-text-color) 7%,transparent);color:var(--p-text-color);font-weight:600}.rm td{color:var(--p-text-muted-color)}.rm img{max-width:100%;border-radius:8px}.km-hub-auth{position:relative;display:inline-flex}.km-hub-auth-panel{width:100%;padding:12px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:10px;box-shadow:var(--p-popover-shadow)}.km-hub-auth-title{font-size:13px;font-weight:700;color:var(--p-text-color);margin-bottom:4px}.km-hub-auth-hint{font-size:12px;color:var(--p-text-muted-color);margin:0 0 8px;line-height:1.5}.km-hub-auth-hint a{color:var(--p-primary-color);text-decoration:none;white-space:nowrap}.km-hub-auth-hint a:hover{text-decoration:underline}.km-hub-auth-input{width:100%;margin-bottom:8px;font-family:ui-monospace,monospace;font-size:12px}.km-hub-auth-actions{display:flex;gap:8px}:is(.km-controls,.inst-toolbar) .km-sort,:is(.km-controls,.inst-toolbar) .km-input,:is(.km-controls,.inst-toolbar) .km-btn{height:var(--kx-control-height);box-sizing:border-box;border-radius:8px;font-size:13px}:is(.km-controls,.inst-toolbar) .km-input{padding:0 10px;border:1px solid var(--p-content-border-color);background-color:color-mix(in srgb,var(--p-text-color) 6%,var(--p-content-background));color:var(--p-text-color)}:is(.km-controls,.inst-toolbar) .km-input:enabled:hover{border-color:var(--p-primary-color)}:is(.km-controls,.inst-toolbar) .km-sort{min-width:168px;align-items:center}:is(.km-controls,.inst-toolbar) .km-btn{padding:0 12px}:is(.km-controls,.inst-toolbar) .km-i{width:15px;height:15px}.km-hub-auth-active{margin-bottom:10px;padding:8px 10px;border-radius:8px;background:color-mix(in srgb,var(--p-text-color) 5%,transparent);border:1px solid var(--p-content-border-color)}.km-hub-auth-active.is-expired{background:color-mix(in srgb,var(--p-warn-500) 10%,transparent);border-color:color-mix(in srgb,var(--p-warn-500) 35%,var(--p-content-border-color))}.km-hub-auth-row{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--p-text-color)}.km-hub-ok{color:var(--p-success-500)}.km-hub-warn{color:var(--p-warn-600, var(--p-warn-500))}.km-hub-auth-meta{font-size:11px;color:var(--p-text-muted-color);margin-top:3px;word-break:break-all}.km-hub-auth-orgs{margin-top:8px}.km-hub-auth-orgs-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--p-text-muted-color);margin-bottom:4px}.km-hub-auth-org{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--p-text-color);padding:2px 0}.km-hub-auth-org-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-hub-auth-org-role{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;padding:2px 6px;border-radius:var(--kx-radius-tag);background:color-mix(in srgb,var(--p-primary-color) 16%,transparent);color:var(--p-primary-color)}.km-2p-head{gap:12px}.km-2p-head-icon{flex-shrink:0;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--kx-radius-10);background:color-mix(in srgb,var(--accent, var(--p-primary-color)) 16%,transparent);color:var(--accent, var(--p-primary-color))}.km-2p-head-icon svg{width:22px;height:22px}.km-2p-head-text{display:flex;flex-direction:column;gap:2px;min-width:0;margin-right:auto}.km-2p-head-title{font-size:15px;font-weight:700;color:var(--p-text-color)}.km-2p-head-sub{font-size:12px;font-weight:500;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-2p{flex:1;min-height:0;display:grid;grid-template-columns:210px minmax(0,1fr)}.km-2p-nav{border-right:1px solid var(--p-content-border-color);padding:12px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;background:var(--kx-surface-1)}.km-2p-navitem{display:flex;align-items:center;gap:10px;width:100%;padding:9px 11px;border:0;background:none;border-radius:var(--kx-radius-8);cursor:pointer;text-align:left;color:var(--p-text-muted-color);font:inherit;font-size:13px;font-weight:600;transition:background .12s,color .12s}.km-2p-navitem:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.km-2p-navitem.active{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.km-2p-navlabel{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-2p-navstatus{display:inline-flex;align-items:center;gap:5px;flex-shrink:0}.km-navbadge{font-size:10px;font-weight:700;min-width:17px;height:17px;padding:0 5px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 10%,transparent);color:var(--p-text-muted-color)}.km-dot{width:8px;height:8px;border-radius:50%;display:inline-block}.km-dot-danger{background:var(--p-danger-500)}.km-dot-warn{background:var(--p-warn-500)}.km-sev-ok-fg{color:var(--p-success-500)}.km-2p-main{min-width:0;min-height:0;overflow-y:auto;padding:20px 22px}.km-sec{display:flex;flex-direction:column;gap:14px}.km-sec-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--p-text-color)}.km-sub-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--p-text-muted-color);margin-top:6px}.km-hint{font-size:12px;line-height:1.5;color:var(--p-text-muted-color);margin:-4px 0 2px;display:flex;align-items:center;gap:5px;flex-wrap:wrap}.km-field{display:flex;flex-direction:column;gap:6px}.km-ov-hero{display:flex;align-items:center;gap:12px}.km-ov-icon{flex-shrink:0;width:48px;height:48px;display:inline-flex;align-items:center;justify-content:center;border-radius:11px;background:color-mix(in srgb,var(--accent, var(--p-primary-color)) 16%,transparent);color:var(--accent, var(--p-primary-color))}.km-ov-name{font-size:16px;font-weight:700;color:var(--p-text-color)}.km-ov-org{font-size:12px;color:var(--p-text-muted-color);margin-top:2px}.km-ov-desc{font-size:13px;line-height:1.6;color:var(--p-text-muted-color);margin:0}.km-ov-meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px}.km-meta-row{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--p-text-muted-color)}.km-meta-row svg{color:var(--p-primary-color);flex-shrink:0}.km-meta-row b{margin-left:auto;color:var(--p-text-color);font-weight:600}.km-ov-readme{border-top:1px solid var(--p-content-border-color);padding-top:12px;max-height:none}.km-seg{display:inline-flex;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);overflow:hidden;align-self:flex-start}.km-seg-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border:0;background:var(--p-content-background);color:var(--p-text-muted-color);font:inherit;font-size:12px;font-weight:600;cursor:pointer}.km-seg-btn+.km-seg-btn{border-left:1px solid var(--p-content-border-color)}.km-seg-btn.active{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.km-mrow{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;min-width:0;padding:9px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);font-size:12px}.km-mrow-direct{border-left:3px solid var(--accent, var(--p-primary-color))}.km-mrow-transitive{margin-left:calc(var(--tree-level, 0) * 18px);background:var(--kx-surface-1)}.km-tree-spacer{width:16px;flex-shrink:0}.km-mrow-badge{background:color-mix(in srgb,var(--accent, var(--p-primary-color)) 16%,transparent);color:var(--accent, var(--p-primary-color))}.km-mrow-name{min-width:0;flex:1 1 150px;color:var(--p-text-color);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-mrow-ver{flex:none;white-space:nowrap;font-size:11px;padding:1px 6px;border-radius:var(--kx-radius-tag);background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-color)}.km-mrow-diff{display:inline-flex;align-items:center;gap:3px;color:var(--p-text-muted-color)}.km-plan-badge-new{background:color-mix(in srgb,var(--p-info-500) 14%,transparent);color:var(--p-info-700)}.km-plan-badge-shared{background:color-mix(in srgb,var(--p-success-500) 12%,transparent);color:var(--p-success-700)}.km-plan-badge-installed{background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color)}.km-plan-badge-upgrade{background:color-mix(in srgb,var(--p-warn-500) 16%,transparent);color:var(--p-warn-700)}.km-skel{position:relative;overflow:hidden;background:var(--kx-surface-2);border-radius:var(--kx-radius-8)}.km-skel:after{content:"";position:absolute;inset:0;transform:translate(-100%);background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--p-text-color) 9%,transparent),transparent);animation:km-shimmer 1.3s infinite}@keyframes km-shimmer{to{transform:translate(100%)}}.km-skel-line{height:14px;margin-bottom:10px}.km-skel-card{height:44px;margin-bottom:8px}.km-skel-field{height:62px;margin-bottom:10px}.km-empty-inline{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:32px 16px;color:var(--p-text-muted-color);font-size:13px}.km-req-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.km-req-toolbar .km-hint{margin:0}.km-req-group{display:flex;flex-direction:column;gap:10px}.km-req-group-head{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--p-text-color);padding-top:4px}.km-req-group-head svg{color:var(--p-text-muted-color)}.km-req{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);padding:11px 12px;display:flex;flex-direction:column;gap:6px;transition:border-color .15s,box-shadow .15s,background .15s}.km-req.is-missing{border-color:color-mix(in srgb,var(--p-warn-500) 55%,var(--p-content-border-color))}.km-req.is-invalid{border-color:color-mix(in srgb,var(--p-danger-500) 55%,var(--p-content-border-color))}.km-req.is-flash{background:var(--kx-wash-warn);box-shadow:var(--km-flash-shadow)}.km-chip{font-size:10px;font-family:ui-monospace,monospace;padding:1px 6px;border-radius:var(--kx-radius-tag);background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color)}.km-req-foot{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.km-req-fit{flex-shrink:0}.km-req-src{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--p-success-700)}.km-req-invalid{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--p-danger-700)}.km-req-info{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--p-text-muted-color)}.km-readonly-field{width:100%;min-height:34px;display:flex;align-items:center;padding:7px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1);color:var(--p-text-muted-color);font-size:12px}.km-scan-run{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);font-size:13px}.km-scan-bar{flex-shrink:0;width:120px;height:6px;border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 10%,transparent);overflow:hidden}.km-scan-bar>span{display:block;height:100%;background:var(--p-primary-color);border-radius:999px;transition:width .3s ease}.km-dot-ok{background:var(--p-success-500)}.km-scan-overall{font-size:13px;line-height:1.5;color:var(--p-text-color);background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);padding:10px 12px;margin:0}.km-scan-mod{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);padding:10px 12px;display:flex;flex-direction:column;gap:8px}.km-scan-mod-head{display:flex;align-items:center;gap:8px}.km-scan-mod-name{font-size:12px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis}.km-scan-mod-sum{font-size:12px;line-height:1.5;color:var(--p-text-muted-color);margin:0}.km-scan-mod-clean{font-size:12px;margin:0}.km-finding{display:flex;gap:10px;padding:11px 12px;border:1px solid var(--p-content-border-color);border-left-width:3px;border-radius:var(--kx-radius-10);background:var(--p-content-background)}.km-finding-icon{flex-shrink:0;margin-top:1px}.km-sev-info{border-left-color:var(--p-info-500);background:var(--kx-wash-info)}.km-sev-info .km-finding-icon{color:var(--p-info-700)}.km-sev-warn{border-left-color:var(--p-warn-500);background:var(--kx-wash-warn)}.km-sev-warn .km-finding-icon{color:var(--p-warn-700)}.km-sev-danger{border-left-color:var(--p-danger-500);background:var(--kx-wash-danger)}.km-sev-danger .km-finding-icon{color:var(--p-danger-700)}.km-finding-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.km-finding-title{font-size:13px;font-weight:600;color:var(--p-text-color)}.km-finding-detail{font-size:12px;line-height:1.5;color:var(--p-text-muted-color);margin-top:3px}.km-finding-loc{font-size:11px;color:var(--kx-text-faint);margin-top:3px}.km-ack{display:inline-flex;align-items:center;gap:4px;margin-top:8px;padding:3px 9px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-tag);background:var(--p-content-background);color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:600;cursor:pointer}.km-ack:hover{color:var(--p-text-color);border-color:var(--kx-border-strong)}.km-ack.done{color:var(--p-success-700);border-color:color-mix(in srgb,var(--p-success-500) 45%,var(--p-content-border-color));background:var(--kx-wash-success)}.km-review-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}@media(max-width:640px){.km-review-grid{grid-template-columns:repeat(2,1fr)}}.km-review-tile{display:flex;flex-direction:column;align-items:center;gap:2px;padding:12px 8px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);text-align:center}.km-review-tile b{font-size:18px;font-weight:700;color:var(--p-text-color)}.km-review-tile span{font-size:11px;color:var(--p-text-muted-color)}.km-mig-list{display:flex;flex-direction:column;gap:4px;margin-top:8px;max-height:160px;overflow:auto}.km-mig-row{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--p-text-muted-color)}.km-adv{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1)}.km-adv>summary{padding:10px 12px;font-size:12px;font-weight:600;color:var(--p-text-muted-color);cursor:pointer;user-select:none}.km-adv[open]>summary{border-bottom:1px solid var(--p-content-border-color);color:var(--p-text-color)}.km-adv-body{padding:10px 12px;display:flex;flex-direction:column;gap:6px}.km-ledger{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);padding:10px 12px;display:flex;flex-direction:column;gap:7px}.km-ledger-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;padding:6px 0;border-top:1px solid var(--p-content-border-color)}.km-ledger-row:first-of-type{border-top:0}.km-ledger-step{width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font-size:10px;font-weight:700;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color)}.km-ledger-ok .km-ledger-step{background:var(--kx-wash-success);color:var(--p-success-700)}.km-ledger-warn .km-ledger-step{background:var(--kx-wash-warn);color:var(--p-warn-700)}.km-ledger-bad .km-ledger-step{background:var(--kx-wash-danger);color:var(--p-danger-700)}.km-ledger-msg{flex-basis:100%;margin-left:26px;color:var(--p-text-muted-color)}.km-2p-foot{align-items:center}.km-2p-progress{flex:1}.km-foot-note{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--p-warn-700)}@media(max-width:620px){.km-dialog-2p{height:92vh}.km-2p{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.km-2p-nav{flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--p-content-border-color);padding:8px}.km-2p-navitem{flex-direction:column;gap:3px;padding:6px 8px;font-size:11px}.km-2p-navlabel{max-width:68px;text-align:center}.km-ov-meta{grid-template-columns:1fr}.km-2p-foot>.km-foot-note{flex:1 0 100%}.km-2p-foot>.km-grow{display:none}.km-2p-foot>.km-btn{flex:1 1 auto}.km-mrow{padding:8px 10px}.km-mrow>.km-grow{display:none}.km-mrow>.km-dim{min-width:0;overflow-wrap:anywhere}}.obm{display:flex;flex-direction:column;gap:20px;color:var(--p-text-color)}.obm-prompt{display:flex;flex-direction:column;gap:7px}.obm-prompt label{font:700 13px/1.2 var(--kx-font-heading)}.obm-prompt>span{color:var(--kx-text-faint);font-size:12px}.obm-search{display:flex;align-items:center;gap:9px;padding:7px 8px 7px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1)}.obm-search>svg{flex:none;color:var(--p-primary-color);font-size:19px}.obm-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--p-text-color);font:inherit}.obm-search button,.obm-package-row>button,.obm-continue{border:0;border-radius:var(--kx-radius-8);background:var(--p-primary-color);color:var(--p-primary-contrast-color);padding:8px 12px;font:700 12px/1 var(--kx-font-body);cursor:pointer}.obm-search button{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.obm-search button:disabled{opacity:.45;cursor:not-allowed}.obm-error,.obm-note,.obm-success{display:flex;align-items:center;gap:9px;padding:10px 12px;border-radius:var(--kx-radius-8);font-size:12px}.obm-error{color:var(--p-danger-700);background:var(--kx-wash-danger)}.obm-error span,.obm-note span,.obm-success span{flex:1}.obm-error button{border:0;background:transparent;color:inherit;text-decoration:underline;cursor:pointer}.obm-note{color:var(--p-text-muted-color);background:var(--kx-surface-2)}.obm-success{color:var(--p-success-700);background:var(--kx-wash-success)}.obm-profiles{display:flex;flex-direction:column;gap:18px}.obm-profile-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.obm-profile-head h2,.obm-manual-head h2{margin:0;color:var(--p-text-color);font:700 15px/1.25 var(--kx-font-heading)}.obm-profile-head p{margin:4px 0 0;color:var(--kx-text-faint);font-size:12px;line-height:1.45}.obm-profile-head>span,.obm-manual-head>span{flex:none;border-radius:var(--kx-radius-6);background:var(--kx-wash-primary);color:var(--p-primary-color);padding:5px 7px;font:700 10px/1 var(--kx-font-body)}.obm-menu-section{display:flex;flex-direction:column;gap:8px}.obm-menu-label{display:flex;align-items:baseline;gap:8px;padding:0 2px}.obm-menu-label>span{color:var(--p-text-color);font:700 12px/1.2 var(--kx-font-heading)}.obm-menu-label>small{color:var(--kx-text-fainter);font-size:10.5px}.obm-profile-grid{display:flex;flex-direction:column;gap:7px;margin:0;padding:0;list-style:none}.obm-profile-grid>li{min-width:0}.obm-profile-card{appearance:none;width:100%;min-width:0;min-height:76px;display:flex;flex-direction:row;align-items:center;gap:12px;padding:11px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);color:var(--p-text-color);font:inherit;text-align:left;cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s,transform .15s}.obm-profile-card:not(:disabled):hover{border-color:var(--kx-border-strong);background:var(--kx-surface-2);transform:translateY(-1px)}.obm-profile-card:disabled{cursor:not-allowed;background:var(--kx-surface-2)}.obm-profile-card:disabled .obm-profile-title{color:var(--kx-text-faint)}.obm-profile-card.selected{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 6%,var(--kx-surface-1));box-shadow:0 0 0 1px var(--p-primary-color)}.obm-profile-card.required{min-height:72px;cursor:default;background:var(--kx-surface-2)}.obm-profile-card.required:hover{transform:none}.obm-profile-card.custom{min-height:68px;background:var(--kx-surface-2)}.obm-profile-icon{flex:0 0 34px;width:34px;height:34px;display:grid;place-items:center;border-radius:var(--kx-radius-8);background:var(--kx-wash-primary);color:var(--p-primary-color);font-size:18px}.obm-profile-copy{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px}.obm-profile-title{color:var(--p-text-color);font:700 13px/1.2 var(--kx-font-heading)}.obm-profile-description{color:var(--kx-text-faint);font-size:11.5px;line-height:1.5}.obm-profile-packages{display:inline-flex;align-items:center;gap:4px;overflow:hidden;color:var(--kx-text-fainter);font:600 10px/1.35 var(--kx-font-body);text-overflow:ellipsis;white-space:nowrap}.obm-profile-packages>svg{flex:none;font-size:12px}.obm-profile-state{flex:0 0 auto;min-width:62px;min-height:24px;display:inline-flex;align-items:center;justify-content:flex-end;gap:4px;color:var(--kx-text-fainter);font:700 10px/1 var(--kx-font-body)}.obm-profile-state>svg{font-size:17px}.obm-profile-state.is-included{border-radius:var(--kx-radius-6);background:var(--kx-wash-primary);color:var(--p-primary-color);padding:5px 7px}.obm-profile-card[aria-pressed=true] .obm-profile-state{color:var(--p-primary-color)}.obm-profile-warning{color:var(--p-danger-700);font-size:10px;line-height:1.35}.obm-custom-section{padding-top:10px;border-top:1px solid var(--p-content-border-color)}.obm-custom-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.obm-custom-grid>li{display:flex}.obm-custom-grid .obm-profile-card{height:100%}.obm-continue:disabled{opacity:.45;cursor:not-allowed}.obm-custom-head{display:flex;align-items:center;gap:10px;padding-bottom:2px}.obm-custom-head>button{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1);color:var(--p-text-muted-color);padding:7px 9px;cursor:pointer}.obm-custom-head h2{flex:1;margin:0;font:700 15px/1.2 var(--kx-font-heading)}.obm-custom-head>span{color:var(--kx-text-fainter);font-size:11px}.obm-manual-head{display:flex;align-items:center;justify-content:space-between;padding-top:2px}.obm-browse-search{display:flex;align-items:center;gap:8px;min-height:38px;padding:7px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1)}.obm-browse-search>svg{flex:none;color:var(--kx-text-faint);font-size:17px}.obm-browse-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--p-text-color);font:inherit}.obm-browse-search input::placeholder{color:var(--kx-text-fainter)}.obm-browse-search button{display:grid;place-items:center;width:24px;height:24px;border:0;border-radius:var(--kx-radius-6);background:transparent;color:var(--kx-text-faint);cursor:pointer}.obm-browse-search button:hover{background:var(--kx-surface-3);color:var(--p-text-color)}.obm-recommendation-result{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:var(--kx-radius-8);background:var(--kx-surface-2);color:var(--p-text-muted-color);font-size:12px}.obm-recommendation-result>span{flex:1}.obm-recommendation-result.is-success{color:var(--p-success-700);background:var(--kx-wash-success)}.obm-recommendation-result.is-warning{color:var(--p-warn-700);background:var(--kx-wash-warn)}.obm-recommendation-result button{flex:none;border:0;background:transparent;color:inherit;font:700 11px/1 var(--kx-font-body);text-decoration:underline;cursor:pointer}.obm-selection{display:flex;flex-direction:column;gap:11px;padding:14px;border:1px solid color-mix(in srgb,var(--p-primary-color) 45%,var(--p-content-border-color));border-radius:var(--kx-radius-10);background:color-mix(in srgb,var(--p-primary-color) 4%,var(--kx-surface-1))}.obm-selection-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.obm-selection-head>div{display:flex;align-items:baseline;gap:8px;min-width:0}.obm-selection-head h2{margin:0;color:var(--p-text-color);font:700 13px/1.2 var(--kx-font-heading)}.obm-selection-head span{color:var(--kx-text-faint);font-size:11px}.obm-selection-head>svg{flex:none;color:var(--p-primary-color);font-size:20px}.obm-selection-items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:0;padding:0;list-style:none}.obm-selection-items>li{min-width:0;display:grid;grid-template-columns:16px minmax(0,1fr);align-items:center;gap:7px;padding:7px 8px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1)}.obm-selection-items>li>svg{color:var(--kx-text-fainter);font-size:15px}.obm-selection-items>li>span{min-width:0;display:flex;flex-direction:column;gap:1px}.obm-selection-items strong,.obm-selection-items small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.obm-selection-items strong{color:var(--p-text-color);font-size:11px}.obm-selection-items small{color:var(--kx-text-fainter);font:9.5px/1.3 ui-monospace,monospace}.obm-selection-action{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:1px}.obm-selection-action>span{color:var(--kx-text-fainter);font-size:10.5px}.obm-queue{display:flex;flex-direction:column;gap:10px;padding:14px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-2)}.obm-queue-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.obm-queue-head>div{display:flex;align-items:baseline;gap:8px;min-width:0}.obm-queue-head h2{margin:0;color:var(--p-text-color);font:700 13px/1.2 var(--kx-font-heading)}.obm-queue-head span{color:var(--kx-text-faint);font-size:11px}.obm-queue-head>strong{color:var(--p-primary-color);font:800 13px/1 var(--kx-font-heading)}.obm-queue-progress{width:100%;height:7px;overflow:hidden;border-radius:var(--kx-radius-6);background:var(--kx-surface-4)}.obm-queue-progress>span{display:block;height:100%;border-radius:var(--kx-radius-6);background:var(--p-primary-color);transition:width .2s ease}.obm-queue-items{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}.obm-queue-items>li{display:grid;grid-template-columns:20px minmax(0,1fr) auto;align-items:center;gap:9px;padding:9px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1);color:var(--p-text-muted-color)}.obm-queue-items>li>svg{color:var(--kx-text-fainter);font-size:18px}.obm-queue-items>li>span{min-width:0;display:flex;flex-direction:column;gap:2px}.obm-queue-items strong{overflow:hidden;color:var(--p-text-color);font-size:12px;text-overflow:ellipsis;white-space:nowrap}.obm-queue-items small{overflow:hidden;color:var(--kx-text-fainter);font:10px/1.3 var(--p-font-mono-family, ui-monospace, monospace);text-overflow:ellipsis;white-space:nowrap}.obm-queue-items em{color:var(--kx-text-fainter);font-size:10px;font-style:normal;text-transform:capitalize}.obm-queue-items>li.is-installed>svg,.obm-queue-items>li.is-installed em{color:var(--p-success-700)}.obm-queue-items>li.is-installing{border-color:var(--p-primary-color)}.obm-queue-items>li.is-installing>svg,.obm-queue-items>li.is-installing em{color:var(--p-primary-color)}.obm-queue-items>li.is-failed>svg,.obm-queue-items>li.is-failed em,.obm-queue-items .obm-queue-error{color:var(--p-danger-700)}.obm-queue-retry{align-self:flex-end;display:inline-flex;align-items:center;gap:6px;border:0;border-radius:var(--kx-radius-8);background:var(--p-primary-color);color:var(--p-primary-contrast-color);padding:8px 12px;font:700 12px/1 var(--kx-font-body);cursor:pointer}.obm-loading,.obm-empty{min-height:150px;display:flex;align-items:center;justify-content:center;gap:9px;color:var(--kx-text-faint);font-size:13px}.obm-empty{flex-direction:column;text-align:center}.obm-empty>svg{font-size:30px}.obm-empty>span{font-size:11px}.obm-groups{display:flex;flex-direction:column;gap:20px;max-height:420px;overflow-y:auto;padding-right:4px}.obm-group{display:flex;flex-direction:column;gap:9px}.obm-group-head{display:flex;align-items:center;gap:7px;color:var(--p-text-muted-color)}.obm-group-head>svg{color:var(--p-primary-color)}.obm-group-head h2{margin:0;flex:1;font:700 13px/1.2 var(--kx-font-heading);color:var(--p-text-color)}.obm-group-head>span{font-size:11px;color:var(--kx-text-fainter)}.obm-package-list{display:flex;flex-direction:column;gap:7px;margin:0;padding:0;list-style:none}.obm-package-row{position:relative;display:grid;grid-template-columns:35px minmax(0,1fr) auto;align-items:center;gap:10px;padding:11px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);overflow:hidden}.obm-package-row:before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:var(--module-accent)}.obm-package-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:var(--kx-radius-8);background:var(--kx-surface-2);color:var(--module-accent);font-size:18px}.obm-package-body{min-width:0}.obm-package-title{display:flex;align-items:center;gap:6px;min-width:0}.obm-package-title strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.obm-private{border-radius:999px;background:var(--kx-surface-3);color:var(--kx-text-faint);padding:2px 5px;font-size:9px;text-transform:uppercase}.obm-package-body code{display:block;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--kx-text-fainter);font-size:10px}.obm-package-body p{margin:5px 0 0;color:var(--kx-text-faint);font-size:11.5px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.obm-package-row>button{display:inline-flex;align-items:center;gap:5px;padding:7px 9px;white-space:nowrap}.obm-package-row>button.selected{background:var(--p-primary-color)}.obm-package-row>button:disabled{opacity:.45;cursor:not-allowed}.obm-admin-only{color:var(--kx-text-fainter);font-size:10px;font-weight:700;text-transform:uppercase}.obm-foot{display:grid;grid-template-columns:auto 1fr auto;align-items:center;padding-top:4px}.obm-back{border:0;background:transparent;color:var(--kx-text-faint);font:600 13px/1 var(--kx-font-body);cursor:pointer}@media(max-width:700px){.obm-package-row{grid-template-columns:35px minmax(0,1fr)}.obm-package-row>button{grid-column:2;justify-self:start}.obm-search{align-items:stretch;flex-wrap:wrap}.obm-search input{min-width:70%}.obm-profile-head{flex-direction:column;gap:5px}.obm-custom-grid,.obm-selection-items{grid-template-columns:1fr}.obm-selection-head>div,.obm-queue-head>div{align-items:flex-start;flex-direction:column;gap:2px}.obm-selection-action{align-items:stretch;flex-direction:column}.obm-selection-action .obm-queue-retry{align-self:stretch;justify-content:center}}.km-btn:focus-visible,.feat-card:focus-visible,.mod-card:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.km-dialog:modal{margin:auto;padding:0;display:flex;flex-direction:column;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);box-shadow:var(--p-dialog-shadow)}.km-dialog::backdrop{background:var(--p-mask-background)}.km-ai-proposal{margin-top:12px;padding:12px;border:1px solid var(--p-primary-color);border-radius:var(--kx-radius-8);background:color-mix(in srgb,var(--p-primary-color) 6%,var(--p-content-background))}.km-ai-proposal p{margin:8px 0;color:var(--p-text-muted-color)}`;
export {
  ea as $,
  Qn as A,
  ae as B,
  jn as C,
  Bn as D,
  Mn as E,
  xo as F,
  $e as G,
  fa as H,
  ra as I,
  Rn as J,
  Zn as K,
  Gn as L,
  Nn as M,
  $ as N,
  ka as O,
  ve as P,
  Un as Q,
  Xn as R,
  k as S,
  Yn as T,
  Hn as U,
  et as V,
  Xe as W,
  ga as X,
  oa as Y,
  sa as Z,
  Oo as _,
  q as a,
  E as a0,
  Oa as a1,
  La as a2,
  za as a3,
  Aa as a4,
  ke as a5,
  xa as a6,
  ha as a7,
  ba as a8,
  va as a9,
  _n as aa,
  ya as ab,
  wa as ac,
  Ln as ad,
  Pa as ae,
  ua as af,
  da as ag,
  $a as ah,
  ma as ai,
  Ta as aj,
  Sa as ak,
  _a as al,
  Ea as am,
  Na as an,
  Ca as ao,
  ja as ap,
  Sn as aq,
  la as ar,
  ca as as,
  pa as at,
  $n as au,
  Ra as av,
  ia as aw,
  An as ax,
  pe as b,
  Nr as c,
  er as d,
  Jn as e,
  Ir as f,
  Qe as g,
  Wn as h,
  M as i,
  Kn as j,
  Vn as k,
  qe as l,
  z as m,
  In as n,
  Dn as o,
  Jr as p,
  Vr as q,
  na as r,
  b as s,
  qn as t,
  ta as u,
  Fn as v,
  aa as w,
  go as x,
  qr as y,
  Eo as z
};
//# sourceMappingURL=styles-Dj1TheLX.js.map

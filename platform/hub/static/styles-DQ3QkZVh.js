import { hasInjectionContext as Kr, inject as at, effectScope as Yr, ref as H, markRaw as Gr, createApp as Zr, onMounted as Yt, onUnmounted as Jr, watch as fe, readonly as Qr, getCurrentInstance as dt, nextTick as Xr, reactive as en, renderSlot as Re, openBlock as tn, createBlock as rn, Teleport as Gt, createCommentVNode as Zt, useId as nn, mergeProps as ze, h as on } from "vue";
import { addCollection as an } from "@iconify/vue";
import { config as ut, addIcons as sn, on as ln, applyThemeMode as Pe, host as cn, hostCss as pn, loadCss as dn } from "@wippy-fe/proxy";
var He = "data-wippy-visible";
function mt(e) {
  const t = e.getAttribute(He);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var un = Object.defineProperty, mn = (e, t, r) => t in e ? un(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, C = (e, t, r) => mn(e, typeof t != "symbol" ? t + "" : t, r), fn = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], gn = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function ft(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function hn(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r)
      for (const [n, o] of Object.entries(r)) {
        if ((n === "@light" || n === "@dark") && o && typeof o == "object") {
          for (const [s, l] of Object.entries(o)) {
            const i = typeof l == "string" ? ft(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? ft(n) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function vn(e) {
  if (e.length === 0)
    return "";
  const t = e.map((r) => `  ${r}: inherit;`).join(`
`);
  return `${gn} {
${t}
}`;
}
function bn(e, t) {
  const r = vn(t);
  r && Jt(e, r, "@wippy-fe/css-variables-bridge");
}
function xn(e, t) {
  const n = (t ?? fn).map(async (o) => {
    const a = pn[o];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await dn(a);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${a}):`, s), null;
    }
  });
  return Promise.all(n).then((o) => {
    for (const a of o) {
      if (!a)
        continue;
      const s = document.createElement("style");
      s.textContent = a, s.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(s);
    }
  });
}
function yn(e, t) {
  const r = document.createElement("style");
  r.textContent = t, e.appendChild(r);
}
function Jt(e, t, r) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const n = document.createElement("style");
  n.setAttribute("role", r), n.textContent = t, e.appendChild(n);
}
function kn(e, t) {
  Jt(e, t, "@wippy-fe/custom-css");
}
function Qt(e) {
  return e.__wippyHost ?? null;
}
function wn(e) {
  return e.replace(/-([a-z])/g, (t, r) => r.toUpperCase());
}
function _n(e, t, r) {
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
function Ue(e, t) {
  const r = {}, n = [];
  for (const [o, a] of Object.entries(t.properties)) {
    const s = e.getAttribute(o), l = wn(o);
    if (s === null) {
      a.default !== void 0 && (r[l] = a.default);
      continue;
    }
    const i = _n(o, s, a);
    i.error ? n.push(i.error) : r[l] = i.value;
  }
  return { props: r, errors: n };
}
var Sn = class {
  constructor(e, t) {
    C(this, "_props"), C(this, "_errors"), C(this, "_content"), C(this, "_hostVisibility"), C(this, "_propsListeners", /* @__PURE__ */ new Set()), C(this, "_contentListeners", /* @__PURE__ */ new Set()), C(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), C(this, "_disposed", !1), C(this, "_emitToDom"), C(this, "props"), C(this, "events"), C(this, "content"), C(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, $n = class extends HTMLElement {
  constructor() {
    super(), C(this, "_internals"), C(this, "_contentObserver", null), C(this, "_initialized", !1), C(this, "_container", null), C(this, "_reactive", null), C(this, "_lastProps", null), C(this, "_lastErrors", []), C(this, "_lastContent", null), C(this, "_themeUnsub", null), C(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = mt(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...r, He])];
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
    return Qt(this);
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
        const a = Ue(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), r = a.props, n = a.errors, this._lastProps = r, this._lastErrors = n;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Sn(
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
        this.onInit(r), e.inlineCss && yn(r, e.inlineCss);
        try {
          const c = ut?.theming, p = hn(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          bn(r, p);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = ut?.theming, p = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            p && kn(r, p);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && xn(r, e.hostCssKeys), n = document.createElement("div"), n.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && n.classList.add(...i), r.appendChild(n), this._container = n, sn(an);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = ln("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: a } = Ue(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(o));
      const s = o;
      this._lastProps = s, this._lastErrors = a;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, n, s, a, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = cn.getThemeMode?.()) {
    Pe(e, this), this._container && Pe(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Pe("auto", this), this._container && Pe("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, r) {
    if (t === r)
      return;
    if (e === He) {
      const l = this._hostVisible, i = mt(this);
      if (i === l)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, l), this.onHostVisibilityChanged(i, l));
      return;
    }
    const n = this.constructor.wippyConfig, { props: o, errors: a } = Ue(this, n.propsSchema);
    n.validateProps && a.push(...n.validateProps(o));
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
function Tn(e) {
  return e.__wippyHostBus ?? null;
}
function Cn(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Xt;
const er = (e) => Xt = e, Pn = () => Kr() && at(tr) || Xt, tr = (
  /* istanbul ignore next */
  Symbol()
);
function On() {
  const e = Yr(!0), t = e.run(() => H({}));
  let r = [], n = [];
  const o = Gr({
    install(a) {
      er(o), o._a = a, a.provide(tr, o), a.config.globalProperties.$pinia = o, n.forEach((s) => r.push(s)), n = [];
    },
    use(a) {
      return this._a ? r.push(a) : n.push(a), this;
    },
    _p: r,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var En = Object.defineProperty, Ln = (e, t, r) => t in e ? En(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, ue = (e, t, r) => Ln(e, typeof t != "symbol" ? t + "" : t, r), rr = /* @__PURE__ */ Symbol("wippy:emit"), An = /* @__PURE__ */ Symbol("wippy:props"), zn = /* @__PURE__ */ Symbol("wippy:props_error"), jn = /* @__PURE__ */ Symbol("wippy:content"), Nn = /* @__PURE__ */ Symbol("wippy:panel-id"), Rn = /* @__PURE__ */ Symbol("wippy:layout-bus"), In = /* @__PURE__ */ Symbol("wippy:host"), nr = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Va() {
  const e = at(rr);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Vn() {
  const e = at(nr);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function Da(e) {
  const t = Vn();
  let r = !1, n = null, o = !1;
  function a() {
    if (n)
      return o = !0, n;
    let s;
    try {
      s = Promise.resolve(e());
    } catch (i) {
      s = Promise.reject(i);
    }
    const l = s.finally(() => {
      if (n === l && (n = null, r && o))
        return o = !1, a();
    });
    return n = l, l;
  }
  return Yt(() => (r = !0, a())), Jr(() => {
    r = !1, o = !1;
  }), fe(t, (s, l) => {
    if (r && l === !1 && s === !0)
      return a();
  }), t;
}
var Ma = class extends $n {
  constructor() {
    super(...arguments), ue(this, "_vueApp", null), ue(this, "_propsRef", H({})), ue(this, "_errorsRef", H([])), ue(this, "_contentRef", H(null)), ue(this, "_hostVisibilityRef", H(null)), ue(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, r, n, o, a) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = r, this._errorsRef.value = n, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of n)
      this.emitEvent("invalid", { message: c });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((c, p) => {
      this._propsRef.value = c, this._errorsRef.value = [...p];
      for (const d of p)
        this.emitEvent("invalid", { message: d });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: l.signal });
    const i = (c) => {
      if (l.signal.aborted)
        return;
      const p = Pn(), d = Zr(c.rootComponent);
      this._vueApp = d;
      const u = On();
      if (c.piniaPlugins)
        for (const m of c.piniaPlugins)
          u.use(m);
      if (d.use(u), c.plugins)
        for (const m of c.plugins)
          d.use(m);
      d.provide(An, this._propsRef), d.provide(zn, this._errorsRef), d.provide(rr, this.emitEvent.bind(this)), d.provide(jn, this._contentRef), d.provide(nr, this._hostVisibilityRef), d.provide(Nn, Cn(this)), d.provide(Rn, Tn(this)), d.provide(In, Qt(this)), c.providers && c.providers(d, this), d.mount(t), p && er(p);
    };
    if (s.rootComponent)
      i(s);
    else if (s.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), s.lazyConfig().then((p) => {
        l.signal.aborted || (c.remove(), i(p));
      }).catch((p) => {
        if (l.signal.aborted)
          return;
        const d = p instanceof Error ? p.message : String(p), u = document.createElement("wippy-error");
        u.setAttribute("title", "Failed to load"), u.setAttribute("message", d), c.replaceWith(u), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Dn = Object.defineProperty, gt = Object.getOwnPropertySymbols, Mn = Object.prototype.hasOwnProperty, qn = Object.prototype.propertyIsEnumerable, ht = (e, t, r) => t in e ? Dn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Bn = (e, t) => {
  for (var r in t || (t = {})) Mn.call(t, r) && ht(e, r, t[r]);
  if (gt) for (var r of gt(t)) qn.call(t, r) && ht(e, r, t[r]);
  return e;
};
function qe(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Ke(e, t, r = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || r.has(e) || r.has(t)) return !1;
  r.add(e).add(t);
  let n = Array.isArray(e), o = Array.isArray(t), a, s, l;
  if (n && o) {
    if (s = e.length, s != t.length) return !1;
    for (a = s; a-- !== 0; ) if (!Ke(e[a], t[a], r)) return !1;
    return !0;
  }
  if (n != o) return !1;
  let i = e instanceof Date, c = t instanceof Date;
  if (i != c) return !1;
  if (i && c) return e.getTime() == t.getTime();
  let p = e instanceof RegExp, d = t instanceof RegExp;
  if (p != d) return !1;
  if (p && d) return e.toString() == t.toString();
  let u = Object.keys(e);
  if (s = u.length, s !== Object.keys(t).length) return !1;
  for (a = s; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, u[a])) return !1;
  for (a = s; a-- !== 0; ) if (l = u[a], !Ke(e[l], t[l], r)) return !1;
  return !0;
}
function Un(e, t) {
  return Ke(e, t);
}
function Be(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function T(e) {
  return !qe(e);
}
function Ye(e, t) {
  if (!e || !t) return null;
  try {
    let r = e[t];
    if (T(r)) return r;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Be(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let r = t.split("."), n = e;
      for (let o = 0, a = r.length; o < a; ++o) {
        if (n == null) return null;
        n = n[r[o]];
      }
      return n;
    }
  }
  return null;
}
function Wn(e, t, r) {
  return r ? Ye(e, r) === Ye(t, r) : Un(e, t);
}
function B(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function or(e = {}, t = {}) {
  let r = Bn({}, e);
  return Object.keys(t).forEach((n) => {
    let o = n;
    B(t[o]) && o in e && B(e[o]) ? r[o] = or(e[o], t[o]) : r[o] = t[o];
  }), r;
}
function Fn(...e) {
  return e.reduce((t, r, n) => n === 0 ? r : or(t, r), {});
}
function qa(e, t) {
  let r = -1;
  if (T(e)) try {
    r = e.findLastIndex(t);
  } catch {
    r = e.lastIndexOf([...e].reverse().find(t));
  }
  return r;
}
function j(e, ...t) {
  return Be(e) ? e(...t) : e;
}
function z(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function q(e) {
  return z(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function it(e, t = "", r = {}) {
  let n = q(t).split("."), o = n.shift();
  if (o) {
    if (B(e)) {
      let a = Object.keys(e).find((s) => q(s) === o) || "";
      return it(j(e[a], r), n.join("."), r);
    }
    return;
  }
  return j(e, r);
}
function ar(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Hn(e) {
  return T(e) && !isNaN(e);
}
function Ba(e = "") {
  return T(e) && e.length === 1 && !!e.match(/\S| /);
}
function ae(e, t) {
  if (t) {
    let r = t.test(e);
    return t.lastIndex = 0, r;
  }
  return !1;
}
function Kn(...e) {
  return Fn(...e);
}
function be(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function R(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let r in t) e = e.replace(t[r], r);
  }
  return e;
}
function Yn(e) {
  return z(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function ir(e) {
  return z(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function sr() {
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
function Gn(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Ge(e, t) {
  if (e && t) {
    let r = (n) => {
      Gn(e, n) || (e.classList ? e.classList.add(n) : e.className += " " + n);
    };
    [t].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(r));
  }
}
function Zn() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Ua(e) {
  typeof e == "string" ? Ge(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, Zn() + "px"), Ge(document.body, e?.className || "p-overflow-hidden"));
}
function xe(e, t) {
  if (e && t) {
    let r = (n) => {
      e.classList ? e.classList.remove(n) : e.className = e.className.replace(new RegExp("(^|\\b)" + n.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(r));
  }
}
function Wa(e) {
  typeof e == "string" ? xe(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), xe(document.body, e?.className || "p-overflow-hidden"));
}
function Ze(e) {
  for (let t of document?.styleSheets) try {
    for (let r of t?.cssRules) for (let n of r?.style) if (e.test(n)) return { name: n, value: r.style.getPropertyValue(n).trim() };
  } catch {
  }
  return null;
}
function lr(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [r, n] = [e.style.visibility, e.style.display], o = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = o.width || e.offsetWidth, t.height = o.height || e.offsetHeight, e.style.display = n, e.style.visibility = r;
  }
  return t;
}
function cr() {
  let e = window, t = document, r = t.documentElement, n = t.getElementsByTagName("body")[0], o = e.innerWidth || r.clientWidth || n.clientWidth, a = e.innerHeight || r.clientHeight || n.clientHeight;
  return { width: o, height: a };
}
function Je(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Jn() {
  let e = document.documentElement;
  return (window.pageXOffset || Je(e)) - (e.clientLeft || 0);
}
function Qn() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function Xn(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function Fa(e, t, r = !0) {
  var n, o, a, s;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : lr(e), i = l.height, c = l.width, p = t.offsetHeight, d = t.offsetWidth, u = t.getBoundingClientRect(), m = Qn(), f = Jn(), b = cr(), h, v, y = "top";
    u.top + p + i > b.height ? (h = u.top + m - i, y = "bottom", h < 0 && (h = m)) : h = p + u.top + m, u.left + c > b.width ? v = Math.max(0, u.left + f + d - c) : v = u.left + f, Xn(e) ? e.style.insetInlineEnd = v + "px" : e.style.insetInlineStart = v + "px", e.style.top = h + "px", e.style.transformOrigin = y, r && (e.style.marginTop = y === "bottom" ? `calc(${(o = (n = Ze(/-anchor-gutter$/)) == null ? void 0 : n.value) != null ? o : "2px"} * -1)` : (s = (a = Ze(/-anchor-gutter$/)) == null ? void 0 : a.value) != null ? s : "");
  }
}
function Ha(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([r, n]) => e.style[r] = n));
}
function eo(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Ka(e, t, r = !0, n = void 0) {
  var o;
  if (e) {
    let a = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : lr(e), s = t.offsetHeight, l = t.getBoundingClientRect(), i = cr(), c, p, d = n ?? "top";
    if (!n && l.top + s + a.height > i.height ? (c = -1 * a.height, d = "bottom", l.top + c < 0 && (c = -1 * l.top)) : c = s, a.width > i.width ? p = l.left * -1 : l.left + a.width > i.width ? p = (l.left + a.width - i.width) * -1 : p = 0, e.style.top = c + "px", e.style.insetInlineStart = p + "px", e.style.transformOrigin = d, r) {
      let u = (o = Ze(/-anchor-gutter$/)) == null ? void 0 : o.value;
      e.style.marginTop = d === "bottom" ? `calc(${u ?? "2px"} * -1)` : u ?? "";
    }
  }
}
function pr(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function to(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && pr(e));
}
function se(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Ie(e, t = {}) {
  if (se(e)) {
    let r = (n, o) => {
      var a, s;
      let l = (a = e?.$attrs) != null && a[n] ? [(s = e?.$attrs) == null ? void 0 : s[n]] : [];
      return [o].flat().reduce((i, c) => {
        if (c != null) {
          let p = typeof c;
          if (p === "string" || p === "number") i.push(c);
          else if (p === "object") {
            let d = Array.isArray(c) ? r(n, c) : Object.entries(c).map(([u, m]) => n === "style" && (m || m === 0) ? `${u.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? u : void 0);
            i = d.length ? i.concat(d.filter((u) => !!u)) : i;
          }
        }
        return i;
      }, l);
    };
    Object.entries(t).forEach(([n, o]) => {
      if (o != null) {
        let a = n.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), o) : n === "p-bind" || n === "pBind" ? Ie(e, o) : (o = n === "class" ? [...new Set(r("class", o))].join(" ").trim() : n === "style" ? r("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[n] = o), e.setAttribute(n, o));
      }
    });
  }
}
function ro(e, t = {}, ...r) {
  {
    let n = document.createElement(e);
    return Ie(n, t), n.append(...r), n;
  }
}
function no(e, t) {
  return se(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function dr(e, t) {
  return se(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Ya(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function oo(e, t) {
  if (se(e)) {
    let r = e.getAttribute(t);
    return isNaN(r) ? r === "true" || r === "false" ? r === "true" : r : +r;
  }
}
function ur(e, t = "") {
  let r = no(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), n = [];
  for (let o of r) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && n.push(o);
  return n;
}
function Ga(e, t) {
  let r = ur(e, t);
  return r.length > 0 ? r[0] : null;
}
function vt(e) {
  if (e) {
    let t = e.offsetHeight, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingTop) + parseFloat(r.paddingBottom) + parseFloat(r.borderTopWidth) + parseFloat(r.borderBottomWidth), t;
  }
  return 0;
}
function Za(e, t) {
  let r = ur(e, t);
  return r.length > 0 ? r[r.length - 1] : null;
}
function ao(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Je(document.documentElement) || Je(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function io(e, t) {
  return e ? e.offsetHeight : 0;
}
function mr(e, t = []) {
  let r = pr(e);
  return r === null ? t : mr(r, t.concat([r]));
}
function Ja(e) {
  let t = [];
  if (e) {
    let r = mr(e), n = /(auto|scroll)/, o = (a) => {
      try {
        let s = window.getComputedStyle(a, null);
        return n.test(s.getPropertyValue("overflow")) || n.test(s.getPropertyValue("overflowX")) || n.test(s.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let a of r) {
      let s = a.nodeType === 1 && a.dataset.scrollselectors;
      if (s) {
        let l = s.split(",");
        for (let i of l) {
          let c = dr(a, i);
          c && o(c) && t.push(c);
        }
      }
      a.nodeType !== 9 && o(a) && t.push(a);
    }
  }
  return t;
}
function bt(e) {
  if (e) {
    let t = e.offsetWidth, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingLeft) + parseFloat(r.paddingRight) + parseFloat(r.borderLeftWidth) + parseFloat(r.borderRightWidth), t;
  }
  return 0;
}
function Qa() {
  return /(android)/i.test(navigator.userAgent);
}
function fr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Xa(e, t = "") {
  return se(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function ei(e) {
  return !!(e && e.offsetParent != null);
}
function ti() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function so(e, t = "", r) {
  se(e) && r !== null && r !== void 0 && e.setAttribute(t, r);
}
var Oe = {};
function lo(e = "pui_id_") {
  return Object.hasOwn(Oe, e) || (Oe[e] = 0), Oe[e]++, `${e}${Oe[e]}`;
}
var co = Object.defineProperty, po = Object.defineProperties, uo = Object.getOwnPropertyDescriptors, Ve = Object.getOwnPropertySymbols, gr = Object.prototype.hasOwnProperty, hr = Object.prototype.propertyIsEnumerable, xt = (e, t, r) => t in e ? co(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, V = (e, t) => {
  for (var r in t || (t = {})) gr.call(t, r) && xt(e, r, t[r]);
  if (Ve) for (var r of Ve(t)) hr.call(t, r) && xt(e, r, t[r]);
  return e;
}, We = (e, t) => po(e, uo(t)), W = (e, t) => {
  var r = {};
  for (var n in e) gr.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
  if (e != null && Ve) for (var n of Ve(e)) t.indexOf(n) < 0 && hr.call(e, n) && (r[n] = e[n]);
  return r;
}, mo = sr(), L = mo, ye = /{([^}]*)}/g, vr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, br = /var\([^)]+\)/g;
function yt(e) {
  return z(e) ? e.replace(/[A-Z]/g, (t, r) => r === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function fo(e) {
  return B(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function go(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Qe(e = "", t = "") {
  return go(`${z(e, !1) && z(t, !1) ? `${e}-` : e}${t}`);
}
function xr(e = "", t = "") {
  return `--${Qe(e, t)}`;
}
function ho(e = "") {
  let t = (e.match(/{/g) || []).length, r = (e.match(/}/g) || []).length;
  return (t + r) % 2 !== 0;
}
function yr(e, t = "", r = "", n = [], o) {
  if (z(e)) {
    let a = e.trim();
    if (ho(a)) return;
    if (ae(a, ye)) {
      let s = a.replaceAll(ye, (l) => {
        let i = l.replace(/{|}/g, "").split(".").filter((c) => !n.some((p) => ae(c, p)));
        return `var(${xr(r, ir(i.join("-")))}${T(o) ? `, ${o}` : ""})`;
      });
      return ae(s.replace(br, "0"), vr) ? `calc(${s})` : s;
    }
    return a;
  } else if (Hn(e)) return e;
}
function vo(e, t, r) {
  z(t, !1) && e.push(`${t}:${r};`);
}
function me(e, t) {
  return e ? `${e}{${t}}` : "";
}
function kr(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function r(s, l) {
    let i = [], c = 0, p = "", d = null, u = 0;
    for (; c <= s.length; ) {
      let m = s[c];
      if ((m === '"' || m === "'" || m === "`") && s[c - 1] !== "\\" && (d = d === m ? null : m), !d && (m === "(" && u++, m === ")" && u--, (m === "," || c === s.length) && u === 0)) {
        let f = p.trim();
        f.startsWith("dt(") ? i.push(kr(f, l)) : i.push(n(f)), p = "", c++;
        continue;
      }
      m !== void 0 && (p += m), c++;
    }
    return i;
  }
  function n(s) {
    let l = s[0];
    if ((l === '"' || l === "'" || l === "`") && s[s.length - 1] === l) return s.slice(1, -1);
    let i = Number(s);
    return isNaN(i) ? s : i;
  }
  let o = [], a = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") a.push(s), s += 2;
  else if (e[s] === ")" && a.length > 0) {
    let l = a.pop();
    a.length === 0 && o.push([l, s]);
  }
  if (!o.length) return e;
  for (let s = o.length - 1; s >= 0; s--) {
    let [l, i] = o[s], c = e.slice(l + 3, i), p = r(c, t), d = t(...p);
    e = e.slice(0, l) + d + e.slice(i + 1);
  }
  return e;
}
var ri = (e) => {
  var t;
  let r = S.getTheme(), n = Xe(r, e, void 0, "variable"), o = (t = n?.match(/--[\w-]+/g)) == null ? void 0 : t[0], a = Xe(r, e, void 0, "value");
  return { name: o, variable: n, value: a };
}, ie = (...e) => Xe(S.getTheme(), ...e), Xe = (e = {}, t, r, n) => {
  if (t) {
    let { variable: o, options: a } = S.defaults || {}, { prefix: s, transform: l } = e?.options || a || {}, i = ae(t, ye) ? t : `{${t}}`;
    return n === "value" || qe(n) && l === "strict" ? S.getTokenValue(t) : yr(i, void 0, s, [o.excludedKeyRegex], r);
  }
  return "";
};
function Ee(e, ...t) {
  if (e instanceof Array) {
    let r = e.reduce((n, o, a) => {
      var s;
      return n + o + ((s = j(t[a], { dt: ie })) != null ? s : "");
    }, "");
    return kr(r, ie);
  }
  return j(e, { dt: ie });
}
function bo(e, t = {}) {
  let r = S.defaults.variable, { prefix: n = r.prefix, selector: o = r.selector, excludedKeyRegex: a = r.excludedKeyRegex } = t, s = [], l = [], i = [{ node: e, path: n }];
  for (; i.length; ) {
    let { node: p, path: d } = i.pop();
    for (let u in p) {
      let m = p[u], f = fo(m), b = ae(u, a) ? Qe(d) : Qe(d, ir(u));
      if (B(f)) i.push({ node: f, path: b });
      else {
        let h = xr(b), v = yr(f, b, n, [a]);
        vo(l, h, v);
        let y = b;
        n && y.startsWith(n + "-") && (y = y.slice(n.length + 1)), s.push(y.replace(/-/g, "."));
      }
    }
  }
  let c = l.join("");
  return { value: l, tokens: s, declarations: c, css: me(o, c) };
}
var I = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return bo(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: r, set: n, defaults: o }) {
  var a, s, l, i, c, p, d;
  let { preset: u, options: m } = t, f, b, h, v, y, $, g;
  if (T(u) && m.transform !== "strict") {
    let { primitive: k, semantic: E, extend: N } = u, K = E || {}, { colorScheme: Y } = K, X = W(K, ["colorScheme"]), G = N || {}, { colorScheme: ee } = G, te = W(G, ["colorScheme"]), Z = Y || {}, { dark: re } = Z, le = W(Z, ["dark"]), ne = ee || {}, { dark: ce } = ne, pe = W(ne, ["dark"]), U = T(k) ? this._toVariables({ primitive: k }, m) : {}, M = T(X) ? this._toVariables({ semantic: X }, m) : {}, oe = T(le) ? this._toVariables({ light: le }, m) : {}, Ce = T(re) ? this._toVariables({ dark: re }, m) : {}, de = T(te) ? this._toVariables({ semantic: te }, m) : {}, ct = T(pe) ? this._toVariables({ light: pe }, m) : {}, pt = T(ce) ? this._toVariables({ dark: ce }, m) : {}, [Or, Er] = [(a = U.declarations) != null ? a : "", U.tokens], [Lr, Ar] = [(s = M.declarations) != null ? s : "", M.tokens || []], [zr, jr] = [(l = oe.declarations) != null ? l : "", oe.tokens || []], [Nr, Rr] = [(i = Ce.declarations) != null ? i : "", Ce.tokens || []], [Ir, Vr] = [(c = de.declarations) != null ? c : "", de.tokens || []], [Dr, Mr] = [(p = ct.declarations) != null ? p : "", ct.tokens || []], [qr, Br] = [(d = pt.declarations) != null ? d : "", pt.tokens || []];
    f = this.transformCSS(e, Or, "light", "variable", m, n, o), b = Er;
    let Ur = this.transformCSS(e, `${Lr}${zr}`, "light", "variable", m, n, o), Wr = this.transformCSS(e, `${Nr}`, "dark", "variable", m, n, o);
    h = `${Ur}${Wr}`, v = [.../* @__PURE__ */ new Set([...Ar, ...jr, ...Rr])];
    let Fr = this.transformCSS(e, `${Ir}${Dr}color-scheme:light`, "light", "variable", m, n, o), Hr = this.transformCSS(e, `${qr}color-scheme:dark`, "dark", "variable", m, n, o);
    y = `${Fr}${Hr}`, $ = [.../* @__PURE__ */ new Set([...Vr, ...Mr, ...Br])], g = j(u.css, { dt: ie });
  }
  return { primitive: { css: f, tokens: b }, semantic: { css: h, tokens: v }, global: { css: y, tokens: $ }, style: g };
}, getPreset({ name: e = "", preset: t = {}, options: r, params: n, set: o, defaults: a, selector: s }) {
  var l, i, c;
  let p, d, u;
  if (T(t) && r.transform !== "strict") {
    let m = e.replace("-directive", ""), f = t, { colorScheme: b, extend: h, css: v } = f, y = W(f, ["colorScheme", "extend", "css"]), $ = h || {}, { colorScheme: g } = $, k = W($, ["colorScheme"]), E = b || {}, { dark: N } = E, K = W(E, ["dark"]), Y = g || {}, { dark: X } = Y, G = W(Y, ["dark"]), ee = T(y) ? this._toVariables({ [m]: V(V({}, y), k) }, r) : {}, te = T(K) ? this._toVariables({ [m]: V(V({}, K), G) }, r) : {}, Z = T(N) ? this._toVariables({ [m]: V(V({}, N), X) }, r) : {}, [re, le] = [(l = ee.declarations) != null ? l : "", ee.tokens || []], [ne, ce] = [(i = te.declarations) != null ? i : "", te.tokens || []], [pe, U] = [(c = Z.declarations) != null ? c : "", Z.tokens || []], M = this.transformCSS(m, `${re}${ne}`, "light", "variable", r, o, a, s), oe = this.transformCSS(m, pe, "dark", "variable", r, o, a, s);
    p = `${M}${oe}`, d = [.../* @__PURE__ */ new Set([...le, ...ce, ...U])], u = j(v, { dt: ie });
  }
  return { css: p, tokens: d, style: u };
}, getPresetC({ name: e = "", theme: t = {}, params: r, set: n, defaults: o }) {
  var a;
  let { preset: s, options: l } = t, i = (a = s?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: i, options: l, params: r, set: n, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: r, set: n, defaults: o }) {
  var a, s;
  let l = e.replace("-directive", ""), { preset: i, options: c } = t, p = ((a = i?.components) == null ? void 0 : a[l]) || ((s = i?.directives) == null ? void 0 : s[l]);
  return this.getPreset({ name: l, preset: p, options: c, params: r, set: n, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var r;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (r = e.darkModeSelector) != null ? r : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, r, n) {
  let { cssLayer: o } = t;
  return o ? `@layer ${j(o.order || o.name || "primeui", r)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: r, props: n = {}, set: o, defaults: a }) {
  let s = this.getCommon({ name: e, theme: t, params: r, set: o, defaults: a }), l = Object.entries(n).reduce((i, [c, p]) => i.push(`${c}="${p}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [c, p]) => {
    if (B(p) && Object.hasOwn(p, "css")) {
      let d = be(p.css), u = `${c}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${u}" ${l}>${d}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: r, props: n = {}, set: o, defaults: a }) {
  var s;
  let l = { name: e, theme: t, params: r, set: o, defaults: a }, i = (s = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, c = Object.entries(n).reduce((p, [d, u]) => p.push(`${d}="${u}"`) && p, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${be(i)}</style>` : "";
}, createTokens(e = {}, t, r = "", n = "", o = {}) {
  let a = function(l, i = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: i, value: void 0 };
    c.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let p = this.value;
    if (typeof this.value == "string" && ye.test(this.value)) {
      let d = this.value.trim().replace(ye, (u) => {
        var m;
        let f = u.slice(1, -1), b = this.tokens[f];
        if (!b) return console.warn(`Token not found for path: ${f}`), "__UNRESOLVED__";
        let h = b.computed(l, i, c);
        return Array.isArray(h) && h.length === 2 ? `light-dark(${h[0].value},${h[1].value})` : (m = h?.value) != null ? m : "__UNRESOLVED__";
      });
      p = vr.test(d.replace(br, "0")) ? `calc(${d})` : d;
    }
    return qe(i.binding) && delete i.binding, c.pop(), { colorScheme: l, path: this.path, paths: i, value: p.includes("__UNRESOLVED__") ? void 0 : p };
  }, s = (l, i, c) => {
    Object.entries(l).forEach(([p, d]) => {
      let u = ae(p, t.variable.excludedKeyRegex) ? i : i ? `${i}.${yt(p)}` : yt(p), m = c ? `${c}.${p}` : p;
      B(d) ? s(d, u, m) : (o[u] || (o[u] = { paths: [], computed: (f, b = {}, h = []) => {
        if (o[u].paths.length === 1) return o[u].paths[0].computed(o[u].paths[0].scheme, b.binding, h);
        if (f && f !== "none") for (let v = 0; v < o[u].paths.length; v++) {
          let y = o[u].paths[v];
          if (y.scheme === f) return y.computed(f, b.binding, h);
        }
        return o[u].paths.map((v) => v.computed(v.scheme, b[v.scheme], h));
      } }), o[u].paths.push({ path: m, value: d, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return s(e, r, n), o;
}, getTokenValue(e, t, r) {
  var n;
  let o = ((l) => l.split(".").filter((i) => !ae(i.toLowerCase(), r.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(n = e[o]) == null ? void 0 : n.computed(a)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, i) => {
    let c = i, { colorScheme: p } = c, d = W(c, ["colorScheme"]);
    return l[p] = d, l;
  }, void 0);
}, getSelectorRule(e, t, r, n) {
  return r === "class" || r === "attr" ? me(T(t) ? `${e}${t},${e} ${t}` : e, n) : me(e, me(t ?? ":root,:host", n));
}, transformCSS(e, t, r, n, o = {}, a, s, l) {
  if (T(t)) {
    let { cssLayer: i } = o;
    if (n !== "style") {
      let c = this.getColorSchemeOption(o, s);
      t = r === "dark" ? c.reduce((p, { type: d, selector: u }) => (T(u) && (p += u.includes("[CSS]") ? u.replace("[CSS]", t) : this.getSelectorRule(u, l, d, t)), p), "") : me(l ?? ":root,:host", t);
    }
    if (i) {
      let c = { name: "primeui" };
      B(i) && (c.name = j(i.name, { name: e, type: n })), T(c.name) && (t = me(`@layer ${c.name}`, t), a?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, S = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = We(V({}, t), { options: V(V({}, this.defaults.options), t.options) }), this._tokens = I.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), L.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = We(V({}, this.theme), { preset: e }), this._tokens = I.createTokens(e, this.defaults), this.clearLoadedStyleNames(), L.emit("preset:change", e), L.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = We(V({}, this.theme), { options: e }), this.clearLoadedStyleNames(), L.emit("options:change", e), L.emit("theme:change", this.theme);
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
  return I.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return I.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPresetC(r);
}, getDirective(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPresetD(r);
}, getCustomPreset(e = "", t, r, n) {
  let o = { name: e, preset: t, options: this.options, selector: r, params: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return I.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return I.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, r = "style", n) {
  return I.transformCSS(e, t, n, r, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, r = {}) {
  return I.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, r = {}) {
  return I.getStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), L.emit(`theme:${t}:load`, e), !this._loadingStyles.size && L.emit("theme:load"));
} }, A = {
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
function kt(e, t) {
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!r) {
    if (Array.isArray(e) || (r = xo(e)) || t) {
      r && (e = r);
      var n = 0, o = function() {
      };
      return { s: o, n: function() {
        return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
      }, e: function(c) {
        throw c;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var a, s = !0, l = !1;
  return { s: function() {
    r = r.call(e);
  }, n: function() {
    var c = r.next();
    return s = c.done, c;
  }, e: function(c) {
    l = !0, a = c;
  }, f: function() {
    try {
      s || r.return == null || r.return();
    } finally {
      if (l) throw a;
    }
  } };
}
function xo(e, t) {
  if (e) {
    if (typeof e == "string") return wt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? wt(e, t) : void 0;
  }
}
function wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
var ni = {
  filter: function(t, r, n, o, a) {
    var s = [];
    if (!t)
      return s;
    var l = kt(t), i;
    try {
      for (l.s(); !(i = l.n()).done; ) {
        var c = i.value;
        if (typeof c == "string") {
          if (this.filters[o](c, n, a)) {
            s.push(c);
            continue;
          }
        } else {
          var p = kt(r), d;
          try {
            for (p.s(); !(d = p.n()).done; ) {
              var u = d.value, m = Ye(c, u);
              if (this.filters[o](m, n, a)) {
                s.push(c);
                break;
              }
            }
          } catch (f) {
            p.e(f);
          } finally {
            p.f();
          }
        }
      }
    } catch (f) {
      l.e(f);
    } finally {
      l.f();
    }
    return s;
  },
  filters: {
    startsWith: function(t, r, n) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var o = R(r.toString()).toLocaleLowerCase(n), a = R(t.toString()).toLocaleLowerCase(n);
      return a.slice(0, o.length) === o;
    },
    contains: function(t, r, n) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var o = R(r.toString()).toLocaleLowerCase(n), a = R(t.toString()).toLocaleLowerCase(n);
      return a.indexOf(o) !== -1;
    },
    notContains: function(t, r, n) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var o = R(r.toString()).toLocaleLowerCase(n), a = R(t.toString()).toLocaleLowerCase(n);
      return a.indexOf(o) === -1;
    },
    endsWith: function(t, r, n) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var o = R(r.toString()).toLocaleLowerCase(n), a = R(t.toString()).toLocaleLowerCase(n);
      return a.indexOf(o, a.length - o.length) !== -1;
    },
    equals: function(t, r, n) {
      return r == null || r === "" ? !0 : t == null ? !1 : t.getTime && r.getTime ? t.getTime() === r.getTime() : R(t.toString()).toLocaleLowerCase(n) == R(r.toString()).toLocaleLowerCase(n);
    },
    notEquals: function(t, r, n) {
      return r == null || r === "" ? !1 : t == null ? !0 : t.getTime && r.getTime ? t.getTime() !== r.getTime() : R(t.toString()).toLocaleLowerCase(n) != R(r.toString()).toLocaleLowerCase(n);
    },
    in: function(t, r) {
      if (r == null || r.length === 0)
        return !0;
      for (var n = 0; n < r.length; n++)
        if (Wn(t, r[n]))
          return !0;
      return !1;
    },
    between: function(t, r) {
      return r == null || r[0] == null || r[1] == null ? !0 : t == null ? !1 : t.getTime ? r[0].getTime() <= t.getTime() && t.getTime() <= r[1].getTime() : r[0] <= t && t <= r[1];
    },
    lt: function(t, r) {
      return r == null ? !0 : t == null ? !1 : t.getTime && r.getTime ? t.getTime() < r.getTime() : t < r;
    },
    lte: function(t, r) {
      return r == null ? !0 : t == null ? !1 : t.getTime && r.getTime ? t.getTime() <= r.getTime() : t <= r;
    },
    gt: function(t, r) {
      return r == null ? !0 : t == null ? !1 : t.getTime && r.getTime ? t.getTime() > r.getTime() : t > r;
    },
    gte: function(t, r) {
      return r == null ? !0 : t == null ? !1 : t.getTime && r.getTime ? t.getTime() >= r.getTime() : t >= r;
    },
    dateIs: function(t, r) {
      return r == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof r == "string" && (r = new Date(r)), t.toDateString() === r.toDateString());
    },
    dateIsNot: function(t, r) {
      return r == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof r == "string" && (r = new Date(r)), t.toDateString() !== r.toDateString());
    },
    dateBefore: function(t, r) {
      return r == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof r == "string" && (r = new Date(r)), t.getTime() < r.getTime());
    },
    dateAfter: function(t, r) {
      return r == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof r == "string" && (r = new Date(r)), t.getTime() > r.getTime());
    }
  },
  register: function(t, r) {
    this.filters[t] = r;
  }
}, yo = `
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
function ke(e) {
  "@babel/helpers - typeof";
  return ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ke(e);
}
function _t(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function St(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? _t(Object(r), !0).forEach(function(n) {
      ko(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : _t(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function ko(e, t, r) {
  return (t = wo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function wo(e) {
  var t = _o(e, "string");
  return ke(t) == "symbol" ? t : t + "";
}
function _o(e, t) {
  if (ke(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (ke(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function So(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  dt() && dt().components ? Yt(e) : t ? e() : Xr(e);
}
var $o = 0;
function To(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = H(!1), n = H(e), o = H(null), a = fr() ? window.document : void 0, s = t.document, l = s === void 0 ? a : s, i = t.immediate, c = i === void 0 ? !0 : i, p = t.manual, d = p === void 0 ? !1 : p, u = t.name, m = u === void 0 ? "style_".concat(++$o) : u, f = t.id, b = f === void 0 ? void 0 : f, h = t.media, v = h === void 0 ? void 0 : h, y = t.nonce, $ = y === void 0 ? void 0 : y, g = t.first, k = g === void 0 ? !1 : g, E = t.onMounted, N = E === void 0 ? void 0 : E, K = t.onUpdated, Y = K === void 0 ? void 0 : K, X = t.onLoad, G = X === void 0 ? void 0 : X, ee = t.props, te = ee === void 0 ? {} : ee, Z = function() {
  }, re = function(ce) {
    var pe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var U = St(St({}, te), pe), M = U.name || m, oe = U.id || b, Ce = U.nonce || $;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(M, '"]')) || l.getElementById(oe) || l.createElement("style"), o.value.isConnected || (n.value = ce || e, Ie(o.value, {
        type: "text/css",
        id: oe,
        media: v,
        nonce: Ce
      }), k ? l.head.prepend(o.value) : l.head.appendChild(o.value), so(o.value, "data-primevue-style-id", M), Ie(o.value, U), o.value.onload = function(de) {
        return G?.(de, {
          name: M
        });
      }, N?.(M)), !r.value && (Z = fe(n, function(de) {
        o.value.textContent = de, Y?.(M);
      }, {
        immediate: !0
      }), r.value = !0);
    }
  }, le = function() {
    !l || !r.value || (Z(), to(o.value) && l.head.removeChild(o.value), r.value = !1, o.value = null);
  };
  return c && !d && So(re), {
    id: b,
    name: m,
    el: o,
    css: n,
    unload: le,
    load: re,
    isLoaded: Qr(r)
  };
}
function we(e) {
  "@babel/helpers - typeof";
  return we = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, we(e);
}
var $t, Tt, Ct, Pt;
function Ot(e, t) {
  return Eo(e) || Oo(e, t) || Po(e, t) || Co();
}
function Co() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Po(e, t) {
  if (e) {
    if (typeof e == "string") return Et(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Et(e, t) : void 0;
  }
}
function Et(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Oo(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, o, a, s, l = [], i = !0, c = !1;
    try {
      if (a = (r = r.call(e)).next, t !== 0) for (; !(i = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); i = !0) ;
    } catch (p) {
      c = !0, o = p;
    } finally {
      try {
        if (!i && r.return != null && (s = r.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw o;
      }
    }
    return l;
  }
}
function Eo(e) {
  if (Array.isArray(e)) return e;
}
function Lt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function Fe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Lt(Object(r), !0).forEach(function(n) {
      Lo(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : Lt(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Lo(e, t, r) {
  return (t = Ao(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Ao(e) {
  var t = zo(e, "string");
  return we(t) == "symbol" ? t : t + "";
}
function zo(e, t) {
  if (we(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (we(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Le(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var jo = function(t) {
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
}, No = {}, Ro = {}, P = {
  name: "base",
  css: jo,
  style: yo,
  classes: No,
  inlineStyles: Ro,
  load: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = n(Ee($t || ($t = Le(["", ""])), t));
    return T(o) ? To(be(o), Fe({
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
      return S.transformCSS(r.name || t.name, "".concat(o).concat(Ee(Tt || (Tt = Le(["", ""])), n)));
    });
  },
  getCommonTheme: function(t) {
    return S.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return S.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return S.getDirective(this.name, t);
  },
  getPresetTheme: function(t, r, n) {
    return S.getCustomPreset(this.name, t, r, n);
  },
  getLayerOrderThemeCSS: function() {
    return S.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var n = j(this.css, {
        dt: ie
      }) || "", o = be(Ee(Ct || (Ct = Le(["", "", ""])), n, t)), a = Object.entries(r).reduce(function(s, l) {
        var i = Ot(l, 2), c = i[0], p = i[1];
        return s.push("".concat(c, '="').concat(p, '"')) && s;
      }, []).join(" ");
      return T(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return S.getCommonStyleSheet(this.name, t, r);
  },
  getThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = [S.getStyleSheet(this.name, t, r)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = Ee(Pt || (Pt = Le(["", ""])), j(this.style, {
        dt: ie
      })), s = be(S.transformCSS(o, a)), l = Object.entries(r).reduce(function(i, c) {
        var p = Ot(c, 2), d = p[0], u = p[1];
        return i.push("".concat(d, '="').concat(u, '"')) && i;
      }, []).join(" ");
      T(s) && n.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return n.join("");
  },
  extend: function(t) {
    return Fe(Fe({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Q = sr();
function _e(e) {
  "@babel/helpers - typeof";
  return _e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, _e(e);
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
function Ae(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? At(Object(r), !0).forEach(function(n) {
      Io(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : At(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Io(e, t, r) {
  return (t = Vo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Vo(e) {
  var t = Do(e, "string");
  return _e(t) == "symbol" ? t : t + "";
}
function Do(e, t) {
  if (_e(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (_e(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Mo = {
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
    text: [A.STARTS_WITH, A.CONTAINS, A.NOT_CONTAINS, A.ENDS_WITH, A.EQUALS, A.NOT_EQUALS],
    numeric: [A.EQUALS, A.NOT_EQUALS, A.LESS_THAN, A.LESS_THAN_OR_EQUAL_TO, A.GREATER_THAN, A.GREATER_THAN_OR_EQUAL_TO],
    date: [A.DATE_IS, A.DATE_IS_NOT, A.DATE_BEFORE, A.DATE_AFTER]
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
}, qo = Symbol();
function Bo(e, t) {
  var r = {
    config: en(t)
  };
  return e.config.globalProperties.$primevue = r, e.provide(qo, r), Uo(), Wo(e, r), r;
}
var ge = [];
function Uo() {
  L.clear(), ge.forEach(function(e) {
    return e?.();
  }), ge = [];
}
function Wo(e, t) {
  var r = H(!1), n = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !S.isStyleNameLoaded("common")) {
      var p, d, u = ((p = P.getCommonTheme) === null || p === void 0 ? void 0 : p.call(P)) || {}, m = u.primitive, f = u.semantic, b = u.global, h = u.style, v = {
        nonce: (d = t.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      P.load(m?.css, Ae({
        name: "primitive-variables"
      }, v)), P.load(f?.css, Ae({
        name: "semantic-variables"
      }, v)), P.load(b?.css, Ae({
        name: "global-variables"
      }, v)), P.loadStyle(Ae({
        name: "global-style"
      }, v), h), S.setLoadedStyleName("common");
    }
  };
  L.on("theme:change", function(i) {
    r.value || (e.config.globalProperties.$primevue.config.theme = i, r.value = !0);
  });
  var o = fe(t.config, function(i, c) {
    Q.emit("config:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = fe(function() {
    return t.config.ripple;
  }, function(i, c) {
    Q.emit("config:ripple:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = fe(function() {
    return t.config.theme;
  }, function(i, c) {
    r.value || S.setTheme(i), t.config.unstyled || n(), r.value = !1, Q.emit("config:theme:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = fe(function() {
    return t.config.unstyled;
  }, function(i, c) {
    !i && t.config.theme && n(), Q.emit("config:unstyled:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  ge.push(o), ge.push(a), ge.push(s), ge.push(l);
}
var Fo = {
  install: function(t, r) {
    var n = Kn(Mo, r);
    Bo(t, n);
  }
}, wr = {
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
    this.mounted = fr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Ho(e, t, r, n, o, a) {
  return a.inline ? Re(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (tn(), rn(Gt, {
    key: 1,
    to: r.appendTo
  }, [Re(e.$slots, "default")], 8, ["to"])) : Zt("", !0);
}
wr.render = Ho;
var J = {
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
function Ko() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = nn();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var zt = P.extend({
  name: "common"
});
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
}
function Yo(e) {
  return $r(e) || Go(e) || Sr(e) || _r();
}
function Go(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function he(e, t) {
  return $r(e) || Zo(e, t) || Sr(e, t) || _r();
}
function _r() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Sr(e, t) {
  if (e) {
    if (typeof e == "string") return et(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? et(e, t) : void 0;
  }
}
function et(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Zo(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, o, a, s, l = [], i = !0, c = !1;
    try {
      if (a = (r = r.call(e)).next, t === 0) {
        if (Object(r) !== r) return;
        i = !1;
      } else for (; !(i = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); i = !0) ;
    } catch (p) {
      c = !0, o = p;
    } finally {
      try {
        if (!i && r.return != null && (s = r.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw o;
      }
    }
    return l;
  }
}
function $r(e) {
  if (Array.isArray(e)) return e;
}
function jt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function w(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? jt(Object(r), !0).forEach(function(n) {
      ve(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : jt(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function ve(e, t, r) {
  return (t = Jo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Jo(e) {
  var t = Qo(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function Qo(e, t) {
  if (Se(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Se(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var oi = {
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
        L.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, r) {
        var n = this;
        L.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return n._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, r, n, o, a, s, l, i, c, p, d, u = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = u ? (r = this.pt) === null || r === void 0 || (r = r.originalValue) === null || r === void 0 ? void 0 : r[this.$.type.name] : void 0, f = u ? (n = this.pt) === null || n === void 0 || (n = n.value) === null || n === void 0 ? void 0 : n[this.$.type.name] : this.pt;
    (o = f || m) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var b = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, h = b ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, v = b ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 ? void 0 : c.pt;
    (p = v || h) === null || p === void 0 || (p = p[this.$.type.name]) === null || p === void 0 || (p = p.hooks) === null || p === void 0 || (d = p.onBeforeCreate) === null || d === void 0 || d.call(p), this.$attrSelector = Ko(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = dr(se(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = w({
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
        var r = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), n = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        r?.(), n?.();
      }
    },
    _mergeProps: function(t) {
      for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
        n[o - 1] = arguments[o];
      return Be(t) ? t.apply(void 0, n) : ze.apply(void 0, n);
    },
    _load: function() {
      J.isStyleNameLoaded("base") || (P.loadCSS(this.$styleOptions), this._loadGlobalStyles(), J.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, r;
      !J.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (r = this.$style) !== null && r !== void 0 && r.name && (zt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), J.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      T(t) && P.load(t, w({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, r;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!S.isStyleNameLoaded("common")) {
          var n, o, a = ((n = this.$style) === null || n === void 0 || (o = n.getCommonTheme) === null || o === void 0 ? void 0 : o.call(n)) || {}, s = a.primitive, l = a.semantic, i = a.global, c = a.style;
          P.load(s?.css, w({
            name: "primitive-variables"
          }, this.$styleOptions)), P.load(l?.css, w({
            name: "semantic-variables"
          }, this.$styleOptions)), P.load(i?.css, w({
            name: "global-variables"
          }, this.$styleOptions)), P.loadStyle(w({
            name: "global-style"
          }, this.$styleOptions), c), S.setLoadedStyleName("common");
        }
        if (!S.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (r = this.$style) !== null && r !== void 0 && r.name) {
          var p, d, u, m, f = ((p = this.$style) === null || p === void 0 || (d = p.getComponentTheme) === null || d === void 0 ? void 0 : d.call(p)) || {}, b = f.css, h = f.style;
          (u = this.$style) === null || u === void 0 || u.load(b, w({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(w({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), h), S.setLoadedStyleName(this.$style.name);
        }
        if (!S.isStyleNameLoaded("layer-order")) {
          var v, y, $ = (v = this.$style) === null || v === void 0 || (y = v.getLayerOrderThemeCSS) === null || y === void 0 ? void 0 : y.call(v);
          P.load($, w({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), S.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var r, n, o, a = ((r = this.$style) === null || r === void 0 || (n = r.getPresetTheme) === null || n === void 0 ? void 0 : n.call(r, t, "[".concat(this.$attrSelector, "]"))) || {}, s = a.css, l = (o = this.$style) === null || o === void 0 ? void 0 : o.load(s, w({
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
      J.clearLoadedStyleNames(), L.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      L.off("theme:change", this._loadCoreStyles), L.off("theme:change", this._load), L.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var r;
      return this[t] || ((r = this._getHostInstance(this)) === null || r === void 0 ? void 0 : r[t]);
    },
    _getOptionValue: function(t) {
      var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return it(t, r, n);
    },
    _getPTValue: function() {
      var t, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(n) && !!o[n.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = l.mergeSections, c = i === void 0 ? !0 : i, p = l.mergeProps, d = p === void 0 ? !1 : p, u = a ? s ? this._useGlobalPT(this._getPTClassValue, n, o) : this._useDefaultPT(this._getPTClassValue, n, o) : void 0, m = s ? void 0 : this._getPTSelf(r, this._getPTClassValue, n, w(w({}, o), {}, {
        global: u || {}
      })), f = this._getPTDatasets(n);
      return c || !c && m ? d ? this._mergeProps(d, u, m, f) : w(w(w({}, u), m), f) : w(w({}, m), f);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
        n[o - 1] = arguments[o];
      return ze(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(n)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(n))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, r, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = n === "root" && T((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return n !== "transition" && w(w({}, n === "root" && w(w(ve({}, "".concat(o, "name"), q(a ? (r = this.pt) === null || r === void 0 ? void 0 : r["data-pc-section"] : this.$.type.name)), a && ve({}, "".concat(o, "extend"), q(this.$.type.name))), {}, ve({}, "".concat(this.$attrSelector), ""))), {}, ve({}, "".concat(o, "section"), q(n)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return z(t) || ar(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var r = this, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(l) {
        var i, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, p = o ? o(l) : l, d = q(n), u = q(r.$name);
        return (i = c ? d !== u ? p?.[d] : void 0 : p?.[d]) !== null && i !== void 0 ? i : p;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, r, n, o) {
      var a = function(b) {
        return r(b, n, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, l = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = l.mergeSections, c = i === void 0 ? !0 : i, p = l.mergeProps, d = p === void 0 ? !1 : p, u = a(t.originalValue), m = a(t.value);
        return u === void 0 && m === void 0 ? void 0 : z(m) ? m : z(u) ? u : c || !c && m ? d ? this._mergeProps(d, u, m) : w(w({}, u), m) : m;
      }
      return a(t);
    },
    _useGlobalPT: function(t, r, n) {
      return this._usePT(this.globalPT, t, r, n);
    },
    _useDefaultPT: function(t, r, n) {
      return this._usePT(this.defaultPT, t, r, n);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, w(w({}, this.$params), r));
    },
    ptmi: function() {
      var t, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = ze(this.$_attrsWithoutPT, this.ptm(r, n));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, r, w({
        instance: this
      }, n), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, w(w({}, this.$params), r));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (r) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, w(w({}, this.$params), n)), a = this._getOptionValue(zt.inlineStyles, t, w(w({}, this.$params), n));
        return [a, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, r = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(n) {
        return j(n, {
          instance: r
        });
      });
    },
    defaultPT: function() {
      var t, r = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(n) {
        return r._getOptionValue(n, r.$name, w({}, r.$params)) || j(n, w({}, r.$params));
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
      var t, r = Object.keys(((t = this.$.vnode) === null || t === void 0 ? void 0 : t.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(n) {
        var o = he(n, 1), a = o[0];
        return r?.includes(a);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return w(w({
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
        var r = he(t, 1), n = r[0];
        return n?.startsWith("pt:");
      }).reduce(function(t, r) {
        var n = he(r, 2), o = n[0], a = n[1], s = o.split(":"), l = Yo(s), i = et(l).slice(1);
        return i?.reduce(function(c, p, d, u) {
          return !c[p] && (c[p] = d === u.length - 1 ? a : {}), c[p];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var r = he(t, 1), n = r[0];
        return !(n != null && n.startsWith("pt:"));
      }).reduce(function(t, r) {
        var n = he(r, 2), o = n[0], a = n[1];
        return t[o] = a, t;
      }, {});
    }
  }
}, Xo = `
    .p-contextmenu {
        background: dt('contextmenu.background');
        color: dt('contextmenu.color');
        border: 1px solid dt('contextmenu.border.color');
        border-radius: dt('contextmenu.border.radius');
        box-shadow: dt('contextmenu.shadow');
        min-width: 12.5rem;
    }

    .p-contextmenu-root-list,
    .p-contextmenu-submenu {
        margin: 0;
        padding: dt('contextmenu.list.padding');
        list-style: none;
        outline: 0 none;
        display: flex;
        flex-direction: column;
        gap: dt('contextmenu.list.gap');
    }

    .p-contextmenu-submenu {
        position: absolute;
        display: flex;
        flex-direction: column;
        min-width: 100%;
        z-index: 1;
        background: dt('contextmenu.background');
        color: dt('contextmenu.color');
        border: 1px solid dt('contextmenu.border.color');
        border-radius: dt('contextmenu.border.radius');
        box-shadow: dt('contextmenu.shadow');
    }

    .p-contextmenu-item {
        position: relative;
    }

    .p-contextmenu-item-content {
        transition:
            background dt('contextmenu.transition.duration'),
            color dt('contextmenu.transition.duration');
        border-radius: dt('contextmenu.item.border.radius');
        color: dt('contextmenu.item.color');
    }

    .p-contextmenu-item-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        text-decoration: none;
        overflow: hidden;
        position: relative;
        color: inherit;
        padding: dt('contextmenu.item.padding');
        gap: dt('contextmenu.item.gap');
        user-select: none;
    }

    .p-contextmenu-item-label {
        line-height: 1;
    }

    .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.color');
    }

    .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.color');
        margin-left: auto;
        font-size: dt('contextmenu.submenu.icon.size');
        width: dt('contextmenu.submenu.icon.size');
        height: dt('contextmenu.submenu.icon.size');
    }

    .p-contextmenu-submenu-icon:dir(rtl) {
        margin-left: 0;
        margin-right: auto;
    }

    .p-contextmenu-item.p-focus > .p-contextmenu-item-content {
        color: dt('contextmenu.item.focus.color');
        background: dt('contextmenu.item.focus.background');
    }

    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.focus.color');
    }

    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.focus.color');
    }

    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover {
        color: dt('contextmenu.item.focus.color');
        background: dt('contextmenu.item.focus.background');
    }

    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.focus.color');
    }

    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.focus.color');
    }

    .p-contextmenu-item-active > .p-contextmenu-item-content {
        color: dt('contextmenu.item.active.color');
        background: dt('contextmenu.item.active.background');
    }

    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.active.color');
    }

    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.active.color');
    }

    .p-contextmenu-separator {
        border-block-start: 1px solid dt('contextmenu.separator.border.color');
    }

    .p-contextmenu-mobile .p-contextmenu-submenu {
        position: static;
        box-shadow: none;
        border: 0 none;
        padding-inline-start: dt('tieredmenu.submenu.mobile.indent');
        padding-inline-end: 0;
    }

    .p-contextmenu-mobile .p-contextmenu-submenu-icon {
        transition: transform 0.2s;
        transform: rotate(90deg);
    }

    .p-contextmenu-mobile .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
        transform: rotate(-90deg);
    }
`, ea = {
  root: function(t) {
    var r = t.instance;
    return ["p-contextmenu p-component", {
      "p-contextmenu-mobile": r.queryMatches
    }];
  },
  rootList: "p-contextmenu-root-list",
  item: function(t) {
    var r = t.instance, n = t.processedItem;
    return ["p-contextmenu-item", {
      "p-contextmenu-item-active": r.isItemActive(n),
      "p-focus": r.isItemFocused(n),
      "p-disabled": r.isItemDisabled(n)
    }];
  },
  itemContent: "p-contextmenu-item-content",
  itemLink: "p-contextmenu-item-link",
  itemIcon: "p-contextmenu-item-icon",
  itemLabel: "p-contextmenu-item-label",
  submenuIcon: "p-contextmenu-submenu-icon",
  submenu: "p-contextmenu-submenu",
  separator: "p-contextmenu-separator"
};
P.extend({
  name: "contextmenu",
  style: Xo,
  classes: ea
});
function $e(e) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $e(e);
}
function Nt(e, t) {
  return oa(e) || na(e, t) || ra(e, t) || ta();
}
function ta() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ra(e, t) {
  if (e) {
    if (typeof e == "string") return Rt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Rt(e, t) : void 0;
  }
}
function Rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function na(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, o, a, s, l = [], i = !0, c = !1;
    try {
      if (a = (r = r.call(e)).next, t !== 0) for (; !(i = (n = a.call(r)).done) && (l.push(n.value), l.length !== t); i = !0) ;
    } catch (p) {
      c = !0, o = p;
    } finally {
      try {
        if (!i && r.return != null && (s = r.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw o;
      }
    }
    return l;
  }
}
function oa(e) {
  if (Array.isArray(e)) return e;
}
function It(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function _(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? It(Object(r), !0).forEach(function(n) {
      tt(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : It(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function tt(e, t, r) {
  return (t = aa(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function aa(e) {
  var t = ia(e, "string");
  return $e(t) == "symbol" ? t : t + "";
}
function ia(e, t) {
  if ($e(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if ($e(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var x = {
  _getMeta: function() {
    return [B(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], j(B(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, r) {
    var n, o, a;
    return (n = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (r == null || (a = r.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || n === void 0 ? void 0 : n.config;
  },
  _getOptionValue: it,
  _getPTValue: function() {
    var t, r, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var y = x._getOptionValue.apply(x, arguments);
      return z(y) || ar(y) ? {
        class: y
      } : y;
    }, c = ((t = n.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((r = n.$primevueConfig) === null || r === void 0 ? void 0 : r.ptOptions) || {}, p = c.mergeSections, d = p === void 0 ? !0 : p, u = c.mergeProps, m = u === void 0 ? !1 : u, f = l ? x._useDefaultPT(n, n.defaultPT(), i, a, s) : void 0, b = x._usePT(n, x._getPT(o, n.$name), i, a, _(_({}, s), {}, {
      global: f || {}
    })), h = x._getPTDatasets(n, a);
    return d || !d && b ? m ? x._mergeProps(n, m, f, b, h) : _(_(_({}, f), b), h) : _(_({}, b), h);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = "data-pc-";
    return _(_({}, r === "root" && tt({}, "".concat(n, "name"), q(t.$name))), {}, tt({}, "".concat(n, "section"), q(r)));
  },
  _getPT: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var l, i = n ? n(s) : s, c = q(r);
      return (l = i?.[c]) !== null && l !== void 0 ? l : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(h) {
      return n(h, o, a);
    };
    if (r && Object.hasOwn(r, "_usept")) {
      var l, i = r._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, c = i.mergeSections, p = c === void 0 ? !0 : c, d = i.mergeProps, u = d === void 0 ? !1 : d, m = s(r.originalValue), f = s(r.value);
      return m === void 0 && f === void 0 ? void 0 : z(f) ? f : z(m) ? m : p || !p && f ? u ? x._mergeProps(t, u, m, f) : _(_({}, m), f) : f;
    }
    return s(r);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return x._usePT(t, r, n, o, a);
  },
  _loadStyles: function() {
    var t, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = x._getConfig(n, o), s = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    x._loadCoreStyles(r, s), x._loadThemeStyles(r, s), x._loadScopedThemeStyles(r, s), x._removeThemeListeners(r), r.$loadStyles = function() {
      return x._loadThemeStyles(r, s);
    }, x._themeChangeListener(r.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, r, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!J.isStyleNameLoaded((t = n.$style) === null || t === void 0 ? void 0 : t.name) && (r = n.$style) !== null && r !== void 0 && r.name) {
      var a;
      P.loadCSS(o), (a = n.$style) === null || a === void 0 || a.loadCSS(o), J.setLoadedStyleName(n.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, r, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!S.isStyleNameLoaded("common")) {
        var s, l, i = ((s = o.$style) === null || s === void 0 || (l = s.getCommonTheme) === null || l === void 0 ? void 0 : l.call(s)) || {}, c = i.primitive, p = i.semantic, d = i.global, u = i.style;
        P.load(c?.css, _({
          name: "primitive-variables"
        }, a)), P.load(p?.css, _({
          name: "semantic-variables"
        }, a)), P.load(d?.css, _({
          name: "global-variables"
        }, a)), P.loadStyle(_({
          name: "global-style"
        }, a), u), S.setLoadedStyleName("common");
      }
      if (!S.isStyleNameLoaded((r = o.$style) === null || r === void 0 ? void 0 : r.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
        var m, f, b, h, v = ((m = o.$style) === null || m === void 0 || (f = m.getDirectiveTheme) === null || f === void 0 ? void 0 : f.call(m)) || {}, y = v.css, $ = v.style;
        (b = o.$style) === null || b === void 0 || b.load(y, _({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (h = o.$style) === null || h === void 0 || h.loadStyle(_({
          name: "".concat(o.$style.name, "-style")
        }, a), $), S.setLoadedStyleName(o.$style.name);
      }
      if (!S.isStyleNameLoaded("layer-order")) {
        var g, k, E = (g = o.$style) === null || g === void 0 || (k = g.getLayerOrderThemeCSS) === null || k === void 0 ? void 0 : k.call(g);
        P.load(E, _({
          name: "layer-order",
          first: !0
        }, a)), S.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, n = t.preset();
    if (n && t.$attrSelector) {
      var o, a, s, l = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, n, "[".concat(t.$attrSelector, "]"))) || {}, i = l.css, c = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, _({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, r));
      t.scopedStyleEl = c.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    J.clearLoadedStyleNames(), L.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    L.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, r, n, o, a, s) {
    var l, i, c = "on".concat(Yn(r)), p = x._getConfig(o, a), d = n?.$instance, u = x._usePT(d, x._getPT(o == null || (l = o.value) === null || l === void 0 ? void 0 : l.pt, t), x._getOptionValue, "hooks.".concat(c)), m = x._useDefaultPT(d, p == null || (i = p.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], x._getOptionValue, "hooks.".concat(c)), f = {
      el: n,
      binding: o,
      vnode: a,
      prevVnode: s
    };
    u?.(d, f), m?.(d, f);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length, n = new Array(r > 2 ? r - 2 : 0), o = 2; o < r; o++)
      n[o - 2] = arguments[o];
    return Be(t) ? t.apply(void 0, n) : ze.apply(void 0, n);
  },
  _extend: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = function(l, i, c, p, d) {
      var u, m, f, b;
      i._$instances = i._$instances || {};
      var h = x._getConfig(c, p), v = i._$instances[t] || {}, y = qe(v) ? _(_({}, r), r?.methods) : {};
      i._$instances[t] = _(_({}, v), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: c,
        $modifiers: c?.modifiers,
        $value: c?.value,
        $el: v.$el || i || void 0,
        $style: _({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, r?.style),
        $primevueConfig: h,
        $attrSelector: (u = i.$pd) === null || u === void 0 || (u = u[t]) === null || u === void 0 ? void 0 : u.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return x._getPT(h?.pt, void 0, function(g) {
            var k;
            return g == null || (k = g.directives) === null || k === void 0 ? void 0 : k[t];
          });
        },
        isUnstyled: function() {
          var g, k;
          return ((g = i._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled) !== void 0 ? (k = i._$instances[t]) === null || k === void 0 || (k = k.$binding) === null || k === void 0 || (k = k.value) === null || k === void 0 ? void 0 : k.unstyled : h?.unstyled;
        },
        theme: function() {
          var g;
          return (g = i._$instances[t]) === null || g === void 0 || (g = g.$primevueConfig) === null || g === void 0 ? void 0 : g.theme;
        },
        preset: function() {
          var g;
          return (g = i._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.dt;
        },
        /* instance's methods */
        ptm: function() {
          var g, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return x._getPTValue(i._$instances[t], (g = i._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.pt, k, _({}, E));
        },
        ptmo: function() {
          var g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", E = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return x._getPTValue(i._$instances[t], g, k, E, !1);
        },
        cx: function() {
          var g, k, E = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", N = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (g = i._$instances[t]) !== null && g !== void 0 && g.isUnstyled() ? void 0 : x._getOptionValue((k = i._$instances[t]) === null || k === void 0 || (k = k.$style) === null || k === void 0 ? void 0 : k.classes, E, _({}, N));
        },
        sx: function() {
          var g, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, N = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return E ? x._getOptionValue((g = i._$instances[t]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.inlineStyles, k, _({}, N)) : void 0;
        }
      }, y), i.$instance = i._$instances[t], (m = (f = i.$instance)[l]) === null || m === void 0 || m.call(f, i, c, p, d), i["$".concat(t)] = i.$instance, x._hook(t, l, i, c, p, d), i.$pd || (i.$pd = {}), i.$pd[t] = _(_({}, (b = i.$pd) === null || b === void 0 ? void 0 : b[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(l) {
      var i, c, p, d = l._$instances[t], u = d?.watch, m = function(h) {
        var v, y = h.newValue, $ = h.oldValue;
        return u == null || (v = u.config) === null || v === void 0 ? void 0 : v.call(d, y, $);
      }, f = function(h) {
        var v, y = h.newValue, $ = h.oldValue;
        return u == null || (v = u["config.ripple"]) === null || v === void 0 ? void 0 : v.call(d, y, $);
      };
      d.$watchersCallback = {
        config: m,
        "config.ripple": f
      }, u == null || (i = u.config) === null || i === void 0 || i.call(d, d?.$primevueConfig), Q.on("config:change", m), u == null || (c = u["config.ripple"]) === null || c === void 0 || c.call(d, d == null || (p = d.$primevueConfig) === null || p === void 0 ? void 0 : p.ripple), Q.on("config:ripple:change", f);
    }, a = function(l) {
      var i = l._$instances[t].$watchersCallback;
      i && (Q.off("config:change", i.config), Q.off("config:ripple:change", i["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, i, c, p) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: lo("pd")
        }, n("created", l, i, c, p);
      },
      beforeMount: function(l, i, c, p) {
        var d;
        x._loadStyles((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance, i, c), n("beforeMount", l, i, c, p), o(l);
      },
      mounted: function(l, i, c, p) {
        var d;
        x._loadStyles((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance, i, c), n("mounted", l, i, c, p);
      },
      beforeUpdate: function(l, i, c, p) {
        n("beforeUpdate", l, i, c, p);
      },
      updated: function(l, i, c, p) {
        var d;
        x._loadStyles((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance, i, c), n("updated", l, i, c, p);
      },
      beforeUnmount: function(l, i, c, p) {
        var d;
        a(l), x._removeThemeListeners((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance), n("beforeUnmount", l, i, c, p);
      },
      unmounted: function(l, i, c, p) {
        var d;
        (d = l.$pd[t]) === null || d === void 0 || (d = d.instance) === null || d === void 0 || (d = d.scopedStyleEl) === null || d === void 0 || (d = d.value) === null || d === void 0 || d.remove(), n("unmounted", l, i, c, p);
      }
    };
  },
  extend: function() {
    var t = x._getMeta.apply(x, arguments), r = Nt(t, 2), n = r[0], o = r[1];
    return _({
      extend: function() {
        var s = x._getMeta.apply(x, arguments), l = Nt(s, 2), i = l[0], c = l[1];
        return x.extend(i, _(_(_({}, o), o?.methods), c));
      }
    }, x._extend(n, o));
  }
}, sa = `
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
`, la = {
  root: "p-ink"
}, ca = P.extend({
  name: "ripple-directive",
  style: sa,
  classes: la
}), pa = x.extend({
  style: ca
});
function Te(e) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Te(e);
}
function da(e) {
  return ga(e) || fa(e) || ma(e) || ua();
}
function ua() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ma(e, t) {
  if (e) {
    if (typeof e == "string") return rt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? rt(e, t) : void 0;
  }
}
function fa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ga(e) {
  if (Array.isArray(e)) return rt(e);
}
function rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Vt(e, t, r) {
  return (t = ha(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function ha(e) {
  var t = va(e, "string");
  return Te(t) == "symbol" ? t : t + "";
}
function va(e, t) {
  if (Te(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Te(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ai = pa.extend("ripple", {
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
      var r = this.getInk(t);
      r || (r = ro("span", Vt(Vt({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), t.appendChild(r), this.$el = r);
    },
    remove: function(t) {
      var r = this.getInk(t);
      r && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(t), r.removeEventListener("animationend", this.onAnimationEnd), r.remove());
    },
    onMouseDown: function(t) {
      var r = this, n = t.currentTarget, o = this.getInk(n);
      if (!(!o || getComputedStyle(o, null).display === "none")) {
        if (!this.isUnstyled() && xe(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !vt(o) && !bt(o)) {
          var a = Math.max(eo(n), io(n));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var s = ao(n), l = t.pageX - s.left + document.body.scrollTop - bt(o) / 2, i = t.pageY - s.top + document.body.scrollLeft - vt(o) / 2;
        o.style.top = i + "px", o.style.left = l + "px", !this.isUnstyled() && Ge(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!r.isUnstyled() && xe(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && xe(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? da(t.children).find(function(r) {
        return oo(r, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), ba = `
    .p-menu {
        background: dt('menu.background');
        color: dt('menu.color');
        border: 1px solid dt('menu.border.color');
        border-radius: dt('menu.border.radius');
        min-width: 12.5rem;
    }

    .p-menu-list {
        margin: 0;
        padding: dt('menu.list.padding');
        outline: 0 none;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: dt('menu.list.gap');
    }

    .p-menu-item-content {
        transition:
            background dt('menu.transition.duration'),
            color dt('menu.transition.duration');
        border-radius: dt('menu.item.border.radius');
        color: dt('menu.item.color');
        overflow: hidden;
    }

    .p-menu-item-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        text-decoration: none;
        overflow: hidden;
        position: relative;
        color: inherit;
        padding: dt('menu.item.padding');
        gap: dt('menu.item.gap');
        user-select: none;
        outline: 0 none;
    }

    .p-menu-item-label {
        line-height: 1;
    }

    .p-menu-item-icon {
        color: dt('menu.item.icon.color');
    }

    .p-menu-item.p-focus .p-menu-item-content {
        color: dt('menu.item.focus.color');
        background: dt('menu.item.focus.background');
    }

    .p-menu-item.p-focus .p-menu-item-icon {
        color: dt('menu.item.icon.focus.color');
    }

    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover {
        color: dt('menu.item.focus.color');
        background: dt('menu.item.focus.background');
    }

    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover .p-menu-item-icon {
        color: dt('menu.item.icon.focus.color');
    }

    .p-menu-overlay {
        box-shadow: dt('menu.shadow');
    }

    .p-menu-submenu-label {
        background: dt('menu.submenu.label.background');
        padding: dt('menu.submenu.label.padding');
        color: dt('menu.submenu.label.color');
        font-weight: dt('menu.submenu.label.font.weight');
    }

    .p-menu-separator {
        border-block-start: 1px solid dt('menu.separator.border.color');
    }
`, xa = {
  root: function(t) {
    var r = t.props;
    return ["p-menu p-component", {
      "p-menu-overlay": r.popup
    }];
  },
  start: "p-menu-start",
  list: "p-menu-list",
  submenuLabel: "p-menu-submenu-label",
  separator: "p-menu-separator",
  end: "p-menu-end",
  item: function(t) {
    var r = t.instance;
    return ["p-menu-item", {
      "p-focus": r.id === r.focusedOptionId,
      "p-disabled": r.disabled()
    }];
  },
  itemContent: "p-menu-item-content",
  itemLink: "p-menu-item-link",
  itemIcon: "p-menu-item-icon",
  itemLabel: "p-menu-item-label"
};
P.extend({
  name: "menu",
  style: ba,
  classes: xa
});
const ya = "data-wippy-overlay-layer";
function Tr() {
  return typeof window < "u" && typeof window.document < "u";
}
function Cr() {
  return Tr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ka() {
  return Cr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const wa = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let _a = 0;
const De = /* @__PURE__ */ new WeakMap();
function Dt(e, t) {
  const r = e.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", t), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function Sa(e, t) {
  if (!wa.test(e.className))
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
  if (!De.has(e)) {
    const n = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Dt(e, t);
    });
    n.observe(e, { attributes: !0, attributeFilter: ["style"] }), De.set(e, n);
  }
}
function st(e) {
  const t = De.get(e);
  t && (t.disconnect(), De.delete(e));
}
function $a(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function nt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Me = /* @__PURE__ */ new Set(), lt = /* @__PURE__ */ new WeakMap();
let Mt = !1, ot = !1;
function Ta() {
  ot = !1;
  for (const e of Me) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && st(t);
      Me.delete(e), lt.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && nt(e);
  }
}
function qt() {
  ot || (ot = !0, requestAnimationFrame(Ta));
}
function Ca(e) {
  const t = document.createElement("div");
  t.setAttribute(ya, "");
  const r = Cr();
  if (t.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && t.setAttribute("popover", "manual"), e.appendChild(t), r) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  nt(t);
  const n = new MutationObserver((o) => {
    const a = t.__wippyAnchorName;
    for (const s of o) {
      if (a)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && Sa(l, a);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && st(l);
    }
    t.isConnected && t.childElementCount > 0 && nt(t);
  });
  return n.observe(t, { childList: !0 }), lt.set(t, n), Me.add(t), Mt || (Mt = !0, window.addEventListener("scroll", qt, { capture: !0, passive: !0 }), window.addEventListener("resize", qt, { passive: !0 })), t;
}
function Bt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Ca(e.hostRoot), ka())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++_a}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Ut(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && st(t);
    Me.delete(e.layer), lt.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Wt = !1;
function Pa() {
  if (Wt)
    return;
  Wt = !0;
  const e = wr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Tr() && (this.hostRoot = $a(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Bt(this), this.$watch("inline", (t) => {
      t ? Ut(this) : Bt(this);
    })));
  }, e.render = function() {
    return this.inline ? Re(this.$slots, "default", { key: 0 }) : this.mounted ? on(Gt, { key: 1, to: this.resolvedTarget || document.body }, [
      Re(this.$slots, "default")
    ]) : Zt("", !0);
  }, e.unmounted = function() {
    Ut(this);
  };
}
const ii = {
  install: (e) => {
    Pa(), e.use(Fo, { theme: "none" });
  }
};
function je(e) {
  return String(e || "").trim().toLowerCase();
}
function Ne(e) {
  if (!e) return [];
  const t = /* @__PURE__ */ new Set(), r = (a) => {
    const s = je(a);
    s && t.add(s);
  };
  if (r(e.full_name), r(e.component), r(e.module), e.org && e.name && r(`${e.org}/${e.name}`), typeof e.organization == "string" && e.name && r(`${e.organization}/${e.name}`), e.organization && typeof e.organization == "object" && e.name) {
    const a = e.organization;
    a.slug && r(`${a.slug}/${e.name}`), a.name && r(`${a.name}/${e.name}`);
  }
  e.namespace && e.name && r(`${e.namespace}/${e.name}`);
  const n = je(e.name);
  n.includes("/") && r(n);
  const o = je(e.id);
  return o.includes("/") && r(o), Array.from(t);
}
function si(e, t) {
  const r = je(t);
  return r ? Ne(e).includes(r) : !1;
}
function li(e) {
  return e ? e >= 1e6 ? (e / 1e6).toFixed(1) + "M" : e >= 1e3 ? (e / 1e3).toFixed(1) + "k" : String(e) : "0";
}
function ci(e) {
  return e ? e >= 1048576 ? (e / 1048576).toFixed(1) + " MB" : e >= 1024 ? (e / 1024).toFixed(1) + " KB" : e + " B" : "";
}
function pi(e) {
  return e?.replace(/[^\s()]+/g, (t) => t.startsWith("LicenseRef-") ? t.slice(11).replace(/-/g, " ") : t) ?? "";
}
const Oa = {
  library: "tabler:book-2",
  service: "tabler:server",
  application: "tabler:apps",
  app: "tabler:apps",
  page: "tabler:browser",
  agent: "tabler:robot"
}, Ft = [261, 200, 24, 142, 330, 174, 12, 220, 280, 50];
function di(e) {
  const t = String(e.full_name || e.name || e.id || "");
  let r = 0;
  for (let n = 0; n < t.length; n++) r = r * 31 + t.charCodeAt(n) | 0;
  return `hsl(${Ft[Math.abs(r) % Ft.length]} 70% 56%)`;
}
function ui(e) {
  return Oa[String(e.type || "").toLowerCase()] || "tabler:package";
}
function Ea(e) {
  const t = String(e?.type || "").toLowerCase();
  return t === "app" || t === "application";
}
function mi(e) {
  return !(!e || e.deprecated === !0);
}
function F(e) {
  return typeof e == "string" ? e.trim().toLowerCase() : "";
}
function fi(e) {
  if (!e) return !1;
  if (e.is_private === !0 || e.private === !0 || (F(e.visibility) || F(e.module_visibility) || F(e.access)) === "private") return !0;
  const r = e.meta && typeof e.meta == "object" ? e.meta : void 0;
  if (!r) return !1;
  if ((F(r.visibility) || F(r.module_visibility) || F(r.access)) === "private") return !0;
  const o = r.hub && typeof r.hub == "object" ? r.hub : void 0;
  return (o ? F(o.visibility) || F(o.module_visibility) || F(o.access) : "") === "private";
}
function Pr(e) {
  return e.full_name ? e.full_name : e.component ? e.component : e.org && e.name ? `${e.org}/${e.name}` : e.namespace && e.name ? `${e.namespace}/${e.name}` : "";
}
function gi(e) {
  return e.display_name || Pr(e) || e.id || "—";
}
function hi(e) {
  return String(e.full_name || e.id || Pr(e));
}
function vi(e, t) {
  const r = t.trim().toLowerCase();
  return r ? e.filter((n) => {
    const o = (n.display_name || n.name || "").toLowerCase(), a = (n.full_name || "").toLowerCase(), s = (n.description || "").toLowerCase();
    return o.includes(r) || a.includes(r) || s.includes(r);
  }) : e;
}
function bi(e, t) {
  const r = [...e];
  return t === "name" ? r.sort((n, o) => String(n.display_name || n.name).localeCompare(String(o.display_name || o.name))) : t === "recent" ? r.sort((n, o) => String(o.update_time || "").localeCompare(String(n.update_time || ""))) : r.sort((n, o) => (o.total_downloads || 0) - (n.total_downloads || 0));
}
function Ht(e, t) {
  return Ea(t(e.component)) ? 0 : String(e.component || "").startsWith("kickside/") ? 1 : 2;
}
function xi(e, t) {
  return e.slice().sort((r, n) => {
    const o = Ht(r, t) - Ht(n, t);
    return o !== 0 ? o : String(r.component || "").localeCompare(String(n.component || ""));
  });
}
function La(e) {
  return typeof e.is_root == "boolean" ? e.is_root : (e.used_by_count || 0) === 0 && (!e.used_by || e.used_by.length === 0);
}
function yi(e) {
  return La(e) ? "root" : "transitive";
}
function ki(e) {
  const t = (e.used_by || []).filter(Boolean), r = e.used_by_count ?? t.length;
  return r <= 0 ? "" : t.length > 0 ? `used by ${t.join(", ")}` : `used by ${r} root${r === 1 ? "" : "s"}`;
}
function wi(e) {
  const t = e.meta?.hub?.resolved_modules?.find((o) => o.name === e.component)?.version;
  if (t) return String(t);
  const r = (e.entries || []).find((o) => o.module === e.component && o.module_version)?.module_version;
  if (r) return String(r);
  const n = String(e.version || "").trim();
  return n === "*" || n === ">=v0.0.0" || n === ">=0.0.0" ? "" : n.replace(/^[>=<~^]+v?/, "");
}
function _i(e) {
  return (e.parameter_name || e.full_id || e.id || e.name || "").trim();
}
function Aa(e) {
  return String(e.path || e.module || "").trim();
}
function Si(e) {
  const t = e.map((a) => ({ ...a, children: [] })), r = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
  for (const a of t) {
    const s = Aa(a);
    s && r.set(s, a);
    const l = n.get(a.module) || [];
    l.push(a), n.set(a.module, l);
  }
  const o = [];
  for (const a of t) {
    let s;
    const l = String(a.parent || "").trim();
    if (l && (s = r.get(l) || n.get(l)?.[0]), !s && a.path && a.path.includes("/")) {
      const i = a.path.lastIndexOf("/");
      s = r.get(a.path.slice(0, i));
    }
    s && s !== a ? s.children.push(a) : o.push(a);
  }
  return o;
}
function $i(e, t) {
  const r = [], n = String(t?.currentVersion || "");
  return n && e.version && (!t?.targetModule || e.module === t.targetModule || e.direct) && n !== String(e.version) && r.push({ label: `upgrade from ${n}`, tone: "upgrade" }), e.installed ? r.push({ label: "installed", tone: "installed" }) : e.shared ? r.push({ label: "shared", tone: "shared" }) : r.push({ label: "new", tone: "new" }), r;
}
function Ti(e, t) {
  return e.transitive === !0 || (e.depth || 0) > 0 ? !0 : !!(t && e.module && e.module !== t);
}
function Ci(e) {
  return String(e.module || e.namespace || "a dependency");
}
function Pi(e) {
  if (!e || typeof e != "object") return [];
  const t = e;
  return Array.isArray(t.required_by) ? t.required_by.map(String).filter(Boolean) : t.required_by && typeof t.required_by == "object" ? Object.values(t.required_by).map(String).filter(Boolean) : typeof t.required_by_text == "string" ? t.required_by_text.split(",").map((r) => r.trim()).filter(Boolean) : [];
}
function Oi(e) {
  if (!e || typeof e != "object") return [];
  const t = e;
  return t.payload?.execution || t.execution || [];
}
function Ei(e) {
  return String(e.step || "").replace(/[._-]+/g, " ").trim() || "step";
}
function Li(e) {
  return !!(e?.authenticated && e.expired !== !0);
}
function Ai(e, t = "Something went wrong") {
  if (e instanceof Error) return e.message;
  if (typeof e == "string") return e;
  if (e && typeof e == "object") {
    const r = e;
    return r.response?.data?.error || r.message || t;
  }
  return t;
}
class D extends Error {
  code;
  status;
  details;
  constructor(t, r, n, o) {
    super(r), this.name = "KeeperHubError", this.code = t, this.status = n, this.details = o;
  }
}
function O(e) {
  return e.then(({ data: t, status: r }) => {
    if (!t || typeof t != "object")
      throw new D("UNKNOWN", "empty or malformed response body", r);
    if (t.success === !1) {
      const o = t;
      throw new D(o.code || "UNKNOWN", o.error || "request failed", r, o.details);
    }
    return t;
  }).catch((t) => {
    if (t instanceof D) throw t;
    const r = t, n = r?.response?.data;
    if (n && n.success === !1)
      throw new D(n.code || "UNKNOWN", n.error || "request failed", r.response?.status, n.details);
    const o = r?.response?.status, a = t instanceof Error && t.message || "network error";
    throw new D(o === 401 ? "UNAUTHORIZED" : o === 403 ? "FORBIDDEN" : "NETWORK", a, o);
  });
}
function zi(e) {
  return {
    securityProjectionStatus() {
      return O(e.get("/api/v1/security/projection"));
    },
    listDependencies(t) {
      const r = {};
      return t?.component && (r.component = t.component), t?.includeEntries === !1 && (r.entries = "0"), t?.includeMigrations === !1 && (r.migrations = "0"), O(e.get("/api/v1/keeper/hub/dependencies", { params: r }));
    },
    browseModules(t) {
      const r = {};
      return t?.query && (r.q = t.query), t?.page && (r.page = t.page), t?.pageSize && (r.page_size = t.pageSize), t?.visibility && (r.visibility = t.visibility), t?.type && (r.type = t.type), t?.sort && (r.sort = t.sort), O(e.get("/api/v1/keeper/hub/browse", { params: r }));
    },
    listVersions(t) {
      return O(e.get("/api/v1/keeper/hub/versions", { params: { module: t } }));
    },
    getReadme(t, r) {
      const n = { module: t };
      return r && (n.version = r), O(e.get("/api/v1/keeper/hub/readme", { params: n }));
    },
    listMigrations(t) {
      const r = {};
      return t && (r.component = t), O(e.get("/api/v1/keeper/hub/migrations", { params: r }));
    },
    planInstall(t) {
      return O(e.post("/api/v1/keeper/hub/dependencies/plan", t));
    },
    planBatchInstall(t) {
      return O(e.post("/api/v1/keeper/hub/dependencies/plan", t));
    },
    install(t) {
      return O(e.post("/api/v1/keeper/hub/dependencies/install", t));
    },
    uninstall(t) {
      return O(e.post("/api/v1/keeper/hub/dependencies/uninstall", t));
    },
    runMigrations(t) {
      return O(e.post("/api/v1/keeper/hub/migrations/run", t));
    },
    requiredSetupStatus(t) {
      return O(e.get("/api/v1/hub/required-setup", { params: { descriptor: t } }));
    },
    applyRequiredSetup(t) {
      return O(e.post("/api/v1/hub/required-setup", { descriptor: t }));
    },
    scan(t) {
      return O(e.post("/api/v1/keeper/hub/scan", t));
    },
    // ── Hub token (manual, native hub.auth seam, admin-set) ──────────────
    authStatus() {
      return O(e.get("/api/v1/hub/auth"));
    },
    authenticate(t) {
      return O(e.post("/api/v1/hub/auth", { token: t }));
    },
    logout() {
      return O(e.delete("/api/v1/hub/auth"));
    },
    async fetchAllByKeyword(t, r = 100) {
      const n = (Array.isArray(t) ? t : [t]).map((p) => p.trim().toLowerCase()).filter(Boolean);
      if (n.length === 0) return [];
      const o = new Set(n), a = [], s = /* @__PURE__ */ new Set(), l = 50;
      async function* i(p) {
        for (let d = 1; d <= l; d++) {
          const u = await O(e.get("/api/v1/keeper/hub/browse", {
            params: { ...p, page: d, page_size: r }
          })), m = u.items || [];
          if (yield m, typeof u.total == "number" && d * r >= u.total || m.length < r) return;
        }
      }
      for (const p of n)
        for await (const d of i({ q: p }))
          for (const u of d) {
            const m = (u.keywords || []).map((v) => String(v).trim().toLowerCase()), f = typeof u.org == "string" ? u.org : typeof u.organization == "string" ? u.organization : u.organization?.slug || u.organization?.name || String(u.full_name || "").split("/")[0], b = String(f || "").trim().toLowerCase();
            if (!m.some((v) => o.has(v)) && !o.has(b)) continue;
            const h = Ne(u)[0] || String(u.full_name || u.id || "").trim().toLowerCase();
            !h || s.has(h) || (s.add(h), a.push(u));
          }
      const c = /* @__PURE__ */ new Set();
      for await (const p of i({ visibility: "private" }))
        for (const d of p)
          for (const u of Ne(d)) c.add(u);
      for (const p of a)
        Ne(p).some((d) => c.has(d)) && (p.visibility = "private");
      return a;
    }
  };
}
const Kt = "registry:v1:", za = 3e4, ja = 250;
function ji(e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e) {
    if (r.name !== "required_setup" && r.short_name !== "required_setup") continue;
    const n = String(r.value ?? "").trim() || String(r.default ?? "").trim(), o = n.startsWith(Kt) ? n.slice(Kt.length) : "";
    if (!/^[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+$/.test(o))
      throw new D("INVALID_SETUP_DESCRIPTOR", "The module declares an invalid required setup descriptor.");
    t.add(o);
  }
  return [...t];
}
async function Ni(e, t, r = {}) {
  const n = () => {
    if (r.isCurrent && !r.isCurrent())
      throw new D("INSTALL_SUPERSEDED", "Installation is closed or superseded.");
  };
  for (const o of t) {
    n(), r.onPhase?.("Checking required setup…");
    const a = Date.now() + za;
    let s;
    for (; !s; ) {
      n();
      try {
        const p = await e.requiredSetupStatus(o);
        n(), p.status !== "building" && (s = p);
      } catch (p) {
        if (!(p instanceof D) || p.status !== 404) throw p;
      }
      if (s) break;
      const c = a - Date.now();
      if (c <= 0)
        throw new D("SETUP_DESCRIPTOR_NOT_VISIBLE", "Required setup does not become available after installation.");
      await new Promise((p) => setTimeout(p, Math.min(ja, c)));
    }
    if (s.success && s.ready && s.status === "ready") continue;
    n(), r.onPhase?.(s.pending_label || "Running required setup…");
    const l = await e.applyRequiredSetup(o);
    if (n(), !l.success || !l.ready || l.status !== "ready")
      throw new D("SETUP_INCOMPLETE", l.error || l.detail || "Required setup fails.", void 0, l);
    r.onPhase?.("Verifying required setup…");
    const i = await e.requiredSetupStatus(o);
    if (n(), !i.success || !i.ready || i.status !== "ready")
      throw new D("SETUP_POSTCONDITION_FAILED", i.error || i.detail || "Required setup fails verification.", void 0, i);
  }
}
const Ri = `:root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;--km-chevron: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239aa0a6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6 -6'/></svg>")}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.km-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:7px 13px;border:1px solid var(--p-primary-700);border-radius:8px;font:inherit;font-size:13px;font-weight:700;font-family:Outfit,system-ui,sans-serif;letter-spacing:-.005em;line-height:1.2;white-space:nowrap;cursor:pointer;background:var(--p-primary-700);color:var(--p-primary-contrast-color);transition:background .2s,color .2s,border-color .2s,transform .15s}.km-btn:disabled{opacity:.55;cursor:default}.km-btn:not(:disabled):hover{transform:translateY(-1px)}.km-btn:not(:disabled):active{transform:translateY(0)}.km-btn:not(.km-btn-text):not(.km-btn-outlined):not(.km-btn-secondary):not(.km-btn-danger):hover{background:var(--p-primary-800);border-color:var(--p-primary-800)}.km-btn-secondary{background:color-mix(in srgb,var(--p-text-color) 6%,var(--p-content-background));border-color:var(--p-content-border-color);color:var(--p-text-color)}.km-btn-secondary:not(:disabled):hover{background:color-mix(in srgb,var(--p-text-color) 11%,var(--p-content-background))}.km-btn-outlined{background:transparent;border-color:var(--p-content-border-color);color:var(--p-text-color)}.km-btn-outlined:not(:disabled):hover{background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.km-btn-text{background:transparent;border-color:transparent;color:var(--p-text-color)}.km-btn-text:not(:disabled):hover{background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.km-btn-danger{background:var(--p-danger-500);border-color:var(--p-danger-500);color:var(--p-button-danger-color)}.km-btn-danger:not(:disabled):hover{background:var(--p-danger-600, color-mix(in srgb, var(--p-danger-500) 88%, var(--p-text-color)))}.km-btn-warning{background:var(--p-warn-500);border-color:var(--p-warn-500);color:var(--p-warn-contrast-color)}.km-btn-warning:not(:disabled):hover{background:var(--p-warn-hover-color)}.km-btn-warning.km-btn-outlined{background:transparent;border-color:color-mix(in srgb,var(--p-warn-500) 45%,var(--p-content-border-color));color:var(--p-warn-600, var(--p-warn-500))}.km-btn-warning.km-btn-outlined:not(:disabled):hover{background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.km-btn-text.km-btn-secondary{color:var(--p-text-muted-color)}.km-btn-text.km-btn-danger{background:transparent;border-color:transparent;color:var(--p-danger-500)}.km-btn-text.km-btn-danger:not(:disabled):hover{background:color-mix(in srgb,var(--p-danger-500) 10%,transparent)}.km-btn-sm{font-size:12px;padding:5px 10px}.km-input{width:100%;box-sizing:border-box;background:var(--p-content-background);border:1px solid var(--p-content-border-color);color:var(--p-text-color);border-radius:8px;font:inherit;font-size:13px;padding:9px 12px;transition:border-color .15s,box-shadow .15s}.km-input:enabled:hover{border-color:var(--p-primary-color)}.km-input::placeholder{color:var(--p-text-muted-color)}:host{--km-flash-shadow: 0 0 0 2px color-mix(in srgb, var(--p-primary-color) 35%, transparent), 0 0 0 4px color-mix(in srgb, var(--p-primary-color) 18%, transparent);--km-flame: hsl(24 80% 45%)}@media(prefers-color-scheme:dark){:host{--km-flame: hsl(24 90% 68%)}}.km{--system-surface-gutter: var(--kickside-system-surface-gutter, 24px);font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;min-height:0}.km-scroll{flex:1;min-height:0;overflow-y:auto;scrollbar-gutter:stable}.km-i{width:16px;height:16px}.km-i-xs{width:12px;height:12px}.km-i-sm{width:14px;height:14px}.km-i-lg{width:28px;height:28px}.km-i-xl{width:36px;height:36px}.km-grow{flex:1}.km-min0{min-width:0}.km-block{display:block;margin:0 auto 8px}.km-mono{font-family:ui-monospace,monospace}.km-dim{color:var(--p-text-muted-color);opacity:.85}.km-muted{font-size:13px;color:var(--p-text-muted-color)}.km-accent{color:var(--p-primary-color)}.km-flame{color:var(--km-flame)}.km-mt,.km-mt-sm{margin-top:8px}.km-mb{margin-bottom:12px}.km-ml-auto{margin-left:auto}.km-trunc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-inline{display:inline-flex;align-items:center;gap:4px}.km-row-wrap{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.km-row-tight{display:flex;align-items:center;gap:6px}.km-row-gap{display:flex;gap:8px}.km-stack{display:flex;flex-direction:column;gap:12px}.km-stack-lg{display:flex;flex-direction:column;gap:28px}.km-pills{display:flex;flex-wrap:wrap;gap:6px}.km-2col{display:grid;grid-template-columns:1fr;gap:10px}@media(min-width:760px){.km-2col{grid-template-columns:1fr 1fr}}.km-loading{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--p-text-muted-color);padding:24px 0}.km-center{justify-content:center}.km-initial-loading{flex:1}.km .km-btn{display:inline-flex;align-items:center;gap:6px}.km-banner{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter);padding:9px 12px;border-radius:8px;font-size:13px;font-weight:600}.km-banner-ok{background:color-mix(in srgb,var(--p-success-500) 14%,transparent);color:var(--p-success-600)}.km-banner-err{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.km-denied{flex:1;display:flex;align-items:center;justify-content:center}.km-denied-box{text-align:center;max-width:360px;padding:24px}.km-denied-icon{width:40px;height:40px;color:var(--p-text-muted-color);opacity:.5;margin:0 auto 8px;display:block}.km-denied-title{font-size:14px;font-weight:600;color:var(--p-text-color);margin-bottom:4px}.km-denied-sub{font-size:12px;color:var(--p-text-muted-color)}.km-list{width:100%;margin:0;padding:16px var(--system-surface-gutter) 28px;display:flex;flex-direction:column;gap:28px}.km-sec-bar{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:4px;flex-wrap:wrap}.km-sec-bar-toolbar{justify-content:flex-start}.km-installed{border-top:1px solid var(--p-content-border-color);padding-top:16px}.km-collapse-head{display:flex;align-items:center;gap:8px;width:100%;padding:4px 0;background:none;border:0;cursor:pointer;text-align:left;color:var(--p-text-color)}.km-collapse-head:hover .km-h2{color:var(--p-primary-color)}.km-h2{font-size:13px;font-weight:600;color:var(--p-text-color)}.km-sub{font-size:11px;color:var(--p-text-muted-color);margin-top:2px}.km-update-count{margin-left:2px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;background:color-mix(in srgb,var(--p-warn-500) 14%,transparent);color:var(--p-warn-600, var(--p-warn-500))}.km-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.km-toggle,.km-check{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--p-text-muted-color);cursor:pointer}.km-toggle input,.km-check input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:0;flex:none;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:6px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.km-toggle input:before,.km-check input:before{content:"";width:5px;height:9px;border:solid var(--p-primary-contrast-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.km-toggle input:checked,.km-check input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.km-toggle input:checked:before,.km-check input:checked:before{transform:rotate(45deg) scale(1)}.km-toggle input:disabled,.km-check input:disabled{opacity:.55;cursor:not-allowed}.km-toggle:has(input:disabled),.km-check:has(input:disabled){cursor:not-allowed}.km-filter{width:200px;font-size:13px}.km-btn-count{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;border-radius:8px;background:color-mix(in srgb,var(--p-primary-contrast-color) 22%,transparent);color:currentColor;font-size:10px;font-weight:800}.km-msg{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0;padding:12px 14px;border-radius:8px;font-size:13px;line-height:1.5}.km-msg>.km-i{flex:none}.km-msg .km-code{flex:none}.km-msg .km-mt{margin:0 0 0 auto}.km-msg-err{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.km-msg-info{background:color-mix(in srgb,var(--p-primary-color) 10%,transparent);color:var(--p-primary-color)}.km-code{font-weight:700;margin-right:4px}.km-empty{margin-top:8px;border:1px dashed var(--p-content-border-color);border-radius:10px;padding:32px;text-align:center}.hub-section-head{display:flex;align-items:center;gap:8px;padding:14px 0 10px}.hub-section-title{font-size:13px;font-weight:600;color:var(--p-text-color)}.hub-section-sub{font-size:11px;color:var(--p-text-muted-color);margin-left:2px}.badge-installed{background:color-mix(in srgb,var(--p-success-500) 16%,transparent);color:var(--p-success-600)}.badge-warn{background:color-mix(in srgb,var(--p-warn-500) 16%,transparent);color:var(--p-warn-600)}.badge-app{background:color-mix(in srgb,var(--p-primary-color) 18%,transparent);color:var(--p-primary-color)}.badge-private{background:color-mix(in srgb,var(--p-help-500) 16%,transparent);color:var(--p-help-600)}.meta-pill{display:inline-flex;align-items:center;gap:3px;font-size:9px;font-weight:500;padding:2px 6px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 7%,transparent);color:var(--p-text-color);border:1px solid var(--p-content-border-color)}.feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:14px}.feat-card{position:relative;display:flex;align-items:stretch;gap:14px;text-align:left;padding:16px 16px 14px 22px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px;cursor:pointer;overflow:hidden;transition:transform .12s ease,border-color .12s,box-shadow .12s}.feat-card:hover{transform:translateY(-1px);border-color:var(--accent);box-shadow:var(--kx-shadow-md)}.feat-strip{position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--accent)}.feat-icon{flex-shrink:0;width:56px;height:56px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}.feat-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.feat-name{font-size:14px;font-weight:700;color:var(--p-text-color)}.feat-org{font-size:11px;font-family:ui-monospace,monospace;color:var(--p-text-muted-color)}.feat-desc{font-size:11px;line-height:1.5;color:var(--p-text-muted-color);margin:4px 0 6px;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.feat-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto}.mod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr));gap:12px}.mod-card{display:flex;align-items:flex-start;gap:12px;text-align:left;padding:12px 14px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:10px;cursor:pointer;transition:border-color .12s,background .12s}.mod-card:hover{border-color:var(--accent);background:color-mix(in srgb,var(--p-text-color) 7%,transparent)}.mod-icon{flex-shrink:0;width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}.mod-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.mod-name{font-size:12px;font-weight:700;color:var(--p-text-color)}.mod-version{font-size:10px;font-family:ui-monospace,monospace;background:color-mix(in srgb,var(--p-text-color) 12%,transparent);color:var(--p-text-color);padding:1px 6px;border-radius:8px}.mod-org{font-size:10px;font-family:ui-monospace,monospace;color:var(--p-text-muted-color)}.mod-desc{font-size:11px;line-height:1.45;color:var(--p-text-muted-color);margin:4px 0 6px;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.mod-foot{display:flex;align-items:center;gap:10px;font-size:10px;color:var(--p-text-muted-color);margin-top:2px}.foot-stat{display:inline-flex;align-items:center;gap:3px}.inst-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 0 12px}.inst-filter{width:min(320px,100%)}.inst-empty{margin-top:0}.inst-list{border:1px solid var(--p-content-border-color);border-radius:14px;overflow:hidden}.inst-row{position:relative;width:100%;display:flex;align-items:center;gap:12px;padding:12px 16px;text-align:left;background:var(--p-content-background);border:none;border-bottom:1px solid var(--p-content-border-color);cursor:pointer;transition:background .12s}.inst-row:last-child{border-bottom:none}.inst-row:hover{background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.inst-strip{position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent);opacity:0;transition:opacity .12s}.inst-row:hover .inst-strip{opacity:1}.inst-icon{width:34px;height:34px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:11px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}.inst-name{font-size:13px;font-weight:500;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.inst-id{font-size:11px;font-family:ui-monospace,monospace;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.inst-update{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color)}.inst-update.available,.inst-update.planning,.inst-update.updating{background:color-mix(in srgb,var(--p-warn-500) 14%,transparent);color:var(--p-warn-600, var(--p-warn-500))}.inst-update.updated{background:color-mix(in srgb,var(--p-success-500) 14%,transparent);color:var(--p-success-600, var(--p-success-500))}.inst-update.blocked,.inst-update.failed{background:color-mix(in srgb,var(--p-danger-500) 13%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.inst-update-msg{margin-top:3px;font-size:11px;line-height:1.35;color:var(--p-danger-600, var(--p-danger-500));overflow-wrap:anywhere}.inst-ver{flex-shrink:0;font-size:10px;font-family:ui-monospace,monospace;padding:2px 7px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-color)}.inst-migs{flex-shrink:0;width:112px;text-align:right;font-size:11px;color:var(--p-text-muted-color)}@media(max-width:720px){.inst-migs{display:none}}.inst-actions{display:flex;align-items:center;gap:2px;flex-shrink:0;opacity:0;transition:opacity .12s}.inst-row:hover .inst-actions,.inst-row:focus-within .inst-actions{opacity:1}.km-chev{flex-shrink:0;color:var(--p-text-muted-color);opacity:.6}.km-icon-btn{width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;border:1px solid transparent;background:transparent;color:var(--p-text-muted-color);cursor:pointer;transition:background .15s,color .15s}.km-icon-btn:hover{color:var(--p-text-color);background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.km-icon-btn:disabled{opacity:.4;cursor:default}.km-danger:hover,.km-danger-fg{color:var(--p-danger-600, var(--p-danger-500))}.provides-pill{font-size:11px;font-family:ui-monospace,monospace;padding:2px 8px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 6%,transparent);color:var(--p-text-color);border:1px solid var(--p-content-border-color)}.d-page{width:100%;margin:0;padding:18px var(--system-surface-gutter) 28px}.d-back{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--p-text-muted-color);background:none;border:0;cursor:pointer;margin-bottom:14px}.d-back:hover{color:var(--p-text-color)}.d-hero{display:flex;gap:16px;align-items:flex-start;position:relative;overflow:hidden;padding:18px 20px;margin-bottom:16px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px}.d-hero:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--accent)}.d-hero-icon{flex-shrink:0;width:56px;height:56px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--accent)}.d-hero-name{font-size:18px;font-weight:700;color:var(--p-text-color)}.d-ver{font-size:11px;font-family:ui-monospace,monospace;padding:1px 7px;border-radius:8px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-color)}.d-hero-org{font-size:12px;font-family:ui-monospace,monospace;color:var(--p-text-muted-color);margin-top:2px}.d-hero-desc{font-size:13px;line-height:1.55;color:var(--p-text-muted-color);margin:8px 0 0}.d-hero-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px}.d-link{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--p-text-muted-color);text-decoration:none;padding:5px 10px;border-radius:8px;border:1px solid var(--p-content-border-color)}.d-link:hover{color:var(--p-text-color);border-color:var(--accent)}.d-grid{display:grid;grid-template-columns:224px minmax(0,1fr);gap:16px;align-items:start}@media(max-width:600px){.d-grid{grid-template-columns:minmax(0,1fr)}}.d-side{display:flex;flex-direction:column;gap:14px}.d-block{padding:12px 14px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px}.d-block-title{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--p-text-muted-color);margin-bottom:8px}.d-block-title.d-accent,.d-accent-i{color:var(--accent)}.d-row{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px}.d-row-i{width:14px;height:14px;color:var(--accent);flex-shrink:0}.d-row-k{color:var(--p-text-muted-color)}.d-row-v{margin-left:auto;color:var(--p-text-color);font-weight:600}.km-dep-list{display:flex;flex-direction:column;gap:4px}.km-dep{display:flex;align-items:center;gap:8px;font-size:11px;font-family:ui-monospace,monospace;color:var(--p-text-color)}.d-cfg-name{display:block;font-family:ui-monospace,monospace;font-size:13px;font-weight:600;color:var(--p-text-color);word-break:break-word}.d-cfg-desc{display:block;font-size:12px;line-height:1.5;color:var(--p-text-muted-color);margin-top:3px}.d-sub{font-size:12px;color:var(--p-text-muted-color);margin:-2px 0 10px}.d-field{display:flex;gap:11px;align-items:flex-start;padding:12px 14px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-left-width:3px;border-radius:8px}.d-field-env{border-left-color:var(--accent)}.d-field-req{border-left-color:color-mix(in srgb,var(--p-text-color) 28%,transparent)}.d-field-i{flex-shrink:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}.d-field-i-req{background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color)}.d-main{min-width:0}.d-tabs{display:flex;gap:2px;border-bottom:1px solid var(--p-content-border-color);margin-bottom:16px}.d-tab{padding:8px 14px;font-size:13px;font-weight:600;color:var(--p-text-muted-color);background:none;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;cursor:pointer}.d-tab:hover:not(:disabled){color:var(--p-text-color)}.d-tab:disabled{opacity:.4;cursor:not-allowed}.d-tab.active{color:var(--accent);border-bottom-color:var(--accent)}.d-tab-body{min-height:120px}.d-empty{text-align:center;padding:40px 0;color:var(--p-text-muted-color);font-size:13px}.km-group-head{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--p-text-color);margin-bottom:6px}.d-entry{padding:8px 10px;border-radius:8px;background:var(--p-content-background);border:1px solid var(--p-content-border-color)}.d-entry-name{font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.d-entry-id{font-size:11px;font-family:ui-monospace,monospace;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.d-vers{display:flex;flex-direction:column;border:1px solid var(--p-content-border-color);border-radius:10px;overflow:hidden}.d-ver-row{display:flex;align-items:center;gap:10px;padding:9px 12px}.d-ver-row+.d-ver-row{border-top:1px solid var(--p-content-border-color)}.d-ver-tag{font-size:12px;font-family:ui-monospace,monospace;font-weight:600;color:var(--p-text-color)}.km-dialog>.km-dialog-content{padding:0;display:flex;flex-direction:column;min-height:0;overflow:hidden}.km-dialog-2p{width:min(940px,calc(100vw - 40px));height:min(88vh,760px);max-height:92%}.km-dialog-content-2p{flex:1;min-height:0}.km-dialog>.km-modal-head{display:flex;align-items:center;justify-content:space-between;font-size:15px;font-weight:700;color:var(--p-text-color);padding:16px 18px;border-bottom:1px solid var(--p-content-border-color)}.km-modal-body{display:flex;flex-direction:column;gap:16px;padding:18px;overflow-y:auto}.km-dialog>.km-modal-foot{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}.km-label{display:block;margin-bottom:4px;font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.km-w-full{width:100%}.km-ver-select{width:9rem}.km-row-between{display:flex;align-items:center;justify-content:space-between;gap:12px}.km-panel{border:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 4%,var(--p-content-background));border-radius:10px;padding:12px;font-size:12px}.km-panel-ok{border-color:color-mix(in srgb,var(--p-success-500) 35%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 8%,var(--p-content-background))}.km-panel-head{display:flex;align-items:center;gap:8px;font-size:12px}.km-panel-title{font-weight:600;color:var(--p-text-color)}.km-trans{margin-top:8px;max-height:112px;overflow:auto;display:flex;flex-wrap:wrap;gap:6px}.km-trans-pill{font-size:9px;font-family:ui-monospace,monospace;padding:2px 6px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-color)}.km-req-head{display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:12px;font-weight:500;color:var(--p-text-color)}.km-req-list{display:flex;flex-direction:column;gap:10px;max-height:288px;overflow:auto;padding-right:4px}.km-req-meta{display:flex;align-items:center;gap:8px;margin-bottom:4px}.km-req-name{font-size:11px;color:var(--p-text-color)}.km-req-flag{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--p-warn-600)}.km-req-input{font-size:12px}.km-input.km-req-warn{border-color:var(--p-warn-500)}.km-req-desc{margin-top:6px;font-size:11px;color:var(--p-text-muted-color)}.km-req-from{margin-top:2px;font-size:10px;color:var(--p-text-muted-color)}.km-ul{margin:6px 0 0;padding-left:20px;list-style:disc;font-size:11px;color:var(--p-text-muted-color)}.km-uninstall-target{font-size:13px;color:var(--p-text-color)}.km-uninstall-preview{display:flex;flex-direction:column;gap:10px}.km-preview-block{border:1px solid var(--p-content-border-color);border-radius:8px;overflow:hidden}.km-preview-title{padding:8px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 4%,transparent)}.km-preview-row{display:flex;align-items:center;gap:8px;padding:7px 10px;font-size:12px;border-top:1px solid var(--p-content-border-color)}.km-running{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:10px;border:1px solid color-mix(in srgb,var(--p-primary-color) 30%,transparent);background:color-mix(in srgb,var(--p-primary-color) 6%,transparent);font-size:13px}.km-running-label{font-weight:500;color:var(--p-text-color)}.rm{font-size:13px;line-height:1.65;color:var(--p-text-color)}.rm h1,.rm h2,.rm h3,.rm h4{font-weight:700;color:var(--p-text-color);line-height:1.3;margin:1.4em 0 .5em}.rm h1{font-size:20px;padding-bottom:6px;border-bottom:1px solid var(--p-content-border-color)}.rm h2{font-size:16px;padding-bottom:4px;border-bottom:1px solid var(--p-content-border-color)}.rm h3{font-size:14px}.rm h4{font-size:13px}.rm p{margin:.7em 0;color:var(--p-text-muted-color)}.rm a{color:var(--p-primary-color);text-decoration:none}.rm a:hover{text-decoration:underline}.rm ul,.rm ol{margin:.7em 0;padding-left:1.5em;color:var(--p-text-muted-color)}.rm ul{list-style:disc outside}.rm ol{list-style:decimal outside}.rm li{margin:.25em 0;padding-left:.2em}.rm li::marker{color:var(--p-text-muted-color)}.rm hr{border:0;border-top:1px solid var(--p-content-border-color);margin:1.4em 0}.rm strong{color:var(--p-text-color);font-weight:700}.rm .rm-code{font-family:ui-monospace,monospace;font-size:.88em;background:color-mix(in srgb,var(--p-text-color) 7%,transparent);color:var(--p-text-color);padding:1px 5px;border-radius:6px;border:1px solid var(--p-content-border-color)}.rm .rm-pre{background:color-mix(in srgb,var(--p-text-color) 7%,transparent);border:1px solid var(--p-content-border-color);border-radius:10px;padding:12px 14px;overflow-x:auto;margin:.9em 0}.rm .rm-pre code{font-family:ui-monospace,monospace;font-size:12px;line-height:1.55;color:var(--p-text-color);background:none;border:0;padding:0}.rm table{border-collapse:collapse;margin:1em 0;font-size:12px;width:100%}.rm th,.rm td{border:1px solid var(--p-content-border-color);padding:6px 10px;text-align:left}.rm th{background:color-mix(in srgb,var(--p-text-color) 7%,transparent);color:var(--p-text-color);font-weight:600}.rm td{color:var(--p-text-muted-color)}.rm img{max-width:100%;border-radius:8px}.km-hub-auth{position:relative;display:inline-flex}.km-hub-auth-panel{width:100%;padding:12px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:10px;box-shadow:var(--p-popover-shadow)}.km-hub-auth-title{font-size:13px;font-weight:700;color:var(--p-text-color);margin-bottom:4px}.km-hub-auth-hint{font-size:12px;color:var(--p-text-muted-color);margin:0 0 8px;line-height:1.5}.km-hub-auth-hint a{color:var(--p-primary-color);text-decoration:none;white-space:nowrap}.km-hub-auth-hint a:hover{text-decoration:underline}.km-hub-auth-input{width:100%;margin-bottom:8px;font-family:ui-monospace,monospace;font-size:12px}.km-hub-auth-actions{display:flex;gap:8px}:is(.km-controls,.inst-toolbar) .km-sort,:is(.km-controls,.inst-toolbar) .km-input,:is(.km-controls,.inst-toolbar) .km-btn{height:var(--kx-control-height);box-sizing:border-box;border-radius:8px;font-size:13px}:is(.km-controls,.inst-toolbar) .km-input{padding:0 10px;border:1px solid var(--p-content-border-color);background-color:color-mix(in srgb,var(--p-text-color) 6%,var(--p-content-background));color:var(--p-text-color)}:is(.km-controls,.inst-toolbar) .km-input:enabled:hover{border-color:var(--p-primary-color)}:is(.km-controls,.inst-toolbar) .km-sort{min-width:168px;align-items:center}:is(.km-controls,.inst-toolbar) .km-btn{padding:0 12px}:is(.km-controls,.inst-toolbar) .km-i{width:15px;height:15px}.km-hub-auth-active{margin-bottom:10px;padding:8px 10px;border-radius:8px;background:color-mix(in srgb,var(--p-text-color) 5%,transparent);border:1px solid var(--p-content-border-color)}.km-hub-auth-active.is-expired{background:color-mix(in srgb,var(--p-warn-500) 10%,transparent);border-color:color-mix(in srgb,var(--p-warn-500) 35%,var(--p-content-border-color))}.km-hub-auth-row{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--p-text-color)}.km-hub-ok{color:var(--p-success-500)}.km-hub-warn{color:var(--p-warn-600, var(--p-warn-500))}.km-hub-auth-meta{font-size:11px;color:var(--p-text-muted-color);margin-top:3px;word-break:break-all}.km-hub-auth-orgs{margin-top:8px}.km-hub-auth-orgs-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--p-text-muted-color);margin-bottom:4px}.km-hub-auth-org{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--p-text-color);padding:2px 0}.km-hub-auth-org-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-hub-auth-org-role{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;padding:2px 6px;border-radius:var(--kx-radius-tag);background:color-mix(in srgb,var(--p-primary-color) 16%,transparent);color:var(--p-primary-color)}.km-2p-head{gap:12px}.km-2p-head-icon{flex-shrink:0;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--kx-radius-10);background:color-mix(in srgb,var(--accent, var(--p-primary-color)) 16%,transparent);color:var(--accent, var(--p-primary-color))}.km-2p-head-icon svg{width:22px;height:22px}.km-2p-head-text{display:flex;flex-direction:column;gap:2px;min-width:0;margin-right:auto}.km-2p-head-title{font-size:15px;font-weight:700;color:var(--p-text-color)}.km-2p-head-sub{font-size:12px;font-weight:500;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-2p{flex:1;min-height:0;display:grid;grid-template-columns:210px minmax(0,1fr)}.km-2p-nav{border-right:1px solid var(--p-content-border-color);padding:12px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;background:var(--kx-surface-1)}.km-2p-navitem{display:flex;align-items:center;gap:10px;width:100%;padding:9px 11px;border:0;background:none;border-radius:var(--kx-radius-8);cursor:pointer;text-align:left;color:var(--p-text-muted-color);font:inherit;font-size:13px;font-weight:600;transition:background .12s,color .12s}.km-2p-navitem:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.km-2p-navitem.active{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.km-2p-navlabel{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-2p-navstatus{display:inline-flex;align-items:center;gap:5px;flex-shrink:0}.km-navbadge{font-size:10px;font-weight:700;min-width:17px;height:17px;padding:0 5px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 10%,transparent);color:var(--p-text-muted-color)}.km-dot{width:8px;height:8px;border-radius:50%;display:inline-block}.km-dot-danger{background:var(--p-danger-500)}.km-dot-warn{background:var(--p-warn-500)}.km-sev-ok-fg{color:var(--p-success-500)}.km-2p-main{min-width:0;min-height:0;overflow-y:auto;padding:20px 22px}.km-sec{display:flex;flex-direction:column;gap:14px}.km-sec-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--p-text-color)}.km-sub-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--p-text-muted-color);margin-top:6px}.km-hint{font-size:12px;line-height:1.5;color:var(--p-text-muted-color);margin:-4px 0 2px;display:flex;align-items:center;gap:5px;flex-wrap:wrap}.km-field{display:flex;flex-direction:column;gap:6px}.km-ov-hero{display:flex;align-items:center;gap:12px}.km-ov-icon{flex-shrink:0;width:48px;height:48px;display:inline-flex;align-items:center;justify-content:center;border-radius:11px;background:color-mix(in srgb,var(--accent, var(--p-primary-color)) 16%,transparent);color:var(--accent, var(--p-primary-color))}.km-ov-name{font-size:16px;font-weight:700;color:var(--p-text-color)}.km-ov-org{font-size:12px;color:var(--p-text-muted-color);margin-top:2px}.km-ov-desc{font-size:13px;line-height:1.6;color:var(--p-text-muted-color);margin:0}.km-ov-meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px}.km-meta-row{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--p-text-muted-color)}.km-meta-row svg{color:var(--p-primary-color);flex-shrink:0}.km-meta-row b{margin-left:auto;color:var(--p-text-color);font-weight:600}.km-ov-readme{border-top:1px solid var(--p-content-border-color);padding-top:12px;max-height:none}.km-seg{display:inline-flex;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);overflow:hidden;align-self:flex-start}.km-seg-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border:0;background:var(--p-content-background);color:var(--p-text-muted-color);font:inherit;font-size:12px;font-weight:600;cursor:pointer}.km-seg-btn+.km-seg-btn{border-left:1px solid var(--p-content-border-color)}.km-seg-btn.active{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.km-mrow{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;min-width:0;padding:9px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);font-size:12px}.km-mrow-direct{border-left:3px solid var(--accent, var(--p-primary-color))}.km-mrow-transitive{margin-left:calc(var(--tree-level, 0) * 18px);background:var(--kx-surface-1)}.km-tree-spacer{width:16px;flex-shrink:0}.km-mrow-badge{background:color-mix(in srgb,var(--accent, var(--p-primary-color)) 16%,transparent);color:var(--accent, var(--p-primary-color))}.km-mrow-name{min-width:0;flex:1 1 150px;color:var(--p-text-color);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-mrow-ver{flex:none;white-space:nowrap;font-size:11px;padding:1px 6px;border-radius:var(--kx-radius-tag);background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-color)}.km-mrow-diff{display:inline-flex;align-items:center;gap:3px;color:var(--p-text-muted-color)}.km-plan-badge-new{background:color-mix(in srgb,var(--p-info-500) 14%,transparent);color:var(--p-info-700)}.km-plan-badge-shared{background:color-mix(in srgb,var(--p-success-500) 12%,transparent);color:var(--p-success-700)}.km-plan-badge-installed{background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color)}.km-plan-badge-upgrade{background:color-mix(in srgb,var(--p-warn-500) 16%,transparent);color:var(--p-warn-700)}.km-skel{position:relative;overflow:hidden;background:var(--kx-surface-2);border-radius:var(--kx-radius-8)}.km-skel:after{content:"";position:absolute;inset:0;transform:translate(-100%);background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--p-text-color) 9%,transparent),transparent);animation:km-shimmer 1.3s infinite}@keyframes km-shimmer{to{transform:translate(100%)}}.km-skel-line{height:14px;margin-bottom:10px}.km-skel-card{height:44px;margin-bottom:8px}.km-skel-field{height:62px;margin-bottom:10px}.km-empty-inline{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:32px 16px;color:var(--p-text-muted-color);font-size:13px}.km-req-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.km-req-toolbar .km-hint{margin:0}.km-req-group{display:flex;flex-direction:column;gap:10px}.km-req-group-head{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--p-text-color);padding-top:4px}.km-req-group-head svg{color:var(--p-text-muted-color)}.km-req{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);padding:11px 12px;display:flex;flex-direction:column;gap:6px;transition:border-color .15s,box-shadow .15s,background .15s}.km-req.is-missing{border-color:color-mix(in srgb,var(--p-warn-500) 55%,var(--p-content-border-color))}.km-req.is-invalid{border-color:color-mix(in srgb,var(--p-danger-500) 55%,var(--p-content-border-color))}.km-req.is-flash{background:var(--kx-wash-warn);box-shadow:var(--km-flash-shadow)}.km-chip{font-size:10px;font-family:ui-monospace,monospace;padding:1px 6px;border-radius:var(--kx-radius-tag);background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color)}.km-req-foot{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.km-req-fit{flex-shrink:0}.km-req-src{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--p-success-700)}.km-req-invalid{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--p-danger-700)}.km-req-info{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--p-text-muted-color)}.km-readonly-field{width:100%;min-height:34px;display:flex;align-items:center;padding:7px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1);color:var(--p-text-muted-color);font-size:12px}.km-scan-run{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);font-size:13px}.km-scan-bar{flex-shrink:0;width:120px;height:6px;border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 10%,transparent);overflow:hidden}.km-scan-bar>span{display:block;height:100%;background:var(--p-primary-color);border-radius:999px;transition:width .3s ease}.km-dot-ok{background:var(--p-success-500)}.km-scan-overall{font-size:13px;line-height:1.5;color:var(--p-text-color);background:var(--kx-surface-1);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);padding:10px 12px;margin:0}.km-scan-mod{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);padding:10px 12px;display:flex;flex-direction:column;gap:8px}.km-scan-mod-head{display:flex;align-items:center;gap:8px}.km-scan-mod-name{font-size:12px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis}.km-scan-mod-sum{font-size:12px;line-height:1.5;color:var(--p-text-muted-color);margin:0}.km-scan-mod-clean{font-size:12px;margin:0}.km-finding{display:flex;gap:10px;padding:11px 12px;border:1px solid var(--p-content-border-color);border-left-width:3px;border-radius:var(--kx-radius-10);background:var(--p-content-background)}.km-finding-icon{flex-shrink:0;margin-top:1px}.km-sev-info{border-left-color:var(--p-info-500);background:var(--kx-wash-info)}.km-sev-info .km-finding-icon{color:var(--p-info-700)}.km-sev-warn{border-left-color:var(--p-warn-500);background:var(--kx-wash-warn)}.km-sev-warn .km-finding-icon{color:var(--p-warn-700)}.km-sev-danger{border-left-color:var(--p-danger-500);background:var(--kx-wash-danger)}.km-sev-danger .km-finding-icon{color:var(--p-danger-700)}.km-finding-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.km-finding-title{font-size:13px;font-weight:600;color:var(--p-text-color)}.km-finding-detail{font-size:12px;line-height:1.5;color:var(--p-text-muted-color);margin-top:3px}.km-finding-loc{font-size:11px;color:var(--kx-text-faint);margin-top:3px}.km-ack{display:inline-flex;align-items:center;gap:4px;margin-top:8px;padding:3px 9px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-tag);background:var(--p-content-background);color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:600;cursor:pointer}.km-ack:hover{color:var(--p-text-color);border-color:var(--kx-border-strong)}.km-ack.done{color:var(--p-success-700);border-color:color-mix(in srgb,var(--p-success-500) 45%,var(--p-content-border-color));background:var(--kx-wash-success)}.km-review-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}@media(max-width:640px){.km-review-grid{grid-template-columns:repeat(2,1fr)}}.km-review-tile{display:flex;flex-direction:column;align-items:center;gap:2px;padding:12px 8px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);text-align:center}.km-review-tile b{font-size:18px;font-weight:700;color:var(--p-text-color)}.km-review-tile span{font-size:11px;color:var(--p-text-muted-color)}.km-mig-list{display:flex;flex-direction:column;gap:4px;margin-top:8px;max-height:160px;overflow:auto}.km-mig-row{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--p-text-muted-color)}.km-adv{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1)}.km-adv>summary{padding:10px 12px;font-size:12px;font-weight:600;color:var(--p-text-muted-color);cursor:pointer;user-select:none}.km-adv[open]>summary{border-bottom:1px solid var(--p-content-border-color);color:var(--p-text-color)}.km-adv-body{padding:10px 12px;display:flex;flex-direction:column;gap:6px}.km-ledger{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);padding:10px 12px;display:flex;flex-direction:column;gap:7px}.km-ledger-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;padding:6px 0;border-top:1px solid var(--p-content-border-color)}.km-ledger-row:first-of-type{border-top:0}.km-ledger-step{width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font-size:10px;font-weight:700;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color)}.km-ledger-ok .km-ledger-step{background:var(--kx-wash-success);color:var(--p-success-700)}.km-ledger-warn .km-ledger-step{background:var(--kx-wash-warn);color:var(--p-warn-700)}.km-ledger-bad .km-ledger-step{background:var(--kx-wash-danger);color:var(--p-danger-700)}.km-ledger-msg{flex-basis:100%;margin-left:26px;color:var(--p-text-muted-color)}.km-2p-foot{align-items:center}.km-2p-progress{flex:1}.km-foot-note{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--p-warn-700)}@media(max-width:620px){.km-dialog-2p{height:92vh}.km-2p{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.km-2p-nav{flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--p-content-border-color);padding:8px}.km-2p-navitem{flex-direction:column;gap:3px;padding:6px 8px;font-size:11px}.km-2p-navlabel{max-width:68px;text-align:center}.km-ov-meta{grid-template-columns:1fr}.km-2p-foot>.km-foot-note{flex:1 0 100%}.km-2p-foot>.km-grow{display:none}.km-2p-foot>.km-btn{flex:1 1 auto}.km-mrow{padding:8px 10px}.km-mrow>.km-grow{display:none}.km-mrow>.km-dim{min-width:0;overflow-wrap:anywhere}}.obm{display:flex;flex-direction:column;gap:20px;color:var(--p-text-color)}.obm-prompt{display:flex;flex-direction:column;gap:7px}.obm-prompt label{font:700 13px/1.2 var(--kx-font-heading)}.obm-prompt>span{color:var(--kx-text-faint);font-size:12px}.obm-search{display:flex;align-items:center;gap:9px;padding:7px 8px 7px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1)}.obm-search>svg{flex:none;color:var(--p-primary-color);font-size:19px}.obm-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--p-text-color);font:inherit}.obm-search button,.obm-package-row>button,.obm-continue{border:0;border-radius:var(--kx-radius-8);background:var(--p-primary-color);color:var(--p-primary-contrast-color);padding:8px 12px;font:700 12px/1 var(--kx-font-body);cursor:pointer}.obm-search button{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.obm-search button:disabled{opacity:.45;cursor:not-allowed}.obm-error,.obm-note,.obm-success{display:flex;align-items:center;gap:9px;padding:10px 12px;border-radius:var(--kx-radius-8);font-size:12px}.obm-error{color:var(--p-danger-700);background:var(--kx-wash-danger)}.obm-error span,.obm-note span,.obm-success span{flex:1}.obm-error button{border:0;background:transparent;color:inherit;text-decoration:underline;cursor:pointer}.obm-note{color:var(--p-text-muted-color);background:var(--kx-surface-2)}.obm-success{color:var(--p-success-700);background:var(--kx-wash-success)}.obm-profiles{display:flex;flex-direction:column;gap:18px}.obm-profile-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.obm-profile-head h2,.obm-manual-head h2{margin:0;color:var(--p-text-color);font:700 15px/1.25 var(--kx-font-heading)}.obm-profile-head p{margin:4px 0 0;color:var(--kx-text-faint);font-size:12px;line-height:1.45}.obm-profile-head>span,.obm-manual-head>span{flex:none;border-radius:var(--kx-radius-6);background:var(--kx-wash-primary);color:var(--p-primary-color);padding:5px 7px;font:700 10px/1 var(--kx-font-body)}.obm-menu-section{display:flex;flex-direction:column;gap:8px}.obm-menu-label{display:flex;align-items:baseline;gap:8px;padding:0 2px}.obm-menu-label>span{color:var(--p-text-color);font:700 12px/1.2 var(--kx-font-heading)}.obm-menu-label>small{color:var(--kx-text-fainter);font-size:10.5px}.obm-profile-grid{display:flex;flex-direction:column;gap:7px;margin:0;padding:0;list-style:none}.obm-profile-grid>li{min-width:0}.obm-profile-card{appearance:none;width:100%;min-width:0;min-height:76px;display:flex;flex-direction:row;align-items:center;gap:12px;padding:11px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);color:var(--p-text-color);font:inherit;text-align:left;cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s,transform .15s}.obm-profile-card:not(:disabled):hover{border-color:var(--kx-border-strong);background:var(--kx-surface-2);transform:translateY(-1px)}.obm-profile-card:disabled{cursor:not-allowed;background:var(--kx-surface-2)}.obm-profile-card:disabled .obm-profile-title{color:var(--kx-text-faint)}.obm-profile-card.selected{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 6%,var(--kx-surface-1));box-shadow:0 0 0 1px var(--p-primary-color)}.obm-profile-card.required{min-height:72px;cursor:default;background:var(--kx-surface-2)}.obm-profile-card.required:hover{transform:none}.obm-profile-card.custom{min-height:68px;background:var(--kx-surface-2)}.obm-profile-icon{flex:0 0 34px;width:34px;height:34px;display:grid;place-items:center;border-radius:var(--kx-radius-8);background:var(--kx-wash-primary);color:var(--p-primary-color);font-size:18px}.obm-profile-copy{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px}.obm-profile-title{color:var(--p-text-color);font:700 13px/1.2 var(--kx-font-heading)}.obm-profile-description{color:var(--kx-text-faint);font-size:11.5px;line-height:1.5}.obm-profile-packages{display:inline-flex;align-items:center;gap:4px;overflow:hidden;color:var(--kx-text-fainter);font:600 10px/1.35 var(--kx-font-body);text-overflow:ellipsis;white-space:nowrap}.obm-profile-packages>svg{flex:none;font-size:12px}.obm-profile-state{flex:0 0 auto;min-width:62px;min-height:24px;display:inline-flex;align-items:center;justify-content:flex-end;gap:4px;color:var(--kx-text-fainter);font:700 10px/1 var(--kx-font-body)}.obm-profile-state>svg{font-size:17px}.obm-profile-state.is-included{border-radius:var(--kx-radius-6);background:var(--kx-wash-primary);color:var(--p-primary-color);padding:5px 7px}.obm-profile-card[aria-pressed=true] .obm-profile-state{color:var(--p-primary-color)}.obm-profile-warning{color:var(--p-danger-700);font-size:10px;line-height:1.35}.obm-custom-section{padding-top:10px;border-top:1px solid var(--p-content-border-color)}.obm-custom-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.obm-custom-grid>li{display:flex}.obm-custom-grid .obm-profile-card{height:100%}.obm-continue:disabled{opacity:.45;cursor:not-allowed}.obm-custom-head{display:flex;align-items:center;gap:10px;padding-bottom:2px}.obm-custom-head>button{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1);color:var(--p-text-muted-color);padding:7px 9px;cursor:pointer}.obm-custom-head h2{flex:1;margin:0;font:700 15px/1.2 var(--kx-font-heading)}.obm-custom-head>span{color:var(--kx-text-fainter);font-size:11px}.obm-manual-head{display:flex;align-items:center;justify-content:space-between;padding-top:2px}.obm-browse-search{display:flex;align-items:center;gap:8px;min-height:38px;padding:7px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1)}.obm-browse-search>svg{flex:none;color:var(--kx-text-faint);font-size:17px}.obm-browse-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--p-text-color);font:inherit}.obm-browse-search input::placeholder{color:var(--kx-text-fainter)}.obm-browse-search button{display:grid;place-items:center;width:24px;height:24px;border:0;border-radius:var(--kx-radius-6);background:transparent;color:var(--kx-text-faint);cursor:pointer}.obm-browse-search button:hover{background:var(--kx-surface-3);color:var(--p-text-color)}.obm-recommendation-result{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:var(--kx-radius-8);background:var(--kx-surface-2);color:var(--p-text-muted-color);font-size:12px}.obm-recommendation-result>span{flex:1}.obm-recommendation-result.is-success{color:var(--p-success-700);background:var(--kx-wash-success)}.obm-recommendation-result.is-warning{color:var(--p-warn-700);background:var(--kx-wash-warn)}.obm-recommendation-result button{flex:none;border:0;background:transparent;color:inherit;font:700 11px/1 var(--kx-font-body);text-decoration:underline;cursor:pointer}.obm-selection{display:flex;flex-direction:column;gap:11px;padding:14px;border:1px solid color-mix(in srgb,var(--p-primary-color) 45%,var(--p-content-border-color));border-radius:var(--kx-radius-10);background:color-mix(in srgb,var(--p-primary-color) 4%,var(--kx-surface-1))}.obm-selection-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.obm-selection-head>div{display:flex;align-items:baseline;gap:8px;min-width:0}.obm-selection-head h2{margin:0;color:var(--p-text-color);font:700 13px/1.2 var(--kx-font-heading)}.obm-selection-head span{color:var(--kx-text-faint);font-size:11px}.obm-selection-head>svg{flex:none;color:var(--p-primary-color);font-size:20px}.obm-selection-items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:0;padding:0;list-style:none}.obm-selection-items>li{min-width:0;display:grid;grid-template-columns:16px minmax(0,1fr);align-items:center;gap:7px;padding:7px 8px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1)}.obm-selection-items>li>svg{color:var(--kx-text-fainter);font-size:15px}.obm-selection-items>li>span{min-width:0;display:flex;flex-direction:column;gap:1px}.obm-selection-items strong,.obm-selection-items small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.obm-selection-items strong{color:var(--p-text-color);font-size:11px}.obm-selection-items small{color:var(--kx-text-fainter);font:9.5px/1.3 ui-monospace,monospace}.obm-selection-action{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:1px}.obm-selection-action>span{color:var(--kx-text-fainter);font-size:10.5px}.obm-queue{display:flex;flex-direction:column;gap:10px;padding:14px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-2)}.obm-queue-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.obm-queue-head>div{display:flex;align-items:baseline;gap:8px;min-width:0}.obm-queue-head h2{margin:0;color:var(--p-text-color);font:700 13px/1.2 var(--kx-font-heading)}.obm-queue-head span{color:var(--kx-text-faint);font-size:11px}.obm-queue-head>strong{color:var(--p-primary-color);font:800 13px/1 var(--kx-font-heading)}.obm-queue-progress{width:100%;height:7px;overflow:hidden;border-radius:var(--kx-radius-6);background:var(--kx-surface-4)}.obm-queue-progress>span{display:block;height:100%;border-radius:var(--kx-radius-6);background:var(--p-primary-color);transition:width .2s ease}.obm-queue-items{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}.obm-queue-items>li{display:grid;grid-template-columns:20px minmax(0,1fr) auto;align-items:center;gap:9px;padding:9px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-surface-1);color:var(--p-text-muted-color)}.obm-queue-items>li>svg{color:var(--kx-text-fainter);font-size:18px}.obm-queue-items>li>span{min-width:0;display:flex;flex-direction:column;gap:2px}.obm-queue-items strong{overflow:hidden;color:var(--p-text-color);font-size:12px;text-overflow:ellipsis;white-space:nowrap}.obm-queue-items small{overflow:hidden;color:var(--kx-text-fainter);font:10px/1.3 var(--p-font-mono-family, ui-monospace, monospace);text-overflow:ellipsis;white-space:nowrap}.obm-queue-items em{color:var(--kx-text-fainter);font-size:10px;font-style:normal;text-transform:capitalize}.obm-queue-items>li.is-installed>svg,.obm-queue-items>li.is-installed em{color:var(--p-success-700)}.obm-queue-items>li.is-installing{border-color:var(--p-primary-color)}.obm-queue-items>li.is-installing>svg,.obm-queue-items>li.is-installing em{color:var(--p-primary-color)}.obm-queue-items>li.is-failed>svg,.obm-queue-items>li.is-failed em,.obm-queue-items .obm-queue-error{color:var(--p-danger-700)}.obm-queue-retry{align-self:flex-end;display:inline-flex;align-items:center;gap:6px;border:0;border-radius:var(--kx-radius-8);background:var(--p-primary-color);color:var(--p-primary-contrast-color);padding:8px 12px;font:700 12px/1 var(--kx-font-body);cursor:pointer}.obm-loading,.obm-empty{min-height:150px;display:flex;align-items:center;justify-content:center;gap:9px;color:var(--kx-text-faint);font-size:13px}.obm-empty{flex-direction:column;text-align:center}.obm-empty>svg{font-size:30px}.obm-empty>span{font-size:11px}.obm-groups{display:flex;flex-direction:column;gap:20px;max-height:420px;overflow-y:auto;padding-right:4px}.obm-group{display:flex;flex-direction:column;gap:9px}.obm-group-head{display:flex;align-items:center;gap:7px;color:var(--p-text-muted-color)}.obm-group-head>svg{color:var(--p-primary-color)}.obm-group-head h2{margin:0;flex:1;font:700 13px/1.2 var(--kx-font-heading);color:var(--p-text-color)}.obm-group-head>span{font-size:11px;color:var(--kx-text-fainter)}.obm-package-list{display:flex;flex-direction:column;gap:7px;margin:0;padding:0;list-style:none}.obm-package-row{position:relative;display:grid;grid-template-columns:35px minmax(0,1fr) auto;align-items:center;gap:10px;padding:11px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);overflow:hidden}.obm-package-row:before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:var(--module-accent)}.obm-package-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:var(--kx-radius-8);background:var(--kx-surface-2);color:var(--module-accent);font-size:18px}.obm-package-body{min-width:0}.obm-package-title{display:flex;align-items:center;gap:6px;min-width:0}.obm-package-title strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.obm-private{border-radius:999px;background:var(--kx-surface-3);color:var(--kx-text-faint);padding:2px 5px;font-size:9px;text-transform:uppercase}.obm-package-body code{display:block;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--kx-text-fainter);font-size:10px}.obm-package-body p{margin:5px 0 0;color:var(--kx-text-faint);font-size:11.5px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.obm-package-row>button{display:inline-flex;align-items:center;gap:5px;padding:7px 9px;white-space:nowrap}.obm-package-row>button.selected{background:var(--p-primary-color)}.obm-package-row>button:disabled{opacity:.45;cursor:not-allowed}.obm-admin-only{color:var(--kx-text-fainter);font-size:10px;font-weight:700;text-transform:uppercase}.obm-foot{display:grid;grid-template-columns:auto 1fr auto;align-items:center;padding-top:4px}.obm-back{border:0;background:transparent;color:var(--kx-text-faint);font:600 13px/1 var(--kx-font-body);cursor:pointer}@media(max-width:700px){.obm-package-row{grid-template-columns:35px minmax(0,1fr)}.obm-package-row>button{grid-column:2;justify-self:start}.obm-search{align-items:stretch;flex-wrap:wrap}.obm-search input{min-width:70%}.obm-profile-head{flex-direction:column;gap:5px}.obm-custom-grid,.obm-selection-items{grid-template-columns:1fr}.obm-selection-head>div,.obm-queue-head>div{align-items:flex-start;flex-direction:column;gap:2px}.obm-selection-action{align-items:stretch;flex-direction:column}.obm-selection-action .obm-queue-retry{align-self:stretch;justify-content:center}}.km-btn:focus-visible,.feat-card:focus-visible,.mod-card:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.km-dialog:modal{margin:auto;padding:0;display:flex;flex-direction:column;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);box-shadow:var(--p-dialog-shadow)}.km-dialog::backdrop{background:var(--p-mask-background)}.km-ai-proposal{margin-top:12px;padding:12px;border:1px solid var(--p-primary-color);border-radius:var(--kx-radius-8);background:color-mix(in srgb,var(--p-primary-color) 6%,var(--p-content-background))}.km-ai-proposal p{margin:8px 0;color:var(--p-text-muted-color)}`;
export {
  Qa as $,
  Ja as A,
  P as B,
  io as C,
  Fa as D,
  Ai as E,
  ni as F,
  Oi as G,
  Li as H,
  Xa as I,
  Ba as J,
  D as K,
  Za as L,
  qa as M,
  Ne as N,
  vi as O,
  hi as P,
  bi as Q,
  ai as R,
  Ha as S,
  vt as T,
  ro as U,
  xi as V,
  Ge as W,
  La as X,
  ti as Y,
  yi as Z,
  so as _,
  sr as a,
  ki as a0,
  Da as a1,
  Ei as a2,
  ui as a3,
  di as a4,
  zi as a5,
  mi as a6,
  Ti as a7,
  _i as a8,
  Si as a9,
  Ci as aa,
  ji as ab,
  $i as ac,
  Ni as ad,
  Ea as ae,
  li as af,
  pi as ag,
  ci as ah,
  Ma as ai,
  Ri as aj,
  ii as ak,
  Va as al,
  T as b,
  x as c,
  Ya as d,
  Wa as e,
  Ua as f,
  wr as g,
  eo as h,
  cr as i,
  ei as j,
  bt as k,
  qe as l,
  Wn as m,
  ur as n,
  Ka as o,
  Ye as p,
  fi as q,
  ri as r,
  oi as s,
  wi as t,
  Pr as u,
  Ga as v,
  gi as w,
  si as x,
  Pi as y,
  dr as z
};
//# sourceMappingURL=styles-DQ3QkZVh.js.map

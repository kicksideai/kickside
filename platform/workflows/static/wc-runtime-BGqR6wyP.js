import { ref as E, createApp as pt, inject as M, onMounted as dt, onUnmounted as ft, watch as mt, renderSlot as U, createCommentVNode as yt, h as _t, Teleport as bt } from "vue";
import { addCollection as vt } from "@iconify/vue";
import { config as D, addIcons as gt, on as Ct, applyThemeMode as P, host as wt, hostCss as St, loadCss as Et } from "@wippy-fe/proxy";
import { getActivePinia as Pt, createPinia as Lt, setActivePinia as Tt } from "pinia";
import At from "primevue/config";
import Vt from "primevue/contextmenu";
import Rt from "primevue/menu";
import Ot from "primevue/portal";
var x = "data-wippy-visible";
function B(t) {
  const e = t.getAttribute(x);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var kt = Object.defineProperty, it = (t) => {
  throw TypeError(t);
}, xt = (t, e, i) => e in t ? kt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, h = (t, e, i) => xt(t, typeof e != "symbol" ? e + "" : e, i), st = (t, e, i) => e.has(t) || it("Cannot " + i), It = (t, e, i) => (st(t, e, "read from private field"), i ? i.call(t) : e.get(t)), zt = (t, e, i) => e.has(t) ? it("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), Nt = (t, e, i, s) => (st(t, e, "write to private field"), e.set(t, i), i), Mt = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Ht = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function F(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function $t(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const i of t)
    if (i)
      for (const [s, n] of Object.entries(i)) {
        if ((s === "@light" || s === "@dark") && n && typeof n == "object") {
          for (const [a, r] of Object.entries(n)) {
            const c = typeof r == "string" ? F(a) : null;
            c && e.add(c);
          }
          continue;
        }
        const o = typeof n == "string" ? F(s) : null;
        o && e.add(o);
      }
  return [...e].sort();
}
function Wt(t) {
  if (t.length === 0)
    return "";
  const e = t.map((i) => `  ${i}: inherit;`).join(`
`);
  return `${Ht} {
${e}
}`;
}
function Ut(t, e) {
  const i = Wt(e);
  i && nt(t, i, "@wippy-fe/css-variables-bridge");
}
function Dt(t, e) {
  const s = (e ?? Mt).map(async (n) => {
    const o = St[n];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Et(o);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${o}):`, a), null;
    }
  });
  return Promise.all(s).then((n) => {
    for (const o of n) {
      if (!o)
        continue;
      const a = document.createElement("style");
      a.textContent = o, a.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(a);
    }
  });
}
function Bt(t, e) {
  const i = document.createElement("style");
  i.textContent = e, t.appendChild(i);
}
function nt(t, e, i) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, n];
    return;
  }
  const s = document.createElement("style");
  s.setAttribute("role", i), s.textContent = e, t.appendChild(s);
}
function Ft(t, e) {
  nt(t, e, "@wippy-fe/custom-css");
}
function rt(t) {
  return t.__wippyHost ?? null;
}
function jt(t) {
  return t.replace(/-([a-z])/g, (e, i) => i.toUpperCase());
}
function Kt(t, e, i) {
  switch (i.type) {
    case "string":
      return { value: e };
    case "number": {
      const s = Number.parseFloat(e);
      return Number.isNaN(s) ? { value: void 0, error: `Invalid ${t}: expected a number` } : { value: s };
    }
    case "integer": {
      const s = Number.parseInt(e, 10);
      return Number.isNaN(s) ? { value: void 0, error: `Invalid ${t}: expected an integer` } : { value: s };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const s = JSON.parse(e);
        return i.type === "array" && !Array.isArray(s) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: s };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function k(t, e) {
  const i = {}, s = [];
  for (const [n, o] of Object.entries(e.properties)) {
    const a = t.getAttribute(n), r = jt(n);
    if (a === null) {
      o.default !== void 0 && (i[r] = o.default);
      continue;
    }
    const c = Kt(n, a, o);
    c.error ? s.push(c.error) : i[r] = c.value;
  }
  return { props: i, errors: s };
}
var Yt = class {
  constructor(t, e) {
    h(this, "_props"), h(this, "_errors"), h(this, "_content"), h(this, "_hostVisibility"), h(this, "_propsListeners", /* @__PURE__ */ new Set()), h(this, "_contentListeners", /* @__PURE__ */ new Set()), h(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), h(this, "_disposed", !1), h(this, "_emitToDom"), h(this, "props"), h(this, "events"), h(this, "content"), h(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const i = this;
    this.props = {
      get value() {
        return i._props;
      },
      get errors() {
        return i._errors;
      },
      subscribe(s, n) {
        return i._subscribeProps(s, n);
      }
    }, this.events = {
      emit(s, n) {
        i._disposed || i._emitToDom(s, n);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return i._content;
      },
      subscribe(s, n) {
        return i._subscribeContent(s, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return i._hostVisibility;
      },
      subscribe(s, n) {
        return i._subscribeHostVisibility(s, n);
      }
    };
  }
  /** @internal */
  notifyProps(t, e) {
    if (!this._disposed) {
      this._props = t, this._errors = e;
      for (const i of this._propsListeners)
        i(t, e);
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
      for (const i of this._hostVisibilityListeners)
        i(t, e);
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
    const i = () => {
      this._propsListeners.delete(t), e?.signal?.removeEventListener("abort", i);
    };
    return e?.signal?.addEventListener("abort", i, { once: !0 }), i;
  }
  _subscribeContent(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), e?.immediate && t(this._content);
    const i = () => {
      this._contentListeners.delete(t), e?.signal?.removeEventListener("abort", i);
    };
    return e?.signal?.addEventListener("abort", i, { once: !0 }), i;
  }
  _subscribeHostVisibility(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), e?.immediate && t(this._hostVisibility, this._hostVisibility);
    const i = () => {
      this._hostVisibilityListeners.delete(t), e?.signal?.removeEventListener("abort", i);
    };
    return e?.signal?.addEventListener("abort", i, { once: !0 }), i;
  }
}, A, qt = class extends HTMLElement {
  constructor() {
    super(), h(this, "_internals"), h(this, "_contentObserver", null), h(this, "_initialized", !1), h(this, "_container", null), zt(this, A, null), h(this, "_attachment", 0), h(this, "_reactive", null), h(this, "_lastProps", null), h(this, "_lastErrors", []), h(this, "_lastContent", null), h(this, "_themeUnsub", null), h(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = B(this);
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
    const t = this.wippyConfig, e = Object.keys(t.propsSchema.properties), i = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...i, x])];
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
    return rt(this);
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
      let i, s;
      if (this._lastProps !== null)
        i = this._lastProps, s = this._lastErrors;
      else {
        const o = k(this, t.propsSchema);
        t.validateProps && o.errors.push(...t.validateProps(o.props)), i = o.props, s = o.errors, this._lastProps = i, this._lastErrors = s;
      }
      const n = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = n), this._reactive = new Yt(
        { props: i, errors: s, content: n, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    const t = ++this._attachment;
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, i = this._initialized, s = It(this, A) ?? Nt(this, A, this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" }));
      let n;
      if (this._container)
        n = this._container;
      else {
        if (this.onInit(s), t !== this._attachment)
          return;
        e.inlineCss && Bt(s, e.inlineCss);
        try {
          const m = D?.theming, l = $t(
            m?.global?.cssVariables,
            m?.children?.cssVariables
          );
          Ut(s, l);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const m = D?.theming, l = [m?.global?.customCSS, m?.children?.customCSS].filter(Boolean).join(`
`);
            l && Ft(s, l);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Dt(s, e.hostCssKeys), n = document.createElement("div"), n.setAttribute("data-wippy-theme-root", "");
        const p = e.containerClasses ?? [];
        p.length > 0 && n.classList.add(...p), s.appendChild(n), this._container = n, gt(vt);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Ct("@theme", (p) => this._applyTheme(p)));
      const { props: o, errors: a } = k(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(o));
      const r = o;
      this._lastProps = r, this._lastErrors = a;
      let c = null;
      if (e.contentTemplate && (c = this._extractContent(e.contentTemplate), this._lastContent = c, this._contentObserver = new MutationObserver(() => {
        const p = this._extractContent(e.contentTemplate);
        this._lastContent = p, this._reactive?.notifyContent(p), this.onContentChanged(p);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, n, r, a, c, i), t !== this._attachment)
        return;
      this._internals.states.delete("loading"), this._internals.states.add("ready"), i || (this._initialized = !0), this.onReady(), t === this._attachment && this.emitEvent("load");
    } catch (e) {
      if (t !== this._attachment || (this.onError(e), t !== this._attachment))
        return;
      this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
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
  _applyTheme(t = wt.getThemeMode?.()) {
    P(t, this), this._container && P(t, this._container);
  }
  disconnectedCallback() {
    const t = ++this._attachment;
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), P("auto", this), this._container && P("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), t === this._attachment && (this.emitEvent("unload"), t === this._attachment && (this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus));
  }
  attributeChangedCallback(t, e, i) {
    if (e === i)
      return;
    if (t === x) {
      const r = this._hostVisible, c = B(this);
      if (c === r)
        return;
      this._hostVisible = c, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(c, r), this.onHostVisibilityChanged(c, r));
      return;
    }
    const s = this.constructor.wippyConfig, { props: n, errors: o } = k(this, s.propsSchema);
    s.validateProps && o.push(...s.validateProps(n));
    const a = n;
    this._lastProps = a, this._lastErrors = o, this._reactive?.notifyProps(a, o), this.onPropsChanged(a, o);
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
   *
   * A template keeps its children in one of two places. Parsed HTML (page
   * markup, `innerHTML`) puts them in `template.content`, a DocumentFragment.
   * DOM APIs add them as the template element's own child nodes and leave
   * `template.content` empty: that is how a Vue SFC sets
   * `<template data-type="...">{{ text }}</template>`. The content fragment is
   * read first, then the element's own children. Only text is returned, never
   * markup, in both cases.
   */
  _extractContent(t) {
    const e = this.querySelector(`template[data-type="${t}"]`);
    return e ? e.content.textContent?.trim() || e.textContent?.trim() || "" : null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(t) {
  }
};
A = /* @__PURE__ */ new WeakMap();
function Jt(t) {
  return t.__wippyHostBus ?? null;
}
function Gt(t) {
  return t.dataset.wippyPanelId ?? null;
}
var Qt = Object.defineProperty, Xt = (t, e, i) => e in t ? Qt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, _ = (t, e, i) => Xt(t, typeof e != "symbol" ? e + "" : e, i);
function Le(t, e) {
  return { lazyConfig: t, mountLifecycle: !0, lazyUi: e };
}
function j(t, e, i) {
  const s = t.createElement("div"), n = i ? e.failed : e.loading;
  s.dataset.lazyState = i ? "failed" : "loading", s.setAttribute("role", i ? "alert" : "status"), s.setAttribute("aria-label", n), s.style.cssText = "display:grid;place-items:center;text-align:center;";
  const o = e.surface === "page";
  if (s.style.cssText += o ? "block-size:100%;min-block-size:0;" : "min-block-size:2rem;font-size:.875rem;", i)
    s.style.color = "var(--p-danger-500, currentColor)", s.textContent = !o && e.iconOnly ? "⚠" : n, !o && e.iconOnly && (s.title = n);
  else {
    const a = t.createElement("style");
    a.textContent = '@media (prefers-reduced-motion: no-preference) { [data-lazy-state="loading"] > [data-wippy-spinner] { animation: wippy-lazy-spin 1s linear infinite; } } @keyframes wippy-lazy-spin { to { transform: rotate(1turn); } }';
    const r = t.createElement("span");
    r.dataset.wippySpinner = "", r.setAttribute("aria-hidden", "true"), r.style.cssText = "display:block;box-sizing:border-box;inline-size:1em;block-size:1em;border:2px solid var(--p-surface-300, currentColor);border-top-color:var(--p-primary-color, currentColor);border-radius:50%;", r.style.fontSize = o ? "2rem" : "1em", s.append(a, r);
  }
  return s;
}
var ot = /* @__PURE__ */ Symbol("wippy:emit"), at = /* @__PURE__ */ Symbol("wippy:props"), Zt = /* @__PURE__ */ Symbol("wippy:props_error"), te = /* @__PURE__ */ Symbol("wippy:content"), ee = /* @__PURE__ */ Symbol("wippy:panel-id"), ie = /* @__PURE__ */ Symbol("wippy:layout-bus"), se = /* @__PURE__ */ Symbol("wippy:host"), lt = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Te() {
  const t = M(at);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function Ae() {
  const t = M(ot);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
function ne() {
  const t = M(lt);
  if (!t)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return t;
}
function Ve(t) {
  const e = ne();
  let i = !1, s = null, n = !1;
  function o() {
    if (s)
      return n = !0, s;
    let a;
    try {
      a = Promise.resolve(t());
    } catch (c) {
      a = Promise.reject(c);
    }
    const r = a.finally(() => {
      if (s === r && (s = null, i && n))
        return n = !1, o();
    });
    return s = r, r;
  }
  return dt(() => (i = !0, o())), ft(() => {
    i = !1, n = !1;
  }), mt(e, (a, r) => {
    if (i && r === !1 && a === !0)
      return o();
  }), e;
}
var L = /* @__PURE__ */ new WeakMap();
function K(t, e) {
  const i = L.get(t);
  if (i)
    return i;
  const s = Promise.resolve().then(e);
  return L.set(t, s), s.catch(() => {
    L.get(t) === s && L.delete(t);
  }), s;
}
var Re = class extends qt {
  constructor() {
    super(...arguments), _(this, "_vueApp", null), _(this, "_mountingApp", !1), _(this, "_mountState", "idle"), _(this, "_feedback", null), _(this, "_propsRef", E({})), _(this, "_errorsRef", E([])), _(this, "_contentRef", E(null)), _(this, "_hostVisibilityRef", E(null)), _(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  /** Prepare the implementation without creating a Vue or Pinia instance. */
  static async preloadImplementation() {
    const t = this.vueConfig;
    t.mountLifecycle && !t.rootComponent && t.lazyConfig && await K(this, t.lazyConfig);
  }
  /** Undefined on configurations that use only the legacy load event. */
  get wippyMountState() {
    return this.constructor.vueConfig.mountLifecycle ? this._mountState : void 0;
  }
  onMount(t, e, i, s, n, o) {
    const a = this.constructor, r = a.vueConfig, c = new AbortController();
    this._bridgeAbort = c;
    const p = () => !c.signal.aborted && this._bridgeAbort === c;
    this._mountState = "mounting", this._propsRef.value = i, this._errorsRef.value = s, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const l of s)
      if (this.emitEvent("invalid", { message: l }), !p())
        return;
    this.reactive.props.subscribe((l, d) => {
      this._propsRef.value = l, this._errorsRef.value = [...d];
      for (const u of d)
        this.emitEvent("invalid", { message: u });
    }, { signal: c.signal }), this.reactive.content && this.reactive.content.subscribe((l) => {
      this._contentRef.value = l;
    }, { signal: c.signal }), this.reactive.hostVisibility.subscribe((l) => {
      this._hostVisibilityRef.value = l;
    }, { signal: c.signal });
    const m = (l) => {
      if (!p())
        return;
      const d = Pt(), u = pt(l.rootComponent);
      let v = !1, b = !1, g, C;
      this._mountingApp = !0;
      try {
        const w = Lt();
        if (l.piniaPlugins)
          for (const y of l.piniaPlugins)
            w.use(y);
        u.use(w);
        for (const y of l.plugins ?? [])
          u.use(y);
        if (u.provide(at, this._propsRef), u.provide(Zt, this._errorsRef), u.provide(ot, this.emitEvent.bind(this)), u.provide(te, this._contentRef), u.provide(lt, this._hostVisibilityRef), u.provide(ee, Gt(this)), u.provide(ie, Jt(this)), u.provide(se, rt(this)), l.providers?.(u, this), !p())
          return;
        if (C = u.config.errorHandler, r.mountLifecycle && (u.config.errorHandler = (y, W, f) => {
          b || (g = y), b = !0, C?.(y, W, f);
        }), u.mount(e), v = !0, b)
          throw g;
        p() && (this._vueApp = u);
      } finally {
        r.mountLifecycle && v && (u.config.errorHandler = C);
        try {
          v && (b || !p()) && u.unmount();
        } finally {
          Tt(d), this._mountingApp = !1;
        }
      }
      r.mountLifecycle && queueMicrotask(() => {
        p() && this.isConnected && (this._mountState = "mounted", this.dispatchEvent(new Event("wippy-mounted")));
      });
    };
    if (r.rootComponent) {
      if (this._mountingApp && r.mountLifecycle) {
        queueMicrotask(() => {
          try {
            m(r);
          } catch (l) {
            p() && (this._mountState = "failed", this.emitEvent("error", { message: l instanceof Error ? l.message : String(l), error: l }));
          }
        });
        return;
      }
      try {
        m(r);
      } catch (l) {
        if (p())
          throw this._mountState = "failed", l;
      }
    } else if (r.lazyConfig) {
      const l = e.ownerDocument, d = r.lazyUi;
      d?.surface === "page" && (e.style.blockSize = "100%", e.style.minBlockSize = "0");
      let u = !1, v, b;
      const g = () => {
        clearTimeout(v), clearTimeout(b), this._feedback?.remove(), this._feedback = null;
      };
      c.signal.addEventListener("abort", g, { once: !0 });
      const C = () => {
        if (!p() || u)
          return;
        const f = d ? j(l, d, !1) : l.createElement("wippy-loading");
        f.setAttribute("no-bg", ""), this._feedback = f, e.appendChild(f);
      }, w = (f) => {
        if (!p())
          return;
        u = !0, g(), this._mountState = "failed";
        const O = d?.failed ?? (f instanceof Error ? f.message : String(f)), S = d ? j(l, d, !0) : l.createElement("wippy-error");
        d || (S.setAttribute("title", "Failed to load"), S.setAttribute("message", O)), this._feedback = S, e.appendChild(S), this.emitEvent("error", d ? { message: O, error: f } : { message: O });
      }, y = d?.delay ?? (d?.surface === "compact" ? 200 : 0);
      y > 0 ? v = setTimeout(C, y) : C(), d && (b = setTimeout(() => w(new Error("The component did not load in time.")), d.timeout ?? 3e4)), (r.mountLifecycle ? K(a, r.lazyConfig) : r.lazyConfig()).then((f) => {
        !p() || u || (u = !0, g(), m(f));
      }, (f) => {
        u || w(f);
      }).catch(w);
    } else
      throw this._mountState = "failed", new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._mountState = "idle", this._feedback?.remove(), this._feedback = null;
    const t = this._vueApp;
    this._vueApp = null, t?.unmount();
  }
};
const re = "data-wippy-overlay-layer";
function ct() {
  return typeof window < "u" && typeof window.document < "u";
}
function ut() {
  return ct() && typeof HTMLElement < "u" && "popover" in HTMLElement.prototype;
}
function oe() {
  return ut() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const ae = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let le = 0;
const V = /* @__PURE__ */ new WeakMap();
function Y(t, e) {
  const i = t.style;
  i.setProperty("position", "fixed", "important"), i.setProperty("inset", "auto", "important"), i.setProperty("margin", "0", "important"), i.setProperty("position-anchor", e), i.setProperty("position-area", "bottom span-right"), i.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), i.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), i.setProperty("max-width", "stretch", "important");
}
function ce(t, e) {
  if (!ae.test(t.className))
    return;
  const i = t.style.cssText;
  Y(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = i;
    return;
  }
  if (!V.has(t)) {
    const s = new MutationObserver(() => {
      const n = t.style;
      (n.top !== "auto" || n.left !== "auto" || n.margin !== "0px" || n.getPropertyPriority("top") !== "important" || n.getPropertyPriority("left") !== "important" || n.getPropertyPriority("margin") !== "important" || n.getPropertyPriority("min-width") !== "important" || n.maxWidth !== "stretch" || n.getPropertyPriority("max-width") !== "important") && Y(t, e);
    });
    s.observe(t, { attributes: !0, attributeFilter: ["style"] }), V.set(t, s);
  }
}
function H(t) {
  const e = V.get(t);
  e && (e.disconnect(), V.delete(t));
}
function ue(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function I(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const R = /* @__PURE__ */ new Set(), $ = /* @__PURE__ */ new WeakMap();
let q = !1, z = !1;
const J = ["w-theme-dark", "w-theme-light"], T = "data-wippy-theme-root", N = /* @__PURE__ */ new WeakMap();
function he(t) {
  const e = [];
  let i = t ? t.parentNode : null;
  for (; i && i.nodeType === 1; )
    e.push(i), i = i.parentNode;
  return e;
}
function pe(t, e, i) {
  const s = [...he(e), i.host], n = () => {
    let a;
    for (const r of s) {
      if (J.some((c) => r.classList.contains(c))) {
        a = r;
        break;
      }
      if (r.hasAttribute(T))
        break;
    }
    for (const r of J)
      t.classList.toggle(r, !!(a && a.classList.contains(r)));
    a ? t.setAttribute(T, "") : t.removeAttribute(T);
  };
  n();
  const o = new MutationObserver(n);
  for (const a of s)
    o.observe(a, { attributes: !0, attributeFilter: ["class", T] });
  N.set(t, o);
}
function ht(t) {
  N.get(t)?.disconnect(), N.delete(t);
}
function de() {
  z = !1;
  for (const t of R) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && H(e);
      R.delete(t), $.get(t)?.disconnect(), ht(t);
      continue;
    }
    t.childElementCount > 0 && I(t);
  }
}
function G() {
  z || (z = !0, requestAnimationFrame(de));
}
function fe(t) {
  const e = document.createElement("div");
  e.setAttribute(re, "");
  const i = ut();
  if (e.style.cssText = i ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", i && e.setAttribute("popover", "manual"), t.appendChild(e), i) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  I(e);
  const s = new MutationObserver((n) => {
    const o = e.__wippyAnchorName;
    for (const a of n) {
      if (o)
        for (const r of Array.from(a.addedNodes))
          r instanceof HTMLElement && ce(r, o);
      for (const r of Array.from(a.removedNodes))
        r instanceof HTMLElement && H(r);
    }
    e.isConnected && e.childElementCount > 0 && I(e);
  });
  return s.observe(e, { childList: !0 }), $.set(e, s), R.add(e), q || (q = !0, window.addEventListener("scroll", G, { capture: !0, passive: !0 }), window.addEventListener("resize", G, { passive: !0 })), e;
}
function Q(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = fe(t.hostRoot), pe(t.layer, t.$el, t.hostRoot), oe())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++le}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function X(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && H(e);
    R.delete(t.layer), $.get(t.layer)?.disconnect(), ht(t.layer), t.layer.remove(), t.layer = null;
  }
}
let Z = !1;
function me() {
  if (Z)
    return;
  const t = Rt;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const i = e.composedPath(), s = this.container && !i.includes(this.container), n = !(this.target && i.includes(this.target));
      this.overlayVisible && s && n ? this.hide() : !this.popup && s && n && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Z = !0);
}
let tt = !1;
function ye() {
  if (tt)
    return;
  const t = Vt;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const i = e.composedPath(), s = this.container && !i.includes(this.container), n = this.visible ? !(this.target && i.includes(this.target)) : !0;
      s && n && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, tt = !0);
}
let et = !1;
function _e() {
  if (et)
    return;
  et = !0;
  const t = Ot;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    ct() && (this.hostRoot = ue(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Q(this), this.$watch("inline", (e) => {
      e ? X(this) : Q(this);
    })));
  }, t.render = function() {
    return this.inline ? U(this.$slots, "default", { key: 0 }) : this.mounted ? _t(bt, { key: 1, to: this.resolvedTarget || document.body }, [
      U(this.$slots, "default")
    ]) : yt("", !0);
  }, t.unmounted = function() {
    X(this);
  };
}
const Oe = {
  install: (t) => {
    me(), ye(), _e(), t.use(At, { theme: "none" });
  }
};
export {
  Oe as P,
  Re as W,
  Ae as a,
  Ve as b,
  Le as l,
  Te as u
};

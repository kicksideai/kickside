import { hasInjectionContext as er, inject as He, effectScope as tr, ref as F, markRaw as nr, createApp as rr, onMounted as Zt, onUnmounted as or, watch as ce, readonly as ir, getCurrentInstance as pt, nextTick as sr, reactive as ar, renderSlot as Ve, openBlock as lr, createBlock as ur, Teleport as Xt, createCommentVNode as en, useId as dr, mergeProps as Ie, h as cr } from "vue";
import { addCollection as mr } from "@iconify/vue";
import { config as ft, addIcons as pr, on as fr, applyThemeMode as Oe, host as hr, hostCss as gr, loadCss as vr } from "@wippy-fe/proxy";
var Ye = "data-wippy-visible";
function ht(t) {
  const e = t.getAttribute(Ye);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var yr = Object.defineProperty, tn = (t) => {
  throw TypeError(t);
}, br = (t, e, n) => e in t ? yr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, x = (t, e, n) => br(t, typeof e != "symbol" ? e + "" : e, n), nn = (t, e, n) => e.has(t) || tn("Cannot " + n), _r = (t, e, n) => (nn(t, e, "read from private field"), n ? n.call(t) : e.get(t)), Sr = (t, e, n) => e.has(t) ? tn("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), $r = (t, e, n, r) => (nn(t, e, "write to private field"), e.set(t, n), n), wr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Tr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function gt(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function Cr(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const n of t)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [a, l] of Object.entries(o)) {
            const i = typeof l == "string" ? gt(a) : null;
            i && e.add(i);
          }
          continue;
        }
        const s = typeof o == "string" ? gt(r) : null;
        s && e.add(s);
      }
  return [...e].sort();
}
function Pr(t) {
  if (t.length === 0)
    return "";
  const e = t.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Tr} {
${e}
}`;
}
function xr(t, e) {
  const n = Pr(e);
  n && rn(t, n, "@wippy-fe/css-variables-bridge");
}
function Or(t, e) {
  const r = (e ?? wr).map(async (o) => {
    const s = gr[o];
    if (!s)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await vr(s);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${s}):`, a), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const s of o) {
      if (!s)
        continue;
      const a = document.createElement("style");
      a.textContent = s, a.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(a);
    }
  });
}
function kr(t, e) {
  const n = document.createElement("style");
  n.textContent = e, t.appendChild(n);
}
function rn(t, e, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = e, t.appendChild(r);
}
function Er(t, e) {
  rn(t, e, "@wippy-fe/custom-css");
}
function on(t) {
  return t.__wippyHost ?? null;
}
function Lr(t) {
  return t.replace(/-([a-z])/g, (e, n) => n.toUpperCase());
}
function Ar(t, e, n) {
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
function Fe(t, e) {
  const n = {}, r = [];
  for (const [o, s] of Object.entries(e.properties)) {
    const a = t.getAttribute(o), l = Lr(o);
    if (a === null) {
      s.default !== void 0 && (n[l] = s.default);
      continue;
    }
    const i = Ar(o, a, s);
    i.error ? r.push(i.error) : n[l] = i.value;
  }
  return { props: n, errors: r };
}
var jr = class {
  constructor(t, e) {
    x(this, "_props"), x(this, "_errors"), x(this, "_content"), x(this, "_hostVisibility"), x(this, "_propsListeners", /* @__PURE__ */ new Set()), x(this, "_contentListeners", /* @__PURE__ */ new Set()), x(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), x(this, "_disposed", !1), x(this, "_emitToDom"), x(this, "props"), x(this, "events"), x(this, "content"), x(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
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
    }, this.content = t.hasContent ? {
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
}, Re, Nr = class extends HTMLElement {
  constructor() {
    super(), x(this, "_internals"), x(this, "_contentObserver", null), x(this, "_initialized", !1), x(this, "_container", null), Sr(this, Re, null), x(this, "_attachment", 0), x(this, "_reactive", null), x(this, "_lastProps", null), x(this, "_lastErrors", []), x(this, "_lastContent", null), x(this, "_themeUnsub", null), x(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = ht(this);
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
    return [.../* @__PURE__ */ new Set([...e, ...n, Ye])];
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
    return on(this);
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
        const s = Fe(this, t.propsSchema);
        t.validateProps && s.errors.push(...t.validateProps(s.props)), n = s.props, r = s.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = o), this._reactive = new jr(
        { props: n, errors: r, content: o, hasContent: e, hostVisibility: this._hostVisible },
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
      const e = this.constructor.wippyConfig, n = this._initialized, r = _r(this, Re) ?? $r(this, Re, this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" }));
      let o;
      if (this._container)
        o = this._container;
      else {
        if (this.onInit(r), t !== this._attachment)
          return;
        e.inlineCss && kr(r, e.inlineCss);
        try {
          const c = ft?.theming, d = Cr(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          xr(r, d);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = ft?.theming, d = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            d && Er(r, d);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Or(r, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const u = e.containerClasses ?? [];
        u.length > 0 && o.classList.add(...u), r.appendChild(o), this._container = o, pr(mr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = fr("@theme", (u) => this._applyTheme(u)));
      const { props: s, errors: a } = Fe(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(s));
      const l = s;
      this._lastProps = l, this._lastErrors = a;
      let i = null;
      if (e.contentTemplate && (i = this._extractContent(e.contentTemplate), this._lastContent = i, this._contentObserver = new MutationObserver(() => {
        const u = this._extractContent(e.contentTemplate);
        this._lastContent = u, this._reactive?.notifyContent(u), this.onContentChanged(u);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, o, l, a, i, n), t !== this._attachment)
        return;
      this._internals.states.delete("loading"), this._internals.states.add("ready"), n || (this._initialized = !0), this.onReady(), t === this._attachment && this.emitEvent("load");
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
  _applyTheme(t = hr.getThemeMode?.()) {
    Oe(t, this), this._container && Oe(t, this._container);
  }
  disconnectedCallback() {
    const t = ++this._attachment;
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Oe("auto", this), this._container && Oe("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), t === this._attachment && (this.emitEvent("unload"), t === this._attachment && (this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus));
  }
  attributeChangedCallback(t, e, n) {
    if (e === n)
      return;
    if (t === Ye) {
      const l = this._hostVisible, i = ht(this);
      if (i === l)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, l), this.onHostVisibilityChanged(i, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: s } = Fe(this, r.propsSchema);
    r.validateProps && s.push(...r.validateProps(o));
    const a = o;
    this._lastProps = a, this._lastErrors = s, this._reactive?.notifyProps(a, s), this.onPropsChanged(a, s);
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
Re = /* @__PURE__ */ new WeakMap();
function Ir(t) {
  return t.__wippyHostBus ?? null;
}
function Rr(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let sn;
const an = (t) => sn = t, Vr = () => er() && He(ln) || sn, ln = (
  /* istanbul ignore next */
  Symbol()
);
function Dr() {
  const t = tr(!0), e = t.run(() => F({}));
  let n = [], r = [];
  const o = nr({
    install(s) {
      an(o), o._a = s, s.provide(ln, o), s.config.globalProperties.$pinia = o, r.forEach((a) => n.push(a)), r = [];
    },
    use(s) {
      return this._a ? n.push(s) : r.push(s), this;
    },
    _p: n,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return o;
}
var Mr = Object.defineProperty, Wr = (t, e, n) => e in t ? Mr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, H = (t, e, n) => Wr(t, typeof e != "symbol" ? e + "" : e, n);
function ns(t, e) {
  return { lazyConfig: t, mountLifecycle: !0, lazyUi: e };
}
function vt(t, e, n) {
  const r = t.createElement("div"), o = n ? e.failed : e.loading;
  r.dataset.lazyState = n ? "failed" : "loading", r.setAttribute("role", n ? "alert" : "status"), r.setAttribute("aria-label", o), r.style.cssText = "display:grid;place-items:center;text-align:center;";
  const s = e.surface === "page";
  if (r.style.cssText += s ? "block-size:100%;min-block-size:0;" : "min-block-size:2rem;font-size:.875rem;", n)
    r.style.color = "var(--p-danger-500, currentColor)", r.textContent = !s && e.iconOnly ? "⚠" : o, !s && e.iconOnly && (r.title = o);
  else {
    const a = t.createElement("style");
    a.textContent = '@media (prefers-reduced-motion: no-preference) { [data-lazy-state="loading"] > [data-wippy-spinner] { animation: wippy-lazy-spin 1s linear infinite; } } @keyframes wippy-lazy-spin { to { transform: rotate(1turn); } }';
    const l = t.createElement("span");
    l.dataset.wippySpinner = "", l.setAttribute("aria-hidden", "true"), l.style.cssText = "display:block;box-sizing:border-box;inline-size:1em;block-size:1em;border:2px solid var(--p-surface-300, currentColor);border-top-color:var(--p-primary-color, currentColor);border-radius:50%;", l.style.fontSize = s ? "2rem" : "1em", r.append(a, l);
  }
  return r;
}
var un = /* @__PURE__ */ Symbol("wippy:emit"), dn = /* @__PURE__ */ Symbol("wippy:props"), Br = /* @__PURE__ */ Symbol("wippy:props_error"), Hr = /* @__PURE__ */ Symbol("wippy:content"), Ur = /* @__PURE__ */ Symbol("wippy:panel-id"), Fr = /* @__PURE__ */ Symbol("wippy:layout-bus"), zr = /* @__PURE__ */ Symbol("wippy:host"), cn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function rs() {
  const t = He(dn);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function os() {
  const t = He(un);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
function Kr() {
  const t = He(cn);
  if (!t)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return t;
}
function is(t) {
  const e = Kr();
  let n = !1, r = null, o = !1;
  function s() {
    if (r)
      return o = !0, r;
    let a;
    try {
      a = Promise.resolve(t());
    } catch (i) {
      a = Promise.reject(i);
    }
    const l = a.finally(() => {
      if (r === l && (r = null, n && o))
        return o = !1, s();
    });
    return r = l, l;
  }
  return Zt(() => (n = !0, s())), or(() => {
    n = !1, o = !1;
  }), ce(e, (a, l) => {
    if (n && l === !1 && a === !0)
      return s();
  }), e;
}
var ke = /* @__PURE__ */ new WeakMap();
function yt(t, e) {
  const n = ke.get(t);
  if (n)
    return n;
  const r = Promise.resolve().then(e);
  return ke.set(t, r), r.catch(() => {
    ke.get(t) === r && ke.delete(t);
  }), r;
}
var ss = class extends Nr {
  constructor() {
    super(...arguments), H(this, "_vueApp", null), H(this, "_mountingApp", !1), H(this, "_mountState", "idle"), H(this, "_feedback", null), H(this, "_propsRef", F({})), H(this, "_errorsRef", F([])), H(this, "_contentRef", F(null)), H(this, "_hostVisibilityRef", F(null)), H(this, "_bridgeAbort", null);
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
    t.mountLifecycle && !t.rootComponent && t.lazyConfig && await yt(this, t.lazyConfig);
  }
  /** Undefined on configurations that use only the legacy load event. */
  get wippyMountState() {
    return this.constructor.vueConfig.mountLifecycle ? this._mountState : void 0;
  }
  onMount(t, e, n, r, o, s) {
    const a = this.constructor, l = a.vueConfig, i = new AbortController();
    this._bridgeAbort = i;
    const u = () => !i.signal.aborted && this._bridgeAbort === i;
    this._mountState = "mounting", this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const d of r)
      if (this.emitEvent("invalid", { message: d }), !u())
        return;
    this.reactive.props.subscribe((d, m) => {
      this._propsRef.value = d, this._errorsRef.value = [...m];
      for (const p of m)
        this.emitEvent("invalid", { message: p });
    }, { signal: i.signal }), this.reactive.content && this.reactive.content.subscribe((d) => {
      this._contentRef.value = d;
    }, { signal: i.signal }), this.reactive.hostVisibility.subscribe((d) => {
      this._hostVisibilityRef.value = d;
    }, { signal: i.signal });
    const c = (d) => {
      if (!u())
        return;
      const m = Vr(), p = rr(d.rootComponent);
      let f = !1, v = !1, g, y;
      this._mountingApp = !0;
      try {
        const _ = Dr();
        if (d.piniaPlugins)
          for (const $ of d.piniaPlugins)
            _.use($);
        p.use(_);
        for (const $ of d.plugins ?? [])
          p.use($);
        if (p.provide(dn, this._propsRef), p.provide(Br, this._errorsRef), p.provide(un, this.emitEvent.bind(this)), p.provide(Hr, this._contentRef), p.provide(cn, this._hostVisibilityRef), p.provide(Ur, Rr(this)), p.provide(Fr, Ir(this)), p.provide(zr, on(this)), d.providers?.(p, this), !u())
          return;
        if (y = p.config.errorHandler, l.mountLifecycle && (p.config.errorHandler = ($, h, b) => {
          v || (g = $), v = !0, y?.($, h, b);
        }), p.mount(e), f = !0, v)
          throw g;
        u() && (this._vueApp = p);
      } finally {
        l.mountLifecycle && f && (p.config.errorHandler = y);
        try {
          f && (v || !u()) && p.unmount();
        } finally {
          an(m), this._mountingApp = !1;
        }
      }
      l.mountLifecycle && queueMicrotask(() => {
        u() && this.isConnected && (this._mountState = "mounted", this.dispatchEvent(new Event("wippy-mounted")));
      });
    };
    if (l.rootComponent) {
      if (this._mountingApp && l.mountLifecycle) {
        queueMicrotask(() => {
          try {
            c(l);
          } catch (d) {
            u() && (this._mountState = "failed", this.emitEvent("error", { message: d instanceof Error ? d.message : String(d), error: d }));
          }
        });
        return;
      }
      try {
        c(l);
      } catch (d) {
        if (u())
          throw this._mountState = "failed", d;
      }
    } else if (l.lazyConfig) {
      const d = e.ownerDocument, m = l.lazyUi;
      m?.surface === "page" && (e.style.blockSize = "100%", e.style.minBlockSize = "0");
      let p = !1, f, v;
      const g = () => {
        clearTimeout(f), clearTimeout(v), this._feedback?.remove(), this._feedback = null;
      };
      i.signal.addEventListener("abort", g, { once: !0 });
      const y = () => {
        if (!u() || p)
          return;
        const b = m ? vt(d, m, !1) : d.createElement("wippy-loading");
        b.setAttribute("no-bg", ""), this._feedback = b, e.appendChild(b);
      }, _ = (b) => {
        if (!u())
          return;
        p = !0, g(), this._mountState = "failed";
        const k = m?.failed ?? (b instanceof Error ? b.message : String(b)), E = m ? vt(d, m, !0) : d.createElement("wippy-error");
        m || (E.setAttribute("title", "Failed to load"), E.setAttribute("message", k)), this._feedback = E, e.appendChild(E), this.emitEvent("error", m ? { message: k, error: b } : { message: k });
      }, $ = m?.delay ?? (m?.surface === "compact" ? 200 : 0);
      $ > 0 ? f = setTimeout(y, $) : y(), m && (v = setTimeout(() => _(new Error("The component did not load in time.")), m.timeout ?? 3e4)), (l.mountLifecycle ? yt(a, l.lazyConfig) : l.lazyConfig()).then((b) => {
        !u() || p || (p = !0, g(), c(b));
      }, (b) => {
        p || _(b);
      }).catch(_);
    } else
      throw this._mountState = "failed", new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._mountState = "idle", this._feedback?.remove(), this._feedback = null;
    const t = this._vueApp;
    this._vueApp = null, t?.unmount();
  }
}, Yr = Object.defineProperty, bt = Object.getOwnPropertySymbols, qr = Object.prototype.hasOwnProperty, Gr = Object.prototype.propertyIsEnumerable, _t = (t, e, n) => e in t ? Yr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Jr = (t, e) => {
  for (var n in e || (e = {})) qr.call(e, n) && _t(t, n, e[n]);
  if (bt) for (var n of bt(e)) Gr.call(e, n) && _t(t, n, e[n]);
  return t;
};
function Pe(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function qe(t, e, n = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || n.has(t) || n.has(e)) return !1;
  n.add(t).add(e);
  let r = Array.isArray(t), o = Array.isArray(e), s, a, l;
  if (r && o) {
    if (a = t.length, a != e.length) return !1;
    for (s = a; s-- !== 0; ) if (!qe(t[s], e[s], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = t instanceof Date, u = e instanceof Date;
  if (i != u) return !1;
  if (i && u) return t.getTime() == e.getTime();
  let c = t instanceof RegExp, d = e instanceof RegExp;
  if (c != d) return !1;
  if (c && d) return t.toString() == e.toString();
  let m = Object.keys(t);
  if (a = m.length, a !== Object.keys(e).length) return !1;
  for (s = a; s-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(e, m[s])) return !1;
  for (s = a; s-- !== 0; ) if (l = m[s], !qe(t[l], e[l], n)) return !1;
  return !0;
}
function Qr(t, e) {
  return qe(t, e);
}
function Ue(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function P(t) {
  return !Pe(t);
}
function Ge(t, e) {
  if (!t || !e) return null;
  try {
    let n = t[e];
    if (P(n)) return n;
  } catch {
  }
  if (Object.keys(t).length) {
    if (Ue(e)) return e(t);
    if (e.indexOf(".") === -1) return t[e];
    {
      let n = e.split("."), r = t;
      for (let o = 0, s = n.length; o < s; ++o) {
        if (r == null) return null;
        r = r[n[o]];
      }
      return r;
    }
  }
  return null;
}
function Zr(t, e, n) {
  return n ? Ge(t, n) === Ge(e, n) : Qr(t, e);
}
function W(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function mn(t = {}, e = {}) {
  let n = Jr({}, t);
  return Object.keys(e).forEach((r) => {
    let o = r;
    W(e[o]) && o in t && W(t[o]) ? n[o] = mn(t[o], e[o]) : n[o] = e[o];
  }), n;
}
function Xr(...t) {
  return t.reduce((e, n, r) => r === 0 ? n : mn(e, n), {});
}
function as(t, e) {
  let n = -1;
  if (P(t)) try {
    n = t.findLastIndex(e);
  } catch {
    n = t.lastIndexOf([...t].reverse().find(e));
  }
  return n;
}
function N(t, ...e) {
  return Ue(t) ? t(...e) : t;
}
function j(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function M(t) {
  return j(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function at(t, e = "", n = {}) {
  let r = M(e).split("."), o = r.shift();
  if (o) {
    if (W(t)) {
      let s = Object.keys(t).find((a) => M(a) === o) || "";
      return at(N(t[s], n), r.join("."), n);
    }
    return;
  }
  return N(t, n);
}
function pn(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function eo(t) {
  return P(t) && !isNaN(t);
}
function ls(t = "") {
  return P(t) && t.length === 1 && !!t.match(/\S| /);
}
function re(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function to(...t) {
  return Xr(...t);
}
function he(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function I(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in e) t = t.replace(e[n], n);
  }
  return t;
}
function no(t) {
  return j(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function fn(t) {
  return j(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function lt() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, n) {
    let r = t.get(e);
    return r ? r.push(n) : r = [n], t.set(e, r), this;
  }, off(e, n) {
    let r = t.get(e);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(e, n) {
    let r = t.get(e);
    r && r.forEach((o) => {
      o(n);
    });
  }, clear() {
    t.clear();
  } };
}
function ro(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let r = t[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") e.push(r);
      else if (o === "object") {
        let s = Array.isArray(r) ? [ro(...r)] : Object.entries(r).map(([a, l]) => l ? a : void 0);
        e = s.length ? e.concat(s.filter((a) => !!a)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function oo(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function Je(t, e) {
  if (t && e) {
    let n = (r) => {
      oo(t, r) || (t.classList ? t.classList.add(r) : t.className += " " + r);
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function io() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function us(t) {
  typeof t == "string" ? Je(document.body, t || "p-overflow-hidden") : (t != null && t.variableName && document.body.style.setProperty(t.variableName, io() + "px"), Je(document.body, t?.className || "p-overflow-hidden"));
}
function ge(t, e) {
  if (t && e) {
    let n = (r) => {
      t.classList ? t.classList.remove(r) : t.className = t.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function ds(t) {
  typeof t == "string" ? ge(document.body, t || "p-overflow-hidden") : (t != null && t.variableName && document.body.style.removeProperty(t.variableName), ge(document.body, t?.className || "p-overflow-hidden"));
}
function Qe(t) {
  for (let e of document?.styleSheets) try {
    for (let n of e?.cssRules) for (let r of n?.style) if (t.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function hn(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [n, r] = [t.style.visibility, t.style.display], o = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = o.width || t.offsetWidth, e.height = o.height || t.offsetHeight, t.style.display = r, t.style.visibility = n;
  }
  return e;
}
function gn() {
  let t = window, e = document, n = e.documentElement, r = e.getElementsByTagName("body")[0], o = t.innerWidth || n.clientWidth || r.clientWidth, s = t.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: s };
}
function Ze(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function so() {
  let t = document.documentElement;
  return (window.pageXOffset || Ze(t)) - (t.clientLeft || 0);
}
function ao() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function lo(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function cs(t, e, n = !0) {
  var r, o, s, a;
  if (t) {
    let l = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : hn(t), i = l.height, u = l.width, c = e.offsetHeight, d = e.offsetWidth, m = e.getBoundingClientRect(), p = ao(), f = so(), v = gn(), g, y, _ = "top";
    m.top + c + i > v.height ? (g = m.top + p - i, _ = "bottom", g < 0 && (g = p)) : g = c + m.top + p, m.left + u > v.width ? y = Math.max(0, m.left + f + d - u) : y = m.left + f, lo(t) ? t.style.insetInlineEnd = y + "px" : t.style.insetInlineStart = y + "px", t.style.top = g + "px", t.style.transformOrigin = _, n && (t.style.marginTop = _ === "bottom" ? `calc(${(o = (r = Qe(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? o : "2px"} * -1)` : (a = (s = Qe(/-anchor-gutter$/)) == null ? void 0 : s.value) != null ? a : "");
  }
}
function ms(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([n, r]) => t.style[n] = r));
}
function uo(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function ps(t, e, n = !0, r = void 0) {
  var o;
  if (t) {
    let s = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : hn(t), a = e.offsetHeight, l = e.getBoundingClientRect(), i = gn(), u, c, d = r ?? "top";
    if (!r && l.top + a + s.height > i.height ? (u = -1 * s.height, d = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = a, s.width > i.width ? c = l.left * -1 : l.left + s.width > i.width ? c = (l.left + s.width - i.width) * -1 : c = 0, t.style.top = u + "px", t.style.insetInlineStart = c + "px", t.style.transformOrigin = d, n) {
      let m = (o = Qe(/-anchor-gutter$/)) == null ? void 0 : o.value;
      t.style.marginTop = d === "bottom" ? `calc(${m ?? "2px"} * -1)` : m ?? "";
    }
  }
}
function vn(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function co(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && vn(t));
}
function ie(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function De(t, e = {}) {
  if (ie(t)) {
    let n = (r, o) => {
      var s, a;
      let l = (s = t?.$attrs) != null && s[r] ? [(a = t?.$attrs) == null ? void 0 : a[r]] : [];
      return [o].flat().reduce((i, u) => {
        if (u != null) {
          let c = typeof u;
          if (c === "string" || c === "number") i.push(u);
          else if (c === "object") {
            let d = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([m, p]) => r === "style" && (p || p === 0) ? `${m.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${p}` : p ? m : void 0);
            i = d.length ? i.concat(d.filter((m) => !!m)) : i;
          }
        }
        return i;
      }, l);
    };
    Object.entries(e).forEach(([r, o]) => {
      if (o != null) {
        let s = r.match(/^on(.+)/);
        s ? t.addEventListener(s[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? De(t, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (t.$attrs = t.$attrs || {}) && (t.$attrs[r] = o), t.setAttribute(r, o));
      }
    });
  }
}
function mo(t, e = {}, ...n) {
  {
    let r = document.createElement(t);
    return De(r, e), r.append(...n), r;
  }
}
function po(t, e) {
  return ie(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function yn(t, e) {
  return ie(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function fs(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function fo(t, e) {
  if (ie(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function bn(t, e = "") {
  let n = po(t, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function hs(t, e) {
  let n = bn(t, e);
  return n.length > 0 ? n[0] : null;
}
function St(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function gs(t, e) {
  let n = bn(t, e);
  return n.length > 0 ? n[n.length - 1] : null;
}
function ho(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || Ze(document.documentElement) || Ze(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function go(t, e) {
  return t ? t.offsetHeight : 0;
}
function _n(t, e = []) {
  let n = vn(t);
  return n === null ? e : _n(n, e.concat([n]));
}
function vo(t) {
  let e = [];
  if (t) {
    let n = _n(t), r = /(auto|scroll)/, o = (s) => {
      try {
        let a = window.getComputedStyle(s, null);
        return r.test(a.getPropertyValue("overflow")) || r.test(a.getPropertyValue("overflowX")) || r.test(a.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let s of n) {
      let a = s.nodeType === 1 && s.dataset.scrollselectors;
      if (a) {
        let l = a.split(",");
        for (let i of l) {
          let u = yn(s, i);
          u && o(u) && e.push(u);
        }
      }
      s.nodeType !== 9 && o(s) && e.push(s);
    }
  }
  return e;
}
function $t(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function vs() {
  return /(android)/i.test(navigator.userAgent);
}
function Sn() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function ys(t, e = "") {
  return ie(t) ? t.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`) : !1;
}
function bs(t) {
  return !!(t && t.offsetParent != null);
}
function _s() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function yo(t, e = "", n) {
  ie(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
var Ee = {};
function bo(t = "pui_id_") {
  return Object.hasOwn(Ee, t) || (Ee[t] = 0), Ee[t]++, `${t}${Ee[t]}`;
}
function _o() {
  let t = [], e = (a, l, i = 999) => {
    let u = o(a, l, i), c = u.value + (u.key === a ? 0 : i) + 1;
    return t.push({ key: a, value: c }), c;
  }, n = (a) => {
    t = t.filter((l) => l.value !== a);
  }, r = (a, l) => o(a).value, o = (a, l, i = 0) => [...t].reverse().find((u) => !0) || { key: a, value: i }, s = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: s, set: (a, l, i) => {
    l && (l.style.zIndex = String(e(a, !0, i)));
  }, clear: (a) => {
    a && (n(s(a)), a.style.zIndex = "");
  }, getCurrent: (a) => r(a) };
}
var Ss = _o(), So = Object.defineProperty, $o = Object.defineProperties, wo = Object.getOwnPropertyDescriptors, Me = Object.getOwnPropertySymbols, $n = Object.prototype.hasOwnProperty, wn = Object.prototype.propertyIsEnumerable, wt = (t, e, n) => e in t ? So(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, V = (t, e) => {
  for (var n in e || (e = {})) $n.call(e, n) && wt(t, n, e[n]);
  if (Me) for (var n of Me(e)) wn.call(e, n) && wt(t, n, e[n]);
  return t;
}, ze = (t, e) => $o(t, wo(e)), U = (t, e) => {
  var n = {};
  for (var r in t) $n.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && Me) for (var r of Me(t)) e.indexOf(r) < 0 && wn.call(t, r) && (n[r] = t[r]);
  return n;
}, To = lt(), L = To, ve = /{([^}]*)}/g, Tn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Cn = /var\([^)]+\)/g;
function Tt(t) {
  return j(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function Co(t) {
  return W(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function Po(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Xe(t = "", e = "") {
  return Po(`${j(t, !1) && j(e, !1) ? `${t}-` : t}${e}`);
}
function Pn(t = "", e = "") {
  return `--${Xe(t, e)}`;
}
function xo(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function xn(t, e = "", n = "", r = [], o) {
  if (j(t)) {
    let s = t.trim();
    if (xo(s)) return;
    if (re(s, ve)) {
      let a = s.replaceAll(ve, (l) => {
        let i = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((c) => re(u, c)));
        return `var(${Pn(n, fn(i.join("-")))}${P(o) ? `, ${o}` : ""})`;
      });
      return re(a.replace(Cn, "0"), Tn) ? `calc(${a})` : a;
    }
    return s;
  } else if (eo(t)) return t;
}
function Oo(t, e, n) {
  j(e, !1) && t.push(`${e}:${n};`);
}
function de(t, e) {
  return t ? `${t}{${e}}` : "";
}
function On(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(a, l) {
    let i = [], u = 0, c = "", d = null, m = 0;
    for (; u <= a.length; ) {
      let p = a[u];
      if ((p === '"' || p === "'" || p === "`") && a[u - 1] !== "\\" && (d = d === p ? null : p), !d && (p === "(" && m++, p === ")" && m--, (p === "," || u === a.length) && m === 0)) {
        let f = c.trim();
        f.startsWith("dt(") ? i.push(On(f, l)) : i.push(r(f)), c = "", u++;
        continue;
      }
      p !== void 0 && (c += p), u++;
    }
    return i;
  }
  function r(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let i = Number(a);
    return isNaN(i) ? a : i;
  }
  let o = [], s = [];
  for (let a = 0; a < t.length; a++) if (t[a] === "d" && t.slice(a, a + 3) === "dt(") s.push(a), a += 2;
  else if (t[a] === ")" && s.length > 0) {
    let l = s.pop();
    s.length === 0 && o.push([l, a]);
  }
  if (!o.length) return t;
  for (let a = o.length - 1; a >= 0; a--) {
    let [l, i] = o[a], u = t.slice(l + 3, i), c = n(u, e), d = e(...c);
    t = t.slice(0, l) + d + t.slice(i + 1);
  }
  return t;
}
var $s = (t) => {
  var e;
  let n = C.getTheme(), r = et(n, t, void 0, "variable"), o = (e = r?.match(/--[\w-]+/g)) == null ? void 0 : e[0], s = et(n, t, void 0, "value");
  return { name: o, variable: r, value: s };
}, oe = (...t) => et(C.getTheme(), ...t), et = (t = {}, e, n, r) => {
  if (e) {
    let { variable: o, options: s } = C.defaults || {}, { prefix: a, transform: l } = t?.options || s || {}, i = re(e, ve) ? e : `{${e}}`;
    return r === "value" || Pe(r) && l === "strict" ? C.getTokenValue(e) : xn(i, void 0, a, [o.excludedKeyRegex], n);
  }
  return "";
};
function Le(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((r, o, s) => {
      var a;
      return r + o + ((a = N(e[s], { dt: oe })) != null ? a : "");
    }, "");
    return On(n, oe);
  }
  return N(t, { dt: oe });
}
function ko(t, e = {}) {
  let n = C.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: s = n.excludedKeyRegex } = e, a = [], l = [], i = [{ node: t, path: r }];
  for (; i.length; ) {
    let { node: c, path: d } = i.pop();
    for (let m in c) {
      let p = c[m], f = Co(p), v = re(m, s) ? Xe(d) : Xe(d, fn(m));
      if (W(f)) i.push({ node: f, path: v });
      else {
        let g = Pn(v), y = xn(f, v, r, [s]);
        Oo(l, g, y);
        let _ = v;
        r && _.startsWith(r + "-") && (_ = _.slice(r.length + 1)), a.push(_.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: a, declarations: u, css: de(o, u) };
}
var R = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
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
    return (r = e.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(t, e) {
  return ko(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: r, defaults: o }) {
  var s, a, l, i, u, c, d;
  let { preset: m, options: p } = e, f, v, g, y, _, $, h;
  if (P(m) && p.transform !== "strict") {
    let { primitive: b, semantic: k, extend: E } = m, z = k || {}, { colorScheme: K } = z, Q = U(z, ["colorScheme"]), Y = E || {}, { colorScheme: Z } = Y, X = U(Y, ["colorScheme"]), q = K || {}, { dark: ee } = q, se = U(q, ["dark"]), te = Z || {}, { dark: ae } = te, le = U(te, ["dark"]), B = P(b) ? this._toVariables({ primitive: b }, p) : {}, D = P(Q) ? this._toVariables({ semantic: Q }, p) : {}, ne = P(se) ? this._toVariables({ light: se }, p) : {}, xe = P(ee) ? this._toVariables({ dark: ee }, p) : {}, ue = P(X) ? this._toVariables({ semantic: X }, p) : {}, ct = P(le) ? this._toVariables({ light: le }, p) : {}, mt = P(ae) ? this._toVariables({ dark: ae }, p) : {}, [Rn, Vn] = [(s = B.declarations) != null ? s : "", B.tokens], [Dn, Mn] = [(a = D.declarations) != null ? a : "", D.tokens || []], [Wn, Bn] = [(l = ne.declarations) != null ? l : "", ne.tokens || []], [Hn, Un] = [(i = xe.declarations) != null ? i : "", xe.tokens || []], [Fn, zn] = [(u = ue.declarations) != null ? u : "", ue.tokens || []], [Kn, Yn] = [(c = ct.declarations) != null ? c : "", ct.tokens || []], [qn, Gn] = [(d = mt.declarations) != null ? d : "", mt.tokens || []];
    f = this.transformCSS(t, Rn, "light", "variable", p, r, o), v = Vn;
    let Jn = this.transformCSS(t, `${Dn}${Wn}`, "light", "variable", p, r, o), Qn = this.transformCSS(t, `${Hn}`, "dark", "variable", p, r, o);
    g = `${Jn}${Qn}`, y = [.../* @__PURE__ */ new Set([...Mn, ...Bn, ...Un])];
    let Zn = this.transformCSS(t, `${Fn}${Kn}color-scheme:light`, "light", "variable", p, r, o), Xn = this.transformCSS(t, `${qn}color-scheme:dark`, "dark", "variable", p, r, o);
    _ = `${Zn}${Xn}`, $ = [.../* @__PURE__ */ new Set([...zn, ...Yn, ...Gn])], h = N(m.css, { dt: oe });
  }
  return { primitive: { css: f, tokens: v }, semantic: { css: g, tokens: y }, global: { css: _, tokens: $ }, style: h };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: r, set: o, defaults: s, selector: a }) {
  var l, i, u;
  let c, d, m;
  if (P(e) && n.transform !== "strict") {
    let p = t.replace("-directive", ""), f = e, { colorScheme: v, extend: g, css: y } = f, _ = U(f, ["colorScheme", "extend", "css"]), $ = g || {}, { colorScheme: h } = $, b = U($, ["colorScheme"]), k = v || {}, { dark: E } = k, z = U(k, ["dark"]), K = h || {}, { dark: Q } = K, Y = U(K, ["dark"]), Z = P(_) ? this._toVariables({ [p]: V(V({}, _), b) }, n) : {}, X = P(z) ? this._toVariables({ [p]: V(V({}, z), Y) }, n) : {}, q = P(E) ? this._toVariables({ [p]: V(V({}, E), Q) }, n) : {}, [ee, se] = [(l = Z.declarations) != null ? l : "", Z.tokens || []], [te, ae] = [(i = X.declarations) != null ? i : "", X.tokens || []], [le, B] = [(u = q.declarations) != null ? u : "", q.tokens || []], D = this.transformCSS(p, `${ee}${te}`, "light", "variable", n, o, s, a), ne = this.transformCSS(p, le, "dark", "variable", n, o, s, a);
    c = `${D}${ne}`, d = [.../* @__PURE__ */ new Set([...se, ...ae, ...B])], m = N(y, { dt: oe });
  }
  return { css: c, tokens: d, style: m };
}, getPresetC({ name: t = "", theme: e = {}, params: n, set: r, defaults: o }) {
  var s;
  let { preset: a, options: l } = e, i = (s = a?.components) == null ? void 0 : s[t];
  return this.getPreset({ name: t, preset: i, options: l, params: n, set: r, defaults: o });
}, getPresetD({ name: t = "", theme: e = {}, params: n, set: r, defaults: o }) {
  var s, a;
  let l = t.replace("-directive", ""), { preset: i, options: u } = e, c = ((s = i?.components) == null ? void 0 : s[l]) || ((a = i?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: c, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var n;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (n = t.darkModeSelector) != null ? n : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, n, r) {
  let { cssLayer: o } = e;
  return o ? `@layer ${N(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: o, defaults: s }) {
  let a = this.getCommon({ name: t, theme: e, params: n, set: o, defaults: s }), l = Object.entries(r).reduce((i, [u, c]) => i.push(`${u}="${c}"`) && i, []).join(" ");
  return Object.entries(a || {}).reduce((i, [u, c]) => {
    if (W(c) && Object.hasOwn(c, "css")) {
      let d = he(c.css), m = `${u}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${m}" ${l}>${d}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: o, defaults: s }) {
  var a;
  let l = { name: t, theme: e, params: n, set: o, defaults: s }, i = (a = t.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, u = Object.entries(r).reduce((c, [d, m]) => c.push(`${d}="${m}"`) && c, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${u}>${he(i)}</style>` : "";
}, createTokens(t = {}, e, n = "", r = "", o = {}) {
  let s = function(l, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && ve.test(this.value)) {
      let d = this.value.trim().replace(ve, (m) => {
        var p;
        let f = m.slice(1, -1), v = this.tokens[f];
        if (!v) return console.warn(`Token not found for path: ${f}`), "__UNRESOLVED__";
        let g = v.computed(l, i, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (p = g?.value) != null ? p : "__UNRESOLVED__";
      });
      c = Tn.test(d.replace(Cn, "0")) ? `calc(${d})` : d;
    }
    return Pe(i.binding) && delete i.binding, u.pop(), { colorScheme: l, path: this.path, paths: i, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, a = (l, i, u) => {
    Object.entries(l).forEach(([c, d]) => {
      let m = re(c, e.variable.excludedKeyRegex) ? i : i ? `${i}.${Tt(c)}` : Tt(c), p = u ? `${u}.${c}` : c;
      W(d) ? a(d, m, p) : (o[m] || (o[m] = { paths: [], computed: (f, v = {}, g = []) => {
        if (o[m].paths.length === 1) return o[m].paths[0].computed(o[m].paths[0].scheme, v.binding, g);
        if (f && f !== "none") for (let y = 0; y < o[m].paths.length; y++) {
          let _ = o[m].paths[y];
          if (_.scheme === f) return _.computed(f, v.binding, g);
        }
        return o[m].paths.map((y) => y.computed(y.scheme, v[y.scheme], g));
      } }), o[m].paths.push({ path: p, value: d, scheme: p.includes("colorScheme.light") ? "light" : p.includes("colorScheme.dark") ? "dark" : "none", computed: s, tokens: o }));
    });
  };
  return a(t, n, r), o;
}, getTokenValue(t, e, n) {
  var r;
  let o = ((l) => l.split(".").filter((i) => !re(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), s = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, a = [(r = t[o]) == null ? void 0 : r.computed(s)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, i) => {
    let u = i, { colorScheme: c } = u, d = U(u, ["colorScheme"]);
    return l[c] = d, l;
  }, void 0);
}, getSelectorRule(t, e, n, r) {
  return n === "class" || n === "attr" ? de(P(e) ? `${t}${e},${t} ${e}` : t, r) : de(t, de(e ?? ":root,:host", r));
}, transformCSS(t, e, n, r, o = {}, s, a, l) {
  if (P(e)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, a);
      e = n === "dark" ? u.reduce((c, { type: d, selector: m }) => (P(m) && (c += m.includes("[CSS]") ? m.replace("[CSS]", e) : this.getSelectorRule(m, l, d, e)), c), "") : de(l ?? ":root,:host", e);
    }
    if (i) {
      let u = { name: "primeui" };
      W(i) && (u.name = N(i.name, { name: t, type: r })), P(u.name) && (e = de(`@layer ${u.name}`, e), s?.layerNames(u.name));
    }
    return e;
  }
  return "";
} }, C = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = ze(V({}, e), { options: V(V({}, this.defaults.options), e.options) }), this._tokens = R.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: t }), L.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = ze(V({}, this.theme), { preset: t }), this._tokens = R.createTokens(t, this.defaults), this.clearLoadedStyleNames(), L.emit("preset:change", t), L.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = ze(V({}, this.theme), { options: t }), this.clearLoadedStyleNames(), L.emit("options:change", t), L.emit("theme:change", this.theme);
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
  return R.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return R.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPresetD(n);
}, getCustomPreset(t = "", e, n, r) {
  let o = { name: t, preset: e, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPreset(o);
}, getLayerOrderCSS(t = "") {
  return R.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", r) {
  return R.transformCSS(t, e, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return R.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return R.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), L.emit(`theme:${e}:load`, t), !this._loadingStyles.size && L.emit("theme:load"));
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
function Ct(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = Eo(t)) || e) {
      n && (t = n);
      var r = 0, o = function() {
      };
      return { s: o, n: function() {
        return r >= t.length ? { done: !0 } : { done: !1, value: t[r++] };
      }, e: function(u) {
        throw u;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var s, a = !0, l = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var u = n.next();
    return a = u.done, u;
  }, e: function(u) {
    l = !0, s = u;
  }, f: function() {
    try {
      a || n.return == null || n.return();
    } finally {
      if (l) throw s;
    }
  } };
}
function Eo(t, e) {
  if (t) {
    if (typeof t == "string") return Pt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pt(t, e) : void 0;
  }
}
function Pt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var ws = {
  filter: function(e, n, r, o, s) {
    var a = [];
    if (!e)
      return a;
    var l = Ct(e), i;
    try {
      for (l.s(); !(i = l.n()).done; ) {
        var u = i.value;
        if (typeof u == "string") {
          if (this.filters[o](u, r, s)) {
            a.push(u);
            continue;
          }
        } else {
          var c = Ct(n), d;
          try {
            for (c.s(); !(d = c.n()).done; ) {
              var m = d.value, p = Ge(u, m);
              if (this.filters[o](p, r, s)) {
                a.push(u);
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
    return a;
  },
  filters: {
    startsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), s = I(e.toString()).toLocaleLowerCase(r);
      return s.slice(0, o.length) === o;
    },
    contains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), s = I(e.toString()).toLocaleLowerCase(r);
      return s.indexOf(o) !== -1;
    },
    notContains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), s = I(e.toString()).toLocaleLowerCase(r);
      return s.indexOf(o) === -1;
    },
    endsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), s = I(e.toString()).toLocaleLowerCase(r);
      return s.indexOf(o, s.length - o.length) !== -1;
    },
    equals: function(e, n, r) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : I(e.toString()).toLocaleLowerCase(r) == I(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(e, n, r) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : I(e.toString()).toLocaleLowerCase(r) != I(n.toString()).toLocaleLowerCase(r);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (Zr(e, n[r]))
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
}, Lo = `
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
function ye(t) {
  "@babel/helpers - typeof";
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ye(t);
}
function xt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ot(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? xt(Object(n), !0).forEach(function(r) {
      Ao(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : xt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Ao(t, e, n) {
  return (e = jo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function jo(t) {
  var e = No(t, "string");
  return ye(e) == "symbol" ? e : e + "";
}
function No(t, e) {
  if (ye(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ye(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Io(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  pt() && pt().components ? Zt(t) : e ? t() : sr(t);
}
var Ro = 0;
function Vo(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = F(!1), r = F(t), o = F(null), s = Sn() ? window.document : void 0, a = e.document, l = a === void 0 ? s : a, i = e.immediate, u = i === void 0 ? !0 : i, c = e.manual, d = c === void 0 ? !1 : c, m = e.name, p = m === void 0 ? "style_".concat(++Ro) : m, f = e.id, v = f === void 0 ? void 0 : f, g = e.media, y = g === void 0 ? void 0 : g, _ = e.nonce, $ = _ === void 0 ? void 0 : _, h = e.first, b = h === void 0 ? !1 : h, k = e.onMounted, E = k === void 0 ? void 0 : k, z = e.onUpdated, K = z === void 0 ? void 0 : z, Q = e.onLoad, Y = Q === void 0 ? void 0 : Q, Z = e.props, X = Z === void 0 ? {} : Z, q = function() {
  }, ee = function(ae) {
    var le = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var B = Ot(Ot({}, X), le), D = B.name || p, ne = B.id || v, xe = B.nonce || $;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(D, '"]')) || l.getElementById(ne) || l.createElement("style"), o.value.isConnected || (r.value = ae || t, De(o.value, {
        type: "text/css",
        id: ne,
        media: y,
        nonce: xe
      }), b ? l.head.prepend(o.value) : l.head.appendChild(o.value), yo(o.value, "data-primevue-style-id", D), De(o.value, B), o.value.onload = function(ue) {
        return Y?.(ue, {
          name: D
        });
      }, E?.(D)), !n.value && (q = ce(r, function(ue) {
        o.value.textContent = ue, K?.(D);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, se = function() {
    !l || !n.value || (q(), co(o.value) && l.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !d && Io(ee), {
    id: v,
    name: p,
    el: o,
    css: r,
    unload: se,
    load: ee,
    isLoaded: ir(n)
  };
}
function be(t) {
  "@babel/helpers - typeof";
  return be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, be(t);
}
var kt, Et, Lt, At;
function jt(t, e) {
  return Bo(t) || Wo(t, e) || Mo(t, e) || Do();
}
function Do() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Mo(t, e) {
  if (t) {
    if (typeof t == "string") return Nt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nt(t, e) : void 0;
  }
}
function Nt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Wo(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(t)).next, e !== 0) for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== e); i = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!i && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Bo(t) {
  if (Array.isArray(t)) return t;
}
function It(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ke(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? It(Object(n), !0).forEach(function(r) {
      Ho(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : It(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Ho(t, e, n) {
  return (e = Uo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Uo(t) {
  var e = Fo(t, "string");
  return be(e) == "symbol" ? e : e + "";
}
function Fo(t, e) {
  if (be(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (be(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Ae(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var zo = function(e) {
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
}, Ko = {}, Yo = {}, O = {
  name: "base",
  css: zo,
  style: Lo,
  classes: Ko,
  inlineStyles: Yo,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(s) {
      return s;
    }, o = r(Le(kt || (kt = Ae(["", ""])), e));
    return P(o) ? Vo(he(o), Ke({
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
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return C.transformCSS(n.name || e.name, "".concat(o).concat(Le(Et || (Et = Ae(["", ""])), r)));
    });
  },
  getCommonTheme: function(e) {
    return C.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return C.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return C.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, r) {
    return C.getCustomPreset(this.name, e, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return C.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = N(this.css, {
        dt: oe
      }) || "", o = he(Le(Lt || (Lt = Ae(["", "", ""])), r, e)), s = Object.entries(n).reduce(function(a, l) {
        var i = jt(l, 2), u = i[0], c = i[1];
        return a.push("".concat(u, '="').concat(c, '"')) && a;
      }, []).join(" ");
      return P(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(s, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return C.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [C.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), s = Le(At || (At = Ae(["", ""])), N(this.style, {
        dt: oe
      })), a = he(C.transformCSS(o, s)), l = Object.entries(n).reduce(function(i, u) {
        var c = jt(u, 2), d = c[0], m = c[1];
        return i.push("".concat(d, '="').concat(m, '"')) && i;
      }, []).join(" ");
      P(a) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return r.join("");
  },
  extend: function(e) {
    return Ke(Ke({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, J = lt();
function _e(t) {
  "@babel/helpers - typeof";
  return _e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, _e(t);
}
function Rt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function je(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Rt(Object(n), !0).forEach(function(r) {
      qo(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Rt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function qo(t, e, n) {
  return (e = Go(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Go(t) {
  var e = Jo(t, "string");
  return _e(e) == "symbol" ? e : e + "";
}
function Jo(t, e) {
  if (_e(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (_e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Qo = {
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
}, Zo = Symbol();
function Xo(t, e) {
  var n = {
    config: ar(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(Zo, n), ei(), ti(t, n), n;
}
var me = [];
function ei() {
  L.clear(), me.forEach(function(t) {
    return t?.();
  }), me = [];
}
function ti(t, e) {
  var n = F(!1), r = function() {
    var u;
    if (((u = e.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !C.isStyleNameLoaded("common")) {
      var c, d, m = ((c = O.getCommonTheme) === null || c === void 0 ? void 0 : c.call(O)) || {}, p = m.primitive, f = m.semantic, v = m.global, g = m.style, y = {
        nonce: (d = e.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      O.load(p?.css, je({
        name: "primitive-variables"
      }, y)), O.load(f?.css, je({
        name: "semantic-variables"
      }, y)), O.load(v?.css, je({
        name: "global-variables"
      }, y)), O.loadStyle(je({
        name: "global-style"
      }, y), g), C.setLoadedStyleName("common");
    }
  };
  L.on("theme:change", function(i) {
    n.value || (t.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = ce(e.config, function(i, u) {
    J.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = ce(function() {
    return e.config.ripple;
  }, function(i, u) {
    J.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ce(function() {
    return e.config.theme;
  }, function(i, u) {
    n.value || C.setTheme(i), e.config.unstyled || r(), n.value = !1, J.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = ce(function() {
    return e.config.unstyled;
  }, function(i, u) {
    !i && e.config.theme && r(), J.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  me.push(o), me.push(s), me.push(a), me.push(l);
}
var ni = {
  install: function(e, n) {
    var r = to(Qo, n);
    Xo(e, r);
  }
}, kn = {
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
    this.mounted = Sn();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function ri(t, e, n, r, o, s) {
  return s.inline ? Ve(t.$slots, "default", {
    key: 0
  }) : o.mounted ? (lr(), ur(Xt, {
    key: 1,
    to: n.appendTo
  }, [Ve(t.$slots, "default")], 8, ["to"])) : en("", !0);
}
kn.render = ri;
var G = {
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
function oi() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = dr();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var Vt = O.extend({
  name: "common"
});
function Se(t) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Se(t);
}
function ii(t) {
  return An(t) || si(t) || Ln(t) || En();
}
function si(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function pe(t, e) {
  return An(t) || ai(t, e) || Ln(t, e) || En();
}
function En() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ln(t, e) {
  if (t) {
    if (typeof t == "string") return tt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? tt(t, e) : void 0;
  }
}
function tt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function ai(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== e); i = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!i && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function An(t) {
  if (Array.isArray(t)) return t;
}
function Dt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function w(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Dt(Object(n), !0).forEach(function(r) {
      fe(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Dt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function fe(t, e, n) {
  return (e = li(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function li(t) {
  var e = ui(t, "string");
  return Se(e) == "symbol" ? e : e + "";
}
function ui(t, e) {
  if (Se(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Se(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var di = {
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
        L.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var r = this;
        L.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
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
    var e, n, r, o, s, a, l, i, u, c, d, m = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, p = m ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, f = m ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = f || p) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (s = o.onBeforeCreate) === null || s === void 0 || s.call(o);
    var v = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, g = v ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, y = v ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (c = y || g) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (d = c.onBeforeCreate) === null || d === void 0 || d.call(c), this.$attrSelector = oi(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = yn(ie(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = w({
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
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Ue(e) ? e.apply(void 0, r) : Ie.apply(void 0, r);
    },
    _load: function() {
      G.isStyleNameLoaded("base") || (O.loadCSS(this.$styleOptions), this._loadGlobalStyles(), G.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !G.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Vt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), G.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      P(e) && O.load(e, w({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!C.isStyleNameLoaded("common")) {
          var r, o, s = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, a = s.primitive, l = s.semantic, i = s.global, u = s.style;
          O.load(a?.css, w({
            name: "primitive-variables"
          }, this.$styleOptions)), O.load(l?.css, w({
            name: "semantic-variables"
          }, this.$styleOptions)), O.load(i?.css, w({
            name: "global-variables"
          }, this.$styleOptions)), O.loadStyle(w({
            name: "global-style"
          }, this.$styleOptions), u), C.setLoadedStyleName("common");
        }
        if (!C.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var c, d, m, p, f = ((c = this.$style) === null || c === void 0 || (d = c.getComponentTheme) === null || d === void 0 ? void 0 : d.call(c)) || {}, v = f.css, g = f.style;
          (m = this.$style) === null || m === void 0 || m.load(v, w({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (p = this.$style) === null || p === void 0 || p.loadStyle(w({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), C.setLoadedStyleName(this.$style.name);
        }
        if (!C.isStyleNameLoaded("layer-order")) {
          var y, _, $ = (y = this.$style) === null || y === void 0 || (_ = y.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(y);
          O.load($, w({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), C.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, r, o, s = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, a = s.css, l = (o = this.$style) === null || o === void 0 ? void 0 : o.load(a, w({
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
      G.clearLoadedStyleNames(), L.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      L.off("theme:change", this._loadCoreStyles), L.off("theme:change", this._load), L.off("theme:change", this._themeScopedListener);
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
      return at(e, n, r);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(r) && !!o[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, c = l.mergeProps, d = c === void 0 ? !1 : c, m = s ? a ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, p = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, w(w({}, o), {}, {
        global: m || {}
      })), f = this._getPTDatasets(r);
      return u || !u && p ? d ? this._mergeProps(d, m, p, f) : w(w(w({}, m), p), f) : w(w({}, p), f);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Ie(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", s = r === "root" && P((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return r !== "transition" && w(w({}, r === "root" && w(w(fe({}, "".concat(o, "name"), M(s ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), s && fe({}, "".concat(o, "extend"), M(this.$.type.name))), {}, fe({}, "".concat(this.$attrSelector), ""))), {}, fe({}, "".concat(o, "section"), M(r)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return j(e) || pn(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, s = function(l) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = o ? o(l) : l, d = M(r), m = M(n.$name);
        return (i = u ? d !== m ? c?.[d] : void 0 : c?.[d]) !== null && i !== void 0 ? i : c;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: s(e.originalValue),
        value: s(e.value)
      } : s(e, !0);
    },
    _usePT: function(e, n, r, o) {
      var s = function(v) {
        return n(v, r, o);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var a, l = e._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, c = l.mergeProps, d = c === void 0 ? !1 : c, m = s(e.originalValue), p = s(e.value);
        return m === void 0 && p === void 0 ? void 0 : j(p) ? p : j(m) ? m : u || !u && p ? d ? this._mergeProps(d, m, p) : w(w({}, m), p) : p;
      }
      return s(e);
    },
    _useGlobalPT: function(e, n, r) {
      return this._usePT(this.globalPT, e, n, r);
    },
    _useDefaultPT: function(e, n, r) {
      return this._usePT(this.defaultPT, e, n, r);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, w(w({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = Ie(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((e = o.id) !== null && e !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, w({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, w(w({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, e, w(w({}, this.$params), r)), s = this._getOptionValue(Vt.inlineStyles, e, w(w({}, this.$params), r));
        return [s, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return N(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, w({}, n.$params)) || N(r, w({}, n.$params));
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
        var o = pe(r, 1), s = o[0];
        return n?.includes(s);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
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
        var n = pe(e, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(e, n) {
        var r = pe(n, 2), o = r[0], s = r[1], a = o.split(":"), l = ii(a), i = tt(l).slice(1);
        return i?.reduce(function(u, c, d, m) {
          return !u[c] && (u[c] = d === m.length - 1 ? s : {}), u[c];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = pe(e, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(e, n) {
        var r = pe(n, 2), o = r[0], s = r[1];
        return e[o] = s, e;
      }, {});
    }
  }
}, ci = `
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
`, mi = {
  root: function(e) {
    var n = e.instance;
    return ["p-contextmenu p-component", {
      "p-contextmenu-mobile": n.queryMatches
    }];
  },
  rootList: "p-contextmenu-root-list",
  item: function(e) {
    var n = e.instance, r = e.processedItem;
    return ["p-contextmenu-item", {
      "p-contextmenu-item-active": n.isItemActive(r),
      "p-focus": n.isItemFocused(r),
      "p-disabled": n.isItemDisabled(r)
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
O.extend({
  name: "contextmenu",
  style: ci,
  classes: mi
});
var pi = `
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
`, fi = O.extend({
  name: "baseicon",
  css: pi
});
function $e(t) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, $e(t);
}
function Mt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Wt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Mt(Object(n), !0).forEach(function(r) {
      hi(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Mt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function hi(t, e, n) {
  return (e = gi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function gi(t) {
  var e = vi(t, "string");
  return $e(e) == "symbol" ? e : e + "";
}
function vi(t, e) {
  if ($e(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if ($e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ts = {
  name: "BaseIcon",
  extends: di,
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
  style: fi,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = Pe(this.label);
      return Wt(Wt({}, !this.isUnstyled && {
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
function we(t) {
  "@babel/helpers - typeof";
  return we = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, we(t);
}
function Bt(t, e) {
  return Si(t) || _i(t, e) || bi(t, e) || yi();
}
function yi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bi(t, e) {
  if (t) {
    if (typeof t == "string") return Ht(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ht(t, e) : void 0;
  }
}
function Ht(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function _i(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(t)).next, e !== 0) for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== e); i = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!i && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Si(t) {
  if (Array.isArray(t)) return t;
}
function Ut(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function T(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ut(Object(n), !0).forEach(function(r) {
      nt(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ut(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function nt(t, e, n) {
  return (e = $i(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function $i(t) {
  var e = wi(t, "string");
  return we(e) == "symbol" ? e : e + "";
}
function wi(t, e) {
  if (we(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (we(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var S = {
  _getMeta: function() {
    return [W(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], N(W(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var r, o, s;
    return (r = (e == null || (o = e.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (s = n.ctx) === null || s === void 0 || (s = s.appContext) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.globalProperties) === null || s === void 0 ? void 0 : s.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: at,
  _getPTValue: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var _ = S._getOptionValue.apply(S, arguments);
      return j(_) || pn(_) ? {
        class: _
      } : _;
    }, u = ((e = r.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, c = u.mergeSections, d = c === void 0 ? !0 : c, m = u.mergeProps, p = m === void 0 ? !1 : m, f = l ? S._useDefaultPT(r, r.defaultPT(), i, s, a) : void 0, v = S._usePT(r, S._getPT(o, r.$name), i, s, T(T({}, a), {}, {
      global: f || {}
    })), g = S._getPTDatasets(r, s);
    return d || !d && v ? p ? S._mergeProps(r, p, f, v, g) : T(T(T({}, f), v), g) : T(T({}, v), g);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return T(T({}, n === "root" && nt({}, "".concat(r, "name"), M(e.$name))), {}, nt({}, "".concat(r, "section"), M(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(a) {
      var l, i = r ? r(a) : a, u = M(n);
      return (l = i?.[u]) !== null && l !== void 0 ? l : i;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: o(e.originalValue),
      value: o(e.value)
    } : o(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0, a = function(g) {
      return r(g, o, s);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, i = n._usept || ((l = e.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = i.mergeSections, c = u === void 0 ? !0 : u, d = i.mergeProps, m = d === void 0 ? !1 : d, p = a(n.originalValue), f = a(n.value);
      return p === void 0 && f === void 0 ? void 0 : j(f) ? f : j(p) ? p : c || !c && f ? m ? S._mergeProps(e, m, p, f) : T(T({}, p), f) : f;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0;
    return S._usePT(e, n, r, o, s);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, s = S._getConfig(r, o), a = {
      nonce: s == null || (e = s.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    S._loadCoreStyles(n, a), S._loadThemeStyles(n, a), S._loadScopedThemeStyles(n, a), S._removeThemeListeners(n), n.$loadStyles = function() {
      return S._loadThemeStyles(n, a);
    }, S._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!G.isStyleNameLoaded((e = r.$style) === null || e === void 0 ? void 0 : e.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var s;
      O.loadCSS(o), (s = r.$style) === null || s === void 0 || s.loadCSS(o), G.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, s = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (e = o.theme) === null || e === void 0 ? void 0 : e.call(o)) === "none")) {
      if (!C.isStyleNameLoaded("common")) {
        var a, l, i = ((a = o.$style) === null || a === void 0 || (l = a.getCommonTheme) === null || l === void 0 ? void 0 : l.call(a)) || {}, u = i.primitive, c = i.semantic, d = i.global, m = i.style;
        O.load(u?.css, T({
          name: "primitive-variables"
        }, s)), O.load(c?.css, T({
          name: "semantic-variables"
        }, s)), O.load(d?.css, T({
          name: "global-variables"
        }, s)), O.loadStyle(T({
          name: "global-style"
        }, s), m), C.setLoadedStyleName("common");
      }
      if (!C.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var p, f, v, g, y = ((p = o.$style) === null || p === void 0 || (f = p.getDirectiveTheme) === null || f === void 0 ? void 0 : f.call(p)) || {}, _ = y.css, $ = y.style;
        (v = o.$style) === null || v === void 0 || v.load(_, T({
          name: "".concat(o.$style.name, "-variables")
        }, s)), (g = o.$style) === null || g === void 0 || g.loadStyle(T({
          name: "".concat(o.$style.name, "-style")
        }, s), $), C.setLoadedStyleName(o.$style.name);
      }
      if (!C.isStyleNameLoaded("layer-order")) {
        var h, b, k = (h = o.$style) === null || h === void 0 || (b = h.getLayerOrderThemeCSS) === null || b === void 0 ? void 0 : b.call(h);
        O.load(k, T({
          name: "layer-order",
          first: !0
        }, s)), C.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = e.preset();
    if (r && e.$attrSelector) {
      var o, s, a, l = ((o = e.$style) === null || o === void 0 || (s = o.getPresetTheme) === null || s === void 0 ? void 0 : s.call(o, r, "[".concat(e.$attrSelector, "]"))) || {}, i = l.css, u = (a = e.$style) === null || a === void 0 ? void 0 : a.load(i, T({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    G.clearLoadedStyleNames(), L.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    L.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, r, o, s, a) {
    var l, i, u = "on".concat(no(n)), c = S._getConfig(o, s), d = r?.$instance, m = S._usePT(d, S._getPT(o == null || (l = o.value) === null || l === void 0 ? void 0 : l.pt, e), S._getOptionValue, "hooks.".concat(u)), p = S._useDefaultPT(d, c == null || (i = c.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[e], S._getOptionValue, "hooks.".concat(u)), f = {
      el: r,
      binding: o,
      vnode: s,
      prevVnode: a
    };
    m?.(d, f), p?.(d, f);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Ue(e) ? e.apply(void 0, r) : Ie.apply(void 0, r);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, i, u, c, d) {
      var m, p, f, v;
      i._$instances = i._$instances || {};
      var g = S._getConfig(u, c), y = i._$instances[e] || {}, _ = Pe(y) ? T(T({}, n), n?.methods) : {};
      i._$instances[e] = T(T({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || i || void 0,
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
        $attrSelector: (m = i.$pd) === null || m === void 0 || (m = m[e]) === null || m === void 0 ? void 0 : m.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return S._getPT(g?.pt, void 0, function(h) {
            var b;
            return h == null || (b = h.directives) === null || b === void 0 ? void 0 : b[e];
          });
        },
        isUnstyled: function() {
          var h, b;
          return ((h = i._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (b = i._$instances[e]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.unstyled : g?.unstyled;
        },
        theme: function() {
          var h;
          return (h = i._$instances[e]) === null || h === void 0 || (h = h.$primevueConfig) === null || h === void 0 ? void 0 : h.theme;
        },
        preset: function() {
          var h;
          return (h = i._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.dt;
        },
        /* instance's methods */
        ptm: function() {
          var h, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return S._getPTValue(i._$instances[e], (h = i._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, b, T({}, k));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", k = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return S._getPTValue(i._$instances[e], h, b, k, !1);
        },
        cx: function() {
          var h, b, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = i._$instances[e]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : S._getOptionValue((b = i._$instances[e]) === null || b === void 0 || (b = b.$style) === null || b === void 0 ? void 0 : b.classes, k, T({}, E));
        },
        sx: function() {
          var h, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, E = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return k ? S._getOptionValue((h = i._$instances[e]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, b, T({}, E)) : void 0;
        }
      }, _), i.$instance = i._$instances[e], (p = (f = i.$instance)[l]) === null || p === void 0 || p.call(f, i, u, c, d), i["$".concat(e)] = i.$instance, S._hook(e, l, i, u, c, d), i.$pd || (i.$pd = {}), i.$pd[e] = T(T({}, (v = i.$pd) === null || v === void 0 ? void 0 : v[e]), {}, {
        name: e,
        instance: i._$instances[e]
      });
    }, o = function(l) {
      var i, u, c, d = l._$instances[e], m = d?.watch, p = function(g) {
        var y, _ = g.newValue, $ = g.oldValue;
        return m == null || (y = m.config) === null || y === void 0 ? void 0 : y.call(d, _, $);
      }, f = function(g) {
        var y, _ = g.newValue, $ = g.oldValue;
        return m == null || (y = m["config.ripple"]) === null || y === void 0 ? void 0 : y.call(d, _, $);
      };
      d.$watchersCallback = {
        config: p,
        "config.ripple": f
      }, m == null || (i = m.config) === null || i === void 0 || i.call(d, d?.$primevueConfig), J.on("config:change", p), m == null || (u = m["config.ripple"]) === null || u === void 0 || u.call(d, d == null || (c = d.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), J.on("config:ripple:change", f);
    }, s = function(l) {
      var i = l._$instances[e].$watchersCallback;
      i && (J.off("config:change", i.config), J.off("config:ripple:change", i["config.ripple"]), l._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(l, i, u, c) {
        l.$pd || (l.$pd = {}), l.$pd[e] = {
          name: e,
          attrSelector: bo("pd")
        }, r("created", l, i, u, c);
      },
      beforeMount: function(l, i, u, c) {
        var d;
        S._loadStyles((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance, i, u), r("beforeMount", l, i, u, c), o(l);
      },
      mounted: function(l, i, u, c) {
        var d;
        S._loadStyles((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance, i, u), r("mounted", l, i, u, c);
      },
      beforeUpdate: function(l, i, u, c) {
        r("beforeUpdate", l, i, u, c);
      },
      updated: function(l, i, u, c) {
        var d;
        S._loadStyles((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance, i, u), r("updated", l, i, u, c);
      },
      beforeUnmount: function(l, i, u, c) {
        var d;
        s(l), S._removeThemeListeners((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance), r("beforeUnmount", l, i, u, c);
      },
      unmounted: function(l, i, u, c) {
        var d;
        (d = l.$pd[e]) === null || d === void 0 || (d = d.instance) === null || d === void 0 || (d = d.scopedStyleEl) === null || d === void 0 || (d = d.value) === null || d === void 0 || d.remove(), r("unmounted", l, i, u, c);
      }
    };
  },
  extend: function() {
    var e = S._getMeta.apply(S, arguments), n = Bt(e, 2), r = n[0], o = n[1];
    return T({
      extend: function() {
        var a = S._getMeta.apply(S, arguments), l = Bt(a, 2), i = l[0], u = l[1];
        return S.extend(i, T(T(T({}, o), o?.methods), u));
      }
    }, S._extend(r, o));
  }
}, Ti = `
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
`, Ci = {
  root: "p-ink"
}, Pi = O.extend({
  name: "ripple-directive",
  style: Ti,
  classes: Ci
}), xi = S.extend({
  style: Pi
});
function Te(t) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Te(t);
}
function Oi(t) {
  return Ai(t) || Li(t) || Ei(t) || ki();
}
function ki() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ei(t, e) {
  if (t) {
    if (typeof t == "string") return rt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rt(t, e) : void 0;
  }
}
function Li(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ai(t) {
  if (Array.isArray(t)) return rt(t);
}
function rt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Ft(t, e, n) {
  return (e = ji(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ji(t) {
  var e = Ni(t, "string");
  return Te(e) == "symbol" ? e : e + "";
}
function Ni(t, e) {
  if (Te(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Te(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Cs = xi.extend("ripple", {
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
      n || (n = mo("span", Ft(Ft({
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
      var n = this, r = e.currentTarget, o = this.getInk(r);
      if (!(!o || getComputedStyle(o, null).display === "none")) {
        if (!this.isUnstyled() && ge(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !St(o) && !$t(o)) {
          var s = Math.max(uo(r), go(r));
          o.style.height = s + "px", o.style.width = s + "px";
        }
        var a = ho(r), l = e.pageX - a.left + document.body.scrollTop - $t(o) / 2, i = e.pageY - a.top + document.body.scrollLeft - St(o) / 2;
        o.style.top = i + "px", o.style.left = l + "px", !this.isUnstyled() && Je(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && ge(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && ge(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? Oi(e.children).find(function(n) {
        return fo(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function Ce(t) {
  "@babel/helpers - typeof";
  return Ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ce(t);
}
function Ii(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function Ri(t, e) {
  for (var n = 0; n < e.length; n++) {
    var r = e[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, Di(r.key), r);
  }
}
function Vi(t, e, n) {
  return e && Ri(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function Di(t) {
  var e = Mi(t, "string");
  return Ce(e) == "symbol" ? e : e + "";
}
function Mi(t, e) {
  if (Ce(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Ce(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var Ps = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Ii(this, t), this.element = e, this.listener = n;
  }
  return Vi(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = vo(this.element);
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
})(), xs = lt(), Wi = `
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
`, Bi = {
  root: function(e) {
    var n = e.props;
    return ["p-menu p-component", {
      "p-menu-overlay": n.popup
    }];
  },
  start: "p-menu-start",
  list: "p-menu-list",
  submenuLabel: "p-menu-submenu-label",
  separator: "p-menu-separator",
  end: "p-menu-end",
  item: function(e) {
    var n = e.instance;
    return ["p-menu-item", {
      "p-focus": n.id === n.focusedOptionId,
      "p-disabled": n.disabled()
    }];
  },
  itemContent: "p-menu-item-content",
  itemLink: "p-menu-item-link",
  itemIcon: "p-menu-item-icon",
  itemLabel: "p-menu-item-label"
};
O.extend({
  name: "menu",
  style: Wi,
  classes: Bi
});
const Hi = "data-wippy-overlay-layer";
function jn() {
  return typeof window < "u" && typeof window.document < "u";
}
function Nn() {
  return jn() && typeof HTMLElement < "u" && "popover" in HTMLElement.prototype;
}
function Ui() {
  return Nn() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Fi = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let zi = 0;
const We = /* @__PURE__ */ new WeakMap();
function zt(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Ki(t, e) {
  if (!Fi.test(t.className))
    return;
  const n = t.style.cssText;
  zt(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!We.has(t)) {
    const r = new MutationObserver(() => {
      const o = t.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && zt(t, e);
    });
    r.observe(t, { attributes: !0, attributeFilter: ["style"] }), We.set(t, r);
  }
}
function ut(t) {
  const e = We.get(t);
  e && (e.disconnect(), We.delete(t));
}
function Yi(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function ot(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const Be = /* @__PURE__ */ new Set(), dt = /* @__PURE__ */ new WeakMap();
let Kt = !1, it = !1;
const Yt = ["w-theme-dark", "w-theme-light"], Ne = "data-wippy-theme-root", st = /* @__PURE__ */ new WeakMap();
function qi(t) {
  const e = [];
  let n = t ? t.parentNode : null;
  for (; n && n.nodeType === 1; )
    e.push(n), n = n.parentNode;
  return e;
}
function Gi(t, e, n) {
  const r = [...qi(e), n.host], o = () => {
    let a;
    for (const l of r) {
      if (Yt.some((i) => l.classList.contains(i))) {
        a = l;
        break;
      }
      if (l.hasAttribute(Ne))
        break;
    }
    for (const l of Yt)
      t.classList.toggle(l, !!(a && a.classList.contains(l)));
    a ? t.setAttribute(Ne, "") : t.removeAttribute(Ne);
  };
  o();
  const s = new MutationObserver(o);
  for (const a of r)
    s.observe(a, { attributes: !0, attributeFilter: ["class", Ne] });
  st.set(t, s);
}
function In(t) {
  st.get(t)?.disconnect(), st.delete(t);
}
function Ji() {
  it = !1;
  for (const t of Be) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && ut(e);
      Be.delete(t), dt.get(t)?.disconnect(), In(t);
      continue;
    }
    t.childElementCount > 0 && ot(t);
  }
}
function qt() {
  it || (it = !0, requestAnimationFrame(Ji));
}
function Qi(t) {
  const e = document.createElement("div");
  e.setAttribute(Hi, "");
  const n = Nn();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  ot(e);
  const r = new MutationObserver((o) => {
    const s = e.__wippyAnchorName;
    for (const a of o) {
      if (s)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && Ki(l, s);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && ut(l);
    }
    e.isConnected && e.childElementCount > 0 && ot(e);
  });
  return r.observe(e, { childList: !0 }), dt.set(e, r), Be.add(e), Kt || (Kt = !0, window.addEventListener("scroll", qt, { capture: !0, passive: !0 }), window.addEventListener("resize", qt, { passive: !0 })), e;
}
function Gt(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Qi(t.hostRoot), Gi(t.layer, t.$el, t.hostRoot), Ui())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++zi}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function Jt(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && ut(e);
    Be.delete(t.layer), dt.get(t.layer)?.disconnect(), In(t.layer), t.layer.remove(), t.layer = null;
  }
}
let Qt = !1;
function Zi() {
  if (Qt)
    return;
  Qt = !0;
  const t = kn;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    jn() && (this.hostRoot = Yi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Gt(this), this.$watch("inline", (e) => {
      e ? Jt(this) : Gt(this);
    })));
  }, t.render = function() {
    return this.inline ? Ve(this.$slots, "default", { key: 0 }) : this.mounted ? cr(Xt, { key: 1, to: this.resolvedTarget || document.body }, [
      Ve(this.$slots, "default")
    ]) : en("", !0);
  }, t.unmounted = function() {
    Jt(this);
  };
}
const Os = {
  install: (t) => {
    Zi(), t.use(ni, { theme: "none" });
  }
};
export {
  vs as $,
  ps as A,
  O as B,
  go as C,
  cs as D,
  Ge as E,
  ws as F,
  ys as I,
  ls as J,
  gs as L,
  as as M,
  xs as O,
  Os as P,
  Cs as R,
  ms as S,
  St as T,
  mo as U,
  ss as W,
  _s as Y,
  yo as _,
  os as a,
  is as b,
  Ts as c,
  Pe as d,
  P as e,
  ro as f,
  fs as g,
  S as h,
  ds as i,
  us as j,
  kn as k,
  ns as l,
  uo as m,
  gn as n,
  Je as o,
  bs as p,
  $t as q,
  $s as r,
  di as s,
  Zr as t,
  rs as u,
  hs as v,
  bn as w,
  Ss as x,
  Ps as y,
  yn as z
};
//# sourceMappingURL=wc-runtime-P07ojyjC.js.map

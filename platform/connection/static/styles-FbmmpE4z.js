import { hasInjectionContext as dr, inject as Se, effectScope as ur, ref as $, markRaw as hr, createApp as fr, onMounted as gt, onUnmounted as mr, watch as ne, readonly as gr, getCurrentInstance as Fe, nextTick as vr, reactive as br, renderSlot as be, openBlock as yr, createBlock as xr, Teleport as vt, createCommentVNode as bt, h as wr } from "vue";
import { addCollection as kr } from "@iconify/vue";
import { config as We, addIcons as Sr, on as _r, applyThemeMode as he, host as Cr, hostCss as Tr, loadCss as Er } from "@wippy-fe/proxy";
var Ee = "data-wippy-visible";
function He(e) {
  const t = e.getAttribute(Ee);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Or = Object.defineProperty, Pr = (e, t, r) => t in e ? Or(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, y = (e, t, r) => Pr(e, typeof t != "symbol" ? t + "" : t, r), Ar = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], $r = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Be(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Lr(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r)
      for (const [o, n] of Object.entries(r)) {
        if ((o === "@light" || o === "@dark") && n && typeof n == "object") {
          for (const [i, l] of Object.entries(n)) {
            const s = typeof l == "string" ? Be(i) : null;
            s && t.add(s);
          }
          continue;
        }
        const a = typeof n == "string" ? Be(o) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function Nr(e) {
  if (e.length === 0)
    return "";
  const t = e.map((r) => `  ${r}: inherit;`).join(`
`);
  return `${$r} {
${t}
}`;
}
function jr(e, t) {
  const r = Nr(t);
  r && yt(e, r, "@wippy-fe/css-variables-bridge");
}
function Rr(e, t) {
  const o = (t ?? Ar).map(async (n) => {
    const a = Tr[n];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Er(a);
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
function zr(e, t) {
  const r = document.createElement("style");
  r.textContent = t, e.appendChild(r);
}
function yt(e, t, r) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, n];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", r), o.textContent = t, e.appendChild(o);
}
function Dr(e, t) {
  yt(e, t, "@wippy-fe/custom-css");
}
function xt(e) {
  return e.__wippyHost ?? null;
}
function Ir(e) {
  return e.replace(/-([a-z])/g, (t, r) => r.toUpperCase());
}
function Vr(e, t, r) {
  switch (r.type) {
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
        return r.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function _e(e, t) {
  const r = {}, o = [];
  for (const [n, a] of Object.entries(t.properties)) {
    const i = e.getAttribute(n), l = Ir(n);
    if (i === null) {
      a.default !== void 0 && (r[l] = a.default);
      continue;
    }
    const s = Vr(n, i, a);
    s.error ? o.push(s.error) : r[l] = s.value;
  }
  return { props: r, errors: o };
}
var Mr = class {
  constructor(e, t) {
    y(this, "_props"), y(this, "_errors"), y(this, "_content"), y(this, "_hostVisibility"), y(this, "_propsListeners", /* @__PURE__ */ new Set()), y(this, "_contentListeners", /* @__PURE__ */ new Set()), y(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), y(this, "_disposed", !1), y(this, "_emitToDom"), y(this, "props"), y(this, "events"), y(this, "content"), y(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const r = this;
    this.props = {
      get value() {
        return r._props;
      },
      get errors() {
        return r._errors;
      },
      subscribe(o, n) {
        return r._subscribeProps(o, n);
      }
    }, this.events = {
      emit(o, n) {
        r._disposed || r._emitToDom(o, n);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return r._content;
      },
      subscribe(o, n) {
        return r._subscribeContent(o, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return r._hostVisibility;
      },
      subscribe(o, n) {
        return r._subscribeHostVisibility(o, n);
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
}, Fr = class extends HTMLElement {
  constructor() {
    super(), y(this, "_internals"), y(this, "_contentObserver", null), y(this, "_initialized", !1), y(this, "_container", null), y(this, "_reactive", null), y(this, "_lastProps", null), y(this, "_lastErrors", []), y(this, "_lastContent", null), y(this, "_themeUnsub", null), y(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = He(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...r, Ee])];
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
    return xt(this);
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
      let r, o;
      if (this._lastProps !== null)
        r = this._lastProps, o = this._lastErrors;
      else {
        const a = _e(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), r = a.props, o = a.errors, this._lastProps = r, this._lastErrors = o;
      }
      const n = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = n), this._reactive = new Mr(
        { props: r, errors: o, content: n, hasContent: t, hostVisibility: this._hostVisible },
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
      let o;
      if (t)
        o = this._container;
      else {
        this.onInit(r), e.inlineCss && zr(r, e.inlineCss);
        try {
          const c = We?.theming, p = Lr(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          jr(r, p);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = We?.theming, p = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            p && Dr(r, p);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Rr(r, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const s = e.containerClasses ?? [];
        s.length > 0 && o.classList.add(...s), r.appendChild(o), this._container = o, Sr(kr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = _r("@theme", (s) => this._applyTheme(s)));
      const { props: n, errors: a } = _e(this, e.propsSchema);
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
      })), this.onMount(r, o, i, a, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Cr.getThemeMode?.()) {
    he(e, this), this._container && he(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), he("auto", this), this._container && he("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, r) {
    if (t === r)
      return;
    if (e === Ee) {
      const l = this._hostVisible, s = He(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const o = this.constructor.wippyConfig, { props: n, errors: a } = _e(this, o.propsSchema);
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
function Wr(e) {
  return e.__wippyHostBus ?? null;
}
function Hr(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let wt;
const kt = (e) => wt = e, Br = () => dr() && Se(St) || wt, St = (
  /* istanbul ignore next */
  Symbol()
);
function Ur() {
  const e = ur(!0), t = e.run(() => $({}));
  let r = [], o = [];
  const n = hr({
    install(a) {
      kt(n), n._a = a, a.provide(St, n), a.config.globalProperties.$pinia = n, o.forEach((i) => r.push(i)), o = [];
    },
    use(a) {
      return this._a ? r.push(a) : o.push(a), this;
    },
    _p: r,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return n;
}
var Yr = Object.defineProperty, Kr = (e, t, r) => t in e ? Yr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, te = (e, t, r) => Kr(e, typeof t != "symbol" ? t + "" : t, r), _t = /* @__PURE__ */ Symbol("wippy:emit"), Ct = /* @__PURE__ */ Symbol("wippy:props"), qr = /* @__PURE__ */ Symbol("wippy:props_error"), Jr = /* @__PURE__ */ Symbol("wippy:content"), Gr = /* @__PURE__ */ Symbol("wippy:panel-id"), Qr = /* @__PURE__ */ Symbol("wippy:layout-bus"), Zr = /* @__PURE__ */ Symbol("wippy:host"), Tt = /* @__PURE__ */ Symbol("wippy:host-visibility");
function vn() {
  const e = Se(Ct);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Xr() {
  const e = Se(_t);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function eo() {
  const e = Se(Tt);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function bn(e) {
  const t = eo();
  let r = !1, o = null, n = !1;
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
      if (o === l && (o = null, r && n))
        return n = !1, a();
    });
    return o = l, l;
  }
  return gt(() => (r = !0, a())), mr(() => {
    r = !1, n = !1;
  }), ne(t, (i, l) => {
    if (r && l === !1 && i === !0)
      return a();
  }), t;
}
var yn = class extends Fr {
  constructor() {
    super(...arguments), te(this, "_vueApp", null), te(this, "_propsRef", $({})), te(this, "_errorsRef", $([])), te(this, "_contentRef", $(null)), te(this, "_hostVisibilityRef", $(null)), te(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, r, o, n, a) {
    const i = this.constructor.vueConfig;
    this._propsRef.value = r, this._errorsRef.value = o, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of o)
      this.emitEvent("invalid", { message: c });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((c, p) => {
      this._propsRef.value = c, this._errorsRef.value = [...p];
      for (const u of p)
        this.emitEvent("invalid", { message: u });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: l.signal });
    const s = (c) => {
      if (l.signal.aborted)
        return;
      const p = Br(), u = fr(c.rootComponent);
      this._vueApp = u;
      const d = Ur();
      if (c.piniaPlugins)
        for (const h of c.piniaPlugins)
          d.use(h);
      if (u.use(d), c.plugins)
        for (const h of c.plugins)
          u.use(h);
      u.provide(Ct, this._propsRef), u.provide(qr, this._errorsRef), u.provide(_t, this.emitEvent.bind(this)), u.provide(Jr, this._contentRef), u.provide(Tt, this._hostVisibilityRef), u.provide(Gr, Hr(this)), u.provide(Qr, Wr(this)), u.provide(Zr, xt(this)), c.providers && c.providers(u, this), u.mount(t), p && kt(p);
    };
    if (i.rootComponent)
      s(i);
    else if (i.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), i.lazyConfig().then((p) => {
        l.signal.aborted || (c.remove(), s(p));
      }).catch((p) => {
        if (l.signal.aborted)
          return;
        const u = p instanceof Error ? p.message : String(p), d = document.createElement("wippy-error");
        d.setAttribute("title", "Failed to load"), d.setAttribute("message", u), c.replaceWith(d), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, to = Object.defineProperty, Ue = Object.getOwnPropertySymbols, ro = Object.prototype.hasOwnProperty, oo = Object.prototype.propertyIsEnumerable, Ye = (e, t, r) => t in e ? to(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, no = (e, t) => {
  for (var r in t || (t = {})) ro.call(t, r) && Ye(e, r, t[r]);
  if (Ue) for (var r of Ue(t)) oo.call(t, r) && Ye(e, r, t[r]);
  return e;
};
function ze(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Oe(e, t, r = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || r.has(e) || r.has(t)) return !1;
  r.add(e).add(t);
  let o = Array.isArray(e), n = Array.isArray(t), a, i, l;
  if (o && n) {
    if (i = e.length, i != t.length) return !1;
    for (a = i; a-- !== 0; ) if (!Oe(e[a], t[a], r)) return !1;
    return !0;
  }
  if (o != n) return !1;
  let s = e instanceof Date, c = t instanceof Date;
  if (s != c) return !1;
  if (s && c) return e.getTime() == t.getTime();
  let p = e instanceof RegExp, u = t instanceof RegExp;
  if (p != u) return !1;
  if (p && u) return e.toString() == t.toString();
  let d = Object.keys(e);
  if (i = d.length, i !== Object.keys(t).length) return !1;
  for (a = i; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, d[a])) return !1;
  for (a = i; a-- !== 0; ) if (l = d[a], !Oe(e[l], t[l], r)) return !1;
  return !0;
}
function ao(e, t) {
  return Oe(e, t);
}
function Et(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function b(e) {
  return !ze(e);
}
function Pe(e, t) {
  if (!e || !t) return null;
  try {
    let r = e[t];
    if (b(r)) return r;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Et(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let r = t.split("."), o = e;
      for (let n = 0, a = r.length; n < a; ++n) {
        if (o == null) return null;
        o = o[r[n]];
      }
      return o;
    }
  }
  return null;
}
function io(e, t, r) {
  return r ? Pe(e, r) === Pe(t, r) : ao(e, t);
}
function D(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Ot(e = {}, t = {}) {
  let r = no({}, e);
  return Object.keys(t).forEach((o) => {
    let n = o;
    D(t[n]) && n in e && D(e[n]) ? r[n] = Ot(e[n], t[n]) : r[n] = t[n];
  }), r;
}
function so(...e) {
  return e.reduce((t, r, o) => o === 0 ? r : Ot(t, r), {});
}
function xn(e, t) {
  let r = -1;
  if (b(e)) try {
    r = e.findLastIndex(t);
  } catch {
    r = e.lastIndexOf([...e].reverse().find(t));
  }
  return r;
}
function E(e, ...t) {
  return Et(e) ? e(...t) : e;
}
function I(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Ke(e) {
  return I(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function lo(e, t = "", r = {}) {
  let o = Ke(t).split("."), n = o.shift();
  if (n) {
    if (D(e)) {
      let a = Object.keys(e).find((i) => Ke(i) === n) || "";
      return lo(E(e[a], r), o.join("."), r);
    }
    return;
  }
  return E(e, r);
}
function wn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function co(e) {
  return b(e) && !isNaN(e);
}
function kn(e = "") {
  return b(e) && e.length === 1 && !!e.match(/\S| /);
}
function q(e, t) {
  if (t) {
    let r = t.test(e);
    return t.lastIndex = 0, r;
  }
  return !1;
}
function po(...e) {
  return so(...e);
}
function se(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function S(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let r in t) e = e.replace(t[r], r);
  }
  return e;
}
function Sn(e) {
  return I(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Pt(e) {
  return I(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function At() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, r) {
    let o = e.get(t);
    return o ? o.push(r) : o = [r], e.set(t, o), this;
  }, off(t, r) {
    let o = e.get(t);
    return o && o.splice(o.indexOf(r) >>> 0, 1), this;
  }, emit(t, r) {
    let o = e.get(t);
    o && o.forEach((n) => {
      n(r);
    });
  }, clear() {
    e.clear();
  } };
}
function uo(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function qe(e, t) {
  if (e && t) {
    let r = (o) => {
      uo(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(r));
  }
}
function ho() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function _n(e) {
  typeof e == "string" ? qe(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, ho() + "px"), qe(document.body, e?.className || "p-overflow-hidden"));
}
function Je(e, t) {
  if (e && t) {
    let r = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(r));
  }
}
function Cn(e) {
  typeof e == "string" ? Je(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), Je(document.body, e?.className || "p-overflow-hidden"));
}
function Ae(e) {
  for (let t of document?.styleSheets) try {
    for (let r of t?.cssRules) for (let o of r?.style) if (e.test(o)) return { name: o, value: r.style.getPropertyValue(o).trim() };
  } catch {
  }
  return null;
}
function $t(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [r, o] = [e.style.visibility, e.style.display], n = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = n.width || e.offsetWidth, t.height = n.height || e.offsetHeight, e.style.display = o, e.style.visibility = r;
  }
  return t;
}
function Lt() {
  let e = window, t = document, r = t.documentElement, o = t.getElementsByTagName("body")[0], n = e.innerWidth || r.clientWidth || o.clientWidth, a = e.innerHeight || r.clientHeight || o.clientHeight;
  return { width: n, height: a };
}
function $e(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function fo() {
  let e = document.documentElement;
  return (window.pageXOffset || $e(e)) - (e.clientLeft || 0);
}
function mo() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function go(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function Tn(e, t, r = !0) {
  var o, n, a, i;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : $t(e), s = l.height, c = l.width, p = t.offsetHeight, u = t.offsetWidth, d = t.getBoundingClientRect(), h = mo(), f = fo(), g = Lt(), m, v, x = "top";
    d.top + p + s > g.height ? (m = d.top + h - s, x = "bottom", m < 0 && (m = h)) : m = p + d.top + h, d.left + c > g.width ? v = Math.max(0, d.left + f + u - c) : v = d.left + f, go(e) ? e.style.insetInlineEnd = v + "px" : e.style.insetInlineStart = v + "px", e.style.top = m + "px", e.style.transformOrigin = x, r && (e.style.marginTop = x === "bottom" ? `calc(${(n = (o = Ae(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? n : "2px"} * -1)` : (i = (a = Ae(/-anchor-gutter$/)) == null ? void 0 : a.value) != null ? i : "");
  }
}
function En(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([r, o]) => e.style[r] = o));
}
function On(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Pn(e, t, r = !0, o = void 0) {
  var n;
  if (e) {
    let a = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : $t(e), i = t.offsetHeight, l = t.getBoundingClientRect(), s = Lt(), c, p, u = o ?? "top";
    if (!o && l.top + i + a.height > s.height ? (c = -1 * a.height, u = "bottom", l.top + c < 0 && (c = -1 * l.top)) : c = i, a.width > s.width ? p = l.left * -1 : l.left + a.width > s.width ? p = (l.left + a.width - s.width) * -1 : p = 0, e.style.top = c + "px", e.style.insetInlineStart = p + "px", e.style.transformOrigin = u, r) {
      let d = (n = Ae(/-anchor-gutter$/)) == null ? void 0 : n.value;
      e.style.marginTop = u === "bottom" ? `calc(${d ?? "2px"} * -1)` : d ?? "";
    }
  }
}
function Nt(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function vo(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Nt(e));
}
function ie(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function ye(e, t = {}) {
  if (ie(e)) {
    let r = (o, n) => {
      var a, i;
      let l = (a = e?.$attrs) != null && a[o] ? [(i = e?.$attrs) == null ? void 0 : i[o]] : [];
      return [n].flat().reduce((s, c) => {
        if (c != null) {
          let p = typeof c;
          if (p === "string" || p === "number") s.push(c);
          else if (p === "object") {
            let u = Array.isArray(c) ? r(o, c) : Object.entries(c).map(([d, h]) => o === "style" && (h || h === 0) ? `${d.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${h}` : h ? d : void 0);
            s = u.length ? s.concat(u.filter((d) => !!d)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(t).forEach(([o, n]) => {
      if (n != null) {
        let a = o.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), n) : o === "p-bind" || o === "pBind" ? ye(e, n) : (n = o === "class" ? [...new Set(r("class", n))].join(" ").trim() : o === "style" ? r("style", n).join(";").trim() : n, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = n), e.setAttribute(o, n));
      }
    });
  }
}
function An(e, t = {}, ...r) {
  {
    let o = document.createElement(e);
    return ye(o, t), o.append(...r), o;
  }
}
function bo(e, t) {
  return ie(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function yo(e, t) {
  return ie(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function $n(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function Ln(e, t) {
  if (ie(e)) {
    let r = e.getAttribute(t);
    return isNaN(r) ? r === "true" || r === "false" ? r === "true" : r : +r;
  }
}
function jt(e, t = "") {
  let r = bo(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), o = [];
  for (let n of r) getComputedStyle(n).display != "none" && getComputedStyle(n).visibility != "hidden" && o.push(n);
  return o;
}
function Nn(e, t) {
  let r = jt(e, t);
  return r.length > 0 ? r[0] : null;
}
function jn(e) {
  if (e) {
    let t = e.offsetHeight, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingTop) + parseFloat(r.paddingBottom) + parseFloat(r.borderTopWidth) + parseFloat(r.borderBottomWidth), t;
  }
  return 0;
}
function Rn(e, t) {
  let r = jt(e, t);
  return r.length > 0 ? r[r.length - 1] : null;
}
function zn(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || $e(document.documentElement) || $e(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Dn(e, t) {
  return e ? e.offsetHeight : 0;
}
function Rt(e, t = []) {
  let r = Nt(e);
  return r === null ? t : Rt(r, t.concat([r]));
}
function In(e) {
  let t = [];
  if (e) {
    let r = Rt(e), o = /(auto|scroll)/, n = (a) => {
      try {
        let i = window.getComputedStyle(a, null);
        return o.test(i.getPropertyValue("overflow")) || o.test(i.getPropertyValue("overflowX")) || o.test(i.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let a of r) {
      let i = a.nodeType === 1 && a.dataset.scrollselectors;
      if (i) {
        let l = i.split(",");
        for (let s of l) {
          let c = yo(a, s);
          c && n(c) && t.push(c);
        }
      }
      a.nodeType !== 9 && n(a) && t.push(a);
    }
  }
  return t;
}
function Vn(e) {
  if (e) {
    let t = e.offsetWidth, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingLeft) + parseFloat(r.paddingRight) + parseFloat(r.borderLeftWidth) + parseFloat(r.borderRightWidth), t;
  }
  return 0;
}
function Mn() {
  return /(android)/i.test(navigator.userAgent);
}
function zt() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Fn(e, t = "") {
  return ie(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function Wn(e) {
  return !!(e && e.offsetParent != null);
}
function Hn() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function xo(e, t = "", r) {
  ie(e) && r !== null && r !== void 0 && e.setAttribute(t, r);
}
var wo = Object.defineProperty, ko = Object.defineProperties, So = Object.getOwnPropertyDescriptors, xe = Object.getOwnPropertySymbols, Dt = Object.prototype.hasOwnProperty, It = Object.prototype.propertyIsEnumerable, Ge = (e, t, r) => t in e ? wo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, C = (e, t) => {
  for (var r in t || (t = {})) Dt.call(t, r) && Ge(e, r, t[r]);
  if (xe) for (var r of xe(t)) It.call(t, r) && Ge(e, r, t[r]);
  return e;
}, Ce = (e, t) => ko(e, So(t)), P = (e, t) => {
  var r = {};
  for (var o in e) Dt.call(e, o) && t.indexOf(o) < 0 && (r[o] = e[o]);
  if (e != null && xe) for (var o of xe(e)) t.indexOf(o) < 0 && It.call(e, o) && (r[o] = e[o]);
  return r;
}, _o = At(), A = _o, le = /{([^}]*)}/g, Vt = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Mt = /var\([^)]+\)/g;
function Qe(e) {
  return I(e) ? e.replace(/[A-Z]/g, (t, r) => r === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Co(e) {
  return D(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function To(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Le(e = "", t = "") {
  return To(`${I(e, !1) && I(t, !1) ? `${e}-` : e}${t}`);
}
function Ft(e = "", t = "") {
  return `--${Le(e, t)}`;
}
function Eo(e = "") {
  let t = (e.match(/{/g) || []).length, r = (e.match(/}/g) || []).length;
  return (t + r) % 2 !== 0;
}
function Wt(e, t = "", r = "", o = [], n) {
  if (I(e)) {
    let a = e.trim();
    if (Eo(a)) return;
    if (q(a, le)) {
      let i = a.replaceAll(le, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((c) => !o.some((p) => q(c, p)));
        return `var(${Ft(r, Pt(s.join("-")))}${b(n) ? `, ${n}` : ""})`;
      });
      return q(i.replace(Mt, "0"), Vt) ? `calc(${i})` : i;
    }
    return a;
  } else if (co(e)) return e;
}
function Oo(e, t, r) {
  I(t, !1) && e.push(`${t}:${r};`);
}
function oe(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Ht(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function r(i, l) {
    let s = [], c = 0, p = "", u = null, d = 0;
    for (; c <= i.length; ) {
      let h = i[c];
      if ((h === '"' || h === "'" || h === "`") && i[c - 1] !== "\\" && (u = u === h ? null : h), !u && (h === "(" && d++, h === ")" && d--, (h === "," || c === i.length) && d === 0)) {
        let f = p.trim();
        f.startsWith("dt(") ? s.push(Ht(f, l)) : s.push(o(f)), p = "", c++;
        continue;
      }
      h !== void 0 && (p += h), c++;
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
    let [l, s] = n[i], c = e.slice(l + 3, s), p = r(c, t), u = t(...p);
    e = e.slice(0, l) + u + e.slice(s + 1);
  }
  return e;
}
var Bn = (e) => {
  var t;
  let r = w.getTheme(), o = Ne(r, e, void 0, "variable"), n = (t = o?.match(/--[\w-]+/g)) == null ? void 0 : t[0], a = Ne(r, e, void 0, "value");
  return { name: n, variable: o, value: a };
}, J = (...e) => Ne(w.getTheme(), ...e), Ne = (e = {}, t, r, o) => {
  if (t) {
    let { variable: n, options: a } = w.defaults || {}, { prefix: i, transform: l } = e?.options || a || {}, s = q(t, le) ? t : `{${t}}`;
    return o === "value" || ze(o) && l === "strict" ? w.getTokenValue(t) : Wt(s, void 0, i, [n.excludedKeyRegex], r);
  }
  return "";
};
function fe(e, ...t) {
  if (e instanceof Array) {
    let r = e.reduce((o, n, a) => {
      var i;
      return o + n + ((i = E(t[a], { dt: J })) != null ? i : "");
    }, "");
    return Ht(r, J);
  }
  return E(e, { dt: J });
}
function Po(e, t = {}) {
  let r = w.defaults.variable, { prefix: o = r.prefix, selector: n = r.selector, excludedKeyRegex: a = r.excludedKeyRegex } = t, i = [], l = [], s = [{ node: e, path: o }];
  for (; s.length; ) {
    let { node: p, path: u } = s.pop();
    for (let d in p) {
      let h = p[d], f = Co(h), g = q(d, a) ? Le(u) : Le(u, Pt(d));
      if (D(f)) s.push({ node: f, path: g });
      else {
        let m = Ft(g), v = Wt(f, g, o, [a]);
        Oo(l, m, v);
        let x = g;
        o && x.startsWith(o + "-") && (x = x.slice(o.length + 1)), i.push(x.replace(/-/g, "."));
      }
    }
  }
  let c = l.join("");
  return { value: l, tokens: i, declarations: c, css: oe(n, c) };
}
var _ = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    var o;
    return (o = t.map((n) => n.resolve(r)).find((n) => n.matched)) != null ? o : this.rules.custom.resolve(r);
  });
} }, _toVariables(e, t) {
  return Po(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var a, i, l, s, c, p, u;
  let { preset: d, options: h } = t, f, g, m, v, x, V, M;
  if (b(d) && h.transform !== "strict") {
    let { primitive: G, semantic: F, extend: L } = d, N = F || {}, { colorScheme: j } = N, W = P(N, ["colorScheme"]), R = L || {}, { colorScheme: H } = R, B = P(R, ["colorScheme"]), z = j || {}, { dark: U } = z, Q = P(z, ["dark"]), Y = H || {}, { dark: Z } = Y, X = P(Y, ["dark"]), O = b(G) ? this._toVariables({ primitive: G }, h) : {}, T = b(W) ? this._toVariables({ semantic: W }, h) : {}, K = b(Q) ? this._toVariables({ light: Q }, h) : {}, ue = b(U) ? this._toVariables({ dark: U }, h) : {}, ee = b(B) ? this._toVariables({ semantic: B }, h) : {}, Ve = b(X) ? this._toVariables({ light: X }, h) : {}, Me = b(Z) ? this._toVariables({ dark: Z }, h) : {}, [Kt, qt] = [(a = O.declarations) != null ? a : "", O.tokens], [Jt, Gt] = [(i = T.declarations) != null ? i : "", T.tokens || []], [Qt, Zt] = [(l = K.declarations) != null ? l : "", K.tokens || []], [Xt, er] = [(s = ue.declarations) != null ? s : "", ue.tokens || []], [tr, rr] = [(c = ee.declarations) != null ? c : "", ee.tokens || []], [or, nr] = [(p = Ve.declarations) != null ? p : "", Ve.tokens || []], [ar, ir] = [(u = Me.declarations) != null ? u : "", Me.tokens || []];
    f = this.transformCSS(e, Kt, "light", "variable", h, o, n), g = qt;
    let sr = this.transformCSS(e, `${Jt}${Qt}`, "light", "variable", h, o, n), lr = this.transformCSS(e, `${Xt}`, "dark", "variable", h, o, n);
    m = `${sr}${lr}`, v = [.../* @__PURE__ */ new Set([...Gt, ...Zt, ...er])];
    let cr = this.transformCSS(e, `${tr}${or}color-scheme:light`, "light", "variable", h, o, n), pr = this.transformCSS(e, `${ar}color-scheme:dark`, "dark", "variable", h, o, n);
    x = `${cr}${pr}`, V = [.../* @__PURE__ */ new Set([...rr, ...nr, ...ir])], M = E(d.css, { dt: J });
  }
  return { primitive: { css: f, tokens: g }, semantic: { css: m, tokens: v }, global: { css: x, tokens: V }, style: M };
}, getPreset({ name: e = "", preset: t = {}, options: r, params: o, set: n, defaults: a, selector: i }) {
  var l, s, c;
  let p, u, d;
  if (b(t) && r.transform !== "strict") {
    let h = e.replace("-directive", ""), f = t, { colorScheme: g, extend: m, css: v } = f, x = P(f, ["colorScheme", "extend", "css"]), V = m || {}, { colorScheme: M } = V, G = P(V, ["colorScheme"]), F = g || {}, { dark: L } = F, N = P(F, ["dark"]), j = M || {}, { dark: W } = j, R = P(j, ["dark"]), H = b(x) ? this._toVariables({ [h]: C(C({}, x), G) }, r) : {}, B = b(N) ? this._toVariables({ [h]: C(C({}, N), R) }, r) : {}, z = b(L) ? this._toVariables({ [h]: C(C({}, L), W) }, r) : {}, [U, Q] = [(l = H.declarations) != null ? l : "", H.tokens || []], [Y, Z] = [(s = B.declarations) != null ? s : "", B.tokens || []], [X, O] = [(c = z.declarations) != null ? c : "", z.tokens || []], T = this.transformCSS(h, `${U}${Y}`, "light", "variable", r, n, a, i), K = this.transformCSS(h, X, "dark", "variable", r, n, a, i);
    p = `${T}${K}`, u = [.../* @__PURE__ */ new Set([...Q, ...Z, ...O])], d = E(v, { dt: J });
  }
  return { css: p, tokens: u, style: d };
}, getPresetC({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var a;
  let { preset: i, options: l } = t, s = (a = i?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: s, options: l, params: r, set: o, defaults: n });
}, getPresetD({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var a, i;
  let l = e.replace("-directive", ""), { preset: s, options: c } = t, p = ((a = s?.components) == null ? void 0 : a[l]) || ((i = s?.directives) == null ? void 0 : i[l]);
  return this.getPreset({ name: l, preset: p, options: c, params: r, set: o, defaults: n });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var r;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (r = e.darkModeSelector) != null ? r : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, r, o) {
  let { cssLayer: n } = t;
  return n ? `@layer ${E(n.order || n.name || "primeui", r)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: r, props: o = {}, set: n, defaults: a }) {
  let i = this.getCommon({ name: e, theme: t, params: r, set: n, defaults: a }), l = Object.entries(o).reduce((s, [c, p]) => s.push(`${c}="${p}"`) && s, []).join(" ");
  return Object.entries(i || {}).reduce((s, [c, p]) => {
    if (D(p) && Object.hasOwn(p, "css")) {
      let u = se(p.css), d = `${c}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${d}" ${l}>${u}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: r, props: o = {}, set: n, defaults: a }) {
  var i;
  let l = { name: e, theme: t, params: r, set: n, defaults: a }, s = (i = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : i.css, c = Object.entries(o).reduce((p, [u, d]) => p.push(`${u}="${d}"`) && p, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${se(s)}</style>` : "";
}, createTokens(e = {}, t, r = "", o = "", n = {}) {
  let a = function(l, s = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    c.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let p = this.value;
    if (typeof this.value == "string" && le.test(this.value)) {
      let u = this.value.trim().replace(le, (d) => {
        var h;
        let f = d.slice(1, -1), g = this.tokens[f];
        if (!g) return console.warn(`Token not found for path: ${f}`), "__UNRESOLVED__";
        let m = g.computed(l, s, c);
        return Array.isArray(m) && m.length === 2 ? `light-dark(${m[0].value},${m[1].value})` : (h = m?.value) != null ? h : "__UNRESOLVED__";
      });
      p = Vt.test(u.replace(Mt, "0")) ? `calc(${u})` : u;
    }
    return ze(s.binding) && delete s.binding, c.pop(), { colorScheme: l, path: this.path, paths: s, value: p.includes("__UNRESOLVED__") ? void 0 : p };
  }, i = (l, s, c) => {
    Object.entries(l).forEach(([p, u]) => {
      let d = q(p, t.variable.excludedKeyRegex) ? s : s ? `${s}.${Qe(p)}` : Qe(p), h = c ? `${c}.${p}` : p;
      D(u) ? i(u, d, h) : (n[d] || (n[d] = { paths: [], computed: (f, g = {}, m = []) => {
        if (n[d].paths.length === 1) return n[d].paths[0].computed(n[d].paths[0].scheme, g.binding, m);
        if (f && f !== "none") for (let v = 0; v < n[d].paths.length; v++) {
          let x = n[d].paths[v];
          if (x.scheme === f) return x.computed(f, g.binding, m);
        }
        return n[d].paths.map((v) => v.computed(v.scheme, g[v.scheme], m));
      } }), n[d].paths.push({ path: h, value: u, scheme: h.includes("colorScheme.light") ? "light" : h.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: n }));
    });
  };
  return i(e, r, o), n;
}, getTokenValue(e, t, r) {
  var o;
  let n = ((l) => l.split(".").filter((s) => !q(s.toLowerCase(), r.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, i = [(o = e[n]) == null ? void 0 : o.computed(a)].flat().filter((l) => l);
  return i.length === 1 ? i[0].value : i.reduce((l = {}, s) => {
    let c = s, { colorScheme: p } = c, u = P(c, ["colorScheme"]);
    return l[p] = u, l;
  }, void 0);
}, getSelectorRule(e, t, r, o) {
  return r === "class" || r === "attr" ? oe(b(t) ? `${e}${t},${e} ${t}` : e, o) : oe(e, oe(t ?? ":root,:host", o));
}, transformCSS(e, t, r, o, n = {}, a, i, l) {
  if (b(t)) {
    let { cssLayer: s } = n;
    if (o !== "style") {
      let c = this.getColorSchemeOption(n, i);
      t = r === "dark" ? c.reduce((p, { type: u, selector: d }) => (b(d) && (p += d.includes("[CSS]") ? d.replace("[CSS]", t) : this.getSelectorRule(d, l, u, t)), p), "") : oe(l ?? ":root,:host", t);
    }
    if (s) {
      let c = { name: "primeui" };
      D(s) && (c.name = E(s.name, { name: e, type: o })), b(c.name) && (t = oe(`@layer ${c.name}`, t), a?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, w = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Ce(C({}, t), { options: C(C({}, this.defaults.options), t.options) }), this._tokens = _.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = Ce(C({}, this.theme), { preset: e }), this._tokens = _.createTokens(e, this.defaults), this.clearLoadedStyleNames(), A.emit("preset:change", e), A.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Ce(C({}, this.theme), { options: e }), this.clearLoadedStyleNames(), A.emit("options:change", e), A.emit("theme:change", this.theme);
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
  return _.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return _.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return _.getPresetC(r);
}, getDirective(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return _.getPresetD(r);
}, getCustomPreset(e = "", t, r, o) {
  let n = { name: e, preset: t, options: this.options, selector: r, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return _.getPreset(n);
}, getLayerOrderCSS(e = "") {
  return _.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, r = "style", o) {
  return _.transformCSS(e, t, o, r, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, r = {}) {
  return _.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, r = {}) {
  return _.getStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), A.emit(`theme:${t}:load`, e), !this._loadingStyles.size && A.emit("theme:load"));
} }, k = {
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
  var r = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!r) {
    if (Array.isArray(e) || (r = Ao(e)) || t) {
      r && (e = r);
      var o = 0, n = function() {
      };
      return { s: n, n: function() {
        return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] };
      }, e: function(c) {
        throw c;
      }, f: n };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var a, i = !0, l = !1;
  return { s: function() {
    r = r.call(e);
  }, n: function() {
    var c = r.next();
    return i = c.done, c;
  }, e: function(c) {
    l = !0, a = c;
  }, f: function() {
    try {
      i || r.return == null || r.return();
    } finally {
      if (l) throw a;
    }
  } };
}
function Ao(e, t) {
  if (e) {
    if (typeof e == "string") return Xe(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Xe(e, t) : void 0;
  }
}
function Xe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, o = Array(t); r < t; r++) o[r] = e[r];
  return o;
}
var Un = {
  filter: function(t, r, o, n, a) {
    var i = [];
    if (!t)
      return i;
    var l = Ze(t), s;
    try {
      for (l.s(); !(s = l.n()).done; ) {
        var c = s.value;
        if (typeof c == "string") {
          if (this.filters[n](c, o, a)) {
            i.push(c);
            continue;
          }
        } else {
          var p = Ze(r), u;
          try {
            for (p.s(); !(u = p.n()).done; ) {
              var d = u.value, h = Pe(c, d);
              if (this.filters[n](h, o, a)) {
                i.push(c);
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
    return i;
  },
  filters: {
    startsWith: function(t, r, o) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var n = S(r.toString()).toLocaleLowerCase(o), a = S(t.toString()).toLocaleLowerCase(o);
      return a.slice(0, n.length) === n;
    },
    contains: function(t, r, o) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var n = S(r.toString()).toLocaleLowerCase(o), a = S(t.toString()).toLocaleLowerCase(o);
      return a.indexOf(n) !== -1;
    },
    notContains: function(t, r, o) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var n = S(r.toString()).toLocaleLowerCase(o), a = S(t.toString()).toLocaleLowerCase(o);
      return a.indexOf(n) === -1;
    },
    endsWith: function(t, r, o) {
      if (r == null || r === "")
        return !0;
      if (t == null)
        return !1;
      var n = S(r.toString()).toLocaleLowerCase(o), a = S(t.toString()).toLocaleLowerCase(o);
      return a.indexOf(n, a.length - n.length) !== -1;
    },
    equals: function(t, r, o) {
      return r == null || r === "" ? !0 : t == null ? !1 : t.getTime && r.getTime ? t.getTime() === r.getTime() : S(t.toString()).toLocaleLowerCase(o) == S(r.toString()).toLocaleLowerCase(o);
    },
    notEquals: function(t, r, o) {
      return r == null || r === "" ? !1 : t == null ? !0 : t.getTime && r.getTime ? t.getTime() !== r.getTime() : S(t.toString()).toLocaleLowerCase(o) != S(r.toString()).toLocaleLowerCase(o);
    },
    in: function(t, r) {
      if (r == null || r.length === 0)
        return !0;
      for (var o = 0; o < r.length; o++)
        if (io(t, r[o]))
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
function ce(e) {
  "@babel/helpers - typeof";
  return ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ce(e);
}
function et(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function tt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? et(Object(r), !0).forEach(function(o) {
      Lo(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : et(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Lo(e, t, r) {
  return (t = No(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function No(e) {
  var t = jo(e, "string");
  return ce(t) == "symbol" ? t : t + "";
}
function jo(e, t) {
  if (ce(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (ce(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ro(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Fe() && Fe().components ? gt(e) : t ? e() : vr(e);
}
var zo = 0;
function Do(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = $(!1), o = $(e), n = $(null), a = zt() ? window.document : void 0, i = t.document, l = i === void 0 ? a : i, s = t.immediate, c = s === void 0 ? !0 : s, p = t.manual, u = p === void 0 ? !1 : p, d = t.name, h = d === void 0 ? "style_".concat(++zo) : d, f = t.id, g = f === void 0 ? void 0 : f, m = t.media, v = m === void 0 ? void 0 : m, x = t.nonce, V = x === void 0 ? void 0 : x, M = t.first, G = M === void 0 ? !1 : M, F = t.onMounted, L = F === void 0 ? void 0 : F, N = t.onUpdated, j = N === void 0 ? void 0 : N, W = t.onLoad, R = W === void 0 ? void 0 : W, H = t.props, B = H === void 0 ? {} : H, z = function() {
  }, U = function(Z) {
    var X = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var O = tt(tt({}, B), X), T = O.name || h, K = O.id || g, ue = O.nonce || V;
      n.value = l.querySelector('style[data-primevue-style-id="'.concat(T, '"]')) || l.getElementById(K) || l.createElement("style"), n.value.isConnected || (o.value = Z || e, ye(n.value, {
        type: "text/css",
        id: K,
        media: v,
        nonce: ue
      }), G ? l.head.prepend(n.value) : l.head.appendChild(n.value), xo(n.value, "data-primevue-style-id", T), ye(n.value, O), n.value.onload = function(ee) {
        return R?.(ee, {
          name: T
        });
      }, L?.(T)), !r.value && (z = ne(o, function(ee) {
        n.value.textContent = ee, j?.(T);
      }, {
        immediate: !0
      }), r.value = !0);
    }
  }, Q = function() {
    !l || !r.value || (z(), vo(n.value) && l.head.removeChild(n.value), r.value = !1, n.value = null);
  };
  return c && !u && Ro(U), {
    id: g,
    name: h,
    el: n,
    css: o,
    unload: Q,
    load: U,
    isLoaded: gr(r)
  };
}
function pe(e) {
  "@babel/helpers - typeof";
  return pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, pe(e);
}
var rt, ot, nt, at;
function it(e, t) {
  return Fo(e) || Mo(e, t) || Vo(e, t) || Io();
}
function Io() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Vo(e, t) {
  if (e) {
    if (typeof e == "string") return st(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? st(e, t) : void 0;
  }
}
function st(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, o = Array(t); r < t; r++) o[r] = e[r];
  return o;
}
function Mo(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var o, n, a, i, l = [], s = !0, c = !1;
    try {
      if (a = (r = r.call(e)).next, t !== 0) for (; !(s = (o = a.call(r)).done) && (l.push(o.value), l.length !== t); s = !0) ;
    } catch (p) {
      c = !0, n = p;
    } finally {
      try {
        if (!s && r.return != null && (i = r.return(), Object(i) !== i)) return;
      } finally {
        if (c) throw n;
      }
    }
    return l;
  }
}
function Fo(e) {
  if (Array.isArray(e)) return e;
}
function lt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function Te(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? lt(Object(r), !0).forEach(function(o) {
      Wo(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : lt(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Wo(e, t, r) {
  return (t = Ho(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Ho(e) {
  var t = Bo(e, "string");
  return pe(t) == "symbol" ? t : t + "";
}
function Bo(e, t) {
  if (pe(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (pe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function me(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Uo = function(t) {
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
}, Yo = {}, Ko = {}, re = {
  name: "base",
  css: Uo,
  style: $o,
  classes: Yo,
  inlineStyles: Ko,
  load: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, n = o(fe(rt || (rt = me(["", ""])), t));
    return b(n) ? Do(se(n), Te({
      name: this.name
    }, r)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, r, function() {
      var n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return w.transformCSS(r.name || t.name, "".concat(n).concat(fe(ot || (ot = me(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return w.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return w.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return w.getDirective(this.name, t);
  },
  getPresetTheme: function(t, r, o) {
    return w.getCustomPreset(this.name, t, r, o);
  },
  getLayerOrderThemeCSS: function() {
    return w.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = E(this.css, {
        dt: J
      }) || "", n = se(fe(nt || (nt = me(["", "", ""])), o, t)), a = Object.entries(r).reduce(function(i, l) {
        var s = it(l, 2), c = s[0], p = s[1];
        return i.push("".concat(c, '="').concat(p, '"')) && i;
      }, []).join(" ");
      return b(n) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(n, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return w.getCommonStyleSheet(this.name, t, r);
  },
  getThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [w.getStyleSheet(this.name, t, r)];
    if (this.style) {
      var n = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = fe(at || (at = me(["", ""])), E(this.style, {
        dt: J
      })), i = se(w.transformCSS(n, a)), l = Object.entries(r).reduce(function(s, c) {
        var p = it(c, 2), u = p[0], d = p[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      b(i) && o.push('<style type="text/css" data-primevue-style-id="'.concat(n, '" ').concat(l, ">").concat(i, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return Te(Te({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ge = At();
function de(e) {
  "@babel/helpers - typeof";
  return de = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, de(e);
}
function ct(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function ve(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ct(Object(r), !0).forEach(function(o) {
      qo(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : ct(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function qo(e, t, r) {
  return (t = Jo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Jo(e) {
  var t = Go(e, "string");
  return de(t) == "symbol" ? t : t + "";
}
function Go(e, t) {
  if (de(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (de(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
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
    text: [k.STARTS_WITH, k.CONTAINS, k.NOT_CONTAINS, k.ENDS_WITH, k.EQUALS, k.NOT_EQUALS],
    numeric: [k.EQUALS, k.NOT_EQUALS, k.LESS_THAN, k.LESS_THAN_OR_EQUAL_TO, k.GREATER_THAN, k.GREATER_THAN_OR_EQUAL_TO],
    date: [k.DATE_IS, k.DATE_IS_NOT, k.DATE_BEFORE, k.DATE_AFTER]
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
function Xo(e, t) {
  var r = {
    config: br(t)
  };
  return e.config.globalProperties.$primevue = r, e.provide(Zo, r), en(), tn(e, r), r;
}
var ae = [];
function en() {
  A.clear(), ae.forEach(function(e) {
    return e?.();
  }), ae = [];
}
function tn(e, t) {
  var r = $(!1), o = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !w.isStyleNameLoaded("common")) {
      var p, u, d = ((p = re.getCommonTheme) === null || p === void 0 ? void 0 : p.call(re)) || {}, h = d.primitive, f = d.semantic, g = d.global, m = d.style, v = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      re.load(h?.css, ve({
        name: "primitive-variables"
      }, v)), re.load(f?.css, ve({
        name: "semantic-variables"
      }, v)), re.load(g?.css, ve({
        name: "global-variables"
      }, v)), re.loadStyle(ve({
        name: "global-style"
      }, v), m), w.setLoadedStyleName("common");
    }
  };
  A.on("theme:change", function(s) {
    r.value || (e.config.globalProperties.$primevue.config.theme = s, r.value = !0);
  });
  var n = ne(t.config, function(s, c) {
    ge.emit("config:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ne(function() {
    return t.config.ripple;
  }, function(s, c) {
    ge.emit("config:ripple:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = ne(function() {
    return t.config.theme;
  }, function(s, c) {
    r.value || w.setTheme(s), t.config.unstyled || o(), r.value = !1, ge.emit("config:theme:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = ne(function() {
    return t.config.unstyled;
  }, function(s, c) {
    !s && t.config.theme && o(), ge.emit("config:unstyled:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  ae.push(n), ae.push(a), ae.push(i), ae.push(l);
}
var rn = {
  install: function(t, r) {
    var o = po(Qo, r);
    Xo(t, o);
  }
}, Bt = {
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
    this.mounted = zt();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function on(e, t, r, o, n, a) {
  return a.inline ? be(e.$slots, "default", {
    key: 0
  }) : n.mounted ? (yr(), xr(vt, {
    key: 1,
    to: r.appendTo
  }, [be(e.$slots, "default")], 8, ["to"])) : bt("", !0);
}
Bt.render = on;
const nn = "data-wippy-overlay-layer";
function Ut() {
  return typeof window < "u" && typeof window.document < "u";
}
function Yt() {
  return Ut() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function an() {
  return Yt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const sn = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ln = 0;
const we = /* @__PURE__ */ new WeakMap();
function pt(e, t) {
  const r = e.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", t), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function cn(e, t) {
  if (!sn.test(e.className))
    return;
  const r = e.style.cssText;
  pt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = r;
    return;
  }
  if (!we.has(e)) {
    const o = new MutationObserver(() => {
      const n = e.style;
      (n.top !== "auto" || n.left !== "auto" || n.margin !== "0px" || n.getPropertyPriority("top") !== "important" || n.getPropertyPriority("left") !== "important" || n.getPropertyPriority("margin") !== "important" || n.getPropertyPriority("min-width") !== "important" || n.maxWidth !== "stretch" || n.getPropertyPriority("max-width") !== "important") && pt(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), we.set(e, o);
  }
}
function De(e) {
  const t = we.get(e);
  t && (t.disconnect(), we.delete(e));
}
function pn(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function je(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const ke = /* @__PURE__ */ new Set(), Ie = /* @__PURE__ */ new WeakMap();
let dt = !1, Re = !1;
function dn() {
  Re = !1;
  for (const e of ke) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && De(t);
      ke.delete(e), Ie.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && je(e);
  }
}
function ut() {
  Re || (Re = !0, requestAnimationFrame(dn));
}
function un(e) {
  const t = document.createElement("div");
  t.setAttribute(nn, "");
  const r = Yt();
  if (t.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && t.setAttribute("popover", "manual"), e.appendChild(t), r) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  je(t);
  const o = new MutationObserver((n) => {
    const a = t.__wippyAnchorName;
    for (const i of n) {
      if (a)
        for (const l of Array.from(i.addedNodes))
          l instanceof HTMLElement && cn(l, a);
      for (const l of Array.from(i.removedNodes))
        l instanceof HTMLElement && De(l);
    }
    t.isConnected && t.childElementCount > 0 && je(t);
  });
  return o.observe(t, { childList: !0 }), Ie.set(t, o), ke.add(t), dt || (dt = !0, window.addEventListener("scroll", ut, { capture: !0, passive: !0 }), window.addEventListener("resize", ut, { passive: !0 })), t;
}
function ht(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = un(e.hostRoot), an())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++ln}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function ft(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && De(t);
    ke.delete(e.layer), Ie.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let mt = !1;
function hn() {
  if (mt)
    return;
  mt = !0;
  const e = Bt;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Ut() && (this.hostRoot = pn(this.$el), this.mounted = !0, this.hostRoot && (this.inline || ht(this), this.$watch("inline", (t) => {
      t ? ft(this) : ht(this);
    })));
  }, e.render = function() {
    return this.inline ? be(this.$slots, "default", { key: 0 }) : this.mounted ? wr(vt, { key: 1, to: this.resolvedTarget || document.body }, [
      be(this.$slots, "default")
    ]) : bt("", !0);
  }, e.unmounted = function() {
    ft(this);
  };
}
const Yn = {
  install: (e) => {
    hn(), e.use(rn, { theme: "none" });
  }
}, Kn = () => Xr();
function qn(e) {
  const t = e?.response?.data;
  if (t && typeof t == "object") {
    if (typeof t.error == "string" && t.error) return t.error;
    if (typeof t.message == "string" && t.message) return t.message;
  }
  return e instanceof Error ? e.message : String(e);
}
function Jn(e, t) {
  const r = e || "connected", o = Number(t || 0);
  return r === "connected" && o > 0 && o <= Math.floor(Date.now() / 1e3) ? "expired" : r;
}
const Gn = {
  connected: "Connected",
  expired: "Token expired",
  needs_reauth: "Reconnect required",
  disabled: "Disabled",
  error: "Unavailable"
}, Qn = {
  connected: "ok",
  expired: "bad",
  needs_reauth: "bad",
  disabled: "muted",
  error: "warn"
}, Zn = {
  expires_at: "integer",
  refresh_expires_at: "integer",
  oauth_connection: "boolean"
}, Xn = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-modal-head-icon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-modal-head-icon svg{width:20px;height:20px}.kx-modal-head-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-modal-head-title{font-size:15.5px;font-weight:700;color:var(--p-text-color);line-height:1.2}.kx-modal-head-sub{font-size:12.5px;font-weight:400;color:var(--p-text-muted-color);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.conn-page{--bg: var(--p-content-background);--s1: var(--p-content-background);--s2: color-mix(in srgb, var(--p-text-color) 5%, transparent);--s3: color-mix(in srgb, var(--p-text-color) 9%, transparent);--b1: var(--p-content-border-color);--b2: color-mix(in srgb, var(--p-text-color) 22%, var(--p-content-border-color));--t1: var(--p-text-color);--t2: color-mix(in srgb, var(--p-text-color) 78%, transparent);--t3: var(--p-text-muted-color);--t4: color-mix(in srgb, var(--p-text-muted-color) 70%, transparent);--ac: var(--p-primary-color);--acs: color-mix(in srgb, var(--p-primary-color) 12%, transparent);--gn: var(--p-success-500);--gns: color-mix(in srgb, var(--p-success-500) 13%, transparent);--gnb: var(--p-success-600);--rd: var(--p-danger-600, var(--p-danger-500));--rds: color-mix(in srgb, var(--p-danger-500) 12%, transparent);--am: var(--p-warn-500);--ams: color-mix(in srgb, var(--p-warn-500) 16%, transparent);--amb: var(--p-warn-700, var(--p-warn-600));--r8: 8px;--r-card: 14px;--font-h: inherit;--sh-sm: 0 6px 18px rgba(0,0,0,.08);min-height:0;color:var(--t1);background:var(--bg);font-family:inherit}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--t3);pointer-events:none}.kx-search-input{height:34px;width:220px;max-width:40vw;padding:0 30px;font:inherit;font-size:13px;color:var(--t1);background:var(--s1);border:1px solid var(--b1);border-radius:var(--r8);transition:border-color .15s}.kx-search-input::placeholder{color:var(--t3)}.kx-search-input::-webkit-search-cancel-button{display:none}.kx-search-clear{position:absolute;right:6px;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--t3);cursor:pointer}.kx-search-clear:hover{background:var(--s2);color:var(--t1)}.kx-search-clear svg{width:13px;height:13px}.block-head{margin-bottom:10px}.lt-section-header{margin:0;font-size:12px;line-height:1.3;font-weight:750;color:var(--t2);text-transform:uppercase;letter-spacing:.04em}.lt-empty-hero{width:54px;height:54px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--acs);color:var(--ac)}.lt-empty-hero svg{width:28px;height:28px}.lt-empty-hero.is-success{background:var(--gns);color:var(--gnb)}.lt-empty-hero.is-info{background:var(--acs);color:var(--ac)}.lt-empty-hero.is-danger{background:var(--rds);color:var(--rd)}.e-title{font-size:15px;font-weight:750;color:var(--t1)}.e-sub{margin-top:4px;font-size:13px;color:var(--t3)}.msg.err{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;font-size:13px;background:var(--rds);color:var(--rd)}.msg.err svg{width:16px;height:16px;flex:none}.lt-label{font-size:12.5px;font-weight:650;color:var(--t1)}.lt-input{width:100%;height:34px;padding:0 10px;font:inherit;font-size:13px;color:var(--t1);background:var(--s1);border:1px solid var(--b1);border-radius:var(--r8)}.e-cta,.ghost-action{height:34px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 13px;border-radius:var(--r8);font:inherit;font-size:13px;font-weight:700;cursor:pointer}.e-cta{background:var(--ac);color:var(--p-button-primary-color);border:1px solid transparent}.e-cta:hover:not(:disabled){filter:brightness(1.05)}.ghost-action{background:transparent;color:var(--t1);border:1px solid var(--b1)}.ghost-action:hover:not(:disabled){background:var(--s2)}.e-cta:disabled,.ghost-action:disabled{opacity:.55;cursor:default}.e-cta svg,.ghost-action svg{width:16px;height:16px}@keyframes lt-pulse{0%,to{opacity:1}50%{opacity:.45}}.au{animation:conn-au .32s ease both}.d1{animation-delay:.06s}.d2{animation-delay:.12s}@keyframes conn-au{0%{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){.au{animation:none}}.conn-page{display:flex;flex-direction:column;height:100%;overflow-y:auto;overflow-x:hidden}.conn-body{flex:1;min-height:0;padding:20px 24px}.block{margin-bottom:28px}.conn-loading{font-size:13px;color:var(--t3);padding:8px 0}.conn-empty{text-align:center;padding:36px 16px}.conn-empty .lt-empty-hero{margin:0 auto 14px}.conn-retry{margin-top:16px}.live-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:12px}.live-card{position:relative;overflow:hidden;display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:var(--r-card);background:var(--s1);border:1px solid var(--b1);transition:border-color .15s,box-shadow .15s,transform .15s}.live-card:before{content:"";position:absolute;top:0;left:0;bottom:0;width:3px;background:var(--b1)}.live-card:hover{border-color:var(--b2);box-shadow:var(--sh-sm);transform:translateY(-1px)}.live-card.s-live:before{background:var(--gn)}.live-card.state-warn:before{background:var(--am)}.live-card.state-bad:before{background:var(--rd)}.live-card.state-muted:before{background:var(--t4)}.lc-top{display:flex;align-items:flex-start;justify-content:space-between}.lc-ico{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:var(--gns);color:var(--gnb);border:1px solid color-mix(in srgb,var(--gn),transparent 70%)}.live-card.state-warn .lc-ico{background:var(--ams);color:var(--amb);border-color:color-mix(in srgb,var(--am),transparent 70%)}.live-card.state-bad .lc-ico{background:var(--rds);color:var(--rd);border-color:color-mix(in srgb,var(--rd),transparent 70%)}.live-card.state-muted .lc-ico{background:var(--s2);color:var(--t3);border-color:var(--b1)}.lc-ico svg{width:20px;height:20px}.lc-top-r{display:flex;align-items:center;gap:4px;opacity:0;transition:opacity .15s}.live-card:hover .lc-top-r,.live-card:focus-within .lc-top-r{opacity:1}.lc-add{width:28px;height:28px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;background:var(--s2);border:1px solid var(--b1);color:var(--t2);transition:background .15s,color .15s,border-color .15s}.lc-add:hover{background:var(--acs);color:var(--ac);border-color:var(--ac)}.lc-add.lc-danger:hover,.lc-add.lc-danger.armed{background:var(--rds);color:var(--rd);border-color:color-mix(in srgb,var(--rd) 35%,transparent)}.lc-add.lc-danger.armed{opacity:1}.lc-add svg{width:15px;height:15px}.lc-name{font-family:var(--font-h);font-size:15px;font-weight:700;color:var(--t1);letter-spacing:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lc-desc{font-size:12px;color:var(--t2);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.lc-status{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--t2);min-width:0}.lc-status .dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;background:var(--gn);animation:lt-pulse 2.4s ease-in-out infinite}.lc-status.state-warn .dot{background:var(--am)}.lc-status.state-bad .dot{background:var(--rd)}.lc-status.state-muted .dot{background:var(--t4);animation:none}.lc-primary{color:var(--gnb);font-weight:600}.lc-status.state-warn .lc-primary{color:var(--amb)}.lc-status.state-bad .lc-primary{color:var(--rd)}.lc-status.state-muted .lc-primary{color:var(--t3)}.lc-secondary{color:var(--t3);text-transform:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.list-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;color:var(--t3);font-size:12px;flex-wrap:wrap}.setup-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:12px}.setup-card{display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:12px;min-height:72px;padding:12px 14px;background:var(--s1);border:1px solid var(--b1);border-radius:var(--r-card);color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background .15s,border-color .15s,transform .15s,box-shadow .15s}.setup-card:hover{background:var(--s2);border-color:var(--ac);transform:translateY(-1px);box-shadow:var(--sh-sm)}.setup-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--s3);color:var(--t2);transition:background .15s,color .15s}.setup-ico svg{width:20px;height:20px}.setup-card:hover .setup-ico{background:var(--acs);color:var(--ac)}.setup-text{min-width:0}.setup-name{font-family:var(--font-h);font-size:14px;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.setup-desc{font-size:12px;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.setup-arrow{width:16px;height:16px;color:var(--t4);transition:color .15s,transform .15s}.setup-card:hover .setup-arrow{color:var(--ac);transform:translate(2px)}.connpick{display:grid;gap:8px;color:var(--p-text-color);font:13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.connpick-field{display:grid;gap:6px}.connpick-field span{font-size:12px;font-weight:650;color:var(--p-text-muted-color)}.connpick-meta{width:fit-content;border-radius:6px;padding:4px 8px;font-size:12px;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.connpick-meta.state-connected{color:var(--p-success-600);background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.connpick-meta.state-expired,.connpick-meta.state-needs_reauth{color:var(--p-danger-600);background:color-mix(in srgb,var(--p-danger-500) 12%,transparent)}.connpick-hint,.connpick-error{margin:0;font-size:12px}.connpick-hint{color:var(--p-text-muted-color)}.connpick-error{color:var(--p-danger-600)}.kx-err{margin:0 0 8px}.kx-err.inline{margin:4px 0 0}.kx-modal{width:460px;max-width:100%;max-height:90vh;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px;box-shadow:var(--p-dialog-shadow);display:flex;flex-direction:column;transition:height .2s ease,max-height .2s ease}.kx-modal-2p{--p-dialog-content-padding: 0;width:860px}.kx-modal.kx-modal-2p>.kx-dialog-content{padding:0;display:flex;flex:1;min-height:0;overflow:hidden}.kx-modal>.kx-modal-head{font-size:15px;font-weight:700;color:var(--p-text-color);padding:16px 18px;border-bottom:1px solid var(--p-content-border-color);display:flex;align-items:center;gap:12px}.kx-modal-head svg{width:18px;height:18px}.kx-modal>.kx-modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}.kx-2p{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);min-height:0;flex:1;overflow:hidden}.kx-2p-l{padding:18px;overflow-y:auto;border-right:1px solid var(--p-content-border-color)}.kx-2p-r{display:flex;flex-direction:column;min-width:0;min-height:0;background:color-mix(in srgb,var(--p-text-color) 2.5%,var(--p-content-background))}.kx-2p-r-head{padding:14px 18px 10px;font-size:12.5px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:var(--p-text-muted-color);min-height:12px}.kx-2p-r-body{padding:0 18px 18px;overflow-y:auto;flex:1;min-height:0}.kx-2p-r-note{margin:0;font-size:12.5px;color:var(--p-text-muted-color)}.kx-cat-search{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;margin-bottom:10px;border:1px solid var(--p-content-border-color);border-radius:8px;color:var(--p-text-muted-color)}.kx-cat-search svg{width:15px;height:15px;flex:none}.kx-cat-search input{flex:1;border:none;background:transparent;outline:none;font:inherit;font-size:13px;color:var(--p-text-color)}.kx-cat-grp-lbl{font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color);margin:12px 2px 6px}.kx-cat-grp-lbl:first-of-type{margin-top:0}.kx-cat{display:flex;flex-direction:column;gap:6px}.kx-cat-card{display:flex;align-items:center;gap:11px;text-align:left;width:100%;padding:10px 12px;border:1px solid var(--p-content-border-color);border-radius:11px;background:transparent;color:var(--p-text-color);cursor:pointer;transition:border-color .14s,background .14s}.kx-cat-card:hover:not(:disabled){background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.kx-cat-card.sel{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 9%,transparent)}.kx-cat-card:disabled{opacity:.55;cursor:default}.kx-cat-ico{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:8px;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.kx-cat-ico svg{width:18px;height:18px}.kx-cat-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-cat-name{font-size:13px;font-weight:600}.kx-cat-desc{font-size:11.5px;line-height:1.4;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-cat-check{width:17px;height:17px;flex:none;color:var(--p-primary-color)}.kx-cat-empty{font-size:12.5px;color:var(--p-text-muted-color);padding:4px 2px}.kx-form{display:flex;flex-direction:column;gap:14px}.kx-field{display:flex;flex-direction:column;gap:5px}.kx-field-lbl{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-field-hint-inline{font-weight:400;color:var(--p-text-muted-color)}.kx-input,.kx-select{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s;width:100%;color-scheme:light dark}.kx-select option{background:var(--p-content-background);color:var(--p-text-color)}.kx-input:disabled,.kx-select:disabled{opacity:.6;cursor:default}.kx-check{height:36px;display:inline-flex;align-items:center;gap:8px;padding:0 10px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:10px;cursor:pointer}.kx-check input{accent-color:var(--p-primary-color)}.kx-engine-wrap{position:relative;min-height:120px}.kx-engine-host{display:block;min-height:120px}.kx-engine-host>*{display:block;width:100%}.kx-engine-state{position:absolute;inset:0;justify-content:center}.kx-engine-error{display:flex;min-height:120px;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;text-align:center;color:var(--p-danger-500);font-size:12.5px}.kx-engine-error button{height:32px;padding:0 13px;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-weight:600;cursor:pointer}.kx-cfg-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;height:100%;min-height:180px;text-align:center;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-cfg-empty svg{width:28px;height:28px;opacity:.7}.kx-cfg-state{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--p-text-muted-color)}.kx-cfg-state.warn{color:var(--p-text-color)}.kx-cfg-state button{font:inherit;font-size:12px;padding:5px 11px;border-radius:8px;border:1px solid var(--p-primary-color);background:var(--p-primary-color);color:var(--p-button-primary-color);cursor:pointer}.kx-scopes{border:1px solid var(--p-content-border-color);border-radius:8px;max-height:280px;overflow-y:auto;background:var(--p-content-background)}.kx-scopes.kx-disabled{opacity:.6;pointer-events:none}.kx-scope{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--p-content-border-color)}.kx-scope:last-child{border-bottom:none}.kx-scope input{margin-top:2px;accent-color:var(--p-primary-color)}.kx-scope-txt{display:flex;flex-direction:column;gap:2px;min-width:0}.kx-scope-nm{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-scope-desc{font-size:11.5px;line-height:1.4;color:var(--p-text-muted-color)}@media(max-width:720px){.kx-modal-2p{width:560px}.kx-2p{grid-template-columns:1fr}.kx-2p-l{border-right:none;border-bottom:1px solid var(--p-content-border-color)}}.oc{display:flex;flex-direction:column;gap:22px;background:transparent}.oc-error{display:flex;align-items:center;gap:12px;padding:16px;border-radius:10px;background:var(--rds);color:var(--rd);font-size:12.5px}.oc-error>svg{width:22px;height:22px;flex:none}.oc-error-body{flex:1;min-width:0}.oc-error-title{font-size:14px;font-weight:700;color:var(--t1)}.oc-error-sub{margin-top:3px;font-size:12.5px;color:var(--t2);word-break:break-word}.oc-loading{display:flex;align-items:center;gap:8px;color:var(--t3);font-size:13px;padding:24px 0}.oc-block{display:flex;flex-direction:column;gap:12px}.oc-head{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--t3)}.oc-head-row{display:flex;align-items:center;justify-content:space-between;gap:12px}.oc-search{position:relative;display:flex;align-items:center}.oc-search input{height:32px;width:200px;max-width:46vw;padding:0 10px 0 30px;font:inherit;font-size:13px;color:var(--t1);background:var(--s2);border:1px solid var(--b1);border-radius:var(--r8);outline:none}.oc-search-ico{position:absolute;left:9px;width:15px;height:15px;color:var(--t3);pointer-events:none}.oc-conns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.oc-conn{display:flex;align-items:center;gap:9px;padding:8px 10px;border:1px solid var(--b1);border-radius:var(--r8);background:var(--s2)}.oc-conn-ico{width:24px;height:24px;flex:none;display:grid;place-items:center;border-radius:6px;background:var(--s3);color:var(--t2)}.oc-conn-ico svg{width:15px;height:15px}.oc-conn-name{flex:1;min-width:0;font-size:12.5px;font-weight:600;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.oc-dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--am)}.oc-dot.ok{background:var(--gn)}.oc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}.oc-tile{display:flex;align-items:center;gap:11px;padding:12px;text-align:left;cursor:pointer;border:1px solid var(--b1);border-radius:var(--r-card);background:var(--s1);transition:border-color .15s,background .15s,transform .15s}.oc-tile:hover{border-color:var(--ac);background:var(--s2);transform:translateY(-1px)}.oc-tile.done{border-color:color-mix(in srgb,var(--gn) 40%,var(--b1))}.oc-tile-ico{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:8px;background:var(--acs);color:var(--ac)}.oc-tile-ico svg{width:19px;height:19px}.oc-tile-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}.oc-tile-name{font-size:13px;font-weight:600;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.oc-tile-auth{font-size:11px;color:var(--t3)}.oc-tile-add{width:16px;height:16px;flex:none;color:var(--t3)}.oc-tile.done .oc-tile-add{color:var(--gn)}.oc-empty{font-size:13px;color:var(--t3);padding:8px 0}.oc-foot{display:flex;align-items:center;gap:10px;margin-top:24px;padding-top:18px;border-top:1px solid var(--p-content-border-color)}.oc-foot-sp{flex:1}.oc-btn{padding:11px 20px;border-radius:var(--r8);border:0;cursor:pointer;font:inherit;font-size:13.5px;font-weight:700;transition:transform .15s,color .15s,filter .15s}.oc-btn:hover:not(:disabled){transform:translateY(-1px)}.oc-ghost{background:transparent;color:var(--p-text-muted-color)}.oc-ghost:hover{color:var(--p-text-color)}.oc-primary{background:var(--p-primary-color);color:var(--p-button-primary-color)}.oc-primary:hover:not(:disabled){filter:brightness(1.06)}.oc-primary:disabled{opacity:.5;cursor:default}@media(max-width:480px){.oc-conns{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){.kx-modal{transition:none}}.kx-cat-search:focus-within{border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.kx-cat-search input:focus{box-shadow:none}.setup-card:focus-visible,.kx-cat-card:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}';
export {
  io as $,
  In as A,
  re as B,
  Gn as C,
  $n as D,
  Nn as E,
  lo as F,
  Cn as G,
  Bn as H,
  Fn as I,
  _n as J,
  zn as K,
  Rn as L,
  Bt as M,
  A as N,
  Lt as O,
  Yn as P,
  Ln as Q,
  Vn as R,
  w as S,
  jn as T,
  An as U,
  En as V,
  yn as W,
  Wn as X,
  Un as Y,
  xn as Z,
  xo as _,
  Xr as a,
  jt as a0,
  Hn as a1,
  Pn as a2,
  Tn as a3,
  Mn as a4,
  kn as a5,
  Pe as a6,
  qn as b,
  Qn as c,
  bn as d,
  Zn as e,
  Kn as f,
  I as g,
  wn as h,
  b as i,
  Ke as j,
  Et as k,
  ie as l,
  E as m,
  ze as n,
  Sn as o,
  D as p,
  ge as q,
  Jn as r,
  Xn as s,
  Je as t,
  vn as u,
  On as v,
  Dn as w,
  qe as x,
  At as y,
  yo as z
};
//# sourceMappingURL=styles-FbmmpE4z.js.map

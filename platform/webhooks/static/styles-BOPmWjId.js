import { hasInjectionContext as D, inject as y, effectScope as $, ref as v, markRaw as F, createApp as q, onMounted as K, onUnmounted as J, watch as Y, defineComponent as G, computed as Q, openBlock as f, createElementBlock as m, Fragment as X, renderList as Z, createElementVNode as R, toDisplayString as _, createCommentVNode as V } from "vue";
import { addCollection as rr } from "@iconify/vue";
import { config as P, addIcons as er, on as tr, applyThemeMode as w, host as O, hostCss as or, loadCss as ir, api as b } from "@wippy-fe/proxy";
var E = "data-wippy-visible";
function z(r) {
  const e = r.getAttribute(E);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var ar = Object.defineProperty, nr = (r, e, t) => e in r ? ar(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, l = (r, e, t) => nr(r, typeof e != "symbol" ? e + "" : e, t), sr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], pr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function A(r) {
  const e = r.startsWith("--") ? r : `--${r}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function cr(...r) {
  const e = /* @__PURE__ */ new Set();
  for (const t of r)
    if (t)
      for (const [o, i] of Object.entries(t)) {
        if ((o === "@light" || o === "@dark") && i && typeof i == "object") {
          for (const [n, s] of Object.entries(i)) {
            const c = typeof s == "string" ? A(n) : null;
            c && e.add(c);
          }
          continue;
        }
        const a = typeof i == "string" ? A(o) : null;
        a && e.add(a);
      }
  return [...e].sort();
}
function lr(r) {
  if (r.length === 0)
    return "";
  const e = r.map((t) => `  ${t}: inherit;`).join(`
`);
  return `${pr} {
${e}
}`;
}
function dr(r, e) {
  const t = lr(e);
  t && L(r, t, "@wippy-fe/css-variables-bridge");
}
function hr(r, e) {
  const o = (e ?? sr).map(async (i) => {
    const a = or[i];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${i}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await ir(a);
    } catch (n) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${i}" (${a}):`, n), null;
    }
  });
  return Promise.all(o).then((i) => {
    for (const a of i) {
      if (!a)
        continue;
      const n = document.createElement("style");
      n.textContent = a, n.setAttribute("role", "@wippy-fe/host-css"), r.appendChild(n);
    }
  });
}
function ur(r, e) {
  const t = document.createElement("style");
  t.textContent = e, r.appendChild(t);
}
function L(r, e, t) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const i = new CSSStyleSheet();
    i.replaceSync(e), r.adoptedStyleSheets = [...r.adoptedStyleSheets, i];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", t), o.textContent = e, r.appendChild(o);
}
function fr(r, e) {
  L(r, e, "@wippy-fe/custom-css");
}
function j(r) {
  return r.__wippyHost ?? null;
}
function mr(r) {
  return r.replace(/-([a-z])/g, (e, t) => t.toUpperCase());
}
function gr(r, e, t) {
  switch (t.type) {
    case "string":
      return { value: e };
    case "number": {
      const o = Number.parseFloat(e);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${r}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(e, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${r}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(e);
        return t.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${r}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${r}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function C(r, e) {
  const t = {}, o = [];
  for (const [i, a] of Object.entries(e.properties)) {
    const n = r.getAttribute(i), s = mr(i);
    if (n === null) {
      a.default !== void 0 && (t[s] = a.default);
      continue;
    }
    const c = gr(i, n, a);
    c.error ? o.push(c.error) : t[s] = c.value;
  }
  return { props: t, errors: o };
}
var vr = class {
  constructor(r, e) {
    l(this, "_props"), l(this, "_errors"), l(this, "_content"), l(this, "_hostVisibility"), l(this, "_propsListeners", /* @__PURE__ */ new Set()), l(this, "_contentListeners", /* @__PURE__ */ new Set()), l(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), l(this, "_disposed", !1), l(this, "_emitToDom"), l(this, "props"), l(this, "events"), l(this, "content"), l(this, "hostVisibility"), this._props = r.props, this._errors = r.errors, this._content = r.content, this._hostVisibility = r.hostVisibility, this._emitToDom = e;
    const t = this;
    this.props = {
      get value() {
        return t._props;
      },
      get errors() {
        return t._errors;
      },
      subscribe(o, i) {
        return t._subscribeProps(o, i);
      }
    }, this.events = {
      emit(o, i) {
        t._disposed || t._emitToDom(o, i);
      }
    }, this.content = r.hasContent ? {
      get value() {
        return t._content;
      },
      subscribe(o, i) {
        return t._subscribeContent(o, i);
      }
    } : null, this.hostVisibility = {
      get value() {
        return t._hostVisibility;
      },
      subscribe(o, i) {
        return t._subscribeHostVisibility(o, i);
      }
    };
  }
  /** @internal */
  notifyProps(r, e) {
    if (!this._disposed) {
      this._props = r, this._errors = e;
      for (const t of this._propsListeners)
        t(r, e);
    }
  }
  /** @internal */
  notifyContent(r) {
    if (!this._disposed) {
      this._content = r;
      for (const e of this._contentListeners)
        e(r);
    }
  }
  /** @internal */
  notifyHostVisibility(r, e) {
    if (!(this._disposed || r === e)) {
      this._hostVisibility = r;
      for (const t of this._hostVisibilityListeners)
        t(r, e);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(r), e?.immediate && r(this._props, this._errors);
    const t = () => {
      this._propsListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeContent(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(r), e?.immediate && r(this._content);
    const t = () => {
      this._contentListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeHostVisibility(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(r), e?.immediate && r(this._hostVisibility, this._hostVisibility);
    const t = () => {
      this._hostVisibilityListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
}, br = class extends HTMLElement {
  constructor() {
    super(), l(this, "_internals"), l(this, "_contentObserver", null), l(this, "_initialized", !1), l(this, "_container", null), l(this, "_reactive", null), l(this, "_lastProps", null), l(this, "_lastErrors", []), l(this, "_lastContent", null), l(this, "_themeUnsub", null), l(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = z(this);
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
    const r = this.wippyConfig, e = Object.keys(r.propsSchema.properties), t = r.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...t, E])];
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
    return j(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(r, e) {
    this.dispatchEvent(new CustomEvent(r, {
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
      const r = this.constructor.wippyConfig, e = !!r.contentTemplate;
      let t, o;
      if (this._lastProps !== null)
        t = this._lastProps, o = this._lastErrors;
      else {
        const a = C(this, r.propsSchema);
        r.validateProps && a.errors.push(...r.validateProps(a.props)), t = a.props, o = a.errors, this._lastProps = t, this._lastErrors = o;
      }
      const i = e ? this._lastContent ?? this._extractContent(r.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = i), this._reactive = new vr(
        { props: t, errors: o, content: i, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const r = this.constructor.wippyConfig, e = this._initialized, t = this.shadowRoot ?? this.attachShadow({ mode: r.shadowMode ?? "open" });
      let o;
      if (e)
        o = this._container;
      else {
        this.onInit(t), r.inlineCss && ur(t, r.inlineCss);
        try {
          const p = P?.theming, h = cr(
            p?.global?.cssVariables,
            p?.children?.cssVariables
          );
          dr(t, h);
        } catch {
        }
        if (r.customCss !== !1)
          try {
            const p = P?.theming, h = [p?.global?.customCSS, p?.children?.customCSS].filter(Boolean).join(`
`);
            h && fr(t, h);
          } catch {
          }
        (r.hostCssKeys === void 0 || r.hostCssKeys.length > 0) && hr(t, r.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const c = r.containerClasses ?? [];
        c.length > 0 && o.classList.add(...c), t.appendChild(o), this._container = o, er(rr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = tr("@theme", (c) => this._applyTheme(c)));
      const { props: i, errors: a } = C(this, r.propsSchema);
      r.validateProps && a.push(...r.validateProps(i));
      const n = i;
      this._lastProps = n, this._lastErrors = a;
      let s = null;
      r.contentTemplate && (s = this._extractContent(r.contentTemplate), this._lastContent = s, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(r.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(t, o, n, a, s, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (r) {
      this.onError(r), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: r instanceof Error ? r.message : String(r),
        error: r
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
  _applyTheme(r = O.getThemeMode?.()) {
    w(r, this), this._container && w(r, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), w("auto", this), this._container && w("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(r, e, t) {
    if (e === t)
      return;
    if (r === E) {
      const s = this._hostVisible, c = z(this);
      if (c === s)
        return;
      this._hostVisible = c, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(c, s), this.onHostVisibilityChanged(c, s));
      return;
    }
    const o = this.constructor.wippyConfig, { props: i, errors: a } = C(this, o.propsSchema);
    o.validateProps && a.push(...o.validateProps(i));
    const n = i;
    this._lastProps = n, this._lastErrors = a, this._reactive?.notifyProps(n, a), this.onPropsChanged(n, a);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(r) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(r) {
    console.error(`${this.constructor.name} initialization failed:`, r);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(r, e) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(r, e) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(r) {
    return this.querySelector(`template[data-type="${r}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(r) {
  }
};
function xr(r) {
  return r.__wippyHostBus ?? null;
}
function wr(r) {
  return r.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let T;
const U = (r) => T = r, yr = () => D() && y(N) || T, N = (
  /* istanbul ignore next */
  Symbol()
);
function kr() {
  const r = $(!0), e = r.run(() => v({}));
  let t = [], o = [];
  const i = F({
    install(a) {
      U(i), i._a = a, a.provide(N, i), a.config.globalProperties.$pinia = i, o.forEach((n) => t.push(n)), o = [];
    },
    use(a) {
      return this._a ? t.push(a) : o.push(a), this;
    },
    _p: t,
    _a: null,
    _e: r,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return i;
}
var _r = Object.defineProperty, Cr = (r, e, t) => e in r ? _r(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, g = (r, e, t) => Cr(r, typeof e != "symbol" ? e + "" : e, t), M = /* @__PURE__ */ Symbol("wippy:emit"), B = /* @__PURE__ */ Symbol("wippy:props"), Er = /* @__PURE__ */ Symbol("wippy:props_error"), Sr = /* @__PURE__ */ Symbol("wippy:content"), Rr = /* @__PURE__ */ Symbol("wippy:panel-id"), Vr = /* @__PURE__ */ Symbol("wippy:layout-bus"), Pr = /* @__PURE__ */ Symbol("wippy:host"), W = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Kr() {
  const r = y(B);
  if (!r)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return r;
}
function Jr() {
  const r = y(M);
  if (!r)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return r;
}
function zr() {
  const r = y(W);
  if (!r)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return r;
}
function Yr(r) {
  const e = zr();
  let t = !1, o = null, i = !1;
  function a() {
    if (o)
      return i = !0, o;
    let n;
    try {
      n = Promise.resolve(r());
    } catch (c) {
      n = Promise.reject(c);
    }
    const s = n.finally(() => {
      if (o === s && (o = null, t && i))
        return i = !1, a();
    });
    return o = s, s;
  }
  return K(() => (t = !0, a())), J(() => {
    t = !1, i = !1;
  }), Y(e, (n, s) => {
    if (t && s === !1 && n === !0)
      return a();
  }), e;
}
var Gr = class extends br {
  constructor() {
    super(...arguments), g(this, "_vueApp", null), g(this, "_propsRef", v({})), g(this, "_errorsRef", v([])), g(this, "_contentRef", v(null)), g(this, "_hostVisibilityRef", v(null)), g(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(r, e, t, o, i, a) {
    const n = this.constructor.vueConfig;
    this._propsRef.value = t, this._errorsRef.value = o, this._contentRef.value = i ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const p of o)
      this.emitEvent("invalid", { message: p });
    const s = new AbortController();
    this._bridgeAbort = s, this.reactive.props.subscribe((p, h) => {
      this._propsRef.value = p, this._errorsRef.value = [...h];
      for (const d of h)
        this.emitEvent("invalid", { message: d });
    }, { signal: s.signal }), this.reactive.content && this.reactive.content.subscribe((p) => {
      this._contentRef.value = p;
    }, { signal: s.signal }), this.reactive.hostVisibility.subscribe((p) => {
      this._hostVisibilityRef.value = p;
    }, { signal: s.signal });
    const c = (p) => {
      if (s.signal.aborted)
        return;
      const h = yr(), d = q(p.rootComponent);
      this._vueApp = d;
      const u = kr();
      if (p.piniaPlugins)
        for (const k of p.piniaPlugins)
          u.use(k);
      if (d.use(u), p.plugins)
        for (const k of p.plugins)
          d.use(k);
      d.provide(B, this._propsRef), d.provide(Er, this._errorsRef), d.provide(M, this.emitEvent.bind(this)), d.provide(Sr, this._contentRef), d.provide(W, this._hostVisibilityRef), d.provide(Rr, wr(this)), d.provide(Vr, xr(this)), d.provide(Pr, j(this)), p.providers && p.providers(d, this), d.mount(e), h && U(h);
    };
    if (n.rootComponent)
      c(n);
    else if (n.lazyConfig) {
      const p = document.createElement("wippy-loading");
      p.setAttribute("no-bg", ""), e.appendChild(p), n.lazyConfig().then((h) => {
        s.signal.aborted || (p.remove(), c(h));
      }).catch((h) => {
        if (s.signal.aborted)
          return;
        const d = h instanceof Error ? h.message : String(h), u = document.createElement("wippy-error");
        u.setAttribute("title", "Failed to load"), u.setAttribute("message", d), p.replaceWith(u), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
function Ar(r, e) {
  if (r && typeof r == "object") {
    const t = r, o = t.response?.data?.error;
    if (typeof o == "string") return o;
    if (o && typeof o == "object" && typeof o.message == "string")
      return o.message;
    if (typeof t.message == "string" && t.message) return t.message;
  }
  return e;
}
const Ir = {
  active: "Active",
  revoked: "Revoked"
};
function Qr(r) {
  return r ? Ir[r] ?? r : "";
}
const Or = {
  "Component not found or insufficient access to delete": "This webhook could not be found — it may already have been removed. Refresh the list."
};
function Lr(r) {
  return Or[r] ?? r;
}
function x(r, e) {
  if (r && typeof r == "object") {
    const t = r;
    t.response?.status === 401 && O.handleError("auth-expired", t);
  }
  return Ar(r, e);
}
async function jr() {
  try {
    const r = [];
    let e;
    do {
      const t = "/api/v1/webhooks" + (e ? "?cursor=" + encodeURIComponent(e) : ""), { data: o } = await b.get(t);
      if (!o?.success) throw new Error(o?.error || "failed to load webhooks");
      r.push(...o.webhooks), e = o.next_cursor;
    } while (e);
    return r;
  } catch (r) {
    throw new Error(x(r, "could not load webhooks"));
  }
}
async function Xr(r) {
  return (await jr()).find((t) => t.webhook_id === r) || null;
}
async function Zr(r) {
  try {
    const { data: e } = await b.post("/api/v1/webhooks", r);
    if (!e?.success || !e.webhook) throw new Error(e?.error || "create failed");
    return e.webhook;
  } catch (e) {
    throw new Error(x(e, "could not create webhook"));
  }
}
async function re(r) {
  try {
    const { data: e } = await b.post("/api/v1/webhooks/" + encodeURIComponent(r) + "/revoke", {});
    if (!e?.success) throw new Error(e?.error || "revoke failed");
  } catch (e) {
    throw new Error(x(e, "could not revoke webhook"));
  }
}
async function ee(r) {
  try {
    const { data: e } = await b.delete("/api/v1/webhooks/" + encodeURIComponent(r));
    if (!e?.success) throw new Error(e?.error || "delete failed");
  } catch (e) {
    throw new Error(Lr(x(e, "could not delete webhook")));
  }
}
async function te(r, e) {
  try {
    const { data: t } = await b.patch("/api/v1/webhooks/" + encodeURIComponent(r), e);
    if (!t?.success || !t.webhook) throw new Error(t?.error || "update failed");
    return t.webhook;
  } catch (t) {
    throw new Error(x(t, "could not update webhook"));
  }
}
const H = v("");
let I = !1;
async function Tr() {
  if (!I) {
    I = !0;
    try {
      const t = (await import("/api/public/env/public.js")).default, o = t && typeof t.PUBLIC_API_URL == "string" ? t.PUBLIC_API_URL : "";
      o && (H.value = o.replace(/\/+$/, ""));
    } catch {
    }
  }
}
function oe(r) {
  Tr();
  const e = "/api/public/hooks/" + r, t = H.value || window.location.origin;
  try {
    return new URL(e, t).toString();
  } catch {
    return e;
  }
}
const S = {
  type: "object",
  additionalProperties: !0,
  properties: {}
};
function ie(r) {
  try {
    return JSON.stringify(r || S, null, 2);
  } catch {
    return JSON.stringify(S, null, 2);
  }
}
function ae(r) {
  const e = r.trim();
  if (!e) return { schema: S };
  try {
    const t = JSON.parse(e);
    return !t || typeof t != "object" || Array.isArray(t) ? { error: "Schema must be a JSON object." } : { schema: t };
  } catch (t) {
    return { error: t instanceof Error ? t.message : "Invalid JSON schema." };
  }
}
function Ur(r) {
  if (!r || typeof r != "object") return [];
  const e = r, t = e.properties;
  if (!t || typeof t != "object") return [];
  const o = Array.isArray(e.required) ? e.required.map(String) : [];
  return Object.entries(t).map(([i, a]) => {
    const n = a && typeof a == "object" ? a : {}, s = n.type;
    return {
      key: i,
      type: Array.isArray(s) ? s.join(" | ") : typeof s == "string" ? s : "any",
      required: o.includes(i),
      description: typeof n.description == "string" ? n.description : void 0
    };
  });
}
const Nr = {
  key: 0,
  class: "wh-schema-fields"
}, Mr = { class: "wh-field-key" }, Br = { class: "wh-field-type" }, Wr = {
  key: 0,
  class: "wh-field-req"
}, Hr = ["title"], Dr = {
  key: 1,
  class: "wh-schema-any"
}, ne = /* @__PURE__ */ G({
  __name: "WebhookSchema",
  props: {
    schema: {}
  },
  setup(r) {
    const e = r, t = Q(() => Ur(e.schema || {}));
    return (o, i) => t.value.length ? (f(), m("div", Nr, [
      (f(!0), m(X, null, Z(t.value, (a) => (f(), m("div", {
        key: a.key,
        class: "wh-field-row"
      }, [
        R("span", Mr, _(a.key), 1),
        R("span", Br, _(a.type), 1),
        a.required ? (f(), m("span", Wr, "required")) : V("", !0),
        a.description ? (f(), m("span", {
          key: 1,
          class: "wh-field-desc",
          title: a.description
        }, _(a.description), 9, Hr)) : V("", !0)
      ]))), 128))
    ])) : (f(), m("div", Dr, "Accepts any JSON object — no fields are required."));
  }
}), se = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-card{position:relative;display:flex;flex-direction:column;gap:9px;padding:13px;cursor:pointer;border:1px solid var(--p-content-border-color);border-radius:14px;background:var(--p-content-background);transition:border-color .15s,box-shadow .15s,transform .15s}.kx-card:hover{border-color:color-mix(in srgb,var(--p-primary-color) 40%,var(--p-content-border-color));box-shadow:0 6px 20px color-mix(in srgb,var(--p-text-color) 8%,transparent);transform:translateY(-1px)}.kx-card-head{display:flex;align-items:center;gap:10px;min-width:0}.kx-card-id{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}.kx-card-name{font-size:14px;font-weight:700;letter-spacing:-.01em;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-card-meta{display:flex;gap:6px}.kx-card-desc{font-size:12px;color:var(--p-text-muted-color);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:17px}.kx-card-actions{position:absolute;top:9px;right:9px;display:flex;gap:3px;opacity:0;transition:opacity .12s;background:var(--p-content-background);border-radius:8px}.kx-card:hover .kx-card-actions,.kx-card:focus-within .kx-card-actions{opacity:1}.kx-card .p-button:not(:disabled):hover{transform:none}.kx-card:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.kx-modal-head-icon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-modal-head-icon svg{width:20px;height:20px}.kx-modal-head-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-modal-head-title{font-size:15.5px;font-weight:700;color:var(--p-text-color);line-height:1.2}.kx-modal-head-sub{font-size:12.5px;font-weight:400;color:var(--p-text-muted-color);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;color:var(--p-text-color);font:14px/1.4 inherit}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx{font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}.kx-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px 10px;flex-wrap:wrap}.kx-count{font-size:12.5px;color:var(--p-text-muted-color)}.kx-bar-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{height:34px;width:220px;max-width:40vw;padding:0 10px 0 30px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s}.kx-search-input::placeholder{color:var(--p-text-muted-color)}.kx-err.inline{margin:2px 0 0}.kx-body{flex:1;min-height:0;padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px}.kx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:12px;max-width:1180px}.kx-card.is-revoked{opacity:.66}.kx-ficon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-ficon svg{width:20px;height:20px}.kx-card-name{padding-right:72px}.kx-card-meta{flex-wrap:wrap}.kx-card-desc{display:block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;text-overflow:ellipsis}.kx-chip{flex:none}.kx-chip.is-active{text-transform:uppercase;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent)}.kx-chip.is-revoked{text-transform:uppercase;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 9%,transparent)}.kx-chip.is-count{color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.kx-foot-spacer{margin-right:auto}.kx-dialog{--p-dialog-content-padding: 0;width:min(540px,calc(100vw - 32px))}.kx-dialog.kx-modal-xl{width:min(920px,calc(100vw - 32px))}.kx-dialog>.kx-dialog-header{display:flex;align-items:center;gap:12px;padding:16px 20px}.kx-dialog>.kx-dialog-content{padding:0;overflow:hidden;display:flex;flex-direction:column;min-height:0}.kx-dialog>.kx-dialog-footer{display:flex;justify-content:flex-end;align-items:center;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}.kx-modal-head-sub{white-space:normal;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical}.kx-modal-body{padding:18px;overflow-y:auto;display:flex;flex-direction:column;gap:14px}.kx-form{display:flex;flex-direction:column;gap:14px}.kx-form-foot{display:flex;justify-content:flex-end;align-items:center;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}.kx-field{display:flex;flex-direction:column;gap:5px}.kx-field-lbl{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-field-hint-inline{font-weight:400;color:var(--p-text-muted-color)}.kx-input{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s;width:100%}.kx-input::placeholder{color:var(--p-text-muted-color)}.kx-textarea{height:auto;min-height:132px;padding:10px;resize:vertical;line-height:1.55;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;tab-size:2}.wh-token{display:flex;align-items:flex-start;gap:8px;border:1px solid var(--p-content-border-color);border-radius:8px;padding:7px 8px;background:color-mix(in srgb,var(--p-text-color) 3%,var(--p-content-background))}.wh-token code{flex:1;min-width:0;overflow-wrap:anywhere;white-space:normal;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.4}.wh-copy{flex:none;width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--p-content-border-color);background:var(--p-content-background);color:var(--p-text-muted-color);cursor:pointer;transition:color .12s,background .12s}.wh-copy:hover{color:var(--p-text-color);background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.wh-copy svg{width:15px;height:15px}.wh-facts{display:grid;grid-template-columns:max-content 1fr;gap:6px 14px;font-size:12.5px}.wh-facts dt{color:var(--p-text-muted-color)}.wh-facts dd{margin:0;color:var(--p-text-color)}.wh-secret{display:flex;flex-direction:column;gap:12px;border:1px solid color-mix(in srgb,var(--p-primary-color) 45%,transparent);border-radius:12px;padding:14px;background:color-mix(in srgb,var(--p-primary-color) 5%,var(--p-content-background))}.wh-secret-head{display:flex;align-items:flex-start;gap:10px;color:var(--p-primary-color)}.wh-secret-head svg{width:22px;height:22px;flex:none}.wh-secret-head h3{margin:0;font-size:14px;color:var(--p-text-color)}.wh-secret-head p{margin:2px 0 0;font-size:12.5px;color:var(--p-text-muted-color)}.wh-note{font-size:12px;color:var(--p-text-muted-color);line-height:1.45;display:flex;gap:6px}.wh-note svg{width:14px;height:14px;flex:none;margin-top:1px;color:var(--p-text-muted-color)}.wh-schema{display:flex;flex-direction:column;gap:8px}.wh-schema-fields{display:flex;flex-direction:column;border:1px solid var(--p-content-border-color);border-radius:10px;overflow:hidden}.wh-field-row{display:flex;align-items:baseline;gap:8px;padding:8px 11px;border-bottom:1px solid var(--p-content-border-color);font-size:12.5px}.wh-field-row:last-child{border-bottom:none}.wh-field-key{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:600;color:var(--p-text-color)}.wh-field-type{font-size:11px;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 7%,transparent);padding:1px 6px;border-radius:6px}.wh-field-req{font-size:10px;font-weight:700;text-transform:uppercase;color:var(--p-primary-color)}.wh-field-desc{margin-left:auto;color:var(--p-text-muted-color);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:50%}.wh-schema-any{font-size:12.5px;color:var(--p-text-muted-color);padding:10px 11px;border:1px dashed var(--p-content-border-color);border-radius:10px}.wh-schema-edit{display:flex;flex-direction:column;gap:5px}.wh-toggle{align-self:flex-start;display:inline-flex;align-items:center;gap:5px;font:inherit;font-size:12px;font-weight:600;color:var(--p-text-muted-color);background:transparent;border:none;padding:2px 0;cursor:pointer}.wh-toggle:hover{color:var(--p-text-color)}.wh-toggle svg{width:13px;height:13px;transition:transform .15s}.wh-toggle.is-open svg{transform:rotate(90deg)}.wh-detail{display:flex;flex-direction:column;gap:12px;padding:2px}.wh-detail-note{display:inline-flex;gap:8px;align-items:center;color:var(--p-text-muted-color);font-size:12.5px}@media(max-width:640px){.kx-bar{padding:12px 16px 8px}.kx-body{padding:6px 16px 16px}.kx-bar-actions{margin-left:0;width:100%}.kx-search{flex:1}.kx-search-input{width:100%;max-width:none}.kx-card-name{padding-right:40px}}';
export {
  S as D,
  Gr as W,
  ne as _,
  Yr as a,
  ie as b,
  te as c,
  ee as d,
  x as e,
  Xr as f,
  jr as g,
  Jr as h,
  oe as i,
  Zr as j,
  ae as p,
  re as r,
  se as s,
  Kr as u,
  Qr as w
};
//# sourceMappingURL=styles-BOPmWjId.js.map

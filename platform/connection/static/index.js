import { B as Pe, C as Me, c as Te, r as Oe, d as De, b as J, e as Le, W as Ae, s as Re, P as Be } from "./styles-Bx2Y_Hv8.js";
import { openBlock as _, createElementBlock as m, mergeProps as ne, createElementVNode as i, defineComponent as ue, computed as Z, withModifiers as oe, Fragment as q, createTextVNode as se, toDisplayString as E, createCommentVNode as N, createVNode as b, unref as c, watch as Ie, onBeforeUnmount as pe, ref as w, withDirectives as Ue, vModelText as Ve, withCtx as le, renderList as ce, normalizeClass as Y, createBlock as Ke, nextTick as ze } from "vue";
import { s as He, a as re, _ as We } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-BySRXbJq.js";
import { on as fe, api as W, host as qe, loadByTagName as Fe, define as Ge } from "@wippy-fe/proxy";
import { Icon as $ } from "@iconify/vue";
var Je = `
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
`, Ye = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Ze = Pe.extend({
  name: "progressspinner",
  style: Je,
  classes: Ye
}), Qe = {
  name: "BaseProgressSpinner",
  extends: He,
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
  style: Ze,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, ve = {
  name: "ProgressSpinner",
  extends: Qe,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Xe = ["fill", "stroke-width"];
function et(s, t, u, p, f, l) {
  return _(), m("div", ne({
    class: s.cx("root"),
    role: "progressbar"
  }, s.ptmi("root")), [(_(), m("svg", ne({
    class: s.cx("spin"),
    viewBox: "25 25 50 50",
    style: l.svgStyle
  }, s.ptm("spin")), [i("circle", ne({
    class: s.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: s.fill,
    "stroke-width": s.strokeWidth,
    strokeMiterlimit: "10"
  }, s.ptm("circle")), null, 16, Xe)], 16))], 16);
}
ve.render = et;
const tt = { key: 0 }, nt = /* @__PURE__ */ ue({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(s) {
    const t = s, u = Z(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (p, f) => s.state.deleting_at ? (_(), m("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: f[1] || (f[1] = oe(() => {
      }, ["stop"])),
      onKeydown: f[2] || (f[2] = oe(() => {
      }, ["stop"]))
    }, [
      u.value ? (_(), m(q, { key: 0 }, [
        i("span", null, [
          f[3] || (f[3] = se("Deletion failed", -1)),
          s.state.deletion_job?.last_error ? (_(), m("span", tt, ": " + E(s.state.deletion_job.last_error), 1)) : N("", !0)
        ]),
        b(c(re), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: f[0] || (f[0] = oe((l) => p.$emit("retry"), ["stop"]))
        })
      ], 64)) : (_(), m(q, { key: 1 }, [
        b(c(ve), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        f[4] || (f[4] = i("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : N("", !0);
  }
});
function H(s) {
  return !!s && typeof s == "object" && !Array.isArray(s);
}
function ot(s, t) {
  if (t == null) return t;
  switch (s) {
    case "boolean":
    case "checkbox":
      return typeof t == "boolean" ? t : t === "true" ? !0 : t === "false" ? !1 : t;
    case "number":
    case "integer": {
      if (typeof t == "number") return t;
      if (typeof t == "string" && t.trim() !== "") {
        const u = Number(t);
        if (!Number.isNaN(u)) return u;
      }
      return t;
    }
    case "object":
    case "array":
      if (typeof t == "string")
        try {
          const u = JSON.parse(t);
          if (u && typeof u == "object") return u;
        } catch {
        }
      return t;
    default:
      return t;
  }
}
function st(s, t) {
  if (!t) return s;
  const u = {};
  for (const [p, f] of Object.entries(s))
    u[p] = ot(t[p], f);
  return u;
}
function he(s, t, u) {
  if (t !== void 0 && !t) return null;
  const p = H(s) ? s : {}, f = [
    p,
    H(p.data) ? p.data : null,
    H(p.payload) ? p.payload : null,
    H(p.detail) ? p.detail : null
  ].filter(Boolean);
  for (const l of f) {
    if (l.event !== "component.meta.changed" && l.event !== "component.deleting" && l.event !== "component.deleted") continue;
    const S = String(l.component_id || ""), x = String(p.topic || l.topic || "");
    if (t === void 0) {
      if (!S && (!x.startsWith("component.") || x === "component.")) continue;
    } else if (S && S !== t || !S && x !== `component.${t}`) continue;
    const j = S || t || x.slice(10);
    return l.event === "component.deleting" && typeof l.deletion_job_id == "string" && l.deletion_job_id ? { event: l.event, component_id: j, deletion_job_id: l.deletion_job_id } : l.event !== "component.meta.changed" ? { event: l.event, component_id: j } : {
      event: "component.meta.changed",
      component_id: j,
      meta: st(H(l.meta) ? l.meta : {}, u),
      deleted: Array.isArray(l.deleted) ? l.deleted.map(String) : []
    };
  }
  return null;
}
function rt(s, t, u) {
  const p = he(s, t, u);
  return p?.event === "component.meta.changed" ? p : null;
}
function it(s, t) {
  const u = he(s, t);
  return u && u.event !== "component.meta.changed" ? u : null;
}
function at(s, t, u) {
  if (!s) return null;
  const p = fe(`component.${s}`, (f) => {
    const l = rt(f, s, u);
    l && t(l);
  });
  return typeof p == "function" ? p : null;
}
function de(s, t) {
  if (s && typeof s == "object") {
    const u = s, p = u.response?.data?.error;
    if (typeof p == "string") return p;
    if (p && typeof p == "object" && typeof p.message == "string")
      return p.message;
    if (typeof u.message == "string" && u.message) return u.message;
  }
  return t;
}
function lt(s, t, u, p) {
  let f = !0;
  const l = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Map();
  function x(y, g) {
    const h = s.value.find((A) => t(A) === y), d = S.get(y), k = g?.job_id || d?.deletion_job_id || h?.deletion_job_id, O = d ? d.deletion_job_id : h?.deleting_at ? h.deletion_job_id : void 0;
    if ((d || h?.deleting_at) && k === O) return;
    const M = {
      deleting_at: d?.deleting_at || h?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: k
    };
    S.set(y, M), h && (Object.assign(h, M), h.deletion_job = void 0);
  }
  async function j(y) {
    const g = t(y), h = S.get(g), d = () => f && s.value.includes(y) && S.get(g) === h;
    try {
      const { data: k } = await W.get(`/api/v1/components/${encodeURIComponent(g)}`);
      if (!k?.success) throw new Error(de(k, "Could not read deletion progress"));
      d() && (y.deleting_at = h?.deleting_at || k.deleting_at, y.deletion_job_id = k.deletion_job_id, h && (h.deletion_job_id = y.deletion_job_id), y.deletion_job = k.deletion_job ?? null);
    } catch (k) {
      d() && qe.handleError("other", { message: de(k, "Could not read deletion progress") });
    }
  }
  let L = [];
  const P = Ie(() => s.value, (y, g = []) => {
    const h = y.filter((d) => !l.has(t(d)));
    for (const d of g)
      l.has(t(d)) || h.some((k) => t(k) === t(d)) || d.deleting_at && p?.(t(d));
    if (h.length !== y.length) {
      s.value = h;
      return;
    }
    for (const d of y) {
      const k = S.get(t(d));
      k && (d.deletion_job_id !== k.deletion_job_id && (d.deletion_job = void 0), Object.assign(d, k));
      const O = g.find((M) => t(M) === t(d));
      d.deletion_job === void 0 && O?.deletion_job_id === d.deletion_job_id && (d.deletion_job = O?.deletion_job), d.deleting_at && !L.includes(d) && j(d);
    }
    L = y;
  }, { immediate: !0 }), T = fe("@message", (y) => {
    const g = it(y);
    if (!g) return;
    const h = s.value.find((d) => t(d) === g.component_id);
    g.event === "component.deleted" ? (h && !l.has(g.component_id) && p?.(g.component_id), l.add(g.component_id), S.delete(g.component_id), s.value = s.value.filter((d) => t(d) !== g.component_id)) : h && x(g.component_id, { job_id: g.deletion_job_id });
  });
  return pe(() => {
    f = !1, P(), typeof T == "function" && T();
  }), { acceptDeletion: x };
}
function ct() {
  let s = 0;
  return () => {
    const t = ++s;
    return () => t === s;
  };
}
function dt({ providers: s, connections: t, search: u, confirmId: p }) {
  const f = (o) => o.provider ?? "", l = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", S = (o) => o.icon || "tabler:plug", x = Z(() => {
    const o = {};
    for (const a of s.value) {
      const C = f(a);
      C && (o[C] = a);
    }
    return o;
  });
  function j(o) {
    return o.icon || x.value[o.provider || ""]?.icon || "tabler:plug-connected";
  }
  function L(o) {
    return o.provider ? x.value[o.provider] : void 0;
  }
  function P(o) {
    return new Set((o.scopes_granted ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function T(o) {
    return new Set((o?.default_scopes ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function y(o) {
    return (o?.available_scopes ?? []).map((a) => a.scope).filter((a) => typeof a == "string" && a.length > 0);
  }
  function g(o) {
    const a = T(o);
    return y(o).some((C) => !a.has(C));
  }
  function h(o) {
    if (!o.oauth) return !1;
    const a = L(o);
    if (!g(a)) return !1;
    const C = P(o), B = T(a);
    if (C.size === 0 || B.size === 0) return !1;
    for (const Q of C)
      if (!B.has(Q)) return !1;
    return !0;
  }
  function d(o) {
    return Oe(o.connection_state, o.expires_at);
  }
  function k(o) {
    const a = d(o);
    return a === "connected" && h(o) ? "warn" : Te[a];
  }
  function O(o) {
    const a = d(o);
    return a === "connected" && h(o) ? "Limited access" : Me[a];
  }
  function M(o) {
    const a = Number(o.expires_at || 0);
    if (!a) return "";
    const C = a - Math.floor(Date.now() / 1e3);
    return C <= 0 ? "token expired" : C < 3600 ? `expires in ${Math.max(1, Math.floor(C / 60))}m` : C < 86400 ? `expires in ${Math.floor(C / 3600)}h` : `expires in ${Math.floor(C / 86400)}d`;
  }
  function A(o) {
    const a = [];
    if (o.provider && a.push(o.provider), o.oauth) {
      h(o) && a.push("sign-in only");
      const C = M(o);
      C && a.push(C), Number(o.scope_count || 0) > 0 && a.push(`${o.scope_count} scope${o.scope_count === 1 ? "" : "s"}`);
    }
    return a.join(" · ");
  }
  function R(o) {
    if (p.value === o.component_id) return "Click the check again to remove this connection.";
    const a = d(o);
    return a === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : a === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : a === "disabled" ? "This connection is disabled and will not be used." : h(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function D(o) {
    const a = u.value.trim().toLowerCase();
    return !a || o.toLowerCase().includes(a);
  }
  const I = Z(() => s.value.filter((o) => D(`${l(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), F = Z(() => t.value.filter((o) => D(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: f,
    providerLabel: l,
    providerIcon: S,
    connIcon: j,
    providerForConnection: L,
    grantedScopeSet: P,
    defaultScopeSet: T,
    availableScopeValues: y,
    hasOptionalProviderScopes: g,
    hasSignInOnlyScopes: h,
    connectionState: d,
    statusClass: k,
    statusLabel: O,
    expiryText: M,
    statusDetail: A,
    connectionDescription: R,
    filteredProviders: I,
    filteredConnections: F
  };
}
const ut = { class: "conn-page" }, pt = { class: "kx-head" }, ft = { class: "kx-head-icon" }, vt = { class: "kx-head-actions" }, ht = {
  class: "kx-search",
  role: "search"
}, _t = { class: "conn-body" }, mt = {
  key: 0,
  class: "conn-loading"
}, gt = {
  key: 1,
  class: "conn-empty au d1"
}, yt = { class: "lt-empty-hero is-danger" }, bt = { class: "e-sub" }, kt = {
  key: 0,
  class: "msg err au"
}, Ct = {
  key: 1,
  class: "block au d1"
}, St = { class: "live-grid" }, xt = { class: "lc-top" }, $t = { class: "lc-ico" }, jt = { class: "lc-top-r" }, wt = ["title", "aria-label", "onClick", "disabled"], Et = ["title", "aria-label", "onClick", "disabled"], Nt = ["title", "aria-label", "onClick", "disabled"], Pt = { class: "lc-name" }, Mt = { class: "lc-desc" }, Tt = { class: "lc-primary" }, Ot = {
  key: 0,
  class: "lc-secondary"
}, Dt = {
  key: 0,
  class: "list-foot"
}, Lt = ["disabled"], At = {
  key: 2,
  class: "conn-empty au d1"
}, Rt = { class: "lt-empty-hero is-success" }, Bt = {
  key: 3,
  class: "block au d2"
}, It = { class: "block-head" }, Ut = { class: "lt-section-header" }, Vt = { class: "setup-grid" }, Kt = ["data-provider-key", "onClick"], zt = { class: "setup-ico" }, Ht = { class: "setup-text" }, Wt = { class: "setup-name" }, qt = { class: "setup-desc" }, Ft = {
  key: 4,
  class: "conn-empty au d1"
}, Gt = { class: "lt-empty-hero is-info" }, Jt = { class: "e-title" }, Yt = {
  key: 5,
  class: "conn-empty au d2"
}, Zt = { class: "lt-empty-hero is-info" }, Qt = 100, Xt = /* @__PURE__ */ ue({
  __name: "connections",
  setup(s) {
    const t = w([]), u = w([]), p = w(!0), f = w(!1), l = w(""), S = w(""), x = w(""), j = w(""), L = dt({ providers: u, connections: t, search: j, confirmId: x }), {
      providerKey: P,
      providerLabel: T,
      providerIcon: y,
      connIcon: g,
      statusClass: h,
      statusLabel: d,
      statusDetail: k,
      connectionDescription: O,
      filteredProviders: M,
      filteredConnections: A
    } = L, R = w(0), D = w(!1), I = w(!1), F = w(void 0), o = w(void 0), a = w(!1), C = w(null), B = w(null);
    function Q(r) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(Qt),
        offset: String(r)
      }).toString()}`;
    }
    async function ie(r) {
      const { data: e } = await W.get(Q(r));
      if (!e?.success) throw Object.assign(new Error("Could not load connections."), { response: { data: e } });
      return e;
    }
    const _e = ct();
    async function K() {
      const r = _e();
      p.value = !0, l.value = "", S.value = "";
      try {
        const [e, n, v] = await Promise.all([
          ie(0),
          W.get("/api/v1/oauth/providers/discover"),
          W.get("/api/v1/connections/providers/discover")
        ]);
        if (!r()) return;
        t.value = e.connections ?? [], R.value = Number(e.total_count ?? t.value.length), D.value = !!e.has_more, ee(), u.value = ge([
          ...n.data?.providers ?? [],
          ...v.data?.providers ?? []
        ]);
      } catch (e) {
        if (!r()) return;
        t.value.length ? l.value = J(e) : S.value = J(e), ee();
      } finally {
        r() && (p.value = !1);
      }
    }
    async function me() {
      if (!(f.value || !D.value)) {
        f.value = !0, l.value = "";
        try {
          const r = await ie(t.value.length), e = r.connections ?? [];
          t.value = [...t.value, ...e], R.value = Number(r.total_count ?? R.value), D.value = !!r.has_more, ee();
        } catch (r) {
          l.value = J(r);
        } finally {
          f.value = !1;
        }
      }
    }
    function ge(r) {
      const e = {};
      for (const n of r) {
        const v = P(n);
        v && (e[v] = e[v] ? { ...n, ...e[v] } : n);
      }
      return Object.values(e);
    }
    function ye(r) {
      return Array.isArray(r) ? r.filter((e) => typeof e == "string" && e.length > 0) : typeof r != "string" ? [] : r.split(/\s+/).filter(Boolean);
    }
    function be(r, e, n = []) {
      const v = {};
      if (typeof e.title == "string" && (v.name = e.title), typeof e.provider == "string" && (v.provider = e.provider), typeof e.icon == "string" && (v.icon = e.icon), typeof e.connection_state == "string" && (v.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (v.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (v.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (v.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (v.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const z = ye(e.scopes_granted);
        v.scopes_granted = z, v.scope_count = z.length;
      }
      typeof e.oauth_connection == "boolean" && (v.oauth = e.oauth_connection);
      const V = { ...r, ...v };
      for (const z of n) {
        const Ne = z === "title" ? "name" : z;
        delete V[Ne];
      }
      return V;
    }
    const U = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set();
    let X = 0;
    function ke(r, e) {
      t.value = t.value.map((n) => n.component_id === r ? be(n, e.meta || {}, e.deleted || []) : n);
    }
    function Ce() {
      X++, G.clear();
      for (const r of U.values()) r();
      U.clear();
    }
    function ee() {
      const r = new Set(t.value.map((n) => n.component_id).filter(Boolean));
      for (const [n, v] of U)
        r.has(n) || (v(), U.delete(n));
      const e = X;
      for (const n of r) {
        if (U.has(n) || G.has(n)) continue;
        G.add(n);
        const v = at(n, (V) => ke(n, V), Le);
        if (G.delete(n), !!v) {
          if (e !== X || !t.value.some((V) => V.component_id === n)) {
            v();
            continue;
          }
          U.set(n, v);
        }
      }
    }
    function te(r, e) {
      F.value = r, o.value = e, I.value = !0;
    }
    async function Se(r) {
      C.value = r, a.value = !0, await ze(), await $e();
    }
    function xe() {
      a.value = !1, C.value = null;
    }
    async function $e() {
      const r = C.value;
      if (!B.value || !r) return;
      if (B.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Fe("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const e = document.createElement("kickside-share");
      e.setAttribute("config", JSON.stringify({
        resource_id: r.component_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(r.component_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(r.component_id)}`,
        title: r.name || r.provider || "Connection"
      })), e.style.display = "block", e.addEventListener("close", xe), B.value.appendChild(e);
    }
    function je(r) {
      if (!r.provider) return;
      const e = u.value.find((n) => P(n) === r.provider);
      te(r.provider, r.oauth || e?.create_ui_id ? { componentId: r.component_id, name: r.name } : void 0);
    }
    function we() {
      I.value = !1, o.value = void 0, t.value = [], K();
    }
    async function ae(r) {
      if (x.value !== r.component_id) {
        x.value = r.component_id;
        return;
      }
      x.value = "", l.value = "";
      try {
        const { data: e } = await W.delete(`/api/v1/connections/${encodeURIComponent(r.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        Ee(r.component_id, e), await K();
      } catch (e) {
        l.value = J(e);
      }
    }
    De(K), pe(Ce);
    const { acceptDeletion: Ee } = lt(t, (r) => r.component_id, void 0, K);
    return (r, e) => (_(), m("div", ut, [
      i("header", pt, [
        i("div", ft, [
          b(c($), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[4] || (e[4] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "Connections"),
          i("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        i("div", vt, [
          i("label", ht, [
            b(c($), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Ue(i("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (n) => j.value = n),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [Ve, j.value]
            ]),
            j.value ? (_(), m("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (n) => j.value = ""),
              "aria-label": "Clear search"
            }, [
              b(c($), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : N("", !0)
          ]),
          b(c(re), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (n) => te())
          }, {
            icon: le(() => [
              b(c($), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      i("div", _t, [
        p.value && !t.value.length ? (_(), m("div", mt, "Loading…")) : S.value ? (_(), m("section", gt, [
          i("div", yt, [
            b(c($), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = i("div", { class: "e-title" }, "Couldn't load connections", -1)),
          i("div", bt, E(S.value), 1),
          b(c(re), {
            label: "Try again",
            class: "conn-retry",
            onClick: K
          }, {
            icon: le(() => [
              b(c($), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (_(), m(q, { key: 2 }, [
          l.value ? (_(), m("div", kt, [
            b(c($), { icon: "tabler:alert-circle" }),
            se(E(l.value), 1)
          ])) : N("", !0),
          c(A).length ? (_(), m("section", Ct, [
            e[8] || (e[8] = i("div", { class: "block-head" }, [
              i("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            i("div", St, [
              (_(!0), m(q, null, ce(c(A), (n) => (_(), m("div", {
                key: n.component_id,
                class: Y(["live-card s-live", `state-${c(h)(n)}`])
              }, [
                b(nt, {
                  state: n,
                  onRetry: (v) => {
                    x.value = n.component_id, ae(n);
                  }
                }, null, 8, ["state", "onRetry"]),
                i("div", xt, [
                  i("div", $t, [
                    b(c($), {
                      icon: c(g)(n),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  i("div", jt, [
                    i("button", {
                      class: "lc-add",
                      title: `Share ${n.name || n.provider}`,
                      "aria-label": `Share ${n.name || n.provider}`,
                      onClick: (v) => Se(n),
                      disabled: !!n.deleting_at
                    }, [
                      b(c($), { icon: "tabler:share" })
                    ], 8, wt),
                    i("button", {
                      class: "lc-add",
                      title: `Reconnect ${n.name || n.provider}`,
                      "aria-label": `Reconnect ${n.name || n.provider}`,
                      onClick: (v) => je(n),
                      disabled: !!n.deleting_at
                    }, [
                      b(c($), { icon: "tabler:refresh" })
                    ], 8, Et),
                    i("button", {
                      class: Y(["lc-add lc-danger", x.value === n.component_id && "armed"]),
                      title: x.value === n.component_id ? "Click again to remove" : `Remove ${n.name || n.provider}`,
                      "aria-label": `Remove ${n.name || n.provider}`,
                      onClick: (v) => ae(n),
                      disabled: !!n.deleting_at
                    }, [
                      b(c($), {
                        icon: x.value === n.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, Nt)
                  ])
                ]),
                i("div", Pt, E(n.name || n.provider || "Connection"), 1),
                i("div", Mt, E(c(O)(n)), 1),
                i("div", {
                  class: Y(["lc-status", `state-${c(h)(n)}`])
                }, [
                  e[6] || (e[6] = i("span", { class: "dot" }, null, -1)),
                  i("span", Tt, E(c(d)(n)), 1),
                  c(k)(n) ? (_(), m("span", Ot, "· " + E(c(k)(n)), 1)) : N("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            R.value || D.value ? (_(), m("div", Dt, [
              i("span", null, E(t.value.length) + " of " + E(R.value || t.value.length) + " loaded", 1),
              D.value ? (_(), m("button", {
                key: 0,
                class: "ghost-action",
                disabled: f.value,
                onClick: me
              }, [
                b(c($), {
                  icon: f.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: Y(f.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = se(" Load more ", -1))
              ], 8, Lt)) : N("", !0)
            ])) : N("", !0)
          ])) : !j.value && u.value.length ? (_(), m("section", At, [
            i("div", Rt, [
              b(c($), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = i("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = i("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : N("", !0),
          c(M).length ? (_(), m("section", Bt, [
            i("div", It, [
              i("h2", Ut, E(c(A).length ? "Add another" : "Available services"), 1)
            ]),
            i("div", Vt, [
              (_(!0), m(q, null, ce(c(M), (n) => (_(), m("button", {
                key: c(P)(n),
                "data-provider-key": c(P)(n),
                class: "setup-card",
                onClick: (v) => te(c(P)(n))
              }, [
                i("div", zt, [
                  b(c($), {
                    icon: c(y)(n),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                i("div", Ht, [
                  i("div", Wt, E(c(T)(n)), 1),
                  i("div", qt, E(n.description || `Set up ${c(T)(n)}`), 1)
                ]),
                b(c($), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, Kt))), 128))
            ])
          ])) : j.value ? (_(), m("section", Ft, [
            i("div", Gt, [
              b(c($), { icon: "tabler:search-off" })
            ]),
            i("div", Jt, "No services match “" + E(j.value) + "”", 1)
          ])) : !u.value.length && !t.value.length ? (_(), m("section", Yt, [
            i("div", Zt, [
              b(c($), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = i("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = i("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : N("", !0)
        ], 64))
      ]),
      I.value ? (_(), Ke(We, {
        key: 0,
        providers: u.value,
        provider: F.value,
        reauth: o.value,
        onClose: e[3] || (e[3] = (n) => I.value = !1),
        onConnected: we
      }, null, 8, ["providers", "provider", "reauth"])) : N("", !0),
      a.value ? (_(), m("div", {
        key: 1,
        ref_key: "shareHost",
        ref: B
      }, null, 512)) : N("", !0)
    ]));
  }
}), en = { props: { type: "object", properties: {} } }, tn = {
  wippy: en
};
class nn extends Ae {
  static get wippyConfig() {
    return {
      propsSchema: tn.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Re
    };
  }
  static get vueConfig() {
    return { rootComponent: Xt, plugins: [Be] };
  }
}
Ge(import.meta.url, nn);
//# sourceMappingURL=index.js.map

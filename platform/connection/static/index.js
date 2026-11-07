import { B as Ne, C as Pe, c as Me, r as Te, d as De, b as Y, e as Oe, W as Ae, s as Le, P as Re } from "./styles-BaObeLq2.js";
import { openBlock as _, createElementBlock as m, mergeProps as ne, createElementVNode as i, defineComponent as ue, computed as Z, withModifiers as oe, Fragment as F, createTextVNode as se, toDisplayString as E, createCommentVNode as N, createVNode as b, unref as c, watch as Be, onBeforeUnmount as pe, ref as w, withDirectives as Ie, vModelText as Ue, withCtx as le, renderList as ce, normalizeClass as q, createBlock as Ve, nextTick as Ke } from "vue";
import { s as ze, a as re, _ as He } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-B7Mrf5Y8.js";
import { on as fe, api as W, host as We, loadByTagName as Fe, define as Ge } from "@wippy-fe/proxy";
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
}, qe = Ne.extend({
  name: "progressspinner",
  style: Je,
  classes: Ye
}), Ze = {
  name: "BaseProgressSpinner",
  extends: ze,
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
  style: qe,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, ve = {
  name: "ProgressSpinner",
  extends: Ze,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Qe = ["fill", "stroke-width"];
function Xe(r, n, u, p, f, l) {
  return _(), m("div", ne({
    class: r.cx("root"),
    role: "progressbar"
  }, r.ptmi("root")), [(_(), m("svg", ne({
    class: r.cx("spin"),
    viewBox: "25 25 50 50",
    style: l.svgStyle
  }, r.ptm("spin")), [i("circle", ne({
    class: r.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: r.fill,
    "stroke-width": r.strokeWidth,
    strokeMiterlimit: "10"
  }, r.ptm("circle")), null, 16, Qe)], 16))], 16);
}
ve.render = Xe;
const et = { key: 0 }, tt = /* @__PURE__ */ ue({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(r) {
    const n = r, u = Z(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (p, f) => r.state.deleting_at ? (_(), m("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: f[1] || (f[1] = oe(() => {
      }, ["stop"])),
      onKeydown: f[2] || (f[2] = oe(() => {
      }, ["stop"]))
    }, [
      u.value ? (_(), m(F, { key: 0 }, [
        i("span", null, [
          f[3] || (f[3] = se("Deletion failed", -1)),
          r.state.deletion_job?.last_error ? (_(), m("span", et, ": " + E(r.state.deletion_job.last_error), 1)) : N("", !0)
        ]),
        b(c(re), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: f[0] || (f[0] = oe((l) => p.$emit("retry"), ["stop"]))
        })
      ], 64)) : (_(), m(F, { key: 1 }, [
        b(c(ve), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        f[4] || (f[4] = i("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : N("", !0);
  }
});
function H(r) {
  return !!r && typeof r == "object" && !Array.isArray(r);
}
function nt(r, n) {
  if (n == null) return n;
  switch (r) {
    case "boolean":
    case "checkbox":
      return typeof n == "boolean" ? n : n === "true" ? !0 : n === "false" ? !1 : n;
    case "number":
    case "integer": {
      if (typeof n == "number") return n;
      if (typeof n == "string" && n.trim() !== "") {
        const u = Number(n);
        if (!Number.isNaN(u)) return u;
      }
      return n;
    }
    case "object":
    case "array":
      if (typeof n == "string")
        try {
          const u = JSON.parse(n);
          if (u && typeof u == "object") return u;
        } catch {
        }
      return n;
    default:
      return n;
  }
}
function ot(r, n) {
  if (!n) return r;
  const u = {};
  for (const [p, f] of Object.entries(r))
    u[p] = nt(n[p], f);
  return u;
}
function he(r, n, u) {
  if (n !== void 0 && !n) return null;
  const p = H(r) ? r : {}, f = [
    p,
    H(p.data) ? p.data : null,
    H(p.payload) ? p.payload : null,
    H(p.detail) ? p.detail : null
  ].filter(Boolean);
  for (const l of f) {
    if (l.event !== "component.meta.changed" && l.event !== "component.deleting" && l.event !== "component.deleted") continue;
    const S = String(l.component_id || ""), x = String(p.topic || l.topic || "");
    if (n === void 0) {
      if (!S && (!x.startsWith("component.") || x === "component.")) continue;
    } else if (S && S !== n || !S && x !== `component.${n}`) continue;
    const j = S || n || x.slice(10);
    return l.event === "component.deleting" && typeof l.deletion_job_id == "string" && l.deletion_job_id ? { event: l.event, component_id: j, deletion_job_id: l.deletion_job_id } : l.event !== "component.meta.changed" ? { event: l.event, component_id: j } : {
      event: "component.meta.changed",
      component_id: j,
      meta: ot(H(l.meta) ? l.meta : {}, u),
      deleted: Array.isArray(l.deleted) ? l.deleted.map(String) : []
    };
  }
  return null;
}
function st(r, n, u) {
  const p = he(r, n, u);
  return p?.event === "component.meta.changed" ? p : null;
}
function rt(r, n) {
  const u = he(r, n);
  return u && u.event !== "component.meta.changed" ? u : null;
}
function it(r, n, u) {
  if (!r) return null;
  const p = fe(`component.${r}`, (f) => {
    const l = st(f, r, u);
    l && n(l);
  });
  return typeof p == "function" ? p : null;
}
function de(r, n) {
  if (r && typeof r == "object") {
    const u = r, p = u.response?.data?.error;
    if (typeof p == "string") return p;
    if (p && typeof p == "object" && typeof p.message == "string")
      return p.message;
    if (typeof u.message == "string" && u.message) return u.message;
  }
  return n;
}
function at(r, n, u, p) {
  let f = !0;
  const l = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Map();
  function x(y, g) {
    const v = r.value.find((L) => n(L) === y), d = S.get(y), k = g?.job_id || d?.deletion_job_id || v?.deletion_job_id, D = d ? d.deletion_job_id : v?.deleting_at ? v.deletion_job_id : void 0;
    if ((d || v?.deleting_at) && k === D) return;
    const M = {
      deleting_at: d?.deleting_at || v?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: k
    };
    S.set(y, M), v && (Object.assign(v, M), v.deletion_job = void 0);
  }
  async function j(y) {
    const g = n(y), v = S.get(g), d = () => f && r.value.includes(y) && S.get(g) === v;
    try {
      const { data: k } = await W.get(`/api/v1/components/${encodeURIComponent(g)}`);
      if (!k?.success) throw new Error(de(k, "Could not read deletion progress"));
      d() && (y.deleting_at = v?.deleting_at || k.deleting_at, y.deletion_job_id = k.deletion_job_id, v && (v.deletion_job_id = y.deletion_job_id), y.deletion_job = k.deletion_job ?? null);
    } catch (k) {
      d() && We.handleError("other", { message: de(k, "Could not read deletion progress") });
    }
  }
  let A = [];
  const P = Be(() => r.value, (y, g = []) => {
    const v = y.filter((d) => !l.has(n(d)));
    for (const d of g)
      l.has(n(d)) || v.some((k) => n(k) === n(d)) || d.deleting_at && p?.(n(d));
    if (v.length !== y.length) {
      r.value = v;
      return;
    }
    for (const d of y) {
      const k = S.get(n(d));
      k && (d.deletion_job_id !== k.deletion_job_id && (d.deletion_job = void 0), Object.assign(d, k));
      const D = g.find((M) => n(M) === n(d));
      d.deletion_job === void 0 && D?.deletion_job_id === d.deletion_job_id && (d.deletion_job = D?.deletion_job), d.deleting_at && !A.includes(d) && j(d);
    }
    A = y;
  }, { immediate: !0 }), T = fe("@message", (y) => {
    const g = rt(y);
    if (!g) return;
    const v = r.value.find((d) => n(d) === g.component_id);
    g.event === "component.deleted" ? (v && !l.has(g.component_id) && p?.(g.component_id), l.add(g.component_id), S.delete(g.component_id), r.value = r.value.filter((d) => n(d) !== g.component_id)) : v && x(g.component_id, { job_id: g.deletion_job_id });
  });
  return pe(() => {
    f = !1, P(), typeof T == "function" && T();
  }), { acceptDeletion: x };
}
function lt({ providers: r, connections: n, search: u, confirmId: p }) {
  const f = (o) => o.provider ?? "", l = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", S = (o) => o.icon || "tabler:plug", x = Z(() => {
    const o = {};
    for (const a of r.value) {
      const C = f(a);
      C && (o[C] = a);
    }
    return o;
  });
  function j(o) {
    return o.icon || x.value[o.provider || ""]?.icon || "tabler:plug-connected";
  }
  function A(o) {
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
  function v(o) {
    if (!o.oauth) return !1;
    const a = A(o);
    if (!g(a)) return !1;
    const C = P(o), B = T(a);
    if (C.size === 0 || B.size === 0) return !1;
    for (const Q of C)
      if (!B.has(Q)) return !1;
    return !0;
  }
  function d(o) {
    return Te(o.connection_state, o.expires_at);
  }
  function k(o) {
    const a = d(o);
    return a === "connected" && v(o) ? "warn" : Me[a];
  }
  function D(o) {
    const a = d(o);
    return a === "connected" && v(o) ? "Limited access" : Pe[a];
  }
  function M(o) {
    const a = Number(o.expires_at || 0);
    if (!a) return "";
    const C = a - Math.floor(Date.now() / 1e3);
    return C <= 0 ? "token expired" : C < 3600 ? `expires in ${Math.max(1, Math.floor(C / 60))}m` : C < 86400 ? `expires in ${Math.floor(C / 3600)}h` : `expires in ${Math.floor(C / 86400)}d`;
  }
  function L(o) {
    const a = [];
    if (o.provider && a.push(o.provider), o.oauth) {
      v(o) && a.push("sign-in only");
      const C = M(o);
      C && a.push(C), Number(o.scope_count || 0) > 0 && a.push(`${o.scope_count} scope${o.scope_count === 1 ? "" : "s"}`);
    }
    return a.join(" · ");
  }
  function R(o) {
    if (p.value === o.component_id) return "Click the check again to remove this connection.";
    const a = d(o);
    return a === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : a === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : a === "disabled" ? "This connection is disabled and will not be used." : v(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function O(o) {
    const a = u.value.trim().toLowerCase();
    return !a || o.toLowerCase().includes(a);
  }
  const I = Z(() => r.value.filter((o) => O(`${l(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), G = Z(() => n.value.filter((o) => O(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: f,
    providerLabel: l,
    providerIcon: S,
    connIcon: j,
    providerForConnection: A,
    grantedScopeSet: P,
    defaultScopeSet: T,
    availableScopeValues: y,
    hasOptionalProviderScopes: g,
    hasSignInOnlyScopes: v,
    connectionState: d,
    statusClass: k,
    statusLabel: D,
    expiryText: M,
    statusDetail: L,
    connectionDescription: R,
    filteredProviders: I,
    filteredConnections: G
  };
}
const ct = { class: "conn-page" }, dt = { class: "kx-head" }, ut = { class: "kx-head-icon" }, pt = { class: "kx-head-actions" }, ft = {
  class: "kx-search",
  role: "search"
}, vt = { class: "conn-body" }, ht = {
  key: 0,
  class: "conn-loading"
}, _t = {
  key: 1,
  class: "conn-empty au d1"
}, mt = { class: "lt-empty-hero is-danger" }, gt = { class: "e-sub" }, yt = {
  key: 0,
  class: "msg err au"
}, bt = {
  key: 1,
  class: "block au d1"
}, kt = { class: "live-grid" }, Ct = { class: "lc-top" }, St = { class: "lc-ico" }, xt = { class: "lc-top-r" }, $t = ["title", "aria-label", "onClick", "disabled"], jt = ["title", "aria-label", "onClick", "disabled"], wt = ["title", "aria-label", "onClick", "disabled"], Et = { class: "lc-name" }, Nt = { class: "lc-desc" }, Pt = { class: "lc-primary" }, Mt = {
  key: 0,
  class: "lc-secondary"
}, Tt = {
  key: 0,
  class: "list-foot"
}, Dt = ["disabled"], Ot = {
  key: 2,
  class: "conn-empty au d1"
}, At = { class: "lt-empty-hero is-success" }, Lt = {
  key: 3,
  class: "block au d2"
}, Rt = { class: "block-head" }, Bt = { class: "lt-section-header" }, It = { class: "setup-grid" }, Ut = ["data-provider-key", "onClick"], Vt = { class: "setup-ico" }, Kt = { class: "setup-text" }, zt = { class: "setup-name" }, Ht = { class: "setup-desc" }, Wt = {
  key: 4,
  class: "conn-empty au d1"
}, Ft = { class: "lt-empty-hero is-info" }, Gt = { class: "e-title" }, Jt = {
  key: 5,
  class: "conn-empty au d2"
}, Yt = { class: "lt-empty-hero is-info" }, qt = 100, Zt = /* @__PURE__ */ ue({
  __name: "connections",
  setup(r) {
    const n = w([]), u = w([]), p = w(!0), f = w(!1), l = w(""), S = w(""), x = w(""), j = w(""), A = lt({ providers: u, connections: n, search: j, confirmId: x }), {
      providerKey: P,
      providerLabel: T,
      providerIcon: y,
      connIcon: g,
      statusClass: v,
      statusLabel: d,
      statusDetail: k,
      connectionDescription: D,
      filteredProviders: M,
      filteredConnections: L
    } = A, R = w(0), O = w(!1), I = w(!1), G = w(void 0), o = w(void 0), a = w(!1), C = w(null), B = w(null);
    function Q(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(qt),
        offset: String(s)
      }).toString()}`;
    }
    async function ie(s) {
      const { data: e } = await W.get(Q(s));
      return e ?? { connections: [], total_count: 0, has_more: !1 };
    }
    async function K() {
      p.value = !0, l.value = "", S.value = "";
      try {
        const [s, e, t] = await Promise.all([
          ie(0),
          W.get("/api/v1/oauth/providers/discover"),
          W.get("/api/v1/connections/providers/discover")
        ]);
        n.value = s.connections ?? [], R.value = Number(s.total_count ?? n.value.length), O.value = !!s.has_more, ee(), u.value = me([
          ...e.data?.providers ?? [],
          ...t.data?.providers ?? []
        ]);
      } catch (s) {
        n.value.length ? l.value = Y(s) : S.value = Y(s), ee();
      } finally {
        p.value = !1;
      }
    }
    async function _e() {
      if (!(f.value || !O.value)) {
        f.value = !0, l.value = "";
        try {
          const s = await ie(n.value.length), e = s.connections ?? [];
          n.value = [...n.value, ...e], R.value = Number(s.total_count ?? R.value), O.value = !!s.has_more, ee();
        } catch (s) {
          l.value = Y(s);
        } finally {
          f.value = !1;
        }
      }
    }
    function me(s) {
      const e = {};
      for (const t of s) {
        const h = P(t);
        h && (e[h] = e[h] ? { ...t, ...e[h] } : t);
      }
      return Object.values(e);
    }
    function ge(s) {
      return Array.isArray(s) ? s.filter((e) => typeof e == "string" && e.length > 0) : typeof s != "string" ? [] : s.split(/\s+/).filter(Boolean);
    }
    function ye(s, e, t = []) {
      const h = {};
      if (typeof e.title == "string" && (h.name = e.title), typeof e.provider == "string" && (h.provider = e.provider), typeof e.icon == "string" && (h.icon = e.icon), typeof e.connection_state == "string" && (h.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (h.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (h.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (h.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (h.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const z = ge(e.scopes_granted);
        h.scopes_granted = z, h.scope_count = z.length;
      }
      typeof e.oauth_connection == "boolean" && (h.oauth = e.oauth_connection);
      const V = { ...s, ...h };
      for (const z of t) {
        const Ee = z === "title" ? "name" : z;
        delete V[Ee];
      }
      return V;
    }
    const U = /* @__PURE__ */ new Map(), J = /* @__PURE__ */ new Set();
    let X = 0;
    function be(s, e) {
      n.value = n.value.map((t) => t.component_id === s ? ye(t, e.meta || {}, e.deleted || []) : t);
    }
    function ke() {
      X++, J.clear();
      for (const s of U.values()) s();
      U.clear();
    }
    function ee() {
      const s = new Set(n.value.map((t) => t.component_id).filter(Boolean));
      for (const [t, h] of U)
        s.has(t) || (h(), U.delete(t));
      const e = X;
      for (const t of s) {
        if (U.has(t) || J.has(t)) continue;
        J.add(t);
        const h = it(t, (V) => be(t, V), Oe);
        if (J.delete(t), !!h) {
          if (e !== X || !n.value.some((V) => V.component_id === t)) {
            h();
            continue;
          }
          U.set(t, h);
        }
      }
    }
    function te(s, e) {
      G.value = s, o.value = e, I.value = !0;
    }
    async function Ce(s) {
      C.value = s, a.value = !0, await Ke(), await xe();
    }
    function Se() {
      a.value = !1, C.value = null;
    }
    async function xe() {
      const s = C.value;
      if (!B.value || !s) return;
      if (B.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Fe("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const e = document.createElement("kickside-share");
      e.setAttribute("config", JSON.stringify({
        resource_id: s.component_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(s.component_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(s.component_id)}`,
        title: s.name || s.provider || "Connection"
      })), e.style.display = "block", e.addEventListener("close", Se), B.value.appendChild(e);
    }
    function $e(s) {
      if (!s.provider) return;
      const e = u.value.find((t) => P(t) === s.provider);
      te(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function je() {
      I.value = !1, o.value = void 0, n.value = [], K();
    }
    async function ae(s) {
      if (x.value !== s.component_id) {
        x.value = s.component_id;
        return;
      }
      x.value = "", l.value = "";
      try {
        const { data: e } = await W.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        we(s.component_id, e), await K();
      } catch (e) {
        l.value = Y(e);
      }
    }
    De(K), pe(ke);
    const { acceptDeletion: we } = at(n, (s) => s.component_id, void 0, K);
    return (s, e) => (_(), m("div", ct, [
      i("header", dt, [
        i("div", ut, [
          b(c($), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[4] || (e[4] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "Connections"),
          i("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        i("div", pt, [
          i("label", ft, [
            b(c($), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Ie(i("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => j.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [Ue, j.value]
            ]),
            j.value ? (_(), m("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (t) => j.value = ""),
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
            onClick: e[2] || (e[2] = (t) => te())
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
      i("div", vt, [
        p.value && !n.value.length ? (_(), m("div", ht, "Loading…")) : S.value ? (_(), m("section", _t, [
          i("div", mt, [
            b(c($), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = i("div", { class: "e-title" }, "Couldn't load connections", -1)),
          i("div", gt, E(S.value), 1),
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
        ])) : (_(), m(F, { key: 2 }, [
          l.value ? (_(), m("div", yt, [
            b(c($), { icon: "tabler:alert-circle" }),
            se(E(l.value), 1)
          ])) : N("", !0),
          c(L).length ? (_(), m("section", bt, [
            e[8] || (e[8] = i("div", { class: "block-head" }, [
              i("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            i("div", kt, [
              (_(!0), m(F, null, ce(c(L), (t) => (_(), m("div", {
                key: t.component_id,
                class: q(["live-card s-live", `state-${c(v)(t)}`])
              }, [
                b(tt, {
                  state: t,
                  onRetry: (h) => {
                    x.value = t.component_id, ae(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                i("div", Ct, [
                  i("div", St, [
                    b(c($), {
                      icon: c(g)(t),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  i("div", xt, [
                    i("button", {
                      class: "lc-add",
                      title: `Share ${t.name || t.provider}`,
                      "aria-label": `Share ${t.name || t.provider}`,
                      onClick: (h) => Ce(t),
                      disabled: !!t.deleting_at
                    }, [
                      b(c($), { icon: "tabler:share" })
                    ], 8, $t),
                    i("button", {
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (h) => $e(t),
                      disabled: !!t.deleting_at
                    }, [
                      b(c($), { icon: "tabler:refresh" })
                    ], 8, jt),
                    i("button", {
                      class: q(["lc-add lc-danger", x.value === t.component_id && "armed"]),
                      title: x.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (h) => ae(t),
                      disabled: !!t.deleting_at
                    }, [
                      b(c($), {
                        icon: x.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, wt)
                  ])
                ]),
                i("div", Et, E(t.name || t.provider || "Connection"), 1),
                i("div", Nt, E(c(D)(t)), 1),
                i("div", {
                  class: q(["lc-status", `state-${c(v)(t)}`])
                }, [
                  e[6] || (e[6] = i("span", { class: "dot" }, null, -1)),
                  i("span", Pt, E(c(d)(t)), 1),
                  c(k)(t) ? (_(), m("span", Mt, "· " + E(c(k)(t)), 1)) : N("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            R.value || O.value ? (_(), m("div", Tt, [
              i("span", null, E(n.value.length) + " of " + E(R.value || n.value.length) + " loaded", 1),
              O.value ? (_(), m("button", {
                key: 0,
                class: "ghost-action",
                disabled: f.value,
                onClick: _e
              }, [
                b(c($), {
                  icon: f.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: q(f.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = se(" Load more ", -1))
              ], 8, Dt)) : N("", !0)
            ])) : N("", !0)
          ])) : !j.value && u.value.length ? (_(), m("section", Ot, [
            i("div", At, [
              b(c($), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = i("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = i("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : N("", !0),
          c(M).length ? (_(), m("section", Lt, [
            i("div", Rt, [
              i("h2", Bt, E(c(L).length ? "Add another" : "Available services"), 1)
            ]),
            i("div", It, [
              (_(!0), m(F, null, ce(c(M), (t) => (_(), m("button", {
                key: c(P)(t),
                "data-provider-key": c(P)(t),
                class: "setup-card",
                onClick: (h) => te(c(P)(t))
              }, [
                i("div", Vt, [
                  b(c($), {
                    icon: c(y)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                i("div", Kt, [
                  i("div", zt, E(c(T)(t)), 1),
                  i("div", Ht, E(t.description || `Set up ${c(T)(t)}`), 1)
                ]),
                b(c($), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, Ut))), 128))
            ])
          ])) : j.value ? (_(), m("section", Wt, [
            i("div", Ft, [
              b(c($), { icon: "tabler:search-off" })
            ]),
            i("div", Gt, "No services match “" + E(j.value) + "”", 1)
          ])) : !u.value.length && !n.value.length ? (_(), m("section", Jt, [
            i("div", Yt, [
              b(c($), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = i("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = i("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : N("", !0)
        ], 64))
      ]),
      I.value ? (_(), Ve(He, {
        key: 0,
        providers: u.value,
        provider: G.value,
        reauth: o.value,
        onClose: e[3] || (e[3] = (t) => I.value = !1),
        onConnected: je
      }, null, 8, ["providers", "provider", "reauth"])) : N("", !0),
      a.value ? (_(), m("div", {
        key: 1,
        ref_key: "shareHost",
        ref: B
      }, null, 512)) : N("", !0)
    ]));
  }
}), Qt = { props: { type: "object", properties: {} } }, Xt = {
  wippy: Qt
};
class en extends Ae {
  static get wippyConfig() {
    return {
      propsSchema: Xt.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Le
    };
  }
  static get vueConfig() {
    return { rootComponent: Zt, plugins: [Re] };
  }
}
Ge(import.meta.url, en);
//# sourceMappingURL=index.js.map

import { B as Ne, C as Pe, c as Me, r as De, d as Te, b as Y, e as Oe, W as Ae, s as Le, P as Re } from "./styles-tpVissSe.js";
import { openBlock as _, createElementBlock as m, mergeProps as ne, createElementVNode as i, defineComponent as ue, computed as Z, withModifiers as oe, Fragment as W, createTextVNode as se, toDisplayString as E, createCommentVNode as N, createVNode as b, unref as d, watch as Be, onBeforeUnmount as pe, ref as w, withDirectives as Ie, vModelText as Ue, withCtx as le, renderList as ce, normalizeClass as q, createBlock as Ve, nextTick as Ke } from "vue";
import { s as ze, a as re, _ as He } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-RKLMj11t.js";
import { on as fe, api as H, host as We, loadByTagName as Fe, define as Ge } from "@wippy-fe/proxy";
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
function Xe(r, n, l, p, f, c) {
  return _(), m("div", ne({
    class: r.cx("root"),
    role: "progressbar"
  }, r.ptmi("root")), [(_(), m("svg", ne({
    class: r.cx("spin"),
    viewBox: "25 25 50 50",
    style: c.svgStyle
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
    const n = r, l = Z(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (p, f) => r.state.deleting_at ? (_(), m("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: f[1] || (f[1] = oe(() => {
      }, ["stop"])),
      onKeydown: f[2] || (f[2] = oe(() => {
      }, ["stop"]))
    }, [
      l.value ? (_(), m(W, { key: 0 }, [
        i("span", null, [
          f[3] || (f[3] = se("Deletion failed", -1)),
          r.state.deletion_job?.last_error ? (_(), m("span", et, ": " + E(r.state.deletion_job.last_error), 1)) : N("", !0)
        ]),
        b(d(re), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: f[0] || (f[0] = oe((c) => p.$emit("retry"), ["stop"]))
        })
      ], 64)) : (_(), m(W, { key: 1 }, [
        b(d(ve), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        f[4] || (f[4] = i("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : N("", !0);
  }
}), nt = (r, n) => {
  const l = r.__vccOpts || r;
  for (const [p, f] of n)
    l[p] = f;
  return l;
}, ot = /* @__PURE__ */ nt(tt, [["__scopeId", "data-v-63c136c7"]]);
function z(r) {
  return !!r && typeof r == "object" && !Array.isArray(r);
}
function st(r, n) {
  if (n == null) return n;
  switch (r) {
    case "boolean":
    case "checkbox":
      return typeof n == "boolean" ? n : n === "true" ? !0 : n === "false" ? !1 : n;
    case "number":
    case "integer": {
      if (typeof n == "number") return n;
      if (typeof n == "string" && n.trim() !== "") {
        const l = Number(n);
        if (!Number.isNaN(l)) return l;
      }
      return n;
    }
    case "object":
    case "array":
      if (typeof n == "string")
        try {
          const l = JSON.parse(n);
          if (l && typeof l == "object") return l;
        } catch {
        }
      return n;
    default:
      return n;
  }
}
function rt(r, n) {
  if (!n) return r;
  const l = {};
  for (const [p, f] of Object.entries(r))
    l[p] = st(n[p], f);
  return l;
}
function he(r, n, l) {
  if (n !== void 0 && !n) return null;
  const p = z(r) ? r : {}, f = [
    p,
    z(p.data) ? p.data : null,
    z(p.payload) ? p.payload : null,
    z(p.detail) ? p.detail : null
  ].filter(Boolean);
  for (const c of f) {
    if (c.event !== "component.meta.changed" && c.event !== "component.deleting" && c.event !== "component.deleted") continue;
    const S = String(c.component_id || ""), x = String(p.topic || c.topic || "");
    if (n === void 0) {
      if (!S && (!x.startsWith("component.") || x === "component.")) continue;
    } else if (S && S !== n || !S && x !== `component.${n}`) continue;
    const j = S || n || x.slice(10);
    return c.event === "component.deleting" && typeof c.deletion_job_id == "string" && c.deletion_job_id ? { event: c.event, component_id: j, deletion_job_id: c.deletion_job_id } : c.event !== "component.meta.changed" ? { event: c.event, component_id: j } : {
      event: "component.meta.changed",
      component_id: j,
      meta: rt(z(c.meta) ? c.meta : {}, l),
      deleted: Array.isArray(c.deleted) ? c.deleted.map(String) : []
    };
  }
  return null;
}
function it(r, n, l) {
  const p = he(r, n, l);
  return p?.event === "component.meta.changed" ? p : null;
}
function at(r, n) {
  const l = he(r, n);
  return l && l.event !== "component.meta.changed" ? l : null;
}
function lt(r, n, l) {
  if (!r) return null;
  const p = fe(`component.${r}`, (f) => {
    const c = it(f, r, l);
    c && n(c);
  });
  return typeof p == "function" ? p : null;
}
function de(r, n) {
  if (r && typeof r == "object") {
    const l = r, p = l.response?.data?.error;
    if (typeof p == "string") return p;
    if (p && typeof p == "object" && typeof p.message == "string")
      return p.message;
    if (typeof l.message == "string" && l.message) return l.message;
  }
  return n;
}
function ct(r, n, l, p) {
  let f = !0;
  const c = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Map();
  function x(y, g) {
    const v = r.value.find((L) => n(L) === y), u = S.get(y), k = g?.job_id || u?.deletion_job_id || v?.deletion_job_id, T = u ? u.deletion_job_id : v?.deleting_at ? v.deletion_job_id : void 0;
    if ((u || v?.deleting_at) && k === T) return;
    const M = {
      deleting_at: u?.deleting_at || v?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: k
    };
    S.set(y, M), v && (Object.assign(v, M), v.deletion_job = void 0);
  }
  async function j(y) {
    const g = n(y), v = S.get(g), u = () => f && r.value.includes(y) && S.get(g) === v;
    try {
      const { data: k } = await H.get(`/api/v1/components/${encodeURIComponent(g)}`);
      if (!k?.success) throw new Error(de(k, "Could not read deletion progress"));
      u() && (y.deleting_at = v?.deleting_at || k.deleting_at, y.deletion_job_id = k.deletion_job_id, v && (v.deletion_job_id = y.deletion_job_id), y.deletion_job = k.deletion_job ?? null);
    } catch (k) {
      u() && We.handleError("other", { message: de(k, "Could not read deletion progress") });
    }
  }
  let A = [];
  const P = Be(() => r.value, (y, g = []) => {
    const v = y.filter((u) => !c.has(n(u)));
    for (const u of g)
      c.has(n(u)) || v.some((k) => n(k) === n(u)) || u.deleting_at;
    if (v.length !== y.length) {
      r.value = v;
      return;
    }
    for (const u of y) {
      const k = S.get(n(u));
      k && (u.deletion_job_id !== k.deletion_job_id && (u.deletion_job = void 0), Object.assign(u, k));
      const T = g.find((M) => n(M) === n(u));
      u.deletion_job === void 0 && T?.deletion_job_id === u.deletion_job_id && (u.deletion_job = T?.deletion_job), u.deleting_at && !A.includes(u) && j(u);
    }
    A = y;
  }, { immediate: !0 }), D = fe("@message", (y) => {
    const g = at(y);
    if (!g) return;
    const v = r.value.find((u) => n(u) === g.component_id);
    g.event === "component.deleted" ? (v && c.has(g.component_id), c.add(g.component_id), S.delete(g.component_id), r.value = r.value.filter((u) => n(u) !== g.component_id)) : v && x(g.component_id, { job_id: g.deletion_job_id });
  });
  return pe(() => {
    f = !1, P(), typeof D == "function" && D();
  }), { acceptDeletion: x };
}
function dt({ providers: r, connections: n, search: l, confirmId: p }) {
  const f = (o) => o.provider ?? "", c = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", S = (o) => o.icon || "tabler:plug", x = Z(() => {
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
  function D(o) {
    return new Set((o?.default_scopes ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function y(o) {
    return (o?.available_scopes ?? []).map((a) => a.scope).filter((a) => typeof a == "string" && a.length > 0);
  }
  function g(o) {
    const a = D(o);
    return y(o).some((C) => !a.has(C));
  }
  function v(o) {
    if (!o.oauth) return !1;
    const a = A(o);
    if (!g(a)) return !1;
    const C = P(o), B = D(a);
    if (C.size === 0 || B.size === 0) return !1;
    for (const Q of C)
      if (!B.has(Q)) return !1;
    return !0;
  }
  function u(o) {
    return De(o.connection_state, o.expires_at);
  }
  function k(o) {
    const a = u(o);
    return a === "connected" && v(o) ? "warn" : Me[a];
  }
  function T(o) {
    const a = u(o);
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
    const a = u(o);
    return a === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : a === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : a === "disabled" ? "This connection is disabled and will not be used." : v(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function O(o) {
    const a = l.value.trim().toLowerCase();
    return !a || o.toLowerCase().includes(a);
  }
  const I = Z(() => r.value.filter((o) => O(`${c(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), F = Z(() => n.value.filter((o) => O(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: f,
    providerLabel: c,
    providerIcon: S,
    connIcon: j,
    providerForConnection: A,
    grantedScopeSet: P,
    defaultScopeSet: D,
    availableScopeValues: y,
    hasOptionalProviderScopes: g,
    hasSignInOnlyScopes: v,
    connectionState: u,
    statusClass: k,
    statusLabel: T,
    expiryText: M,
    statusDetail: L,
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
}, St = { class: "live-grid" }, xt = { class: "lc-top" }, $t = { class: "lc-ico" }, jt = { class: "lc-top-r" }, wt = ["title", "aria-label", "onClick", "disabled"], Et = ["title", "aria-label", "onClick", "disabled"], Nt = ["title", "aria-label", "onClick", "disabled"], Pt = { class: "lc-name" }, Mt = { class: "lc-desc" }, Dt = { class: "lc-primary" }, Tt = {
  key: 0,
  class: "lc-secondary"
}, Ot = {
  key: 0,
  class: "list-foot"
}, At = ["disabled"], Lt = {
  key: 2,
  class: "conn-empty au d1"
}, Rt = { class: "lt-empty-hero is-success" }, Bt = {
  key: 3,
  class: "block au d2"
}, It = { class: "block-head" }, Ut = { class: "lt-section-header" }, Vt = { class: "setup-grid" }, Kt = ["data-provider-key", "onClick"], zt = { class: "setup-ico" }, Ht = { class: "setup-text" }, Wt = { class: "setup-name" }, Ft = { class: "setup-desc" }, Gt = {
  key: 4,
  class: "conn-empty au d1"
}, Jt = { class: "lt-empty-hero is-info" }, Yt = { class: "e-title" }, qt = {
  key: 5,
  class: "conn-empty au d2"
}, Zt = { class: "lt-empty-hero is-info" }, Qt = 100, Xt = /* @__PURE__ */ ue({
  __name: "connections",
  setup(r) {
    const n = w([]), l = w([]), p = w(!0), f = w(!1), c = w(""), S = w(""), x = w(""), j = w(""), A = dt({ providers: l, connections: n, search: j, confirmId: x }), {
      providerKey: P,
      providerLabel: D,
      providerIcon: y,
      connIcon: g,
      statusClass: v,
      statusLabel: u,
      statusDetail: k,
      connectionDescription: T,
      filteredProviders: M,
      filteredConnections: L
    } = A, R = w(0), O = w(!1), I = w(!1), F = w(void 0), o = w(void 0), a = w(!1), C = w(null), B = w(null);
    function Q(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(Qt),
        offset: String(s)
      }).toString()}`;
    }
    async function ie(s) {
      const { data: e } = await H.get(Q(s));
      return e ?? { connections: [], total_count: 0, has_more: !1 };
    }
    async function G() {
      p.value = !0, c.value = "", S.value = "";
      try {
        const [s, e, t] = await Promise.all([
          ie(0),
          H.get("/api/v1/oauth/providers/discover"),
          H.get("/api/v1/connections/providers/discover")
        ]);
        n.value = s.connections ?? [], R.value = Number(s.total_count ?? n.value.length), O.value = !!s.has_more, ee(), l.value = me([
          ...e.data?.providers ?? [],
          ...t.data?.providers ?? []
        ]);
      } catch (s) {
        n.value.length ? c.value = Y(s) : S.value = Y(s), ee();
      } finally {
        p.value = !1;
      }
    }
    async function _e() {
      if (!(f.value || !O.value)) {
        f.value = !0, c.value = "";
        try {
          const s = await ie(n.value.length), e = s.connections ?? [];
          n.value = [...n.value, ...e], R.value = Number(s.total_count ?? R.value), O.value = !!s.has_more, ee();
        } catch (s) {
          c.value = Y(s);
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
        const K = ge(e.scopes_granted);
        h.scopes_granted = K, h.scope_count = K.length;
      }
      typeof e.oauth_connection == "boolean" && (h.oauth = e.oauth_connection);
      const V = { ...s, ...h };
      for (const K of t) {
        const Ee = K === "title" ? "name" : K;
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
        const h = lt(t, (V) => be(t, V), Oe);
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
      F.value = s, o.value = e, I.value = !0;
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
      const e = l.value.find((t) => P(t) === s.provider);
      te(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function je() {
      I.value = !1, o.value = void 0, n.value = [], G();
    }
    async function ae(s) {
      if (x.value !== s.component_id) {
        x.value = s.component_id;
        return;
      }
      x.value = "", c.value = "";
      try {
        const { data: e } = await H.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        we(s.component_id, e), await G();
      } catch (e) {
        c.value = Y(e);
      }
    }
    Te(G), pe(ke);
    const { acceptDeletion: we } = ct(n, (s) => s.component_id);
    return (s, e) => (_(), m("div", ut, [
      i("header", pt, [
        i("div", ft, [
          b(d($), {
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
            b(d($), {
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
              b(d($), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : N("", !0)
          ]),
          b(d(re), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (t) => te())
          }, {
            icon: le(() => [
              b(d($), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      i("div", _t, [
        p.value && !n.value.length ? (_(), m("div", mt, "Loading…")) : S.value ? (_(), m("section", gt, [
          i("div", yt, [
            b(d($), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = i("div", { class: "e-title" }, "Couldn't load connections", -1)),
          i("div", bt, E(S.value), 1),
          b(d(re), {
            label: "Try again",
            class: "conn-retry",
            onClick: G
          }, {
            icon: le(() => [
              b(d($), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (_(), m(W, { key: 2 }, [
          c.value ? (_(), m("div", kt, [
            b(d($), { icon: "tabler:alert-circle" }),
            se(E(c.value), 1)
          ])) : N("", !0),
          d(L).length ? (_(), m("section", Ct, [
            e[8] || (e[8] = i("div", { class: "block-head" }, [
              i("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            i("div", St, [
              (_(!0), m(W, null, ce(d(L), (t) => (_(), m("div", {
                key: t.component_id,
                class: q(["live-card s-live", `state-${d(v)(t)}`])
              }, [
                b(ot, {
                  state: t,
                  onRetry: (h) => {
                    x.value = t.component_id, ae(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                i("div", xt, [
                  i("div", $t, [
                    b(d($), {
                      icon: d(g)(t),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  i("div", jt, [
                    i("button", {
                      class: "lc-add",
                      title: `Share ${t.name || t.provider}`,
                      "aria-label": `Share ${t.name || t.provider}`,
                      onClick: (h) => Ce(t),
                      disabled: !!t.deleting_at
                    }, [
                      b(d($), { icon: "tabler:share" })
                    ], 8, wt),
                    i("button", {
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (h) => $e(t),
                      disabled: !!t.deleting_at
                    }, [
                      b(d($), { icon: "tabler:refresh" })
                    ], 8, Et),
                    i("button", {
                      class: q(["lc-add lc-danger", x.value === t.component_id && "armed"]),
                      title: x.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (h) => ae(t),
                      disabled: !!t.deleting_at
                    }, [
                      b(d($), {
                        icon: x.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, Nt)
                  ])
                ]),
                i("div", Pt, E(t.name || t.provider || "Connection"), 1),
                i("div", Mt, E(d(T)(t)), 1),
                i("div", {
                  class: q(["lc-status", `state-${d(v)(t)}`])
                }, [
                  e[6] || (e[6] = i("span", { class: "dot" }, null, -1)),
                  i("span", Dt, E(d(u)(t)), 1),
                  d(k)(t) ? (_(), m("span", Tt, "· " + E(d(k)(t)), 1)) : N("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            R.value || O.value ? (_(), m("div", Ot, [
              i("span", null, E(n.value.length) + " of " + E(R.value || n.value.length) + " loaded", 1),
              O.value ? (_(), m("button", {
                key: 0,
                class: "ghost-action",
                disabled: f.value,
                onClick: _e
              }, [
                b(d($), {
                  icon: f.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: q(f.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = se(" Load more ", -1))
              ], 8, At)) : N("", !0)
            ])) : N("", !0)
          ])) : !j.value && l.value.length ? (_(), m("section", Lt, [
            i("div", Rt, [
              b(d($), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = i("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = i("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : N("", !0),
          d(M).length ? (_(), m("section", Bt, [
            i("div", It, [
              i("h2", Ut, E(d(L).length ? "Add another" : "Available services"), 1)
            ]),
            i("div", Vt, [
              (_(!0), m(W, null, ce(d(M), (t) => (_(), m("button", {
                key: d(P)(t),
                "data-provider-key": d(P)(t),
                class: "setup-card",
                onClick: (h) => te(d(P)(t))
              }, [
                i("div", zt, [
                  b(d($), {
                    icon: d(y)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                i("div", Ht, [
                  i("div", Wt, E(d(D)(t)), 1),
                  i("div", Ft, E(t.description || `Set up ${d(D)(t)}`), 1)
                ]),
                b(d($), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, Kt))), 128))
            ])
          ])) : j.value ? (_(), m("section", Gt, [
            i("div", Jt, [
              b(d($), { icon: "tabler:search-off" })
            ]),
            i("div", Yt, "No services match “" + E(j.value) + "”", 1)
          ])) : !l.value.length && !n.value.length ? (_(), m("section", qt, [
            i("div", Zt, [
              b(d($), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = i("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = i("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : N("", !0)
        ], 64))
      ]),
      I.value ? (_(), Ve(He, {
        key: 0,
        providers: l.value,
        provider: F.value,
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
}), en = { props: { type: "object", properties: {} } }, tn = {
  wippy: en
};
class nn extends Ae {
  static get wippyConfig() {
    return {
      propsSchema: tn.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Le
    };
  }
  static get vueConfig() {
    return { rootComponent: Xt, plugins: [Re] };
  }
}
Ge(import.meta.url, nn);
//# sourceMappingURL=index.js.map

import { B as Ne, C as Pe, c as Me, r as Te, d as Oe, b as F, e as De, W as Le, s as Ae, P as Re } from "./styles-Bx2Y_Hv8.js";
import { openBlock as h, createElementBlock as m, mergeProps as ne, createElementVNode as i, defineComponent as ue, computed as Y, withModifiers as oe, Fragment as H, createTextVNode as se, toDisplayString as N, createCommentVNode as M, createVNode as y, unref as c, watch as Be, onBeforeUnmount as pe, ref as x, withDirectives as Ie, vModelText as Ve, withCtx as ce, renderList as de, normalizeClass as G, createBlock as Ue, nextTick as Ke } from "vue";
import { s as ze, a as re, _ as He } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-BySRXbJq.js";
import { on as fe, api as J, loadByTagName as We, define as qe } from "@wippy-fe/proxy";
import { Icon as S } from "@iconify/vue";
var Fe = `
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
`, Ge = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Je = Ne.extend({
  name: "progressspinner",
  style: Fe,
  classes: Ge
}), Ye = {
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
  style: Je,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, ve = {
  name: "ProgressSpinner",
  extends: Ye,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Ze = ["fill", "stroke-width"];
function Qe(r, n, p, f, u, l) {
  return h(), m("div", ne({
    class: r.cx("root"),
    role: "progressbar"
  }, r.ptmi("root")), [(h(), m("svg", ne({
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
  }, r.ptm("circle")), null, 16, Ze)], 16))], 16);
}
ve.render = Qe;
const Xe = { key: 0 }, et = /* @__PURE__ */ ue({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(r) {
    const n = r, p = Y(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (f, u) => r.state.deleting_at ? (h(), m("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: u[1] || (u[1] = oe(() => {
      }, ["stop"])),
      onKeydown: u[2] || (u[2] = oe(() => {
      }, ["stop"]))
    }, [
      p.value ? (h(), m(H, { key: 0 }, [
        i("span", null, [
          u[3] || (u[3] = se("Deletion failed", -1)),
          r.state.deletion_job?.last_error ? (h(), m("span", Xe, ": " + N(r.state.deletion_job.last_error), 1)) : M("", !0)
        ]),
        y(c(re), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: u[0] || (u[0] = oe((l) => f.$emit("retry"), ["stop"]))
        })
      ], 64)) : (h(), m(H, { key: 1 }, [
        y(c(ve), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        u[4] || (u[4] = i("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : M("", !0);
  }
});
function z(r) {
  return !!r && typeof r == "object" && !Array.isArray(r);
}
function tt(r, n) {
  if (n == null) return n;
  switch (r) {
    case "boolean":
    case "checkbox":
      return typeof n == "boolean" ? n : n === "true" ? !0 : n === "false" ? !1 : n;
    case "number":
    case "integer": {
      if (typeof n == "number") return n;
      if (typeof n == "string" && n.trim() !== "") {
        const p = Number(n);
        if (!Number.isNaN(p)) return p;
      }
      return n;
    }
    case "object":
    case "array":
      if (typeof n == "string")
        try {
          const p = JSON.parse(n);
          if (p && typeof p == "object") return p;
        } catch {
        }
      return n;
    default:
      return n;
  }
}
function nt(r, n) {
  if (!n) return r;
  const p = {};
  for (const [f, u] of Object.entries(r))
    p[f] = tt(n[f], u);
  return p;
}
function he(r, n, p) {
  if (n !== void 0 && !n) return null;
  const f = z(r) ? r : {}, u = [
    f,
    z(f.data) ? f.data : null,
    z(f.payload) ? f.payload : null,
    z(f.detail) ? f.detail : null
  ].filter(Boolean);
  for (const l of u) {
    if (l.event !== "component.meta.changed" && l.event !== "component.deleting" && l.event !== "component.deleted") continue;
    const $ = String(l.component_id || ""), k = String(f.topic || l.topic || "");
    if (n === void 0) {
      if (!$ && (!k.startsWith("component.") || k === "component.")) continue;
    } else if ($ && $ !== n || !$ && k !== `component.${n}`) continue;
    const C = $ || n || k.slice(10);
    return l.event === "component.deleting" && typeof l.deletion_job_id == "string" && l.deletion_job_id ? { event: l.event, component_id: C, deletion_job_id: l.deletion_job_id } : l.event !== "component.meta.changed" ? { event: l.event, component_id: C } : {
      event: "component.meta.changed",
      component_id: C,
      meta: nt(z(l.meta) ? l.meta : {}, p),
      deleted: Array.isArray(l.deleted) ? l.deleted.map(String) : []
    };
  }
  return null;
}
function ot(r, n, p) {
  const f = he(r, n, p);
  return f?.event === "component.meta.changed" ? f : null;
}
function st(r, n) {
  const p = he(r, n);
  return p && p.event !== "component.meta.changed" ? p : null;
}
function rt(r, n, p) {
  if (!r) return null;
  const f = fe(`component.${r}`, (u) => {
    const l = ot(u, r, p);
    l && n(l);
  });
  return typeof f == "function" ? f : null;
}
function it(r, n, p, f) {
  const u = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map();
  function $(w, _) {
    const g = r.value.find((L) => n(L) === w), d = l.get(w), j = _?.job_id || d?.deletion_job_id || g?.deletion_job_id, E = d ? d.deletion_job_id : g?.deleting_at ? g.deletion_job_id : void 0;
    if ((d || g?.deleting_at) && j === E) return;
    const P = {
      deleting_at: d?.deleting_at || g?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: j
    };
    l.set(w, P), g && (Object.assign(g, P), g.deletion_job = void 0);
  }
  const k = Be(() => r.value, (w, _ = []) => {
    const g = w.filter((d) => !u.has(n(d)));
    for (const d of _)
      u.has(n(d)) || g.some((j) => n(j) === n(d)) || d.deleting_at && f?.(n(d));
    if (g.length !== w.length) {
      r.value = g;
      return;
    }
    for (const d of w) {
      d.deleting_at && d.deletion_job === void 0 && !_.includes(d) && (d.deletion_job = null);
      const j = l.get(n(d));
      j && (d.deletion_job_id !== j.deletion_job_id && (d.deletion_job = void 0), Object.assign(d, j));
      const E = _.find((P) => n(P) === n(d));
      d.deletion_job === void 0 && E?.deletion_job_id === d.deletion_job_id && (d.deletion_job = E?.deletion_job);
    }
  }, { immediate: !0 }), C = fe("@message", (w) => {
    const _ = st(w);
    if (!_) return;
    const g = r.value.find((d) => n(d) === _.component_id);
    _.event === "component.deleted" ? (g && !u.has(_.component_id) && f?.(_.component_id), u.add(_.component_id), l.delete(_.component_id), r.value = r.value.filter((d) => n(d) !== _.component_id)) : g && $(_.component_id, { job_id: _.deletion_job_id });
  });
  return pe(() => {
    k(), typeof C == "function" && C();
  }), { acceptDeletion: $ };
}
function at() {
  let r = 0;
  return () => {
    const n = ++r;
    return () => n === r;
  };
}
function lt({ providers: r, connections: n, search: p, confirmId: f }) {
  const u = (o) => o.provider ?? "", l = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", $ = (o) => o.icon || "tabler:plug", k = Y(() => {
    const o = {};
    for (const a of r.value) {
      const b = u(a);
      b && (o[b] = a);
    }
    return o;
  });
  function C(o) {
    return o.icon || k.value[o.provider || ""]?.icon || "tabler:plug-connected";
  }
  function w(o) {
    return o.provider ? k.value[o.provider] : void 0;
  }
  function _(o) {
    return new Set((o.scopes_granted ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function g(o) {
    return new Set((o?.default_scopes ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function d(o) {
    return (o?.available_scopes ?? []).map((a) => a.scope).filter((a) => typeof a == "string" && a.length > 0);
  }
  function j(o) {
    const a = g(o);
    return d(o).some((b) => !a.has(b));
  }
  function E(o) {
    if (!o.oauth) return !1;
    const a = w(o);
    if (!j(a)) return !1;
    const b = _(o), D = g(a);
    if (b.size === 0 || D.size === 0) return !1;
    for (const Q of b)
      if (!D.has(Q)) return !1;
    return !0;
  }
  function P(o) {
    return Te(o.connection_state, o.expires_at);
  }
  function L(o) {
    const a = P(o);
    return a === "connected" && E(o) ? "warn" : Me[a];
  }
  function Z(o) {
    const a = P(o);
    return a === "connected" && E(o) ? "Limited access" : Pe[a];
  }
  function I(o) {
    const a = Number(o.expires_at || 0);
    if (!a) return "";
    const b = a - Math.floor(Date.now() / 1e3);
    return b <= 0 ? "token expired" : b < 3600 ? `expires in ${Math.max(1, Math.floor(b / 60))}m` : b < 86400 ? `expires in ${Math.floor(b / 3600)}h` : `expires in ${Math.floor(b / 86400)}d`;
  }
  function V(o) {
    const a = [];
    if (o.provider && a.push(o.provider), o.oauth) {
      E(o) && a.push("sign-in only");
      const b = I(o);
      b && a.push(b), Number(o.scope_count || 0) > 0 && a.push(`${o.scope_count} scope${o.scope_count === 1 ? "" : "s"}`);
    }
    return a.join(" · ");
  }
  function O(o) {
    if (f.value === o.component_id) return "Click the check again to remove this connection.";
    const a = P(o);
    return a === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : a === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : a === "disabled" ? "This connection is disabled and will not be used." : E(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function T(o) {
    const a = p.value.trim().toLowerCase();
    return !a || o.toLowerCase().includes(a);
  }
  const A = Y(() => r.value.filter((o) => T(`${l(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), W = Y(() => n.value.filter((o) => T(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: u,
    providerLabel: l,
    providerIcon: $,
    connIcon: C,
    providerForConnection: w,
    grantedScopeSet: _,
    defaultScopeSet: g,
    availableScopeValues: d,
    hasOptionalProviderScopes: j,
    hasSignInOnlyScopes: E,
    connectionState: P,
    statusClass: L,
    statusLabel: Z,
    expiryText: I,
    statusDetail: V,
    connectionDescription: O,
    filteredProviders: A,
    filteredConnections: W
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
}, kt = { class: "live-grid" }, Ct = { class: "lc-top" }, St = { class: "lc-ico" }, xt = { class: "lc-top-r" }, $t = ["title", "aria-label", "onClick", "disabled"], wt = ["title", "aria-label", "onClick", "disabled"], jt = ["title", "aria-label", "onClick", "disabled"], Et = { class: "lc-name" }, Nt = { class: "lc-desc" }, Pt = { class: "lc-primary" }, Mt = {
  key: 0,
  class: "lc-secondary"
}, Tt = {
  key: 0,
  class: "list-foot"
}, Ot = ["disabled"], Dt = {
  key: 2,
  class: "conn-empty au d1"
}, Lt = { class: "lt-empty-hero is-success" }, At = {
  key: 3,
  class: "block au d2"
}, Rt = { class: "block-head" }, Bt = { class: "lt-section-header" }, It = { class: "setup-grid" }, Vt = ["data-provider-key", "onClick"], Ut = { class: "setup-ico" }, Kt = { class: "setup-text" }, zt = { class: "setup-name" }, Ht = { class: "setup-desc" }, Wt = {
  key: 4,
  class: "conn-empty au d1"
}, qt = { class: "lt-empty-hero is-info" }, Ft = { class: "e-title" }, Gt = {
  key: 5,
  class: "conn-empty au d2"
}, Jt = { class: "lt-empty-hero is-info" }, Yt = 100, Zt = /* @__PURE__ */ ue({
  __name: "connections",
  setup(r) {
    const n = x([]), p = x([]), f = x(!0), u = x(!1), l = x(""), $ = x(""), k = x(""), C = x(""), w = lt({ providers: p, connections: n, search: C, confirmId: k }), {
      providerKey: _,
      providerLabel: g,
      providerIcon: d,
      connIcon: j,
      statusClass: E,
      statusLabel: P,
      statusDetail: L,
      connectionDescription: Z,
      filteredProviders: I,
      filteredConnections: V
    } = w, O = x(0), T = x(!1), A = x(!1), W = x(void 0), o = x(void 0), a = x(!1), b = x(null), D = x(null);
    function Q(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(Yt),
        offset: String(s)
      }).toString()}`;
    }
    async function ie(s) {
      const { data: e } = await J.get(Q(s));
      if (!e?.success) throw Object.assign(new Error("Could not load connections."), { response: { data: e } });
      return e;
    }
    const ae = at();
    async function U() {
      const s = ae();
      f.value = !0, u.value = !1, l.value = "", $.value = "";
      try {
        const [e, t, v] = await Promise.all([
          ie(0),
          J.get("/api/v1/oauth/providers/discover"),
          J.get("/api/v1/connections/providers/discover")
        ]);
        if (!s()) return;
        n.value = e.connections ?? [], O.value = Number(e.total_count ?? n.value.length), T.value = !!e.has_more, ee(), p.value = me([
          ...t.data?.providers ?? [],
          ...v.data?.providers ?? []
        ]);
      } catch (e) {
        if (!s()) return;
        n.value.length ? l.value = F(e) : $.value = F(e), ee();
      } finally {
        s() && (f.value = !1);
      }
    }
    async function _e() {
      if (f.value || u.value || !T.value) return;
      const s = ae();
      u.value = !0, l.value = "";
      try {
        const e = await ie(n.value.length);
        if (!s()) return;
        const t = e.connections ?? [];
        n.value = [...n.value, ...t], O.value = Number(e.total_count ?? O.value), T.value = !!e.has_more, ee();
      } catch (e) {
        s() && (l.value = F(e));
      } finally {
        s() && (u.value = !1);
      }
    }
    function me(s) {
      const e = {};
      for (const t of s) {
        const v = _(t);
        v && (e[v] = e[v] ? { ...t, ...e[v] } : t);
      }
      return Object.values(e);
    }
    function ge(s) {
      return Array.isArray(s) ? s.filter((e) => typeof e == "string" && e.length > 0) : typeof s != "string" ? [] : s.split(/\s+/).filter(Boolean);
    }
    function ye(s, e, t = []) {
      const v = {};
      if (typeof e.title == "string" && (v.name = e.title), typeof e.provider == "string" && (v.provider = e.provider), typeof e.icon == "string" && (v.icon = e.icon), typeof e.connection_state == "string" && (v.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (v.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (v.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (v.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (v.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const K = ge(e.scopes_granted);
        v.scopes_granted = K, v.scope_count = K.length;
      }
      typeof e.oauth_connection == "boolean" && (v.oauth = e.oauth_connection);
      const B = { ...s, ...v };
      for (const K of t) {
        const Ee = K === "title" ? "name" : K;
        delete B[Ee];
      }
      return B;
    }
    const R = /* @__PURE__ */ new Map(), q = /* @__PURE__ */ new Set();
    let X = 0;
    function be(s, e) {
      n.value = n.value.map((t) => t.component_id === s ? ye(t, e.meta || {}, e.deleted || []) : t);
    }
    function ke() {
      X++, q.clear();
      for (const s of R.values()) s();
      R.clear();
    }
    function ee() {
      const s = new Set(n.value.map((t) => t.component_id).filter(Boolean));
      for (const [t, v] of R)
        s.has(t) || (v(), R.delete(t));
      const e = X;
      for (const t of s) {
        if (R.has(t) || q.has(t)) continue;
        q.add(t);
        const v = rt(t, (B) => be(t, B), De);
        if (q.delete(t), !!v) {
          if (e !== X || !n.value.some((B) => B.component_id === t)) {
            v();
            continue;
          }
          R.set(t, v);
        }
      }
    }
    function te(s, e) {
      W.value = s, o.value = e, A.value = !0;
    }
    async function Ce(s) {
      b.value = s, a.value = !0, await Ke(), await xe();
    }
    function Se() {
      a.value = !1, b.value = null;
    }
    async function xe() {
      const s = b.value;
      if (!D.value || !s) return;
      if (D.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await We("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const e = document.createElement("kickside-share");
      e.setAttribute("config", JSON.stringify({
        resource_id: s.component_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(s.component_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(s.component_id)}`,
        title: s.name || s.provider || "Connection"
      })), e.style.display = "block", e.addEventListener("close", Se), D.value.appendChild(e);
    }
    function $e(s) {
      if (!s.provider) return;
      const e = p.value.find((t) => _(t) === s.provider);
      te(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function we() {
      A.value = !1, o.value = void 0, n.value = [], U();
    }
    async function le(s) {
      if (k.value !== s.component_id) {
        k.value = s.component_id;
        return;
      }
      k.value = "", l.value = "";
      try {
        const { data: e } = await J.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        je(s.component_id, e), await U();
      } catch (e) {
        l.value = F(e);
      }
    }
    Oe(U), pe(ke);
    const { acceptDeletion: je } = it(n, (s) => s.component_id, void 0, U);
    return (s, e) => (h(), m("div", ct, [
      i("header", dt, [
        i("div", ut, [
          y(c(S), {
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
            y(c(S), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Ie(i("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => C.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [Ve, C.value]
            ]),
            C.value ? (h(), m("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (t) => C.value = ""),
              "aria-label": "Clear search"
            }, [
              y(c(S), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : M("", !0)
          ]),
          y(c(re), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (t) => te())
          }, {
            icon: ce(() => [
              y(c(S), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      i("div", vt, [
        f.value && !n.value.length ? (h(), m("div", ht, "Loading…")) : $.value ? (h(), m("section", _t, [
          i("div", mt, [
            y(c(S), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = i("div", { class: "e-title" }, "Couldn't load connections", -1)),
          i("div", gt, N($.value), 1),
          y(c(re), {
            label: "Try again",
            class: "conn-retry",
            onClick: U
          }, {
            icon: ce(() => [
              y(c(S), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (h(), m(H, { key: 2 }, [
          l.value ? (h(), m("div", yt, [
            y(c(S), { icon: "tabler:alert-circle" }),
            se(N(l.value), 1)
          ])) : M("", !0),
          c(V).length ? (h(), m("section", bt, [
            e[8] || (e[8] = i("div", { class: "block-head" }, [
              i("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            i("div", kt, [
              (h(!0), m(H, null, de(c(V), (t) => (h(), m("div", {
                key: t.component_id,
                class: G(["live-card s-live", `state-${c(E)(t)}`])
              }, [
                y(et, {
                  state: t,
                  onRetry: (v) => {
                    k.value = t.component_id, le(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                i("div", Ct, [
                  i("div", St, [
                    y(c(S), {
                      icon: c(j)(t),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  i("div", xt, [
                    i("button", {
                      class: "lc-add",
                      title: `Share ${t.name || t.provider}`,
                      "aria-label": `Share ${t.name || t.provider}`,
                      onClick: (v) => Ce(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(c(S), { icon: "tabler:share" })
                    ], 8, $t),
                    i("button", {
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (v) => $e(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(c(S), { icon: "tabler:refresh" })
                    ], 8, wt),
                    i("button", {
                      class: G(["lc-add lc-danger", k.value === t.component_id && "armed"]),
                      title: k.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (v) => le(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(c(S), {
                        icon: k.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, jt)
                  ])
                ]),
                i("div", Et, N(t.name || t.provider || "Connection"), 1),
                i("div", Nt, N(c(Z)(t)), 1),
                i("div", {
                  class: G(["lc-status", `state-${c(E)(t)}`])
                }, [
                  e[6] || (e[6] = i("span", { class: "dot" }, null, -1)),
                  i("span", Pt, N(c(P)(t)), 1),
                  c(L)(t) ? (h(), m("span", Mt, "· " + N(c(L)(t)), 1)) : M("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            O.value || T.value ? (h(), m("div", Tt, [
              i("span", null, N(n.value.length) + " of " + N(O.value || n.value.length) + " loaded", 1),
              T.value ? (h(), m("button", {
                key: 0,
                class: "ghost-action",
                disabled: f.value || u.value,
                onClick: _e
              }, [
                y(c(S), {
                  icon: u.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: G(u.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = se(" Load more ", -1))
              ], 8, Ot)) : M("", !0)
            ])) : M("", !0)
          ])) : !C.value && p.value.length ? (h(), m("section", Dt, [
            i("div", Lt, [
              y(c(S), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = i("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = i("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : M("", !0),
          c(I).length ? (h(), m("section", At, [
            i("div", Rt, [
              i("h2", Bt, N(c(V).length ? "Add another" : "Available services"), 1)
            ]),
            i("div", It, [
              (h(!0), m(H, null, de(c(I), (t) => (h(), m("button", {
                key: c(_)(t),
                "data-provider-key": c(_)(t),
                class: "setup-card",
                onClick: (v) => te(c(_)(t))
              }, [
                i("div", Ut, [
                  y(c(S), {
                    icon: c(d)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                i("div", Kt, [
                  i("div", zt, N(c(g)(t)), 1),
                  i("div", Ht, N(t.description || `Set up ${c(g)(t)}`), 1)
                ]),
                y(c(S), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, Vt))), 128))
            ])
          ])) : C.value ? (h(), m("section", Wt, [
            i("div", qt, [
              y(c(S), { icon: "tabler:search-off" })
            ]),
            i("div", Ft, "No services match “" + N(C.value) + "”", 1)
          ])) : !p.value.length && !n.value.length ? (h(), m("section", Gt, [
            i("div", Jt, [
              y(c(S), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = i("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = i("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : M("", !0)
        ], 64))
      ]),
      A.value ? (h(), Ue(He, {
        key: 0,
        providers: p.value,
        provider: W.value,
        reauth: o.value,
        onClose: e[3] || (e[3] = (t) => A.value = !1),
        onConnected: we
      }, null, 8, ["providers", "provider", "reauth"])) : M("", !0),
      a.value ? (h(), m("div", {
        key: 1,
        ref_key: "shareHost",
        ref: D
      }, null, 512)) : M("", !0)
    ]));
  }
}), Qt = { props: { type: "object", properties: {} } }, Xt = {
  wippy: Qt
};
class en extends Le {
  static get wippyConfig() {
    return {
      propsSchema: Xt.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ae
    };
  }
  static get vueConfig() {
    return { rootComponent: Zt, plugins: [Re] };
  }
}
qe(import.meta.url, en);
//# sourceMappingURL=index.js.map

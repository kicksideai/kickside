import { B as Ne, C as Pe, c as Me, r as Te, d as Ae, b as J, e as De, W as Le, s as je, P as Oe } from "./styles-tpVissSe.js";
import { openBlock as m, createElementBlock as g, mergeProps as ne, createElementVNode as i, defineComponent as ue, computed as q, withModifiers as oe, Fragment as V, createTextVNode as se, toDisplayString as x, createCommentVNode as w, createVNode as _, unref as d, watch as Re, onBeforeUnmount as pe, ref as k, withDirectives as Be, vModelText as Ie, withCtx as le, renderList as ce, normalizeClass as Y, createBlock as Ue, nextTick as Ve } from "vue";
import { s as Ke, a as re, _ as ze } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-RKLMj11t.js";
import { on as fe, api as U, host as He, loadByTagName as We, define as Fe } from "@wippy-fe/proxy";
import { Icon as b } from "@iconify/vue";
var Ge = `
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
`, Je = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Ye = Ne.extend({
  name: "progressspinner",
  style: Ge,
  classes: Je
}), qe = {
  name: "BaseProgressSpinner",
  extends: Ke,
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
  style: Ye,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, ve = {
  name: "ProgressSpinner",
  extends: qe,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Ze = ["fill", "stroke-width"];
function Qe(r, o, l, c, u, p) {
  return m(), g("div", ne({
    class: r.cx("root"),
    role: "progressbar"
  }, r.ptmi("root")), [(m(), g("svg", ne({
    class: r.cx("spin"),
    viewBox: "25 25 50 50",
    style: p.svgStyle
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
    const o = r, l = q(() => o.state.deletion_job?.status === "dead");
    return (c, u) => r.state.deleting_at ? (m(), g("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: u[1] || (u[1] = oe(() => {
      }, ["stop"])),
      onKeydown: u[2] || (u[2] = oe(() => {
      }, ["stop"]))
    }, [
      l.value ? (m(), g(V, { key: 0 }, [
        i("span", null, [
          u[3] || (u[3] = se("Deletion failed", -1)),
          r.state.deletion_job?.last_error ? (m(), g("span", Xe, ": " + x(r.state.deletion_job.last_error), 1)) : w("", !0)
        ]),
        _(d(re), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: u[0] || (u[0] = oe((p) => c.$emit("retry"), ["stop"]))
        })
      ], 64)) : (m(), g(V, { key: 1 }, [
        _(d(ve), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        u[4] || (u[4] = i("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : w("", !0);
  }
}), tt = (r, o) => {
  const l = r.__vccOpts || r;
  for (const [c, u] of o)
    l[c] = u;
  return l;
}, nt = /* @__PURE__ */ tt(et, [["__scopeId", "data-v-47ff2c34"]]);
function I(r) {
  return !!r && typeof r == "object" && !Array.isArray(r);
}
function ot(r, o) {
  if (o == null) return o;
  switch (r) {
    case "boolean":
    case "checkbox":
      return typeof o == "boolean" ? o : o === "true" ? !0 : o === "false" ? !1 : o;
    case "number":
    case "integer": {
      if (typeof o == "number") return o;
      if (typeof o == "string" && o.trim() !== "") {
        const l = Number(o);
        if (!Number.isNaN(l)) return l;
      }
      return o;
    }
    case "object":
    case "array":
      if (typeof o == "string")
        try {
          const l = JSON.parse(o);
          if (l && typeof l == "object") return l;
        } catch {
        }
      return o;
    default:
      return o;
  }
}
function st(r, o) {
  if (!o) return r;
  const l = {};
  for (const [c, u] of Object.entries(r))
    l[c] = ot(o[c], u);
  return l;
}
function he(r, o, l) {
  if (o !== void 0 && !o) return null;
  const c = I(r) ? r : {}, u = [
    c,
    I(c.data) ? c.data : null,
    I(c.payload) ? c.payload : null,
    I(c.detail) ? c.detail : null
  ].filter(Boolean);
  for (const p of u) {
    if (p.event !== "component.meta.changed" && p.event !== "component.deleting" && p.event !== "component.deleted") continue;
    const C = String(p.component_id || ""), f = String(c.topic || p.topic || "");
    if (o === void 0) {
      if (!C && (!f.startsWith("component.") || f === "component.")) continue;
    } else if (C && C !== o || !C && f !== `component.${o}`) continue;
    const v = C || o || f.slice(10);
    return p.event !== "component.meta.changed" ? { event: p.event, component_id: v } : {
      event: "component.meta.changed",
      component_id: v,
      meta: st(I(p.meta) ? p.meta : {}, l),
      deleted: Array.isArray(p.deleted) ? p.deleted.map(String) : []
    };
  }
  return null;
}
function rt(r, o, l) {
  const c = he(r, o, l);
  return c?.event === "component.meta.changed" ? c : null;
}
function it(r, o) {
  const l = he(r, o);
  return l && l.event !== "component.meta.changed" ? l : null;
}
function at(r, o, l) {
  if (!r) return null;
  const c = fe(`component.${r}`, (u) => {
    const p = rt(u, r, l);
    p && o(p);
  });
  return typeof c == "function" ? c : null;
}
function de(r, o) {
  if (r && typeof r == "object") {
    const l = r, c = l.response?.data?.error;
    if (typeof c == "string") return c;
    if (c && typeof c == "object" && typeof c.message == "string")
      return c.message;
    if (typeof l.message == "string" && l.message) return l.message;
  }
  return o;
}
function lt(r, o, l) {
  let c = !0;
  async function u(f) {
    try {
      const { data: v } = await U.get(`/api/v1/components/${encodeURIComponent(o(f))}`);
      if (!v?.success) throw new Error(de(v, "Could not read deletion progress"));
      c && r.value.includes(f) && (f.deleting_at = v.deleting_at, f.deletion_job_id = v.deletion_job_id, f.deletion_job = v.deletion_job);
    } catch (v) {
      c && r.value.includes(f) && He.handleError("other", { message: de(v, "Could not read deletion progress") });
    }
  }
  const p = Re(() => r.value, (f, v = []) => {
    for (const $ of v) f.some((S) => o(S) === o($));
    for (const $ of f) $.deleting_at && u($);
  }, { immediate: !0 }), C = fe("@message", (f) => {
    const v = it(f);
    if (!v) return;
    const $ = r.value.find((S) => o(S) === v.component_id);
    $ && (v.event === "component.deleted" ? r.value = r.value.filter((S) => o(S) !== v.component_id) : u($));
  });
  pe(() => {
    c = !1, p(), typeof C == "function" && C();
  });
}
function ct({ providers: r, connections: o, search: l, confirmId: c }) {
  const u = (n) => n.provider ?? "", p = (n) => n.title ?? n.name ?? n.oauth_provider ?? "Provider", C = (n) => n.icon || "tabler:plug", f = q(() => {
    const n = {};
    for (const a of r.value) {
      const y = u(a);
      y && (n[y] = a);
    }
    return n;
  });
  function v(n) {
    return n.icon || f.value[n.provider || ""]?.icon || "tabler:plug-connected";
  }
  function $(n) {
    return n.provider ? f.value[n.provider] : void 0;
  }
  function S(n) {
    return new Set((n.scopes_granted ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function T(n) {
    return new Set((n?.default_scopes ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function K(n) {
    return (n?.available_scopes ?? []).map((a) => a.scope).filter((a) => typeof a == "string" && a.length > 0);
  }
  function z(n) {
    const a = T(n);
    return K(n).some((y) => !a.has(y));
  }
  function E(n) {
    if (!n.oauth) return !1;
    const a = $(n);
    if (!z(a)) return !1;
    const y = S(n), M = T(a);
    if (y.size === 0 || M.size === 0) return !1;
    for (const Q of y)
      if (!M.has(Q)) return !1;
    return !0;
  }
  function A(n) {
    return Te(n.connection_state, n.expires_at);
  }
  function H(n) {
    const a = A(n);
    return a === "connected" && E(n) ? "warn" : Me[a];
  }
  function Z(n) {
    const a = A(n);
    return a === "connected" && E(n) ? "Limited access" : Pe[a];
  }
  function O(n) {
    const a = Number(n.expires_at || 0);
    if (!a) return "";
    const y = a - Math.floor(Date.now() / 1e3);
    return y <= 0 ? "token expired" : y < 3600 ? `expires in ${Math.max(1, Math.floor(y / 60))}m` : y < 86400 ? `expires in ${Math.floor(y / 3600)}h` : `expires in ${Math.floor(y / 86400)}d`;
  }
  function R(n) {
    const a = [];
    if (n.provider && a.push(n.provider), n.oauth) {
      E(n) && a.push("sign-in only");
      const y = O(n);
      y && a.push(y), Number(n.scope_count || 0) > 0 && a.push(`${n.scope_count} scope${n.scope_count === 1 ? "" : "s"}`);
    }
    return a.join(" · ");
  }
  function P(n) {
    if (c.value === n.component_id) return "Click the check again to remove this connection.";
    const a = A(n);
    return a === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : a === "needs_reauth" ? `Reauthorize this connection to restore access.${n.reauth_reason ? " " + n.reauth_reason : ""}` : a === "disabled" ? "This connection is disabled and will not be used." : E(n) ? "Reauthorize this connection to grant service scopes." : n.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function N(n) {
    const a = l.value.trim().toLowerCase();
    return !a || n.toLowerCase().includes(a);
  }
  const D = q(() => r.value.filter((n) => N(`${p(n)} ${n.description ?? ""} ${(n.classes ?? []).join(" ")}`))), W = q(() => o.value.filter((n) => N(`${n.name ?? ""} ${n.provider ?? ""}`)));
  return {
    providerKey: u,
    providerLabel: p,
    providerIcon: C,
    connIcon: v,
    providerForConnection: $,
    grantedScopeSet: S,
    defaultScopeSet: T,
    availableScopeValues: K,
    hasOptionalProviderScopes: z,
    hasSignInOnlyScopes: E,
    connectionState: A,
    statusClass: H,
    statusLabel: Z,
    expiryText: O,
    statusDetail: R,
    connectionDescription: P,
    filteredProviders: D,
    filteredConnections: W
  };
}
const dt = { class: "conn-page" }, ut = { class: "kx-head" }, pt = { class: "kx-head-icon" }, ft = { class: "kx-head-actions" }, vt = {
  class: "kx-search",
  role: "search"
}, ht = { class: "conn-body" }, mt = {
  key: 0,
  class: "conn-loading"
}, gt = {
  key: 1,
  class: "conn-empty au d1"
}, _t = { class: "lt-empty-hero is-danger" }, yt = { class: "e-sub" }, bt = {
  key: 0,
  class: "msg err au"
}, kt = {
  key: 1,
  class: "block au d1"
}, Ct = { class: "live-grid" }, St = { class: "lc-top" }, xt = { class: "lc-ico" }, $t = { class: "lc-top-r" }, wt = ["title", "aria-label", "onClick", "disabled"], Et = ["title", "aria-label", "onClick", "disabled"], Nt = ["title", "aria-label", "onClick", "disabled"], Pt = { class: "lc-name" }, Mt = { class: "lc-desc" }, Tt = { class: "lc-primary" }, At = {
  key: 0,
  class: "lc-secondary"
}, Dt = {
  key: 0,
  class: "list-foot"
}, Lt = ["disabled"], jt = {
  key: 2,
  class: "conn-empty au d1"
}, Ot = { class: "lt-empty-hero is-success" }, Rt = {
  key: 3,
  class: "block au d2"
}, Bt = { class: "block-head" }, It = { class: "lt-section-header" }, Ut = { class: "setup-grid" }, Vt = ["data-provider-key", "onClick"], Kt = { class: "setup-ico" }, zt = { class: "setup-text" }, Ht = { class: "setup-name" }, Wt = { class: "setup-desc" }, Ft = {
  key: 4,
  class: "conn-empty au d1"
}, Gt = { class: "lt-empty-hero is-info" }, Jt = { class: "e-title" }, Yt = {
  key: 5,
  class: "conn-empty au d2"
}, qt = { class: "lt-empty-hero is-info" }, Zt = 100, Qt = /* @__PURE__ */ ue({
  __name: "connections",
  setup(r) {
    const o = k([]), l = k([]), c = k(!0), u = k(!1), p = k(""), C = k(""), f = k(""), v = k(""), $ = ct({ providers: l, connections: o, search: v, confirmId: f }), {
      providerKey: S,
      providerLabel: T,
      providerIcon: K,
      connIcon: z,
      statusClass: E,
      statusLabel: A,
      statusDetail: H,
      connectionDescription: Z,
      filteredProviders: O,
      filteredConnections: R
    } = $, P = k(0), N = k(!1), D = k(!1), W = k(void 0), n = k(void 0), a = k(!1), y = k(null), M = k(null);
    function Q(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(Zt),
        offset: String(s)
      }).toString()}`;
    }
    async function ie(s) {
      const { data: e } = await U.get(Q(s));
      return e ?? { connections: [], total_count: 0, has_more: !1 };
    }
    async function F() {
      c.value = !0, p.value = "", C.value = "";
      try {
        const [s, e, t] = await Promise.all([
          ie(0),
          U.get("/api/v1/oauth/providers/discover"),
          U.get("/api/v1/connections/providers/discover")
        ]);
        o.value = s.connections ?? [], P.value = Number(s.total_count ?? o.value.length), N.value = !!s.has_more, ee(), l.value = ge([
          ...e.data?.providers ?? [],
          ...t.data?.providers ?? []
        ]);
      } catch (s) {
        o.value.length ? p.value = J(s) : C.value = J(s), ee();
      } finally {
        c.value = !1;
      }
    }
    async function me() {
      if (!(u.value || !N.value)) {
        u.value = !0, p.value = "";
        try {
          const s = await ie(o.value.length), e = s.connections ?? [];
          o.value = [...o.value, ...e], P.value = Number(s.total_count ?? P.value), N.value = !!s.has_more, ee();
        } catch (s) {
          p.value = J(s);
        } finally {
          u.value = !1;
        }
      }
    }
    function ge(s) {
      const e = {};
      for (const t of s) {
        const h = S(t);
        h && (e[h] = e[h] ? { ...t, ...e[h] } : t);
      }
      return Object.values(e);
    }
    function _e(s) {
      return Array.isArray(s) ? s.filter((e) => typeof e == "string" && e.length > 0) : typeof s != "string" ? [] : s.split(/\s+/).filter(Boolean);
    }
    function ye(s, e, t = []) {
      const h = {};
      if (typeof e.title == "string" && (h.name = e.title), typeof e.provider == "string" && (h.provider = e.provider), typeof e.icon == "string" && (h.icon = e.icon), typeof e.connection_state == "string" && (h.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (h.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (h.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (h.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (h.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const B = _e(e.scopes_granted);
        h.scopes_granted = B, h.scope_count = B.length;
      }
      typeof e.oauth_connection == "boolean" && (h.oauth = e.oauth_connection);
      const j = { ...s, ...h };
      for (const B of t) {
        const Ee = B === "title" ? "name" : B;
        delete j[Ee];
      }
      return j;
    }
    const L = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set();
    let X = 0;
    function be(s, e) {
      o.value = o.value.map((t) => t.component_id === s ? ye(t, e.meta || {}, e.deleted || []) : t);
    }
    function ke() {
      X++, G.clear();
      for (const s of L.values()) s();
      L.clear();
    }
    function ee() {
      const s = new Set(o.value.map((t) => t.component_id).filter(Boolean));
      for (const [t, h] of L)
        s.has(t) || (h(), L.delete(t));
      const e = X;
      for (const t of s) {
        if (L.has(t) || G.has(t)) continue;
        G.add(t);
        const h = at(t, (j) => be(t, j), De);
        if (G.delete(t), !!h) {
          if (e !== X || !o.value.some((j) => j.component_id === t)) {
            h();
            continue;
          }
          L.set(t, h);
        }
      }
    }
    function te(s, e) {
      W.value = s, n.value = e, D.value = !0;
    }
    async function Ce(s) {
      y.value = s, a.value = !0, await Ve(), await xe();
    }
    function Se() {
      a.value = !1, y.value = null;
    }
    async function xe() {
      const s = y.value;
      if (!M.value || !s) return;
      if (M.value.innerHTML = "", !customElements.get("kickside-share"))
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
      })), e.style.display = "block", e.addEventListener("close", Se), M.value.appendChild(e);
    }
    function $e(s) {
      if (!s.provider) return;
      const e = l.value.find((t) => S(t) === s.provider);
      te(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function we() {
      D.value = !1, n.value = void 0, o.value = [], F();
    }
    async function ae(s) {
      if (f.value !== s.component_id) {
        f.value = s.component_id;
        return;
      }
      f.value = "", p.value = "";
      try {
        const { data: e } = await U.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        await F();
      } catch (e) {
        p.value = J(e);
      }
    }
    return Ae(F), pe(ke), lt(o, (s) => s.component_id), (s, e) => (m(), g("div", dt, [
      i("header", ut, [
        i("div", pt, [
          _(d(b), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[4] || (e[4] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "Connections"),
          i("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        i("div", ft, [
          i("label", vt, [
            _(d(b), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Be(i("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => v.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [Ie, v.value]
            ]),
            v.value ? (m(), g("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (t) => v.value = ""),
              "aria-label": "Clear search"
            }, [
              _(d(b), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : w("", !0)
          ]),
          _(d(re), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (t) => te())
          }, {
            icon: le(() => [
              _(d(b), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      i("div", ht, [
        c.value && !o.value.length ? (m(), g("div", mt, "Loading…")) : C.value ? (m(), g("section", gt, [
          i("div", _t, [
            _(d(b), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = i("div", { class: "e-title" }, "Couldn't load connections", -1)),
          i("div", yt, x(C.value), 1),
          _(d(re), {
            label: "Try again",
            class: "conn-retry",
            onClick: F
          }, {
            icon: le(() => [
              _(d(b), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (m(), g(V, { key: 2 }, [
          p.value ? (m(), g("div", bt, [
            _(d(b), { icon: "tabler:alert-circle" }),
            se(x(p.value), 1)
          ])) : w("", !0),
          d(R).length ? (m(), g("section", kt, [
            e[8] || (e[8] = i("div", { class: "block-head" }, [
              i("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            i("div", Ct, [
              (m(!0), g(V, null, ce(d(R), (t) => (m(), g("div", {
                key: t.component_id,
                class: Y(["live-card s-live", `state-${d(E)(t)}`])
              }, [
                _(nt, {
                  state: t,
                  onRetry: (h) => {
                    f.value = t.component_id, ae(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                i("div", St, [
                  i("div", xt, [
                    _(d(b), {
                      icon: d(z)(t),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  i("div", $t, [
                    i("button", {
                      class: "lc-add",
                      title: `Share ${t.name || t.provider}`,
                      "aria-label": `Share ${t.name || t.provider}`,
                      onClick: (h) => Ce(t),
                      disabled: !!t.deleting_at
                    }, [
                      _(d(b), { icon: "tabler:share" })
                    ], 8, wt),
                    i("button", {
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (h) => $e(t),
                      disabled: !!t.deleting_at
                    }, [
                      _(d(b), { icon: "tabler:refresh" })
                    ], 8, Et),
                    i("button", {
                      class: Y(["lc-add lc-danger", f.value === t.component_id && "armed"]),
                      title: f.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (h) => ae(t),
                      disabled: !!t.deleting_at
                    }, [
                      _(d(b), {
                        icon: f.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, Nt)
                  ])
                ]),
                i("div", Pt, x(t.name || t.provider || "Connection"), 1),
                i("div", Mt, x(d(Z)(t)), 1),
                i("div", {
                  class: Y(["lc-status", `state-${d(E)(t)}`])
                }, [
                  e[6] || (e[6] = i("span", { class: "dot" }, null, -1)),
                  i("span", Tt, x(d(A)(t)), 1),
                  d(H)(t) ? (m(), g("span", At, "· " + x(d(H)(t)), 1)) : w("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            P.value || N.value ? (m(), g("div", Dt, [
              i("span", null, x(o.value.length) + " of " + x(P.value || o.value.length) + " loaded", 1),
              N.value ? (m(), g("button", {
                key: 0,
                class: "ghost-action",
                disabled: u.value,
                onClick: me
              }, [
                _(d(b), {
                  icon: u.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: Y(u.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = se(" Load more ", -1))
              ], 8, Lt)) : w("", !0)
            ])) : w("", !0)
          ])) : !v.value && l.value.length ? (m(), g("section", jt, [
            i("div", Ot, [
              _(d(b), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = i("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = i("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : w("", !0),
          d(O).length ? (m(), g("section", Rt, [
            i("div", Bt, [
              i("h2", It, x(d(R).length ? "Add another" : "Available services"), 1)
            ]),
            i("div", Ut, [
              (m(!0), g(V, null, ce(d(O), (t) => (m(), g("button", {
                key: d(S)(t),
                "data-provider-key": d(S)(t),
                class: "setup-card",
                onClick: (h) => te(d(S)(t))
              }, [
                i("div", Kt, [
                  _(d(b), {
                    icon: d(K)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                i("div", zt, [
                  i("div", Ht, x(d(T)(t)), 1),
                  i("div", Wt, x(t.description || `Set up ${d(T)(t)}`), 1)
                ]),
                _(d(b), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, Vt))), 128))
            ])
          ])) : v.value ? (m(), g("section", Ft, [
            i("div", Gt, [
              _(d(b), { icon: "tabler:search-off" })
            ]),
            i("div", Jt, "No services match “" + x(v.value) + "”", 1)
          ])) : !l.value.length && !o.value.length ? (m(), g("section", Yt, [
            i("div", qt, [
              _(d(b), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = i("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = i("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : w("", !0)
        ], 64))
      ]),
      D.value ? (m(), Ue(ze, {
        key: 0,
        providers: l.value,
        provider: W.value,
        reauth: n.value,
        onClose: e[3] || (e[3] = (t) => D.value = !1),
        onConnected: we
      }, null, 8, ["providers", "provider", "reauth"])) : w("", !0),
      a.value ? (m(), g("div", {
        key: 1,
        ref_key: "shareHost",
        ref: M
      }, null, 512)) : w("", !0)
    ]));
  }
}), Xt = { props: { type: "object", properties: {} } }, en = {
  wippy: Xt
};
class tn extends Le {
  static get wippyConfig() {
    return {
      propsSchema: en.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: je
    };
  }
  static get vueConfig() {
    return { rootComponent: Qt, plugins: [Oe] };
  }
}
Fe(import.meta.url, tn);
//# sourceMappingURL=index.js.map

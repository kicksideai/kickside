import { P as we } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as de, computed as Z, openBlock as h, createElementBlock as b, withModifiers as ne, Fragment as q, createElementVNode as r, createTextVNode as oe, toDisplayString as M, createCommentVNode as P, createVNode as y, unref as a, watch as Ne, onBeforeUnmount as ue, ref as $, withDirectives as Ee, vModelText as Me, withCtx as le, renderList as ce, normalizeClass as J, createBlock as Pe, nextTick as Te } from "vue";
import se from "primevue/button";
import Le from "primevue/progressspinner";
import { on as fe, api as Y, loadByTagName as Oe } from "@wippy-fe/proxy";
import { Icon as x } from "@iconify/vue";
import { b as Re } from "./wc-runtime-KO3cNuNo.js";
import { C as Ae, b as De, r as Be, a as W, c as Ie } from "./status-DezpiH2d.js";
import { _ as Ve } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-nUuPbxHO.js";
const Ue = { key: 0 }, ze = /* @__PURE__ */ de({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(l) {
    const n = l, f = Z(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (p, u) => l.state.deleting_at ? (h(), b("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: u[1] || (u[1] = ne(() => {
      }, ["stop"])),
      onKeydown: u[2] || (u[2] = ne(() => {
      }, ["stop"]))
    }, [
      f.value ? (h(), b(q, { key: 0 }, [
        r("span", null, [
          u[3] || (u[3] = oe("Deletion failed", -1)),
          l.state.deletion_job?.last_error ? (h(), b("span", Ue, ": " + M(l.state.deletion_job.last_error), 1)) : P("", !0)
        ]),
        y(a(se), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: u[0] || (u[0] = ne((d) => p.$emit("retry"), ["stop"]))
        })
      ], 64)) : (h(), b(q, { key: 1 }, [
        y(a(Le), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        u[4] || (u[4] = r("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : P("", !0);
  }
});
function K(l) {
  return !!l && typeof l == "object" && !Array.isArray(l);
}
function He(l, n) {
  if (n == null) return n;
  switch (l) {
    case "boolean":
    case "checkbox":
      return typeof n == "boolean" ? n : n === "true" ? !0 : n === "false" ? !1 : n;
    case "number":
    case "integer": {
      if (typeof n == "number") return n;
      if (typeof n == "string" && n.trim() !== "") {
        const f = Number(n);
        if (!Number.isNaN(f)) return f;
      }
      return n;
    }
    case "object":
    case "array":
      if (typeof n == "string")
        try {
          const f = JSON.parse(n);
          if (f && typeof f == "object") return f;
        } catch {
        }
      return n;
    default:
      return n;
  }
}
function Ke(l, n) {
  if (!n) return l;
  const f = {};
  for (const [p, u] of Object.entries(l))
    f[p] = He(n[p], u);
  return f;
}
function pe(l, n, f) {
  if (n !== void 0 && !n) return null;
  const p = K(l) ? l : {}, u = [
    p,
    K(p.data) ? p.data : null,
    K(p.payload) ? p.payload : null,
    K(p.detail) ? p.detail : null
  ].filter(Boolean);
  for (const d of u) {
    if (d.event !== "component.meta.changed" && d.event !== "component.deleting" && d.event !== "component.deleted") continue;
    const w = String(d.component_id || ""), C = String(p.topic || d.topic || "");
    if (n === void 0) {
      if (!w && (!C.startsWith("component.") || C === "component.")) continue;
    } else if (w && w !== n || !w && C !== `component.${n}`) continue;
    const S = w || n || C.slice(10);
    return d.event === "component.deleting" && typeof d.deletion_job_id == "string" && d.deletion_job_id ? { event: d.event, component_id: S, deletion_job_id: d.deletion_job_id } : d.event !== "component.meta.changed" ? { event: d.event, component_id: S } : {
      event: "component.meta.changed",
      component_id: S,
      meta: Ke(K(d.meta) ? d.meta : {}, f),
      deleted: Array.isArray(d.deleted) ? d.deleted.map(String) : []
    };
  }
  return null;
}
function qe(l, n, f) {
  const p = pe(l, n, f);
  return p?.event === "component.meta.changed" ? p : null;
}
function Fe(l, n) {
  const f = pe(l, n);
  return f && f.event !== "component.meta.changed" ? f : null;
}
function Ge(l, n, f) {
  if (!l) return null;
  const p = fe(`component.${l}`, (u) => {
    const d = qe(u, l, f);
    d && n(d);
  });
  return typeof p == "function" ? p : null;
}
function Je(l, n, f, p) {
  const u = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Map();
  function w(N, _) {
    const m = l.value.find((T) => n(T) === N), c = d.get(N), g = _?.job_id || c?.state.deletion_job_id || m?.deletion_job_id, E = c ? c.state.deletion_job_id : m?.deleting_at ? m.deletion_job_id : void 0;
    if ((c || m?.deleting_at) && g === E || g && c?.superseded.has(g)) return;
    const j = {
      deleting_at: c?.state.deleting_at || m?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: g
    }, O = new Set(c?.superseded);
    for (const T of [c?.state.deletion_job_id, m?.deletion_job_id])
      T && T !== g && O.add(T);
    d.set(N, { state: j, superseded: O }), m && (Object.assign(m, j), m.deletion_job = void 0);
  }
  const C = Ne(() => l.value, (N, _ = []) => {
    const m = N.filter((c) => !u.has(n(c)));
    for (const c of _)
      u.has(n(c)) || m.some((g) => n(g) === n(c)) || c.deleting_at && p?.(n(c));
    if (m.length !== N.length) {
      l.value = m;
      return;
    }
    for (const c of N) {
      c.deleting_at && c.deletion_job === void 0 && !_.includes(c) && (c.deletion_job = null);
      const g = d.get(n(c));
      if (g) {
        const j = c.deletion_job_id;
        c.deleting_at && j && j !== g.state.deletion_job_id && !g.superseded.has(j) && (g.state.deletion_job_id && g.superseded.add(g.state.deletion_job_id), g.state.deletion_job_id = j), j !== g.state.deletion_job_id && (c.deletion_job = void 0), Object.assign(c, g.state);
      }
      const E = _.find((j) => n(j) === n(c));
      c.deletion_job === void 0 && E?.deletion_job_id === c.deletion_job_id && (c.deletion_job = E?.deletion_job);
    }
  }, { immediate: !0 }), S = fe("@message", (N) => {
    const _ = Fe(N);
    if (!_) return;
    const m = l.value.find((c) => n(c) === _.component_id);
    _.event === "component.deleted" ? (m && !u.has(_.component_id) && p?.(_.component_id), u.add(_.component_id), d.delete(_.component_id), l.value = l.value.filter((c) => n(c) !== _.component_id)) : m && w(_.component_id, { job_id: _.deletion_job_id });
  });
  return ue(() => {
    C(), typeof S == "function" && S();
  }), { acceptDeletion: w };
}
function Ye() {
  let l = 0;
  return () => {
    const n = ++l;
    return () => n === l;
  };
}
function We({ providers: l, connections: n, search: f, confirmId: p }) {
  const u = (o) => o.provider ?? "", d = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", w = (o) => o.icon || "tabler:plug", C = Z(() => {
    const o = {};
    for (const i of l.value) {
      const k = u(i);
      k && (o[k] = i);
    }
    return o;
  });
  function S(o) {
    return o.icon || C.value[o.provider || ""]?.icon || "tabler:plug-connected";
  }
  function N(o) {
    return o.provider ? C.value[o.provider] : void 0;
  }
  function _(o) {
    return new Set((o.scopes_granted ?? []).filter((i) => typeof i == "string" && i.length > 0));
  }
  function m(o) {
    return new Set((o?.default_scopes ?? []).filter((i) => typeof i == "string" && i.length > 0));
  }
  function c(o) {
    return (o?.available_scopes ?? []).map((i) => i.scope).filter((i) => typeof i == "string" && i.length > 0);
  }
  function g(o) {
    const i = m(o);
    return c(o).some((k) => !i.has(k));
  }
  function E(o) {
    if (!o.oauth) return !1;
    const i = N(o);
    if (!g(i)) return !1;
    const k = _(o), A = m(i);
    if (k.size === 0 || A.size === 0) return !1;
    for (const Q of k)
      if (!A.has(Q)) return !1;
    return !0;
  }
  function j(o) {
    return Be(o.connection_state, o.expires_at);
  }
  function O(o) {
    const i = j(o);
    return i === "connected" && E(o) ? "warn" : De[i];
  }
  function T(o) {
    const i = j(o);
    return i === "connected" && E(o) ? "Limited access" : Ae[i];
  }
  function V(o) {
    const i = Number(o.expires_at || 0);
    if (!i) return "";
    const k = i - Math.floor(Date.now() / 1e3);
    return k <= 0 ? "token expired" : k < 3600 ? `expires in ${Math.max(1, Math.floor(k / 60))}m` : k < 86400 ? `expires in ${Math.floor(k / 3600)}h` : `expires in ${Math.floor(k / 86400)}d`;
  }
  function U(o) {
    const i = [];
    if (o.provider && i.push(o.provider), o.oauth) {
      E(o) && i.push("sign-in only");
      const k = V(o);
      k && i.push(k), Number(o.scope_count || 0) > 0 && i.push(`${o.scope_count} scope${o.scope_count === 1 ? "" : "s"}`);
    }
    return i.join(" · ");
  }
  function R(o) {
    if (p.value === o.component_id) return "Click the check again to remove this connection.";
    const i = j(o);
    return i === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : i === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : i === "disabled" ? "This connection is disabled and will not be used." : E(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function L(o) {
    const i = f.value.trim().toLowerCase();
    return !i || o.toLowerCase().includes(i);
  }
  const D = Z(() => l.value.filter((o) => L(`${d(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), F = Z(() => n.value.filter((o) => L(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: u,
    providerLabel: d,
    providerIcon: w,
    connIcon: S,
    providerForConnection: N,
    grantedScopeSet: _,
    defaultScopeSet: m,
    availableScopeValues: c,
    hasOptionalProviderScopes: g,
    hasSignInOnlyScopes: E,
    connectionState: j,
    statusClass: O,
    statusLabel: T,
    expiryText: V,
    statusDetail: U,
    connectionDescription: R,
    filteredProviders: D,
    filteredConnections: F
  };
}
const Ze = { class: "conn-page" }, Qe = { class: "kx-head" }, Xe = { class: "kx-head-icon" }, et = { class: "kx-head-actions" }, tt = {
  class: "kx-search",
  role: "search"
}, nt = { class: "conn-body" }, ot = {
  key: 0,
  class: "conn-loading"
}, st = {
  key: 1,
  class: "conn-empty au d1"
}, it = { class: "lt-empty-hero is-danger" }, rt = { class: "e-sub" }, at = {
  key: 0,
  class: "msg err au"
}, lt = {
  key: 1,
  class: "block au d1"
}, ct = { class: "live-grid" }, dt = { class: "lc-top" }, ut = { class: "lc-ico" }, ft = { class: "lc-top-r" }, pt = ["title", "aria-label", "onClick", "disabled"], vt = ["title", "aria-label", "onClick", "disabled"], _t = ["title", "aria-label", "onClick", "disabled"], ht = { class: "lc-name" }, mt = { class: "lc-desc" }, bt = { class: "lc-primary" }, gt = {
  key: 0,
  class: "lc-secondary"
}, yt = {
  key: 0,
  class: "list-foot"
}, kt = ["disabled"], Ct = {
  key: 2,
  class: "conn-empty au d1"
}, St = { class: "lt-empty-hero is-success" }, jt = {
  key: 3,
  class: "block au d2"
}, xt = { class: "block-head" }, $t = { class: "lt-section-header" }, wt = { class: "setup-grid" }, Nt = ["data-provider-key", "onClick"], Et = { class: "setup-ico" }, Mt = { class: "setup-text" }, Pt = { class: "setup-name" }, Tt = { class: "setup-desc" }, Lt = {
  key: 4,
  class: "conn-empty au d1"
}, Ot = { class: "lt-empty-hero is-info" }, Rt = { class: "e-title" }, At = {
  key: 5,
  class: "conn-empty au d2"
}, Dt = { class: "lt-empty-hero is-info" }, Bt = 100, It = /* @__PURE__ */ de({
  __name: "connections",
  setup(l) {
    const n = $([]), f = $([]), p = $(!0), u = $(!1), d = $(""), w = $(""), C = $(""), S = $(""), N = We({ providers: f, connections: n, search: S, confirmId: C }), {
      providerKey: _,
      providerLabel: m,
      providerIcon: c,
      connIcon: g,
      statusClass: E,
      statusLabel: j,
      statusDetail: O,
      connectionDescription: T,
      filteredProviders: V,
      filteredConnections: U
    } = N, R = $(0), L = $(!1), D = $(!1), F = $(void 0), o = $(void 0), i = $(!1), k = $(null), A = $(null);
    function Q(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(Bt),
        offset: String(s)
      }).toString()}`;
    }
    async function ie(s) {
      const { data: e } = await Y.get(Q(s));
      if (!e?.success) throw Object.assign(new Error("Could not load connections."), { response: { data: e } });
      return e;
    }
    const re = Ye();
    async function z() {
      const s = re();
      p.value = !0, u.value = !1, d.value = "", w.value = "";
      try {
        const [e, t, v] = await Promise.all([
          ie(0),
          Y.get("/api/v1/oauth/providers/discover"),
          Y.get("/api/v1/connections/providers/discover")
        ]);
        if (!s()) return;
        n.value = e.connections ?? [], R.value = Number(e.total_count ?? n.value.length), L.value = !!e.has_more, ee(), f.value = _e([
          ...t.data?.providers ?? [],
          ...v.data?.providers ?? []
        ]);
      } catch (e) {
        if (!s()) return;
        n.value.length ? d.value = W(e) : w.value = W(e), ee();
      } finally {
        s() && (p.value = !1);
      }
    }
    async function ve() {
      if (p.value || u.value || !L.value) return;
      const s = re();
      u.value = !0, d.value = "";
      try {
        const e = await ie(n.value.length);
        if (!s()) return;
        const t = e.connections ?? [];
        n.value = [...n.value, ...t], R.value = Number(e.total_count ?? R.value), L.value = !!e.has_more, ee();
      } catch (e) {
        s() && (d.value = W(e));
      } finally {
        s() && (u.value = !1);
      }
    }
    function _e(s) {
      const e = {};
      for (const t of s) {
        const v = _(t);
        v && (e[v] = e[v] ? { ...t, ...e[v] } : t);
      }
      return Object.values(e);
    }
    function he(s) {
      return Array.isArray(s) ? s.filter((e) => typeof e == "string" && e.length > 0) : typeof s != "string" ? [] : s.split(/\s+/).filter(Boolean);
    }
    function me(s, e, t = []) {
      const v = {};
      if (typeof e.title == "string" && (v.name = e.title), typeof e.provider == "string" && (v.provider = e.provider), typeof e.icon == "string" && (v.icon = e.icon), typeof e.connection_state == "string" && (v.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (v.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (v.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (v.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (v.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const H = he(e.scopes_granted);
        v.scopes_granted = H, v.scope_count = H.length;
      }
      typeof e.oauth_connection == "boolean" && (v.oauth = e.oauth_connection);
      const I = { ...s, ...v };
      for (const H of t) {
        const $e = H === "title" ? "name" : H;
        delete I[$e];
      }
      return I;
    }
    const B = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set();
    let X = 0;
    function be(s, e) {
      n.value = n.value.map((t) => t.component_id === s ? me(t, e.meta || {}, e.deleted || []) : t);
    }
    function ge() {
      X++, G.clear();
      for (const s of B.values()) s();
      B.clear();
    }
    function ee() {
      const s = new Set(n.value.map((t) => t.component_id).filter(Boolean));
      for (const [t, v] of B)
        s.has(t) || (v(), B.delete(t));
      const e = X;
      for (const t of s) {
        if (B.has(t) || G.has(t)) continue;
        G.add(t);
        const v = Ge(t, (I) => be(t, I), Ie);
        if (G.delete(t), !!v) {
          if (e !== X || !n.value.some((I) => I.component_id === t)) {
            v();
            continue;
          }
          B.set(t, v);
        }
      }
    }
    function te(s, e) {
      F.value = s, o.value = e, D.value = !0;
    }
    async function ye(s) {
      k.value = s, i.value = !0, await Te(), await Ce();
    }
    function ke() {
      i.value = !1, k.value = null;
    }
    async function Ce() {
      const s = k.value;
      if (!A.value || !s) return;
      if (A.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Oe("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const e = document.createElement("kickside-share");
      e.setAttribute("config", JSON.stringify({
        resource_id: s.component_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(s.component_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(s.component_id)}`,
        title: s.name || s.provider || "Connection"
      })), e.style.display = "block", e.addEventListener("close", ke), A.value.appendChild(e);
    }
    function Se(s) {
      if (!s.provider) return;
      const e = f.value.find((t) => _(t) === s.provider);
      te(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function je() {
      D.value = !1, o.value = void 0, n.value = [], z();
    }
    async function ae(s) {
      if (C.value !== s.component_id) {
        C.value = s.component_id;
        return;
      }
      C.value = "", d.value = "";
      try {
        const { data: e } = await Y.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        xe(s.component_id, e), await z();
      } catch (e) {
        d.value = W(e);
      }
    }
    Re(z), ue(ge);
    const { acceptDeletion: xe } = Je(n, (s) => s.component_id, void 0, z);
    return (s, e) => (h(), b("div", Ze, [
      r("header", Qe, [
        r("div", Xe, [
          y(a(x), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[4] || (e[4] = r("div", { class: "kx-head-text" }, [
          r("h1", { class: "kx-title" }, "Connections"),
          r("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        r("div", et, [
          r("label", tt, [
            y(a(x), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Ee(r("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => S.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [Me, S.value]
            ]),
            S.value ? (h(), b("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (t) => S.value = ""),
              "aria-label": "Clear search"
            }, [
              y(a(x), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : P("", !0)
          ]),
          y(a(se), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (t) => te())
          }, {
            icon: le(() => [
              y(a(x), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      r("div", nt, [
        p.value && !n.value.length ? (h(), b("div", ot, "Loading…")) : w.value ? (h(), b("section", st, [
          r("div", it, [
            y(a(x), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = r("div", { class: "e-title" }, "Couldn't load connections", -1)),
          r("div", rt, M(w.value), 1),
          y(a(se), {
            label: "Try again",
            class: "conn-retry",
            onClick: z
          }, {
            icon: le(() => [
              y(a(x), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (h(), b(q, { key: 2 }, [
          d.value ? (h(), b("div", at, [
            y(a(x), { icon: "tabler:alert-circle" }),
            oe(M(d.value), 1)
          ])) : P("", !0),
          a(U).length ? (h(), b("section", lt, [
            e[8] || (e[8] = r("div", { class: "block-head" }, [
              r("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            r("div", ct, [
              (h(!0), b(q, null, ce(a(U), (t) => (h(), b("div", {
                key: t.component_id,
                class: J(["live-card s-live", `state-${a(E)(t)}`])
              }, [
                y(ze, {
                  state: t,
                  onRetry: (v) => {
                    C.value = t.component_id, ae(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                r("div", dt, [
                  r("div", ut, [
                    y(a(x), {
                      icon: a(g)(t),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  r("div", ft, [
                    r("button", {
                      class: "lc-add",
                      title: `Share ${t.name || t.provider}`,
                      "aria-label": `Share ${t.name || t.provider}`,
                      onClick: (v) => ye(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(a(x), { icon: "tabler:share" })
                    ], 8, pt),
                    r("button", {
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (v) => Se(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(a(x), { icon: "tabler:refresh" })
                    ], 8, vt),
                    r("button", {
                      class: J(["lc-add lc-danger", C.value === t.component_id && "armed"]),
                      title: C.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (v) => ae(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(a(x), {
                        icon: C.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, _t)
                  ])
                ]),
                r("div", ht, M(t.name || t.provider || "Connection"), 1),
                r("div", mt, M(a(T)(t)), 1),
                r("div", {
                  class: J(["lc-status", `state-${a(E)(t)}`])
                }, [
                  e[6] || (e[6] = r("span", { class: "dot" }, null, -1)),
                  r("span", bt, M(a(j)(t)), 1),
                  a(O)(t) ? (h(), b("span", gt, "· " + M(a(O)(t)), 1)) : P("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            R.value || L.value ? (h(), b("div", yt, [
              r("span", null, M(n.value.length) + " of " + M(R.value || n.value.length) + " loaded", 1),
              L.value ? (h(), b("button", {
                key: 0,
                class: "ghost-action",
                disabled: p.value || u.value,
                onClick: ve
              }, [
                y(a(x), {
                  icon: u.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: J(u.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = oe(" Load more ", -1))
              ], 8, kt)) : P("", !0)
            ])) : P("", !0)
          ])) : !S.value && f.value.length ? (h(), b("section", Ct, [
            r("div", St, [
              y(a(x), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = r("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = r("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : P("", !0),
          a(V).length ? (h(), b("section", jt, [
            r("div", xt, [
              r("h2", $t, M(a(U).length ? "Add another" : "Available services"), 1)
            ]),
            r("div", wt, [
              (h(!0), b(q, null, ce(a(V), (t) => (h(), b("button", {
                key: a(_)(t),
                "data-provider-key": a(_)(t),
                class: "setup-card",
                onClick: (v) => te(a(_)(t))
              }, [
                r("div", Et, [
                  y(a(x), {
                    icon: a(c)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                r("div", Mt, [
                  r("div", Pt, M(a(m)(t)), 1),
                  r("div", Tt, M(t.description || `Set up ${a(m)(t)}`), 1)
                ]),
                y(a(x), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, Nt))), 128))
            ])
          ])) : S.value ? (h(), b("section", Lt, [
            r("div", Ot, [
              y(a(x), { icon: "tabler:search-off" })
            ]),
            r("div", Rt, "No services match “" + M(S.value) + "”", 1)
          ])) : !f.value.length && !n.value.length ? (h(), b("section", At, [
            r("div", Dt, [
              y(a(x), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = r("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = r("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : P("", !0)
        ], 64))
      ]),
      D.value ? (h(), Pe(Ve, {
        key: 0,
        providers: f.value,
        provider: F.value,
        reauth: o.value,
        onClose: e[3] || (e[3] = (t) => D.value = !1),
        onConnected: je
      }, null, 8, ["providers", "provider", "reauth"])) : P("", !0),
      i.value ? (h(), b("div", {
        key: 1,
        ref_key: "shareHost",
        ref: A
      }, null, 512)) : P("", !0)
    ]));
  }
}), Yt = {
  rootComponent: It,
  plugins: [we]
};
export {
  Yt as mountConfig
};
//# sourceMappingURL=lazy-mount-ketwsm4K.js.map

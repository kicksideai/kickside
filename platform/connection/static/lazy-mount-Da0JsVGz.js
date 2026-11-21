import { B as Oe, s as Te, b as Le, P as De } from "./wc-runtime-P07ojyjC.js";
import { openBlock as _, createElementBlock as g, mergeProps as ae, createElementVNode as r, defineComponent as ue, computed as Y, withModifiers as ne, Fragment as H, createTextVNode as J, toDisplayString as P, createCommentVNode as M, createVNode as C, unref as d, watch as Ue, onBeforeUnmount as pe, ref as j, onMounted as Ve, createBlock as ce, withCtx as oe, renderList as de, withDirectives as G, vModelRadio as le, withKeys as Be, vModelText as _e, normalizeClass as te, nextTick as Ie } from "vue";
import { s as Z, a as Ke, _ as ze } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-BXVITpDv.js";
import { on as me, api as K, loadByTagName as He } from "@wippy-fe/proxy";
import { Icon as A } from "@iconify/vue";
import { a as z, C as Je, b as We, r as qe, c as Fe } from "./status-CouLSXM_.js";
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
`, Ye = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Ze = Oe.extend({
  name: "progressspinner",
  style: Ge,
  classes: Ye
}), Qe = {
  name: "BaseProgressSpinner",
  extends: Te,
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
}, ge = {
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
function et(a, n, h, v, f, u) {
  return _(), g("div", ae({
    class: a.cx("root"),
    role: "progressbar"
  }, a.ptmi("root")), [(_(), g("svg", ae({
    class: a.cx("spin"),
    viewBox: "25 25 50 50",
    style: u.svgStyle
  }, a.ptm("spin")), [r("circle", ae({
    class: a.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: a.fill,
    "stroke-width": a.strokeWidth,
    strokeMiterlimit: "10"
  }, a.ptm("circle")), null, 16, Xe)], 16))], 16);
}
ge.render = et;
const tt = { key: 0 }, nt = /* @__PURE__ */ ue({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(a) {
    const n = a, h = Y(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (v, f) => a.state.deleting_at ? (_(), g("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: f[1] || (f[1] = ne(() => {
      }, ["stop"])),
      onKeydown: f[2] || (f[2] = ne(() => {
      }, ["stop"]))
    }, [
      h.value ? (_(), g(H, { key: 0 }, [
        r("span", null, [
          f[3] || (f[3] = J("Deletion failed", -1)),
          a.state.deletion_job?.last_error ? (_(), g("span", tt, ": " + P(a.state.deletion_job.last_error), 1)) : M("", !0)
        ]),
        C(d(Z), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: f[0] || (f[0] = ne((u) => v.$emit("retry"), ["stop"]))
        })
      ], 64)) : (_(), g(H, { key: 1 }, [
        C(d(ge), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        f[4] || (f[4] = r("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : M("", !0);
  }
});
function F(a) {
  return !!a && typeof a == "object" && !Array.isArray(a);
}
function ot(a, n) {
  if (n == null) return n;
  switch (a) {
    case "boolean":
    case "checkbox":
      return typeof n == "boolean" ? n : n === "true" ? !0 : n === "false" ? !1 : n;
    case "number":
    case "integer": {
      if (typeof n == "number") return n;
      if (typeof n == "string" && n.trim() !== "") {
        const h = Number(n);
        if (!Number.isNaN(h)) return h;
      }
      return n;
    }
    case "object":
    case "array":
      if (typeof n == "string")
        try {
          const h = JSON.parse(n);
          if (h && typeof h == "object") return h;
        } catch {
        }
      return n;
    default:
      return n;
  }
}
function st(a, n) {
  if (!n) return a;
  const h = {};
  for (const [v, f] of Object.entries(a))
    h[v] = ot(n[v], f);
  return h;
}
function be(a, n, h) {
  if (n !== void 0 && !n) return null;
  const v = F(a) ? a : {}, f = [
    v,
    F(v.data) ? v.data : null,
    F(v.payload) ? v.payload : null,
    F(v.detail) ? v.detail : null
  ].filter(Boolean);
  for (const u of f) {
    if (u.event !== "component.meta.changed" && u.event !== "component.deleting" && u.event !== "component.deleted") continue;
    const E = String(u.component_id || ""), k = String(v.topic || u.topic || "");
    if (n === void 0) {
      if (!E && (!k.startsWith("component.") || k === "component.")) continue;
    } else if (E && E !== n || !E && k !== `component.${n}`) continue;
    const x = E || n || k.slice(10);
    return u.event === "component.deleting" && typeof u.deletion_job_id == "string" && u.deletion_job_id ? { event: u.event, component_id: x, deletion_job_id: u.deletion_job_id } : u.event !== "component.meta.changed" ? { event: u.event, component_id: x } : {
      event: "component.meta.changed",
      component_id: x,
      meta: st(F(u.meta) ? u.meta : {}, h),
      deleted: Array.isArray(u.deleted) ? u.deleted.map(String) : []
    };
  }
  return null;
}
function rt(a, n, h) {
  const v = be(a, n, h);
  return v?.event === "component.meta.changed" ? v : null;
}
function it(a, n) {
  const h = be(a, n);
  return h && h.event !== "component.meta.changed" ? h : null;
}
function at(a, n, h) {
  if (!a) return null;
  const v = me(`component.${a}`, (f) => {
    const u = rt(f, a, h);
    u && n(u);
  });
  return typeof v == "function" ? v : null;
}
function lt(a, n, h, v) {
  const f = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
  function E($, S) {
    const y = a.value.find((N) => n(N) === $), p = u.get($), m = S?.job_id || p?.state.deletion_job_id || y?.deletion_job_id, l = p ? p.state.deletion_job_id : y?.deleting_at ? y.deletion_job_id : void 0;
    if ((p || y?.deleting_at) && m === l || m && p?.superseded.has(m)) return;
    const i = {
      deleting_at: p?.state.deleting_at || y?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: m
    }, R = new Set(p?.superseded);
    for (const N of [p?.state.deletion_job_id, y?.deletion_job_id])
      N && N !== m && R.add(N);
    u.set($, { state: i, superseded: R }), y && (Object.assign(y, i), y.deletion_job = void 0);
  }
  const k = Ue(() => a.value, ($, S = []) => {
    const y = $.filter((p) => !f.has(n(p)));
    for (const p of S)
      f.has(n(p)) || y.some((m) => n(m) === n(p)) || p.deleting_at && v?.(n(p));
    if (y.length !== $.length) {
      a.value = y;
      return;
    }
    for (const p of $) {
      p.deleting_at && p.deletion_job === void 0 && !S.includes(p) && (p.deletion_job = null);
      const m = u.get(n(p));
      if (m) {
        const i = p.deletion_job_id;
        p.deleting_at && i && i !== m.state.deletion_job_id && !m.superseded.has(i) && (m.state.deletion_job_id && m.superseded.add(m.state.deletion_job_id), m.state.deletion_job_id = i), i !== m.state.deletion_job_id && (p.deletion_job = void 0), Object.assign(p, m.state);
      }
      const l = S.find((i) => n(i) === n(p));
      p.deletion_job === void 0 && l?.deletion_job_id === p.deletion_job_id && (p.deletion_job = l?.deletion_job);
    }
  }, { immediate: !0 }), x = me("@message", ($) => {
    const S = it($);
    if (!S) return;
    const y = a.value.find((p) => n(p) === S.component_id);
    S.event === "component.deleted" ? (y && !f.has(S.component_id) && v?.(S.component_id), f.add(S.component_id), u.delete(S.component_id), a.value = a.value.filter((p) => n(p) !== S.component_id)) : y && E(S.component_id, { job_id: S.deletion_job_id });
  });
  return pe(() => {
    k(), typeof x == "function" && x();
  }), { acceptDeletion: E };
}
const ct = { class: "credential-editor" }, dt = {
  key: 0,
  role: "status"
}, ut = {
  key: 1,
  role: "alert"
}, pt = { key: 2 }, ft = ["disabled"], vt = { class: "kx-field-lbl" }, ht = { class: "credential-editor-actions" }, _t = ["onUpdate:modelValue", "name"], mt = ["onUpdate:modelValue", "name"], gt = ["onUpdate:modelValue", "name"], bt = ["onUpdate:modelValue", "aria-label", "onKeydown"], yt = /* @__PURE__ */ ue({
  __name: "SecretsEditor",
  props: {
    connection: {}
  },
  emits: ["close", "saved"],
  setup(a, { emit: n }) {
    const h = a, v = n, f = j([]), u = j(0), E = j(!0), k = j(!1), x = j(""), $ = Y(() => f.value.some((m) => m.mode !== "keep"));
    function S(m, l) {
      let i = m;
      for (const R of l) {
        if (!i || typeof i != "object" || Array.isArray(i)) throw new Error("Credential presence is unavailable");
        i = i[R];
      }
      if (!i || typeof i != "object" || Array.isArray(i) || typeof i.set != "boolean") throw new Error("Credential presence is unavailable");
      return i.set;
    }
    function y() {
      for (const m of f.value) m.value = "";
    }
    pe(y), Ve(async () => {
      try {
        const l = (await K.get(`/api/v1/connections/${encodeURIComponent(h.connection.component_id)}`)).data;
        if (!l.success || !Number.isInteger(l.context_revision) || !Array.isArray(l.secret_fields)) throw new Error("Credential presence is unavailable");
        f.value = l.secret_fields.map((i) => {
          if (!i || i.type !== "string" || !Array.isArray(i.path) || !i.path.length || i.path.some((R) => typeof R != "string" || !R)) throw new Error("Credential presence is unavailable");
          return { path: i.path, set: S(l.secrets, i.path), mode: "keep", value: "" };
        }), u.value = l.context_revision;
      } catch (m) {
        x.value = z(m);
      } finally {
        E.value = !1;
      }
    });
    async function p() {
      if (k.value || !$.value) return;
      if (x.value = "", f.value.some((l) => l.mode === "replace" && !l.value)) {
        x.value = "Enter a replacement or choose Clear.";
        return;
      }
      const m = f.value.filter((l) => l.mode !== "keep").map((l) => l.mode === "clear" ? { path: l.path, clear: !0 } : { path: l.path, value: l.value });
      k.value = !0;
      try {
        const { data: l } = await K.put(`/api/v1/connections/${encodeURIComponent(h.connection.component_id)}`, {
          secrets: m,
          expected_revision: u.value
        });
        if (!l?.success) throw new Error("Credential update failed");
        y(), v("saved"), v("close");
      } catch (l) {
        x.value = z(l);
      } finally {
        k.value = !1;
      }
    }
    return (m, l) => (_(), ce(d(Ke), {
      visible: !0,
      modal: "",
      "append-to": "self",
      draggable: !1,
      class: "kx-modal",
      header: `${a.connection.name || "Connection"} credentials`,
      pt: { header: { class: "kx-modal-head" }, content: { class: "kx-dialog-content" }, footer: { class: "kx-modal-foot" } },
      "onUpdate:visible": l[1] || (l[1] = (i) => v("close"))
    }, {
      footer: oe(() => [
        C(d(Z), {
          label: "Cancel",
          severity: "secondary",
          disabled: k.value,
          onClick: l[0] || (l[0] = (i) => v("close"))
        }, null, 8, ["disabled"]),
        C(d(Z), {
          "data-action": "save-secrets",
          label: k.value ? "Saving…" : "Save credentials",
          disabled: E.value || k.value || !$.value,
          onClick: p
        }, null, 8, ["label", "disabled"])
      ]),
      default: oe(() => [
        r("div", ct, [
          E.value ? (_(), g("p", dt, "Loading credential status…")) : M("", !0),
          x.value ? (_(), g("p", ut, P(x.value), 1)) : M("", !0),
          !E.value && !x.value && !f.value.length ? (_(), g("p", pt, "This connection has no declared credentials.")) : M("", !0),
          (_(!0), g(H, null, de(f.value, (i, R) => (_(), g("fieldset", {
            key: JSON.stringify(i.path),
            class: "kx-field",
            disabled: k.value
          }, [
            r("legend", vt, P(i.path.join(".")) + " — " + P(i.set ? "Set" : "Not set"), 1),
            r("div", ht, [
              r("label", null, [
                G(r("input", {
                  "onUpdate:modelValue": (N) => i.mode = N,
                  type: "radio",
                  name: `secret-${R}`,
                  value: "keep"
                }, null, 8, _t), [
                  [le, i.mode]
                ]),
                l[2] || (l[2] = J(" Keep", -1))
              ]),
              r("label", null, [
                G(r("input", {
                  "onUpdate:modelValue": (N) => i.mode = N,
                  type: "radio",
                  name: `secret-${R}`,
                  value: "replace"
                }, null, 8, mt), [
                  [le, i.mode]
                ]),
                l[3] || (l[3] = J(" Replace", -1))
              ]),
              r("label", null, [
                G(r("input", {
                  "onUpdate:modelValue": (N) => i.mode = N,
                  type: "radio",
                  name: `secret-${R}`,
                  value: "clear"
                }, null, 8, gt), [
                  [le, i.mode]
                ]),
                l[4] || (l[4] = J(" Clear", -1))
              ])
            ]),
            i.mode === "replace" ? G((_(), g("input", {
              key: 0,
              "onUpdate:modelValue": (N) => i.value = N,
              type: "password",
              autocomplete: "new-password",
              class: "kx-input",
              "aria-label": `Replace ${i.path.join(".")}`,
              onKeydown: Be(ne(p, ["prevent"]), ["enter"])
            }, null, 40, bt)), [
              [_e, i.value]
            ]) : M("", !0)
          ], 8, ft))), 128))
        ])
      ]),
      _: 1
    }, 8, ["header"]));
  }
});
function kt() {
  let a = 0;
  return () => {
    const n = ++a;
    return () => n === a;
  };
}
function Ct({ providers: a, connections: n, search: h, confirmId: v }) {
  const f = (o) => o.provider ?? "", u = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", E = (o) => o.icon || "tabler:plug", k = Y(() => {
    const o = {};
    for (const c of a.value) {
      const w = f(c);
      w && (o[w] = c);
    }
    return o;
  });
  function x(o) {
    return o.icon || k.value[o.provider || ""]?.icon || "tabler:plug-connected";
  }
  function $(o) {
    return o.provider ? k.value[o.provider] : void 0;
  }
  function S(o) {
    return new Set((o.scopes_granted ?? []).filter((c) => typeof c == "string" && c.length > 0));
  }
  function y(o) {
    return new Set((o?.default_scopes ?? []).filter((c) => typeof c == "string" && c.length > 0));
  }
  function p(o) {
    return (o?.available_scopes ?? []).map((c) => c.scope).filter((c) => typeof c == "string" && c.length > 0);
  }
  function m(o) {
    const c = y(o);
    return p(o).some((w) => !c.has(w));
  }
  function l(o) {
    if (!o.oauth) return !1;
    const c = $(o);
    if (!m(c)) return !1;
    const w = S(o), D = y(c);
    if (w.size === 0 || D.size === 0) return !1;
    for (const U of w)
      if (!D.has(U)) return !1;
    return !0;
  }
  function i(o) {
    return qe(o.connection_state, o.expires_at);
  }
  function R(o) {
    const c = i(o);
    return c === "connected" && l(o) ? "warn" : We[c];
  }
  function N(o) {
    const c = i(o);
    return c === "connected" && l(o) ? "Limited access" : Je[c];
  }
  function Q(o) {
    const c = Number(o.expires_at || 0);
    if (!c) return "";
    const w = c - Math.floor(Date.now() / 1e3);
    return w <= 0 ? "token expired" : w < 3600 ? `expires in ${Math.max(1, Math.floor(w / 60))}m` : w < 86400 ? `expires in ${Math.floor(w / 3600)}h` : `expires in ${Math.floor(w / 86400)}d`;
  }
  function X(o) {
    const c = [];
    if (o.provider && c.push(o.provider), o.oauth) {
      l(o) && c.push("sign-in only");
      const w = Q(o);
      w && c.push(w), Number(o.scope_count || 0) > 0 && c.push(`${o.scope_count} scope${o.scope_count === 1 ? "" : "s"}`);
    }
    return c.join(" · ");
  }
  function W(o) {
    if (v.value === o.component_id) return "Click the check again to remove this connection.";
    const c = i(o);
    return c === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : c === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : c === "disabled" ? "This connection is disabled and will not be used." : l(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function O(o) {
    const c = h.value.trim().toLowerCase();
    return !c || o.toLowerCase().includes(c);
  }
  const T = Y(() => a.value.filter((o) => O(`${u(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), L = Y(() => n.value.filter((o) => O(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: f,
    providerLabel: u,
    providerIcon: E,
    connIcon: x,
    providerForConnection: $,
    grantedScopeSet: S,
    defaultScopeSet: y,
    availableScopeValues: p,
    hasOptionalProviderScopes: m,
    hasSignInOnlyScopes: l,
    connectionState: i,
    statusClass: R,
    statusLabel: N,
    expiryText: Q,
    statusDetail: X,
    connectionDescription: W,
    filteredProviders: T,
    filteredConnections: L
  };
}
const $t = { class: "conn-page" }, St = { class: "kx-head" }, xt = { class: "kx-head-icon" }, jt = { class: "kx-head-actions" }, wt = {
  class: "kx-search",
  role: "search"
}, Et = { class: "conn-body" }, Nt = {
  key: 0,
  class: "conn-loading"
}, At = {
  key: 1,
  class: "conn-empty au d1"
}, Mt = { class: "lt-empty-hero is-danger" }, Pt = { class: "e-sub" }, Rt = {
  key: 0,
  class: "msg err au"
}, Ot = {
  key: 1,
  class: "block au d1"
}, Tt = { class: "live-grid" }, Lt = { class: "lc-top" }, Dt = { class: "lc-ico" }, Ut = { class: "lc-top-r" }, Vt = ["title", "aria-label", "onClick", "disabled"], Bt = ["aria-label", "title", "disabled", "onClick"], It = ["title", "aria-label", "onClick", "disabled"], Kt = ["title", "aria-label", "onClick", "disabled"], zt = { class: "lc-name" }, Ht = { class: "lc-desc" }, Jt = { class: "lc-primary" }, Wt = {
  key: 0,
  class: "lc-secondary"
}, qt = {
  key: 0,
  class: "list-foot"
}, Ft = ["disabled"], Gt = {
  key: 2,
  class: "conn-empty au d1"
}, Yt = { class: "lt-empty-hero is-success" }, Zt = {
  key: 3,
  class: "block au d2"
}, Qt = { class: "block-head" }, Xt = { class: "lt-section-header" }, en = { class: "setup-grid" }, tn = ["data-provider-key", "onClick"], nn = { class: "setup-ico" }, on = { class: "setup-text" }, sn = { class: "setup-name" }, rn = { class: "setup-desc" }, an = {
  key: 4,
  class: "conn-empty au d1"
}, ln = { class: "lt-empty-hero is-info" }, cn = { class: "e-title" }, dn = {
  key: 5,
  class: "conn-empty au d2"
}, un = { class: "lt-empty-hero is-info" }, pn = 100, fn = /* @__PURE__ */ ue({
  __name: "connections",
  setup(a) {
    const n = j([]), h = j([]), v = j(!0), f = j(!1), u = j(""), E = j(""), k = j(""), x = j(null), $ = j(""), S = Ct({ providers: h, connections: n, search: $, confirmId: k }), {
      providerKey: y,
      providerLabel: p,
      providerIcon: m,
      connIcon: l,
      statusClass: i,
      statusLabel: R,
      statusDetail: N,
      connectionDescription: Q,
      filteredProviders: X,
      filteredConnections: W
    } = S, O = j(0), T = j(!1), L = j(!1), o = j(void 0), c = j(void 0), w = j(!1), D = j(null), U = j(null);
    function ye(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(pn),
        offset: String(s)
      }).toString()}`;
    }
    async function fe(s) {
      const { data: e } = await K.get(ye(s));
      if (!e?.success) throw Object.assign(new Error("Could not load connections."), { response: { data: e } });
      return e;
    }
    const ve = kt();
    async function V() {
      const s = ve();
      v.value = !0, f.value = !1, u.value = "", E.value = "";
      try {
        const [e, t, b] = await Promise.all([
          fe(0),
          K.get("/api/v1/oauth/providers/discover"),
          K.get("/api/v1/connections/providers/discover")
        ]);
        if (!s()) return;
        n.value = e.connections ?? [], O.value = Number(e.total_count ?? n.value.length), T.value = !!e.has_more, re(), h.value = Ce([
          ...t.data?.providers ?? [],
          ...b.data?.providers ?? []
        ]);
      } catch (e) {
        if (!s()) return;
        n.value.length ? u.value = z(e) : E.value = z(e), re();
      } finally {
        s() && (v.value = !1);
      }
    }
    async function ke() {
      if (v.value || f.value || !T.value) return;
      const s = ve();
      f.value = !0, u.value = "";
      try {
        const e = await fe(n.value.length);
        if (!s()) return;
        const t = e.connections ?? [];
        n.value = [...n.value, ...t], O.value = Number(e.total_count ?? O.value), T.value = !!e.has_more, re();
      } catch (e) {
        s() && (u.value = z(e));
      } finally {
        s() && (f.value = !1);
      }
    }
    function Ce(s) {
      const e = {};
      for (const t of s) {
        const b = y(t);
        b && (e[b] = e[b] ? { ...t, ...e[b] } : t);
      }
      return Object.values(e);
    }
    function $e(s) {
      return Array.isArray(s) ? s.filter((e) => typeof e == "string" && e.length > 0) : typeof s != "string" ? [] : s.split(/\s+/).filter(Boolean);
    }
    function Se(s, e, t = []) {
      const b = {};
      if (typeof e.title == "string" && (b.name = e.title), typeof e.provider == "string" && (b.provider = e.provider), typeof e.icon == "string" && (b.icon = e.icon), typeof e.connection_state == "string" && (b.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (b.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (b.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (b.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (b.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const q = $e(e.scopes_granted);
        b.scopes_granted = q, b.scope_count = q.length;
      }
      typeof e.oauth_connection == "boolean" && (b.oauth = e.oauth_connection);
      const I = { ...s, ...b };
      for (const q of t) {
        const Re = q === "title" ? "name" : q;
        delete I[Re];
      }
      return I;
    }
    const B = /* @__PURE__ */ new Map(), ee = /* @__PURE__ */ new Set();
    let se = 0;
    function xe(s, e) {
      n.value = n.value.map((t) => t.component_id === s ? Se(t, e.meta || {}, e.deleted || []) : t);
    }
    function je() {
      se++, ee.clear();
      for (const s of B.values()) s();
      B.clear();
    }
    function re() {
      const s = new Set(n.value.map((t) => t.component_id).filter(Boolean));
      for (const [t, b] of B)
        s.has(t) || (b(), B.delete(t));
      const e = se;
      for (const t of s) {
        if (B.has(t) || ee.has(t)) continue;
        ee.add(t);
        const b = at(t, (I) => xe(t, I), Fe);
        if (ee.delete(t), !!b) {
          if (e !== se || !n.value.some((I) => I.component_id === t)) {
            b();
            continue;
          }
          B.set(t, b);
        }
      }
    }
    function ie(s, e) {
      o.value = s, c.value = e, L.value = !0;
    }
    async function we(s) {
      D.value = s, w.value = !0, await Ie(), await Ne();
    }
    function Ee() {
      w.value = !1, D.value = null;
    }
    async function Ne() {
      const s = D.value;
      if (!U.value || !s) return;
      if (U.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await He("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const e = document.createElement("kickside-share");
      e.setAttribute("config", JSON.stringify({
        resource_id: s.component_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(s.component_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(s.component_id)}`,
        title: s.name || s.provider || "Connection"
      })), e.style.display = "block", e.addEventListener("close", Ee), U.value.appendChild(e);
    }
    function Ae(s) {
      if (!s.provider) return;
      const e = h.value.find((t) => y(t) === s.provider);
      if (e?.credential_schema && !s.oauth && !e.create_ui_id) {
        x.value = s;
        return;
      }
      ie(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function Me() {
      L.value = !1, c.value = void 0, n.value = [], V();
    }
    async function he(s) {
      if (k.value !== s.component_id) {
        k.value = s.component_id;
        return;
      }
      k.value = "", u.value = "";
      try {
        const { data: e } = await K.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        Pe(s.component_id, e), await V();
      } catch (e) {
        u.value = z(e);
      }
    }
    Le(V), pe(je);
    const { acceptDeletion: Pe } = lt(n, (s) => s.component_id, void 0, V);
    return (s, e) => (_(), g("div", $t, [
      r("header", St, [
        r("div", xt, [
          C(d(A), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[5] || (e[5] = r("div", { class: "kx-head-text" }, [
          r("h1", { class: "kx-title" }, "Connections"),
          r("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        r("div", jt, [
          r("label", wt, [
            C(d(A), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            G(r("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => $.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [_e, $.value]
            ]),
            $.value ? (_(), g("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (t) => $.value = ""),
              "aria-label": "Clear search"
            }, [
              C(d(A), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : M("", !0)
          ]),
          C(d(Z), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (t) => ie())
          }, {
            icon: oe(() => [
              C(d(A), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      r("div", Et, [
        v.value && !n.value.length ? (_(), g("div", Nt, "Loading…")) : E.value ? (_(), g("section", At, [
          r("div", Mt, [
            C(d(A), { icon: "tabler:plug-x" })
          ]),
          e[6] || (e[6] = r("div", { class: "e-title" }, "Couldn't load connections", -1)),
          r("div", Pt, P(E.value), 1),
          C(d(Z), {
            label: "Try again",
            class: "conn-retry",
            onClick: V
          }, {
            icon: oe(() => [
              C(d(A), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (_(), g(H, { key: 2 }, [
          u.value ? (_(), g("div", Rt, [
            C(d(A), { icon: "tabler:alert-circle" }),
            J(P(u.value), 1)
          ])) : M("", !0),
          d(W).length ? (_(), g("section", Ot, [
            e[9] || (e[9] = r("div", { class: "block-head" }, [
              r("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            r("div", Tt, [
              (_(!0), g(H, null, de(d(W), (t) => (_(), g("div", {
                key: t.component_id,
                class: te(["live-card s-live", `state-${d(i)(t)}`])
              }, [
                C(nt, {
                  state: t,
                  onRetry: (b) => {
                    k.value = t.component_id, he(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                r("div", Lt, [
                  r("div", Dt, [
                    C(d(A), {
                      icon: d(l)(t),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  r("div", Ut, [
                    r("button", {
                      class: "lc-add",
                      title: `Share ${t.name || t.provider}`,
                      "aria-label": `Share ${t.name || t.provider}`,
                      onClick: (b) => we(t),
                      disabled: !!t.deleting_at
                    }, [
                      C(d(A), { icon: "tabler:share" })
                    ], 8, Vt),
                    t.oauth ? M("", !0) : (_(), g("button", {
                      key: 0,
                      class: "lc-add",
                      "aria-label": `Credentials ${t.name || t.provider}`,
                      title: `Credentials ${t.name || t.provider}`,
                      disabled: !!t.deleting_at,
                      onClick: (b) => x.value = t
                    }, [
                      C(d(A), {
                        icon: "tabler:key",
                        "aria-hidden": "true"
                      })
                    ], 8, Bt)),
                    r("button", {
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (b) => Ae(t),
                      disabled: !!t.deleting_at
                    }, [
                      C(d(A), { icon: "tabler:refresh" })
                    ], 8, It),
                    r("button", {
                      class: te(["lc-add lc-danger", k.value === t.component_id && "armed"]),
                      title: k.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (b) => he(t),
                      disabled: !!t.deleting_at
                    }, [
                      C(d(A), {
                        icon: k.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, Kt)
                  ])
                ]),
                r("div", zt, P(t.name || t.provider || "Connection"), 1),
                r("div", Ht, P(d(Q)(t)), 1),
                r("div", {
                  class: te(["lc-status", `state-${d(i)(t)}`])
                }, [
                  e[7] || (e[7] = r("span", { class: "dot" }, null, -1)),
                  r("span", Jt, P(d(R)(t)), 1),
                  d(N)(t) ? (_(), g("span", Wt, "· " + P(d(N)(t)), 1)) : M("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            O.value || T.value ? (_(), g("div", qt, [
              r("span", null, P(n.value.length) + " of " + P(O.value || n.value.length) + " loaded", 1),
              T.value ? (_(), g("button", {
                key: 0,
                class: "ghost-action",
                disabled: v.value || f.value,
                onClick: ke
              }, [
                C(d(A), {
                  icon: f.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: te(f.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[8] || (e[8] = J(" Load more ", -1))
              ], 8, Ft)) : M("", !0)
            ])) : M("", !0)
          ])) : !$.value && h.value.length ? (_(), g("section", Gt, [
            r("div", Yt, [
              C(d(A), { icon: "tabler:plug-connected" })
            ]),
            e[10] || (e[10] = r("div", { class: "e-title" }, "Connect your first app", -1)),
            e[11] || (e[11] = r("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : M("", !0),
          d(X).length ? (_(), g("section", Zt, [
            r("div", Qt, [
              r("h2", Xt, P(d(W).length ? "Add another" : "Available services"), 1)
            ]),
            r("div", en, [
              (_(!0), g(H, null, de(d(X), (t) => (_(), g("button", {
                key: d(y)(t),
                "data-provider-key": d(y)(t),
                class: "setup-card",
                onClick: (b) => ie(d(y)(t))
              }, [
                r("div", nn, [
                  C(d(A), {
                    icon: d(m)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                r("div", on, [
                  r("div", sn, P(d(p)(t)), 1),
                  r("div", rn, P(t.description || `Set up ${d(p)(t)}`), 1)
                ]),
                C(d(A), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, tn))), 128))
            ])
          ])) : $.value ? (_(), g("section", an, [
            r("div", ln, [
              C(d(A), { icon: "tabler:search-off" })
            ]),
            r("div", cn, "No services match “" + P($.value) + "”", 1)
          ])) : !h.value.length && !n.value.length ? (_(), g("section", dn, [
            r("div", un, [
              C(d(A), { icon: "tabler:plug-x" })
            ]),
            e[12] || (e[12] = r("div", { class: "e-title" }, "No providers available", -1)),
            e[13] || (e[13] = r("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : M("", !0)
        ], 64))
      ]),
      x.value ? (_(), ce(yt, {
        key: 0,
        connection: x.value,
        onClose: e[3] || (e[3] = (t) => x.value = null),
        onSaved: V
      }, null, 8, ["connection"])) : M("", !0),
      L.value ? (_(), ce(ze, {
        key: 1,
        providers: h.value,
        provider: o.value,
        reauth: c.value,
        onClose: e[4] || (e[4] = (t) => L.value = !1),
        onConnected: Me
      }, null, 8, ["providers", "provider", "reauth"])) : M("", !0),
      w.value ? (_(), g("div", {
        key: 2,
        ref_key: "shareHost",
        ref: U
      }, null, 512)) : M("", !0)
    ]));
  }
}), yn = {
  rootComponent: fn,
  plugins: [De]
};
export {
  yn as mountConfig
};
//# sourceMappingURL=lazy-mount-Da0JsVGz.js.map

import { B as Te, b as K, C as Oe, c as Ue, r as Le, d as De, e as Ve, W as Be, s as Ie, P as Ke } from "./styles-DtcBBh9s.js";
import { openBlock as m, createElementBlock as g, mergeProps as ae, createElementVNode as r, defineComponent as ue, computed as Y, withModifiers as ne, Fragment as H, createTextVNode as W, toDisplayString as P, createCommentVNode as M, createVNode as C, unref as d, watch as ze, onBeforeUnmount as pe, ref as w, onMounted as He, createBlock as ce, withCtx as oe, renderList as de, withDirectives as G, vModelRadio as le, withKeys as We, vModelText as me, normalizeClass as te, nextTick as Je } from "vue";
import { s as qe, a as Z, b as Fe, _ as Ge } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-Bld6Yk98.js";
import { on as _e, api as z, loadByTagName as Ye, define as Ze } from "@wippy-fe/proxy";
import { Icon as A } from "@iconify/vue";
var Qe = `
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
`, Xe = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, et = Te.extend({
  name: "progressspinner",
  style: Qe,
  classes: Xe
}), tt = {
  name: "BaseProgressSpinner",
  extends: qe,
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
  style: et,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, ge = {
  name: "ProgressSpinner",
  extends: tt,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, nt = ["fill", "stroke-width"];
function ot(i, n, h, v, f, u) {
  return m(), g("div", ae({
    class: i.cx("root"),
    role: "progressbar"
  }, i.ptmi("root")), [(m(), g("svg", ae({
    class: i.cx("spin"),
    viewBox: "25 25 50 50",
    style: u.svgStyle
  }, i.ptm("spin")), [r("circle", ae({
    class: i.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: i.fill,
    "stroke-width": i.strokeWidth,
    strokeMiterlimit: "10"
  }, i.ptm("circle")), null, 16, nt)], 16))], 16);
}
ge.render = ot;
const st = { key: 0 }, rt = /* @__PURE__ */ ue({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(i) {
    const n = i, h = Y(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (v, f) => i.state.deleting_at ? (m(), g("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: f[1] || (f[1] = ne(() => {
      }, ["stop"])),
      onKeydown: f[2] || (f[2] = ne(() => {
      }, ["stop"]))
    }, [
      h.value ? (m(), g(H, { key: 0 }, [
        r("span", null, [
          f[3] || (f[3] = W("Deletion failed", -1)),
          i.state.deletion_job?.last_error ? (m(), g("span", st, ": " + P(i.state.deletion_job.last_error), 1)) : M("", !0)
        ]),
        C(d(Z), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: f[0] || (f[0] = ne((u) => v.$emit("retry"), ["stop"]))
        })
      ], 64)) : (m(), g(H, { key: 1 }, [
        C(d(ge), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        f[4] || (f[4] = r("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : M("", !0);
  }
});
function F(i) {
  return !!i && typeof i == "object" && !Array.isArray(i);
}
function it(i, n) {
  if (n == null) return n;
  switch (i) {
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
function at(i, n) {
  if (!n) return i;
  const h = {};
  for (const [v, f] of Object.entries(i))
    h[v] = it(n[v], f);
  return h;
}
function ye(i, n, h) {
  if (n !== void 0 && !n) return null;
  const v = F(i) ? i : {}, f = [
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
      meta: at(F(u.meta) ? u.meta : {}, h),
      deleted: Array.isArray(u.deleted) ? u.deleted.map(String) : []
    };
  }
  return null;
}
function lt(i, n, h) {
  const v = ye(i, n, h);
  return v?.event === "component.meta.changed" ? v : null;
}
function ct(i, n) {
  const h = ye(i, n);
  return h && h.event !== "component.meta.changed" ? h : null;
}
function dt(i, n, h) {
  if (!i) return null;
  const v = _e(`component.${i}`, (f) => {
    const u = lt(f, i, h);
    u && n(u);
  });
  return typeof v == "function" ? v : null;
}
function ut(i, n, h, v) {
  const f = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
  function E($, S) {
    const b = i.value.find((N) => n(N) === $), p = u.get($), _ = S?.job_id || p?.state.deletion_job_id || b?.deletion_job_id, l = p ? p.state.deletion_job_id : b?.deleting_at ? b.deletion_job_id : void 0;
    if ((p || b?.deleting_at) && _ === l || _ && p?.superseded.has(_)) return;
    const a = {
      deleting_at: p?.state.deleting_at || b?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: _
    }, R = new Set(p?.superseded);
    for (const N of [p?.state.deletion_job_id, b?.deletion_job_id])
      N && N !== _ && R.add(N);
    u.set($, { state: a, superseded: R }), b && (Object.assign(b, a), b.deletion_job = void 0);
  }
  const k = ze(() => i.value, ($, S = []) => {
    const b = $.filter((p) => !f.has(n(p)));
    for (const p of S)
      f.has(n(p)) || b.some((_) => n(_) === n(p)) || p.deleting_at && v?.(n(p));
    if (b.length !== $.length) {
      i.value = b;
      return;
    }
    for (const p of $) {
      p.deleting_at && p.deletion_job === void 0 && !S.includes(p) && (p.deletion_job = null);
      const _ = u.get(n(p));
      if (_) {
        const a = p.deletion_job_id;
        p.deleting_at && a && a !== _.state.deletion_job_id && !_.superseded.has(a) && (_.state.deletion_job_id && _.superseded.add(_.state.deletion_job_id), _.state.deletion_job_id = a), a !== _.state.deletion_job_id && (p.deletion_job = void 0), Object.assign(p, _.state);
      }
      const l = S.find((a) => n(a) === n(p));
      p.deletion_job === void 0 && l?.deletion_job_id === p.deletion_job_id && (p.deletion_job = l?.deletion_job);
    }
  }, { immediate: !0 }), x = _e("@message", ($) => {
    const S = ct($);
    if (!S) return;
    const b = i.value.find((p) => n(p) === S.component_id);
    S.event === "component.deleted" ? (b && !f.has(S.component_id) && v?.(S.component_id), f.add(S.component_id), u.delete(S.component_id), i.value = i.value.filter((p) => n(p) !== S.component_id)) : b && E(S.component_id, { job_id: S.deletion_job_id });
  });
  return pe(() => {
    k(), typeof x == "function" && x();
  }), { acceptDeletion: E };
}
const pt = { class: "credential-editor" }, ft = {
  key: 0,
  role: "status"
}, vt = {
  key: 1,
  role: "alert"
}, ht = { key: 2 }, mt = ["disabled"], _t = { class: "kx-field-lbl" }, gt = { class: "credential-editor-actions" }, yt = ["onUpdate:modelValue", "name"], bt = ["onUpdate:modelValue", "name"], kt = ["onUpdate:modelValue", "name"], Ct = ["onUpdate:modelValue", "aria-label", "onKeydown"], $t = /* @__PURE__ */ ue({
  __name: "SecretsEditor",
  props: {
    connection: {}
  },
  emits: ["close", "saved"],
  setup(i, { emit: n }) {
    const h = i, v = n, f = w([]), u = w(0), E = w(!0), k = w(!1), x = w(""), $ = Y(() => f.value.some((_) => _.mode !== "keep"));
    function S(_, l) {
      let a = _;
      for (const R of l) {
        if (!a || typeof a != "object" || Array.isArray(a)) throw new Error("Credential presence is unavailable");
        a = a[R];
      }
      if (!a || typeof a != "object" || Array.isArray(a) || typeof a.set != "boolean") throw new Error("Credential presence is unavailable");
      return a.set;
    }
    function b() {
      for (const _ of f.value) _.value = "";
    }
    pe(b), He(async () => {
      try {
        const l = (await z.get(`/api/v1/connections/${encodeURIComponent(h.connection.component_id)}`)).data;
        if (!l.success || !Number.isInteger(l.context_revision) || !Array.isArray(l.secret_fields)) throw new Error("Credential presence is unavailable");
        f.value = l.secret_fields.map((a) => {
          if (!a || a.type !== "string" || !Array.isArray(a.path) || !a.path.length || a.path.some((R) => typeof R != "string" || !R)) throw new Error("Credential presence is unavailable");
          return { path: a.path, set: S(l.secrets, a.path), mode: "keep", value: "" };
        }), u.value = l.context_revision;
      } catch (_) {
        x.value = K(_);
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
      const _ = f.value.filter((l) => l.mode !== "keep").map((l) => l.mode === "clear" ? { path: l.path, clear: !0 } : { path: l.path, value: l.value });
      k.value = !0;
      try {
        const { data: l } = await z.put(`/api/v1/connections/${encodeURIComponent(h.connection.component_id)}`, {
          secrets: _,
          expected_revision: u.value
        });
        if (!l?.success) throw new Error("Credential update failed");
        b(), v("saved"), v("close");
      } catch (l) {
        x.value = K(l);
      } finally {
        k.value = !1;
      }
    }
    return (_, l) => (m(), ce(d(Fe), {
      visible: !0,
      modal: "",
      "append-to": "self",
      draggable: !1,
      class: "kx-modal",
      header: `${i.connection.name || "Connection"} credentials`,
      pt: { header: { class: "kx-modal-head" }, content: { class: "kx-dialog-content" }, footer: { class: "kx-modal-foot" } },
      "onUpdate:visible": l[1] || (l[1] = (a) => v("close"))
    }, {
      footer: oe(() => [
        C(d(Z), {
          label: "Cancel",
          severity: "secondary",
          disabled: k.value,
          onClick: l[0] || (l[0] = (a) => v("close"))
        }, null, 8, ["disabled"]),
        C(d(Z), {
          "data-action": "save-secrets",
          label: k.value ? "Saving…" : "Save credentials",
          disabled: E.value || k.value || !$.value,
          onClick: p
        }, null, 8, ["label", "disabled"])
      ]),
      default: oe(() => [
        r("div", pt, [
          E.value ? (m(), g("p", ft, "Loading credential status…")) : M("", !0),
          x.value ? (m(), g("p", vt, P(x.value), 1)) : M("", !0),
          !E.value && !x.value && !f.value.length ? (m(), g("p", ht, "This connection has no declared credentials.")) : M("", !0),
          (m(!0), g(H, null, de(f.value, (a, R) => (m(), g("fieldset", {
            key: JSON.stringify(a.path),
            class: "kx-field",
            disabled: k.value
          }, [
            r("legend", _t, P(a.path.join(".")) + " — " + P(a.set ? "Set" : "Not set"), 1),
            r("div", gt, [
              r("label", null, [
                G(r("input", {
                  "onUpdate:modelValue": (N) => a.mode = N,
                  type: "radio",
                  name: `secret-${R}`,
                  value: "keep"
                }, null, 8, yt), [
                  [le, a.mode]
                ]),
                l[2] || (l[2] = W(" Keep", -1))
              ]),
              r("label", null, [
                G(r("input", {
                  "onUpdate:modelValue": (N) => a.mode = N,
                  type: "radio",
                  name: `secret-${R}`,
                  value: "replace"
                }, null, 8, bt), [
                  [le, a.mode]
                ]),
                l[3] || (l[3] = W(" Replace", -1))
              ]),
              r("label", null, [
                G(r("input", {
                  "onUpdate:modelValue": (N) => a.mode = N,
                  type: "radio",
                  name: `secret-${R}`,
                  value: "clear"
                }, null, 8, kt), [
                  [le, a.mode]
                ]),
                l[4] || (l[4] = W(" Clear", -1))
              ])
            ]),
            a.mode === "replace" ? G((m(), g("input", {
              key: 0,
              "onUpdate:modelValue": (N) => a.value = N,
              type: "password",
              autocomplete: "new-password",
              class: "kx-input",
              "aria-label": `Replace ${a.path.join(".")}`,
              onKeydown: We(ne(p, ["prevent"]), ["enter"])
            }, null, 40, Ct)), [
              [me, a.value]
            ]) : M("", !0)
          ], 8, mt))), 128))
        ])
      ]),
      _: 1
    }, 8, ["header"]));
  }
});
function St() {
  let i = 0;
  return () => {
    const n = ++i;
    return () => n === i;
  };
}
function xt({ providers: i, connections: n, search: h, confirmId: v }) {
  const f = (o) => o.provider ?? "", u = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", E = (o) => o.icon || "tabler:plug", k = Y(() => {
    const o = {};
    for (const c of i.value) {
      const j = f(c);
      j && (o[j] = c);
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
  function b(o) {
    return new Set((o?.default_scopes ?? []).filter((c) => typeof c == "string" && c.length > 0));
  }
  function p(o) {
    return (o?.available_scopes ?? []).map((c) => c.scope).filter((c) => typeof c == "string" && c.length > 0);
  }
  function _(o) {
    const c = b(o);
    return p(o).some((j) => !c.has(j));
  }
  function l(o) {
    if (!o.oauth) return !1;
    const c = $(o);
    if (!_(c)) return !1;
    const j = S(o), L = b(c);
    if (j.size === 0 || L.size === 0) return !1;
    for (const D of j)
      if (!L.has(D)) return !1;
    return !0;
  }
  function a(o) {
    return Le(o.connection_state, o.expires_at);
  }
  function R(o) {
    const c = a(o);
    return c === "connected" && l(o) ? "warn" : Ue[c];
  }
  function N(o) {
    const c = a(o);
    return c === "connected" && l(o) ? "Limited access" : Oe[c];
  }
  function Q(o) {
    const c = Number(o.expires_at || 0);
    if (!c) return "";
    const j = c - Math.floor(Date.now() / 1e3);
    return j <= 0 ? "token expired" : j < 3600 ? `expires in ${Math.max(1, Math.floor(j / 60))}m` : j < 86400 ? `expires in ${Math.floor(j / 3600)}h` : `expires in ${Math.floor(j / 86400)}d`;
  }
  function X(o) {
    const c = [];
    if (o.provider && c.push(o.provider), o.oauth) {
      l(o) && c.push("sign-in only");
      const j = Q(o);
      j && c.push(j), Number(o.scope_count || 0) > 0 && c.push(`${o.scope_count} scope${o.scope_count === 1 ? "" : "s"}`);
    }
    return c.join(" · ");
  }
  function J(o) {
    if (v.value === o.component_id) return "Click the check again to remove this connection.";
    const c = a(o);
    return c === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : c === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : c === "disabled" ? "This connection is disabled and will not be used." : l(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function T(o) {
    const c = h.value.trim().toLowerCase();
    return !c || o.toLowerCase().includes(c);
  }
  const O = Y(() => i.value.filter((o) => T(`${u(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), U = Y(() => n.value.filter((o) => T(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: f,
    providerLabel: u,
    providerIcon: E,
    connIcon: x,
    providerForConnection: $,
    grantedScopeSet: S,
    defaultScopeSet: b,
    availableScopeValues: p,
    hasOptionalProviderScopes: _,
    hasSignInOnlyScopes: l,
    connectionState: a,
    statusClass: R,
    statusLabel: N,
    expiryText: Q,
    statusDetail: X,
    connectionDescription: J,
    filteredProviders: O,
    filteredConnections: U
  };
}
const wt = { class: "conn-page" }, jt = { class: "kx-head" }, Et = { class: "kx-head-icon" }, Nt = { class: "kx-head-actions" }, At = {
  class: "kx-search",
  role: "search"
}, Mt = { class: "conn-body" }, Pt = {
  key: 0,
  class: "conn-loading"
}, Rt = {
  key: 1,
  class: "conn-empty au d1"
}, Tt = { class: "lt-empty-hero is-danger" }, Ot = { class: "e-sub" }, Ut = {
  key: 0,
  class: "msg err au"
}, Lt = {
  key: 1,
  class: "block au d1"
}, Dt = { class: "live-grid" }, Vt = { class: "lc-top" }, Bt = { class: "lc-ico" }, It = { class: "lc-top-r" }, Kt = ["title", "aria-label", "onClick", "disabled"], zt = ["aria-label", "title", "disabled", "onClick"], Ht = ["title", "aria-label", "onClick", "disabled"], Wt = ["title", "aria-label", "onClick", "disabled"], Jt = { class: "lc-name" }, qt = { class: "lc-desc" }, Ft = { class: "lc-primary" }, Gt = {
  key: 0,
  class: "lc-secondary"
}, Yt = {
  key: 0,
  class: "list-foot"
}, Zt = ["disabled"], Qt = {
  key: 2,
  class: "conn-empty au d1"
}, Xt = { class: "lt-empty-hero is-success" }, en = {
  key: 3,
  class: "block au d2"
}, tn = { class: "block-head" }, nn = { class: "lt-section-header" }, on = { class: "setup-grid" }, sn = ["data-provider-key", "onClick"], rn = { class: "setup-ico" }, an = { class: "setup-text" }, ln = { class: "setup-name" }, cn = { class: "setup-desc" }, dn = {
  key: 4,
  class: "conn-empty au d1"
}, un = { class: "lt-empty-hero is-info" }, pn = { class: "e-title" }, fn = {
  key: 5,
  class: "conn-empty au d2"
}, vn = { class: "lt-empty-hero is-info" }, hn = 100, mn = /* @__PURE__ */ ue({
  __name: "connections",
  setup(i) {
    const n = w([]), h = w([]), v = w(!0), f = w(!1), u = w(""), E = w(""), k = w(""), x = w(null), $ = w(""), S = xt({ providers: h, connections: n, search: $, confirmId: k }), {
      providerKey: b,
      providerLabel: p,
      providerIcon: _,
      connIcon: l,
      statusClass: a,
      statusLabel: R,
      statusDetail: N,
      connectionDescription: Q,
      filteredProviders: X,
      filteredConnections: J
    } = S, T = w(0), O = w(!1), U = w(!1), o = w(void 0), c = w(void 0), j = w(!1), L = w(null), D = w(null);
    function be(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(hn),
        offset: String(s)
      }).toString()}`;
    }
    async function fe(s) {
      const { data: e } = await z.get(be(s));
      if (!e?.success) throw Object.assign(new Error("Could not load connections."), { response: { data: e } });
      return e;
    }
    const ve = St();
    async function V() {
      const s = ve();
      v.value = !0, f.value = !1, u.value = "", E.value = "";
      try {
        const [e, t, y] = await Promise.all([
          fe(0),
          z.get("/api/v1/oauth/providers/discover"),
          z.get("/api/v1/connections/providers/discover")
        ]);
        if (!s()) return;
        n.value = e.connections ?? [], T.value = Number(e.total_count ?? n.value.length), O.value = !!e.has_more, re(), h.value = Ce([
          ...t.data?.providers ?? [],
          ...y.data?.providers ?? []
        ]);
      } catch (e) {
        if (!s()) return;
        n.value.length ? u.value = K(e) : E.value = K(e), re();
      } finally {
        s() && (v.value = !1);
      }
    }
    async function ke() {
      if (v.value || f.value || !O.value) return;
      const s = ve();
      f.value = !0, u.value = "";
      try {
        const e = await fe(n.value.length);
        if (!s()) return;
        const t = e.connections ?? [];
        n.value = [...n.value, ...t], T.value = Number(e.total_count ?? T.value), O.value = !!e.has_more, re();
      } catch (e) {
        s() && (u.value = K(e));
      } finally {
        s() && (f.value = !1);
      }
    }
    function Ce(s) {
      const e = {};
      for (const t of s) {
        const y = b(t);
        y && (e[y] = e[y] ? { ...t, ...e[y] } : t);
      }
      return Object.values(e);
    }
    function $e(s) {
      return Array.isArray(s) ? s.filter((e) => typeof e == "string" && e.length > 0) : typeof s != "string" ? [] : s.split(/\s+/).filter(Boolean);
    }
    function Se(s, e, t = []) {
      const y = {};
      if (typeof e.title == "string" && (y.name = e.title), typeof e.provider == "string" && (y.provider = e.provider), typeof e.icon == "string" && (y.icon = e.icon), typeof e.connection_state == "string" && (y.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (y.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (y.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (y.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (y.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const q = $e(e.scopes_granted);
        y.scopes_granted = q, y.scope_count = q.length;
      }
      typeof e.oauth_connection == "boolean" && (y.oauth = e.oauth_connection);
      const I = { ...s, ...y };
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
    function we() {
      se++, ee.clear();
      for (const s of B.values()) s();
      B.clear();
    }
    function re() {
      const s = new Set(n.value.map((t) => t.component_id).filter(Boolean));
      for (const [t, y] of B)
        s.has(t) || (y(), B.delete(t));
      const e = se;
      for (const t of s) {
        if (B.has(t) || ee.has(t)) continue;
        ee.add(t);
        const y = dt(t, (I) => xe(t, I), Ve);
        if (ee.delete(t), !!y) {
          if (e !== se || !n.value.some((I) => I.component_id === t)) {
            y();
            continue;
          }
          B.set(t, y);
        }
      }
    }
    function ie(s, e) {
      o.value = s, c.value = e, U.value = !0;
    }
    async function je(s) {
      L.value = s, j.value = !0, await Je(), await Ne();
    }
    function Ee() {
      j.value = !1, L.value = null;
    }
    async function Ne() {
      const s = L.value;
      if (!D.value || !s) return;
      if (D.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Ye("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const e = document.createElement("kickside-share");
      e.setAttribute("config", JSON.stringify({
        resource_id: s.component_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(s.component_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(s.component_id)}`,
        title: s.name || s.provider || "Connection"
      })), e.style.display = "block", e.addEventListener("close", Ee), D.value.appendChild(e);
    }
    function Ae(s) {
      if (!s.provider) return;
      const e = h.value.find((t) => b(t) === s.provider);
      if (e?.credential_schema && !s.oauth && !e.create_ui_id) {
        x.value = s;
        return;
      }
      ie(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function Me() {
      U.value = !1, c.value = void 0, n.value = [], V();
    }
    async function he(s) {
      if (k.value !== s.component_id) {
        k.value = s.component_id;
        return;
      }
      k.value = "", u.value = "";
      try {
        const { data: e } = await z.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        Pe(s.component_id, e), await V();
      } catch (e) {
        u.value = K(e);
      }
    }
    De(V), pe(we);
    const { acceptDeletion: Pe } = ut(n, (s) => s.component_id, void 0, V);
    return (s, e) => (m(), g("div", wt, [
      r("header", jt, [
        r("div", Et, [
          C(d(A), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[5] || (e[5] = r("div", { class: "kx-head-text" }, [
          r("h1", { class: "kx-title" }, "Connections"),
          r("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        r("div", Nt, [
          r("label", At, [
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
              [me, $.value]
            ]),
            $.value ? (m(), g("button", {
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
      r("div", Mt, [
        v.value && !n.value.length ? (m(), g("div", Pt, "Loading…")) : E.value ? (m(), g("section", Rt, [
          r("div", Tt, [
            C(d(A), { icon: "tabler:plug-x" })
          ]),
          e[6] || (e[6] = r("div", { class: "e-title" }, "Couldn't load connections", -1)),
          r("div", Ot, P(E.value), 1),
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
        ])) : (m(), g(H, { key: 2 }, [
          u.value ? (m(), g("div", Ut, [
            C(d(A), { icon: "tabler:alert-circle" }),
            W(P(u.value), 1)
          ])) : M("", !0),
          d(J).length ? (m(), g("section", Lt, [
            e[9] || (e[9] = r("div", { class: "block-head" }, [
              r("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            r("div", Dt, [
              (m(!0), g(H, null, de(d(J), (t) => (m(), g("div", {
                key: t.component_id,
                class: te(["live-card s-live", `state-${d(a)(t)}`])
              }, [
                C(rt, {
                  state: t,
                  onRetry: (y) => {
                    k.value = t.component_id, he(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                r("div", Vt, [
                  r("div", Bt, [
                    C(d(A), {
                      icon: d(l)(t),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  r("div", It, [
                    r("button", {
                      class: "lc-add",
                      title: `Share ${t.name || t.provider}`,
                      "aria-label": `Share ${t.name || t.provider}`,
                      onClick: (y) => je(t),
                      disabled: !!t.deleting_at
                    }, [
                      C(d(A), { icon: "tabler:share" })
                    ], 8, Kt),
                    t.oauth ? M("", !0) : (m(), g("button", {
                      key: 0,
                      class: "lc-add",
                      "aria-label": `Credentials ${t.name || t.provider}`,
                      title: `Credentials ${t.name || t.provider}`,
                      disabled: !!t.deleting_at,
                      onClick: (y) => x.value = t
                    }, [
                      C(d(A), {
                        icon: "tabler:key",
                        "aria-hidden": "true"
                      })
                    ], 8, zt)),
                    r("button", {
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (y) => Ae(t),
                      disabled: !!t.deleting_at
                    }, [
                      C(d(A), { icon: "tabler:refresh" })
                    ], 8, Ht),
                    r("button", {
                      class: te(["lc-add lc-danger", k.value === t.component_id && "armed"]),
                      title: k.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (y) => he(t),
                      disabled: !!t.deleting_at
                    }, [
                      C(d(A), {
                        icon: k.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, Wt)
                  ])
                ]),
                r("div", Jt, P(t.name || t.provider || "Connection"), 1),
                r("div", qt, P(d(Q)(t)), 1),
                r("div", {
                  class: te(["lc-status", `state-${d(a)(t)}`])
                }, [
                  e[7] || (e[7] = r("span", { class: "dot" }, null, -1)),
                  r("span", Ft, P(d(R)(t)), 1),
                  d(N)(t) ? (m(), g("span", Gt, "· " + P(d(N)(t)), 1)) : M("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            T.value || O.value ? (m(), g("div", Yt, [
              r("span", null, P(n.value.length) + " of " + P(T.value || n.value.length) + " loaded", 1),
              O.value ? (m(), g("button", {
                key: 0,
                class: "ghost-action",
                disabled: v.value || f.value,
                onClick: ke
              }, [
                C(d(A), {
                  icon: f.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: te(f.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[8] || (e[8] = W(" Load more ", -1))
              ], 8, Zt)) : M("", !0)
            ])) : M("", !0)
          ])) : !$.value && h.value.length ? (m(), g("section", Qt, [
            r("div", Xt, [
              C(d(A), { icon: "tabler:plug-connected" })
            ]),
            e[10] || (e[10] = r("div", { class: "e-title" }, "Connect your first app", -1)),
            e[11] || (e[11] = r("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : M("", !0),
          d(X).length ? (m(), g("section", en, [
            r("div", tn, [
              r("h2", nn, P(d(J).length ? "Add another" : "Available services"), 1)
            ]),
            r("div", on, [
              (m(!0), g(H, null, de(d(X), (t) => (m(), g("button", {
                key: d(b)(t),
                "data-provider-key": d(b)(t),
                class: "setup-card",
                onClick: (y) => ie(d(b)(t))
              }, [
                r("div", rn, [
                  C(d(A), {
                    icon: d(_)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                r("div", an, [
                  r("div", ln, P(d(p)(t)), 1),
                  r("div", cn, P(t.description || `Set up ${d(p)(t)}`), 1)
                ]),
                C(d(A), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, sn))), 128))
            ])
          ])) : $.value ? (m(), g("section", dn, [
            r("div", un, [
              C(d(A), { icon: "tabler:search-off" })
            ]),
            r("div", pn, "No services match “" + P($.value) + "”", 1)
          ])) : !h.value.length && !n.value.length ? (m(), g("section", fn, [
            r("div", vn, [
              C(d(A), { icon: "tabler:plug-x" })
            ]),
            e[12] || (e[12] = r("div", { class: "e-title" }, "No providers available", -1)),
            e[13] || (e[13] = r("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : M("", !0)
        ], 64))
      ]),
      x.value ? (m(), ce($t, {
        key: 0,
        connection: x.value,
        onClose: e[3] || (e[3] = (t) => x.value = null),
        onSaved: V
      }, null, 8, ["connection"])) : M("", !0),
      U.value ? (m(), ce(Ge, {
        key: 1,
        providers: h.value,
        provider: o.value,
        reauth: c.value,
        onClose: e[4] || (e[4] = (t) => U.value = !1),
        onConnected: Me
      }, null, 8, ["providers", "provider", "reauth"])) : M("", !0),
      j.value ? (m(), g("div", {
        key: 2,
        ref_key: "shareHost",
        ref: D
      }, null, 512)) : M("", !0)
    ]));
  }
}), _n = { props: { type: "object", properties: {} } }, gn = {
  wippy: _n
};
class yn extends Be {
  static get wippyConfig() {
    return {
      propsSchema: gn.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ie
    };
  }
  static get vueConfig() {
    return { rootComponent: mn, plugins: [Ke] };
  }
}
Ze(import.meta.url, yn);
//# sourceMappingURL=index.js.map

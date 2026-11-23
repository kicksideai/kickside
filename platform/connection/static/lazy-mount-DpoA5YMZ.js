import { B as Oe, s as Le, b as De, P as Ue } from "./wc-runtime-Bcuhsx-0.js";
import { openBlock as h, createElementBlock as g, mergeProps as ce, createElementVNode as i, defineComponent as fe, computed as G, withModifiers as oe, Fragment as H, createTextVNode as z, toDisplayString as P, createCommentVNode as R, createVNode as $, unref as l, watch as Be, onBeforeUnmount as ve, ref as w, onMounted as Ve, createBlock as ue, withCtx as se, renderList as pe, withDirectives as F, vModelRadio as de, withKeys as Ie, vModelText as ge, normalizeClass as ne, nextTick as Ke } from "vue";
import { s as Y, a as He, _ as ze } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-D8LyloDj.js";
import { on as be, api as I, loadByTagName as Je } from "@wippy-fe/proxy";
import { Icon as N } from "@iconify/vue";
import { a as K, C as We, b as qe, r as Fe, c as Ge } from "./status-CErul0OK.js";
var Ye = `
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
`, Ze = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Qe = Oe.extend({
  name: "progressspinner",
  style: Ye,
  classes: Ze
}), Xe = {
  name: "BaseProgressSpinner",
  extends: Le,
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
  style: Qe,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, ye = {
  name: "ProgressSpinner",
  extends: Xe,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, et = ["fill", "stroke-width"];
function tt(a, o, _, v, f, p) {
  return h(), g("div", ce({
    class: a.cx("root"),
    role: "progressbar"
  }, a.ptmi("root")), [(h(), g("svg", ce({
    class: a.cx("spin"),
    viewBox: "25 25 50 50",
    style: p.svgStyle
  }, a.ptm("spin")), [i("circle", ce({
    class: a.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: a.fill,
    "stroke-width": a.strokeWidth,
    strokeMiterlimit: "10"
  }, a.ptm("circle")), null, 16, et)], 16))], 16);
}
ye.render = tt;
const nt = { key: 0 }, ot = /* @__PURE__ */ fe({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(a) {
    const o = a, _ = G(() => o.state.deletion_job === null || ["dead", "cancelled"].includes(o.state.deletion_job?.status || ""));
    return (v, f) => a.state.deleting_at ? (h(), g("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: f[1] || (f[1] = oe(() => {
      }, ["stop"])),
      onKeydown: f[2] || (f[2] = oe(() => {
      }, ["stop"]))
    }, [
      _.value ? (h(), g(H, { key: 0 }, [
        i("span", null, [
          f[3] || (f[3] = z("Deletion failed", -1)),
          a.state.deletion_job?.last_error ? (h(), g("span", nt, ": " + P(a.state.deletion_job.last_error), 1)) : R("", !0)
        ]),
        $(l(Y), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: f[0] || (f[0] = oe((p) => v.$emit("retry"), ["stop"]))
        })
      ], 64)) : (h(), g(H, { key: 1 }, [
        $(l(ye), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        f[4] || (f[4] = i("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : R("", !0);
  }
});
function q(a) {
  return !!a && typeof a == "object" && !Array.isArray(a);
}
function st(a, o) {
  if (o == null) return o;
  switch (a) {
    case "boolean":
    case "checkbox":
      return typeof o == "boolean" ? o : o === "true" ? !0 : o === "false" ? !1 : o;
    case "number":
    case "integer": {
      if (typeof o == "number") return o;
      if (typeof o == "string" && o.trim() !== "") {
        const _ = Number(o);
        if (!Number.isNaN(_)) return _;
      }
      return o;
    }
    case "object":
    case "array":
      if (typeof o == "string")
        try {
          const _ = JSON.parse(o);
          if (_ && typeof _ == "object") return _;
        } catch {
        }
      return o;
    default:
      return o;
  }
}
function rt(a, o) {
  if (!o) return a;
  const _ = {};
  for (const [v, f] of Object.entries(a))
    _[v] = st(o[v], f);
  return _;
}
function ke(a, o, _) {
  if (o !== void 0 && !o) return null;
  const v = q(a) ? a : {}, f = [
    v,
    q(v.data) ? v.data : null,
    q(v.payload) ? v.payload : null,
    q(v.detail) ? v.detail : null
  ].filter(Boolean);
  for (const p of f) {
    if (p.event !== "component.meta.changed" && p.event !== "component.deleting" && p.event !== "component.deleted") continue;
    const E = String(p.component_id || ""), k = String(v.topic || p.topic || "");
    if (o === void 0) {
      if (!E && (!k.startsWith("component.") || k === "component.")) continue;
    } else if (E && E !== o || !E && k !== `component.${o}`) continue;
    const x = E || o || k.slice(10);
    return p.event === "component.deleting" && typeof p.deletion_job_id == "string" && p.deletion_job_id ? { event: p.event, component_id: x, deletion_job_id: p.deletion_job_id } : p.event !== "component.meta.changed" ? { event: p.event, component_id: x } : {
      event: "component.meta.changed",
      component_id: x,
      meta: rt(q(p.meta) ? p.meta : {}, _),
      deleted: Array.isArray(p.deleted) ? p.deleted.map(String) : []
    };
  }
  return null;
}
function it(a, o, _) {
  const v = ke(a, o, _);
  return v?.event === "component.meta.changed" ? v : null;
}
function at(a, o) {
  const _ = ke(a, o);
  return _ && _.event !== "component.meta.changed" ? _ : null;
}
function lt(a, o, _) {
  if (!a) return null;
  const v = be(`component.${a}`, (f) => {
    const p = it(f, a, _);
    p && o(p);
  });
  return typeof v == "function" ? v : null;
}
function ct(a, o, _, v) {
  const f = /* @__PURE__ */ new Set(), p = /* @__PURE__ */ new Map();
  function E(C, S) {
    const y = a.value.find((M) => o(M) === C), c = p.get(C), m = S?.job_id || c?.state.deletion_job_id || y?.deletion_job_id, d = c ? c.state.deletion_job_id : y?.deleting_at ? y.deletion_job_id : void 0;
    if ((c || y?.deleting_at) && m === d || m && c?.superseded.has(m)) return;
    const r = {
      deleting_at: c?.state.deleting_at || y?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: m
    }, A = new Set(c?.superseded);
    for (const M of [c?.state.deletion_job_id, y?.deletion_job_id])
      M && M !== m && A.add(M);
    p.set(C, { state: r, superseded: A }), y && (Object.assign(y, r), y.deletion_job = void 0);
  }
  const k = Be(() => a.value, (C, S = []) => {
    const y = C.filter((c) => !f.has(o(c)));
    for (const c of S)
      f.has(o(c)) || y.some((m) => o(m) === o(c)) || c.deleting_at && v?.(o(c));
    if (y.length !== C.length) {
      a.value = y;
      return;
    }
    for (const c of C) {
      c.deleting_at && c.deletion_job === void 0 && !S.includes(c) && (c.deletion_job = null);
      const m = p.get(o(c));
      if (m) {
        const r = c.deletion_job_id;
        c.deleting_at && r && r !== m.state.deletion_job_id && !m.superseded.has(r) && (m.state.deletion_job_id && m.superseded.add(m.state.deletion_job_id), m.state.deletion_job_id = r), r !== m.state.deletion_job_id && (c.deletion_job = void 0), Object.assign(c, m.state);
      }
      const d = S.find((r) => o(r) === o(c));
      c.deletion_job === void 0 && d?.deletion_job_id === c.deletion_job_id && (c.deletion_job = d?.deletion_job);
    }
  }, { immediate: !0 }), x = be("@message", (C) => {
    const S = at(C);
    if (!S) return;
    const y = a.value.find((c) => o(c) === S.component_id);
    S.event === "component.deleted" ? (y && !f.has(S.component_id) && v?.(S.component_id), f.add(S.component_id), p.delete(S.component_id), a.value = a.value.filter((c) => o(c) !== S.component_id)) : y && E(S.component_id, { job_id: S.deletion_job_id });
  });
  return ve(() => {
    k(), typeof x == "function" && x();
  }), { acceptDeletion: E };
}
const dt = { class: "credential-editor" }, ut = {
  key: 0,
  role: "status"
}, pt = {
  key: 1,
  role: "alert"
}, ft = { key: 2 }, vt = ["disabled"], ht = { class: "kx-field-lbl" }, _t = { class: "credential-editor-actions" }, mt = ["onUpdate:modelValue", "name"], gt = ["onUpdate:modelValue", "name"], bt = ["onUpdate:modelValue", "name"], yt = ["onUpdate:modelValue", "aria-label", "onKeydown"], kt = /* @__PURE__ */ fe({
  __name: "SecretsEditor",
  props: {
    connection: {}
  },
  emits: ["close", "saved"],
  setup(a, { emit: o }) {
    const _ = a, v = o, f = w([]), p = w(0), E = w(!0), k = w(!1), x = w(""), C = G(() => f.value.some((m) => m.mode !== "keep"));
    function S(m, d) {
      let r = m;
      for (const A of d) {
        if (!r || typeof r != "object" || Array.isArray(r)) throw new Error("Credential presence is unavailable");
        r = r[A];
      }
      if (!r || typeof r != "object" || Array.isArray(r) || typeof r.set != "boolean") throw new Error("Credential presence is unavailable");
      return r.set;
    }
    function y() {
      for (const m of f.value) m.value = "";
    }
    ve(y), Ve(async () => {
      try {
        const d = (await I.get(`/api/v1/connections/${encodeURIComponent(_.connection.component_id)}`)).data;
        if (!d.success || !Number.isInteger(d.context_revision) || !Array.isArray(d.secret_fields)) throw new Error("Credential presence is unavailable");
        f.value = d.secret_fields.map((r) => {
          if (!r || r.type !== "string" || !Array.isArray(r.path) || !r.path.length || r.path.some((A) => typeof A != "string" || !A)) throw new Error("Credential presence is unavailable");
          return { path: r.path, set: S(d.secrets, r.path), mode: "keep", value: "" };
        }), p.value = d.context_revision;
      } catch (m) {
        x.value = K(m);
      } finally {
        E.value = !1;
      }
    });
    async function c() {
      if (k.value || !C.value) return;
      if (x.value = "", f.value.some((d) => d.mode === "replace" && !d.value)) {
        x.value = "Enter a replacement or choose Clear.";
        return;
      }
      const m = f.value.filter((d) => d.mode !== "keep").map((d) => d.mode === "clear" ? { path: d.path, clear: !0 } : { path: d.path, value: d.value });
      k.value = !0;
      try {
        const { data: d } = await I.put(`/api/v1/connections/${encodeURIComponent(_.connection.component_id)}`, {
          secrets: m,
          expected_revision: p.value
        });
        if (!d?.success) throw new Error("Credential update failed");
        y(), v("saved"), v("close");
      } catch (d) {
        x.value = K(d);
      } finally {
        k.value = !1;
      }
    }
    return (m, d) => (h(), ue(l(He), {
      visible: !0,
      modal: "",
      "append-to": "self",
      draggable: !1,
      class: "kx-modal",
      header: `${a.connection.name || "Connection"} credentials`,
      pt: { header: { class: "kx-modal-head" }, content: { class: "kx-dialog-content" }, footer: { class: "kx-modal-foot" } },
      "onUpdate:visible": d[1] || (d[1] = (r) => v("close"))
    }, {
      footer: se(() => [
        $(l(Y), {
          label: "Cancel",
          severity: "secondary",
          disabled: k.value,
          onClick: d[0] || (d[0] = (r) => v("close"))
        }, null, 8, ["disabled"]),
        $(l(Y), {
          "data-action": "save-secrets",
          label: k.value ? "Saving…" : "Save credentials",
          disabled: E.value || k.value || !C.value,
          onClick: c
        }, null, 8, ["label", "disabled"])
      ]),
      default: se(() => [
        i("div", dt, [
          E.value ? (h(), g("p", ut, "Loading credential status…")) : R("", !0),
          x.value ? (h(), g("p", pt, P(x.value), 1)) : R("", !0),
          !E.value && !x.value && !f.value.length ? (h(), g("p", ft, "This connection has no declared credentials.")) : R("", !0),
          (h(!0), g(H, null, pe(f.value, (r, A) => (h(), g("fieldset", {
            key: JSON.stringify(r.path),
            class: "kx-field",
            disabled: k.value
          }, [
            i("legend", ht, P(r.path.join(".")) + " — " + P(r.set ? "Set" : "Not set"), 1),
            i("div", _t, [
              i("label", null, [
                F(i("input", {
                  "onUpdate:modelValue": (M) => r.mode = M,
                  type: "radio",
                  name: `secret-${A}`,
                  value: "keep"
                }, null, 8, mt), [
                  [de, r.mode]
                ]),
                d[2] || (d[2] = z(" Keep", -1))
              ]),
              i("label", null, [
                F(i("input", {
                  "onUpdate:modelValue": (M) => r.mode = M,
                  type: "radio",
                  name: `secret-${A}`,
                  value: "replace"
                }, null, 8, gt), [
                  [de, r.mode]
                ]),
                d[3] || (d[3] = z(" Replace", -1))
              ]),
              i("label", null, [
                F(i("input", {
                  "onUpdate:modelValue": (M) => r.mode = M,
                  type: "radio",
                  name: `secret-${A}`,
                  value: "clear"
                }, null, 8, bt), [
                  [de, r.mode]
                ]),
                d[4] || (d[4] = z(" Clear", -1))
              ])
            ]),
            r.mode === "replace" ? F((h(), g("input", {
              key: 0,
              "onUpdate:modelValue": (M) => r.value = M,
              type: "password",
              autocomplete: "new-password",
              class: "kx-input",
              "aria-label": `Replace ${r.path.join(".")}`,
              onKeydown: Ie(oe(c, ["prevent"]), ["enter"])
            }, null, 40, yt)), [
              [ge, r.value]
            ]) : R("", !0)
          ], 8, vt))), 128))
        ])
      ]),
      _: 1
    }, 8, ["header"]));
  }
});
function Ct() {
  let a = 0;
  return () => {
    const o = ++a;
    return () => o === a;
  };
}
function $t({ providers: a, connections: o, search: _, confirmId: v }) {
  const f = (n) => n.provider ?? "", p = (n) => n.title ?? n.name ?? n.oauth_provider ?? "Provider", E = (n) => n.icon || "tabler:plug", k = G(() => {
    const n = {};
    for (const u of a.value) {
      const j = f(u);
      j && (n[j] = u);
    }
    return n;
  });
  function x(n) {
    return n.icon || k.value[n.provider || ""]?.icon || "tabler:plug-connected";
  }
  function C(n) {
    return n.provider ? k.value[n.provider] : void 0;
  }
  function S(n) {
    return n.can_edit === !0 && !!C(n);
  }
  function y(n) {
    return new Set((n.scopes_granted ?? []).filter((u) => typeof u == "string" && u.length > 0));
  }
  function c(n) {
    return new Set((n?.default_scopes ?? []).filter((u) => typeof u == "string" && u.length > 0));
  }
  function m(n) {
    return (n?.available_scopes ?? []).map((u) => u.scope).filter((u) => typeof u == "string" && u.length > 0);
  }
  function d(n) {
    const u = c(n);
    return m(n).some((j) => !u.has(j));
  }
  function r(n) {
    if (!n.oauth) return !1;
    const u = C(n);
    if (!d(u)) return !1;
    const j = y(n), L = c(u);
    if (j.size === 0 || L.size === 0) return !1;
    for (const re of j)
      if (!L.has(re)) return !1;
    return !0;
  }
  function A(n) {
    return Fe(n.connection_state, n.expires_at);
  }
  function M(n) {
    const u = A(n);
    return u === "connected" && r(n) ? "warn" : qe[u];
  }
  function Z(n) {
    const u = A(n);
    return u === "connected" && r(n) ? "Limited access" : We[u];
  }
  function Q(n) {
    const u = Number(n.expires_at || 0);
    if (!u) return "";
    const j = u - Math.floor(Date.now() / 1e3);
    return j <= 0 ? "token expired" : j < 3600 ? `expires in ${Math.max(1, Math.floor(j / 60))}m` : j < 86400 ? `expires in ${Math.floor(j / 3600)}h` : `expires in ${Math.floor(j / 86400)}d`;
  }
  function X(n) {
    const u = [];
    if (n.provider && u.push(n.provider), n.oauth) {
      r(n) && u.push("sign-in only");
      const j = Q(n);
      j && u.push(j), Number(n.scope_count || 0) > 0 && u.push(`${n.scope_count} scope${n.scope_count === 1 ? "" : "s"}`);
    }
    return u.join(" · ");
  }
  function J(n) {
    if (v.value === n.component_id) return "Click the check again to remove this connection.";
    switch (A(n)) {
      case "connected":
        return r(n) ? `This connection is limited to sign-in. ${S(n) ? "Reconnect to grant service access." : "Ask the connection owner to grant service access."}` : n.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
      case "expired":
        return `The stored access token has expired. ${T(n)}`;
      case "needs_reauth":
        return ["This connection must be reauthorized.", T(n), n.reauth_reason].filter(Boolean).join(" ");
      case "disabled":
        return "This connection is disabled and will not be used.";
      case "error":
        return `This connection is unavailable. ${T(n, "Ask the connection owner to check it.")}`;
      case "unknown":
        return "Connection availability could not be verified.";
    }
  }
  function T(n, u = "Ask the connection owner to reconnect.") {
    return S(n) ? "Reconnect to restore access." : n.can_edit === !0 ? "Check the provider configuration." : u;
  }
  function O(n) {
    const u = _.value.trim().toLowerCase();
    return !u || n.toLowerCase().includes(u);
  }
  const D = G(() => a.value.filter((n) => O(`${p(n)} ${n.description ?? ""} ${(n.classes ?? []).join(" ")}`))), ee = G(() => o.value.filter((n) => O(`${n.name ?? ""} ${n.provider ?? ""}`)));
  return {
    providerKey: f,
    providerLabel: p,
    providerIcon: E,
    connIcon: x,
    providerForConnection: C,
    canReconnect: S,
    grantedScopeSet: y,
    defaultScopeSet: c,
    availableScopeValues: m,
    hasOptionalProviderScopes: d,
    hasSignInOnlyScopes: r,
    connectionState: A,
    statusClass: M,
    statusLabel: Z,
    expiryText: Q,
    statusDetail: X,
    connectionDescription: J,
    filteredProviders: D,
    filteredConnections: ee
  };
}
const St = { class: "conn-page" }, xt = { class: "kx-head" }, wt = { class: "kx-head-icon" }, jt = { class: "kx-head-actions" }, Et = {
  class: "kx-search",
  role: "search"
}, At = { class: "conn-body" }, Nt = {
  key: 0,
  class: "conn-loading"
}, Rt = {
  key: 1,
  class: "conn-empty au d1"
}, Mt = { class: "lt-empty-hero is-danger" }, Pt = { class: "e-sub" }, Tt = {
  key: 0,
  class: "msg err au"
}, Ot = {
  key: 1,
  class: "block au d1"
}, Lt = { class: "live-grid" }, Dt = { class: "lc-top" }, Ut = { class: "lc-ico" }, Bt = { class: "lc-top-r" }, Vt = ["title", "aria-label", "onClick", "disabled"], It = ["aria-label", "title", "disabled", "onClick"], Kt = ["title", "aria-label", "onClick", "disabled"], Ht = ["title", "aria-label", "onClick", "disabled"], zt = { class: "lc-name" }, Jt = { class: "lc-desc" }, Wt = { class: "lc-primary" }, qt = {
  key: 0,
  class: "lc-secondary"
}, Ft = {
  key: 0,
  class: "list-foot"
}, Gt = ["disabled"], Yt = {
  key: 2,
  class: "conn-empty au d1"
}, Zt = { class: "lt-empty-hero is-success" }, Qt = {
  key: 3,
  class: "block au d2"
}, Xt = { class: "block-head" }, en = { class: "lt-section-header" }, tn = { class: "setup-grid" }, nn = ["data-provider-key", "onClick"], on = { class: "setup-ico" }, sn = { class: "setup-text" }, rn = { class: "setup-name" }, an = { class: "setup-desc" }, ln = {
  key: 4,
  class: "conn-empty au d1"
}, cn = { class: "lt-empty-hero is-info" }, dn = { class: "e-title" }, un = {
  key: 5,
  class: "conn-empty au d2"
}, pn = { class: "lt-empty-hero is-info" }, fn = 100, vn = /* @__PURE__ */ fe({
  __name: "connections",
  setup(a) {
    const o = w([]), _ = w([]), v = w(!0), f = w(!1), p = w(""), E = w(""), k = w(""), x = w(null), C = w(""), S = $t({ providers: _, connections: o, search: C, confirmId: k }), {
      providerKey: y,
      providerLabel: c,
      providerIcon: m,
      connIcon: d,
      canReconnect: r,
      statusClass: A,
      statusLabel: M,
      statusDetail: Z,
      connectionDescription: Q,
      filteredProviders: X,
      filteredConnections: J
    } = S, T = w(0), O = w(!1), D = w(!1), ee = w(void 0), n = w(void 0), u = w(!1), j = w(null), L = w(null);
    function re(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(fn),
        offset: String(s)
      }).toString()}`;
    }
    async function he(s) {
      const { data: e } = await I.get(re(s));
      if (!e?.success) throw Object.assign(new Error("Could not load connections."), { response: { data: e } });
      return e;
    }
    const _e = Ct();
    async function U() {
      const s = _e();
      v.value = !0, f.value = !1, p.value = "", E.value = "";
      try {
        const [e, t, b] = await Promise.all([
          he(0),
          I.get("/api/v1/oauth/providers/discover"),
          I.get("/api/v1/connections/providers/discover")
        ]);
        if (!s()) return;
        o.value = e.connections ?? [], T.value = Number(e.total_count ?? o.value.length), O.value = !!e.has_more, ae(), _.value = $e([
          ...t.data?.providers ?? [],
          ...b.data?.providers ?? []
        ]);
      } catch (e) {
        if (!s()) return;
        o.value.length ? p.value = K(e) : E.value = K(e), ae();
      } finally {
        s() && (v.value = !1);
      }
    }
    async function Ce() {
      if (v.value || f.value || !O.value) return;
      const s = _e();
      f.value = !0, p.value = "";
      try {
        const e = await he(o.value.length);
        if (!s()) return;
        const t = e.connections ?? [];
        o.value = [...o.value, ...t], T.value = Number(e.total_count ?? T.value), O.value = !!e.has_more, ae();
      } catch (e) {
        s() && (p.value = K(e));
      } finally {
        s() && (f.value = !1);
      }
    }
    function $e(s) {
      const e = {};
      for (const t of s) {
        const b = y(t);
        b && (e[b] = e[b] ? { ...t, ...e[b] } : t);
      }
      return Object.values(e);
    }
    function Se(s) {
      return Array.isArray(s) ? s.filter((e) => typeof e == "string" && e.length > 0) : typeof s != "string" ? [] : s.split(/\s+/).filter(Boolean);
    }
    function xe(s, e, t = []) {
      const b = {};
      if (typeof e.title == "string" && (b.name = e.title), typeof e.provider == "string" && (b.provider = e.provider), typeof e.icon == "string" && (b.icon = e.icon), typeof e.connection_state == "string" && (b.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (b.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (b.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (b.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (b.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const W = Se(e.scopes_granted);
        b.scopes_granted = W, b.scope_count = W.length;
      }
      typeof e.oauth_connection == "boolean" && (b.oauth = e.oauth_connection);
      const V = { ...s, ...b };
      for (const W of t) {
        const Te = W === "title" ? "name" : W;
        delete V[Te];
      }
      return V;
    }
    const B = /* @__PURE__ */ new Map(), te = /* @__PURE__ */ new Set();
    let ie = 0;
    function we(s, e) {
      o.value = o.value.map((t) => t.component_id === s ? xe(t, e.meta || {}, e.deleted || []) : t);
    }
    function je() {
      ie++, te.clear();
      for (const s of B.values()) s();
      B.clear();
    }
    function ae() {
      const s = new Set(o.value.map((t) => t.component_id).filter(Boolean));
      for (const [t, b] of B)
        s.has(t) || (b(), B.delete(t));
      const e = ie;
      for (const t of s) {
        if (B.has(t) || te.has(t)) continue;
        te.add(t);
        const b = lt(t, (V) => we(t, V), Ge);
        if (te.delete(t), !!b) {
          if (e !== ie || !o.value.some((V) => V.component_id === t)) {
            b();
            continue;
          }
          B.set(t, b);
        }
      }
    }
    function le(s, e) {
      ee.value = s, n.value = e, D.value = !0;
    }
    async function Ee(s) {
      j.value = s, u.value = !0, await Ke(), await Ne();
    }
    function Ae() {
      u.value = !1, j.value = null;
    }
    async function Ne() {
      const s = j.value;
      if (!L.value || !s) return;
      if (L.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Je("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const e = document.createElement("kickside-share");
      e.setAttribute("config", JSON.stringify({
        resource_id: s.component_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(s.component_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(s.component_id)}`,
        title: s.name || s.provider || "Connection"
      })), e.style.display = "block", e.addEventListener("close", Ae), L.value.appendChild(e);
    }
    function Re(s) {
      if (!s.provider || !r(s) || s.deleting_at) return;
      const e = _.value.find((t) => y(t) === s.provider);
      if (e?.credential_schema && !s.oauth && !e.create_ui_id) {
        x.value = s;
        return;
      }
      le(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function Me() {
      D.value = !1, n.value = void 0, o.value = [], U();
    }
    async function me(s) {
      if (k.value !== s.component_id) {
        k.value = s.component_id;
        return;
      }
      k.value = "", p.value = "";
      try {
        const { data: e } = await I.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        Pe(s.component_id, e), await U();
      } catch (e) {
        p.value = K(e);
      }
    }
    De(U), ve(je);
    const { acceptDeletion: Pe } = ct(o, (s) => s.component_id, void 0, U);
    return (s, e) => (h(), g("div", St, [
      i("header", xt, [
        i("div", wt, [
          $(l(N), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[5] || (e[5] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "Connections"),
          i("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        i("div", jt, [
          i("label", Et, [
            $(l(N), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            F(i("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => C.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [ge, C.value]
            ]),
            C.value ? (h(), g("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (t) => C.value = ""),
              "aria-label": "Clear search"
            }, [
              $(l(N), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : R("", !0)
          ]),
          $(l(Y), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (t) => le())
          }, {
            icon: se(() => [
              $(l(N), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      i("div", At, [
        v.value && !o.value.length ? (h(), g("div", Nt, "Loading…")) : E.value ? (h(), g("section", Rt, [
          i("div", Mt, [
            $(l(N), { icon: "tabler:plug-x" })
          ]),
          e[6] || (e[6] = i("div", { class: "e-title" }, "Couldn't load connections", -1)),
          i("div", Pt, P(E.value), 1),
          $(l(Y), {
            label: "Try again",
            class: "conn-retry",
            onClick: U
          }, {
            icon: se(() => [
              $(l(N), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (h(), g(H, { key: 2 }, [
          p.value ? (h(), g("div", Tt, [
            $(l(N), { icon: "tabler:alert-circle" }),
            z(P(p.value), 1)
          ])) : R("", !0),
          l(J).length ? (h(), g("section", Ot, [
            e[9] || (e[9] = i("div", { class: "block-head" }, [
              i("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            i("div", Lt, [
              (h(!0), g(H, null, pe(l(J), (t) => (h(), g("div", {
                key: t.component_id,
                class: ne(["live-card s-live", `state-${l(A)(t)}`])
              }, [
                $(ot, {
                  state: t,
                  onRetry: (b) => {
                    k.value = t.component_id, me(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                i("div", Dt, [
                  i("div", Ut, [
                    $(l(N), {
                      icon: l(d)(t),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  i("div", Bt, [
                    i("button", {
                      class: "lc-add",
                      title: `Share ${t.name || t.provider}`,
                      "aria-label": `Share ${t.name || t.provider}`,
                      onClick: (b) => Ee(t),
                      disabled: !!t.deleting_at
                    }, [
                      $(l(N), { icon: "tabler:share" })
                    ], 8, Vt),
                    t.oauth ? R("", !0) : (h(), g("button", {
                      key: 0,
                      class: "lc-add",
                      "aria-label": `Credentials ${t.name || t.provider}`,
                      title: `Credentials ${t.name || t.provider}`,
                      disabled: !!t.deleting_at,
                      onClick: (b) => x.value = t
                    }, [
                      $(l(N), {
                        icon: "tabler:key",
                        "aria-hidden": "true"
                      })
                    ], 8, It)),
                    l(r)(t) ? (h(), g("button", {
                      key: 1,
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (b) => Re(t),
                      disabled: !!t.deleting_at
                    }, [
                      $(l(N), { icon: "tabler:refresh" })
                    ], 8, Kt)) : R("", !0),
                    i("button", {
                      class: ne(["lc-add lc-danger", k.value === t.component_id && "armed"]),
                      title: k.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (b) => me(t),
                      disabled: !!t.deleting_at
                    }, [
                      $(l(N), {
                        icon: k.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, Ht)
                  ])
                ]),
                i("div", zt, P(t.name || t.provider || "Connection"), 1),
                i("div", Jt, P(l(Q)(t)), 1),
                i("div", {
                  class: ne(["lc-status", `state-${l(A)(t)}`])
                }, [
                  e[7] || (e[7] = i("span", { class: "dot" }, null, -1)),
                  i("span", Wt, P(l(M)(t)), 1),
                  l(Z)(t) ? (h(), g("span", qt, "· " + P(l(Z)(t)), 1)) : R("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            T.value || O.value ? (h(), g("div", Ft, [
              i("span", null, P(o.value.length) + " of " + P(T.value || o.value.length) + " loaded", 1),
              O.value ? (h(), g("button", {
                key: 0,
                class: "ghost-action",
                disabled: v.value || f.value,
                onClick: Ce
              }, [
                $(l(N), {
                  icon: f.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: ne(f.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[8] || (e[8] = z(" Load more ", -1))
              ], 8, Gt)) : R("", !0)
            ])) : R("", !0)
          ])) : !C.value && _.value.length ? (h(), g("section", Yt, [
            i("div", Zt, [
              $(l(N), { icon: "tabler:plug-connected" })
            ]),
            e[10] || (e[10] = i("div", { class: "e-title" }, "Connect your first app", -1)),
            e[11] || (e[11] = i("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : R("", !0),
          l(X).length ? (h(), g("section", Qt, [
            i("div", Xt, [
              i("h2", en, P(l(J).length ? "Add another" : "Available services"), 1)
            ]),
            i("div", tn, [
              (h(!0), g(H, null, pe(l(X), (t) => (h(), g("button", {
                key: l(y)(t),
                "data-provider-key": l(y)(t),
                class: "setup-card",
                onClick: (b) => le(l(y)(t))
              }, [
                i("div", on, [
                  $(l(N), {
                    icon: l(m)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                i("div", sn, [
                  i("div", rn, P(l(c)(t)), 1),
                  i("div", an, P(t.description || `Set up ${l(c)(t)}`), 1)
                ]),
                $(l(N), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, nn))), 128))
            ])
          ])) : C.value ? (h(), g("section", ln, [
            i("div", cn, [
              $(l(N), { icon: "tabler:search-off" })
            ]),
            i("div", dn, "No services match “" + P(C.value) + "”", 1)
          ])) : !_.value.length && !o.value.length ? (h(), g("section", un, [
            i("div", pn, [
              $(l(N), { icon: "tabler:plug-x" })
            ]),
            e[12] || (e[12] = i("div", { class: "e-title" }, "No providers available", -1)),
            e[13] || (e[13] = i("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : R("", !0)
        ], 64))
      ]),
      x.value ? (h(), ue(kt, {
        key: 0,
        connection: x.value,
        onClose: e[3] || (e[3] = (t) => x.value = null),
        onSaved: U
      }, null, 8, ["connection"])) : R("", !0),
      D.value ? (h(), ue(ze, {
        key: 1,
        providers: _.value,
        provider: ee.value,
        reauth: n.value,
        onClose: e[4] || (e[4] = (t) => D.value = !1),
        onConnected: Me
      }, null, 8, ["providers", "provider", "reauth"])) : R("", !0),
      u.value ? (h(), g("div", {
        key: 2,
        ref_key: "shareHost",
        ref: L
      }, null, 512)) : R("", !0)
    ]));
  }
}), kn = {
  rootComponent: vn,
  plugins: [Ue]
};
export {
  kn as mountConfig
};
//# sourceMappingURL=lazy-mount-DpoA5YMZ.js.map

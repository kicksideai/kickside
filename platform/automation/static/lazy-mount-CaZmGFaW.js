import { P as Vt } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as le, computed as E, openBlock as r, createElementBlock as f, withModifiers as Pe, Fragment as B, createElementVNode as o, createTextVNode as se, toDisplayString as h, createCommentVNode as C, createVNode as M, unref as n, watch as ge, onBeforeUnmount as Fe, createBlock as W, normalizeClass as G, withCtx as H, withDirectives as ce, isRef as qt, vModelText as Ue, renderList as X, vModelCheckbox as tt, vModelDynamic as Ht, ref as O, nextTick as Ne } from "vue";
import Z from "primevue/button";
import Bt from "primevue/progressspinner";
import { _ as Kt, e as Q, W as xe } from "./WcMount-Dv75Gn1l.js";
import { on as nt, api as oe, host as $e, loadByTagName as Wt } from "@wippy-fe/proxy";
import { Icon as L } from "@iconify/vue";
import ke from "primevue/dialog";
import at from "primevue/tag";
import { a as Yt, u as Gt, b as Jt } from "./wc-runtime-KO3cNuNo.js";
import { a as Zt, e as Qt, b as Xt, f as en, d as Je, v as tn, c as nn, u as an, i as sn } from "./install-form-6s2z0ljk.js";
import on from "primevue/select";
import { _ as rn } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
import { r as ln } from "./principals-Bury5BH3.js";
const un = { key: 0 }, cn = /* @__PURE__ */ le({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, a = E(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (s, i) => e.state.deleting_at ? (r(), f("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: i[1] || (i[1] = Pe(() => {
      }, ["stop"])),
      onKeydown: i[2] || (i[2] = Pe(() => {
      }, ["stop"]))
    }, [
      a.value ? (r(), f(B, { key: 0 }, [
        o("span", null, [
          i[3] || (i[3] = se("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (r(), f("span", un, ": " + h(e.state.deletion_job.last_error), 1)) : C("", !0)
        ]),
        M(n(Z), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: i[0] || (i[0] = Pe((l) => s.$emit("retry"), ["stop"]))
        })
      ], 64)) : (r(), f(B, { key: 1 }, [
        M(n(Bt), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        i[4] || (i[4] = o("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : C("", !0);
  }
}), dn = /* @__PURE__ */ Kt(cn, [["__scopeId", "data-v-63c136c7"]]);
function me(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function fn(e, t) {
  if (t == null) return t;
  switch (e) {
    case "boolean":
    case "checkbox":
      return typeof t == "boolean" ? t : t === "true" ? !0 : t === "false" ? !1 : t;
    case "number":
    case "integer": {
      if (typeof t == "number") return t;
      if (typeof t == "string" && t.trim() !== "") {
        const a = Number(t);
        if (!Number.isNaN(a)) return a;
      }
      return t;
    }
    case "object":
    case "array":
      if (typeof t == "string")
        try {
          const a = JSON.parse(t);
          if (a && typeof a == "object") return a;
        } catch {
        }
      return t;
    default:
      return t;
  }
}
function vn(e, t) {
  if (!t) return e;
  const a = {};
  for (const [s, i] of Object.entries(e))
    a[s] = fn(t[s], i);
  return a;
}
function st(e, t, a) {
  if (t !== void 0 && !t) return null;
  const s = me(e) ? e : {}, i = [
    s,
    me(s.data) ? s.data : null,
    me(s.payload) ? s.payload : null,
    me(s.detail) ? s.detail : null
  ].filter(Boolean);
  for (const l of i) {
    if (l.event !== "component.meta.changed" && l.event !== "component.deleting" && l.event !== "component.deleted") continue;
    const p = String(l.component_id || ""), y = String(s.topic || l.topic || "");
    if (t === void 0) {
      if (!p && (!y.startsWith("component.") || y === "component.")) continue;
    } else if (p && p !== t || !p && y !== `component.${t}`) continue;
    const I = p || t || y.slice(10);
    return l.event === "component.deleting" && typeof l.deletion_job_id == "string" && l.deletion_job_id ? { event: l.event, component_id: I, deletion_job_id: l.deletion_job_id } : l.event !== "component.meta.changed" ? { event: l.event, component_id: I } : {
      event: "component.meta.changed",
      component_id: I,
      meta: vn(me(l.meta) ? l.meta : {}, a),
      deleted: Array.isArray(l.deleted) ? l.deleted.map(String) : []
    };
  }
  return null;
}
function pn(e, t, a) {
  const s = st(e, t, a);
  return s?.event === "component.meta.changed" ? s : null;
}
function mn(e, t) {
  const a = st(e, t);
  return a && a.event !== "component.meta.changed" ? a : null;
}
function yn(e, t, a) {
  if (!e) return null;
  const s = nt(`component.${e}`, (i) => {
    const l = pn(i, e, a);
    l && t(l);
  });
  return typeof s == "function" ? s : null;
}
function bn(e, t, a, s) {
  let i = !0;
  const l = /* @__PURE__ */ new Set(), p = /* @__PURE__ */ new Map();
  function y(g, c) {
    const v = e.value.find((Y) => t(Y) === g), k = p.get(g), D = c?.job_id || k?.deletion_job_id || v?.deletion_job_id, z = k ? k.deletion_job_id : v?.deleting_at ? v.deletion_job_id : void 0;
    if ((k || v?.deleting_at) && D === z) return;
    const J = {
      deleting_at: k?.deleting_at || v?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: D
    };
    p.set(g, J), v && (Object.assign(v, J), v.deletion_job = void 0);
  }
  async function I(g) {
    const c = t(g), v = p.get(c), k = () => i && e.value.includes(g) && p.get(c) === v;
    try {
      const { data: D } = await oe.get(`/api/v1/components/${encodeURIComponent(c)}`);
      if (!D?.success) throw new Error(Q(D, "Could not read deletion progress"));
      k() && (g.deleting_at = v?.deleting_at || D.deleting_at, g.deletion_job_id = D.deletion_job_id, v && (v.deletion_job_id = g.deletion_job_id), g.deletion_job = D.deletion_job ?? null);
    } catch (D) {
      k() && $e.handleError("other", { message: Q(D, "Could not read deletion progress") });
    }
  }
  let m = [];
  const N = ge(() => e.value, (g, c = []) => {
    const v = g.filter((k) => !l.has(t(k)));
    for (const k of c)
      l.has(t(k)) || v.some((D) => t(D) === t(k)) || k.deleting_at;
    if (v.length !== g.length) {
      e.value = v;
      return;
    }
    for (const k of g) {
      const D = p.get(t(k));
      D && (k.deletion_job_id !== D.deletion_job_id && (k.deletion_job = void 0), Object.assign(k, D));
      const z = c.find((J) => t(J) === t(k));
      k.deletion_job === void 0 && z?.deletion_job_id === k.deletion_job_id && (k.deletion_job = z?.deletion_job), k.deleting_at && !m.includes(k) && I(k);
    }
    m = g;
  }, { immediate: !0 }), S = nt("@message", (g) => {
    const c = mn(g);
    if (!c) return;
    const v = e.value.find((k) => t(k) === c.component_id);
    c.event === "component.deleted" ? (v && l.has(c.component_id), l.add(c.component_id), p.delete(c.component_id), e.value = e.value.filter((k) => t(k) !== c.component_id)) : v && y(c.component_id, { job_id: c.deletion_job_id });
  });
  return Fe(() => {
    i = !1, N(), typeof S == "function" && S();
  }), { acceptDeletion: y };
}
function _n(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const a = e.trim();
    if (/^\d+$/.test(a))
      t = Number(a);
    else {
      const s = Date.parse(a);
      return Number.isNaN(s) ? null : s;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function ie(e, t) {
  const a = _n(e);
  if (a === null) return "";
  const s = t?.now ?? Date.now(), i = t?.suffix ?? !0, l = t?.maxUnit ?? "day", p = t?.future ?? !1, y = 6e4, I = 60 * y, m = 24 * I, N = 30 * m, S = 365 * m, g = s - a;
  if (p && g < 0) {
    const k = -g;
    return k < y ? "in <1m" : k < I ? `in ${Math.floor(k / y)}m` : k < m ? `in ${Math.floor(k / I)}h` : `in ${Math.floor(k / m)}d`;
  }
  const c = Math.max(0, g);
  if (c < y) return "just now";
  const v = i ? " ago" : "";
  return c < I ? `${Math.floor(c / y)}m${v}` : c < m ? `${Math.floor(c / I)}h${v}` : l === "year" ? c < N ? `${Math.floor(c / m)}d${v}` : c < S ? `${Math.floor(c / N)}mo${v}` : `${Math.floor(c / S)}y${v}` : `${Math.floor(c / m)}d${v}`;
}
function Le(e) {
  return String(e.description || "").trim();
}
function it(e) {
  const t = e?.tag_name;
  return typeof t == "string" ? t.trim() : "";
}
function ot(e) {
  const t = typeof e?.base_path == "string" ? e.base_path.trim() : "", a = typeof e?.entry_point == "string" ? e.entry_point.trim() : "";
  return t && a ? `/${t}/${a}` : typeof e?.url == "string" ? e.url.trim() : "";
}
function Oe(e) {
  return it(e?.component?.create_ui);
}
function kn(e) {
  return ot(e?.component?.create_ui);
}
function ze(e) {
  return it(e?.component?.manage_ui);
}
function rt(e) {
  return ot(e?.component?.manage_ui);
}
function lt(e, t) {
  return { id: e.id, automation: e, public_state: e.public_state || {}, type: t };
}
let Ze = 0;
function hn(e) {
  e && (Ze += 1, e.setAttribute("submit-nonce", String(Ze)));
}
const gn = { class: "kx-modal-head-icon" }, xn = { class: "kx-modal-head-text" }, $n = { class: "kx-modal-head-title" }, wn = {
  key: 0,
  class: "kx-2p-l"
}, Cn = { class: "kx-cat-search" }, Sn = {
  key: 0,
  class: "kx-cat-empty"
}, Rn = {
  key: 1,
  class: "kx-cat"
}, Mn = ["onClick"], An = { class: "kx-cat-ico" }, In = { class: "kx-cat-text" }, Dn = { class: "kx-cat-name" }, Tn = {
  key: 0,
  class: "kx-cat-desc"
}, En = { class: "kx-2p-r" }, Pn = {
  key: 0,
  class: "kx-2p-r-head"
}, Nn = { class: "kx-2p-r-body" }, jn = {
  key: 0,
  class: "kx-2p-r-note"
}, Un = {
  key: 1,
  class: "kx-2p-r-note"
}, Ln = {
  key: 2,
  class: "kx-form"
}, On = { class: "kx-field-lbl" }, Fn = {
  key: 0,
  class: "kx-req",
  "aria-hidden": "true"
}, zn = ["onUpdate:modelValue"], Vn = ["onUpdate:modelValue"], qn = ["onUpdate:modelValue", "type", "placeholder"], Hn = {
  key: 4,
  class: "kx-field-hint"
}, Bn = {
  key: 5,
  class: "kx-field-hint"
}, Kn = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, Wn = /* @__PURE__ */ le({
  __name: "InstallDialog",
  props: {
    flow: {},
    componentMode: { type: Boolean },
    dialogPt: {}
  },
  setup(e) {
    const t = e, {
      showTypeCatalog: a,
      installFields: s,
      showInstall: i,
      installType: l,
      installForm: p,
      installing: y,
      customSaving: I,
      installError: m,
      customInstallHost: N,
      installSearchInput: S,
      typeSearch: g,
      filteredTypes: c,
      chooseType: v,
      closeInstall: k,
      focusInstallDialog: D,
      onCreate: z
    } = t.flow;
    return (J, Y) => (r(), W(n(ke), {
      visible: n(i),
      modal: !0,
      "block-scroll": !0,
      "dismissable-mask": !0,
      pt: e.dialogPt,
      class: G(["kx-modal kx-modal-2p", { "kx-modal-solo": !n(a) }]),
      "aria-label": "Add an automation",
      "onUpdate:visible": Y[1] || (Y[1] = (T) => {
        T || n(k)();
      }),
      onShow: n(D)
    }, {
      header: H(() => [
        o("span", gn, [
          M(n(L), {
            icon: n(l) && n(l).icon || "tabler:bolt",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        o("span", xn, [
          o("span", $n, h(n(l) ? n(l).title || n(l).name : "Add an automation"), 1),
          Y[2] || (Y[2] = o("span", { class: "kx-modal-head-sub" }, "Configure an automation.", -1))
        ])
      ]),
      footer: H(() => [
        n(m) ? (r(), f("div", Kn, h(n(m)), 1)) : C("", !0),
        M(n(Z), {
          type: "button",
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: n(y) || n(I),
          onClick: n(k)
        }, null, 8, ["disabled", "onClick"]),
        n(l) ? (r(), W(n(Z), {
          key: 1,
          type: "button",
          "data-testid": "automations-install-create",
          label: n(y) || n(I) ? "Creating…" : "Create",
          loading: n(y) || n(I),
          disabled: n(y) || n(I),
          onClick: n(z)
        }, {
          icon: H(({ class: T }) => [
            M(n(L), {
              icon: "tabler:plus",
              class: G(T),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }, 8, ["label", "loading", "disabled", "onClick"])) : C("", !0)
      ]),
      default: H(() => [
        o("div", {
          class: G(["kx-2p", { "kx-2p-solo": !n(a) }])
        }, [
          n(a) ? (r(), f("div", wn, [
            o("div", Cn, [
              M(n(L), {
                icon: "tabler:search",
                "aria-hidden": "true"
              }),
              ce(o("input", {
                ref_key: "installSearchInput",
                ref: S,
                "onUpdate:modelValue": Y[0] || (Y[0] = (T) => qt(g) ? g.value = T : null),
                "data-modal-initial": "",
                type: "text",
                placeholder: "Search types…",
                "aria-label": "Search automation types"
              }, null, 512), [
                [Ue, n(g)]
              ])
            ]),
            n(c).length ? (r(), f("div", Rn, [
              (r(!0), f(B, null, X(n(c), (T) => (r(), f("button", {
                key: T.id,
                class: G(["kx-cat-card", n(l)?.id === T.id && "sel"]),
                onClick: (V) => n(v)(T)
              }, [
                o("span", An, [
                  M(n(L), {
                    icon: T.icon || "tabler:sparkles",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                o("span", In, [
                  o("span", Dn, h(T.title || T.name), 1),
                  n(Le)(T) ? (r(), f("span", Tn, h(n(Le)(T)), 1)) : C("", !0)
                ]),
                M(n(L), {
                  icon: "tabler:check",
                  class: "kx-cat-check",
                  "aria-hidden": "true"
                })
              ], 10, Mn))), 128))
            ])) : (r(), f("div", Sn, "No setups match “" + h(n(g)) + "”.", 1))
          ])) : C("", !0),
          o("div", En, [
            n(a) ? (r(), f("div", Pn, "Setup")) : C("", !0),
            o("div", Nn, [
              n(l) ? (r(), f(B, { key: 1 }, [
                n(Oe)(n(l)) ? (r(), f("div", {
                  key: 0,
                  ref_key: "customInstallHost",
                  ref: N,
                  class: "kx-custom-host"
                }, null, 512)) : n(s).length ? (r(), f("div", Ln, [
                  (r(!0), f(B, null, X(n(s), ([T, V]) => (r(), f("label", {
                    key: T,
                    class: "kx-field"
                  }, [
                    o("span", On, [
                      se(h(V.title || T) + " ", 1),
                      n(Zt)(n(l), T) ? (r(), f("span", Fn, "*")) : C("", !0)
                    ]),
                    V.enum ? (r(), W(n(on), {
                      key: 0,
                      class: "kx-select",
                      "model-value": n(p)[T],
                      options: n(Qt)(n(l), T, V),
                      "option-label": "label",
                      "option-value": "value",
                      placeholder: "—",
                      "aria-label": V.title || T,
                      "onUpdate:modelValue": (x) => n(p)[T] = x
                    }, null, 8, ["model-value", "options", "aria-label", "onUpdate:modelValue"])) : V.type === "boolean" ? ce((r(), f("input", {
                      key: 1,
                      "onUpdate:modelValue": (x) => n(p)[T] = x,
                      class: "kx-check",
                      type: "checkbox"
                    }, null, 8, zn)), [
                      [tt, n(p)[T]]
                    ]) : V.type === "number" || V.type === "integer" ? ce((r(), f("input", {
                      key: 2,
                      "onUpdate:modelValue": (x) => n(p)[T] = x,
                      class: "kx-input",
                      type: "number"
                    }, null, 8, Vn)), [
                      [
                        Ue,
                        n(p)[T],
                        void 0,
                        { number: !0 }
                      ]
                    ]) : ce((r(), f("input", {
                      key: 3,
                      "onUpdate:modelValue": (x) => n(p)[T] = x,
                      class: "kx-input",
                      type: n(Xt)(V),
                      placeholder: V.description || ""
                    }, null, 8, qn)), [
                      [Ht, n(p)[T]]
                    ]),
                    V.description && !(V.type !== "boolean" && !V.enum) ? (r(), f("span", Hn, h(V.description), 1)) : V.description && V.enum ? (r(), f("span", Bn, h(V.description), 1)) : C("", !0)
                  ]))), 128))
                ])) : (r(), f("div", Un, "This automation needs no configuration."))
              ], 64)) : (r(), f("p", jn, "Select an automation type to configure it."))
            ])
          ])
        ], 2)
      ]),
      _: 1
    }, 8, ["visible", "pt", "class", "onShow"]));
  }
}), Yn = {
  key: 0,
  class: "kx-metrics"
}, Gn = { class: "kx-metric-k" }, Jn = ["title"], Zn = {
  key: 1,
  class: "kx-metric-details"
}, Qn = { class: "kx-metrics kx-metrics-detail" }, Xn = { class: "kx-metric-k" }, ea = ["title"], ta = /* @__PURE__ */ le({
  __name: "RowMetrics",
  props: {
    face: { default: () => [] },
    detail: { default: () => [] }
  },
  setup(e) {
    return (t, a) => (r(), f(B, null, [
      e.face.length ? (r(), f("div", Yn, [
        (r(!0), f(B, null, X(e.face, (s) => (r(), f("span", {
          key: s.label,
          class: "kx-metric"
        }, [
          s.icon ? (r(), W(n(L), {
            key: 0,
            icon: s.icon,
            class: "kx-metric-i",
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : C("", !0),
          o("span", Gn, h(s.label), 1),
          o("span", {
            class: "kx-metric-v",
            title: s.title
          }, h(s.value), 9, Jn)
        ]))), 128))
      ])) : C("", !0),
      e.detail.length ? (r(), f("details", Zn, [
        a[0] || (a[0] = o("summary", { class: "kx-metric-more" }, "Details", -1)),
        o("div", Qn, [
          (r(!0), f(B, null, X(e.detail, (s) => (r(), f("span", {
            key: s.label,
            class: "kx-metric"
          }, [
            s.icon ? (r(), W(n(L), {
              key: 0,
              icon: s.icon,
              class: "kx-metric-i",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : C("", !0),
            o("span", Xn, h(s.label), 1),
            o("span", {
              class: "kx-metric-v",
              title: s.title
            }, h(s.value), 9, ea)
          ]))), 128))
        ])
      ])) : C("", !0)
    ], 64));
  }
}), na = /* @__PURE__ */ new Set(["pause", "resume"]), aa = /* @__PURE__ */ new Set(["reconfigure"]), Qe = /* @__PURE__ */ new Set(["run_now", "trigger", "execute", "run"]), je = {
  run_now: { label: "Run now", description: "Wake the drive to process available work. Paused drives stay paused.", group: "run", icon: "tabler:player-play" },
  discard: { label: "Discard", description: "Select uncertain item keys to discard them.", group: "recovery", icon: "tabler:trash" },
  trigger: { label: "Run now", description: "Run this automation immediately.", group: "run", icon: "tabler:player-play" },
  execute: { label: "Run now", description: "Run this automation immediately.", group: "run", icon: "tabler:player-play" },
  run: { label: "Run now", description: "Run this automation immediately.", group: "run", icon: "tabler:player-play" },
  rewind: { label: "Rewind & reprocess", description: "Reset progress to the start and re-drain every item.", group: "recovery", icon: "tabler:rotate-clockwise-2", warn: !0 },
  resync: { label: "Resync", description: "Reset source progress and reconcile from scratch.", group: "recovery", icon: "tabler:refresh", warn: !0 },
  replay: { label: "Replay", description: "Retry failed, uncertain, or waiting items.", group: "recovery", icon: "tabler:player-track-next", warn: !0 },
  reconcile: { label: "Reconcile", description: "Recompute state against the source of truth.", group: "recovery", icon: "tabler:adjustments-check" },
  status: { label: "Refresh status", description: "Fetch the latest run status now.", group: "recovery", icon: "tabler:activity-heartbeat" }
};
function ut(e) {
  return e.has("run_now") ? "run_now" : e.has("trigger") ? "trigger" : e.has("execute") ? "execute" : "";
}
function sa(e) {
  return e.replace(/[._-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Xe(e) {
  return { label: sa(e), description: "Run this action.", group: "recovery", icon: "tabler:bolt" };
}
function ct(e) {
  return new Set([...e?.controls || [], ...e?.actions || []].map((t) => t.name).filter(Boolean));
}
function dt(e) {
  const t = [...ct(e)], a = !!ze(e);
  return {
    declared: t,
    requiresKeys: e?.controls?.filter((s) => s.keys_required).map((s) => s.name),
    runNow: ut(new Set(t)),
    canReconfigure: a,
    // An automation is a component, so it shares through the generic component
    // access endpoints; the server is the authority on who may grant.
    canShare: !0,
    canExport: e?.exportable === !0,
    canDelete: !0
  };
}
function ft(e) {
  const t = e instanceof Set ? e : new Set(e);
  return t.has("rewind") ? "rewind" : t.has("resync") ? "resync" : "";
}
function vt(e) {
  const t = [];
  if (e.runNow) {
    const s = je[e.runNow] || je.trigger;
    t.push({ method: e.runNow, ...s, kind: "call" });
  }
  const a = /* @__PURE__ */ new Set();
  for (const s of e.declared) {
    if (na.has(s) || s === e.runNow || e.runNow !== "run_now" && Qe.has(s) || aa.has(s) || a.has(s)) continue;
    a.add(s);
    const i = e.runNow === "run_now" && Qe.has(s) ? { ...Xe(s), group: "run" } : je[s] || Xe(s);
    t.push({ method: s, ...i, kind: "call", disabled: e.requiresKeys?.includes(s) });
  }
  return e.canReconfigure && t.push({ method: "reconfigure", label: "Reconfigure", description: "Change how this automation is set up.", group: "edit", icon: "tabler:settings", kind: "reconfigure" }), e.canShare && t.push({ method: "share", label: "Share", description: "Give other people access to this automation.", group: "edit", icon: "tabler:users", kind: "share" }), e.canExport && t.push({ method: "export", label: "Export", description: "Download a portable copy to import elsewhere.", group: "edit", icon: "tabler:download", kind: "export" }), e.canDelete && t.push({ method: "delete", label: "Delete", description: "Stop it and remove its setup. This cannot be undone.", group: "delete", icon: "tabler:trash", kind: "delete", danger: !0 }), t;
}
const ia = ["run", "recovery", "edit", "delete"], oa = {
  run: "Run",
  recovery: "Recovery",
  edit: "Edit",
  delete: ""
};
function ra(e) {
  return ia.map((t) => ({ group: t, label: oa[t], items: e.filter((a) => a.group === t) })).filter((t) => t.items.length > 0);
}
function la(e, t) {
  return e.group === "run" ? `Run ${t} now` : e.method === "reconfigure" ? `Edit ${t}` : `${e.label} ${t}`;
}
const ua = ["aria-label"], ca = {
  key: 1,
  class: "kx-menu-sep",
  role: "separator"
}, da = ["data-testid", "aria-label", "disabled", "onClick"], fa = { class: "kx-menu-item-body" }, va = { class: "kx-menu-item-label" }, pa = { class: "kx-menu-item-desc" }, pt = /* @__PURE__ */ le({
  __name: "ActionMenu",
  props: {
    items: {},
    name: {},
    busy: { type: Boolean },
    disabled: { type: Boolean },
    size: {},
    triggerLabel: {}
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const a = e, s = t, i = O(!1), l = O(null), p = E(() => ra(a.items));
    function y() {
      i.value = !i.value;
    }
    function I() {
      i.value = !1;
    }
    function m(N) {
      a.disabled || N.disabled || (I(), s("select", N.method));
    }
    return (N, S) => (r(), f("span", {
      ref_key: "trigger",
      ref: l,
      class: "kx-menu"
    }, [
      M(n(Z), {
        type: "button",
        severity: "secondary",
        outlined: "",
        size: e.size === "normal" ? void 0 : "small",
        class: G(["kx-menu-trigger", i.value && "is-active"]),
        "aria-haspopup": !0,
        "aria-expanded": i.value,
        "aria-label": e.triggerLabel || `More actions for ${e.name}`,
        title: "More actions",
        disabled: e.disabled,
        onClick: y
      }, {
        icon: H(({ class: g }) => [
          M(n(L), {
            icon: "tabler:dots",
            "aria-hidden": "true",
            class: G(g)
          }, null, 8, ["class"])
        ]),
        _: 1
      }, 8, ["size", "class", "aria-expanded", "aria-label", "disabled"]),
      M(rn, {
        open: i.value,
        "onUpdate:open": S[0] || (S[0] = (g) => i.value = g),
        anchor: l.value,
        align: "right",
        width: 264,
        "max-height": 460,
        gap: 6
      }, {
        default: H(() => [
          o("div", {
            class: "kx-menu-panel",
            role: "menu",
            "aria-label": `Actions for ${e.name}`
          }, [
            (r(!0), f(B, null, X(p.value, (g, c) => (r(), f(B, {
              key: g.group
            }, [
              g.label ? (r(), f("div", {
                key: 0,
                class: G(["kx-menu-group", c === 0 && "is-first"])
              }, h(g.label), 3)) : c > 0 ? (r(), f("div", ca)) : C("", !0),
              (r(!0), f(B, null, X(g.items, (v) => (r(), f("button", {
                key: v.method,
                type: "button",
                role: "menuitem",
                class: G(["kx-menu-item", [v.danger && "is-danger", v.warn && "is-warn"]]),
                "data-testid": `action-${v.method}`,
                "aria-label": n(la)(v, e.name),
                disabled: e.disabled || v.disabled || e.busy && v.kind === "call",
                onClick: (k) => m(v)
              }, [
                M(n(L), {
                  icon: v.icon,
                  class: "kx-menu-item-ico",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                o("span", fa, [
                  o("span", va, [
                    se(h(v.label) + " ", 1),
                    v.warn ? (r(), W(n(L), {
                      key: 0,
                      icon: "tabler:alert-triangle",
                      class: "kx-menu-item-warn",
                      "aria-hidden": "true"
                    })) : C("", !0)
                  ]),
                  o("span", pa, h(v.description), 1)
                ])
              ], 10, da))), 128))
            ], 64))), 128))
          ], 8, ua)
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 512));
  }
}), ma = {
  "aria-label": "Execution history",
  class: "kx-history"
}, ya = {
  key: 0,
  role: "status",
  class: "kx-dnote"
}, ba = {
  key: 1,
  role: "alert",
  class: "kx-dnote kx-dnote-err"
}, _a = { class: "kx-history-group" }, ka = {
  key: 0,
  class: "kx-dnote"
}, ha = { class: "kx-history-head" }, ga = ["title"], xa = { class: "kx-history-state" }, $a = { class: "kx-history-meta" }, wa = { class: "kx-history-meta" }, Ca = {
  key: 0,
  class: "kx-history-kv"
}, Sa = ["title"], Ra = ["title"], Ma = {
  key: 1,
  class: "kx-dmsg is-err"
}, Aa = { class: "kx-history-group" }, Ia = {
  key: 0,
  class: "kx-dnote"
}, Da = { class: "kx-history-head" }, Ta = { class: "kx-history-state" }, Ea = { class: "kx-history-meta" }, Pa = {
  key: 0,
  class: "kx-history-kv"
}, Na = ["title"], ja = {
  key: 1,
  class: "kx-history-meta"
}, Ua = /* @__PURE__ */ le({
  __name: "ExecutionHistory",
  props: {
    root: {}
  },
  emits: ["error"],
  setup(e, { emit: t }) {
    const a = e, s = t, i = O([]), l = O([]), p = O([]), y = O(""), I = O(""), m = O(!1), N = O("");
    let S = 0;
    function g() {
      i.value = [], l.value = [], p.value = [], y.value = "", I.value = "";
    }
    function c(x) {
      return p.value.find((A) => A.type === x?.kind && A.id === x?.id)?.label || "Account unavailable";
    }
    function v(x) {
      return {
        recorded: "Recorded admission",
        absent: "Identity evidence absent",
        inferred: "Identity evidence inferred; unverified",
        unresolved: "Identity unresolved"
      }[x.evidence_status];
    }
    function k(x) {
      return JSON.stringify([x.drive_key, x.round_token, x.source_port, x.item_key, x.identity_key]);
    }
    function D(x) {
      return Q(x, typeof x == "string" ? x : "");
    }
    async function z(x, A, w = "") {
      const { data: j } = await oe.get(
        "/api/v1/automations/" + encodeURIComponent(x) + "/history",
        { params: { kind: A, page_size: 25, ...w ? { page_token: w } : {} } }
      );
      if (!j.success || j.kind !== A || !Array.isArray(j.entries)) throw new Error(j.error?.message || "Could not read execution history");
      if (j.next_page_token && j.next_page_token === w) throw new Error("History page repeats its cursor");
      return j;
    }
    async function J(x, A) {
      const w = /* @__PURE__ */ new Map();
      function j(U) {
        U && (U.kind === "user" || U.kind === "group") && w.set(U.kind + ":" + U.id, { type: U.kind, id: U.id });
      }
      for (const U of x)
        j(U.evidence?.identity?.principal), j(U.evidence?.identity?.authorized_by);
      for (const U of A)
        U.initiation && j({ kind: "user", id: U.initiation.actor_id });
      return ln([...w.values()]);
    }
    function Y(x) {
      g(), N.value = Q(x, "Could not read execution history"), s("error", { message: N.value, error: x });
    }
    async function T() {
      const x = ++S, A = a.root;
      if (g(), N.value = "", m.value = !1, !!A) {
        m.value = !0;
        try {
          const [w, j] = await Promise.all([z(A, "deliveries"), z(A, "controls")]), U = await J(w.entries, j.entries);
          if (x !== S) return;
          i.value = w.entries, l.value = j.entries, p.value = U, y.value = w.next_page_token || "", I.value = j.next_page_token || "";
        } catch (w) {
          x === S && Y(w);
        } finally {
          x === S && (m.value = !1);
        }
      }
    }
    async function V(x) {
      if (m.value) return;
      const A = S, w = a.root, j = x === "deliveries" ? y.value : I.value;
      if (j) {
        m.value = !0, N.value = "";
        try {
          const U = await z(w, x, j), u = x === "deliveries" ? [...i.value, ...U.entries] : i.value, P = x === "controls" ? [...l.value, ...U.entries] : l.value, F = await J(u, P);
          if (A !== S) return;
          i.value = u, l.value = P, p.value = F, x === "deliveries" ? y.value = U.next_page_token || "" : I.value = U.next_page_token || "";
        } catch (U) {
          A === S && Y(U);
        } finally {
          A === S && (m.value = !1);
        }
      }
    }
    return ge(() => a.root, () => {
      T();
    }, { immediate: !0 }), Fe(() => {
      S += 1;
    }), (x, A) => (r(), f("section", ma, [
      m.value ? (r(), f("p", ya, "Loading execution history…")) : C("", !0),
      N.value ? (r(), f("p", ba, h(N.value), 1)) : (r(), f(B, { key: 2 }, [
        o("div", _a, [
          A[4] || (A[4] = o("h3", { class: "kx-dsub-lbl" }, "Committed deliveries", -1)),
          !m.value && !i.value.length ? (r(), f("p", ka, "No retained deliveries.")) : C("", !0),
          (r(!0), f(B, null, X(i.value, (w) => (r(), f("article", {
            key: k(w),
            class: "kx-history-entry"
          }, [
            o("div", ha, [
              o("strong", {
                class: "kx-history-title",
                title: w.item_key
              }, h(w.item_key), 9, ga),
              o("span", xa, h(w.state), 1)
            ]),
            o("p", $a, "Round starts " + h(n(ie)(w.round_at, { future: !0 })), 1),
            o("p", wa, h(v(w)), 1),
            w.evidence?.identity ? (r(), f("dl", Ca, [
              A[3] || (A[3] = o("dt", { class: "kx-dfact-k" }, "Executor", -1)),
              o("dd", {
                class: "kx-history-v",
                title: w.evidence.identity.principal.id,
                "aria-label": "Historical executor"
              }, h(c(w.evidence.identity.principal)), 9, Sa),
              w.evidence.identity.authorized_by ? (r(), f(B, { key: 0 }, [
                A[2] || (A[2] = o("dt", { class: "kx-dfact-k" }, "Authorized by", -1)),
                o("dd", {
                  class: "kx-history-v",
                  title: w.evidence.identity.authorized_by.id,
                  "aria-label": "Historical authorizer"
                }, h(c(w.evidence.identity.authorized_by)), 9, Ra)
              ], 64)) : C("", !0)
            ])) : C("", !0),
            D(w.error) ? (r(), f("p", Ma, h(D(w.error)), 1)) : C("", !0)
          ]))), 128)),
          y.value ? (r(), W(n(Z), {
            key: 1,
            label: "More deliveries",
            severity: "secondary",
            disabled: m.value,
            onClick: A[0] || (A[0] = (w) => V("deliveries"))
          }, null, 8, ["disabled"])) : C("", !0)
        ]),
        o("div", Aa, [
          A[6] || (A[6] = o("h3", { class: "kx-dsub-lbl" }, "Control requests", -1)),
          A[7] || (A[7] = o("p", { class: "kx-dnote" }, "Control requests and delivery admission are independent records.", -1)),
          !m.value && !l.value.length ? (r(), f("p", Ia, "No retained control requests.")) : C("", !0),
          (r(!0), f(B, null, X(l.value, (w) => (r(), f("article", {
            key: `${w.generation}:${w.request_id}`,
            class: "kx-history-entry"
          }, [
            o("div", Da, [
              o("span", Ta, h(w.state), 1)
            ]),
            o("p", Ea, "Requested " + h(n(ie)(w.created_at, { future: !0 })), 1),
            w.initiation ? (r(), f("dl", Pa, [
              A[5] || (A[5] = o("dt", { class: "kx-dfact-k" }, "Initiated by", -1)),
              o("dd", {
                class: "kx-history-v",
                title: w.initiation.actor_id,
                "aria-label": "Control initiator"
              }, h(c({ kind: "user", id: w.initiation.actor_id })), 9, Na)
            ])) : (r(), f("p", ja, "Initiator not recorded."))
          ]))), 128)),
          I.value ? (r(), W(n(Z), {
            key: 1,
            label: "More control requests",
            severity: "secondary",
            disabled: m.value,
            onClick: A[1] || (A[1] = (w) => V("controls"))
          }, null, 8, ["disabled"])) : C("", !0)
        ])
      ], 64))
    ]));
  }
});
function be(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function La(e) {
  return be(e) && typeof e.code == "string" && typeof e.message == "string" && typeof e.at == "string" && (e.item_key === void 0 || typeof e.item_key == "string");
}
function Oa(e) {
  if (!be(e) || typeof e.drive_key != "string") return !1;
  for (const t of ["source_kind", "phase"])
    if (e[t] !== void 0 && typeof e[t] != "string") return !1;
  if (e.enabled !== void 0 && typeof e.enabled != "boolean") return !1;
  for (const t of ["next_run_at", "last_run_at", "last_round_at"])
    if (e[t] !== void 0 && e[t] !== null && typeof e[t] != "string") return !1;
  for (const t of ["unresolved_count", "uncertain_count"])
    if (e[t] !== void 0 && (typeof e[t] != "number" || !Number.isInteger(e[t]) || e[t] < 0)) return !1;
  return !(e.last_error !== void 0 && e.last_error !== null && (!be(e.last_error) || e.last_error.message !== void 0 && typeof e.last_error.message != "string"));
}
function Fa(e) {
  if (!be(e) || e.success !== !0 || !Array.isArray(e.drives) || !e.drives.every(Oa) || e.next_page_token !== void 0 && e.next_page_token !== null && (typeof e.next_page_token != "string" || !e.next_page_token)) return !1;
  const t = e.delivery_failures;
  return t === void 0 || be(t) && typeof t.count == "number" && Number.isInteger(t.count) && t.count >= 0 && (t.last_error === void 0 || La(t.last_error));
}
const mt = {
  blocked_identity: "The account this automation runs as needs to be confirmed.",
  blocked_access: "This automation lost access to something it uses.",
  blocked_declaration: "This automation's settings need to be fixed."
};
function Ce(e) {
  return (e?.drives || []).filter((t) => t.source_kind !== "none");
}
function he(e) {
  return e.enabled === !1 || e.phase === "paused";
}
function et(e) {
  return (e.source_kind === "timer" || e.source_kind === "collection") && (e.phase === "pending" || e.phase === "active") && typeof e.next_run_at == "string" && Date.parse(e.next_run_at) > Date.now();
}
function za(e) {
  const t = Ce(e), a = (e?.delivery_failures?.count || 0) > 0;
  if (!t.length) return a ? { kind: "warn", label: "Needs attention" } : null;
  if (t.some((i) => (i.phase || "") in mt)) return { kind: "warn", label: "Needs attention" };
  if (t.every(he)) return { kind: "off", label: "Paused" };
  if (a) return { kind: "warn", label: "Needs attention" };
  if (t.some((i) => i.phase === "degraded")) return { kind: "warn", label: "Retrying" };
  if (t.some((i) => i.phase === "backpressure")) return { kind: "live", label: "Catching up" };
  if (t.some((i) => !he(i) && i.phase === "pending" && !et(i))) return { kind: "neutral", label: "Starting" };
  const s = t.filter((i) => !he(i) && i.source_kind !== "reconcile");
  return s.length && s.every(et) ? { kind: "on", label: "Scheduled" } : { kind: "on", label: "Active" };
}
function Va(e) {
  const t = e?.delivery_failures?.last_error;
  if (t) return `${t.code}: ${t.message}`;
  const a = Ce(e);
  for (const s of a) {
    const i = mt[s.phase || ""];
    if (i) return i;
  }
  for (const s of a) {
    if (s.phase !== "degraded") continue;
    return (typeof s.last_error?.message == "string" ? s.last_error.message.trim() : "") || "The last run failed; it is retrying.";
  }
  return "";
}
function qa(e) {
  const t = Ce(e), a = [], s = ye(e).next;
  s && a.push({ label: "Next run", value: s, time: !0 });
  const i = t.reduce((l, p) => l + (p.unresolved_count || 0), 0);
  return i > 0 && a.push({ label: "Waiting to retry", value: `${i} ${i === 1 ? "item" : "items"}` }), a;
}
function ye(e) {
  const t = Ce(e), a = t.map((i) => i.last_run_at).filter((i) => typeof i == "string" && !!i).sort().at(-1), s = t.filter((i) => !he(i)).map((i) => i.next_run_at).filter((i) => typeof i == "string" && !!i).sort()[0];
  return { last: a, next: s };
}
const Ha = /* @__PURE__ */ new Set(["status", "enabled", "last_error", "last_run_at", "next_run_at"]);
function Ba(e) {
  return e.replace(/_/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Ka(e) {
  return e.replace(/\b\w/g, (t) => t.toUpperCase());
}
function Wa(e) {
  return e && e.charAt(0).toUpperCase() + e.slice(1);
}
function Ya(e, t) {
  if (e.type === "boolean") return t === !0 ? "Yes" : "No";
  const a = String(t);
  return e.key.endsWith("_at") || /^\d{4}-\d{2}-\d{2}T/.test(a) ? ie(a, { future: !0 }) || a : e.type === "text" ? Wa(a) : a;
}
function yt(e) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e) || /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(e) ? !0 : /^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9:_-]*$/i.test(e) && /:[0-9a-f-]{6,}/i.test(e);
}
function Ga(e) {
  return yt(e) ? { text: e.length > 12 ? `${e.slice(0, 8)}…` : e, title: e } : { text: e };
}
const Ja = [
  { match: /component_id not in scope|not in scope/i, text: "Not part of this workspace" },
  { match: /transform output must be an object/i, text: "Item format not recognized" },
  { match: /trigger events dropped/i, text: "Incoming events were dropped" },
  { match: /requires dest_ref/i, text: "Missing a destination reference" },
  { match: /does not declare sink operation|accepts source payloads only/i, text: "Destination cannot accept this item" },
  { match: /sink write (returned a non-object|did not acknowledge)/i, text: "Destination did not confirm the save" },
  { match: /(sink|source) resolve/i, text: "Source or destination unavailable" }
];
function Za(e) {
  const t = e.trim();
  if (!t) return { text: "" };
  for (const a of Ja)
    if (a.match.test(t)) return { text: a.text, title: t };
  return { text: "Skipped", title: t };
}
function bt(e) {
  return /reason/i.test(e);
}
function Qa(e, t) {
  return bt(e.key) || /(^|_)item(_key)?$/i.test(e.key) ? !0 : typeof t == "string" && yt(t);
}
function Xa(e, t) {
  const a = Ka(e.label || Ba(e.key));
  if (bt(e.key)) {
    const { text: l, title: p } = Za(String(t));
    return { label: a, value: l, title: p, icon: e.icon };
  }
  const { text: s, title: i } = Ga(Ya(e, t));
  return { label: a, value: s, title: i, icon: e.icon };
}
function we(e, t, a) {
  const s = t;
  if (!e || !s) return [];
  const i = [];
  for (const l of e) {
    if (!l?.key || Ha.has(l.key) || l.role === "subtitle") continue;
    const p = s[l.key];
    p == null || p === "" || l.hidden || l.hide_zero && p === 0 || Qa(l, p) === a && i.push(Xa(l, p));
  }
  return i;
}
function Ve(e) {
  return String(e?.status || "").toLowerCase();
}
function es(e) {
  return typeof e == "string" && /\b(completed|succeeded|successfully)\b/i.test(e);
}
function _t(e) {
  const t = Ve(e);
  return t === "completed" || t === "failed";
}
function qe(e) {
  const t = Ve(e);
  return t === "failed" || t === "failing" ? !0 : !!e?.last_error && !es(e.last_error);
}
function kt(e, t) {
  if (t?.code === "unavailable") return { tone: "error", text: "Its module is unavailable. Reinstall its module to use this automation." };
  const a = typeof e?.last_error == "string" ? e.last_error.trim() : "";
  return a ? qe(e) ? { tone: "error", text: a } : { tone: "success", text: a } : null;
}
function ht(e, t, a, s) {
  if (s?.code === "unavailable") return { kind: "warn", label: "Unavailable" };
  const i = za(a);
  if (i) return i;
  if (!e)
    return t ? { kind: "neutral", label: "…" } : { kind: "neutral", label: "Installed" };
  const l = Ve(e);
  return qe(e) ? { kind: "warn", label: l === "failed" ? "Failed" : "Failing" } : l === "completed" ? { kind: "done", label: "Completed" } : l === "paused" || e.enabled === !1 ? { kind: "off", label: "Paused" } : l === "running" ? { kind: "live", label: "Running" } : { kind: "on", label: "Active" };
}
function gt(e) {
  switch (e) {
    case "on":
    case "live":
    case "done":
      return "success";
    case "warn":
      return "danger";
    case "off":
      return "warn";
    default:
      return "secondary";
  }
}
function xt(e, t) {
  const a = (e || []).find((i) => i?.role === "subtitle"), s = a ? t?.[a.key] : void 0;
  return typeof s == "string" ? s.trim() : "";
}
async function $t(e) {
  const t = [], a = /* @__PURE__ */ new Set();
  let s, i;
  do {
    const l = s ? `?page_token=${encodeURIComponent(s)}` : "", { data: p } = await oe.get(`/api/v1/automations/${encodeURIComponent(e)}/status${l}`);
    if (!Fa(p)) throw new Error("Invalid automation status response");
    if (t.push(...p.drives), i = p.delivery_failures, s = p.next_page_token || void 0, s && a.has(s)) throw new Error("Automation status repeated a page token");
    s && a.add(s);
  } while (s);
  return { drives: t, delivery_failures: i };
}
const ts = ["aria-label"], ns = { class: "kx-drawer-head" }, as = { class: "kx-ficon" }, ss = { class: "kx-drawer-id" }, is = ["title"], os = { class: "kx-drawer-sub" }, rs = { class: "kx-drawer-controls" }, ls = {
  class: "kx-tabs",
  role: "tablist"
}, us = ["aria-selected", "data-testid", "onClick"], cs = { class: "kx-drawer-body" }, ds = {
  key: 0,
  class: "kx-dsec"
}, fs = {
  key: 0,
  class: "kx-errcard",
  "data-testid": "drawer-error-card"
}, vs = { class: "kx-errcard-head" }, ps = { class: "kx-errcard-cause" }, ms = { class: "kx-dgrid" }, ys = { class: "kx-dfact-k" }, bs = { class: "kx-dfact-v" }, _s = {
  key: 1,
  class: "kx-dsub"
}, ks = { class: "kx-metrics" }, hs = { class: "kx-metric-k" }, gs = ["title"], xs = {
  key: 1,
  class: "kx-dsec"
}, $s = {
  key: 0,
  class: "kx-dnote"
}, ws = {
  key: 1,
  class: "kx-dgrid"
}, Cs = { class: "kx-dfact-k" }, Ss = ["title"], Rs = {
  key: 2,
  class: "kx-dsec",
  "data-testid": "drawer-config"
}, Ms = {
  key: 2,
  class: "kx-dnote"
}, As = {
  key: 3,
  class: "kx-dsec"
}, Is = { class: "kx-dgrid" }, Ds = { class: "kx-dfact" }, Ts = { class: "kx-dfact-v" }, Es = { class: "kx-dfact" }, Ps = { class: "kx-dfact-v" }, Ns = { class: "kx-dfact" }, js = { class: "kx-dfact-v" }, Us = {
  key: 0,
  class: "kx-dsub"
}, Ls = /* @__PURE__ */ le({
  __name: "DetailDrawer",
  props: {
    automation: { default: () => ({ id: "" }) },
    type: {}
  },
  emits: ["close", "action", "recover", "changed"],
  setup(e, { emit: t }) {
    const a = e, s = t, i = O("overview"), l = [
      { id: "overview", label: "Overview", icon: "tabler:layout-dashboard" },
      { id: "state", label: "State", icon: "tabler:chart-dots" },
      { id: "config", label: "Config", icon: "tabler:settings" },
      { id: "activity", label: "Activity", icon: "tabler:history" }
    ], p = E(() => a.automation.title || a.automation.id), y = E(() => a.automation.icon || a.type?.icon || "tabler:bolt"), I = E(() => a.type?.title || "Automation"), m = E(() => a.automation.public_state), N = E(() => dt(a.type)), S = E(() => vt(N.value)), g = E(() => N.value.declared.includes("status")), c = O(null);
    let v = 0;
    async function k(q) {
      const R = ++v;
      if (!q || !a.automation.drive_status || a.automation.availability) {
        c.value = null;
        return;
      }
      c.value = a.automation.drive_status;
      const $ = await $t(q);
      R === v && a.automation.id === q && (c.value = $);
    }
    ge(() => [a.automation.id, a.automation.drive_status, a.automation.availability], ([q]) => {
      k(q).catch((R) => $e.handleError("other", { message: String(R) }));
    }, { immediate: !0 });
    const D = E(() => ht(m.value, g.value, c.value, a.automation.availability)), z = E(() => D.value.kind === "off"), J = E(() => _t(m.value)), Y = E(() => (N.value.declared.includes("pause") || N.value.declared.includes("resume")) && !J.value), T = E(() => qe(m.value)), V = E(() => ft(N.value.declared)), x = E(() => {
      if (a.automation.availability) return kt(m.value, a.automation.availability)?.text || "";
      const q = Va(c.value);
      if (q) return q;
      const R = typeof m.value?.last_error == "string" ? m.value.last_error.trim() : "";
      return T.value ? R : "";
    }), A = E(() => xt(a.type?.public_state_schema?.fields, m.value)), w = E(() => {
      const q = a.type?.public_state_schema?.fields;
      return [...we(q, m.value, !1), ...we(q, m.value, !0)];
    }), j = E(() => {
      const q = m.value, R = [];
      R.push({ label: "Status", value: D.value.label }), a.automation.availability || R.push({ label: "Enabled", value: z.value ? "Paused" : "Yes" }), A.value && R.push({ label: "When", value: A.value }), q?.last_run_at && R.push({ label: "Last run", value: ie(q.last_run_at, { future: !0 }) }), q?.next_run_at && R.push({ label: "Next run", value: ie(q.next_run_at, { future: !0 }) });
      for (const $ of qa(c.value))
        R.push({ label: $.label, value: $.time ? ie($.value, { future: !0 }) : $.value });
      return R;
    }), U = E(() => {
      const q = c.value?.drives.flatMap(($) => typeof $.last_round_at == "string" ? [$.last_round_at] : []) || [], R = c.value?.delivery_failures?.last_error?.at;
      return R && q.push(R), q.sort().at(-1) || m.value?.last_run_at;
    }), u = E(() => c.value?.delivery_failures), P = E(() => {
      const q = u.value?.last_error;
      return q ? `${q.code}: ${q.message}` : m.value?.last_error;
    }), F = E(() => ze(a.type)), ne = E(() => lt(a.automation, a.type)), Se = E(() => ({ location: rt(a.type) }));
    return ge(() => a.automation.id, () => {
      i.value = "overview";
    }), (q, R) => (r(), f(B, null, [
      o("div", {
        class: "kx-drawer-scrim",
        onClick: R[0] || (R[0] = ($) => s("close"))
      }),
      o("aside", {
        class: "kx-drawer",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": p.value,
        "data-testid": "detail-drawer"
      }, [
        o("header", ns, [
          o("span", as, [
            M(n(L), {
              icon: y.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          o("div", ss, [
            o("div", {
              class: "kx-drawer-name",
              title: p.value
            }, h(p.value), 9, is),
            o("div", os, h(I.value), 1)
          ]),
          M(n(at), {
            severity: n(gt)(D.value.kind),
            class: "kx-badge kx-tag-sm"
          }, {
            default: H(() => [
              D.value.kind === "live" ? (r(), W(n(L), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : C("", !0),
              se(" " + h(D.value.label), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          o("div", rs, [
            Y.value ? (r(), W(n(Z), {
              key: 0,
              type: "button",
              severity: "secondary",
              outlined: "",
              size: "small",
              "aria-label": `${z.value ? "Resume" : "Pause"} ${p.value}`,
              title: z.value ? "Resume" : "Pause",
              disabled: !!e.automation.deleting_at,
              onClick: R[1] || (R[1] = ($) => !e.automation.deleting_at && s("action", z.value ? "resume" : "pause"))
            }, {
              icon: H(({ class: $ }) => [
                M(n(L), {
                  icon: z.value ? "tabler:player-play-filled" : "tabler:player-pause",
                  "aria-hidden": "true",
                  class: G($)
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["aria-label", "title", "disabled"])) : C("", !0),
            M(pt, {
              items: S.value,
              name: p.value,
              disabled: !!e.automation.deleting_at,
              onSelect: R[2] || (R[2] = ($) => !e.automation.deleting_at && s("action", $))
            }, null, 8, ["items", "name", "disabled"]),
            M(n(Z), {
              type: "button",
              severity: "secondary",
              text: "",
              size: "small",
              class: "kx-drawer-close",
              "aria-label": "Close details",
              title: "Close",
              onClick: R[3] || (R[3] = ($) => s("close"))
            }, {
              icon: H(({ class: $ }) => [
                M(n(L), {
                  icon: "tabler:x",
                  "aria-hidden": "true",
                  class: G($)
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o("nav", ls, [
          (r(), f(B, null, X(l, ($) => o("button", {
            key: $.id,
            type: "button",
            role: "tab",
            class: G(["kx-tab", i.value === $.id && "is-active"]),
            "aria-selected": i.value === $.id,
            "data-testid": `drawer-tab-${$.id}`,
            onClick: (He) => i.value = $.id
          }, [
            M(n(L), {
              icon: $.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            se(" " + h($.label), 1)
          ], 10, us)), 64))
        ]),
        o("div", cs, [
          i.value === "overview" ? (r(), f("section", ds, [
            x.value ? (r(), f("div", fs, [
              o("div", vs, [
                M(n(L), {
                  icon: "tabler:alert-circle",
                  "aria-hidden": "true"
                }),
                o("span", null, h(a.automation.availability ? "This automation is unavailable" : "This automation is failing"), 1)
              ]),
              o("p", ps, h(x.value), 1),
              V.value ? (r(), W(n(Z), {
                key: 0,
                type: "button",
                size: "small",
                severity: "danger",
                "aria-label": `Recover ${p.value}`,
                "data-testid": "drawer-recover",
                label: "Recover",
                disabled: !!e.automation.deleting_at,
                onClick: R[4] || (R[4] = ($) => !e.automation.deleting_at && s("recover"))
              }, {
                icon: H(({ class: $ }) => [
                  M(n(L), {
                    icon: "tabler:rotate-clockwise-2",
                    "aria-hidden": "true",
                    class: G($)
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["aria-label", "disabled"])) : C("", !0)
            ])) : C("", !0),
            o("div", ms, [
              (r(!0), f(B, null, X(j.value, ($) => (r(), f("div", {
                key: $.label,
                class: "kx-dfact"
              }, [
                o("span", ys, h($.label), 1),
                o("strong", bs, h($.value), 1)
              ]))), 128))
            ]),
            w.value.length ? (r(), f("div", _s, [
              R[9] || (R[9] = o("div", { class: "kx-dsub-lbl" }, "Progress", -1)),
              o("div", ks, [
                (r(!0), f(B, null, X(w.value, ($) => (r(), f("span", {
                  key: $.label,
                  class: "kx-metric"
                }, [
                  $.icon ? (r(), W(n(L), {
                    key: 0,
                    icon: $.icon,
                    class: "kx-metric-i",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : C("", !0),
                  o("span", hs, h($.label), 1),
                  o("span", {
                    class: "kx-metric-v",
                    title: $.title
                  }, h($.value), 9, gs)
                ]))), 128))
              ])
            ])) : C("", !0)
          ])) : i.value === "state" ? (r(), f("section", xs, [
            w.value.length ? (r(), f("div", ws, [
              (r(!0), f(B, null, X(w.value, ($) => (r(), f("div", {
                key: $.label,
                class: "kx-dfact"
              }, [
                o("span", Cs, h($.label), 1),
                o("strong", {
                  class: "kx-dfact-v",
                  title: $.title
                }, h($.value), 9, Ss)
              ]))), 128))
            ])) : (r(), f("div", $s, "This automation reports no additional state."))
          ])) : i.value === "config" ? (r(), f("section", Rs, [
            !e.automation.deleting_at && !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (r(), W(xe, {
              key: 0,
              tag: "wc-execution-identity-editor",
              attrs: { root: e.automation.id },
              onChange: R[5] || (R[5] = ($) => s("changed"))
            }, null, 8, ["attrs"])) : C("", !0),
            F.value && !e.automation.deleting_at ? (r(), W(xe, {
              key: 1,
              class: "kx-manage-host",
              tag: F.value,
              config: ne.value,
              meta: Se.value,
              onChange: R[6] || (R[6] = ($) => s("changed")),
              onClose: R[7] || (R[7] = ($) => i.value = "overview")
            }, null, 8, ["tag", "config", "meta"])) : (r(), f("div", Ms, "This automation type declares no settings view."))
          ])) : (r(), f("section", As, [
            o("div", Is, [
              o("div", Ds, [
                R[10] || (R[10] = o("span", { class: "kx-dfact-k" }, "Last run", -1)),
                o("strong", Ts, h(U.value ? n(ie)(U.value, { future: !0 }) : "Never"), 1)
              ]),
              o("div", Es, [
                R[11] || (R[11] = o("span", { class: "kx-dfact-k" }, "Last outcome", -1)),
                o("strong", Ps, h(u.value?.count ? "Failed delivery" : m.value?.status || "—"), 1)
              ]),
              o("div", Ns, [
                R[12] || (R[12] = o("span", { class: "kx-dfact-k" }, "Failed deliveries", -1)),
                o("strong", js, h(u.value?.count ?? 0), 1)
              ])
            ]),
            typeof P.value == "string" && P.value.trim() ? (r(), f("div", Us, [
              R[13] || (R[13] = o("div", { class: "kx-dsub-lbl" }, "Last message", -1)),
              o("p", {
                class: G(["kx-dmsg", T.value || u.value?.count ? "is-err" : "is-ok"])
              }, h(P.value), 3)
            ])) : C("", !0),
            !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (r(), W(Ua, {
              key: 1,
              root: e.automation.id,
              onError: R[8] || (R[8] = ($) => n($e).handleError("other", { message: $.message }))
            }, null, 8, ["root"])) : C("", !0)
          ]))
        ])
      ], 8, ts)
    ], 64));
  }
});
function Os(e) {
  const t = O(!1), a = O(null), s = O({}), i = O(!1), l = O(!1), p = O(""), y = O(null), I = O(null);
  let m = null;
  const N = O(""), S = E(() => e.types.value.filter(
    (u) => u.installable !== !1 && Object.entries(e.inputPreset.value).every(([P, F]) => {
      const ne = u.inputs?.properties?.[P];
      return !!ne && (!ne.enum || typeof F == "string" && ne.enum.includes(F));
    })
  )), g = E(() => !e.componentMode.value || !e.preferredTypeId.value || a.value?.id !== e.preferredTypeId.value), c = E(() => a.value ? en(a.value).filter(([u]) => !(u in e.inputPreset.value)) : []), v = E(() => {
    const u = N.value.trim().toLowerCase();
    return u ? S.value.filter(
      (P) => (P.title || "").toLowerCase().includes(u) || (P.name || "").toLowerCase().includes(u) || Le(P).toLowerCase().includes(u)
    ) : S.value;
  });
  function k(u) {
    A(), N.value = "", a.value = u || null, s.value = u ? { ...Je(u), ...e.inputPreset.value } : {}, p.value = "", t.value = !0, Ne(Y);
  }
  function D(u) {
    A(), a.value = u, s.value = { ...Je(u), ...e.inputPreset.value }, p.value = "", Ne(Y);
  }
  function z() {
    A(), t.value = !1, a.value = null, s.value = {}, p.value = "", l.value = !1, e.createMode.value && e.emitHost("close", {});
  }
  function J() {
    !g.value || a.value || Ne(() => I.value?.focus({ preventScroll: !0 }));
  }
  async function Y() {
    const u = a.value, P = Oe(u);
    if (!(!P || !u || !y.value))
      try {
        if (await Wt(P, { timeoutMs: 8e3 }), a.value?.id !== u.id || !y.value) return;
        const F = document.createElement(P);
        F.setAttribute("type-id", u.id), F.setAttribute("input", JSON.stringify(e.inputPreset.value)), e.effectiveParentId.value && F.setAttribute("parent-id", e.effectiveParentId.value), F.setAttribute("embedded", "true"), F.addEventListener("automation-installed", x), F.addEventListener("submit-state", T), y.value.innerHTML = "", y.value.appendChild(F), m = F;
      } catch (F) {
        const ne = kn(u);
        p.value = `Failed to load setup UI (${P}${ne ? ` at ${ne}` : ""}): ` + (F instanceof Error ? F.message : String(F));
      }
  }
  function T(u) {
    l.value = !!u.detail?.saving;
  }
  function V() {
    Oe(a.value) ? hn(m) : U();
  }
  async function x(u) {
    const P = u.detail;
    if (P?.success === !1) {
      p.value = P?.error || "Could not create the automation.", l.value = !1;
      return;
    }
    if (e.createMode.value) {
      e.emitHost("created", { id: P?.id });
      return;
    }
    z(), await e.reload();
  }
  function A() {
    m && (m.removeEventListener("automation-installed", x), m.removeEventListener("submit-state", T), m.remove(), m = null), y.value && (y.value.innerHTML = "");
  }
  function w() {
    const u = e.preferredTypeId.value;
    return u ? S.value.find((P) => P.id === u) : void 0;
  }
  function j() {
    k(w());
  }
  async function U() {
    const u = a.value;
    if (!u) return;
    const P = tn(u, s.value);
    if (P) {
      p.value = P;
      return;
    }
    i.value = !0, p.value = "";
    try {
      const { data: F } = await oe.post("/api/v1/automations", {
        type: u.id,
        input: nn(u, s.value),
        parent_id: e.effectiveParentId.value || void 0
      });
      if (F?.success) {
        if (e.createMode.value) {
          e.emitHost("created", { id: F.id });
          return;
        }
        z(), await e.reload();
      } else
        p.value = Q({ response: { data: F } }, "install failed");
    } catch (F) {
      p.value = Q(F, "install failed");
    } finally {
      i.value = !1;
    }
  }
  return {
    showTypeCatalog: g,
    installFields: c,
    showInstall: t,
    installType: a,
    installForm: s,
    installing: i,
    customSaving: l,
    installError: p,
    customInstallHost: y,
    installSearchInput: I,
    typeSearch: N,
    filteredTypes: v,
    openInstall: k,
    openPreferredInstall: j,
    chooseType: D,
    closeInstall: z,
    focusInstallDialog: J,
    onCreate: V,
    unmountCustomInstallUi: A
  };
}
function Fs({ automations: e, types: t, query: a, drawerId: s }) {
  const i = E(() => {
    const u = {};
    for (const P of t.value) u[P.id] = P;
    return u;
  }), l = E(() => {
    const u = a.value.trim().toLowerCase();
    return u ? e.value.filter(
      (P) => (P.title || "").toLowerCase().includes(u) || (P.description || "").toLowerCase().includes(u) || (P.type || "").toLowerCase().includes(u)
    ) : e.value;
  });
  function p(u) {
    return u.title || u.id;
  }
  function y(u) {
    return u.type ? i.value[u.type] : void 0;
  }
  function I(u) {
    return u.icon ? u.icon : y(u)?.icon || "tabler:bolt";
  }
  function m(u) {
    return ct(y(u));
  }
  function N(u, P) {
    return m(u).has(P);
  }
  function S(u) {
    return ut(m(u));
  }
  function g(u) {
    return vt(dt(y(u)));
  }
  function c(u) {
    return ft(m(u));
  }
  function v(u) {
    return ze(y(u));
  }
  function k(u) {
    return rt(y(u));
  }
  function D(u) {
    return u ? lt(u, y(u)) : {};
  }
  function z(u) {
    return u.public_state;
  }
  function J(u) {
    return we(y(u)?.public_state_schema?.fields, z(u), !1);
  }
  function Y(u) {
    return we(y(u)?.public_state_schema?.fields, z(u), !0);
  }
  function T(u) {
    return _t(z(u));
  }
  function V(u) {
    return kt(z(u), u.availability);
  }
  function x(u) {
    return ht(z(u), N(u, "status"), u.drive_status, u.availability);
  }
  function A(u) {
    return x(u).kind === "off";
  }
  function w(u) {
    return xt(y(u)?.public_state_schema?.fields, z(u));
  }
  const j = E(() => e.value.find((u) => u.id === s.value) || null), U = E(() => j.value ? y(j.value) : void 0);
  return {
    typeById: i,
    filtered: l,
    pretty: p,
    typeFor: y,
    iconFor: I,
    declaredActions: m,
    hasAction: N,
    runNowFor: S,
    actionItemsFor: g,
    recoverFor: c,
    manageTag: v,
    manageLocation: k,
    manageConfig: D,
    statusFor: z,
    metrics: J,
    detailMetrics: Y,
    isTerminal: T,
    rowMessage: V,
    statusOf: x,
    isPaused: A,
    subtitleLine: w,
    drawerAutomation: j,
    drawerType: U
  };
}
function zs(e, t) {
  const a = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
  let i = 0;
  const l = /* @__PURE__ */ new Map();
  function p(S, g) {
    const c = g.meta;
    e.value = e.value.map((v) => {
      if (v.id !== S) return v;
      const k = {
        ...v,
        public_state: { ...v.public_state || {}, ...c }
      };
      return typeof c.title == "string" && (k.title = c.title), typeof c.comment == "string" && (k.description = c.comment), k;
    }), y(S).catch((v) => $e.handleError("other", { message: String(v) }));
  }
  async function y(S) {
    if (!e.value.some((v) => v.id === S && v.drive_status)) return;
    const g = Symbol(S);
    l.set(S, g);
    const c = await $t(S);
    l.get(S) === g && (l.delete(S), e.value = e.value.map((v) => v.id === S ? { ...v, drive_status: c } : v));
  }
  function I(S) {
    const g = {};
    for (const c of t(S)?.public_state_schema?.fields || [])
      c?.key && c.type && (g[c.key] = c.type);
    return g;
  }
  function m() {
    i++, s.clear(), l.clear();
    for (const S of a.values()) S();
    a.clear();
  }
  function N() {
    const S = new Set(e.value.map((c) => c.id).filter(Boolean));
    for (const [c, v] of a)
      S.has(c) || (v(), a.delete(c), l.delete(c));
    const g = i;
    for (const c of S) {
      if (a.has(c) || s.has(c)) continue;
      s.add(c);
      const v = e.value.find((D) => D.id === c), k = yn(c, (D) => p(c, D), v ? I(v) : void 0);
      if (s.delete(c), !!k) {
        if (g !== i || !e.value.some((D) => D.id === c)) {
          k();
          continue;
        }
        a.set(c, k);
      }
    }
  }
  return { syncRealtimeSubscriptions: N, clearRealtimeSubscriptions: m, refreshDriveStatus: y };
}
function Vs({ automations: e, types: t, loading: a, error: s, parentId: i, syncRealtimeSubscriptions: l }) {
  async function p() {
    try {
      const { data: m } = await oe.get("/api/v1/automations/types");
      t.value = m?.success ? m.types || [] : [];
    } catch {
      t.value = [];
    }
  }
  async function y() {
    a.value = !0, s.value = "";
    try {
      const { data: m } = await oe.get("/api/v1/automations", { params: { class: "automation", parent_id: i() } });
      if (!m?.success) throw new Error(Q(m?.error, "failed to load automations"));
      e.value = m.automations || [], l();
    } catch (m) {
      l(), s.value = Q(m, "failed to load automations");
    } finally {
      a.value = !1;
    }
  }
  async function I() {
    await p(), await y();
  }
  return { fetchTypes: p, fetchAutomations: y, reload: I };
}
function qs(e, t, a) {
  async function s(i) {
    e.value = i.id, t.value = "";
    try {
      const { data: l } = await oe.get(`/api/v1/automations/${encodeURIComponent(i.id)}/export`);
      if (!l?.success || !l.artifact)
        throw new Error(l?.error?.message || l?.error || "Automation export failed.");
      const p = a(i).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "automation", y = new Blob([`${JSON.stringify(l.artifact, null, 2)}
`], { type: "application/json" }), I = URL.createObjectURL(y), m = document.createElement("a");
      m.href = I, m.download = `${p}.automation.json`, document.body.appendChild(m), m.click(), m.remove(), URL.revokeObjectURL(I);
    } catch (l) {
      t.value = Q(l, "Automation export failed.");
    } finally {
      e.value = "";
    }
  }
  return { exportAutomation: s };
}
const Hs = { class: "kx" }, Bs = {
  key: 0,
  class: "kx-head"
}, Ks = { class: "kx-head-icon" }, Ws = { class: "kx-head-actions" }, Ys = { class: "kx-count" }, Gs = { class: "kx-search" }, Js = {
  key: 1,
  class: "kx-err"
}, Zs = {
  key: 2,
  class: "kx-body"
}, Qs = {
  key: 0,
  class: "kx-loading"
}, Xs = {
  key: 1,
  class: "kx-empty"
}, ei = { class: "kx-empty-ico" }, ti = {
  key: 2,
  class: "kx-empty"
}, ni = {
  key: 3,
  class: "kx-list"
}, ai = ["aria-label", "onClick", "disabled"], si = { class: "kx-ficon" }, ii = { class: "kx-id" }, oi = ["title"], ri = { class: "kx-sub" }, li = { key: 0 }, ui = { key: 1 }, ci = { key: 2 }, di = { class: "kx-actions" }, fi = {
  key: 0,
  class: "kx-rowfoot"
}, vi = ["title"], pi = { class: "kx-modal-head-icon" }, mi = { class: "kx-modal-head-text" }, yi = { class: "kx-modal-head-title" }, bi = { class: "kx-modal-head-sub" }, _i = { class: "kx-modal-body" }, ki = { class: "kx-modal-head-icon" }, hi = { class: "kx-modal-head-text" }, gi = { class: "kx-modal-head-title" }, xi = { class: "kx-modal-head-sub" }, $i = { class: "kx-modal-body" }, wi = { class: "kx-modal-body" }, Ci = {
  key: 0,
  class: "kx-delopts"
}, Si = ["onUpdate:modelValue"], Ri = { class: "kx-delopt-copy" }, Mi = { class: "kx-delopt-t" }, Ai = {
  key: 0,
  class: "kx-delopt-d"
}, Ii = /* @__PURE__ */ le({
  __name: "automations",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, a = O([]), s = O([]), i = O(!1), l = O(""), p = O(""), y = O(""), I = /* @__PURE__ */ new Map(), m = O(""), N = O(""), S = Fs({ automations: a, types: s, query: p, drawerId: N }), {
      filtered: g,
      pretty: c,
      typeFor: v,
      iconFor: k,
      hasAction: D,
      actionItemsFor: z,
      recoverFor: J,
      manageTag: Y,
      manageLocation: T,
      manageConfig: V,
      metrics: x,
      detailMetrics: A,
      isTerminal: w,
      rowMessage: j,
      statusOf: U,
      isPaused: u,
      subtitleLine: P,
      drawerAutomation: F,
      drawerType: ne
    } = S, Se = zs(a, v), { syncRealtimeSubscriptions: q, clearRealtimeSubscriptions: R, refreshDriveStatus: $ } = Se, He = qs(m, l, c), { exportAutomation: wt } = He, ue = Yt(), Ct = Gt(), de = E(() => ue.value?.mode === "create"), Re = E(() => ue.value?.mode === "component"), St = an(ue), Be = E(() => String(ue.value?.componentId || "").trim()), Rt = E(() => String(ue.value?.typeId || "").trim()), Mt = E(() => Be.value || St.value), At = Vs({
      automations: a,
      types: s,
      loading: i,
      error: l,
      parentId: () => Be.value || void 0,
      syncRealtimeSubscriptions: q
    }), { fetchAutomations: fe, reload: Me } = At, ve = Os({
      types: s,
      createMode: de,
      componentMode: Re,
      effectiveParentId: Mt,
      preferredTypeId: Rt,
      inputPreset: E(() => sn(ue.value?.input)),
      emitHost: (b, _) => Ct(b, _),
      reload: () => Me()
    }), ae = O(null), _e = O({}), pe = O(!1), ee = O(null), re = O(null);
    function It(b) {
      re.value = b;
    }
    function Ke() {
      re.value = null;
    }
    function Dt(b) {
      const _ = b?.id || "";
      return {
        resource_id: _,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(_)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(_)}`,
        title: b ? c(b) : ""
      };
    }
    function We(b, _) {
      if (!b.deleting_at)
        switch (_) {
          case "reconfigure":
            Ot(b);
            break;
          case "share":
            It(b);
            break;
          case "export":
            wt(b);
            break;
          case "delete":
            Ie(b);
            break;
          default:
            Ae(b, _);
        }
    }
    function Ye(b) {
      if (b.deleting_at) return;
      const _ = J(b);
      _ && Ae(b, _);
    }
    function Tt(b) {
      N.value = b.id, fe();
    }
    function Et() {
      N.value = "";
    }
    function Pt(b) {
      const _ = F.value;
      _ && We(_, b);
    }
    function Nt() {
      const b = F.value;
      b && Ye(b);
    }
    async function Ae(b, _) {
      if (b.deleting_at || y.value) return;
      y.value = b.id, l.value = "";
      const d = v(b)?.controls?.some((te) => te.name === _) === !0, K = `${b.id}:${_}`, Ge = d ? I.get(K) || crypto.randomUUID() : "";
      d && I.set(K, Ge);
      try {
        const { data: te } = await oe.post(
          `/api/v1/automations/${b.id}/actions/${_}`,
          d ? { request_id: Ge } : {}
        );
        if (!te?.success) {
          l.value = Q({ response: { data: te } }, `${_} failed`);
          return;
        }
        if (d && te.result?.state === "succeeded" && I.delete(K), te.result && typeof te.result == "object") {
          const { success: Ee, ...zt } = te.result;
          b.public_state = { ...b.public_state || {}, ...zt };
        }
        if (b.drive_status?.drives?.length)
          await $(b.id);
        else if (_ === "pause" || _ === "resume") {
          const Ee = typeof te.result?.paused == "boolean" ? te.result.paused : _ === "pause";
          b.public_state = {
            ...b.public_state || {},
            enabled: !Ee,
            status: te.result?.status || (Ee ? "paused" : "active")
          };
        }
      } catch (te) {
        l.value = Q(te, `${_} failed`);
      } finally {
        y.value = "";
      }
    }
    async function jt(b) {
      await Ae(b, u(b) ? "resume" : "pause");
    }
    function Ie(b) {
      ae.value = b;
      const _ = v(b), d = {};
      for (const K of _?.delete_options || []) d[K.key] = !!K.default;
      _e.value = d;
    }
    function De(b) {
      return b ? v(b)?.delete_options || [] : [];
    }
    function Ut(b) {
      ee.value = null, Ie(b);
    }
    async function Lt() {
      const b = ae.value;
      if (b) {
        pe.value = !0, l.value = "";
        try {
          const d = De(b).length ? { options: { ..._e.value } } : {}, { data: K } = await oe.delete(`/api/v1/automations/${b.id}`, { data: d });
          K?.success ? (Ft(b.id, K), ae.value = null, await fe()) : l.value = Q({ response: { data: K } }, "failed to delete automation");
        } catch (_) {
          l.value = Q(_, "failed to delete automation");
        } finally {
          pe.value = !1;
        }
      }
    }
    function Ot(b) {
      Y(b) && (ee.value = b);
    }
    async function Te(b = !0) {
      ee.value = null, b && await Me();
    }
    Jt(async () => {
      try {
        await Me(), de.value && ve.openPreferredInstall();
      } catch (b) {
        l.value = Q(b, "host API unavailable");
      }
    }), Fe(() => {
      ve.unmountCustomInstallUi(), R();
    });
    const { acceptDeletion: Ft } = bn(a, (b) => b.id);
    return (b, _) => (r(), f("div", Hs, [
      de.value ? C("", !0) : (r(), f("header", Bs, [
        Re.value ? C("", !0) : (r(), f(B, { key: 0 }, [
          o("div", Ks, [
            M(n(L), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          _[10] || (_[10] = o("div", { class: "kx-head-text" }, [
            o("h1", { class: "kx-head-title" }, "Automations"),
            o("p", { class: "kx-head-sub" }, "Scheduled and event-driven jobs that run on their own.")
          ], -1))
        ], 64)),
        o("div", Ws, [
          o("span", Ys, h(a.value.length) + " automation" + h(a.value.length !== 1 ? "s" : ""), 1),
          o("div", Gs, [
            M(n(L), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            ce(o("input", {
              "onUpdate:modelValue": _[0] || (_[0] = (d) => p.value = d),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search automations…"
            }, null, 512), [
              [Ue, p.value]
            ])
          ]),
          M(n(Z), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: _[1] || (_[1] = (d) => n(ve).openPreferredInstall())
          }, {
            icon: H(({ class: d }) => [
              M(n(L), {
                icon: "tabler:plus",
                class: G(d),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ])),
      !de.value && l.value ? (r(), f("div", Js, h(l.value), 1)) : C("", !0),
      de.value ? C("", !0) : (r(), f("div", Zs, [
        i.value && !a.value.length ? (r(), f("div", Qs, [
          M(n(L), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          _[11] || (_[11] = se(" Loading… ", -1))
        ])) : a.value.length ? n(g).length ? (r(), f("div", ni, [
          (r(!0), f(B, null, X(n(g), (d) => (r(), f("div", {
            key: d.id,
            class: G(["kx-row", N.value === d.id && "is-open"])
          }, [
            o("button", {
              type: "button",
              class: "kx-open",
              "aria-label": `Open ${n(c)(d)} details`,
              onClick: (K) => !d.deleting_at && Tt(d),
              disabled: !!d.deleting_at
            }, [
              o("span", si, [
                M(n(L), {
                  icon: n(k)(d),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              o("span", ii, [
                o("span", {
                  class: "kx-name",
                  title: n(c)(d)
                }, h(n(c)(d)), 9, oi),
                o("span", ri, [
                  o("span", null, h(n(v)(d)?.title || "Automation"), 1),
                  n(P)(d) ? (r(), f("span", li, " · " + h(n(P)(d)), 1)) : C("", !0),
                  n(ye)(d.drive_status).last ? (r(), f("span", ui, " · last ran " + h(n(ie)(n(ye)(d.drive_status).last, { future: !0 })), 1)) : C("", !0),
                  n(ye)(d.drive_status).next ? (r(), f("span", ci, " · next " + h(n(ie)(n(ye)(d.drive_status).next, { future: !0 })), 1)) : C("", !0)
                ])
              ])
            ], 8, ai),
            M(n(at), {
              severity: n(gt)(n(U)(d).kind),
              class: "kx-badge kx-tag-sm"
            }, {
              default: H(() => [
                n(U)(d).kind === "live" ? (r(), W(n(L), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : C("", !0),
                se(" " + h(n(U)(d).label), 1)
              ]),
              _: 2
            }, 1032, ["severity"]),
            o("div", di, [
              (n(D)(d, "pause") || n(D)(d, "resume")) && !n(w)(d) ? (r(), W(n(Z), {
                key: 0,
                type: "button",
                severity: "secondary",
                outlined: "",
                size: "small",
                disabled: !!d.deleting_at || y.value === d.id,
                "aria-label": `${n(u)(d) ? "Resume" : "Pause"} ${n(c)(d)}`,
                title: n(u)(d) ? "Resume" : "Pause",
                onClick: (K) => jt(d)
              }, {
                icon: H(({ class: K }) => [
                  M(n(L), {
                    icon: n(u)(d) ? "tabler:player-play-filled" : "tabler:player-pause",
                    "aria-hidden": "true",
                    class: G(K)
                  }, null, 8, ["icon", "class"])
                ]),
                _: 2
              }, 1032, ["disabled", "aria-label", "title", "onClick"])) : C("", !0),
              M(pt, {
                items: n(z)(d),
                name: n(c)(d),
                busy: !!d.deleting_at || y.value === d.id,
                onSelect: (K) => We(d, K)
              }, null, 8, ["items", "name", "busy", "onSelect"])
            ]),
            d.deleting_at || n(j)(d) || n(A)(d).length || n(x)(d).length ? (r(), f("div", fi, [
              M(dn, {
                state: d,
                onRetry: (K) => Ie(d)
              }, null, 8, ["state", "onRetry"]),
              n(j)(d) ? (r(), f("div", {
                key: 0,
                class: G(["kx-rowmsg", `kx-rowmsg-${n(j)(d)?.tone}`])
              }, [
                M(n(L), {
                  icon: n(j)(d)?.tone === "error" ? "tabler:alert-circle" : "tabler:circle-check",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                o("span", {
                  class: "kx-rowmsg-txt",
                  title: n(j)(d)?.text
                }, h(n(j)(d)?.text), 9, vi),
                n(j)(d)?.tone === "error" && n(J)(d) ? (r(), W(n(Z), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  text: "",
                  size: "small",
                  class: "kx-recover",
                  "data-testid": "row-recover",
                  "aria-label": `Recover ${n(c)(d)}`,
                  disabled: !!d.deleting_at || y.value === d.id,
                  label: "Recover",
                  onClick: (K) => Ye(d)
                }, {
                  icon: H(({ class: K }) => [
                    M(n(L), {
                      icon: "tabler:rotate-clockwise-2",
                      "aria-hidden": "true",
                      class: G(K)
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])) : C("", !0)
              ], 2)) : C("", !0),
              M(ta, {
                face: n(x)(d),
                detail: n(A)(d)
              }, null, 8, ["face", "detail"])
            ])) : C("", !0)
          ], 2))), 128))
        ])) : (r(), f("div", ti, [..._[14] || (_[14] = [
          o("div", { class: "kx-empty-title" }, "No matches", -1),
          o("div", { class: "kx-empty-sub" }, "No automations match the current search.", -1)
        ])])) : (r(), f("div", Xs, [
          o("div", ei, [
            M(n(L), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          _[12] || (_[12] = o("div", { class: "kx-empty-title" }, "No automations yet", -1)),
          _[13] || (_[13] = o("div", { class: "kx-empty-sub" }, "Choose an automation type to get started.", -1)),
          M(n(Z), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: _[2] || (_[2] = (d) => n(ve).openPreferredInstall())
          }, {
            icon: H(({ class: d }) => [
              M(n(L), {
                icon: "tabler:plus",
                class: G(d),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ])),
      n(F) ? (r(), W(Ls, {
        key: 3,
        automation: n(F),
        type: n(ne),
        onClose: Et,
        onAction: Pt,
        onRecover: Nt,
        onChanged: n(fe)
      }, null, 8, ["automation", "type", "onChanged"])) : C("", !0),
      M(Wn, {
        flow: n(ve),
        "component-mode": Re.value,
        "dialog-pt": t
      }, null, 8, ["flow", "component-mode"]),
      ee.value ? (r(), W(n(ke), {
        key: 4,
        visible: !!ee.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: t,
        class: "kx-modal kx-modal-manage",
        "aria-label": n(c)(ee.value),
        "onUpdate:visible": _[6] || (_[6] = (d) => {
          d || Te(!1);
        })
      }, {
        header: H(() => [
          o("span", pi, [
            M(n(L), {
              icon: n(k)(ee.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          o("span", mi, [
            o("span", yi, h(n(c)(ee.value)), 1),
            o("span", bi, h(n(v)(ee.value)?.title || "Automation"), 1)
          ])
        ]),
        footer: H(() => [
          M(n(Z), {
            type: "button",
            class: "kx-foot-delete",
            severity: "danger",
            outlined: "",
            label: "Delete",
            onClick: _[5] || (_[5] = (d) => Ut(ee.value))
          }, {
            icon: H(({ class: d }) => [
              M(n(L), {
                icon: "tabler:trash",
                "aria-hidden": "true",
                class: G(d)
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]),
        default: H(() => [
          o("div", _i, [
            M(xe, {
              class: "kx-manage-host",
              tag: n(Y)(ee.value),
              config: n(V)(ee.value),
              meta: { location: n(T)(ee.value) },
              onCreated: _[3] || (_[3] = (d) => Te(!0)),
              onClose: _[4] || (_[4] = (d) => Te(!0)),
              onChange: n(fe)
            }, null, 8, ["tag", "config", "meta", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : C("", !0),
      re.value ? (r(), W(n(ke), {
        key: 5,
        visible: !!re.value,
        modal: "",
        pt: t,
        class: "kx-modal",
        "aria-label": `Share ${n(c)(re.value)}`,
        "onUpdate:visible": _[7] || (_[7] = (d) => {
          d || Ke();
        })
      }, {
        header: H(() => [
          o("span", ki, [
            M(n(L), {
              icon: "tabler:users",
              "aria-hidden": "true"
            })
          ]),
          o("span", hi, [
            o("span", gi, "Share " + h(n(c)(re.value)), 1),
            o("span", xi, h(n(v)(re.value)?.title || "Automation"), 1)
          ])
        ]),
        default: H(() => [
          o("div", $i, [
            M(xe, {
              class: "kx-manage-host",
              tag: "kickside-share",
              config: Dt(re.value),
              onClose: Ke,
              onChange: n(fe)
            }, null, 8, ["config", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : C("", !0),
      ae.value ? (r(), W(n(ke), {
        key: 6,
        visible: !!ae.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: t,
        class: "kx-modal",
        header: "Delete automation",
        "aria-label": "Delete automation",
        "onUpdate:visible": _[9] || (_[9] = (d) => {
          d || (ae.value = null);
        })
      }, {
        footer: H(() => [
          M(n(Z), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: pe.value,
            onClick: _[8] || (_[8] = (d) => ae.value = null)
          }, null, 8, ["disabled"]),
          M(n(Z), {
            type: "button",
            "data-testid": "automations-confirm-delete",
            severity: "danger",
            label: "Delete",
            loading: pe.value,
            disabled: pe.value,
            onClick: Lt
          }, {
            icon: H(({ class: d }) => [
              M(n(L), {
                icon: "tabler:trash",
                class: G(d),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ]),
        default: H(() => [
          o("div", wi, [
            o("p", null, [
              _[15] || (_[15] = se(" Delete ", -1)),
              o("strong", null, h(n(c)(ae.value)), 1),
              _[16] || (_[16] = se("? It will stop running and its setup will be removed. This can't be undone. ", -1))
            ]),
            De(ae.value).length ? (r(), f("div", Ci, [
              (r(!0), f(B, null, X(De(ae.value), (d) => (r(), f("label", {
                key: d.key,
                class: "kx-delopt"
              }, [
                ce(o("input", {
                  "onUpdate:modelValue": (K) => _e.value[d.key] = K,
                  type: "checkbox"
                }, null, 8, Si), [
                  [tt, _e.value[d.key]]
                ]),
                o("span", Ri, [
                  o("span", Mi, h(d.title || d.key), 1),
                  d.description ? (r(), f("span", Ai, h(d.description), 1)) : C("", !0)
                ])
              ]))), 128))
            ])) : C("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible"])) : C("", !0)
    ]));
  }
}), Bi = {
  rootComponent: Ii,
  plugins: [Vt]
};
export {
  Bi as mountConfig
};
//# sourceMappingURL=lazy-mount-CaZmGFaW.js.map

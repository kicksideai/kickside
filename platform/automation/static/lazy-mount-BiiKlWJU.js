import { P as Vt } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as ue, computed as P, openBlock as u, createElementBlock as f, withModifiers as je, Fragment as K, createElementVNode as l, createTextVNode as se, toDisplayString as w, createCommentVNode as R, createVNode as S, unref as n, watch as $e, onBeforeUnmount as ze, createBlock as B, normalizeClass as q, withCtx as z, withDirectives as fe, isRef as Ht, vModelText as Ue, renderList as ee, vModelCheckbox as tt, vModelDynamic as qt, ref as E, nextTick as Ne } from "vue";
import G from "primevue/button";
import Bt from "primevue/progressspinner";
import { on as nt, api as re, host as Le, loadByTagName as Kt } from "@wippy-fe/proxy";
import { Icon as N } from "@iconify/vue";
import ge from "primevue/dialog";
import at from "primevue/tag";
import { e as X, _ as we } from "./WcMount.vue_vue_type_script_setup_true_lang-DeFg3QZK.js";
import { a as Wt, u as Gt, b as Jt } from "./wc-runtime-KO3cNuNo.js";
import { a as Yt, e as Zt, b as Qt, f as Xt, d as Ye, v as en, c as tn, u as nn, i as an } from "./install-form-6s2z0ljk.js";
import on from "primevue/select";
import { _ as sn } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-CU5LLZRq.js";
import { r as rn } from "./principals-Bury5BH3.js";
const ln = { key: 0 }, un = /* @__PURE__ */ ue({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, a = P(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (s, i) => e.state.deleting_at ? (u(), f("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: i[1] || (i[1] = je(() => {
      }, ["stop"])),
      onKeydown: i[2] || (i[2] = je(() => {
      }, ["stop"]))
    }, [
      a.value ? (u(), f(K, { key: 0 }, [
        l("span", null, [
          i[3] || (i[3] = se("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (u(), f("span", ln, ": " + w(e.state.deletion_job.last_error), 1)) : R("", !0)
        ]),
        S(n(G), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: i[0] || (i[0] = je((r) => s.$emit("retry"), ["stop"]))
        })
      ], 64)) : (u(), f(K, { key: 1 }, [
        S(n(Bt), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        i[4] || (i[4] = l("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : R("", !0);
  }
});
function be(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function cn(e, t) {
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
function dn(e, t) {
  if (!t) return e;
  const a = {};
  for (const [s, i] of Object.entries(e))
    a[s] = cn(t[s], i);
  return a;
}
function ot(e, t, a) {
  if (t !== void 0 && !t) return null;
  const s = be(e) ? e : {}, i = [
    s,
    be(s.data) ? s.data : null,
    be(s.payload) ? s.payload : null,
    be(s.detail) ? s.detail : null
  ].filter(Boolean);
  for (const r of i) {
    if (r.event !== "component.meta.changed" && r.event !== "component.deleting" && r.event !== "component.deleted") continue;
    const p = String(r.component_id || ""), _ = String(s.topic || r.topic || "");
    if (t === void 0) {
      if (!p && (!_.startsWith("component.") || _ === "component.")) continue;
    } else if (p && p !== t || !p && _ !== `component.${t}`) continue;
    const A = p || t || _.slice(10);
    return r.event === "component.deleting" && typeof r.deletion_job_id == "string" && r.deletion_job_id ? { event: r.event, component_id: A, deletion_job_id: r.deletion_job_id } : r.event !== "component.meta.changed" ? { event: r.event, component_id: A } : {
      event: "component.meta.changed",
      component_id: A,
      meta: dn(be(r.meta) ? r.meta : {}, a),
      deleted: Array.isArray(r.deleted) ? r.deleted.map(String) : []
    };
  }
  return null;
}
function fn(e, t, a) {
  const s = ot(e, t, a);
  return s?.event === "component.meta.changed" ? s : null;
}
function vn(e, t) {
  const a = ot(e, t);
  return a && a.event !== "component.meta.changed" ? a : null;
}
function pn(e, t, a) {
  if (!e) return null;
  const s = nt(`component.${e}`, (i) => {
    const r = fn(i, e, a);
    r && t(r);
  });
  return typeof s == "function" ? s : null;
}
function mn(e, t, a, s) {
  const i = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  function p(y, g) {
    const b = e.value.find((U) => t(U) === y), v = r.get(y), c = g?.job_id || v?.state.deletion_job_id || b?.deletion_job_id, x = v ? v.state.deletion_job_id : b?.deleting_at ? b.deletion_job_id : void 0;
    if ((v || b?.deleting_at) && c === x || c && v?.superseded.has(c)) return;
    const M = {
      deleting_at: v?.state.deleting_at || b?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: c
    }, O = new Set(v?.superseded);
    for (const U of [v?.state.deletion_job_id, b?.deletion_job_id])
      U && U !== c && O.add(U);
    r.set(y, { state: M, superseded: O }), b && (Object.assign(b, M), b.deletion_job = void 0);
  }
  const _ = $e(() => e.value, (y, g = []) => {
    const b = y.filter((v) => !i.has(t(v)));
    for (const v of g)
      i.has(t(v)) || b.some((c) => t(c) === t(v)) || v.deleting_at && s?.(t(v));
    if (b.length !== y.length) {
      e.value = b;
      return;
    }
    for (const v of y) {
      v.deleting_at && v.deletion_job === void 0 && !g.includes(v) && (v.deletion_job = null);
      const c = r.get(t(v));
      if (c) {
        const M = v.deletion_job_id;
        v.deleting_at && M && M !== c.state.deletion_job_id && !c.superseded.has(M) && (c.state.deletion_job_id && c.superseded.add(c.state.deletion_job_id), c.state.deletion_job_id = M), M !== c.state.deletion_job_id && (v.deletion_job = void 0), Object.assign(v, c.state);
      }
      const x = g.find((M) => t(M) === t(v));
      v.deletion_job === void 0 && x?.deletion_job_id === v.deletion_job_id && (v.deletion_job = x?.deletion_job);
    }
  }, { immediate: !0 }), A = nt("@message", (y) => {
    const g = vn(y);
    if (!g) return;
    const b = e.value.find((v) => t(v) === g.component_id);
    g.event === "component.deleted" ? (b && !i.has(g.component_id) && s?.(g.component_id), i.add(g.component_id), r.delete(g.component_id), e.value = e.value.filter((v) => t(v) !== g.component_id)) : b && p(g.component_id, { job_id: g.deletion_job_id });
  });
  return ze(() => {
    _(), typeof A == "function" && A();
  }), { acceptDeletion: p };
}
function yn(e) {
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
function le(e, t) {
  const a = yn(e);
  if (a === null) return "";
  const s = t?.now ?? Date.now(), i = t?.suffix ?? !0, r = t?.maxUnit ?? "day", p = t?.future ?? !1, _ = 6e4, A = 60 * _, y = 24 * A, g = 30 * y, b = 365 * y, v = s - a;
  if (p && v < 0) {
    const M = -v;
    return M < _ ? "in <1m" : M < A ? `in ${Math.floor(M / _)}m` : M < y ? `in ${Math.floor(M / A)}h` : `in ${Math.floor(M / y)}d`;
  }
  const c = Math.max(0, v);
  if (c < _) return "just now";
  const x = i ? " ago" : "";
  return c < A ? `${Math.floor(c / _)}m${x}` : c < y ? `${Math.floor(c / A)}h${x}` : r === "year" ? c < g ? `${Math.floor(c / y)}d${x}` : c < b ? `${Math.floor(c / g)}mo${x}` : `${Math.floor(c / b)}y${x}` : `${Math.floor(c / y)}d${x}`;
}
function Oe(e) {
  return String(e.description || "").trim();
}
function st(e) {
  const t = e?.tag_name;
  return typeof t == "string" ? t.trim() : "";
}
function it(e) {
  const t = typeof e?.base_path == "string" ? e.base_path.trim() : "", a = typeof e?.entry_point == "string" ? e.entry_point.trim() : "";
  return t && a ? `/${t}/${a}` : typeof e?.url == "string" ? e.url.trim() : "";
}
function Fe(e) {
  return st(e?.component?.create_ui);
}
function bn(e) {
  return it(e?.component?.create_ui);
}
function Ve(e) {
  return st(e?.component?.manage_ui);
}
function rt(e) {
  return it(e?.component?.manage_ui);
}
function lt(e, t) {
  return { id: e.id, automation: e, public_state: e.public_state || {}, type: t };
}
let Ze = 0;
function _n(e) {
  e && (Ze += 1, e.setAttribute("submit-nonce", String(Ze)));
}
const kn = { class: "kx-modal-head-icon" }, hn = { class: "kx-modal-head-text" }, gn = { class: "kx-modal-head-title" }, xn = {
  key: 0,
  class: "kx-2p-l"
}, $n = { class: "kx-cat-search" }, wn = {
  key: 0,
  class: "kx-cat-empty"
}, Cn = {
  key: 1,
  class: "kx-cat"
}, Sn = ["onClick"], Rn = { class: "kx-cat-ico" }, An = { class: "kx-cat-text" }, Mn = { class: "kx-cat-name" }, Dn = {
  key: 0,
  class: "kx-cat-desc"
}, Tn = { class: "kx-2p-r" }, In = {
  key: 0,
  class: "kx-2p-r-head"
}, Pn = { class: "kx-2p-r-body" }, jn = {
  key: 0,
  class: "kx-2p-r-note"
}, Nn = {
  key: 1,
  class: "kx-2p-r-note"
}, En = {
  key: 2,
  class: "kx-form"
}, Un = { class: "kx-field-lbl" }, Ln = {
  key: 0,
  class: "kx-req",
  "aria-hidden": "true"
}, On = ["onUpdate:modelValue"], Fn = ["onUpdate:modelValue"], zn = ["onUpdate:modelValue", "type", "placeholder"], Vn = {
  key: 4,
  class: "kx-field-hint"
}, Hn = {
  key: 5,
  class: "kx-field-hint"
}, qn = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, Bn = /* @__PURE__ */ ue({
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
      installType: r,
      installForm: p,
      installing: _,
      customSaving: A,
      installError: y,
      customInstallHost: g,
      installSearchInput: b,
      typeSearch: v,
      filteredTypes: c,
      chooseType: x,
      closeInstall: M,
      focusInstallDialog: O,
      onCreate: U
    } = t.flow;
    return (te, W) => (u(), B(n(ge), {
      visible: n(i),
      modal: !0,
      "block-scroll": !0,
      "dismissable-mask": !0,
      pt: e.dialogPt,
      class: q(["kx-modal kx-modal-2p", { "kx-modal-solo": !n(a) }]),
      "aria-label": "Add an automation",
      "onUpdate:visible": W[1] || (W[1] = (I) => {
        I || n(M)();
      }),
      onShow: n(O)
    }, {
      header: z(() => [
        l("span", kn, [
          S(n(N), {
            icon: n(r) && n(r).icon || "tabler:bolt",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        l("span", hn, [
          l("span", gn, w(n(r) ? n(r).title || n(r).name : "Add an automation"), 1),
          W[2] || (W[2] = l("span", { class: "kx-modal-head-sub" }, "Configure an automation.", -1))
        ])
      ]),
      footer: z(() => [
        n(y) ? (u(), f("div", qn, w(n(y)), 1)) : R("", !0),
        S(n(G), {
          type: "button",
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: n(_) || n(A),
          onClick: n(M)
        }, null, 8, ["disabled", "onClick"]),
        n(r) ? (u(), B(n(G), {
          key: 1,
          type: "button",
          "data-testid": "automations-install-create",
          label: n(_) || n(A) ? "Creating…" : "Create",
          loading: n(_) || n(A),
          disabled: n(_) || n(A),
          onClick: n(U)
        }, {
          icon: z(({ class: I }) => [
            S(n(N), {
              icon: "tabler:plus",
              class: q(I),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }, 8, ["label", "loading", "disabled", "onClick"])) : R("", !0)
      ]),
      default: z(() => [
        l("div", {
          class: q(["kx-2p", { "kx-2p-solo": !n(a) }])
        }, [
          n(a) ? (u(), f("div", xn, [
            l("div", $n, [
              S(n(N), {
                icon: "tabler:search",
                "aria-hidden": "true"
              }),
              fe(l("input", {
                ref_key: "installSearchInput",
                ref: b,
                "onUpdate:modelValue": W[0] || (W[0] = (I) => Ht(v) ? v.value = I : null),
                "data-modal-initial": "",
                type: "text",
                placeholder: "Search types…",
                "aria-label": "Search automation types"
              }, null, 512), [
                [Ue, n(v)]
              ])
            ]),
            n(c).length ? (u(), f("div", Cn, [
              (u(!0), f(K, null, ee(n(c), (I) => (u(), f("button", {
                key: I.id,
                class: q(["kx-cat-card", n(r)?.id === I.id && "sel"]),
                onClick: (L) => n(x)(I)
              }, [
                l("span", Rn, [
                  S(n(N), {
                    icon: I.icon || "tabler:sparkles",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                l("span", An, [
                  l("span", Mn, w(I.title || I.name), 1),
                  n(Oe)(I) ? (u(), f("span", Dn, w(n(Oe)(I)), 1)) : R("", !0)
                ]),
                S(n(N), {
                  icon: "tabler:check",
                  class: "kx-cat-check",
                  "aria-hidden": "true"
                })
              ], 10, Sn))), 128))
            ])) : (u(), f("div", wn, "No setups match “" + w(n(v)) + "”.", 1))
          ])) : R("", !0),
          l("div", Tn, [
            n(a) ? (u(), f("div", In, "Setup")) : R("", !0),
            l("div", Pn, [
              n(r) ? (u(), f(K, { key: 1 }, [
                n(Fe)(n(r)) ? (u(), f("div", {
                  key: 0,
                  ref_key: "customInstallHost",
                  ref: g,
                  class: "kx-custom-host"
                }, null, 512)) : n(s).length ? (u(), f("div", En, [
                  (u(!0), f(K, null, ee(n(s), ([I, L]) => (u(), f("label", {
                    key: I,
                    class: "kx-field"
                  }, [
                    l("span", Un, [
                      se(w(L.title || I) + " ", 1),
                      n(Yt)(n(r), I) ? (u(), f("span", Ln, "*")) : R("", !0)
                    ]),
                    L.enum ? (u(), B(n(on), {
                      key: 0,
                      class: "kx-select",
                      "model-value": n(p)[I],
                      options: n(Zt)(n(r), I, L),
                      "option-label": "label",
                      "option-value": "value",
                      placeholder: "—",
                      "aria-label": L.title || I,
                      "onUpdate:modelValue": (V) => n(p)[I] = V
                    }, null, 8, ["model-value", "options", "aria-label", "onUpdate:modelValue"])) : L.type === "boolean" ? fe((u(), f("input", {
                      key: 1,
                      "onUpdate:modelValue": (V) => n(p)[I] = V,
                      class: "kx-check",
                      type: "checkbox"
                    }, null, 8, On)), [
                      [tt, n(p)[I]]
                    ]) : L.type === "number" || L.type === "integer" ? fe((u(), f("input", {
                      key: 2,
                      "onUpdate:modelValue": (V) => n(p)[I] = V,
                      class: "kx-input",
                      type: "number"
                    }, null, 8, Fn)), [
                      [
                        Ue,
                        n(p)[I],
                        void 0,
                        { number: !0 }
                      ]
                    ]) : fe((u(), f("input", {
                      key: 3,
                      "onUpdate:modelValue": (V) => n(p)[I] = V,
                      class: "kx-input",
                      type: n(Qt)(L),
                      placeholder: L.description || ""
                    }, null, 8, zn)), [
                      [qt, n(p)[I]]
                    ]),
                    L.description && !(L.type !== "boolean" && !L.enum) ? (u(), f("span", Vn, w(L.description), 1)) : L.description && L.enum ? (u(), f("span", Hn, w(L.description), 1)) : R("", !0)
                  ]))), 128))
                ])) : (u(), f("div", Nn, "This automation needs no configuration."))
              ], 64)) : (u(), f("p", jn, "Select an automation type to configure it."))
            ])
          ])
        ], 2)
      ]),
      _: 1
    }, 8, ["visible", "pt", "class", "onShow"]));
  }
}), Kn = {
  key: 0,
  class: "kx-metrics"
}, Wn = { class: "kx-metric-k" }, Gn = ["title"], Jn = {
  key: 1,
  class: "kx-metric-details"
}, Yn = { class: "kx-metrics kx-metrics-detail" }, Zn = { class: "kx-metric-k" }, Qn = ["title"], Xn = /* @__PURE__ */ ue({
  __name: "RowMetrics",
  props: {
    face: { default: () => [] },
    detail: { default: () => [] }
  },
  setup(e) {
    return (t, a) => (u(), f(K, null, [
      e.face.length ? (u(), f("div", Kn, [
        (u(!0), f(K, null, ee(e.face, (s) => (u(), f("span", {
          key: s.label,
          class: "kx-metric"
        }, [
          s.icon ? (u(), B(n(N), {
            key: 0,
            icon: s.icon,
            class: "kx-metric-i",
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : R("", !0),
          l("span", Wn, w(s.label), 1),
          l("span", {
            class: "kx-metric-v",
            title: s.title
          }, w(s.value), 9, Gn)
        ]))), 128))
      ])) : R("", !0),
      e.detail.length ? (u(), f("details", Jn, [
        a[0] || (a[0] = l("summary", { class: "kx-metric-more" }, "Details", -1)),
        l("div", Yn, [
          (u(!0), f(K, null, ee(e.detail, (s) => (u(), f("span", {
            key: s.label,
            class: "kx-metric"
          }, [
            s.icon ? (u(), B(n(N), {
              key: 0,
              icon: s.icon,
              class: "kx-metric-i",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : R("", !0),
            l("span", Zn, w(s.label), 1),
            l("span", {
              class: "kx-metric-v",
              title: s.title
            }, w(s.value), 9, Qn)
          ]))), 128))
        ])
      ])) : R("", !0)
    ], 64));
  }
}), ea = /* @__PURE__ */ new Set(["pause", "resume"]), ta = /* @__PURE__ */ new Set(["reconfigure"]), Qe = /* @__PURE__ */ new Set(["run_now", "trigger", "execute", "run"]), Ee = {
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
function na(e) {
  return e.replace(/[._-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Xe(e) {
  return { label: na(e), description: "Run this action.", group: "recovery", icon: "tabler:bolt" };
}
function ct(e) {
  return new Set([...e?.controls || [], ...e?.actions || []].map((t) => t.name).filter(Boolean));
}
function dt(e) {
  const t = [...ct(e)], a = !!Ve(e);
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
    const s = Ee[e.runNow] || Ee.trigger;
    t.push({ method: e.runNow, ...s, kind: "call" });
  }
  const a = /* @__PURE__ */ new Set();
  for (const s of e.declared) {
    if (ea.has(s) || s === e.runNow || e.runNow !== "run_now" && Qe.has(s) || ta.has(s) || a.has(s)) continue;
    a.add(s);
    const i = e.runNow === "run_now" && Qe.has(s) ? { ...Xe(s), group: "run" } : Ee[s] || Xe(s);
    t.push({ method: s, ...i, kind: "call", disabled: e.requiresKeys?.includes(s) });
  }
  return e.canReconfigure && t.push({ method: "reconfigure", label: "Reconfigure", description: "Change how this automation is set up.", group: "edit", icon: "tabler:settings", kind: "reconfigure" }), e.canShare && t.push({ method: "share", label: "Share", description: "Give other people access to this automation.", group: "edit", icon: "tabler:users", kind: "share" }), e.canExport && t.push({ method: "export", label: "Export", description: "Download a portable copy to import elsewhere.", group: "edit", icon: "tabler:download", kind: "export" }), e.canDelete && t.push({ method: "delete", label: "Delete", description: "Stop it and remove its setup. This cannot be undone.", group: "delete", icon: "tabler:trash", kind: "delete", danger: !0 }), t;
}
const aa = ["run", "recovery", "edit", "delete"], oa = {
  run: "Run",
  recovery: "Recovery",
  edit: "Edit",
  delete: ""
};
function sa(e) {
  return aa.map((t) => ({ group: t, label: oa[t], items: e.filter((a) => a.group === t) })).filter((t) => t.items.length > 0);
}
function ia(e, t) {
  return e.group === "run" ? `Run ${t} now` : e.method === "reconfigure" ? `Edit ${t}` : `${e.label} ${t}`;
}
const ra = ["aria-label"], la = {
  key: 1,
  class: "kx-menu-sep",
  role: "separator"
}, ua = ["data-testid", "aria-label", "disabled", "onClick"], ca = { class: "kx-menu-item-body" }, da = { class: "kx-menu-item-label" }, fa = { class: "kx-menu-item-desc" }, pt = /* @__PURE__ */ ue({
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
    const a = e, s = t, i = E(!1), r = E(null), p = P(() => sa(a.items));
    function _() {
      i.value = !i.value;
    }
    function A() {
      i.value = !1;
    }
    function y(g) {
      a.disabled || g.disabled || (A(), s("select", g.method));
    }
    return (g, b) => (u(), f("span", {
      ref_key: "trigger",
      ref: r,
      class: "kx-menu"
    }, [
      S(n(G), {
        type: "button",
        severity: "secondary",
        outlined: "",
        size: e.size === "normal" ? void 0 : "small",
        class: q(["kx-menu-trigger", i.value && "is-active"]),
        "aria-haspopup": !0,
        "aria-expanded": i.value,
        "aria-label": e.triggerLabel || `More actions for ${e.name}`,
        title: "More actions",
        disabled: e.disabled,
        onClick: _
      }, {
        icon: z(({ class: v }) => [
          S(n(N), {
            icon: "tabler:dots",
            "aria-hidden": "true",
            class: q(v)
          }, null, 8, ["class"])
        ]),
        _: 1
      }, 8, ["size", "class", "aria-expanded", "aria-label", "disabled"]),
      S(sn, {
        open: i.value,
        "onUpdate:open": b[0] || (b[0] = (v) => i.value = v),
        anchor: r.value,
        align: "right",
        width: 264,
        "max-height": 460,
        gap: 6
      }, {
        default: z(() => [
          l("div", {
            class: "kx-menu-panel",
            role: "menu",
            "aria-label": `Actions for ${e.name}`
          }, [
            (u(!0), f(K, null, ee(p.value, (v, c) => (u(), f(K, {
              key: v.group
            }, [
              v.label ? (u(), f("div", {
                key: 0,
                class: q(["kx-menu-group", c === 0 && "is-first"])
              }, w(v.label), 3)) : c > 0 ? (u(), f("div", la)) : R("", !0),
              (u(!0), f(K, null, ee(v.items, (x) => (u(), f("button", {
                key: x.method,
                type: "button",
                role: "menuitem",
                class: q(["kx-menu-item", [x.danger && "is-danger", x.warn && "is-warn"]]),
                "data-testid": `action-${x.method}`,
                "aria-label": n(ia)(x, e.name),
                disabled: e.disabled || x.disabled || e.busy && x.kind === "call",
                onClick: (M) => y(x)
              }, [
                S(n(N), {
                  icon: x.icon,
                  class: "kx-menu-item-ico",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                l("span", ca, [
                  l("span", da, [
                    se(w(x.label) + " ", 1),
                    x.warn ? (u(), B(n(N), {
                      key: 0,
                      icon: "tabler:alert-triangle",
                      class: "kx-menu-item-warn",
                      "aria-hidden": "true"
                    })) : R("", !0)
                  ]),
                  l("span", fa, w(x.description), 1)
                ])
              ], 10, ua))), 128))
            ], 64))), 128))
          ], 8, ra)
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 512));
  }
}), va = {
  "aria-label": "History",
  class: "kx-history"
}, pa = {
  key: 0,
  role: "status",
  class: "kx-dnote"
}, ma = {
  key: 1,
  role: "alert",
  class: "kx-dnote kx-dnote-err"
}, ya = {
  key: 0,
  class: "kx-dnote"
}, ba = { class: "kx-history-head" }, _a = ["datetime"], ka = { class: "kx-history-state" }, ha = { class: "kx-history-kv" }, ga = { class: "kx-dfact-k" }, xa = ["aria-label"], $a = {
  class: "kx-history-v",
  "aria-label": "Authorized by"
}, wa = {
  key: 0,
  class: "kx-dmsg is-err"
}, Ca = /* @__PURE__ */ ue({
  __name: "ExecutionHistory",
  props: {
    root: {}
  },
  emits: ["error"],
  setup(e, { emit: t }) {
    const a = e, s = t, i = E([]), r = E([]), p = E([]), _ = E(""), A = E(""), y = E(!1), g = E("");
    let b = 0;
    function v() {
      i.value = [], r.value = [], p.value = [], _.value = "", A.value = "";
    }
    function c(m) {
      return p.value.find((j) => j.type === m?.kind && j.id === m?.id)?.label || "Account unavailable";
    }
    function x(m, j) {
      const o = c(j);
      return m.evidence_status === "inferred" ? `${o} (unverified)` : o;
    }
    function M(m) {
      return m.evidence_status === "absent" ? "Account not recorded" : m.evidence_status === "unresolved" ? "Account unavailable" : x(m, m.evidence?.identity?.principal);
    }
    function O(m) {
      return {
        resolved: "Completed",
        waiting: "Waiting to retry",
        uncertain: "Needs attention",
        failed: "Failed",
        filtered: "Skipped",
        superseded: "Replaced",
        succeeded: "Accepted",
        pending: "Updating…"
      }[m] || "Outcome unavailable";
    }
    const U = P(() => [
      ...i.value.map((m) => ({
        key: te(m),
        at: m.round_at,
        state: m.state,
        account: M(m),
        role: "Run by",
        authorizer: m.evidence?.identity?.authorized_by ? x(m, m.evidence.identity.authorized_by) : void 0,
        error: W(m.error)
      })),
      ...r.value.map((m) => ({
        key: `${m.generation}:${m.request_id}`,
        at: m.created_at,
        state: m.state,
        account: m.initiation ? c({ kind: "user", id: m.initiation.actor_id }) : "Account not recorded",
        role: "Requested by",
        authorizer: void 0,
        error: ""
      }))
    ].sort((m, j) => j.at.localeCompare(m.at) || m.key.localeCompare(j.key)));
    function te(m) {
      return JSON.stringify([m.drive_key, m.round_token, m.source_port, m.item_key, m.identity_key]);
    }
    function W(m) {
      return X(m, typeof m == "string" ? m : "");
    }
    async function I(m, j, o = "") {
      const { data: $ } = await re.get(
        "/api/v1/automations/" + encodeURIComponent(m) + "/history",
        { params: { kind: j, page_size: 25, ...o ? { page_token: o } : {} } }
      );
      if (!$.success || $.kind !== j || !Array.isArray($.entries)) throw new Error($.error?.message || "Could not read execution history");
      if ($.next_page_token && $.next_page_token === o) throw new Error("History page repeats its cursor");
      return $;
    }
    async function L(m, j) {
      const o = /* @__PURE__ */ new Map();
      function $(C) {
        C && (C.kind === "user" || C.kind === "group") && o.set(C.kind + ":" + C.id, { type: C.kind, id: C.id });
      }
      for (const C of m)
        $(C.evidence?.identity?.principal), $(C.evidence?.identity?.authorized_by);
      for (const C of j)
        C.initiation && $({ kind: "user", id: C.initiation.actor_id });
      return rn([...o.values()]);
    }
    function V(m) {
      v(), g.value = X(m, "Could not read execution history"), s("error", { message: g.value, error: m });
    }
    async function J() {
      const m = ++b, j = a.root;
      if (v(), g.value = "", y.value = !1, !!j) {
        y.value = !0;
        try {
          const [o, $] = await Promise.all([I(j, "deliveries"), I(j, "controls")]), C = await L(o.entries, $.entries);
          if (m !== b) return;
          i.value = o.entries, r.value = $.entries, p.value = C, _.value = o.next_page_token || "", A.value = $.next_page_token || "";
        } catch (o) {
          m === b && V(o);
        } finally {
          m === b && (y.value = !1);
        }
      }
    }
    async function ne() {
      if (y.value || !_.value && !A.value) return;
      const m = b, j = a.root;
      y.value = !0, g.value = "";
      try {
        const [o, $] = await Promise.all([
          _.value ? I(j, "deliveries", _.value) : null,
          A.value ? I(j, "controls", A.value) : null
        ]), C = [...i.value, ...o?.entries || []], Y = [...r.value, ...$?.entries || []], ve = await L(C, Y);
        if (m !== b) return;
        i.value = C, r.value = Y, p.value = ve, _.value = o?.next_page_token || "", A.value = $?.next_page_token || "";
      } catch (o) {
        m === b && V(o);
      } finally {
        m === b && (y.value = !1);
      }
    }
    return $e(() => a.root, () => {
      J();
    }, { immediate: !0 }), ze(() => {
      b += 1;
    }), (m, j) => (u(), f("section", va, [
      j[1] || (j[1] = l("h3", { class: "kx-dsub-lbl" }, "History", -1)),
      y.value ? (u(), f("p", pa, "Loading history…")) : R("", !0),
      g.value ? (u(), f("p", ma, w(g.value), 1)) : (u(), f(K, { key: 2 }, [
        !y.value && !U.value.length ? (u(), f("p", ya, "No history yet.")) : R("", !0),
        (u(!0), f(K, null, ee(U.value, (o) => (u(), f("article", {
          key: o.key,
          class: "kx-history-entry"
        }, [
          l("div", ba, [
            l("time", {
              class: "kx-history-meta",
              datetime: o.at
            }, w(n(le)(o.at, { future: !0 })), 9, _a),
            l("span", ka, w(O(o.state)), 1)
          ]),
          l("dl", ha, [
            l("dt", ga, w(o.role), 1),
            l("dd", {
              class: "kx-history-v",
              "aria-label": o.role
            }, w(o.account), 9, xa),
            o.authorizer ? (u(), f(K, { key: 0 }, [
              j[0] || (j[0] = l("dt", { class: "kx-dfact-k" }, "Authorized by", -1)),
              l("dd", $a, w(o.authorizer), 1)
            ], 64)) : R("", !0)
          ]),
          o.error ? (u(), f("p", wa, w(o.error), 1)) : R("", !0)
        ]))), 128)),
        _.value || A.value ? (u(), B(n(G), {
          key: 1,
          label: "More history",
          severity: "secondary",
          disabled: y.value,
          onClick: ne
        }, null, 8, ["disabled"])) : R("", !0)
      ], 64))
    ]));
  }
});
function ke(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Sa(e) {
  return ke(e) && typeof e.code == "string" && typeof e.message == "string" && typeof e.at == "string" && (e.item_key === void 0 || typeof e.item_key == "string");
}
function Ra(e) {
  if (!ke(e) || typeof e.drive_key != "string") return !1;
  for (const t of ["source_kind", "phase"])
    if (e[t] !== void 0 && typeof e[t] != "string") return !1;
  if (e.enabled !== void 0 && typeof e.enabled != "boolean") return !1;
  for (const t of ["next_run_at", "last_run_at", "last_round_at"])
    if (e[t] !== void 0 && e[t] !== null && typeof e[t] != "string") return !1;
  for (const t of ["unresolved_count", "uncertain_count"])
    if (e[t] !== void 0 && (typeof e[t] != "number" || !Number.isInteger(e[t]) || e[t] < 0)) return !1;
  return !(e.last_error !== void 0 && e.last_error !== null && (!ke(e.last_error) || e.last_error.message !== void 0 && typeof e.last_error.message != "string"));
}
function Aa(e) {
  if (!ke(e) || e.success !== !0 || !Array.isArray(e.drives) || !e.drives.every(Ra) || e.next_page_token !== void 0 && e.next_page_token !== null && (typeof e.next_page_token != "string" || !e.next_page_token)) return !1;
  const t = e.delivery_failures;
  return t === void 0 || ke(t) && typeof t.count == "number" && Number.isInteger(t.count) && t.count >= 0 && (t.last_error === void 0 || Sa(t.last_error));
}
const mt = {
  blocked_identity: "The account this automation runs as needs to be confirmed.",
  blocked_access: "This automation lost access to something it uses.",
  blocked_declaration: "This automation's settings need to be fixed."
};
function Se(e) {
  return (e?.drives || []).filter((t) => t.source_kind !== "none");
}
function xe(e) {
  return e.enabled === !1 || e.phase === "paused";
}
function et(e) {
  return (e.source_kind === "timer" || e.source_kind === "collection") && (e.phase === "pending" || e.phase === "active") && typeof e.next_run_at == "string" && Date.parse(e.next_run_at) > Date.now();
}
function Ma(e) {
  const t = Se(e), a = (e?.delivery_failures?.count || 0) > 0;
  if (!t.length) return a ? { kind: "warn", label: "Needs attention" } : null;
  if (t.some((i) => (i.phase || "") in mt)) return { kind: "warn", label: "Needs attention" };
  if (t.every(xe)) return { kind: "off", label: "Paused" };
  if (a) return { kind: "warn", label: "Needs attention" };
  if (t.some((i) => i.phase === "degraded")) return { kind: "warn", label: "Retrying" };
  if (t.some((i) => i.phase === "backpressure")) return { kind: "live", label: "Catching up" };
  if (t.some((i) => !xe(i) && i.phase === "pending" && !et(i))) return { kind: "neutral", label: "Starting" };
  const s = t.filter((i) => !xe(i) && i.source_kind !== "reconcile");
  return s.length && s.every(et) ? { kind: "on", label: "Scheduled" } : { kind: "on", label: "Active" };
}
function Da(e) {
  const t = e?.delivery_failures?.last_error;
  if (t) return `${t.code}: ${t.message}`;
  const a = Se(e);
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
function Ta(e) {
  const t = Se(e), a = [], s = _e(e).next;
  s && a.push({ label: "Next run", value: s, time: !0 });
  const i = t.reduce((r, p) => r + (p.unresolved_count || 0), 0);
  return i > 0 && a.push({ label: "Waiting to retry", value: `${i} ${i === 1 ? "item" : "items"}` }), a;
}
function _e(e) {
  const t = Se(e), a = t.map((i) => i.last_run_at).filter((i) => typeof i == "string" && !!i).sort().at(-1), s = t.filter((i) => !xe(i)).map((i) => i.next_run_at).filter((i) => typeof i == "string" && !!i).sort()[0];
  return { last: a, next: s };
}
const Ia = /* @__PURE__ */ new Set(["status", "enabled", "last_error", "last_run_at", "next_run_at"]);
function Pa(e) {
  return e.replace(/_/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function ja(e) {
  return e.replace(/\b\w/g, (t) => t.toUpperCase());
}
function Na(e) {
  return e && e.charAt(0).toUpperCase() + e.slice(1);
}
function Ea(e, t) {
  if (e.type === "boolean") return t === !0 ? "Yes" : "No";
  const a = String(t);
  return e.key.endsWith("_at") || /^\d{4}-\d{2}-\d{2}T/.test(a) ? le(a, { future: !0 }) || a : e.type === "text" ? Na(a) : a;
}
function yt(e) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e) || /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(e) ? !0 : /^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9:_-]*$/i.test(e) && /:[0-9a-f-]{6,}/i.test(e);
}
function Ua(e) {
  return yt(e) ? { text: e.length > 12 ? `${e.slice(0, 8)}…` : e, title: e } : { text: e };
}
const La = [
  { match: /component_id not in scope|not in scope/i, text: "Not part of this workspace" },
  { match: /transform output must be an object/i, text: "Item format not recognized" },
  { match: /trigger events dropped/i, text: "Incoming events were dropped" },
  { match: /requires dest_ref/i, text: "Missing a destination reference" },
  { match: /does not declare sink operation|accepts source payloads only/i, text: "Destination cannot accept this item" },
  { match: /sink write (returned a non-object|did not acknowledge)/i, text: "Destination did not confirm the save" },
  { match: /(sink|source) resolve/i, text: "Source or destination unavailable" }
];
function Oa(e) {
  const t = e.trim();
  if (!t) return { text: "" };
  for (const a of La)
    if (a.match.test(t)) return { text: a.text, title: t };
  return { text: "Skipped", title: t };
}
function bt(e) {
  return /reason/i.test(e);
}
function Fa(e, t) {
  return bt(e.key) || /(^|_)item(_key)?$/i.test(e.key) ? !0 : typeof t == "string" && yt(t);
}
function za(e, t) {
  const a = ja(e.label || Pa(e.key));
  if (bt(e.key)) {
    const { text: r, title: p } = Oa(String(t));
    return { label: a, value: r, title: p, icon: e.icon };
  }
  const { text: s, title: i } = Ua(Ea(e, t));
  return { label: a, value: s, title: i, icon: e.icon };
}
function Ce(e, t, a) {
  const s = t;
  if (!e || !s) return [];
  const i = [];
  for (const r of e) {
    if (!r?.key || Ia.has(r.key) || r.role === "subtitle") continue;
    const p = s[r.key];
    p == null || p === "" || r.hidden || r.hide_zero && p === 0 || Fa(r, p) === a && i.push(za(r, p));
  }
  return i;
}
function He(e) {
  return String(e?.status || "").toLowerCase();
}
function Va(e) {
  return typeof e == "string" && /\b(completed|succeeded|successfully)\b/i.test(e);
}
function _t(e) {
  const t = He(e);
  return t === "completed" || t === "failed";
}
function qe(e) {
  const t = He(e);
  return t === "failed" || t === "failing" ? !0 : !!e?.last_error && !Va(e.last_error);
}
function kt(e, t) {
  if (t?.code === "unavailable") return { tone: "error", text: "Its module is unavailable. Reinstall its module to use this automation." };
  const a = typeof e?.last_error == "string" ? e.last_error.trim() : "";
  return a ? qe(e) ? { tone: "error", text: a } : { tone: "success", text: a } : null;
}
function ht(e, t, a, s) {
  if (s?.code === "unavailable") return { kind: "warn", label: "Unavailable" };
  const i = Ma(a);
  if (i) return i;
  if (!e)
    return t ? { kind: "neutral", label: "…" } : { kind: "neutral", label: "Installed" };
  const r = He(e);
  return qe(e) ? { kind: "warn", label: r === "failed" ? "Failed" : "Failing" } : r === "completed" ? { kind: "done", label: "Completed" } : r === "paused" || e.enabled === !1 ? { kind: "off", label: "Paused" } : r === "running" ? { kind: "live", label: "Running" } : { kind: "on", label: "Active" };
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
    const r = s ? `?page_token=${encodeURIComponent(s)}` : "", { data: p } = await re.get(`/api/v1/automations/${encodeURIComponent(e)}/status${r}`);
    if (!Aa(p)) throw new Error("Invalid automation status response");
    if (t.push(...p.drives), i = p.delivery_failures, s = p.next_page_token || void 0, s && a.has(s)) throw new Error("Automation status repeated a page token");
    s && a.add(s);
  } while (s);
  return { drives: t, delivery_failures: i };
}
const Ha = ["aria-label"], qa = { class: "kx-drawer-head" }, Ba = { class: "kx-ficon" }, Ka = { class: "kx-drawer-id" }, Wa = ["title"], Ga = { class: "kx-drawer-sub" }, Ja = { class: "kx-drawer-controls" }, Ya = {
  class: "kx-tabs",
  role: "tablist"
}, Za = ["aria-selected", "data-testid", "onClick"], Qa = { class: "kx-drawer-body" }, Xa = {
  key: 0,
  class: "kx-dsec"
}, eo = {
  key: 0,
  class: "kx-errcard",
  "data-testid": "drawer-error-card"
}, to = { class: "kx-errcard-head" }, no = { class: "kx-errcard-cause" }, ao = { class: "kx-dgrid" }, oo = { class: "kx-dfact-k" }, so = { class: "kx-dfact-v" }, io = {
  key: 1,
  class: "kx-dsub"
}, ro = { class: "kx-metrics" }, lo = { class: "kx-metric-k" }, uo = ["title"], co = {
  key: 1,
  class: "kx-dsec",
  "data-testid": "drawer-config"
}, fo = {
  key: 2,
  class: "kx-dnote"
}, vo = {
  key: 2,
  class: "kx-dsec"
}, po = { class: "kx-dgrid" }, mo = { class: "kx-dfact" }, yo = { class: "kx-dfact-v" }, bo = { class: "kx-dfact" }, _o = { class: "kx-dfact-v" }, ko = { class: "kx-dfact" }, ho = { class: "kx-dfact-v" }, go = {
  key: 0,
  class: "kx-dsub"
}, xo = /* @__PURE__ */ ue({
  __name: "DetailDrawer",
  props: {
    automation: { default: () => ({ id: "" }) },
    type: {}
  },
  emits: ["close", "action", "recover", "changed"],
  setup(e, { emit: t }) {
    const a = e, s = t, i = E("overview"), r = [
      { id: "overview", label: "Overview", icon: "tabler:layout-dashboard" },
      { id: "config", label: "Config", icon: "tabler:settings" },
      { id: "activity", label: "Activity", icon: "tabler:history" }
    ], p = P(() => a.automation.title || a.automation.id), _ = P(() => a.automation.icon || a.type?.icon || "tabler:bolt"), A = P(() => a.type?.title || "Automation"), y = P(() => a.automation.public_state), g = P(() => dt(a.type)), b = P(() => vt(g.value)), v = P(() => g.value.declared.includes("status")), c = E(null);
    let x = 0;
    async function M(F) {
      const T = ++x;
      if (!F || !a.automation.drive_status || a.automation.availability) {
        c.value = null;
        return;
      }
      c.value = a.automation.drive_status;
      const D = await $t(F);
      T === x && a.automation.id === F && (c.value = D);
    }
    $e(() => [a.automation.id, a.automation.drive_status, a.automation.availability], ([F]) => {
      M(F).catch((T) => Le.handleError("other", { message: String(T) }));
    }, { immediate: !0 });
    const O = P(() => ht(y.value, v.value, c.value, a.automation.availability)), U = P(() => O.value.kind === "off"), te = P(() => _t(y.value)), W = P(() => (g.value.declared.includes("pause") || g.value.declared.includes("resume")) && !te.value), I = P(() => qe(y.value)), L = P(() => ft(g.value.declared)), V = P(() => {
      if (a.automation.availability) return kt(y.value, a.automation.availability)?.text || "";
      const F = Da(c.value);
      if (F) return F;
      const T = typeof y.value?.last_error == "string" ? y.value.last_error.trim() : "";
      return I.value ? T : "";
    }), J = P(() => xt(a.type?.public_state_schema?.fields, y.value)), ne = P(() => {
      const F = a.type?.public_state_schema?.fields;
      return [...Ce(F, y.value, !1), ...Ce(F, y.value, !0)];
    }), m = P(() => {
      const F = y.value, T = [];
      J.value && T.push({ label: "When", value: J.value });
      const D = Ta(c.value);
      F?.next_run_at && !D.some((oe) => oe.label === "Next run") && T.push({ label: "Next run", value: le(F.next_run_at, { future: !0 }) });
      for (const oe of D)
        T.push({ label: oe.label, value: oe.time ? le(oe.value, { future: !0 }) : oe.value });
      return T;
    }), j = P(() => {
      const F = c.value?.drives.flatMap((D) => typeof D.last_round_at == "string" ? [D.last_round_at] : []) || [], T = c.value?.delivery_failures?.last_error?.at;
      return T && F.push(T), F.sort().at(-1) || y.value?.last_run_at;
    }), o = P(() => c.value?.delivery_failures), $ = P(() => {
      const F = o.value?.last_error;
      return F ? `${F.code}: ${F.message}` : y.value?.last_error;
    }), C = P(() => Ve(a.type)), Y = P(() => lt(a.automation, a.type)), ve = P(() => ({ location: rt(a.type) }));
    return $e(() => a.automation.id, () => {
      i.value = "overview";
    }), (F, T) => (u(), f(K, null, [
      l("div", {
        class: "kx-drawer-scrim",
        onClick: T[0] || (T[0] = (D) => s("close"))
      }),
      l("aside", {
        class: "kx-drawer",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": p.value,
        "data-testid": "detail-drawer"
      }, [
        l("header", qa, [
          l("span", Ba, [
            S(n(N), {
              icon: _.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          l("div", Ka, [
            l("div", {
              class: "kx-drawer-name",
              title: p.value
            }, w(p.value), 9, Wa),
            l("div", Ga, w(A.value), 1)
          ]),
          S(n(at), {
            severity: n(gt)(O.value.kind),
            class: "kx-badge kx-tag-sm"
          }, {
            default: z(() => [
              O.value.kind === "live" ? (u(), B(n(N), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : R("", !0),
              se(" " + w(O.value.label), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          l("div", Ja, [
            W.value ? (u(), B(n(G), {
              key: 0,
              type: "button",
              severity: "secondary",
              outlined: "",
              size: "small",
              "aria-label": `${U.value ? "Resume" : "Pause"} ${p.value}`,
              title: U.value ? "Resume" : "Pause",
              disabled: !!e.automation.deleting_at,
              onClick: T[1] || (T[1] = (D) => !e.automation.deleting_at && s("action", U.value ? "resume" : "pause"))
            }, {
              icon: z(({ class: D }) => [
                S(n(N), {
                  icon: U.value ? "tabler:player-play-filled" : "tabler:player-pause",
                  "aria-hidden": "true",
                  class: q(D)
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["aria-label", "title", "disabled"])) : R("", !0),
            S(pt, {
              items: b.value,
              name: p.value,
              disabled: !!e.automation.deleting_at,
              onSelect: T[2] || (T[2] = (D) => !e.automation.deleting_at && s("action", D))
            }, null, 8, ["items", "name", "disabled"]),
            S(n(G), {
              type: "button",
              severity: "secondary",
              text: "",
              size: "small",
              class: "kx-drawer-close",
              "aria-label": "Close details",
              title: "Close",
              onClick: T[3] || (T[3] = (D) => s("close"))
            }, {
              icon: z(({ class: D }) => [
                S(n(N), {
                  icon: "tabler:x",
                  "aria-hidden": "true",
                  class: q(D)
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        l("nav", Ya, [
          (u(), f(K, null, ee(r, (D) => l("button", {
            key: D.id,
            type: "button",
            role: "tab",
            class: q(["kx-tab", i.value === D.id && "is-active"]),
            "aria-selected": i.value === D.id,
            "data-testid": `drawer-tab-${D.id}`,
            onClick: (oe) => i.value = D.id
          }, [
            S(n(N), {
              icon: D.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            se(" " + w(D.label), 1)
          ], 10, Za)), 64))
        ]),
        l("div", Qa, [
          i.value === "overview" ? (u(), f("section", Xa, [
            V.value ? (u(), f("div", eo, [
              l("div", to, [
                S(n(N), {
                  icon: "tabler:alert-circle",
                  "aria-hidden": "true"
                }),
                l("span", null, w(a.automation.availability ? "This automation is unavailable" : "This automation is failing"), 1)
              ]),
              l("p", no, w(V.value), 1),
              L.value ? (u(), B(n(G), {
                key: 0,
                type: "button",
                size: "small",
                severity: "danger",
                "aria-label": `Recover ${p.value}`,
                "data-testid": "drawer-recover",
                label: "Recover",
                disabled: !!e.automation.deleting_at,
                onClick: T[4] || (T[4] = (D) => !e.automation.deleting_at && s("recover"))
              }, {
                icon: z(({ class: D }) => [
                  S(n(N), {
                    icon: "tabler:rotate-clockwise-2",
                    "aria-hidden": "true",
                    class: q(D)
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["aria-label", "disabled"])) : R("", !0)
            ])) : R("", !0),
            l("div", ao, [
              (u(!0), f(K, null, ee(m.value, (D) => (u(), f("div", {
                key: D.label,
                class: "kx-dfact"
              }, [
                l("span", oo, w(D.label), 1),
                l("strong", so, w(D.value), 1)
              ]))), 128))
            ]),
            ne.value.length ? (u(), f("div", io, [
              T[9] || (T[9] = l("div", { class: "kx-dsub-lbl" }, "Progress", -1)),
              l("div", ro, [
                (u(!0), f(K, null, ee(ne.value, (D) => (u(), f("span", {
                  key: D.label,
                  class: "kx-metric"
                }, [
                  D.icon ? (u(), B(n(N), {
                    key: 0,
                    icon: D.icon,
                    class: "kx-metric-i",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : R("", !0),
                  l("span", lo, w(D.label), 1),
                  l("span", {
                    class: "kx-metric-v",
                    title: D.title
                  }, w(D.value), 9, uo)
                ]))), 128))
              ])
            ])) : R("", !0)
          ])) : i.value === "config" ? (u(), f("section", co, [
            !e.automation.deleting_at && !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (u(), B(we, {
              key: 0,
              tag: "wc-execution-identity-editor",
              attrs: { root: e.automation.id },
              onChange: T[5] || (T[5] = (D) => s("changed"))
            }, null, 8, ["attrs"])) : R("", !0),
            C.value && !e.automation.deleting_at ? (u(), B(we, {
              key: 1,
              class: "kx-manage-host",
              tag: C.value,
              config: Y.value,
              meta: ve.value,
              onChange: T[6] || (T[6] = (D) => s("changed")),
              onClose: T[7] || (T[7] = (D) => i.value = "overview")
            }, null, 8, ["tag", "config", "meta"])) : (u(), f("div", fo, "This automation type declares no settings view."))
          ])) : (u(), f("section", vo, [
            l("div", po, [
              l("div", mo, [
                T[10] || (T[10] = l("span", { class: "kx-dfact-k" }, "Last run", -1)),
                l("strong", yo, w(j.value ? n(le)(j.value, { future: !0 }) : "Never"), 1)
              ]),
              l("div", bo, [
                T[11] || (T[11] = l("span", { class: "kx-dfact-k" }, "Last outcome", -1)),
                l("strong", _o, w(o.value?.count ? "Failed delivery" : y.value?.status || "—"), 1)
              ]),
              l("div", ko, [
                T[12] || (T[12] = l("span", { class: "kx-dfact-k" }, "Failed deliveries", -1)),
                l("strong", ho, w(o.value?.count ?? 0), 1)
              ])
            ]),
            typeof $.value == "string" && $.value.trim() ? (u(), f("div", go, [
              T[13] || (T[13] = l("div", { class: "kx-dsub-lbl" }, "Last message", -1)),
              l("p", {
                class: q(["kx-dmsg", I.value || o.value?.count ? "is-err" : "is-ok"])
              }, w($.value), 3)
            ])) : R("", !0),
            !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (u(), B(Ca, {
              key: 1,
              root: e.automation.id,
              onError: T[8] || (T[8] = (D) => n(Le).handleError("other", { message: D.message }))
            }, null, 8, ["root"])) : R("", !0)
          ]))
        ])
      ], 8, Ha)
    ], 64));
  }
});
function $o(e) {
  const t = E(!1), a = E(null), s = E({}), i = E(!1), r = E(!1), p = E(""), _ = E(null), A = E(null);
  let y = null;
  const g = E(""), b = P(() => e.types.value.filter(
    (o) => o.installable !== !1 && Object.entries(e.inputPreset.value).every(([$, C]) => {
      const Y = o.inputs?.properties?.[$];
      return !!Y && (!Y.enum || typeof C == "string" && Y.enum.includes(C));
    })
  )), v = P(() => !e.componentMode.value || !e.preferredTypeId.value || a.value?.id !== e.preferredTypeId.value), c = P(() => a.value ? Xt(a.value).filter(([o]) => !(o in e.inputPreset.value)) : []), x = P(() => {
    const o = g.value.trim().toLowerCase();
    return o ? b.value.filter(
      ($) => ($.title || "").toLowerCase().includes(o) || ($.name || "").toLowerCase().includes(o) || Oe($).toLowerCase().includes(o)
    ) : b.value;
  });
  function M(o) {
    J(), g.value = "", a.value = o || null, s.value = o ? { ...Ye(o), ...e.inputPreset.value } : {}, p.value = "", t.value = !0, Ne(W);
  }
  function O(o) {
    J(), a.value = o, s.value = { ...Ye(o), ...e.inputPreset.value }, p.value = "", Ne(W);
  }
  function U() {
    J(), t.value = !1, a.value = null, s.value = {}, p.value = "", r.value = !1, e.createMode.value && e.emitHost("close", {});
  }
  function te() {
    !v.value || a.value || Ne(() => A.value?.focus({ preventScroll: !0 }));
  }
  async function W() {
    const o = a.value, $ = Fe(o);
    if (!(!$ || !o || !_.value))
      try {
        if (await Kt($, { timeoutMs: 8e3 }), a.value?.id !== o.id || !_.value) return;
        const C = document.createElement($);
        C.setAttribute("type-id", o.id), C.setAttribute("input", JSON.stringify(e.inputPreset.value)), e.effectiveParentId.value && C.setAttribute("parent-id", e.effectiveParentId.value), C.setAttribute("embedded", "true"), C.addEventListener("automation-installed", V), C.addEventListener("submit-state", I), _.value.innerHTML = "", _.value.appendChild(C), y = C;
      } catch (C) {
        const Y = bn(o);
        p.value = `Failed to load setup UI (${$}${Y ? ` at ${Y}` : ""}): ` + (C instanceof Error ? C.message : String(C));
      }
  }
  function I(o) {
    r.value = !!o.detail?.saving;
  }
  function L() {
    Fe(a.value) ? _n(y) : j();
  }
  async function V(o) {
    const $ = o.detail;
    if ($?.success === !1) {
      p.value = $?.error || "Could not create the automation.", r.value = !1;
      return;
    }
    if (e.createMode.value) {
      e.emitHost("created", { id: $?.id });
      return;
    }
    U(), await e.reload();
  }
  function J() {
    y && (y.removeEventListener("automation-installed", V), y.removeEventListener("submit-state", I), y.remove(), y = null), _.value && (_.value.innerHTML = "");
  }
  function ne() {
    const o = e.preferredTypeId.value;
    return o ? b.value.find(($) => $.id === o) : void 0;
  }
  function m() {
    M(ne());
  }
  async function j() {
    const o = a.value;
    if (!o) return;
    const $ = en(o, s.value);
    if ($) {
      p.value = $;
      return;
    }
    i.value = !0, p.value = "";
    try {
      const { data: C } = await re.post("/api/v1/automations", {
        type: o.id,
        input: tn(o, s.value),
        parent_id: e.effectiveParentId.value || void 0
      });
      if (C?.success) {
        if (e.createMode.value) {
          e.emitHost("created", { id: C.id });
          return;
        }
        U(), await e.reload();
      } else
        p.value = X({ response: { data: C } }, "install failed");
    } catch (C) {
      p.value = X(C, "install failed");
    } finally {
      i.value = !1;
    }
  }
  return {
    showTypeCatalog: v,
    installFields: c,
    showInstall: t,
    installType: a,
    installForm: s,
    installing: i,
    customSaving: r,
    installError: p,
    customInstallHost: _,
    installSearchInput: A,
    typeSearch: g,
    filteredTypes: x,
    openInstall: M,
    openPreferredInstall: m,
    chooseType: O,
    closeInstall: U,
    focusInstallDialog: te,
    onCreate: L,
    unmountCustomInstallUi: J
  };
}
function wo({ automations: e, types: t, query: a, drawerId: s }) {
  const i = P(() => {
    const o = {};
    for (const $ of t.value) o[$.id] = $;
    return o;
  }), r = P(() => {
    const o = a.value.trim().toLowerCase();
    return o ? e.value.filter(
      ($) => ($.title || "").toLowerCase().includes(o) || ($.description || "").toLowerCase().includes(o) || ($.type || "").toLowerCase().includes(o)
    ) : e.value;
  });
  function p(o) {
    return o.title || o.id;
  }
  function _(o) {
    return o.type ? i.value[o.type] : void 0;
  }
  function A(o) {
    return o.icon ? o.icon : _(o)?.icon || "tabler:bolt";
  }
  function y(o) {
    return ct(_(o));
  }
  function g(o, $) {
    return y(o).has($);
  }
  function b(o) {
    return ut(y(o));
  }
  function v(o) {
    return vt(dt(_(o)));
  }
  function c(o) {
    return ft(y(o));
  }
  function x(o) {
    return Ve(_(o));
  }
  function M(o) {
    return rt(_(o));
  }
  function O(o) {
    return o ? lt(o, _(o)) : {};
  }
  function U(o) {
    return o.public_state;
  }
  function te(o) {
    return Ce(_(o)?.public_state_schema?.fields, U(o), !1);
  }
  function W(o) {
    return Ce(_(o)?.public_state_schema?.fields, U(o), !0);
  }
  function I(o) {
    return _t(U(o));
  }
  function L(o) {
    return kt(U(o), o.availability);
  }
  function V(o) {
    return ht(U(o), g(o, "status"), o.drive_status, o.availability);
  }
  function J(o) {
    return V(o).kind === "off";
  }
  function ne(o) {
    return xt(_(o)?.public_state_schema?.fields, U(o));
  }
  const m = P(() => e.value.find((o) => o.id === s.value) || null), j = P(() => m.value ? _(m.value) : void 0);
  return {
    typeById: i,
    filtered: r,
    pretty: p,
    typeFor: _,
    iconFor: A,
    declaredActions: y,
    hasAction: g,
    runNowFor: b,
    actionItemsFor: v,
    recoverFor: c,
    manageTag: x,
    manageLocation: M,
    manageConfig: O,
    statusFor: U,
    metrics: te,
    detailMetrics: W,
    isTerminal: I,
    rowMessage: L,
    statusOf: V,
    isPaused: J,
    subtitleLine: ne,
    drawerAutomation: m,
    drawerType: j
  };
}
function Co(e, t) {
  const a = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
  let i = 0;
  const r = /* @__PURE__ */ new Map();
  function p(b, v) {
    const c = v.meta, x = e.value.find((M) => M.id === b);
    x && (x.public_state = { ...x.public_state || {}, ...c }, typeof c.title == "string" && (x.title = c.title), typeof c.comment == "string" && (x.description = c.comment), _(b).catch((M) => Le.handleError("other", { message: String(M) })));
  }
  async function _(b) {
    if (!e.value.some((M) => M.id === b && M.drive_status)) return;
    const v = Symbol(b);
    r.set(b, v);
    const c = await $t(b);
    if (r.get(b) !== v) return;
    r.delete(b);
    const x = e.value.find((M) => M.id === b);
    x && (x.drive_status = c);
  }
  function A(b) {
    const v = {};
    for (const c of t(b)?.public_state_schema?.fields || [])
      c?.key && c.type && (v[c.key] = c.type);
    return v;
  }
  function y() {
    i++, s.clear(), r.clear();
    for (const b of a.values()) b();
    a.clear();
  }
  function g() {
    const b = new Set(e.value.map((c) => c.id).filter(Boolean));
    for (const [c, x] of a)
      b.has(c) || (x(), a.delete(c), r.delete(c));
    const v = i;
    for (const c of b) {
      if (a.has(c) || s.has(c)) continue;
      s.add(c);
      const x = e.value.find((O) => O.id === c), M = pn(c, (O) => p(c, O), x ? A(x) : void 0);
      if (s.delete(c), !!M) {
        if (v !== i || !e.value.some((O) => O.id === c)) {
          M();
          continue;
        }
        a.set(c, M);
      }
    }
  }
  return { syncRealtimeSubscriptions: g, clearRealtimeSubscriptions: y, refreshDriveStatus: _ };
}
function So() {
  let e = 0;
  return () => {
    const t = ++e;
    return () => t === e;
  };
}
function Ro({ automations: e, types: t, loading: a, error: s, parentId: i, syncRealtimeSubscriptions: r }) {
  async function p() {
    try {
      const { data: g } = await re.get("/api/v1/automations/types");
      t.value = g?.success ? g.types || [] : [];
    } catch {
      t.value = [];
    }
  }
  const _ = So();
  async function A() {
    const g = _();
    a.value = !0, s.value = "";
    try {
      const { data: b } = await re.get("/api/v1/automations", { params: { class: "automation", parent_id: i() } });
      if (!b?.success) throw new Error(X(b?.error, "failed to load automations"));
      if (!g()) return;
      e.value = b.automations || [], r();
    } catch (b) {
      if (!g()) return;
      r(), s.value = X(b, "failed to load automations");
    } finally {
      g() && (a.value = !1);
    }
  }
  async function y() {
    await p(), await A();
  }
  return { fetchTypes: p, fetchAutomations: A, reload: y };
}
function Ao(e, t, a) {
  async function s(i) {
    e.value = i.id, t.value = "";
    try {
      const { data: r } = await re.get(`/api/v1/automations/${encodeURIComponent(i.id)}/export`);
      if (!r?.success || !r.artifact)
        throw new Error(r?.error?.message || r?.error || "Automation export failed.");
      const p = a(i).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "automation", _ = new Blob([`${JSON.stringify(r.artifact, null, 2)}
`], { type: "application/json" }), A = URL.createObjectURL(_), y = document.createElement("a");
      y.href = A, y.download = `${p}.automation.json`, document.body.appendChild(y), y.click(), y.remove(), URL.revokeObjectURL(A);
    } catch (r) {
      t.value = X(r, "Automation export failed.");
    } finally {
      e.value = "";
    }
  }
  return { exportAutomation: s };
}
const Mo = { class: "kx" }, Do = {
  key: 0,
  class: "kx-head"
}, To = { class: "kx-head-icon" }, Io = { class: "kx-head-actions" }, Po = { class: "kx-count" }, jo = { class: "kx-search" }, No = {
  key: 1,
  class: "kx-err"
}, Eo = {
  key: 2,
  class: "kx-body"
}, Uo = {
  key: 0,
  class: "kx-loading"
}, Lo = {
  key: 1,
  class: "kx-empty"
}, Oo = { class: "kx-empty-ico" }, Fo = {
  key: 2,
  class: "kx-empty"
}, zo = {
  key: 3,
  class: "kx-list"
}, Vo = ["aria-label", "onClick", "disabled"], Ho = { class: "kx-ficon" }, qo = { class: "kx-id" }, Bo = ["title"], Ko = { class: "kx-sub" }, Wo = { key: 0 }, Go = { key: 1 }, Jo = { key: 2 }, Yo = { class: "kx-actions" }, Zo = {
  key: 0,
  class: "kx-rowfoot"
}, Qo = ["title"], Xo = { class: "kx-modal-head-icon" }, es = { class: "kx-modal-head-text" }, ts = { class: "kx-modal-head-title" }, ns = { class: "kx-modal-head-sub" }, as = { class: "kx-modal-body" }, os = { class: "kx-modal-head-icon" }, ss = { class: "kx-modal-head-text" }, is = { class: "kx-modal-head-title" }, rs = { class: "kx-modal-head-sub" }, ls = { class: "kx-modal-body" }, us = { class: "kx-modal-body" }, cs = {
  key: 0,
  class: "kx-delopts"
}, ds = ["onUpdate:modelValue"], fs = { class: "kx-delopt-copy" }, vs = { class: "kx-delopt-t" }, ps = {
  key: 0,
  class: "kx-delopt-d"
}, ms = /* @__PURE__ */ ue({
  __name: "automations",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, a = E([]), s = E([]), i = E(!1), r = E(""), p = E(""), _ = E(""), A = /* @__PURE__ */ new Map(), y = E(""), g = E(""), b = wo({ automations: a, types: s, query: p, drawerId: g }), {
      filtered: v,
      pretty: c,
      typeFor: x,
      iconFor: M,
      hasAction: O,
      actionItemsFor: U,
      recoverFor: te,
      manageTag: W,
      manageLocation: I,
      manageConfig: L,
      metrics: V,
      detailMetrics: J,
      isTerminal: ne,
      rowMessage: m,
      statusOf: j,
      isPaused: o,
      subtitleLine: $,
      drawerAutomation: C,
      drawerType: Y
    } = b, ve = Co(a, x), { syncRealtimeSubscriptions: F, clearRealtimeSubscriptions: T, refreshDriveStatus: D } = ve, oe = Ao(y, r, c), { exportAutomation: wt } = oe, ce = Wt(), Ct = Gt(), pe = P(() => ce.value?.mode === "create"), Re = P(() => ce.value?.mode === "component"), St = nn(ce), Be = P(() => String(ce.value?.componentId || "").trim()), Rt = P(() => String(ce.value?.typeId || "").trim()), At = P(() => Be.value || St.value), Mt = Ro({
      automations: a,
      types: s,
      loading: i,
      error: r,
      parentId: () => Be.value || void 0,
      syncRealtimeSubscriptions: F
    }), { fetchAutomations: de, reload: Ae } = Mt, me = $o({
      types: s,
      createMode: pe,
      componentMode: Re,
      effectiveParentId: At,
      preferredTypeId: Rt,
      inputPreset: P(() => an(ce.value?.input)),
      emitHost: (k, h) => Ct(k, h),
      reload: () => Ae()
    }), ae = E(null), he = E({}), ye = E(!1), Z = E(null), ie = E(null);
    function Dt(k) {
      ie.value = k;
    }
    function Ke() {
      ie.value = null;
    }
    function Tt(k) {
      const h = k?.id || "";
      return {
        resource_id: h,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(h)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(h)}`,
        title: k ? c(k) : ""
      };
    }
    function We(k, h) {
      if (!k.deleting_at)
        switch (h) {
          case "reconfigure":
            Ot(k);
            break;
          case "share":
            Dt(k);
            break;
          case "export":
            wt(k);
            break;
          case "delete":
            De(k);
            break;
          default:
            Me(k, h);
        }
    }
    function Ge(k) {
      if (k.deleting_at) return;
      const h = te(k);
      h && Me(k, h);
    }
    function It(k) {
      g.value = k.id, de();
    }
    function Pt() {
      g.value = "";
    }
    function jt(k) {
      const h = C.value;
      h && We(h, k);
    }
    function Nt() {
      const k = C.value;
      k && Ge(k);
    }
    async function Me(k, h) {
      if (k.deleting_at || _.value) return;
      _.value = k.id, r.value = "";
      const d = x(k)?.controls?.some((Q) => Q.name === h) === !0, H = `${k.id}:${h}`, Je = d ? A.get(H) || crypto.randomUUID() : "";
      d && A.set(H, Je);
      try {
        const { data: Q } = await re.post(
          `/api/v1/automations/${k.id}/actions/${h}`,
          d ? { request_id: Je } : {}
        );
        if (!Q?.success) {
          r.value = X({ response: { data: Q } }, `${h} failed`);
          return;
        }
        if (d && Q.result?.state === "succeeded" && A.delete(H), Q.result && typeof Q.result == "object") {
          const { success: Pe, ...zt } = Q.result;
          k.public_state = { ...k.public_state || {}, ...zt };
        }
        if (k.drive_status?.drives?.length)
          await D(k.id);
        else if (h === "pause" || h === "resume") {
          const Pe = typeof Q.result?.paused == "boolean" ? Q.result.paused : h === "pause";
          k.public_state = {
            ...k.public_state || {},
            enabled: !Pe,
            status: Q.result?.status || (Pe ? "paused" : "active")
          };
        }
      } catch (Q) {
        r.value = X(Q, `${h} failed`);
      } finally {
        _.value = "";
      }
    }
    async function Et(k) {
      await Me(k, o(k) ? "resume" : "pause");
    }
    function De(k) {
      ae.value = k;
      const h = x(k), d = {};
      for (const H of h?.delete_options || []) d[H.key] = !!H.default;
      he.value = d;
    }
    function Te(k) {
      return k ? x(k)?.delete_options || [] : [];
    }
    function Ut(k) {
      Z.value = null, De(k);
    }
    async function Lt() {
      const k = ae.value;
      if (k) {
        ye.value = !0, r.value = "";
        try {
          const d = Te(k).length ? { options: { ...he.value } } : {}, { data: H } = await re.delete(`/api/v1/automations/${k.id}`, { data: d });
          H?.success ? (Ft(k.id, H), ae.value = null, await de()) : r.value = X({ response: { data: H } }, "failed to delete automation");
        } catch (h) {
          r.value = X(h, "failed to delete automation");
        } finally {
          ye.value = !1;
        }
      }
    }
    function Ot(k) {
      W(k) && (Z.value = k);
    }
    async function Ie(k = !0) {
      Z.value = null, k && await Ae();
    }
    Jt(async () => {
      try {
        await Ae(), pe.value && me.openPreferredInstall();
      } catch (k) {
        r.value = X(k, "host API unavailable");
      }
    }), ze(() => {
      me.unmountCustomInstallUi(), T();
    });
    const { acceptDeletion: Ft } = mn(a, (k) => k.id, void 0, de);
    return (k, h) => (u(), f("div", Mo, [
      pe.value ? R("", !0) : (u(), f("header", Do, [
        Re.value ? R("", !0) : (u(), f(K, { key: 0 }, [
          l("div", To, [
            S(n(N), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          h[10] || (h[10] = l("div", { class: "kx-head-text" }, [
            l("h1", { class: "kx-head-title" }, "Automations"),
            l("p", { class: "kx-head-sub" }, "Scheduled and event-driven jobs that run on their own.")
          ], -1))
        ], 64)),
        l("div", Io, [
          l("span", Po, w(a.value.length) + " automation" + w(a.value.length !== 1 ? "s" : ""), 1),
          l("div", jo, [
            S(n(N), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            fe(l("input", {
              "onUpdate:modelValue": h[0] || (h[0] = (d) => p.value = d),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search automations…"
            }, null, 512), [
              [Ue, p.value]
            ])
          ]),
          S(n(G), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: h[1] || (h[1] = (d) => n(me).openPreferredInstall())
          }, {
            icon: z(({ class: d }) => [
              S(n(N), {
                icon: "tabler:plus",
                class: q(d),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ])),
      !pe.value && r.value ? (u(), f("div", No, w(r.value), 1)) : R("", !0),
      pe.value ? R("", !0) : (u(), f("div", Eo, [
        i.value && !a.value.length ? (u(), f("div", Uo, [
          S(n(N), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          h[11] || (h[11] = se(" Loading… ", -1))
        ])) : a.value.length ? n(v).length ? (u(), f("div", zo, [
          (u(!0), f(K, null, ee(n(v), (d) => (u(), f("div", {
            key: d.id,
            class: q(["kx-row", g.value === d.id && "is-open"])
          }, [
            l("button", {
              type: "button",
              class: "kx-open",
              "aria-label": `Open ${n(c)(d)} details`,
              onClick: (H) => !d.deleting_at && It(d),
              disabled: !!d.deleting_at
            }, [
              l("span", Ho, [
                S(n(N), {
                  icon: n(M)(d),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              l("span", qo, [
                l("span", {
                  class: "kx-name",
                  title: n(c)(d)
                }, w(n(c)(d)), 9, Bo),
                l("span", Ko, [
                  l("span", null, w(n(x)(d)?.title || "Automation"), 1),
                  n($)(d) ? (u(), f("span", Wo, " · " + w(n($)(d)), 1)) : R("", !0),
                  n(_e)(d.drive_status).last ? (u(), f("span", Go, " · last ran " + w(n(le)(n(_e)(d.drive_status).last, { future: !0 })), 1)) : R("", !0),
                  n(_e)(d.drive_status).next ? (u(), f("span", Jo, " · next " + w(n(le)(n(_e)(d.drive_status).next, { future: !0 })), 1)) : R("", !0)
                ])
              ])
            ], 8, Vo),
            S(n(at), {
              severity: n(gt)(n(j)(d).kind),
              class: "kx-badge kx-tag-sm"
            }, {
              default: z(() => [
                n(j)(d).kind === "live" ? (u(), B(n(N), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : R("", !0),
                se(" " + w(n(j)(d).label), 1)
              ]),
              _: 2
            }, 1032, ["severity"]),
            l("div", Yo, [
              (n(O)(d, "pause") || n(O)(d, "resume")) && !n(ne)(d) ? (u(), B(n(G), {
                key: 0,
                type: "button",
                severity: "secondary",
                outlined: "",
                size: "small",
                disabled: !!d.deleting_at || _.value === d.id,
                "aria-label": `${n(o)(d) ? "Resume" : "Pause"} ${n(c)(d)}`,
                title: n(o)(d) ? "Resume" : "Pause",
                onClick: (H) => Et(d)
              }, {
                icon: z(({ class: H }) => [
                  S(n(N), {
                    icon: n(o)(d) ? "tabler:player-play-filled" : "tabler:player-pause",
                    "aria-hidden": "true",
                    class: q(H)
                  }, null, 8, ["icon", "class"])
                ]),
                _: 2
              }, 1032, ["disabled", "aria-label", "title", "onClick"])) : R("", !0),
              S(pt, {
                items: n(U)(d),
                name: n(c)(d),
                busy: !!d.deleting_at || _.value === d.id,
                onSelect: (H) => We(d, H)
              }, null, 8, ["items", "name", "busy", "onSelect"])
            ]),
            d.deleting_at || n(m)(d) || n(J)(d).length || n(V)(d).length ? (u(), f("div", Zo, [
              S(un, {
                state: d,
                onRetry: (H) => De(d)
              }, null, 8, ["state", "onRetry"]),
              n(m)(d) ? (u(), f("div", {
                key: 0,
                class: q(["kx-rowmsg", `kx-rowmsg-${n(m)(d)?.tone}`])
              }, [
                S(n(N), {
                  icon: n(m)(d)?.tone === "error" ? "tabler:alert-circle" : "tabler:circle-check",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                l("span", {
                  class: "kx-rowmsg-txt",
                  title: n(m)(d)?.text
                }, w(n(m)(d)?.text), 9, Qo),
                n(m)(d)?.tone === "error" && n(te)(d) ? (u(), B(n(G), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  text: "",
                  size: "small",
                  class: "kx-recover",
                  "data-testid": "row-recover",
                  "aria-label": `Recover ${n(c)(d)}`,
                  disabled: !!d.deleting_at || _.value === d.id,
                  label: "Recover",
                  onClick: (H) => Ge(d)
                }, {
                  icon: z(({ class: H }) => [
                    S(n(N), {
                      icon: "tabler:rotate-clockwise-2",
                      "aria-hidden": "true",
                      class: q(H)
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])) : R("", !0)
              ], 2)) : R("", !0),
              S(Xn, {
                face: n(V)(d),
                detail: n(J)(d)
              }, null, 8, ["face", "detail"])
            ])) : R("", !0)
          ], 2))), 128))
        ])) : (u(), f("div", Fo, [...h[14] || (h[14] = [
          l("div", { class: "kx-empty-title" }, "No matches", -1),
          l("div", { class: "kx-empty-sub" }, "No automations match the current search.", -1)
        ])])) : (u(), f("div", Lo, [
          l("div", Oo, [
            S(n(N), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          h[12] || (h[12] = l("div", { class: "kx-empty-title" }, "No automations yet", -1)),
          h[13] || (h[13] = l("div", { class: "kx-empty-sub" }, "Choose an automation type to get started.", -1)),
          S(n(G), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: h[2] || (h[2] = (d) => n(me).openPreferredInstall())
          }, {
            icon: z(({ class: d }) => [
              S(n(N), {
                icon: "tabler:plus",
                class: q(d),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ])),
      n(C) ? (u(), B(xo, {
        key: 3,
        automation: n(C),
        type: n(Y),
        onClose: Pt,
        onAction: jt,
        onRecover: Nt,
        onChanged: n(de)
      }, null, 8, ["automation", "type", "onChanged"])) : R("", !0),
      S(Bn, {
        flow: n(me),
        "component-mode": Re.value,
        "dialog-pt": t
      }, null, 8, ["flow", "component-mode"]),
      Z.value ? (u(), B(n(ge), {
        key: 4,
        visible: !!Z.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: t,
        class: "kx-modal kx-modal-manage",
        "aria-label": n(c)(Z.value),
        "onUpdate:visible": h[6] || (h[6] = (d) => {
          d || Ie(!1);
        })
      }, {
        header: z(() => [
          l("span", Xo, [
            S(n(N), {
              icon: n(M)(Z.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          l("span", es, [
            l("span", ts, w(n(c)(Z.value)), 1),
            l("span", ns, w(n(x)(Z.value)?.title || "Automation"), 1)
          ])
        ]),
        footer: z(() => [
          S(n(G), {
            type: "button",
            class: "kx-foot-delete",
            severity: "danger",
            outlined: "",
            label: "Delete",
            onClick: h[5] || (h[5] = (d) => Ut(Z.value))
          }, {
            icon: z(({ class: d }) => [
              S(n(N), {
                icon: "tabler:trash",
                "aria-hidden": "true",
                class: q(d)
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]),
        default: z(() => [
          l("div", as, [
            S(we, {
              class: "kx-manage-host",
              tag: n(W)(Z.value),
              config: n(L)(Z.value),
              meta: { location: n(I)(Z.value) },
              onCreated: h[3] || (h[3] = (d) => Ie(!0)),
              onClose: h[4] || (h[4] = (d) => Ie(!0)),
              onChange: n(de)
            }, null, 8, ["tag", "config", "meta", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : R("", !0),
      ie.value ? (u(), B(n(ge), {
        key: 5,
        visible: !!ie.value,
        modal: "",
        pt: t,
        class: "kx-modal",
        "aria-label": `Share ${n(c)(ie.value)}`,
        "onUpdate:visible": h[7] || (h[7] = (d) => {
          d || Ke();
        })
      }, {
        header: z(() => [
          l("span", os, [
            S(n(N), {
              icon: "tabler:users",
              "aria-hidden": "true"
            })
          ]),
          l("span", ss, [
            l("span", is, "Share " + w(n(c)(ie.value)), 1),
            l("span", rs, w(n(x)(ie.value)?.title || "Automation"), 1)
          ])
        ]),
        default: z(() => [
          l("div", ls, [
            S(we, {
              class: "kx-manage-host",
              tag: "kickside-share",
              config: Tt(ie.value),
              onClose: Ke,
              onChange: n(de)
            }, null, 8, ["config", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : R("", !0),
      ae.value ? (u(), B(n(ge), {
        key: 6,
        visible: !!ae.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: t,
        class: "kx-modal",
        header: "Delete automation",
        "aria-label": "Delete automation",
        "onUpdate:visible": h[9] || (h[9] = (d) => {
          d || (ae.value = null);
        })
      }, {
        footer: z(() => [
          S(n(G), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: ye.value,
            onClick: h[8] || (h[8] = (d) => ae.value = null)
          }, null, 8, ["disabled"]),
          S(n(G), {
            type: "button",
            "data-testid": "automations-confirm-delete",
            severity: "danger",
            label: "Delete",
            loading: ye.value,
            disabled: ye.value,
            onClick: Lt
          }, {
            icon: z(({ class: d }) => [
              S(n(N), {
                icon: "tabler:trash",
                class: q(d),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ]),
        default: z(() => [
          l("div", us, [
            l("p", null, [
              h[15] || (h[15] = se(" Delete ", -1)),
              l("strong", null, w(n(c)(ae.value)), 1),
              h[16] || (h[16] = se("? It will stop running and its setup will be removed. This can't be undone. ", -1))
            ]),
            Te(ae.value).length ? (u(), f("div", cs, [
              (u(!0), f(K, null, ee(Te(ae.value), (d) => (u(), f("label", {
                key: d.key,
                class: "kx-delopt"
              }, [
                fe(l("input", {
                  "onUpdate:modelValue": (H) => he.value[d.key] = H,
                  type: "checkbox"
                }, null, 8, ds), [
                  [tt, he.value[d.key]]
                ]),
                l("span", fs, [
                  l("span", vs, w(d.title || d.key), 1),
                  d.description ? (u(), f("span", ps, w(d.description), 1)) : R("", !0)
                ])
              ]))), 128))
            ])) : R("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible"])) : R("", !0)
    ]));
  }
}), Ds = {
  rootComponent: ms,
  plugins: [Vt]
};
export {
  Ds as mountConfig
};
//# sourceMappingURL=lazy-mount-BiiKlWJU.js.map

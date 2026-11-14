import { P as de } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as ae, computed as B, openBlock as f, createElementBlock as x, withModifiers as V, Fragment as E, createElementVNode as a, createTextVNode as L, toDisplayString as g, createCommentVNode as j, createVNode as r, unref as l, watch as re, onBeforeUnmount as ce, ref as D, withDirectives as q, vModelText as I, withCtx as S, normalizeClass as N, renderList as ue, withKeys as J, createBlock as K, createSlots as be } from "vue";
import U from "primevue/button";
import ve from "primevue/progressspinner";
import { on as he, host as M } from "@wippy-fe/proxy";
import { Icon as w } from "@iconify/vue";
import Q from "primevue/dialog";
import { b as me } from "./wc-runtime-KO3cNuNo.js";
import { _ as ke } from "./WebhookCreate.vue_vue_type_script_setup_true_lang-W-Ls0GGT.js";
import { p as X, w as Z, i as ee, _ as pe, a as fe, u as _e, e as z, r as ye, d as xe, b as ge } from "./WebhookSchema.vue_vue_type_script_setup_true_lang-daaVuA4R.js";
const we = { key: 0 }, Ce = /* @__PURE__ */ ae({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(d) {
    const i = d, h = B(() => i.state.deletion_job === null || ["dead", "cancelled"].includes(i.state.deletion_job?.status || ""));
    return (_, b) => d.state.deleting_at ? (f(), x("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: b[1] || (b[1] = V(() => {
      }, ["stop"])),
      onKeydown: b[2] || (b[2] = V(() => {
      }, ["stop"]))
    }, [
      h.value ? (f(), x(E, { key: 0 }, [
        a("span", null, [
          b[3] || (b[3] = L("Deletion failed", -1)),
          d.state.deletion_job?.last_error ? (f(), x("span", we, ": " + g(d.state.deletion_job.last_error), 1)) : j("", !0)
        ]),
        r(l(U), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: b[0] || (b[0] = V((u) => _.$emit("retry"), ["stop"]))
        })
      ], 64)) : (f(), x(E, { key: 1 }, [
        r(l(ve), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        b[4] || (b[4] = a("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : j("", !0);
  }
});
function P(d) {
  return !!d && typeof d == "object" && !Array.isArray(d);
}
function je(d, i) {
  return d;
}
function $e(d, i, h) {
  const _ = P(d) ? d : {}, b = [
    _,
    P(_.data) ? _.data : null,
    P(_.payload) ? _.payload : null,
    P(_.detail) ? _.detail : null
  ].filter(Boolean);
  for (const u of b) {
    if (u.event !== "component.meta.changed" && u.event !== "component.deleting" && u.event !== "component.deleted") continue;
    const $ = String(u.component_id || ""), s = String(_.topic || u.topic || "");
    if (!$ && (!s.startsWith("component.") || s === "component.")) continue;
    const y = $ || i || s.slice(10);
    return u.event === "component.deleting" && typeof u.deletion_job_id == "string" && u.deletion_job_id ? { event: u.event, component_id: y, deletion_job_id: u.deletion_job_id } : u.event !== "component.meta.changed" ? { event: u.event, component_id: y } : {
      event: "component.meta.changed",
      component_id: y,
      meta: je(P(u.meta) ? u.meta : {}),
      deleted: Array.isArray(u.deleted) ? u.deleted.map(String) : []
    };
  }
  return null;
}
function Re(d, i) {
  const h = $e(d, i);
  return h && h.event !== "component.meta.changed" ? h : null;
}
function Se(d, i, h, _) {
  const b = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
  function $(m, k) {
    const v = d.value.find((C) => i(C) === m), n = u.get(m), c = k?.job_id || n?.state.deletion_job_id || v?.deletion_job_id, R = n ? n.state.deletion_job_id : v?.deleting_at ? v.deletion_job_id : void 0;
    if ((n || v?.deleting_at) && c === R || c && n?.superseded.has(c)) return;
    const p = {
      deleting_at: n?.state.deleting_at || v?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: c
    }, O = new Set(n?.superseded);
    for (const C of [n?.state.deletion_job_id, v?.deletion_job_id])
      C && C !== c && O.add(C);
    u.set(m, { state: p, superseded: O }), v && (Object.assign(v, p), v.deletion_job = void 0);
  }
  const s = re(() => d.value, (m, k = []) => {
    const v = m.filter((n) => !b.has(i(n)));
    for (const n of k)
      b.has(i(n)) || v.some((c) => i(c) === i(n)) || n.deleting_at && _?.(i(n));
    if (v.length !== m.length) {
      d.value = v;
      return;
    }
    for (const n of m) {
      n.deleting_at && n.deletion_job === void 0 && !k.includes(n) && (n.deletion_job = null);
      const c = u.get(i(n));
      if (c) {
        const p = n.deletion_job_id;
        n.deleting_at && p && p !== c.state.deletion_job_id && !c.superseded.has(p) && (c.state.deletion_job_id && c.superseded.add(c.state.deletion_job_id), c.state.deletion_job_id = p), p !== c.state.deletion_job_id && (n.deletion_job = void 0), Object.assign(n, c.state);
      }
      const R = k.find((p) => i(p) === i(n));
      n.deletion_job === void 0 && R?.deletion_job_id === n.deletion_job_id && (n.deletion_job = R?.deletion_job);
    }
  }, { immediate: !0 }), y = he("@message", (m) => {
    const k = Re(m);
    if (!k) return;
    const v = d.value.find((n) => i(n) === k.component_id);
    k.event === "component.deleted" ? (v && !b.has(k.component_id) && _?.(k.component_id), b.add(k.component_id), u.delete(k.component_id), d.value = d.value.filter((n) => i(n) !== k.component_id)) : v && $(k.component_id, { job_id: k.deletion_job_id });
  });
  return ce(() => {
    s(), typeof y == "function" && y();
  }), { acceptDeletion: $ };
}
function Te(d) {
  if (!d) return null;
  let i;
  if (typeof d == "number")
    i = d;
  else {
    const h = d.trim();
    if (/^\d+$/.test(h))
      i = Number(h);
    else {
      const _ = Date.parse(h);
      return Number.isNaN(_) ? null : _;
    }
  }
  return Number.isFinite(i) ? i < 1e12 ? i * 1e3 : i : null;
}
function te(d, i) {
  const h = Te(d);
  if (h === null) return "";
  const _ = i?.now ?? Date.now(), b = i?.suffix ?? !0, u = i?.maxUnit ?? "day", $ = i?.future ?? !1, s = 6e4, y = 60 * s, m = 24 * y, k = 30 * m, v = 365 * m, n = _ - h;
  if ($ && n < 0) {
    const p = -n;
    return p < s ? "in <1m" : p < y ? `in ${Math.floor(p / s)}m` : p < m ? `in ${Math.floor(p / y)}h` : `in ${Math.floor(p / m)}d`;
  }
  const c = Math.max(0, n);
  if (c < s) return "just now";
  const R = b ? " ago" : "";
  return c < y ? `${Math.floor(c / s)}m${R}` : c < m ? `${Math.floor(c / y)}h${R}` : u === "year" ? c < k ? `${Math.floor(c / m)}d${R}` : c < v ? `${Math.floor(c / k)}mo${R}` : `${Math.floor(c / v)}y${R}` : `${Math.floor(c / m)}d${R}`;
}
function Ne() {
  let d = 0;
  return () => {
    const i = ++d;
    return () => i === d;
  };
}
const De = { class: "kx" }, Me = { class: "kx-bar" }, Ue = { class: "kx-count" }, Le = { class: "kx-bar-actions" }, Oe = {
  key: 0,
  class: "kx-search"
}, Ee = {
  key: 0,
  class: "kx-err"
}, We = { class: "kx-body" }, Pe = {
  key: 0,
  class: "kx-loading"
}, Ve = {
  key: 1,
  class: "kx-empty"
}, Ae = { class: "kx-empty-ico" }, ze = { class: "kx-empty-actions" }, Be = {
  key: 2,
  class: "kx-empty"
}, qe = { class: "kx-empty-ico" }, Ie = { class: "kx-empty-sub" }, Ke = { class: "kx-empty-actions" }, He = {
  key: 3,
  class: "kx-grid"
}, Ye = ["aria-label", "onClick", "onKeydown"], Fe = { class: "kx-card-head" }, Ge = { class: "kx-ficon" }, Je = { class: "kx-card-id" }, Qe = ["title"], Xe = { class: "kx-card-meta" }, Ze = ["title"], et = ["title"], tt = { class: "kx-modal-head-icon" }, at = { class: "kx-modal-body" }, ot = { class: "kx-modal-head-icon" }, st = { class: "kx-modal-head-text" }, nt = { class: "kx-modal-head-title" }, lt = { class: "kx-modal-head-sub" }, it = {
  key: 0,
  class: "kx-modal-body"
}, dt = { class: "kx-field" }, rt = { class: "wh-token" }, ct = { class: "kx-field" }, ut = { class: "wh-token" }, bt = { key: 0 }, vt = { class: "wh-note" }, ht = { class: "wh-facts" }, mt = { class: "kx-field" }, kt = ["disabled"], pt = { class: "kx-field wh-schema" }, ft = { class: "wh-schema-edit" }, _t = ["disabled"], yt = {
  key: 0,
  class: "kx-err inline"
}, xt = /* @__PURE__ */ ae({
  __name: "Webhooks",
  setup(d) {
    const i = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, h = D([]), _ = D(!0), b = D(""), u = D(""), $ = D(!1), s = D(null), y = D({ label: "", schemaText: "" }), m = D(""), k = D(!1), v = D(!1), n = B(() => {
      const o = u.value.trim().toLowerCase();
      return o ? h.value.filter((e) => (e.label || e.webhook_id).toLowerCase().includes(o)) : h.value;
    }), c = B(() => X(y.value.schemaText).schema || (s.value?.schema ?? {})), R = Ne();
    async function p() {
      const o = R();
      _.value = !0, b.value = "";
      try {
        const e = await ge();
        o() && (h.value = e);
      } catch (e) {
        o() && (b.value = z(e, "could not load webhooks"));
      } finally {
        o() && (_.value = !1);
      }
    }
    function O(o) {
      return "POST /api/public/hooks/" + o;
    }
    function C(o) {
      return o.subscriber_count || 0;
    }
    function H() {
      $.value = !0;
    }
    function oe() {
      $.value = !1;
    }
    async function se() {
      $.value = !1, await p();
    }
    function A(o) {
      s.value = o, y.value = { label: o.label || "", schemaText: fe(o.schema || {}) }, m.value = "", v.value = !1;
    }
    function W() {
      s.value = null;
    }
    const Y = B({
      get: () => s.value !== null,
      set: (o) => {
        o || W();
      }
    });
    async function ne(o, e) {
      try {
        await navigator.clipboard.writeText(o), M.toast({ severity: "success", summary: "Copied", detail: e });
      } catch {
        M.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    async function le() {
      const o = s.value;
      if (!o) return;
      const e = X(y.value.schemaText);
      if (e.error) {
        m.value = e.error;
        return;
      }
      k.value = !0, m.value = "";
      try {
        await _e(o.webhook_id, { label: y.value.label.trim(), schema: e.schema }), M.toast({ severity: "success", summary: "Saved", detail: y.value.label.trim() || o.webhook_id }), W(), await p();
      } catch (t) {
        m.value = z(t, "save failed");
      } finally {
        k.value = !1;
      }
    }
    async function F(o) {
      if (await M.confirm({
        message: `Revoke “${o.label || o.webhook_id}”? The secret stops working and subscribed automations receive no further events. This can't be undone.`,
        header: "Revoke webhook",
        icon: "tabler:ban",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await ye(o.webhook_id), M.toast({ severity: "success", summary: "Revoked", detail: o.label || o.webhook_id }), s.value?.webhook_id === o.webhook_id && W(), await p();
        } catch (t) {
          b.value = z(t, "revoke failed"), M.toast({ severity: "error", summary: "Revoke failed", detail: b.value });
        }
    }
    async function G(o) {
      if (C(o) > 0) {
        M.toast({
          severity: "warn",
          summary: "In use",
          detail: `Used by ${C(o)} automation${C(o) === 1 ? "" : "s"}. Remove those first.`
        });
        return;
      }
      if (await M.confirm({
        message: `Remove “${o.label || o.webhook_id}”? This deletes the webhook and its endpoint. This can't be undone.`,
        header: "Remove webhook",
        icon: "tabler:trash",
        acceptLabel: "Remove",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await xe(o.webhook_id), ie(o.webhook_id), M.toast({ severity: "success", summary: "Deletion accepted", detail: o.label || o.webhook_id }), s.value?.webhook_id === o.webhook_id && W(), await p();
        } catch (t) {
          b.value = z(t, "delete failed"), M.toast({ severity: "error", summary: "Remove failed", detail: b.value });
        }
    }
    me(p);
    const { acceptDeletion: ie } = Se(h, (o) => o.webhook_id, void 0, p);
    return (o, e) => (f(), x("div", De, [
      a("div", Me, [
        a("span", Ue, g(h.value.length) + " webhook" + g(h.value.length !== 1 ? "s" : ""), 1),
        a("div", Le, [
          h.value.length ? (f(), x("div", Oe, [
            r(l(w), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            q(a("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => u.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search webhooks…",
              "aria-label": "Search webhooks"
            }, null, 512), [
              [I, u.value]
            ])
          ])) : j("", !0),
          r(l(U), {
            type: "button",
            label: "New webhook",
            onClick: H
          }, {
            icon: S(({ class: t }) => [
              r(l(w), {
                icon: "tabler:plus",
                class: N(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      b.value ? (f(), x("div", Ee, g(b.value), 1)) : j("", !0),
      a("div", We, [
        _.value && !h.value.length ? (f(), x("div", Pe, [
          r(l(w), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          e[10] || (e[10] = L(" Loading webhooks… ", -1))
        ])) : h.value.length ? n.value.length ? (f(), x("div", He, [
          (f(!0), x(E, null, ue(n.value, (t) => (f(), x("div", {
            key: t.webhook_id,
            class: N(["kx-card", t.status === "revoked" && "is-revoked"]),
            tabindex: "0",
            role: "button",
            "aria-label": `Open ${t.label || "webhook"}`,
            onClick: (T) => !t.deleting_at && A(t),
            onKeydown: [
              J((T) => !t.deleting_at && A(t), ["enter"]),
              J(V((T) => !t.deleting_at && A(t), ["prevent"]), ["space"])
            ]
          }, [
            r(Ce, {
              state: t,
              onRetry: (T) => G(t)
            }, null, 8, ["state", "onRetry"]),
            a("div", Fe, [
              a("span", Ge, [
                r(l(w), {
                  icon: "tabler:webhook",
                  "aria-hidden": "true"
                })
              ]),
              a("div", Je, [
                a("div", {
                  class: "kx-card-name",
                  title: t.label || "Webhook"
                }, g(t.label || "Webhook"), 9, Qe),
                a("div", Xe, [
                  a("span", {
                    class: N(["kx-chip kx-tag-sm", t.status === "active" ? "is-active" : "is-revoked"])
                  }, g(l(Z)(t.status)), 3),
                  C(t) > 0 ? (f(), x("span", {
                    key: 0,
                    class: "kx-chip kx-tag-sm is-count",
                    title: `Used by ${C(t)} automation(s)`
                  }, [
                    r(l(w), {
                      icon: "tabler:plug-connected",
                      "aria-hidden": "true"
                    }),
                    L(" " + g(C(t)) + " automation" + g(C(t) === 1 ? "" : "s"), 1)
                  ], 8, Ze)) : j("", !0)
                ])
              ]),
              a("div", {
                class: "kx-card-actions",
                onClick: e[2] || (e[2] = V(() => {
                }, ["stop"]))
              }, [
                r(l(U), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Open",
                  "aria-label": `Open ${t.label || "webhook"}`,
                  onClick: (T) => !t.deleting_at && A(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: S(({ class: T }) => [
                    r(l(w), {
                      icon: "tabler:pencil",
                      class: N(T),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                t.status === "active" ? (f(), K(l(U), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Revoke",
                  "aria-label": `Revoke ${t.label || "webhook"}`,
                  onClick: (T) => F(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: S(({ class: T }) => [
                    r(l(w), {
                      icon: "tabler:ban",
                      class: N(T),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])) : j("", !0),
                r(l(U), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Remove",
                  "aria-label": `Remove ${t.label || "webhook"}`,
                  disabled: !!t.deleting_at || C(t) > 0,
                  onClick: (T) => G(t)
                }, {
                  icon: S(({ class: T }) => [
                    r(l(w), {
                      icon: "tabler:trash",
                      class: N(T),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])
              ])
            ]),
            a("div", {
              class: "kx-card-desc",
              title: O(t.webhook_id)
            }, g(O(t.webhook_id)), 9, et)
          ], 42, Ye))), 128))
        ])) : (f(), x("div", Be, [
          a("div", qe, [
            r(l(w), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          e[13] || (e[13] = a("div", { class: "kx-empty-title" }, "No matches", -1)),
          a("div", Ie, "Nothing matches “" + g(u.value) + "”. Try a different term or clear the search.", 1),
          a("div", Ke, [
            r(l(U), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: e[1] || (e[1] = (t) => u.value = "")
            }, {
              icon: S(({ class: t }) => [
                r(l(w), {
                  icon: "tabler:x",
                  class: N(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (f(), x("div", Ve, [
          a("div", Ae, [
            r(l(w), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          e[11] || (e[11] = a("div", { class: "kx-empty-title" }, "No webhooks yet", -1)),
          e[12] || (e[12] = a("div", { class: "kx-empty-sub" }, "A webhook gives an external service a secret URL to POST to. Each request becomes a trigger event your automations can act on.", -1)),
          a("div", ze, [
            r(l(U), {
              type: "button",
              label: "New webhook",
              onClick: H
            }, {
              icon: S(({ class: t }) => [
                r(l(w), {
                  icon: "tabler:plus",
                  class: N(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]))
      ]),
      r(l(Q), {
        visible: $.value,
        "onUpdate:visible": e[3] || (e[3] = (t) => $.value = t),
        modal: "",
        "dismissable-mask": !0,
        class: "kx-dialog",
        pt: i,
        "aria-label": "New webhook"
      }, {
        header: S(() => [
          a("span", tt, [
            r(l(w), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          e[14] || (e[14] = a("span", { class: "kx-modal-head-text" }, [
            a("span", { class: "kx-modal-head-title" }, "New webhook"),
            a("span", { class: "kx-modal-head-sub" }, "Name it and set the payload it accepts — the secret is shown once.")
          ], -1))
        ]),
        default: S(() => [
          a("div", at, [
            r(ke, {
              onCreated: se,
              onClose: oe
            })
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      r(l(Q), {
        visible: Y.value,
        "onUpdate:visible": e[9] || (e[9] = (t) => Y.value = t),
        modal: "",
        class: "kx-dialog",
        pt: i,
        "aria-label": "Webhook detail"
      }, be({
        default: S(() => [
          s.value ? (f(), x("div", it, [
            a("div", dt, [
              e[15] || (e[15] = a("span", { class: "kx-field-lbl" }, [
                L("Endpoint URL "),
                a("span", { class: "kx-field-hint-inline" }, "— hand this to the sender")
              ], -1)),
              a("div", rt, [
                a("code", null, g(l(ee)(s.value.webhook_id)), 1),
                a("button", {
                  type: "button",
                  class: "wh-copy",
                  title: "Copy URL",
                  "aria-label": "Copy URL",
                  onClick: e[4] || (e[4] = (t) => ne(l(ee)(s.value.webhook_id), "endpoint URL"))
                }, [
                  r(l(w), {
                    icon: "tabler:copy",
                    "aria-hidden": "true"
                  })
                ])
              ])
            ]),
            a("div", ct, [
              e[17] || (e[17] = a("span", { class: "kx-field-lbl" }, "Secret", -1)),
              a("div", ut, [
                a("code", null, [
                  L(g(s.value.secret_prefix || "Not available"), 1),
                  s.value.secret_prefix ? (f(), x("span", bt, "…")) : j("", !0)
                ])
              ]),
              a("p", vt, [
                r(l(w), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                e[16] || (e[16] = a("span", null, "The full secret is shown only when a webhook is created. To rotate it, revoke this webhook and create a new one.", -1))
              ])
            ]),
            a("dl", ht, [
              s.value.created_at ? (f(), x(E, { key: 0 }, [
                e[18] || (e[18] = a("dt", null, "Created", -1)),
                a("dd", null, g(l(te)(s.value.created_at)), 1)
              ], 64)) : j("", !0),
              s.value.last_used_at ? (f(), x(E, { key: 1 }, [
                e[19] || (e[19] = a("dt", null, "Last received", -1)),
                a("dd", null, g(l(te)(s.value.last_used_at)), 1)
              ], 64)) : j("", !0),
              C(s.value) > 0 ? (f(), x(E, { key: 2 }, [
                e[20] || (e[20] = a("dt", null, "Used by", -1)),
                a("dd", null, g(C(s.value)) + " automation" + g(C(s.value) === 1 ? "" : "s"), 1)
              ], 64)) : j("", !0)
            ]),
            a("label", mt, [
              e[21] || (e[21] = a("span", { class: "kx-field-lbl" }, [
                L("Name "),
                a("span", { class: "kx-field-hint-inline" }, "— shown in automation trigger pickers")
              ], -1)),
              q(a("input", {
                "onUpdate:modelValue": e[5] || (e[5] = (t) => y.value.label = t),
                class: "kx-input",
                type: "text",
                placeholder: "Customer events",
                disabled: s.value.status === "revoked",
                "data-test": "wh-name"
              }, null, 8, kt), [
                [I, y.value.label]
              ])
            ]),
            a("div", pt, [
              e[23] || (e[23] = a("span", { class: "kx-field-lbl" }, [
                L("Payload schema "),
                a("span", { class: "kx-field-hint-inline" }, "— the fields each inbound request must carry")
              ], -1)),
              r(pe, { schema: c.value }, null, 8, ["schema"]),
              a("div", ft, [
                a("button", {
                  type: "button",
                  class: N(["wh-toggle", v.value && "is-open"]),
                  onClick: e[6] || (e[6] = (t) => v.value = !v.value)
                }, [
                  r(l(w), {
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  }),
                  e[22] || (e[22] = L(" Edit as JSON Schema ", -1))
                ], 2),
                v.value ? q((f(), x("textarea", {
                  key: 0,
                  "onUpdate:modelValue": e[7] || (e[7] = (t) => y.value.schemaText = t),
                  class: "kx-input kx-textarea",
                  spellcheck: "false",
                  disabled: s.value.status === "revoked",
                  "data-test": "wh-schema"
                }, null, 8, _t)), [
                  [I, y.value.schemaText]
                ]) : j("", !0)
              ])
            ]),
            m.value ? (f(), x("div", yt, g(m.value), 1)) : j("", !0)
          ])) : j("", !0)
        ]),
        _: 2
      }, [
        s.value ? {
          name: "header",
          fn: S(() => [
            a("span", ot, [
              r(l(w), {
                icon: "tabler:webhook",
                "aria-hidden": "true"
              })
            ]),
            a("span", st, [
              a("span", nt, g(s.value.label || "Webhook"), 1),
              a("span", lt, g(O(s.value.webhook_id)), 1)
            ]),
            a("span", {
              class: N(["kx-chip kx-tag-sm", s.value.status === "active" ? "is-active" : "is-revoked"])
            }, g(l(Z)(s.value.status)), 3)
          ]),
          key: "0"
        } : void 0,
        s.value ? {
          name: "footer",
          fn: S(() => [
            s.value.status === "active" ? (f(), K(l(U), {
              key: 0,
              type: "button",
              severity: "danger",
              size: "small",
              class: "kx-foot-spacer",
              label: "Revoke",
              onClick: e[8] || (e[8] = (t) => F(s.value))
            }, {
              icon: S(({ class: t }) => [
                r(l(w), {
                  icon: "tabler:ban",
                  class: N(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })) : j("", !0),
            r(l(U), {
              type: "button",
              label: "Close",
              severity: "secondary",
              outlined: "",
              onClick: W
            }),
            s.value.status === "active" ? (f(), K(l(U), {
              key: 1,
              type: "button",
              label: "Save changes",
              loading: k.value,
              disabled: k.value,
              "data-test": "wh-save",
              onClick: le
            }, {
              icon: S(({ class: t }) => [
                r(l(w), {
                  icon: "tabler:device-floppy",
                  class: N(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled"])) : j("", !0)
          ]),
          key: "1"
        } : void 0
      ]), 1032, ["visible"])
    ]));
  }
}), Mt = {
  rootComponent: xt,
  plugins: [de]
};
export {
  Mt as mountConfig
};
//# sourceMappingURL=lazy-mount-BgKj8uq6.js.map

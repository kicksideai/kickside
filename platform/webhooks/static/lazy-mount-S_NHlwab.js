import { P as de } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as ne, computed as B, openBlock as k, createElementBlock as y, withModifiers as A, Fragment as W, createElementVNode as t, createTextVNode as L, toDisplayString as g, createCommentVNode as $, createVNode as u, unref as l, watch as re, onBeforeUnmount as ce, ref as D, withDirectives as K, vModelText as F, withCtx as j, normalizeClass as T, renderList as ue, withKeys as Q, createBlock as H, createSlots as ve } from "vue";
import M from "primevue/button";
import be from "primevue/progressspinner";
import { on as he, api as me, host as N } from "@wippy-fe/proxy";
import { a as X, p as Z, w as ee, i as te, _ as pe, b as ke, u as fe, e as z, r as _e, d as ye, c as ge } from "./WebhookSchema.vue_vue_type_script_setup_true_lang-9ykBxS9s.js";
import { Icon as x } from "@iconify/vue";
import ae from "primevue/dialog";
import { b as xe } from "./wc-runtime-KO3cNuNo.js";
import { _ as we } from "./WebhookCreate.vue_vue_type_script_setup_true_lang-DbiXjS25.js";
const Ce = { key: 0 }, $e = /* @__PURE__ */ ne({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(d) {
    const i = d, m = B(() => i.state.deletion_job === null || ["dead", "cancelled"].includes(i.state.deletion_job?.status || ""));
    return (f, b) => d.state.deleting_at ? (k(), y("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: b[1] || (b[1] = A(() => {
      }, ["stop"])),
      onKeydown: b[2] || (b[2] = A(() => {
      }, ["stop"]))
    }, [
      m.value ? (k(), y(W, { key: 0 }, [
        t("span", null, [
          b[3] || (b[3] = L("Deletion failed", -1)),
          d.state.deletion_job?.last_error ? (k(), y("span", Ce, ": " + g(d.state.deletion_job.last_error), 1)) : $("", !0)
        ]),
        u(l(M), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: b[0] || (b[0] = A((v) => f.$emit("retry"), ["stop"]))
        })
      ], 64)) : (k(), y(W, { key: 1 }, [
        u(l(be), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        b[4] || (b[4] = t("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : $("", !0);
  }
}), je = (d, i) => {
  const m = d.__vccOpts || d;
  for (const [f, b] of i)
    m[f] = b;
  return m;
}, Re = /* @__PURE__ */ je($e, [["__scopeId", "data-v-63c136c7"]]);
function V(d) {
  return !!d && typeof d == "object" && !Array.isArray(d);
}
function Te(d, i) {
  return d;
}
function Se(d, i, m) {
  const f = V(d) ? d : {}, b = [
    f,
    V(f.data) ? f.data : null,
    V(f.payload) ? f.payload : null,
    V(f.detail) ? f.detail : null
  ].filter(Boolean);
  for (const v of b) {
    if (v.event !== "component.meta.changed" && v.event !== "component.deleting" && v.event !== "component.deleted") continue;
    const w = String(v.component_id || ""), o = String(f.topic || v.topic || "");
    if (!w && (!o.startsWith("component.") || o === "component.")) continue;
    const _ = w || i || o.slice(10);
    return v.event === "component.deleting" && typeof v.deletion_job_id == "string" && v.deletion_job_id ? { event: v.event, component_id: _, deletion_job_id: v.deletion_job_id } : v.event !== "component.meta.changed" ? { event: v.event, component_id: _ } : {
      event: "component.meta.changed",
      component_id: _,
      meta: Te(V(v.meta) ? v.meta : {}),
      deleted: Array.isArray(v.deleted) ? v.deleted.map(String) : []
    };
  }
  return null;
}
function Ne(d, i) {
  const m = Se(d, i);
  return m && m.event !== "component.meta.changed" ? m : null;
}
function De(d, i, m, f) {
  let b = !0;
  const v = /* @__PURE__ */ new Set(), w = /* @__PURE__ */ new Map();
  function o(p, c) {
    const r = d.value.find((q) => i(q) === p), s = w.get(p), h = c?.job_id || s?.deletion_job_id || r?.deletion_job_id, O = s ? s.deletion_job_id : r?.deleting_at ? r.deletion_job_id : void 0;
    if ((s || r?.deleting_at) && h === O) return;
    const E = {
      deleting_at: s?.deleting_at || r?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: h
    };
    w.set(p, E), r && (Object.assign(r, E), r.deletion_job = void 0);
  }
  async function _(p) {
    const c = i(p), r = w.get(c), s = () => b && d.value.includes(p) && w.get(c) === r;
    try {
      const { data: h } = await me.get(`/api/v1/components/${encodeURIComponent(c)}`);
      if (!h?.success) throw new Error(X(h, "Could not read deletion progress"));
      s() && (p.deleting_at = r?.deleting_at || h.deleting_at, p.deletion_job_id = h.deletion_job_id, r && (r.deletion_job_id = p.deletion_job_id), p.deletion_job = h.deletion_job ?? null);
    } catch (h) {
      s() && N.handleError("other", { message: X(h, "Could not read deletion progress") });
    }
  }
  let C = [];
  const U = re(() => d.value, (p, c = []) => {
    const r = p.filter((s) => !v.has(i(s)));
    for (const s of c)
      v.has(i(s)) || r.some((h) => i(h) === i(s)) || s.deleting_at;
    if (r.length !== p.length) {
      d.value = r;
      return;
    }
    for (const s of p) {
      const h = w.get(i(s));
      h && (s.deletion_job_id !== h.deletion_job_id && (s.deletion_job = void 0), Object.assign(s, h));
      const O = c.find((E) => i(E) === i(s));
      s.deletion_job === void 0 && O?.deletion_job_id === s.deletion_job_id && (s.deletion_job = O?.deletion_job), s.deleting_at && !C.includes(s) && _(s);
    }
    C = p;
  }, { immediate: !0 }), S = he("@message", (p) => {
    const c = Ne(p);
    if (!c) return;
    const r = d.value.find((s) => i(s) === c.component_id);
    c.event === "component.deleted" ? (r && v.has(c.component_id), v.add(c.component_id), w.delete(c.component_id), d.value = d.value.filter((s) => i(s) !== c.component_id)) : r && o(c.component_id, { job_id: c.deletion_job_id });
  });
  return ce(() => {
    b = !1, U(), typeof S == "function" && S();
  }), { acceptDeletion: o };
}
function Me(d) {
  if (!d) return null;
  let i;
  if (typeof d == "number")
    i = d;
  else {
    const m = d.trim();
    if (/^\d+$/.test(m))
      i = Number(m);
    else {
      const f = Date.parse(m);
      return Number.isNaN(f) ? null : f;
    }
  }
  return Number.isFinite(i) ? i < 1e12 ? i * 1e3 : i : null;
}
function oe(d, i) {
  const m = Me(d);
  if (m === null) return "";
  const f = i?.now ?? Date.now(), b = i?.suffix ?? !0, v = i?.maxUnit ?? "day", w = i?.future ?? !1, o = 6e4, _ = 60 * o, C = 24 * _, U = 30 * C, S = 365 * C, p = f - m;
  if (w && p < 0) {
    const s = -p;
    return s < o ? "in <1m" : s < _ ? `in ${Math.floor(s / o)}m` : s < C ? `in ${Math.floor(s / _)}h` : `in ${Math.floor(s / C)}d`;
  }
  const c = Math.max(0, p);
  if (c < o) return "just now";
  const r = b ? " ago" : "";
  return c < _ ? `${Math.floor(c / o)}m${r}` : c < C ? `${Math.floor(c / _)}h${r}` : v === "year" ? c < U ? `${Math.floor(c / C)}d${r}` : c < S ? `${Math.floor(c / U)}mo${r}` : `${Math.floor(c / S)}y${r}` : `${Math.floor(c / C)}d${r}`;
}
const Ue = { class: "kx" }, Le = { class: "kx-bar" }, Oe = { class: "kx-count" }, Ee = { class: "kx-bar-actions" }, We = {
  key: 0,
  class: "kx-search"
}, Pe = {
  key: 0,
  class: "kx-err"
}, Ve = { class: "kx-body" }, Ae = {
  key: 0,
  class: "kx-loading"
}, Ie = {
  key: 1,
  class: "kx-empty"
}, ze = { class: "kx-empty-ico" }, Be = { class: "kx-empty-actions" }, qe = {
  key: 2,
  class: "kx-empty"
}, Ke = { class: "kx-empty-ico" }, Fe = { class: "kx-empty-sub" }, He = { class: "kx-empty-actions" }, Ye = {
  key: 3,
  class: "kx-grid"
}, Ge = ["aria-label", "onClick", "onKeydown"], Je = { class: "kx-card-head" }, Qe = { class: "kx-ficon" }, Xe = { class: "kx-card-id" }, Ze = ["title"], et = { class: "kx-card-meta" }, tt = ["title"], at = ["title"], ot = { class: "kx-modal-head-icon" }, nt = { class: "kx-modal-body" }, st = { class: "kx-modal-head-icon" }, lt = { class: "kx-modal-head-text" }, it = { class: "kx-modal-head-title" }, dt = { class: "kx-modal-head-sub" }, rt = {
  key: 0,
  class: "kx-modal-body"
}, ct = { class: "kx-field" }, ut = { class: "wh-token" }, vt = { class: "kx-field" }, bt = { class: "wh-token" }, ht = { key: 0 }, mt = { class: "wh-note" }, pt = { class: "wh-facts" }, kt = { class: "kx-field" }, ft = ["disabled"], _t = { class: "kx-field wh-schema" }, yt = { class: "wh-schema-edit" }, gt = ["disabled"], xt = {
  key: 0,
  class: "kx-err inline"
}, wt = /* @__PURE__ */ ne({
  __name: "Webhooks",
  setup(d) {
    const i = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, m = D([]), f = D(!0), b = D(""), v = D(""), w = D(!1), o = D(null), _ = D({ label: "", schemaText: "" }), C = D(""), U = D(!1), S = D(!1), p = B(() => {
      const n = v.value.trim().toLowerCase();
      return n ? m.value.filter((a) => (a.label || a.webhook_id).toLowerCase().includes(n)) : m.value;
    }), c = B(() => Z(_.value.schemaText).schema || (o.value?.schema ?? {}));
    async function r() {
      f.value = !0, b.value = "";
      try {
        m.value = await ge();
      } catch (n) {
        b.value = z(n, "could not load webhooks");
      } finally {
        f.value = !1;
      }
    }
    function s(n) {
      return "POST /api/public/hooks/" + n;
    }
    function h(n) {
      return n.subscriber_count || 0;
    }
    function O() {
      w.value = !0;
    }
    function E() {
      w.value = !1;
    }
    async function q() {
      w.value = !1, await r();
    }
    function I(n) {
      o.value = n, _.value = { label: n.label || "", schemaText: ke(n.schema || {}) }, C.value = "", S.value = !1;
    }
    function P() {
      o.value = null;
    }
    const Y = B({
      get: () => o.value !== null,
      set: (n) => {
        n || P();
      }
    });
    async function se(n, a) {
      try {
        await navigator.clipboard.writeText(n), N.toast({ severity: "success", summary: "Copied", detail: a });
      } catch {
        N.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    async function le() {
      const n = o.value;
      if (!n) return;
      const a = Z(_.value.schemaText);
      if (a.error) {
        C.value = a.error;
        return;
      }
      U.value = !0, C.value = "";
      try {
        await fe(n.webhook_id, { label: _.value.label.trim(), schema: a.schema }), N.toast({ severity: "success", summary: "Saved", detail: _.value.label.trim() || n.webhook_id }), P(), await r();
      } catch (e) {
        C.value = z(e, "save failed");
      } finally {
        U.value = !1;
      }
    }
    async function G(n) {
      if (await N.confirm({
        message: `Revoke “${n.label || n.webhook_id}”? The secret stops working and subscribed automations receive no further events. This can't be undone.`,
        header: "Revoke webhook",
        icon: "tabler:ban",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await _e(n.webhook_id), N.toast({ severity: "success", summary: "Revoked", detail: n.label || n.webhook_id }), o.value?.webhook_id === n.webhook_id && P(), await r();
        } catch (e) {
          b.value = z(e, "revoke failed"), N.toast({ severity: "error", summary: "Revoke failed", detail: b.value });
        }
    }
    async function J(n) {
      if (h(n) > 0) {
        N.toast({
          severity: "warn",
          summary: "In use",
          detail: `Used by ${h(n)} automation${h(n) === 1 ? "" : "s"}. Remove those first.`
        });
        return;
      }
      if (await N.confirm({
        message: `Remove “${n.label || n.webhook_id}”? This deletes the webhook and its endpoint. This can't be undone.`,
        header: "Remove webhook",
        icon: "tabler:trash",
        acceptLabel: "Remove",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await ye(n.webhook_id), ie(n.webhook_id), N.toast({ severity: "success", summary: "Deletion accepted", detail: n.label || n.webhook_id }), o.value?.webhook_id === n.webhook_id && P(), await r();
        } catch (e) {
          b.value = z(e, "delete failed"), N.toast({ severity: "error", summary: "Remove failed", detail: b.value });
        }
    }
    xe(r);
    const { acceptDeletion: ie } = De(m, (n) => n.webhook_id);
    return (n, a) => (k(), y("div", Ue, [
      t("div", Le, [
        t("span", Oe, g(m.value.length) + " webhook" + g(m.value.length !== 1 ? "s" : ""), 1),
        t("div", Ee, [
          m.value.length ? (k(), y("div", We, [
            u(l(x), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            K(t("input", {
              "onUpdate:modelValue": a[0] || (a[0] = (e) => v.value = e),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search webhooks…",
              "aria-label": "Search webhooks"
            }, null, 512), [
              [F, v.value]
            ])
          ])) : $("", !0),
          u(l(M), {
            type: "button",
            label: "New webhook",
            onClick: O
          }, {
            icon: j(({ class: e }) => [
              u(l(x), {
                icon: "tabler:plus",
                class: T(e),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      b.value ? (k(), y("div", Pe, g(b.value), 1)) : $("", !0),
      t("div", Ve, [
        f.value && !m.value.length ? (k(), y("div", Ae, [
          u(l(x), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          a[10] || (a[10] = L(" Loading webhooks… ", -1))
        ])) : m.value.length ? p.value.length ? (k(), y("div", Ye, [
          (k(!0), y(W, null, ue(p.value, (e) => (k(), y("div", {
            key: e.webhook_id,
            class: T(["kx-card", e.status === "revoked" && "is-revoked"]),
            tabindex: "0",
            role: "button",
            "aria-label": `Open ${e.label || "webhook"}`,
            onClick: (R) => !e.deleting_at && I(e),
            onKeydown: [
              Q((R) => !e.deleting_at && I(e), ["enter"]),
              Q(A((R) => !e.deleting_at && I(e), ["prevent"]), ["space"])
            ]
          }, [
            u(Re, {
              state: e,
              onRetry: (R) => J(e)
            }, null, 8, ["state", "onRetry"]),
            t("div", Je, [
              t("span", Qe, [
                u(l(x), {
                  icon: "tabler:webhook",
                  "aria-hidden": "true"
                })
              ]),
              t("div", Xe, [
                t("div", {
                  class: "kx-card-name",
                  title: e.label || "Webhook"
                }, g(e.label || "Webhook"), 9, Ze),
                t("div", et, [
                  t("span", {
                    class: T(["kx-chip kx-tag-sm", e.status === "active" ? "is-active" : "is-revoked"])
                  }, g(l(ee)(e.status)), 3),
                  h(e) > 0 ? (k(), y("span", {
                    key: 0,
                    class: "kx-chip kx-tag-sm is-count",
                    title: `Used by ${h(e)} automation(s)`
                  }, [
                    u(l(x), {
                      icon: "tabler:plug-connected",
                      "aria-hidden": "true"
                    }),
                    L(" " + g(h(e)) + " automation" + g(h(e) === 1 ? "" : "s"), 1)
                  ], 8, tt)) : $("", !0)
                ])
              ]),
              t("div", {
                class: "kx-card-actions",
                onClick: a[2] || (a[2] = A(() => {
                }, ["stop"]))
              }, [
                u(l(M), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Open",
                  "aria-label": `Open ${e.label || "webhook"}`,
                  onClick: (R) => !e.deleting_at && I(e),
                  disabled: !!e.deleting_at
                }, {
                  icon: j(({ class: R }) => [
                    u(l(x), {
                      icon: "tabler:pencil",
                      class: T(R),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                e.status === "active" ? (k(), H(l(M), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Revoke",
                  "aria-label": `Revoke ${e.label || "webhook"}`,
                  onClick: (R) => G(e),
                  disabled: !!e.deleting_at
                }, {
                  icon: j(({ class: R }) => [
                    u(l(x), {
                      icon: "tabler:ban",
                      class: T(R),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])) : $("", !0),
                u(l(M), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Remove",
                  "aria-label": `Remove ${e.label || "webhook"}`,
                  disabled: !!e.deleting_at || h(e) > 0,
                  onClick: (R) => J(e)
                }, {
                  icon: j(({ class: R }) => [
                    u(l(x), {
                      icon: "tabler:trash",
                      class: T(R),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])
              ])
            ]),
            t("div", {
              class: "kx-card-desc",
              title: s(e.webhook_id)
            }, g(s(e.webhook_id)), 9, at)
          ], 42, Ge))), 128))
        ])) : (k(), y("div", qe, [
          t("div", Ke, [
            u(l(x), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          a[13] || (a[13] = t("div", { class: "kx-empty-title" }, "No matches", -1)),
          t("div", Fe, "Nothing matches “" + g(v.value) + "”. Try a different term or clear the search.", 1),
          t("div", He, [
            u(l(M), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: a[1] || (a[1] = (e) => v.value = "")
            }, {
              icon: j(({ class: e }) => [
                u(l(x), {
                  icon: "tabler:x",
                  class: T(e),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (k(), y("div", Ie, [
          t("div", ze, [
            u(l(x), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          a[11] || (a[11] = t("div", { class: "kx-empty-title" }, "No webhooks yet", -1)),
          a[12] || (a[12] = t("div", { class: "kx-empty-sub" }, "A webhook gives an external service a secret URL to POST to. Each request becomes a trigger event your automations can act on.", -1)),
          t("div", Be, [
            u(l(M), {
              type: "button",
              label: "New webhook",
              onClick: O
            }, {
              icon: j(({ class: e }) => [
                u(l(x), {
                  icon: "tabler:plus",
                  class: T(e),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]))
      ]),
      u(l(ae), {
        visible: w.value,
        "onUpdate:visible": a[3] || (a[3] = (e) => w.value = e),
        modal: "",
        "dismissable-mask": !0,
        class: "kx-dialog",
        pt: i,
        "aria-label": "New webhook"
      }, {
        header: j(() => [
          t("span", ot, [
            u(l(x), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          a[14] || (a[14] = t("span", { class: "kx-modal-head-text" }, [
            t("span", { class: "kx-modal-head-title" }, "New webhook"),
            t("span", { class: "kx-modal-head-sub" }, "Name it and set the payload it accepts — the secret is shown once.")
          ], -1))
        ]),
        default: j(() => [
          t("div", nt, [
            u(we, {
              onCreated: q,
              onClose: E
            })
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      u(l(ae), {
        visible: Y.value,
        "onUpdate:visible": a[9] || (a[9] = (e) => Y.value = e),
        modal: "",
        class: "kx-dialog",
        pt: i,
        "aria-label": "Webhook detail"
      }, ve({
        default: j(() => [
          o.value ? (k(), y("div", rt, [
            t("div", ct, [
              a[15] || (a[15] = t("span", { class: "kx-field-lbl" }, [
                L("Endpoint URL "),
                t("span", { class: "kx-field-hint-inline" }, "— hand this to the sender")
              ], -1)),
              t("div", ut, [
                t("code", null, g(l(te)(o.value.webhook_id)), 1),
                t("button", {
                  type: "button",
                  class: "wh-copy",
                  title: "Copy URL",
                  "aria-label": "Copy URL",
                  onClick: a[4] || (a[4] = (e) => se(l(te)(o.value.webhook_id), "endpoint URL"))
                }, [
                  u(l(x), {
                    icon: "tabler:copy",
                    "aria-hidden": "true"
                  })
                ])
              ])
            ]),
            t("div", vt, [
              a[17] || (a[17] = t("span", { class: "kx-field-lbl" }, "Secret", -1)),
              t("div", bt, [
                t("code", null, [
                  L(g(o.value.secret_prefix || "Not available"), 1),
                  o.value.secret_prefix ? (k(), y("span", ht, "…")) : $("", !0)
                ])
              ]),
              t("p", mt, [
                u(l(x), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                a[16] || (a[16] = t("span", null, "The full secret is shown only when a webhook is created. To rotate it, revoke this webhook and create a new one.", -1))
              ])
            ]),
            t("dl", pt, [
              o.value.created_at ? (k(), y(W, { key: 0 }, [
                a[18] || (a[18] = t("dt", null, "Created", -1)),
                t("dd", null, g(l(oe)(o.value.created_at)), 1)
              ], 64)) : $("", !0),
              o.value.last_used_at ? (k(), y(W, { key: 1 }, [
                a[19] || (a[19] = t("dt", null, "Last received", -1)),
                t("dd", null, g(l(oe)(o.value.last_used_at)), 1)
              ], 64)) : $("", !0),
              h(o.value) > 0 ? (k(), y(W, { key: 2 }, [
                a[20] || (a[20] = t("dt", null, "Used by", -1)),
                t("dd", null, g(h(o.value)) + " automation" + g(h(o.value) === 1 ? "" : "s"), 1)
              ], 64)) : $("", !0)
            ]),
            t("label", kt, [
              a[21] || (a[21] = t("span", { class: "kx-field-lbl" }, [
                L("Name "),
                t("span", { class: "kx-field-hint-inline" }, "— shown in automation trigger pickers")
              ], -1)),
              K(t("input", {
                "onUpdate:modelValue": a[5] || (a[5] = (e) => _.value.label = e),
                class: "kx-input",
                type: "text",
                placeholder: "Customer events",
                disabled: o.value.status === "revoked",
                "data-test": "wh-name"
              }, null, 8, ft), [
                [F, _.value.label]
              ])
            ]),
            t("div", _t, [
              a[23] || (a[23] = t("span", { class: "kx-field-lbl" }, [
                L("Payload schema "),
                t("span", { class: "kx-field-hint-inline" }, "— the fields each inbound request must carry")
              ], -1)),
              u(pe, { schema: c.value }, null, 8, ["schema"]),
              t("div", yt, [
                t("button", {
                  type: "button",
                  class: T(["wh-toggle", S.value && "is-open"]),
                  onClick: a[6] || (a[6] = (e) => S.value = !S.value)
                }, [
                  u(l(x), {
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  }),
                  a[22] || (a[22] = L(" Edit as JSON Schema ", -1))
                ], 2),
                S.value ? K((k(), y("textarea", {
                  key: 0,
                  "onUpdate:modelValue": a[7] || (a[7] = (e) => _.value.schemaText = e),
                  class: "kx-input kx-textarea",
                  spellcheck: "false",
                  disabled: o.value.status === "revoked",
                  "data-test": "wh-schema"
                }, null, 8, gt)), [
                  [F, _.value.schemaText]
                ]) : $("", !0)
              ])
            ]),
            C.value ? (k(), y("div", xt, g(C.value), 1)) : $("", !0)
          ])) : $("", !0)
        ]),
        _: 2
      }, [
        o.value ? {
          name: "header",
          fn: j(() => [
            t("span", st, [
              u(l(x), {
                icon: "tabler:webhook",
                "aria-hidden": "true"
              })
            ]),
            t("span", lt, [
              t("span", it, g(o.value.label || "Webhook"), 1),
              t("span", dt, g(s(o.value.webhook_id)), 1)
            ]),
            t("span", {
              class: T(["kx-chip kx-tag-sm", o.value.status === "active" ? "is-active" : "is-revoked"])
            }, g(l(ee)(o.value.status)), 3)
          ]),
          key: "0"
        } : void 0,
        o.value ? {
          name: "footer",
          fn: j(() => [
            o.value.status === "active" ? (k(), H(l(M), {
              key: 0,
              type: "button",
              severity: "danger",
              size: "small",
              class: "kx-foot-spacer",
              label: "Revoke",
              onClick: a[8] || (a[8] = (e) => G(o.value))
            }, {
              icon: j(({ class: e }) => [
                u(l(x), {
                  icon: "tabler:ban",
                  class: T(e),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })) : $("", !0),
            u(l(M), {
              type: "button",
              label: "Close",
              severity: "secondary",
              outlined: "",
              onClick: P
            }),
            o.value.status === "active" ? (k(), H(l(M), {
              key: 1,
              type: "button",
              label: "Save changes",
              loading: U.value,
              disabled: U.value,
              "data-test": "wh-save",
              onClick: le
            }, {
              icon: j(({ class: e }) => [
                u(l(x), {
                  icon: "tabler:device-floppy",
                  class: T(e),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled"])) : $("", !0)
          ]),
          key: "1"
        } : void 0
      ]), 1032, ["visible"])
    ]));
  }
}), Lt = {
  rootComponent: wt,
  plugins: [de]
};
export {
  Lt as mountConfig
};
//# sourceMappingURL=lazy-mount-S_NHlwab.js.map

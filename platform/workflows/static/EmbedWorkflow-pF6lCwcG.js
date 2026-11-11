import { defineComponent as oe, defineAsyncComponent as ie, computed as g, ref as h, onBeforeUnmount as de, watch as ce, openBlock as n, createElementBlock as m, createVNode as d, unref as a, createElementVNode as o, createBlock as v, withCtx as c, createTextVNode as b, toDisplayString as w, withModifiers as fe, createCommentVNode as W, Fragment as ve } from "vue";
import A from "primevue/button";
import k from "primevue/message";
import H from "primevue/progressspinner";
import pe from "primevue/tag";
import { a as me, u as be } from "./wc-runtime-KO3cNuNo.js";
import { on as G } from "@wippy-fe/proxy";
import { Icon as j } from "@iconify/vue";
import { E as he, S as ye, l as we, D as ke, h as _e } from "./WorkflowSearchList.vue_vue_type_script_setup_true_lang-1g5-myn1.js";
import { a as ge, b as Ee, z as Re, _ as K, g as Ce, A as Ie, x as Se, i as We } from "./http-error-4TebKSwQ.js";
import { _ as Oe } from "./EmbedWorkflowPicker.vue_vue_type_script_setup_true_lang-B2faQzpq.js";
const Pe = "Run Workflow";
function Y(t, r) {
  const l = t[r];
  return typeof l == "string" ? l : "";
}
function Ae(t) {
  return typeof t == "string" && t.trim().toLowerCase() === "dispatch" ? "dispatch" : "run";
}
function je(t) {
  if (t == null || t === "") return { value: null, error: "" };
  if (typeof t == "object")
    return Array.isArray(t) ? { value: null, error: "Input must be a JSON object." } : { value: t, error: "" };
  if (typeof t == "string") {
    const r = t.trim();
    if (!r) return { value: null, error: "" };
    try {
      const l = JSON.parse(r);
      return !l || typeof l != "object" || Array.isArray(l) ? { value: null, error: "Input must be a JSON object." } : { value: l, error: "" };
    } catch {
      return { value: null, error: "Input is not valid JSON." };
    }
  }
  return { value: null, error: "Input must be a JSON object." };
}
function Ne(t) {
  const r = t && typeof t == "object" ? t : {}, { value: l, error: f } = je(r.input), i = Y(r, "label").trim() || Pe;
  return {
    workflowId: Y(r, "flowId").trim(),
    input: l,
    inputError: f,
    mode: Ae(r.mode),
    label: i
  };
}
function Le(t, r) {
  const l = he(r), f = Array.isArray(l?.required) ? l?.required.map(String) : [];
  if (!f.length) return [];
  const i = t && typeof t == "object" && !Array.isArray(t) ? t : {};
  return f.filter((u) => {
    const I = i[u];
    return I == null || typeof I == "string" && I.trim() === "";
  });
}
function Ve(t, r) {
  const l = Le(t, r);
  return l.length ? { ok: !1, message: `Provide ${l.length === 1 ? `the ${l[0]} field` : `these fields: ${l.join(", ")}`} before running.`, missing: l } : { ok: !0, message: "", missing: l };
}
function $e(t) {
  const r = ge(t.status), l = Ee(t.status);
  if (r === "error") {
    const f = Re(t.error);
    return { phase: "failed", tone: r, statusLabel: l, output: void 0, hasOutput: !1, outputPending: !1, reason: f, hasReason: !!f };
  }
  if (r === "ok") {
    const f = t.output !== void 0;
    return {
      phase: "completed",
      tone: r,
      statusLabel: l,
      output: t.output,
      hasOutput: f,
      outputPending: !f,
      reason: "",
      hasReason: !1
    };
  }
  return { phase: "running", tone: r, statusLabel: l, output: void 0, hasOutput: !1, outputPending: !1, reason: "", hasReason: !1 };
}
const xe = { class: "wf-embed" }, Fe = {
  key: 0,
  class: "wf-embed-note"
}, Te = {
  key: 3,
  class: "wf-embed-run"
}, Be = { class: "wf-embed-hd" }, De = { class: "wf-embed-hd-ico" }, Je = { class: "wf-embed-hd-main" }, qe = { class: "wf-embed-hd-title" }, Me = { class: "wf-embed-input" }, Ue = {
  key: 3,
  class: "wf-embed-subtle"
}, ze = { class: "wf-embed-actions" }, He = {
  key: 1,
  class: "wf-embed-status is-running"
}, Ge = {
  key: 0,
  class: "wf-embed-runid"
}, Ke = {
  key: 2,
  class: "wf-embed-result"
}, Ye = {
  key: 0,
  class: "wf-embed-runid"
}, Qe = { class: "wf-embed-actions" }, Xe = {
  key: 3,
  class: "wf-embed-result"
}, Ze = {
  key: 1,
  class: "wf-embed-subtle"
}, et = { class: "wf-embed-actions" }, tt = {
  key: 4,
  class: "wf-embed-result"
}, st = { class: "wf-embed-actions" }, pt = /* @__PURE__ */ oe({
  __name: "EmbedWorkflow",
  setup(t) {
    const r = ie(() => import("./SchemaEditor-CiSSGWOl.js")), l = me(), f = be(), i = g(() => Ne(l.value)), u = h(null), I = h(!1), E = h(""), O = h({}), q = h(0), V = h(!0), p = h("ready"), N = h(!1), R = h(""), _ = h(""), y = h(null);
    let $ = null, M = null, x = !1;
    const Q = g(() => u.value ? `/workflows/${u.value.id}` : "");
    function X() {
      u.value && f("navigate", { route: `/workflows/${u.value.id}` });
    }
    const F = g(() => u.value?.input_schema), Z = g(() => ye(F.value)), ee = g(() => i.value.input !== null), T = g(() => Ve(O.value, F.value)), U = g(() => p.value === "ready" && !N.value && !i.value.inputError && V.value && T.value.ok), L = g(() => R.value.length > 8 ? R.value.slice(0, 8) : R.value), te = g(() => !i.value.workflowId);
    function B(s, e) {
      return Se(s) === 403 ? "You don’t have access to this Workflow." : _e(s, e);
    }
    function P() {
      $?.(), $ = null;
    }
    async function D() {
      const s = u.value?.id || "", e = R.value;
      if (!(!s || !e || x)) {
        x = !0;
        try {
          const { run: C } = await Ce(s, e);
          if (u.value?.id !== s || R.value !== e) return;
          const S = $e(C);
          y.value = S, p.value = S.phase;
        } catch (C) {
          _.value = B(C, "Lost track of this run."), p.value = "failed";
        } finally {
          x = !1;
        }
      }
    }
    function se(s) {
      P();
      try {
        const e = G(`kickside.thread.${s}`, (C) => {
          We(C, s) && D();
        });
        $ = typeof e == "function" ? e : null;
      } catch {
      }
    }
    async function ae() {
      if (!(!u.value || !U.value)) {
        _.value = "", N.value = !0;
        try {
          const s = Number(u.value.published_version), e = await Ie(u.value.id, s, O.value || {});
          R.value = e, i.value.mode === "dispatch" ? p.value = "dispatched" : (y.value = null, p.value = "running", se(u.value.id), await D());
        } catch (s) {
          _.value = B(s, "Could not start the run.");
        } finally {
          N.value = !1;
        }
      }
    }
    function z(s) {
      P(), u.value = s, E.value = "", p.value = "ready", R.value = "", y.value = null, _.value = "", O.value = i.value.input ? { ...i.value.input } : {}, V.value = !0;
    }
    async function le(s) {
      I.value = !0, E.value = "";
      try {
        const C = (await we({ filter: "published" })).map((S) => ke(S, {}, [], "")).find((S) => S.id === s && !!S.published_version);
        C ? z(C) : (u.value = null, E.value = "This Workflow isn’t published, or you don’t have access to it.");
      } catch (e) {
        u.value = null, E.value = B(e, "Could not load this Workflow.");
      } finally {
        I.value = !1;
      }
    }
    function J() {
      P(), p.value = "ready", R.value = "", y.value = null, _.value = "", q.value += 1;
    }
    function ne() {
      P(), u.value = null, E.value = "";
    }
    function re(s) {
      O.value = s || {};
    }
    function ue(s) {
      V.value = s;
    }
    try {
      const s = G("@visibility", (e) => {
        e === !0 && D();
      });
      M = typeof s == "function" ? s : null;
    } catch {
    }
    return de(() => {
      P(), M?.();
    }), ce(
      () => i.value.workflowId,
      (s) => {
        P(), s ? le(s) : (u.value = null, E.value = "");
      },
      { immediate: !0 }
    ), (s, e) => (n(), m("div", xe, [
      I.value ? (n(), m("div", Fe, [
        d(a(H), {
          class: "wf-status-spinner",
          "stroke-width": "4",
          "aria-label": "Loading Workflow"
        }),
        e[0] || (e[0] = o("span", null, "Loading Workflow…", -1))
      ])) : E.value ? (n(), v(a(k), {
        key: 1,
        class: "wf-embed-directed",
        severity: "error",
        closable: !1
      }, {
        default: c(() => [
          b(w(E.value), 1)
        ]),
        _: 1
      })) : u.value ? (n(), m("div", Te, [
        o("header", Be, [
          o("span", De, [
            d(a(j), {
              icon: "tabler:route",
              "aria-hidden": "true"
            })
          ]),
          o("span", Je, [
            o("span", qe, w(u.value.title), 1),
            d(a(pe), {
              class: "wf-embed-hd-sub",
              severity: "success",
              value: `Published v${u.value.published_version}`
            }, null, 8, ["value"])
          ]),
          d(a(A), {
            as: "a",
            class: "wf-embed-open",
            href: Q.value,
            severity: "secondary",
            text: "",
            title: "Open this Workflow in the editor",
            onClick: fe(X, ["prevent"])
          }, {
            default: c(() => [
              d(a(j), {
                icon: "tabler:external-link",
                "aria-hidden": "true"
              }),
              e[1] || (e[1] = o("span", null, "Open in editor", -1))
            ]),
            _: 1
          }, 8, ["href"]),
          te.value ? (n(), v(a(A), {
            key: 0,
            type: "button",
            class: "wf-embed-change",
            severity: "secondary",
            text: "",
            onClick: ne
          }, {
            default: c(() => [...e[2] || (e[2] = [
              b("Change", -1)
            ])]),
            _: 1
          })) : W("", !0)
        ]),
        p.value === "ready" ? (n(), m(ve, { key: 0 }, [
          o("div", Me, [
            i.value.inputError ? (n(), v(a(k), {
              key: 0,
              class: "wf-field-err",
              severity: "error",
              closable: !1
            }, {
              default: c(() => [
                b(w(i.value.inputError), 1)
              ]),
              _: 1
            })) : ee.value ? (n(), v(K, {
              key: 1,
              value: O.value,
              label: "Input",
              icon: "tabler:arrow-right-circle",
              open: !0
            }, null, 8, ["value"])) : Z.value ? (n(), v(a(r), {
              key: 2,
              mode: "value",
              schema: F.value,
              "model-value": O.value,
              "reset-key": q.value,
              rows: 6,
              label: "Input",
              placeholder: '{ "key": "value" }',
              "onUpdate:modelValue": re,
              onValid: ue
            }, null, 8, ["schema", "model-value", "reset-key"])) : (n(), m("p", Ue, "This Workflow needs no input.")),
            !i.value.inputError && !T.value.ok ? (n(), v(a(k), {
              key: 4,
              class: "wf-embed-gate",
              severity: "warn",
              closable: !1
            }, {
              default: c(() => [
                b(w(T.value.message), 1)
              ]),
              _: 1
            })) : W("", !0)
          ]),
          o("div", ze, [
            d(a(A), {
              type: "button",
              class: "wf-embed-action",
              disabled: !U.value,
              loading: N.value,
              onClick: ae
            }, {
              default: c(() => [
                N.value ? W("", !0) : (n(), v(a(j), {
                  key: 0,
                  icon: i.value.mode === "dispatch" ? "tabler:send" : "tabler:player-play",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])),
                o("span", null, w(i.value.label), 1)
              ]),
              _: 1
            }, 8, ["disabled", "loading"])
          ]),
          _.value ? (n(), v(a(k), {
            key: 0,
            class: "wf-embed-err",
            severity: "error",
            closable: !1
          }, {
            default: c(() => [
              b(w(_.value), 1)
            ]),
            _: 1
          })) : W("", !0)
        ], 64)) : p.value === "running" ? (n(), m("div", He, [
          d(a(H), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Workflow running"
          }),
          o("span", null, [
            e[3] || (e[3] = b("Running…", -1)),
            L.value ? (n(), m("span", Ge, " · " + w(L.value), 1)) : W("", !0)
          ])
        ])) : p.value === "dispatched" ? (n(), m("div", Ke, [
          d(a(k), {
            class: "wf-embed-status is-ok",
            severity: "success",
            closable: !1
          }, {
            default: c(() => [
              o("span", null, [
                e[4] || (e[4] = b("Dispatched", -1)),
                L.value ? (n(), m("span", Ye, " · run " + w(L.value), 1)) : W("", !0)
              ])
            ]),
            _: 1
          }),
          o("div", Qe, [
            d(a(A), {
              type: "button",
              class: "wf-embed-action",
              onClick: J
            }, {
              default: c(() => [
                d(a(j), {
                  icon: "tabler:refresh",
                  "aria-hidden": "true"
                }),
                e[5] || (e[5] = o("span", null, "Dispatch again", -1))
              ]),
              _: 1
            })
          ])
        ])) : p.value === "completed" ? (n(), m("div", Xe, [
          d(a(k), {
            class: "wf-embed-status is-ok",
            severity: "success",
            closable: !1
          }, {
            default: c(() => [...e[6] || (e[6] = [
              b("Completed", -1)
            ])]),
            _: 1
          }),
          y.value && y.value.hasOutput ? (n(), v(K, {
            key: 0,
            value: y.value.output,
            label: "Result",
            icon: "tabler:file-check",
            open: !0
          }, null, 8, ["value"])) : (n(), m("p", Ze, "Completed — no result was returned.")),
          o("div", et, [
            d(a(A), {
              type: "button",
              class: "wf-embed-action",
              onClick: J
            }, {
              default: c(() => [
                d(a(j), {
                  icon: "tabler:refresh",
                  "aria-hidden": "true"
                }),
                e[7] || (e[7] = o("span", null, "Run again", -1))
              ]),
              _: 1
            })
          ])
        ])) : p.value === "failed" ? (n(), m("div", tt, [
          d(a(k), {
            class: "wf-embed-status is-error",
            severity: "error",
            closable: !1
          }, {
            default: c(() => [...e[8] || (e[8] = [
              b("Failed", -1)
            ])]),
            _: 1
          }),
          _.value ? (n(), v(a(k), {
            key: 0,
            class: "wf-embed-err",
            severity: "error",
            closable: !1
          }, {
            default: c(() => [
              b(w(_.value), 1)
            ]),
            _: 1
          })) : y.value && y.value.hasReason ? (n(), v(a(k), {
            key: 1,
            class: "wf-embed-reason",
            severity: "error",
            closable: !1
          }, {
            default: c(() => [
              b(w(y.value.reason), 1)
            ]),
            _: 1
          })) : (n(), v(a(k), {
            key: 2,
            class: "wf-embed-subtle",
            severity: "error",
            closable: !1
          }, {
            default: c(() => [...e[9] || (e[9] = [
              b("This run failed, and no further detail was reported.", -1)
            ])]),
            _: 1
          })),
          o("div", st, [
            d(a(A), {
              type: "button",
              class: "wf-embed-action",
              onClick: J
            }, {
              default: c(() => [
                d(a(j), {
                  icon: "tabler:refresh",
                  "aria-hidden": "true"
                }),
                e[10] || (e[10] = o("span", null, "Run again", -1))
              ]),
              _: 1
            })
          ])
        ])) : W("", !0)
      ])) : (n(), v(Oe, {
        key: 2,
        onSelect: z
      }))
    ]));
  }
});
export {
  pt as default
};

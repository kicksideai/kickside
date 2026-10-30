import { u as ue, a as ie, s as w, W as de, P as ce } from "./index-B9KLaL2S.js";
import { defineComponent as fe, defineAsyncComponent as ve, computed as _, ref as y, onBeforeUnmount as pe, watch as me, openBlock as n, createElementBlock as m, createVNode as d, unref as a, createElementVNode as u, createBlock as v, withCtx as c, createTextVNode as b, toDisplayString as k, withModifiers as be, createCommentVNode as I, Fragment as ye } from "vue";
import { M as he, Z as we, s as A, o as ke, L as ge, i as _e, Y as Ce } from "./pickerselect-BuC_5yaD.js";
import { s as K } from "./index-DRigRSgk.js";
import { a as Ee, b as Re, C as Se, s as We, _ as z, g as Ie, D as Pe, A as Oe, i as Ae } from "./http-error-B4DMrBUB.js";
import { on as Y, define as je } from "@wippy-fe/proxy";
import { Icon as j } from "@iconify/vue";
import { _ as Ve, s as $e } from "./workflow-embed-DJ9drdSy.js";
const Le = "Run Workflow";
function G(t, r) {
  const l = t[r];
  return typeof l == "string" ? l : "";
}
function Ne(t) {
  return typeof t == "string" && t.trim().toLowerCase() === "dispatch" ? "dispatch" : "run";
}
function xe(t) {
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
function Fe(t) {
  const r = t && typeof t == "object" ? t : {}, { value: l, error: f } = xe(r.input), i = G(r, "label").trim() || Le;
  return {
    workflowId: G(r, "flowId").trim(),
    input: l,
    inputError: f,
    mode: Ne(r.mode),
    label: i
  };
}
function Te(t, r) {
  const l = he(r), f = Array.isArray(l?.required) ? l?.required.map(String) : [];
  if (!f.length) return [];
  const i = t && typeof t == "object" && !Array.isArray(t) ? t : {};
  return f.filter((o) => {
    const S = i[o];
    return S == null || typeof S == "string" && S.trim() === "";
  });
}
function Ue(t, r) {
  const l = Te(t, r);
  return l.length ? { ok: !1, message: `Provide ${l.length === 1 ? `the ${l[0]} field` : `these fields: ${l.join(", ")}`} before running.`, missing: l } : { ok: !0, message: "", missing: l };
}
function De(t) {
  const r = Ee(t.status), l = Re(t.status);
  if (r === "error") {
    const f = Se(t.error);
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
const Be = { class: "wf-embed" }, He = {
  key: 0,
  class: "wf-embed-note"
}, Je = {
  key: 3,
  class: "wf-embed-run"
}, Me = { class: "wf-embed-hd" }, qe = { class: "wf-embed-hd-ico" }, Ke = { class: "wf-embed-hd-main" }, ze = { class: "wf-embed-hd-title" }, Ye = { class: "wf-embed-input" }, Ge = {
  key: 3,
  class: "wf-embed-subtle"
}, Ze = { class: "wf-embed-actions" }, Qe = {
  key: 1,
  class: "wf-embed-status is-running"
}, Xe = {
  key: 0,
  class: "wf-embed-runid"
}, et = {
  key: 2,
  class: "wf-embed-result"
}, tt = {
  key: 0,
  class: "wf-embed-runid"
}, st = { class: "wf-embed-actions" }, at = {
  key: 3,
  class: "wf-embed-result"
}, lt = {
  key: 1,
  class: "wf-embed-subtle"
}, nt = { class: "wf-embed-actions" }, rt = {
  key: 4,
  class: "wf-embed-result"
}, ot = { class: "wf-embed-actions" }, ut = /* @__PURE__ */ fe({
  __name: "EmbedWorkflow",
  setup(t) {
    const r = ve(() => import("./SchemaEditor-BLXx3DMB.js")), l = ue(), f = ie(), i = _(() => Fe(l.value)), o = y(null), S = y(!1), C = y(""), P = y({}), H = y(0), L = y(!0), p = y("ready"), V = y(!1), E = y(""), g = y(""), h = y(null);
    let N = null, J = null, x = !1;
    const Z = _(() => o.value ? `/workflows/${o.value.id}` : "");
    function Q() {
      o.value && f("navigate", { route: `/workflows/${o.value.id}` });
    }
    const F = _(() => o.value?.input_schema), X = _(() => we(F.value)), ee = _(() => i.value.input !== null), T = _(() => Ue(P.value, F.value)), M = _(() => p.value === "ready" && !V.value && !i.value.inputError && L.value && T.value.ok), $ = _(() => E.value.length > 8 ? E.value.slice(0, 8) : E.value), te = _(() => !i.value.workflowId);
    function U(s, e) {
      return Oe(s) === 403 ? "You don’t have access to this Workflow." : _e(s, e);
    }
    function O() {
      N?.(), N = null;
    }
    async function D() {
      const s = o.value?.id || "", e = E.value;
      if (!(!s || !e || x)) {
        x = !0;
        try {
          const { run: R } = await Ie(s, e);
          if (o.value?.id !== s || E.value !== e) return;
          const W = De(R);
          h.value = W, p.value = W.phase;
        } catch (R) {
          g.value = U(R, "Lost track of this run."), p.value = "failed";
        } finally {
          x = !1;
        }
      }
    }
    function se(s) {
      O();
      try {
        const e = Y(`kickside.thread.${s}`, (R) => {
          Ae(R, s) && D();
        });
        N = typeof e == "function" ? e : null;
      } catch {
      }
    }
    async function ae() {
      if (!(!o.value || !M.value)) {
        g.value = "", V.value = !0;
        try {
          const s = Number(o.value.published_version), e = await Pe(o.value.id, s, P.value || {});
          E.value = e, i.value.mode === "dispatch" ? p.value = "dispatched" : (h.value = null, p.value = "running", se(o.value.id), await D());
        } catch (s) {
          g.value = U(s, "Could not start the run.");
        } finally {
          V.value = !1;
        }
      }
    }
    function q(s) {
      O(), o.value = s, C.value = "", p.value = "ready", E.value = "", h.value = null, g.value = "", P.value = i.value.input ? { ...i.value.input } : {}, L.value = !0;
    }
    async function le(s) {
      S.value = !0, C.value = "";
      try {
        const R = (await ke({ filter: "published" })).map((W) => ge(W, {}, [], "")).find((W) => W.id === s && !!W.published_version);
        R ? q(R) : (o.value = null, C.value = "This Workflow isn’t published, or you don’t have access to it.");
      } catch (e) {
        o.value = null, C.value = U(e, "Could not load this Workflow.");
      } finally {
        S.value = !1;
      }
    }
    function B() {
      O(), p.value = "ready", E.value = "", h.value = null, g.value = "", H.value += 1;
    }
    function ne() {
      O(), o.value = null, C.value = "";
    }
    function re(s) {
      P.value = s || {};
    }
    function oe(s) {
      L.value = s;
    }
    try {
      const s = Y("@visibility", (e) => {
        e === !0 && D();
      });
      J = typeof s == "function" ? s : null;
    } catch {
    }
    return pe(() => {
      O(), J?.();
    }), me(
      () => i.value.workflowId,
      (s) => {
        O(), s ? le(s) : (o.value = null, C.value = "");
      },
      { immediate: !0 }
    ), (s, e) => (n(), m("div", Be, [
      S.value ? (n(), m("div", He, [
        d(a(K), {
          class: "wf-status-spinner",
          "stroke-width": "4",
          "aria-label": "Loading Workflow"
        }),
        e[0] || (e[0] = u("span", null, "Loading Workflow…", -1))
      ])) : C.value ? (n(), v(a(w), {
        key: 1,
        class: "wf-embed-directed",
        severity: "error",
        closable: !1
      }, {
        default: c(() => [
          b(k(C.value), 1)
        ]),
        _: 1
      })) : o.value ? (n(), m("div", Je, [
        u("header", Me, [
          u("span", qe, [
            d(a(j), {
              icon: "tabler:route",
              "aria-hidden": "true"
            })
          ]),
          u("span", Ke, [
            u("span", ze, k(o.value.title), 1),
            d(a(We), {
              class: "wf-embed-hd-sub",
              severity: "success",
              value: `Published v${o.value.published_version}`
            }, null, 8, ["value"])
          ]),
          d(a(A), {
            as: "a",
            class: "wf-embed-open",
            href: Z.value,
            severity: "secondary",
            text: "",
            title: "Open this Workflow in the editor",
            onClick: be(Q, ["prevent"])
          }, {
            default: c(() => [
              d(a(j), {
                icon: "tabler:external-link",
                "aria-hidden": "true"
              }),
              e[1] || (e[1] = u("span", null, "Open in editor", -1))
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
          })) : I("", !0)
        ]),
        p.value === "ready" ? (n(), m(ye, { key: 0 }, [
          u("div", Ye, [
            i.value.inputError ? (n(), v(a(w), {
              key: 0,
              class: "wf-field-err",
              severity: "error",
              closable: !1
            }, {
              default: c(() => [
                b(k(i.value.inputError), 1)
              ]),
              _: 1
            })) : ee.value ? (n(), v(z, {
              key: 1,
              value: P.value,
              label: "Input",
              icon: "tabler:arrow-right-circle",
              open: !0
            }, null, 8, ["value"])) : X.value ? (n(), v(a(r), {
              key: 2,
              mode: "value",
              schema: F.value,
              "model-value": P.value,
              "reset-key": H.value,
              rows: 6,
              label: "Input",
              placeholder: '{ "key": "value" }',
              "onUpdate:modelValue": re,
              onValid: oe
            }, null, 8, ["schema", "model-value", "reset-key"])) : (n(), m("p", Ge, "This Workflow needs no input.")),
            !i.value.inputError && !T.value.ok ? (n(), v(a(w), {
              key: 4,
              class: "wf-embed-gate",
              severity: "warn",
              closable: !1
            }, {
              default: c(() => [
                b(k(T.value.message), 1)
              ]),
              _: 1
            })) : I("", !0)
          ]),
          u("div", Ze, [
            d(a(A), {
              type: "button",
              class: "wf-embed-action",
              disabled: !M.value,
              loading: V.value,
              onClick: ae
            }, {
              default: c(() => [
                V.value ? I("", !0) : (n(), v(a(j), {
                  key: 0,
                  icon: i.value.mode === "dispatch" ? "tabler:send" : "tabler:player-play",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])),
                u("span", null, k(i.value.label), 1)
              ]),
              _: 1
            }, 8, ["disabled", "loading"])
          ]),
          g.value ? (n(), v(a(w), {
            key: 0,
            class: "wf-embed-err",
            severity: "error",
            closable: !1
          }, {
            default: c(() => [
              b(k(g.value), 1)
            ]),
            _: 1
          })) : I("", !0)
        ], 64)) : p.value === "running" ? (n(), m("div", Qe, [
          d(a(K), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Workflow running"
          }),
          u("span", null, [
            e[3] || (e[3] = b("Running…", -1)),
            $.value ? (n(), m("span", Xe, " · " + k($.value), 1)) : I("", !0)
          ])
        ])) : p.value === "dispatched" ? (n(), m("div", et, [
          d(a(w), {
            class: "wf-embed-status is-ok",
            severity: "success",
            closable: !1
          }, {
            default: c(() => [
              u("span", null, [
                e[4] || (e[4] = b("Dispatched", -1)),
                $.value ? (n(), m("span", tt, " · run " + k($.value), 1)) : I("", !0)
              ])
            ]),
            _: 1
          }),
          u("div", st, [
            d(a(A), {
              type: "button",
              class: "wf-embed-action",
              onClick: B
            }, {
              default: c(() => [
                d(a(j), {
                  icon: "tabler:refresh",
                  "aria-hidden": "true"
                }),
                e[5] || (e[5] = u("span", null, "Dispatch again", -1))
              ]),
              _: 1
            })
          ])
        ])) : p.value === "completed" ? (n(), m("div", at, [
          d(a(w), {
            class: "wf-embed-status is-ok",
            severity: "success",
            closable: !1
          }, {
            default: c(() => [...e[6] || (e[6] = [
              b("Completed", -1)
            ])]),
            _: 1
          }),
          h.value && h.value.hasOutput ? (n(), v(z, {
            key: 0,
            value: h.value.output,
            label: "Result",
            icon: "tabler:file-check",
            open: !0
          }, null, 8, ["value"])) : (n(), m("p", lt, "Completed — no result was returned.")),
          u("div", nt, [
            d(a(A), {
              type: "button",
              class: "wf-embed-action",
              onClick: B
            }, {
              default: c(() => [
                d(a(j), {
                  icon: "tabler:refresh",
                  "aria-hidden": "true"
                }),
                e[7] || (e[7] = u("span", null, "Run again", -1))
              ]),
              _: 1
            })
          ])
        ])) : p.value === "failed" ? (n(), m("div", rt, [
          d(a(w), {
            class: "wf-embed-status is-error",
            severity: "error",
            closable: !1
          }, {
            default: c(() => [...e[8] || (e[8] = [
              b("Failed", -1)
            ])]),
            _: 1
          }),
          g.value ? (n(), v(a(w), {
            key: 0,
            class: "wf-embed-err",
            severity: "error",
            closable: !1
          }, {
            default: c(() => [
              b(k(g.value), 1)
            ]),
            _: 1
          })) : h.value && h.value.hasReason ? (n(), v(a(w), {
            key: 1,
            class: "wf-embed-reason",
            severity: "error",
            closable: !1
          }, {
            default: c(() => [
              b(k(h.value.reason), 1)
            ]),
            _: 1
          })) : (n(), v(a(w), {
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
          u("div", ot, [
            d(a(A), {
              type: "button",
              class: "wf-embed-action",
              onClick: B
            }, {
              default: c(() => [
                d(a(j), {
                  icon: "tabler:refresh",
                  "aria-hidden": "true"
                }),
                e[10] || (e[10] = u("span", null, "Run again", -1))
              ]),
              _: 1
            })
          ])
        ])) : I("", !0)
      ])) : (n(), v(Ve, {
        key: 2,
        onSelect: q
      }))
    ]));
  }
}), it = [Ce, $e].join(`
`), dt = {
  type: "object",
  properties: {
    "flow-id": { type: "string" },
    input: { type: "string" },
    mode: { type: "string" },
    label: { type: "string" }
  }
};
class ct extends de {
  static get wippyConfig() {
    return {
      propsSchema: dt,
      hostCssKeys: ["themeConfigUrl", "markdownCssUrl", "primeVueCssUrl"],
      inlineCss: it
    };
  }
  static get vueConfig() {
    return { rootComponent: ut, plugins: [ce] };
  }
}
je(import.meta.url, ct);

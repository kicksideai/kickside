import { u as ce, a as fe, s as _, W as pe, P as we } from "./index-B9KLaL2S.js";
import { defineComponent as Q, ref as b, onMounted as me, openBlock as n, createBlock as m, withCtx as f, createElementVNode as i, createVNode as d, unref as o, toDisplayString as g, createTextVNode as v, defineAsyncComponent as be, computed as S, onBeforeUnmount as ve, watch as ge, createElementBlock as y, withModifiers as he, createCommentVNode as $, Fragment as ye } from "vue";
import { aa as xe, w as X, ab as Z, d as ke, e as _e, aq as Ce, ae as ze, ar as Ee, l as Se, s as O, a5 as H, O as Re, as as Ie, ac as We, m as Pe, M as $e, ap as je } from "./pickerselect-w9U6RgbR.js";
import { s as K } from "./index-DRigRSgk.js";
import { on as G, define as Oe } from "@wippy-fe/proxy";
import { Icon as W } from "@iconify/vue";
const Ae = { class: "wf-embed-ico" }, Me = { class: "wf-embed-main" }, Ne = { class: "wf-embed-title" }, Le = { class: "wf-embed-meta" }, Ve = { class: "wf-embed-io" }, Fe = /* @__PURE__ */ Q({
  __name: "EmbedWorkflowPicker",
  emits: ["select"],
  setup(t, { emit: l }) {
    const a = l, c = b(!1), u = b(""), s = b([]);
    async function C() {
      c.value = !0, u.value = "";
      try {
        const p = await X({ filter: "published" });
        s.value = p.map((w) => Z(w, {}, [], "")).filter((w) => !!w.published_version);
      } catch (p) {
        u.value = p instanceof Error ? p.message : "Could not load Workflows.";
      } finally {
        c.value = !1;
      }
    }
    me(C);
    function x(p, w) {
      return p.title.toLowerCase().includes(w) || p.id.toLowerCase().includes(w);
    }
    return (p, w) => (n(), m(xe, {
      rows: s.value,
      loading: c.value,
      error: u.value,
      matches: x,
      placeholder: "Search published Workflows",
      "empty-message": "No published Workflows available.",
      "root-class": "wf-embed-pick",
      "search-class": "wf-embed-search",
      "note-class": "wf-embed-note",
      "error-class": "wf-embed-err",
      "list-class": "wf-embed-list",
      "row-class": "wf-embed-row",
      "quiet-rows": "",
      "empty-class": "wf-embed-empty",
      onSelect: w[0] || (w[0] = (z) => a("select", z))
    }, {
      row: f(({ item: z }) => [
        i("span", Ae, [
          d(o(W), {
            icon: "tabler:route",
            "aria-hidden": "true"
          })
        ]),
        i("span", Me, [
          i("span", Ne, g(z.title), 1),
          i("span", Le, [
            i("span", null, "v" + g(z.published_version), 1),
            i("span", Ve, [
              w[1] || (w[1] = i("strong", null, "In", -1)),
              v(g(z.input_summary), 1)
            ])
          ])
        ]),
        d(o(W), {
          icon: "tabler:chevron-right",
          class: "wf-embed-go",
          "aria-hidden": "true"
        })
      ]),
      _: 1
    }, 8, ["rows", "loading", "error"]));
  }
}), Ue = "Run Workflow";
function Y(t, l) {
  const a = t[l];
  return typeof a == "string" ? a : "";
}
function Be(t) {
  return typeof t == "string" && t.trim().toLowerCase() === "dispatch" ? "dispatch" : "run";
}
function Te(t) {
  if (t == null || t === "") return { value: null, error: "" };
  if (typeof t == "object")
    return Array.isArray(t) ? { value: null, error: "Input must be a JSON object." } : { value: t, error: "" };
  if (typeof t == "string") {
    const l = t.trim();
    if (!l) return { value: null, error: "" };
    try {
      const a = JSON.parse(l);
      return !a || typeof a != "object" || Array.isArray(a) ? { value: null, error: "Input must be a JSON object." } : { value: a, error: "" };
    } catch {
      return { value: null, error: "Input is not valid JSON." };
    }
  }
  return { value: null, error: "Input must be a JSON object." };
}
function qe(t) {
  const l = t && typeof t == "object" ? t : {}, { value: a, error: c } = Te(l.input), u = Y(l, "label").trim() || Ue;
  return {
    workflowId: Y(l, "flowId").trim(),
    input: a,
    inputError: c,
    mode: Be(l.mode),
    label: u
  };
}
function Je(t, l) {
  const a = ze(l), c = Array.isArray(a?.required) ? a?.required.map(String) : [];
  if (!c.length) return [];
  const u = t && typeof t == "object" && !Array.isArray(t) ? t : {};
  return c.filter((s) => {
    const C = u[s];
    return C == null || typeof C == "string" && C.trim() === "";
  });
}
function De(t, l) {
  const a = Je(t, l);
  return a.length ? { ok: !1, message: `Provide ${a.length === 1 ? `the ${a[0]} field` : `these fields: ${a.join(", ")}`} before running.`, missing: a } : { ok: !0, message: "", missing: a };
}
function He(t) {
  const l = ke(t.status), a = _e(t.status);
  if (l === "error") {
    const c = Ce(t.error);
    return { phase: "failed", tone: l, statusLabel: a, output: void 0, hasOutput: !1, outputPending: !1, reason: c, hasReason: !!c };
  }
  if (l === "ok") {
    const c = t.output !== void 0;
    return {
      phase: "completed",
      tone: l,
      statusLabel: a,
      output: t.output,
      hasOutput: c,
      outputPending: !c,
      reason: "",
      hasReason: !1
    };
  }
  return { phase: "running", tone: l, statusLabel: a, output: void 0, hasOutput: !1, outputPending: !1, reason: "", hasReason: !1 };
}
const Ke = { class: "wf-embed" }, Ge = {
  key: 0,
  class: "wf-embed-note"
}, Ye = {
  key: 3,
  class: "wf-embed-run"
}, Qe = { class: "wf-embed-hd" }, Xe = { class: "wf-embed-hd-ico" }, Ze = { class: "wf-embed-hd-main" }, et = { class: "wf-embed-hd-title" }, tt = { class: "wf-embed-input" }, rt = {
  key: 3,
  class: "wf-embed-subtle"
}, ot = { class: "wf-embed-actions" }, at = {
  key: 1,
  class: "wf-embed-status is-running"
}, nt = {
  key: 0,
  class: "wf-embed-runid"
}, st = {
  key: 2,
  class: "wf-embed-result"
}, it = {
  key: 0,
  class: "wf-embed-runid"
}, lt = { class: "wf-embed-actions" }, ut = {
  key: 3,
  class: "wf-embed-result"
}, dt = {
  key: 1,
  class: "wf-embed-subtle"
}, ct = { class: "wf-embed-actions" }, ft = {
  key: 4,
  class: "wf-embed-result"
}, pt = { class: "wf-embed-actions" }, wt = /* @__PURE__ */ Q({
  __name: "EmbedWorkflow",
  setup(t) {
    const l = be(() => import("./SchemaEditor-VdfqZh69.js")), a = ce(), c = fe(), u = S(() => qe(a.value)), s = b(null), C = b(!1), x = b(""), p = b({}), w = b(0), z = b(!0), h = b("ready"), A = b(!1), R = b(""), E = b(""), k = b(null);
    let N = null, q = null, L = !1;
    const ee = S(() => s.value ? `/workflows/${s.value.id}` : "");
    function te() {
      s.value && c("navigate", { route: `/workflows/${s.value.id}` });
    }
    const V = S(() => s.value?.input_schema), re = S(() => Ee(V.value)), oe = S(() => u.value.input !== null), F = S(() => De(p.value, V.value)), J = S(() => h.value === "ready" && !A.value && !u.value.inputError && z.value && F.value.ok), M = S(() => R.value.length > 8 ? R.value.slice(0, 8) : R.value), ae = S(() => !u.value.workflowId);
    function U(r, e) {
      return We(r) === 403 ? "You don’t have access to this Workflow." : Pe(r, e);
    }
    function j() {
      N?.(), N = null;
    }
    async function B() {
      const r = s.value?.id || "", e = R.value;
      if (!(!r || !e || L)) {
        L = !0;
        try {
          const { run: I } = await Re(r, e);
          if (s.value?.id !== r || R.value !== e) return;
          const P = He(I);
          k.value = P, h.value = P.phase;
        } catch (I) {
          E.value = U(I, "Lost track of this run."), h.value = "failed";
        } finally {
          L = !1;
        }
      }
    }
    function ne(r) {
      j();
      try {
        const e = G(`kickside.thread.${r}`, (I) => {
          $e(I, r) && B();
        });
        N = typeof e == "function" ? e : null;
      } catch {
      }
    }
    async function se() {
      if (!(!s.value || !J.value)) {
        E.value = "", A.value = !0;
        try {
          const r = Number(s.value.published_version), e = await Ie(s.value.id, r, p.value || {});
          R.value = e, u.value.mode === "dispatch" ? h.value = "dispatched" : (k.value = null, h.value = "running", ne(s.value.id), await B());
        } catch (r) {
          E.value = U(r, "Could not start the run.");
        } finally {
          A.value = !1;
        }
      }
    }
    function D(r) {
      j(), s.value = r, x.value = "", h.value = "ready", R.value = "", k.value = null, E.value = "", p.value = u.value.input ? { ...u.value.input } : {}, z.value = !0;
    }
    async function ie(r) {
      C.value = !0, x.value = "";
      try {
        const I = (await X({ filter: "published" })).map((P) => Z(P, {}, [], "")).find((P) => P.id === r && !!P.published_version);
        I ? D(I) : (s.value = null, x.value = "This Workflow isn’t published, or you don’t have access to it.");
      } catch (e) {
        s.value = null, x.value = U(e, "Could not load this Workflow.");
      } finally {
        C.value = !1;
      }
    }
    function T() {
      j(), h.value = "ready", R.value = "", k.value = null, E.value = "", w.value += 1;
    }
    function le() {
      j(), s.value = null, x.value = "";
    }
    function ue(r) {
      p.value = r || {};
    }
    function de(r) {
      z.value = r;
    }
    try {
      const r = G("@visibility", (e) => {
        e === !0 && B();
      });
      q = typeof r == "function" ? r : null;
    } catch {
    }
    return ve(() => {
      j(), q?.();
    }), ge(
      () => u.value.workflowId,
      (r) => {
        j(), r ? ie(r) : (s.value = null, x.value = "");
      },
      { immediate: !0 }
    ), (r, e) => (n(), y("div", Ke, [
      C.value ? (n(), y("div", Ge, [
        d(o(K), {
          class: "wf-status-spinner",
          "stroke-width": "4",
          "aria-label": "Loading Workflow"
        }),
        e[0] || (e[0] = i("span", null, "Loading Workflow…", -1))
      ])) : x.value ? (n(), m(o(_), {
        key: 1,
        class: "wf-embed-directed",
        severity: "error",
        closable: !1
      }, {
        default: f(() => [
          v(g(x.value), 1)
        ]),
        _: 1
      })) : s.value ? (n(), y("div", Ye, [
        i("header", Qe, [
          i("span", Xe, [
            d(o(W), {
              icon: "tabler:route",
              "aria-hidden": "true"
            })
          ]),
          i("span", Ze, [
            i("span", et, g(s.value.title), 1),
            d(o(Se), {
              class: "wf-embed-hd-sub",
              severity: "success",
              value: `Published v${s.value.published_version}`
            }, null, 8, ["value"])
          ]),
          d(o(O), {
            as: "a",
            class: "wf-embed-open",
            href: ee.value,
            severity: "secondary",
            text: "",
            title: "Open this Workflow in the editor",
            onClick: he(te, ["prevent"])
          }, {
            default: f(() => [
              d(o(W), {
                icon: "tabler:external-link",
                "aria-hidden": "true"
              }),
              e[1] || (e[1] = i("span", null, "Open in editor", -1))
            ]),
            _: 1
          }, 8, ["href"]),
          ae.value ? (n(), m(o(O), {
            key: 0,
            type: "button",
            class: "wf-embed-change",
            severity: "secondary",
            text: "",
            onClick: le
          }, {
            default: f(() => [...e[2] || (e[2] = [
              v("Change", -1)
            ])]),
            _: 1
          })) : $("", !0)
        ]),
        h.value === "ready" ? (n(), y(ye, { key: 0 }, [
          i("div", tt, [
            u.value.inputError ? (n(), m(o(_), {
              key: 0,
              class: "wf-field-err",
              severity: "error",
              closable: !1
            }, {
              default: f(() => [
                v(g(u.value.inputError), 1)
              ]),
              _: 1
            })) : oe.value ? (n(), m(H, {
              key: 1,
              value: p.value,
              label: "Input",
              icon: "tabler:arrow-right-circle",
              open: !0
            }, null, 8, ["value"])) : re.value ? (n(), m(o(l), {
              key: 2,
              mode: "value",
              schema: V.value,
              "model-value": p.value,
              "reset-key": w.value,
              rows: 6,
              label: "Input",
              placeholder: '{ "key": "value" }',
              "onUpdate:modelValue": ue,
              onValid: de
            }, null, 8, ["schema", "model-value", "reset-key"])) : (n(), y("p", rt, "This Workflow needs no input.")),
            !u.value.inputError && !F.value.ok ? (n(), m(o(_), {
              key: 4,
              class: "wf-embed-gate",
              severity: "warn",
              closable: !1
            }, {
              default: f(() => [
                v(g(F.value.message), 1)
              ]),
              _: 1
            })) : $("", !0)
          ]),
          i("div", ot, [
            d(o(O), {
              type: "button",
              class: "wf-embed-action",
              disabled: !J.value,
              loading: A.value,
              onClick: se
            }, {
              default: f(() => [
                A.value ? $("", !0) : (n(), m(o(W), {
                  key: 0,
                  icon: u.value.mode === "dispatch" ? "tabler:send" : "tabler:player-play",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])),
                i("span", null, g(u.value.label), 1)
              ]),
              _: 1
            }, 8, ["disabled", "loading"])
          ]),
          E.value ? (n(), m(o(_), {
            key: 0,
            class: "wf-embed-err",
            severity: "error",
            closable: !1
          }, {
            default: f(() => [
              v(g(E.value), 1)
            ]),
            _: 1
          })) : $("", !0)
        ], 64)) : h.value === "running" ? (n(), y("div", at, [
          d(o(K), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Workflow running"
          }),
          i("span", null, [
            e[3] || (e[3] = v("Running…", -1)),
            M.value ? (n(), y("span", nt, " · " + g(M.value), 1)) : $("", !0)
          ])
        ])) : h.value === "dispatched" ? (n(), y("div", st, [
          d(o(_), {
            class: "wf-embed-status is-ok",
            severity: "success",
            closable: !1
          }, {
            default: f(() => [
              i("span", null, [
                e[4] || (e[4] = v("Dispatched", -1)),
                M.value ? (n(), y("span", it, " · run " + g(M.value), 1)) : $("", !0)
              ])
            ]),
            _: 1
          }),
          i("div", lt, [
            d(o(O), {
              type: "button",
              class: "wf-embed-action",
              onClick: T
            }, {
              default: f(() => [
                d(o(W), {
                  icon: "tabler:refresh",
                  "aria-hidden": "true"
                }),
                e[5] || (e[5] = i("span", null, "Dispatch again", -1))
              ]),
              _: 1
            })
          ])
        ])) : h.value === "completed" ? (n(), y("div", ut, [
          d(o(_), {
            class: "wf-embed-status is-ok",
            severity: "success",
            closable: !1
          }, {
            default: f(() => [...e[6] || (e[6] = [
              v("Completed", -1)
            ])]),
            _: 1
          }),
          k.value && k.value.hasOutput ? (n(), m(H, {
            key: 0,
            value: k.value.output,
            label: "Result",
            icon: "tabler:file-check",
            open: !0
          }, null, 8, ["value"])) : (n(), y("p", dt, "Completed — no result was returned.")),
          i("div", ct, [
            d(o(O), {
              type: "button",
              class: "wf-embed-action",
              onClick: T
            }, {
              default: f(() => [
                d(o(W), {
                  icon: "tabler:refresh",
                  "aria-hidden": "true"
                }),
                e[7] || (e[7] = i("span", null, "Run again", -1))
              ]),
              _: 1
            })
          ])
        ])) : h.value === "failed" ? (n(), y("div", ft, [
          d(o(_), {
            class: "wf-embed-status is-error",
            severity: "error",
            closable: !1
          }, {
            default: f(() => [...e[8] || (e[8] = [
              v("Failed", -1)
            ])]),
            _: 1
          }),
          E.value ? (n(), m(o(_), {
            key: 0,
            class: "wf-embed-err",
            severity: "error",
            closable: !1
          }, {
            default: f(() => [
              v(g(E.value), 1)
            ]),
            _: 1
          })) : k.value && k.value.hasReason ? (n(), m(o(_), {
            key: 1,
            class: "wf-embed-reason",
            severity: "error",
            closable: !1
          }, {
            default: f(() => [
              v(g(k.value.reason), 1)
            ]),
            _: 1
          })) : (n(), m(o(_), {
            key: 2,
            class: "wf-embed-subtle",
            severity: "error",
            closable: !1
          }, {
            default: f(() => [...e[9] || (e[9] = [
              v("This run failed, and no further detail was reported.", -1)
            ])]),
            _: 1
          })),
          i("div", pt, [
            d(o(O), {
              type: "button",
              class: "wf-embed-action",
              onClick: T
            }, {
              default: f(() => [
                d(o(W), {
                  icon: "tabler:refresh",
                  "aria-hidden": "true"
                }),
                e[10] || (e[10] = i("span", null, "Run again", -1))
              ]),
              _: 1
            })
          ])
        ])) : $("", !0)
      ])) : (n(), m(Fe, {
        key: 2,
        onSelect: D
      }))
    ]));
  }
}), mt = '.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}:host{--wf-surface: color-mix(in srgb, var(--p-content-background) 95%, var(--p-text-color));--wf-panel: color-mix(in srgb, var(--p-content-background) 97%, var(--p-text-color));--wf-elevated: color-mix(in srgb, var(--p-content-background) 88%, var(--p-text-color));--wf-line-soft: color-mix(in srgb, var(--p-content-border-color) 55%, transparent);--wf-line-strong: color-mix(in srgb, var(--p-text-color) 34%, transparent);--wf-muted: color-mix(in srgb, var(--p-text-muted-color) 55%, var(--p-text-color));--wf-faint: color-mix(in srgb, var(--p-text-muted-color) 40%, var(--p-text-color));--wf-accent-fg: color-mix(in srgb, var(--p-primary-color) 35%, var(--p-text-color));--wf-danger: color-mix(in srgb, var(--p-danger-500) 50%, var(--p-text-color));--wf-amber: color-mix(in srgb, #f5a623 60%, var(--p-text-color));--wf-violet: color-mix(in srgb, #8b5cf6 60%, var(--p-text-color));--wf-blue: color-mix(in srgb, #3b82f6 60%, var(--p-text-color));--wf-teal: color-mix(in srgb, #14b8a6 60%, var(--p-text-color));--wf-rose: color-mix(in srgb, #f43f5e 60%, var(--p-text-color));--wf-paper: color-mix(in srgb, #b6924a 60%, var(--p-text-color));--wf-contract-in: color-mix(in srgb, #5b8aa6 60%, var(--p-text-color));--wf-contract-out: color-mix(in srgb, #6d78b5 60%, var(--p-text-color));--wf-contract-err: color-mix(in srgb, #a3788f 60%, var(--p-text-color));--wf-dot: color-mix(in srgb, var(--p-text-muted-color) 26%, transparent);--wf-minimap-node: color-mix(in srgb, var(--p-text-muted-color) 40%, transparent);--wf-radius: 14px;--wf-radius-sm: 8px;--wf-mono: ui-monospace, "SF Mono", "JetBrains Mono", monospace;--wf-fs-label: 10.5px;--wf-fs-meta: 11.5px;--wf-fs-body: 13px;--wf-fs-title: 15px;--wf-ease: cubic-bezier(.22, .61, .36, 1);--wf-elev-1: 0 2px 8px color-mix(in srgb, var(--p-text-color) 14%, transparent);--wf-elev-2: 0 6px 18px color-mix(in srgb, var(--p-text-color) 18%, transparent);--wf-elev-3: 0 12px 32px color-mix(in srgb, var(--p-text-color) 22%, transparent);--wf-layer-panel-affordance: 1;--wf-layer-list-header: 1;--wf-layer-selection: 2;--wf-layer-node-label: 3;--wf-layer-edge-annotation: 4;--wf-layer-canvas-status: 5;--wf-layer-palette: 21;--wf-layer-toolbar: 30;--wf-layer-coordinate-hint: 40;--wf-layer-coordinate-trace: 41;--wf-layer-coordinate-editor: 42;--wf-layer-immersive-shell: 50;display:block;position:relative;width:100%;height:100%;color:var(--p-text-color);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}*{box-sizing:border-box}.wf{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--p-content-background);overflow:hidden}.wf-banner{margin:10px 14px;min-width:0;overflow-wrap:anywhere}.wf-banner.wf-banner--error{margin:0;border-radius:0}.wf-embed{display:flex;flex-direction:column;gap:12px;color:var(--p-text-color);background:var(--p-content-background);font-size:var(--wf-fs-body);line-height:1.45;padding:14px;border:1px solid var(--p-content-border-color);border-radius:var(--wf-radius)}.wf-embed-note{display:flex;align-items:center;gap:8px;color:var(--wf-muted);font-size:var(--wf-fs-meta)}.wf-embed-directed{display:flex;align-items:flex-start;gap:10px;padding:14px;border:1px solid color-mix(in srgb,var(--p-warn-500) 32%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-warn-500) 7%,transparent);border-radius:10px}.wf-embed-directed p{margin:0;color:var(--p-text-color)}.wf-embed-directed-ico{color:var(--p-warn-500);flex:none;width:18px;height:18px;margin-top:1px}.wf-embed-err{margin:0;min-width:0;color:var(--wf-danger);font-size:var(--wf-fs-meta);overflow-wrap:anywhere}.wf-embed-subtle{margin:0;color:var(--wf-muted);font-size:var(--wf-fs-meta)}.wf-embed-pick{display:flex;flex-direction:column;gap:10px}.wf-embed-search{display:flex}.wf-embed-list{display:flex;flex-direction:column;gap:6px;max-height:320px;overflow:auto}.wf-embed-row{display:flex;align-items:center;gap:10px;width:100%;text-align:left}.wf-embed-ico{color:var(--wf-muted);display:inline-flex}.wf-embed-main{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}.wf-embed-title{font-weight:700}.wf-embed-meta{display:flex;gap:10px;font-size:var(--wf-fs-meta);color:var(--wf-muted);flex-wrap:wrap}.wf-embed-io strong{font-weight:700;color:var(--wf-faint);margin-right:4px;text-transform:uppercase;letter-spacing:.04em;font-size:var(--wf-fs-label)}.wf-embed-go{color:var(--wf-faint);flex:none}.wf-embed-empty{margin:0;color:var(--wf-muted);font-size:var(--wf-fs-meta);text-align:center;padding:12px}.wf-embed-run{display:flex;flex-direction:column;gap:12px}.wf-embed-hd{display:flex;align-items:center;gap:10px}.wf-embed-hd-ico{color:var(--wf-accent-fg);display:inline-flex}.wf-embed-hd-main{display:flex;flex-direction:column;gap:1px;flex:1;min-width:0}.wf-embed-hd-title{font-weight:750;font-size:var(--wf-fs-title)}.wf-embed-hd-sub{font-size:var(--wf-fs-meta);color:var(--wf-muted)}.wf-embed-open,.wf-embed-change{display:inline-flex;align-items:center;gap:5px;flex:none}.wf-embed-input{display:flex;flex-direction:column;gap:8px}.wf-embed-gate{margin:0;color:var(--p-warn-500);font-size:var(--wf-fs-meta)}.wf-embed-actions{display:flex;gap:8px}.wf-embed-status{display:flex;align-items:center;gap:8px;font-weight:700;font-size:var(--wf-fs-meta)}.wf-embed-status.is-running{color:var(--wf-muted)}.wf-embed-status.is-ok{color:var(--p-success-500)}.wf-embed-status.is-error{color:var(--wf-danger)}.wf-embed-runid{color:var(--wf-faint);font-weight:500;font-family:var(--wf-mono)}.wf-embed-result{display:flex;flex-direction:column;gap:10px}.wf-embed-reason{margin:0;min-width:0;color:var(--p-text-color);overflow-wrap:anywhere}@media(prefers-reduced-motion:reduce){:host *,:host *:before,:host *:after{scroll-behavior:auto;animation-duration:.01ms;animation-iteration-count:1;transition-duration:.01ms}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}', bt = [je, mt].join(`
`), vt = {
  type: "object",
  properties: {
    "flow-id": { type: "string" },
    input: { type: "string" },
    mode: { type: "string" },
    label: { type: "string" }
  }
};
class gt extends pe {
  static get wippyConfig() {
    return {
      propsSchema: vt,
      hostCssKeys: ["themeConfigUrl", "markdownCssUrl", "primeVueCssUrl"],
      inlineCss: bt
    };
  }
  static get vueConfig() {
    return { rootComponent: wt, plugins: [we] };
  }
}
Oe(import.meta.url, gt);

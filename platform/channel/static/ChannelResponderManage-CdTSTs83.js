import { defineComponent as Se, computed as C, ref as a, onMounted as Ce, watch as Me, resolveComponent as H, openBlock as o, createElementBlock as i, withModifiers as K, createElementVNode as l, createVNode as p, unref as I, Fragment as d, createTextVNode as c, toDisplayString as u, createCommentVNode as m, withDirectives as g, vModelText as h, renderList as Ae, vModelCheckbox as Ne } from "vue";
import { Icon as se } from "@iconify/vue";
import oe from "primevue/button";
import Ue from "primevue/select";
import { loadByTagName as X, api as P } from "@wippy-fe/proxy";
import { u as Ve, a as ze } from "./wc-runtime-h8e5VJvv.js";
import { _ as Re, e as ie } from "./errMsg-BJlMrW3g.js";
const Ie = { class: "kx-cr-head" }, Te = { class: "kx-cr-ico" }, Oe = { class: "kx-cr-title" }, je = { class: "kx-id" }, qe = {
  key: 0,
  class: "kx-note"
}, Ee = { class: "kx-field" }, Le = { class: "kx-field" }, $e = {
  class: "kx-input kx-input-ro",
  role: "textbox",
  "aria-readonly": "true"
}, Be = { class: "kx-id" }, De = { class: "kx-field" }, Pe = { class: "kx-field" }, Je = { class: "kx-adv" }, We = {
  key: 0,
  class: "kx-adv-badge kx-tag-sm"
}, Fe = {
  key: 0,
  class: "kx-adv-body"
}, Qe = { class: "kx-field" }, Ge = {
  key: 0,
  class: "kx-field"
}, He = {
  key: 1,
  class: "kx-field"
}, Ke = {
  key: 2,
  class: "kx-field"
}, Xe = { class: "kx-field" }, Ye = { class: "kx-field-lbl" }, Ze = {
  key: 0,
  class: "kx-id"
}, et = { class: "kx-field" }, tt = { class: "kx-check kx-check-control" }, lt = { class: "kx-field" }, nt = { class: "kx-inline-control kx-inline-control-standalone" }, at = {
  key: 2,
  class: "kx-error"
}, st = { class: "kx-actions" }, mt = /* @__PURE__ */ Se({
  __name: "ChannelResponderManage",
  setup(ot) {
    function re(t) {
      return (t.title || "").trim() || "Unknown capability";
    }
    async function Y(t, e) {
      const s = e ? { parent_id: e } : {}, { data: r } = await P.post(`/api/v1/connections/${encodeURIComponent(t)}/discover_resources`, s);
      return Array.isArray(r?.items) ? r.items : [];
    }
    async function Z(t, e, s) {
      for (const r of s)
        if (String(r.id ?? "") === e) return String(r.label || "").trim() || null;
      for (const r of s) {
        const k = String(r.id ?? "");
        if (!k || r.selectable === !0 || r.drillable !== !0) continue;
        const n = await Z(t, e, await Y(t, k));
        if (n) return n;
      }
      return null;
    }
    async function ue(t, e) {
      if (!t || !e) return null;
      try {
        return await Z(t, e, await Y(t));
      } catch {
        return null;
      }
    }
    const J = Ve(), M = ze(), A = C(() => {
      const t = [J.value.config, J.value.value];
      for (const e of t) {
        if (e && typeof e == "object" && typeof e.id == "string")
          return String(e.id);
        if (typeof e == "string")
          try {
            const s = JSON.parse(e);
            if (s && typeof s.id == "string") return s.id;
          } catch {
          }
      }
      return "";
    });
    function de() {
      const t = J.value.config;
      return t && typeof t == "object" && !Array.isArray(t) ? t : {};
    }
    function ce() {
      const t = de().automation;
      return t && typeof t == "object" && !Array.isArray(t) ? t : {};
    }
    const N = a(!0), T = a(!1), f = a(""), U = a(""), W = a(""), x = a(""), F = a(""), Q = a(""), O = a(!1), j = C(() => W.value || Q.value), _ = a(""), G = a(""), ee = a(!1), v = a([]), y = a({}), q = a([]), w = a(""), b = a(!0), E = a(120), S = a(10), V = a("immediate"), ve = [
      { label: "Immediate", value: "immediate" },
      { label: "Lazy", value: "lazy" }
    ], L = a(8), $ = a("class:fast"), B = a("Only reply when the accumulated channel messages are relevant to the agent. Ignore noise, acknowledgements, and unrelated chatter."), D = a(""), z = a(!1), pe = C(() => q.value.filter((t) => !!t.web_component && v.value.includes(t.id))), R = C(() => V.value === "lazy"), te = C(() => U.value.trim() ? _.value ? "" : "An agent is required." : "Name is required."), le = C(() => !te.value);
    function me(t) {
      const e = t.detail, s = e && Array.isArray(e.selected) ? e.selected.map(String) : [], r = e && Array.isArray(e.labels) ? e.labels.map(String) : [];
      _.value = s[0] || "", G.value = (r[0] || "").trim();
    }
    async function ne(t) {
      if (!t.length) {
        q.value = [];
        return;
      }
      try {
        const { data: e } = await P.get(`/api/v1/agents/traits?ids=${t.map(encodeURIComponent).join(",")}`);
        q.value = e?.traits || [];
      } catch (e) {
        q.value = [], M("error", { message: "failed to load capabilities", error: e });
      }
    }
    function fe(t) {
      const e = t.detail, s = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      v.value = s;
      const r = {};
      for (const k of s) k in y.value && (r[k] = y.value[k]);
      y.value = r, ne(s);
    }
    function ye(t, e) {
      y.value = { ...y.value, [t]: e };
    }
    function ke() {
      const t = {};
      for (const e of v.value) {
        const s = y.value[e];
        s && typeof s == "object" && (t[e] = s);
      }
      return t;
    }
    async function ge() {
      if (!(W.value || !F.value || !x.value)) {
        O.value = !0;
        try {
          Q.value = await ue(F.value, x.value) || "";
        } finally {
          O.value = !1;
        }
      }
    }
    function xe(t, e) {
      U.value = String(t.title || ce().title || ""), W.value = String(t.channel_name || e.channel || ""), x.value = String(t.channel_id || ""), F.value = String(t.connection_id || ""), Q.value = "", ge(), _.value = String(t.agent_id || ""), G.value = String(t.agent_name || e.agent || ""), ee.value = t.paused === !0, v.value = Array.isArray(t.traits) ? t.traits.map(String) : [], y.value = t.trait_contexts && typeof t.trait_contexts == "object" ? t.trait_contexts : {}, w.value = String(t.context || ""), b.value = t.session_policy?.rotate_after_idle !== !1, E.value = Math.max(1, Math.min(43200, Number(t.session_policy?.idle_seconds || 7200) / 60)), S.value = Math.max(1, Math.min(1440, Number(t.session_policy?.runtime_idle_seconds || 600) / 60)), V.value = t.response_policy?.mode === "lazy" ? "lazy" : "immediate", L.value = Math.max(1, Math.min(120, Math.floor(Number(t.response_policy?.wait_seconds) || 8))), $.value = String(t.response_policy?.assessor_model || "class:fast"), B.value = String(t.response_policy?.prompt || "Only reply when the accumulated channel messages are relevant to the agent. Ignore noise, acknowledgements, and unrelated chatter."), D.value = String(t.system_prompt || ""), z.value = !1, ne(v.value);
    }
    async function ae() {
      if (!A.value) {
        f.value = "Automation id is required.", N.value = !1;
        return;
      }
      N.value = !0, f.value = "";
      try {
        const { data: t } = await P.post(`/api/v1/automations/${encodeURIComponent(A.value)}/actions/read_config`, {}), e = t?.result?.state || {}, s = t?.result?.public_state || {};
        xe(e, s);
      } catch (t) {
        f.value = ie(t, "failed to load responder");
      } finally {
        N.value = !1;
      }
    }
    async function be() {
      if (!le.value) {
        f.value = te.value;
        return;
      }
      T.value = !0, f.value = "";
      try {
        const t = {
          title: U.value.trim(),
          agent_id: _.value,
          agent_name: G.value,
          target: "channel",
          traits: [...v.value],
          trait_contexts: ke(),
          context: w.value.trim(),
          session_policy: {
            rotate_after_idle: b.value,
            idle_seconds: Math.max(60, Math.min(2592e3, Math.floor((Number(E.value) || 120) * 60))),
            runtime_idle_seconds: Math.max(60, Math.min(86400, Math.floor((Number(S.value) || 10) * 60)))
          },
          response_policy: {
            mode: V.value,
            wait_seconds: Math.max(1, Math.min(120, Math.floor(Number(L.value) || 8))),
            assessor_model: $.value || "class:fast",
            prompt: B.value.trim()
          },
          system_prompt: D.value.trim()
        }, { data: e } = await P.post(`/api/v1/automations/${encodeURIComponent(A.value)}/actions/configure`, { input: t });
        M("change", { id: A.value, state: e?.result?.state }), M("close", {});
      } catch (t) {
        const e = ie(t, "save failed");
        f.value = e, M("error", { message: e, error: t });
      } finally {
        T.value = !1;
      }
    }
    function he() {
      M("close", {});
    }
    Ce(() => {
      X("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), X("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), X("wc-multiselect", { timeoutMs: 8e3 }).catch(() => {
      }), ae();
    }), Me(A, ae);
    function _e(t) {
      $.value = String(t.detail || "class:fast");
    }
    return (t, e) => {
      const s = H("wc-agent-picker"), r = H("wc-model-picker"), k = H("wc-multiselect");
      return o(), i("form", {
        class: "kx-cr",
        onSubmit: K(be, ["prevent"])
      }, [
        l("div", Ie, [
          l("span", Te, [
            p(I(se), {
              icon: "tabler:message-2-bolt",
              "aria-hidden": "true"
            })
          ]),
          l("div", Oe, [
            e[13] || (e[13] = l("h2", null, "Channel responder", -1)),
            l("span", null, [
              j.value ? (o(), i(d, { key: 0 }, [
                c(u(j.value), 1)
              ], 64)) : O.value ? (o(), i(d, { key: 1 }, [
                c("Resolving…")
              ], 64)) : x.value ? (o(), i(d, { key: 2 }, [
                e[12] || (e[12] = c("Unknown channel", -1)),
                l("span", je, u(x.value), 1)
              ], 64)) : (o(), i(d, { key: 3 }, [
                c("Channel")
              ], 64)),
              ee.value ? (o(), i(d, { key: 4 }, [
                c(" · paused")
              ], 64)) : m("", !0)
            ])
          ])
        ]),
        N.value ? (o(), i("div", qe, "Loading responder settings…")) : (o(), i(d, { key: 1 }, [
          l("label", Ee, [
            e[14] || (e[14] = l("span", { class: "kx-field-lbl" }, "Name", -1)),
            g(l("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (n) => U.value = n),
              class: "kx-input",
              type: "text",
              placeholder: "Support channel responder"
            }, null, 512), [
              [h, U.value]
            ])
          ]),
          l("label", Le, [
            e[16] || (e[16] = l("span", { class: "kx-field-lbl" }, "Channel", -1)),
            l("div", $e, [
              j.value ? (o(), i(d, { key: 0 }, [
                c(u(j.value), 1)
              ], 64)) : O.value ? (o(), i(d, { key: 1 }, [
                c("Resolving…")
              ], 64)) : x.value ? (o(), i(d, { key: 2 }, [
                e[15] || (e[15] = c("Unknown channel", -1)),
                l("span", Be, u(x.value), 1)
              ], 64)) : (o(), i(d, { key: 3 }, [
                c("Channel")
              ], 64))
            ])
          ]),
          l("div", De, [
            e[17] || (e[17] = l("span", { class: "kx-field-lbl" }, "Agent", -1)),
            p(s, {
              placeholder: "Pick an agent…",
              multi: "false",
              selected: _.value ? JSON.stringify([_.value]) : "[]",
              onChange: me
            }, null, 8, ["selected"])
          ]),
          l("label", Pe, [
            e[18] || (e[18] = l("span", { class: "kx-field-lbl" }, "System prompt", -1)),
            g(l("textarea", {
              "onUpdate:modelValue": e[1] || (e[1] = (n) => D.value = n),
              class: "kx-input kx-textarea kx-textarea-lg",
              rows: "7",
              placeholder: "Instructions applied to every channel turn."
            }, null, 512), [
              [h, D.value]
            ])
          ]),
          l("div", Je, [
            l("button", {
              type: "button",
              class: "kx-adv-toggle",
              onClick: e[2] || (e[2] = (n) => z.value = !z.value)
            }, [
              p(I(se), {
                icon: z.value ? "tabler:chevron-down" : "tabler:chevron-right",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              e[19] || (e[19] = c(" Advanced ", -1)),
              v.value.length || w.value.trim() || b.value || S.value !== 10 || R.value ? (o(), i("span", We, u(v.value.length) + u(w.value.trim() ? " + context" : "") + u(b.value ? " + chat cutoff" : "") + u(S.value !== 10 ? " + runtime idle" : "") + u(R.value ? " + lazy" : ""), 1)) : m("", !0)
            ]),
            z.value ? (o(), i("div", Fe, [
              l("div", Qe, [
                e[20] || (e[20] = l("span", { class: "kx-field-lbl" }, "Response mode", -1)),
                p(I(Ue), {
                  modelValue: V.value,
                  "onUpdate:modelValue": e[3] || (e[3] = (n) => V.value = n),
                  class: "kx-select",
                  options: ve,
                  "option-label": "label",
                  "option-value": "value",
                  "aria-label": "Response mode"
                }, null, 8, ["modelValue"])
              ]),
              R.value ? (o(), i("label", Ge, [
                e[21] || (e[21] = l("span", { class: "kx-field-lbl" }, "Quiet window seconds", -1)),
                g(l("input", {
                  "onUpdate:modelValue": e[4] || (e[4] = (n) => L.value = n),
                  class: "kx-input",
                  type: "number",
                  min: "1",
                  max: "120",
                  step: "1"
                }, null, 512), [
                  [
                    h,
                    L.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ])) : m("", !0),
              R.value ? (o(), i("div", He, [
                e[22] || (e[22] = l("span", { class: "kx-field-lbl" }, "Assessment model", -1)),
                p(r, {
                  value: $.value,
                  capability: "generate",
                  onSelect: _e
                }, null, 8, ["value"])
              ])) : m("", !0),
              R.value ? (o(), i("label", Ke, [
                e[23] || (e[23] = l("span", { class: "kx-field-lbl" }, "Lazy response prompt", -1)),
                g(l("textarea", {
                  "onUpdate:modelValue": e[5] || (e[5] = (n) => B.value = n),
                  class: "kx-input kx-textarea",
                  rows: "4",
                  placeholder: "Tell the responder when to stay quiet and when to answer."
                }, null, 512), [
                  [h, B.value]
                ])
              ])) : m("", !0),
              l("div", Xe, [
                e[24] || (e[24] = l("span", { class: "kx-field-lbl" }, "Additional capabilities", -1)),
                p(k, {
                  source: "/api/v1/agents/traits",
                  "response-key": "traits",
                  "label-key": "title",
                  "desc-key": "description",
                  placeholder: "Add capabilities on top of the agent's own…",
                  selected: JSON.stringify(v.value),
                  onChange: fe
                }, null, 8, ["selected"])
              ]),
              (o(!0), i(d, null, Ae(pe.value, (n) => (o(), i("div", {
                key: n.id,
                class: "kx-field kx-trait-cfg"
              }, [
                l("span", Ye, [
                  c(u(re(n)), 1),
                  n.title?.trim() ? m("", !0) : (o(), i("span", Ze, u(n.id), 1))
                ]),
                p(Re, {
                  tag: n.web_component || "",
                  config: y.value[n.id] || {},
                  provider: n.provider,
                  onChange: (we) => ye(n.id, we)
                }, null, 8, ["tag", "config", "provider", "onChange"])
              ]))), 128)),
              l("label", et, [
                e[25] || (e[25] = l("span", { class: "kx-field-lbl" }, "Additional prompt context", -1)),
                g(l("textarea", {
                  "onUpdate:modelValue": e[6] || (e[6] = (n) => w.value = n),
                  class: "kx-input kx-textarea",
                  rows: "3",
                  placeholder: "Stable prompt context for every reply in this channel."
                }, null, 512), [
                  [h, w.value]
                ])
              ]),
              l("label", tt, [
                g(l("input", {
                  "onUpdate:modelValue": e[7] || (e[7] = (n) => b.value = n),
                  type: "checkbox"
                }, null, 512), [
                  [Ne, b.value]
                ]),
                l("span", null, [
                  e[28] || (e[28] = l("strong", null, "Start a new chat after quiet time", -1)),
                  e[29] || (e[29] = l("small", null, "When the channel is quiet for the selected time, the next message starts a fresh chat history.", -1)),
                  b.value ? (o(), i("span", {
                    key: 0,
                    class: "kx-inline-control",
                    onClick: e[10] || (e[10] = K(() => {
                    }, ["stop"]))
                  }, [
                    e[26] || (e[26] = l("span", null, "After", -1)),
                    g(l("input", {
                      "onUpdate:modelValue": e[8] || (e[8] = (n) => E.value = n),
                      class: "kx-input kx-number-sm",
                      type: "number",
                      min: "1",
                      max: "43200",
                      step: "1",
                      onClick: e[9] || (e[9] = K(() => {
                      }, ["stop"]))
                    }, null, 512), [
                      [
                        h,
                        E.value,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    e[27] || (e[27] = l("span", null, "minutes", -1))
                  ])) : m("", !0)
                ])
              ]),
              l("label", lt, [
                e[31] || (e[31] = l("span", { class: "kx-field-lbl" }, "Stop idle responder after", -1)),
                l("span", nt, [
                  g(l("input", {
                    "onUpdate:modelValue": e[11] || (e[11] = (n) => S.value = n),
                    class: "kx-input kx-number-sm",
                    type: "number",
                    min: "1",
                    max: "1440",
                    step: "1"
                  }, null, 512), [
                    [
                      h,
                      S.value,
                      void 0,
                      { number: !0 }
                    ]
                  ]),
                  e[30] || (e[30] = l("span", null, "minutes without activity", -1))
                ]),
                e[32] || (e[32] = l("small", { class: "kx-field-help" }, "Ends the live responder process; the next channel message starts it again.", -1))
              ])
            ])) : m("", !0)
          ])
        ], 64)),
        f.value ? (o(), i("div", at, u(f.value), 1)) : m("", !0),
        l("div", st, [
          p(I(oe), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            onClick: he
          }),
          p(I(oe), {
            type: "submit",
            label: "Save",
            loading: T.value,
            disabled: N.value || T.value || !le.value
          }, null, 8, ["loading", "disabled"])
        ])
      ], 32);
    };
  }
});
export {
  mt as default
};
//# sourceMappingURL=ChannelResponderManage-CdTSTs83.js.map

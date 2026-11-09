import { u as pe, a as me, W as ve } from "./wc-runtime-h8e5VJvv.js";
import { s as fe, P as ke } from "./styles-CuLZ0Vsa.js";
import { computed as y, watch as X, defineComponent as xe, ref as a, onMounted as ge, resolveComponent as P, openBlock as r, createElementBlock as u, withModifiers as B, createElementVNode as t, createVNode as d, unref as K, withDirectives as c, vModelText as k, createTextVNode as H, toDisplayString as x, createCommentVNode as g, Fragment as ye, renderList as be, vModelCheckbox as he } from "vue";
import { Icon as Q } from "@iconify/vue";
import we from "primevue/select";
import { loadByTagName as z, api as G, define as Ce } from "@wippy-fe/proxy";
import { W as _e, e as Me } from "./errMsg-BHbduhMk.js";
function Ae(w) {
  return y(() => {
    const p = w.value;
    return p ? (typeof p.parentId == "string" ? p.parentId : "").trim() : "";
  });
}
function Se(w, p, b) {
  X(
    () => w.value?.submitNonce,
    (i, O) => {
      i == null || i === "" || i === O || b?.value || p();
    }
  );
}
const Ne = { class: "kx-cr-head" }, Ve = { class: "kx-cr-ico" }, Ie = { class: "kx-field" }, Ee = { class: "kx-field" }, Te = { class: "kx-field" }, Ue = { class: "kx-field" }, Pe = { class: "kx-adv" }, ze = {
  key: 0,
  class: "kx-adv-badge kx-tag-sm"
}, Oe = {
  key: 0,
  class: "kx-adv-body"
}, Re = { class: "kx-field" }, qe = {
  key: 0,
  class: "kx-field"
}, Le = {
  key: 1,
  class: "kx-field"
}, We = {
  key: 2,
  class: "kx-field"
}, De = { class: "kx-field" }, je = { class: "kx-field-lbl" }, Be = {
  key: 0,
  class: "kx-id"
}, Ke = { class: "kx-field" }, Ye = { class: "kx-check kx-check-control" }, Fe = { class: "kx-field" }, Je = { class: "kx-inline-control kx-inline-control-standalone" }, $e = "kickside.channel.responder:channel_responder", He = "You are responding in a channel. Keep responses concise and direct. No emojis. If you need external information, use available capabilities or tools before answering.", Qe = /* @__PURE__ */ xe({
  __name: "ChannelResponderCreate",
  setup(w) {
    function p(n) {
      return (n.title || "").trim() || "Unknown capability";
    }
    const b = pe(), i = me(), O = y(() => b.value.typeId || $e), Y = Ae(b);
    y(() => !!Y.value);
    const N = a(""), C = a(null), R = a(""), _ = a(""), F = a(""), V = a(!1), q = a(He);
    X(V, (n) => i("submit-state", { saving: n }));
    const I = a("");
    Se(b, $, V);
    const E = a(!1), m = a([]), v = a({}), T = a([]), M = a(""), h = a(!0), L = a(120), A = a(10), U = a("immediate"), ee = [
      { label: "Immediate", value: "immediate" },
      { label: "Lazy", value: "lazy" }
    ], W = a(8), D = a("class:fast"), j = a("Only reply when the accumulated channel messages are relevant to the agent. Ignore noise, acknowledgements, and unrelated chatter."), te = y(() => T.value.filter((n) => !!n.web_component && m.value.includes(n.id))), S = y(() => U.value === "lazy"), J = y(() => N.value.trim() ? !C.value?.channel_id || !C.value?.connection_id ? "A channel is required." : _.value ? "" : "An agent is required." : "Name is required."), ne = y(() => !J.value);
    function le(n) {
      const e = n.detail;
      e && e.channel_id ? (C.value = { connection_id: e.connection_id, channel_id: e.channel_id }, R.value = (e.channel_name || "").trim()) : (C.value = null, R.value = "");
    }
    function ae(n) {
      const e = n.detail, s = e && Array.isArray(e.selected) ? e.selected.map(String) : [], o = e && Array.isArray(e.labels) ? e.labels.map(String) : [];
      _.value = s[0] || "", F.value = (o[0] || "").trim();
    }
    async function se(n) {
      if (!n.length) {
        T.value = [];
        return;
      }
      try {
        const { data: e } = await G.get(`/api/v1/agents/traits?ids=${n.map(encodeURIComponent).join(",")}`);
        T.value = e?.traits || [];
      } catch (e) {
        T.value = [], i("error", { message: "failed to load traits", error: e });
      }
    }
    function oe(n) {
      const e = n.detail, s = e && Array.isArray(e.selected) ? e.selected.map(String) : [];
      m.value = s;
      const o = {};
      for (const f of s) f in v.value && (o[f] = v.value[f]);
      v.value = o, se(s);
    }
    function ie(n, e) {
      v.value = { ...v.value, [n]: e };
    }
    function re() {
      const n = {};
      for (const e of m.value) {
        const s = v.value[e];
        s && typeof s == "object" && (n[e] = s);
      }
      return n;
    }
    ge(() => {
      z("wc-channel-picker", { timeoutMs: 8e3 }).catch(() => {
      }), z("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), z("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), z("wc-multiselect", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    function ue(n) {
      D.value = String(n.detail || "class:fast");
    }
    async function $() {
      if (!ne.value) {
        I.value = J.value, i("automation-installed", { success: !1, error: I.value });
        return;
      }
      V.value = !0, I.value = "";
      try {
        const n = C.value, e = {
          type: O.value,
          parent_id: Y.value || void 0,
          input: {
            title: N.value.trim(),
            connection_id: n.connection_id,
            channel_id: n.channel_id,
            channel_name: R.value,
            agent_id: _.value,
            agent_name: F.value,
            target: "channel",
            system_prompt: q.value.trim(),
            traits: [...m.value],
            trait_contexts: re(),
            context: M.value.trim(),
            session_policy: {
              rotate_after_idle: h.value,
              idle_seconds: Math.max(60, Math.min(720 * 60 * 60, Math.floor((Number(L.value) || 120) * 60))),
              runtime_idle_seconds: Math.max(60, Math.min(1440 * 60, Math.floor((Number(A.value) || 10) * 60)))
            },
            response_policy: {
              mode: U.value,
              wait_seconds: Math.max(1, Math.min(120, Math.floor(Number(W.value) || 8))),
              assessor_model: D.value || "class:fast",
              prompt: j.value.trim()
            }
          }
        }, { data: s } = await G.post("/api/v1/automations", e), o = s;
        if (!o?.success) {
          const f = typeof o?.error == "string" ? o.error : o?.error?.message;
          throw new Error(f || "install failed");
        }
        i("automation-installed", { success: !0, id: o.id }), i("created", { id: o.id });
      } catch (n) {
        const e = Me(n, "install failed");
        I.value = e, i("automation-installed", { success: !1, error: e });
      } finally {
        V.value = !1;
      }
    }
    return (n, e) => {
      const s = P("wc-channel-picker"), o = P("wc-agent-picker"), f = P("wc-model-picker"), de = P("wc-multiselect");
      return r(), u("form", {
        class: "kx-cr",
        onSubmit: B($, ["prevent"])
      }, [
        t("div", Ne, [
          t("span", Ve, [
            d(K(Q), {
              icon: "tabler:message-2-bolt",
              "aria-hidden": "true"
            })
          ]),
          e[12] || (e[12] = t("div", { class: "kx-cr-title" }, [
            t("h2", null, "Channel responder"),
            t("span", null, "Reply in a channel with one of your agents.")
          ], -1))
        ]),
        t("label", Ie, [
          e[13] || (e[13] = t("span", { class: "kx-field-lbl" }, "Name", -1)),
          c(t("input", {
            "onUpdate:modelValue": e[0] || (e[0] = (l) => N.value = l),
            class: "kx-input",
            type: "text",
            placeholder: "Support channel responder",
            "aria-label": "Automation name"
          }, null, 512), [
            [k, N.value]
          ])
        ]),
        t("div", Ee, [
          e[14] || (e[14] = t("span", { class: "kx-field-lbl" }, "Channel", -1)),
          d(s, {
            placeholder: "Select a channel…",
            onChange: le
          })
        ]),
        t("div", Te, [
          e[15] || (e[15] = t("span", { class: "kx-field-lbl" }, "Agent", -1)),
          d(o, {
            placeholder: "Pick an agent…",
            multi: "false",
            selected: _.value ? JSON.stringify([_.value]) : "[]",
            onChange: ae
          }, null, 8, ["selected"])
        ]),
        t("label", Ue, [
          e[16] || (e[16] = t("span", { class: "kx-field-lbl" }, "System prompt", -1)),
          c(t("textarea", {
            "onUpdate:modelValue": e[1] || (e[1] = (l) => q.value = l),
            class: "kx-input kx-textarea kx-textarea-lg",
            rows: "7",
            placeholder: "Instructions applied to every channel turn."
          }, null, 512), [
            [k, q.value]
          ])
        ]),
        t("div", Pe, [
          t("button", {
            type: "button",
            class: "kx-adv-toggle",
            onClick: e[2] || (e[2] = (l) => E.value = !E.value)
          }, [
            d(K(Q), {
              icon: E.value ? "tabler:chevron-down" : "tabler:chevron-right",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            e[17] || (e[17] = H(" Advanced ", -1)),
            m.value.length || M.value.trim() || h.value || A.value !== 10 || S.value ? (r(), u("span", ze, x(m.value.length) + x(M.value.trim() ? " + context" : "") + x(h.value ? " + chat cutoff" : "") + x(A.value !== 10 ? " + runtime idle" : "") + x(S.value ? " + lazy" : ""), 1)) : g("", !0)
          ]),
          E.value ? (r(), u("div", Oe, [
            t("div", Re, [
              e[18] || (e[18] = t("span", { class: "kx-field-lbl" }, "Response mode", -1)),
              d(K(we), {
                modelValue: U.value,
                "onUpdate:modelValue": e[3] || (e[3] = (l) => U.value = l),
                class: "kx-select",
                options: ee,
                "option-label": "label",
                "option-value": "value",
                "aria-label": "Response mode"
              }, null, 8, ["modelValue"])
            ]),
            S.value ? (r(), u("label", qe, [
              e[19] || (e[19] = t("span", { class: "kx-field-lbl" }, "Quiet window seconds", -1)),
              c(t("input", {
                "onUpdate:modelValue": e[4] || (e[4] = (l) => W.value = l),
                class: "kx-input",
                type: "number",
                min: "1",
                max: "120",
                step: "1"
              }, null, 512), [
                [
                  k,
                  W.value,
                  void 0,
                  { number: !0 }
                ]
              ])
            ])) : g("", !0),
            S.value ? (r(), u("div", Le, [
              e[20] || (e[20] = t("span", { class: "kx-field-lbl" }, "Assessment model", -1)),
              d(f, {
                value: D.value,
                capability: "generate",
                onSelect: ue
              }, null, 8, ["value"])
            ])) : g("", !0),
            S.value ? (r(), u("label", We, [
              e[21] || (e[21] = t("span", { class: "kx-field-lbl" }, "Lazy response prompt", -1)),
              c(t("textarea", {
                "onUpdate:modelValue": e[5] || (e[5] = (l) => j.value = l),
                class: "kx-input kx-textarea",
                rows: "4",
                placeholder: "Tell the responder when to stay quiet and when to answer."
              }, null, 512), [
                [k, j.value]
              ])
            ])) : g("", !0),
            t("div", De, [
              e[22] || (e[22] = t("span", { class: "kx-field-lbl" }, "Additional capabilities", -1)),
              d(de, {
                source: "/api/v1/agents/traits",
                "response-key": "traits",
                "label-key": "title",
                "desc-key": "description",
                placeholder: "Add capabilities on top of the agent's own…",
                selected: JSON.stringify(m.value),
                onChange: oe
              }, null, 8, ["selected"])
            ]),
            (r(!0), u(ye, null, be(te.value, (l) => (r(), u("div", {
              key: l.id,
              class: "kx-field kx-trait-cfg"
            }, [
              t("span", je, [
                H(x(p(l)), 1),
                l.title?.trim() ? g("", !0) : (r(), u("span", Be, x(l.id), 1))
              ]),
              d(_e, {
                tag: l.web_component || "",
                config: v.value[l.id] || {},
                provider: l.provider,
                onChange: (ce) => ie(l.id, ce)
              }, null, 8, ["tag", "config", "provider", "onChange"])
            ]))), 128)),
            t("label", Ke, [
              e[23] || (e[23] = t("span", { class: "kx-field-lbl" }, "Additional prompt context", -1)),
              c(t("textarea", {
                "onUpdate:modelValue": e[6] || (e[6] = (l) => M.value = l),
                class: "kx-input kx-textarea",
                rows: "3",
                placeholder: "Stable prompt context for every reply in this channel."
              }, null, 512), [
                [k, M.value]
              ])
            ]),
            t("label", Ye, [
              c(t("input", {
                "onUpdate:modelValue": e[7] || (e[7] = (l) => h.value = l),
                type: "checkbox"
              }, null, 512), [
                [he, h.value]
              ]),
              t("span", null, [
                e[26] || (e[26] = t("strong", null, "Start a new chat after quiet time", -1)),
                e[27] || (e[27] = t("small", null, "When the channel is quiet for the selected time, the next message starts a fresh chat history.", -1)),
                h.value ? (r(), u("span", {
                  key: 0,
                  class: "kx-inline-control",
                  onClick: e[10] || (e[10] = B(() => {
                  }, ["stop"]))
                }, [
                  e[24] || (e[24] = t("span", null, "After", -1)),
                  c(t("input", {
                    "onUpdate:modelValue": e[8] || (e[8] = (l) => L.value = l),
                    class: "kx-input kx-number-sm",
                    type: "number",
                    min: "1",
                    max: "43200",
                    step: "1",
                    onClick: e[9] || (e[9] = B(() => {
                    }, ["stop"]))
                  }, null, 512), [
                    [
                      k,
                      L.value,
                      void 0,
                      { number: !0 }
                    ]
                  ]),
                  e[25] || (e[25] = t("span", null, "minutes", -1))
                ])) : g("", !0)
              ])
            ]),
            t("label", Fe, [
              e[29] || (e[29] = t("span", { class: "kx-field-lbl" }, "Stop idle responder after", -1)),
              t("span", Je, [
                c(t("input", {
                  "onUpdate:modelValue": e[11] || (e[11] = (l) => A.value = l),
                  class: "kx-input kx-number-sm",
                  type: "number",
                  min: "1",
                  max: "1440",
                  step: "1"
                }, null, 512), [
                  [
                    k,
                    A.value,
                    void 0,
                    { number: !0 }
                  ]
                ]),
                e[28] || (e[28] = t("span", null, "minutes without activity", -1))
              ]),
              e[30] || (e[30] = t("small", { class: "kx-field-help" }, "Ends the live responder process; the next channel message starts it again.", -1))
            ])
          ])) : g("", !0)
        ])
      ], 32);
    };
  }
}), Ge = {
  type: "object",
  properties: { "type-id": { type: "string" }, "parent-id": { type: "string" }, "submit-nonce": { type: "string" } }
};
class Z extends ve {
  static get wippyConfig() {
    return {
      propsSchema: Ge,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: fe
    };
  }
  static get vueConfig() {
    return { rootComponent: Qe, plugins: [ke] };
  }
}
async function st() {
  return Z;
}
Ce(import.meta.url, Z);
export {
  st as webComponent
};
//# sourceMappingURL=channel_responder_create.js.map

import { defineComponent as Oe, ref as $, computed as f, onMounted as Ve, openBlock as n, createElementBlock as i, unref as l, createBlock as q, withCtx as oe, createTextVNode as G, toDisplayString as k, createCommentVNode as h, Fragment as I, createVNode as b, createElementVNode as s, renderList as H, normalizeClass as xe } from "vue";
import { Icon as V } from "@iconify/vue";
import { u as De } from "./wc-runtime-CHL0PH8L.js";
import { u as Fe, j as Be, k as fe, l as Le, n as Re, p as Ue, a as ze, b as je, _ as be, m as qe, q as Ge } from "./useModelsApi-CUzAl2yI.js";
import { d as He, i as Ke, c as We, a as me, _ as Ye } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-DhB1ATyK.js";
const Je = () => De();
function Qe(x, C, c) {
  const N = x.filter((v) => v.enabled !== !1 && v.status !== "unhealthy");
  if (!N.length) return null;
  const D = c.find((v) => v.declared && v.name === "fast")?.models?.[0]?.name;
  if (!D) return null;
  const r = C.find((v) => v.name === D && v.enabled !== !1 && !Xe(v));
  if (!r) return null;
  const m = r.provider_profile_id ? N.find((v) => v.id === r.provider_profile_id) : N.find((v) => !!r.provider_id && v.provider_id === r.provider_id);
  return !m || r.provider_id && r.provider_id !== m.provider_id ? null : {
    class: "fast",
    model: r.name,
    title: r.title || r.name,
    provider_id: r.provider_id || m.provider_id
  };
}
function Xe(x) {
  const C = (x.capabilities ?? []).map((c) => c.toLowerCase());
  return C.length > 0 && C.every((c) => c === "embed" || c === "embedding" || c === "embeddings");
}
const Ze = { class: "ob" }, et = {
  key: 0,
  class: "ob-model-warning",
  role: "note"
}, tt = {
  key: 1,
  class: "ob-stage"
}, ot = { class: "ob-grid" }, nt = ["onClick"], st = { class: "ob-tile-ico" }, lt = { class: "ob-tile-name" }, at = {
  key: 0,
  class: "ob-tile-desc"
}, it = { class: "ob-foot" }, rt = {
  key: 2,
  class: "ob-stage"
}, dt = {
  key: 0,
  class: "ob-connecting"
}, ut = {
  key: 2,
  class: "ob-result fail"
}, ct = ["href"], vt = {
  key: 3,
  class: "ob-stage"
}, pt = { class: "km-editor-head-title" }, ft = {
  key: 4,
  class: "ob-stage"
}, bt = {
  key: 0,
  class: "ob-result fail"
}, mt = ["href"], gt = { class: "ob-block" }, _t = { class: "ob-block-head" }, kt = { class: "ob-providers" }, yt = { class: "ob-prov-body" }, ht = { class: "ob-prov-name" }, Ct = { class: "ob-prov-sub" }, wt = ["title"], Mt = {
  key: 1,
  class: "ob-block"
}, St = {
  key: 2,
  class: "ob-autobar"
}, Et = { class: "ob-block-head" }, $t = { class: "ob-classes" }, Pt = ["title"], At = { class: "ob-class-top" }, It = { class: "ob-class-ico" }, Nt = { class: "ob-class-name" }, Tt = { class: "ob-foot" }, Ot = ["disabled"], Vt = "kickside-model-provider-openai-compatible", xt = "wippy.llm.openai_compat:provider", Ut = /* @__PURE__ */ Oe({
  __name: "Onboard",
  setup(x) {
    const C = Je(), c = Fe(), { adapters: N, presets: D, profiles: r, models: m, classes: v, loading: ge, saving: F, error: T } = c, ne = qe(() => N.value, () => r.value), g = $("pick"), P = $(null), y = $(null), S = $(""), w = $(""), M = $(""), A = $(!1), _e = f(() => D.value.filter((e) => e.onboarding !== !1)), ke = f(() => P.value?.provider_id || xt), K = f(() => ne.adapterFor(ke.value)), W = f(
      () => P.value?.profile_editor_tag || K.value?.profile_editor_tag || Vt
    ), ye = f(() => He(W.value)), he = f(() => Ke(W.value));
    function Y(e, t) {
      return (e.capabilities ?? []).some((o) => o.toLowerCase() === t);
    }
    function Ce(e) {
      const t = (e.capabilities ?? []).map((o) => o.toLowerCase());
      return t.length > 0 && t.every((o) => o === "embed" || o === "embedding" || o === "embeddings");
    }
    const B = f(() => m.value.filter((e) => e.enabled !== !1 && !Ce(e))), se = f(() => m.value.filter((e) => e.enabled !== !1 && (Y(e, "embed") || Y(e, "embedding") || Y(e, "embeddings")))), J = f(() => m.value.filter((e) => e.source === "discovered")), L = f(() => v.value.filter((e) => e.declared && e.capability !== "embed")), le = f(() => v.value.filter((e) => e.declared && e.capability === "embed"));
    function R(e) {
      return v.value.find((t) => t.name === e)?.models?.[0]?.name ?? "";
    }
    function ae(e) {
      return e.map((t) => ({ label: t.title || t.name, value: t.name }));
    }
    function we(e) {
      y.value = J.value.find((t) => t.name === e) ?? null;
    }
    async function Me(e) {
      await c.saveCard(e) && (await c.loadClasses(), await j(!1), y.value = null);
    }
    const ie = f(() => [
      { key: "generate", title: "Default model per capability", classes: L.value, models: B.value },
      { key: "embed", title: "Embeddings", classes: le.value, models: se.value }
    ].filter((e) => e.classes.length)), Q = f(() => Qe(r.value, m.value, v.value)), U = f(() => Q.value !== null);
    function re() {
      C("done", {
        status: U.value ? "completed" : "skipped",
        model_configured: U.value,
        ...Q.value ? { model: Q.value } : {}
      });
    }
    function de() {
      re();
    }
    function X(e, t, o = "") {
      const a = Ge(e, t, o);
      w.value = a.message, M.value = a.errorType === "insufficient_credits" ? a.billingUrl ?? "" : "", T.value = "";
    }
    function ue() {
      P.value = null, S.value = "", w.value = "", M.value = "", g.value = "pick";
    }
    function Se(e) {
      P.value = e, w.value = "", M.value = "", g.value = "connect";
    }
    function ce() {
      r.value.length ? g.value = "review" : ue();
    }
    async function ve(e) {
      if (!A.value) {
        A.value = !0, w.value = "", M.value = "";
        try {
          e.enabled = !0;
          const t = new Set(r.value.map((u) => u.id));
          if (S.value = "Saving connection…", !await c.saveProfile("create", "", e)) {
            X(T.value || "Could not save the connection.");
            return;
          }
          const a = r.value.find((u) => !t.has(u.id));
          if (a) {
            S.value = "Verifying key and importing models…";
            const u = String(a.provider_id || ""), p = await c.discover(a.id);
            if (await c.loadClasses(), !p.ok) X(p.message, p.errorType, u);
            else {
              S.value = "Checking that the key can generate…";
              const d = await c.testProfile(a.id);
              d.ok || X(d.message, d.errorType, u), S.value = "Selecting sensible defaults…", await j(!1);
            }
          }
          g.value = "review";
        } finally {
          A.value = !1, S.value = "";
        }
      }
    }
    function Ee(e, t, o) {
      return {
        name: e.name,
        title: e.title || e.name,
        description: e.description || "",
        provider_id: e.provider_id,
        provider_profile_id: e.provider_profile_id || void 0,
        provider_model: e.provider_model || e.name,
        capabilities: [...e.capabilities ?? []],
        classes: t,
        priority: o,
        pricing: e.pricing ?? {},
        options: e.options ?? {},
        metadata: e.metadata ?? {},
        source: e.source === "registry" ? "overlay" : e.source || "overlay"
      };
    }
    async function pe(e) {
      const t = /* @__PURE__ */ new Map();
      for (const d of e) d.model && t.set(d.cls, d.model);
      if (!t.size) return;
      const o = new Set(t.keys()), a = /* @__PURE__ */ new Map();
      for (const d of m.value) {
        const _ = new Set(d.class ?? []);
        for (const E of o) _.delete(E);
        a.set(d.name, _);
      }
      for (const [d, _] of t) a.get(_)?.add(d);
      const u = new Set(t.values()), p = [];
      for (const d of m.value) {
        const _ = new Set(d.class ?? []), E = a.get(d.name);
        if (_.size === E.size && [...E].every((te) => _.has(te))) continue;
        const O = u.has(d.name) ? 1e3 : Number(d.priority ?? 10);
        p.push(Ee(d, [...E], O));
      }
      p.length && (await c.saveCards(p), await c.loadClasses());
    }
    async function $e(e, t) {
      t && await pe([{ cls: e, model: t }]);
    }
    const Pe = /* @__PURE__ */ new Set([
      "wippy.llm.openai:provider",
      "wippy.llm.claude:provider",
      "wippy.llm.google.generative_ai:provider",
      "wippy.llm.google.vertex:provider",
      "wippy.llm.bedrock:provider"
    ]);
    function Z(e) {
      return Pe.has(e.provider_id || "");
    }
    const Ae = /embed|whisper|tts|audio|image|imagen|dall-?e|lyria|veo|sora|music|\baqa\b|moderation|rerank|guard|realtime|transcribe|speech|\bsearch\b|vision-?only/i;
    function z(e) {
      const t = e.pricing, o = Number(t?.completion ?? t?.output ?? t?.prompt ?? 0);
      if (Number.isFinite(o) && o > 0) return o;
      if (e.max_tokens != null) return e.max_tokens / 1e6;
    }
    function ee(e, t) {
      return e == null ? t == null ? 0 : -1 : t == null ? 1 : e - t;
    }
    function Ie() {
      const e = B.value.filter((o) => !Ae.test(o.name)), t = e.filter(Z);
      return t.length ? t : e.length ? e : B.value;
    }
    function Ne(e) {
      const t = /* @__PURE__ */ new Map(), o = Ie();
      if (!o.length || !e.length) return t;
      const a = [...o].sort((p, d) => ee(z(p), z(d))), u = a.length - 1;
      return e.forEach((p, d) => {
        const _ = o.filter((O) => (O.class ?? []).includes(p.name)).sort((O, te) => ee(z(te), z(O)));
        if (_.length) {
          t.set(p.name, _[0].name);
          return;
        }
        const E = e.length <= 1 ? u : Math.round(d * u / (e.length - 1));
        t.set(p.name, a[Math.min(E, u)].name);
      }), t;
    }
    function Te() {
      return [...se.value].sort((t, o) => (Z(o) ? 1 : 0) - (Z(t) ? 1 : 0) || ee(o.dimensions, t.dimensions))[0]?.name || "";
    }
    async function j(e = !1) {
      const t = [], o = Ne(L.value);
      for (const u of L.value) {
        if (!e && R(u.name)) continue;
        const p = o.get(u.name);
        p && t.push({ cls: u.name, model: p });
      }
      const a = Te();
      for (const u of le.value)
        !e && R(u.name) || a && t.push({ cls: u.name, model: a });
      await pe(t);
    }
    return Ve(async () => {
      await Promise.all([c.load(), c.loadClasses()]), g.value = r.value.length ? "review" : "pick", r.value.length && B.value.length && L.value.every((e) => !R(e.name)) && await j(!1);
    }), (e, t) => (n(), i("div", Ze, [
      l(T) && g.value !== "connect" ? (n(), q(l(Be), {
        key: 0,
        severity: "danger",
        onDismiss: t[0] || (t[0] = (o) => T.value = "")
      }, {
        default: oe(() => [
          G(k(l(T)), 1)
        ]),
        _: 1
      })) : h("", !0),
      l(ge) && !l(r).length && !l(m).length ? (n(), q(l(fe), {
        key: 1,
        label: "Loading…"
      })) : (n(), i(I, { key: 2 }, [
        g.value === "pick" && !U.value ? (n(), i("div", et, [
          b(l(V), {
            icon: "tabler:brain",
            "aria-hidden": "true"
          }),
          t[6] || (t[6] = s("span", null, [
            s("strong", null, "KickSide works without an AI model, but it is better with one."),
            G(" Recommendations and AI-powered automations will be unavailable until you connect a provider. You can skip this step and finish it later under System → Models.")
          ], -1))
        ])) : h("", !0),
        g.value === "pick" ? (n(), i("section", tt, [
          s("div", ot, [
            (n(!0), i(I, null, H(_e.value, (o) => (n(), i("button", {
              key: o.id,
              type: "button",
              class: "ob-tile",
              onClick: (a) => Se(o)
            }, [
              s("span", st, [
                b(l(V), {
                  icon: o.icon || "tabler:plug",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              s("span", lt, k(o.title), 1),
              o.description ? (n(), i("span", at, k(o.description), 1)) : h("", !0)
            ], 8, nt))), 128))
          ]),
          s("div", it, [
            s("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[1] || (t[1] = (o) => l(C)("back", void 0))
            }, "‹ Back"),
            t[7] || (t[7] = s("span", { class: "ob-foot-sp" }, null, -1)),
            l(r).length ? (n(), i("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[2] || (t[2] = (o) => g.value = "review")
            }, "Skip — already connected")) : (n(), i("button", {
              key: 1,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: de
            }, "Skip for now"))
          ])
        ])) : g.value === "connect" ? (n(), i("section", rt, [
          A.value ? (n(), i("div", dt, [
            b(l(fe), {
              label: S.value || "Connecting…"
            }, null, 8, ["label"]),
            t[8] || (t[8] = s("p", { class: "ob-connecting-note" }, "Importing the provider's models — this can take up to a minute. Please don't close this.", -1))
          ])) : (n(), i(I, { key: 1 }, [
            he.value ? (n(), q(We, {
              key: 0,
              "spec-key": ye.value.key,
              preset: P.value || void 0,
              adapter: K.value || void 0,
              mode: "create",
              saving: A.value,
              onSave: ve,
              onCancel: ce
            }, null, 8, ["spec-key", "preset", "adapter", "saving"])) : (n(), q(Le, {
              key: 1,
              tag: W.value,
              mode: "create",
              preset: P.value || void 0,
              adapter: K.value || void 0,
              saving: A.value,
              onSave: ve,
              onCancel: ce
            }, null, 8, ["tag", "preset", "adapter", "saving"])),
            w.value ? (n(), i("div", ut, [
              b(l(V), {
                icon: "tabler:circle-x",
                "aria-hidden": "true"
              }),
              s("span", null, k(w.value), 1),
              M.value ? (n(), i("a", {
                key: 0,
                class: "ob-billing-link",
                href: M.value,
                target: "_blank",
                rel: "noopener noreferrer"
              }, "Add credits", 8, ct)) : h("", !0)
            ])) : h("", !0)
          ], 64))
        ])) : y.value ? (n(), i("section", vt, [
          s("h3", pt, "Configure " + k(y.value.title || y.value.name), 1),
          b(Re, {
            "aria-label": `Configure ${y.value.title || y.value.name}`,
            model: y.value,
            profiles: l(r),
            saving: l(F),
            onSave: Me,
            onCancel: t[3] || (t[3] = (o) => y.value = null)
          }, null, 8, ["aria-label", "model", "profiles", "saving"])
        ])) : (n(), i("section", ft, [
          w.value ? (n(), i("div", bt, [
            b(l(V), {
              icon: "tabler:circle-x",
              "aria-hidden": "true"
            }),
            s("span", null, k(w.value), 1),
            M.value ? (n(), i("a", {
              key: 0,
              class: "ob-billing-link",
              href: M.value,
              target: "_blank",
              rel: "noopener noreferrer"
            }, "Add credits", 8, mt)) : h("", !0)
          ])) : h("", !0),
          s("div", gt, [
            s("div", _t, [
              t[10] || (t[10] = s("span", null, "Connected", -1)),
              b(l(me), {
                variant: "soft",
                small: "",
                icon: "tabler:plus",
                disabled: l(F),
                onClick: ue
              }, {
                default: oe(() => [...t[9] || (t[9] = [
                  G("Add provider", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ]),
            s("div", kt, [
              (n(!0), i(I, null, H(l(r), (o) => (n(), i("div", {
                key: o.id,
                class: "ob-prov"
              }, [
                b(l(Ye), {
                  icon: l(ne).providerIcon(o.provider_id, o.id),
                  size: "sm"
                }, null, 8, ["icon"]),
                s("div", yt, [
                  s("div", ht, k(o.name), 1),
                  s("div", Ct, k(l(Ue)(o)), 1)
                ]),
                s("span", {
                  class: xe(["ob-dot", l(je)(o.status)]),
                  title: l(ze)(o.status)
                }, null, 10, wt)
              ]))), 128))
            ])
          ]),
          J.value.length ? (n(), i("div", Mt, [
            t[11] || (t[11] = s("div", { class: "ob-block-head" }, [
              s("span", null, "Model settings")
            ], -1)),
            b(l(be), {
              "model-value": "",
              options: ae(J.value),
              placeholder: "Choose a model to configure",
              "aria-label": "Model to configure",
              "onUpdate:modelValue": we
            }, null, 8, ["options"])
          ])) : h("", !0),
          ie.value.length ? (n(), i("div", St, [
            t[13] || (t[13] = s("span", { class: "ob-auto-hint" }, "Defaults are picked for you — adjust any below.", -1)),
            b(l(me), {
              variant: "soft",
              small: "",
              icon: "tabler:wand",
              disabled: l(F),
              onClick: t[4] || (t[4] = (o) => j(!0))
            }, {
              default: oe(() => [...t[12] || (t[12] = [
                G("Auto-select", -1)
              ])]),
              _: 1
            }, 8, ["disabled"])
          ])) : h("", !0),
          (n(!0), i(I, null, H(ie.value, (o) => (n(), i("div", {
            key: o.key,
            class: "ob-block"
          }, [
            s("div", Et, [
              s("span", null, k(o.title), 1)
            ]),
            s("div", $t, [
              (n(!0), i(I, null, H(o.classes, (a) => (n(), i("div", {
                key: a.name,
                class: "ob-class",
                title: a.description || ""
              }, [
                s("div", At, [
                  s("span", It, [
                    b(l(V), {
                      icon: a.icon || "tabler:layers-subtract",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  s("span", Nt, k(a.title || a.name), 1)
                ]),
                b(l(be), {
                  "model-value": R(a.name),
                  options: ae(o.models),
                  placeholder: o.models.length ? "Select a model" : "No models yet",
                  "aria-label": `Model for ${a.title || a.name}`,
                  "onUpdate:modelValue": (u) => $e(a.name, u)
                }, null, 8, ["model-value", "options", "placeholder", "aria-label", "onUpdate:modelValue"])
              ], 8, Pt))), 128))
            ])
          ]))), 128)),
          s("div", Tt, [
            s("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[5] || (t[5] = (o) => l(C)("back", void 0))
            }, "‹ Back"),
            t[14] || (t[14] = s("span", { class: "ob-foot-sp" }, null, -1)),
            U.value ? (n(), i("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-primary",
              disabled: l(F),
              onClick: re
            }, "Continue ›", 8, Ot)) : (n(), i("button", {
              key: 1,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: de
            }, "Skip for now"))
          ])
        ]))
      ], 64))
    ]));
  }
});
export {
  Ut as default
};
//# sourceMappingURL=Onboard-CRyYyDhK.js.map

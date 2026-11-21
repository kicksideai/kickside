import { defineComponent as Oe, ref as P, computed as p, onMounted as Ve, openBlock as a, createElementBlock as l, unref as s, createBlock as j, withCtx as ee, createTextVNode as q, toDisplayString as k, createCommentVNode as M, Fragment as I, createVNode as b, createElementVNode as n, renderList as G, normalizeClass as xe } from "vue";
import { Icon as V } from "@iconify/vue";
import { o as De } from "./wc-runtime-DYOSFvWw.js";
import { u as Fe, j as Te, k as pe, l as Le, n as Be, p as Re, a as ze, b as Ue, _ as me, m as je } from "./useModelsApi-Df0MsoJU.js";
import { d as qe, i as Ge, c as He, a as be, _ as Ke } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-Bk2OLic6.js";
const We = () => De();
function Ye(x, h, u) {
  const N = x.filter((c) => c.enabled !== !1 && c.status !== "unhealthy");
  if (!N.length) return null;
  const D = u.find((c) => c.declared && c.name === "fast")?.models?.[0]?.name;
  if (!D) return null;
  const i = h.find((c) => c.name === D && c.enabled !== !1 && !Je(c));
  if (!i) return null;
  const f = i.provider_profile_id ? N.find((c) => c.id === i.provider_profile_id) : N.find((c) => !!i.provider_id && c.provider_id === i.provider_id);
  return !f || i.provider_id && i.provider_id !== f.provider_id ? null : {
    class: "fast",
    model: i.name,
    title: i.title || i.name,
    provider_id: i.provider_id || f.provider_id
  };
}
function Je(x) {
  const h = (x.capabilities ?? []).map((u) => u.toLowerCase());
  return h.length > 0 && h.every((u) => u === "embed" || u === "embedding" || u === "embeddings");
}
const Qe = { class: "ob" }, Xe = {
  key: 0,
  class: "ob-model-warning",
  role: "note"
}, Ze = {
  key: 1,
  class: "ob-stage"
}, et = { class: "ob-grid" }, tt = ["onClick"], ot = { class: "ob-tile-ico" }, nt = { class: "ob-tile-name" }, st = {
  key: 0,
  class: "ob-tile-desc"
}, at = { class: "ob-foot" }, lt = {
  key: 2,
  class: "ob-stage"
}, it = {
  key: 0,
  class: "ob-connecting"
}, rt = {
  key: 2,
  class: "ob-result fail"
}, dt = {
  key: 3,
  class: "ob-stage"
}, ut = { class: "km-editor-head-title" }, ct = {
  key: 4,
  class: "ob-stage"
}, vt = {
  key: 0,
  class: "ob-result fail"
}, pt = { class: "ob-block" }, mt = { class: "ob-block-head" }, bt = { class: "ob-providers" }, ft = { class: "ob-prov-body" }, gt = { class: "ob-prov-name" }, _t = { class: "ob-prov-sub" }, kt = ["title"], yt = {
  key: 1,
  class: "ob-block"
}, ht = {
  key: 2,
  class: "ob-autobar"
}, Ct = { class: "ob-block-head" }, wt = { class: "ob-classes" }, Mt = ["title"], St = { class: "ob-class-top" }, Et = { class: "ob-class-ico" }, $t = { class: "ob-class-name" }, Pt = { class: "ob-foot" }, It = ["disabled"], Nt = "kickside-model-provider-openai-compatible", At = "wippy.llm.openai_compat:provider", Tt = /* @__PURE__ */ Oe({
  __name: "Onboard",
  setup(x) {
    const h = We(), u = Fe(), { adapters: N, presets: D, profiles: i, models: f, classes: c, loading: fe, saving: F, error: A } = u, te = je(() => N.value, () => i.value), g = P("pick"), S = P(null), y = P(null), E = P(""), C = P(""), $ = P(!1), ge = p(() => D.value.filter((e) => e.onboarding !== !1)), _e = p(() => S.value?.provider_id || At), H = p(() => te.adapterFor(_e.value)), K = p(
      () => S.value?.profile_editor_tag || H.value?.profile_editor_tag || Nt
    ), ke = p(() => qe(K.value)), ye = p(() => Ge(K.value));
    function W(e, t) {
      return (e.capabilities ?? []).some((o) => o.toLowerCase() === t);
    }
    function he(e) {
      const t = (e.capabilities ?? []).map((o) => o.toLowerCase());
      return t.length > 0 && t.every((o) => o === "embed" || o === "embedding" || o === "embeddings");
    }
    const T = p(() => f.value.filter((e) => e.enabled !== !1 && !he(e))), oe = p(() => f.value.filter((e) => e.enabled !== !1 && (W(e, "embed") || W(e, "embedding") || W(e, "embeddings")))), Y = p(() => f.value.filter((e) => e.source === "discovered")), L = p(() => c.value.filter((e) => e.declared && e.capability !== "embed")), ne = p(() => c.value.filter((e) => e.declared && e.capability === "embed"));
    function B(e) {
      return c.value.find((t) => t.name === e)?.models?.[0]?.name ?? "";
    }
    function se(e) {
      return e.map((t) => ({ label: t.title || t.name, value: t.name }));
    }
    function Ce(e) {
      y.value = Y.value.find((t) => t.name === e) ?? null;
    }
    async function we(e) {
      await u.saveCard(e) && (await u.loadClasses(), await U(!1), y.value = null);
    }
    const ae = p(() => [
      { key: "generate", title: "Default model per capability", classes: L.value, models: T.value },
      { key: "embed", title: "Embeddings", classes: ne.value, models: oe.value }
    ].filter((e) => e.classes.length)), J = p(() => Ye(i.value, f.value, c.value)), R = p(() => J.value !== null);
    function le() {
      h("done", {
        status: R.value ? "completed" : "skipped",
        model_configured: R.value,
        ...J.value ? { model: J.value } : {}
      });
    }
    function ie() {
      le();
    }
    function re(e) {
      C.value = e, A.value = "";
    }
    function de() {
      S.value = null, E.value = "", C.value = "", g.value = "pick";
    }
    function Me(e) {
      S.value = e, C.value = "", g.value = "connect";
    }
    function ue() {
      i.value.length ? g.value = "review" : de();
    }
    async function ce(e) {
      if (!$.value) {
        $.value = !0, C.value = "";
        try {
          e.enabled = !0;
          const t = new Set(i.value.map((d) => d.id));
          if (E.value = "Saving connection…", !await u.saveProfile("create", "", e)) {
            re(A.value || "Could not save the connection.");
            return;
          }
          const r = i.value.find((d) => !t.has(d.id));
          if (r) {
            E.value = "Verifying key and importing models…";
            const d = await u.discover(r.id);
            await u.loadClasses(), d.ok ? (E.value = "Selecting sensible defaults…", await U(!1)) : re(d.message);
          }
          g.value = "review";
        } finally {
          $.value = !1, E.value = "";
        }
      }
    }
    function Se(e, t, o) {
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
    async function ve(e) {
      const t = /* @__PURE__ */ new Map();
      for (const v of e) v.model && t.set(v.cls, v.model);
      if (!t.size) return;
      const o = new Set(t.keys()), r = /* @__PURE__ */ new Map();
      for (const v of f.value) {
        const _ = new Set(v.class ?? []);
        for (const w of o) _.delete(w);
        r.set(v.name, _);
      }
      for (const [v, _] of t) r.get(_)?.add(v);
      const d = new Set(t.values()), m = [];
      for (const v of f.value) {
        const _ = new Set(v.class ?? []), w = r.get(v.name);
        if (_.size === w.size && [...w].every((Z) => _.has(Z))) continue;
        const O = d.has(v.name) ? 1e3 : Number(v.priority ?? 10);
        m.push(Se(v, [...w], O));
      }
      m.length && (await u.saveCards(m), await u.loadClasses());
    }
    async function Ee(e, t) {
      t && await ve([{ cls: e, model: t }]);
    }
    const $e = /* @__PURE__ */ new Set([
      "wippy.llm.openai:provider",
      "wippy.llm.claude:provider",
      "wippy.llm.google.generative_ai:provider",
      "wippy.llm.google.vertex:provider",
      "wippy.llm.bedrock:provider"
    ]);
    function Q(e) {
      return $e.has(e.provider_id || "");
    }
    const Pe = /embed|whisper|tts|audio|image|imagen|dall-?e|lyria|veo|sora|music|\baqa\b|moderation|rerank|guard|realtime|transcribe|speech|\bsearch\b|vision-?only/i;
    function z(e) {
      const t = e.pricing, o = Number(t?.completion ?? t?.output ?? t?.prompt ?? 0);
      if (Number.isFinite(o) && o > 0) return o;
      if (e.max_tokens != null) return e.max_tokens / 1e6;
    }
    function X(e, t) {
      return e == null ? t == null ? 0 : -1 : t == null ? 1 : e - t;
    }
    function Ie() {
      const e = T.value.filter((o) => !Pe.test(o.name)), t = e.filter(Q);
      return t.length ? t : e.length ? e : T.value;
    }
    function Ne(e) {
      const t = /* @__PURE__ */ new Map(), o = Ie();
      if (!o.length || !e.length) return t;
      const r = [...o].sort((m, v) => X(z(m), z(v))), d = r.length - 1;
      return e.forEach((m, v) => {
        const _ = o.filter((O) => (O.class ?? []).includes(m.name)).sort((O, Z) => X(z(Z), z(O)));
        if (_.length) {
          t.set(m.name, _[0].name);
          return;
        }
        const w = e.length <= 1 ? d : Math.round(v * d / (e.length - 1));
        t.set(m.name, r[Math.min(w, d)].name);
      }), t;
    }
    function Ae() {
      return [...oe.value].sort((t, o) => (Q(o) ? 1 : 0) - (Q(t) ? 1 : 0) || X(o.dimensions, t.dimensions))[0]?.name || "";
    }
    async function U(e = !1) {
      const t = [], o = Ne(L.value);
      for (const d of L.value) {
        if (!e && B(d.name)) continue;
        const m = o.get(d.name);
        m && t.push({ cls: d.name, model: m });
      }
      const r = Ae();
      for (const d of ne.value)
        !e && B(d.name) || r && t.push({ cls: d.name, model: r });
      await ve(t);
    }
    return Ve(async () => {
      await Promise.all([u.load(), u.loadClasses()]), g.value = i.value.length ? "review" : "pick", i.value.length && T.value.length && L.value.every((e) => !B(e.name)) && await U(!1);
    }), (e, t) => (a(), l("div", Qe, [
      s(A) && g.value !== "connect" ? (a(), j(s(Te), {
        key: 0,
        severity: "danger",
        onDismiss: t[0] || (t[0] = (o) => A.value = "")
      }, {
        default: ee(() => [
          q(k(s(A)), 1)
        ]),
        _: 1
      })) : M("", !0),
      s(fe) && !s(i).length && !s(f).length ? (a(), j(s(pe), {
        key: 1,
        label: "Loading…"
      })) : (a(), l(I, { key: 2 }, [
        g.value === "pick" && !R.value ? (a(), l("div", Xe, [
          b(s(V), {
            icon: "tabler:brain",
            "aria-hidden": "true"
          }),
          t[6] || (t[6] = n("span", null, [
            n("strong", null, "KickSide works without an AI model, but it is better with one."),
            q(" Recommendations and AI-powered automations will be unavailable until you connect a provider. You can skip this step and finish it later under System → Models.")
          ], -1))
        ])) : M("", !0),
        g.value === "pick" ? (a(), l("section", Ze, [
          n("div", et, [
            (a(!0), l(I, null, G(ge.value, (o) => (a(), l("button", {
              key: o.id,
              type: "button",
              class: "ob-tile",
              onClick: (r) => Me(o)
            }, [
              n("span", ot, [
                b(s(V), {
                  icon: o.icon || "tabler:plug",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              n("span", nt, k(o.title), 1),
              o.description ? (a(), l("span", st, k(o.description), 1)) : M("", !0)
            ], 8, tt))), 128))
          ]),
          n("div", at, [
            n("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[1] || (t[1] = (o) => s(h)("back", void 0))
            }, "‹ Back"),
            t[7] || (t[7] = n("span", { class: "ob-foot-sp" }, null, -1)),
            s(i).length ? (a(), l("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[2] || (t[2] = (o) => g.value = "review")
            }, "Skip — already connected")) : (a(), l("button", {
              key: 1,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: ie
            }, "Skip for now"))
          ])
        ])) : g.value === "connect" ? (a(), l("section", lt, [
          $.value ? (a(), l("div", it, [
            b(s(pe), {
              label: E.value || "Connecting…"
            }, null, 8, ["label"]),
            t[8] || (t[8] = n("p", { class: "ob-connecting-note" }, "Importing the provider's models — this can take up to a minute. Please don't close this.", -1))
          ])) : (a(), l(I, { key: 1 }, [
            ye.value ? (a(), j(He, {
              key: 0,
              "spec-key": ke.value.key,
              preset: S.value || void 0,
              adapter: H.value || void 0,
              mode: "create",
              saving: $.value,
              onSave: ce,
              onCancel: ue
            }, null, 8, ["spec-key", "preset", "adapter", "saving"])) : (a(), j(Le, {
              key: 1,
              tag: K.value,
              mode: "create",
              preset: S.value || void 0,
              adapter: H.value || void 0,
              saving: $.value,
              onSave: ce,
              onCancel: ue
            }, null, 8, ["tag", "preset", "adapter", "saving"])),
            C.value ? (a(), l("div", rt, [
              b(s(V), {
                icon: "tabler:circle-x",
                "aria-hidden": "true"
              }),
              n("span", null, k(C.value), 1)
            ])) : M("", !0)
          ], 64))
        ])) : y.value ? (a(), l("section", dt, [
          n("h3", ut, "Configure " + k(y.value.title || y.value.name), 1),
          b(Be, {
            "aria-label": `Configure ${y.value.title || y.value.name}`,
            model: y.value,
            profiles: s(i),
            saving: s(F),
            onSave: we,
            onCancel: t[3] || (t[3] = (o) => y.value = null)
          }, null, 8, ["aria-label", "model", "profiles", "saving"])
        ])) : (a(), l("section", ct, [
          C.value ? (a(), l("div", vt, [
            b(s(V), {
              icon: "tabler:circle-x",
              "aria-hidden": "true"
            }),
            n("span", null, k(C.value), 1)
          ])) : M("", !0),
          n("div", pt, [
            n("div", mt, [
              t[10] || (t[10] = n("span", null, "Connected", -1)),
              b(s(be), {
                variant: "soft",
                small: "",
                icon: "tabler:plus",
                disabled: s(F),
                onClick: de
              }, {
                default: ee(() => [...t[9] || (t[9] = [
                  q("Add provider", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ]),
            n("div", bt, [
              (a(!0), l(I, null, G(s(i), (o) => (a(), l("div", {
                key: o.id,
                class: "ob-prov"
              }, [
                b(s(Ke), {
                  icon: s(te).providerIcon(o.provider_id, o.id),
                  size: "sm"
                }, null, 8, ["icon"]),
                n("div", ft, [
                  n("div", gt, k(o.name), 1),
                  n("div", _t, k(s(Re)(o)), 1)
                ]),
                n("span", {
                  class: xe(["ob-dot", s(Ue)(o.status)]),
                  title: s(ze)(o.status)
                }, null, 10, kt)
              ]))), 128))
            ])
          ]),
          Y.value.length ? (a(), l("div", yt, [
            t[11] || (t[11] = n("div", { class: "ob-block-head" }, [
              n("span", null, "Model settings")
            ], -1)),
            b(s(me), {
              "model-value": "",
              options: se(Y.value),
              placeholder: "Choose a model to configure",
              "aria-label": "Model to configure",
              "onUpdate:modelValue": Ce
            }, null, 8, ["options"])
          ])) : M("", !0),
          ae.value.length ? (a(), l("div", ht, [
            t[13] || (t[13] = n("span", { class: "ob-auto-hint" }, "Defaults are picked for you — adjust any below.", -1)),
            b(s(be), {
              variant: "soft",
              small: "",
              icon: "tabler:wand",
              disabled: s(F),
              onClick: t[4] || (t[4] = (o) => U(!0))
            }, {
              default: ee(() => [...t[12] || (t[12] = [
                q("Auto-select", -1)
              ])]),
              _: 1
            }, 8, ["disabled"])
          ])) : M("", !0),
          (a(!0), l(I, null, G(ae.value, (o) => (a(), l("div", {
            key: o.key,
            class: "ob-block"
          }, [
            n("div", Ct, [
              n("span", null, k(o.title), 1)
            ]),
            n("div", wt, [
              (a(!0), l(I, null, G(o.classes, (r) => (a(), l("div", {
                key: r.name,
                class: "ob-class",
                title: r.description || ""
              }, [
                n("div", St, [
                  n("span", Et, [
                    b(s(V), {
                      icon: r.icon || "tabler:layers-subtract",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  n("span", $t, k(r.title || r.name), 1)
                ]),
                b(s(me), {
                  "model-value": B(r.name),
                  options: se(o.models),
                  placeholder: o.models.length ? "Select a model" : "No models yet",
                  "aria-label": `Model for ${r.title || r.name}`,
                  "onUpdate:modelValue": (d) => Ee(r.name, d)
                }, null, 8, ["model-value", "options", "placeholder", "aria-label", "onUpdate:modelValue"])
              ], 8, Mt))), 128))
            ])
          ]))), 128)),
          n("div", Pt, [
            n("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[5] || (t[5] = (o) => s(h)("back", void 0))
            }, "‹ Back"),
            t[14] || (t[14] = n("span", { class: "ob-foot-sp" }, null, -1)),
            R.value ? (a(), l("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-primary",
              disabled: s(F),
              onClick: le
            }, "Continue ›", 8, It)) : (a(), l("button", {
              key: 1,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: ie
            }, "Skip for now"))
          ])
        ]))
      ], 64))
    ]));
  }
});
export {
  Tt as default
};
//# sourceMappingURL=Onboard-pnGjbhxJ.js.map

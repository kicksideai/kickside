import { defineComponent as Ne, ref as A, computed as p, onMounted as Ee, openBlock as s, createElementBlock as l, unref as a, createBlock as R, withCtx as Q, createTextVNode as z, toDisplayString as k, createCommentVNode as N, Fragment as E, createVNode as _, createElementVNode as n, renderList as U, normalizeClass as Pe } from "vue";
import { Icon as O } from "@iconify/vue";
import { u as $e } from "./wc-runtime-ClNbKZcC.js";
import { u as Ie, g as xe, j as de, k as Ae, p as Oe, s as Ve, a as Fe, _ as Te, m as De } from "./useModelsApi-Tzt3FKtZ.js";
import { f as Be, i as Le, e as Re, _ as ue, a as ze } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-DmAUy6xJ.js";
import "primevue/button";
import "primevue/toggleswitch";
import "primevue/tag";
import "primevue/drawer";
const Ue = () => $e();
function je(V, y, v) {
  const P = V.filter((u) => u.enabled !== !1 && u.status !== "unhealthy");
  if (!P.length) return null;
  const $ = v.find((u) => u.declared && u.name === "fast")?.models?.[0]?.name;
  if (!$) return null;
  const r = y.find((u) => u.name === $ && u.enabled !== !1 && !qe(u));
  if (!r) return null;
  const b = r.provider_profile_id ? P.find((u) => u.id === r.provider_profile_id) : P.find((u) => !!r.provider_id && u.provider_id === r.provider_id);
  return !b || r.provider_id && r.provider_id !== b.provider_id ? null : {
    class: "fast",
    model: r.name,
    title: r.title || r.name,
    provider_id: r.provider_id || b.provider_id
  };
}
function qe(V) {
  const y = (V.capabilities ?? []).map((v) => v.toLowerCase());
  return y.length > 0 && y.every((v) => v === "embed" || v === "embedding" || v === "embeddings");
}
const Ge = { class: "ob" }, He = {
  key: 0,
  class: "ob-model-warning",
  role: "note"
}, Ke = {
  key: 1,
  class: "ob-stage"
}, We = { class: "ob-grid" }, Ye = ["onClick"], Je = { class: "ob-tile-ico" }, Qe = { class: "ob-tile-name" }, Xe = {
  key: 0,
  class: "ob-tile-desc"
}, Ze = { class: "ob-foot" }, et = {
  key: 2,
  class: "ob-stage"
}, tt = {
  key: 0,
  class: "ob-connecting"
}, ot = {
  key: 2,
  class: "ob-result fail"
}, nt = {
  key: 3,
  class: "ob-stage"
}, st = {
  key: 0,
  class: "ob-result fail"
}, at = { class: "ob-block" }, lt = { class: "ob-block-head" }, it = { class: "ob-providers" }, rt = { class: "ob-prov-body" }, dt = { class: "ob-prov-name" }, ut = { class: "ob-prov-sub" }, ct = ["title"], vt = {
  key: 1,
  class: "ob-autobar"
}, pt = { class: "ob-block-head" }, mt = { class: "ob-classes" }, bt = ["title"], ft = { class: "ob-class-top" }, gt = { class: "ob-class-ico" }, _t = { class: "ob-class-name" }, kt = { class: "ob-foot" }, yt = ["disabled"], ht = "kickside-model-provider-openai-compatible", wt = "wippy.llm.openai_compat:provider", At = /* @__PURE__ */ Ne({
  __name: "Onboard",
  setup(V) {
    const y = Ue(), v = Ie(), { adapters: P, presets: $, profiles: r, models: b, classes: u, loading: ce, saving: j, error: I } = v, X = De(() => P.value, () => r.value, () => $.value), f = A("pick"), C = A(null), S = A(""), h = A(""), M = A(!1), ve = p(() => $.value.filter((e) => e.onboarding !== !1)), pe = p(() => C.value?.provider_id || wt), q = p(() => X.adapterFor(pe.value)), G = p(
      () => C.value?.profile_editor_tag || q.value?.profile_editor_tag || ht
    ), me = p(() => Be(G.value)), be = p(() => Le(G.value));
    function H(e, t) {
      return (e.capabilities ?? []).some((o) => o.toLowerCase() === t);
    }
    function fe(e) {
      const t = (e.capabilities ?? []).map((o) => o.toLowerCase());
      return t.length > 0 && t.every((o) => o === "embed" || o === "embedding" || o === "embeddings");
    }
    const F = p(() => b.value.filter((e) => e.enabled !== !1 && !fe(e))), Z = p(() => b.value.filter((e) => e.enabled !== !1 && (H(e, "embed") || H(e, "embedding") || H(e, "embeddings")))), T = p(() => u.value.filter((e) => e.declared && e.capability !== "embed")), ee = p(() => u.value.filter((e) => e.declared && e.capability === "embed"));
    function D(e) {
      return u.value.find((t) => t.name === e)?.models?.[0]?.name ?? "";
    }
    function ge(e) {
      return e.map((t) => ({ label: t.title || t.name, value: t.name }));
    }
    const te = p(() => [
      { key: "generate", title: "Default model per capability", classes: T.value, models: F.value },
      { key: "embed", title: "Embeddings", classes: ee.value, models: Z.value }
    ].filter((e) => e.classes.length)), K = p(() => je(r.value, b.value, u.value)), B = p(() => K.value !== null);
    function oe() {
      y("done", {
        status: B.value ? "completed" : "skipped",
        model_configured: B.value,
        ...K.value ? { model: K.value } : {}
      });
    }
    function ne() {
      oe();
    }
    function se(e) {
      h.value = e, I.value = "";
    }
    function ae() {
      C.value = null, S.value = "", h.value = "", f.value = "pick";
    }
    function _e(e) {
      C.value = e, h.value = "", f.value = "connect";
    }
    function le() {
      r.value.length ? f.value = "review" : ae();
    }
    async function ie(e) {
      if (!M.value) {
        M.value = !0, h.value = "";
        try {
          e.enabled = !0;
          const t = new Set(r.value.map((d) => d.id));
          if (S.value = "Saving connection…", !await v.saveProfile("create", "", e)) {
            se(I.value || "Could not save the connection.");
            return;
          }
          const i = r.value.find((d) => !t.has(d.id));
          if (i) {
            S.value = "Verifying key and importing models…";
            const d = await v.discover(i.id);
            await v.loadClasses(), d.ok ? (S.value = "Selecting sensible defaults…", await Y(!1)) : se(d.message);
          }
          f.value = "review";
        } finally {
          M.value = !1, S.value = "";
        }
      }
    }
    function ke(e, t, o) {
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
        max_tokens: Number(e.max_tokens ?? 0),
        output_tokens: Number(e.output_tokens ?? 0),
        dimensions: Number(e.dimensions ?? 0),
        pricing: e.pricing ?? {},
        options: e.options ?? {},
        metadata: e.metadata ?? {},
        source: e.source === "registry" ? "overlay" : e.source || "overlay"
      };
    }
    async function re(e) {
      const t = /* @__PURE__ */ new Map();
      for (const c of e) c.model && t.set(c.cls, c.model);
      if (!t.size) return;
      const o = new Set(t.keys()), i = /* @__PURE__ */ new Map();
      for (const c of b.value) {
        const g = new Set(c.class ?? []);
        for (const w of o) g.delete(w);
        i.set(c.name, g);
      }
      for (const [c, g] of t) i.get(g)?.add(c);
      const d = new Set(t.values()), m = [];
      for (const c of b.value) {
        const g = new Set(c.class ?? []), w = i.get(c.name);
        if (g.size === w.size && [...w].every((J) => g.has(J))) continue;
        const x = d.has(c.name) ? 1e3 : Number(c.priority ?? 10);
        m.push(ke(c, [...w], x));
      }
      m.length && (await v.saveCards(m), await v.loadClasses());
    }
    async function ye(e, t) {
      t && await re([{ cls: e, model: t }]);
    }
    const he = /* @__PURE__ */ new Set([
      "wippy.llm.openai:provider",
      "wippy.llm.claude:provider",
      "wippy.llm.google.generative_ai:provider",
      "wippy.llm.google.vertex:provider",
      "wippy.llm.bedrock:provider"
    ]);
    function W(e) {
      return he.has(e.provider_id || "");
    }
    const we = /embed|whisper|tts|audio|image|imagen|dall-?e|lyria|veo|sora|music|\baqa\b|moderation|rerank|guard|realtime|transcribe|speech|\bsearch\b|vision-?only/i;
    function L(e) {
      const t = e.pricing, o = Number(t?.completion ?? t?.output ?? t?.prompt ?? 0);
      return Number.isFinite(o) && o > 0 ? o : (Number(e.max_tokens) || 0) / 1e6;
    }
    function Ce() {
      const e = F.value.filter((o) => !we.test(o.name)), t = e.filter(W);
      return t.length ? t : e.length ? e : F.value;
    }
    function Se(e) {
      const t = /* @__PURE__ */ new Map(), o = Ce();
      if (!o.length || !e.length) return t;
      const i = [...o].sort((m, c) => L(m) - L(c)), d = i.length - 1;
      return e.forEach((m, c) => {
        const g = o.filter((x) => (x.class ?? []).includes(m.name)).sort((x, J) => L(J) - L(x));
        if (g.length) {
          t.set(m.name, g[0].name);
          return;
        }
        const w = e.length <= 1 ? d : Math.round(c * d / (e.length - 1));
        t.set(m.name, i[Math.min(w, d)].name);
      }), t;
    }
    function Me() {
      return [...Z.value].sort((t, o) => (W(o) ? 1 : 0) - (W(t) ? 1 : 0) || (Number(o.dimensions) || 0) - (Number(t.dimensions) || 0))[0]?.name || "";
    }
    async function Y(e = !1) {
      const t = [], o = Se(T.value);
      for (const d of T.value) {
        if (!e && D(d.name)) continue;
        const m = o.get(d.name);
        m && t.push({ cls: d.name, model: m });
      }
      const i = Me();
      for (const d of ee.value)
        !e && D(d.name) || i && t.push({ cls: d.name, model: i });
      await re(t);
    }
    return Ee(async () => {
      await Promise.all([v.load(), v.loadClasses()]), f.value = r.value.length ? "review" : "pick", r.value.length && F.value.length && T.value.every((e) => !D(e.name)) && await Y(!1);
    }), (e, t) => (s(), l("div", Ge, [
      a(I) && f.value !== "connect" ? (s(), R(a(xe), {
        key: 0,
        severity: "danger",
        onDismiss: t[0] || (t[0] = (o) => I.value = "")
      }, {
        default: Q(() => [
          z(k(a(I)), 1)
        ]),
        _: 1
      })) : N("", !0),
      a(ce) && !a(r).length && !a(b).length ? (s(), R(a(de), {
        key: 1,
        label: "Loading…"
      })) : (s(), l(E, { key: 2 }, [
        f.value === "pick" && !B.value ? (s(), l("div", He, [
          _(a(O), {
            icon: "tabler:brain",
            "aria-hidden": "true"
          }),
          t[5] || (t[5] = n("span", null, [
            n("strong", null, "KickSide works without an AI model, but it is better with one."),
            z(" Recommendations and AI-powered automations will be unavailable until you connect a provider. You can skip this step and finish it later under System → Models.")
          ], -1))
        ])) : N("", !0),
        f.value === "pick" ? (s(), l("section", Ke, [
          n("div", We, [
            (s(!0), l(E, null, U(ve.value, (o) => (s(), l("button", {
              key: o.id,
              type: "button",
              class: "ob-tile",
              onClick: (i) => _e(o)
            }, [
              n("span", Je, [
                _(a(O), {
                  icon: o.icon || "tabler:plug",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              n("span", Qe, k(o.title), 1),
              o.description ? (s(), l("span", Xe, k(o.description), 1)) : N("", !0)
            ], 8, Ye))), 128))
          ]),
          n("div", Ze, [
            n("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[1] || (t[1] = (o) => a(y)("back", void 0))
            }, "‹ Back"),
            t[6] || (t[6] = n("span", { class: "ob-foot-sp" }, null, -1)),
            a(r).length ? (s(), l("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[2] || (t[2] = (o) => f.value = "review")
            }, "Skip — already connected")) : (s(), l("button", {
              key: 1,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: ne
            }, "Skip for now"))
          ])
        ])) : f.value === "connect" ? (s(), l("section", et, [
          M.value ? (s(), l("div", tt, [
            _(a(de), {
              label: S.value || "Connecting…"
            }, null, 8, ["label"]),
            t[7] || (t[7] = n("p", { class: "ob-connecting-note" }, "Importing the provider's models — this can take up to a minute. Please don't close this.", -1))
          ])) : (s(), l(E, { key: 1 }, [
            be.value ? (s(), R(Re, {
              key: 0,
              "spec-key": me.value.key,
              preset: C.value || void 0,
              adapter: q.value || void 0,
              mode: "create",
              saving: M.value,
              onSave: ie,
              onCancel: le
            }, null, 8, ["spec-key", "preset", "adapter", "saving"])) : (s(), R(Ae, {
              key: 1,
              tag: G.value,
              mode: "create",
              preset: C.value || void 0,
              adapter: q.value || void 0,
              saving: M.value,
              onSave: ie,
              onCancel: le
            }, null, 8, ["tag", "preset", "adapter", "saving"])),
            h.value ? (s(), l("div", ot, [
              _(a(O), {
                icon: "tabler:circle-x",
                "aria-hidden": "true"
              }),
              n("span", null, k(h.value), 1)
            ])) : N("", !0)
          ], 64))
        ])) : (s(), l("section", nt, [
          h.value ? (s(), l("div", st, [
            _(a(O), {
              icon: "tabler:circle-x",
              "aria-hidden": "true"
            }),
            n("span", null, k(h.value), 1)
          ])) : N("", !0),
          n("div", at, [
            n("div", lt, [
              t[9] || (t[9] = n("span", null, "Connected", -1)),
              _(a(ue), {
                variant: "soft",
                small: "",
                icon: "tabler:plus",
                disabled: a(j),
                onClick: ae
              }, {
                default: Q(() => [...t[8] || (t[8] = [
                  z("Add provider", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ]),
            n("div", it, [
              (s(!0), l(E, null, U(a(r), (o) => (s(), l("div", {
                key: o.id,
                class: "ob-prov"
              }, [
                _(a(ze), {
                  icon: a(X).providerIcon(o.provider_id),
                  size: "sm"
                }, null, 8, ["icon"]),
                n("div", rt, [
                  n("div", dt, k(o.name), 1),
                  n("div", ut, k(a(Oe)(o)), 1)
                ]),
                n("span", {
                  class: Pe(["ob-dot", a(Fe)(o.status)]),
                  title: a(Ve)(o.status)
                }, null, 10, ct)
              ]))), 128))
            ])
          ]),
          te.value.length ? (s(), l("div", vt, [
            t[11] || (t[11] = n("span", { class: "ob-auto-hint" }, "Defaults are picked for you — adjust any below.", -1)),
            _(a(ue), {
              variant: "soft",
              small: "",
              icon: "tabler:wand",
              disabled: a(j),
              onClick: t[3] || (t[3] = (o) => Y(!0))
            }, {
              default: Q(() => [...t[10] || (t[10] = [
                z("Auto-select", -1)
              ])]),
              _: 1
            }, 8, ["disabled"])
          ])) : N("", !0),
          (s(!0), l(E, null, U(te.value, (o) => (s(), l("div", {
            key: o.key,
            class: "ob-block"
          }, [
            n("div", pt, [
              n("span", null, k(o.title), 1)
            ]),
            n("div", mt, [
              (s(!0), l(E, null, U(o.classes, (i) => (s(), l("div", {
                key: i.name,
                class: "ob-class",
                title: i.description || ""
              }, [
                n("div", ft, [
                  n("span", gt, [
                    _(a(O), {
                      icon: i.icon || "tabler:layers-subtract",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  n("span", _t, k(i.title || i.name), 1)
                ]),
                _(a(Te), {
                  "model-value": D(i.name),
                  options: ge(o.models),
                  placeholder: o.models.length ? "Select a model" : "No models yet",
                  "aria-label": `Model for ${i.title || i.name}`,
                  "onUpdate:modelValue": (d) => ye(i.name, d)
                }, null, 8, ["model-value", "options", "placeholder", "aria-label", "onUpdate:modelValue"])
              ], 8, bt))), 128))
            ])
          ]))), 128)),
          n("div", kt, [
            n("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[4] || (t[4] = (o) => a(y)("back", void 0))
            }, "‹ Back"),
            t[12] || (t[12] = n("span", { class: "ob-foot-sp" }, null, -1)),
            B.value ? (s(), l("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-primary",
              disabled: a(j),
              onClick: oe
            }, "Continue ›", 8, yt)) : (s(), l("button", {
              key: 1,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: ne
            }, "Skip for now"))
          ])
        ]))
      ], 64))
    ]));
  }
});
export {
  At as default
};
//# sourceMappingURL=Onboard-BQFsFmGf.js.map

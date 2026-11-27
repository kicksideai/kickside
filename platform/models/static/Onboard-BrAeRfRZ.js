import { defineComponent as xe, ref as S, computed as p, onMounted as De, openBlock as n, createElementBlock as a, unref as s, createBlock as O, withCtx as ne, createTextVNode as H, toDisplayString as k, createCommentVNode as y, Fragment as I, createVNode as m, createElementVNode as l, renderList as K, normalizeClass as Fe } from "vue";
import { Icon as x } from "@iconify/vue";
import { o as Be } from "./wc-runtime-DYOSFvWw.js";
import { u as Le, j as Ue, k as ge, l as Re, n as ze, p as je, a as qe, b as Ge, _ as _e, m as He, q as Ke } from "./useModelsApi-CZQmNrX-.js";
import { d as We, i as Ye, e as Je, c as Qe, a as ke, _ as Xe } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-CXW3wYHb.js";
const Ze = () => Be();
function et(D, C, d) {
  const V = D.filter((u) => u.enabled !== !1 && u.status !== "unhealthy");
  if (!V.length) return null;
  const F = d.find((u) => u.declared && u.name === "fast")?.models?.[0]?.name;
  if (!F) return null;
  const r = C.find((u) => u.name === F && u.enabled !== !1 && !tt(u));
  if (!r) return null;
  const b = r.provider_profile_id ? V.find((u) => u.id === r.provider_profile_id) : V.find((u) => !!r.provider_id && u.provider_id === r.provider_id);
  return !b || r.provider_id && r.provider_id !== b.provider_id ? null : {
    class: "fast",
    model: r.name,
    title: r.title || r.name,
    provider_id: r.provider_id || b.provider_id
  };
}
function tt(D) {
  const C = (D.capabilities ?? []).map((d) => d.toLowerCase());
  return C.length > 0 && C.every((d) => d === "embed" || d === "embedding" || d === "embeddings");
}
const ot = { class: "ob" }, nt = {
  key: 0,
  class: "ob-model-warning",
  role: "note"
}, st = {
  key: 1,
  class: "ob-stage"
}, lt = { class: "ob-grid" }, at = ["onClick"], it = { class: "ob-tile-ico" }, rt = { class: "ob-tile-name" }, dt = {
  key: 0,
  class: "ob-tile-desc"
}, ut = { class: "ob-foot" }, ct = {
  key: 2,
  class: "ob-stage"
}, vt = {
  key: 0,
  class: "ob-connecting"
}, pt = {
  key: 3,
  class: "ob-result fail"
}, ft = ["href"], mt = {
  key: 3,
  class: "ob-stage"
}, bt = { class: "km-editor-head-title" }, gt = {
  key: 4,
  class: "ob-stage"
}, _t = {
  key: 0,
  class: "ob-result fail"
}, kt = ["href"], yt = { class: "ob-block" }, ht = { class: "ob-block-head" }, Ct = { class: "ob-providers" }, wt = { class: "ob-prov-body" }, Mt = { class: "ob-prov-name" }, St = { class: "ob-prov-sub" }, $t = ["title"], Et = {
  key: 1,
  class: "ob-block"
}, Pt = {
  key: 2,
  class: "ob-autobar"
}, At = { class: "ob-block-head" }, It = { class: "ob-classes" }, Vt = ["title"], Nt = { class: "ob-class-top" }, Tt = { class: "ob-class-ico" }, Ot = { class: "ob-class-name" }, xt = { class: "ob-foot" }, Dt = ["disabled"], Ft = "kickside-model-provider-openai-compatible", Bt = "wippy.llm.openai_compat:provider", qt = /* @__PURE__ */ xe({
  __name: "Onboard",
  setup(D) {
    const C = Ze(), d = Le(), { adapters: V, presets: F, profiles: r, models: b, classes: u, loading: ye, saving: B, error: N } = d, se = He(() => V.value, () => r.value), g = S("pick"), E = S(null), h = S(null), P = S(""), w = S(""), M = S(""), A = S(!1), he = p(() => F.value.filter((t) => t.onboarding !== !1)), le = p(() => E.value?.provider_id || Bt), L = S(!1), ae = p(() => ["wippy.llm.claude:provider", "wippy.llm.google.generative_ai:provider"].includes(le.value)), W = p(() => se.adapterFor(le.value)), Y = p(
      () => E.value?.profile_editor_tag || W.value?.profile_editor_tag || Ft
    ), Ce = p(() => We(Y.value)), we = p(() => Ye(Y.value));
    function J(t, e) {
      return (t.capabilities ?? []).some((o) => o.toLowerCase() === e);
    }
    function Me(t) {
      const e = (t.capabilities ?? []).map((o) => o.toLowerCase());
      return e.length > 0 && e.every((o) => o === "embed" || o === "embedding" || o === "embeddings");
    }
    const U = p(() => b.value.filter((t) => t.enabled !== !1 && !Me(t))), ie = p(() => b.value.filter((t) => t.enabled !== !1 && (J(t, "embed") || J(t, "embedding") || J(t, "embeddings")))), Q = p(() => b.value.filter((t) => t.source === "discovered")), R = p(() => u.value.filter((t) => t.declared && t.capability !== "embed")), re = p(() => u.value.filter((t) => t.declared && t.capability === "embed"));
    function z(t) {
      return u.value.find((e) => e.name === t)?.models?.[0]?.name ?? "";
    }
    function de(t) {
      return t.map((e) => ({ label: e.title || e.name, value: e.name }));
    }
    function Se(t) {
      h.value = Q.value.find((e) => e.name === t) ?? null;
    }
    async function $e(t) {
      await d.saveCard(t) && (await d.loadClasses(), await G(!1), h.value = null);
    }
    const ue = p(() => [
      { key: "generate", title: "Default model per capability", classes: R.value, models: U.value },
      { key: "embed", title: "Embeddings", classes: re.value, models: ie.value }
    ].filter((t) => t.classes.length)), X = p(() => et(r.value, b.value, u.value)), j = p(() => X.value !== null);
    function ce() {
      C("done", {
        status: j.value ? "completed" : "skipped",
        model_configured: j.value,
        ...X.value ? { model: X.value } : {}
      });
    }
    function ve() {
      ce();
    }
    function Z(t, e, o = "") {
      const i = Ke(t, e, o);
      w.value = i.message, M.value = i.errorType === "insufficient_credits" ? i.billingUrl ?? "" : "", N.value = "";
    }
    function pe() {
      E.value = null, P.value = "", w.value = "", M.value = "", g.value = "pick";
    }
    function Ee(t) {
      L.value = !1, E.value = t, w.value = "", M.value = "", g.value = "connect";
    }
    function fe() {
      r.value.length ? g.value = "review" : pe();
    }
    async function me(t) {
      if (!A.value) {
        A.value = !0, w.value = "", M.value = "";
        try {
          P.value = "Saving and testing the connection…";
          const e = await d.createProfile({ ...t, enabled: !0 }, ae.value && L.value);
          if (!e) {
            Z(N.value || "Could not save the connection.");
            return;
          }
          const { profile: o, check: i } = e;
          if (i?.success === !1 || o.status === "unhealthy")
            Z(o.message || "Connection test failed.", i?.error_type, o.provider_id);
          else {
            P.value = "Importing models…";
            const c = await d.discover(o.id);
            await d.loadClasses(), c.ok ? (P.value = "Selecting sensible defaults…", await G(!1)) : Z(c.message, c.errorType, o.provider_id);
          }
          g.value = "review";
        } finally {
          A.value = !1, P.value = "";
        }
      }
    }
    function Pe(t, e, o) {
      return {
        name: t.name,
        title: t.title || t.name,
        description: t.description || "",
        provider_id: t.provider_id,
        provider_profile_id: t.provider_profile_id || void 0,
        provider_model: t.provider_model || t.name,
        capabilities: [...t.capabilities ?? []],
        classes: e,
        priority: o,
        pricing: t.pricing ?? {},
        options: t.options ?? {},
        metadata: t.metadata ?? {},
        source: t.source === "registry" ? "overlay" : t.source || "overlay"
      };
    }
    async function be(t) {
      const e = /* @__PURE__ */ new Map();
      for (const v of t) v.model && e.set(v.cls, v.model);
      if (!e.size) return;
      const o = new Set(e.keys()), i = /* @__PURE__ */ new Map();
      for (const v of b.value) {
        const _ = new Set(v.class ?? []);
        for (const $ of o) _.delete($);
        i.set(v.name, _);
      }
      for (const [v, _] of e) i.get(_)?.add(v);
      const c = new Set(e.values()), f = [];
      for (const v of b.value) {
        const _ = new Set(v.class ?? []), $ = i.get(v.name);
        if (_.size === $.size && [...$].every((oe) => _.has(oe))) continue;
        const T = c.has(v.name) ? 1e3 : Number(v.priority ?? 10);
        f.push(Pe(v, [...$], T));
      }
      f.length && (await d.saveCards(f), await d.loadClasses());
    }
    async function Ae(t, e) {
      e && await be([{ cls: t, model: e }]);
    }
    const Ie = /* @__PURE__ */ new Set([
      "wippy.llm.openai:provider",
      "wippy.llm.claude:provider",
      "wippy.llm.google.generative_ai:provider",
      "wippy.llm.google.vertex:provider",
      "wippy.llm.bedrock:provider"
    ]);
    function ee(t) {
      return Ie.has(t.provider_id || "");
    }
    const Ve = /embed|whisper|tts|audio|image|imagen|dall-?e|lyria|veo|sora|music|\baqa\b|moderation|rerank|guard|realtime|transcribe|speech|\bsearch\b|vision-?only/i;
    function q(t) {
      const e = t.pricing, o = Number(e?.completion ?? e?.output ?? e?.prompt ?? 0);
      if (Number.isFinite(o) && o > 0) return o;
      if (t.max_tokens != null) return t.max_tokens / 1e6;
    }
    function te(t, e) {
      return t == null ? e == null ? 0 : -1 : e == null ? 1 : t - e;
    }
    function Ne() {
      const t = U.value.filter((o) => !Ve.test(o.name)), e = t.filter(ee);
      return e.length ? e : t.length ? t : U.value;
    }
    function Te(t) {
      const e = /* @__PURE__ */ new Map(), o = Ne();
      if (!o.length || !t.length) return e;
      const i = [...o].sort((f, v) => te(q(f), q(v))), c = i.length - 1;
      return t.forEach((f, v) => {
        const _ = o.filter((T) => (T.class ?? []).includes(f.name)).sort((T, oe) => te(q(oe), q(T)));
        if (_.length) {
          e.set(f.name, _[0].name);
          return;
        }
        const $ = t.length <= 1 ? c : Math.round(v * c / (t.length - 1));
        e.set(f.name, i[Math.min($, c)].name);
      }), e;
    }
    function Oe() {
      return [...ie.value].sort((e, o) => (ee(o) ? 1 : 0) - (ee(e) ? 1 : 0) || te(o.dimensions, e.dimensions))[0]?.name || "";
    }
    async function G(t = !1) {
      const e = [], o = Te(R.value);
      for (const c of R.value) {
        if (!t && z(c.name)) continue;
        const f = o.get(c.name);
        f && e.push({ cls: c.name, model: f });
      }
      const i = Oe();
      for (const c of re.value)
        !t && z(c.name) || i && e.push({ cls: c.name, model: i });
      await be(e);
    }
    return De(async () => {
      await Promise.all([d.load(), d.loadClasses()]), g.value = r.value.length ? "review" : "pick", r.value.length && U.value.length && R.value.every((t) => !z(t.name)) && await G(!1);
    }), (t, e) => (n(), a("div", ot, [
      s(N) && g.value !== "connect" ? (n(), O(s(Ue), {
        key: 0,
        severity: "danger",
        onDismiss: e[0] || (e[0] = (o) => N.value = "")
      }, {
        default: ne(() => [
          H(k(s(N)), 1)
        ]),
        _: 1
      })) : y("", !0),
      s(ye) && !s(r).length && !s(b).length ? (n(), O(s(ge), {
        key: 1,
        label: "Loading…"
      })) : (n(), a(I, { key: 2 }, [
        g.value === "pick" && !j.value ? (n(), a("div", nt, [
          m(s(x), {
            icon: "tabler:brain",
            "aria-hidden": "true"
          }),
          e[7] || (e[7] = l("span", null, [
            l("strong", null, "KickSide works without an AI model, but it is better with one."),
            H(" Recommendations and AI-powered automations will be unavailable until you connect a provider. You can skip this step and finish it later under System → Models.")
          ], -1))
        ])) : y("", !0),
        g.value === "pick" ? (n(), a("section", st, [
          l("div", lt, [
            (n(!0), a(I, null, K(he.value, (o) => (n(), a("button", {
              key: o.id,
              type: "button",
              class: "ob-tile",
              onClick: (i) => Ee(o)
            }, [
              l("span", it, [
                m(s(x), {
                  icon: o.icon || "tabler:plug",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              l("span", rt, k(o.title), 1),
              o.description ? (n(), a("span", dt, k(o.description), 1)) : y("", !0)
            ], 8, at))), 128))
          ]),
          l("div", ut, [
            l("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: e[1] || (e[1] = (o) => s(C)("back", void 0))
            }, "‹ Back"),
            e[8] || (e[8] = l("span", { class: "ob-foot-sp" }, null, -1)),
            s(r).length ? (n(), a("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: e[2] || (e[2] = (o) => g.value = "review")
            }, "Skip — already connected")) : (n(), a("button", {
              key: 1,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: ve
            }, "Skip for now"))
          ])
        ])) : g.value === "connect" ? (n(), a("section", ct, [
          A.value ? (n(), a("div", vt, [
            m(s(ge), {
              label: P.value || "Connecting…"
            }, null, 8, ["label"]),
            e[9] || (e[9] = l("p", { class: "ob-connecting-note" }, "Importing the provider's models — this can take up to a minute. Please don't close this.", -1))
          ])) : (n(), a(I, { key: 1 }, [
            ae.value ? (n(), O(s(Je), {
              key: 0,
              modelValue: L.value,
              "onUpdate:modelValue": e[3] || (e[3] = (o) => L.value = o),
              label: "Test generation with one output token (provider charges may apply)"
            }, null, 8, ["modelValue"])) : y("", !0),
            we.value ? (n(), O(Qe, {
              key: 1,
              "spec-key": Ce.value.key,
              preset: E.value || void 0,
              adapter: W.value || void 0,
              mode: "create",
              saving: A.value,
              onSave: me,
              onCancel: fe
            }, null, 8, ["spec-key", "preset", "adapter", "saving"])) : (n(), O(Re, {
              key: 2,
              tag: Y.value,
              mode: "create",
              preset: E.value || void 0,
              adapter: W.value || void 0,
              saving: A.value,
              onSave: me,
              onCancel: fe
            }, null, 8, ["tag", "preset", "adapter", "saving"])),
            w.value ? (n(), a("div", pt, [
              m(s(x), {
                icon: "tabler:circle-x",
                "aria-hidden": "true"
              }),
              l("span", null, k(w.value), 1),
              M.value ? (n(), a("a", {
                key: 0,
                class: "ob-billing-link",
                href: M.value,
                target: "_blank",
                rel: "noopener noreferrer"
              }, "Add credits", 8, ft)) : y("", !0)
            ])) : y("", !0)
          ], 64))
        ])) : h.value ? (n(), a("section", mt, [
          l("h3", bt, "Configure " + k(h.value.title || h.value.name), 1),
          m(ze, {
            "aria-label": `Configure ${h.value.title || h.value.name}`,
            model: h.value,
            profiles: s(r),
            saving: s(B),
            onSave: $e,
            onCancel: e[4] || (e[4] = (o) => h.value = null)
          }, null, 8, ["aria-label", "model", "profiles", "saving"])
        ])) : (n(), a("section", gt, [
          w.value ? (n(), a("div", _t, [
            m(s(x), {
              icon: "tabler:circle-x",
              "aria-hidden": "true"
            }),
            l("span", null, k(w.value), 1),
            M.value ? (n(), a("a", {
              key: 0,
              class: "ob-billing-link",
              href: M.value,
              target: "_blank",
              rel: "noopener noreferrer"
            }, "Add credits", 8, kt)) : y("", !0)
          ])) : y("", !0),
          l("div", yt, [
            l("div", ht, [
              e[11] || (e[11] = l("span", null, "Connected", -1)),
              m(s(ke), {
                variant: "soft",
                small: "",
                icon: "tabler:plus",
                disabled: s(B),
                onClick: pe
              }, {
                default: ne(() => [...e[10] || (e[10] = [
                  H("Add provider", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ]),
            l("div", Ct, [
              (n(!0), a(I, null, K(s(r), (o) => (n(), a("div", {
                key: o.id,
                class: "ob-prov"
              }, [
                m(s(Xe), {
                  icon: s(se).providerIcon(o.provider_id, o.id),
                  size: "sm"
                }, null, 8, ["icon"]),
                l("div", wt, [
                  l("div", Mt, k(o.name), 1),
                  l("div", St, k(s(je)(o)), 1)
                ]),
                l("span", {
                  class: Fe(["ob-dot", s(Ge)(o.status)]),
                  title: s(qe)(o.status)
                }, null, 10, $t)
              ]))), 128))
            ])
          ]),
          Q.value.length ? (n(), a("div", Et, [
            e[12] || (e[12] = l("div", { class: "ob-block-head" }, [
              l("span", null, "Model settings")
            ], -1)),
            m(s(_e), {
              "model-value": "",
              options: de(Q.value),
              placeholder: "Choose a model to configure",
              "aria-label": "Model to configure",
              "onUpdate:modelValue": Se
            }, null, 8, ["options"])
          ])) : y("", !0),
          ue.value.length ? (n(), a("div", Pt, [
            e[14] || (e[14] = l("span", { class: "ob-auto-hint" }, "Defaults are picked for you — adjust any below.", -1)),
            m(s(ke), {
              variant: "soft",
              small: "",
              icon: "tabler:wand",
              disabled: s(B),
              onClick: e[5] || (e[5] = (o) => G(!0))
            }, {
              default: ne(() => [...e[13] || (e[13] = [
                H("Auto-select", -1)
              ])]),
              _: 1
            }, 8, ["disabled"])
          ])) : y("", !0),
          (n(!0), a(I, null, K(ue.value, (o) => (n(), a("div", {
            key: o.key,
            class: "ob-block"
          }, [
            l("div", At, [
              l("span", null, k(o.title), 1)
            ]),
            l("div", It, [
              (n(!0), a(I, null, K(o.classes, (i) => (n(), a("div", {
                key: i.name,
                class: "ob-class",
                title: i.description || ""
              }, [
                l("div", Nt, [
                  l("span", Tt, [
                    m(s(x), {
                      icon: i.icon || "tabler:layers-subtract",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  l("span", Ot, k(i.title || i.name), 1)
                ]),
                m(s(_e), {
                  "model-value": z(i.name),
                  options: de(o.models),
                  placeholder: o.models.length ? "Select a model" : "No models yet",
                  "aria-label": `Model for ${i.title || i.name}`,
                  "onUpdate:modelValue": (c) => Ae(i.name, c)
                }, null, 8, ["model-value", "options", "placeholder", "aria-label", "onUpdate:modelValue"])
              ], 8, Vt))), 128))
            ])
          ]))), 128)),
          l("div", xt, [
            l("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: e[6] || (e[6] = (o) => s(C)("back", void 0))
            }, "‹ Back"),
            e[15] || (e[15] = l("span", { class: "ob-foot-sp" }, null, -1)),
            j.value ? (n(), a("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-primary",
              disabled: s(B),
              onClick: ce
            }, "Continue ›", 8, Dt)) : (n(), a("button", {
              key: 1,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: ve
            }, "Skip for now"))
          ])
        ]))
      ], 64))
    ]));
  }
});
export {
  qt as default
};
//# sourceMappingURL=Onboard-BrAeRfRZ.js.map

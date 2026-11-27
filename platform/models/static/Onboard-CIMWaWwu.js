import { defineComponent as xe, ref as S, computed as f, onMounted as De, openBlock as n, createElementBlock as i, unref as s, createBlock as O, withCtx as ne, createTextVNode as H, toDisplayString as k, createCommentVNode as y, Fragment as V, createVNode as m, createElementVNode as l, renderList as K, normalizeClass as Fe } from "vue";
import { Icon as x } from "@iconify/vue";
import { o as Be } from "./wc-runtime-DYOSFvWw.js";
import { u as Le, j as Ue, k as ge, l as Re, n as ze, p as je, a as qe, b as Ge, _ as _e, m as He, q as Ke } from "./useModelsApi-COUUAMpQ.js";
import { d as We, i as Ye, e as Je, c as Qe, a as ke, _ as Xe } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-CXW3wYHb.js";
const Ze = () => Be();
function et(D, w, c) {
  const A = D.filter((v) => v.enabled !== !1 && v.status !== "unhealthy");
  if (!A.length) return null;
  const F = c.find((v) => v.declared && v.name === "fast")?.models?.[0]?.name;
  if (!F) return null;
  const r = w.find((v) => v.name === F && v.enabled !== !1 && !tt(v));
  if (!r) return null;
  const b = r.provider_profile_id ? A.find((v) => v.id === r.provider_profile_id) : A.find((v) => !!r.provider_id && v.provider_id === r.provider_id);
  return !b || r.provider_id && r.provider_id !== b.provider_id ? null : {
    class: "fast",
    model: r.name,
    title: r.title || r.name,
    provider_id: r.provider_id || b.provider_id
  };
}
function tt(D) {
  const w = (D.capabilities ?? []).map((c) => c.toLowerCase());
  return w.length > 0 && w.every((c) => c === "embed" || c === "embedding" || c === "embeddings");
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
}, kt = ["href"], yt = { class: "ob-block" }, ht = { class: "ob-block-head" }, wt = { class: "ob-providers" }, Ct = { class: "ob-prov-body" }, Mt = { class: "ob-prov-name" }, St = { class: "ob-prov-sub" }, $t = ["title"], Et = {
  key: 1,
  class: "ob-block"
}, Pt = {
  key: 2,
  class: "ob-autobar"
}, Tt = { class: "ob-block-head" }, Vt = { class: "ob-classes" }, At = ["title"], It = { class: "ob-class-top" }, Nt = { class: "ob-class-ico" }, Ot = { class: "ob-class-name" }, xt = { class: "ob-foot" }, Dt = ["disabled"], Ft = "kickside-model-provider-openai-compatible", Bt = "wippy.llm.openai_compat:provider", qt = /* @__PURE__ */ xe({
  __name: "Onboard",
  setup(D) {
    const w = Ze(), c = Le(), { adapters: A, presets: F, profiles: r, models: b, classes: v, loading: ye, saving: B, error: I } = c, se = He(() => A.value, () => r.value), g = S("pick"), P = S(null), h = S(null), $ = S(""), C = S(""), M = S(""), T = S(!1), he = f(() => F.value.filter((t) => t.onboarding !== !1)), le = f(() => P.value?.provider_id || Bt), L = S(!1), ae = f(() => ["wippy.llm.claude:provider", "wippy.llm.google.generative_ai:provider"].includes(le.value)), W = f(() => se.adapterFor(le.value)), Y = f(
      () => P.value?.profile_editor_tag || W.value?.profile_editor_tag || Ft
    ), we = f(() => We(Y.value)), Ce = f(() => Ye(Y.value));
    function J(t, e) {
      return (t.capabilities ?? []).some((o) => o.toLowerCase() === e);
    }
    function Me(t) {
      const e = (t.capabilities ?? []).map((o) => o.toLowerCase());
      return e.length > 0 && e.every((o) => o === "embed" || o === "embedding" || o === "embeddings");
    }
    const U = f(() => b.value.filter((t) => t.enabled !== !1 && !Me(t))), ie = f(() => b.value.filter((t) => t.enabled !== !1 && (J(t, "embed") || J(t, "embedding") || J(t, "embeddings")))), Q = f(() => b.value.filter((t) => t.source === "discovered")), R = f(() => v.value.filter((t) => t.declared && t.capability !== "embed")), re = f(() => v.value.filter((t) => t.declared && t.capability === "embed"));
    function z(t) {
      return v.value.find((e) => e.name === t)?.models?.[0]?.name ?? "";
    }
    function de(t) {
      return t.map((e) => ({ label: e.title || e.name, value: e.name }));
    }
    function Se(t) {
      h.value = Q.value.find((e) => e.name === t) ?? null;
    }
    async function $e(t) {
      await c.saveCard(t) && (await c.loadClasses(), await G(!1), h.value = null);
    }
    const ue = f(() => [
      { key: "generate", title: "Default model per capability", classes: R.value, models: U.value },
      { key: "embed", title: "Embeddings", classes: re.value, models: ie.value }
    ].filter((t) => t.classes.length)), X = f(() => et(r.value, b.value, v.value)), j = f(() => X.value !== null);
    function ce() {
      w("done", {
        status: j.value ? "completed" : "skipped",
        model_configured: j.value,
        ...X.value ? { model: X.value } : {}
      });
    }
    function ve() {
      ce();
    }
    function Z(t, e, o = "") {
      const a = Ke(t, e, o);
      C.value = a.message, M.value = a.errorType === "insufficient_credits" ? a.billingUrl ?? "" : "", I.value = "";
    }
    function pe() {
      P.value = null, $.value = "", C.value = "", M.value = "", g.value = "pick";
    }
    function Ee(t) {
      L.value = !1, P.value = t, C.value = "", M.value = "", g.value = "connect";
    }
    function fe() {
      r.value.length ? g.value = "review" : pe();
    }
    async function me(t) {
      if (!T.value) {
        T.value = !0, C.value = "", M.value = "";
        try {
          t.enabled = !0;
          const e = new Set(r.value.map((u) => u.id));
          if ($.value = "Saving connection…", !await c.saveProfile("create", "", t)) {
            Z(I.value || "Could not save the connection.");
            return;
          }
          const a = r.value.find((u) => !e.has(u.id));
          if (a) {
            $.value = "Verifying key and importing models…";
            const u = String(a.provider_id || ""), p = await c.discover(a.id);
            if (await c.loadClasses(), !p.ok) Z(p.message, p.errorType, u);
            else {
              $.value = "Testing the connection…";
              const d = await c.testProfile(a.id, ae.value && L.value);
              d.ok || Z(d.message, d.errorType, u), $.value = "Selecting sensible defaults…", await G(!1);
            }
          }
          g.value = "review";
        } finally {
          T.value = !1, $.value = "";
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
      for (const d of t) d.model && e.set(d.cls, d.model);
      if (!e.size) return;
      const o = new Set(e.keys()), a = /* @__PURE__ */ new Map();
      for (const d of b.value) {
        const _ = new Set(d.class ?? []);
        for (const E of o) _.delete(E);
        a.set(d.name, _);
      }
      for (const [d, _] of e) a.get(_)?.add(d);
      const u = new Set(e.values()), p = [];
      for (const d of b.value) {
        const _ = new Set(d.class ?? []), E = a.get(d.name);
        if (_.size === E.size && [...E].every((oe) => _.has(oe))) continue;
        const N = u.has(d.name) ? 1e3 : Number(d.priority ?? 10);
        p.push(Pe(d, [...E], N));
      }
      p.length && (await c.saveCards(p), await c.loadClasses());
    }
    async function Te(t, e) {
      e && await be([{ cls: t, model: e }]);
    }
    const Ve = /* @__PURE__ */ new Set([
      "wippy.llm.openai:provider",
      "wippy.llm.claude:provider",
      "wippy.llm.google.generative_ai:provider",
      "wippy.llm.google.vertex:provider",
      "wippy.llm.bedrock:provider"
    ]);
    function ee(t) {
      return Ve.has(t.provider_id || "");
    }
    const Ae = /embed|whisper|tts|audio|image|imagen|dall-?e|lyria|veo|sora|music|\baqa\b|moderation|rerank|guard|realtime|transcribe|speech|\bsearch\b|vision-?only/i;
    function q(t) {
      const e = t.pricing, o = Number(e?.completion ?? e?.output ?? e?.prompt ?? 0);
      if (Number.isFinite(o) && o > 0) return o;
      if (t.max_tokens != null) return t.max_tokens / 1e6;
    }
    function te(t, e) {
      return t == null ? e == null ? 0 : -1 : e == null ? 1 : t - e;
    }
    function Ie() {
      const t = U.value.filter((o) => !Ae.test(o.name)), e = t.filter(ee);
      return e.length ? e : t.length ? t : U.value;
    }
    function Ne(t) {
      const e = /* @__PURE__ */ new Map(), o = Ie();
      if (!o.length || !t.length) return e;
      const a = [...o].sort((p, d) => te(q(p), q(d))), u = a.length - 1;
      return t.forEach((p, d) => {
        const _ = o.filter((N) => (N.class ?? []).includes(p.name)).sort((N, oe) => te(q(oe), q(N)));
        if (_.length) {
          e.set(p.name, _[0].name);
          return;
        }
        const E = t.length <= 1 ? u : Math.round(d * u / (t.length - 1));
        e.set(p.name, a[Math.min(E, u)].name);
      }), e;
    }
    function Oe() {
      return [...ie.value].sort((e, o) => (ee(o) ? 1 : 0) - (ee(e) ? 1 : 0) || te(o.dimensions, e.dimensions))[0]?.name || "";
    }
    async function G(t = !1) {
      const e = [], o = Ne(R.value);
      for (const u of R.value) {
        if (!t && z(u.name)) continue;
        const p = o.get(u.name);
        p && e.push({ cls: u.name, model: p });
      }
      const a = Oe();
      for (const u of re.value)
        !t && z(u.name) || a && e.push({ cls: u.name, model: a });
      await be(e);
    }
    return De(async () => {
      await Promise.all([c.load(), c.loadClasses()]), g.value = r.value.length ? "review" : "pick", r.value.length && U.value.length && R.value.every((t) => !z(t.name)) && await G(!1);
    }), (t, e) => (n(), i("div", ot, [
      s(I) && g.value !== "connect" ? (n(), O(s(Ue), {
        key: 0,
        severity: "danger",
        onDismiss: e[0] || (e[0] = (o) => I.value = "")
      }, {
        default: ne(() => [
          H(k(s(I)), 1)
        ]),
        _: 1
      })) : y("", !0),
      s(ye) && !s(r).length && !s(b).length ? (n(), O(s(ge), {
        key: 1,
        label: "Loading…"
      })) : (n(), i(V, { key: 2 }, [
        g.value === "pick" && !j.value ? (n(), i("div", nt, [
          m(s(x), {
            icon: "tabler:brain",
            "aria-hidden": "true"
          }),
          e[7] || (e[7] = l("span", null, [
            l("strong", null, "KickSide works without an AI model, but it is better with one."),
            H(" Recommendations and AI-powered automations will be unavailable until you connect a provider. You can skip this step and finish it later under System → Models.")
          ], -1))
        ])) : y("", !0),
        g.value === "pick" ? (n(), i("section", st, [
          l("div", lt, [
            (n(!0), i(V, null, K(he.value, (o) => (n(), i("button", {
              key: o.id,
              type: "button",
              class: "ob-tile",
              onClick: (a) => Ee(o)
            }, [
              l("span", it, [
                m(s(x), {
                  icon: o.icon || "tabler:plug",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              l("span", rt, k(o.title), 1),
              o.description ? (n(), i("span", dt, k(o.description), 1)) : y("", !0)
            ], 8, at))), 128))
          ]),
          l("div", ut, [
            l("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: e[1] || (e[1] = (o) => s(w)("back", void 0))
            }, "‹ Back"),
            e[8] || (e[8] = l("span", { class: "ob-foot-sp" }, null, -1)),
            s(r).length ? (n(), i("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: e[2] || (e[2] = (o) => g.value = "review")
            }, "Skip — already connected")) : (n(), i("button", {
              key: 1,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: ve
            }, "Skip for now"))
          ])
        ])) : g.value === "connect" ? (n(), i("section", ct, [
          T.value ? (n(), i("div", vt, [
            m(s(ge), {
              label: $.value || "Connecting…"
            }, null, 8, ["label"]),
            e[9] || (e[9] = l("p", { class: "ob-connecting-note" }, "Importing the provider's models — this can take up to a minute. Please don't close this.", -1))
          ])) : (n(), i(V, { key: 1 }, [
            ae.value ? (n(), O(s(Je), {
              key: 0,
              modelValue: L.value,
              "onUpdate:modelValue": e[3] || (e[3] = (o) => L.value = o),
              label: "Test generation with one output token (provider charges may apply)"
            }, null, 8, ["modelValue"])) : y("", !0),
            Ce.value ? (n(), O(Qe, {
              key: 1,
              "spec-key": we.value.key,
              preset: P.value || void 0,
              adapter: W.value || void 0,
              mode: "create",
              saving: T.value,
              onSave: me,
              onCancel: fe
            }, null, 8, ["spec-key", "preset", "adapter", "saving"])) : (n(), O(Re, {
              key: 2,
              tag: Y.value,
              mode: "create",
              preset: P.value || void 0,
              adapter: W.value || void 0,
              saving: T.value,
              onSave: me,
              onCancel: fe
            }, null, 8, ["tag", "preset", "adapter", "saving"])),
            C.value ? (n(), i("div", pt, [
              m(s(x), {
                icon: "tabler:circle-x",
                "aria-hidden": "true"
              }),
              l("span", null, k(C.value), 1),
              M.value ? (n(), i("a", {
                key: 0,
                class: "ob-billing-link",
                href: M.value,
                target: "_blank",
                rel: "noopener noreferrer"
              }, "Add credits", 8, ft)) : y("", !0)
            ])) : y("", !0)
          ], 64))
        ])) : h.value ? (n(), i("section", mt, [
          l("h3", bt, "Configure " + k(h.value.title || h.value.name), 1),
          m(ze, {
            "aria-label": `Configure ${h.value.title || h.value.name}`,
            model: h.value,
            profiles: s(r),
            saving: s(B),
            onSave: $e,
            onCancel: e[4] || (e[4] = (o) => h.value = null)
          }, null, 8, ["aria-label", "model", "profiles", "saving"])
        ])) : (n(), i("section", gt, [
          C.value ? (n(), i("div", _t, [
            m(s(x), {
              icon: "tabler:circle-x",
              "aria-hidden": "true"
            }),
            l("span", null, k(C.value), 1),
            M.value ? (n(), i("a", {
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
            l("div", wt, [
              (n(!0), i(V, null, K(s(r), (o) => (n(), i("div", {
                key: o.id,
                class: "ob-prov"
              }, [
                m(s(Xe), {
                  icon: s(se).providerIcon(o.provider_id, o.id),
                  size: "sm"
                }, null, 8, ["icon"]),
                l("div", Ct, [
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
          Q.value.length ? (n(), i("div", Et, [
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
          ue.value.length ? (n(), i("div", Pt, [
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
          (n(!0), i(V, null, K(ue.value, (o) => (n(), i("div", {
            key: o.key,
            class: "ob-block"
          }, [
            l("div", Tt, [
              l("span", null, k(o.title), 1)
            ]),
            l("div", Vt, [
              (n(!0), i(V, null, K(o.classes, (a) => (n(), i("div", {
                key: a.name,
                class: "ob-class",
                title: a.description || ""
              }, [
                l("div", It, [
                  l("span", Nt, [
                    m(s(x), {
                      icon: a.icon || "tabler:layers-subtract",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  l("span", Ot, k(a.title || a.name), 1)
                ]),
                m(s(_e), {
                  "model-value": z(a.name),
                  options: de(o.models),
                  placeholder: o.models.length ? "Select a model" : "No models yet",
                  "aria-label": `Model for ${a.title || a.name}`,
                  "onUpdate:modelValue": (u) => Te(a.name, u)
                }, null, 8, ["model-value", "options", "placeholder", "aria-label", "onUpdate:modelValue"])
              ], 8, At))), 128))
            ])
          ]))), 128)),
          l("div", xt, [
            l("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: e[6] || (e[6] = (o) => s(w)("back", void 0))
            }, "‹ Back"),
            e[15] || (e[15] = l("span", { class: "ob-foot-sp" }, null, -1)),
            j.value ? (n(), i("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-primary",
              disabled: s(B),
              onClick: ce
            }, "Continue ›", 8, Dt)) : (n(), i("button", {
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
//# sourceMappingURL=Onboard-CIMWaWwu.js.map

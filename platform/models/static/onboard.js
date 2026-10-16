import { a6 as Ee, P as Ne, a7 as Pe, X as $e, J as Ve, Z as de, $ as xe, a0 as Ie, _ as ue, n as Ae, p as Oe, q as Fe, t as Te, F as De, u as Be, a2 as Le, a3 as Re, a4 as Ue } from "./styles-BjS2SxRG.js";
import { defineComponent as ze, ref as A, computed as v, onMounted as Ke, openBlock as n, createElementBlock as l, unref as a, createBlock as R, withCtx as Y, createTextVNode as U, toDisplayString as k, createCommentVNode as E, Fragment as N, createVNode as _, createElementVNode as s, renderList as z, normalizeClass as je } from "vue";
import { Icon as O } from "@iconify/vue";
import { define as qe } from "@wippy-fe/proxy";
const We = () => Ee();
function Ge(P, y, p) {
  const $ = P.filter((u) => u.enabled !== !1 && u.status !== "unhealthy");
  if (!$.length) return null;
  const V = p.find((u) => u.declared && u.name === "fast")?.models?.[0]?.name;
  if (!V) return null;
  const r = y.find((u) => u.name === V && u.enabled !== !1 && !He(u));
  if (!r) return null;
  const b = r.provider_profile_id ? $.find((u) => u.id === r.provider_profile_id) : $.find((u) => !!r.provider_id && u.provider_id === r.provider_id);
  return !b || r.provider_id && r.provider_id !== b.provider_id ? null : {
    class: "fast",
    model: r.name,
    title: r.title || r.name,
    provider_id: r.provider_id || b.provider_id
  };
}
function He(P) {
  const y = (P.capabilities ?? []).map((p) => p.toLowerCase());
  return y.length > 0 && y.every((p) => p === "embed" || p === "embedding" || p === "embeddings");
}
const Je = { class: "ob" }, Xe = {
  key: 0,
  class: "ob-model-warning",
  role: "note"
}, Ye = {
  key: 1,
  class: "ob-stage"
}, Ze = { class: "ob-grid" }, Qe = ["onClick"], et = { class: "ob-tile-ico" }, tt = { class: "ob-tile-name" }, ot = {
  key: 0,
  class: "ob-tile-desc"
}, st = { class: "ob-foot" }, nt = {
  key: 2,
  class: "ob-stage"
}, at = {
  key: 0,
  class: "ob-connecting"
}, lt = {
  key: 2,
  class: "ob-result fail"
}, it = {
  key: 3,
  class: "ob-stage"
}, rt = {
  key: 0,
  class: "ob-result fail"
}, dt = { class: "ob-block" }, ut = { class: "ob-block-head" }, ct = { class: "ob-providers" }, pt = { class: "ob-prov-body" }, vt = { class: "ob-prov-name" }, mt = { class: "ob-prov-sub" }, bt = ["title"], ft = {
  key: 1,
  class: "ob-autobar"
}, gt = { class: "ob-block-head" }, _t = { class: "ob-classes" }, kt = ["title"], yt = { class: "ob-class-top" }, ht = { class: "ob-class-ico" }, Ct = { class: "ob-class-name" }, wt = { class: "ob-foot" }, St = ["disabled"], Mt = "kickside-model-provider-openai-compatible", Et = "wippy.llm.openai_compat:provider", Nt = /* @__PURE__ */ ze({
  __name: "Onboard",
  setup(P) {
    const y = We(), p = Ne(), { adapters: $, presets: V, profiles: r, models: b, classes: u, loading: ce, saving: K, error: x } = p, Z = Be(() => $.value, () => r.value, () => V.value), f = A("pick"), w = A(null), S = A(""), h = A(""), M = A(!1), pe = v(() => V.value.filter((e) => e.onboarding !== !1)), ve = v(() => w.value?.provider_id || Et), j = v(() => Z.adapterFor(ve.value)), q = v(
      () => w.value?.profile_editor_tag || j.value?.profile_editor_tag || Mt
    ), me = v(() => Pe(q.value)), be = v(() => $e(q.value));
    function W(e, t) {
      return (e.capabilities ?? []).some((o) => o.toLowerCase() === t);
    }
    function fe(e) {
      const t = (e.capabilities ?? []).map((o) => o.toLowerCase());
      return t.length > 0 && t.every((o) => o === "embed" || o === "embedding" || o === "embeddings");
    }
    const F = v(() => b.value.filter((e) => e.enabled !== !1 && !fe(e))), Q = v(() => b.value.filter((e) => e.enabled !== !1 && (W(e, "embed") || W(e, "embedding") || W(e, "embeddings")))), T = v(() => u.value.filter((e) => e.declared && e.capability !== "embed")), ee = v(() => u.value.filter((e) => e.declared && e.capability === "embed"));
    function D(e) {
      return u.value.find((t) => t.name === e)?.models?.[0]?.name ?? "";
    }
    function ge(e) {
      return e.map((t) => ({ label: t.title || t.name, value: t.name }));
    }
    const te = v(() => [
      { key: "generate", title: "Default model per capability", classes: T.value, models: F.value },
      { key: "embed", title: "Embeddings", classes: ee.value, models: Q.value }
    ].filter((e) => e.classes.length)), G = v(() => Ge(r.value, b.value, u.value)), B = v(() => G.value !== null);
    function oe() {
      y("done", {
        status: B.value ? "completed" : "skipped",
        model_configured: B.value,
        ...G.value ? { model: G.value } : {}
      });
    }
    function se() {
      oe();
    }
    function ne(e) {
      h.value = e, x.value = "";
    }
    function ae() {
      w.value = null, S.value = "", h.value = "", f.value = "pick";
    }
    function _e(e) {
      w.value = e, h.value = "", f.value = "connect";
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
          if (S.value = "Saving connection…", !await p.saveProfile("create", "", e)) {
            ne(x.value || "Could not save the connection.");
            return;
          }
          const i = r.value.find((d) => !t.has(d.id));
          if (i) {
            S.value = "Verifying key and importing models…";
            const d = await p.discover(i.id);
            await p.loadClasses(), d.ok ? (S.value = "Selecting sensible defaults…", await J(!1)) : ne(d.message);
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
        source: e.source === "registry" ? "overlay" : e.source || "overlay",
        enabled: !0
      };
    }
    async function re(e) {
      const t = /* @__PURE__ */ new Map();
      for (const c of e) c.model && t.set(c.cls, c.model);
      if (!t.size) return;
      const o = new Set(t.keys()), i = /* @__PURE__ */ new Map();
      for (const c of b.value) {
        const g = new Set(c.class ?? []);
        for (const C of o) g.delete(C);
        i.set(c.name, g);
      }
      for (const [c, g] of t) i.get(g)?.add(c);
      const d = new Set(t.values()), m = [];
      for (const c of b.value) {
        const g = new Set(c.class ?? []), C = i.get(c.name);
        if (g.size === C.size && [...C].every((X) => g.has(X))) continue;
        const I = d.has(c.name) ? 1e3 : Number(c.priority ?? 10);
        m.push(ke(c, [...C], I));
      }
      m.length && (await p.saveCards(m), await p.loadClasses());
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
    function H(e) {
      return he.has(e.provider_id || "");
    }
    const Ce = /embed|whisper|tts|audio|image|imagen|dall-?e|lyria|veo|sora|music|\baqa\b|moderation|rerank|guard|realtime|transcribe|speech|\bsearch\b|vision-?only/i;
    function L(e) {
      const t = e.pricing, o = Number(t?.completion ?? t?.output ?? t?.prompt ?? 0);
      return Number.isFinite(o) && o > 0 ? o : (Number(e.max_tokens) || 0) / 1e6;
    }
    function we() {
      const e = F.value.filter((o) => !Ce.test(o.name)), t = e.filter(H);
      return t.length ? t : e.length ? e : F.value;
    }
    function Se(e) {
      const t = /* @__PURE__ */ new Map(), o = we();
      if (!o.length || !e.length) return t;
      const i = [...o].sort((m, c) => L(m) - L(c)), d = i.length - 1;
      return e.forEach((m, c) => {
        const g = o.filter((I) => (I.class ?? []).includes(m.name)).sort((I, X) => L(X) - L(I));
        if (g.length) {
          t.set(m.name, g[0].name);
          return;
        }
        const C = e.length <= 1 ? d : Math.round(c * d / (e.length - 1));
        t.set(m.name, i[Math.min(C, d)].name);
      }), t;
    }
    function Me() {
      return [...Q.value].sort((t, o) => (H(o) ? 1 : 0) - (H(t) ? 1 : 0) || (Number(o.dimensions) || 0) - (Number(t.dimensions) || 0))[0]?.name || "";
    }
    async function J(e = !1) {
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
    return Ke(async () => {
      await Promise.all([p.load(), p.loadClasses()]), f.value = r.value.length ? "review" : "pick", r.value.length && F.value.length && T.value.every((e) => !D(e.name)) && await J(!1);
    }), (e, t) => (n(), l("div", Je, [
      a(x) && f.value !== "connect" ? (n(), R(a(Ve), {
        key: 0,
        severity: "danger",
        onDismiss: t[0] || (t[0] = (o) => x.value = "")
      }, {
        default: Y(() => [
          U(k(a(x)), 1)
        ]),
        _: 1
      })) : E("", !0),
      a(ce) && !a(r).length && !a(b).length ? (n(), R(a(de), {
        key: 1,
        label: "Loading…"
      })) : (n(), l(N, { key: 2 }, [
        f.value === "pick" && !B.value ? (n(), l("div", Xe, [
          _(a(O), {
            icon: "tabler:brain",
            "aria-hidden": "true"
          }),
          t[5] || (t[5] = s("span", null, [
            s("strong", null, "KickSide works without an AI model, but it is better with one."),
            U(" Recommendations and AI-powered automations will be unavailable until you connect a provider. You can skip this step and finish it later under System → Models.")
          ], -1))
        ])) : E("", !0),
        f.value === "pick" ? (n(), l("section", Ye, [
          s("div", Ze, [
            (n(!0), l(N, null, z(pe.value, (o) => (n(), l("button", {
              key: o.id,
              type: "button",
              class: "ob-tile",
              onClick: (i) => _e(o)
            }, [
              s("span", et, [
                _(a(O), {
                  icon: o.icon || "tabler:plug",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              s("span", tt, k(o.title), 1),
              o.description ? (n(), l("span", ot, k(o.description), 1)) : E("", !0)
            ], 8, Qe))), 128))
          ]),
          s("div", st, [
            s("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[1] || (t[1] = (o) => a(y)("back", void 0))
            }, "‹ Back"),
            t[6] || (t[6] = s("span", { class: "ob-foot-sp" }, null, -1)),
            a(r).length ? (n(), l("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[2] || (t[2] = (o) => f.value = "review")
            }, "Skip — already connected")) : (n(), l("button", {
              key: 1,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: se
            }, "Skip for now"))
          ])
        ])) : f.value === "connect" ? (n(), l("section", nt, [
          M.value ? (n(), l("div", at, [
            _(a(de), {
              label: S.value || "Connecting…"
            }, null, 8, ["label"]),
            t[7] || (t[7] = s("p", { class: "ob-connecting-note" }, "Importing the provider's models — this can take up to a minute. Please don't close this.", -1))
          ])) : (n(), l(N, { key: 1 }, [
            be.value ? (n(), R(xe, {
              key: 0,
              "spec-key": me.value.key,
              preset: w.value || void 0,
              adapter: j.value || void 0,
              mode: "create",
              saving: M.value,
              onSave: ie,
              onCancel: le
            }, null, 8, ["spec-key", "preset", "adapter", "saving"])) : (n(), R(Ie, {
              key: 1,
              tag: q.value,
              mode: "create",
              preset: w.value || void 0,
              adapter: j.value || void 0,
              saving: M.value,
              onSave: ie,
              onCancel: le
            }, null, 8, ["tag", "preset", "adapter", "saving"])),
            h.value ? (n(), l("div", lt, [
              _(a(O), {
                icon: "tabler:circle-x",
                "aria-hidden": "true"
              }),
              s("span", null, k(h.value), 1)
            ])) : E("", !0)
          ], 64))
        ])) : (n(), l("section", it, [
          h.value ? (n(), l("div", rt, [
            _(a(O), {
              icon: "tabler:circle-x",
              "aria-hidden": "true"
            }),
            s("span", null, k(h.value), 1)
          ])) : E("", !0),
          s("div", dt, [
            s("div", ut, [
              t[9] || (t[9] = s("span", null, "Connected", -1)),
              _(a(ue), {
                variant: "soft",
                small: "",
                icon: "tabler:plus",
                disabled: a(K),
                onClick: ae
              }, {
                default: Y(() => [...t[8] || (t[8] = [
                  U("Add provider", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ]),
            s("div", ct, [
              (n(!0), l(N, null, z(a(r), (o) => (n(), l("div", {
                key: o.id,
                class: "ob-prov"
              }, [
                _(a(Ae), {
                  icon: a(Z).providerIcon(o.provider_id),
                  size: "sm"
                }, null, 8, ["icon"]),
                s("div", pt, [
                  s("div", vt, k(o.name), 1),
                  s("div", mt, k(a(Oe)(o)), 1)
                ]),
                s("span", {
                  class: je(["ob-dot", a(Te)(o.status)]),
                  title: a(Fe)(o.status)
                }, null, 10, bt)
              ]))), 128))
            ])
          ]),
          te.value.length ? (n(), l("div", ft, [
            t[11] || (t[11] = s("span", { class: "ob-auto-hint" }, "Defaults are picked for you — adjust any below.", -1)),
            _(a(ue), {
              variant: "soft",
              small: "",
              icon: "tabler:wand",
              disabled: a(K),
              onClick: t[3] || (t[3] = (o) => J(!0))
            }, {
              default: Y(() => [...t[10] || (t[10] = [
                U("Auto-select", -1)
              ])]),
              _: 1
            }, 8, ["disabled"])
          ])) : E("", !0),
          (n(!0), l(N, null, z(te.value, (o) => (n(), l("div", {
            key: o.key,
            class: "ob-block"
          }, [
            s("div", gt, [
              s("span", null, k(o.title), 1)
            ]),
            s("div", _t, [
              (n(!0), l(N, null, z(o.classes, (i) => (n(), l("div", {
                key: i.name,
                class: "ob-class",
                title: i.description || ""
              }, [
                s("div", yt, [
                  s("span", ht, [
                    _(a(O), {
                      icon: i.icon || "tabler:layers-subtract",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  s("span", Ct, k(i.title || i.name), 1)
                ]),
                _(a(De), {
                  "model-value": D(i.name),
                  options: ge(o.models),
                  placeholder: o.models.length ? "Select a model" : "No models yet",
                  "aria-label": `Model for ${i.title || i.name}`,
                  "onUpdate:modelValue": (d) => ye(i.name, d)
                }, null, 8, ["model-value", "options", "placeholder", "aria-label", "onUpdate:modelValue"])
              ], 8, kt))), 128))
            ])
          ]))), 128)),
          s("div", wt, [
            s("button", {
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: t[4] || (t[4] = (o) => a(y)("back", void 0))
            }, "‹ Back"),
            t[12] || (t[12] = s("span", { class: "ob-foot-sp" }, null, -1)),
            B.value ? (n(), l("button", {
              key: 0,
              type: "button",
              class: "ob-btn ob-primary",
              disabled: a(K),
              onClick: oe
            }, "Continue ›", 8, St)) : (n(), l("button", {
              key: 1,
              type: "button",
              class: "ob-btn ob-ghost",
              onClick: se
            }, "Skip for now"))
          ])
        ]))
      ], 64))
    ]));
  }
});
class Pt extends Le {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl", "iframeCssUrl"],
      inlineCss: Re
    };
  }
  static get vueConfig() {
    return { rootComponent: Nt, plugins: [Ue] };
  }
}
qe(import.meta.url, Pt);
//# sourceMappingURL=onboard.js.map

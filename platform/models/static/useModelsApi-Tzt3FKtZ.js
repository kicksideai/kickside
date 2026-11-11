import { defineComponent as $, openBlock as k, createBlock as A, unref as E, createElementBlock as w, normalizeClass as F, createVNode as P, createElementVNode as S, renderSlot as O, toDisplayString as V, createCommentVNode as x, ref as u, onMounted as q, watch as I, onBeforeUnmount as j, withDirectives as z, vShow as H } from "vue";
import G from "primevue/select";
import { Icon as U } from "@iconify/vue";
import J from "primevue/progressspinner";
import { loadByTagName as K, api as m } from "@wippy-fe/proxy";
const ce = /* @__PURE__ */ $({
  __name: "SelectField",
  props: {
    modelValue: {},
    options: {},
    ariaLabel: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: s }) {
    const t = s;
    return (c, l) => (k(), A(E(G), {
      class: "km-select",
      "model-value": e.modelValue,
      options: e.options,
      "option-label": "label",
      "option-value": "value",
      "aria-label": e.ariaLabel,
      placeholder: e.placeholder,
      "onUpdate:modelValue": l[0] || (l[0] = (d) => t("update:modelValue", d))
    }, null, 8, ["model-value", "options", "aria-label", "placeholder"]));
  }
}), Q = { class: "km-notice-text" }, ue = /* @__PURE__ */ $({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: s }) {
    const t = s;
    return (c, l) => (k(), w("div", {
      class: F(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      P(E(U), {
        icon: e.severity === "danger" ? "tabler:alert-triangle" : "tabler:info-circle",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      S("span", Q, [
        O(c.$slots, "default")
      ]),
      S("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: l[0] || (l[0] = (d) => t("dismiss"))
      }, [
        P(E(U), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
}), W = { class: "km-loading" }, X = { key: 0 }, de = /* @__PURE__ */ $({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (s, t) => (k(), w("div", W, [
      P(E(J), {
        style: { width: "2rem", height: "2rem", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (k(), w("span", X, V(e.label), 1)) : x("", !0)
    ]));
  }
}), Y = "wippy.llm.openai_compat:provider";
function fe(e) {
  return e === "healthy" ? "success" : e === "unhealthy" ? "danger" : e === "degraded" ? "warn" : "secondary";
}
const Z = {
  healthy: "Healthy",
  unhealthy: "Unhealthy",
  degraded: "Degraded"
};
function me(e) {
  return e && Z[e] || "Unknown";
}
function pe(e) {
  return e === "registry" ? "info" : e === "discovered" ? "success" : e === "overlay" ? "warn" : "secondary";
}
function ve(e) {
  return e === "registry" ? "built-in" : e || "model";
}
function ge(e) {
  return !e || e <= 0 ? "—" : e >= 1e3 ? `${Math.round(e / 1e3)}k` : String(e);
}
function he(e) {
  return e.icon || "tabler:plug";
}
const ee = {
  tools: "tabler:tool",
  tool_use: "tabler:tool",
  function_calling: "tabler:tool",
  vision: "tabler:eye",
  image: "tabler:photo",
  images: "tabler:photo",
  multimodal: "tabler:photo",
  embed: "tabler:vector",
  embedding: "tabler:vector",
  embeddings: "tabler:vector",
  audio: "tabler:microphone",
  speech: "tabler:microphone",
  reasoning: "tabler:bulb",
  thinking: "tabler:bulb"
};
function ye(e) {
  return ee[e.toLowerCase()] || "";
}
function be(e) {
  return e.provider_id === Y;
}
function ke(e) {
  const s = e.config || {};
  return s.base_url || s.region || s.location || "default endpoint";
}
function _e(e) {
  return !!(e.has_api_key || e.has_api_key_env || e.secret_fields?.length);
}
function we(e, s) {
  const t = e.options?.[s];
  return t == null || t === "" ? "" : String(t);
}
function Ce(e, s, t = () => []) {
  const c = (n) => e().find((o) => o.id === n), l = (n) => s().find((o) => o.id === n);
  return {
    adapterFor: c,
    profileFor: l,
    adapterTitle: (n) => c(n)?.title || n || "",
    profileTitle: (n) => l(n)?.name || n || "",
    isDiscoverable: (n) => c(n.provider_id)?.discoverable === !0,
    providerIcon: (n) => {
      if (!n) return "tabler:cpu";
      for (const o of t()) if (o.provider_id === n && o.icon) return o.icon;
      return "tabler:cpu";
    }
  };
}
const te = { class: "km-external-editor" }, ae = {
  key: 0,
  class: "km-empty"
}, re = {
  key: 1,
  class: "km-test-result fail"
}, Se = /* @__PURE__ */ $({
  __name: "ExternalProviderEditor",
  props: {
    tag: {},
    mode: {},
    adapter: {},
    preset: {},
    profile: {},
    saving: { type: Boolean },
    testState: {}
  },
  emits: ["save", "cancel", "test"],
  setup(e, { emit: s }) {
    const t = e, c = s, l = u(null), d = u(!1), n = u("");
    let o = null, v = 0;
    function i(y) {
      c("save", y.detail || {});
    }
    function b() {
      c("cancel");
    }
    function _() {
      c("test");
    }
    function h() {
      o && (o.removeEventListener("save", i), o.removeEventListener("cancel", b), o.removeEventListener("test", _), o.remove(), o = null);
    }
    function L() {
      o && Object.assign(o, {
        mode: t.mode,
        adapter: t.adapter,
        preset: t.preset,
        profile: t.profile,
        saving: t.saving === !0,
        testState: t.testState
      });
    }
    async function g() {
      const y = ++v;
      if (h(), n.value = "", !(!l.value || !t.tag)) {
        d.value = !0;
        try {
          if (await K(t.tag, { timeoutMs: 8e3 }), y !== v || !l.value) return;
          const f = document.createElement(t.tag);
          f.addEventListener("save", i), f.addEventListener("cancel", b), f.addEventListener("test", _), o = f, L(), l.value.replaceChildren(f);
        } catch (f) {
          y === v && (n.value = f instanceof Error ? f.message : String(f));
        } finally {
          y === v && (d.value = !1);
        }
      }
    }
    return q(g), I(() => t.tag, g), I(() => [t.mode, t.adapter, t.preset, t.profile, t.saving, t.testState], L), j(() => {
      v++, h();
    }), (y, f) => (k(), w("div", te, [
      d.value ? (k(), w("div", ae, "Loading provider editor…")) : x("", !0),
      n.value ? (k(), w("div", re, [
        S("span", null, "Provider editor failed to load: " + V(n.value), 1),
        S("button", {
          type: "button",
          class: "km-adv-toggle",
          onClick: g
        }, "Retry")
      ])) : x("", !0),
      z(S("div", {
        ref_key: "host",
        ref: l
      }, null, 512), [
        [H, !d.value && !n.value]
      ])
    ]));
  }
});
function C(e, s) {
  const t = e?.response?.data ?? e?.data;
  return typeof t?.error == "string" && t.error ? t.error : typeof t?.message == "string" && t.message ? t.message : e instanceof Error ? e.message : s;
}
function Le() {
  const e = u([]), s = u([]), t = u([]), c = u([]), l = u([]), d = u(!0), n = u(!1), o = u(""), v = u(""), i = u("");
  let b = 0, _ = 0;
  async function h() {
    const r = ++b;
    d.value = !0, i.value = "";
    try {
      const { data: a } = await m.get("/api/v1/models/admin");
      if (r !== b) return;
      e.value = a.adapters ?? [], s.value = a.presets ?? [], t.value = a.profiles ?? [], c.value = a.models ?? [];
    } catch (a) {
      r === b && (i.value = C(a, "failed to load models"));
    } finally {
      r === b && (d.value = !1);
    }
  }
  async function L() {
    const r = ++_;
    try {
      const { data: a } = await m.get("/api/v1/models/classes");
      r === _ && (l.value = a.classes ?? []);
    } catch {
      r === _ && (l.value = []);
    }
  }
  async function g(r, a) {
    n.value = !0, i.value = "";
    try {
      return await r(), await h(), !0;
    } catch (p) {
      return i.value = C(p, a), !1;
    } finally {
      n.value = !1;
    }
  }
  function y(r, a, p) {
    return g(async () => {
      r === "edit" ? await m.put(`/api/v1/models/provider-profiles/${encodeURIComponent(a)}`, p) : await m.post("/api/v1/models/provider-profiles", p);
    }, "failed to save profile");
  }
  function f(r) {
    return g(() => m.delete(`/api/v1/models/provider-profiles/${encodeURIComponent(r)}`).then(() => {
    }), "failed to delete profile");
  }
  function B(r) {
    return g(() => m.put("/api/v1/models/cards", r).then(() => {
    }), "failed to save model");
  }
  function R(r) {
    return r.length ? g(async () => {
      for (const a of r) await m.put("/api/v1/models/cards", a);
    }, "failed to save models") : Promise.resolve(!0);
  }
  function T(r) {
    return g(() => m.delete(`/api/v1/models/cards?name=${encodeURIComponent(r)}`).then(() => {
    }), "failed to delete model");
  }
  async function M(r) {
    o.value = r, i.value = "";
    try {
      const { data: a } = await m.post(`/api/v1/models/provider-profiles/${encodeURIComponent(r)}/discover`, {});
      return await h(), a && a.success === !1 ? (i.value = a.error || "connection failed", { ok: !1, message: i.value }) : { ok: !0, message: "Connection succeeded" };
    } catch (a) {
      return i.value = C(a, "connection failed"), { ok: !1, message: i.value };
    } finally {
      o.value = "";
    }
  }
  async function D(r) {
    i.value = "";
    try {
      const { data: a } = await m.post(`/api/v1/models/provider-profiles/${encodeURIComponent(r)}/test`, {});
      return await h(), a && a.success === !1 ? (i.value = a.error || "connection test failed", { ok: !1, message: i.value }) : { ok: !0, message: a?.message || "Connection test succeeded" };
    } catch (a) {
      return i.value = C(a, "connection test failed"), await h().catch(() => {
      }), { ok: !1, message: i.value };
    }
  }
  async function N(r) {
    v.value = r, i.value = "";
    try {
      const { data: a } = await m.post("/api/v1/models/cards/test", { name: r });
      if (a && a.success === !1) {
        const p = a.error || a.message || "model probe failed";
        return { ok: !1, message: p, data: { ...a, error: a.error || a.message || p } };
      }
      return { ok: !0, message: "Model works", data: a };
    } catch (a) {
      const p = C(a, "model probe failed");
      return { ok: !1, message: p, data: { success: !1, model: r, error: p } };
    } finally {
      v.value = "";
    }
  }
  return {
    adapters: e,
    presets: s,
    profiles: t,
    models: c,
    classes: l,
    loading: d,
    saving: n,
    discovering: o,
    probing: v,
    error: i,
    load: h,
    loadClasses: L,
    saveProfile: y,
    deleteProfile: f,
    saveCard: B,
    saveCards: R,
    deleteCard: T,
    discover: M,
    testProfile: D,
    testModel: N
  };
}
export {
  ce as _,
  fe as a,
  pe as b,
  ve as c,
  ye as d,
  he as e,
  ge as f,
  ue as g,
  _e as h,
  be as i,
  de as j,
  Se as k,
  Ce as m,
  we as o,
  ke as p,
  me as s,
  Le as u
};
//# sourceMappingURL=useModelsApi-Tzt3FKtZ.js.map

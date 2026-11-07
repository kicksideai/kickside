import { defineComponent as E, openBlock as _, createBlock as F, unref as L, createElementBlock as C, normalizeClass as O, createVNode as P, createElementVNode as w, renderSlot as q, toDisplayString as B, createCommentVNode as x, ref as u, onMounted as j, watch as U, onBeforeUnmount as z, withDirectives as H, vShow as G } from "vue";
import J from "primevue/select";
import { Icon as V } from "@iconify/vue";
import K from "primevue/progressspinner";
import { loadByTagName as Q, api as m } from "@wippy-fe/proxy";
const ue = /* @__PURE__ */ E({
  __name: "SelectField",
  props: {
    modelValue: {},
    options: {},
    ariaLabel: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: s }) {
    const a = s;
    return (c, l) => (_(), F(L(J), {
      class: "km-select",
      "model-value": e.modelValue,
      options: e.options,
      "option-label": "label",
      "option-value": "value",
      "aria-label": e.ariaLabel,
      placeholder: e.placeholder,
      "onUpdate:modelValue": l[0] || (l[0] = (d) => a("update:modelValue", d))
    }, null, 8, ["model-value", "options", "aria-label", "placeholder"]));
  }
}), W = { class: "km-notice-text" }, de = /* @__PURE__ */ E({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: s }) {
    const a = s;
    return (c, l) => (_(), C("div", {
      class: O(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      P(L(V), {
        icon: e.severity === "danger" ? "tabler:alert-triangle" : "tabler:info-circle",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      w("span", W, [
        q(c.$slots, "default")
      ]),
      w("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: l[0] || (l[0] = (d) => a("dismiss"))
      }, [
        P(L(V), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
}), X = { class: "km-loading" }, Y = { key: 0 }, fe = /* @__PURE__ */ E({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (s, a) => (_(), C("div", X, [
      P(L(K), {
        style: { width: "2rem", height: "2rem", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (_(), C("span", Y, B(e.label), 1)) : x("", !0)
    ]));
  }
}), Z = "wippy.llm.openai_compat:provider";
function me(e) {
  return e === "healthy" ? "success" : e === "unhealthy" ? "danger" : e === "degraded" ? "warn" : "secondary";
}
const ee = {
  healthy: "Healthy",
  unhealthy: "Unhealthy",
  degraded: "Degraded"
};
function pe(e) {
  return e && ee[e] || "Unknown";
}
function ve(e) {
  return e === "registry" ? "info" : e === "discovered" ? "success" : e === "overlay" ? "warn" : "secondary";
}
function ge(e) {
  return e === "registry" ? "built-in" : e || "model";
}
function he(e) {
  return !e || e <= 0 ? "—" : e >= 1e3 ? `${Math.round(e / 1e3)}k` : String(e);
}
function ye(e) {
  return e.icon || "tabler:plug";
}
const te = {
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
function be(e) {
  return te[e.toLowerCase()] || "";
}
function _e(e) {
  return e.provider_id === Z;
}
function ke(e) {
  const s = e.config || {};
  return s.base_url || s.region || s.location || "default endpoint";
}
function Ce(e) {
  return !!(e.has_api_key || e.has_api_key_env || e.secret_fields?.length);
}
function Se(e, s) {
  const a = e.options?.[s];
  return a == null || a === "" ? "" : String(a);
}
function we(e, s, a = () => []) {
  const c = (o) => e().find((n) => n.id === o), l = (o) => s().find((n) => n.id === o);
  return {
    adapterFor: c,
    profileFor: l,
    adapterTitle: (o) => c(o)?.title || o || "",
    profileTitle: (o) => l(o)?.name || o || "",
    isDiscoverable: (o) => c(o.provider_id)?.discoverable === !0,
    providerIcon: (o) => {
      if (!o) return "tabler:cpu";
      for (const n of a()) if (n.provider_id === o && n.icon) return n.icon;
      return "tabler:cpu";
    }
  };
}
const ae = { class: "km-external-editor" }, re = {
  key: 0,
  class: "km-empty"
}, oe = {
  key: 1,
  class: "km-test-result fail"
}, $e = /* @__PURE__ */ E({
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
    const a = e, c = s, l = u(null), d = u(!1), o = u("");
    let n = null, v = 0;
    function i(y) {
      c("save", y.detail || {});
    }
    function b() {
      c("cancel");
    }
    function k() {
      c("test");
    }
    function h() {
      n && (n.removeEventListener("save", i), n.removeEventListener("cancel", b), n.removeEventListener("test", k), n.remove(), n = null);
    }
    function $() {
      n && Object.assign(n, {
        mode: a.mode,
        adapter: a.adapter,
        preset: a.preset,
        profile: a.profile,
        saving: a.saving === !0,
        testState: a.testState
      });
    }
    async function g() {
      const y = ++v;
      if (h(), o.value = "", !(!l.value || !a.tag)) {
        d.value = !0;
        try {
          if (await Q(a.tag, { timeoutMs: 8e3 }), y !== v || !l.value) return;
          const f = document.createElement(a.tag);
          f.addEventListener("save", i), f.addEventListener("cancel", b), f.addEventListener("test", k), n = f, $(), l.value.replaceChildren(f);
        } catch (f) {
          y === v && (o.value = f instanceof Error ? f.message : String(f));
        } finally {
          y === v && (d.value = !1);
        }
      }
    }
    return j(g), U(() => a.tag, g), U(() => [a.mode, a.adapter, a.preset, a.profile, a.saving, a.testState], $), z(() => {
      v++, h();
    }), (y, f) => (_(), C("div", ae, [
      d.value ? (_(), C("div", re, "Loading provider editor…")) : x("", !0),
      o.value ? (_(), C("div", oe, [
        w("span", null, "Provider editor failed to load: " + B(o.value), 1),
        w("button", {
          type: "button",
          class: "km-adv-toggle",
          onClick: g
        }, "Retry")
      ])) : x("", !0),
      H(w("div", {
        ref_key: "host",
        ref: l
      }, null, 512), [
        [G, !d.value && !o.value]
      ])
    ]));
  }
});
function S(e, s) {
  const a = e?.response?.data ?? e?.data;
  return typeof a?.error == "string" && a.error ? a.error : typeof a?.message == "string" && a.message ? a.message : e instanceof Error ? e.message : s;
}
function Le() {
  const e = u([]), s = u([]), a = u([]), c = u([]), l = u([]), d = u(!0), o = u(!1), n = u(""), v = u(""), i = u("");
  let b = 0, k = 0;
  async function h() {
    const r = ++b;
    d.value = !0, i.value = "";
    try {
      const { data: t } = await m.get("/api/v1/models/admin");
      if (r !== b) return;
      e.value = t.adapters ?? [], s.value = t.presets ?? [], a.value = t.profiles ?? [], c.value = t.models ?? [];
    } catch (t) {
      r === b && (i.value = S(t, "failed to load models"));
    } finally {
      r === b && (d.value = !1);
    }
  }
  async function $() {
    const r = ++k;
    try {
      const { data: t } = await m.get("/api/v1/models/classes");
      r === k && (l.value = t.classes ?? []);
    } catch {
      r === k && (l.value = []);
    }
  }
  async function g(r, t) {
    o.value = !0, i.value = "";
    try {
      return await r(), await h(), !0;
    } catch (p) {
      return i.value = S(p, t), !1;
    } finally {
      o.value = !1;
    }
  }
  function y(r, t, p) {
    return g(async () => {
      r === "edit" ? await m.put(`/api/v1/models/provider-profiles/${encodeURIComponent(t)}`, p) : await m.post("/api/v1/models/provider-profiles", p);
    }, "failed to save profile");
  }
  function f(r) {
    return g(() => m.delete(`/api/v1/models/provider-profiles/${encodeURIComponent(r)}`).then(() => {
    }), "failed to delete profile");
  }
  function R(r) {
    return g(() => m.put("/api/v1/models/cards", r).then(() => {
    }), "failed to save model");
  }
  function T(r) {
    return r.length ? g(async () => {
      for (const t of r) await m.put("/api/v1/models/cards", t);
    }, "failed to save models") : Promise.resolve(!0);
  }
  function M(r) {
    return g(() => m.delete(`/api/v1/models/cards?name=${encodeURIComponent(r)}`).then(() => {
    }), "failed to delete model");
  }
  async function D(r) {
    n.value = r, i.value = "";
    try {
      const { data: t } = await m.post(`/api/v1/models/provider-profiles/${encodeURIComponent(r)}/discover`, {});
      return await h(), t && t.success === !1 ? (i.value = t.error || "connection failed", { ok: !1, message: i.value }) : { ok: !0, message: "Connection succeeded" };
    } catch (t) {
      return i.value = S(t, "connection failed"), { ok: !1, message: i.value };
    } finally {
      n.value = "";
    }
  }
  async function N(r) {
    i.value = "";
    try {
      const { data: t } = await m.post(`/api/v1/models/provider-profiles/${encodeURIComponent(r)}/test`, {});
      return await h(), t && t.success === !1 ? (i.value = t.error || "connection test failed", { ok: !1, message: i.value }) : { ok: !0, message: t?.message || "Connection test succeeded" };
    } catch (t) {
      return i.value = S(t, "connection test failed"), await h().catch(() => {
      }), { ok: !1, message: i.value };
    }
  }
  async function A(r) {
    v.value = r, i.value = "";
    try {
      const { data: t } = await m.post("/api/v1/models/cards/test", { name: r });
      if (t && t.success === !1) {
        const I = t.error || t.message || "model probe failed";
        return { ok: !1, message: I, data: { ...t, error: t.error || t.message || I } };
      }
      const p = t?.provider_model && t.provider_model !== t?.model ? ` (${t.provider_model})` : "";
      return { ok: !0, message: t?.message ? `${t.message}${p}` : `Model probe succeeded${p}`, data: t };
    } catch (t) {
      const p = S(t, "model probe failed");
      return { ok: !1, message: p, data: { success: !1, model: r, error: p } };
    } finally {
      v.value = "";
    }
  }
  return {
    adapters: e,
    presets: s,
    profiles: a,
    models: c,
    classes: l,
    loading: d,
    saving: o,
    discovering: n,
    probing: v,
    error: i,
    load: h,
    loadClasses: $,
    saveProfile: y,
    deleteProfile: f,
    saveCard: R,
    saveCards: T,
    deleteCard: M,
    discover: D,
    testProfile: N,
    testModel: A
  };
}
export {
  ue as _,
  me as a,
  ve as b,
  ge as c,
  be as d,
  ye as e,
  he as f,
  de as g,
  Ce as h,
  _e as i,
  fe as j,
  $e as k,
  we as m,
  Se as o,
  ke as p,
  pe as s,
  Le as u
};
//# sourceMappingURL=useModelsApi-wu6kB5q-.js.map

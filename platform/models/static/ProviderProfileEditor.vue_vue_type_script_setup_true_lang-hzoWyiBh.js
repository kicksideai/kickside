import { defineComponent as S, computed as b, openBlock as i, createBlock as f, unref as s, withCtx as v, createCommentVNode as k, renderSlot as G, createElementBlock as c, createElementVNode as d, toDisplayString as I, normalizeClass as T, createVNode as r, ref as j, reactive as Y, watch as W, withModifiers as J, Fragment as x, renderList as C, createTextVNode as N } from "vue";
import { Icon as P } from "@iconify/vue";
import { E as q } from "./providerTags-C0mtMONl.js";
import H from "primevue/button";
import "primevue/select";
import X from "primevue/toggleswitch";
import "primevue/tag";
import "primevue/progressspinner";
import "primevue/drawer";
const R = /* @__PURE__ */ S({
  __name: "Button",
  props: {
    icon: {},
    variant: { default: "primary" },
    type: { default: "button" },
    loading: { type: Boolean },
    disabled: { type: Boolean },
    small: { type: Boolean }
  },
  emits: ["click"],
  setup(t, { emit: y }) {
    const l = t, h = y, u = b(
      () => l.variant === "danger" ? "danger" : l.variant === "primary" ? void 0 : "secondary"
    );
    return (m, g) => (i(), f(s(H), {
      type: t.type,
      severity: u.value,
      outlined: t.variant === "ghost",
      loading: t.loading,
      disabled: t.disabled || t.loading,
      size: t.small ? "small" : void 0,
      onClick: g[0] || (g[0] = (A) => h("click"))
    }, {
      default: v(() => [
        t.icon && !t.loading ? (i(), f(s(P), {
          key: 0,
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : k("", !0),
        G(m.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
}), Q = { class: "km-field" }, Z = { class: "km-field-label" }, ee = {
  key: 0,
  class: "km-field-help"
}, _ = /* @__PURE__ */ S({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(t) {
    return (y, l) => (i(), c("label", Q, [
      d("span", Z, I(t.label), 1),
      G(y.$slots, "default"),
      t.help ? (i(), c("small", ee, I(t.help), 1)) : k("", !0)
    ]));
  }
}), te = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], V = /* @__PURE__ */ S({
  __name: "TextInput",
  props: {
    modelValue: {},
    type: { default: "text" },
    placeholder: {},
    readonly: { type: Boolean },
    disabled: { type: Boolean },
    autocomplete: {},
    min: {},
    max: {},
    step: {},
    mono: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(t, { emit: y }) {
    const l = y;
    function h(u) {
      const m = u.target;
      l("update:modelValue", m.value);
    }
    return (u, m) => (i(), c("input", {
      class: T(["km-input", t.mono && "mono"]),
      type: t.type,
      value: t.modelValue,
      placeholder: t.placeholder,
      readonly: t.readonly,
      disabled: t.disabled,
      autocomplete: t.autocomplete,
      min: t.min,
      max: t.max,
      step: t.step,
      onInput: h
    }, null, 42, te));
  }
}), ae = {
  key: 0,
  class: "km-switch-label"
}, le = /* @__PURE__ */ S({
  __name: "Toggle",
  props: {
    modelValue: { type: Boolean },
    label: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(t, { emit: y }) {
    const l = t, h = y, u = b({
      get: () => l.modelValue,
      set: (m) => h("update:modelValue", m)
    });
    return (m, g) => (i(), c("label", {
      class: T(["km-switch", { disabled: t.disabled }])
    }, [
      r(s(X), {
        modelValue: u.value,
        "onUpdate:modelValue": g[0] || (g[0] = (A) => u.value = A),
        disabled: t.disabled
      }, null, 8, ["modelValue", "disabled"]),
      t.label ? (i(), c("span", ae, I(t.label), 1)) : k("", !0)
    ], 2));
  }
}), oe = /* @__PURE__ */ S({
  __name: "Avatar",
  props: {
    icon: {},
    size: { default: "md" }
  },
  setup(t) {
    return (y, l) => (i(), c("span", {
      class: T(["km-avatar", t.size !== "md" && t.size])
    }, [
      r(s(P), {
        icon: t.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 2));
  }
}), B = {
  openai_compat: {
    key: "openai_compat",
    title: "OpenAI Compatible",
    subtitle: "Chat Completions compatible endpoints, including local and hosted providers.",
    defaultProviderId: "wippy.llm.openai_compat:provider",
    icon: "tabler:plug",
    fields: [
      { key: "base_url", label: "Base URL", placeholder: "http://localhost:11434/v1", section: "endpoint", help: "Your endpoint v1 root." },
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0, help: "Optional for local endpoints." },
      { key: "test_model", label: "Test model", placeholder: "gemma-4-12b", section: "advanced", help: "Probe model for Test connection; auto-picked from discovery when blank." },
      { key: "api_key_env", label: "API key env", placeholder: "OPENROUTER_API_KEY", section: "advanced" },
      { key: "organization", label: "Organization", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  openai: {
    key: "openai",
    title: "OpenAI",
    subtitle: "Native OpenAI Responses and embeddings provider.",
    defaultProviderId: "wippy.llm.openai:provider",
    icon: "tabler:brand-openai",
    fields: [
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0 },
      { key: "base_url", label: "Base URL", placeholder: "https://api.openai.com/v1", section: "advanced" },
      { key: "test_model", label: "Test model", placeholder: "gpt-4o-mini", section: "advanced", help: "Probe model for Test connection; auto-picked when blank." },
      { key: "api_key_env", label: "API key env", placeholder: "OPENAI_API_KEY", section: "advanced" },
      { key: "organization", label: "Organization", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  anthropic: {
    key: "anthropic",
    title: "Anthropic",
    subtitle: "Claude Messages API provider with model discovery.",
    defaultProviderId: "wippy.llm.claude:provider",
    icon: "tabler:hexagon-letter-c",
    fields: [
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0 },
      { key: "base_url", label: "Base URL", placeholder: "https://api.anthropic.com", section: "advanced" },
      { key: "api_key_env", label: "API key env", placeholder: "ANTHROPIC_API_KEY", section: "advanced" },
      { key: "api_version", label: "API version", placeholder: "2023-06-01", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  google_genai: {
    key: "google_genai",
    title: "Google Gemini",
    subtitle: "Gemini Developer API using API-key auth and models.list discovery.",
    defaultProviderId: "wippy.llm.google.generative_ai:provider",
    icon: "tabler:brand-google",
    fields: [
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0 },
      { key: "base_url", label: "Base URL", placeholder: "https://generativelanguage.googleapis.com/v1beta/models", section: "advanced" },
      { key: "api_key_env", label: "API key env", placeholder: "GEMINI_API_KEY", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  google_vertex: {
    key: "google_vertex",
    title: "Google Vertex AI",
    subtitle: "Vertex context for explicit model overlays using project, location, and Google credentials.",
    defaultProviderId: "wippy.llm.google.vertex:provider",
    icon: "tabler:cloud",
    fields: [
      { key: "project", label: "Project", placeholder: "my-gcp-project", section: "endpoint", help: "Required unless the service-account JSON has project_id." },
      { key: "location", label: "Location", placeholder: "us-central1", section: "endpoint", help: "Required for Vertex model calls." },
      { key: "google_credentials", label: "Service account JSON/base64", type: "password", section: "auth", secret: !0, help: "Refreshable by the models token supervisor." },
      { key: "project_env", label: "Project env", placeholder: "GOOGLE_CLOUD_PROJECT", section: "advanced" },
      { key: "location_env", label: "Location env", placeholder: "VERTEX_AI_LOCATION", section: "advanced" },
      { key: "google_credentials_env", label: "Credentials env", placeholder: "GOOGLE_CREDENTIALS", section: "advanced", help: "Optional pointer to service-account JSON/base64." },
      { key: "access_token", label: "Access token", type: "password", section: "advanced", secret: !0, help: "For externally rotated tokens only." },
      { key: "access_token_env", label: "Access token env", placeholder: "GOOGLE_ACCESS_TOKEN", section: "advanced", help: "The supervisor does not refresh direct access tokens." },
      { key: "base_url", label: "Base URL override", placeholder: "https://us-central1-aiplatform.googleapis.com/v1", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  bedrock: {
    key: "bedrock",
    title: "AWS Bedrock",
    subtitle: "Bedrock Converse and InvokeModel through AWS SigV4.",
    defaultProviderId: "wippy.llm.bedrock:provider",
    icon: "tabler:brand-aws",
    fields: [
      { key: "region", label: "Region", placeholder: "us-east-1", section: "endpoint" },
      { key: "access_key", label: "Access key", type: "password", section: "auth", secret: !0 },
      { key: "secret_key", label: "Secret key", type: "password", section: "auth", secret: !0 },
      { key: "region_env", label: "Region env", placeholder: "AWS_REGION", section: "advanced" },
      { key: "access_key_env", label: "Access key env", placeholder: "AWS_ACCESS_KEY_ID", section: "advanced" },
      { key: "secret_key_env", label: "Secret key env", placeholder: "AWS_SECRET_ACCESS_KEY", section: "advanced" },
      { key: "session_token", label: "Session token", type: "password", section: "advanced", secret: !0 },
      { key: "session_token_env", label: "Session token env", placeholder: "AWS_SESSION_TOKEN", section: "advanced" },
      { key: "bedrock_provider", label: "Discovery provider filter", placeholder: "Anthropic", section: "advanced" },
      { key: "base_url", label: "Base URL override", placeholder: "https://bedrock.us-east-1.amazonaws.com", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  }
}, L = q;
function ne(t) {
  return t && L[t] || "openai_compat";
}
function Oe(t) {
  return !!(t && L[t]);
}
function xe(t) {
  return B[ne(t)];
}
const se = { class: "km-editor-head" }, ie = { class: "km-editor-head-text" }, de = { class: "km-editor-head-title" }, re = { class: "km-editor-head-sub" }, ce = { class: "km-form-sec" }, ue = { class: "km-form-grid" }, pe = {
  key: 0,
  class: "km-form-sec"
}, me = { class: "km-form-grid" }, ve = {
  key: 1,
  class: "km-form-sec"
}, ye = { class: "km-form-grid" }, be = ["aria-expanded"], ke = {
  key: 2,
  class: "km-form-sec"
}, he = { class: "km-form-grid" }, fe = {
  key: 0,
  class: "km-spin",
  "aria-hidden": "true"
}, ge = { class: "km-form-foot" }, Ce = /* @__PURE__ */ S({
  __name: "ProviderProfileEditor",
  props: {
    mode: {},
    adapter: {},
    preset: {},
    profile: {},
    saving: { type: Boolean },
    testState: {},
    specKey: {}
  },
  emits: ["save", "cancel", "test"],
  setup(t, { emit: y }) {
    const l = t, h = y, u = b(() => B[l.specKey] ?? B.openai_compat), m = b(() => l.mode === "edit"), g = b(() => m.value), A = b(() => l.testState?.status === "testing"), E = b(() => u.value.fields), O = (n) => n.section ?? "endpoint", U = b(() => E.value.filter((n) => O(n) === "endpoint")), $ = b(() => E.value.filter((n) => O(n) === "auth")), F = b(() => E.value.filter((n) => O(n) === "advanced")), w = j(!1), o = Y({
      id: "",
      name: "",
      provider_id: "",
      retry_attempts: 0,
      retry_backoff_ms: 0,
      enabled: !0
    });
    function K(n, a) {
      if (n.secret) return "";
      const e = a[n.key];
      return n.type === "number" ? Number(e || 0) : e || "";
    }
    function z() {
      const n = l.profile?.config || l.preset?.config || {};
      o.id = l.profile?.id || "", o.name = l.profile?.name || l.preset?.title || u.value.title, o.provider_id = l.profile?.provider_id || l.preset?.provider_id || l.adapter?.id || u.value.defaultProviderId, o.retry_attempts = Number(n.retry?.attempts || 0), o.retry_backoff_ms = Number(n.retry?.backoff_ms || 0), o.enabled = l.profile?.enabled !== !1;
      for (const a of E.value) o[a.key] = K(a, n);
    }
    W(() => [l.profile, l.preset, l.adapter, l.mode, l.specKey], z, { immediate: !0 });
    function D(n, a) {
      const e = o[a.key];
      if (a.secret) {
        typeof e == "string" && e.trim() && (n[a.key] = e);
        return;
      }
      if (a.type === "number") {
        const p = Number(e);
        Number.isFinite(p) && p > 0 && (n[a.key] = p);
        return;
      }
      if (typeof e == "string") {
        const p = e.trim();
        p && (n[a.key] = p);
        return;
      }
      e != null && e !== "" && (n[a.key] = e);
    }
    function M() {
      const n = {
        id: o.id || void 0,
        name: o.name,
        provider_id: o.provider_id,
        enabled: o.enabled
      };
      for (const a of E.value) D(n, a);
      n.retry = {
        attempts: Math.max(0, Math.floor(Number(o.retry_attempts) || 0)),
        backoff_ms: Math.max(0, Math.floor(Number(o.retry_backoff_ms) || 0))
      }, h("save", n);
    }
    return (n, a) => (i(), c("form", {
      class: "km-form",
      onSubmit: J(M, ["prevent"])
    }, [
      d("div", se, [
        r(s(oe), {
          icon: u.value.icon
        }, null, 8, ["icon"]),
        d("div", ie, [
          d("div", de, I(l.preset?.title || u.value.title), 1),
          d("div", re, I(u.value.subtitle), 1)
        ])
      ]),
      d("section", ce, [
        a[8] || (a[8] = d("div", { class: "km-form-sec-title" }, "Identity", -1)),
        d("div", ue, [
          r(s(_), { label: "Name" }, {
            default: v(() => [
              r(s(V), {
                modelValue: o.name,
                "onUpdate:modelValue": a[0] || (a[0] = (e) => o.name = e),
                disabled: l.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      U.value.length ? (i(), c("section", pe, [
        a[9] || (a[9] = d("div", { class: "km-form-sec-title" }, "Endpoint", -1)),
        d("div", me, [
          (i(!0), c(x, null, C(U.value, (e) => (i(), f(s(_), {
            key: e.key,
            label: e.label,
            help: e.help
          }, {
            default: v(() => [
              r(s(V), {
                modelValue: o[e.key],
                "onUpdate:modelValue": (p) => o[e.key] = p,
                type: e.type === "number" ? "number" : "text",
                placeholder: e.placeholder,
                disabled: l.saving
              }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "placeholder", "disabled"])
            ]),
            _: 2
          }, 1032, ["label", "help"]))), 128))
        ])
      ])) : k("", !0),
      $.value.length ? (i(), c("section", ve, [
        a[10] || (a[10] = d("div", { class: "km-form-sec-title" }, "Authentication", -1)),
        d("div", ye, [
          (i(!0), c(x, null, C($.value, (e) => (i(), f(s(_), {
            key: e.key,
            label: e.label,
            help: e.help
          }, {
            default: v(() => [
              r(s(V), {
                modelValue: o[e.key],
                "onUpdate:modelValue": (p) => o[e.key] = p,
                type: e.type === "password" ? "password" : "text",
                placeholder: e.placeholder,
                autocomplete: e.secret ? "new-password" : void 0,
                disabled: l.saving
              }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "placeholder", "autocomplete", "disabled"])
            ]),
            _: 2
          }, 1032, ["label", "help"]))), 128))
        ])
      ])) : k("", !0),
      d("button", {
        type: "button",
        class: "km-adv-toggle",
        "aria-expanded": w.value,
        onClick: a[1] || (a[1] = (e) => w.value = !w.value)
      }, [
        r(s(P), {
          icon: w.value ? "tabler:chevron-down" : "tabler:chevron-right",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        a[11] || (a[11] = d("span", null, "Advanced settings", -1))
      ], 8, be),
      w.value ? (i(), c("section", ke, [
        d("div", he, [
          m.value ? k("", !0) : (i(), f(s(_), {
            key: 0,
            label: "ID",
            help: "Optional; generated when left blank."
          }, {
            default: v(() => [
              r(s(V), {
                modelValue: o.id,
                "onUpdate:modelValue": a[2] || (a[2] = (e) => o.id = e),
                disabled: l.saving,
                placeholder: "auto"
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })),
          (i(!0), c(x, null, C(F.value, (e) => (i(), f(s(_), {
            key: e.key,
            label: e.label,
            help: e.help
          }, {
            default: v(() => [
              r(s(V), {
                modelValue: o[e.key],
                "onUpdate:modelValue": (p) => o[e.key] = p,
                type: e.type === "number" ? "number" : e.type === "password" ? "password" : "text",
                placeholder: e.placeholder,
                autocomplete: e.secret ? "new-password" : void 0,
                disabled: l.saving
              }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "placeholder", "autocomplete", "disabled"])
            ]),
            _: 2
          }, 1032, ["label", "help"]))), 128)),
          r(s(_), { label: "Retry attempts" }, {
            default: v(() => [
              r(s(V), {
                modelValue: o.retry_attempts,
                "onUpdate:modelValue": a[3] || (a[3] = (e) => o.retry_attempts = e),
                type: "number",
                min: 0,
                disabled: l.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          r(s(_), { label: "Retry backoff (ms)" }, {
            default: v(() => [
              r(s(V), {
                modelValue: o.retry_backoff_ms,
                "onUpdate:modelValue": a[4] || (a[4] = (e) => o.retry_backoff_ms = e),
                type: "number",
                min: 0,
                disabled: l.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ])) : k("", !0),
      m.value ? (i(), f(s(le), {
        key: 3,
        modelValue: o.enabled,
        "onUpdate:modelValue": a[5] || (a[5] = (e) => o.enabled = e),
        label: "Enabled",
        disabled: l.saving
      }, null, 8, ["modelValue", "disabled"])) : k("", !0),
      l.testState && l.testState.status !== "idle" ? (i(), c("div", {
        key: 4,
        class: T(["km-test-result", l.testState.status])
      }, [
        A.value ? (i(), c("span", fe)) : (i(), f(s(P), {
          key: 1,
          icon: l.testState.status === "ok" ? "tabler:circle-check" : "tabler:circle-x",
          "aria-hidden": "true"
        }, null, 8, ["icon"])),
        d("span", null, I(A.value ? "Testing connection…" : l.testState.message), 1)
      ], 2)) : k("", !0),
      d("div", ge, [
        g.value ? (i(), f(s(R), {
          key: 0,
          variant: "soft",
          icon: "tabler:plug-connected",
          loading: A.value,
          disabled: l.saving,
          onClick: a[6] || (a[6] = (e) => h("test"))
        }, {
          default: v(() => [...a[12] || (a[12] = [
            N(" Test connection ", -1)
          ])]),
          _: 1
        }, 8, ["loading", "disabled"])) : k("", !0),
        a[14] || (a[14] = d("span", { class: "km-form-foot-sp" }, null, -1)),
        r(s(R), {
          variant: "ghost",
          disabled: l.saving,
          onClick: a[7] || (a[7] = (e) => h("cancel"))
        }, {
          default: v(() => [...a[13] || (a[13] = [
            N("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        r(s(R), {
          type: "submit",
          icon: "tabler:device-floppy",
          loading: l.saving
        }, {
          default: v(() => [
            N(I(l.saving ? "Saving" : "Save provider"), 1)
          ]),
          _: 1
        }, 8, ["loading"])
      ])
    ], 32));
  }
});
export {
  R as _,
  oe as a,
  _ as b,
  V as c,
  le as d,
  Ce as e,
  xe as f,
  Oe as i,
  ne as s
};
//# sourceMappingURL=ProviderProfileEditor.vue_vue_type_script_setup_true_lang-hzoWyiBh.js.map

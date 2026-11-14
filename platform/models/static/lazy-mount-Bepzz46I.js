import { P as ze } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as M, openBlock as a, createBlock as w, unref as e, withCtx as k, createVNode as d, createElementBlock as p, Fragment as B, renderList as U, mergeProps as je, createTextVNode as C, toDisplayString as f, createCommentVNode as V, createElementVNode as o, renderSlot as H, getCurrentInstance as qe, computed as y, ref as A, normalizeClass as J, withModifiers as fe, withDirectives as ke, vModelText as ye, createSlots as ge, normalizeStyle as Fe, reactive as $e, toRef as Je, watch as ae } from "vue";
import Ke from "primevue/tab";
import He from "primevue/tablist";
import Ge from "primevue/tabs";
import { host as ue } from "@wippy-fe/proxy";
import { a as Qe } from "./wc-runtime-ClNbKZcC.js";
import { Icon as E } from "@iconify/vue";
import he from "primevue/button";
import "primevue/select";
import "primevue/toggleswitch";
import We from "primevue/tag";
import { p as Xe, h as Ye, s as Ze, a as et, m as ie, o as tt, b as lt, c as st, d as ot, f as Y, _ as W, i as ce, e as me, g as _e, u as at, j as it, k as nt } from "./useModelsApi-Tzt3FKtZ.js";
import rt from "primevue/drawer";
import { _ as ne, a as X, b as O, c as R, d as ve, s as dt, i as ut, e as ct } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-CHCPveNU.js";
import "primevue/progressspinner";
const mt = {
  key: 0,
  class: "kx-system-tab-count"
}, vt = /* @__PURE__ */ M({
  __name: "SystemTabs",
  props: {
    value: {},
    label: {},
    items: {}
  },
  emits: ["update:value"],
  setup(t) {
    return (i, u) => (a(), w(e(Ge), {
      class: "kx-system-tabs",
      "data-kx-separator": "surface",
      value: t.value,
      "onUpdate:value": u[0] || (u[0] = (c) => i.$emit("update:value", String(c)))
    }, {
      default: k(() => [
        d(e(He), {
          pt: { tabList: { "aria-label": t.label } }
        }, {
          default: k(() => [
            (a(!0), p(B, null, U(t.items, (c) => (a(), w(e(Ke), je({
              key: c.value,
              value: c.value
            }, { ref_for: !0 }, c.controls ? { "aria-controls": c.controls } : {}), {
              default: k(() => [
                C(f(c.label), 1),
                c.count !== void 0 ? (a(), p("b", mt, f(c.count), 1)) : V("", !0)
              ]),
              _: 2
            }, 1040, ["value"]))), 128))
          ]),
          _: 1
        }, 8, ["pt"])
      ]),
      _: 1
    }, 8, ["value"]));
  }
}), pt = { class: "kx-shell" }, bt = { class: "kx-rail" }, ft = { class: "kx-main" }, kt = /* @__PURE__ */ M({
  __name: "Shell",
  setup(t) {
    return (i, u) => (a(), p("div", pt, [
      o("aside", bt, [
        H(i.$slots, "rail")
      ]),
      o("main", ft, [
        H(i.$slots, "default")
      ])
    ]));
  }
}), yt = { class: "kx-railhead" }, gt = { class: "kx-railhead-title" }, $t = { key: 0 }, ht = { class: "kx-railhead-acts" }, _t = /* @__PURE__ */ M({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(t) {
    return (i, u) => (a(), p("div", yt, [
      o("span", gt, [
        C(f(t.title), 1),
        t.count !== void 0 ? (a(), p("b", $t, f(t.count), 1)) : V("", !0)
      ]),
      o("div", ht, [
        H(i.$slots, "actions")
      ])
    ]));
  }
}), z = /* @__PURE__ */ M({
  __name: "IconButton",
  props: {
    icon: {},
    label: {},
    active: { type: Boolean },
    disabled: { type: Boolean },
    variant: { default: "plain" },
    severity: {},
    size: { default: "md" },
    spin: { type: Boolean }
  },
  emits: ["click"],
  setup(t, { emit: i }) {
    const u = t, c = i, b = qe(), v = y(
      () => Object.prototype.hasOwnProperty.call(b?.vnode.props ?? {}, "active")
    ), s = y(() => {
      if (u.severity) return u.severity;
      if (u.variant === "danger") return "danger";
      if (u.variant === "bordered") return "secondary";
    }), g = y(
      () => u.size === "sm" ? "small" : u.size === "lg" ? "large" : void 0
    );
    return (h, S) => (a(), w(e(he), {
      severity: s.value,
      text: t.variant !== "bordered" && !t.active,
      outlined: t.variant === "bordered",
      size: g.value,
      loading: t.spin,
      disabled: t.disabled || t.spin,
      pt: {
        root: {
          "aria-label": t.label,
          "aria-pressed": v.value ? String(t.active) : void 0,
          title: t.label
        }
      },
      onClick: S[0] || (S[0] = (_) => c("click"))
    }, {
      icon: k(() => [
        d(e(E), {
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), Vt = { class: "km-search" }, wt = ["value", "placeholder"], Ct = /* @__PURE__ */ M({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: i }) {
    const u = i;
    return (c, b) => (a(), p("div", Vt, [
      d(e(E), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      o("input", {
        class: "km-search-input",
        value: t.modelValue,
        placeholder: t.placeholder || "Search",
        onInput: b[0] || (b[0] = (v) => u("update:modelValue", v.target.value))
      }, null, 40, wt),
      t.modelValue ? (a(), p("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: b[1] || (b[1] = (v) => u("update:modelValue", ""))
      }, [
        d(e(E), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : V("", !0)
    ]));
  }
}), xt = { class: "km-taginput-wrap" }, St = { class: "km-tag-label" }, Pt = ["title", "aria-label", "disabled", "onClick"], Tt = ["placeholder", "disabled"], Dt = {
  key: 0,
  class: "km-tag-sug"
}, Mt = ["disabled", "onClick"], pe = /* @__PURE__ */ M({
  __name: "TagInput",
  props: {
    modelValue: {},
    suggestions: { default: () => [] },
    placeholder: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(t, { emit: i }) {
    const u = t, c = i, b = A(""), v = A(null), s = y(() => {
      const _ = b.value.trim().toLowerCase();
      return u.suggestions.filter((n) => !u.modelValue.includes(n)).filter((n) => !_ || n.toLowerCase().includes(_));
    });
    function g(_) {
      const n = _.trim();
      if (!n || u.modelValue.includes(n)) {
        b.value = "";
        return;
      }
      c("update:modelValue", [...u.modelValue, n]), b.value = "", v.value?.focus();
    }
    function h(_) {
      c("update:modelValue", u.modelValue.filter((n) => n !== _));
    }
    function S(_) {
      _.key === "Enter" || _.key === "," ? (_.preventDefault(), g(b.value || s.value[0] || "")) : _.key === "Backspace" && !b.value && u.modelValue.length && h(u.modelValue[u.modelValue.length - 1]);
    }
    return (_, n) => (a(), p("div", xt, [
      o("div", {
        class: J(["km-taginput", { disabled: t.disabled }]),
        onClick: n[1] || (n[1] = (l) => v.value?.focus())
      }, [
        (a(!0), p(B, null, U(t.modelValue, (l) => (a(), p("span", {
          key: l,
          class: "km-tag"
        }, [
          o("span", St, f(l), 1),
          o("button", {
            type: "button",
            class: "km-tag-x",
            title: `Remove ${l}`,
            "aria-label": `Remove ${l}`,
            disabled: t.disabled,
            onClick: fe((r) => h(l), ["stop"])
          }, [
            d(e(E), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ], 8, Pt)
        ]))), 128)),
        ke(o("input", {
          ref_key: "inputEl",
          ref: v,
          "onUpdate:modelValue": n[0] || (n[0] = (l) => b.value = l),
          class: "km-tag-field",
          type: "text",
          placeholder: t.modelValue.length ? "" : t.placeholder || "Add…",
          disabled: t.disabled,
          spellcheck: "false",
          autocomplete: "off",
          onKeydown: S
        }, null, 40, Tt), [
          [ye, b.value]
        ])
      ], 2),
      s.value.length ? (a(), p("div", Dt, [
        (a(!0), p(B, null, U(s.value, (l) => (a(), p("button", {
          key: l,
          type: "button",
          class: "km-tag-sug-item",
          disabled: t.disabled,
          onClick: (r) => g(l)
        }, [
          d(e(E), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          }),
          C(" " + f(l), 1)
        ], 8, Mt))), 128))
      ])) : V("", !0)
    ]));
  }
}), Et = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, L = /* @__PURE__ */ M({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(t) {
    return (i, u) => (a(), w(e(We), {
      severity: t.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: k(() => [
        t.dot ? (a(), p("span", Et)) : t.icon ? (a(), w(e(E), {
          key: 1,
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : V("", !0),
        H(i.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), Nt = { class: "kx-empty" }, Ot = { class: "kx-empty-ico" }, At = { class: "kx-empty-title" }, Bt = {
  key: 0,
  class: "kx-empty-sub"
}, oe = /* @__PURE__ */ M({
  __name: "EmptyState",
  props: {
    icon: {},
    title: {},
    hint: {},
    cta: {},
    ctaIcon: {}
  },
  emits: ["cta"],
  setup(t) {
    return (i, u) => (a(), p("div", Nt, [
      o("div", Ot, [
        d(e(E), {
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      o("div", At, f(t.title), 1),
      t.hint || i.$slots.hint ? (a(), p("p", Bt, [
        H(i.$slots, "hint", {}, () => [
          C(f(t.hint), 1)
        ])
      ])) : V("", !0),
      t.cta ? (a(), w(e(he), {
        key: 1,
        label: t.cta,
        onClick: u[0] || (u[0] = (c) => i.$emit("cta"))
      }, ge({ _: 2 }, [
        t.ctaIcon ? {
          name: "icon",
          fn: k(({ class: c }) => [
            d(e(E), {
              icon: t.ctaIcon,
              class: J(c),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"])
          ]),
          key: "0"
        } : void 0
      ]), 1032, ["label"])) : V("", !0)
    ]));
  }
}), It = { class: "km-drawer-title" }, Ut = /* @__PURE__ */ M({
  __name: "Drawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {},
    wide: { type: Boolean },
    back: { type: Boolean }
  },
  emits: ["close", "back"],
  setup(t, { emit: i }) {
    const u = t, c = i, b = y(() => u.wide ? "min(720px, calc(100vw - 36px))" : "min(560px, calc(100vw - 36px))");
    function v(s) {
      s || c("close");
    }
    return (s, g) => (a(), w(e(rt), {
      visible: t.open,
      position: "right",
      modal: !0,
      pt: { content: { class: "km-drawer-content" } },
      dismissable: !0,
      "close-on-escape": !0,
      style: Fe({ width: b.value }),
      "aria-label": t.title,
      "onUpdate:visible": v
    }, ge({
      header: k(() => [
        t.back ? (a(), w(z, {
          key: 0,
          icon: "tabler:chevron-left",
          label: "Back",
          onClick: g[0] || (g[0] = (h) => c("back"))
        })) : V("", !0),
        o("span", It, [
          t.icon ? (a(), w(e(E), {
            key: 0,
            icon: t.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : V("", !0),
          C(f(t.title), 1)
        ])
      ]),
      default: k(() => [
        H(s.$slots, "default")
      ]),
      _: 2
    }, [
      s.$slots.footer ? {
        name: "footer",
        fn: k(() => [
          H(s.$slots, "footer")
        ]),
        key: "0"
      } : void 0
    ]), 1032, ["visible", "style", "aria-label"]));
  }
});
function Rt(t) {
  if (!t) return null;
  let i;
  if (typeof t == "number")
    i = t;
  else {
    const u = t.trim();
    if (/^\d+$/.test(u))
      i = Number(u);
    else {
      const c = Date.parse(u);
      return Number.isNaN(c) ? null : c;
    }
  }
  return Number.isFinite(i) ? i < 1e12 ? i * 1e3 : i : null;
}
function Lt(t) {
  const i = Rt(t);
  return i === null ? "" : new Date(i).toLocaleString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
const zt = ["title"], jt = { class: "km-prow-text" }, qt = { class: "km-prow-name" }, Ft = ["title"], Jt = { class: "km-prow-sub" }, Kt = { class: "km-prow-acts" }, Ht = {
  key: 0,
  class: "km-prow-msg"
}, Gt = /* @__PURE__ */ M({
  __name: "ProviderRow",
  props: {
    profile: {},
    providerIcon: {},
    adapterTitle: {},
    selected: { type: Boolean },
    discoverable: { type: Boolean },
    discovering: { type: Boolean },
    busy: { type: Boolean }
  },
  emits: ["select", "edit", "discover", "delete"],
  setup(t, { emit: i }) {
    const u = t, c = i, b = y(() => {
      if (!u.discoverable) return "Automatic model discovery is not available for this provider";
      const v = Lt(u.profile.last_discovered_at);
      return v ? `Discover models (last ${v})` : "Discover models";
    });
    return (v, s) => (a(), p("div", {
      class: J(["km-prow", { on: t.selected }])
    }, [
      o("button", {
        class: "km-prow-main",
        title: e(Xe)(t.profile),
        onClick: s[0] || (s[0] = (g) => c("select"))
      }, [
        d(e(ne), {
          icon: t.providerIcon,
          size: "sm"
        }, null, 8, ["icon"]),
        o("span", jt, [
          o("span", qt, [
            o("span", null, f(t.profile.name), 1),
            e(Ye)(t.profile) ? (a(), w(e(E), {
              key: 0,
              icon: "tabler:key",
              class: "km-prow-cred",
              title: "Credentials stored",
              "aria-hidden": "true"
            })) : V("", !0),
            o("span", {
              class: J(["km-prow-dot", e(et)(t.profile.status)]),
              title: e(Ze)(t.profile.status),
              "aria-hidden": "true"
            }, null, 10, Ft)
          ]),
          o("span", Jt, f(t.adapterTitle), 1)
        ]),
        t.profile.enabled ? V("", !0) : (a(), w(e(L), {
          key: 0,
          severity: "warn"
        }, {
          default: k(() => [...s[4] || (s[4] = [
            C("off", -1)
          ])]),
          _: 1
        }))
      ], 8, zt),
      o("div", Kt, [
        d(e(z), {
          icon: "tabler:radar-2",
          label: b.value,
          size: "sm",
          disabled: !t.discoverable || t.discovering || t.busy,
          spin: t.discovering,
          onClick: s[1] || (s[1] = (g) => c("discover"))
        }, null, 8, ["label", "disabled", "spin"]),
        d(e(z), {
          icon: "tabler:edit",
          label: "Edit provider",
          size: "sm",
          disabled: t.busy,
          onClick: s[2] || (s[2] = (g) => c("edit"))
        }, null, 8, ["disabled"]),
        d(e(z), {
          icon: "tabler:trash",
          label: "Delete provider",
          size: "sm",
          variant: "danger",
          disabled: t.busy,
          onClick: s[3] || (s[3] = (g) => c("delete"))
        }, null, 8, ["disabled"])
      ]),
      t.profile.message ? (a(), p("div", Ht, f(t.profile.message), 1)) : V("", !0)
    ], 2));
  }
}), Qt = { class: "km-plist" }, Wt = {
  key: 0,
  class: "km-plist-empty"
}, Xt = /* @__PURE__ */ M({
  __name: "ProviderList",
  props: {
    profiles: {},
    adapters: {},
    presets: {},
    selectedId: {},
    discovering: {},
    busy: { type: Boolean }
  },
  emits: ["select", "edit", "discover", "delete", "add"],
  setup(t, { emit: i }) {
    const u = t, c = i, b = ie(() => u.adapters, () => u.profiles, () => u.presets);
    return (v, s) => (a(), p("div", Qt, [
      o("button", {
        class: J(["km-plist-all", { on: t.selectedId === "all" }]),
        onClick: s[0] || (s[0] = (g) => c("select", "all"))
      }, " All providers ", 2),
      t.profiles.length ? V("", !0) : (a(), p("div", Wt, [
        s[3] || (s[3] = o("p", null, "No providers connected.", -1)),
        d(e(X), {
          small: "",
          icon: "tabler:plus",
          onClick: s[1] || (s[1] = (g) => c("add"))
        }, {
          default: k(() => [...s[2] || (s[2] = [
            C("Add provider", -1)
          ])]),
          _: 1
        })
      ])),
      (a(!0), p(B, null, U(t.profiles, (g) => (a(), w(Gt, {
        key: g.id,
        profile: g,
        "provider-icon": e(b).providerIcon(g.provider_id),
        "adapter-title": e(b).adapterTitle(g.provider_id),
        selected: t.selectedId === g.id,
        discoverable: e(b).isDiscoverable(g),
        discovering: t.discovering === g.id,
        busy: t.busy,
        onSelect: (h) => c("select", g.id),
        onEdit: (h) => c("edit", g),
        onDiscover: (h) => c("discover", g),
        onDelete: (h) => c("delete", g)
      }, null, 8, ["profile", "provider-icon", "adapter-title", "selected", "discoverable", "discovering", "busy", "onSelect", "onEdit", "onDiscover", "onDelete"]))), 128))
    ]));
  }
}), Yt = { class: "km-mrow-id" }, Zt = { class: "km-mrow-title" }, el = { class: "km-mrow-title-text" }, tl = { class: "km-mrow-sub" }, ll = { class: "km-mrow-prov" }, sl = { class: "km-mrow-mono" }, ol = { class: "km-mrow-tags" }, al = {
  key: 0,
  class: "km-tag-group km-tag-classes"
}, il = { class: "km-tag-group km-tag-caps" }, nl = { class: "km-mrow-limits" }, rl = {
  class: "km-mrow-limit-chips",
  "aria-label": "Token limits"
}, dl = { class: "km-mrow-acts" }, ul = { class: "km-mrow-probe-head" }, cl = { class: "km-mrow-probe-msg" }, ml = {
  key: 0,
  class: "km-probe-time"
}, vl = {
  key: 0,
  class: "km-mrow-probe-body"
}, pl = {
  key: 0,
  class: "km-probe-tokens"
}, bl = {
  key: 1,
  class: "km-probe-out"
}, fl = {
  key: 2,
  class: "km-probe-out"
}, be = 5, kl = /* @__PURE__ */ M({
  __name: "ModelRow",
  props: {
    model: {},
    providerIcon: {},
    providerTitle: {},
    profileTitle: {},
    probing: { type: Boolean },
    probeState: {},
    probeDetailsOpen: { type: Boolean },
    busy: { type: Boolean }
  },
  emits: ["edit", "delete", "probe", "toggle-probe-details", "toggle-enabled"],
  setup(t, { emit: i }) {
    const u = t, c = i, b = y(() => u.model.capabilities ?? []), v = y(() => b.value.slice(0, be)), s = y(() => Math.max(0, b.value.length - be)), g = y(() => b.value.includes("reasoning") || b.value.includes("extended_thinking") || tt(u.model, "reasoning_model_request") === "true"), h = y(() => u.model.enabled !== !1 && (b.value.includes("generate") || b.value.includes("tool_use"))), S = y(() => u.probeState?.model === u.model.name ? u.probeState : null), _ = y(() => S.value?.status || "idle"), n = y(() => _.value === "ok" || _.value === "fail"), l = y(() => _.value === "ok" ? "tabler:circle-check" : _.value === "fail" ? "tabler:circle-x" : "tabler:activity-heartbeat"), r = y(() => {
      if (_.value === "ok") return "success";
      if (_.value === "fail") return "danger";
    }), T = y(() => u.probing ? `Checking ${u.model.title || u.model.name}` : _.value === "ok" ? "Model check succeeded. View details" : _.value === "fail" ? "Model check failed. View details" : "Run model check"), D = y(() => {
      const N = S.value?.data?.tokens;
      if (!N) return [];
      const $ = ["prompt_tokens", "completion_tokens", "total_tokens", "thinking_tokens"], P = /* @__PURE__ */ new Set(), j = [], q = (F) => {
        const Q = N[F];
        typeof Q == "number" && Q > 0 && !P.has(F) && (P.add(F), j.push({ label: F.replace(/_tokens$/, "").replace(/_input$/, "").replace(/_/g, " "), value: Q }));
      };
      return $.forEach(q), Object.keys(N).forEach(q), j;
    });
    function K() {
      n.value ? c("toggle-probe-details") : c("probe");
    }
    return (N, $) => (a(), p("div", {
      class: J(["km-mrow", { "km-mrow-off": t.model.enabled === !1 }])
    }, [
      d(e(ne), { icon: t.providerIcon }, null, 8, ["icon"]),
      o("div", Yt, [
        o("div", Zt, [
          o("span", el, f(t.model.title || t.model.name), 1),
          d(e(L), {
            severity: e(lt)(t.model.source)
          }, {
            default: k(() => [
              C(f(e(st)(t.model.source)), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          t.model.enabled === !1 ? (a(), w(e(L), {
            key: 0,
            severity: "secondary",
            icon: "tabler:ban"
          }, {
            default: k(() => [...$[4] || ($[4] = [
              C("disabled", -1)
            ])]),
            _: 1
          })) : V("", !0)
        ]),
        o("div", tl, [
          o("span", ll, f(t.providerTitle || "—"), 1),
          t.model.provider_profile_id ? (a(), p(B, { key: 0 }, [
            C(" · " + f(t.profileTitle), 1)
          ], 64)) : V("", !0),
          o("span", sl, " · " + f(t.model.name), 1)
        ])
      ]),
      o("div", ol, [
        (t.model.class || []).length ? (a(), p("span", al, [
          (a(!0), p(B, null, U(t.model.class || [], (P) => (a(), w(e(L), {
            key: `k-${P}`,
            severity: "",
            icon: "tabler:category-2"
          }, {
            default: k(() => [
              C(f(P), 1)
            ]),
            _: 2
          }, 1024))), 128))
        ])) : V("", !0),
        o("span", il, [
          g.value ? (a(), w(e(L), {
            key: 0,
            severity: "info",
            icon: "tabler:bulb"
          }, {
            default: k(() => [...$[5] || ($[5] = [
              C("reasoning", -1)
            ])]),
            _: 1
          })) : V("", !0),
          (a(!0), p(B, null, U(v.value, (P) => (a(), w(e(L), {
            key: `c-${P}`,
            severity: "secondary",
            icon: e(ot)(P) || void 0
          }, {
            default: k(() => [
              C(f(P), 1)
            ]),
            _: 2
          }, 1032, ["icon"]))), 128)),
          s.value ? (a(), w(e(L), {
            key: 1,
            severity: "secondary"
          }, {
            default: k(() => [
              C("+" + f(s.value), 1)
            ]),
            _: 1
          })) : V("", !0)
        ])
      ]),
      o("div", nl, [
        o("span", null, [
          o("b", null, f(e(Y)(t.model.max_tokens)), 1),
          $[6] || ($[6] = C(" ctx", -1))
        ]),
        o("span", null, [
          o("b", null, f(e(Y)(t.model.output_tokens)), 1),
          $[7] || ($[7] = C(" out", -1))
        ])
      ]),
      o("div", rl, [
        o("span", null, [
          o("b", null, f(e(Y)(t.model.max_tokens)), 1),
          $[8] || ($[8] = C(" ctx", -1))
        ]),
        o("span", null, [
          o("b", null, f(e(Y)(t.model.output_tokens)), 1),
          $[9] || ($[9] = C(" out", -1))
        ])
      ]),
      o("div", dl, [
        h.value ? (a(), w(e(z), {
          key: 0,
          icon: l.value,
          label: T.value,
          size: "sm",
          variant: "bordered",
          severity: r.value,
          active: n.value && t.probeDetailsOpen,
          spin: t.probing,
          disabled: t.probing || !n.value && t.busy,
          onClick: K
        }, null, 8, ["icon", "label", "severity", "active", "spin", "disabled"])) : V("", !0),
        d(e(z), {
          icon: t.model.enabled === !1 ? "tabler:circle-check" : "tabler:circle-minus",
          label: t.model.enabled === !1 ? "Enable model" : "Disable model",
          size: "sm",
          variant: "bordered",
          disabled: t.busy,
          onClick: $[0] || ($[0] = (P) => c("toggle-enabled"))
        }, null, 8, ["icon", "label", "disabled"]),
        d(e(z), {
          icon: "tabler:adjustments",
          label: "Edit model",
          size: "sm",
          variant: "bordered",
          onClick: $[1] || ($[1] = (P) => c("edit"))
        }),
        t.model.source !== "registry" ? (a(), w(e(z), {
          key: 1,
          icon: "tabler:trash",
          label: "Delete model",
          size: "sm",
          variant: "bordered",
          severity: "danger",
          onClick: $[2] || ($[2] = (P) => c("delete"))
        })) : V("", !0)
      ]),
      t.probeDetailsOpen && n.value ? (a(), p("div", {
        key: 0,
        class: J(["km-mrow-probe", _.value])
      }, [
        o("div", ul, [
          d(e(E), {
            icon: _.value === "ok" ? "tabler:circle-check" : "tabler:circle-x",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          o("span", cl, f(_.value === "ok" ? "Model works" : "Model check failed"), 1),
          S.value?.data && S.value.data.elapsed_ms != null ? (a(), p("span", ml, f(S.value.data.elapsed_ms) + " ms", 1)) : V("", !0),
          d(e(X), {
            icon: "tabler:activity-heartbeat",
            variant: "ghost",
            small: "",
            disabled: t.probing || t.busy,
            onClick: $[3] || ($[3] = (P) => c("probe"))
          }, {
            default: k(() => [...$[10] || ($[10] = [
              C(" Run again ", -1)
            ])]),
            _: 1
          }, 8, ["disabled"])
        ]),
        S.value?.data ? (a(), p("div", vl, [
          D.value.length ? (a(), p("div", pl, [
            $[11] || ($[11] = o("span", { class: "km-probe-tokens-l" }, "Tokens", -1)),
            (a(!0), p(B, null, U(D.value, (P) => (a(), p("span", {
              key: P.label,
              class: "km-probe-tok"
            }, [
              o("b", null, f(P.value), 1),
              C(" " + f(P.label), 1)
            ]))), 128))
          ])) : V("", !0),
          S.value.data.output ? (a(), p("div", bl, [
            $[12] || ($[12] = o("span", null, "Output", -1)),
            o("pre", null, f(S.value.data.output), 1)
          ])) : V("", !0),
          S.value.data.error ? (a(), p("div", fl, [
            $[13] || ($[13] = o("span", null, "Error", -1)),
            o("pre", null, f(S.value.data.error), 1)
          ])) : V("", !0)
        ])) : V("", !0)
      ], 2)) : V("", !0)
    ], 2));
  }
}), se = 120;
function yl(t) {
  const i = $e({
    search: "",
    source: "all",
    capability: "all",
    klass: "all",
    profile: "all",
    provider: "all",
    limit: se
  }), u = y(() => {
    const n = /* @__PURE__ */ new Set();
    for (const l of t.value) for (const r of l.capabilities ?? []) n.add(r);
    return Array.from(n).sort();
  }), c = y(() => {
    const n = /* @__PURE__ */ new Set();
    for (const l of t.value) for (const r of l.class ?? []) n.add(r);
    return Array.from(n).sort();
  }), b = y(() => {
    const n = /* @__PURE__ */ new Set();
    for (const l of t.value) l.provider_id && n.add(l.provider_id);
    return Array.from(n).sort();
  }), v = y(() => {
    const n = i.search.trim().toLowerCase();
    return t.value.filter((l) => i.source !== "all" && l.source !== i.source || i.capability !== "all" && !(l.capabilities ?? []).includes(i.capability) || i.klass !== "all" && !(l.class ?? []).includes(i.klass) || i.profile !== "all" && (l.provider_profile_id || "") !== i.profile || i.provider !== "all" && (l.provider_id || "") !== i.provider ? !1 : n ? [
      l.name,
      l.title,
      l.provider_model,
      l.provider_id,
      l.provider_profile_id,
      ...l.capabilities ?? [],
      ...l.class ?? []
    ].filter(Boolean).some((r) => String(r).toLowerCase().includes(n)) : !0);
  }), s = y(() => v.value.slice(0, i.limit)), g = y(() => s.value.length < v.value.length), h = y(
    () => (i.source !== "all" ? 1 : 0) + (i.capability !== "all" ? 1 : 0) + (i.klass !== "all" ? 1 : 0) + (i.profile !== "all" ? 1 : 0) + (i.provider !== "all" ? 1 : 0) + (i.search.trim() ? 1 : 0)
  );
  function S() {
    i.limit += se;
  }
  function _() {
    i.search = "", i.source = "all", i.capability = "all", i.klass = "all", i.profile = "all", i.provider = "all", i.limit = se;
  }
  return {
    state: i,
    capabilityOptions: u,
    classOptions: c,
    providerOptions: b,
    filtered: v,
    visible: s,
    hasMore: g,
    activeCount: h,
    more: S,
    reset: _
  };
}
const gl = { class: "km-pool kx-system-pane" }, $l = { class: "km-pool-head kx-system-tools" }, hl = { class: "km-pool-head-top" }, _l = { class: "km-pool-title" }, Vl = { class: "km-pool-counts" }, wl = { class: "km-pool-filters" }, Cl = {
  key: 0,
  class: "km-pool-body kx-system-body"
}, xl = {
  key: 1,
  class: "km-pool-body kx-system-body"
}, Sl = {
  key: 2,
  class: "km-pool-table kx-system-body"
}, Pl = {
  key: 0,
  class: "km-pool-more"
}, Tl = /* @__PURE__ */ M({
  __name: "ModelPool",
  props: {
    models: {},
    profiles: {},
    adapters: {},
    presets: {},
    selectedProfileId: {},
    probingModel: {},
    probeState: {},
    probeDetailsModel: {},
    busy: { type: Boolean }
  },
  emits: ["edit", "delete", "probe", "toggle-probe-details", "toggle-enabled", "add"],
  setup(t, { emit: i }) {
    const u = t, c = i, b = ie(() => u.adapters, () => u.profiles, () => u.presets), v = yl(Je(u, "models")), s = [
      { label: "All sources", value: "all" },
      { label: "Built-in", value: "registry" },
      { label: "Discovered", value: "discovered" },
      { label: "Overlay", value: "overlay" }
    ], g = y(() => [
      { label: "All providers", value: "all" },
      ...v.providerOptions.value.map((n) => ({ label: b.adapterTitle(n), value: n }))
    ]), h = y(() => [
      { label: "All capabilities", value: "all" },
      ...v.capabilityOptions.value.map((n) => ({ label: n, value: n }))
    ]), S = y(() => [
      { label: "All classes", value: "all" },
      ...v.classOptions.value.map((n) => ({ label: n, value: n }))
    ]), _ = y(() => {
      let n = 0, l = 0, r = 0;
      for (const T of u.models)
        T.source === "registry" ? n++ : T.source === "discovered" ? l++ : r++;
      return { registry: n, discovered: l, overlay: r };
    });
    return ae(() => u.selectedProfileId, (n) => {
      v.state.profile = n || "all";
    }, { immediate: !0 }), (n, l) => (a(), p("div", gl, [
      o("header", $l, [
        o("div", hl, [
          o("div", _l, [
            l[8] || (l[8] = o("span", null, "Model pool", -1)),
            o("span", Vl, [
              d(e(L), { severity: "info" }, {
                default: k(() => [
                  C(f(_.value.registry) + " built-in", 1)
                ]),
                _: 1
              }),
              d(e(L), { severity: "success" }, {
                default: k(() => [
                  C(f(_.value.discovered) + " discovered", 1)
                ]),
                _: 1
              }),
              d(e(L), { severity: "warn" }, {
                default: k(() => [
                  C(f(_.value.overlay) + " overlay", 1)
                ]),
                _: 1
              })
            ])
          ]),
          d(e(Ct), {
            modelValue: e(v).state.search,
            "onUpdate:modelValue": l[0] || (l[0] = (r) => e(v).state.search = r),
            placeholder: "Search models"
          }, null, 8, ["modelValue"])
        ]),
        o("div", wl, [
          d(e(W), {
            modelValue: e(v).state.source,
            "onUpdate:modelValue": l[1] || (l[1] = (r) => e(v).state.source = r),
            options: s,
            "aria-label": "Source"
          }, null, 8, ["modelValue"]),
          d(e(W), {
            modelValue: e(v).state.provider,
            "onUpdate:modelValue": l[2] || (l[2] = (r) => e(v).state.provider = r),
            options: g.value,
            "aria-label": "Provider"
          }, null, 8, ["modelValue", "options"]),
          d(e(W), {
            modelValue: e(v).state.capability,
            "onUpdate:modelValue": l[3] || (l[3] = (r) => e(v).state.capability = r),
            options: h.value,
            "aria-label": "Capability"
          }, null, 8, ["modelValue", "options"]),
          d(e(W), {
            modelValue: e(v).state.klass,
            "onUpdate:modelValue": l[4] || (l[4] = (r) => e(v).state.klass = r),
            options: S.value,
            "aria-label": "Class"
          }, null, 8, ["modelValue", "options"]),
          e(v).activeCount.value ? (a(), w(e(z), {
            key: 0,
            icon: "tabler:filter-off",
            label: "Clear filters",
            variant: "bordered",
            onClick: l[5] || (l[5] = (r) => e(v).reset())
          })) : V("", !0)
        ])
      ]),
      t.models.length ? e(v).filtered.value.length ? (a(), p("div", Sl, [
        l[9] || (l[9] = o("div", { class: "km-pool-cols" }, [
          o("span"),
          o("span", null, "Model"),
          o("span", null, "Capabilities & classes"),
          o("span", { class: "km-pool-cols-r" }, "Limits"),
          o("span")
        ], -1)),
        (a(!0), p(B, null, U(e(v).visible.value, (r) => (a(), w(kl, {
          key: r.name,
          model: r,
          "provider-icon": e(b).providerIcon(r.provider_id),
          "provider-title": e(b).adapterTitle(r.provider_id),
          "profile-title": e(b).profileTitle(r.provider_profile_id),
          probing: t.probingModel === r.name,
          "probe-state": t.probeState,
          "probe-details-open": t.probeDetailsModel === r.name,
          busy: t.busy,
          onEdit: (T) => c("edit", r),
          onDelete: (T) => c("delete", r),
          onProbe: (T) => c("probe", r),
          onToggleProbeDetails: (T) => c("toggle-probe-details", r),
          onToggleEnabled: (T) => c("toggle-enabled", r)
        }, null, 8, ["model", "provider-icon", "provider-title", "profile-title", "probing", "probe-state", "probe-details-open", "busy", "onEdit", "onDelete", "onProbe", "onToggleProbeDetails", "onToggleEnabled"]))), 128)),
        e(v).hasMore.value ? (a(), p("div", Pl, [
          d(e(X), {
            variant: "ghost",
            icon: "tabler:chevron-down",
            onClick: l[7] || (l[7] = (r) => e(v).more())
          }, {
            default: k(() => [
              C(" Show more (" + f(e(v).filtered.value.length - e(v).visible.value.length) + ") ", 1)
            ]),
            _: 1
          })
        ])) : V("", !0)
      ])) : (a(), p("div", xl, [
        d(e(oe), {
          icon: "tabler:search-off",
          title: "No models match",
          hint: "Adjust the search or filters."
        })
      ])) : (a(), p("div", Cl, [
        d(e(oe), {
          icon: "tabler:cpu",
          title: "No models yet",
          hint: "Connect a provider and discover its models, or add one manually.",
          cta: "Add provider",
          "cta-icon": "tabler:plus",
          onCta: l[6] || (l[6] = (r) => c("add"))
        })
      ]))
    ]));
  }
}), Dl = { class: "km-classes kx-system-pane" }, Ml = {
  key: 0,
  class: "km-pool-body kx-system-body"
}, El = {
  key: 1,
  class: "km-pool-table km-classes-list kx-system-body"
}, Nl = { class: "km-class-head" }, Ol = { class: "km-class-head-text" }, Al = { class: "km-class-title" }, Bl = {
  key: 0,
  class: "km-class-desc"
}, Il = { class: "km-class-meta" }, Ul = { class: "km-class-count" }, Rl = {
  key: 0,
  class: "km-class-members"
}, Ll = {
  key: 1,
  class: "km-class-rank"
}, zl = { class: "km-class-member-name" }, jl = { class: "km-class-member-pri" }, ql = {
  key: 1,
  class: "km-class-empty"
}, Fl = /* @__PURE__ */ M({
  __name: "ModelClasses",
  props: {
    classes: {}
  },
  setup(t) {
    return (i, u) => (a(), p("div", Dl, [
      t.classes.length ? (a(), p("div", El, [
        (a(!0), p(B, null, U(t.classes, (c) => (a(), p("article", {
          key: c.name,
          class: "km-class"
        }, [
          o("div", Nl, [
            d(e(ne), {
              icon: c.icon || "tabler:category",
              size: "sm"
            }, null, 8, ["icon"]),
            o("div", Ol, [
              o("div", Al, f(c.title || c.name), 1),
              c.description ? (a(), p("div", Bl, f(c.description), 1)) : V("", !0)
            ]),
            o("div", Il, [
              o("span", Ul, f(c.models.length) + " model" + f(c.models.length === 1 ? "" : "s"), 1)
            ])
          ]),
          c.models.length ? (a(), p("div", Rl, [
            (a(!0), p(B, null, U(c.models, (b, v) => (a(), p("div", {
              key: b.name,
              class: J(["km-class-member", { top: v === 0 }])
            }, [
              v === 0 ? (a(), w(e(L), {
                key: 0,
                severity: "success",
                icon: "tabler:check"
              }, {
                default: k(() => [...u[0] || (u[0] = [
                  C("active", -1)
                ])]),
                _: 1
              })) : (a(), p("span", Ll, f(v + 1), 1)),
              o("span", zl, f(b.title || b.name), 1),
              o("span", jl, "priority " + f(b.priority ?? 0), 1)
            ], 2))), 128))
          ])) : (a(), p("div", ql, "No models assigned to this class yet."))
        ]))), 128))
      ])) : (a(), p("div", Ml, [
        d(e(oe), {
          icon: "tabler:category-2",
          title: "No model classes",
          hint: "Classes group models by purpose. The highest-priority model in each class is selected automatically."
        })
      ]))
    ]));
  }
}), Jl = { class: "km-picker" }, Kl = {
  key: 0,
  class: "km-picker-sec"
}, Hl = { class: "km-picker-list" }, Gl = ["onClick"], Ql = { class: "km-picker-ico" }, Wl = { class: "km-picker-body" }, Xl = { class: "km-picker-name" }, Yl = { class: "km-picker-desc" }, Zl = {
  key: 1,
  class: "km-picker-sec"
}, es = { class: "km-picker-list" }, ts = ["onClick"], ls = { class: "km-picker-ico" }, ss = { class: "km-picker-body" }, os = { class: "km-picker-name" }, as = { class: "km-picker-desc" }, is = /* @__PURE__ */ M({
  __name: "ProviderPicker",
  props: {
    presets: {}
  },
  emits: ["pick"],
  setup(t, { emit: i }) {
    const u = t, c = i, b = y(() => u.presets.filter((s) => !ce(s))), v = y(() => u.presets.filter(ce));
    return (s, g) => (a(), p("div", Jl, [
      b.value.length ? (a(), p("section", Kl, [
        g[0] || (g[0] = o("div", { class: "km-picker-sec-title" }, "Native providers", -1)),
        o("div", Hl, [
          (a(!0), p(B, null, U(b.value, (h) => (a(), p("button", {
            key: h.id,
            class: "km-picker-item",
            onClick: (S) => c("pick", h)
          }, [
            o("span", Ql, [
              d(e(E), {
                icon: e(me)(h),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            o("span", Wl, [
              o("span", Xl, f(h.title), 1),
              o("span", Yl, f(h.description), 1)
            ]),
            d(e(E), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, Gl))), 128))
        ])
      ])) : V("", !0),
      v.value.length ? (a(), p("section", Zl, [
        g[1] || (g[1] = o("div", { class: "km-picker-sec-title" }, "OpenAI-compatible", -1)),
        o("div", es, [
          (a(!0), p(B, null, U(v.value, (h) => (a(), p("button", {
            key: h.id,
            class: "km-picker-item",
            onClick: (S) => c("pick", h)
          }, [
            o("span", ls, [
              d(e(E), {
                icon: e(me)(h),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            o("span", ss, [
              o("span", os, f(h.title), 1),
              o("span", as, f(h.config?.base_url || h.description), 1)
            ]),
            d(e(E), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, ts))), 128))
        ])
      ])) : V("", !0)
    ]));
  }
}), ns = { class: "km-form-sec" }, rs = { class: "km-form-id" }, ds = { class: "km-form-sec" }, us = { class: "km-form-grid" }, cs = { class: "km-form-sec" }, ms = { class: "km-form-sec" }, vs = { class: "km-form-grid" }, ps = { class: "km-form-grid" }, bs = { class: "km-form-sec" }, fs = {
  key: 0,
  class: "km-adv-body"
}, ks = { class: "km-form-grid" }, ys = ["disabled"], gs = { class: "km-form-foot" }, $s = /* @__PURE__ */ M({
  __name: "ModelEditor",
  props: {
    model: {},
    profiles: {},
    saving: { type: Boolean },
    capabilityOptions: {},
    classOptions: {}
  },
  emits: ["save", "cancel"],
  setup(t, { emit: i }) {
    const u = t, c = i, b = A(""), v = A(!1), s = $e({
      name: "",
      title: "",
      description: "",
      provider_id: "",
      provider_profile_id: "",
      provider_model: "",
      capabilities: [],
      classes: [],
      priority: 10,
      max_tokens: 0,
      output_tokens: 0,
      dimensions: 0,
      reasoning_model_request: !1,
      thinking_effort: "",
      temperature: "",
      options_json: "{}",
      source: "overlay",
      enabled: !0
    });
    ae(() => u.model, (n) => {
      if (b.value = "", v.value = !1, !n) return;
      const l = n.options ?? {};
      s.name = n.name, s.title = n.title || n.name, s.description = n.description || "", s.provider_id = n.provider_id || "", s.provider_profile_id = n.provider_profile_id || "", s.provider_model = n.provider_model || n.name, s.capabilities = [...n.capabilities ?? []], s.classes = [...n.class ?? []], s.priority = Number(n.priority ?? 10), s.max_tokens = Number(n.max_tokens ?? 0), s.output_tokens = Number(n.output_tokens ?? 0), s.dimensions = Number(n.dimensions ?? 0), s.reasoning_model_request = l.reasoning_model_request === !0, s.thinking_effort = typeof l.thinking_effort == "string" || typeof l.thinking_effort == "number" ? l.thinking_effort : "", s.temperature = l.temperature === void 0 ? "" : String(l.temperature), s.options_json = JSON.stringify(l, null, 2), s.source = n.source === "registry" ? "overlay" : n.source || "overlay", s.enabled = n.enabled !== !1;
    }, { immediate: !0 });
    const g = y(() => u.capabilityOptions ?? []), h = y(() => u.classOptions ?? []), S = y(() => [
      { label: "Registry default", value: "" },
      ...u.profiles.map((n) => ({ label: n.name, value: n.id }))
    ]);
    function _() {
      b.value = "";
      let n = {};
      try {
        n = JSON.parse(s.options_json || "{}");
      } catch {
        b.value = "model options JSON is invalid", v.value = !0;
        return;
      }
      s.reasoning_model_request ? n.reasoning_model_request = !0 : delete n.reasoning_model_request;
      const l = String(s.thinking_effort).trim(), r = Number(l);
      if (l === "" || Number.isFinite(r) && r <= 0 ? delete n.thinking_effort : n.thinking_effort = Number.isFinite(r) ? r : l, s.temperature !== "") {
        const T = Number(s.temperature);
        if (!Number.isFinite(T) || T < 0 || T > 2) {
          b.value = "temperature must be between 0 and 2";
          return;
        }
        n.temperature = T;
      } else
        delete n.temperature;
      c("save", {
        name: s.name,
        title: s.title,
        description: s.description,
        provider_id: s.provider_id,
        provider_profile_id: s.provider_profile_id || void 0,
        provider_model: s.provider_model,
        capabilities: [...s.capabilities],
        classes: [...s.classes],
        priority: Number(s.priority),
        max_tokens: Number(s.max_tokens),
        output_tokens: Number(s.output_tokens),
        dimensions: Number(s.dimensions),
        options: n,
        source: s.source,
        enabled: s.enabled
      });
    }
    return (n, l) => (a(), p("form", {
      class: "km-form",
      onSubmit: fe(_, ["prevent"])
    }, [
      b.value ? (a(), w(e(_e), {
        key: 0,
        severity: "danger",
        onDismiss: l[0] || (l[0] = (r) => b.value = "")
      }, {
        default: k(() => [
          C(f(b.value), 1)
        ]),
        _: 1
      })) : V("", !0),
      o("section", ns, [
        l[20] || (l[20] = o("div", { class: "km-form-sec-title" }, "Identity", -1)),
        d(e(O), { label: "Title" }, {
          default: k(() => [
            d(e(R), {
              modelValue: s.title,
              "onUpdate:modelValue": l[1] || (l[1] = (r) => s.title = r),
              disabled: t.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        d(e(O), { label: "Description" }, {
          default: k(() => [
            d(e(R), {
              modelValue: s.description,
              "onUpdate:modelValue": l[2] || (l[2] = (r) => s.description = r),
              disabled: t.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        o("div", rs, f(s.name), 1)
      ]),
      o("section", ds, [
        l[21] || (l[21] = o("div", { class: "km-form-sec-title" }, "Routing", -1)),
        o("div", us, [
          d(e(O), { label: "Provider profile" }, {
            default: k(() => [
              d(e(W), {
                modelValue: s.provider_profile_id,
                "onUpdate:modelValue": l[3] || (l[3] = (r) => s.provider_profile_id = r),
                options: S.value,
                "aria-label": "Provider profile"
              }, null, 8, ["modelValue", "options"])
            ]),
            _: 1
          }),
          d(e(O), { label: "Provider model" }, {
            default: k(() => [
              d(e(R), {
                modelValue: s.provider_model,
                "onUpdate:modelValue": l[4] || (l[4] = (r) => s.provider_model = r),
                disabled: t.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      o("section", cs, [
        l[22] || (l[22] = o("div", { class: "km-form-sec-title" }, "Capabilities & classes", -1)),
        d(e(O), { label: "Capabilities" }, {
          default: k(() => [
            d(e(pe), {
              modelValue: s.capabilities,
              "onUpdate:modelValue": l[5] || (l[5] = (r) => s.capabilities = r),
              suggestions: g.value,
              placeholder: "Add a capability…",
              disabled: t.saving
            }, null, 8, ["modelValue", "suggestions", "disabled"])
          ]),
          _: 1
        }),
        d(e(O), { label: "Classes" }, {
          default: k(() => [
            d(e(pe), {
              modelValue: s.classes,
              "onUpdate:modelValue": l[6] || (l[6] = (r) => s.classes = r),
              suggestions: h.value,
              placeholder: "Add a class…",
              disabled: t.saving
            }, null, 8, ["modelValue", "suggestions", "disabled"])
          ]),
          _: 1
        })
      ]),
      o("section", ms, [
        l[23] || (l[23] = o("div", { class: "km-form-sec-title" }, "Request options", -1)),
        d(e(ve), {
          modelValue: s.reasoning_model_request,
          "onUpdate:modelValue": l[7] || (l[7] = (r) => s.reasoning_model_request = r),
          label: "Reasoning model",
          disabled: t.saving
        }, null, 8, ["modelValue", "disabled"]),
        o("div", vs, [
          d(e(O), { label: "Thinking effort" }, {
            default: k(() => [
              d(e(R), {
                modelValue: s.thinking_effort,
                "onUpdate:modelValue": l[8] || (l[8] = (r) => s.thinking_effort = r),
                disabled: t.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          d(e(O), {
            label: "Temperature",
            help: "0–2; blank to leave unset."
          }, {
            default: k(() => [
              d(e(R), {
                modelValue: s.temperature,
                "onUpdate:modelValue": l[9] || (l[9] = (r) => s.temperature = r),
                type: "number",
                min: 0,
                max: 2,
                step: 0.1,
                disabled: t.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ]),
        o("div", ps, [
          d(e(O), { label: "Context" }, {
            default: k(() => [
              d(e(R), {
                modelValue: s.max_tokens,
                "onUpdate:modelValue": l[10] || (l[10] = (r) => s.max_tokens = r),
                type: "number",
                min: 0,
                disabled: t.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          d(e(O), { label: "Output" }, {
            default: k(() => [
              d(e(R), {
                modelValue: s.output_tokens,
                "onUpdate:modelValue": l[11] || (l[11] = (r) => s.output_tokens = r),
                type: "number",
                min: 0,
                disabled: t.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      o("section", bs, [
        o("button", {
          type: "button",
          class: J(["km-adv-toggle", { open: v.value }]),
          onClick: l[12] || (l[12] = (r) => v.value = !v.value)
        }, [
          d(e(E), {
            icon: "tabler:chevron-right",
            class: "km-adv-chev",
            "aria-hidden": "true"
          }),
          l[24] || (l[24] = C(" Advanced ", -1))
        ], 2),
        v.value ? (a(), p("div", fs, [
          o("div", ks, [
            d(e(O), { label: "Provider id" }, {
              default: k(() => [
                d(e(R), {
                  modelValue: s.provider_id,
                  "onUpdate:modelValue": l[13] || (l[13] = (r) => s.provider_id = r),
                  disabled: t.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            d(e(O), { label: "Source" }, {
              default: k(() => [
                d(e(R), {
                  modelValue: s.source,
                  "onUpdate:modelValue": l[14] || (l[14] = (r) => s.source = r),
                  disabled: t.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            d(e(O), { label: "Priority" }, {
              default: k(() => [
                d(e(R), {
                  modelValue: s.priority,
                  "onUpdate:modelValue": l[15] || (l[15] = (r) => s.priority = r),
                  type: "number",
                  disabled: t.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            d(e(O), { label: "Dimensions" }, {
              default: k(() => [
                d(e(R), {
                  modelValue: s.dimensions,
                  "onUpdate:modelValue": l[16] || (l[16] = (r) => s.dimensions = r),
                  type: "number",
                  min: 0,
                  disabled: t.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            })
          ]),
          d(e(O), {
            label: "Options JSON",
            help: "Raw provider options; merged with the controls above."
          }, {
            default: k(() => [
              ke(o("textarea", {
                "onUpdate:modelValue": l[17] || (l[17] = (r) => s.options_json = r),
                class: "km-input mono km-textarea",
                disabled: t.saving
              }, null, 8, ys), [
                [ye, s.options_json]
              ])
            ]),
            _: 1
          })
        ])) : V("", !0)
      ]),
      d(e(ve), {
        modelValue: s.enabled,
        "onUpdate:modelValue": l[18] || (l[18] = (r) => s.enabled = r),
        label: "Enabled",
        disabled: t.saving
      }, null, 8, ["modelValue", "disabled"]),
      o("div", gs, [
        d(e(X), {
          variant: "ghost",
          disabled: t.saving,
          onClick: l[19] || (l[19] = (r) => c("cancel"))
        }, {
          default: k(() => [...l[25] || (l[25] = [
            C("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        d(e(X), {
          type: "submit",
          icon: "tabler:device-floppy",
          loading: t.saving
        }, {
          default: k(() => [
            C(f(t.saving ? "Saving" : "Save model"), 1)
          ]),
          _: 1
        }, 8, ["loading"])
      ])
    ], 32));
  }
}), hs = { class: "km" }, _s = { class: "kx-rail-body" }, Vs = "kickside-model-provider-openai-compatible", ws = "wippy.llm.openai_compat:provider", Cs = /* @__PURE__ */ M({
  __name: "models",
  setup(t) {
    const i = at(), { adapters: u, presets: c, profiles: b, models: v, classes: s, loading: g, saving: h, discovering: S, probing: _, error: n } = i, l = A("models"), r = ie(() => u.value, () => b.value), T = A("all"), D = A("none"), K = A("create"), N = A(null), $ = A(null), P = A(null), j = A({ status: "idle" }), q = A({ status: "idle" }), F = A("");
    function Q(m) {
      const x = /* @__PURE__ */ new Set();
      for (const I of v.value) for (const Le of m(I) ?? []) x.add(Le);
      return Array.from(x).sort();
    }
    const Ve = y(() => Q((m) => m.capabilities)), we = y(() => {
      const m = /* @__PURE__ */ new Set();
      for (const x of s.value) x.name && m.add(x.name);
      for (const x of v.value) for (const I of x.class ?? []) m.add(I);
      return Array.from(m).sort();
    }), Ce = y(
      () => $.value?.provider_id || N.value?.provider_id || ws
    ), Z = y(() => r.adapterFor(Ce.value)), ee = y(
      () => N.value?.profile_editor_tag || Z.value?.profile_editor_tag || Vs
    ), xe = y(() => dt(ee.value)), Se = y(() => ut(ee.value)), Pe = y(() => D.value !== "none"), te = y(() => D.value === "pick" ? { title: "Add provider", icon: "tabler:plug-connected", back: !1 } : D.value === "provider" ? K.value === "edit" ? { title: $.value?.name || "Edit provider", icon: "tabler:plug-connected", back: !1 } : { title: N.value?.title || "Add provider", icon: "tabler:plug-connected", back: !0 } : D.value === "model" ? { title: P.value?.title || P.value?.name || "Edit model", icon: "tabler:adjustments", back: !1 } : { title: "", icon: "", back: !1 });
    function G() {
      h.value || (D.value = "none", N.value = null, $.value = null, P.value = null, j.value = { status: "idle" });
    }
    function le() {
      K.value = "create", N.value = null, $.value = null, D.value = "pick";
    }
    function Te(m) {
      N.value = m, D.value = "provider";
    }
    function De() {
      N.value = null, D.value = "pick";
    }
    function Me(m) {
      K.value = "edit", N.value = null, $.value = m, j.value = { status: "idle" }, D.value = "provider";
    }
    async function re() {
      if (!$.value) return;
      j.value = { status: "testing" };
      const m = await i.testProfile($.value.id);
      j.value = { status: m.ok ? "ok" : "fail", message: m.message };
    }
    function Ee(m) {
      P.value = m, D.value = "model";
    }
    async function de(m) {
      const x = m?.detail ?? m;
      await i.saveProfile(K.value, $.value?.id || "", x) && G();
    }
    async function Ne(m) {
      await i.saveCard(m) && G();
    }
    function Oe(m) {
      return {
        name: m.name,
        title: m.title || m.name,
        description: m.description || "",
        provider_id: m.provider_id,
        provider_profile_id: m.provider_profile_id || void 0,
        provider_model: m.provider_model || m.name,
        capabilities: [...m.capabilities ?? []],
        classes: [...m.class ?? []],
        priority: Number(m.priority ?? 10),
        max_tokens: Number(m.max_tokens ?? 0),
        output_tokens: Number(m.output_tokens ?? 0),
        dimensions: Number(m.dimensions ?? 0),
        pricing: m.pricing ?? {},
        options: m.options ?? {},
        metadata: m.metadata ?? {},
        source: m.source === "registry" ? "overlay" : m.source || "overlay",
        enabled: m.enabled === !1
      };
    }
    async function Ae(m) {
      await i.saveCard(Oe(m));
    }
    async function Be(m) {
      F.value = "", q.value = { status: "testing", model: m.name, message: `Probing ${m.title || m.name}` };
      const x = await i.testModel(m.name);
      q.value = {
        status: x.ok ? "ok" : "fail",
        model: m.name,
        message: x.message,
        data: x.data
      };
    }
    function Ie(m) {
      q.value.model === m.name && (q.value.status !== "ok" && q.value.status !== "fail" || (F.value = F.value === m.name ? "" : m.name));
    }
    async function Ue(m) {
      await ue.confirm({
        header: "Delete provider",
        message: `Remove “${m.name}”? This cannot be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await i.deleteProfile(m.id);
    }
    async function Re(m) {
      if (m.source === "registry") return;
      const x = m.title || m.name;
      await ue.confirm({
        header: "Delete model",
        message: `Remove “${x}”? This cannot be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await i.deleteCard(m.name);
    }
    return ae(l, (m) => {
      m === "classes" && i.loadClasses();
    }), Qe(async () => {
      await Promise.all([i.load(), i.loadClasses()]);
    }), (m, x) => (a(), p("div", hs, [
      d(vt, {
        value: l.value,
        label: "Model sections",
        items: [
          { value: "models", label: "Models", count: e(v).length },
          { value: "classes", label: "Classes", count: e(s).length }
        ],
        "onUpdate:value": x[0] || (x[0] = (I) => l.value = I)
      }, null, 8, ["value", "items"]),
      e(n) ? (a(), w(e(_e), {
        key: 0,
        severity: "danger",
        class: "km-top-notice",
        onDismiss: x[1] || (x[1] = (I) => n.value = "")
      }, {
        default: k(() => [
          C(f(e(n)), 1)
        ]),
        _: 1
      })) : V("", !0),
      e(g) && !e(v).length && !e(b).length ? (a(), w(e(it), {
        key: 1,
        label: "Loading models…"
      })) : (a(), w(e(kt), { key: 2 }, {
        rail: k(() => [
          d(e(_t), {
            title: "Providers",
            count: e(b).length
          }, {
            actions: k(() => [
              d(e(z), {
                icon: "tabler:plus",
                label: "Add provider",
                disabled: e(h),
                onClick: le
              }, null, 8, ["disabled"]),
              d(e(z), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: e(g),
                spin: e(g),
                onClick: e(i).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          o("div", _s, [
            d(Xt, {
              profiles: e(b),
              adapters: e(u),
              presets: e(c),
              "selected-id": T.value,
              discovering: e(S),
              busy: e(h),
              onSelect: x[2] || (x[2] = (I) => T.value = I),
              onAdd: le,
              onEdit: Me,
              onDiscover: x[3] || (x[3] = (I) => e(i).discover(I.id)),
              onDelete: Ue
            }, null, 8, ["profiles", "adapters", "presets", "selected-id", "discovering", "busy"])
          ])
        ]),
        default: k(() => [
          l.value === "models" ? (a(), w(Tl, {
            key: 0,
            "selected-profile-id": T.value,
            models: e(v),
            profiles: e(b),
            adapters: e(u),
            presets: e(c),
            "probing-model": e(_),
            "probe-state": q.value,
            "probe-details-model": F.value,
            busy: e(h),
            onEdit: Ee,
            onDelete: Re,
            onProbe: Be,
            onToggleProbeDetails: Ie,
            onToggleEnabled: Ae,
            onAdd: le
          }, null, 8, ["selected-profile-id", "models", "profiles", "adapters", "presets", "probing-model", "probe-state", "probe-details-model", "busy"])) : (a(), w(Fl, {
            key: 1,
            classes: e(s)
          }, null, 8, ["classes"]))
        ]),
        _: 1
      })),
      d(e(Ut), {
        open: Pe.value,
        title: te.value.title,
        icon: te.value.icon,
        back: te.value.back,
        onClose: G,
        onBack: De
      }, {
        default: k(() => [
          D.value === "pick" ? (a(), w(is, {
            key: 0,
            presets: e(c),
            onPick: Te
          }, null, 8, ["presets"])) : D.value === "provider" && Se.value ? (a(), w(ct, {
            key: 1,
            "spec-key": xe.value,
            mode: K.value,
            adapter: Z.value || void 0,
            preset: N.value || void 0,
            profile: $.value,
            saving: e(h),
            "test-state": j.value,
            onSave: de,
            onCancel: G,
            onTest: re
          }, null, 8, ["spec-key", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : D.value === "provider" ? (a(), w(nt, {
            key: 2,
            tag: ee.value,
            mode: K.value,
            adapter: Z.value || void 0,
            preset: N.value || void 0,
            profile: $.value,
            saving: e(h),
            "test-state": j.value,
            onSave: de,
            onCancel: G,
            onTest: re
          }, null, 8, ["tag", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : D.value === "model" ? (a(), w($s, {
            key: 3,
            model: P.value,
            profiles: e(b),
            saving: e(h),
            "capability-options": Ve.value,
            "class-options": we.value,
            onSave: Ne,
            onCancel: G
          }, null, 8, ["model", "profiles", "saving", "capability-options", "class-options"])) : V("", !0)
        ]),
        _: 1
      }, 8, ["open", "title", "icon", "back"])
    ]));
  }
}), js = {
  rootComponent: Cs,
  plugins: [ze]
};
export {
  js as mountConfig
};
//# sourceMappingURL=lazy-mount-Bepzz46I.js.map

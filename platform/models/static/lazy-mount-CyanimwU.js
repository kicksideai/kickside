import { P as Le } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as M, openBlock as i, createElementBlock as b, createElementVNode as o, renderSlot as G, createTextVNode as w, toDisplayString as f, createCommentVNode as V, getCurrentInstance as ze, computed as g, createBlock as S, unref as e, withCtx as k, createVNode as d, ref as A, normalizeClass as K, Fragment as I, renderList as z, withModifiers as ke, withDirectives as ge, vModelText as ye, normalizeStyle as je, createSlots as qe, reactive as $e, toRef as Fe, watch as ie } from "vue";
import { host as ue } from "@wippy-fe/proxy";
import { a as Je } from "./wc-runtime-ClNbKZcC.js";
import ce from "primevue/tab";
import Ke from "primevue/tablist";
import He from "primevue/tabs";
import { Icon as O } from "@iconify/vue";
import Ge from "primevue/button";
import "primevue/select";
import "primevue/toggleswitch";
import Qe from "primevue/tag";
import { p as We, h as Xe, s as Ye, a as Ze, m as ae, o as et, b as tt, c as lt, d as st, f as Y, _ as X, i as me, e as ve, g as he, u as ot, j as it, k as at } from "./useModelsApi-Tzt3FKtZ.js";
import nt from "primevue/drawer";
import { _ as Q, a as ne, b as N, c as U, d as pe, s as rt, i as dt, e as ut } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-hzoWyiBh.js";
import "primevue/progressspinner";
const ct = { class: "km-shell" }, mt = { class: "km-rail" }, vt = { class: "km-main" }, pt = /* @__PURE__ */ M({
  __name: "Shell",
  setup(t) {
    return (r, u) => (i(), b("div", ct, [
      o("aside", mt, [
        G(r.$slots, "rail")
      ]),
      o("main", vt, [
        G(r.$slots, "default")
      ])
    ]));
  }
}), bt = { class: "km-railhead" }, ft = { class: "km-railhead-title" }, kt = { key: 0 }, gt = { class: "km-railhead-acts" }, yt = /* @__PURE__ */ M({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(t) {
    return (r, u) => (i(), b("div", bt, [
      o("span", ft, [
        w(f(t.title), 1),
        t.count !== void 0 ? (i(), b("b", kt, f(t.count), 1)) : V("", !0)
      ]),
      o("div", gt, [
        G(r.$slots, "actions")
      ])
    ]));
  }
}), L = /* @__PURE__ */ M({
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
  setup(t, { emit: r }) {
    const u = t, p = r, v = ze(), c = g(
      () => Object.prototype.hasOwnProperty.call(v?.vnode.props ?? {}, "active")
    ), s = g(() => {
      if (u.severity) return u.severity;
      if (u.variant === "danger") return "danger";
      if (u.variant === "bordered") return "secondary";
    }), y = g(
      () => u.size === "sm" ? "small" : u.size === "lg" ? "large" : void 0
    );
    return (h, P) => (i(), S(e(Ge), {
      severity: s.value,
      text: t.variant !== "bordered" && !t.active,
      outlined: t.variant === "bordered",
      size: y.value,
      loading: t.spin,
      disabled: t.disabled || t.spin,
      pt: {
        root: {
          "aria-label": t.label,
          "aria-pressed": c.value ? String(t.active) : void 0,
          title: t.label
        }
      },
      onClick: P[0] || (P[0] = (_) => p("click"))
    }, {
      icon: k(() => [
        d(e(O), {
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), $t = { class: "km-search" }, ht = ["value", "placeholder"], _t = /* @__PURE__ */ M({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: r }) {
    const u = r;
    return (p, v) => (i(), b("div", $t, [
      d(e(O), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      o("input", {
        class: "km-search-input",
        value: t.modelValue,
        placeholder: t.placeholder || "Search",
        onInput: v[0] || (v[0] = (c) => u("update:modelValue", c.target.value))
      }, null, 40, ht),
      t.modelValue ? (i(), b("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: v[1] || (v[1] = (c) => u("update:modelValue", ""))
      }, [
        d(e(O), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : V("", !0)
    ]));
  }
}), Vt = { class: "km-taginput-wrap" }, wt = { class: "km-tag-label" }, Ct = ["title", "aria-label", "disabled", "onClick"], St = ["placeholder", "disabled"], Pt = {
  key: 0,
  class: "km-tag-sug"
}, xt = ["disabled", "onClick"], be = /* @__PURE__ */ M({
  __name: "TagInput",
  props: {
    modelValue: {},
    suggestions: { default: () => [] },
    placeholder: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(t, { emit: r }) {
    const u = t, p = r, v = A(""), c = A(null), s = g(() => {
      const _ = v.value.trim().toLowerCase();
      return u.suggestions.filter((a) => !u.modelValue.includes(a)).filter((a) => !_ || a.toLowerCase().includes(_));
    });
    function y(_) {
      const a = _.trim();
      if (!a || u.modelValue.includes(a)) {
        v.value = "";
        return;
      }
      p("update:modelValue", [...u.modelValue, a]), v.value = "", c.value?.focus();
    }
    function h(_) {
      p("update:modelValue", u.modelValue.filter((a) => a !== _));
    }
    function P(_) {
      _.key === "Enter" || _.key === "," ? (_.preventDefault(), y(v.value || s.value[0] || "")) : _.key === "Backspace" && !v.value && u.modelValue.length && h(u.modelValue[u.modelValue.length - 1]);
    }
    return (_, a) => (i(), b("div", Vt, [
      o("div", {
        class: K(["km-taginput", { disabled: t.disabled }]),
        onClick: a[1] || (a[1] = (l) => c.value?.focus())
      }, [
        (i(!0), b(I, null, z(t.modelValue, (l) => (i(), b("span", {
          key: l,
          class: "km-tag"
        }, [
          o("span", wt, f(l), 1),
          o("button", {
            type: "button",
            class: "km-tag-x",
            title: `Remove ${l}`,
            "aria-label": `Remove ${l}`,
            disabled: t.disabled,
            onClick: ke((n) => h(l), ["stop"])
          }, [
            d(e(O), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ], 8, Ct)
        ]))), 128)),
        ge(o("input", {
          ref_key: "inputEl",
          ref: c,
          "onUpdate:modelValue": a[0] || (a[0] = (l) => v.value = l),
          class: "km-tag-field",
          type: "text",
          placeholder: t.modelValue.length ? "" : t.placeholder || "Add…",
          disabled: t.disabled,
          spellcheck: "false",
          autocomplete: "off",
          onKeydown: P
        }, null, 40, St), [
          [ye, v.value]
        ])
      ], 2),
      s.value.length ? (i(), b("div", Pt, [
        (i(!0), b(I, null, z(s.value, (l) => (i(), b("button", {
          key: l,
          type: "button",
          class: "km-tag-sug-item",
          disabled: t.disabled,
          onClick: (n) => y(l)
        }, [
          d(e(O), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          }),
          w(" " + f(l), 1)
        ], 8, xt))), 128))
      ])) : V("", !0)
    ]));
  }
}), Tt = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, R = /* @__PURE__ */ M({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(t) {
    return (r, u) => (i(), S(e(Qe), {
      severity: t.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: k(() => [
        t.dot ? (i(), b("span", Tt)) : t.icon ? (i(), S(e(O), {
          key: 1,
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : V("", !0),
        G(r.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), Dt = { class: "km-empty" }, Mt = { class: "km-empty-title" }, Et = {
  key: 0,
  class: "km-empty-hint"
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
  setup(t, { emit: r }) {
    const u = r;
    return (p, v) => (i(), b("div", Dt, [
      d(e(O), {
        icon: t.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      o("div", Mt, f(t.title), 1),
      t.hint ? (i(), b("p", Et, f(t.hint), 1)) : V("", !0),
      t.cta ? (i(), S(Q, {
        key: 1,
        icon: t.ctaIcon,
        onClick: v[0] || (v[0] = (c) => u("cta"))
      }, {
        default: k(() => [
          w(f(t.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : V("", !0)
    ]));
  }
}), Nt = { class: "km-drawer-title" }, Ot = /* @__PURE__ */ M({
  __name: "Drawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {},
    wide: { type: Boolean },
    back: { type: Boolean }
  },
  emits: ["close", "back"],
  setup(t, { emit: r }) {
    const u = t, p = r, v = g(() => u.wide ? "min(720px, calc(100vw - 36px))" : "min(560px, calc(100vw - 36px))");
    function c(s) {
      s || p("close");
    }
    return (s, y) => (i(), S(e(nt), {
      visible: t.open,
      position: "right",
      modal: !0,
      pt: { content: { class: "km-drawer-content" } },
      dismissable: !0,
      "close-on-escape": !0,
      style: je({ width: v.value }),
      "aria-label": t.title,
      "onUpdate:visible": c
    }, qe({
      header: k(() => [
        t.back ? (i(), S(L, {
          key: 0,
          icon: "tabler:chevron-left",
          label: "Back",
          onClick: y[0] || (y[0] = (h) => p("back"))
        })) : V("", !0),
        o("span", Nt, [
          t.icon ? (i(), S(e(O), {
            key: 0,
            icon: t.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : V("", !0),
          w(f(t.title), 1)
        ])
      ]),
      default: k(() => [
        G(s.$slots, "default")
      ]),
      _: 2
    }, [
      s.$slots.footer ? {
        name: "footer",
        fn: k(() => [
          G(s.$slots, "footer")
        ]),
        key: "0"
      } : void 0
    ]), 1032, ["visible", "style", "aria-label"]));
  }
});
function At(t) {
  if (!t) return null;
  let r;
  if (typeof t == "number")
    r = t;
  else {
    const u = t.trim();
    if (/^\d+$/.test(u))
      r = Number(u);
    else {
      const p = Date.parse(u);
      return Number.isNaN(p) ? null : p;
    }
  }
  return Number.isFinite(r) ? r < 1e12 ? r * 1e3 : r : null;
}
function Bt(t) {
  const r = At(t);
  return r === null ? "" : new Date(r).toLocaleString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
const It = ["title"], Ut = { class: "km-prow-text" }, Rt = { class: "km-prow-name" }, Lt = ["title"], zt = { class: "km-prow-sub" }, jt = { class: "km-prow-acts" }, qt = {
  key: 0,
  class: "km-prow-msg"
}, Ft = /* @__PURE__ */ M({
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
  setup(t, { emit: r }) {
    const u = t, p = r, v = g(() => {
      if (!u.discoverable) return "Automatic model discovery is not available for this provider";
      const c = Bt(u.profile.last_discovered_at);
      return c ? `Discover models (last ${c})` : "Discover models";
    });
    return (c, s) => (i(), b("div", {
      class: K(["km-prow", { on: t.selected }])
    }, [
      o("button", {
        class: "km-prow-main",
        title: e(We)(t.profile),
        onClick: s[0] || (s[0] = (y) => p("select"))
      }, [
        d(e(ne), {
          icon: t.providerIcon,
          size: "sm"
        }, null, 8, ["icon"]),
        o("span", Ut, [
          o("span", Rt, [
            o("span", null, f(t.profile.name), 1),
            e(Xe)(t.profile) ? (i(), S(e(O), {
              key: 0,
              icon: "tabler:key",
              class: "km-prow-cred",
              title: "Credentials stored",
              "aria-hidden": "true"
            })) : V("", !0),
            o("span", {
              class: K(["km-prow-dot", e(Ze)(t.profile.status)]),
              title: e(Ye)(t.profile.status),
              "aria-hidden": "true"
            }, null, 10, Lt)
          ]),
          o("span", zt, f(t.adapterTitle), 1)
        ]),
        t.profile.enabled ? V("", !0) : (i(), S(e(R), {
          key: 0,
          severity: "warn"
        }, {
          default: k(() => [...s[4] || (s[4] = [
            w("off", -1)
          ])]),
          _: 1
        }))
      ], 8, It),
      o("div", jt, [
        d(e(L), {
          icon: "tabler:radar-2",
          label: v.value,
          size: "sm",
          disabled: !t.discoverable || t.discovering || t.busy,
          spin: t.discovering,
          onClick: s[1] || (s[1] = (y) => p("discover"))
        }, null, 8, ["label", "disabled", "spin"]),
        d(e(L), {
          icon: "tabler:edit",
          label: "Edit provider",
          size: "sm",
          disabled: t.busy,
          onClick: s[2] || (s[2] = (y) => p("edit"))
        }, null, 8, ["disabled"]),
        d(e(L), {
          icon: "tabler:trash",
          label: "Delete provider",
          size: "sm",
          variant: "danger",
          disabled: t.busy,
          onClick: s[3] || (s[3] = (y) => p("delete"))
        }, null, 8, ["disabled"])
      ]),
      t.profile.message ? (i(), b("div", qt, f(t.profile.message), 1)) : V("", !0)
    ], 2));
  }
}), Jt = { class: "km-plist" }, Kt = {
  key: 0,
  class: "km-plist-empty"
}, Ht = /* @__PURE__ */ M({
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
  setup(t, { emit: r }) {
    const u = t, p = r, v = ae(() => u.adapters, () => u.profiles, () => u.presets);
    return (c, s) => (i(), b("div", Jt, [
      o("button", {
        class: K(["km-plist-all", { on: t.selectedId === "all" }]),
        onClick: s[0] || (s[0] = (y) => p("select", "all"))
      }, " All providers ", 2),
      t.profiles.length ? V("", !0) : (i(), b("div", Kt, [
        s[3] || (s[3] = o("p", null, "No providers connected.", -1)),
        d(e(Q), {
          small: "",
          icon: "tabler:plus",
          onClick: s[1] || (s[1] = (y) => p("add"))
        }, {
          default: k(() => [...s[2] || (s[2] = [
            w("Add provider", -1)
          ])]),
          _: 1
        })
      ])),
      (i(!0), b(I, null, z(t.profiles, (y) => (i(), S(Ft, {
        key: y.id,
        profile: y,
        "provider-icon": e(v).providerIcon(y.provider_id),
        "adapter-title": e(v).adapterTitle(y.provider_id),
        selected: t.selectedId === y.id,
        discoverable: e(v).isDiscoverable(y),
        discovering: t.discovering === y.id,
        busy: t.busy,
        onSelect: (h) => p("select", y.id),
        onEdit: (h) => p("edit", y),
        onDiscover: (h) => p("discover", y),
        onDelete: (h) => p("delete", y)
      }, null, 8, ["profile", "provider-icon", "adapter-title", "selected", "discoverable", "discovering", "busy", "onSelect", "onEdit", "onDiscover", "onDelete"]))), 128))
    ]));
  }
}), Gt = { class: "km-mrow-id" }, Qt = { class: "km-mrow-title" }, Wt = { class: "km-mrow-title-text" }, Xt = { class: "km-mrow-sub" }, Yt = { class: "km-mrow-prov" }, Zt = { class: "km-mrow-mono" }, el = { class: "km-mrow-tags" }, tl = {
  key: 0,
  class: "km-tag-group km-tag-classes"
}, ll = { class: "km-tag-group km-tag-caps" }, sl = { class: "km-mrow-limits" }, ol = {
  class: "km-mrow-limit-chips",
  "aria-label": "Token limits"
}, il = { class: "km-mrow-acts" }, al = { class: "km-mrow-probe-head" }, nl = { class: "km-mrow-probe-msg" }, rl = {
  key: 0,
  class: "km-probe-time"
}, dl = {
  key: 0,
  class: "km-mrow-probe-body"
}, ul = {
  key: 0,
  class: "km-probe-tokens"
}, cl = {
  key: 1,
  class: "km-probe-out"
}, ml = {
  key: 2,
  class: "km-probe-out"
}, fe = 5, vl = /* @__PURE__ */ M({
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
  setup(t, { emit: r }) {
    const u = t, p = r, v = g(() => u.model.capabilities ?? []), c = g(() => v.value.slice(0, fe)), s = g(() => Math.max(0, v.value.length - fe)), y = g(() => v.value.includes("reasoning") || v.value.includes("extended_thinking") || et(u.model, "reasoning_model_request") === "true"), h = g(() => u.model.enabled !== !1 && (v.value.includes("generate") || v.value.includes("tool_use"))), P = g(() => u.probeState?.model === u.model.name ? u.probeState : null), _ = g(() => P.value?.status || "idle"), a = g(() => _.value === "ok" || _.value === "fail"), l = g(() => _.value === "ok" ? "tabler:circle-check" : _.value === "fail" ? "tabler:circle-x" : "tabler:activity-heartbeat"), n = g(() => {
      if (_.value === "ok") return "success";
      if (_.value === "fail") return "danger";
    }), T = g(() => u.probing ? `Checking ${u.model.title || u.model.name}` : _.value === "ok" ? "Model check succeeded. View details" : _.value === "fail" ? "Model check failed. View details" : "Run model check"), D = g(() => {
      const E = P.value?.data?.tokens;
      if (!E) return [];
      const $ = ["prompt_tokens", "completion_tokens", "total_tokens", "thinking_tokens"], x = /* @__PURE__ */ new Set(), j = [], q = (F) => {
        const W = E[F];
        typeof W == "number" && W > 0 && !x.has(F) && (x.add(F), j.push({ label: F.replace(/_tokens$/, "").replace(/_input$/, "").replace(/_/g, " "), value: W }));
      };
      return $.forEach(q), Object.keys(E).forEach(q), j;
    });
    function J() {
      a.value ? p("toggle-probe-details") : p("probe");
    }
    return (E, $) => (i(), b("div", {
      class: K(["km-mrow", { "km-mrow-off": t.model.enabled === !1 }])
    }, [
      d(e(ne), { icon: t.providerIcon }, null, 8, ["icon"]),
      o("div", Gt, [
        o("div", Qt, [
          o("span", Wt, f(t.model.title || t.model.name), 1),
          d(e(R), {
            severity: e(tt)(t.model.source)
          }, {
            default: k(() => [
              w(f(e(lt)(t.model.source)), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          t.model.enabled === !1 ? (i(), S(e(R), {
            key: 0,
            severity: "secondary",
            icon: "tabler:ban"
          }, {
            default: k(() => [...$[4] || ($[4] = [
              w("disabled", -1)
            ])]),
            _: 1
          })) : V("", !0)
        ]),
        o("div", Xt, [
          o("span", Yt, f(t.providerTitle || "—"), 1),
          t.model.provider_profile_id ? (i(), b(I, { key: 0 }, [
            w(" · " + f(t.profileTitle), 1)
          ], 64)) : V("", !0),
          o("span", Zt, " · " + f(t.model.name), 1)
        ])
      ]),
      o("div", el, [
        (t.model.class || []).length ? (i(), b("span", tl, [
          (i(!0), b(I, null, z(t.model.class || [], (x) => (i(), S(e(R), {
            key: `k-${x}`,
            severity: "",
            icon: "tabler:category-2"
          }, {
            default: k(() => [
              w(f(x), 1)
            ]),
            _: 2
          }, 1024))), 128))
        ])) : V("", !0),
        o("span", ll, [
          y.value ? (i(), S(e(R), {
            key: 0,
            severity: "info",
            icon: "tabler:bulb"
          }, {
            default: k(() => [...$[5] || ($[5] = [
              w("reasoning", -1)
            ])]),
            _: 1
          })) : V("", !0),
          (i(!0), b(I, null, z(c.value, (x) => (i(), S(e(R), {
            key: `c-${x}`,
            severity: "secondary",
            icon: e(st)(x) || void 0
          }, {
            default: k(() => [
              w(f(x), 1)
            ]),
            _: 2
          }, 1032, ["icon"]))), 128)),
          s.value ? (i(), S(e(R), {
            key: 1,
            severity: "secondary"
          }, {
            default: k(() => [
              w("+" + f(s.value), 1)
            ]),
            _: 1
          })) : V("", !0)
        ])
      ]),
      o("div", sl, [
        o("span", null, [
          o("b", null, f(e(Y)(t.model.max_tokens)), 1),
          $[6] || ($[6] = w(" ctx", -1))
        ]),
        o("span", null, [
          o("b", null, f(e(Y)(t.model.output_tokens)), 1),
          $[7] || ($[7] = w(" out", -1))
        ])
      ]),
      o("div", ol, [
        o("span", null, [
          o("b", null, f(e(Y)(t.model.max_tokens)), 1),
          $[8] || ($[8] = w(" ctx", -1))
        ]),
        o("span", null, [
          o("b", null, f(e(Y)(t.model.output_tokens)), 1),
          $[9] || ($[9] = w(" out", -1))
        ])
      ]),
      o("div", il, [
        h.value ? (i(), S(e(L), {
          key: 0,
          icon: l.value,
          label: T.value,
          size: "sm",
          variant: "bordered",
          severity: n.value,
          active: a.value && t.probeDetailsOpen,
          spin: t.probing,
          disabled: t.probing || !a.value && t.busy,
          onClick: J
        }, null, 8, ["icon", "label", "severity", "active", "spin", "disabled"])) : V("", !0),
        d(e(L), {
          icon: t.model.enabled === !1 ? "tabler:circle-check" : "tabler:circle-minus",
          label: t.model.enabled === !1 ? "Enable model" : "Disable model",
          size: "sm",
          variant: "bordered",
          disabled: t.busy,
          onClick: $[0] || ($[0] = (x) => p("toggle-enabled"))
        }, null, 8, ["icon", "label", "disabled"]),
        d(e(L), {
          icon: "tabler:adjustments",
          label: "Edit model",
          size: "sm",
          variant: "bordered",
          onClick: $[1] || ($[1] = (x) => p("edit"))
        }),
        t.model.source !== "registry" ? (i(), S(e(L), {
          key: 1,
          icon: "tabler:trash",
          label: "Delete model",
          size: "sm",
          variant: "bordered",
          severity: "danger",
          onClick: $[2] || ($[2] = (x) => p("delete"))
        })) : V("", !0)
      ]),
      t.probeDetailsOpen && a.value ? (i(), b("div", {
        key: 0,
        class: K(["km-mrow-probe", _.value])
      }, [
        o("div", al, [
          d(e(O), {
            icon: _.value === "ok" ? "tabler:circle-check" : "tabler:circle-x",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          o("span", nl, f(_.value === "ok" ? "Model works" : "Model check failed"), 1),
          P.value?.data && P.value.data.elapsed_ms != null ? (i(), b("span", rl, f(P.value.data.elapsed_ms) + " ms", 1)) : V("", !0),
          d(e(Q), {
            icon: "tabler:activity-heartbeat",
            variant: "ghost",
            small: "",
            disabled: t.probing || t.busy,
            onClick: $[3] || ($[3] = (x) => p("probe"))
          }, {
            default: k(() => [...$[10] || ($[10] = [
              w(" Run again ", -1)
            ])]),
            _: 1
          }, 8, ["disabled"])
        ]),
        P.value?.data ? (i(), b("div", dl, [
          D.value.length ? (i(), b("div", ul, [
            $[11] || ($[11] = o("span", { class: "km-probe-tokens-l" }, "Tokens", -1)),
            (i(!0), b(I, null, z(D.value, (x) => (i(), b("span", {
              key: x.label,
              class: "km-probe-tok"
            }, [
              o("b", null, f(x.value), 1),
              w(" " + f(x.label), 1)
            ]))), 128))
          ])) : V("", !0),
          P.value.data.output ? (i(), b("div", cl, [
            $[12] || ($[12] = o("span", null, "Output", -1)),
            o("pre", null, f(P.value.data.output), 1)
          ])) : V("", !0),
          P.value.data.error ? (i(), b("div", ml, [
            $[13] || ($[13] = o("span", null, "Error", -1)),
            o("pre", null, f(P.value.data.error), 1)
          ])) : V("", !0)
        ])) : V("", !0)
      ], 2)) : V("", !0)
    ], 2));
  }
}), se = 120;
function pl(t) {
  const r = $e({
    search: "",
    source: "all",
    capability: "all",
    klass: "all",
    profile: "all",
    provider: "all",
    limit: se
  }), u = g(() => {
    const a = /* @__PURE__ */ new Set();
    for (const l of t.value) for (const n of l.capabilities ?? []) a.add(n);
    return Array.from(a).sort();
  }), p = g(() => {
    const a = /* @__PURE__ */ new Set();
    for (const l of t.value) for (const n of l.class ?? []) a.add(n);
    return Array.from(a).sort();
  }), v = g(() => {
    const a = /* @__PURE__ */ new Set();
    for (const l of t.value) l.provider_id && a.add(l.provider_id);
    return Array.from(a).sort();
  }), c = g(() => {
    const a = r.search.trim().toLowerCase();
    return t.value.filter((l) => r.source !== "all" && l.source !== r.source || r.capability !== "all" && !(l.capabilities ?? []).includes(r.capability) || r.klass !== "all" && !(l.class ?? []).includes(r.klass) || r.profile !== "all" && (l.provider_profile_id || "") !== r.profile || r.provider !== "all" && (l.provider_id || "") !== r.provider ? !1 : a ? [
      l.name,
      l.title,
      l.provider_model,
      l.provider_id,
      l.provider_profile_id,
      ...l.capabilities ?? [],
      ...l.class ?? []
    ].filter(Boolean).some((n) => String(n).toLowerCase().includes(a)) : !0);
  }), s = g(() => c.value.slice(0, r.limit)), y = g(() => s.value.length < c.value.length), h = g(
    () => (r.source !== "all" ? 1 : 0) + (r.capability !== "all" ? 1 : 0) + (r.klass !== "all" ? 1 : 0) + (r.profile !== "all" ? 1 : 0) + (r.provider !== "all" ? 1 : 0) + (r.search.trim() ? 1 : 0)
  );
  function P() {
    r.limit += se;
  }
  function _() {
    r.search = "", r.source = "all", r.capability = "all", r.klass = "all", r.profile = "all", r.provider = "all", r.limit = se;
  }
  return {
    state: r,
    capabilityOptions: u,
    classOptions: p,
    providerOptions: v,
    filtered: c,
    visible: s,
    hasMore: y,
    activeCount: h,
    more: P,
    reset: _
  };
}
const bl = { class: "km-pool" }, fl = { class: "km-pool-head" }, kl = { class: "km-pool-head-top" }, gl = { class: "km-pool-title" }, yl = { class: "km-pool-counts" }, $l = { class: "km-pool-filters" }, hl = {
  key: 0,
  class: "km-pool-body"
}, _l = {
  key: 1,
  class: "km-pool-body"
}, Vl = {
  key: 2,
  class: "km-pool-table"
}, wl = {
  key: 0,
  class: "km-pool-more"
}, Cl = /* @__PURE__ */ M({
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
  setup(t, { emit: r }) {
    const u = t, p = r, v = ae(() => u.adapters, () => u.profiles, () => u.presets), c = pl(Fe(u, "models")), s = [
      { label: "All sources", value: "all" },
      { label: "Built-in", value: "registry" },
      { label: "Discovered", value: "discovered" },
      { label: "Overlay", value: "overlay" }
    ], y = g(() => [
      { label: "All providers", value: "all" },
      ...c.providerOptions.value.map((a) => ({ label: v.adapterTitle(a), value: a }))
    ]), h = g(() => [
      { label: "All capabilities", value: "all" },
      ...c.capabilityOptions.value.map((a) => ({ label: a, value: a }))
    ]), P = g(() => [
      { label: "All classes", value: "all" },
      ...c.classOptions.value.map((a) => ({ label: a, value: a }))
    ]), _ = g(() => {
      let a = 0, l = 0, n = 0;
      for (const T of u.models)
        T.source === "registry" ? a++ : T.source === "discovered" ? l++ : n++;
      return { registry: a, discovered: l, overlay: n };
    });
    return ie(() => u.selectedProfileId, (a) => {
      c.state.profile = a || "all";
    }, { immediate: !0 }), (a, l) => (i(), b("div", bl, [
      o("header", fl, [
        o("div", kl, [
          o("div", gl, [
            l[8] || (l[8] = o("span", null, "Model pool", -1)),
            o("span", yl, [
              d(e(R), { severity: "info" }, {
                default: k(() => [
                  w(f(_.value.registry) + " built-in", 1)
                ]),
                _: 1
              }),
              d(e(R), { severity: "success" }, {
                default: k(() => [
                  w(f(_.value.discovered) + " discovered", 1)
                ]),
                _: 1
              }),
              d(e(R), { severity: "warn" }, {
                default: k(() => [
                  w(f(_.value.overlay) + " overlay", 1)
                ]),
                _: 1
              })
            ])
          ]),
          d(e(_t), {
            modelValue: e(c).state.search,
            "onUpdate:modelValue": l[0] || (l[0] = (n) => e(c).state.search = n),
            placeholder: "Search models"
          }, null, 8, ["modelValue"])
        ]),
        o("div", $l, [
          d(e(X), {
            modelValue: e(c).state.source,
            "onUpdate:modelValue": l[1] || (l[1] = (n) => e(c).state.source = n),
            options: s,
            "aria-label": "Source"
          }, null, 8, ["modelValue"]),
          d(e(X), {
            modelValue: e(c).state.provider,
            "onUpdate:modelValue": l[2] || (l[2] = (n) => e(c).state.provider = n),
            options: y.value,
            "aria-label": "Provider"
          }, null, 8, ["modelValue", "options"]),
          d(e(X), {
            modelValue: e(c).state.capability,
            "onUpdate:modelValue": l[3] || (l[3] = (n) => e(c).state.capability = n),
            options: h.value,
            "aria-label": "Capability"
          }, null, 8, ["modelValue", "options"]),
          d(e(X), {
            modelValue: e(c).state.klass,
            "onUpdate:modelValue": l[4] || (l[4] = (n) => e(c).state.klass = n),
            options: P.value,
            "aria-label": "Class"
          }, null, 8, ["modelValue", "options"]),
          e(c).activeCount.value ? (i(), S(e(L), {
            key: 0,
            icon: "tabler:filter-off",
            label: "Clear filters",
            variant: "bordered",
            onClick: l[5] || (l[5] = (n) => e(c).reset())
          })) : V("", !0)
        ])
      ]),
      t.models.length ? e(c).filtered.value.length ? (i(), b("div", Vl, [
        l[9] || (l[9] = o("div", { class: "km-pool-cols" }, [
          o("span"),
          o("span", null, "Model"),
          o("span", null, "Capabilities & classes"),
          o("span", { class: "km-pool-cols-r" }, "Limits"),
          o("span")
        ], -1)),
        (i(!0), b(I, null, z(e(c).visible.value, (n) => (i(), S(vl, {
          key: n.name,
          model: n,
          "provider-icon": e(v).providerIcon(n.provider_id),
          "provider-title": e(v).adapterTitle(n.provider_id),
          "profile-title": e(v).profileTitle(n.provider_profile_id),
          probing: t.probingModel === n.name,
          "probe-state": t.probeState,
          "probe-details-open": t.probeDetailsModel === n.name,
          busy: t.busy,
          onEdit: (T) => p("edit", n),
          onDelete: (T) => p("delete", n),
          onProbe: (T) => p("probe", n),
          onToggleProbeDetails: (T) => p("toggle-probe-details", n),
          onToggleEnabled: (T) => p("toggle-enabled", n)
        }, null, 8, ["model", "provider-icon", "provider-title", "profile-title", "probing", "probe-state", "probe-details-open", "busy", "onEdit", "onDelete", "onProbe", "onToggleProbeDetails", "onToggleEnabled"]))), 128)),
        e(c).hasMore.value ? (i(), b("div", wl, [
          d(e(Q), {
            variant: "ghost",
            icon: "tabler:chevron-down",
            onClick: l[7] || (l[7] = (n) => e(c).more())
          }, {
            default: k(() => [
              w(" Show more (" + f(e(c).filtered.value.length - e(c).visible.value.length) + ") ", 1)
            ]),
            _: 1
          })
        ])) : V("", !0)
      ])) : (i(), b("div", _l, [
        d(e(oe), {
          icon: "tabler:search-off",
          title: "No models match",
          hint: "Adjust the search or filters."
        })
      ])) : (i(), b("div", hl, [
        d(e(oe), {
          icon: "tabler:cpu",
          title: "No models yet",
          hint: "Connect a provider and discover its models, or add one manually.",
          cta: "Add provider",
          "cta-icon": "tabler:plus",
          onCta: l[6] || (l[6] = (n) => p("add"))
        })
      ]))
    ]));
  }
}), Sl = { class: "km-classes" }, Pl = {
  key: 0,
  class: "km-pool-body"
}, xl = {
  key: 1,
  class: "km-pool-table km-classes-list"
}, Tl = { class: "km-class-head" }, Dl = { class: "km-class-head-text" }, Ml = { class: "km-class-title" }, El = {
  key: 0,
  class: "km-class-desc"
}, Nl = { class: "km-class-meta" }, Ol = { class: "km-class-count" }, Al = {
  key: 0,
  class: "km-class-members"
}, Bl = {
  key: 1,
  class: "km-class-rank"
}, Il = { class: "km-class-member-name" }, Ul = { class: "km-class-member-pri" }, Rl = {
  key: 1,
  class: "km-class-empty"
}, Ll = /* @__PURE__ */ M({
  __name: "ModelClasses",
  props: {
    classes: {}
  },
  setup(t) {
    return (r, u) => (i(), b("div", Sl, [
      t.classes.length ? (i(), b("div", xl, [
        (i(!0), b(I, null, z(t.classes, (p) => (i(), b("article", {
          key: p.name,
          class: "km-class"
        }, [
          o("div", Tl, [
            d(e(ne), {
              icon: p.icon || "tabler:category",
              size: "sm"
            }, null, 8, ["icon"]),
            o("div", Dl, [
              o("div", Ml, f(p.title || p.name), 1),
              p.description ? (i(), b("div", El, f(p.description), 1)) : V("", !0)
            ]),
            o("div", Nl, [
              o("span", Ol, f(p.models.length) + " model" + f(p.models.length === 1 ? "" : "s"), 1)
            ])
          ]),
          p.models.length ? (i(), b("div", Al, [
            (i(!0), b(I, null, z(p.models, (v, c) => (i(), b("div", {
              key: v.name,
              class: K(["km-class-member", { top: c === 0 }])
            }, [
              c === 0 ? (i(), S(e(R), {
                key: 0,
                severity: "success",
                icon: "tabler:check"
              }, {
                default: k(() => [...u[0] || (u[0] = [
                  w("active", -1)
                ])]),
                _: 1
              })) : (i(), b("span", Bl, f(c + 1), 1)),
              o("span", Il, f(v.title || v.name), 1),
              o("span", Ul, "priority " + f(v.priority ?? 0), 1)
            ], 2))), 128))
          ])) : (i(), b("div", Rl, "No models assigned to this class yet."))
        ]))), 128))
      ])) : (i(), b("div", Pl, [
        d(e(oe), {
          icon: "tabler:category-2",
          title: "No model classes",
          hint: "Classes group models by purpose. The highest-priority model in each class is selected automatically."
        })
      ]))
    ]));
  }
}), zl = { class: "km-picker" }, jl = {
  key: 0,
  class: "km-picker-sec"
}, ql = { class: "km-picker-list" }, Fl = ["onClick"], Jl = { class: "km-picker-ico" }, Kl = { class: "km-picker-body" }, Hl = { class: "km-picker-name" }, Gl = { class: "km-picker-desc" }, Ql = {
  key: 1,
  class: "km-picker-sec"
}, Wl = { class: "km-picker-list" }, Xl = ["onClick"], Yl = { class: "km-picker-ico" }, Zl = { class: "km-picker-body" }, es = { class: "km-picker-name" }, ts = { class: "km-picker-desc" }, ls = /* @__PURE__ */ M({
  __name: "ProviderPicker",
  props: {
    presets: {}
  },
  emits: ["pick"],
  setup(t, { emit: r }) {
    const u = t, p = r, v = g(() => u.presets.filter((s) => !me(s))), c = g(() => u.presets.filter(me));
    return (s, y) => (i(), b("div", zl, [
      v.value.length ? (i(), b("section", jl, [
        y[0] || (y[0] = o("div", { class: "km-picker-sec-title" }, "Native providers", -1)),
        o("div", ql, [
          (i(!0), b(I, null, z(v.value, (h) => (i(), b("button", {
            key: h.id,
            class: "km-picker-item",
            onClick: (P) => p("pick", h)
          }, [
            o("span", Jl, [
              d(e(O), {
                icon: e(ve)(h),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            o("span", Kl, [
              o("span", Hl, f(h.title), 1),
              o("span", Gl, f(h.description), 1)
            ]),
            d(e(O), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, Fl))), 128))
        ])
      ])) : V("", !0),
      c.value.length ? (i(), b("section", Ql, [
        y[1] || (y[1] = o("div", { class: "km-picker-sec-title" }, "OpenAI-compatible", -1)),
        o("div", Wl, [
          (i(!0), b(I, null, z(c.value, (h) => (i(), b("button", {
            key: h.id,
            class: "km-picker-item",
            onClick: (P) => p("pick", h)
          }, [
            o("span", Yl, [
              d(e(O), {
                icon: e(ve)(h),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            o("span", Zl, [
              o("span", es, f(h.title), 1),
              o("span", ts, f(h.config?.base_url || h.description), 1)
            ]),
            d(e(O), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, Xl))), 128))
        ])
      ])) : V("", !0)
    ]));
  }
}), ss = { class: "km-form-sec" }, os = { class: "km-form-id" }, is = { class: "km-form-sec" }, as = { class: "km-form-grid" }, ns = { class: "km-form-sec" }, rs = { class: "km-form-sec" }, ds = { class: "km-form-grid" }, us = { class: "km-form-grid" }, cs = { class: "km-form-sec" }, ms = {
  key: 0,
  class: "km-adv-body"
}, vs = { class: "km-form-grid" }, ps = ["disabled"], bs = { class: "km-form-foot" }, fs = /* @__PURE__ */ M({
  __name: "ModelEditor",
  props: {
    model: {},
    profiles: {},
    saving: { type: Boolean },
    capabilityOptions: {},
    classOptions: {}
  },
  emits: ["save", "cancel"],
  setup(t, { emit: r }) {
    const u = t, p = r, v = A(""), c = A(!1), s = $e({
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
    ie(() => u.model, (a) => {
      if (v.value = "", c.value = !1, !a) return;
      const l = a.options ?? {};
      s.name = a.name, s.title = a.title || a.name, s.description = a.description || "", s.provider_id = a.provider_id || "", s.provider_profile_id = a.provider_profile_id || "", s.provider_model = a.provider_model || a.name, s.capabilities = [...a.capabilities ?? []], s.classes = [...a.class ?? []], s.priority = Number(a.priority ?? 10), s.max_tokens = Number(a.max_tokens ?? 0), s.output_tokens = Number(a.output_tokens ?? 0), s.dimensions = Number(a.dimensions ?? 0), s.reasoning_model_request = l.reasoning_model_request === !0, s.thinking_effort = typeof l.thinking_effort == "string" || typeof l.thinking_effort == "number" ? l.thinking_effort : "", s.temperature = l.temperature === void 0 ? "" : String(l.temperature), s.options_json = JSON.stringify(l, null, 2), s.source = a.source === "registry" ? "overlay" : a.source || "overlay", s.enabled = a.enabled !== !1;
    }, { immediate: !0 });
    const y = g(() => u.capabilityOptions ?? []), h = g(() => u.classOptions ?? []), P = g(() => [
      { label: "Registry default", value: "" },
      ...u.profiles.map((a) => ({ label: a.name, value: a.id }))
    ]);
    function _() {
      v.value = "";
      let a = {};
      try {
        a = JSON.parse(s.options_json || "{}");
      } catch {
        v.value = "model options JSON is invalid", c.value = !0;
        return;
      }
      s.reasoning_model_request ? a.reasoning_model_request = !0 : delete a.reasoning_model_request;
      const l = String(s.thinking_effort).trim(), n = Number(l);
      if (l === "" || Number.isFinite(n) && n <= 0 ? delete a.thinking_effort : a.thinking_effort = Number.isFinite(n) ? n : l, s.temperature !== "") {
        const T = Number(s.temperature);
        if (!Number.isFinite(T) || T < 0 || T > 2) {
          v.value = "temperature must be between 0 and 2";
          return;
        }
        a.temperature = T;
      } else
        delete a.temperature;
      p("save", {
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
        options: a,
        source: s.source,
        enabled: s.enabled
      });
    }
    return (a, l) => (i(), b("form", {
      class: "km-form",
      onSubmit: ke(_, ["prevent"])
    }, [
      v.value ? (i(), S(e(he), {
        key: 0,
        severity: "danger",
        onDismiss: l[0] || (l[0] = (n) => v.value = "")
      }, {
        default: k(() => [
          w(f(v.value), 1)
        ]),
        _: 1
      })) : V("", !0),
      o("section", ss, [
        l[20] || (l[20] = o("div", { class: "km-form-sec-title" }, "Identity", -1)),
        d(e(N), { label: "Title" }, {
          default: k(() => [
            d(e(U), {
              modelValue: s.title,
              "onUpdate:modelValue": l[1] || (l[1] = (n) => s.title = n),
              disabled: t.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        d(e(N), { label: "Description" }, {
          default: k(() => [
            d(e(U), {
              modelValue: s.description,
              "onUpdate:modelValue": l[2] || (l[2] = (n) => s.description = n),
              disabled: t.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        o("div", os, f(s.name), 1)
      ]),
      o("section", is, [
        l[21] || (l[21] = o("div", { class: "km-form-sec-title" }, "Routing", -1)),
        o("div", as, [
          d(e(N), { label: "Provider profile" }, {
            default: k(() => [
              d(e(X), {
                modelValue: s.provider_profile_id,
                "onUpdate:modelValue": l[3] || (l[3] = (n) => s.provider_profile_id = n),
                options: P.value,
                "aria-label": "Provider profile"
              }, null, 8, ["modelValue", "options"])
            ]),
            _: 1
          }),
          d(e(N), { label: "Provider model" }, {
            default: k(() => [
              d(e(U), {
                modelValue: s.provider_model,
                "onUpdate:modelValue": l[4] || (l[4] = (n) => s.provider_model = n),
                disabled: t.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      o("section", ns, [
        l[22] || (l[22] = o("div", { class: "km-form-sec-title" }, "Capabilities & classes", -1)),
        d(e(N), { label: "Capabilities" }, {
          default: k(() => [
            d(e(be), {
              modelValue: s.capabilities,
              "onUpdate:modelValue": l[5] || (l[5] = (n) => s.capabilities = n),
              suggestions: y.value,
              placeholder: "Add a capability…",
              disabled: t.saving
            }, null, 8, ["modelValue", "suggestions", "disabled"])
          ]),
          _: 1
        }),
        d(e(N), { label: "Classes" }, {
          default: k(() => [
            d(e(be), {
              modelValue: s.classes,
              "onUpdate:modelValue": l[6] || (l[6] = (n) => s.classes = n),
              suggestions: h.value,
              placeholder: "Add a class…",
              disabled: t.saving
            }, null, 8, ["modelValue", "suggestions", "disabled"])
          ]),
          _: 1
        })
      ]),
      o("section", rs, [
        l[23] || (l[23] = o("div", { class: "km-form-sec-title" }, "Request options", -1)),
        d(e(pe), {
          modelValue: s.reasoning_model_request,
          "onUpdate:modelValue": l[7] || (l[7] = (n) => s.reasoning_model_request = n),
          label: "Reasoning model",
          disabled: t.saving
        }, null, 8, ["modelValue", "disabled"]),
        o("div", ds, [
          d(e(N), { label: "Thinking effort" }, {
            default: k(() => [
              d(e(U), {
                modelValue: s.thinking_effort,
                "onUpdate:modelValue": l[8] || (l[8] = (n) => s.thinking_effort = n),
                disabled: t.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          d(e(N), {
            label: "Temperature",
            help: "0–2; blank to leave unset."
          }, {
            default: k(() => [
              d(e(U), {
                modelValue: s.temperature,
                "onUpdate:modelValue": l[9] || (l[9] = (n) => s.temperature = n),
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
        o("div", us, [
          d(e(N), { label: "Context" }, {
            default: k(() => [
              d(e(U), {
                modelValue: s.max_tokens,
                "onUpdate:modelValue": l[10] || (l[10] = (n) => s.max_tokens = n),
                type: "number",
                min: 0,
                disabled: t.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          d(e(N), { label: "Output" }, {
            default: k(() => [
              d(e(U), {
                modelValue: s.output_tokens,
                "onUpdate:modelValue": l[11] || (l[11] = (n) => s.output_tokens = n),
                type: "number",
                min: 0,
                disabled: t.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      o("section", cs, [
        o("button", {
          type: "button",
          class: K(["km-adv-toggle", { open: c.value }]),
          onClick: l[12] || (l[12] = (n) => c.value = !c.value)
        }, [
          d(e(O), {
            icon: "tabler:chevron-right",
            class: "km-adv-chev",
            "aria-hidden": "true"
          }),
          l[24] || (l[24] = w(" Advanced ", -1))
        ], 2),
        c.value ? (i(), b("div", ms, [
          o("div", vs, [
            d(e(N), { label: "Provider id" }, {
              default: k(() => [
                d(e(U), {
                  modelValue: s.provider_id,
                  "onUpdate:modelValue": l[13] || (l[13] = (n) => s.provider_id = n),
                  disabled: t.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            d(e(N), { label: "Source" }, {
              default: k(() => [
                d(e(U), {
                  modelValue: s.source,
                  "onUpdate:modelValue": l[14] || (l[14] = (n) => s.source = n),
                  disabled: t.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            d(e(N), { label: "Priority" }, {
              default: k(() => [
                d(e(U), {
                  modelValue: s.priority,
                  "onUpdate:modelValue": l[15] || (l[15] = (n) => s.priority = n),
                  type: "number",
                  disabled: t.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            d(e(N), { label: "Dimensions" }, {
              default: k(() => [
                d(e(U), {
                  modelValue: s.dimensions,
                  "onUpdate:modelValue": l[16] || (l[16] = (n) => s.dimensions = n),
                  type: "number",
                  min: 0,
                  disabled: t.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            })
          ]),
          d(e(N), {
            label: "Options JSON",
            help: "Raw provider options; merged with the controls above."
          }, {
            default: k(() => [
              ge(o("textarea", {
                "onUpdate:modelValue": l[17] || (l[17] = (n) => s.options_json = n),
                class: "km-input mono km-textarea",
                disabled: t.saving
              }, null, 8, ps), [
                [ye, s.options_json]
              ])
            ]),
            _: 1
          })
        ])) : V("", !0)
      ]),
      d(e(pe), {
        modelValue: s.enabled,
        "onUpdate:modelValue": l[18] || (l[18] = (n) => s.enabled = n),
        label: "Enabled",
        disabled: t.saving
      }, null, 8, ["modelValue", "disabled"]),
      o("div", bs, [
        d(e(Q), {
          variant: "ghost",
          disabled: t.saving,
          onClick: l[19] || (l[19] = (n) => p("cancel"))
        }, {
          default: k(() => [...l[25] || (l[25] = [
            w("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        d(e(Q), {
          type: "submit",
          icon: "tabler:device-floppy",
          loading: t.saving
        }, {
          default: k(() => [
            w(f(t.saving ? "Saving" : "Save model"), 1)
          ]),
          _: 1
        }, 8, ["loading"])
      ])
    ], 32));
  }
}), ks = { class: "km" }, gs = { class: "km-rail-body" }, ys = "kickside-model-provider-openai-compatible", $s = "wippy.llm.openai_compat:provider", hs = /* @__PURE__ */ M({
  __name: "models",
  setup(t) {
    const r = ot(), { adapters: u, presets: p, profiles: v, models: c, classes: s, loading: y, saving: h, discovering: P, probing: _, error: a } = r, l = A("models"), n = ae(() => u.value, () => v.value), T = A("all"), D = A("none"), J = A("create"), E = A(null), $ = A(null), x = A(null), j = A({ status: "idle" }), q = A({ status: "idle" }), F = A("");
    function W(m) {
      const C = /* @__PURE__ */ new Set();
      for (const B of c.value) for (const Re of m(B) ?? []) C.add(Re);
      return Array.from(C).sort();
    }
    const _e = g(() => W((m) => m.capabilities)), Ve = g(() => {
      const m = /* @__PURE__ */ new Set();
      for (const C of s.value) C.name && m.add(C.name);
      for (const C of c.value) for (const B of C.class ?? []) m.add(B);
      return Array.from(m).sort();
    }), we = g(
      () => $.value?.provider_id || E.value?.provider_id || $s
    ), Z = g(() => n.adapterFor(we.value)), ee = g(
      () => E.value?.profile_editor_tag || Z.value?.profile_editor_tag || ys
    ), Ce = g(() => rt(ee.value)), Se = g(() => dt(ee.value)), Pe = g(() => D.value !== "none"), te = g(() => D.value === "pick" ? { title: "Add provider", icon: "tabler:plug-connected", back: !1 } : D.value === "provider" ? J.value === "edit" ? { title: $.value?.name || "Edit provider", icon: "tabler:plug-connected", back: !1 } : { title: E.value?.title || "Add provider", icon: "tabler:plug-connected", back: !0 } : D.value === "model" ? { title: x.value?.title || x.value?.name || "Edit model", icon: "tabler:adjustments", back: !1 } : { title: "", icon: "", back: !1 });
    function H() {
      h.value || (D.value = "none", E.value = null, $.value = null, x.value = null, j.value = { status: "idle" });
    }
    function le() {
      J.value = "create", E.value = null, $.value = null, D.value = "pick";
    }
    function xe(m) {
      E.value = m, D.value = "provider";
    }
    function Te() {
      E.value = null, D.value = "pick";
    }
    function De(m) {
      J.value = "edit", E.value = null, $.value = m, j.value = { status: "idle" }, D.value = "provider";
    }
    async function re() {
      if (!$.value) return;
      j.value = { status: "testing" };
      const m = await r.testProfile($.value.id);
      j.value = { status: m.ok ? "ok" : "fail", message: m.message };
    }
    function Me(m) {
      x.value = m, D.value = "model";
    }
    async function de(m) {
      const C = m?.detail ?? m;
      await r.saveProfile(J.value, $.value?.id || "", C) && H();
    }
    async function Ee(m) {
      await r.saveCard(m) && H();
    }
    function Ne(m) {
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
    async function Oe(m) {
      await r.saveCard(Ne(m));
    }
    async function Ae(m) {
      F.value = "", q.value = { status: "testing", model: m.name, message: `Probing ${m.title || m.name}` };
      const C = await r.testModel(m.name);
      q.value = {
        status: C.ok ? "ok" : "fail",
        model: m.name,
        message: C.message,
        data: C.data
      };
    }
    function Be(m) {
      q.value.model === m.name && (q.value.status !== "ok" && q.value.status !== "fail" || (F.value = F.value === m.name ? "" : m.name));
    }
    async function Ie(m) {
      await ue.confirm({
        header: "Delete provider",
        message: `Remove “${m.name}”? This cannot be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await r.deleteProfile(m.id);
    }
    async function Ue(m) {
      if (m.source === "registry") return;
      const C = m.title || m.name;
      await ue.confirm({
        header: "Delete model",
        message: `Remove “${C}”? This cannot be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await r.deleteCard(m.name);
    }
    return ie(l, (m) => {
      m === "classes" && r.loadClasses();
    }), Je(async () => {
      await Promise.all([r.load(), r.loadClasses()]);
    }), (m, C) => (i(), b("div", ks, [
      e(a) ? (i(), S(e(he), {
        key: 0,
        severity: "danger",
        class: "km-top-notice",
        onDismiss: C[0] || (C[0] = (B) => a.value = "")
      }, {
        default: k(() => [
          w(f(e(a)), 1)
        ]),
        _: 1
      })) : V("", !0),
      e(y) && !e(c).length && !e(v).length ? (i(), S(e(it), {
        key: 1,
        label: "Loading models…"
      })) : (i(), S(e(pt), { key: 2 }, {
        rail: k(() => [
          d(e(yt), {
            title: "Providers",
            count: e(v).length
          }, {
            actions: k(() => [
              d(e(L), {
                icon: "tabler:plus",
                label: "Add provider",
                disabled: e(h),
                onClick: le
              }, null, 8, ["disabled"]),
              d(e(L), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: e(y),
                spin: e(y),
                onClick: e(r).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          o("div", gs, [
            d(Ht, {
              profiles: e(v),
              adapters: e(u),
              presets: e(p),
              "selected-id": T.value,
              discovering: e(P),
              busy: e(h),
              onSelect: C[1] || (C[1] = (B) => T.value = B),
              onAdd: le,
              onEdit: De,
              onDiscover: C[2] || (C[2] = (B) => e(r).discover(B.id)),
              onDelete: Ie
            }, null, 8, ["profiles", "adapters", "presets", "selected-id", "discovering", "busy"])
          ])
        ]),
        default: k(() => [
          d(e(He), {
            class: "km-tabs",
            "data-kx-separator": "surface",
            value: l.value,
            "onUpdate:value": C[3] || (C[3] = (B) => l.value = String(B))
          }, {
            default: k(() => [
              d(e(Ke), { "aria-label": "Model sections" }, {
                default: k(() => [
                  d(e(ce), { value: "models" }, {
                    default: k(() => [
                      C[4] || (C[4] = w("Models", -1)),
                      o("b", null, f(e(c).length), 1)
                    ]),
                    _: 1
                  }),
                  d(e(ce), { value: "classes" }, {
                    default: k(() => [
                      C[5] || (C[5] = w("Classes", -1)),
                      o("b", null, f(e(s).length), 1)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["value"]),
          l.value === "models" ? (i(), S(Cl, {
            key: 0,
            "selected-profile-id": T.value,
            models: e(c),
            profiles: e(v),
            adapters: e(u),
            presets: e(p),
            "probing-model": e(_),
            "probe-state": q.value,
            "probe-details-model": F.value,
            busy: e(h),
            onEdit: Me,
            onDelete: Ue,
            onProbe: Ae,
            onToggleProbeDetails: Be,
            onToggleEnabled: Oe,
            onAdd: le
          }, null, 8, ["selected-profile-id", "models", "profiles", "adapters", "presets", "probing-model", "probe-state", "probe-details-model", "busy"])) : (i(), S(Ll, {
            key: 1,
            classes: e(s)
          }, null, 8, ["classes"]))
        ]),
        _: 1
      })),
      d(e(Ot), {
        open: Pe.value,
        title: te.value.title,
        icon: te.value.icon,
        back: te.value.back,
        onClose: H,
        onBack: Te
      }, {
        default: k(() => [
          D.value === "pick" ? (i(), S(ls, {
            key: 0,
            presets: e(p),
            onPick: xe
          }, null, 8, ["presets"])) : D.value === "provider" && Se.value ? (i(), S(ut, {
            key: 1,
            "spec-key": Ce.value,
            mode: J.value,
            adapter: Z.value || void 0,
            preset: E.value || void 0,
            profile: $.value,
            saving: e(h),
            "test-state": j.value,
            onSave: de,
            onCancel: H,
            onTest: re
          }, null, 8, ["spec-key", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : D.value === "provider" ? (i(), S(at, {
            key: 2,
            tag: ee.value,
            mode: J.value,
            adapter: Z.value || void 0,
            preset: E.value || void 0,
            profile: $.value,
            saving: e(h),
            "test-state": j.value,
            onSave: de,
            onCancel: H,
            onTest: re
          }, null, 8, ["tag", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : D.value === "model" ? (i(), S(fs, {
            key: 3,
            model: x.value,
            profiles: e(v),
            saving: e(h),
            "capability-options": _e.value,
            "class-options": Ve.value,
            onSave: Ee,
            onCancel: H
          }, null, 8, ["model", "profiles", "saving", "capability-options", "class-options"])) : V("", !0)
        ]),
        _: 1
      }, 8, ["open", "title", "icon", "back"])
    ]));
  }
}), Us = {
  rootComponent: hs,
  plugins: [Le]
};
export {
  Us as mountConfig
};
//# sourceMappingURL=lazy-mount-CyanimwU.js.map

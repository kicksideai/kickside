import { P as Le } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as M, openBlock as i, createElementBlock as p, createElementVNode as o, renderSlot as G, createTextVNode as C, toDisplayString as k, createCommentVNode as h, getCurrentInstance as ze, computed as y, createBlock as P, unref as e, withCtx as g, createVNode as d, ref as O, normalizeClass as K, Fragment as U, renderList as z, withModifiers as fe, withDirectives as ge, vModelText as ye, normalizeStyle as je, createSlots as qe, reactive as $e, toRef as Fe, watch as ie } from "vue";
import { host as ue } from "@wippy-fe/proxy";
import { a as Je } from "./wc-runtime-ClNbKZcC.js";
import ce from "primevue/tab";
import Ke from "primevue/tablist";
import He from "primevue/tabs";
import { Icon as A } from "@iconify/vue";
import Ge from "primevue/button";
import "primevue/select";
import "primevue/toggleswitch";
import Qe from "primevue/tag";
import { p as We, h as Xe, s as Ye, a as Ze, m as ae, o as et, b as tt, c as lt, d as st, f as Y, _ as X, i as me, e as ve, g as he, u as ot, j as it, k as at } from "./useModelsApi-wu6kB5q-.js";
import nt from "primevue/drawer";
import { _ as Q, a as ne, b as N, c as R, d as pe, s as rt, i as dt, e as ut } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-hzoWyiBh.js";
import "primevue/progressspinner";
const ct = { class: "km-shell" }, mt = { class: "km-rail" }, vt = { class: "km-main" }, pt = /* @__PURE__ */ M({
  __name: "Shell",
  setup(t) {
    return (r, u) => (i(), p("div", ct, [
      o("aside", mt, [
        G(r.$slots, "rail")
      ]),
      o("main", vt, [
        G(r.$slots, "default")
      ])
    ]));
  }
}), bt = { class: "km-railhead" }, kt = { class: "km-railhead-title" }, ft = { key: 0 }, gt = { class: "km-railhead-acts" }, yt = /* @__PURE__ */ M({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(t) {
    return (r, u) => (i(), p("div", bt, [
      o("span", kt, [
        C(k(t.title), 1),
        t.count !== void 0 ? (i(), p("b", ft, k(t.count), 1)) : h("", !0)
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
    const u = t, v = r, b = ze(), c = y(
      () => Object.prototype.hasOwnProperty.call(b?.vnode.props ?? {}, "active")
    ), s = y(() => {
      if (u.severity) return u.severity;
      if (u.variant === "danger") return "danger";
      if (u.variant === "bordered") return "secondary";
    }), $ = y(
      () => u.size === "sm" ? "small" : u.size === "lg" ? "large" : void 0
    );
    return (V, _) => (i(), P(e(Ge), {
      severity: s.value,
      text: t.variant !== "bordered" && !t.active,
      outlined: t.variant === "bordered",
      size: $.value,
      loading: t.spin,
      disabled: t.disabled || t.spin,
      pt: {
        root: {
          "aria-label": t.label,
          "aria-pressed": c.value ? String(t.active) : void 0,
          title: t.label
        }
      },
      onClick: _[0] || (_[0] = (w) => v("click"))
    }, {
      icon: g(() => [
        d(e(A), {
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
    return (v, b) => (i(), p("div", $t, [
      d(e(A), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      o("input", {
        class: "km-search-input",
        value: t.modelValue,
        placeholder: t.placeholder || "Search",
        onInput: b[0] || (b[0] = (c) => u("update:modelValue", c.target.value))
      }, null, 40, ht),
      t.modelValue ? (i(), p("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: b[1] || (b[1] = (c) => u("update:modelValue", ""))
      }, [
        d(e(A), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : h("", !0)
    ]));
  }
}), Vt = { class: "km-taginput-wrap" }, wt = { class: "km-tag-label" }, Ct = ["title", "aria-label", "disabled", "onClick"], Pt = ["placeholder", "disabled"], St = {
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
    const u = t, v = r, b = O(""), c = O(null), s = y(() => {
      const w = b.value.trim().toLowerCase();
      return u.suggestions.filter((a) => !u.modelValue.includes(a)).filter((a) => !w || a.toLowerCase().includes(w));
    });
    function $(w) {
      const a = w.trim();
      if (!a || u.modelValue.includes(a)) {
        b.value = "";
        return;
      }
      v("update:modelValue", [...u.modelValue, a]), b.value = "", c.value?.focus();
    }
    function V(w) {
      v("update:modelValue", u.modelValue.filter((a) => a !== w));
    }
    function _(w) {
      w.key === "Enter" || w.key === "," ? (w.preventDefault(), $(b.value || s.value[0] || "")) : w.key === "Backspace" && !b.value && u.modelValue.length && V(u.modelValue[u.modelValue.length - 1]);
    }
    return (w, a) => (i(), p("div", Vt, [
      o("div", {
        class: K(["km-taginput", { disabled: t.disabled }]),
        onClick: a[1] || (a[1] = (l) => c.value?.focus())
      }, [
        (i(!0), p(U, null, z(t.modelValue, (l) => (i(), p("span", {
          key: l,
          class: "km-tag"
        }, [
          o("span", wt, k(l), 1),
          o("button", {
            type: "button",
            class: "km-tag-x",
            title: `Remove ${l}`,
            "aria-label": `Remove ${l}`,
            disabled: t.disabled,
            onClick: fe((n) => V(l), ["stop"])
          }, [
            d(e(A), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ], 8, Ct)
        ]))), 128)),
        ge(o("input", {
          ref_key: "inputEl",
          ref: c,
          "onUpdate:modelValue": a[0] || (a[0] = (l) => b.value = l),
          class: "km-tag-field",
          type: "text",
          placeholder: t.modelValue.length ? "" : t.placeholder || "Add…",
          disabled: t.disabled,
          spellcheck: "false",
          autocomplete: "off",
          onKeydown: _
        }, null, 40, Pt), [
          [ye, b.value]
        ])
      ], 2),
      s.value.length ? (i(), p("div", St, [
        (i(!0), p(U, null, z(s.value, (l) => (i(), p("button", {
          key: l,
          type: "button",
          class: "km-tag-sug-item",
          disabled: t.disabled,
          onClick: (n) => $(l)
        }, [
          d(e(A), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          }),
          C(" " + k(l), 1)
        ], 8, xt))), 128))
      ])) : h("", !0)
    ]));
  }
}), Dt = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, B = /* @__PURE__ */ M({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(t) {
    return (r, u) => (i(), P(e(Qe), {
      severity: t.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: g(() => [
        t.dot ? (i(), p("span", Dt)) : t.icon ? (i(), P(e(A), {
          key: 1,
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : h("", !0),
        G(r.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), Tt = { class: "km-empty" }, Mt = { class: "km-empty-title" }, Et = {
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
    return (v, b) => (i(), p("div", Tt, [
      d(e(A), {
        icon: t.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      o("div", Mt, k(t.title), 1),
      t.hint ? (i(), p("p", Et, k(t.hint), 1)) : h("", !0),
      t.cta ? (i(), P(Q, {
        key: 1,
        icon: t.ctaIcon,
        onClick: b[0] || (b[0] = (c) => u("cta"))
      }, {
        default: g(() => [
          C(k(t.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : h("", !0)
    ]));
  }
}), Nt = { class: "km-drawer-title" }, At = /* @__PURE__ */ M({
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
    const u = t, v = r, b = y(() => u.wide ? "min(720px, calc(100vw - 36px))" : "min(560px, calc(100vw - 36px))");
    function c(s) {
      s || v("close");
    }
    return (s, $) => (i(), P(e(nt), {
      visible: t.open,
      position: "right",
      modal: !0,
      pt: { content: { class: "km-drawer-content" } },
      dismissable: !0,
      "close-on-escape": !0,
      style: je({ width: b.value }),
      "aria-label": t.title,
      "onUpdate:visible": c
    }, qe({
      header: g(() => [
        t.back ? (i(), P(L, {
          key: 0,
          icon: "tabler:chevron-left",
          label: "Back",
          onClick: $[0] || ($[0] = (V) => v("back"))
        })) : h("", !0),
        o("span", Nt, [
          t.icon ? (i(), P(e(A), {
            key: 0,
            icon: t.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : h("", !0),
          C(k(t.title), 1)
        ])
      ]),
      default: g(() => [
        G(s.$slots, "default")
      ]),
      _: 2
    }, [
      s.$slots.footer ? {
        name: "footer",
        fn: g(() => [
          G(s.$slots, "footer")
        ]),
        key: "0"
      } : void 0
    ]), 1032, ["visible", "style", "aria-label"]));
  }
});
function Ot(t) {
  if (!t) return null;
  let r;
  if (typeof t == "number")
    r = t;
  else {
    const u = t.trim();
    if (/^\d+$/.test(u))
      r = Number(u);
    else {
      const v = Date.parse(u);
      return Number.isNaN(v) ? null : v;
    }
  }
  return Number.isFinite(r) ? r < 1e12 ? r * 1e3 : r : null;
}
function Bt(t) {
  const r = Ot(t);
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
    const u = t, v = r, b = y(() => {
      if (!u.discoverable) return "Automatic model discovery is not available for this provider";
      const c = Bt(u.profile.last_discovered_at);
      return c ? `Discover models (last ${c})` : "Discover models";
    });
    return (c, s) => (i(), p("div", {
      class: K(["km-prow", { on: t.selected }])
    }, [
      o("button", {
        class: "km-prow-main",
        title: e(We)(t.profile),
        onClick: s[0] || (s[0] = ($) => v("select"))
      }, [
        d(e(ne), {
          icon: t.providerIcon,
          size: "sm"
        }, null, 8, ["icon"]),
        o("span", Ut, [
          o("span", Rt, [
            o("span", null, k(t.profile.name), 1),
            e(Xe)(t.profile) ? (i(), P(e(A), {
              key: 0,
              icon: "tabler:key",
              class: "km-prow-cred",
              title: "Credentials stored",
              "aria-hidden": "true"
            })) : h("", !0),
            o("span", {
              class: K(["km-prow-dot", e(Ze)(t.profile.status)]),
              title: e(Ye)(t.profile.status),
              "aria-hidden": "true"
            }, null, 10, Lt)
          ]),
          o("span", zt, k(t.adapterTitle), 1)
        ]),
        t.profile.enabled ? h("", !0) : (i(), P(e(B), {
          key: 0,
          severity: "warn"
        }, {
          default: g(() => [...s[4] || (s[4] = [
            C("off", -1)
          ])]),
          _: 1
        }))
      ], 8, It),
      o("div", jt, [
        d(e(L), {
          icon: "tabler:radar-2",
          label: b.value,
          size: "sm",
          disabled: !t.discoverable || t.discovering || t.busy,
          spin: t.discovering,
          onClick: s[1] || (s[1] = ($) => v("discover"))
        }, null, 8, ["label", "disabled", "spin"]),
        d(e(L), {
          icon: "tabler:edit",
          label: "Edit provider",
          size: "sm",
          disabled: t.busy,
          onClick: s[2] || (s[2] = ($) => v("edit"))
        }, null, 8, ["disabled"]),
        d(e(L), {
          icon: "tabler:trash",
          label: "Delete provider",
          size: "sm",
          variant: "danger",
          disabled: t.busy,
          onClick: s[3] || (s[3] = ($) => v("delete"))
        }, null, 8, ["disabled"])
      ]),
      t.profile.message ? (i(), p("div", qt, k(t.profile.message), 1)) : h("", !0)
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
    const u = t, v = r, b = ae(() => u.adapters, () => u.profiles, () => u.presets);
    return (c, s) => (i(), p("div", Jt, [
      o("button", {
        class: K(["km-plist-all", { on: t.selectedId === "all" }]),
        onClick: s[0] || (s[0] = ($) => v("select", "all"))
      }, " All providers ", 2),
      t.profiles.length ? h("", !0) : (i(), p("div", Kt, [
        s[3] || (s[3] = o("p", null, "No providers connected.", -1)),
        d(e(Q), {
          small: "",
          icon: "tabler:plus",
          onClick: s[1] || (s[1] = ($) => v("add"))
        }, {
          default: g(() => [...s[2] || (s[2] = [
            C("Add provider", -1)
          ])]),
          _: 1
        })
      ])),
      (i(!0), p(U, null, z(t.profiles, ($) => (i(), P(Ft, {
        key: $.id,
        profile: $,
        "provider-icon": e(b).providerIcon($.provider_id),
        "adapter-title": e(b).adapterTitle($.provider_id),
        selected: t.selectedId === $.id,
        discoverable: e(b).isDiscoverable($),
        discovering: t.discovering === $.id,
        busy: t.busy,
        onSelect: (V) => v("select", $.id),
        onEdit: (V) => v("edit", $),
        onDiscover: (V) => v("discover", $),
        onDelete: (V) => v("delete", $)
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
}, ul = { class: "km-probe-grid" }, cl = { class: "km-probe-kv" }, ml = {
  key: 0,
  class: "km-probe-kv"
}, vl = {
  key: 1,
  class: "km-probe-kv"
}, pl = {
  key: 2,
  class: "km-probe-kv"
}, bl = {
  key: 3,
  class: "km-probe-kv"
}, kl = {
  key: 4,
  class: "km-probe-kv"
}, fl = { class: "km-probe-kv" }, gl = {
  key: 0,
  class: "km-probe-tokens"
}, yl = {
  key: 1,
  class: "km-probe-out"
}, $l = {
  key: 2,
  class: "km-probe-out"
}, ke = 5, hl = /* @__PURE__ */ M({
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
    const u = t, v = r, b = y(() => u.model.capabilities ?? []), c = y(() => b.value.slice(0, ke)), s = y(() => Math.max(0, b.value.length - ke)), $ = y(() => b.value.includes("reasoning") || b.value.includes("extended_thinking") || et(u.model, "reasoning_model_request") === "true"), V = y(() => u.model.enabled !== !1 && (b.value.includes("generate") || b.value.includes("tool_use"))), _ = y(() => u.probeState?.model === u.model.name ? u.probeState : null), w = y(() => _.value?.status || "idle"), a = y(() => w.value === "ok" || w.value === "fail"), l = y(() => w.value === "ok" ? "tabler:circle-check" : w.value === "fail" ? "tabler:circle-x" : "tabler:activity-heartbeat"), n = y(() => {
      if (w.value === "ok") return "success";
      if (w.value === "fail") return "danger";
    }), D = y(() => u.probing ? `Checking ${u.model.title || u.model.name}` : w.value === "ok" ? "Model check succeeded. View details" : w.value === "fail" ? "Model check failed. View details" : "Run model check"), T = y(() => {
      const E = _.value?.data?.tokens;
      if (!E) return [];
      const f = ["prompt_tokens", "completion_tokens", "total_tokens", "thinking_tokens"], x = /* @__PURE__ */ new Set(), j = [], q = (F) => {
        const W = E[F];
        typeof W == "number" && W > 0 && !x.has(F) && (x.add(F), j.push({ label: F.replace(/_tokens$/, "").replace(/_input$/, "").replace(/_/g, " "), value: W }));
      };
      return f.forEach(q), Object.keys(E).forEach(q), j;
    });
    function J() {
      a.value ? v("toggle-probe-details") : v("probe");
    }
    return (E, f) => (i(), p("div", {
      class: K(["km-mrow", { "km-mrow-off": t.model.enabled === !1 }])
    }, [
      d(e(ne), { icon: t.providerIcon }, null, 8, ["icon"]),
      o("div", Gt, [
        o("div", Qt, [
          o("span", Wt, k(t.model.title || t.model.name), 1),
          d(e(B), {
            severity: e(tt)(t.model.source)
          }, {
            default: g(() => [
              C(k(e(lt)(t.model.source)), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          t.model.enabled === !1 ? (i(), P(e(B), {
            key: 0,
            severity: "secondary",
            icon: "tabler:ban"
          }, {
            default: g(() => [...f[4] || (f[4] = [
              C("disabled", -1)
            ])]),
            _: 1
          })) : h("", !0)
        ]),
        o("div", Xt, [
          o("span", Yt, k(t.providerTitle || "—"), 1),
          t.model.provider_profile_id ? (i(), p(U, { key: 0 }, [
            C(" · " + k(t.profileTitle), 1)
          ], 64)) : h("", !0),
          o("span", Zt, " · " + k(t.model.name), 1)
        ])
      ]),
      o("div", el, [
        (t.model.class || []).length ? (i(), p("span", tl, [
          (i(!0), p(U, null, z(t.model.class || [], (x) => (i(), P(e(B), {
            key: `k-${x}`,
            severity: "",
            icon: "tabler:category-2"
          }, {
            default: g(() => [
              C(k(x), 1)
            ]),
            _: 2
          }, 1024))), 128))
        ])) : h("", !0),
        o("span", ll, [
          $.value ? (i(), P(e(B), {
            key: 0,
            severity: "info",
            icon: "tabler:bulb"
          }, {
            default: g(() => [...f[5] || (f[5] = [
              C("reasoning", -1)
            ])]),
            _: 1
          })) : h("", !0),
          (i(!0), p(U, null, z(c.value, (x) => (i(), P(e(B), {
            key: `c-${x}`,
            severity: "secondary",
            icon: e(st)(x) || void 0
          }, {
            default: g(() => [
              C(k(x), 1)
            ]),
            _: 2
          }, 1032, ["icon"]))), 128)),
          s.value ? (i(), P(e(B), {
            key: 1,
            severity: "secondary"
          }, {
            default: g(() => [
              C("+" + k(s.value), 1)
            ]),
            _: 1
          })) : h("", !0)
        ])
      ]),
      o("div", sl, [
        o("span", null, [
          o("b", null, k(e(Y)(t.model.max_tokens)), 1),
          f[6] || (f[6] = C(" ctx", -1))
        ]),
        o("span", null, [
          o("b", null, k(e(Y)(t.model.output_tokens)), 1),
          f[7] || (f[7] = C(" out", -1))
        ])
      ]),
      o("div", ol, [
        o("span", null, [
          o("b", null, k(e(Y)(t.model.max_tokens)), 1),
          f[8] || (f[8] = C(" ctx", -1))
        ]),
        o("span", null, [
          o("b", null, k(e(Y)(t.model.output_tokens)), 1),
          f[9] || (f[9] = C(" out", -1))
        ])
      ]),
      o("div", il, [
        V.value ? (i(), P(e(L), {
          key: 0,
          icon: l.value,
          label: D.value,
          size: "sm",
          severity: n.value,
          active: a.value && t.probeDetailsOpen,
          spin: t.probing,
          disabled: t.probing || !a.value && t.busy,
          onClick: J
        }, null, 8, ["icon", "label", "severity", "active", "spin", "disabled"])) : h("", !0),
        d(e(L), {
          icon: t.model.enabled === !1 ? "tabler:circle-check" : "tabler:circle-minus",
          label: t.model.enabled === !1 ? "Enable model" : "Disable model",
          size: "sm",
          variant: t.model.enabled === !1 ? "bordered" : "danger",
          disabled: t.busy,
          onClick: f[0] || (f[0] = (x) => v("toggle-enabled"))
        }, null, 8, ["icon", "label", "variant", "disabled"]),
        d(e(L), {
          icon: "tabler:adjustments",
          label: "Edit model",
          size: "sm",
          onClick: f[1] || (f[1] = (x) => v("edit"))
        }),
        t.model.source !== "registry" ? (i(), P(e(L), {
          key: 1,
          icon: "tabler:trash",
          label: "Delete model",
          size: "sm",
          variant: "danger",
          onClick: f[2] || (f[2] = (x) => v("delete"))
        })) : h("", !0)
      ]),
      t.probeDetailsOpen && a.value ? (i(), p("div", {
        key: 0,
        class: K(["km-mrow-probe", w.value])
      }, [
        o("div", al, [
          d(e(A), {
            icon: w.value === "ok" ? "tabler:circle-check" : "tabler:circle-x",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          o("span", nl, k(_.value?.message), 1),
          _.value?.data && _.value.data.elapsed_ms != null ? (i(), p("span", rl, k(_.value.data.elapsed_ms) + " ms", 1)) : h("", !0),
          d(e(Q), {
            icon: "tabler:activity-heartbeat",
            variant: "ghost",
            small: "",
            disabled: t.probing || t.busy,
            onClick: f[3] || (f[3] = (x) => v("probe"))
          }, {
            default: g(() => [...f[10] || (f[10] = [
              C(" Run again ", -1)
            ])]),
            _: 1
          }, 8, ["disabled"])
        ]),
        _.value?.data ? (i(), p("div", dl, [
          o("div", ul, [
            o("div", cl, [
              f[11] || (f[11] = o("span", null, "Model", -1)),
              o("code", null, k(_.value.data.model), 1)
            ]),
            _.value.data.provider_model ? (i(), p("div", ml, [
              f[12] || (f[12] = o("span", null, "Provider model", -1)),
              o("code", null, k(_.value.data.provider_model), 1)
            ])) : h("", !0),
            _.value.data.provider_id ? (i(), p("div", vl, [
              f[13] || (f[13] = o("span", null, "Provider", -1)),
              o("code", null, k(_.value.data.provider_id), 1)
            ])) : h("", !0),
            _.value.data.provider_profile_id ? (i(), p("div", pl, [
              f[14] || (f[14] = o("span", null, "Profile", -1)),
              o("code", null, k(_.value.data.provider_profile_id), 1)
            ])) : h("", !0),
            _.value.data.finish_reason ? (i(), p("div", bl, [
              f[15] || (f[15] = o("span", null, "Finish", -1)),
              o("code", null, k(_.value.data.finish_reason), 1)
            ])) : h("", !0),
            _.value.data.max_tokens != null ? (i(), p("div", kl, [
              f[16] || (f[16] = o("span", null, "Probe budget", -1)),
              o("code", null, k(_.value.data.max_tokens) + " tok", 1)
            ])) : h("", !0),
            o("div", fl, [
              f[17] || (f[17] = o("span", null, "Reasoning", -1)),
              o("code", null, k(_.value.data.reasoning ? "yes" : "no"), 1)
            ])
          ]),
          T.value.length ? (i(), p("div", gl, [
            f[18] || (f[18] = o("span", { class: "km-probe-tokens-l" }, "Tokens", -1)),
            (i(!0), p(U, null, z(T.value, (x) => (i(), p("span", {
              key: x.label,
              class: "km-probe-tok"
            }, [
              o("b", null, k(x.value), 1),
              C(" " + k(x.label), 1)
            ]))), 128))
          ])) : h("", !0),
          _.value.data.output ? (i(), p("div", yl, [
            f[19] || (f[19] = o("span", null, "Output", -1)),
            o("pre", null, k(_.value.data.output), 1)
          ])) : h("", !0),
          _.value.data.error ? (i(), p("div", $l, [
            f[20] || (f[20] = o("span", null, "Error", -1)),
            o("pre", null, k(_.value.data.error), 1)
          ])) : h("", !0)
        ])) : h("", !0)
      ], 2)) : h("", !0)
    ], 2));
  }
}), se = 120;
function _l(t) {
  const r = $e({
    search: "",
    source: "all",
    capability: "all",
    klass: "all",
    profile: "all",
    provider: "all",
    limit: se
  }), u = y(() => {
    const a = /* @__PURE__ */ new Set();
    for (const l of t.value) for (const n of l.capabilities ?? []) a.add(n);
    return Array.from(a).sort();
  }), v = y(() => {
    const a = /* @__PURE__ */ new Set();
    for (const l of t.value) for (const n of l.class ?? []) a.add(n);
    return Array.from(a).sort();
  }), b = y(() => {
    const a = /* @__PURE__ */ new Set();
    for (const l of t.value) l.provider_id && a.add(l.provider_id);
    return Array.from(a).sort();
  }), c = y(() => {
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
  }), s = y(() => c.value.slice(0, r.limit)), $ = y(() => s.value.length < c.value.length), V = y(
    () => (r.source !== "all" ? 1 : 0) + (r.capability !== "all" ? 1 : 0) + (r.klass !== "all" ? 1 : 0) + (r.profile !== "all" ? 1 : 0) + (r.provider !== "all" ? 1 : 0) + (r.search.trim() ? 1 : 0)
  );
  function _() {
    r.limit += se;
  }
  function w() {
    r.search = "", r.source = "all", r.capability = "all", r.klass = "all", r.profile = "all", r.provider = "all", r.limit = se;
  }
  return {
    state: r,
    capabilityOptions: u,
    classOptions: v,
    providerOptions: b,
    filtered: c,
    visible: s,
    hasMore: $,
    activeCount: V,
    more: _,
    reset: w
  };
}
const Vl = { class: "km-pool" }, wl = { class: "km-pool-head" }, Cl = { class: "km-pool-head-top" }, Pl = { class: "km-pool-title" }, Sl = { class: "km-pool-counts" }, xl = { class: "km-pool-filters" }, Dl = {
  key: 0,
  class: "km-pool-body"
}, Tl = {
  key: 1,
  class: "km-pool-body"
}, Ml = {
  key: 2,
  class: "km-pool-table"
}, El = {
  key: 0,
  class: "km-pool-more"
}, Nl = /* @__PURE__ */ M({
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
    const u = t, v = r, b = ae(() => u.adapters, () => u.profiles, () => u.presets), c = _l(Fe(u, "models")), s = [
      { label: "All sources", value: "all" },
      { label: "Built-in", value: "registry" },
      { label: "Discovered", value: "discovered" },
      { label: "Overlay", value: "overlay" }
    ], $ = y(() => [
      { label: "All providers", value: "all" },
      ...c.providerOptions.value.map((a) => ({ label: b.adapterTitle(a), value: a }))
    ]), V = y(() => [
      { label: "All capabilities", value: "all" },
      ...c.capabilityOptions.value.map((a) => ({ label: a, value: a }))
    ]), _ = y(() => [
      { label: "All classes", value: "all" },
      ...c.classOptions.value.map((a) => ({ label: a, value: a }))
    ]), w = y(() => {
      let a = 0, l = 0, n = 0;
      for (const D of u.models)
        D.source === "registry" ? a++ : D.source === "discovered" ? l++ : n++;
      return { registry: a, discovered: l, overlay: n };
    });
    return ie(() => u.selectedProfileId, (a) => {
      c.state.profile = a || "all";
    }, { immediate: !0 }), (a, l) => (i(), p("div", Vl, [
      o("header", wl, [
        o("div", Cl, [
          o("div", Pl, [
            l[8] || (l[8] = o("span", null, "Model pool", -1)),
            o("span", Sl, [
              d(e(B), { severity: "info" }, {
                default: g(() => [
                  C(k(w.value.registry) + " built-in", 1)
                ]),
                _: 1
              }),
              d(e(B), { severity: "success" }, {
                default: g(() => [
                  C(k(w.value.discovered) + " discovered", 1)
                ]),
                _: 1
              }),
              d(e(B), { severity: "warn" }, {
                default: g(() => [
                  C(k(w.value.overlay) + " overlay", 1)
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
        o("div", xl, [
          d(e(X), {
            modelValue: e(c).state.source,
            "onUpdate:modelValue": l[1] || (l[1] = (n) => e(c).state.source = n),
            options: s,
            "aria-label": "Source"
          }, null, 8, ["modelValue"]),
          d(e(X), {
            modelValue: e(c).state.provider,
            "onUpdate:modelValue": l[2] || (l[2] = (n) => e(c).state.provider = n),
            options: $.value,
            "aria-label": "Provider"
          }, null, 8, ["modelValue", "options"]),
          d(e(X), {
            modelValue: e(c).state.capability,
            "onUpdate:modelValue": l[3] || (l[3] = (n) => e(c).state.capability = n),
            options: V.value,
            "aria-label": "Capability"
          }, null, 8, ["modelValue", "options"]),
          d(e(X), {
            modelValue: e(c).state.klass,
            "onUpdate:modelValue": l[4] || (l[4] = (n) => e(c).state.klass = n),
            options: _.value,
            "aria-label": "Class"
          }, null, 8, ["modelValue", "options"]),
          e(c).activeCount.value ? (i(), P(e(L), {
            key: 0,
            icon: "tabler:filter-off",
            label: "Clear filters",
            variant: "bordered",
            onClick: l[5] || (l[5] = (n) => e(c).reset())
          })) : h("", !0)
        ])
      ]),
      t.models.length ? e(c).filtered.value.length ? (i(), p("div", Ml, [
        l[9] || (l[9] = o("div", { class: "km-pool-cols" }, [
          o("span"),
          o("span", null, "Model"),
          o("span", null, "Capabilities & classes"),
          o("span", { class: "km-pool-cols-r" }, "Limits"),
          o("span")
        ], -1)),
        (i(!0), p(U, null, z(e(c).visible.value, (n) => (i(), P(hl, {
          key: n.name,
          model: n,
          "provider-icon": e(b).providerIcon(n.provider_id),
          "provider-title": e(b).adapterTitle(n.provider_id),
          "profile-title": e(b).profileTitle(n.provider_profile_id),
          probing: t.probingModel === n.name,
          "probe-state": t.probeState,
          "probe-details-open": t.probeDetailsModel === n.name,
          busy: t.busy,
          onEdit: (D) => v("edit", n),
          onDelete: (D) => v("delete", n),
          onProbe: (D) => v("probe", n),
          onToggleProbeDetails: (D) => v("toggle-probe-details", n),
          onToggleEnabled: (D) => v("toggle-enabled", n)
        }, null, 8, ["model", "provider-icon", "provider-title", "profile-title", "probing", "probe-state", "probe-details-open", "busy", "onEdit", "onDelete", "onProbe", "onToggleProbeDetails", "onToggleEnabled"]))), 128)),
        e(c).hasMore.value ? (i(), p("div", El, [
          d(e(Q), {
            variant: "ghost",
            icon: "tabler:chevron-down",
            onClick: l[7] || (l[7] = (n) => e(c).more())
          }, {
            default: g(() => [
              C(" Show more (" + k(e(c).filtered.value.length - e(c).visible.value.length) + ") ", 1)
            ]),
            _: 1
          })
        ])) : h("", !0)
      ])) : (i(), p("div", Tl, [
        d(e(oe), {
          icon: "tabler:search-off",
          title: "No models match",
          hint: "Adjust the search or filters."
        })
      ])) : (i(), p("div", Dl, [
        d(e(oe), {
          icon: "tabler:cpu",
          title: "No models yet",
          hint: "Connect a provider and discover its models, or add one manually.",
          cta: "Add provider",
          "cta-icon": "tabler:plus",
          onCta: l[6] || (l[6] = (n) => v("add"))
        })
      ]))
    ]));
  }
}), Al = { class: "km-classes" }, Ol = {
  key: 0,
  class: "km-pool-body"
}, Bl = {
  key: 1,
  class: "km-pool-table km-classes-list"
}, Il = { class: "km-class-head" }, Ul = { class: "km-class-head-text" }, Rl = { class: "km-class-title" }, Ll = { class: "km-class-ref" }, zl = {
  key: 0,
  class: "km-class-desc"
}, jl = { class: "km-class-meta" }, ql = { class: "km-class-count" }, Fl = {
  key: 0,
  class: "km-class-members"
}, Jl = {
  key: 1,
  class: "km-class-rank"
}, Kl = { class: "km-class-member-name" }, Hl = { class: "km-class-member-id" }, Gl = { class: "km-class-member-pri" }, Ql = {
  key: 1,
  class: "km-class-empty"
}, Wl = /* @__PURE__ */ M({
  __name: "ModelClasses",
  props: {
    classes: {}
  },
  setup(t) {
    return (r, u) => (i(), p("div", Al, [
      t.classes.length ? (i(), p("div", Bl, [
        (i(!0), p(U, null, z(t.classes, (v) => (i(), p("article", {
          key: v.name,
          class: "km-class"
        }, [
          o("div", Il, [
            d(e(ne), {
              icon: v.icon || "tabler:category",
              size: "sm"
            }, null, 8, ["icon"]),
            o("div", Ul, [
              o("div", Rl, [
                C(k(v.title || v.name) + " ", 1),
                o("code", Ll, "class:" + k(v.name), 1)
              ]),
              v.description ? (i(), p("div", zl, k(v.description), 1)) : h("", !0)
            ]),
            o("div", jl, [
              v.declared ? h("", !0) : (i(), P(e(B), {
                key: 0,
                severity: "warn"
              }, {
                default: g(() => [...u[0] || (u[0] = [
                  C("undeclared", -1)
                ])]),
                _: 1
              })),
              d(e(B), { severity: "secondary" }, {
                default: g(() => [
                  C("weight " + k(v.weight ?? 100), 1)
                ]),
                _: 2
              }, 1024),
              o("span", ql, k(v.models.length) + " model" + k(v.models.length === 1 ? "" : "s"), 1)
            ])
          ]),
          v.models.length ? (i(), p("div", Fl, [
            (i(!0), p(U, null, z(v.models, (b, c) => (i(), p("div", {
              key: b.name,
              class: K(["km-class-member", { top: c === 0 }])
            }, [
              c === 0 ? (i(), P(e(B), {
                key: 0,
                severity: "success",
                icon: "tabler:check"
              }, {
                default: g(() => [...u[1] || (u[1] = [
                  C("active", -1)
                ])]),
                _: 1
              })) : (i(), p("span", Jl, k(c + 1), 1)),
              o("span", Kl, k(b.title || b.name), 1),
              o("span", Hl, k(b.name), 1),
              o("span", Gl, "priority " + k(b.priority ?? 0), 1)
            ], 2))), 128))
          ])) : (i(), p("div", Ql, "No models assigned to this class yet."))
        ]))), 128))
      ])) : (i(), p("div", Ol, [
        d(e(oe), {
          icon: "tabler:category-2",
          title: "No model classes",
          hint: "Models declare classes via their class field. A class:<name> reference resolves to the highest-priority member."
        })
      ]))
    ]));
  }
}), Xl = { class: "km-picker" }, Yl = {
  key: 0,
  class: "km-picker-sec"
}, Zl = { class: "km-picker-list" }, es = ["onClick"], ts = { class: "km-picker-ico" }, ls = { class: "km-picker-body" }, ss = { class: "km-picker-name" }, os = { class: "km-picker-desc" }, is = {
  key: 1,
  class: "km-picker-sec"
}, as = { class: "km-picker-list" }, ns = ["onClick"], rs = { class: "km-picker-ico" }, ds = { class: "km-picker-body" }, us = { class: "km-picker-name" }, cs = { class: "km-picker-desc" }, ms = /* @__PURE__ */ M({
  __name: "ProviderPicker",
  props: {
    presets: {}
  },
  emits: ["pick"],
  setup(t, { emit: r }) {
    const u = t, v = r, b = y(() => u.presets.filter((s) => !me(s))), c = y(() => u.presets.filter(me));
    return (s, $) => (i(), p("div", Xl, [
      b.value.length ? (i(), p("section", Yl, [
        $[0] || ($[0] = o("div", { class: "km-picker-sec-title" }, "Native providers", -1)),
        o("div", Zl, [
          (i(!0), p(U, null, z(b.value, (V) => (i(), p("button", {
            key: V.id,
            class: "km-picker-item",
            onClick: (_) => v("pick", V)
          }, [
            o("span", ts, [
              d(e(A), {
                icon: e(ve)(V),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            o("span", ls, [
              o("span", ss, k(V.title), 1),
              o("span", os, k(V.description), 1)
            ]),
            d(e(A), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, es))), 128))
        ])
      ])) : h("", !0),
      c.value.length ? (i(), p("section", is, [
        $[1] || ($[1] = o("div", { class: "km-picker-sec-title" }, "OpenAI-compatible", -1)),
        o("div", as, [
          (i(!0), p(U, null, z(c.value, (V) => (i(), p("button", {
            key: V.id,
            class: "km-picker-item",
            onClick: (_) => v("pick", V)
          }, [
            o("span", rs, [
              d(e(A), {
                icon: e(ve)(V),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            o("span", ds, [
              o("span", us, k(V.title), 1),
              o("span", cs, k(V.config?.base_url || V.description), 1)
            ]),
            d(e(A), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, ns))), 128))
        ])
      ])) : h("", !0)
    ]));
  }
}), vs = { class: "km-form-sec" }, ps = { class: "km-form-id" }, bs = { class: "km-form-sec" }, ks = { class: "km-form-grid" }, fs = { class: "km-form-sec" }, gs = { class: "km-form-sec" }, ys = { class: "km-form-grid" }, $s = { class: "km-form-grid" }, hs = { class: "km-form-sec" }, _s = {
  key: 0,
  class: "km-adv-body"
}, Vs = { class: "km-form-grid" }, ws = ["disabled"], Cs = { class: "km-form-foot" }, Ps = /* @__PURE__ */ M({
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
    const u = t, v = r, b = O(""), c = O(!1), s = $e({
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
      if (b.value = "", c.value = !1, !a) return;
      const l = a.options ?? {};
      s.name = a.name, s.title = a.title || a.name, s.description = a.description || "", s.provider_id = a.provider_id || "", s.provider_profile_id = a.provider_profile_id || "", s.provider_model = a.provider_model || a.name, s.capabilities = [...a.capabilities ?? []], s.classes = [...a.class ?? []], s.priority = Number(a.priority ?? 10), s.max_tokens = Number(a.max_tokens ?? 0), s.output_tokens = Number(a.output_tokens ?? 0), s.dimensions = Number(a.dimensions ?? 0), s.reasoning_model_request = l.reasoning_model_request === !0, s.thinking_effort = typeof l.thinking_effort == "string" || typeof l.thinking_effort == "number" ? l.thinking_effort : "", s.temperature = l.temperature === void 0 ? "" : String(l.temperature), s.options_json = JSON.stringify(l, null, 2), s.source = a.source === "registry" ? "overlay" : a.source || "overlay", s.enabled = a.enabled !== !1;
    }, { immediate: !0 });
    const $ = y(() => u.capabilityOptions ?? []), V = y(() => u.classOptions ?? []), _ = y(() => [
      { label: "Registry default", value: "" },
      ...u.profiles.map((a) => ({ label: a.name, value: a.id }))
    ]);
    function w() {
      b.value = "";
      let a = {};
      try {
        a = JSON.parse(s.options_json || "{}");
      } catch {
        b.value = "model options JSON is invalid", c.value = !0;
        return;
      }
      s.reasoning_model_request ? a.reasoning_model_request = !0 : delete a.reasoning_model_request;
      const l = String(s.thinking_effort).trim(), n = Number(l);
      if (l === "" || Number.isFinite(n) && n <= 0 ? delete a.thinking_effort : a.thinking_effort = Number.isFinite(n) ? n : l, s.temperature !== "") {
        const D = Number(s.temperature);
        if (!Number.isFinite(D) || D < 0 || D > 2) {
          b.value = "temperature must be between 0 and 2";
          return;
        }
        a.temperature = D;
      } else
        delete a.temperature;
      v("save", {
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
    return (a, l) => (i(), p("form", {
      class: "km-form",
      onSubmit: fe(w, ["prevent"])
    }, [
      b.value ? (i(), P(e(he), {
        key: 0,
        severity: "danger",
        onDismiss: l[0] || (l[0] = (n) => b.value = "")
      }, {
        default: g(() => [
          C(k(b.value), 1)
        ]),
        _: 1
      })) : h("", !0),
      o("section", vs, [
        l[20] || (l[20] = o("div", { class: "km-form-sec-title" }, "Identity", -1)),
        d(e(N), { label: "Title" }, {
          default: g(() => [
            d(e(R), {
              modelValue: s.title,
              "onUpdate:modelValue": l[1] || (l[1] = (n) => s.title = n),
              disabled: t.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        d(e(N), { label: "Description" }, {
          default: g(() => [
            d(e(R), {
              modelValue: s.description,
              "onUpdate:modelValue": l[2] || (l[2] = (n) => s.description = n),
              disabled: t.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        o("div", ps, k(s.name), 1)
      ]),
      o("section", bs, [
        l[21] || (l[21] = o("div", { class: "km-form-sec-title" }, "Routing", -1)),
        o("div", ks, [
          d(e(N), { label: "Provider profile" }, {
            default: g(() => [
              d(e(X), {
                modelValue: s.provider_profile_id,
                "onUpdate:modelValue": l[3] || (l[3] = (n) => s.provider_profile_id = n),
                options: _.value,
                "aria-label": "Provider profile"
              }, null, 8, ["modelValue", "options"])
            ]),
            _: 1
          }),
          d(e(N), { label: "Provider model" }, {
            default: g(() => [
              d(e(R), {
                modelValue: s.provider_model,
                "onUpdate:modelValue": l[4] || (l[4] = (n) => s.provider_model = n),
                disabled: t.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      o("section", fs, [
        l[22] || (l[22] = o("div", { class: "km-form-sec-title" }, "Capabilities & classes", -1)),
        d(e(N), { label: "Capabilities" }, {
          default: g(() => [
            d(e(be), {
              modelValue: s.capabilities,
              "onUpdate:modelValue": l[5] || (l[5] = (n) => s.capabilities = n),
              suggestions: $.value,
              placeholder: "Add a capability…",
              disabled: t.saving
            }, null, 8, ["modelValue", "suggestions", "disabled"])
          ]),
          _: 1
        }),
        d(e(N), { label: "Classes" }, {
          default: g(() => [
            d(e(be), {
              modelValue: s.classes,
              "onUpdate:modelValue": l[6] || (l[6] = (n) => s.classes = n),
              suggestions: V.value,
              placeholder: "Add a class…",
              disabled: t.saving
            }, null, 8, ["modelValue", "suggestions", "disabled"])
          ]),
          _: 1
        })
      ]),
      o("section", gs, [
        l[23] || (l[23] = o("div", { class: "km-form-sec-title" }, "Request options", -1)),
        d(e(pe), {
          modelValue: s.reasoning_model_request,
          "onUpdate:modelValue": l[7] || (l[7] = (n) => s.reasoning_model_request = n),
          label: "Reasoning model",
          disabled: t.saving
        }, null, 8, ["modelValue", "disabled"]),
        o("div", ys, [
          d(e(N), { label: "Thinking effort" }, {
            default: g(() => [
              d(e(R), {
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
            default: g(() => [
              d(e(R), {
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
        o("div", $s, [
          d(e(N), { label: "Context" }, {
            default: g(() => [
              d(e(R), {
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
            default: g(() => [
              d(e(R), {
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
      o("section", hs, [
        o("button", {
          type: "button",
          class: K(["km-adv-toggle", { open: c.value }]),
          onClick: l[12] || (l[12] = (n) => c.value = !c.value)
        }, [
          d(e(A), {
            icon: "tabler:chevron-right",
            class: "km-adv-chev",
            "aria-hidden": "true"
          }),
          l[24] || (l[24] = C(" Advanced ", -1))
        ], 2),
        c.value ? (i(), p("div", _s, [
          o("div", Vs, [
            d(e(N), { label: "Provider id" }, {
              default: g(() => [
                d(e(R), {
                  modelValue: s.provider_id,
                  "onUpdate:modelValue": l[13] || (l[13] = (n) => s.provider_id = n),
                  disabled: t.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            d(e(N), { label: "Source" }, {
              default: g(() => [
                d(e(R), {
                  modelValue: s.source,
                  "onUpdate:modelValue": l[14] || (l[14] = (n) => s.source = n),
                  disabled: t.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            d(e(N), { label: "Priority" }, {
              default: g(() => [
                d(e(R), {
                  modelValue: s.priority,
                  "onUpdate:modelValue": l[15] || (l[15] = (n) => s.priority = n),
                  type: "number",
                  disabled: t.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            d(e(N), { label: "Dimensions" }, {
              default: g(() => [
                d(e(R), {
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
            default: g(() => [
              ge(o("textarea", {
                "onUpdate:modelValue": l[17] || (l[17] = (n) => s.options_json = n),
                class: "km-input mono km-textarea",
                disabled: t.saving
              }, null, 8, ws), [
                [ye, s.options_json]
              ])
            ]),
            _: 1
          })
        ])) : h("", !0)
      ]),
      d(e(pe), {
        modelValue: s.enabled,
        "onUpdate:modelValue": l[18] || (l[18] = (n) => s.enabled = n),
        label: "Enabled",
        disabled: t.saving
      }, null, 8, ["modelValue", "disabled"]),
      o("div", Cs, [
        d(e(Q), {
          variant: "ghost",
          disabled: t.saving,
          onClick: l[19] || (l[19] = (n) => v("cancel"))
        }, {
          default: g(() => [...l[25] || (l[25] = [
            C("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        d(e(Q), {
          type: "submit",
          icon: "tabler:device-floppy",
          loading: t.saving
        }, {
          default: g(() => [
            C(k(t.saving ? "Saving" : "Save model"), 1)
          ]),
          _: 1
        }, 8, ["loading"])
      ])
    ], 32));
  }
}), Ss = { class: "km" }, xs = { class: "km-rail-body" }, Ds = "kickside-model-provider-openai-compatible", Ts = "wippy.llm.openai_compat:provider", Ms = /* @__PURE__ */ M({
  __name: "models",
  setup(t) {
    const r = ot(), { adapters: u, presets: v, profiles: b, models: c, classes: s, loading: $, saving: V, discovering: _, probing: w, error: a } = r, l = O("models"), n = ae(() => u.value, () => b.value), D = O("all"), T = O("none"), J = O("create"), E = O(null), f = O(null), x = O(null), j = O({ status: "idle" }), q = O({ status: "idle" }), F = O("");
    function W(m) {
      const S = /* @__PURE__ */ new Set();
      for (const I of c.value) for (const Re of m(I) ?? []) S.add(Re);
      return Array.from(S).sort();
    }
    const _e = y(() => W((m) => m.capabilities)), Ve = y(() => {
      const m = /* @__PURE__ */ new Set();
      for (const S of s.value) S.name && m.add(S.name);
      for (const S of c.value) for (const I of S.class ?? []) m.add(I);
      return Array.from(m).sort();
    }), we = y(
      () => f.value?.provider_id || E.value?.provider_id || Ts
    ), Z = y(() => n.adapterFor(we.value)), ee = y(
      () => E.value?.profile_editor_tag || Z.value?.profile_editor_tag || Ds
    ), Ce = y(() => rt(ee.value)), Pe = y(() => dt(ee.value)), Se = y(() => T.value !== "none"), te = y(() => T.value === "pick" ? { title: "Add provider", icon: "tabler:plug-connected", back: !1 } : T.value === "provider" ? J.value === "edit" ? { title: f.value?.name || "Edit provider", icon: "tabler:plug-connected", back: !1 } : { title: E.value?.title || "Add provider", icon: "tabler:plug-connected", back: !0 } : T.value === "model" ? { title: x.value?.title || x.value?.name || "Edit model", icon: "tabler:adjustments", back: !1 } : { title: "", icon: "", back: !1 });
    function H() {
      V.value || (T.value = "none", E.value = null, f.value = null, x.value = null, j.value = { status: "idle" });
    }
    function le() {
      J.value = "create", E.value = null, f.value = null, T.value = "pick";
    }
    function xe(m) {
      E.value = m, T.value = "provider";
    }
    function De() {
      E.value = null, T.value = "pick";
    }
    function Te(m) {
      J.value = "edit", E.value = null, f.value = m, j.value = { status: "idle" }, T.value = "provider";
    }
    async function re() {
      if (!f.value) return;
      j.value = { status: "testing" };
      const m = await r.testProfile(f.value.id);
      j.value = { status: m.ok ? "ok" : "fail", message: m.message };
    }
    function Me(m) {
      x.value = m, T.value = "model";
    }
    async function de(m) {
      const S = m?.detail ?? m;
      await r.saveProfile(J.value, f.value?.id || "", S) && H();
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
    async function Ae(m) {
      await r.saveCard(Ne(m));
    }
    async function Oe(m) {
      F.value = "", q.value = { status: "testing", model: m.name, message: `Probing ${m.title || m.name}` };
      const S = await r.testModel(m.name);
      q.value = {
        status: S.ok ? "ok" : "fail",
        model: m.name,
        message: S.message,
        data: S.data
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
      const S = m.title || m.name;
      await ue.confirm({
        header: "Delete model",
        message: `Remove “${S}”? This cannot be undone.`,
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
    }), (m, S) => (i(), p("div", Ss, [
      e(a) ? (i(), P(e(he), {
        key: 0,
        severity: "danger",
        class: "km-top-notice",
        onDismiss: S[0] || (S[0] = (I) => a.value = "")
      }, {
        default: g(() => [
          C(k(e(a)), 1)
        ]),
        _: 1
      })) : h("", !0),
      e($) && !e(c).length && !e(b).length ? (i(), P(e(it), {
        key: 1,
        label: "Loading models…"
      })) : (i(), P(e(pt), { key: 2 }, {
        rail: g(() => [
          d(e(yt), {
            title: "Providers",
            count: e(b).length
          }, {
            actions: g(() => [
              d(e(L), {
                icon: "tabler:plus",
                label: "Add provider",
                disabled: e(V),
                onClick: le
              }, null, 8, ["disabled"]),
              d(e(L), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: e($),
                spin: e($),
                onClick: e(r).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          o("div", xs, [
            d(Ht, {
              profiles: e(b),
              adapters: e(u),
              presets: e(v),
              "selected-id": D.value,
              discovering: e(_),
              busy: e(V),
              onSelect: S[1] || (S[1] = (I) => D.value = I),
              onAdd: le,
              onEdit: Te,
              onDiscover: S[2] || (S[2] = (I) => e(r).discover(I.id)),
              onDelete: Ie
            }, null, 8, ["profiles", "adapters", "presets", "selected-id", "discovering", "busy"])
          ])
        ]),
        default: g(() => [
          d(e(He), {
            class: "km-tabs",
            "data-kx-separator": "surface",
            value: l.value,
            "onUpdate:value": S[3] || (S[3] = (I) => l.value = String(I))
          }, {
            default: g(() => [
              d(e(Ke), { "aria-label": "Model sections" }, {
                default: g(() => [
                  d(e(ce), { value: "models" }, {
                    default: g(() => [
                      S[4] || (S[4] = C("Models", -1)),
                      o("b", null, k(e(c).length), 1)
                    ]),
                    _: 1
                  }),
                  d(e(ce), { value: "classes" }, {
                    default: g(() => [
                      S[5] || (S[5] = C("Classes", -1)),
                      o("b", null, k(e(s).length), 1)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["value"]),
          l.value === "models" ? (i(), P(Nl, {
            key: 0,
            "selected-profile-id": D.value,
            models: e(c),
            profiles: e(b),
            adapters: e(u),
            presets: e(v),
            "probing-model": e(w),
            "probe-state": q.value,
            "probe-details-model": F.value,
            busy: e(V),
            onEdit: Me,
            onDelete: Ue,
            onProbe: Oe,
            onToggleProbeDetails: Be,
            onToggleEnabled: Ae,
            onAdd: le
          }, null, 8, ["selected-profile-id", "models", "profiles", "adapters", "presets", "probing-model", "probe-state", "probe-details-model", "busy"])) : (i(), P(Wl, {
            key: 1,
            classes: e(s)
          }, null, 8, ["classes"]))
        ]),
        _: 1
      })),
      d(e(At), {
        open: Se.value,
        title: te.value.title,
        icon: te.value.icon,
        back: te.value.back,
        onClose: H,
        onBack: De
      }, {
        default: g(() => [
          T.value === "pick" ? (i(), P(ms, {
            key: 0,
            presets: e(v),
            onPick: xe
          }, null, 8, ["presets"])) : T.value === "provider" && Pe.value ? (i(), P(ut, {
            key: 1,
            "spec-key": Ce.value,
            mode: J.value,
            adapter: Z.value || void 0,
            preset: E.value || void 0,
            profile: f.value,
            saving: e(V),
            "test-state": j.value,
            onSave: de,
            onCancel: H,
            onTest: re
          }, null, 8, ["spec-key", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : T.value === "provider" ? (i(), P(at, {
            key: 2,
            tag: ee.value,
            mode: J.value,
            adapter: Z.value || void 0,
            preset: E.value || void 0,
            profile: f.value,
            saving: e(V),
            "test-state": j.value,
            onSave: de,
            onCancel: H,
            onTest: re
          }, null, 8, ["tag", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : T.value === "model" ? (i(), P(Ps, {
            key: 3,
            model: x.value,
            profiles: e(b),
            saving: e(V),
            "capability-options": _e.value,
            "class-options": Ve.value,
            onSave: Ee,
            onCancel: H
          }, null, 8, ["model", "profiles", "saving", "capability-options", "class-options"])) : h("", !0)
        ]),
        _: 1
      }, 8, ["open", "title", "icon", "back"])
    ]));
  }
}), Gs = {
  rootComponent: Ms,
  plugins: [Le]
};
export {
  Gs as mountConfig
};
//# sourceMappingURL=lazy-mount-Wgd1wGoQ.js.map

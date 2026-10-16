import { c as K, b as j, W as z } from "./useSessionsApi-WrUiyRNa.js";
import { m as F, P as G } from "./styles-DUbfgJ3E.js";
import { defineComponent as H, ref as c, computed as J, onMounted as O, onBeforeUnmount as Q, openBlock as i, createElementBlock as o, createElementVNode as s, createVNode as n, unref as a, withDirectives as L, vModelText as X, createCommentVNode as w, vModelSelect as Y, withCtx as A, normalizeClass as E, toDisplayString as b, createTextVNode as Z, Fragment as ee, renderList as te, createBlock as M } from "vue";
import { Icon as r } from "@iconify/vue";
import { u as se, s as S } from "./constants-BWUFfCCG.js";
import { on as $, define as ae } from "@wippy-fe/proxy";
import { a as x, b as I } from "./artifactPresentation-Dgf5Fs_k.js";
const ie = { class: "kx kx-artifacts-page" }, le = { class: "kx-head" }, ne = { class: "kx-head-actions" }, oe = { class: "kx-search" }, re = { class: "kx-select-label" }, ce = { class: "kx-body kx-artifacts-body" }, ue = {
  key: 0,
  class: "kx-err",
  role: "alert"
}, de = {
  key: 1,
  class: "kx-loading"
}, pe = {
  key: 2,
  class: "kx-empty"
}, ve = { class: "kx-empty-ico" }, fe = { class: "kx-empty-sub" }, me = {
  key: 3,
  class: "kx-empty"
}, ke = { class: "kx-empty-ico" }, ye = {
  key: 4,
  class: "kx-empty"
}, he = {
  key: 5,
  class: "kx-artifact-grid",
  role: "list",
  "aria-label": "Artifacts"
}, be = ["disabled", "onClick"], xe = {
  class: "kx-artifact-preview",
  "aria-hidden": "true"
}, ge = ["id"], _e = { class: "kx-artifact-copy" }, Ce = ["title"], we = { class: "kx-artifact-meta" }, Ve = { key: 0 }, Ae = {
  key: 6,
  class: "kx-more"
}, Ee = /* @__PURE__ */ H({
  __name: "ArtifactsGallery",
  setup(B) {
    const D = j(), P = se(), g = c([]), d = c(!0), p = c(!1), v = c(""), f = c(""), T = c(""), N = c(!1), m = c(""), _ = c("all"), C = c(""), V = [];
    let k = null, y = 0;
    const U = J(() => {
      const l = m.value.trim().toLowerCase();
      return g.value.filter((e) => _.value !== "all" && e.display_type !== _.value ? !1 : l ? [e.title, e.preview, e.description, e.content_type, e.kind].some((t) => String(t || "").toLowerCase().includes(l)) : !0);
    });
    async function h(l = !0) {
      const e = ++y, t = l ? "" : T.value;
      l ? (d.value = !0, v.value = "") : p.value = !0;
      try {
        const u = await D.artifacts({ limit: 48, cursor: t });
        if (e !== y) return;
        g.value = l ? u.artifacts : [...g.value, ...u.artifacts], T.value = u.nextCursor, N.value = u.hasMore;
      } catch (u) {
        if (e !== y) return;
        v.value = u.message;
      } finally {
        e === y && (d.value = !1, p.value = !1);
      }
    }
    function q() {
      k && clearTimeout(k), k = setTimeout(() => {
        h(!0);
      }, 150);
    }
    async function W(l) {
      const e = x(l);
      if (e) {
        C.value = e, f.value = "";
        try {
          if (!l.session_id) throw new Error("This artifact is not linked to a session.");
          P("artifact-select", { artifactId: e, sessionId: l.session_id });
        } catch (t) {
          f.value = t.message || "Could not open artifact";
        } finally {
          C.value = "";
        }
      }
    }
    return K(() => h(!0)), O(() => {
      V.push($("artifact:*", q)), V.push($("session:*", q));
    }), Q(() => {
      V.forEach((l) => l()), y++, k && clearTimeout(k);
    }), (l, e) => (i(), o("div", ie, [
      s("header", le, [
        e[10] || (e[10] = s("div", { class: "kx-head-text" }, [
          s("h1", { class: "kx-title" }, "Artifacts")
        ], -1)),
        s("div", ne, [
          s("label", oe, [
            e[7] || (e[7] = s("span", { class: "sr-only" }, "Search artifacts", -1)),
            n(a(r), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            L(s("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => m.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search artifacts"
            }, null, 512), [
              [X, m.value]
            ]),
            m.value ? (i(), o("button", {
              key: 0,
              class: "kx-search-clear",
              "aria-label": "Clear search",
              onClick: e[1] || (e[1] = (t) => m.value = "")
            }, [
              n(a(r), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : w("", !0)
          ]),
          s("label", re, [
            e[9] || (e[9] = s("span", { class: "sr-only" }, "Artifact placement", -1)),
            L(s("select", {
              "onUpdate:modelValue": e[2] || (e[2] = (t) => _.value = t),
              class: "kx-select"
            }, [...e[8] || (e[8] = [
              s("option", { value: "all" }, "All artifacts", -1),
              s("option", { value: "standalone" }, "Standalone", -1),
              s("option", { value: "inline" }, "Inline", -1)
            ])], 512), [
              [Y, _.value]
            ])
          ]),
          n(a(S), {
            type: "button",
            severity: "secondary",
            outlined: "",
            title: "Refresh",
            "aria-label": "Refresh artifacts",
            loading: d.value,
            disabled: d.value,
            onClick: e[3] || (e[3] = (t) => h(!0))
          }, {
            icon: A(({ class: t }) => [
              n(a(r), {
                icon: "tabler:refresh",
                class: E(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ])
      ]),
      s("div", ce, [
        f.value ? (i(), o("div", ue, [
          n(a(r), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          s("span", null, b(f.value), 1),
          s("button", {
            class: "kx-err-x",
            "aria-label": "Dismiss",
            onClick: e[4] || (e[4] = (t) => f.value = "")
          }, [
            n(a(r), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])) : w("", !0),
        d.value ? (i(), o("div", de, [
          n(a(r), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          e[11] || (e[11] = Z(" Loading artifacts…", -1))
        ])) : v.value ? (i(), o("div", pe, [
          s("div", ve, [
            n(a(r), {
              icon: "tabler:alert-triangle",
              "aria-hidden": "true"
            })
          ]),
          e[12] || (e[12] = s("div", { class: "kx-empty-title" }, "Couldn’t load artifacts", -1)),
          s("div", fe, b(v.value), 1),
          n(a(S), {
            type: "button",
            label: "Retry",
            onClick: e[5] || (e[5] = (t) => h(!0))
          }, {
            icon: A(({ class: t }) => [
              n(a(r), {
                icon: "tabler:refresh",
                class: E(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])) : g.value.length ? U.value.length ? (i(), o("div", he, [
          (i(!0), o(ee, null, te(U.value, (t) => (i(), o("article", {
            key: a(x)(t),
            class: "kx-artifact-card",
            role: "listitem"
          }, [
            s("button", {
              type: "button",
              class: "kx-artifact-open",
              disabled: C.value === a(x)(t),
              onClick: (u) => W(t)
            }, [
              s("span", xe, [
                s("w-artifact", {
                  id: a(x)(t)
                }, null, 8, ge)
              ]),
              s("span", _e, [
                s("strong", {
                  title: t.title || "Untitled artifact"
                }, b(t.title || "Untitled artifact"), 9, Ce),
                s("span", we, [
                  s("span", null, b(t.display_type || "artifact"), 1),
                  a(I)(t) ? (i(), o("span", Ve, b(a(I)(t)), 1)) : w("", !0)
                ])
              ]),
              C.value === a(x)(t) ? (i(), M(a(r), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin kx-artifact-open-icon",
                "aria-hidden": "true"
              })) : (i(), M(a(r), {
                key: 1,
                icon: "tabler:arrow-up-right",
                class: "kx-artifact-open-icon",
                "aria-hidden": "true"
              }))
            ], 8, be)
          ]))), 128))
        ])) : (i(), o("div", ye, [...e[15] || (e[15] = [
          s("div", { class: "kx-empty-title" }, "No matches", -1),
          s("div", { class: "kx-empty-sub" }, "No loaded artifacts match the current search and placement filter.", -1)
        ])])) : (i(), o("div", me, [
          s("div", ke, [
            n(a(r), {
              icon: "tabler:binary-tree-2",
              "aria-hidden": "true"
            })
          ]),
          e[13] || (e[13] = s("div", { class: "kx-empty-title" }, "No artifacts yet", -1)),
          e[14] || (e[14] = s("div", { class: "kx-empty-sub" }, "Enable the Artifacts capability on an agent, then ask it to create a document, component, or rich response.", -1))
        ])),
        !d.value && !v.value && N.value ? (i(), o("div", Ae, [
          n(a(S), {
            type: "button",
            severity: "secondary",
            outlined: "",
            label: p.value ? "Loading…" : "Load more",
            loading: p.value,
            disabled: p.value,
            onClick: e[6] || (e[6] = (t) => h(!1))
          }, {
            icon: A(({ class: t }) => [
              n(a(r), {
                icon: "tabler:chevron-down",
                class: E(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ])) : w("", !0)
      ])
    ]));
  }
});
class R extends z {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: F
    };
  }
  static get vueConfig() {
    return { rootComponent: Ee, plugins: [G] };
  }
}
async function $e() {
  return R;
}
ae(import.meta.url, R);
export {
  $e as webComponent
};
//# sourceMappingURL=artifacts.js.map

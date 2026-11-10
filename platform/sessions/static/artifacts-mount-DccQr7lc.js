import { P } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as z, ref as u, computed as F, onMounted as G, onBeforeUnmount as H, openBlock as l, createElementBlock as n, createElementVNode as s, createVNode as o, unref as a, withDirectives as M, vModelText as W, createCommentVNode as w, vModelSelect as j, withCtx as S, normalizeClass as V, toDisplayString as b, createTextVNode as J, Fragment as K, renderList as O, createBlock as $ } from "vue";
import { Icon as r } from "@iconify/vue";
import E from "primevue/button";
import { on as B } from "@wippy-fe/proxy";
import { b as Q } from "./wc-runtime-BJD-5iaH.js";
import { u as X } from "./constants-C0dj8rIt.js";
import { u as Y } from "./useSessionsApi-DkMU6ZyM.js";
import { a as x, b as I } from "./artifactPresentation-Dgf5Fs_k.js";
const Z = { class: "kx kx-artifacts-page" }, ee = { class: "kx-head" }, te = { class: "kx-head-actions" }, se = { class: "kx-search" }, ae = { class: "kx-select-label" }, le = { class: "kx-body kx-artifacts-body" }, ie = {
  key: 0,
  class: "kx-err",
  role: "alert"
}, oe = {
  key: 1,
  class: "kx-loading"
}, ne = {
  key: 2,
  class: "kx-empty"
}, re = { class: "kx-empty-ico" }, ue = { class: "kx-empty-sub" }, ce = {
  key: 3,
  class: "kx-empty"
}, de = { class: "kx-empty-ico" }, pe = {
  key: 4,
  class: "kx-empty"
}, ve = {
  key: 5,
  class: "kx-artifact-grid",
  role: "list",
  "aria-label": "Artifacts"
}, fe = ["disabled", "onClick"], me = {
  class: "kx-artifact-preview",
  "aria-hidden": "true"
}, ke = ["id"], ye = { class: "kx-artifact-copy" }, he = ["title"], be = { class: "kx-artifact-meta" }, xe = { key: 0 }, _e = {
  key: 6,
  class: "kx-more"
}, ge = /* @__PURE__ */ z({
  __name: "ArtifactsGallery",
  setup(Ce) {
    const R = Y(), U = X(), _ = u([]), d = u(!0), p = u(!1), v = u(""), f = u(""), N = u(""), T = u(!1), m = u(""), g = u("all"), C = u(""), A = [];
    let k = null, y = 0;
    const q = F(() => {
      const i = m.value.trim().toLowerCase();
      return _.value.filter((e) => g.value !== "all" && e.display_type !== g.value ? !1 : i ? [e.title, e.preview, e.description, e.content_type, e.kind].some((t) => String(t || "").toLowerCase().includes(i)) : !0);
    });
    async function h(i = !0) {
      const e = ++y, t = i ? "" : N.value;
      i ? (d.value = !0, v.value = "") : p.value = !0;
      try {
        const c = await R.artifacts({ limit: 48, cursor: t });
        if (e !== y) return;
        _.value = i ? c.artifacts : [..._.value, ...c.artifacts], N.value = c.nextCursor, T.value = c.hasMore;
      } catch (c) {
        if (e !== y) return;
        v.value = c.message;
      } finally {
        e === y && (d.value = !1, p.value = !1);
      }
    }
    function L() {
      k && clearTimeout(k), k = setTimeout(() => {
        h(!0);
      }, 150);
    }
    async function D(i) {
      const e = x(i);
      if (e) {
        C.value = e, f.value = "";
        try {
          if (!i.session_id) throw new Error("This artifact is not linked to a session.");
          U("artifact-select", { artifactId: e, sessionId: i.session_id });
        } catch (t) {
          f.value = t.message || "Could not open artifact";
        } finally {
          C.value = "";
        }
      }
    }
    return Q(() => h(!0)), G(() => {
      A.push(B("artifact:*", L)), A.push(B("session:*", L));
    }), H(() => {
      A.forEach((i) => i()), y++, k && clearTimeout(k);
    }), (i, e) => (l(), n("div", Z, [
      s("header", ee, [
        e[10] || (e[10] = s("div", { class: "kx-head-text" }, [
          s("h1", { class: "kx-title" }, "Artifacts")
        ], -1)),
        s("div", te, [
          s("label", se, [
            e[7] || (e[7] = s("span", { class: "sr-only" }, "Search artifacts", -1)),
            o(a(r), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            M(s("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => m.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search artifacts"
            }, null, 512), [
              [W, m.value]
            ]),
            m.value ? (l(), n("button", {
              key: 0,
              class: "kx-search-clear",
              "aria-label": "Clear search",
              onClick: e[1] || (e[1] = (t) => m.value = "")
            }, [
              o(a(r), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : w("", !0)
          ]),
          s("label", ae, [
            e[9] || (e[9] = s("span", { class: "sr-only" }, "Artifact placement", -1)),
            M(s("select", {
              "onUpdate:modelValue": e[2] || (e[2] = (t) => g.value = t),
              class: "kx-select"
            }, [...e[8] || (e[8] = [
              s("option", { value: "all" }, "All artifacts", -1),
              s("option", { value: "standalone" }, "Standalone", -1),
              s("option", { value: "inline" }, "Inline", -1)
            ])], 512), [
              [j, g.value]
            ])
          ]),
          o(a(E), {
            type: "button",
            severity: "secondary",
            outlined: "",
            title: "Refresh",
            "aria-label": "Refresh artifacts",
            loading: d.value,
            disabled: d.value,
            onClick: e[3] || (e[3] = (t) => h(!0))
          }, {
            icon: S(({ class: t }) => [
              o(a(r), {
                icon: "tabler:refresh",
                class: V(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ])
      ]),
      s("div", le, [
        f.value ? (l(), n("div", ie, [
          o(a(r), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          s("span", null, b(f.value), 1),
          s("button", {
            class: "kx-err-x",
            "aria-label": "Dismiss",
            onClick: e[4] || (e[4] = (t) => f.value = "")
          }, [
            o(a(r), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])) : w("", !0),
        d.value ? (l(), n("div", oe, [
          o(a(r), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          e[11] || (e[11] = J(" Loading artifacts…", -1))
        ])) : v.value ? (l(), n("div", ne, [
          s("div", re, [
            o(a(r), {
              icon: "tabler:alert-triangle",
              "aria-hidden": "true"
            })
          ]),
          e[12] || (e[12] = s("div", { class: "kx-empty-title" }, "Couldn’t load artifacts", -1)),
          s("div", ue, b(v.value), 1),
          o(a(E), {
            type: "button",
            label: "Retry",
            onClick: e[5] || (e[5] = (t) => h(!0))
          }, {
            icon: S(({ class: t }) => [
              o(a(r), {
                icon: "tabler:refresh",
                class: V(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])) : _.value.length ? q.value.length ? (l(), n("div", ve, [
          (l(!0), n(K, null, O(q.value, (t) => (l(), n("article", {
            key: a(x)(t),
            class: "kx-artifact-card",
            role: "listitem"
          }, [
            s("button", {
              type: "button",
              class: "kx-artifact-open",
              disabled: C.value === a(x)(t),
              onClick: (c) => D(t)
            }, [
              s("span", me, [
                s("w-artifact", {
                  id: a(x)(t)
                }, null, 8, ke)
              ]),
              s("span", ye, [
                s("strong", {
                  title: t.title || "Untitled artifact"
                }, b(t.title || "Untitled artifact"), 9, he),
                s("span", be, [
                  s("span", null, b(t.display_type || "artifact"), 1),
                  a(I)(t) ? (l(), n("span", xe, b(a(I)(t)), 1)) : w("", !0)
                ])
              ]),
              C.value === a(x)(t) ? (l(), $(a(r), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin kx-artifact-open-icon",
                "aria-hidden": "true"
              })) : (l(), $(a(r), {
                key: 1,
                icon: "tabler:arrow-up-right",
                class: "kx-artifact-open-icon",
                "aria-hidden": "true"
              }))
            ], 8, fe)
          ]))), 128))
        ])) : (l(), n("div", pe, [...e[15] || (e[15] = [
          s("div", { class: "kx-empty-title" }, "No matches", -1),
          s("div", { class: "kx-empty-sub" }, "No loaded artifacts match the current search and placement filter.", -1)
        ])])) : (l(), n("div", ce, [
          s("div", de, [
            o(a(r), {
              icon: "tabler:binary-tree-2",
              "aria-hidden": "true"
            })
          ]),
          e[13] || (e[13] = s("div", { class: "kx-empty-title" }, "No artifacts yet", -1)),
          e[14] || (e[14] = s("div", { class: "kx-empty-sub" }, "Enable the Artifacts capability on an agent, then ask it to create a document, component, or rich response.", -1))
        ])),
        !d.value && !v.value && T.value ? (l(), n("div", _e, [
          o(a(E), {
            type: "button",
            severity: "secondary",
            outlined: "",
            label: p.value ? "Loading…" : "Load more",
            loading: p.value,
            disabled: p.value,
            onClick: e[6] || (e[6] = (t) => h(!1))
          }, {
            icon: S(({ class: t }) => [
              o(a(r), {
                icon: "tabler:chevron-down",
                class: V(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ])) : w("", !0)
      ])
    ]));
  }
}), Me = {
  rootComponent: ge,
  plugins: [P]
};
export {
  Me as mountConfig
};
//# sourceMappingURL=artifacts-mount-DccQr7lc.js.map

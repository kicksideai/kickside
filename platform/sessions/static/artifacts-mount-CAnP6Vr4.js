import { l as ee, P as te } from "./wc-runtime-D-UdhneU.js";
import { defineComponent as se, ref as p, computed as ae, onMounted as ie, onBeforeUnmount as le, openBlock as n, createElementBlock as r, createElementVNode as s, createVNode as o, unref as a, withDirectives as H, vModelText as ne, createCommentVNode as I, vModelSelect as oe, withCtx as U, normalizeClass as V, toDisplayString as x, createTextVNode as re, Fragment as ce, renderList as de, createBlock as W } from "vue";
import { Icon as c } from "@iconify/vue";
import { u as ue, a as pe, r as ve, b as fe, s as L, c as D } from "./useInventoryRefresh-DU_o_JEV.js";
import { on as R } from "@wippy-fe/proxy";
import { u as he } from "./useSessionsApi-BIuCYu5K.js";
import { a as k, b as X } from "./artifactPresentation-Dh1vHZDS.js";
const me = { class: "kx kx-artifacts-page" }, ke = { class: "kx-head" }, ye = { class: "kx-head-actions" }, xe = { class: "kx-search" }, be = { class: "kx-select-label" }, _e = { class: "kx-body kx-artifacts-body" }, ge = {
  key: 0,
  class: "kx-err",
  role: "alert"
}, Ie = {
  key: 1,
  class: "kx-err",
  role: "alert"
}, Ce = {
  key: 2,
  class: "kx-loading"
}, we = {
  key: 3,
  class: "kx-empty"
}, Ae = { class: "kx-empty-ico" }, Me = { class: "kx-empty-sub" }, Ee = {
  key: 4,
  class: "kx-empty"
}, Se = { class: "kx-empty-ico" }, Pe = {
  key: 5,
  class: "kx-empty"
}, Ne = {
  key: 6,
  class: "kx-artifact-grid",
  role: "list",
  "aria-label": "Artifacts"
}, Ue = ["disabled", "onClick"], Ve = {
  class: "kx-artifact-preview",
  "aria-hidden": "true"
}, Le = ["id"], De = { class: "kx-artifact-copy" }, Re = ["title"], Be = { class: "kx-artifact-meta" }, Ge = { key: 0 }, $e = {
  key: 7,
  class: "kx-more"
}, j = 48, qe = 100, Te = /* @__PURE__ */ se({
  __name: "ArtifactsGallery",
  setup(Ze) {
    const B = he(), J = ue(), v = p([]), C = p(!1), b = p(!1), f = p(""), y = p(""), G = p(""), w = p(!1), _ = p(""), A = p("all"), M = p(""), E = [];
    let h;
    const g = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Set(), $ = ae(() => {
      const i = _.value.trim().toLowerCase();
      return v.value.filter((e) => A.value !== "all" && e.display_type !== A.value ? !1 : i ? [e.title, e.preview, e.description, e.content_type, e.kind].some((t) => String(t || "").toLowerCase().includes(i)) : !0);
    });
    async function N(i) {
      f.value = "";
      try {
        const e = i ? Math.max(j, v.value.length) : j, t = i ? [] : [...v.value], d = t.length + e;
        let u = i ? "" : G.value, m = !1;
        do {
          const l = await B.artifacts({ limit: Math.min(d - t.length, qe), cursor: u });
          t.push(...l.artifacts), u = l.nextCursor, m = l.hasMore;
        } while (m && u && t.length < d);
        v.value = [...new Map(t.filter((l) => !l.session_id || !S.has(l.session_id)).map((l) => [k(l), l])).values()].sort(D), G.value = u, w.value = m, C.value = !0;
      } catch (e) {
        const t = e?.response;
        if (!i && t?.status === 400 && t.data?.error === "Invalid artifact cursor") {
          await N(!0);
          return;
        }
        f.value = e.message;
      }
    }
    async function K() {
      h && await h, await N(!0);
    }
    function q(i) {
      const e = g.get(i.artifactId);
      g.set(i.artifactId, {
        artifactId: i.artifactId,
        sessionId: i.sessionId || e?.sessionId,
        deleted: i.deleted || e?.deleted === !0
      }), z();
    }
    async function O() {
      h && await h;
      const i = [...g.values()];
      g.clear();
      const e = v.value.at(-1), t = new Map(v.value.map((d) => [k(d), d]));
      await Promise.all(i.map(async (d) => {
        const u = d.artifactId, m = d.sessionId || t.get(u)?.session_id;
        if (d.deleted || m && S.has(m)) {
          t.delete(u);
          return;
        }
        try {
          const l = await B.artifact(u);
          g.get(u)?.deleted ? t.delete(u) : (t.has(u) || !w.value || !e || D(l, e) <= 0) && t.set(u, { ...l, session_id: l.session_id || m });
        } catch (l) {
          const F = l?.response?.status;
          F === 404 || F === 403 ? t.delete(u) : y.value = l.message;
        }
      })), v.value = [...t.values()].filter((d) => !d.session_id || !S.has(d.session_id)).sort(D);
    }
    const { refreshing: T, syncing: Z, refresh: P, queueUpdates: z } = pe(K, O);
    async function Q() {
      if (!(Z.value || h || !w.value)) {
        b.value = !0, h = N(!1);
        try {
          await h;
        } finally {
          h = void 0, b.value = !1;
        }
      }
    }
    async function Y(i) {
      const e = k(i);
      if (e) {
        M.value = e, y.value = "";
        try {
          if (!i.session_id) throw new Error("This artifact is not linked to a session.");
          J("artifact-select", { artifactId: e, sessionId: i.session_id });
        } catch (t) {
          y.value = t.message || "Could not open artifact";
        } finally {
          M.value = "";
        }
      }
    }
    return ie(() => {
      E.push(R("artifact:*", (i) => {
        const e = ve(i);
        e && q(e);
      })), E.push(R("session:*", (i) => {
        const e = fe(i);
        e && (e.deleted ? (S.add(e.sessionId), z()) : e.artifactId && q({ artifactId: e.artifactId, sessionId: e.sessionId, deleted: !1 }));
      })), E.push(R("@reconnect", P));
    }), ee(P), le(() => {
      E.forEach((i) => i());
    }), (i, e) => (n(), r("div", me, [
      s("header", ke, [
        e[8] || (e[8] = s("div", { class: "kx-head-text" }, [
          s("h1", { class: "kx-title" }, "Artifacts")
        ], -1)),
        s("div", ye, [
          s("label", xe, [
            e[5] || (e[5] = s("span", { class: "sr-only" }, "Search artifacts", -1)),
            o(a(c), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            H(s("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => _.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search artifacts"
            }, null, 512), [
              [ne, _.value]
            ]),
            _.value ? (n(), r("button", {
              key: 0,
              class: "kx-search-clear",
              "aria-label": "Clear search",
              onClick: e[1] || (e[1] = (t) => _.value = "")
            }, [
              o(a(c), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : I("", !0)
          ]),
          s("label", be, [
            e[7] || (e[7] = s("span", { class: "sr-only" }, "Artifact placement", -1)),
            H(s("select", {
              "onUpdate:modelValue": e[2] || (e[2] = (t) => A.value = t),
              class: "kx-select"
            }, [...e[6] || (e[6] = [
              s("option", { value: "all" }, "All artifacts", -1),
              s("option", { value: "standalone" }, "Standalone", -1),
              s("option", { value: "inline" }, "Inline", -1)
            ])], 512), [
              [oe, A.value]
            ])
          ]),
          o(a(L), {
            type: "button",
            severity: "secondary",
            outlined: "",
            title: "Refresh",
            "aria-label": "Refresh artifacts",
            loading: a(T),
            disabled: a(T),
            onClick: a(P)
          }, {
            icon: U(({ class: t }) => [
              o(a(c), {
                icon: "tabler:refresh",
                class: V(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled", "onClick"])
        ])
      ]),
      s("div", _e, [
        y.value ? (n(), r("div", ge, [
          o(a(c), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          s("span", null, x(y.value), 1),
          s("button", {
            class: "kx-err-x",
            "aria-label": "Dismiss",
            onClick: e[3] || (e[3] = (t) => y.value = "")
          }, [
            o(a(c), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])) : I("", !0),
        C.value && f.value ? (n(), r("div", Ie, [
          o(a(c), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          s("span", null, x(f.value), 1),
          s("button", {
            class: "kx-err-x",
            "aria-label": "Dismiss",
            onClick: e[4] || (e[4] = (t) => f.value = "")
          }, [
            o(a(c), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])) : I("", !0),
        !C.value && !f.value ? (n(), r("div", Ce, [
          o(a(c), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          e[9] || (e[9] = re(" Loading artifacts…", -1))
        ])) : !C.value && f.value ? (n(), r("div", we, [
          s("div", Ae, [
            o(a(c), {
              icon: "tabler:alert-triangle",
              "aria-hidden": "true"
            })
          ]),
          e[10] || (e[10] = s("div", { class: "kx-empty-title" }, "Couldn’t load artifacts", -1)),
          s("div", Me, x(f.value), 1),
          o(a(L), {
            type: "button",
            label: "Retry",
            onClick: a(P)
          }, {
            icon: U(({ class: t }) => [
              o(a(c), {
                icon: "tabler:refresh",
                class: V(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["onClick"])
        ])) : v.value.length ? $.value.length ? (n(), r("div", Ne, [
          (n(!0), r(ce, null, de($.value, (t) => (n(), r("article", {
            key: a(k)(t),
            class: "kx-artifact-card",
            role: "listitem"
          }, [
            s("button", {
              type: "button",
              class: "kx-artifact-open",
              disabled: M.value === a(k)(t),
              onClick: (d) => Y(t)
            }, [
              s("span", Ve, [
                (n(), r("w-artifact", {
                  key: t.content_version,
                  id: a(k)(t)
                }, null, 8, Le))
              ]),
              s("span", De, [
                s("strong", {
                  title: t.title || "Untitled artifact"
                }, x(t.title || "Untitled artifact"), 9, Re),
                s("span", Be, [
                  s("span", null, x(t.display_type || "artifact"), 1),
                  a(X)(t) ? (n(), r("span", Ge, x(a(X)(t)), 1)) : I("", !0)
                ])
              ]),
              M.value === a(k)(t) ? (n(), W(a(c), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin kx-artifact-open-icon",
                "aria-hidden": "true"
              })) : (n(), W(a(c), {
                key: 1,
                icon: "tabler:arrow-up-right",
                class: "kx-artifact-open-icon",
                "aria-hidden": "true"
              }))
            ], 8, Ue)
          ]))), 128))
        ])) : (n(), r("div", Pe, [...e[13] || (e[13] = [
          s("div", { class: "kx-empty-title" }, "No matches", -1),
          s("div", { class: "kx-empty-sub" }, "No loaded artifacts match the current search and placement filter.", -1)
        ])])) : (n(), r("div", Ee, [
          s("div", Se, [
            o(a(c), {
              icon: "tabler:binary-tree-2",
              "aria-hidden": "true"
            })
          ]),
          e[11] || (e[11] = s("div", { class: "kx-empty-title" }, "No artifacts yet", -1)),
          e[12] || (e[12] = s("div", { class: "kx-empty-sub" }, "Enable the Artifacts capability on an agent, then ask it to create a document, component, or rich response.", -1))
        ])),
        w.value ? (n(), r("div", $e, [
          o(a(L), {
            type: "button",
            severity: "secondary",
            outlined: "",
            label: b.value ? "Loading…" : "Load more",
            loading: b.value,
            disabled: b.value || a(Z),
            onClick: Q
          }, {
            icon: U(({ class: t }) => [
              o(a(c), {
                icon: "tabler:chevron-down",
                class: V(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ])) : I("", !0)
      ])
    ]));
  }
}), Ke = {
  rootComponent: Te,
  plugins: [te]
};
export {
  Ke as mountConfig
};
//# sourceMappingURL=artifacts-mount-CAnP6Vr4.js.map

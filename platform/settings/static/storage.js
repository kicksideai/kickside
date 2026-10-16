import { W as q, s as L } from "./styles-BEaF_GAv.js";
import { b as k, s as W, a as K, P as G } from "./index-8Dae-yYb.js";
import { defineComponent as H, ref as g, computed as Q, onMounted as X, openBlock as o, createElementBlock as r, createElementVNode as t, createCommentVNode as u, createVNode as m, unref as p, withCtx as C, createBlock as w, toDisplayString as Y, createTextVNode as z, Fragment as O } from "vue";
import { Icon as y } from "@iconify/vue";
import { api as R, define as Z } from "@wippy-fe/proxy";
const ee = { class: "ap" }, te = { class: "ap-body" }, se = { class: "ap-bar" }, ae = {
  key: 0,
  class: "ap-dirty"
}, ne = {
  key: 0,
  class: "ap-msg ap-err"
}, le = {
  key: 1,
  class: "ap-loading"
}, ie = {
  key: 2,
  class: "ap-cards"
}, oe = { class: "ap-card" }, re = { class: "ap-h" }, ue = { class: "ap-unit" }, pe = ["value"], de = { class: "ap-unit" }, me = ["value"], ve = {
  key: 0,
  class: "ap-card"
}, be = { class: "ap-h" }, ce = { class: "ap-toggle-row" }, ye = { class: "ap-field-grid" }, _e = {
  key: 0,
  class: "ap-fg"
}, fe = {
  key: 1,
  class: "ap-fg"
}, ge = { class: "ap-unit" }, xe = ["value"], ke = {
  key: 2,
  class: "ap-fg"
}, ze = { class: "ap-unit" }, Se = ["value"], Ne = {
  key: 1,
  class: "ap-card"
}, Ce = { class: "ap-h" }, we = { class: "ap-field-grid" }, Re = {
  key: 0,
  class: "ap-fg"
}, he = { class: "ap-unit" }, Me = ["value"], Pe = {
  key: 1,
  class: "ap-fg"
}, Ee = { class: "ap-unit" }, Ie = ["value"], Oe = {
  key: 2,
  class: "ap-fg"
}, Ve = { class: "ap-unit" }, Ae = ["value"], Be = {
  key: 3,
  class: "ap-fg"
}, Te = { class: "ap-unit" }, $e = ["value"], _ = "kickside.uploads", f = "kickside.uploads.documents", l = "kickside.uploads.rasterize", je = /* @__PURE__ */ H({
  __name: "storage",
  setup(V) {
    const A = ["kickside.uploads", "kickside.uploads.documents", "kickside.uploads.rasterize"], S = g(!0), v = g(!1), b = g(""), c = g({}), i = g({});
    let h = "";
    const n = (a, e) => `${a}|${e}`, d = (a, e) => !!c.value[n(a, e)], M = (a, e) => c.value[n(a, e)]?.is_default !== !1, B = (a) => Math.round(Number(a) / (1024 * 1024) * 100) / 100, T = (a) => Math.round(Number(a) * 1024 * 1024), $ = (a) => Math.round(Number(a) / 1e3 * 10) / 10, j = (a) => Math.round(Number(a) * 1e3);
    function D() {
      const a = {};
      for (const e of Object.values(c.value)) {
        const s = n(e.ns, e.key);
        s === n(f, "max_upload_bytes") ? a[s] = B(e.value) : s === n(_, "process_max_execution_ms") ? a[s] = $(e.value) : (e.value, a[s] = e.value);
      }
      i.value = a, h = JSON.stringify(a);
    }
    const N = Q(() => JSON.stringify(i.value) !== h);
    function P(a) {
      const e = i.value[a];
      if (a === n(f, "max_upload_bytes")) return T(e);
      if (a === n(_, "process_max_execution_ms")) return j(e);
      const s = c.value[a];
      return s && typeof s.value == "number" ? Math.trunc(Number(e)) : s && typeof s.value == "boolean" ? !!e : e;
    }
    function U(a) {
      const e = c.value[a];
      return e ? JSON.stringify(P(a)) !== JSON.stringify(e.value) : !1;
    }
    async function x() {
      S.value = !0, b.value = "";
      try {
        const a = await Promise.all(
          A.map((s) => R.get(`/api/v1/settings?namespace=${encodeURIComponent(s)}`).then((I) => I.data?.success ? I.data.settings : []).catch(() => []))
        ), e = {};
        for (const s of a.flat())
          e[n(s.namespace, s.key)] = { ns: s.namespace, key: s.key, value: s.value, is_default: s.is_default !== !1 };
        c.value = e, D();
      } catch (a) {
        b.value = a instanceof Error ? a.message : String(a);
      } finally {
        S.value = !1;
      }
    }
    async function F() {
      v.value = !0, b.value = "";
      try {
        for (const a of Object.keys(i.value)) {
          if (!U(a)) continue;
          const e = c.value[a], { data: s } = await R.put("/api/v1/settings", { namespace: e.ns, key: e.key, value: P(a) });
          if (!s?.success) throw new Error(s?.error || `could not save ${e.key}`);
        }
        await x();
      } catch (a) {
        b.value = a instanceof Error ? a.message : String(a);
      } finally {
        v.value = !1;
      }
    }
    async function E(a, e) {
      v.value = !0;
      try {
        await R.put("/api/v1/settings", { namespace: a, key: e, value: null }), await x();
      } catch (s) {
        b.value = s instanceof Error ? s.message : String(s);
      } finally {
        v.value = !1;
      }
    }
    const J = ["jpeg", "png", "webp"];
    return X(x), (a, e) => (o(), r("div", ee, [
      t("div", te, [
        t("header", se, [
          N.value ? (o(), r("span", ae, "Unsaved changes")) : u("", !0),
          m(p(k), {
            type: "button",
            label: "Discard",
            severity: "secondary",
            outlined: "",
            disabled: !N.value || v.value,
            onClick: x
          }, null, 8, ["disabled"]),
          m(p(k), {
            type: "button",
            label: v.value ? "Saving…" : "Save",
            loading: v.value,
            disabled: !N.value || v.value,
            onClick: F
          }, {
            icon: C(() => [
              v.value ? u("", !0) : (o(), w(p(y), {
                key: 0,
                icon: "tabler:device-floppy",
                "aria-hidden": "true"
              }))
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        b.value ? (o(), r("div", ne, Y(b.value), 1)) : u("", !0),
        S.value ? (o(), r("div", le, [
          m(p(y), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          e[12] || (e[12] = z(" Loading…", -1))
        ])) : (o(), r("div", ie, [
          t("section", oe, [
            t("header", re, [
              m(p(y), {
                icon: "tabler:ruler-2",
                "aria-hidden": "true"
              }),
              e[13] || (e[13] = z(" Limits", -1))
            ]),
            e[20] || (e[20] = t("p", { class: "ap-sub" }, "Ceilings on what a single upload may cost.", -1)),
            d(f, "max_upload_bytes") ? (o(), r(O, { key: 0 }, [
              e[15] || (e[15] = t("label", { class: "ap-blabel" }, "Maximum document size", -1)),
              t("div", ue, [
                t("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: i.value[n(f, "max_upload_bytes")],
                  onInput: e[0] || (e[0] = (s) => i.value[n(f, "max_upload_bytes")] = Number(s.target.value))
                }, null, 40, pe),
                e[14] || (e[14] = t("span", { class: "ap-unit-suffix" }, "MB", -1)),
                M(f, "max_upload_bytes") ? u("", !0) : (o(), w(p(k), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: e[1] || (e[1] = (s) => E(f, "max_upload_bytes"))
                }, {
                  icon: C(() => [
                    m(p(y), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              e[16] || (e[16] = t("p", { class: "ap-hint" }, "Larger documents are rejected at upload; clamped to the converter's hard ceiling.", -1))
            ], 64)) : u("", !0),
            d(_, "process_max_execution_ms") ? (o(), r(O, { key: 1 }, [
              e[18] || (e[18] = t("label", { class: "ap-blabel" }, "Processing time limit", -1)),
              t("div", de, [
                t("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: i.value[n(_, "process_max_execution_ms")],
                  onInput: e[2] || (e[2] = (s) => i.value[n(_, "process_max_execution_ms")] = Number(s.target.value))
                }, null, 40, me),
                e[17] || (e[17] = t("span", { class: "ap-unit-suffix" }, "sec", -1)),
                M(_, "process_max_execution_ms") ? u("", !0) : (o(), w(p(k), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: e[3] || (e[3] = (s) => E(_, "process_max_execution_ms"))
                }, {
                  icon: C(() => [
                    m(p(y), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              e[19] || (e[19] = t("p", { class: "ap-hint" }, "A conversion/OCR run exceeding this is terminated by the job worker and retried.", -1))
            ], 64)) : u("", !0)
          ]),
          d(l, "rasterize_empty_enabled") ? (o(), r("section", ve, [
            t("header", be, [
              m(p(y), {
                icon: "tabler:photo",
                "aria-hidden": "true"
              }),
              e[21] || (e[21] = z(" Page rasterization", -1))
            ]),
            e[28] || (e[28] = t("p", { class: "ap-sub" }, "Render empty or low-text documents to page images so vision captioning can embed them.", -1)),
            t("div", ce, [
              e[22] || (e[22] = t("div", { class: "ap-toggle-text" }, [
                t("span", { class: "ap-toggle-name" }, "Rasterize empty documents"),
                t("span", { class: "ap-toggle-desc" }, "Render pages when little or no text can be extracted.")
              ], -1)),
              m(p(W), {
                "model-value": !!i.value[n(l, "rasterize_empty_enabled")],
                "aria-label": "Rasterize empty documents",
                "onUpdate:modelValue": e[4] || (e[4] = (s) => i.value[n(l, "rasterize_empty_enabled")] = s)
              }, null, 8, ["model-value"])
            ]),
            t("div", ye, [
              d(l, "rasterize_format") ? (o(), r("div", _e, [
                e[23] || (e[23] = t("label", { class: "ap-blabel" }, "Image format", -1)),
                m(p(K), {
                  class: "ap-select",
                  "model-value": i.value[n(l, "rasterize_format")],
                  options: J,
                  "onUpdate:modelValue": e[5] || (e[5] = (s) => i.value[n(l, "rasterize_format")] = s)
                }, null, 8, ["model-value"])
              ])) : u("", !0),
              d(l, "rasterize_dpi") ? (o(), r("div", fe, [
                e[25] || (e[25] = t("label", { class: "ap-blabel" }, "Resolution", -1)),
                t("div", ge, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "36",
                    max: "600",
                    step: "1",
                    value: i.value[n(l, "rasterize_dpi")],
                    onInput: e[6] || (e[6] = (s) => i.value[n(l, "rasterize_dpi")] = Number(s.target.value))
                  }, null, 40, xe),
                  e[24] || (e[24] = t("span", { class: "ap-unit-suffix" }, "DPI", -1))
                ])
              ])) : u("", !0),
              d(l, "rasterize_quality") ? (o(), r("div", ke, [
                e[27] || (e[27] = t("label", { class: "ap-blabel" }, "JPEG/WEBP quality", -1)),
                t("div", ze, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "100",
                    step: "1",
                    value: i.value[n(l, "rasterize_quality")],
                    onInput: e[7] || (e[7] = (s) => i.value[n(l, "rasterize_quality")] = Number(s.target.value))
                  }, null, 40, Se),
                  e[26] || (e[26] = t("span", { class: "ap-unit-suffix" }, "%", -1))
                ])
              ])) : u("", !0)
            ])
          ])) : u("", !0),
          d(l, "rasterize_max_text_bytes") ? (o(), r("section", Ne, [
            t("header", Ce, [
              m(p(y), {
                icon: "tabler:adjustments-alt",
                "aria-hidden": "true"
              }),
              e[29] || (e[29] = z(" Rasterization thresholds", -1))
            ]),
            e[38] || (e[38] = t("p", { class: "ap-sub" }, "When a document is treated as sparse and how rendering is bounded.", -1)),
            t("div", we, [
              d(l, "rasterize_max_text_bytes") ? (o(), r("div", Re, [
                e[31] || (e[31] = t("label", { class: "ap-blabel" }, "Sparse-text threshold", -1)),
                t("div", he, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[n(l, "rasterize_max_text_bytes")],
                    onInput: e[8] || (e[8] = (s) => i.value[n(l, "rasterize_max_text_bytes")] = Number(s.target.value))
                  }, null, 40, Me),
                  e[30] || (e[30] = t("span", { class: "ap-unit-suffix" }, "B/page", -1))
                ])
              ])) : u("", !0),
              d(l, "rasterize_min_source_bytes") ? (o(), r("div", Pe, [
                e[33] || (e[33] = t("label", { class: "ap-blabel" }, "Minimum source size", -1)),
                t("div", Ee, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[n(l, "rasterize_min_source_bytes")],
                    onInput: e[9] || (e[9] = (s) => i.value[n(l, "rasterize_min_source_bytes")] = Number(s.target.value))
                  }, null, 40, Ie),
                  e[32] || (e[32] = t("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : u("", !0),
              d(l, "rasterize_min_page_bytes") ? (o(), r("div", Oe, [
                e[35] || (e[35] = t("label", { class: "ap-blabel" }, "Full-page image threshold", -1)),
                t("div", Ve, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[n(l, "rasterize_min_page_bytes")],
                    onInput: e[10] || (e[10] = (s) => i.value[n(l, "rasterize_min_page_bytes")] = Number(s.target.value))
                  }, null, 40, Ae),
                  e[34] || (e[34] = t("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : u("", !0),
              d(l, "rasterize_batch_pages") ? (o(), r("div", Be, [
                e[37] || (e[37] = t("label", { class: "ap-blabel" }, "Pages per render batch", -1)),
                t("div", Te, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "256",
                    step: "1",
                    value: i.value[n(l, "rasterize_batch_pages")],
                    onInput: e[11] || (e[11] = (s) => i.value[n(l, "rasterize_batch_pages")] = Number(s.target.value))
                  }, null, 40, $e),
                  e[36] || (e[36] = t("span", { class: "ap-unit-suffix" }, "pages", -1))
                ])
              ])) : u("", !0)
            ])
          ])) : u("", !0)
        ]))
      ])
    ]));
  }
}), De = { type: "object", properties: {} };
class Ue extends q {
  static get wippyConfig() {
    return {
      propsSchema: De,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: L
    };
  }
  static get vueConfig() {
    return { rootComponent: je, plugins: [G] };
  }
}
Z(import.meta.url, Ue);
//# sourceMappingURL=storage.js.map

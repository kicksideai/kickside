import { defineComponent as U, ref as g, computed as q, onMounted as L, openBlock as o, createElementBlock as u, createElementVNode as t, createCommentVNode as r, createVNode as m, unref as p, withCtx as w, createBlock as R, toDisplayString as W, createTextVNode as k, Fragment as B } from "vue";
import { Icon as _ } from "@iconify/vue";
import z from "primevue/button";
import G from "primevue/select";
import H from "primevue/toggleswitch";
import { api as M } from "@wippy-fe/proxy";
const K = { class: "ap" }, Q = { class: "ap-body" }, X = { class: "ap-bar" }, Y = {
  key: 0,
  class: "ap-dirty"
}, Z = {
  key: 0,
  class: "ap-msg ap-err"
}, ee = {
  key: 1,
  class: "ap-loading"
}, te = {
  key: 2,
  class: "ap-cards"
}, se = { class: "ap-card" }, ae = { class: "ap-h" }, le = { class: "ap-unit" }, ne = ["value"], ie = { class: "ap-unit" }, oe = ["value"], ue = {
  key: 0,
  class: "ap-card"
}, re = { class: "ap-h" }, pe = { class: "ap-toggle-row" }, de = { class: "ap-field-grid" }, me = {
  key: 0,
  class: "ap-fg"
}, ve = {
  key: 1,
  class: "ap-fg"
}, be = { class: "ap-unit" }, ce = ["value"], _e = {
  key: 2,
  class: "ap-fg"
}, ye = { class: "ap-unit" }, fe = ["value"], ge = {
  key: 1,
  class: "ap-card"
}, xe = { class: "ap-h" }, ke = { class: "ap-field-grid" }, ze = {
  key: 0,
  class: "ap-fg"
}, Ne = { class: "ap-unit" }, Se = ["value"], we = {
  key: 1,
  class: "ap-fg"
}, Re = { class: "ap-unit" }, Me = ["value"], he = {
  key: 2,
  class: "ap-fg"
}, Ce = { class: "ap-unit" }, Ie = ["value"], Ee = {
  key: 3,
  class: "ap-fg"
}, Oe = { class: "ap-unit" }, Be = ["value"], y = "kickside.uploads", f = "kickside.uploads.documents", n = "kickside.uploads.rasterize", Fe = /* @__PURE__ */ U({
  __name: "storage-settings",
  setup(Pe) {
    const P = ["kickside.uploads", "kickside.uploads.documents", "kickside.uploads.rasterize"], N = g(!0), v = g(!1), b = g(""), c = g({}), i = g({});
    let h = "";
    const l = (a, e) => `${a}|${e}`, d = (a, e) => !!c.value[l(a, e)], C = (a, e) => c.value[l(a, e)]?.is_default !== !1, T = (a) => Math.round(Number(a) / (1024 * 1024) * 100) / 100, A = (a) => Math.round(Number(a) * 1024 * 1024), D = (a) => Math.round(Number(a) / 1e3 * 10) / 10, j = (a) => Math.round(Number(a) * 1e3);
    function V() {
      const a = {};
      for (const e of Object.values(c.value)) {
        const s = l(e.ns, e.key);
        s === l(f, "max_upload_bytes") ? a[s] = T(e.value) : s === l(y, "process_max_execution_ms") ? a[s] = D(e.value) : (e.value, a[s] = e.value);
      }
      i.value = a, h = JSON.stringify(a);
    }
    const S = q(() => JSON.stringify(i.value) !== h);
    function I(a) {
      const e = i.value[a];
      if (a === l(f, "max_upload_bytes")) return A(e);
      if (a === l(y, "process_max_execution_ms")) return j(e);
      const s = c.value[a];
      return s && typeof s.value == "number" ? Math.trunc(Number(e)) : s && typeof s.value == "boolean" ? !!e : e;
    }
    function $(a) {
      const e = c.value[a];
      return e ? JSON.stringify(I(a)) !== JSON.stringify(e.value) : !1;
    }
    async function x() {
      N.value = !0, b.value = "";
      try {
        const a = await Promise.all(
          P.map((s) => M.get(`/api/v1/settings?namespace=${encodeURIComponent(s)}`).then((O) => O.data?.success ? O.data.settings : []).catch(() => []))
        ), e = {};
        for (const s of a.flat())
          e[l(s.namespace, s.key)] = { ns: s.namespace, key: s.key, value: s.value, is_default: s.is_default !== !1 };
        c.value = e, V();
      } catch (a) {
        b.value = a instanceof Error ? a.message : String(a);
      } finally {
        N.value = !1;
      }
    }
    async function F() {
      v.value = !0, b.value = "";
      try {
        for (const a of Object.keys(i.value)) {
          if (!$(a)) continue;
          const e = c.value[a], { data: s } = await M.put("/api/v1/settings", { namespace: e.ns, key: e.key, value: I(a) });
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
        await M.put("/api/v1/settings", { namespace: a, key: e, value: null }), await x();
      } catch (s) {
        b.value = s instanceof Error ? s.message : String(s);
      } finally {
        v.value = !1;
      }
    }
    const J = ["jpeg", "png", "webp"];
    return L(x), (a, e) => (o(), u("div", K, [
      t("div", Q, [
        t("header", X, [
          S.value ? (o(), u("span", Y, "Unsaved changes")) : r("", !0),
          m(p(z), {
            type: "button",
            label: "Discard",
            severity: "secondary",
            outlined: "",
            disabled: !S.value || v.value,
            onClick: x
          }, null, 8, ["disabled"]),
          m(p(z), {
            type: "button",
            label: v.value ? "Saving…" : "Save",
            loading: v.value,
            disabled: !S.value || v.value,
            onClick: F
          }, {
            icon: w(() => [
              v.value ? r("", !0) : (o(), R(p(_), {
                key: 0,
                icon: "tabler:device-floppy",
                "aria-hidden": "true"
              }))
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        b.value ? (o(), u("div", Z, W(b.value), 1)) : r("", !0),
        N.value ? (o(), u("div", ee, [
          m(p(_), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          e[12] || (e[12] = k(" Loading…", -1))
        ])) : (o(), u("div", te, [
          t("section", se, [
            t("header", ae, [
              m(p(_), {
                icon: "tabler:ruler-2",
                "aria-hidden": "true"
              }),
              e[13] || (e[13] = k(" Limits", -1))
            ]),
            e[20] || (e[20] = t("p", { class: "ap-sub" }, "Ceilings on what a single upload may cost.", -1)),
            d(f, "max_upload_bytes") ? (o(), u(B, { key: 0 }, [
              e[15] || (e[15] = t("label", { class: "ap-blabel" }, "Maximum document size", -1)),
              t("div", le, [
                t("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: i.value[l(f, "max_upload_bytes")],
                  onInput: e[0] || (e[0] = (s) => i.value[l(f, "max_upload_bytes")] = Number(s.target.value))
                }, null, 40, ne),
                e[14] || (e[14] = t("span", { class: "ap-unit-suffix" }, "MB", -1)),
                C(f, "max_upload_bytes") ? r("", !0) : (o(), R(p(z), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: e[1] || (e[1] = (s) => E(f, "max_upload_bytes"))
                }, {
                  icon: w(() => [
                    m(p(_), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              e[16] || (e[16] = t("p", { class: "ap-hint" }, "Larger documents are rejected at upload; clamped to the converter's hard ceiling.", -1))
            ], 64)) : r("", !0),
            d(y, "process_max_execution_ms") ? (o(), u(B, { key: 1 }, [
              e[18] || (e[18] = t("label", { class: "ap-blabel" }, "Processing time limit", -1)),
              t("div", ie, [
                t("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: i.value[l(y, "process_max_execution_ms")],
                  onInput: e[2] || (e[2] = (s) => i.value[l(y, "process_max_execution_ms")] = Number(s.target.value))
                }, null, 40, oe),
                e[17] || (e[17] = t("span", { class: "ap-unit-suffix" }, "sec", -1)),
                C(y, "process_max_execution_ms") ? r("", !0) : (o(), R(p(z), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: e[3] || (e[3] = (s) => E(y, "process_max_execution_ms"))
                }, {
                  icon: w(() => [
                    m(p(_), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              e[19] || (e[19] = t("p", { class: "ap-hint" }, "A conversion/OCR run exceeding this is terminated by the job worker and retried.", -1))
            ], 64)) : r("", !0)
          ]),
          d(n, "rasterize_empty_enabled") ? (o(), u("section", ue, [
            t("header", re, [
              m(p(_), {
                icon: "tabler:photo",
                "aria-hidden": "true"
              }),
              e[21] || (e[21] = k(" Page rasterization", -1))
            ]),
            e[28] || (e[28] = t("p", { class: "ap-sub" }, "Render empty or low-text documents to page images so vision captioning can embed them.", -1)),
            t("div", pe, [
              e[22] || (e[22] = t("div", { class: "ap-toggle-text" }, [
                t("span", { class: "ap-toggle-name" }, "Rasterize empty documents"),
                t("span", { class: "ap-toggle-desc" }, "Render pages when little or no text can be extracted.")
              ], -1)),
              m(p(H), {
                "model-value": !!i.value[l(n, "rasterize_empty_enabled")],
                "aria-label": "Rasterize empty documents",
                "onUpdate:modelValue": e[4] || (e[4] = (s) => i.value[l(n, "rasterize_empty_enabled")] = s)
              }, null, 8, ["model-value"])
            ]),
            t("div", de, [
              d(n, "rasterize_format") ? (o(), u("div", me, [
                e[23] || (e[23] = t("label", { class: "ap-blabel" }, "Image format", -1)),
                m(p(G), {
                  class: "ap-select",
                  "model-value": i.value[l(n, "rasterize_format")],
                  options: J,
                  "onUpdate:modelValue": e[5] || (e[5] = (s) => i.value[l(n, "rasterize_format")] = s)
                }, null, 8, ["model-value"])
              ])) : r("", !0),
              d(n, "rasterize_dpi") ? (o(), u("div", ve, [
                e[25] || (e[25] = t("label", { class: "ap-blabel" }, "Resolution", -1)),
                t("div", be, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "36",
                    max: "600",
                    step: "1",
                    value: i.value[l(n, "rasterize_dpi")],
                    onInput: e[6] || (e[6] = (s) => i.value[l(n, "rasterize_dpi")] = Number(s.target.value))
                  }, null, 40, ce),
                  e[24] || (e[24] = t("span", { class: "ap-unit-suffix" }, "DPI", -1))
                ])
              ])) : r("", !0),
              d(n, "rasterize_quality") ? (o(), u("div", _e, [
                e[27] || (e[27] = t("label", { class: "ap-blabel" }, "JPEG/WEBP quality", -1)),
                t("div", ye, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "100",
                    step: "1",
                    value: i.value[l(n, "rasterize_quality")],
                    onInput: e[7] || (e[7] = (s) => i.value[l(n, "rasterize_quality")] = Number(s.target.value))
                  }, null, 40, fe),
                  e[26] || (e[26] = t("span", { class: "ap-unit-suffix" }, "%", -1))
                ])
              ])) : r("", !0)
            ])
          ])) : r("", !0),
          d(n, "rasterize_max_text_bytes") ? (o(), u("section", ge, [
            t("header", xe, [
              m(p(_), {
                icon: "tabler:adjustments-alt",
                "aria-hidden": "true"
              }),
              e[29] || (e[29] = k(" Rasterization thresholds", -1))
            ]),
            e[38] || (e[38] = t("p", { class: "ap-sub" }, "When a document is treated as sparse and how rendering is bounded.", -1)),
            t("div", ke, [
              d(n, "rasterize_max_text_bytes") ? (o(), u("div", ze, [
                e[31] || (e[31] = t("label", { class: "ap-blabel" }, "Sparse-text threshold", -1)),
                t("div", Ne, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[l(n, "rasterize_max_text_bytes")],
                    onInput: e[8] || (e[8] = (s) => i.value[l(n, "rasterize_max_text_bytes")] = Number(s.target.value))
                  }, null, 40, Se),
                  e[30] || (e[30] = t("span", { class: "ap-unit-suffix" }, "B/page", -1))
                ])
              ])) : r("", !0),
              d(n, "rasterize_min_source_bytes") ? (o(), u("div", we, [
                e[33] || (e[33] = t("label", { class: "ap-blabel" }, "Minimum source size", -1)),
                t("div", Re, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[l(n, "rasterize_min_source_bytes")],
                    onInput: e[9] || (e[9] = (s) => i.value[l(n, "rasterize_min_source_bytes")] = Number(s.target.value))
                  }, null, 40, Me),
                  e[32] || (e[32] = t("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : r("", !0),
              d(n, "rasterize_min_page_bytes") ? (o(), u("div", he, [
                e[35] || (e[35] = t("label", { class: "ap-blabel" }, "Full-page image threshold", -1)),
                t("div", Ce, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[l(n, "rasterize_min_page_bytes")],
                    onInput: e[10] || (e[10] = (s) => i.value[l(n, "rasterize_min_page_bytes")] = Number(s.target.value))
                  }, null, 40, Ie),
                  e[34] || (e[34] = t("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : r("", !0),
              d(n, "rasterize_batch_pages") ? (o(), u("div", Ee, [
                e[37] || (e[37] = t("label", { class: "ap-blabel" }, "Pages per render batch", -1)),
                t("div", Oe, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "256",
                    step: "1",
                    value: i.value[l(n, "rasterize_batch_pages")],
                    onInput: e[11] || (e[11] = (s) => i.value[l(n, "rasterize_batch_pages")] = Number(s.target.value))
                  }, null, 40, Be),
                  e[36] || (e[36] = t("span", { class: "ap-unit-suffix" }, "pages", -1))
                ])
              ])) : r("", !0)
            ])
          ])) : r("", !0)
        ]))
      ])
    ]));
  }
});
export {
  Fe as default
};
//# sourceMappingURL=storage-settings-BWNhZob8.js.map

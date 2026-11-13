import { defineComponent as q, ref as g, computed as G, onMounted as W, openBlock as o, createElementBlock as r, createElementVNode as s, createCommentVNode as u, createVNode as v, unref as p, withCtx as C, createBlock as w, toDisplayString as H, createTextVNode as k, Fragment as P } from "vue";
import { Icon as _ } from "@iconify/vue";
import z from "primevue/button";
import A from "primevue/select";
import K from "primevue/toggleswitch";
import { api as R } from "@wippy-fe/proxy";
const Q = { class: "ap" }, X = { class: "ap-body" }, Y = { class: "ap-bar" }, Z = {
  key: 0,
  class: "ap-dirty"
}, ee = {
  key: 0,
  class: "ap-msg ap-err"
}, se = {
  key: 1,
  class: "ap-loading"
}, te = {
  key: 2,
  class: "ap-cards"
}, ae = { class: "ap-card" }, le = { class: "ap-h" }, ne = { class: "ap-unit" }, ie = ["value"], oe = { class: "ap-unit" }, re = ["value"], ue = {
  key: 0,
  class: "ap-card"
}, pe = { class: "ap-h" }, de = { class: "ap-toggle-row" }, ve = { class: "ap-field-grid" }, me = {
  key: 0,
  class: "ap-fg"
}, be = {
  key: 1,
  class: "ap-fg"
}, ce = {
  key: 2,
  class: "ap-fg"
}, _e = { class: "ap-unit" }, ye = ["value"], fe = {
  key: 3,
  class: "ap-fg"
}, ge = { class: "ap-unit" }, xe = ["value"], ke = {
  key: 1,
  class: "ap-card"
}, ze = { class: "ap-h" }, Ne = { class: "ap-field-grid" }, Se = {
  key: 0,
  class: "ap-fg"
}, Ce = { class: "ap-unit" }, we = ["value"], Re = {
  key: 1,
  class: "ap-fg"
}, he = { class: "ap-unit" }, Oe = ["value"], Ee = {
  key: 2,
  class: "ap-fg"
}, Ie = { class: "ap-unit" }, Me = ["value"], Pe = {
  key: 3,
  class: "ap-fg"
}, Ae = { class: "ap-unit" }, Be = ["value"], y = "kickside.uploads", f = "kickside.uploads.documents", n = "kickside.uploads.rasterize", Je = /* @__PURE__ */ q({
  __name: "storage-settings",
  setup(Te) {
    const B = ["kickside.uploads", "kickside.uploads.documents", "kickside.uploads.rasterize"], N = g(!0), m = g(!1), b = g(""), c = g({}), i = g({});
    let h = "";
    const l = (a, e) => `${a}|${e}`, d = (a, e) => !!c.value[l(a, e)], O = (a, e) => c.value[l(a, e)]?.is_default !== !1, T = (a) => Math.round(Number(a) / (1024 * 1024) * 100) / 100, D = (a) => Math.round(Number(a) * 1024 * 1024), V = (a) => Math.round(Number(a) / 1e3 * 10) / 10, j = (a) => Math.round(Number(a) * 1e3);
    function F() {
      const a = {};
      for (const e of Object.values(c.value)) {
        const t = l(e.ns, e.key);
        t === l(f, "max_upload_bytes") ? a[t] = T(e.value) : t === l(y, "process_max_execution_ms") ? a[t] = V(e.value) : (e.value, a[t] = e.value);
      }
      i.value = a, h = JSON.stringify(a);
    }
    const S = G(() => JSON.stringify(i.value) !== h);
    function E(a) {
      const e = i.value[a];
      if (a === l(f, "max_upload_bytes")) return D(e);
      if (a === l(y, "process_max_execution_ms")) return j(e);
      const t = c.value[a];
      return t && typeof t.value == "number" ? Math.trunc(Number(e)) : t && typeof t.value == "boolean" ? !!e : e;
    }
    function U(a) {
      const e = c.value[a];
      return e ? JSON.stringify(E(a)) !== JSON.stringify(e.value) : !1;
    }
    async function x() {
      N.value = !0, b.value = "";
      try {
        const a = await Promise.all(
          B.map((t) => R.get(`/api/v1/settings?namespace=${encodeURIComponent(t)}`).then((M) => M.data?.success ? M.data.settings : []).catch(() => []))
        ), e = {};
        for (const t of a.flat())
          e[l(t.namespace, t.key)] = { ns: t.namespace, key: t.key, value: t.value, is_default: t.is_default !== !1 };
        c.value = e, F();
      } catch (a) {
        b.value = a instanceof Error ? a.message : String(a);
      } finally {
        N.value = !1;
      }
    }
    async function $() {
      m.value = !0, b.value = "";
      try {
        for (const a of Object.keys(i.value)) {
          if (!U(a)) continue;
          const e = c.value[a], { data: t } = await R.put("/api/v1/settings", { namespace: e.ns, key: e.key, value: E(a) });
          if (!t?.success) throw new Error(t?.error || `could not save ${e.key}`);
        }
        await x();
      } catch (a) {
        b.value = a instanceof Error ? a.message : String(a);
      } finally {
        m.value = !1;
      }
    }
    async function I(a, e) {
      m.value = !0;
      try {
        await R.put("/api/v1/settings", { namespace: a, key: e, value: null }), await x();
      } catch (t) {
        b.value = t instanceof Error ? t.message : String(t);
      } finally {
        m.value = !1;
      }
    }
    const J = ["jpeg", "png", "webp"], L = ["sparse", "all"];
    return W(x), (a, e) => (o(), r("div", Q, [
      s("div", X, [
        s("header", Y, [
          S.value ? (o(), r("span", Z, "Unsaved changes")) : u("", !0),
          v(p(z), {
            type: "button",
            label: "Discard",
            severity: "secondary",
            outlined: "",
            disabled: !S.value || m.value,
            onClick: x
          }, null, 8, ["disabled"]),
          v(p(z), {
            type: "button",
            label: m.value ? "Saving…" : "Save",
            loading: m.value,
            disabled: !S.value || m.value,
            onClick: $
          }, {
            icon: C(() => [
              m.value ? u("", !0) : (o(), w(p(_), {
                key: 0,
                icon: "tabler:device-floppy",
                "aria-hidden": "true"
              }))
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        b.value ? (o(), r("div", ee, H(b.value), 1)) : u("", !0),
        N.value ? (o(), r("div", se, [
          v(p(_), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          e[13] || (e[13] = k(" Loading…", -1))
        ])) : (o(), r("div", te, [
          s("section", ae, [
            s("header", le, [
              v(p(_), {
                icon: "tabler:ruler-2",
                "aria-hidden": "true"
              }),
              e[14] || (e[14] = k(" Limits", -1))
            ]),
            e[21] || (e[21] = s("p", { class: "ap-sub" }, "Ceilings on what a single upload may cost.", -1)),
            d(f, "max_upload_bytes") ? (o(), r(P, { key: 0 }, [
              e[16] || (e[16] = s("label", { class: "ap-blabel" }, "Maximum document size", -1)),
              s("div", ne, [
                s("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: i.value[l(f, "max_upload_bytes")],
                  onInput: e[0] || (e[0] = (t) => i.value[l(f, "max_upload_bytes")] = Number(t.target.value))
                }, null, 40, ie),
                e[15] || (e[15] = s("span", { class: "ap-unit-suffix" }, "MB", -1)),
                O(f, "max_upload_bytes") ? u("", !0) : (o(), w(p(z), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: e[1] || (e[1] = (t) => I(f, "max_upload_bytes"))
                }, {
                  icon: C(() => [
                    v(p(_), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              e[17] || (e[17] = s("p", { class: "ap-hint" }, "Larger documents are rejected at upload; clamped to the converter's hard ceiling.", -1))
            ], 64)) : u("", !0),
            d(y, "process_max_execution_ms") ? (o(), r(P, { key: 1 }, [
              e[19] || (e[19] = s("label", { class: "ap-blabel" }, "Processing time limit", -1)),
              s("div", oe, [
                s("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: i.value[l(y, "process_max_execution_ms")],
                  onInput: e[2] || (e[2] = (t) => i.value[l(y, "process_max_execution_ms")] = Number(t.target.value))
                }, null, 40, re),
                e[18] || (e[18] = s("span", { class: "ap-unit-suffix" }, "sec", -1)),
                O(y, "process_max_execution_ms") ? u("", !0) : (o(), w(p(z), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: e[3] || (e[3] = (t) => I(y, "process_max_execution_ms"))
                }, {
                  icon: C(() => [
                    v(p(_), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              e[20] || (e[20] = s("p", { class: "ap-hint" }, "A conversion/OCR run exceeding this is terminated by the job worker and retried.", -1))
            ], 64)) : u("", !0)
          ]),
          d(n, "rasterize_empty_enabled") ? (o(), r("section", ue, [
            s("header", pe, [
              v(p(_), {
                icon: "tabler:photo",
                "aria-hidden": "true"
              }),
              e[22] || (e[22] = k(" Page rasterization", -1))
            ]),
            e[31] || (e[31] = s("p", { class: "ap-sub" }, "Choose which document pages to render for OCR across every upload on this installation.", -1)),
            s("div", de, [
              e[23] || (e[23] = s("div", { class: "ap-toggle-text" }, [
                s("span", { class: "ap-toggle-name" }, "Rasterize empty documents"),
                s("span", { class: "ap-toggle-desc" }, "Render document pages using the Pages to OCR selection.")
              ], -1)),
              v(p(K), {
                "model-value": !!i.value[l(n, "rasterize_empty_enabled")],
                "aria-label": "Rasterize empty documents",
                "onUpdate:modelValue": e[4] || (e[4] = (t) => i.value[l(n, "rasterize_empty_enabled")] = t)
              }, null, 8, ["model-value"])
            ]),
            s("div", ve, [
              d(n, "rasterize_page_selection") ? (o(), r("div", me, [
                e[24] || (e[24] = s("label", { class: "ap-blabel" }, "Pages to OCR", -1)),
                v(p(A), {
                  class: "ap-select",
                  "model-value": i.value[l(n, "rasterize_page_selection")],
                  options: L,
                  "onUpdate:modelValue": e[5] || (e[5] = (t) => i.value[l(n, "rasterize_page_selection")] = t)
                }, null, 8, ["model-value"]),
                e[25] || (e[25] = s("p", { class: "ap-hint" }, "Applies to every upload on this installation. All pages runs OCR even on pages that already have text, with more model calls and slower processing. Failed or blank OCR keeps the page’s existing text.", -1))
              ])) : u("", !0),
              d(n, "rasterize_format") ? (o(), r("div", be, [
                e[26] || (e[26] = s("label", { class: "ap-blabel" }, "Image format", -1)),
                v(p(A), {
                  class: "ap-select",
                  "model-value": i.value[l(n, "rasterize_format")],
                  options: J,
                  "onUpdate:modelValue": e[6] || (e[6] = (t) => i.value[l(n, "rasterize_format")] = t)
                }, null, 8, ["model-value"])
              ])) : u("", !0),
              d(n, "rasterize_dpi") ? (o(), r("div", ce, [
                e[28] || (e[28] = s("label", { class: "ap-blabel" }, "Resolution", -1)),
                s("div", _e, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "36",
                    max: "600",
                    step: "1",
                    value: i.value[l(n, "rasterize_dpi")],
                    onInput: e[7] || (e[7] = (t) => i.value[l(n, "rasterize_dpi")] = Number(t.target.value))
                  }, null, 40, ye),
                  e[27] || (e[27] = s("span", { class: "ap-unit-suffix" }, "DPI", -1))
                ])
              ])) : u("", !0),
              d(n, "rasterize_quality") ? (o(), r("div", fe, [
                e[30] || (e[30] = s("label", { class: "ap-blabel" }, "JPEG/WEBP quality", -1)),
                s("div", ge, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "100",
                    step: "1",
                    value: i.value[l(n, "rasterize_quality")],
                    onInput: e[8] || (e[8] = (t) => i.value[l(n, "rasterize_quality")] = Number(t.target.value))
                  }, null, 40, xe),
                  e[29] || (e[29] = s("span", { class: "ap-unit-suffix" }, "%", -1))
                ])
              ])) : u("", !0)
            ])
          ])) : u("", !0),
          d(n, "rasterize_max_text_bytes") ? (o(), r("section", ke, [
            s("header", ze, [
              v(p(_), {
                icon: "tabler:adjustments-alt",
                "aria-hidden": "true"
              }),
              e[32] || (e[32] = k(" Rasterization thresholds", -1))
            ]),
            e[41] || (e[41] = s("p", { class: "ap-sub" }, "When a document is treated as sparse and how rendering is bounded.", -1)),
            s("div", Ne, [
              d(n, "rasterize_max_text_bytes") ? (o(), r("div", Se, [
                e[34] || (e[34] = s("label", { class: "ap-blabel" }, "Sparse-text threshold", -1)),
                s("div", Ce, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[l(n, "rasterize_max_text_bytes")],
                    onInput: e[9] || (e[9] = (t) => i.value[l(n, "rasterize_max_text_bytes")] = Number(t.target.value))
                  }, null, 40, we),
                  e[33] || (e[33] = s("span", { class: "ap-unit-suffix" }, "B/page", -1))
                ])
              ])) : u("", !0),
              d(n, "rasterize_min_source_bytes") ? (o(), r("div", Re, [
                e[36] || (e[36] = s("label", { class: "ap-blabel" }, "Minimum source size", -1)),
                s("div", he, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[l(n, "rasterize_min_source_bytes")],
                    onInput: e[10] || (e[10] = (t) => i.value[l(n, "rasterize_min_source_bytes")] = Number(t.target.value))
                  }, null, 40, Oe),
                  e[35] || (e[35] = s("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : u("", !0),
              d(n, "rasterize_min_page_bytes") ? (o(), r("div", Ee, [
                e[38] || (e[38] = s("label", { class: "ap-blabel" }, "Full-page image threshold", -1)),
                s("div", Ie, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[l(n, "rasterize_min_page_bytes")],
                    onInput: e[11] || (e[11] = (t) => i.value[l(n, "rasterize_min_page_bytes")] = Number(t.target.value))
                  }, null, 40, Me),
                  e[37] || (e[37] = s("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : u("", !0),
              d(n, "rasterize_batch_pages") ? (o(), r("div", Pe, [
                e[40] || (e[40] = s("label", { class: "ap-blabel" }, "Pages per render batch", -1)),
                s("div", Ae, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "256",
                    step: "1",
                    value: i.value[l(n, "rasterize_batch_pages")],
                    onInput: e[12] || (e[12] = (t) => i.value[l(n, "rasterize_batch_pages")] = Number(t.target.value))
                  }, null, 40, Be),
                  e[39] || (e[39] = s("span", { class: "ap-unit-suffix" }, "pages", -1))
                ])
              ])) : u("", !0)
            ])
          ])) : u("", !0)
        ]))
      ])
    ]));
  }
});
export {
  Je as default
};
//# sourceMappingURL=storage-settings-Dlean4pA.js.map

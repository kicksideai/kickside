import { W as le, s as oe } from "./styles-BEaF_GAv.js";
import { b as N, a as J, c as ie, s as re, P as ne } from "./index-D_a_M2q6.js";
import { defineComponent as ue, ref as f, watch as de, computed as q, onMounted as pe, openBlock as r, createElementBlock as d, createElementVNode as s, createCommentVNode as u, createVNode as c, unref as p, withCtx as $, createBlock as V, toDisplayString as B, createTextVNode as C, Fragment as D, normalizeClass as ve } from "vue";
import { Icon as x } from "@iconify/vue";
import { api as S, define as ce } from "@wippy-fe/proxy";
const be = { class: "ap" }, me = { class: "ap-body" }, fe = { class: "ap-bar" }, ge = {
  key: 0,
  class: "ap-dirty"
}, ye = {
  key: 0,
  class: "ap-msg ap-err",
  role: "alert"
}, _e = {
  key: 1,
  class: "ap-loading"
}, xe = {
  key: 2,
  class: "ap-cards"
}, ke = {
  key: 0,
  class: "ap-card",
  "aria-labelledby": "file-storage-heading"
}, Se = {
  id: "file-storage-heading",
  class: "ap-h"
}, we = { class: "ap-fg" }, ze = { class: "ap-fg" }, he = {
  id: "file-storage-resource-help",
  class: "ap-hint"
}, Ne = { class: "ap-fg" }, Ce = { class: "ap-card" }, Ee = { class: "ap-h" }, Oe = { class: "ap-unit" }, Re = ["value"], Ve = { class: "ap-unit" }, Pe = ["value"], Me = {
  key: 1,
  class: "ap-card"
}, Te = { class: "ap-h" }, Ae = { class: "ap-toggle-row" }, Ie = { class: "ap-field-grid" }, Ue = {
  key: 0,
  class: "ap-fg"
}, Je = {
  key: 1,
  class: "ap-fg"
}, $e = { class: "ap-unit" }, Be = ["value"], De = {
  key: 2,
  class: "ap-fg"
}, Fe = { class: "ap-unit" }, je = ["value"], Le = {
  key: 2,
  class: "ap-card"
}, qe = { class: "ap-h" }, We = { class: "ap-field-grid" }, Ge = {
  key: 0,
  class: "ap-fg"
}, Ke = { class: "ap-unit" }, He = ["value"], Qe = {
  key: 1,
  class: "ap-fg"
}, Xe = { class: "ap-unit" }, Ye = ["value"], Ze = {
  key: 2,
  class: "ap-fg"
}, es = { class: "ap-unit" }, ss = ["value"], ts = {
  key: 3,
  class: "ap-fg"
}, as = { class: "ap-unit" }, ls = ["value"], _ = "kickside.uploads.storage", w = "kickside.uploads", z = "kickside.uploads.documents", o = "kickside.uploads.rasterize", os = /* @__PURE__ */ ue({
  __name: "storage",
  setup(W) {
    const G = [_, "kickside.uploads", "kickside.uploads.documents", "kickside.uploads.rasterize"], n = f({ mode: "local", resource_id: "", prefix: "uploads" }), E = f([]), g = f(!1), h = f(""), P = f(!1), K = [{ label: "Keep locally", value: "local" }, { label: "Move to S3 after processing", value: "s3" }];
    let F = "";
    de(n, () => {
      h.value = "";
    }, { deep: !0 });
    const j = q(() => n.value.mode === "local" || !!n.value.resource_id && !!n.value.prefix && E.value.some((t) => t.id === n.value.resource_id)), O = f(!0), b = f(!1), k = f(""), y = f({}), i = f({});
    let L = "";
    const l = (t, e) => `${t}|${e}`, m = (t, e) => !!y.value[l(t, e)], M = (t, e) => y.value[l(t, e)]?.is_default !== !1, H = (t) => Math.round(Number(t) / (1024 * 1024) * 100) / 100, Q = (t) => Math.round(Number(t) * 1024 * 1024), X = (t) => Math.round(Number(t) / 1e3 * 10) / 10, Y = (t) => Math.round(Number(t) * 1e3);
    function Z() {
      const t = {};
      for (const a of Object.values(y.value)) {
        const v = l(a.ns, a.key);
        v !== l(_, "policy") && (v === l(z, "max_upload_bytes") ? t[v] = H(a.value) : v === l(w, "process_max_execution_ms") ? t[v] = X(a.value) : (a.value, t[v] = a.value));
      }
      const e = y.value[l(_, "policy")]?.value;
      n.value = e ? { ...e } : { mode: "local", resource_id: "", prefix: "uploads" }, F = JSON.stringify(n.value), i.value = t, L = JSON.stringify(t);
    }
    const T = q(() => JSON.stringify(i.value) !== L || JSON.stringify(n.value) !== F);
    function A(t) {
      if (t === l(_, "policy")) return { ...n.value };
      const e = i.value[t];
      if (t === l(z, "max_upload_bytes")) return Q(e);
      if (t === l(w, "process_max_execution_ms")) return Y(e);
      const a = y.value[t];
      return a && typeof a.value == "number" ? Math.trunc(Number(e)) : a && typeof a.value == "boolean" ? !!e : e;
    }
    function ee(t) {
      const e = y.value[t];
      return e ? JSON.stringify(A(t)) !== JSON.stringify(e.value) : !1;
    }
    async function R() {
      O.value = !0, k.value = "";
      try {
        const t = await Promise.all(G.map(async (v) => {
          const { data: U } = await S.get(`/api/v1/settings?namespace=${encodeURIComponent(v)}`);
          if (!U?.success) throw new Error(U?.error || "Could not load file settings");
          return U.settings || [];
        })), { data: e } = await S.get("/api/v1/uploads/storage");
        if (!e?.success) throw new Error(e?.error || "Could not load storage destinations");
        E.value = e.resources || [];
        const a = {};
        for (const v of t.flat())
          a[l(v.namespace, v.key)] = { ns: v.namespace, key: v.key, value: v.value, is_default: v.is_default !== !1 };
        y.value = a, Z();
      } catch (t) {
        k.value = t instanceof Error ? t.message : String(t);
      } finally {
        O.value = !1;
      }
    }
    async function se() {
      b.value = !0, k.value = "";
      try {
        for (const t of Object.keys(y.value)) {
          if (!ee(t)) continue;
          const e = y.value[t], { data: a } = t === l(_, "policy") ? await S.post("/api/v1/uploads/storage", A(t)) : await S.put("/api/v1/settings", { namespace: e.ns, key: e.key, value: A(t) });
          if (!a?.success) throw new Error(a?.error || `could not save ${e.key}`);
        }
        await R();
      } catch (t) {
        k.value = t instanceof Error ? t.message : String(t);
      } finally {
        b.value = !1;
      }
    }
    async function I(t, e) {
      b.value = !0;
      try {
        const { data: a } = t === _ && e === "policy" ? await S.delete("/api/v1/uploads/storage") : await S.put("/api/v1/settings", { namespace: t, key: e, value: null });
        if (!a?.success) throw new Error(a?.error || "Could not reset setting");
        await R();
      } catch (a) {
        k.value = a instanceof Error ? a.message : String(a);
      } finally {
        b.value = !1;
      }
    }
    async function te() {
      g.value = !0, h.value = "";
      const t = JSON.stringify(n.value);
      try {
        const { data: e } = await S.post("/api/v1/uploads/storage/test", { ...n.value });
        if (!e?.success) throw new Error(e?.error || "Storage check failed");
        JSON.stringify(n.value) === t && (P.value = !1, h.value = "Upload, read, and cleanup succeeded.");
      } catch (e) {
        JSON.stringify(n.value) === t && (P.value = !0, h.value = e instanceof Error ? e.message : String(e));
      } finally {
        g.value = !1;
      }
    }
    const ae = ["jpeg", "png", "webp"];
    return pe(R), (t, e) => (r(), d("div", be, [
      s("div", me, [
        s("header", fe, [
          T.value ? (r(), d("span", ge, "Unsaved changes")) : u("", !0),
          c(p(N), {
            type: "button",
            label: "Discard",
            severity: "secondary",
            outlined: "",
            disabled: !T.value || b.value,
            onClick: R
          }, null, 8, ["disabled"]),
          c(p(N), {
            type: "button",
            label: b.value ? "Saving…" : "Save",
            loading: b.value,
            disabled: !T.value || b.value || O.value || g.value || !j.value,
            onClick: se
          }, {
            icon: $(() => [
              b.value ? u("", !0) : (r(), V(p(x), {
                key: 0,
                icon: "tabler:device-floppy",
                "aria-hidden": "true"
              }))
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        k.value ? (r(), d("div", ye, B(k.value), 1)) : u("", !0),
        O.value ? (r(), d("div", _e, [
          c(p(x), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          e[16] || (e[16] = C(" Loading…", -1))
        ])) : (r(), d("div", xe, [
          m(_, "policy") ? (r(), d("section", ke, [
            s("header", Se, [
              c(p(x), {
                icon: "tabler:cloud-upload",
                "aria-hidden": "true"
              }),
              e[17] || (e[17] = C(" Processed file storage", -1))
            ]),
            e[23] || (e[23] = s("p", { class: "ap-sub" }, "Choose where newly processed files are kept. Originals, extracted text, images, and previews remain available to sessions and knowledge bases.", -1)),
            s("div", we, [
              e[18] || (e[18] = s("label", {
                id: "file-storage-mode-label",
                for: "file-storage-mode",
                class: "ap-blabel"
              }, "After processing", -1)),
              c(p(J), {
                "input-id": "file-storage-mode",
                modelValue: n.value.mode,
                "onUpdate:modelValue": e[0] || (e[0] = (a) => n.value.mode = a),
                options: K,
                "option-label": "label",
                "option-value": "value",
                disabled: b.value || g.value,
                "aria-labelledby": "file-storage-mode-label"
              }, null, 8, ["modelValue", "disabled"])
            ]),
            n.value.mode === "s3" ? (r(), d(D, { key: 0 }, [
              s("div", ze, [
                e[19] || (e[19] = s("label", {
                  id: "file-storage-resource-label",
                  for: "file-storage-resource",
                  class: "ap-blabel"
                }, "Private S3 destination", -1)),
                c(p(J), {
                  "input-id": "file-storage-resource",
                  modelValue: n.value.resource_id,
                  "onUpdate:modelValue": e[1] || (e[1] = (a) => n.value.resource_id = a),
                  options: E.value,
                  "option-label": "title",
                  "option-value": "id",
                  placeholder: "Select storage",
                  disabled: b.value || g.value,
                  "aria-labelledby": "file-storage-resource-label",
                  "aria-describedby": "file-storage-resource-help"
                }, null, 8, ["modelValue", "options", "disabled"]),
                s("p", he, B(E.value.length ? "Uses the S3 storage configured for this application." : "An administrator must configure native S3 upload storage before enabling this option."), 1)
              ]),
              s("div", Ne, [
                e[20] || (e[20] = s("label", {
                  for: "file-storage-prefix",
                  class: "ap-blabel"
                }, "Folder prefix", -1)),
                c(p(ie), {
                  id: "file-storage-prefix",
                  modelValue: n.value.prefix,
                  "onUpdate:modelValue": e[2] || (e[2] = (a) => n.value.prefix = a),
                  maxlength: 256,
                  disabled: b.value || g.value,
                  "aria-describedby": "file-storage-prefix-help"
                }, null, 8, ["modelValue", "disabled"]),
                e[21] || (e[21] = s("p", {
                  id: "file-storage-prefix-help",
                  class: "ap-hint"
                }, "For example, uploads or workspace/files. Content stays private; this does not publish files to a CDN.", -1))
              ]),
              c(p(N), {
                type: "button",
                label: "Test storage",
                severity: "secondary",
                outlined: "",
                loading: g.value,
                disabled: !j.value || b.value || g.value,
                onClick: te
              }, null, 8, ["loading", "disabled"]),
              h.value ? (r(), d("p", {
                key: 0,
                class: ve(["ap-hint", { "ap-err": P.value }]),
                role: "status"
              }, B(h.value), 3)) : u("", !0),
              e[22] || (e[22] = s("p", { class: "ap-hint" }, "Local bytes are reclaimed only after the S3 copy has been verified. Failed transfers retry in the background.", -1))
            ], 64)) : u("", !0),
            e[24] || (e[24] = s("p", { class: "ap-hint" }, "Changes apply to future uploads. Files already in S3 continue to use that storage when this option is turned off.", -1)),
            M(_, "policy") ? u("", !0) : (r(), V(p(N), {
              key: 1,
              type: "button",
              label: "Reset storage policy",
              severity: "secondary",
              text: "",
              disabled: b.value || g.value,
              onClick: e[3] || (e[3] = (a) => I(_, "policy"))
            }, null, 8, ["disabled"]))
          ])) : u("", !0),
          s("section", Ce, [
            s("header", Ee, [
              c(p(x), {
                icon: "tabler:ruler-2",
                "aria-hidden": "true"
              }),
              e[25] || (e[25] = C(" Limits", -1))
            ]),
            e[32] || (e[32] = s("p", { class: "ap-sub" }, "Ceilings on what a single upload may cost.", -1)),
            m(z, "max_upload_bytes") ? (r(), d(D, { key: 0 }, [
              e[27] || (e[27] = s("label", { class: "ap-blabel" }, "Maximum document size", -1)),
              s("div", Oe, [
                s("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: i.value[l(z, "max_upload_bytes")],
                  onInput: e[4] || (e[4] = (a) => i.value[l(z, "max_upload_bytes")] = Number(a.target.value))
                }, null, 40, Re),
                e[26] || (e[26] = s("span", { class: "ap-unit-suffix" }, "MB", -1)),
                M(z, "max_upload_bytes") ? u("", !0) : (r(), V(p(N), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: e[5] || (e[5] = (a) => I(z, "max_upload_bytes"))
                }, {
                  icon: $(() => [
                    c(p(x), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              e[28] || (e[28] = s("p", { class: "ap-hint" }, "Larger documents are rejected at upload; clamped to the converter's hard ceiling.", -1))
            ], 64)) : u("", !0),
            m(w, "process_max_execution_ms") ? (r(), d(D, { key: 1 }, [
              e[30] || (e[30] = s("label", { class: "ap-blabel" }, "Processing time limit", -1)),
              s("div", Ve, [
                s("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: i.value[l(w, "process_max_execution_ms")],
                  onInput: e[6] || (e[6] = (a) => i.value[l(w, "process_max_execution_ms")] = Number(a.target.value))
                }, null, 40, Pe),
                e[29] || (e[29] = s("span", { class: "ap-unit-suffix" }, "sec", -1)),
                M(w, "process_max_execution_ms") ? u("", !0) : (r(), V(p(N), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: e[7] || (e[7] = (a) => I(w, "process_max_execution_ms"))
                }, {
                  icon: $(() => [
                    c(p(x), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              e[31] || (e[31] = s("p", { class: "ap-hint" }, "A conversion/OCR run exceeding this is terminated by the job worker and retried.", -1))
            ], 64)) : u("", !0)
          ]),
          m(o, "rasterize_empty_enabled") ? (r(), d("section", Me, [
            s("header", Te, [
              c(p(x), {
                icon: "tabler:photo",
                "aria-hidden": "true"
              }),
              e[33] || (e[33] = C(" Page rasterization", -1))
            ]),
            e[40] || (e[40] = s("p", { class: "ap-sub" }, "Render empty or low-text documents to page images so vision captioning can embed them.", -1)),
            s("div", Ae, [
              e[34] || (e[34] = s("div", { class: "ap-toggle-text" }, [
                s("span", { class: "ap-toggle-name" }, "Rasterize empty documents"),
                s("span", { class: "ap-toggle-desc" }, "Render pages when little or no text can be extracted.")
              ], -1)),
              c(p(re), {
                "model-value": !!i.value[l(o, "rasterize_empty_enabled")],
                "aria-label": "Rasterize empty documents",
                "onUpdate:modelValue": e[8] || (e[8] = (a) => i.value[l(o, "rasterize_empty_enabled")] = a)
              }, null, 8, ["model-value"])
            ]),
            s("div", Ie, [
              m(o, "rasterize_format") ? (r(), d("div", Ue, [
                e[35] || (e[35] = s("label", { class: "ap-blabel" }, "Image format", -1)),
                c(p(J), {
                  class: "ap-select",
                  "model-value": i.value[l(o, "rasterize_format")],
                  options: ae,
                  "onUpdate:modelValue": e[9] || (e[9] = (a) => i.value[l(o, "rasterize_format")] = a)
                }, null, 8, ["model-value"])
              ])) : u("", !0),
              m(o, "rasterize_dpi") ? (r(), d("div", Je, [
                e[37] || (e[37] = s("label", { class: "ap-blabel" }, "Resolution", -1)),
                s("div", $e, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "36",
                    max: "600",
                    step: "1",
                    value: i.value[l(o, "rasterize_dpi")],
                    onInput: e[10] || (e[10] = (a) => i.value[l(o, "rasterize_dpi")] = Number(a.target.value))
                  }, null, 40, Be),
                  e[36] || (e[36] = s("span", { class: "ap-unit-suffix" }, "DPI", -1))
                ])
              ])) : u("", !0),
              m(o, "rasterize_quality") ? (r(), d("div", De, [
                e[39] || (e[39] = s("label", { class: "ap-blabel" }, "JPEG/WEBP quality", -1)),
                s("div", Fe, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "100",
                    step: "1",
                    value: i.value[l(o, "rasterize_quality")],
                    onInput: e[11] || (e[11] = (a) => i.value[l(o, "rasterize_quality")] = Number(a.target.value))
                  }, null, 40, je),
                  e[38] || (e[38] = s("span", { class: "ap-unit-suffix" }, "%", -1))
                ])
              ])) : u("", !0)
            ])
          ])) : u("", !0),
          m(o, "rasterize_max_text_bytes") ? (r(), d("section", Le, [
            s("header", qe, [
              c(p(x), {
                icon: "tabler:adjustments-alt",
                "aria-hidden": "true"
              }),
              e[41] || (e[41] = C(" Rasterization thresholds", -1))
            ]),
            e[50] || (e[50] = s("p", { class: "ap-sub" }, "When a document is treated as sparse and how rendering is bounded.", -1)),
            s("div", We, [
              m(o, "rasterize_max_text_bytes") ? (r(), d("div", Ge, [
                e[43] || (e[43] = s("label", { class: "ap-blabel" }, "Sparse-text threshold", -1)),
                s("div", Ke, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[l(o, "rasterize_max_text_bytes")],
                    onInput: e[12] || (e[12] = (a) => i.value[l(o, "rasterize_max_text_bytes")] = Number(a.target.value))
                  }, null, 40, He),
                  e[42] || (e[42] = s("span", { class: "ap-unit-suffix" }, "B/page", -1))
                ])
              ])) : u("", !0),
              m(o, "rasterize_min_source_bytes") ? (r(), d("div", Qe, [
                e[45] || (e[45] = s("label", { class: "ap-blabel" }, "Minimum source size", -1)),
                s("div", Xe, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[l(o, "rasterize_min_source_bytes")],
                    onInput: e[13] || (e[13] = (a) => i.value[l(o, "rasterize_min_source_bytes")] = Number(a.target.value))
                  }, null, 40, Ye),
                  e[44] || (e[44] = s("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : u("", !0),
              m(o, "rasterize_min_page_bytes") ? (r(), d("div", Ze, [
                e[47] || (e[47] = s("label", { class: "ap-blabel" }, "Full-page image threshold", -1)),
                s("div", es, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: i.value[l(o, "rasterize_min_page_bytes")],
                    onInput: e[14] || (e[14] = (a) => i.value[l(o, "rasterize_min_page_bytes")] = Number(a.target.value))
                  }, null, 40, ss),
                  e[46] || (e[46] = s("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : u("", !0),
              m(o, "rasterize_batch_pages") ? (r(), d("div", ts, [
                e[49] || (e[49] = s("label", { class: "ap-blabel" }, "Pages per render batch", -1)),
                s("div", as, [
                  s("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "256",
                    step: "1",
                    value: i.value[l(o, "rasterize_batch_pages")],
                    onInput: e[15] || (e[15] = (a) => i.value[l(o, "rasterize_batch_pages")] = Number(a.target.value))
                  }, null, 40, ls),
                  e[48] || (e[48] = s("span", { class: "ap-unit-suffix" }, "pages", -1))
                ])
              ])) : u("", !0)
            ])
          ])) : u("", !0)
        ]))
      ])
    ]));
  }
}), is = { type: "object", properties: {} };
class rs extends le {
  static get wippyConfig() {
    return {
      propsSchema: is,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: oe
    };
  }
  static get vueConfig() {
    return { rootComponent: os, plugins: [ne] };
  }
}
ce(import.meta.url, rs);
//# sourceMappingURL=storage.js.map

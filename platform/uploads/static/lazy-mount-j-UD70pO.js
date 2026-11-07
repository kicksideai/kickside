import { P as tt } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as je, computed as U, openBlock as m, createBlock as B, unref as a, withCtx as x, createElementBlock as w, createElementVNode as p, createVNode as d, createTextVNode as W, toDisplayString as b, createCommentVNode as P, normalizeClass as k, Fragment as xe, withDirectives as at, renderList as We, vShow as it, ref as h, watch as he, onMounted as nt, onBeforeUnmount as rt, withModifiers as De, withKeys as Oe, isRef as lt } from "vue";
import { a as ot, u as st, b as ut } from "./wc-runtime-KO3cNuNo.js";
import { Icon as g } from "@iconify/vue";
import S from "primevue/button";
import dt from "primevue/tag";
import ct from "primevue/inputgroup";
import Ie from "primevue/inputgroupaddon";
import pt from "primevue/inputtext";
import vt from "primevue/paginator";
import ft from "primevue/select";
import { on as mt, api as q, loadByTagName as gt, host as yt } from "@wippy-fe/proxy";
import wt from "primevue/drawer";
function ne(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function bt(e, t) {
  return e;
}
function ht(e, t, o) {
  if (t !== void 0 && !t) return null;
  const u = ne(e) ? e : {}, E = [
    u,
    ne(u.data) ? u.data : null,
    ne(u.payload) ? u.payload : null,
    ne(u.detail) ? u.detail : null
  ].filter(Boolean);
  for (const v of E) {
    if (v.event !== "component.meta.changed" && v.event !== "component.deleting" && v.event !== "component.deleted") continue;
    const c = String(v.component_id || ""), s = String(u.topic || v.topic || "");
    if (t === void 0) {
      if (!c && (!s.startsWith("component.") || s === "component.")) continue;
    } else if (c && c !== t || !c && s !== `component.${t}`) continue;
    const y = c || t || s.slice(10);
    return v.event === "component.deleting" && typeof v.deletion_job_id == "string" && v.deletion_job_id ? { event: v.event, component_id: y, deletion_job_id: v.deletion_job_id } : v.event !== "component.meta.changed" ? { event: v.event, component_id: y } : {
      event: "component.meta.changed",
      component_id: y,
      meta: bt(ne(v.meta) ? v.meta : {}),
      deleted: Array.isArray(v.deleted) ? v.deleted.map(String) : []
    };
  }
  return null;
}
function kt(e, t, o) {
  const u = ht(e, t);
  return u?.event === "component.meta.changed" ? u : null;
}
function xt(e, t, o) {
  if (!e) return null;
  const u = mt(`component.${e}`, (E) => {
    const v = kt(E, e);
    v && t(v);
  });
  return typeof u == "function" ? u : null;
}
function Pt(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const o = e.trim();
    if (/^\d+$/.test(o))
      t = Number(o);
    else {
      const u = Date.parse(o);
      return Number.isNaN(u) ? null : u;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function Ct(e) {
  const t = Pt(e);
  return t === null ? "" : new Date(t).toLocaleString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function Ue(e) {
  const t = e || "";
  return t.startsWith("image/") ? "tabler:photo" : t === "application/pdf" ? "tabler:file-type-pdf" : t.includes("word") || t.includes("opendocument.text") || t === "application/rtf" ? "tabler:file-type-doc" : t.includes("sheet") || t.includes("excel") || t.includes("spreadsheet") || t === "text/csv" ? "tabler:file-type-xls" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:file-type-ppt" : t === "application/epub+zip" ? "tabler:book" : t.startsWith("text/") || t === "application/json" || t === "application/xml" ? "tabler:file-text" : "tabler:file";
}
function oe(e) {
  if (!e) return "0 B";
  const t = ["B", "KB", "MB", "GB"], o = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1);
  return `${(e / Math.pow(1024, o)).toFixed(o ? 1 : 0)} ${t[o]}`;
}
function K(e) {
  return e === "failed" ? "error" : e || "uploaded";
}
function qe(e) {
  return K(e.status) === "error";
}
function Et(e) {
  switch (K(e)) {
    case "completed":
      return "success";
    case "error":
      return "danger";
    case "processing":
      return "info";
    default:
      return "warn";
  }
}
function Tt(e) {
  const t = K(e);
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function Z(e) {
  return (e.filename || "").trim() || "Untitled upload";
}
function Ge(e) {
  const t = e.mime_type || "";
  if (t.startsWith("image/")) return t.slice(6).toUpperCase() + " image";
  if (t === "application/pdf") return "PDF";
  if (t.includes("word") || t.includes("opendocument.text")) return "Word";
  if (t.includes("sheet") || t.includes("excel") || t.includes("spreadsheet")) return "Spreadsheet";
  if (t.includes("presentation") || t.includes("powerpoint")) return "Presentation";
  if (t === "application/rtf") return "Rich text";
  if (t === "application/epub+zip") return "EPUB";
  if (t === "text/markdown") return "Markdown";
  if (t === "text/csv") return "CSV";
  if (t === "application/json") return "JSON";
  if (t.startsWith("text/")) return "Text";
  const o = (e.filename || "").split(".").pop();
  return o && o !== e.filename ? o.toUpperCase() : t || "File";
}
function Me(e) {
  let t = e.trim().replace(/^[\w.]+:[\w.]+:\d+:\s*/, "");
  return t = t.replace(/(\d{4,})\s*bytes/g, (o, u) => oe(Number(u))), t = t.replace(/\(max\s+(\d{4,})\)/g, (o, u) => `(max ${oe(Number(u))})`), t && t.charAt(0).toUpperCase() + t.slice(1);
}
const St = ["image/", "audio/", "video/", "text/"], At = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/json",
  "application/xml",
  "application/javascript",
  "application/x-yaml",
  "application/sql",
  "application/xhtml+xml"
]);
function ke(e) {
  const t = (e || "").toLowerCase();
  return St.some((o) => t.startsWith(o)) || At.has(t);
}
const $t = ["ocr_error", "asr_error", "conversion_error"], Re = {
  transcription_failed: "Text recognition failed.",
  persist_failed: "The recognized text could not be saved.",
  storage_unavailable: "The stored file could not be read.",
  storage_stat_failed: "The stored file could not be read.",
  storage_read_failed: "The stored file could not be read.",
  storage_pointer_missing: "The stored file is missing.",
  no_text_detected: "No text was found in this file.",
  too_large: "The file is too large for transcription.",
  transcript_too_large: "The transcript is too large to keep."
}, Rt = /* @__PURE__ */ new Set(["no_text_detected", "too_large", "transcript_too_large"]);
function Ut(e) {
  for (const t of $t) {
    const o = e.meta?.[t];
    if (typeof o == "string" && o) return o;
  }
  return "";
}
function Mt(e) {
  const t = Ut(e);
  return qe(e) ? { tone: "error", text: Re[t] || (t ? "Text recognition failed." : e.error ? Me(e.error) : "Upload processing failed.") } : !t || K(e.status) !== "completed" ? null : Rt.has(t) ? { tone: "info", text: Re[t] } : { tone: "info", text: `${Re[t] || "Text recognition did not complete."} The extracted text is shown.` };
}
function Nt(e) {
  const t = K(e.status);
  return t === "completed" || t === "error";
}
const Lt = /* @__PURE__ */ new Set(["completed", "error"]);
function _t(e) {
  return !Lt.has(K(e.status));
}
function G(e) {
  return e.role === "primary" && (e.kind === "markdown" || e.mime_type === "text/markdown");
}
function Ne(e) {
  return G(e) ? "Markdown" : e.role === "extracted-image" ? e.label || "Image" : e.label || e.role || e.kind || e.artifact_id;
}
function Ft(e) {
  const t = typeof e.metadata?.width == "number" && typeof e.metadata?.height == "number" ? `${e.metadata.width}×${e.metadata.height}` : null;
  return [
    G(e) ? "Converted markdown" : e.role === "extracted-image" ? "Extracted image" : e.kind,
    e.mime_type,
    e.size ? oe(e.size) : null,
    t,
    e.occurrence_count && e.occurrence_count > 1 ? `${e.occurrence_count} occurrences` : null
  ].filter(Boolean).join(" · ");
}
function Vt(e) {
  const t = (e || "").toLowerCase();
  return t.startsWith("text/") || t.includes("markdown");
}
const zt = {
  key: 0,
  class: "kx-side"
}, Bt = { class: "kx-pv-head" }, Dt = { class: "kx-ficon" }, Ot = { class: "kx-pv-id" }, It = ["title"], jt = {
  key: 0,
  class: "kx-uuid"
}, Wt = { class: "kx-pv-sub" }, qt = ["role"], Gt = { class: "kx-views" }, Kt = ["content-type", "source-url", "filename", "alt"], Jt = { class: "kx-parts-head" }, Qt = { class: "kx-parts-range" }, Xt = { class: "kx-parts-pager" }, Ht = { class: "kx-parts-pageno" }, Yt = {
  id: "uploads-extracted-parts",
  class: "kx-parts-list",
  role: "region",
  "aria-label": "Extracted parts"
}, Zt = {
  key: 0,
  class: "kx-part-loading"
}, ea = /* @__PURE__ */ je({
  __name: "UploadPreviewDrawer",
  props: {
    preview: {},
    artifactView: {},
    busyAction: { type: Boolean },
    partsExpanded: { type: Boolean },
    currentArtifacts: {},
    partsTotal: {},
    partsPage: {},
    partsPages: {},
    partsRangeStart: {},
    partsRangeEnd: {},
    hasPrimary: { type: Boolean },
    artifactsLoading: { type: Boolean },
    activePreviewSource: { type: Function },
    downloadActive: { type: Function },
    openActive: { type: Function },
    closePreview: { type: Function },
    viewOriginal: { type: Function },
    viewPrimary: { type: Function },
    viewArtifact: { type: Function },
    gotoPartsPage: { type: Function },
    retrying: { type: Boolean },
    retryUpload: { type: Function }
  },
  emits: ["update:partsExpanded"],
  setup(e, { emit: t }) {
    const o = e, u = U(() => o.preview ? Mt(o.preview) : null), E = t;
    return (v, c) => (m(), B(a(wt), {
      visible: !!e.preview,
      position: "right",
      modal: !0,
      dismissable: !0,
      "close-on-escape": !0,
      "show-close-icon": !1,
      class: "kx-side-drawer",
      pt: { root: { style: "width: min(1400px, 82vw)" }, content: { class: "kx-side-drawer-content" } },
      "aria-label": "File preview",
      "onUpdate:visible": c[4] || (c[4] = (s) => {
        s || e.closePreview();
      })
    }, {
      default: x(() => [
        e.preview ? (m(), w("div", zt, [
          p("header", Bt, [
            p("span", Dt, [
              d(a(g), {
                icon: a(Ue)(e.preview.mime_type),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            p("div", Ot, [
              p("div", {
                class: "kx-pv-name",
                title: a(Z)(e.preview)
              }, [
                W(b(a(Z)(e.preview)), 1),
                e.preview.filename?.trim() ? P("", !0) : (m(), w("span", jt, b(e.preview.uuid), 1))
              ], 8, It),
              p("div", Wt, b(a(Ge)(e.preview)) + " · " + b(a(oe)(e.preview.size)), 1)
            ]),
            d(a(S), {
              type: "button",
              text: "",
              rounded: "",
              size: "small",
              "data-testid": "uploads-preview-download",
              disabled: e.busyAction,
              "aria-label": "Download",
              onClick: e.downloadActive
            }, {
              icon: x(({ class: s }) => [
                d(a(g), {
                  icon: e.busyAction ? "tabler:loader-2" : "tabler:download",
                  class: k([s, e.busyAction && "spin"]),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["disabled", "onClick"]),
            d(a(S), {
              type: "button",
              text: "",
              rounded: "",
              size: "small",
              "data-testid": "uploads-preview-open",
              disabled: e.busyAction,
              "aria-label": "Open in new tab",
              onClick: e.openActive
            }, {
              icon: x(({ class: s }) => [
                d(a(g), {
                  icon: "tabler:external-link",
                  class: k(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["disabled", "onClick"]),
            d(a(S), {
              type: "button",
              text: "",
              rounded: "",
              size: "small",
              "data-testid": "uploads-preview-close",
              "aria-label": "Close preview",
              onClick: e.closePreview
            }, {
              icon: x(({ class: s }) => [
                d(a(g), {
                  icon: "tabler:x",
                  class: k(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["onClick"])
          ]),
          u.value ? (m(), w("div", {
            key: 0,
            class: k(["kx-pv-fail", { "kx-pv-info": u.value.tone === "info" }]),
            role: u.value.tone === "error" ? "alert" : "status",
            "data-testid": "uploads-preview-error"
          }, [
            d(a(g), {
              icon: u.value.tone === "error" ? "tabler:alert-triangle" : "tabler:info-circle",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            p("span", null, b(u.value.text), 1),
            u.value.tone === "error" ? (m(), B(a(S), {
              key: 0,
              type: "button",
              class: "kx-pv-retry",
              size: "small",
              severity: "danger",
              outlined: "",
              label: "Retry",
              "data-testid": "uploads-preview-retry",
              loading: e.retrying,
              disabled: e.retrying,
              onClick: c[0] || (c[0] = (s) => e.retryUpload(e.preview))
            }, {
              icon: x(({ class: s }) => [
                d(a(g), {
                  icon: "tabler:refresh",
                  class: k(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled"])) : P("", !0)
          ], 10, qt)) : P("", !0),
          p("div", Gt, [
            d(a(S), {
              type: "button",
              class: "kx-part",
              size: "small",
              rounded: "",
              outlined: !!e.artifactView,
              label: "File",
              "data-testid": "uploads-view-file",
              "aria-pressed": !e.artifactView,
              pt: { label: { class: "kx-part-label" } },
              onClick: e.viewOriginal
            }, {
              icon: x(({ class: s }) => [
                d(a(g), {
                  icon: "tabler:file",
                  class: k(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["outlined", "aria-pressed", "onClick"]),
            e.hasPrimary ? (m(), B(a(S), {
              key: 0,
              type: "button",
              class: "kx-part",
              size: "small",
              rounded: "",
              outlined: !(e.artifactView && a(G)(e.artifactView)),
              label: "Markdown",
              "data-testid": "uploads-view-markdown",
              "aria-pressed": !!e.artifactView && a(G)(e.artifactView),
              pt: { label: { class: "kx-part-label" } },
              onClick: e.viewPrimary
            }, {
              icon: x(({ class: s }) => [
                d(a(g), {
                  icon: "tabler:markdown",
                  class: k(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["outlined", "aria-pressed", "onClick"])) : P("", !0)
          ]),
          p("div", {
            class: k(["kx-pv-view", { "kx-pv-padded": a(Vt)(e.activePreviewSource(e.preview).contentType) }])
          }, [
            (m(), w("wc-resource-view", {
              key: e.artifactView ? `${e.preview.uuid}:${e.artifactView.artifact_id}` : e.preview.uuid,
              class: "kx-pv-rv",
              "content-type": e.activePreviewSource(e.preview).contentType,
              "source-url": e.activePreviewSource(e.preview).sourceUrl,
              filename: e.activePreviewSource(e.preview).filename,
              alt: e.activePreviewSource(e.preview).filename
            }, null, 8, Kt))
          ], 2),
          e.partsTotal || e.artifactsLoading ? (m(), w("div", {
            key: 1,
            class: k(["kx-parts-panel", { open: e.partsExpanded }])
          }, [
            p("div", Jt, [
              d(a(S), {
                type: "button",
                text: "",
                size: "small",
                label: "Parts",
                badge: String(e.partsTotal),
                "badge-severity": "secondary",
                "data-testid": "uploads-parts-toggle",
                "aria-expanded": e.partsExpanded,
                "aria-controls": "uploads-extracted-parts",
                onClick: c[1] || (c[1] = (s) => E("update:partsExpanded", !e.partsExpanded))
              }, {
                icon: x(({ class: s }) => [
                  d(a(g), {
                    icon: e.partsExpanded ? "tabler:chevron-down" : "tabler:chevron-right",
                    class: k(s),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"])
                ]),
                _: 1
              }, 8, ["badge", "aria-expanded"]),
              e.partsExpanded && e.partsPages > 1 ? (m(), w(xe, { key: 0 }, [
                p("span", Qt, b(e.partsRangeStart) + "–" + b(e.partsRangeEnd), 1),
                p("div", Xt, [
                  d(a(S), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-parts-previous",
                    disabled: e.partsPage <= 1,
                    "aria-label": "Previous parts",
                    onClick: c[2] || (c[2] = (s) => e.gotoPartsPage(e.partsPage - 1))
                  }, {
                    icon: x(({ class: s }) => [
                      d(a(g), {
                        icon: "tabler:chevron-left",
                        class: k(s),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["disabled"]),
                  p("span", Ht, b(e.partsPage) + " / " + b(e.partsPages), 1),
                  d(a(S), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-parts-next",
                    disabled: e.partsPage >= e.partsPages,
                    "aria-label": "Next parts",
                    onClick: c[3] || (c[3] = (s) => e.gotoPartsPage(e.partsPage + 1))
                  }, {
                    icon: x(({ class: s }) => [
                      d(a(g), {
                        icon: "tabler:chevron-right",
                        class: k(s),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])
              ], 64)) : P("", !0)
            ]),
            at(p("div", Yt, [
              (m(!0), w(xe, null, We(e.currentArtifacts, (s) => (m(), B(a(S), {
                key: s.artifact_id,
                type: "button",
                class: "kx-part",
                size: "small",
                rounded: "",
                outlined: e.artifactView?.artifact_id !== s.artifact_id,
                label: a(Ne)(s),
                disabled: !s.raw_url,
                title: a(Ft)(s),
                "data-testid": "uploads-view-artifact",
                "data-artifact-id": s.artifact_id,
                "aria-pressed": e.artifactView?.artifact_id === s.artifact_id,
                pt: { label: { class: "kx-part-label" } },
                onClick: (y) => e.viewArtifact(s)
              }, {
                icon: x(({ class: y }) => [
                  d(a(g), {
                    icon: a(Ue)(s.mime_type),
                    class: k(y),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"])
                ]),
                _: 2
              }, 1032, ["outlined", "label", "disabled", "title", "data-artifact-id", "aria-pressed", "onClick"]))), 128)),
              e.artifactsLoading ? (m(), w("span", Zt, [
                d(a(g), {
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })
              ])) : P("", !0)
            ], 512), [
              [it, e.partsExpanded]
            ])
          ], 2)) : P("", !0)
        ])) : P("", !0)
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}), re = 30;
function ta(e) {
  const t = h(null), o = h(null), u = h({}), E = h(!1), v = h(!1);
  function c(n) {
    return u.value[n] || {
      loaded: !1,
      loading: !1,
      error: "",
      primary: null,
      parts: [],
      total: 0,
      page: 1
    };
  }
  function s(n, f) {
    u.value = { ...u.value, [n]: f };
  }
  function y(n) {
    return n.role === "source" || n.locator?.type === "upload.original";
  }
  function T(n) {
    const f = c(n).primary;
    return f && G(f) && f.raw_url ? f : null;
  }
  function N(n) {
    if (t.value?.uuid !== n.uuid || o.value || ke(n.mime_type)) return;
    const f = T(n.uuid);
    f && (o.value = f);
  }
  function R(n) {
    return { contentType: n.mime_type, sourceUrl: n.raw_url || "", filename: n.filename || n.uuid };
  }
  function se(n) {
    if (o.value?.raw_url)
      return {
        contentType: o.value.mime_type || "application/octet-stream",
        sourceUrl: o.value.raw_url,
        filename: Ne(o.value)
      };
    if (!ke(n.mime_type)) {
      const f = T(n.uuid);
      if (f?.raw_url)
        return {
          contentType: f.mime_type || "text/markdown",
          sourceUrl: f.raw_url,
          filename: Ne(f)
        };
    }
    return R(n);
  }
  function D(n) {
    o.value && t.value?.uuid !== n.uuid && (o.value = null), t.value = n, me(n);
  }
  function J() {
    t.value = null, o.value = null;
  }
  function L() {
    o.value = null;
  }
  function Q() {
    const n = t.value ? T(t.value.uuid) : null;
    n && (o.value = n);
  }
  function O(n) {
    n.raw_url && (o.value = n);
  }
  const ue = U(() => t.value ? c(t.value.uuid).parts : []), _ = U(() => t.value ? c(t.value.uuid).total : 0), X = U(() => t.value ? c(t.value.uuid).page : 1), de = U(() => Math.max(1, Math.ceil(_.value / re))), ce = U(() => _.value ? (X.value - 1) * re + 1 : 0), pe = U(() => Math.min(_.value, (X.value - 1) * re + ue.value.length)), Pe = U(() => !!(t.value && T(t.value.uuid))), Ce = U(() => !!(t.value && c(t.value.uuid).loading));
  function Ee(n) {
    if (!t.value) return;
    const f = Math.min(Math.max(1, n), de.value);
    f !== X.value && me(t.value, !0, f);
  }
  function ve() {
    if (o.value?.raw_url) return o.value.raw_url;
    if (t.value && !ke(t.value.mime_type)) {
      const n = T(t.value.uuid);
      if (n?.raw_url) return n.raw_url;
    }
    return t.value?.raw_url || "";
  }
  function Te() {
    if (o.value) return o.value.label || o.value.artifact_id;
    if (t.value && !ke(t.value.mime_type)) {
      const n = T(t.value.uuid);
      if (n) return n.label || n.artifact_id;
    }
    return t.value ? t.value.filename || t.value.uuid : "download";
  }
  async function fe(n) {
    if (!n) return null;
    try {
      const f = await q.get(n, { responseType: "blob" });
      return URL.createObjectURL(f.data);
    } catch (f) {
      return e.value = f instanceof Error ? f.message : "failed to fetch file", null;
    }
  }
  async function Se() {
    if (!v.value) {
      v.value = !0;
      try {
        const n = await fe(ve());
        if (!n) return;
        const f = document.createElement("a");
        f.href = n, f.download = Te(), f.click(), setTimeout(() => URL.revokeObjectURL(n), 1e4);
      } finally {
        v.value = !1;
      }
    }
  }
  async function Ae() {
    if (!v.value) {
      v.value = !0;
      try {
        const n = await fe(ve());
        n && (window.open(n, "_blank", "noopener"), setTimeout(() => URL.revokeObjectURL(n), 6e4));
      } finally {
        v.value = !1;
      }
    }
  }
  async function me(n, f = !1, H = 1) {
    const I = c(n.uuid);
    if (!((I.loaded || I.loading) && !f)) {
      s(n.uuid, { ...I, loading: !0, error: "" });
      try {
        const Y = (H - 1) * re, { data: j } = await q.get(`/api/v1/uploads/${n.uuid}/artifacts`, { params: { limit: re, offset: Y } });
        if (!j.success) {
          s(n.uuid, { ...I, loaded: !0, loading: !1, error: j.error || "failed to load artifacts", primary: null, parts: [], total: 0, page: H });
          return;
        }
        const ge = j.artifacts || [], F = j.primary || ge.find((A) => G(A) && !!A.raw_url) || null, M = ge.filter((A) => !y(A) && !G(A));
        s(n.uuid, {
          loaded: !0,
          loading: !1,
          error: "",
          primary: F,
          parts: M,
          total: Number(j.meta?.total ?? M.length),
          page: H
        }), H === 1 && N(n);
      } catch (Y) {
        s(n.uuid, { ...I, loaded: !0, loading: !1, error: Y instanceof Error ? Y.message : "failed to load artifacts" });
      }
    }
  }
  return {
    preview: t,
    artifactView: o,
    artifactsByUpload: u,
    partsExpanded: E,
    busyAction: v,
    artifactStateFor: c,
    isSourceArtifact: y,
    primaryMarkdownFor: T,
    activePreviewSource: se,
    openPreview: D,
    closePreview: J,
    viewOriginal: L,
    viewPrimary: Q,
    viewArtifact: O,
    currentArtifacts: ue,
    partsTotal: _,
    partsPage: X,
    partsPages: de,
    partsRangeStart: ce,
    partsRangeEnd: pe,
    hasPrimary: Pe,
    artifactsLoading: Ce,
    gotoPartsPage: Ee,
    downloadActive: Se,
    openActive: Ae
  };
}
const aa = () => ot(), ia = () => st(), na = { class: "kx" }, ra = { class: "kx-head" }, la = { class: "kx-head-icon" }, oa = { class: "kx-head-actions" }, sa = { class: "kx-count" }, ua = {
  key: 0,
  class: "kx-count kx-pending"
}, da = {
  key: 0,
  class: "kx-err",
  role: "alert"
}, ca = {
  key: 1,
  class: "kx-loading",
  role: "status"
}, pa = {
  key: 2,
  class: "kx-err",
  role: "alert",
  "data-testid": "uploads-link-error"
}, va = { class: "kx-body" }, fa = { class: "kx-main" }, ma = { class: "kx-drop-title" }, ga = {
  key: 0,
  class: "kx-loading"
}, ya = {
  key: 1,
  class: "kx-empty"
}, wa = { class: "kx-empty-ico" }, ba = {
  key: 2,
  class: "kx-empty"
}, ha = { class: "kx-list" }, ka = { class: "kx-ficon" }, xa = { class: "kx-id" }, Pa = ["title"], Ca = {
  key: 0,
  class: "kx-uuid"
}, Ea = { class: "kx-sub" }, Ta = { class: "kx-type" }, Sa = ["title"], Aa = { class: "kx-date" }, $a = { class: "kx-actions" }, Ra = {
  key: 0,
  class: "kx-progress",
  "aria-hidden": "true"
}, le = 30, Ua = /* @__PURE__ */ je({
  __name: "uploads",
  setup(e) {
    const t = /* @__PURE__ */ new Set(["completed", "error"]), o = [
      { label: "All status", value: "all" },
      { label: "Uploaded", value: "uploaded" },
      { label: "Processing", value: "processing" },
      { label: "Completed", value: "completed" },
      { label: "Error", value: "error" }
    ], u = h([]), E = h(0), v = h(!1), c = h(""), s = h(!1), y = h(0), T = h(""), N = h("all"), R = h(1), se = h(!1);
    let D = null, J = !1, L = !1;
    const Q = h(!1), {
      preview: O,
      artifactView: ue,
      partsExpanded: _,
      busyAction: X,
      activePreviewSource: de,
      openPreview: ce,
      closePreview: pe,
      viewOriginal: Pe,
      viewPrimary: Ce,
      viewArtifact: Ee,
      currentArtifacts: ve,
      partsTotal: Te,
      partsPage: fe,
      partsPages: Se,
      partsRangeStart: Ae,
      partsRangeEnd: me,
      hasPrimary: n,
      artifactsLoading: f,
      gotoPartsPage: H,
      downloadActive: I,
      openActive: Y
    } = ta(c), j = aa(), ge = ia(), F = h(""), M = h(!1);
    let A = 0, ye = null;
    function Le(l = "") {
      ye = l, ge("navigate", { path: l });
    }
    function Ke(l) {
      A++, F.value = "", M.value = !1, ce(l), Le(l.uuid);
    }
    function ee() {
      A++, F.value = "", M.value = !1, pe(), Le();
    }
    he(() => j.value.route, async (l) => {
      const i = String(l ?? "").replace(/^\/+|\/+$/g, "");
      if (ye !== null && i !== ye) return;
      ye = null;
      const r = ++A;
      if (F.value = "", M.value = !1, i !== O.value?.uuid && (pe(), !!i)) {
        M.value = !0;
        try {
          const { data: C } = await q.get(`/api/v1/uploads/${encodeURIComponent(i)}`);
          if (r !== A) return;
          if (!C.success || !C.upload) throw new Error(C.error || "Failed to load upload");
          const $ = C.upload;
          ce({ ...$, filename: $.filename || String($.meta?.filename || "") });
        } catch (C) {
          if (r !== A) return;
          const $ = C?.response?.status;
          F.value = $ === 403 || $ === 404 ? "File not found or you do not have permission to view it." : C instanceof Error ? C.message : "Failed to load upload.";
        } finally {
          r === A && (M.value = !1);
        }
      }
    }, { immediate: !0 });
    const $e = h(""), we = h({});
    let V = null, be = "";
    const _e = U(() => typeof we.value.pending_count == "number" ? we.value.pending_count : u.value.filter((l) => !t.has(K(l.status))).length), Fe = U(() => Math.max(1, Math.ceil(E.value / le)));
    function z() {
      return L ? Promise.resolve() : (J = !0, D || (v.value = !0, D = Promise.resolve().then(async () => {
        try {
          for (; J && !L; ) {
            J = !1;
            const l = R.value, i = T.value.trim(), r = N.value, C = () => !L && l === R.value && i === T.value.trim() && r === N.value;
            c.value = "";
            try {
              const $ = { limit: le, offset: (l - 1) * le };
              i && ($.q = i), r !== "all" && ($.status = r);
              const { data: ie } = await q.get("/api/v1/uploads/list", { params: $ });
              if (!C()) continue;
              ie.success ? (u.value = ie.uploads || [], E.value = Number(ie.meta?.total ?? u.value.length), typeof ie.component_id == "string" && ($e.value = ie.component_id)) : (u.value = [], E.value = 0);
            } catch ($) {
              if (!C()) continue;
              u.value = [], E.value = 0, c.value = $ instanceof Error ? $.message : "failed to load uploads";
            }
          }
        } finally {
          D = null, L || (v.value = !1);
        }
      }), D));
    }
    function Je(l) {
      const i = Math.max(1, Math.min(Fe.value, l));
      i !== R.value && (R.value = i, z());
    }
    let te = null;
    he(T, () => {
      te && clearTimeout(te), te = setTimeout(() => {
        R.value = 1, z();
      }, 300);
    }), he(N, () => {
      R.value = 1, z();
    });
    function Ve() {
      if (L) return;
      const l = $e.value;
      !l || be === l || (V && V(), V = null, be = "", V = xt(l, (i) => {
        we.value = { ...we.value, ...i.meta }, z();
      }), V && (be = l));
    }
    he($e, () => {
      Ve();
    });
    async function Qe(l) {
      const i = new FormData();
      i.append("file", l), i.append("metadata", JSON.stringify({ target_parent_id: "", filename: l.name }));
      try {
        const { data: r } = await q.post("/api/v1/uploads", i, { headers: { "Content-Type": "multipart/form-data" } });
        r.success || (c.value = r.error || `failed to upload "${l.name}"`);
      } catch (r) {
        c.value = r instanceof Error ? r.message : `failed to upload "${l.name}"`;
      }
    }
    async function ze(l) {
      const i = Array.from(l);
      if (i.length) {
        c.value = "", y.value += i.length;
        try {
          for (const r of i) await Qe(r);
        } finally {
          y.value = Math.max(0, y.value - i.length), R.value = 1, await z();
        }
      }
    }
    function ae() {
      const l = document.createElement("input");
      l.type = "file", l.multiple = !0, l.onchange = () => {
        l.files?.length && ze(l.files);
      }, l.click();
    }
    function Xe(l) {
      l.preventDefault(), s.value = !1, l.dataTransfer?.files?.length && ze(l.dataTransfer.files);
    }
    async function He(l) {
      await yt.confirm({
        header: "Delete upload",
        message: "Deletes the file everywhere; workspace links are removed.",
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await Ye(l);
    }
    async function Ye(l) {
      se.value = !0, c.value = "";
      try {
        const { data: i } = await q.delete(`/api/v1/uploads/${l.uuid}`);
        i.success ? (O.value?.uuid === l.uuid && ee(), u.value.length === 1 && R.value > 1 && (R.value -= 1), await z()) : c.value = i.error || "failed to delete upload";
      } catch (i) {
        c.value = i instanceof Error ? i.message : "failed to delete upload";
      } finally {
        se.value = !1;
      }
    }
    async function Ze(l) {
      if (!Q.value) {
        Q.value = !0, c.value = "";
        try {
          const { data: i } = await q.post(`/api/v1/uploads/${l.uuid}/retry`);
          i.success ? (O.value?.uuid === l.uuid && ee(), await z()) : c.value = i.error || "failed to retry upload";
        } catch (i) {
          c.value = i instanceof Error ? i.message : "failed to retry upload";
        } finally {
          Q.value = !1;
        }
      }
    }
    function Be(l) {
      l.key === "Escape" && O.value && ee();
    }
    async function et() {
      try {
        await z(), Ve();
      } catch (l) {
        c.value = l instanceof Error ? l.message : "host API unavailable";
      }
    }
    return ut(et), nt(() => {
      window.addEventListener("keydown", Be), gt("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), rt(() => {
      L = !0, J = !1, A++, window.removeEventListener("keydown", Be), te && clearTimeout(te), V && V(), V = null, be = "";
    }), (l, i) => (m(), w("div", na, [
      p("header", ra, [
        p("div", la, [
          d(a(g), {
            icon: "tabler:files",
            "aria-hidden": "true"
          })
        ]),
        i[10] || (i[10] = p("div", { class: "kx-head-text" }, [
          p("h1", { class: "kx-title" }, "Uploads"),
          p("p", { class: "kx-head-sub" }, "Files your agents can read and process.")
        ], -1)),
        p("div", oa, [
          p("span", sa, b(E.value) + " file" + b(E.value !== 1 ? "s" : ""), 1),
          _e.value ? (m(), w("span", ua, [
            d(a(g), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            W(" " + b(_e.value) + " processing", 1)
          ])) : P("", !0),
          d(a(ct), { class: "kx-search" }, {
            default: x(() => [
              d(a(Ie), null, {
                default: x(() => [
                  d(a(g), {
                    icon: "tabler:search",
                    "aria-hidden": "true"
                  })
                ]),
                _: 1
              }),
              d(a(pt), {
                modelValue: T.value,
                "onUpdate:modelValue": i[0] || (i[0] = (r) => T.value = r),
                placeholder: "Search files…",
                "aria-label": "Search files",
                "data-testid": "uploads-search-input"
              }, null, 8, ["modelValue"]),
              T.value ? (m(), B(a(Ie), { key: 0 }, {
                default: x(() => [
                  d(a(S), {
                    type: "button",
                    text: "",
                    severity: "secondary",
                    size: "small",
                    "aria-label": "Clear search",
                    "data-testid": "uploads-search-clear",
                    onClick: i[1] || (i[1] = (r) => T.value = "")
                  }, {
                    icon: x(({ class: r }) => [
                      d(a(g), {
                        icon: "tabler:x",
                        class: k(r),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })) : P("", !0)
            ]),
            _: 1
          }),
          d(a(ft), {
            modelValue: N.value,
            "onUpdate:modelValue": i[2] || (i[2] = (r) => N.value = r),
            class: "kx-select",
            options: o,
            "option-label": "label",
            "option-value": "value",
            "aria-label": "Filter by status"
          }, null, 8, ["modelValue"]),
          d(a(S), {
            type: "button",
            "data-testid": "uploads-header-upload",
            label: y.value > 0 ? "Uploading…" : "Upload",
            loading: y.value > 0,
            disabled: y.value > 0,
            onClick: ae
          }, {
            icon: x(({ class: r }) => [
              d(a(g), {
                icon: "tabler:upload",
                class: k(r),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ])
      ]),
      c.value ? (m(), w("div", da, b(c.value), 1)) : P("", !0),
      M.value ? (m(), w("div", ca, "Loading file…")) : P("", !0),
      F.value ? (m(), w("div", pa, [
        W(b(F.value) + " ", 1),
        d(a(S), {
          label: "Close preview",
          text: "",
          severity: "secondary",
          onClick: ee
        })
      ])) : P("", !0),
      p("div", va, [
        p("div", fa, [
          p("div", {
            class: k(["kx-drop", { dragover: s.value, busy: y.value > 0 }]),
            role: "button",
            tabindex: "0",
            "aria-label": "Upload files",
            onClick: i[3] || (i[3] = (r) => y.value === 0 && ae()),
            onKeydown: [
              i[4] || (i[4] = Oe((r) => y.value === 0 && ae(), ["enter"])),
              i[5] || (i[5] = Oe(De((r) => y.value === 0 && ae(), ["prevent"]), ["space"]))
            ],
            onDragover: i[6] || (i[6] = De((r) => s.value = !0, ["prevent"])),
            onDragleave: i[7] || (i[7] = (r) => s.value = !1),
            onDrop: Xe
          }, [
            d(a(g), {
              icon: y.value > 0 ? "tabler:loader-2" : "tabler:cloud-upload",
              class: k(["kx-drop-ico", y.value > 0 && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            p("p", ma, b(y.value > 0 ? "Uploading…" : "Drop files or click to browse"), 1),
            i[11] || (i[11] = p("p", { class: "kx-drop-sub" }, "Documents convert to markdown; images and text are stored for agents.", -1))
          ], 34),
          v.value && !u.value.length ? (m(), w("div", ga, [
            d(a(g), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[12] || (i[12] = W(" Loading…", -1))
          ])) : !E.value && !T.value && N.value === "all" ? (m(), w("div", ya, [
            p("div", wa, [
              d(a(g), {
                icon: "tabler:cloud-upload",
                "aria-hidden": "true"
              })
            ]),
            i[13] || (i[13] = p("div", { class: "kx-empty-title" }, "No uploads yet", -1)),
            i[14] || (i[14] = p("div", { class: "kx-empty-sub" }, "Upload a document, image, or text file to make it available to your agents.", -1)),
            d(a(S), {
              type: "button",
              class: "kx-empty-cta",
              "data-testid": "uploads-empty-upload",
              label: "Upload files",
              onClick: ae
            }, {
              icon: x(({ class: r }) => [
                d(a(g), {
                  icon: "tabler:upload",
                  class: k(r),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])) : u.value.length ? (m(), w(xe, { key: 3 }, [
            p("div", ha, [
              (m(!0), w(xe, null, We(u.value, (r) => (m(), w("div", {
                key: r.uuid,
                class: "kx-row"
              }, [
                p("span", ka, [
                  d(a(g), {
                    icon: a(Ue)(r.mime_type),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                p("div", xa, [
                  p("div", {
                    class: "kx-name",
                    title: a(Z)(r)
                  }, [
                    W(b(a(Z)(r)), 1),
                    r.filename?.trim() ? P("", !0) : (m(), w("span", Ca, b(r.uuid), 1))
                  ], 8, Pa),
                  p("div", Ea, [
                    p("span", Ta, b(a(Ge)(r)), 1),
                    W(" · " + b(a(oe)(r.size)), 1)
                  ]),
                  a(qe)(r) && r.error ? (m(), w("div", {
                    key: 0,
                    class: "kx-err-reason",
                    title: a(Me)(r.error)
                  }, b(a(Me)(r.error)), 9, Sa)) : P("", !0)
                ]),
                d(a(dt), {
                  severity: a(Et)(r.status),
                  class: "kx-badge kx-tag-sm"
                }, {
                  default: x(() => [
                    a(t).has(r.status) ? P("", !0) : (m(), B(a(g), {
                      key: 0,
                      icon: "tabler:loader-2",
                      class: "spin",
                      "aria-hidden": "true"
                    })),
                    W(" " + b(a(Tt)(r.status)), 1)
                  ]),
                  _: 2
                }, 1032, ["severity"]),
                p("span", Aa, b(a(Ct)(r.created_at)), 1),
                p("div", $a, [
                  a(Nt)(r) ? (m(), B(a(S), {
                    key: 0,
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-row-preview",
                    "data-upload-id": r.uuid,
                    "aria-label": `Preview ${a(Z)(r)}`,
                    onClick: (C) => Ke(r)
                  }, {
                    icon: x(({ class: C }) => [
                      d(a(g), {
                        icon: "tabler:eye",
                        class: k(C),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["data-upload-id", "aria-label", "onClick"])) : P("", !0),
                  d(a(S), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    severity: "danger",
                    "data-testid": "uploads-row-delete",
                    "data-upload-id": r.uuid,
                    "aria-label": `Delete ${a(Z)(r)}`,
                    onClick: (C) => He(r)
                  }, {
                    icon: x(({ class: C }) => [
                      d(a(g), {
                        icon: "tabler:trash",
                        class: k(C),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["data-upload-id", "aria-label", "onClick"])
                ]),
                a(_t)(r) ? (m(), w("span", Ra)) : P("", !0)
              ]))), 128))
            ]),
            Fe.value > 1 ? (m(), B(a(vt), {
              key: 0,
              first: (R.value - 1) * le,
              rows: le,
              "total-records": E.value,
              "page-link-size": 5,
              template: "CurrentPageReport PrevPageLink PageLinks NextPageLink",
              "current-page-report-template": "{first}–{last} of {totalRecords}",
              "data-testid": "uploads-pager",
              "aria-label": "Pagination",
              pt: {
                prev: { "data-testid": "uploads-pager-previous" },
                next: { "data-testid": "uploads-pager-next" }
              },
              onPage: i[8] || (i[8] = (r) => Je(r.page + 1))
            }, null, 8, ["first", "total-records"])) : P("", !0)
          ], 64)) : (m(), w("div", ba, [...i[15] || (i[15] = [
            p("div", { class: "kx-empty-title" }, "No matches", -1),
            p("div", { class: "kx-empty-sub" }, "No files match the current search or filter.", -1)
          ])]))
        ])
      ]),
      d(ea, {
        "parts-expanded": a(_),
        "onUpdate:partsExpanded": i[9] || (i[9] = (r) => lt(_) ? _.value = r : null),
        preview: a(O),
        "artifact-view": a(ue),
        "busy-action": a(X),
        "current-artifacts": a(ve),
        "parts-total": a(Te),
        "parts-page": a(fe),
        "parts-pages": a(Se),
        "parts-range-start": a(Ae),
        "parts-range-end": a(me),
        "has-primary": a(n),
        "artifacts-loading": a(f),
        "active-preview-source": a(de),
        "download-active": a(I),
        "open-active": a(Y),
        "close-preview": ee,
        "view-original": a(Pe),
        "view-primary": a(Ce),
        "view-artifact": a(Ee),
        "goto-parts-page": a(H),
        retrying: Q.value,
        "retry-upload": Ze
      }, null, 8, ["parts-expanded", "preview", "artifact-view", "busy-action", "current-artifacts", "parts-total", "parts-page", "parts-pages", "parts-range-start", "parts-range-end", "has-primary", "artifacts-loading", "active-preview-source", "download-active", "open-active", "view-original", "view-primary", "view-artifact", "goto-parts-page", "retrying"])
    ]));
  }
}), qa = {
  rootComponent: Ua,
  plugins: [tt]
};
export {
  qa as mountConfig
};
//# sourceMappingURL=lazy-mount-j-UD70pO.js.map

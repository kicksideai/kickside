import { P as at } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as je, computed as U, openBlock as m, createBlock as B, unref as a, withCtx as k, createElementBlock as b, createElementVNode as c, createVNode as d, toDisplayString as P, normalizeClass as h, createCommentVNode as E, Fragment as xe, withDirectives as it, renderList as We, vShow as nt, ref as w, watch as he, onMounted as rt, onBeforeUnmount as lt, createTextVNode as ie, withModifiers as De, withKeys as Oe, isRef as ot } from "vue";
import { a as st, u as ut, b as dt } from "./wc-runtime-KO3cNuNo.js";
import { Icon as g } from "@iconify/vue";
import S from "primevue/button";
import ct from "primevue/tag";
import pt from "primevue/inputgroup";
import Ie from "primevue/inputgroupaddon";
import vt from "primevue/inputtext";
import ft from "primevue/paginator";
import mt from "primevue/select";
import { on as gt, api as q, loadByTagName as yt, host as wt } from "@wippy-fe/proxy";
import bt from "primevue/drawer";
function ne(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function ht(e, t) {
  return e;
}
function kt(e, t, o) {
  if (t !== void 0 && !t) return null;
  const u = ne(e) ? e : {}, T = [
    u,
    ne(u.data) ? u.data : null,
    ne(u.payload) ? u.payload : null,
    ne(u.detail) ? u.detail : null
  ].filter(Boolean);
  for (const p of T) {
    if (p.event !== "component.meta.changed" && p.event !== "component.deleting" && p.event !== "component.deleted") continue;
    const v = String(p.component_id || ""), y = String(u.topic || p.topic || "");
    if (t === void 0) {
      if (!v && (!y.startsWith("component.") || y === "component.")) continue;
    } else if (v && v !== t || !v && y !== `component.${t}`) continue;
    const l = v || t || y.slice(10);
    return p.event === "component.deleting" && typeof p.deletion_job_id == "string" && p.deletion_job_id ? { event: p.event, component_id: l, deletion_job_id: p.deletion_job_id } : p.event !== "component.meta.changed" ? { event: p.event, component_id: l } : {
      event: "component.meta.changed",
      component_id: l,
      meta: ht(ne(p.meta) ? p.meta : {}),
      deleted: Array.isArray(p.deleted) ? p.deleted.map(String) : []
    };
  }
  return null;
}
function xt(e, t, o) {
  const u = kt(e, t);
  return u?.event === "component.meta.changed" ? u : null;
}
function Pt(e, t, o) {
  if (!e) return null;
  const u = gt(`component.${e}`, (T) => {
    const p = xt(T, e);
    p && t(p);
  });
  return typeof u == "function" ? u : null;
}
function Ct(e) {
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
function qe(e) {
  const t = Ct(e);
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
function Ge(e) {
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
function D(e) {
  return (e.filename || "").trim() || "Untitled file";
}
function Ke(e) {
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
  return Ge(e) ? { tone: "error", text: Re[t] || (t ? "Text recognition failed." : e.error ? Me(e.error) : "Upload processing failed.") } : !t || K(e.status) !== "completed" ? null : Rt.has(t) ? { tone: "info", text: Re[t] } : { tone: "info", text: `${Re[t] || "Text recognition did not complete."} The extracted text is shown.` };
}
function _t(e) {
  const t = K(e.status);
  return t === "completed" || t === "error";
}
const Nt = /* @__PURE__ */ new Set(["completed", "error"]);
function Lt(e) {
  return !Nt.has(K(e.status));
}
function G(e) {
  return e.role === "primary" && (e.kind === "markdown" || e.mime_type === "text/markdown");
}
function _e(e) {
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
}, Bt = { class: "kx-pv-head" }, Dt = { class: "kx-ficon" }, Ot = { class: "kx-pv-id" }, It = ["title"], jt = { class: "kx-pv-sub" }, Wt = ["role"], qt = { class: "kx-views" }, Gt = ["content-type", "source-url", "filename", "alt"], Kt = { class: "kx-parts-head" }, Jt = { class: "kx-parts-range" }, Qt = { class: "kx-parts-pager" }, Xt = { class: "kx-parts-pageno" }, Ht = {
  id: "uploads-extracted-parts",
  class: "kx-parts-list",
  role: "region",
  "aria-label": "Extracted parts"
}, Yt = {
  key: 0,
  class: "kx-part-loading"
}, Zt = /* @__PURE__ */ je({
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
    const o = e, u = U(() => o.preview ? Mt(o.preview) : null), T = U(() => o.preview ? [Ke(o.preview), oe(o.preview.size), qe(o.preview.created_at)].filter(Boolean).join(" · ") : ""), p = t;
    return (v, y) => (m(), B(a(bt), {
      visible: !!e.preview,
      position: "right",
      modal: !0,
      dismissable: !0,
      "close-on-escape": !0,
      "show-close-icon": !1,
      class: "kx-side-drawer",
      pt: { root: { style: "width: min(1400px, 82vw)" }, content: { class: "kx-side-drawer-content" } },
      "aria-label": "File preview",
      "onUpdate:visible": y[4] || (y[4] = (l) => {
        l || e.closePreview();
      })
    }, {
      default: k(() => [
        e.preview ? (m(), b("div", zt, [
          c("header", Bt, [
            c("span", Dt, [
              d(a(g), {
                icon: a(Ue)(e.preview.mime_type),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            c("div", Ot, [
              c("div", {
                class: "kx-pv-name",
                title: a(D)(e.preview)
              }, P(a(D)(e.preview)), 9, It),
              c("div", jt, P(T.value), 1)
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
              icon: k(({ class: l }) => [
                d(a(g), {
                  icon: e.busyAction ? "tabler:loader-2" : "tabler:download",
                  class: h([l, e.busyAction && "spin"]),
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
              icon: k(({ class: l }) => [
                d(a(g), {
                  icon: "tabler:external-link",
                  class: h(l),
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
              icon: k(({ class: l }) => [
                d(a(g), {
                  icon: "tabler:x",
                  class: h(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["onClick"])
          ]),
          u.value ? (m(), b("div", {
            key: 0,
            class: h(["kx-pv-fail", { "kx-pv-info": u.value.tone === "info" }]),
            role: u.value.tone === "error" ? "alert" : "status",
            "data-testid": "uploads-preview-error"
          }, [
            d(a(g), {
              icon: u.value.tone === "error" ? "tabler:alert-triangle" : "tabler:info-circle",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            c("span", null, P(u.value.text), 1),
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
              onClick: y[0] || (y[0] = (l) => e.retryUpload(e.preview))
            }, {
              icon: k(({ class: l }) => [
                d(a(g), {
                  icon: "tabler:refresh",
                  class: h(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled"])) : E("", !0)
          ], 10, Wt)) : E("", !0),
          c("div", qt, [
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
              icon: k(({ class: l }) => [
                d(a(g), {
                  icon: "tabler:file",
                  class: h(l),
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
              icon: k(({ class: l }) => [
                d(a(g), {
                  icon: "tabler:markdown",
                  class: h(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["outlined", "aria-pressed", "onClick"])) : E("", !0)
          ]),
          c("div", {
            class: h(["kx-pv-view", { "kx-pv-padded": a(Vt)(e.activePreviewSource(e.preview).contentType) }])
          }, [
            (m(), b("wc-resource-view", {
              key: e.artifactView ? `${e.preview.uuid}:${e.artifactView.artifact_id}` : e.preview.uuid,
              class: "kx-pv-rv",
              "content-type": e.activePreviewSource(e.preview).contentType,
              "source-url": e.activePreviewSource(e.preview).sourceUrl,
              filename: e.activePreviewSource(e.preview).filename,
              alt: e.activePreviewSource(e.preview).filename
            }, null, 8, Gt))
          ], 2),
          e.partsTotal || e.artifactsLoading ? (m(), b("div", {
            key: 1,
            class: h(["kx-parts-panel", { open: e.partsExpanded }])
          }, [
            c("div", Kt, [
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
                onClick: y[1] || (y[1] = (l) => p("update:partsExpanded", !e.partsExpanded))
              }, {
                icon: k(({ class: l }) => [
                  d(a(g), {
                    icon: e.partsExpanded ? "tabler:chevron-down" : "tabler:chevron-right",
                    class: h(l),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"])
                ]),
                _: 1
              }, 8, ["badge", "aria-expanded"]),
              e.partsExpanded && e.partsPages > 1 ? (m(), b(xe, { key: 0 }, [
                c("span", Jt, P(e.partsRangeStart) + "–" + P(e.partsRangeEnd), 1),
                c("div", Qt, [
                  d(a(S), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-parts-previous",
                    disabled: e.partsPage <= 1,
                    "aria-label": "Previous parts",
                    onClick: y[2] || (y[2] = (l) => e.gotoPartsPage(e.partsPage - 1))
                  }, {
                    icon: k(({ class: l }) => [
                      d(a(g), {
                        icon: "tabler:chevron-left",
                        class: h(l),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["disabled"]),
                  c("span", Xt, P(e.partsPage) + " / " + P(e.partsPages), 1),
                  d(a(S), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-parts-next",
                    disabled: e.partsPage >= e.partsPages,
                    "aria-label": "Next parts",
                    onClick: y[3] || (y[3] = (l) => e.gotoPartsPage(e.partsPage + 1))
                  }, {
                    icon: k(({ class: l }) => [
                      d(a(g), {
                        icon: "tabler:chevron-right",
                        class: h(l),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])
              ], 64)) : E("", !0)
            ]),
            it(c("div", Ht, [
              (m(!0), b(xe, null, We(e.currentArtifacts, (l) => (m(), B(a(S), {
                key: l.artifact_id,
                type: "button",
                class: "kx-part",
                size: "small",
                rounded: "",
                outlined: e.artifactView?.artifact_id !== l.artifact_id,
                label: a(_e)(l),
                disabled: !l.raw_url,
                title: a(Ft)(l),
                "data-testid": "uploads-view-artifact",
                "data-artifact-id": l.artifact_id,
                "aria-pressed": e.artifactView?.artifact_id === l.artifact_id,
                pt: { label: { class: "kx-part-label" } },
                onClick: (x) => e.viewArtifact(l)
              }, {
                icon: k(({ class: x }) => [
                  d(a(g), {
                    icon: a(Ue)(l.mime_type),
                    class: h(x),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"])
                ]),
                _: 2
              }, 1032, ["outlined", "label", "disabled", "title", "data-artifact-id", "aria-pressed", "onClick"]))), 128)),
              e.artifactsLoading ? (m(), b("span", Yt, [
                d(a(g), {
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })
              ])) : E("", !0)
            ], 512), [
              [nt, e.partsExpanded]
            ])
          ], 2)) : E("", !0)
        ])) : E("", !0)
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}), re = 30;
function ea(e) {
  const t = w(null), o = w(null), u = w({}), T = w(!1), p = w(!1);
  function v(n) {
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
  function y(n, f) {
    u.value = { ...u.value, [n]: f };
  }
  function l(n) {
    return n.role === "source" || n.locator?.type === "upload.original";
  }
  function x(n) {
    const f = v(n).primary;
    return f && G(f) && f.raw_url ? f : null;
  }
  function _(n) {
    if (t.value?.uuid !== n.uuid || o.value || ke(n.mime_type)) return;
    const f = x(n.uuid);
    f && (o.value = f);
  }
  function R(n) {
    return { contentType: n.mime_type, sourceUrl: n.raw_url || "", filename: D(n) };
  }
  function se(n) {
    if (o.value?.raw_url)
      return {
        contentType: o.value.mime_type || "application/octet-stream",
        sourceUrl: o.value.raw_url,
        filename: _e(o.value)
      };
    if (!ke(n.mime_type)) {
      const f = x(n.uuid);
      if (f?.raw_url)
        return {
          contentType: f.mime_type || "text/markdown",
          sourceUrl: f.raw_url,
          filename: _e(f)
        };
    }
    return R(n);
  }
  function O(n) {
    o.value && t.value?.uuid !== n.uuid && (o.value = null), t.value = n, me(n);
  }
  function J() {
    t.value = null, o.value = null;
  }
  function N() {
    o.value = null;
  }
  function Q() {
    const n = t.value ? x(t.value.uuid) : null;
    n && (o.value = n);
  }
  function I(n) {
    n.raw_url && (o.value = n);
  }
  const ue = U(() => t.value ? v(t.value.uuid).parts : []), L = U(() => t.value ? v(t.value.uuid).total : 0), X = U(() => t.value ? v(t.value.uuid).page : 1), de = U(() => Math.max(1, Math.ceil(L.value / re))), ce = U(() => L.value ? (X.value - 1) * re + 1 : 0), pe = U(() => Math.min(L.value, (X.value - 1) * re + ue.value.length)), Pe = U(() => !!(t.value && x(t.value.uuid))), Ce = U(() => !!(t.value && v(t.value.uuid).loading));
  function Ee(n) {
    if (!t.value) return;
    const f = Math.min(Math.max(1, n), de.value);
    f !== X.value && me(t.value, !0, f);
  }
  function ve() {
    if (o.value?.raw_url) return o.value.raw_url;
    if (t.value && !ke(t.value.mime_type)) {
      const n = x(t.value.uuid);
      if (n?.raw_url) return n.raw_url;
    }
    return t.value?.raw_url || "";
  }
  function Te() {
    if (o.value) return o.value.label || o.value.artifact_id;
    if (t.value && !ke(t.value.mime_type)) {
      const n = x(t.value.uuid);
      if (n) return n.label || n.artifact_id;
    }
    return t.value ? D(t.value) : "download";
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
    if (!p.value) {
      p.value = !0;
      try {
        const n = await fe(ve());
        if (!n) return;
        const f = document.createElement("a");
        f.href = n, f.download = Te(), f.click(), setTimeout(() => URL.revokeObjectURL(n), 1e4);
      } finally {
        p.value = !1;
      }
    }
  }
  async function Ae() {
    if (!p.value) {
      p.value = !0;
      try {
        const n = await fe(ve());
        n && (window.open(n, "_blank", "noopener"), setTimeout(() => URL.revokeObjectURL(n), 6e4));
      } finally {
        p.value = !1;
      }
    }
  }
  async function me(n, f = !1, H = 1) {
    const j = v(n.uuid);
    if (!((j.loaded || j.loading) && !f)) {
      y(n.uuid, { ...j, loading: !0, error: "" });
      try {
        const Y = (H - 1) * re, { data: W } = await q.get(`/api/v1/uploads/${n.uuid}/artifacts`, { params: { limit: re, offset: Y } });
        if (!W.success) {
          y(n.uuid, { ...j, loaded: !0, loading: !1, error: W.error || "failed to load artifacts", primary: null, parts: [], total: 0, page: H });
          return;
        }
        const ge = W.artifacts || [], F = W.primary || ge.find((A) => G(A) && !!A.raw_url) || null, M = ge.filter((A) => !l(A) && !G(A));
        y(n.uuid, {
          loaded: !0,
          loading: !1,
          error: "",
          primary: F,
          parts: M,
          total: Number(W.meta?.total ?? M.length),
          page: H
        }), H === 1 && _(n);
      } catch (Y) {
        y(n.uuid, { ...j, loaded: !0, loading: !1, error: Y instanceof Error ? Y.message : "failed to load artifacts" });
      }
    }
  }
  return {
    preview: t,
    artifactView: o,
    artifactsByUpload: u,
    partsExpanded: T,
    busyAction: p,
    artifactStateFor: v,
    isSourceArtifact: l,
    primaryMarkdownFor: x,
    activePreviewSource: se,
    openPreview: O,
    closePreview: J,
    viewOriginal: N,
    viewPrimary: Q,
    viewArtifact: I,
    currentArtifacts: ue,
    partsTotal: L,
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
const ta = () => st(), aa = () => ut(), ia = { class: "kx" }, na = { class: "kx-head" }, ra = { class: "kx-head-icon" }, la = { class: "kx-head-actions" }, oa = { class: "kx-count" }, sa = {
  key: 0,
  class: "kx-count kx-pending"
}, ua = {
  key: 0,
  class: "kx-err",
  role: "alert"
}, da = {
  key: 1,
  class: "kx-loading",
  role: "status"
}, ca = {
  key: 2,
  class: "kx-err",
  role: "alert",
  "data-testid": "uploads-link-error"
}, pa = { class: "kx-body" }, va = { class: "kx-main" }, fa = { class: "kx-drop-title" }, ma = {
  key: 0,
  class: "kx-loading"
}, ga = {
  key: 1,
  class: "kx-empty"
}, ya = { class: "kx-empty-ico" }, wa = {
  key: 2,
  class: "kx-empty"
}, ba = { class: "kx-list" }, ha = { class: "kx-ficon" }, ka = { class: "kx-id" }, xa = ["title"], Pa = { class: "kx-sub" }, Ca = { class: "kx-type" }, Ea = ["title"], Ta = { class: "kx-date" }, Sa = { class: "kx-actions" }, Aa = {
  key: 0,
  class: "kx-progress",
  "aria-hidden": "true"
}, le = 30, $a = /* @__PURE__ */ je({
  __name: "uploads",
  setup(e) {
    const t = /* @__PURE__ */ new Set(["completed", "error"]), o = [
      { label: "All status", value: "all" },
      { label: "Uploaded", value: "uploaded" },
      { label: "Processing", value: "processing" },
      { label: "Completed", value: "completed" },
      { label: "Error", value: "error" }
    ], u = w([]), T = w(0), p = w(!1), v = w(""), y = w(!1), l = w(0), x = w(""), _ = w("all"), R = w(1), se = w(!1);
    let O = null, J = !1, N = !1;
    const Q = w(!1), {
      preview: I,
      artifactView: ue,
      partsExpanded: L,
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
      downloadActive: j,
      openActive: Y
    } = ea(v), W = ta(), ge = aa(), F = w(""), M = w(!1);
    let A = 0, ye = null;
    function Ne(s = "") {
      ye = s, ge("navigate", { path: s });
    }
    function Je(s) {
      A++, F.value = "", M.value = !1, ce(s), Ne(s.uuid);
    }
    function Z() {
      A++, F.value = "", M.value = !1, pe(), Ne();
    }
    he(() => W.value.route, async (s) => {
      const i = String(s ?? "").replace(/^\/+|\/+$/g, "");
      if (ye !== null && i !== ye) return;
      ye = null;
      const r = ++A;
      if (F.value = "", M.value = !1, i !== I.value?.uuid && (pe(), !!i)) {
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
    const $e = w(""), we = w({});
    let V = null, be = "";
    const Le = U(() => typeof we.value.pending_count == "number" ? we.value.pending_count : u.value.filter((s) => !t.has(K(s.status))).length), Fe = U(() => Math.max(1, Math.ceil(T.value / le)));
    function z() {
      return N ? Promise.resolve() : (J = !0, O || (p.value = !0, O = Promise.resolve().then(async () => {
        try {
          for (; J && !N; ) {
            J = !1;
            const s = R.value, i = x.value.trim(), r = _.value, C = () => !N && s === R.value && i === x.value.trim() && r === _.value;
            v.value = "";
            try {
              const $ = { limit: le, offset: (s - 1) * le };
              i && ($.q = i), r !== "all" && ($.status = r);
              const { data: ae } = await q.get("/api/v1/uploads/list", { params: $ });
              if (!C()) continue;
              ae.success ? (u.value = ae.uploads || [], T.value = Number(ae.meta?.total ?? u.value.length), typeof ae.component_id == "string" && ($e.value = ae.component_id)) : (u.value = [], T.value = 0);
            } catch ($) {
              if (!C()) continue;
              u.value = [], T.value = 0, v.value = $ instanceof Error ? $.message : "failed to load uploads";
            }
          }
        } finally {
          O = null, N || (p.value = !1);
        }
      }), O));
    }
    function Qe(s) {
      const i = Math.max(1, Math.min(Fe.value, s));
      i !== R.value && (R.value = i, z());
    }
    let ee = null;
    he(x, () => {
      ee && clearTimeout(ee), ee = setTimeout(() => {
        R.value = 1, z();
      }, 300);
    }), he(_, () => {
      R.value = 1, z();
    });
    function Ve() {
      if (N) return;
      const s = $e.value;
      !s || be === s || (V && V(), V = null, be = "", V = Pt(s, (i) => {
        we.value = { ...we.value, ...i.meta }, z();
      }), V && (be = s));
    }
    he($e, () => {
      Ve();
    });
    async function Xe(s) {
      const i = new FormData();
      i.append("file", s), i.append("metadata", JSON.stringify({ target_parent_id: "", filename: s.name }));
      try {
        const { data: r } = await q.post("/api/v1/uploads", i, { headers: { "Content-Type": "multipart/form-data" } });
        r.success || (v.value = r.error || `failed to upload "${s.name}"`);
      } catch (r) {
        v.value = r instanceof Error ? r.message : `failed to upload "${s.name}"`;
      }
    }
    async function ze(s) {
      const i = Array.from(s);
      if (i.length) {
        v.value = "", l.value += i.length;
        try {
          for (const r of i) await Xe(r);
        } finally {
          l.value = Math.max(0, l.value - i.length), R.value = 1, await z();
        }
      }
    }
    function te() {
      const s = document.createElement("input");
      s.type = "file", s.multiple = !0, s.onchange = () => {
        s.files?.length && ze(s.files);
      }, s.click();
    }
    function He(s) {
      s.preventDefault(), y.value = !1, s.dataTransfer?.files?.length && ze(s.dataTransfer.files);
    }
    async function Ye(s) {
      await wt.confirm({
        header: "Delete upload",
        message: "Deletes the file everywhere; workspace links are removed.",
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await Ze(s);
    }
    async function Ze(s) {
      se.value = !0, v.value = "";
      try {
        const { data: i } = await q.delete(`/api/v1/uploads/${s.uuid}`);
        i.success ? (I.value?.uuid === s.uuid && Z(), u.value.length === 1 && R.value > 1 && (R.value -= 1), await z()) : v.value = i.error || "failed to delete upload";
      } catch (i) {
        v.value = i instanceof Error ? i.message : "failed to delete upload";
      } finally {
        se.value = !1;
      }
    }
    async function et(s) {
      if (!Q.value) {
        Q.value = !0, v.value = "";
        try {
          const { data: i } = await q.post(`/api/v1/uploads/${s.uuid}/retry`);
          i.success ? (I.value?.uuid === s.uuid && Z(), await z()) : v.value = i.error || "failed to retry upload";
        } catch (i) {
          v.value = i instanceof Error ? i.message : "failed to retry upload";
        } finally {
          Q.value = !1;
        }
      }
    }
    function Be(s) {
      s.key === "Escape" && I.value && Z();
    }
    async function tt() {
      try {
        await z(), Ve();
      } catch (s) {
        v.value = s instanceof Error ? s.message : "host API unavailable";
      }
    }
    return dt(tt), rt(() => {
      window.addEventListener("keydown", Be), yt("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), lt(() => {
      N = !0, J = !1, A++, window.removeEventListener("keydown", Be), ee && clearTimeout(ee), V && V(), V = null, be = "";
    }), (s, i) => (m(), b("div", ia, [
      c("header", na, [
        c("div", ra, [
          d(a(g), {
            icon: "tabler:files",
            "aria-hidden": "true"
          })
        ]),
        i[10] || (i[10] = c("div", { class: "kx-head-text" }, [
          c("h1", { class: "kx-title" }, "Uploads"),
          c("p", { class: "kx-head-sub" }, "Files your agents can read and process.")
        ], -1)),
        c("div", la, [
          c("span", oa, P(T.value) + " file" + P(T.value !== 1 ? "s" : ""), 1),
          Le.value ? (m(), b("span", sa, [
            d(a(g), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            ie(" " + P(Le.value) + " processing", 1)
          ])) : E("", !0),
          d(a(pt), { class: "kx-search" }, {
            default: k(() => [
              d(a(Ie), null, {
                default: k(() => [
                  d(a(g), {
                    icon: "tabler:search",
                    "aria-hidden": "true"
                  })
                ]),
                _: 1
              }),
              d(a(vt), {
                modelValue: x.value,
                "onUpdate:modelValue": i[0] || (i[0] = (r) => x.value = r),
                placeholder: "Search files…",
                "aria-label": "Search files",
                "data-testid": "uploads-search-input"
              }, null, 8, ["modelValue"]),
              x.value ? (m(), B(a(Ie), { key: 0 }, {
                default: k(() => [
                  d(a(S), {
                    type: "button",
                    text: "",
                    severity: "secondary",
                    size: "small",
                    "aria-label": "Clear search",
                    "data-testid": "uploads-search-clear",
                    onClick: i[1] || (i[1] = (r) => x.value = "")
                  }, {
                    icon: k(({ class: r }) => [
                      d(a(g), {
                        icon: "tabler:x",
                        class: h(r),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })) : E("", !0)
            ]),
            _: 1
          }),
          d(a(mt), {
            modelValue: _.value,
            "onUpdate:modelValue": i[2] || (i[2] = (r) => _.value = r),
            class: "kx-select",
            options: o,
            "option-label": "label",
            "option-value": "value",
            "aria-label": "Filter by status"
          }, null, 8, ["modelValue"]),
          d(a(S), {
            type: "button",
            "data-testid": "uploads-header-upload",
            label: l.value > 0 ? "Uploading…" : "Upload",
            loading: l.value > 0,
            disabled: l.value > 0,
            onClick: te
          }, {
            icon: k(({ class: r }) => [
              d(a(g), {
                icon: "tabler:upload",
                class: h(r),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ])
      ]),
      v.value ? (m(), b("div", ua, P(v.value), 1)) : E("", !0),
      M.value ? (m(), b("div", da, "Loading file…")) : E("", !0),
      F.value ? (m(), b("div", ca, [
        ie(P(F.value) + " ", 1),
        d(a(S), {
          label: "Close preview",
          text: "",
          severity: "secondary",
          onClick: Z
        })
      ])) : E("", !0),
      c("div", pa, [
        c("div", va, [
          c("div", {
            class: h(["kx-drop", { dragover: y.value, busy: l.value > 0 }]),
            role: "button",
            tabindex: "0",
            "aria-label": "Upload files",
            onClick: i[3] || (i[3] = (r) => l.value === 0 && te()),
            onKeydown: [
              i[4] || (i[4] = Oe((r) => l.value === 0 && te(), ["enter"])),
              i[5] || (i[5] = Oe(De((r) => l.value === 0 && te(), ["prevent"]), ["space"]))
            ],
            onDragover: i[6] || (i[6] = De((r) => y.value = !0, ["prevent"])),
            onDragleave: i[7] || (i[7] = (r) => y.value = !1),
            onDrop: He
          }, [
            d(a(g), {
              icon: l.value > 0 ? "tabler:loader-2" : "tabler:cloud-upload",
              class: h(["kx-drop-ico", l.value > 0 && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            c("p", fa, P(l.value > 0 ? "Uploading…" : "Drop files or click to browse"), 1),
            i[11] || (i[11] = c("p", { class: "kx-drop-sub" }, "Documents convert to markdown; images and text are stored for agents.", -1))
          ], 34),
          p.value && !u.value.length ? (m(), b("div", ma, [
            d(a(g), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[12] || (i[12] = ie(" Loading…", -1))
          ])) : !T.value && !x.value && _.value === "all" ? (m(), b("div", ga, [
            c("div", ya, [
              d(a(g), {
                icon: "tabler:cloud-upload",
                "aria-hidden": "true"
              })
            ]),
            i[13] || (i[13] = c("div", { class: "kx-empty-title" }, "No uploads yet", -1)),
            i[14] || (i[14] = c("div", { class: "kx-empty-sub" }, "Upload a document, image, or text file to make it available to your agents.", -1)),
            d(a(S), {
              type: "button",
              class: "kx-empty-cta",
              "data-testid": "uploads-empty-upload",
              label: "Upload files",
              onClick: te
            }, {
              icon: k(({ class: r }) => [
                d(a(g), {
                  icon: "tabler:upload",
                  class: h(r),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])) : u.value.length ? (m(), b(xe, { key: 3 }, [
            c("div", ba, [
              (m(!0), b(xe, null, We(u.value, (r) => (m(), b("div", {
                key: r.uuid,
                class: "kx-row"
              }, [
                c("span", ha, [
                  d(a(g), {
                    icon: a(Ue)(r.mime_type),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                c("div", ka, [
                  c("div", {
                    class: "kx-name",
                    title: a(D)(r)
                  }, P(a(D)(r)), 9, xa),
                  c("div", Pa, [
                    c("span", Ca, P(a(Ke)(r)), 1),
                    ie(" · " + P(a(oe)(r.size)), 1)
                  ]),
                  a(Ge)(r) && r.error ? (m(), b("div", {
                    key: 0,
                    class: "kx-err-reason",
                    title: a(Me)(r.error)
                  }, P(a(Me)(r.error)), 9, Ea)) : E("", !0)
                ]),
                d(a(ct), {
                  severity: a(Et)(r.status),
                  class: "kx-badge kx-tag-sm"
                }, {
                  default: k(() => [
                    a(t).has(r.status) ? E("", !0) : (m(), B(a(g), {
                      key: 0,
                      icon: "tabler:loader-2",
                      class: "spin",
                      "aria-hidden": "true"
                    })),
                    ie(" " + P(a(Tt)(r.status)), 1)
                  ]),
                  _: 2
                }, 1032, ["severity"]),
                c("span", Ta, P(a(qe)(r.created_at)), 1),
                c("div", Sa, [
                  a(_t)(r) ? (m(), B(a(S), {
                    key: 0,
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-row-preview",
                    "data-upload-id": r.uuid,
                    "aria-label": `Preview ${a(D)(r)}`,
                    onClick: (C) => Je(r)
                  }, {
                    icon: k(({ class: C }) => [
                      d(a(g), {
                        icon: "tabler:eye",
                        class: h(C),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["data-upload-id", "aria-label", "onClick"])) : E("", !0),
                  d(a(S), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    severity: "danger",
                    "data-testid": "uploads-row-delete",
                    "data-upload-id": r.uuid,
                    "aria-label": `Delete ${a(D)(r)}`,
                    onClick: (C) => Ye(r)
                  }, {
                    icon: k(({ class: C }) => [
                      d(a(g), {
                        icon: "tabler:trash",
                        class: h(C),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["data-upload-id", "aria-label", "onClick"])
                ]),
                a(Lt)(r) ? (m(), b("span", Aa)) : E("", !0)
              ]))), 128))
            ]),
            Fe.value > 1 ? (m(), B(a(ft), {
              key: 0,
              first: (R.value - 1) * le,
              rows: le,
              "total-records": T.value,
              "page-link-size": 5,
              template: "CurrentPageReport PrevPageLink PageLinks NextPageLink",
              "current-page-report-template": "{first}–{last} of {totalRecords}",
              "data-testid": "uploads-pager",
              "aria-label": "Pagination",
              pt: {
                prev: { "data-testid": "uploads-pager-previous" },
                next: { "data-testid": "uploads-pager-next" }
              },
              onPage: i[8] || (i[8] = (r) => Qe(r.page + 1))
            }, null, 8, ["first", "total-records"])) : E("", !0)
          ], 64)) : (m(), b("div", wa, [...i[15] || (i[15] = [
            c("div", { class: "kx-empty-title" }, "No matches", -1),
            c("div", { class: "kx-empty-sub" }, "No files match the current search or filter.", -1)
          ])]))
        ])
      ]),
      d(Zt, {
        "parts-expanded": a(L),
        "onUpdate:partsExpanded": i[9] || (i[9] = (r) => ot(L) ? L.value = r : null),
        preview: a(I),
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
        "download-active": a(j),
        "open-active": a(Y),
        "close-preview": Z,
        "view-original": a(Pe),
        "view-primary": a(Ce),
        "view-artifact": a(Ee),
        "goto-parts-page": a(H),
        retrying: Q.value,
        "retry-upload": et
      }, null, 8, ["parts-expanded", "preview", "artifact-view", "busy-action", "current-artifacts", "parts-total", "parts-page", "parts-pages", "parts-range-start", "parts-range-end", "has-primary", "artifacts-loading", "active-preview-source", "download-active", "open-active", "view-original", "view-primary", "view-artifact", "goto-parts-page", "retrying"])
    ]));
  }
}), ja = {
  rootComponent: $a,
  plugins: [at]
};
export {
  ja as mountConfig
};
//# sourceMappingURL=lazy-mount-CYUiIJUc.js.map

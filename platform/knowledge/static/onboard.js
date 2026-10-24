import { W as R } from "./index-D52CRMw6.js";
import { defineComponent as V, ref as k, computed as D, onUnmounted as N, openBlock as s, createElementBlock as r, createVNode as y, unref as a, createElementVNode as n, toDisplayString as c, createCommentVNode as $, Fragment as _, withModifiers as z, normalizeClass as F, renderList as W, createBlock as C, reactive as I } from "vue";
import { Icon as p } from "@iconify/vue";
import { api as w, define as j } from "@wippy-fe/proxy";
import { a as G, s as H } from "./componentRealtime-Bs_cyDpl.js";
import { s as J } from "./styles-DqTthkup.js";
const Q = { class: "kn-ob" }, X = {
  key: 0,
  class: "kn-ob-err"
}, Y = {
  key: 1,
  class: "kn-ob-done"
}, Z = { class: "kn-ob-done-ico" }, ee = { class: "kn-ob-done-text" }, te = { class: "kn-ob-done-title" }, oe = { class: "kn-ob-done-sub" }, ne = {
  key: 0,
  class: "kn-files"
}, se = { class: "kn-file-ico" }, ae = { class: "kn-file-name" }, re = { class: "kn-file-meta" }, le = ["onClick"], ie = { class: "kn-ob-foot" }, ue = ["disabled"], de = /* @__PURE__ */ V({
  __name: "Onboard",
  setup(S) {
    const h = G(), E = {
      uploading: "Uploading",
      processing: "Processing",
      ready: "Ready",
      error: "Error"
    }, l = k([]), m = k(!1), v = k(!1), f = k(""), d = k(null);
    let b = "", i = null;
    const g = D(() => l.value.filter((e) => e.status === "ready")), B = D(() => l.value.some((e) => e.status === "uploading" || e.status === "processing"));
    async function x(e) {
      if (!(!e.upload_id || e.status !== "processing"))
        try {
          const { data: t } = await w.get(`/api/v1/uploads/${encodeURIComponent(e.upload_id)}`), o = String(t?.upload?.status || "");
          if (o === "completed") {
            e.status = "ready";
            return;
          }
          (o === "error" || o === "failed") && (e.status = "error", e.error = t?.upload?.error || "extraction failed");
        } catch (t) {
          e.status = "error", e.error = t instanceof Error ? t.message : "failed to read upload status";
        }
    }
    function T() {
      for (const e of l.value)
        e.status === "processing" && x(e);
    }
    function q(e) {
      !e || b === e || (i && i(), i = null, b = "", i = H(e, () => T()), i && (b = e));
    }
    async function A(e) {
      const t = I({ name: e.name, size: e.size, status: "uploading" });
      l.value.push(t);
      try {
        const o = new FormData();
        o.append("file", e);
        const { data: u } = await w.post("/api/v1/uploads", o, { headers: { "Content-Type": "multipart/form-data" } });
        if (!u?.success || !u.uuid) {
          t.status = "error", t.error = u?.error || "upload failed";
          return;
        }
        t.upload_id = u.uuid, q(typeof u.component_id == "string" ? u.component_id : void 0), t.status = "processing", await x(t);
      } catch (o) {
        t.status = "error", t.error = o instanceof Error ? o.message : "upload failed";
      }
    }
    function U(e) {
      f.value = "", d.value = null;
      for (const t of Array.from(e)) A(t);
    }
    function K(e) {
      e.preventDefault(), m.value = !1, e.dataTransfer?.files?.length && U(e.dataTransfer.files);
    }
    function L() {
      const e = document.createElement("input");
      e.type = "file", e.multiple = !0, e.onchange = () => {
        e.files?.length && U(e.files);
      }, e.click();
    }
    function M(e) {
      l.value = l.value.filter((t) => t !== e);
    }
    async function O() {
      const e = g.value.map((t) => t.upload_id).filter(Boolean);
      if (!(!e.length || v.value)) {
        v.value = !0, f.value = "";
        try {
          const { data: t } = await w.post("/api/v1/knowledge/organize", { upload_ids: e });
          if (!t?.success || !t.kb_id) {
            f.value = t?.error || "could not build the knowledge base";
            return;
          }
          d.value = { kb_id: t.kb_id, kb_name: t.kb_name, queued: t.queued, total: t.total };
        } catch (t) {
          f.value = t instanceof Error ? t.message : "could not build the knowledge base";
        } finally {
          v.value = !1;
        }
      }
    }
    function P(e) {
      return e >= 1024 * 1024 ? (e / 1024 / 1024).toFixed(1) + " MB" : e >= 1024 ? Math.round(e / 1024) + " KB" : e + " B";
    }
    return N(() => {
      i && i(), i = null, b = "";
    }), (e, t) => (s(), r("div", Q, [
      f.value ? (s(), r("div", X, [
        y(a(p), { icon: "tabler:alert-triangle" }),
        n("span", null, c(f.value), 1)
      ])) : $("", !0),
      d.value ? (s(), r("div", Y, [
        n("span", Z, [
          y(a(p), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        n("div", ee, [
          n("div", te, "“" + c(d.value.kb_name) + "” is building", 1),
          n("div", oe, c(d.value.queued) + " of " + c(d.value.total) + " files queued — they’ll finish embedding in the background.", 1)
        ])
      ])) : (s(), r(_, { key: 2 }, [
        n("button", {
          type: "button",
          class: F(["kn-drop", { over: m.value }]),
          onClick: L,
          onDragover: t[0] || (t[0] = z((o) => m.value = !0, ["prevent"])),
          onDragleave: t[1] || (t[1] = z((o) => m.value = !1, ["prevent"])),
          onDrop: K
        }, [
          y(a(p), {
            icon: "tabler:cloud-upload",
            class: "kn-drop-ico",
            "aria-hidden": "true"
          }),
          t[5] || (t[5] = n("span", { class: "kn-drop-title" }, "Drop files here, or click to choose", -1)),
          t[6] || (t[6] = n("span", { class: "kn-drop-sub" }, "PDFs, Word docs, spreadsheets, text. A fast model organizes them into a knowledge base.", -1))
        ], 34),
        l.value.length ? (s(), r("div", ne, [
          (s(!0), r(_, null, W(l.value, (o, u) => (s(), r("div", {
            key: u,
            class: F(["kn-file", o.status])
          }, [
            n("span", se, [
              o.status === "ready" ? (s(), C(a(p), {
                key: 0,
                icon: "tabler:circle-check",
                "aria-hidden": "true"
              })) : o.status === "error" ? (s(), C(a(p), {
                key: 1,
                icon: "tabler:circle-x",
                "aria-hidden": "true"
              })) : (s(), C(a(p), {
                key: 2,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }))
            ]),
            n("span", ae, c(o.name), 1),
            n("span", re, c(o.status === "error" ? o.error || E.error : o.status === "ready" ? P(o.size) : E[o.status]), 1),
            n("button", {
              class: "kn-file-x",
              "aria-label": "Remove",
              onClick: (pe) => M(o)
            }, [
              y(a(p), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ], 8, le)
          ], 2))), 128))
        ])) : $("", !0)
      ], 64)),
      n("div", ie, [
        n("button", {
          type: "button",
          class: "kn-btn kn-ghost",
          onClick: t[2] || (t[2] = (o) => a(h)("back", void 0))
        }, "‹ Back"),
        t[7] || (t[7] = n("span", { class: "kn-foot-sp" }, null, -1)),
        d.value ? (s(), r("button", {
          key: 0,
          type: "button",
          class: "kn-btn kn-primary",
          onClick: t[3] || (t[3] = (o) => a(h)("done", void 0))
        }, "Continue ›")) : (s(), r(_, { key: 1 }, [
          n("button", {
            type: "button",
            class: "kn-btn kn-ghost",
            onClick: t[4] || (t[4] = (o) => a(h)("done", void 0))
          }, "Skip for now"),
          n("button", {
            class: "kn-btn kn-primary",
            disabled: !g.value.length || B.value || v.value,
            onClick: O
          }, c(v.value ? "Building…" : B.value ? "Processing…" : `Build knowledge base${g.value.length ? " (" + g.value.length + ")" : ""}`), 9, ue)
        ], 64))
      ])
    ]));
  }
});
class ce extends R {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "iframeCssUrl"],
      inlineCss: J
    };
  }
  static get vueConfig() {
    return { rootComponent: de };
  }
}
j(import.meta.url, ce);
//# sourceMappingURL=onboard.js.map

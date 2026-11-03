import { W } from "./index-D52CRMw6.js";
import { defineComponent as I, ref as b, computed as T, onUnmounted as j, openBlock as a, createElementBlock as u, createVNode as C, unref as l, createElementVNode as s, toDisplayString as p, createCommentVNode as $, Fragment as E, withModifiers as z, normalizeClass as A, renderList as Q, createBlock as x, reactive as Y } from "vue";
import { Icon as f } from "@iconify/vue";
import { api as B, define as G } from "@wippy-fe/proxy";
import { a as H, s as J } from "./componentRealtime-DGbE-Xic.js";
import { s as X } from "./styles-Bn0s9kIq.js";
const Z = { class: "kn-ob" }, ee = {
  key: 0,
  class: "kn-ob-err"
}, te = {
  key: 1,
  class: "kn-ob-done"
}, ne = { class: "kn-ob-done-ico" }, se = { class: "kn-ob-done-text" }, oe = { class: "kn-ob-done-title" }, ae = { class: "kn-ob-done-sub" }, re = {
  key: 0,
  class: "kn-files"
}, le = { class: "kn-file-ico" }, ie = { class: "kn-file-name" }, ue = { class: "kn-file-meta" }, de = ["onClick"], ce = { class: "kn-ob-foot" }, pe = ["disabled"], fe = 4, ve = /* @__PURE__ */ I({
  __name: "Onboard",
  setup(P) {
    const w = H(), U = {
      uploading: "Uploading",
      processing: "Processing",
      ready: "Ready",
      error: "Error"
    }, o = b([]), g = b(!1), k = b(!1), v = b(""), c = b(null);
    let y = "", d = null, m = null, h = !1, i = !1;
    const _ = T(() => o.value.filter((e) => e.status === "ready")), D = T(() => o.value.some((e) => e.status === "uploading" || e.status === "processing"));
    async function F(e) {
      if (!(i || !o.value.includes(e) || !e.upload_id || e.status !== "processing"))
        try {
          const { data: t } = await B.get(`/api/v1/uploads/${encodeURIComponent(e.upload_id)}`);
          if (i || !o.value.includes(e)) return;
          const n = String(t?.upload?.status || "");
          if (n === "completed") {
            e.status = "ready";
            return;
          }
          (n === "error" || n === "failed") && (e.status = "error", e.error = t?.upload?.error || "extraction failed");
        } catch (t) {
          if (i || !o.value.includes(e)) return;
          e.status = "error", e.error = t instanceof Error ? t.message : "failed to read upload status";
        }
    }
    function R() {
      return i ? Promise.resolve() : (h = !0, m || (m = Promise.resolve().then(async () => {
        try {
          for (; h && !i; ) {
            h = !1;
            const e = o.value.filter((r) => r.status === "processing");
            let t = 0;
            const n = async () => {
              for (; !i && t < e.length; ) await F(e[t++]);
            };
            await Promise.all(Array.from({ length: Math.min(fe, e.length) }, n));
          }
        } finally {
          m = null;
        }
      }), m));
    }
    function N(e) {
      !e || y === e || (d && d(), d = null, y = "", d = J(e, () => {
        R();
      }), d && (y = e));
    }
    async function M(e) {
      const t = Y({ name: e.name, size: e.size, status: "uploading" });
      o.value.push(t);
      try {
        const n = new FormData();
        n.append("file", e);
        const { data: r } = await B.post("/api/v1/uploads", n, { headers: { "Content-Type": "multipart/form-data" } });
        if (i || !o.value.includes(t)) return;
        if (!r?.success || !r.uuid) {
          t.status = "error", t.error = r?.error || "upload failed";
          return;
        }
        t.upload_id = r.uuid, N(typeof r.component_id == "string" ? r.component_id : void 0), t.status = "processing", await R();
      } catch (n) {
        if (i || !o.value.includes(t)) return;
        t.status = "error", t.error = n instanceof Error ? n.message : "upload failed";
      }
    }
    function S(e) {
      v.value = "", c.value = null;
      for (const t of Array.from(e)) M(t);
    }
    function O(e) {
      e.preventDefault(), g.value = !1, e.dataTransfer?.files?.length && S(e.dataTransfer.files);
    }
    function q() {
      const e = document.createElement("input");
      e.type = "file", e.multiple = !0, e.onchange = () => {
        e.files?.length && S(e.files);
      }, e.click();
    }
    function K(e) {
      o.value = o.value.filter((t) => t !== e);
    }
    async function L() {
      const e = _.value.map((t) => t.upload_id).filter(Boolean);
      if (!(!e.length || k.value)) {
        k.value = !0, v.value = "";
        try {
          const { data: t } = await B.post("/api/v1/knowledge/organize", { upload_ids: e });
          if (!t?.success || !t.kb_id) {
            v.value = t?.error || "could not build the knowledge base";
            return;
          }
          c.value = { kb_id: t.kb_id, kb_name: t.kb_name, queued: t.queued, total: t.total };
        } catch (t) {
          v.value = t instanceof Error ? t.message : "could not build the knowledge base";
        } finally {
          k.value = !1;
        }
      }
    }
    function V(e) {
      return e >= 1024 * 1024 ? (e / 1024 / 1024).toFixed(1) + " MB" : e >= 1024 ? Math.round(e / 1024) + " KB" : e + " B";
    }
    return j(() => {
      i = !0, h = !1, d && d(), d = null, y = "";
    }), (e, t) => (a(), u("div", Z, [
      v.value ? (a(), u("div", ee, [
        C(l(f), { icon: "tabler:alert-triangle" }),
        s("span", null, p(v.value), 1)
      ])) : $("", !0),
      c.value ? (a(), u("div", te, [
        s("span", ne, [
          C(l(f), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        s("div", se, [
          s("div", oe, "“" + p(c.value.kb_name) + "” is building", 1),
          s("div", ae, p(c.value.queued) + " of " + p(c.value.total) + " files queued — they’ll finish embedding in the background.", 1)
        ])
      ])) : (a(), u(E, { key: 2 }, [
        s("button", {
          type: "button",
          class: A(["kn-drop", { over: g.value }]),
          onClick: q,
          onDragover: t[0] || (t[0] = z((n) => g.value = !0, ["prevent"])),
          onDragleave: t[1] || (t[1] = z((n) => g.value = !1, ["prevent"])),
          onDrop: O
        }, [
          C(l(f), {
            icon: "tabler:cloud-upload",
            class: "kn-drop-ico",
            "aria-hidden": "true"
          }),
          t[5] || (t[5] = s("span", { class: "kn-drop-title" }, "Drop files here, or click to choose", -1)),
          t[6] || (t[6] = s("span", { class: "kn-drop-sub" }, "PDFs, Word docs, spreadsheets, text. A fast model organizes them into a knowledge base.", -1))
        ], 34),
        o.value.length ? (a(), u("div", re, [
          (a(!0), u(E, null, Q(o.value, (n, r) => (a(), u("div", {
            key: r,
            class: A(["kn-file", n.status])
          }, [
            s("span", le, [
              n.status === "ready" ? (a(), x(l(f), {
                key: 0,
                icon: "tabler:circle-check",
                "aria-hidden": "true"
              })) : n.status === "error" ? (a(), x(l(f), {
                key: 1,
                icon: "tabler:circle-x",
                "aria-hidden": "true"
              })) : (a(), x(l(f), {
                key: 2,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }))
            ]),
            s("span", ie, p(n.name), 1),
            s("span", ue, p(n.status === "error" ? n.error || U.error : n.status === "ready" ? V(n.size) : U[n.status]), 1),
            s("button", {
              class: "kn-file-x",
              "aria-label": "Remove",
              onClick: (me) => K(n)
            }, [
              C(l(f), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ], 8, de)
          ], 2))), 128))
        ])) : $("", !0)
      ], 64)),
      s("div", ce, [
        s("button", {
          type: "button",
          class: "kn-btn kn-ghost",
          onClick: t[2] || (t[2] = (n) => l(w)("back", void 0))
        }, "‹ Back"),
        t[7] || (t[7] = s("span", { class: "kn-foot-sp" }, null, -1)),
        c.value ? (a(), u("button", {
          key: 0,
          type: "button",
          class: "kn-btn kn-primary",
          onClick: t[3] || (t[3] = (n) => l(w)("done", void 0))
        }, "Continue ›")) : (a(), u(E, { key: 1 }, [
          s("button", {
            type: "button",
            class: "kn-btn kn-ghost",
            onClick: t[4] || (t[4] = (n) => l(w)("done", void 0))
          }, "Skip for now"),
          s("button", {
            class: "kn-btn kn-primary",
            disabled: !_.value.length || D.value || k.value,
            onClick: L
          }, p(k.value ? "Building…" : D.value ? "Processing…" : `Build knowledge base${_.value.length ? " (" + _.value.length + ")" : ""}`), 9, pe)
        ], 64))
      ])
    ]));
  }
});
class ke extends W {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "iframeCssUrl"],
      inlineCss: X
    };
  }
  static get vueConfig() {
    return { rootComponent: ve };
  }
}
G(import.meta.url, ke);
//# sourceMappingURL=onboard.js.map

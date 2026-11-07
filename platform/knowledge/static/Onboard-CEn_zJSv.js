import { defineComponent as I, ref as m, computed as z, onUnmounted as K, openBlock as a, createElementBlock as u, createVNode as C, unref as l, createElementVNode as s, toDisplayString as f, createCommentVNode as A, Fragment as E, withModifiers as P, normalizeClass as S, renderList as Q, createBlock as x, reactive as W } from "vue";
import { Icon as p } from "@iconify/vue";
import { api as B } from "@wippy-fe/proxy";
import { b as Y, s as j } from "./constants-Yj74ScZp.js";
const G = { class: "kn-ob" }, H = {
  key: 0,
  class: "kn-ob-err"
}, J = {
  key: 1,
  class: "kn-ob-done"
}, X = { class: "kn-ob-done-ico" }, Z = { class: "kn-ob-done-text" }, ee = { class: "kn-ob-done-title" }, te = { class: "kn-ob-done-sub" }, ne = {
  key: 0,
  class: "kn-files"
}, se = { class: "kn-file-ico" }, oe = { class: "kn-file-name" }, ae = { class: "kn-file-meta" }, re = ["onClick"], le = { class: "kn-ob-foot" }, ie = ["disabled"], ue = 4, be = /* @__PURE__ */ I({
  __name: "Onboard",
  setup(de) {
    const w = Y(), D = {
      uploading: "Uploading",
      processing: "Processing",
      ready: "Ready",
      error: "Error"
    }, o = m([]), g = m(!1), k = m(!1), v = m(""), c = m(null);
    let h = "", d = null, b = null, y = !1, i = !1;
    const _ = z(() => o.value.filter((e) => e.status === "ready")), R = z(() => o.value.some((e) => e.status === "uploading" || e.status === "processing"));
    async function T(e) {
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
    function U() {
      return i ? Promise.resolve() : (y = !0, b || (b = Promise.resolve().then(async () => {
        try {
          for (; y && !i; ) {
            y = !1;
            const e = o.value.filter((r) => r.status === "processing");
            let t = 0;
            const n = async () => {
              for (; !i && t < e.length; ) await T(e[t++]);
            };
            await Promise.all(Array.from({ length: Math.min(ue, e.length) }, n));
          }
        } finally {
          b = null;
        }
      }), b));
    }
    function F(e) {
      !e || h === e || (d && d(), d = null, h = "", d = j(e, () => {
        U();
      }), d && (h = e));
    }
    async function N(e) {
      const t = W({ name: e.name, size: e.size, status: "uploading" });
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
        t.upload_id = r.uuid, F(typeof r.component_id == "string" ? r.component_id : void 0), t.status = "processing", await U();
      } catch (n) {
        if (i || !o.value.includes(t)) return;
        t.status = "error", t.error = n instanceof Error ? n.message : "upload failed";
      }
    }
    function $(e) {
      v.value = "", c.value = null;
      for (const t of Array.from(e)) N(t);
    }
    function M(e) {
      e.preventDefault(), g.value = !1, e.dataTransfer?.files?.length && $(e.dataTransfer.files);
    }
    function q() {
      const e = document.createElement("input");
      e.type = "file", e.multiple = !0, e.onchange = () => {
        e.files?.length && $(e.files);
      }, e.click();
    }
    function L(e) {
      o.value = o.value.filter((t) => t !== e);
    }
    async function O() {
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
    return K(() => {
      i = !0, y = !1, d && d(), d = null, h = "";
    }), (e, t) => (a(), u("div", G, [
      v.value ? (a(), u("div", H, [
        C(l(p), { icon: "tabler:alert-triangle" }),
        s("span", null, f(v.value), 1)
      ])) : A("", !0),
      c.value ? (a(), u("div", J, [
        s("span", X, [
          C(l(p), {
            icon: "tabler:circle-check",
            "aria-hidden": "true"
          })
        ]),
        s("div", Z, [
          s("div", ee, "“" + f(c.value.kb_name) + "” is building", 1),
          s("div", te, f(c.value.queued) + " of " + f(c.value.total) + " files queued — they’ll finish embedding in the background.", 1)
        ])
      ])) : (a(), u(E, { key: 2 }, [
        s("button", {
          type: "button",
          class: S(["kn-drop", { over: g.value }]),
          onClick: q,
          onDragover: t[0] || (t[0] = P((n) => g.value = !0, ["prevent"])),
          onDragleave: t[1] || (t[1] = P((n) => g.value = !1, ["prevent"])),
          onDrop: M
        }, [
          C(l(p), {
            icon: "tabler:cloud-upload",
            class: "kn-drop-ico",
            "aria-hidden": "true"
          }),
          t[5] || (t[5] = s("span", { class: "kn-drop-title" }, "Drop files here, or click to choose", -1)),
          t[6] || (t[6] = s("span", { class: "kn-drop-sub" }, "PDFs, Word docs, spreadsheets, text. A fast model organizes them into a knowledge base.", -1))
        ], 34),
        o.value.length ? (a(), u("div", ne, [
          (a(!0), u(E, null, Q(o.value, (n, r) => (a(), u("div", {
            key: r,
            class: S(["kn-file", n.status])
          }, [
            s("span", se, [
              n.status === "ready" ? (a(), x(l(p), {
                key: 0,
                icon: "tabler:circle-check",
                "aria-hidden": "true"
              })) : n.status === "error" ? (a(), x(l(p), {
                key: 1,
                icon: "tabler:circle-x",
                "aria-hidden": "true"
              })) : (a(), x(l(p), {
                key: 2,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }))
            ]),
            s("span", oe, f(n.name), 1),
            s("span", ae, f(n.status === "error" ? n.error || D.error : n.status === "ready" ? V(n.size) : D[n.status]), 1),
            s("button", {
              class: "kn-file-x",
              "aria-label": "Remove",
              onClick: (ce) => L(n)
            }, [
              C(l(p), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ], 8, re)
          ], 2))), 128))
        ])) : A("", !0)
      ], 64)),
      s("div", le, [
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
            disabled: !_.value.length || R.value || k.value,
            onClick: O
          }, f(k.value ? "Building…" : R.value ? "Processing…" : `Build knowledge base${_.value.length ? " (" + _.value.length + ")" : ""}`), 9, ie)
        ], 64))
      ])
    ]));
  }
});
export {
  be as default
};
//# sourceMappingURL=Onboard-CEn_zJSv.js.map

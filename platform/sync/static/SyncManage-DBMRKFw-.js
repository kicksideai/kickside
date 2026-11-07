import { defineComponent as I, computed as N, ref as c, onMounted as R, watch as T, openBlock as m, createElementBlock as v, toDisplayString as E, withModifiers as B, createVNode as y, unref as g, createCommentVNode as O, createElementVNode as $ } from "vue";
import w from "primevue/button";
import { loadByTagName as S, api as h } from "@wippy-fe/proxy";
import { u as F, a as U } from "./wc-runtime-h8e5VJvv.js";
import { u as V, _ as j, s as G, e as b } from "./SyncPipeline.vue_vue_type_script_setup_true_lang-CoUNQyHE.js";
const D = {
  key: 0,
  class: "kx-2p-r-note"
}, H = {
  key: 1,
  class: "kx-alert",
  role: "alert",
  "data-test": "manage-error"
}, J = {
  key: 0,
  class: "kx-alert",
  role: "alert"
}, L = { class: "kx-actions" }, P = "wc-schema-form", q = "kickside-transform-assist", Z = /* @__PURE__ */ I({
  __name: "SyncManage",
  setup(z) {
    const _ = F(), u = U();
    function C(e) {
      if (typeof e == "string")
        try {
          e = JSON.parse(e);
        } catch {
          return null;
        }
      return e && typeof e == "object" && !Array.isArray(e) ? e : null;
    }
    const d = N(() => {
      for (const e of [_.value.config, _.value.value]) {
        const t = C(e)?.id;
        if (typeof t == "string" && t.trim()) return t.trim();
      }
      return "";
    }), s = V({ managed: !0 }), i = c(!0), f = c(!1), l = c(!1), o = c(""), p = c("");
    async function k() {
      if (i.value = !0, f.value = !1, o.value = "", !d.value) {
        o.value = "No data sync was given to manage.", i.value = !1;
        return;
      }
      const e = await s.loadCatalog();
      if (e) {
        o.value = e, i.value = !1;
        return;
      }
      try {
        const { data: t } = await h.get(
          `/api/v1/automations/${encodeURIComponent(d.value)}/config`
        );
        if (!t?.success) {
          const r = typeof t?.error == "string" ? t.error : t?.error?.message;
          throw new Error(r || "could not load the data sync configuration");
        }
        const a = G(t.config);
        if (!a) throw new Error("this data sync has no stored configuration to edit");
        s.seed(a), p.value = a.title, f.value = !0;
      } catch (t) {
        o.value = b(t, "could not load this data sync");
      } finally {
        i.value = !1;
      }
    }
    async function M() {
      if (!f.value) return;
      const e = s.validationError.value;
      if (e) {
        o.value = e;
        return;
      }
      l.value = !0, o.value = "";
      const t = d.value;
      try {
        const a = s.currentInput(), { data: r } = await h.put(
          `/api/v1/automations/${encodeURIComponent(t)}`,
          { input: a }
        );
        if (!r?.success) {
          const n = typeof r?.error == "string" ? r.error : r?.error?.message;
          throw new Error(n || "save failed");
        }
        if (a.title !== p.value) {
          const { data: n } = await h.patch(
            `/api/v1/automations/${encodeURIComponent(t)}`,
            { title: a.title }
          );
          if (!n?.success) {
            const A = typeof n?.error == "string" ? n.error : n?.error?.message;
            throw new Error(A || "rename failed");
          }
          p.value = a.title;
        }
        u("change", { id: t }), u("close", {});
      } catch (a) {
        const r = b(a, "save failed");
        o.value = r, u("error", { message: r, error: a });
      } finally {
        l.value = !1;
      }
    }
    function x() {
      u("close", {});
    }
    return R(() => {
      S(P, { timeoutMs: 8e3 }).catch(() => {
      }), S(q, { timeoutMs: 8e3 }).catch(() => {
      }), k();
    }), T(d, (e, t) => {
      e !== t && k();
    }), (e, t) => i.value ? (m(), v("div", D, "Loading this data sync…")) : f.value ? (m(), v("form", {
      key: 2,
      class: "kx-flow",
      "data-test": "sync-manage",
      onSubmit: B(M, ["prevent"])
    }, [
      y(j, { form: g(s) }, null, 8, ["form"]),
      o.value ? (m(), v("p", J, E(o.value), 1)) : O("", !0),
      $("div", L, [
        y(g(w), {
          type: "button",
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: l.value,
          onClick: x
        }, null, 8, ["disabled"]),
        y(g(w), {
          type: "submit",
          label: "Save",
          "data-test": "sync-manage-save",
          loading: l.value,
          disabled: l.value
        }, null, 8, ["loading", "disabled"])
      ])
    ], 32)) : (m(), v("div", H, E(o.value), 1));
  }
});
export {
  Z as default
};
//# sourceMappingURL=SyncManage-DBMRKFw-.js.map

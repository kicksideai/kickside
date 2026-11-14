import { defineComponent as N, computed as h, ref as u, watch as S, openBlock as i, createElementBlock as r, createVNode as d, unref as y, createTextVNode as k, toDisplayString as _, Fragment as L, createElementVNode as o, createCommentVNode as b } from "vue";
import { Icon as w } from "@iconify/vue";
import { host as g } from "@wippy-fe/proxy";
import { a as U } from "./wc-runtime-KO3cNuNo.js";
import { i as V, _ as W, f as I, e as R } from "./WebhookSchema.vue_vue_type_script_setup_true_lang-daaVuA4R.js";
const B = {
  key: 0,
  class: "wh-detail",
  "aria-live": "polite"
}, D = {
  key: 0,
  class: "wh-detail-note"
}, E = {
  key: 1,
  class: "kx-err inline"
}, P = { class: "kx-field" }, T = { class: "wh-token" }, $ = { class: "kx-field" }, z = /* @__PURE__ */ N({
  __name: "WebhookSourceDetail",
  setup(F) {
    const p = U();
    function f(t) {
      if (typeof t != "string" || !t.trim()) return "";
      const e = t.trim();
      if (e.startsWith("{"))
        try {
          const n = JSON.parse(e), v = n.thread_id ?? n.webhook_id ?? n.id;
          return typeof v == "string" ? v : "";
        } catch {
          return "";
        }
      return e;
    }
    const l = h(() => f(p.value?.config) || f(p.value?.value)), a = u(null), c = u(!1), s = u(""), m = h(() => l.value ? V(l.value) : "");
    async function x(t) {
      if (!t) {
        a.value = null;
        return;
      }
      c.value = !0, s.value = "";
      try {
        a.value = await I(t), a.value || (s.value = "Webhook not found.");
      } catch (e) {
        s.value = R(e, "could not load webhook");
      } finally {
        c.value = !1;
      }
    }
    S(l, (t) => x(t), { immediate: !0 });
    async function C(t, e) {
      try {
        await navigator.clipboard.writeText(t), g.toast({ severity: "success", summary: "Copied", detail: e });
      } catch {
        g.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    return (t, e) => l.value ? (i(), r("section", B, [
      c.value ? (i(), r("div", D, [
        d(y(w), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        e[1] || (e[1] = k(" Loading webhook…", -1))
      ])) : s.value ? (i(), r("div", E, _(s.value), 1)) : a.value ? (i(), r(L, { key: 2 }, [
        o("div", P, [
          e[2] || (e[2] = o("span", { class: "kx-field-lbl" }, "Send events to", -1)),
          o("div", T, [
            o("code", null, _(m.value), 1),
            o("button", {
              type: "button",
              class: "wh-copy",
              title: "Copy URL",
              "aria-label": "Copy URL",
              onClick: e[0] || (e[0] = (n) => C(m.value, "endpoint URL"))
            }, [
              d(y(w), {
                icon: "tabler:copy",
                "aria-hidden": "true"
              })
            ])
          ])
        ]),
        o("div", $, [
          e[3] || (e[3] = o("span", { class: "kx-field-lbl" }, [
            k("Payload schema "),
            o("span", { class: "kx-field-hint-inline" }, "— what this webhook accepts")
          ], -1)),
          d(W, {
            schema: a.value.schema || {}
          }, null, 8, ["schema"])
        ])
      ], 64)) : b("", !0)
    ])) : b("", !0);
  }
});
export {
  z as default
};
//# sourceMappingURL=WebhookSourceDetail-78-Hp5CR.js.map

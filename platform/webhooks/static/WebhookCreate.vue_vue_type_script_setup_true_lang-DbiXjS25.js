import { defineComponent as $, ref as r, computed as g, openBlock as d, createElementBlock as u, withModifiers as B, Fragment as A, createElementVNode as t, createTextVNode as f, withDirectives as S, vModelText as E, createVNode as o, normalizeClass as y, unref as n, createCommentVNode as U, toDisplayString as x, withCtx as N } from "vue";
import { Icon as c } from "@iconify/vue";
import w from "primevue/button";
import { host as T } from "@wippy-fe/proxy";
import { u as F } from "./wc-runtime-KO3cNuNo.js";
import { b as O, i as j, p as V, _ as q, g as z, e as H, D as I } from "./WebhookSchema.vue_vue_type_script_setup_true_lang-9ykBxS9s.js";
const J = () => F(), P = { class: "kx-field" }, G = { class: "kx-field wh-schema" }, K = { class: "wh-schema-edit" }, Q = {
  key: 0,
  class: "kx-err inline"
}, X = {
  class: "kx-form-foot",
  style: { border: "0", padding: "4px 0 0" }
}, Y = {
  key: 1,
  class: "wh-secret",
  "aria-live": "polite"
}, Z = { class: "wh-secret-head" }, ee = { class: "kx-field" }, te = { class: "wh-token" }, se = { class: "kx-field" }, le = { class: "wh-token" }, ae = {
  class: "kx-form-foot",
  style: { border: "0", padding: "4px 0 0" }
}, pe = /* @__PURE__ */ $({
  __name: "WebhookCreate",
  emits: ["created", "close"],
  setup(oe, { emit: D }) {
    const p = J(), k = D, m = r(""), v = r(O(I)), h = r(!1), i = r(""), s = r(null), C = g(() => s.value ? s.value.url || j(s.value.webhook_id) : ""), L = g(() => V(v.value).schema || {}), b = r(!1);
    async function M() {
      const l = V(v.value);
      if (l.error) {
        i.value = l.error;
        return;
      }
      h.value = !0, i.value = "";
      try {
        const e = await z({ label: m.value.trim(), schema: l.schema });
        s.value = e;
      } catch (e) {
        i.value = H(e, "create failed"), p("error", { message: i.value, error: e });
      } finally {
        h.value = !1;
      }
    }
    async function _(l, e) {
      try {
        await navigator.clipboard.writeText(l), T.toast({ severity: "success", summary: "Copied", detail: e });
      } catch {
        T.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    function R() {
      if (s.value) {
        const l = String(s.value.webhook_id || s.value.thread_id || ""), e = { id: l, thread_id: l, webhook_id: l, title: s.value.label || m.value.trim() || "Webhook" };
        p("created", e), k("created", e);
      }
      p("close", {}), k("close");
    }
    function W() {
      p("close", {}), k("close");
    }
    return (l, e) => (d(), u("form", {
      class: "kx-form",
      onSubmit: B(M, ["prevent"])
    }, [
      s.value ? (d(), u("section", Y, [
        t("div", Z, [
          o(n(c), {
            icon: "tabler:shield-check",
            "aria-hidden": "true"
          }),
          e[8] || (e[8] = t("div", null, [
            t("h3", null, "Webhook created"),
            t("p", null, "Copy the secret now — it is shown once and won't be shown again.")
          ], -1))
        ]),
        t("label", ee, [
          e[9] || (e[9] = t("span", { class: "kx-field-lbl" }, "Endpoint URL", -1)),
          t("div", te, [
            t("code", null, x(C.value), 1),
            t("button", {
              type: "button",
              class: "wh-copy",
              title: "Copy URL",
              "aria-label": "Copy URL",
              onClick: e[3] || (e[3] = (a) => _(C.value, "endpoint URL"))
            }, [
              o(n(c), {
                icon: "tabler:copy",
                "aria-hidden": "true"
              })
            ])
          ])
        ]),
        t("label", se, [
          e[10] || (e[10] = t("span", { class: "kx-field-lbl" }, [
            f("Secret "),
            t("span", { class: "kx-field-hint-inline" }, "— shown once")
          ], -1)),
          t("div", le, [
            t("code", null, x(s.value.secret), 1),
            t("button", {
              type: "button",
              class: "wh-copy",
              title: "Copy secret",
              "aria-label": "Copy secret",
              onClick: e[4] || (e[4] = (a) => _(s.value.secret, "secret"))
            }, [
              o(n(c), {
                icon: "tabler:copy",
                "aria-hidden": "true"
              })
            ])
          ])
        ]),
        t("div", ae, [
          o(n(w), {
            type: "button",
            label: "Done",
            onClick: R
          }, {
            icon: N(({ class: a }) => [
              o(n(c), {
                icon: "tabler:check",
                class: y(a),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ])) : (d(), u(A, { key: 0 }, [
        t("label", P, [
          e[5] || (e[5] = t("span", { class: "kx-field-lbl" }, [
            f("Name "),
            t("span", { class: "kx-field-hint-inline" }, "— shown in automation trigger pickers")
          ], -1)),
          S(t("input", {
            "onUpdate:modelValue": e[0] || (e[0] = (a) => m.value = a),
            class: "kx-input",
            type: "text",
            placeholder: "Customer events"
          }, null, 512), [
            [E, m.value]
          ])
        ]),
        t("div", G, [
          e[7] || (e[7] = t("span", { class: "kx-field-lbl" }, [
            f("Payload schema "),
            t("span", { class: "kx-field-hint-inline" }, "— the fields each inbound request must carry")
          ], -1)),
          o(q, { schema: L.value }, null, 8, ["schema"]),
          t("div", K, [
            t("button", {
              type: "button",
              class: y(["wh-toggle", b.value && "is-open"]),
              onClick: e[1] || (e[1] = (a) => b.value = !b.value)
            }, [
              o(n(c), {
                icon: "tabler:chevron-right",
                "aria-hidden": "true"
              }),
              e[6] || (e[6] = f(" Edit as JSON Schema ", -1))
            ], 2),
            b.value ? S((d(), u("textarea", {
              key: 0,
              "onUpdate:modelValue": e[2] || (e[2] = (a) => v.value = a),
              class: "kx-input kx-textarea",
              spellcheck: "false",
              "data-test": "wh-schema"
            }, null, 512)), [
              [E, v.value]
            ]) : U("", !0)
          ])
        ]),
        i.value ? (d(), u("div", Q, x(i.value), 1)) : U("", !0),
        t("div", X, [
          o(n(w), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            onClick: W
          }),
          o(n(w), {
            type: "submit",
            label: "Create webhook",
            loading: h.value,
            disabled: h.value,
            "data-test": "wh-create"
          }, {
            icon: N(({ class: a }) => [
              o(n(c), {
                icon: "tabler:plus",
                class: y(a),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ])
      ], 64))
    ], 32));
  }
});
export {
  pe as _
};
//# sourceMappingURL=WebhookCreate.vue_vue_type_script_setup_true_lang-DbiXjS25.js.map

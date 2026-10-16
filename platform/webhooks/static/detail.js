import { u as W, i as N, _ as E, f as U, e as V, W as L, s as P } from "./styles-BOPmWjId.js";
import { defineComponent as R, computed as h, ref as u, watch as D, openBlock as l, createElementBlock as r, createVNode as d, unref as y, createTextVNode as k, toDisplayString as b, Fragment as I, createElementVNode as o, createCommentVNode as g } from "vue";
import { Icon as _ } from "@iconify/vue";
import { host as w, define as O } from "@wippy-fe/proxy";
const T = {
  key: 0,
  class: "wh-detail",
  "aria-live": "polite"
}, j = {
  key: 0,
  class: "wh-detail-note"
}, A = {
  key: 1,
  class: "kx-err inline"
}, B = { class: "kx-field" }, J = { class: "wh-token" }, K = { class: "kx-field" }, M = /* @__PURE__ */ R({
  __name: "WebhookSourceDetail",
  setup(C) {
    const p = W();
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
    const i = h(() => f(p.value?.config) || f(p.value?.value)), s = u(null), c = u(!1), a = u(""), m = h(() => i.value ? N(i.value) : "");
    async function x(t) {
      if (!t) {
        s.value = null;
        return;
      }
      c.value = !0, a.value = "";
      try {
        s.value = await U(t), s.value || (a.value = "Webhook not found.");
      } catch (e) {
        a.value = V(e, "could not load webhook");
      } finally {
        c.value = !1;
      }
    }
    D(i, (t) => x(t), { immediate: !0 });
    async function S(t, e) {
      try {
        await navigator.clipboard.writeText(t), w.toast({ severity: "success", summary: "Copied", detail: e });
      } catch {
        w.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    return (t, e) => i.value ? (l(), r("section", T, [
      c.value ? (l(), r("div", j, [
        d(y(_), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        e[1] || (e[1] = k(" Loading webhook…", -1))
      ])) : a.value ? (l(), r("div", A, b(a.value), 1)) : s.value ? (l(), r(I, { key: 2 }, [
        o("div", B, [
          e[2] || (e[2] = o("span", { class: "kx-field-lbl" }, "Send events to", -1)),
          o("div", J, [
            o("code", null, b(m.value), 1),
            o("button", {
              type: "button",
              class: "wh-copy",
              title: "Copy URL",
              "aria-label": "Copy URL",
              onClick: e[0] || (e[0] = (n) => S(m.value, "endpoint URL"))
            }, [
              d(y(_), {
                icon: "tabler:copy",
                "aria-hidden": "true"
              })
            ])
          ])
        ]),
        o("div", K, [
          e[3] || (e[3] = o("span", { class: "kx-field-lbl" }, [
            k("Payload schema "),
            o("span", { class: "kx-field-hint-inline" }, "— what this webhook accepts")
          ], -1)),
          d(E, {
            schema: s.value.schema || {}
          }, null, 8, ["schema"])
        ])
      ], 64)) : g("", !0)
    ])) : g("", !0);
  }
}), $ = {
  type: "object",
  properties: {
    value: { type: "string", default: "", description: "Selected webhook: a JSON object string {thread_id} or a bare id." },
    config: { type: "string", default: "", description: "Alias of value used by the data-flow config form." }
  }
};
class F extends L {
  static get wippyConfig() {
    return {
      propsSchema: $,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: P
    };
  }
  static get vueConfig() {
    return { rootComponent: M };
  }
}
O(import.meta.url, F);
//# sourceMappingURL=detail.js.map

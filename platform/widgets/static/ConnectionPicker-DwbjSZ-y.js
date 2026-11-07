import { defineComponent as j, computed as i, ref as v, watch as U, openBlock as a, createBlock as q, unref as y, withCtx as S, createElementVNode as w, createElementBlock as s, Fragment as O, createVNode as C, createTextVNode as $, toDisplayString as r, createCommentVNode as z } from "vue";
import { Icon as B } from "@iconify/vue";
import G from "primevue/select";
import { api as J } from "@wippy-fe/proxy";
import { a as K, u as M } from "./wc-runtime-CNDpK4lj.js";
import { p as A } from "./pickerValue-SPnnNBeX.js";
const Q = () => K(), W = () => M(), X = {
  key: 0,
  class: "cn-val"
}, Y = {
  key: 0,
  class: "cn-val-label"
}, Z = {
  key: 1,
  class: "cn-val-label cn-val-muted"
}, ee = {
  key: 2,
  class: "cn-val-label cn-val-muted"
}, ne = { class: "cn-val-id" }, oe = {
  key: 1,
  class: "cn-ph"
}, le = { class: "cn-opt-label" }, ae = {
  key: 0,
  class: "cn-opt-meta"
}, te = { class: "cn-empty" }, pe = /* @__PURE__ */ j({
  __name: "ConnectionPicker",
  setup(se) {
    const o = Q(), p = W(), I = i(() => o.value?.source || "/api/v1/connections"), N = i(() => {
      const e = (o.value?.providers || "").split(",").map((l) => l.trim()).filter(Boolean), n = (o.value?.provider || "").trim();
      return n && !e.includes(n) && e.push(n), e;
    }), L = i(() => (o.value?.replyOnly ?? "true") !== "false"), g = i(() => (o.value?.label || "").trim() || "connection"), V = i(() => o.value?.placeholder || `Select a ${g.value}…`), m = v([]), f = v(!1), c = v(!1), b = v(!1), t = v("");
    function h(e) {
      return typeof e == "string" ? e : e == null ? "" : String(e);
    }
    async function k() {
      if (!c.value) {
        c.value = !0;
        try {
          const e = N.value.length ? N.value : [""], n = /* @__PURE__ */ new Set(), l = [];
          for (const E of e) {
            const H = E ? `${I.value}?provider=${encodeURIComponent(E)}&limit=100` : `${I.value}?limit=100`, { data: P } = await J.get(H), T = Array.isArray(P?.items) ? P.items : [];
            for (const d of T) {
              if (L.value && d.reply_provider !== !0) continue;
              const _ = h(d.id);
              !_ || n.has(_) || (n.add(_), l.push({ id: _, label: h(d.label) || `Untitled ${g.value}`, icon: h(d.icon) || "tabler:plug-connected", provider: h(d.provider) }));
            }
          }
          m.value = l, f.value = !0, p("load", void 0);
        } catch (e) {
          p("error", { message: "failed to list connections", error: e });
        } finally {
          c.value = !1;
        }
      }
    }
    const u = i(() => m.value.find((e) => e.id === t.value) || null), R = i(() => !!t.value && !u.value && (c.value || !f.value));
    function D(e) {
      const n = e ?? "";
      t.value = n, p("change", { connection_id: n }), p("config-changed", { connection_id: n });
    }
    function F() {
      b.value = !0, f.value || k();
    }
    function x() {
      !t.value || u.value || c.value || k();
    }
    return U(() => [o.value?.value, o.value?.config], () => {
      t.value = A(o.value?.config, "connection_id") || A(o.value?.value, "connection_id"), x();
    }, { immediate: !0 }), U(() => [o.value?.source, o.value?.providers, o.value?.provider, o.value?.replyOnly], () => {
      f.value = !1, m.value = [], b.value ? k() : x();
    }), (e, n) => (a(), q(y(G), {
      class: "cn-select",
      "model-value": t.value,
      options: m.value,
      "option-label": "label",
      "option-value": "id",
      "filter-fields": ["label", "provider"],
      filter: "",
      checkmark: "",
      placeholder: V.value,
      loading: c.value,
      onBeforeShow: F,
      onHide: n[0] || (n[0] = (l) => b.value = !1),
      "onUpdate:modelValue": D
    }, {
      value: S(() => [
        t.value ? (a(), s("span", X, [
          C(y(B), {
            icon: u.value?.icon || "tabler:plug-connected",
            class: "cn-val-ico",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          u.value ? (a(), s("span", Y, r(u.value.label), 1)) : R.value ? (a(), s("span", Z, "Resolving…")) : (a(), s("span", ee, [
            $("Unknown " + r(g.value), 1),
            w("span", ne, r(t.value), 1)
          ]))
        ])) : (a(), s("span", oe, r(V.value), 1))
      ]),
      option: S(({ option: l }) => [
        C(y(B), {
          icon: l.icon,
          class: "cn-opt-ico",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        w("span", le, r(l.label), 1),
        l.provider ? (a(), s("span", ae, r(l.provider), 1)) : z("", !0)
      ]),
      empty: S(() => [
        w("span", te, [
          c.value ? (a(), s(O, { key: 0 }, [
            C(y(B), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            n[1] || (n[1] = $(" Loading connections…", -1))
          ], 64)) : (a(), s(O, { key: 1 }, [
            $("No connections.")
          ], 64))
        ])
      ]),
      _: 1
    }, 8, ["model-value", "options", "placeholder", "loading"]));
  }
});
export {
  pe as default
};
//# sourceMappingURL=ConnectionPicker-DwbjSZ-y.js.map

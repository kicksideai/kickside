import { defineComponent as U, ref as g, computed as r, watch as I, onMounted as M, onBeforeUnmount as L, openBlock as d, createBlock as q, unref as c, withCtx as v, createElementVNode as o, createElementBlock as y, Fragment as w, createVNode as _, createTextVNode as B, toDisplayString as C, createCommentVNode as z, normalizeClass as A } from "vue";
import { Icon as k } from "@iconify/vue";
import F from "primevue/select";
import { api as P } from "@wippy-fe/proxy";
import { a as G, u as O } from "./wc-runtime-CNDpK4lj.js";
const R = () => G(), T = () => O(), W = { class: "mp-val" }, j = { class: "mp-opt" }, H = { class: "mp-opt-body" }, J = { class: "mp-opt-title" }, K = {
  key: 0,
  class: "mp-opt-sub"
}, Q = { class: "mp-empty" }, ae = /* @__PURE__ */ U({
  __name: "ModelPicker",
  setup(X) {
    const f = R(), V = T(), u = g(!1), s = g([]), p = g([]);
    let n = 0, h = !1;
    const i = r(() => f.value?.capability || "generate"), N = r(() => f.value?.mode === "classes"), m = r(() => {
      const e = f.value?.value;
      return typeof e == "string" ? e : "";
    });
    function S(e) {
      return typeof e == "string" && e.startsWith("class:");
    }
    function $(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    const x = r(() => {
      const e = m.value;
      return e ? S(e) ? $(e.slice(6)) : s.value.find((l) => l.name === e)?.title || e : "Default model";
    }), D = r(() => S(m.value) ? "tabler:category" : "tabler:cpu"), E = r(() => {
      const e = [], l = new Set(s.value.map((t) => t.name)), a = i.value === "embed" ? [] : p.value.filter((t) => t.capability === i.value || t.models[0] && l.has(t.models[0].name));
      return a.length && e.push({
        group: "Classes",
        items: a.map((t) => ({
          value: `class:${t.name}`,
          title: $(t.name),
          subtitle: `${t.models.length} model${t.models.length === 1 ? "" : "s"}${t.models[0] ? ` · ${t.models[0].title}` : ""}`,
          icon: "tabler:category"
        }))
      }), s.value.length && !N.value && e.push({
        group: "Models",
        items: s.value.map((t) => ({ value: t.name, title: t.title, subtitle: t.provider || "", icon: "tabler:cpu" }))
      }), e;
    });
    async function b() {
      const e = ++n, l = i.value;
      u.value = !0;
      try {
        const [a, t] = await Promise.all([
          P.get(`/api/v1/models/list?capability=${encodeURIComponent(l)}`),
          // Embedding selection remains model-only. Classes enrich the other
          // pickers; their availability must not hide a successful model list.
          l === "embed" ? Promise.resolve(null) : P.get("/api/v1/models/classes").catch(() => null)
        ]);
        if (e !== n || l !== i.value) return;
        s.value = a?.data?.success ? a.data.models || [] : [], p.value = t?.data?.success ? t.data.classes || [] : [];
      } catch {
        e === n && l === i.value && (s.value = [], p.value = []);
      } finally {
        e === n && (u.value = !1);
      }
    }
    return I(i, () => {
      n += 1, s.value = [], p.value = [], u.value = !1, h && b();
    }), M(() => {
      h = !0, b();
    }), L(() => {
      h = !1, n += 1;
    }), (e, l) => (d(), q(c(F), {
      class: "mp-select",
      "model-value": m.value,
      options: E.value,
      "option-group-label": "group",
      "option-group-children": "items",
      "option-label": "title",
      "option-value": "value",
      "filter-fields": ["title", "subtitle", "value"],
      filter: "",
      checkmark: "",
      "filter-placeholder": N.value ? "Search classes…" : "Search models…",
      placeholder: "Default model",
      loading: u.value,
      "aria-label": "Choose model",
      onBeforeShow: b,
      "onUpdate:modelValue": l[0] || (l[0] = (a) => c(V)("select", a ?? ""))
    }, {
      value: v(() => [
        o("span", W, [
          _(c(k), {
            icon: D.value,
            class: "mp-val-ico",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          o("span", {
            class: A(["mp-val-label", !m.value && "mp-muted"])
          }, C(x.value), 3)
        ])
      ]),
      option: v(({ option: a }) => [
        o("span", j, [
          _(c(k), {
            icon: a.icon,
            class: "mp-opt-ico",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          o("span", H, [
            o("span", J, C(a.title), 1),
            a.subtitle ? (d(), y("span", K, C(a.subtitle), 1)) : z("", !0)
          ])
        ])
      ]),
      empty: v(() => [
        o("span", Q, [
          u.value ? (d(), y(w, { key: 0 }, [
            _(c(k), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            l[1] || (l[1] = B(" Loading…", -1))
          ], 64)) : (d(), y(w, { key: 1 }, [
            B("No models…")
          ], 64))
        ])
      ]),
      emptyfilter: v(() => [...l[2] || (l[2] = [
        o("span", { class: "mp-empty" }, "No models…", -1)
      ])]),
      _: 1
    }, 8, ["model-value", "options", "filter-placeholder", "loading"]));
  }
});
export {
  ae as default
};
//# sourceMappingURL=ModelPicker-BOt5pK5u.js.map

import { defineComponent as $, ref as g, computed as n, watch as q, onMounted as z, onBeforeUnmount as A, openBlock as h, createBlock as G, unref as i, withCtx as _, createElementVNode as u, toDisplayString as c, createElementBlock as y, Fragment as B, createVNode as L, createTextVNode as P, createCommentVNode as R, normalizeClass as T } from "vue";
import { Icon as S } from "@iconify/vue";
import { s as W } from "./index-BejYQJPF.js";
import { api as M } from "@wippy-fe/proxy";
import { u as j, a as H } from "./wc-runtime-Vcu3yWjv.js";
const J = () => j(), K = () => H(), Q = { class: "mp-val" }, X = { class: "mp-opt" }, Y = { class: "mp-opt-body" }, Z = { class: "mp-opt-title" }, ee = {
  key: 0,
  class: "mp-opt-sub"
}, ae = {
  class: "mp-empty",
  role: "status"
}, le = {
  class: "mp-empty",
  role: "status"
}, ce = /* @__PURE__ */ $({
  __name: "ModelPicker",
  setup(te) {
    const v = J(), U = K(), r = g(!1), f = g(!1), p = g([]), b = g([]);
    let d = 0, C = !1, k = !1;
    const m = n(() => v.value?.capability || "generate"), o = n(() => v.value?.mode === "classes"), s = n(() => {
      const e = v.value?.value;
      return typeof e == "string" ? e : "";
    });
    function N(e) {
      return typeof e == "string" && e.startsWith("class:");
    }
    function V(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    const x = n(() => p.value.find((e) => e.name === s.value)), D = n(() => N(s.value) ? b.value.find((e) => e.name === s.value.slice(6)) : void 0), I = n(() => N(s.value) ? D.value?.title || V(s.value.slice(6)) : x.value?.title || s.value || "Default model"), F = n(() => N(s.value) ? D.value?.icon || "tabler:category" : x.value?.provider_icon || "tabler:cpu"), E = n(() => {
      const e = [], t = new Set(p.value.map((a) => a.name)), l = m.value === "embed" ? [] : b.value.filter((a) => a.capability === m.value || a.models[0] && t.has(a.models[0].name));
      return l.length && e.push({
        group: "Classes",
        items: l.map((a) => ({
          value: `class:${a.name}`,
          title: a.title || V(a.name),
          subtitle: a.models[0]?.title || "",
          icon: a.icon || "tabler:category"
        }))
      }), p.value.length && !o.value && e.push({
        group: "Models",
        items: p.value.map((a) => ({
          value: a.name,
          title: a.title,
          subtitle: a.provider_title || "",
          icon: a.provider_icon || "tabler:cpu"
        }))
      }), e;
    });
    async function w() {
      if (r.value) return;
      const e = ++d, t = m.value;
      r.value = !0;
      try {
        const [l, a] = await Promise.all([
          M.get(`/api/v1/models/list?capability=${encodeURIComponent(t)}`),
          // Embedding selection remains model-only. Classes enrich the other
          // pickers; their availability must not hide a successful model list.
          t === "embed" ? Promise.resolve(null) : M.get("/api/v1/models/classes").catch(() => null)
        ]);
        if (e !== d || t !== m.value) return;
        f.value = !l?.data?.success || o.value && t !== "embed" && !a?.data?.success, l?.data?.success && (p.value = l.data.models || []), a?.data?.success && (b.value = a.data.classes || []);
      } catch {
        e === d && t === m.value && (f.value = !0);
      } finally {
        e === d && (r.value = !1);
      }
    }
    function O() {
      (k || f.value) && w(), k = !0;
    }
    return q(m, () => {
      d += 1, p.value = [], b.value = [], r.value = !1, f.value = !1, k = !1, C && w();
    }), z(() => {
      C = !0, w();
    }), A(() => {
      C = !1, d += 1;
    }), (e, t) => (h(), G(i(W), {
      class: "mp-select",
      "model-value": s.value,
      options: E.value,
      "option-group-label": "group",
      "option-group-children": "items",
      "option-label": "title",
      "option-value": "value",
      "filter-fields": ["title", "subtitle", "value"],
      filter: "",
      checkmark: "",
      "filter-placeholder": o.value ? "Search classes…" : "Search models…",
      placeholder: "Default model",
      "aria-label": i(v).label || "Choose model",
      pt: { label: { "aria-description": i(v).description || void 0 } },
      onBeforeShow: O,
      "onUpdate:modelValue": t[0] || (t[0] = (l) => i(U)("select", l ?? ""))
    }, {
      value: _(() => [
        u("span", Q, [
          L(i(S), {
            icon: F.value,
            class: "mp-val-ico",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          u("span", {
            class: T(["mp-val-label", !s.value && "mp-muted"])
          }, c(I.value), 3)
        ])
      ]),
      option: _(({ option: l }) => [
        u("span", X, [
          L(i(S), {
            icon: l.icon,
            class: "mp-opt-ico",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          u("span", Y, [
            u("span", Z, c(l.title), 1),
            l.subtitle ? (h(), y("span", ee, c(l.subtitle), 1)) : R("", !0)
          ])
        ])
      ]),
      empty: _(() => [
        u("span", ae, [
          r.value ? (h(), y(B, { key: 0 }, [
            L(i(S), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            P(" " + c(o.value ? "Loading classes…" : "Loading models…"), 1)
          ], 64)) : f.value ? (h(), y(B, { key: 1 }, [
            P(c(o.value ? "Could not load classes" : "Could not load models"), 1)
          ], 64)) : (h(), y(B, { key: 2 }, [
            P(c(o.value ? "No classes available" : "No models available"), 1)
          ], 64))
        ])
      ]),
      emptyfilter: _(() => [
        u("span", le, c(r.value && !E.value.length ? o.value ? "Loading classes…" : "Loading models…" : o.value ? "No matching classes" : "No matching models"), 1)
      ]),
      _: 1
    }, 8, ["model-value", "options", "filter-placeholder", "aria-label", "pt"]));
  }
});
export {
  ce as default
};
//# sourceMappingURL=ModelPicker-Rgcse4a5.js.map

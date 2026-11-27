import { defineComponent as g, ref as c, computed as y, onMounted as C, watch as N, openBlock as f, createElementBlock as w, Fragment as W, toDisplayString as l, createCommentVNode as x, createVNode as d, withCtx as E, createElementVNode as o, unref as p, createTextVNode as S } from "vue";
import { Icon as b } from "@iconify/vue";
import "@wippy-fe/proxy";
import { _ as V, l as B, D } from "./WorkflowSearchList.vue_vue_type_script_setup_true_lang-1g5-myn1.js";
const F = {
  key: 0,
  class: "wf-embed-note"
}, I = { class: "wf-embed-ico" }, L = { class: "wf-embed-main" }, P = { class: "wf-embed-title" }, T = { class: "wf-embed-meta" }, z = { class: "wf-embed-io" }, A = /* @__PURE__ */ g({
  __name: "EmbedWorkflowPicker",
  props: {
    selected: {}
  },
  emits: ["select"],
  setup(r, { emit: h }) {
    const m = r, v = h, n = c(!1), i = c(""), a = c([]), _ = y(() => a.value.find((e) => e.id === m.selected?.id)?.title || "Selected workflow");
    async function u() {
      n.value = !0, i.value = "";
      try {
        const e = await B({ filter: "published" });
        a.value = e.map((s) => D(s, {}, [], "")).filter((s) => !!s.published_version);
      } catch (e) {
        i.value = e instanceof Error ? e.message : "Could not load Workflows.";
      } finally {
        n.value = !1;
      }
    }
    C(u), N(() => m.selected?.id, (e) => {
      e && !a.value.some((s) => s.id === e) && u();
    });
    function k(e, s) {
      return e.title.toLowerCase().includes(s) || e.id.toLowerCase().includes(s);
    }
    return (e, s) => (f(), w(W, null, [
      r.selected ? (f(), w("p", F, l(_.value) + " · Published v" + l(r.selected.version), 1)) : x("", !0),
      d(V, {
        rows: a.value,
        loading: n.value,
        error: i.value,
        matches: k,
        placeholder: "Search published Workflows",
        "empty-message": "No published Workflows available.",
        "root-class": "wf-embed-pick",
        "search-class": "wf-embed-search",
        "note-class": "wf-embed-note",
        "error-class": "wf-embed-err",
        "list-class": "wf-embed-list",
        "row-class": "wf-embed-row",
        "quiet-rows": "",
        "empty-class": "wf-embed-empty",
        onSelect: s[0] || (s[0] = (t) => v("select", t))
      }, {
        row: E(({ item: t }) => [
          o("span", I, [
            d(p(b), {
              icon: "tabler:route",
              "aria-hidden": "true"
            })
          ]),
          o("span", L, [
            o("span", P, l(t.title), 1),
            o("span", T, [
              o("span", null, "v" + l(t.published_version), 1),
              o("span", z, [
                s[1] || (s[1] = o("strong", null, "In", -1)),
                S(l(t.input_summary), 1)
              ])
            ])
          ]),
          d(p(b), {
            icon: "tabler:chevron-right",
            class: "wf-embed-go",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }, 8, ["rows", "loading", "error"])
    ], 64));
  }
});
export {
  A as _
};

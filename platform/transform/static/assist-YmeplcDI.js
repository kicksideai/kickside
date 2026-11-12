import { defineComponent as te, computed as v, ref as p, onMounted as ae, watch as re, openBlock as r, createElementBlock as s, createElementVNode as S, createVNode as P, unref as D, normalizeClass as J, createTextVNode as E, toDisplayString as _, createCommentVNode as m, withDirectives as I, vModelText as O, Fragment as U, createBlock as se, resolveDynamicComponent as le, renderList as ne, nextTick as oe } from "vue";
import { Icon as $ } from "@iconify/vue";
import ue from "primevue/select";
import { api as q, host as ie, loadByTagName as ce } from "@wippy-fe/proxy";
import { a as de, u as ve } from "./wc-runtime-CNDpK4lj.js";
const pe = () => de(), me = () => ve();
function fe(u, a) {
  if (u && typeof u == "object") {
    const i = u, l = i.response?.data?.error;
    if (typeof l == "string") return l;
    if (l && typeof l == "object" && typeof l.message == "string")
      return l.message;
    if (typeof i.message == "string" && i.message) return i.message;
  }
  return a;
}
function K(u, a) {
  if (u && typeof u == "object") {
    const i = u;
    i.response?.status === 401 && ie.handleError("auth-expired", i);
    const l = i.response?.data?.errors;
    if (Array.isArray(l) && l.length) return l.map(String).join("; ");
  }
  return fe(u, a);
}
async function he(u) {
  try {
    const { data: a } = await q.post("/api/v1/transform/assist", u);
    if (a && (a.ok === !1 || a.success === !1)) throw new Error(a.error || "assist failed");
    return a || {};
  } catch (a) {
    throw new Error(K(a, "could not generate a transform"));
  }
}
async function ke(u) {
  try {
    const { data: a } = await q.post("/api/v1/transform/validate", u);
    if (a && (a.ok === !1 || a.success === !1)) throw new Error(a.error || "validate failed");
    return a || {};
  } catch (a) {
    throw new Error(K(a, "could not validate the transform"));
  }
}
const ge = { class: "kx" }, ye = { class: "kx-bar" }, xe = ["disabled"], be = {
  key: 0,
  role: "status"
}, _e = {
  key: 4,
  class: "kx-hint",
  "data-test": "auto-hint"
}, we = {
  key: 5,
  class: "kx-hint",
  "data-test": "passthrough"
}, Se = {
  key: 6,
  class: "kx-rationale",
  "data-test": "rationale"
}, Ae = {
  key: 7,
  class: "kx-errors",
  "data-test": "verrors"
}, Ee = {
  key: 8,
  class: "kx-pre",
  "data-test": "output-preview"
}, Te = {
  key: 9,
  class: "kx-err",
  "data-test": "error"
}, Ve = {
  key: 10,
  class: "kx-hint"
}, H = "wc-model-picker", Me = "class:fast", De = /* @__PURE__ */ te({
  __name: "assist",
  setup(u) {
    const a = pe(), i = me();
    function l(e) {
      if (typeof e == "string") {
        const t = e.trim();
        if (!t) return;
        try {
          return JSON.parse(t);
        } catch {
          return t;
        }
      }
      return e;
    }
    function Q(e) {
      const t = l(e);
      return Array.isArray(t) ? t : [];
    }
    const c = v(() => a.value), T = v(() => l(c.value?.sourceSchema)), V = v(() => l(c.value?.sinkSchema)), M = v(() => c.value?.inputShape === "record" || c.value?.inputShape === "content" ? c.value.inputShape : void 0), k = v(() => Q(c.value?.samples)), R = v(() => typeof c.value?.hint == "string" ? c.value.hint : void 0), C = v(() => c.value?.disabled === !0), w = v(() => T.value != null && V.value != null && M.value != null), W = [
      { value: "auto", label: "Auto (AI picks)" },
      { value: "expr", label: "Expression" },
      { value: "llm", label: "LLM" },
      { value: "code", label: "Code (Lua)" },
      { value: "none", label: "Pass through" }
    ], n = p("expr"), g = p(""), y = p(""), x = p(Me), b = p(""), L = p(void 0), f = p(!1), h = p(""), A = p(""), o = p(null);
    function B(e) {
      !e || typeof e.kind != "string" || (n.value = e.kind, e.kind === "expr" ? g.value = typeof e.expr == "string" ? e.expr : "" : e.kind === "llm" ? (y.value = typeof e.prompt == "string" ? e.prompt : "", typeof e.model == "string" && e.model && (x.value = e.model)) : e.kind === "code" && (b.value = typeof e.code == "string" ? e.code : "", L.value = Array.isArray(e.tool_ids) ? e.tool_ids : void 0));
    }
    B(l(c.value?.value)), ae(() => {
      ce(H, { timeoutMs: 8e3 }).catch((e) => {
        h.value = e instanceof Error ? e.message : String(e);
      });
    });
    function G() {
      switch (n.value) {
        case "expr":
          return { kind: "expr", expr: g.value.trim() };
        case "llm":
          return { kind: "llm", prompt: y.value.trim(), ...x.value.trim() ? { model: x.value.trim() } : {} };
        case "code":
          return { kind: "code", code: b.value, ...L.value ? { tool_ids: L.value } : {} };
        default:
          return { kind: "none" };
      }
    }
    const F = v(() => {
      switch (n.value) {
        case "expr":
          return g.value.trim().length > 0;
        case "llm":
          return y.value.trim().length > 0;
        case "code":
          return b.value.trim().length > 0;
        default:
          return !0;
      }
    });
    let N, j = !1;
    re([n, g, y, x, b], () => {
      const e = G();
      i("transform-confirmed", { transform: e, strategy: e.kind }), !j && (o.value = null, N && clearTimeout(N), n.value !== "none" && n.value !== "auto" && F.value && w.value && (N = setTimeout(Y, 500)));
    });
    async function X() {
      if (C.value || f.value || !w.value || !k.value.length || n.value === "none") return;
      f.value = !0, h.value = "", A.value = "", o.value = null;
      const e = n.value;
      try {
        const t = await he({
          source_schema: T.value,
          sink_schema: V.value,
          input_shape: M.value,
          samples: k.value,
          hint: R.value,
          strategy: e
        });
        A.value = typeof t.rationale == "string" ? t.rationale : "", j = !0, t.transform && typeof t.transform.kind == "string" && B(t.transform), await oe(), j = !1, Array.isArray(t.errors) && t.errors.length && !t.validated ? h.value = t.errors.join("; ") : t.validated && (o.value = { ok: !0, valid: !0, errors: [] });
      } catch (t) {
        h.value = t instanceof Error ? t.message : "could not generate a transform";
      } finally {
        f.value = !1;
      }
    }
    async function Y() {
      if (!(!F.value || !w.value || !k.value.length))
        try {
          o.value = await ke({
            transform: G(),
            sink_schema: V.value,
            input_shape: M.value,
            samples: k.value,
            source_schema: T.value
          });
        } catch (e) {
          h.value = e instanceof Error ? e.message : String(e);
        }
    }
    function Z(e) {
      const t = e.detail;
      typeof t == "string" && t && (x.value = t);
    }
    const z = v(() => {
      const e = Array.isArray(o.value?.outputs) ? o.value.outputs[0] : void 0;
      if (e === void 0) return "";
      try {
        return JSON.stringify(e);
      } catch {
        return String(e);
      }
    });
    return (e, t) => (r(), s("div", ge, [
      S("div", ye, [
        P(D(ue), {
          modelValue: n.value,
          "onUpdate:modelValue": t[0] || (t[0] = (d) => n.value = d),
          class: "kx-select",
          options: W,
          "option-label": "label",
          "option-value": "value",
          disabled: C.value,
          "aria-label": "Transform strategy",
          "data-test": "strategy"
        }, null, 8, ["modelValue", "disabled"]),
        n.value !== "none" ? (r(), s("button", {
          key: 0,
          class: "kx-gen",
          type: "button",
          disabled: C.value || f.value || !w.value || !k.value.length,
          "data-test": "generate",
          onClick: t[1] || (t[1] = (d) => X())
        }, [
          P(D($), {
            icon: f.value ? "tabler:loader-2" : "tabler:wand",
            class: J(f.value && "spin"),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          E(" " + _(f.value ? "Generating…" : "Generate"), 1)
        ], 8, xe)) : m("", !0),
        o.value ? (r(), s("span", {
          key: 1,
          class: J(["kx-status kx-tag-sm", o.value.valid ? "kx-ok" : "kx-bad"]),
          "data-test": "status"
        }, [
          P(D($), {
            icon: o.value.valid ? "tabler:circle-check" : "tabler:alert-triangle",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          E(" " + _(o.value.valid ? "Validated" : "Needs review"), 1)
        ], 2)) : m("", !0)
      ]),
      k.value.length ? m("", !0) : (r(), s("p", be, "Provide real source samples to generate or validate a transform.")),
      n.value === "expr" ? I((r(), s("textarea", {
        key: 1,
        "onUpdate:modelValue": t[2] || (t[2] = (d) => g.value = d),
        class: "kx-input kx-textarea",
        spellcheck: "false",
        placeholder: "{ content: payload.title }",
        "data-test": "expr-editor"
      }, null, 512)), [
        [O, g.value]
      ]) : n.value === "llm" ? (r(), s(U, { key: 2 }, [
        I(S("textarea", {
          "onUpdate:modelValue": t[3] || (t[3] = (d) => y.value = d),
          class: "kx-input kx-textarea",
          spellcheck: "false",
          placeholder: "Summarize the item as concise plain text.",
          "data-test": "llm-editor"
        }, null, 512), [
          [O, y.value]
        ]),
        (r(), se(le(H), {
          value: x.value,
          capability: "generate",
          onSelect: Z
        }, null, 40, ["value"]))
      ], 64)) : n.value === "code" ? (r(), s(U, { key: 3 }, [
        I(S("textarea", {
          "onUpdate:modelValue": t[4] || (t[4] = (d) => b.value = d),
          class: "kx-input kx-textarea kx-code",
          spellcheck: "false",
          placeholder: 'return { content = "Text for the destination" }',
          "data-test": "code-editor"
        }, null, 512), [
          [O, b.value]
        ]),
        t[5] || (t[5] = S("span", { class: "kx-hint" }, [
          E("Map the source item to the destination fields and "),
          S("code", null, "return"),
          E(" a Lua table. Available helpers: json, string, table, math.")
        ], -1))
      ], 64)) : n.value === "auto" ? (r(), s("p", _e, "Generate and the AI picks the best mapping — switch the selector to hand-write one.")) : (r(), s("p", we, "Items pass through to the destination unchanged.")),
      A.value ? (r(), s("p", Se, _(A.value), 1)) : m("", !0),
      o.value && !o.value.valid && o.value.errors && o.value.errors.length ? (r(), s("ul", Ae, [
        (r(!0), s(U, null, ne(o.value.errors, (d, ee) => (r(), s("li", { key: ee }, _(d), 1))), 128))
      ])) : m("", !0),
      z.value ? (r(), s("pre", Ee, _(z.value), 1)) : m("", !0),
      h.value ? (r(), s("div", Te, _(h.value), 1)) : m("", !0),
      w.value ? m("", !0) : (r(), s("span", Ve, "Pick a source and destination to generate."))
    ]));
  }
});
export {
  De as default
};
//# sourceMappingURL=assist-YmeplcDI.js.map

import { defineComponent as te, computed as v, ref as p, onMounted as ae, watch as re, openBlock as r, createElementBlock as s, createElementVNode as b, createVNode as L, unref as P, normalizeClass as J, createTextVNode as E, toDisplayString as w, createCommentVNode as m, withDirectives as D, vModelText as O, Fragment as U, createBlock as se, resolveDynamicComponent as le, renderList as ne, nextTick as oe } from "vue";
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
const ge = { class: "kx" }, ye = { class: "kx-bar" }, xe = ["disabled"], _e = {
  key: 0,
  role: "status"
}, be = {
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
}, Ee = {
  key: 7,
  class: "kx-errors",
  "data-test": "verrors"
}, Ae = {
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
}, H = "wc-model-picker", Ce = "class:fast", Pe = /* @__PURE__ */ te({
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
    const c = v(() => a.value), T = v(() => l(c.value?.sourceSchema)), V = v(() => l(c.value?.sinkSchema)), C = v(() => c.value?.inputShape === "record" || c.value?.inputShape === "content" ? c.value.inputShape : void 0), k = v(() => Q(c.value?.samples)), R = v(() => typeof c.value?.hint == "string" ? c.value.hint : void 0), M = v(() => c.value?.disabled === !0), S = v(() => T.value != null && V.value != null && C.value != null), W = [
      { value: "auto", label: "Auto (AI picks)" },
      { value: "expr", label: "Expression" },
      { value: "llm", label: "LLM" },
      { value: "code", label: "Code (Lua)" },
      { value: "none", label: "Pass through" }
    ], n = p("expr"), g = p(""), y = p(""), x = p(Ce), _ = p(""), N = p(void 0), f = p(!1), h = p(""), A = p(""), o = p(null);
    function B(e) {
      !e || typeof e.kind != "string" || (n.value = e.kind, e.kind === "expr" ? g.value = typeof e.expr == "string" ? e.expr : "" : e.kind === "llm" ? (y.value = typeof e.prompt == "string" ? e.prompt : "", typeof e.model == "string" && e.model && (x.value = e.model)) : e.kind === "code" && (_.value = typeof e.code == "string" ? e.code : "", N.value = Array.isArray(e.tool_ids) ? e.tool_ids : void 0));
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
          return { kind: "code", code: _.value, ...N.value ? { tool_ids: N.value } : {} };
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
          return _.value.trim().length > 0;
        default:
          return !0;
      }
    });
    let j, I = !1;
    re([n, g, y, x, _], () => {
      const e = G();
      i("transform-confirmed", { transform: e, strategy: e.kind }), !I && (o.value = null, j && clearTimeout(j), n.value !== "none" && n.value !== "auto" && F.value && S.value && (j = setTimeout(Y, 500)));
    });
    async function X() {
      if (M.value || f.value || !S.value || !k.value.length || n.value === "none") return;
      f.value = !0, h.value = "", A.value = "", o.value = null;
      const e = n.value;
      try {
        const t = await he({
          source_schema: T.value,
          sink_schema: V.value,
          input_shape: C.value,
          samples: k.value,
          hint: R.value,
          strategy: e
        });
        A.value = typeof t.rationale == "string" ? t.rationale : "", I = !0, t.transform && typeof t.transform.kind == "string" && B(t.transform), await oe(), I = !1, Array.isArray(t.errors) && t.errors.length && !t.validated ? h.value = t.errors.join("; ") : t.validated && (o.value = { ok: !0, valid: !0, errors: [] });
      } catch (t) {
        h.value = t instanceof Error ? t.message : "could not generate a transform";
      } finally {
        f.value = !1;
      }
    }
    async function Y() {
      if (!(!F.value || !S.value || !k.value.length))
        try {
          o.value = await ke({
            transform: G(),
            sink_schema: V.value,
            input_shape: C.value,
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
      b("div", ye, [
        L(P(ue), {
          modelValue: n.value,
          "onUpdate:modelValue": t[0] || (t[0] = (d) => n.value = d),
          class: "kx-select",
          options: W,
          "option-label": "label",
          "option-value": "value",
          disabled: M.value,
          "aria-label": "Transform strategy",
          "data-test": "strategy"
        }, null, 8, ["modelValue", "disabled"]),
        n.value !== "none" ? (r(), s("button", {
          key: 0,
          class: "kx-gen",
          type: "button",
          disabled: M.value || f.value || !S.value || !k.value.length,
          "data-test": "generate",
          onClick: t[1] || (t[1] = (d) => X())
        }, [
          L(P($), {
            icon: f.value ? "tabler:loader-2" : "tabler:wand",
            class: J(f.value && "spin"),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          E(" " + w(f.value ? "Generating…" : "Generate"), 1)
        ], 8, xe)) : m("", !0),
        o.value ? (r(), s("span", {
          key: 1,
          class: J(["kx-status kx-tag-sm", o.value.valid ? "kx-ok" : "kx-bad"]),
          "data-test": "status"
        }, [
          L(P($), {
            icon: o.value.valid ? "tabler:circle-check" : "tabler:alert-triangle",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          E(" " + w(o.value.valid ? "Validated" : "Needs review"), 1)
        ], 2)) : m("", !0)
      ]),
      k.value.length ? m("", !0) : (r(), s("p", _e, "Provide real source samples to generate or validate a transform.")),
      n.value === "expr" ? D((r(), s("textarea", {
        key: 1,
        "onUpdate:modelValue": t[2] || (t[2] = (d) => g.value = d),
        class: "kx-input kx-textarea",
        spellcheck: "false",
        placeholder: "{ content: payload.title }",
        "data-test": "expr-editor"
      }, null, 512)), [
        [O, g.value]
      ]) : n.value === "llm" ? (r(), s(U, { key: 2 }, [
        D(b("textarea", {
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
        D(b("textarea", {
          "onUpdate:modelValue": t[4] || (t[4] = (d) => _.value = d),
          class: "kx-input kx-textarea kx-code",
          spellcheck: "false",
          placeholder: "return { content = __cx_args.payload.summary.overview }",
          "data-test": "code-editor"
        }, null, 512), [
          [O, _.value]
        ]),
        t[5] || (t[5] = b("span", { class: "kx-hint" }, [
          E("Item is "),
          b("code", null, "__cx_args"),
          E(" ({ payload: … }); "),
          b("code", null, "return"),
          E(" a table for the destination. Sandboxed: json / string / table / math.")
        ], -1))
      ], 64)) : n.value === "auto" ? (r(), s("p", be, "Generate and the AI picks the best mapping — switch the selector to hand-write one.")) : (r(), s("p", we, "Items pass through to the destination unchanged.")),
      A.value ? (r(), s("p", Se, w(A.value), 1)) : m("", !0),
      o.value && !o.value.valid && o.value.errors && o.value.errors.length ? (r(), s("ul", Ee, [
        (r(!0), s(U, null, ne(o.value.errors, (d, ee) => (r(), s("li", { key: ee }, w(d), 1))), 128))
      ])) : m("", !0),
      z.value ? (r(), s("pre", Ae, w(z.value), 1)) : m("", !0),
      h.value ? (r(), s("div", Te, w(h.value), 1)) : m("", !0),
      S.value ? m("", !0) : (r(), s("span", Ve, "Pick a source and destination to generate."))
    ]));
  }
});
export {
  Pe as default
};
//# sourceMappingURL=assist-BqfKqOcy.js.map

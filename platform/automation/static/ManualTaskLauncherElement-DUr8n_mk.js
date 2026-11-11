import { defineComponent as R, ref as f, computed as E, watch as B, onBeforeUnmount as D, openBlock as i, createElementBlock as _, createVNode as I, unref as c, createCommentVNode as k, createElementVNode as M, toDisplayString as C, createBlock as N } from "vue";
import { a as Q, u as A } from "./wc-runtime-KO3cNuNo.js";
import { api as U } from "@wippy-fe/proxy";
import { e as h, _ as L } from "./WcMount.vue_vue_type_script_setup_true_lang-DeFg3QZK.js";
const S = {
  "aria-label": "Launch task",
  class: "kx-manual-launcher"
}, V = { key: 0 }, j = ["disabled"], $ = {
  key: 1,
  role: "alert"
}, F = {
  key: 2,
  role: "status"
}, J = {
  key: 3,
  role: "status"
}, O = /* @__PURE__ */ R({
  __name: "ManualTaskLauncher",
  props: {
    target: {},
    parent: {},
    title: {}
  },
  emits: ["queued", "error"],
  setup(b, { emit: d }) {
    const n = b, y = d, t = f(null), a = f(!1), s = f(!1), p = f(!1), o = f("");
    let m = null, u = 0;
    const v = E(() => {
      if (!n.parent) return { error: "Choose an existing parent for this task" };
      try {
        const e = JSON.parse(n.target);
        return !e || typeof e != "object" || Array.isArray(e) ? { error: "Task target must be an object" } : { target: e, error: "" };
      } catch (e) {
        return { error: h(e, "Could not read the task target") };
      }
    }), w = E(() => !!t.value && !a.value && !s.value && !v.value.error);
    function q(e) {
      o.value = h(e, "Could not queue the task"), y("error", { message: o.value, error: e });
    }
    function x(e) {
      const r = e;
      a.value || s.value || m || r?.principal?.kind !== "user" || !r.principal.id || (t.value = { kind: "user", id: r.principal.id }, o.value = "");
    }
    async function T() {
      if (!w.value || !t.value || !v.value.target) return;
      const e = u;
      m ||= {
        body: {
          type: "kickside.automation.manual:task",
          input: { title: n.title, target: v.value.target },
          parent_id: n.parent,
          principal: { ...t.value },
          component_id: crypto.randomUUID(),
          request_id: crypto.randomUUID()
        },
        wake: crypto.randomUUID(),
        installed: !1
      };
      const r = m;
      a.value = !0, o.value = "", p.value = !1;
      try {
        if (!r.installed) {
          const { data: g } = await U.post("/api/v1/automations/selected", r.body);
          if (e !== u) return;
          if (!g.success) throw new Error(h(g.error, "Task installation is not confirmed"));
          if (g.id !== r.body.component_id) throw new Error("Task installation receipt does not match the request");
          r.installed = !0;
        }
        const { data: l } = await U.post(
          "/api/v1/automations/" + encodeURIComponent(r.body.component_id) + "/actions/run_now",
          { request_id: r.wake }
        );
        if (e !== u) return;
        if (!l.success) throw new Error(h(l.error, "Run admission is not confirmed"));
        if (l.result?.state === "pending") {
          p.value = !0;
          return;
        }
        if (l.result?.state !== "succeeded") throw new Error("Run admission is not confirmed");
        s.value = !0, y("queued", { id: r.body.component_id });
      } catch (l) {
        e === u && q(l);
      } finally {
        e === u && (a.value = !1);
      }
    }
    return B(() => [n.target, n.parent, n.title], () => {
      u += 1, m = null, t.value = null, a.value = !1, s.value = !1, p.value = !1, o.value = "";
    }), D(() => {
      u += 1;
    }), (e, r) => (i(), _("section", S, [
      I(L, {
        tag: "wc-run-as-picker",
        attrs: { root: "", value: t.value?.id, disabled: a.value || s.value || !!c(m) },
        onChange: x,
        onError: q
      }, null, 8, ["attrs"]),
      t.value ? k("", !0) : (i(), _("p", V, "Select the account that runs this task.")),
      M("button", {
        type: "button",
        class: "p-button",
        disabled: !w.value,
        onClick: T
      }, C(a.value ? "Queuing…" : p.value ? "Check run status" : o.value ? "Retry run" : "Queue run"), 9, j),
      v.value.error || o.value ? (i(), _("p", $, C(v.value.error || o.value), 1)) : k("", !0),
      p.value ? (i(), _("p", F, "Queuing run…")) : k("", !0),
      s.value ? (i(), _("p", J, "Run queued. Follow the task in Automations.")) : k("", !0)
    ]));
  }
}), K = /* @__PURE__ */ R({
  __name: "ManualTaskLauncherElement",
  setup(b) {
    const d = Q(), n = A();
    return (y, t) => (i(), N(O, {
      target: c(d).target || "",
      parent: c(d).parent || "",
      title: c(d).title || "Manual task",
      onQueued: t[0] || (t[0] = (a) => c(n)("created", a)),
      onError: t[1] || (t[1] = (a) => c(n)("error", a))
    }, null, 8, ["target", "parent", "title"]));
  }
});
export {
  K as default
};
//# sourceMappingURL=ManualTaskLauncherElement-DUr8n_mk.js.map

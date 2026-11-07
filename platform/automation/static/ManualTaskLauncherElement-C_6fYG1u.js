import { defineComponent as R, ref as f, computed as E, watch as T, onBeforeUnmount as B, openBlock as l, createElementBlock as k, createVNode as D, unref as c, createCommentVNode as _, createElementVNode as I, toDisplayString as C, createBlock as N } from "vue";
import { a as A, u as L } from "./wc-runtime-KO3cNuNo.js";
import { api as U } from "@wippy-fe/proxy";
import { e as h, W as Q } from "./WcMount-Dv75Gn1l.js";
const S = {
  "aria-label": "Launch task",
  class: "kx-manual-launcher"
}, V = { key: 0 }, j = ["disabled"], W = {
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
    async function M() {
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
        const { data: i } = await U.post(
          "/api/v1/automations/" + encodeURIComponent(r.body.component_id) + "/actions/run_now",
          { request_id: r.wake }
        );
        if (e !== u) return;
        if (!i.success) throw new Error(h(i.error, "Run admission is not confirmed"));
        if (i.result?.state === "pending") {
          p.value = !0;
          return;
        }
        if (i.result?.state !== "succeeded") throw new Error("Run admission is not confirmed");
        s.value = !0, y("queued", { id: r.body.component_id });
      } catch (i) {
        e === u && q(i);
      } finally {
        e === u && (a.value = !1);
      }
    }
    return T(() => [n.target, n.parent, n.title], () => {
      u += 1, m = null, t.value = null, a.value = !1, s.value = !1, p.value = !1, o.value = "";
    }), B(() => {
      u += 1;
    }), (e, r) => (l(), k("section", S, [
      D(Q, {
        tag: "wc-run-as-picker",
        attrs: { root: "", value: t.value?.id, disabled: a.value || s.value || !!c(m) },
        onChange: x,
        onError: q
      }, null, 8, ["attrs"]),
      t.value ? _("", !0) : (l(), k("p", V, "Select the account that runs this task.")),
      I("button", {
        type: "button",
        class: "p-button",
        disabled: !w.value,
        onClick: M
      }, C(a.value ? "Queuing…" : p.value ? "Check run admission" : o.value ? "Retry run" : "Queue run"), 9, j),
      v.value.error || o.value ? (l(), k("p", W, C(v.value.error || o.value), 1)) : _("", !0),
      p.value ? (l(), k("p", F, "Run admission is pending.")) : _("", !0),
      s.value ? (l(), k("p", J, "Run queued. Follow the task in Automations.")) : _("", !0)
    ]));
  }
}), H = /* @__PURE__ */ R({
  __name: "ManualTaskLauncherElement",
  setup(b) {
    const d = A(), n = L();
    return (y, t) => (l(), N(O, {
      target: c(d).target || "",
      parent: c(d).parent || "",
      title: c(d).title || "Manual task",
      onQueued: t[0] || (t[0] = (a) => c(n)("created", a)),
      onError: t[1] || (t[1] = (a) => c(n)("error", a))
    }, null, 8, ["target", "parent", "title"]));
  }
});
export {
  H as default
};
//# sourceMappingURL=ManualTaskLauncherElement-C_6fYG1u.js.map

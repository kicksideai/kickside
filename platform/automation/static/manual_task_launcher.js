import { e as _, _ as R, u as V, a as B, W as D } from "./errMsg-kIukmtcj.js";
import { defineComponent as T, ref as v, computed as E, watch as I, onBeforeUnmount as L, openBlock as l, createElementBlock as h, createVNode as N, unref as c, createCommentVNode as k, createElementVNode as Q, toDisplayString as q, createBlock as S } from "vue";
import { api as U, define as j } from "@wippy-fe/proxy";
import { s as A } from "./execution-identity-editor-DaljeKxW.js";
import "@iconify/vue";
const W = {
  "aria-label": "Launch task",
  class: "kx-manual-launcher"
}, $ = { key: 0 }, F = ["disabled"], J = {
  key: 1,
  role: "alert"
}, K = {
  key: 2,
  role: "status"
}, O = {
  key: 3,
  role: "status"
}, P = /* @__PURE__ */ T({
  __name: "ManualTaskLauncher",
  props: {
    target: {},
    parent: {},
    title: {}
  },
  emits: ["queued", "error"],
  setup(y, { emit: p }) {
    const n = y, g = p, t = v(null), a = v(!1), u = v(!1), d = v(!1), o = v("");
    let m = null, s = 0;
    const f = E(() => {
      if (!n.parent) return { error: "Choose an existing parent for this task" };
      try {
        const e = JSON.parse(n.target);
        return !e || typeof e != "object" || Array.isArray(e) ? { error: "Task target must be an object" } : { target: e, error: "" };
      } catch (e) {
        return { error: _(e, "Could not read the task target") };
      }
    }), w = E(() => !!t.value && !a.value && !u.value && !f.value.error);
    function C(e) {
      o.value = _(e, "Could not queue the task"), g("error", { message: o.value, error: e });
    }
    function x(e) {
      const r = e;
      a.value || u.value || m || r?.principal?.kind !== "user" || !r.principal.id || (t.value = { kind: "user", id: r.principal.id }, o.value = "");
    }
    async function M() {
      if (!w.value || !t.value || !f.value.target) return;
      const e = s;
      m ||= {
        body: {
          type: "kickside.automation.manual:task",
          input: { title: n.title, target: f.value.target },
          parent_id: n.parent,
          principal: { ...t.value },
          component_id: crypto.randomUUID(),
          request_id: crypto.randomUUID()
        },
        wake: crypto.randomUUID(),
        installed: !1
      };
      const r = m;
      a.value = !0, o.value = "", d.value = !1;
      try {
        if (!r.installed) {
          const { data: b } = await U.post("/api/v1/automations/selected", r.body);
          if (e !== s) return;
          if (!b.success) throw new Error(_(b.error, "Task installation is not confirmed"));
          if (b.id !== r.body.component_id) throw new Error("Task installation receipt does not match the request");
          r.installed = !0;
        }
        const { data: i } = await U.post(
          "/api/v1/automations/" + encodeURIComponent(r.body.component_id) + "/actions/run_now",
          { request_id: r.wake }
        );
        if (e !== s) return;
        if (!i.success) throw new Error(_(i.error, "Run admission is not confirmed"));
        if (i.result?.state === "pending") {
          d.value = !0;
          return;
        }
        if (i.result?.state !== "succeeded") throw new Error("Run admission is not confirmed");
        u.value = !0, g("queued", { id: r.body.component_id });
      } catch (i) {
        e === s && C(i);
      } finally {
        e === s && (a.value = !1);
      }
    }
    return I(() => [n.target, n.parent, n.title], () => {
      s += 1, m = null, t.value = null, a.value = !1, u.value = !1, d.value = !1, o.value = "";
    }), L(() => {
      s += 1;
    }), (e, r) => (l(), h("section", W, [
      N(R, {
        tag: "wc-run-as-picker",
        attrs: { root: "", value: t.value?.id, disabled: a.value || u.value || !!c(m) },
        onChange: x,
        onError: C
      }, null, 8, ["attrs"]),
      t.value ? k("", !0) : (l(), h("p", $, "Select the account that runs this task.")),
      Q("button", {
        type: "button",
        class: "p-button",
        disabled: !w.value,
        onClick: M
      }, q(a.value ? "Queuing…" : d.value ? "Check run status" : o.value ? "Retry run" : "Queue run"), 9, F),
      f.value.error || o.value ? (l(), h("p", J, q(f.value.error || o.value), 1)) : k("", !0),
      d.value ? (l(), h("p", K, "Queuing run…")) : k("", !0),
      u.value ? (l(), h("p", O, "Run queued. Follow the task in Automations.")) : k("", !0)
    ]));
  }
}), z = /* @__PURE__ */ T({
  __name: "ManualTaskLauncherElement",
  setup(y) {
    const p = V(), n = B();
    return (g, t) => (l(), S(P, {
      target: c(p).target || "",
      parent: c(p).parent || "",
      title: c(p).title || "Manual task",
      onQueued: t[0] || (t[0] = (a) => c(n)("created", a)),
      onError: t[1] || (t[1] = (a) => c(n)("error", a))
    }, null, 8, ["target", "parent", "title"]));
  }
}), G = { type: "object", properties: {
  target: { type: "string", default: "" },
  parent: { type: "string", default: "" },
  title: { type: "string", default: "Manual task" }
} };
class H extends D {
  static get wippyConfig() {
    return { propsSchema: G, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: A };
  }
  static get vueConfig() {
    return { rootComponent: z };
  }
}
j(import.meta.url, H);
//# sourceMappingURL=manual_task_launcher.js.map

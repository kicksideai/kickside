import { e as k, W as x, u as V, a as B, b as D } from "./errMsg-BT807vrI.js";
import { defineComponent as M, ref as v, computed as E, watch as I, onBeforeUnmount as L, openBlock as l, createElementBlock as h, createVNode as N, unref as c, createCommentVNode as y, createElementVNode as S, toDisplayString as q, createBlock as j } from "vue";
import { api as U, define as A } from "@wippy-fe/proxy";
import { s as Q } from "./execution-identity-editor-Cd9uOMxs.js";
import "@iconify/vue";
const W = {
  "aria-label": "Launch task",
  class: "kx-manual-launcher"
}, F = { key: 0 }, J = ["disabled"], K = {
  key: 1,
  role: "alert"
}, O = {
  key: 2,
  role: "status"
}, P = {
  key: 3,
  role: "status"
}, $ = /* @__PURE__ */ M({
  __name: "ManualTaskLauncher",
  props: {
    target: {},
    parent: {},
    title: {}
  },
  emits: ["queued", "error"],
  setup(g, { emit: p }) {
    const n = g, _ = p, t = v(null), a = v(!1), u = v(!1), d = v(!1), o = v("");
    let m = null, s = 0;
    const f = E(() => {
      if (!n.parent) return { error: "Choose an existing parent for this task" };
      try {
        const e = JSON.parse(n.target);
        return !e || typeof e != "object" || Array.isArray(e) ? { error: "Task target must be an object" } : { target: e, error: "" };
      } catch (e) {
        return { error: k(e, "Could not read the task target") };
      }
    }), w = E(() => !!t.value && !a.value && !u.value && !f.value.error);
    function C(e) {
      o.value = k(e, "Could not queue the task"), _("error", { message: o.value, error: e });
    }
    function R(e) {
      const r = e;
      a.value || u.value || m || r?.principal?.kind !== "user" || !r.principal.id || (t.value = { kind: "user", id: r.principal.id }, o.value = "");
    }
    async function T() {
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
          if (!b.success) throw new Error(k(b.error, "Task installation is not confirmed"));
          if (b.id !== r.body.component_id) throw new Error("Task installation receipt does not match the request");
          r.installed = !0;
        }
        const { data: i } = await U.post(
          "/api/v1/automations/" + encodeURIComponent(r.body.component_id) + "/actions/run_now",
          { request_id: r.wake }
        );
        if (e !== s) return;
        if (!i.success) throw new Error(k(i.error, "Run admission is not confirmed"));
        if (i.result?.state === "pending") {
          d.value = !0;
          return;
        }
        if (i.result?.state !== "succeeded") throw new Error("Run admission is not confirmed");
        u.value = !0, _("queued", { id: r.body.component_id });
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
      N(x, {
        tag: "wc-run-as-picker",
        attrs: { root: "", value: t.value?.id, disabled: a.value || u.value || !!c(m) },
        onChange: R,
        onError: C
      }, null, 8, ["attrs"]),
      t.value ? y("", !0) : (l(), h("p", F, "Select the account that runs this task.")),
      S("button", {
        type: "button",
        class: "p-button",
        disabled: !w.value,
        onClick: T
      }, q(a.value ? "Queuing…" : d.value ? "Check run admission" : o.value ? "Retry run" : "Queue run"), 9, J),
      f.value.error || o.value ? (l(), h("p", K, q(f.value.error || o.value), 1)) : y("", !0),
      d.value ? (l(), h("p", O, "Run admission is pending.")) : y("", !0),
      u.value ? (l(), h("p", P, "Run queued. Follow the task in Automations.")) : y("", !0)
    ]));
  }
}), z = /* @__PURE__ */ M({
  __name: "ManualTaskLauncherElement",
  setup(g) {
    const p = V(), n = B();
    return (_, t) => (l(), j($, {
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
    return { propsSchema: G, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: Q };
  }
  static get vueConfig() {
    return { rootComponent: z };
  }
}
A(import.meta.url, H);
//# sourceMappingURL=manual_task_launcher.js.map

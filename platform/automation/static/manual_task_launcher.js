import { e as h, W as T, _ as I, u as L, a as V, b as B } from "./errMsg-BT807vrI.js";
import { defineComponent as x, ref as v, computed as E, watch as D, onBeforeUnmount as N, openBlock as l, createElementBlock as _, createVNode as S, unref as c, createCommentVNode as k, createElementVNode as j, toDisplayString as q, createBlock as A } from "vue";
import { api as U, define as Q } from "@wippy-fe/proxy";
import { s as W } from "./execution-identity-editor-BMqd4DxB.js";
import "@iconify/vue";
const F = {
  "aria-label": "Launch task",
  class: "kx-manual-launcher"
}, J = { key: 0 }, K = ["disabled"], O = {
  key: 1,
  role: "alert"
}, P = {
  key: 2,
  role: "status"
}, $ = {
  key: 3,
  role: "status"
}, z = /* @__PURE__ */ x({
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
        return { error: h(e, "Could not read the task target") };
      }
    }), w = E(() => !!t.value && !a.value && !u.value && !f.value.error);
    function C(e) {
      o.value = h(e, "Could not queue the task"), g("error", { message: o.value, error: e });
    }
    function M(e) {
      const r = e;
      a.value || u.value || m || r?.principal?.kind !== "user" || !r.principal.id || (t.value = { kind: "user", id: r.principal.id }, o.value = "");
    }
    async function R() {
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
          if (!b.success) throw new Error(h(b.error, "Task installation is not confirmed"));
          if (b.id !== r.body.component_id) throw new Error("Task installation receipt does not match the request");
          r.installed = !0;
        }
        const { data: i } = await U.post(
          "/api/v1/automations/" + encodeURIComponent(r.body.component_id) + "/actions/run_now",
          { request_id: r.wake }
        );
        if (e !== s) return;
        if (!i.success) throw new Error(h(i.error, "Run admission is not confirmed"));
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
    return D(() => [n.target, n.parent, n.title], () => {
      s += 1, m = null, t.value = null, a.value = !1, u.value = !1, d.value = !1, o.value = "";
    }), N(() => {
      s += 1;
    }), (e, r) => (l(), _("section", F, [
      S(T, {
        tag: "wc-run-as-picker",
        attrs: { root: "", value: t.value?.id, disabled: a.value || u.value || !!c(m) },
        onChange: M,
        onError: C
      }, null, 8, ["attrs"]),
      t.value ? k("", !0) : (l(), _("p", J, "Select the account that runs this task.")),
      j("button", {
        type: "button",
        class: "p-button",
        disabled: !w.value,
        onClick: R
      }, q(a.value ? "Queuing…" : d.value ? "Check run admission" : o.value ? "Retry run" : "Queue run"), 9, K),
      f.value.error || o.value ? (l(), _("p", O, q(f.value.error || o.value), 1)) : k("", !0),
      d.value ? (l(), _("p", P, "Run admission is pending.")) : k("", !0),
      u.value ? (l(), _("p", $, "Run queued. Follow the task in Automations.")) : k("", !0)
    ]));
  }
}), G = /* @__PURE__ */ I(z, [["__scopeId", "data-v-519c573d"]]), H = /* @__PURE__ */ x({
  __name: "ManualTaskLauncherElement",
  setup(y) {
    const p = L(), n = V();
    return (g, t) => (l(), A(G, {
      target: c(p).target || "",
      parent: c(p).parent || "",
      title: c(p).title || "Manual task",
      onQueued: t[0] || (t[0] = (a) => c(n)("created", a)),
      onError: t[1] || (t[1] = (a) => c(n)("error", a))
    }, null, 8, ["target", "parent", "title"]));
  }
}), X = { type: "object", properties: {
  target: { type: "string", default: "" },
  parent: { type: "string", default: "" },
  title: { type: "string", default: "Manual task" }
} };
class Y extends B {
  static get wippyConfig() {
    return { propsSchema: X, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: W };
  }
  static get vueConfig() {
    return { rootComponent: H };
  }
}
Q(import.meta.url, Y);
//# sourceMappingURL=manual_task_launcher.js.map

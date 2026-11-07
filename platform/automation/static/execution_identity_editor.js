import { _ as W, e as j, u as F, a as K, W as M } from "./errMsg-kIukmtcj.js";
import { defineComponent as $, ref as l, computed as G, watch as H, onBeforeUnmount as J, openBlock as c, createElementBlock as v, createCommentVNode as m, Fragment as A, createElementVNode as f, toDisplayString as x, createVNode as O, createTextVNode as Q, createBlock as X, unref as I } from "vue";
import { api as L, define as Y } from "@wippy-fe/proxy";
import { r as Z } from "./principals-Bury5BH3.js";
import { s as ee } from "./execution-identity-editor-DaljeKxW.js";
import "@iconify/vue";
const te = {
  "aria-label": "Execution account",
  class: "kx-identity-editor"
}, ne = {
  key: 0,
  role: "status"
}, oe = { "aria-label": "Runs as" }, re = { "aria-label": "Authorized by" }, ae = ["disabled"], ie = {
  key: 2,
  role: "alert"
}, ue = {
  key: 3,
  role: "status"
}, se = {
  key: 4,
  role: "status"
}, le = /* @__PURE__ */ $({
  __name: "ExecutionIdentityEditor",
  props: {
    root: {}
  },
  emits: ["changed", "error"],
  setup(h, { emit: E }) {
    const d = h, C = E, n = l(null), o = l(null), i = l(!1), y = l(!1), p = l(""), g = l(!1), b = l(!1), z = l(""), U = l("");
    let r = 0, _ = null;
    const N = G(() => !!n.value && !!o.value && !i.value && !y.value && b.value);
    function w(t) {
      p.value = j(t, "Could not change the run-as account"), C("error", { message: p.value, error: t });
    }
    async function V(t) {
      const { data: e } = await L.get("/api/v1/automations/" + encodeURIComponent(t) + "/identity");
      if (!e.success || !e.identity?.principal?.id || !Number.isInteger(e.identity.identity_generation) || e.identity.identity_generation < 0) throw new Error("Could not read the run-as account");
      const u = e.identity, k = [u.principal, u.authorized_by].filter((a) => !!a).filter((a) => a.kind === "user" || a.kind === "group").map((a) => ({ type: a.kind, id: a.id })), T = await Z(k);
      function B(a) {
        return T.find((S) => S.type === a?.kind && S.id === a?.id)?.label || "Account unavailable";
      }
      return { identity: u, executor: B(u.principal), authorizer: B(u.authorized_by) };
    }
    function R(t) {
      n.value = t.identity, o.value = t.identity.principal, z.value = t.executor, U.value = t.authorizer;
    }
    async function q() {
      const t = ++r;
      if (n.value = null, o.value = null, y.value = !1, p.value = "", g.value = !1, b.value = !1, _ = null, !d.root) {
        i.value = !1;
        return;
      }
      i.value = !0;
      try {
        const e = await V(d.root);
        if (t !== r) return;
        R(e);
      } catch (e) {
        t === r && w(e);
      } finally {
        t === r && (i.value = !1);
      }
    }
    function D(t) {
      const e = t;
      !e?.principal || e.principal.kind !== "user" || !e.principal.id || i.value || y.value || (o.value = { kind: "user", id: e.principal.id }, _ = null, p.value = "", g.value = !1, b.value = !0);
    }
    async function P() {
      if (!N.value || !n.value || !o.value) return;
      const t = r, e = d.root;
      _ ||= { id: crypto.randomUUID(), principal: { ...o.value }, generation: n.value.identity_generation };
      const u = _;
      i.value = !0, p.value = "", g.value = !1;
      try {
        const { data: s } = await L.post(
          "/api/v1/automations/" + encodeURIComponent(e) + "/identity",
          {
            principal: u.principal,
            request_id: u.id,
            expected_identity_generation: u.generation
          }
        );
        if (t !== r) return;
        if (!s.success) throw new Error(s.error?.message || "Could not save the run-as account");
        if (s.state === "pending") {
          y.value = !0;
          return;
        }
        if (s.state !== "succeeded" || !Number.isInteger(s.identity_generation)) throw new Error("Identity change is not confirmed");
        const k = await V(e);
        if (t !== r) return;
        if (k.identity.identity_generation < s.identity_generation) throw new Error("Execution account confirmation is stale");
        R(k), g.value = !0, _ = null, b.value = !1, C("changed");
      } catch (s) {
        t === r && w(s);
      } finally {
        t === r && (i.value = !1);
      }
    }
    return H(() => d.root, () => {
      q();
    }, { immediate: !0 }), J(() => {
      r += 1;
    }), (t, e) => (c(), v("section", te, [
      i.value && !n.value ? (c(), v("p", ne, "Loading run-as account…")) : m("", !0),
      n.value ? (c(), v(A, { key: 1 }, [
        f("dl", null, [
          e[1] || (e[1] = f("dt", null, "Runs as", -1)),
          f("dd", oe, x(z.value), 1),
          n.value.authorized_by ? (c(), v(A, { key: 0 }, [
            e[0] || (e[0] = f("dt", null, "Authorized by", -1)),
            f("dd", re, x(U.value), 1)
          ], 64)) : m("", !0)
        ]),
        O(W, {
          tag: "wc-run-as-picker",
          attrs: { root: h.root, value: o.value?.id, disabled: i.value || y.value },
          onChange: D,
          onError: w
        }, null, 8, ["attrs"]),
        f("button", {
          type: "button",
          class: "p-button p-button-secondary",
          disabled: !N.value,
          onClick: P
        }, "Save run-as account", 8, ae)
      ], 64)) : m("", !0),
      p.value ? (c(), v("p", ie, x(p.value), 1)) : m("", !0),
      g.value ? (c(), v("p", ue, "Run-as account saved")) : m("", !0),
      y.value ? (c(), v("div", se, [
        e[2] || (e[2] = Q(" Identity change is pending. ", -1)),
        f("button", {
          type: "button",
          class: "p-button p-button-secondary",
          onClick: q
        }, "Check account")
      ])) : m("", !0)
    ]));
  }
}), ce = /* @__PURE__ */ $({
  __name: "ExecutionIdentityEditorElement",
  setup(h) {
    const E = F(), d = K();
    return (C, n) => (c(), X(le, {
      root: I(E).root || "",
      onChanged: n[0] || (n[0] = (o) => I(d)("change", void 0)),
      onError: n[1] || (n[1] = (o) => I(d)("error", o))
    }, null, 8, ["root"]));
  }
}), de = { type: "object", properties: { root: { type: "string", default: "" } } };
class pe extends M {
  static get wippyConfig() {
    return { propsSchema: de, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: ee };
  }
  static get vueConfig() {
    return { rootComponent: ce };
  }
}
Y(import.meta.url, pe);
//# sourceMappingURL=execution_identity_editor.js.map

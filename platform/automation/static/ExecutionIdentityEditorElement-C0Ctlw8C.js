import { defineComponent as $, ref as s, computed as M, watch as T, onBeforeUnmount as j, openBlock as c, createElementBlock as v, createCommentVNode as m, Fragment as A, createElementVNode as f, toDisplayString as C, createVNode as G, createTextVNode as H, createBlock as J, unref as z } from "vue";
import { a as K, u as O } from "./wc-runtime-KO3cNuNo.js";
import { api as L } from "@wippy-fe/proxy";
import { _ as Q, e as W } from "./WcMount.vue_vue_type_script_setup_true_lang-DeFg3QZK.js";
import { r as X } from "./principals-Bury5BH3.js";
const Y = {
  "aria-label": "Execution account",
  class: "kx-identity-editor"
}, Z = {
  key: 0,
  role: "status"
}, ee = { "aria-label": "Saved account" }, te = { "aria-label": "Authorized by" }, ne = ["disabled"], oe = {
  key: 2,
  role: "alert"
}, ae = {
  key: 3,
  role: "status"
}, re = {
  key: 4,
  role: "status"
}, ie = /* @__PURE__ */ $({
  __name: "ExecutionIdentityEditor",
  props: {
    root: {}
  },
  emits: ["changed", "error"],
  setup(k, { emit: E }) {
    const d = k, w = E, n = s(null), o = s(null), i = s(!1), y = s(!1), p = s(""), _ = s(!1), b = s(!1), I = s(""), N = s("");
    let a = 0, g = null;
    const U = M(() => !!n.value && !!o.value && !i.value && !y.value && b.value);
    function x(t) {
      p.value = W(t, "Could not change the run-as account"), w("error", { message: p.value, error: t });
    }
    async function S(t) {
      const { data: e } = await L.get("/api/v1/automations/" + encodeURIComponent(t) + "/identity");
      if (!e.success || !e.identity?.principal?.id || !Number.isInteger(e.identity.identity_generation) || e.identity.identity_generation < 0) throw new Error("Could not read the run-as account");
      const u = e.identity, h = [u.principal, u.authorized_by].filter((r) => !!r).filter((r) => r.kind === "user" || r.kind === "group").map((r) => ({ type: r.kind, id: r.id })), F = await X(h);
      function R(r) {
        return F.find((V) => V.type === r?.kind && V.id === r?.id)?.label || "Account unavailable";
      }
      return { identity: u, executor: R(u.principal), authorizer: R(u.authorized_by) };
    }
    function q(t) {
      n.value = t.identity, o.value = t.identity.principal, I.value = t.executor, N.value = t.authorizer;
    }
    async function B() {
      const t = ++a;
      if (n.value = null, o.value = null, y.value = !1, p.value = "", _.value = !1, b.value = !1, g = null, !d.root) {
        i.value = !1;
        return;
      }
      i.value = !0;
      try {
        const e = await S(d.root);
        if (t !== a) return;
        q(e);
      } catch (e) {
        t === a && x(e);
      } finally {
        t === a && (i.value = !1);
      }
    }
    function D(t) {
      const e = t;
      !e?.principal || e.principal.kind !== "user" || !e.principal.id || i.value || y.value || (o.value = { kind: "user", id: e.principal.id }, g = null, p.value = "", _.value = !1, b.value = !0);
    }
    async function P() {
      if (!U.value || !n.value || !o.value) return;
      const t = a, e = d.root;
      g ||= { id: crypto.randomUUID(), principal: { ...o.value }, generation: n.value.identity_generation };
      const u = g;
      i.value = !0, p.value = "", _.value = !1;
      try {
        const { data: l } = await L.post(
          "/api/v1/automations/" + encodeURIComponent(e) + "/identity",
          {
            principal: u.principal,
            request_id: u.id,
            expected_identity_generation: u.generation
          }
        );
        if (t !== a) return;
        if (!l.success) throw new Error(l.error?.message || "Could not save the run-as account");
        if (l.state === "pending") {
          y.value = !0;
          return;
        }
        if (l.state !== "succeeded" || !Number.isInteger(l.identity_generation)) throw new Error("Identity change is not confirmed");
        const h = await S(e);
        if (t !== a) return;
        if (h.identity.identity_generation < l.identity_generation) throw new Error("Execution account confirmation is stale");
        q(h), _.value = !0, g = null, b.value = !1, w("changed");
      } catch (l) {
        t === a && x(l);
      } finally {
        t === a && (i.value = !1);
      }
    }
    return T(() => d.root, () => {
      B();
    }, { immediate: !0 }), j(() => {
      a += 1;
    }), (t, e) => (c(), v("section", Y, [
      i.value && !n.value ? (c(), v("p", Z, "Loading run-as account…")) : m("", !0),
      n.value ? (c(), v(A, { key: 1 }, [
        f("dl", null, [
          e[1] || (e[1] = f("dt", null, "Saved account", -1)),
          f("dd", ee, C(I.value), 1),
          n.value.authorized_by ? (c(), v(A, { key: 0 }, [
            e[0] || (e[0] = f("dt", null, "Authorized by", -1)),
            f("dd", te, C(N.value), 1)
          ], 64)) : m("", !0)
        ]),
        G(Q, {
          tag: "wc-run-as-picker",
          attrs: { root: k.root, value: o.value?.id, disabled: i.value || y.value },
          onChange: D,
          onError: x
        }, null, 8, ["attrs"]),
        f("button", {
          type: "button",
          class: "p-button p-button-secondary",
          disabled: !U.value,
          onClick: P
        }, "Save run-as account", 8, ne)
      ], 64)) : m("", !0),
      p.value ? (c(), v("p", oe, C(p.value), 1)) : m("", !0),
      _.value ? (c(), v("p", ae, "Run-as account saved")) : m("", !0),
      y.value ? (c(), v("div", re, [
        e[2] || (e[2] = H(" Updating account… ", -1)),
        f("button", {
          type: "button",
          class: "p-button p-button-secondary",
          onClick: B
        }, "Refresh account")
      ])) : m("", !0)
    ]));
  }
}), pe = /* @__PURE__ */ $({
  __name: "ExecutionIdentityEditorElement",
  setup(k) {
    const E = K(), d = O();
    return (w, n) => (c(), J(ie, {
      root: z(E).root || "",
      onChanged: n[0] || (n[0] = (o) => z(d)("change", void 0)),
      onError: n[1] || (n[1] = (o) => z(d)("error", o))
    }, null, 8, ["root"]));
  }
});
export {
  pe as default
};
//# sourceMappingURL=ExecutionIdentityEditorElement-C0Ctlw8C.js.map

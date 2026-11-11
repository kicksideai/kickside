import { defineComponent as se, computed as m, ref as h, watch as re, openBlock as a, createElementBlock as c, Fragment as y, createElementVNode as g, withKeys as G, withModifiers as de, normalizeClass as L, createVNode as x, unref as k, createTextVNode as w, toDisplayString as P, withCtx as ue, renderList as pe, normalizeStyle as fe, createBlock as H, createCommentVNode as he } from "vue";
import { Icon as b } from "@iconify/vue";
import { api as Q } from "@wippy-fe/proxy";
import { a as ve, u as _e } from "./wc-runtime-CNDpK4lj.js";
import { _ as me } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-CU5LLZRq.js";
const ye = () => ve(), ke = () => _e(), be = ["aria-expanded", "onKeydown"], ge = { class: "cp-value-id" }, xe = { class: "cp-pop" }, we = {
  key: 0,
  class: "cp-state"
}, Ce = {
  key: 1,
  class: "cp-state"
}, $e = {
  key: 2,
  class: "cp-tree"
}, Se = ["onClick"], Ne = {
  key: 1,
  class: "cp-twist cp-twist-empty",
  "aria-hidden": "true"
}, Re = { class: "cp-label" }, Ee = /* @__PURE__ */ se({
  __name: "ChannelPicker",
  setup(Le) {
    const v = ye(), C = ke(), K = m(() => v.value?.connectionsSource || "/api/v1/connections"), W = m(() => v.value?.discoverPath || "/api/v1/connections/{id}/discover_resources"), I = m(() => (v.value?.providers || "").split(",").map((e) => e.trim()).filter(Boolean)), X = m(() => v.value?.childArg || "parent_id"), Y = m(() => v.value?.placeholder || "Select a channel…"), $ = h([]), U = h(!1), S = h(!1), r = h(!1), d = h(null), u = h(null), N = h(!1), M = h(null);
    function p(e) {
      return typeof e == "string" ? e : e == null ? "" : String(e);
    }
    function O(e) {
      return Array.isArray(e?.items) ? e.items : [];
    }
    async function z() {
      if (!S.value) {
        S.value = !0;
        try {
          const e = I.value.length ? I.value : [""], t = /* @__PURE__ */ new Set(), n = [];
          for (const i of e) {
            const s = i ? `${K.value}?provider=${encodeURIComponent(i)}&limit=100` : `${K.value}?limit=100`, { data: R } = await Q.get(s);
            for (const _ of O(R)) {
              if (_.reply_provider !== !0) continue;
              const o = p(_.id);
              !o || t.has(o) || (t.add(o), n.push({
                key: `c:${o}`,
                kind: "connection",
                label: p(_.label) || o,
                connection_id: o,
                channel_id: "",
                resource_id: "",
                expandable: !0,
                loaded: !1,
                loading: !1,
                expanded: !1,
                children: []
              }));
            }
          }
          $.value = n, U.value = !0, C("load", void 0);
        } catch (e) {
          C("error", { message: "failed to list connections", error: e });
        } finally {
          S.value = !1;
        }
      }
    }
    function Z(e) {
      return W.value.replace("{id}", encodeURIComponent(e));
    }
    function ee(e, t, n) {
      const i = /* @__PURE__ */ new Map();
      for (const o of n) {
        const f = p(o.id);
        f && i.set(f, o);
      }
      const s = /* @__PURE__ */ new Map(), R = [];
      for (const o of n) {
        const f = p(o.id);
        if (!f) continue;
        const l = p(o.parent_id);
        if (l && i.has(l) && l !== f) {
          const A = s.get(l);
          A ? A.push(o) : s.set(l, [o]);
        } else
          R.push(o);
      }
      const _ = (o, f) => {
        const l = p(o.id), T = (s.get(l) || []).map((ce) => _(ce, `${f}/${l}`)), B = T.length > 0, E = o.selectable === !0 && !B, j = o.drillable === !0, q = !E;
        return {
          key: `${f}/${l}`,
          kind: E ? "channel" : "container",
          label: p(o.label) || l,
          connection_id: e,
          channel_id: E ? l : "",
          resource_id: l,
          // A drillable container (a guild) loads its children on expand; a
          // non-drillable one (a category) already has them nested here, so an empty
          // category just shows empty rather than drilling and 404-ing.
          expandable: q && (j || B),
          loaded: B || q && !j,
          loading: !1,
          expanded: !1,
          children: T
        };
      };
      return R.map((o) => _(o, t));
    }
    async function F(e) {
      if (!(e.loaded || e.loading)) {
        e.loading = !0;
        try {
          const t = {};
          e.kind !== "connection" && e.resource_id && (t[X.value] = e.resource_id);
          const { data: n } = await Q.post(Z(e.connection_id), t);
          e.children = ee(e.connection_id, e.key, O(n)), e.loaded = !0;
        } catch (t) {
          C("error", { message: "failed to load channels", error: t });
        } finally {
          e.loading = !1;
        }
      }
    }
    function ne(e) {
      e.expandable && (e.expanded = !e.expanded, e.expanded && !e.loaded && F(e));
    }
    const te = m(() => {
      const e = [], t = (n, i) => {
        for (const s of n)
          e.push({ node: s, depth: i }), s.expanded && s.children.length && t(s.children, i + 1);
      };
      return t($.value, 0), e;
    });
    function oe(e) {
      return e === "connection" ? "tabler:plug-connected" : e === "container" ? "tabler:server" : "tabler:hash";
    }
    function D(e) {
      return e.kind === "channel" && !!d.value && d.value.connection_id === e.connection_id && d.value.channel_id === e.channel_id;
    }
    function ae(e) {
      e.kind === "channel" ? (d.value = { connection_id: e.connection_id, channel_id: e.channel_id }, u.value = e, C("change", { connection_id: e.connection_id, channel_id: e.channel_id, channel_name: e.label }), r.value = !1) : ne(e);
    }
    function ie(e) {
      if (typeof e != "string" || !e.trim()) return null;
      try {
        const t = JSON.parse(e);
        if (t && t.channel_id) return { connection_id: p(t.connection_id), channel_id: p(t.channel_id) };
      } catch {
      }
      return null;
    }
    async function J(e, t) {
      e.loaded || await F(e);
      for (const n of e.children) {
        if (n.kind === "channel" && n.channel_id === t) return n;
        if (n.kind === "container") {
          const i = await J(n, t);
          if (i) return i;
        }
      }
      return null;
    }
    async function le() {
      const e = d.value;
      if (!e) {
        u.value = null;
        return;
      }
      if (!(u.value && u.value.connection_id === e.connection_id && u.value.channel_id === e.channel_id) && !N.value) {
        u.value = null, N.value = !0;
        try {
          U.value || await z();
          const t = $.value.find((n) => n.kind === "connection" && n.connection_id === e.connection_id);
          u.value = t ? await J(t, e.channel_id) : null;
        } finally {
          N.value = !1;
        }
      }
    }
    re(() => v.value?.value, (e) => {
      d.value = ie(e), le();
    }, { immediate: !0 });
    function V() {
      r.value = !r.value, r.value && !U.value && z();
    }
    return (e, t) => (a(), c(y, null, [
      g("div", {
        ref_key: "ctrl",
        ref: M,
        class: L(["cp", r.value && "cp-open"]),
        role: "button",
        tabindex: "0",
        "aria-expanded": r.value,
        onClick: V,
        onKeydown: [
          G(V, ["enter"]),
          G(de(V, ["prevent"]), ["space"])
        ]
      }, [
        x(k(b), {
          icon: "tabler:hash",
          class: "cp-lead",
          "aria-hidden": "true"
        }),
        g("span", {
          class: L(["cp-value", !d.value && "cp-ph"])
        }, [
          d.value ? u.value ? (a(), c(y, { key: 1 }, [
            w(P(u.value.label), 1)
          ], 64)) : N.value ? (a(), c(y, { key: 2 }, [
            w("Resolving…")
          ], 64)) : (a(), c(y, { key: 3 }, [
            t[1] || (t[1] = w("Unknown channel", -1)),
            g("span", ge, P(d.value.channel_id), 1)
          ], 64)) : (a(), c(y, { key: 0 }, [
            w(P(Y.value), 1)
          ], 64))
        ], 2),
        x(k(b), {
          icon: r.value ? "tabler:chevron-up" : "tabler:chevron-down",
          class: "cp-caret",
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 42, be),
      x(me, {
        open: r.value,
        "onUpdate:open": t[0] || (t[0] = (n) => r.value = n),
        anchor: M.value,
        "min-width": 280,
        "max-height": 360
      }, {
        default: ue(() => [
          g("div", xe, [
            S.value ? (a(), c("div", we, [
              x(k(b), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              t[2] || (t[2] = w(" Loading connections…", -1))
            ])) : $.value.length ? (a(), c("div", $e, [
              (a(!0), c(y, null, pe(te.value, (n) => (a(), c("button", {
                key: n.node.key,
                type: "button",
                class: L(["cp-row", [`cp-${n.node.kind}`, D(n.node) && "cp-row-on"]]),
                style: fe({ "--cp-depth": `${n.depth * 16}px` }),
                onClick: (i) => ae(n.node)
              }, [
                n.node.expandable ? (a(), H(k(b), {
                  key: 0,
                  icon: n.node.loading ? "tabler:loader-2" : n.node.expanded ? "tabler:chevron-down" : "tabler:chevron-right",
                  class: L(["cp-twist", n.node.loading && "spin"]),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"])) : (a(), c("span", Ne)),
                x(k(b), {
                  icon: oe(n.node.kind),
                  class: "cp-ico",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                g("span", Re, P(n.node.label), 1),
                D(n.node) ? (a(), H(k(b), {
                  key: 2,
                  icon: "tabler:check",
                  class: "cp-check",
                  "aria-hidden": "true"
                })) : he("", !0)
              ], 14, Se))), 128))
            ])) : (a(), c("div", Ce, "No connections."))
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
export {
  Ee as default
};
//# sourceMappingURL=ChannelPicker-B8cbWebi.js.map

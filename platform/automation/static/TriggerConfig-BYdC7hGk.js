import { defineComponent as me, computed as l, openBlock as a, createElementBlock as o, Fragment as ae, normalizeClass as W, toDisplayString as O, createCommentVNode as r, createBlock as B, createElementVNode as s, createVNode as f, ref as d, watch as He, onMounted as Ue, unref as h, createTextVNode as he, withDirectives as Z, vModelText as ee } from "vue";
import { Icon as b } from "@iconify/vue";
import { loadByTagName as $e, api as Le } from "@wippy-fe/proxy";
import { a as Fe, u as We } from "./wc-runtime-KO3cNuNo.js";
import { W as te, e as Ke } from "./WcMount-Dv75Gn1l.js";
import { e as ke, S as ge, a as qe, o as ze, h as Ge, i as be, g as ye, T as Je, j as le, _ as Ye, d as Qe, r as Xe, C as Ze } from "./source-instance-DJIdA-LH.js";
import et from "primevue/select";
const tt = {
  key: 0,
  class: "kx-tc-lbl"
}, lt = {
  key: 2,
  class: "kx-tc-opts"
}, at = {
  key: 1,
  class: "kx-tc-detail",
  "data-test": "tc-detail"
}, st = /* @__PURE__ */ me({
  __name: "SourceInstance",
  props: {
    source: {},
    config: {},
    locked: { type: Boolean }
  },
  emits: ["change"],
  setup(N, { emit: H }) {
    const x = N, T = H, c = l(() => ke(x.source)), U = l(() => c.value?.tag || ge), E = l(() => c.value?.schema), K = l(() => qe(x.source, c.value)), m = l(() => ze(x.source)), D = l(() => Ge(x.source, c.value)), P = l(() => c.value?.detail || ""), S = l(() => {
      const j = c.value?.key || "", v = be(c.value, x.config);
      return j && v ? { [j]: v } : null;
    });
    return (j, v) => (a(), o(ae, null, [
      c.value || D.value ? (a(), o("div", {
        key: 0,
        class: W(["kx-tc-field", N.locked && "kx-tc-locked"]),
        "data-test": "tc-instance"
      }, [
        c.value?.title ? (a(), o("span", tt, O(c.value.title), 1)) : r("", !0),
        c.value ? (a(), B(te, {
          key: 1,
          tag: U.value,
          schema: E.value,
          config: N.config,
          meta: K.value,
          provider: N.source.provider,
          onChange: v[0] || (v[0] = (p) => T("change", p))
        }, null, 8, ["tag", "schema", "config", "meta", "provider"])) : r("", !0),
        D.value ? (a(), o("div", lt, [
          v[2] || (v[2] = s("span", { class: "kx-tc-lbl" }, "Options", -1)),
          f(te, {
            tag: "wc-schema-form",
            schema: m.value,
            config: N.config,
            onChange: v[1] || (v[1] = (p) => T("change", p))
          }, null, 8, ["schema", "config"])
        ])) : r("", !0)
      ], 2)) : r("", !0),
      P.value && S.value ? (a(), o("div", at, [
        f(te, {
          tag: P.value,
          config: S.value
        }, null, 8, ["tag", "config"])
      ])) : r("", !0)
    ], 64));
  }
}), nt = {
  key: 0,
  class: "kx-tc-note",
  "aria-live": "polite"
}, ot = {
  key: 1,
  class: "kx-tc-warn",
  role: "alert",
  "data-test": "tc-load-error"
}, ut = {
  class: "kx-tc-field",
  "data-test": "tc-when"
}, it = { class: "kx-tc-lbl" }, rt = {
  key: 0,
  class: "kx-tc-static",
  "data-test": "tc-when-locked"
}, ct = {
  key: 2,
  class: "kx-tc-desc"
}, vt = {
  key: 0,
  class: "kx-tc-note",
  "data-test": "tc-catalog-empty"
}, dt = {
  key: 1,
  class: "kx-tc-warn",
  role: "alert",
  "data-test": "tc-source-missing"
}, ft = {
  key: 2,
  class: "kx-tc-warn",
  role: "alert",
  "data-test": "tc-unsupported"
}, pt = {
  key: 1,
  class: "kx-tc-note",
  "data-test": "tc-live-note"
}, ht = { class: "kx-tc-lbl" }, yt = {
  key: 0,
  class: "kx-tc-static",
  "data-test": "tc-history-locked"
}, mt = {
  class: "kx-tc-hint",
  "data-test": "tc-history-hint"
}, kt = {
  key: 2,
  class: "kx-tc-sub"
}, gt = ["disabled"], bt = {
  key: 3,
  class: "kx-tc-sub"
}, xt = ["disabled"], _t = ["open"], wt = { class: "kx-tc-sub" }, St = ["disabled"], Ct = {
  key: 4,
  class: "kx-tc-gate",
  "data-test": "tc-gate",
  "aria-live": "polite"
}, y = "__schedule__", Et = /* @__PURE__ */ me({
  __name: "TriggerConfig",
  setup(N) {
    const H = Fe(), x = We();
    function T(e) {
      return H.value?.[e];
    }
    function c(e) {
      const t = T(e);
      return t === !0 || t === "true" || t === "";
    }
    function U(e) {
      const t = T(e);
      return typeof t == "string" ? t.split(",").map((i) => i.trim()).filter(Boolean) : [];
    }
    const E = l(() => c("disabled")), K = l(() => c("reconfigure")), m = l(() => E.value || K.value), D = l(() => {
      const e = U("allowed");
      return e.length ? e : ["timer", "source"];
    }), P = l(() => D.value.includes("timer")), S = l(() => D.value.includes("source")), j = l(() => U("sourceClasses")), v = d([]), p = d(!0), C = d(""), n = d(""), A = d({}), I = d(null), M = d(""), xe = l(() => {
      const e = T("historyDefault");
      return e === "none" || e === "all" ? e : null;
    }), u = d(null), $ = d(null), R = d(""), q = d(!1), _e = l(() => S.value ? ye(v.value, j.value) : []), we = l(() => ye(v.value)), k = l(() => n.value && n.value !== y && we.value.find((e) => e.id === n.value) || null), Se = l(() => !!n.value && n.value !== y && !k.value && !p.value && !C.value), se = l(() => {
      const e = [];
      P.value && e.push({ id: y, title: "On a schedule", icon: "tabler:clock", group: "Schedule", subtitle: "Run at times you choose" });
      for (const t of _e.value)
        e.push({ id: t.id, title: t.title, icon: t.icon || "tabler:plug", group: t.group || "Sources", subtitle: t.description || t.provider });
      return e;
    }), Ce = l(() => S.value && !p.value && !C.value && !n.value && !se.value.length), _ = l(() => {
      if (!n.value) return "none";
      if (n.value === y) return "timer";
      const e = k.value;
      return e ? e.hasTrigger ? "watch" : e.hasPull ? "poll" : "unsupported" : "none";
    }), ne = l(() => _.value === "timer" || _.value === "poll"), Ae = l(() => _.value === "poll" || _.value === "watch"), oe = l(() => _.value === "watch"), z = l(() => xe.value), Oe = l(() => !!k.value && _.value !== "unsupported"), ue = l(() => {
      const e = [
        { label: "All", value: "all" },
        { label: "Only new", value: "none" }
      ];
      return oe.value || (e.push({ label: "Last N days", value: "last_days" }), e.push({ label: "Since a date", value: "since" })), e;
    }), Te = l(() => n.value === y ? "On a schedule" : k.value?.title || n.value || "Not set"), Ie = l(() => ue.value.find((e) => e.value === u.value)?.label || "Not set"), G = l(() => ke(k.value)), Me = l(() => be(G.value, A.value));
    function Ne() {
      if (!u.value) return null;
      if (u.value === "all") return "all";
      if (u.value === "none") return "none";
      if (u.value === "last_days") {
        const e = Math.floor(Number($.value));
        return Number.isInteger(e) && e > 0 ? { last_days: e } : null;
      }
      return u.value === "since" && R.value ? { since: new Date(R.value).toISOString() } : null;
    }
    const J = d(null), Y = d(null);
    function ie() {
      const e = { v: 2 }, t = I.value;
      if (n.value === y)
        return t && (e.schedule = t), e;
      e.source = n.value, Object.keys(A.value).length && (e.config = { ...A.value }), M.value.trim() && (e.filter = { expr: M.value.trim() }), ne.value && t && (e.schedule = t), _.value === "poll" && J.value && (e.poll = J.value), Y.value && (e.delivery = Y.value);
      const i = n.value !== y ? Ne() : null;
      return i != null && (e.backfill = i), e;
    }
    function re() {
      const e = ie();
      if (!n.value) return { spec: e, valid: !1, error: "Pick when this runs." };
      const t = Xe(e, v.value);
      return t.error ? { spec: e, valid: !1, error: t.error.message } : n.value !== y && G.value && !Me.value ? { spec: e, valid: !1, error: `${G.value.title || "Instance"} is required.` } : { spec: e, valid: !0 };
    }
    const Q = l(() => p.value ? null : re()), ce = l(() => n.value === y ? Je : k.value?.outputSchema);
    let X = "";
    function w() {
      const e = re();
      ce.value !== void 0 && (e.output_schema = ce.value), X = le(e.spec), x("change", e);
    }
    function ve(e) {
      if (e == null) return null;
      if (typeof e == "string") {
        const t = e.trim();
        if (!t) return null;
        try {
          e = JSON.parse(t);
        } catch {
          return null;
        }
      }
      return typeof e == "object" && e && !Array.isArray(e) ? e : null;
    }
    function de(e) {
      const t = typeof e.source == "string" ? e.source.trim() : "";
      n.value = t || y, A.value = typeof e.config == "object" && e.config && !Array.isArray(e.config) ? { ...e.config } : {};
      const i = e.schedule;
      if (i && typeof i == "object") {
        const g = String(i.type || ""), Re = g === "once" || g === "interval" || g === "ticker" || g === "cron" ? g : Ze, Be = typeof i.expression == "string" ? i.expression : "";
        I.value = { type: Re, expression: Be };
      } else
        I.value = null;
      const L = e.poll;
      J.value = L && typeof L == "object" && !Array.isArray(L) ? L : null;
      const F = e.delivery;
      Y.value = F && typeof F == "object" && !Array.isArray(F) ? F : null;
      const pe = e.filter;
      M.value = typeof pe?.expr == "string" ? pe.expr : "", q.value = !!M.value;
      const V = e.backfill;
      if (V === "none") u.value = "none";
      else if (V === "all") u.value = "all";
      else if (V && typeof V == "object" && !Array.isArray(V)) {
        const g = V;
        typeof g.last_days == "number" ? (u.value = "last_days", $.value = g.last_days) : typeof g.since == "string" ? (u.value = "since", R.value = g.since.slice(0, 10)) : u.value = z.value;
      } else u.value = z.value;
    }
    He(() => H.value?.value, (e) => {
      const t = ve(e);
      t && le(t) !== X && (de(t), X = le(ie()));
    });
    function Ve(e) {
      e !== n.value && (n.value = e, A.value = {}, M.value = "", u.value = z.value, I.value = null, w());
    }
    function Ee(e) {
      I.value = e, w();
    }
    function De(e) {
      e && typeof e == "object" && (A.value = { ...A.value, ...e }, w());
    }
    function Pe(e) {
      u.value = e, w();
    }
    async function fe() {
      p.value = !0, C.value = "";
      try {
        const { data: e } = await Le.get("/api/v1/automations/sources");
        v.value = e?.sources || [];
      } catch (e) {
        S.value && (C.value = Ke(e, "could not load sources"), x("error", { message: C.value, error: e }));
      } finally {
        p.value = !1;
      }
    }
    function je() {
      fe().then(() => w());
    }
    return Ue(async () => {
      $e(ge, { timeoutMs: 8e3 }).catch(() => {
      }), S.value ? await fe() : p.value = !1;
      const e = ve(T("value"));
      e ? de(e) : P.value && !S.value && (n.value = y, I.value = null), C.value || x("load", void 0), w();
    }), (e, t) => (a(), o("div", {
      class: W(["kx-tc", E.value && "kx-tc-off"])
    }, [
      p.value ? (a(), o("div", nt, [
        f(h(b), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        t[4] || (t[4] = s("span", null, "Loading sources…", -1))
      ])) : C.value ? (a(), o("div", ot, [
        f(h(b), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        s("span", null, O(C.value), 1),
        s("button", {
          type: "button",
          class: "kx-tc-retry",
          onClick: je
        }, "Retry")
      ])) : (a(), o(ae, { key: 2 }, [
        s("div", ut, [
          s("span", it, [
            f(h(b), {
              icon: "tabler:calendar-bolt",
              "aria-hidden": "true"
            }),
            t[5] || (t[5] = he(" When", -1))
          ]),
          m.value ? (a(), o("p", rt, O(Te.value), 1)) : (a(), B(Ye, {
            key: 1,
            items: se.value,
            "model-value": n.value,
            placeholder: "Pick when this runs…",
            "aria-label": "When this runs",
            "onUpdate:modelValue": Ve
          }, null, 8, ["items", "model-value"])),
          k.value?.description ? (a(), o("p", ct, O(k.value.description), 1)) : r("", !0)
        ]),
        Ce.value ? (a(), o("div", vt, [
          f(h(b), {
            icon: "tabler:plug-x",
            "aria-hidden": "true"
          }),
          t[6] || (t[6] = s("span", null, "No sources are available to trigger on yet.", -1))
        ])) : r("", !0),
        Se.value ? (a(), o("div", dt, [
          f(h(b), {
            icon: "tabler:plug-x",
            "aria-hidden": "true"
          }),
          s("span", null, 'The source "' + O(n.value) + '" is not available. It may have been removed or you no longer have access to it.', 1)
        ])) : _.value === "unsupported" ? (a(), o("div", ft, [
          f(h(b), {
            icon: "tabler:plug-x",
            "aria-hidden": "true"
          }),
          t[7] || (t[7] = s("span", null, "This source can't start anything yet — it announces no events and can't be checked for items.", -1))
        ])) : (a(), o(ae, { key: 3 }, [
          k.value ? (a(), B(st, {
            key: 0,
            source: k.value,
            config: A.value,
            locked: m.value,
            onChange: De
          }, null, 8, ["source", "config", "locked"])) : r("", !0),
          _.value === "watch" ? (a(), o("div", pt, [
            f(h(b), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            }),
            t[8] || (t[8] = s("span", null, "Runs on each incoming event — no schedule to set. Choose an explicit history boundary.", -1))
          ])) : r("", !0),
          ne.value ? (a(), B(Qe, {
            key: 2,
            "model-value": I.value,
            disabled: E.value,
            "onUpdate:modelValue": Ee
          }, null, 8, ["model-value", "disabled"])) : r("", !0),
          Ae.value ? (a(), o("div", {
            key: 3,
            class: W(["kx-tc-field", m.value && "kx-tc-locked"]),
            "data-test": "tc-history"
          }, [
            s("span", ht, [
              f(h(b), {
                icon: "tabler:history",
                "aria-hidden": "true"
              }),
              t[9] || (t[9] = he(" History", -1))
            ]),
            m.value ? (a(), o("p", yt, O(Ie.value), 1)) : (a(), B(h(et), {
              key: 1,
              class: "kx-tc-select",
              "data-test": "tc-history-kind",
              "model-value": u.value,
              options: ue.value,
              "option-label": "label",
              "option-value": "value",
              "onUpdate:modelValue": Pe
            }, null, 8, ["model-value", "options"])),
            s("span", mt, O(oe.value ? u.value === "all" ? "Replays this thread's history from the start, then continues live." : `How much of this thread's history to replay on the first run. "Only new" starts from now.` : `How much of the source's existing items to bring in on the first run. "Only new" starts from now.`), 1),
            u.value === "last_days" ? (a(), o("label", kt, [
              t[10] || (t[10] = s("span", { class: "kx-tc-lbl" }, "Days", -1)),
              Z(s("input", {
                "onUpdate:modelValue": t[0] || (t[0] = (i) => $.value = i),
                class: "kx-tc-input",
                "data-test": "tc-history-days",
                type: "number",
                disabled: m.value,
                onChange: w
              }, null, 40, gt), [
                [
                  ee,
                  $.value,
                  void 0,
                  { number: !0 }
                ]
              ])
            ])) : r("", !0),
            u.value === "since" ? (a(), o("label", bt, [
              t[11] || (t[11] = s("span", { class: "kx-tc-lbl" }, "Since", -1)),
              Z(s("input", {
                "onUpdate:modelValue": t[1] || (t[1] = (i) => R.value = i),
                class: "kx-tc-input",
                "data-test": "tc-history-since",
                type: "date",
                disabled: m.value,
                onChange: w
              }, null, 40, xt), [
                [ee, R.value]
              ])
            ])) : r("", !0)
          ], 2)) : r("", !0),
          Oe.value ? (a(), o("details", {
            key: 4,
            class: "kx-tc-adv",
            open: q.value,
            onToggle: t[3] || (t[3] = (i) => q.value = i.target.open)
          }, [
            s("summary", null, [
              f(h(b), {
                class: "kx-tc-caret",
                icon: "tabler:chevron-right",
                "aria-hidden": "true"
              }),
              t[12] || (t[12] = s("span", null, "Advanced", -1))
            ]),
            s("div", {
              class: W(["kx-tc-adv-body", m.value && "kx-tc-locked"])
            }, [
              s("label", wt, [
                t[13] || (t[13] = s("span", { class: "kx-tc-lbl" }, "Only when this matches", -1)),
                Z(s("textarea", {
                  "onUpdate:modelValue": t[2] || (t[2] = (i) => M.value = i),
                  class: "kx-tc-input kx-tc-textarea",
                  "data-test": "tc-expr",
                  rows: "2",
                  placeholder: "item.status == 'active'",
                  spellcheck: "false",
                  disabled: m.value,
                  onChange: w
                }, null, 40, St), [
                  [ee, M.value]
                ]),
                t[14] || (t[14] = s("span", { class: "kx-tc-hint" }, "An expression over each incoming item; items that don't match are skipped.", -1))
              ])
            ], 2)
          ], 40, _t)) : r("", !0)
        ], 64)),
        Q.value && !Q.value.valid ? (a(), o("div", Ct, [
          f(h(b), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          s("span", null, O(Q.value.error), 1)
        ])) : r("", !0)
      ], 64))
    ], 2));
  }
});
export {
  Et as default
};
//# sourceMappingURL=TriggerConfig-BYdC7hGk.js.map

import { W as Z, u as Re, a as He, e as Be, b as Le } from "./errMsg-CFwf-kA2.js";
import { P as $e } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DNnuyvEa.js";
import { defineComponent as ge, computed as o, openBlock as a, createElementBlock as r, Fragment as ae, normalizeClass as F, toDisplayString as O, createCommentVNode as c, createBlock as U, createElementVNode as i, createVNode as v, ref as d, watch as Fe, onMounted as We, unref as f, createTextVNode as fe, withDirectives as ee, vModelText as te } from "vue";
import { Icon as b } from "@iconify/vue";
import { loadByTagName as Ke, api as qe, define as Je } from "@wippy-fe/proxy";
import { e as me, S as ke, a as Ge, o as Ye, h as Qe, i as be, g as xe, T as Xe, j as oe, _ as Ze, d as et, r as tt, C as ot } from "./source-instance-BWCuScFJ.js";
import { d as at } from "./index-DVv1zr-X.js";
const it = {
  key: 0,
  class: "kx-tc-lbl"
}, nt = {
  key: 2,
  class: "kx-tc-opts"
}, rt = {
  key: 1,
  class: "kx-tc-detail",
  "data-test": "tc-detail"
}, lt = /* @__PURE__ */ ge({
  __name: "SourceInstance",
  props: {
    source: {},
    config: {},
    locked: { type: Boolean }
  },
  emits: ["change"],
  setup(A, { emit: R }) {
    const w = A, E = R, u = o(() => me(w.source)), H = o(() => u.value?.tag || ke), I = o(() => u.value?.schema), W = o(() => Ge(w.source, u.value)), g = o(() => Ye(w.source)), N = o(() => Qe(w.source, u.value)), j = o(() => u.value?.detail || ""), C = o(() => {
      const P = u.value?.key || "", p = be(u.value, w.config);
      return P && p ? { [P]: p } : null;
    });
    return (P, p) => (a(), r(ae, null, [
      u.value || N.value ? (a(), r("div", {
        key: 0,
        class: F(["kx-tc-field", A.locked && "kx-tc-locked"]),
        "data-test": "tc-instance"
      }, [
        u.value?.title ? (a(), r("span", it, O(u.value.title), 1)) : c("", !0),
        u.value ? (a(), U(Z, {
          key: 1,
          tag: H.value,
          schema: I.value,
          config: A.config,
          meta: W.value,
          provider: A.source.provider,
          onChange: p[0] || (p[0] = (h) => E("change", h))
        }, null, 8, ["tag", "schema", "config", "meta", "provider"])) : c("", !0),
        N.value ? (a(), r("div", nt, [
          p[2] || (p[2] = i("span", { class: "kx-tc-lbl" }, "Options", -1)),
          v(Z, {
            tag: "wc-schema-form",
            schema: g.value,
            config: A.config,
            onChange: p[1] || (p[1] = (h) => E("change", h))
          }, null, 8, ["schema", "config"])
        ])) : c("", !0)
      ], 2)) : c("", !0),
      j.value && C.value ? (a(), r("div", rt, [
        v(Z, {
          tag: j.value,
          config: C.value
        }, null, 8, ["tag", "config"])
      ])) : c("", !0)
    ], 64));
  }
}), st = {
  key: 0,
  class: "kx-tc-note",
  "aria-live": "polite"
}, ct = {
  key: 1,
  class: "kx-tc-warn",
  role: "alert",
  "data-test": "tc-load-error"
}, ut = {
  class: "kx-tc-field",
  "data-test": "tc-when"
}, pt = { class: "kx-tc-lbl" }, dt = {
  key: 0,
  class: "kx-tc-static",
  "data-test": "tc-when-locked"
}, vt = {
  key: 2,
  class: "kx-tc-desc"
}, ht = {
  key: 0,
  class: "kx-tc-note",
  "data-test": "tc-catalog-empty"
}, ft = {
  key: 1,
  class: "kx-tc-warn",
  role: "alert",
  "data-test": "tc-source-missing"
}, xt = {
  key: 2,
  class: "kx-tc-warn",
  role: "alert",
  "data-test": "tc-unsupported"
}, gt = {
  key: 1,
  class: "kx-tc-note",
  "data-test": "tc-live-note"
}, mt = { class: "kx-tc-lbl" }, kt = {
  key: 0,
  class: "kx-tc-static",
  "data-test": "tc-history-locked"
}, bt = {
  class: "kx-tc-hint",
  "data-test": "tc-history-hint"
}, wt = {
  key: 2,
  class: "kx-tc-sub"
}, yt = ["disabled"], zt = {
  key: 3,
  class: "kx-tc-sub"
}, Ct = ["disabled"], _t = ["open"], St = { class: "kx-tc-sub" }, Ot = ["disabled"], At = {
  key: 4,
  class: "kx-tc-gate",
  "data-test": "tc-gate",
  "aria-live": "polite"
}, x = "__schedule__", Et = /* @__PURE__ */ ge({
  __name: "TriggerConfig",
  setup(A) {
    const R = Re(), w = He();
    function E(e) {
      return R.value?.[e];
    }
    function u(e) {
      const t = E(e);
      return t === !0 || t === "true" || t === "";
    }
    function H(e) {
      const t = E(e);
      return typeof t == "string" ? t.split(",").map((s) => s.trim()).filter(Boolean) : [];
    }
    const I = o(() => u("disabled")), W = o(() => u("reconfigure")), g = o(() => I.value || W.value), N = o(() => {
      const e = H("allowed");
      return e.length ? e : ["timer", "source"];
    }), j = o(() => N.value.includes("timer")), C = o(() => N.value.includes("source")), P = o(() => H("sourceClasses")), p = d([]), h = d(!0), _ = d(""), n = d(""), S = d({}), M = d(null), T = d(""), we = o(() => {
      const e = E("historyDefault");
      return e === "none" || e === "all" ? e : null;
    }), l = d(null), B = d(null), D = d(""), K = d(!1), ye = o(() => C.value ? xe(p.value, P.value) : []), ze = o(() => xe(p.value)), m = o(() => n.value && n.value !== x && ze.value.find((e) => e.id === n.value) || null), Ce = o(() => !!n.value && n.value !== x && !m.value && !h.value && !_.value), ie = o(() => {
      const e = [];
      j.value && e.push({ id: x, title: "On a schedule", icon: "tabler:clock", group: "Schedule", subtitle: "Run at times you choose" });
      for (const t of ye.value)
        e.push({ id: t.id, title: t.title, icon: t.icon || "tabler:plug", group: t.group || "Sources", subtitle: t.description || t.provider });
      return e;
    }), _e = o(() => C.value && !h.value && !_.value && !n.value && !ie.value.length), y = o(() => {
      if (!n.value) return "none";
      if (n.value === x) return "timer";
      const e = m.value;
      return e ? e.hasTrigger ? "watch" : e.hasPull ? "poll" : "unsupported" : "none";
    }), ne = o(() => y.value === "timer" || y.value === "poll"), Se = o(() => y.value === "poll" || y.value === "watch"), re = o(() => y.value === "watch"), q = o(() => we.value), Oe = o(() => !!m.value && y.value !== "unsupported"), le = o(() => {
      const e = [
        { label: "All", value: "all" },
        { label: "Only new", value: "none" }
      ];
      return re.value || (e.push({ label: "Last N days", value: "last_days" }), e.push({ label: "Since a date", value: "since" })), e;
    }), Ae = o(() => n.value === x ? "On a schedule" : m.value?.title || n.value || "Not set"), Ee = o(() => le.value.find((e) => e.value === l.value)?.label || "Not set"), J = o(() => me(m.value)), Me = o(() => be(J.value, S.value));
    function Te() {
      if (!l.value) return null;
      if (l.value === "all") return "all";
      if (l.value === "none") return "none";
      if (l.value === "last_days") {
        const e = Math.floor(Number(B.value));
        return Number.isInteger(e) && e > 0 ? { last_days: e } : null;
      }
      return l.value === "since" && D.value ? { since: new Date(D.value).toISOString() } : null;
    }
    const G = d(null), Y = d(null);
    function se() {
      const e = { v: 2 }, t = M.value;
      if (n.value === x)
        return t && (e.schedule = t), e;
      e.source = n.value, Object.keys(S.value).length && (e.config = { ...S.value }), T.value.trim() && (e.filter = { expr: T.value.trim() }), ne.value && t && (e.schedule = t), y.value === "poll" && G.value && (e.poll = G.value), Y.value && (e.delivery = Y.value);
      const s = n.value !== x ? Te() : null;
      return s != null && (e.backfill = s), e;
    }
    function ce() {
      const e = se();
      if (!n.value) return { spec: e, valid: !1, error: "Pick when this runs." };
      const t = tt(e, p.value);
      return t.error ? { spec: e, valid: !1, error: t.error.message } : n.value !== x && J.value && !Me.value ? { spec: e, valid: !1, error: `${J.value.title || "Instance"} is required.` } : { spec: e, valid: !0 };
    }
    const Q = o(() => h.value ? null : ce()), ue = o(() => n.value === x ? Xe : m.value?.outputSchema);
    let X = "";
    function z() {
      const e = ce();
      ue.value !== void 0 && (e.output_schema = ue.value), X = oe(e.spec), w("change", e);
    }
    function pe(e) {
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
      n.value = t || x, S.value = typeof e.config == "object" && e.config && !Array.isArray(e.config) ? { ...e.config } : {};
      const s = e.schedule;
      if (s && typeof s == "object") {
        const k = String(s.type || ""), De = k === "once" || k === "interval" || k === "ticker" || k === "cron" ? k : ot, Ue = typeof s.expression == "string" ? s.expression : "";
        M.value = { type: De, expression: Ue };
      } else
        M.value = null;
      const L = e.poll;
      G.value = L && typeof L == "object" && !Array.isArray(L) ? L : null;
      const $ = e.delivery;
      Y.value = $ && typeof $ == "object" && !Array.isArray($) ? $ : null;
      const he = e.filter;
      T.value = typeof he?.expr == "string" ? he.expr : "", K.value = !!T.value;
      const V = e.backfill;
      if (V === "none") l.value = "none";
      else if (V === "all") l.value = "all";
      else if (V && typeof V == "object" && !Array.isArray(V)) {
        const k = V;
        typeof k.last_days == "number" ? (l.value = "last_days", B.value = k.last_days) : typeof k.since == "string" ? (l.value = "since", D.value = k.since.slice(0, 10)) : l.value = q.value;
      } else l.value = q.value;
    }
    Fe(() => R.value?.value, (e) => {
      const t = pe(e);
      t && oe(t) !== X && (de(t), X = oe(se()));
    });
    function Ve(e) {
      e !== n.value && (n.value = e, S.value = {}, T.value = "", l.value = q.value, M.value = null, z());
    }
    function Ie(e) {
      M.value = e, z();
    }
    function Ne(e) {
      e && typeof e == "object" && (S.value = { ...S.value, ...e }, z());
    }
    function je(e) {
      l.value = e, z();
    }
    async function ve() {
      h.value = !0, _.value = "";
      try {
        const { data: e } = await qe.get("/api/v1/automations/sources");
        p.value = e?.sources || [];
      } catch (e) {
        C.value && (_.value = Be(e, "could not load sources"), w("error", { message: _.value, error: e }));
      } finally {
        h.value = !1;
      }
    }
    function Pe() {
      ve().then(() => z());
    }
    return We(async () => {
      Ke(ke, { timeoutMs: 8e3 }).catch(() => {
      }), C.value ? await ve() : h.value = !1;
      const e = pe(E("value"));
      e ? de(e) : j.value && !C.value && (n.value = x, M.value = null), _.value || w("load", void 0), z();
    }), (e, t) => (a(), r("div", {
      class: F(["kx-tc", I.value && "kx-tc-off"])
    }, [
      h.value ? (a(), r("div", st, [
        v(f(b), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        t[4] || (t[4] = i("span", null, "Loading sources…", -1))
      ])) : _.value ? (a(), r("div", ct, [
        v(f(b), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        i("span", null, O(_.value), 1),
        i("button", {
          type: "button",
          class: "kx-tc-retry",
          onClick: Pe
        }, "Retry")
      ])) : (a(), r(ae, { key: 2 }, [
        i("div", ut, [
          i("span", pt, [
            v(f(b), {
              icon: "tabler:calendar-bolt",
              "aria-hidden": "true"
            }),
            t[5] || (t[5] = fe(" When", -1))
          ]),
          g.value ? (a(), r("p", dt, O(Ae.value), 1)) : (a(), U(Ze, {
            key: 1,
            items: ie.value,
            "model-value": n.value,
            placeholder: "Pick when this runs…",
            "aria-label": "When this runs",
            "onUpdate:modelValue": Ve
          }, null, 8, ["items", "model-value"])),
          m.value?.description ? (a(), r("p", vt, O(m.value.description), 1)) : c("", !0)
        ]),
        _e.value ? (a(), r("div", ht, [
          v(f(b), {
            icon: "tabler:plug-x",
            "aria-hidden": "true"
          }),
          t[6] || (t[6] = i("span", null, "No sources are available to trigger on yet.", -1))
        ])) : c("", !0),
        Ce.value ? (a(), r("div", ft, [
          v(f(b), {
            icon: "tabler:plug-x",
            "aria-hidden": "true"
          }),
          i("span", null, 'The source "' + O(n.value) + '" is not available. It may have been removed or you no longer have access to it.', 1)
        ])) : y.value === "unsupported" ? (a(), r("div", xt, [
          v(f(b), {
            icon: "tabler:plug-x",
            "aria-hidden": "true"
          }),
          t[7] || (t[7] = i("span", null, "This source can't start anything yet — it announces no events and can't be checked for items.", -1))
        ])) : (a(), r(ae, { key: 3 }, [
          m.value ? (a(), U(lt, {
            key: 0,
            source: m.value,
            config: S.value,
            locked: g.value,
            onChange: Ne
          }, null, 8, ["source", "config", "locked"])) : c("", !0),
          y.value === "watch" ? (a(), r("div", gt, [
            v(f(b), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            }),
            t[8] || (t[8] = i("span", null, "Runs on each incoming event — no schedule to set. Choose an explicit history boundary.", -1))
          ])) : c("", !0),
          ne.value ? (a(), U(et, {
            key: 2,
            "model-value": M.value,
            disabled: I.value,
            "onUpdate:modelValue": Ie
          }, null, 8, ["model-value", "disabled"])) : c("", !0),
          Se.value ? (a(), r("div", {
            key: 3,
            class: F(["kx-tc-field", g.value && "kx-tc-locked"]),
            "data-test": "tc-history"
          }, [
            i("span", mt, [
              v(f(b), {
                icon: "tabler:history",
                "aria-hidden": "true"
              }),
              t[9] || (t[9] = fe(" History", -1))
            ]),
            g.value ? (a(), r("p", kt, O(Ee.value), 1)) : (a(), U(f(at), {
              key: 1,
              class: "kx-tc-select",
              "data-test": "tc-history-kind",
              "model-value": l.value,
              options: le.value,
              "option-label": "label",
              "option-value": "value",
              "onUpdate:modelValue": je
            }, null, 8, ["model-value", "options"])),
            i("span", bt, O(re.value ? l.value === "all" ? "Replays this thread's history from the start, then continues live." : `How much of this thread's history to replay on the first run. "Only new" starts from now.` : `How much of the source's existing items to bring in on the first run. "Only new" starts from now.`), 1),
            l.value === "last_days" ? (a(), r("label", wt, [
              t[10] || (t[10] = i("span", { class: "kx-tc-lbl" }, "Days", -1)),
              ee(i("input", {
                "onUpdate:modelValue": t[0] || (t[0] = (s) => B.value = s),
                class: "kx-tc-input",
                "data-test": "tc-history-days",
                type: "number",
                disabled: g.value,
                onChange: z
              }, null, 40, yt), [
                [
                  te,
                  B.value,
                  void 0,
                  { number: !0 }
                ]
              ])
            ])) : c("", !0),
            l.value === "since" ? (a(), r("label", zt, [
              t[11] || (t[11] = i("span", { class: "kx-tc-lbl" }, "Since", -1)),
              ee(i("input", {
                "onUpdate:modelValue": t[1] || (t[1] = (s) => D.value = s),
                class: "kx-tc-input",
                "data-test": "tc-history-since",
                type: "date",
                disabled: g.value,
                onChange: z
              }, null, 40, Ct), [
                [te, D.value]
              ])
            ])) : c("", !0)
          ], 2)) : c("", !0),
          Oe.value ? (a(), r("details", {
            key: 4,
            class: "kx-tc-adv",
            open: K.value,
            onToggle: t[3] || (t[3] = (s) => K.value = s.target.open)
          }, [
            i("summary", null, [
              v(f(b), {
                class: "kx-tc-caret",
                icon: "tabler:chevron-right",
                "aria-hidden": "true"
              }),
              t[12] || (t[12] = i("span", null, "Advanced", -1))
            ]),
            i("div", {
              class: F(["kx-tc-adv-body", g.value && "kx-tc-locked"])
            }, [
              i("label", St, [
                t[13] || (t[13] = i("span", { class: "kx-tc-lbl" }, "Only when this matches", -1)),
                ee(i("textarea", {
                  "onUpdate:modelValue": t[2] || (t[2] = (s) => T.value = s),
                  class: "kx-tc-input kx-tc-textarea",
                  "data-test": "tc-expr",
                  rows: "2",
                  placeholder: "item.status == 'active'",
                  spellcheck: "false",
                  disabled: g.value,
                  onChange: z
                }, null, 40, Ot), [
                  [te, T.value]
                ]),
                t[14] || (t[14] = i("span", { class: "kx-tc-hint" }, "An expression over each incoming item; items that don't match are skipped.", -1))
              ])
            ], 2)
          ], 40, _t)) : c("", !0)
        ], 64)),
        Q.value && !Q.value.valid ? (a(), r("div", At, [
          v(f(b), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          i("span", null, O(Q.value.error), 1)
        ])) : c("", !0)
      ], 64))
    ], 2));
  }
}), Mt = '.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;font-size:13px;color:var(--p-text-color)}*,*:before,*:after{box-sizing:border-box}.kx-tc{display:flex;flex-direction:column;gap:16px;min-width:0}.kx-tc-field,.kx-tc-sub{min-width:0}.kx-tc-off{opacity:.6;pointer-events:none}.kx-tc-field{display:flex;flex-direction:column;gap:7px}.kx-tc-sub{display:flex;flex-direction:column;gap:5px;margin-top:8px}.kx-tc-lbl{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:650;letter-spacing:.02em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-tc-lbl svg{width:13px;height:13px;opacity:.85}.kx-tc-desc{margin:0;font-size:12px;line-height:1.45;color:var(--p-text-muted-color)}.kx-tc-hint{font-size:11px;line-height:1.45;color:var(--p-text-muted-color)}.kx-tc-input{width:100%;height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s,box-shadow .15s}.kx-tc-input:disabled{opacity:.6}.kx-tc-textarea{height:auto;min-height:56px;padding:8px 10px;line-height:1.45;resize:vertical;font-family:ui-monospace,monospace;font-size:12px}.kx-tc-code{font-family:ui-monospace,monospace;font-size:12px}.kx-tc-row{display:grid;grid-template-columns:max-content minmax(72px,96px) minmax(120px,1fr);align-items:center;gap:8px}.kx-tc-num,.kx-tc-unit{width:100%;min-width:0}.kx-tc-check{display:inline-flex;align-items:center;gap:8px;width:fit-content;font-size:12px;color:var(--p-text-color);cursor:pointer}.kx-tc-check input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:0;flex:none;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.kx-tc-check input:before{content:"";width:5px;height:9px;border:solid var(--p-button-primary-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.kx-tc-check input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.kx-tc-check input:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset)}.kx-tc-check input:checked:before{transform:rotate(45deg) scale(1)}.kx-tc-check input:disabled{opacity:.55;cursor:not-allowed}.kx-tc-check:has(input:disabled){cursor:not-allowed}.kx-tc-specific{display:grid;grid-template-columns:minmax(160px,1fr) minmax(112px,140px) minmax(112px,140px);gap:8px;align-items:start}.kx-tc-specific .kx-tc-sub{grid-column:1 / -1;margin-top:0}.kx-tc-select{width:100%;min-width:0}.kx-tc-locked{pointer-events:none;opacity:.6}.kx-tc-static{display:flex;align-items:center;min-height:36px;font-size:13px;color:var(--p-text-color)}.kx-tc-field[data-test=tc-instance]{gap:9px;padding:12px;border-radius:10px;border:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 2.5%,transparent)}.kx-tc-note{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.4;padding:8px 10px;border-radius:10px;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.kx-tc-note svg{width:15px;height:15px;flex:none}.kx-tc-note>span,.kx-tc-warn>span,.kx-tc-gate>span{min-width:0;flex:1}.kx-tc-warn{display:flex;align-items:center;flex-wrap:wrap;gap:7px;font-size:11.5px;line-height:1.4;padding:8px 10px;border-radius:10px;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-tc-warn svg{width:15px;height:15px;flex:none}.kx-tc-retry{margin-left:auto;padding:8px 10px;font:inherit;font-size:11.5px;font-weight:600;cursor:pointer;color:inherit;background:transparent;border:1px solid currentColor;border-radius:8px}.kx-tc-gate{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.4;color:var(--p-text-muted-color);padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--p-text-color) 4%,transparent)}.kx-tc-gate svg{width:15px;height:15px;flex:none}.kx-tc-opts{display:flex;flex-direction:column;gap:6px;margin-top:6px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-tc-detail{margin-top:2px}.kx-tc-adv summary{display:flex;align-items:center;gap:6px;cursor:pointer;list-style:none;font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.kx-tc-adv summary::-webkit-details-marker{display:none}.kx-tc-adv summary:hover{color:var(--p-text-color)}.kx-tc-caret{width:14px;height:14px;transition:transform .15s}.kx-tc-adv[open] .kx-tc-caret{transform:rotate(90deg)}.kx-tc-adv-body{margin-top:8px}@media(max-width:520px){.kx-tc-row,.kx-tc-specific{grid-template-columns:1fr}}', Tt = {
  type: "object",
  properties: {
    value: {
      type: "string",
      default: "",
      description: "Current Trigger Spec v2 as a JSON object string. Empty starts a fresh spec; non-empty seeds every section (edit mode)."
    },
    allowed: {
      type: "string",
      default: "timer,source",
      description: 'CSV of offered trigger families: "timer" (the "On a schedule" row) and/or "source" (the source catalog).'
    },
    "source-classes": {
      type: "string",
      default: "",
      description: "Optional CSV of source classes; when set, only bindings declaring one of these classes are offered."
    },
    "history-default": {
      type: "string",
      description: "Optional owner-provided initial History. Missing history is unready; the editor does not choose a replay boundary."
    },
    disabled: {
      type: "boolean",
      default: !1,
      description: "Disable all edits."
    },
    reconfigure: {
      type: "boolean",
      default: !1,
      description: "Editing an installed trigger: structural fields (source, instance, options, filter, history) render locked; cadence stays editable."
    }
  }
};
class Vt extends Le {
  static get wippyConfig() {
    return {
      propsSchema: Tt,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Mt
    };
  }
  static get vueConfig() {
    return { rootComponent: Et, plugins: [$e] };
  }
}
Je(import.meta.url, Vt);
//# sourceMappingURL=trigger_config.js.map

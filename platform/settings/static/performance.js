import { u as be, W as _e, s as ge } from "./styles-DUWI6o6L.js";
import { s as ee, P as we } from "./index-GXCRJfhs.js";
import { defineComponent as xe, ref as b, computed as j, onUnmounted as Ne, openBlock as u, createElementBlock as d, createElementVNode as a, createVNode as Q, createCommentVNode as y, toDisplayString as f, createTextVNode as C, unref as m, Fragment as L, renderList as P, normalizeClass as se, createBlock as Me, normalizeStyle as $e } from "vue";
import { Icon as Se } from "@iconify/vue";
import { _ as je } from "./SettingsToolbar.vue_vue_type_script_setup_true_lang-BAMz974F.js";
import { on as te, api as ae, define as Ce } from "@wippy-fe/proxy";
const le = [
  { title: "Workers", help: "Balance throughput with database and provider capacity.", fields: [
    { key: "worker.count_postgres", title: "Postgres workers", help: "Jobs that can execute together on Postgres. Higher counts use more connections and provider capacity.", unit: "workers", min: 1, max: 256 },
    { key: "worker.count_sqlite", title: "SQLite workers", help: "Jobs that can execute together on SQLite. Its write concurrency keeps this pool small.", unit: "workers", min: 1, max: 2 },
    { key: "worker.awaited_slots", title: "Awaited slots", help: "Extra slots reserved for jobs other jobs wait for, so waiting work can keep moving.", unit: "slots", min: 1, max: 256 }
  ] },
  { title: "Claiming and fairness", help: "Choose how the next available slots pick up work.", fields: [
    { key: "worker.claim_batch", title: "Claim batch", help: "Maximum jobs claimed in one database transaction. Smaller batches keep transactions short.", unit: "jobs", min: 1, max: 256 },
    { key: "fairness.shares", title: "Queue shares", help: "Relative turns for each tier when all tiers have work. Unused turns are available to other tiers.", unit: "shares", min: 0, max: 1e3 }
  ] },
  { title: "Leases and retries", help: "Lease changes apply to new executions. Active executions retain their lease timing.", fields: [
    { key: "lease.timeout", title: "Lease timeout", help: "How long a claimed job stays owned without renewal. Use whole seconds, at least 1s.", unit: "duration · e.g. 45s" },
    { key: "lease.heartbeat", title: "Lease heartbeat", help: "Time between renewals. Must be positive and shorter than the lease timeout.", unit: "duration · e.g. 10s" },
    { key: "retry.max_attempts", title: "Maximum attempts", help: "Attempt limit for newly enqueued one-shot jobs. Existing jobs retain their attempt limit.", unit: "attempts", min: 1, max: 1e6 },
    { key: "retry.retry_after_ms", title: "Initial retry delay", help: "Minimum delay before retrying a failed one-shot job.", unit: "duration · e.g. 1s", durationMilliseconds: !0, min: 1, max: 864e5 },
    { key: "retry.max_delay_ms", title: "Maximum retry delay", help: "Cap on exponential retry delay. A provider’s explicit retry delay may be longer.", unit: "duration · e.g. 15m", durationMilliseconds: !0, min: 1e3, max: 864e5 }
  ] },
  { title: "Execution limits", help: "Keep each execution bounded while allowing enough time for useful work.", fields: [
    { key: "proc.max_execution", title: "Maximum execution time", help: "Default time limit for subsequent executions. A job’s declared execution limit takes precedence.", unit: "duration · e.g. 60m" }
  ] }
], $ = le.flatMap((i) => i.fields), S = ["live", "backfill", "maintenance"], W = (i) => i.charAt(0).toUpperCase() + i.slice(1), _ = (i) => i.replaceAll(".", "-"), Ee = (i, r) => JSON.stringify(i) === JSON.stringify(r);
function E(i) {
  const r = String(i), p = r.startsWith("-"), l = /^[+-]/.test(r) ? r.slice(1) : r;
  if (/^\d+d$/.test(l)) {
    if (r !== l) return NaN;
    const k = Number(l.slice(0, -1));
    return k <= 36500 ? k * 864e5 : NaN;
  }
  const o = [...l.matchAll(/((?:\d+(?:\.\d*)?|\.\d+))(ns|us|µs|µs|μs|ms|s|m|h)/g)];
  if (!o.length || o.map((k) => k[0]).join("") !== l) return NaN;
  const v = { ns: 1e-6, us: 1e-3, µs: 1e-3, μs: 1e-3, ms: 1, s: 1e3, m: 6e4, h: 36e5 }, h = o.reduce((k, g) => k + Number(g[1]) * v[g[2]], 0), x = Math.round(h);
  return p ? -h : Math.abs(h - x) <= Number.EPSILON * Math.max(1, h) * 2 ? x : h;
}
function z(i) {
  for (const [r, p] of [["d", 864e5], ["h", 36e5], ["m", 6e4], ["s", 1e3]])
    if (i >= p && i % p === 0) return `${i / p}${r}`;
  return i >= 1e3 ? `${i / 1e3}s` : `${i}ms`;
}
function Ae(i, r) {
  return i.durationMilliseconds ? z(Number(r)) : r;
}
function ie(i, r) {
  return i.durationMilliseconds ? E(r) : r;
}
function ne(i) {
  return i.durationMilliseconds ? `${z(i.min)}–${z(i.max)}` : i.min === void 0 ? "Positive duration" : `${i.min}–${i.max} ${i.unit}${i.key === "fairness.shares" ? " per tier; total above zero" : ""}`;
}
function Ie(i) {
  const r = {};
  for (const l of $) {
    const o = i[l.key];
    if (l.key === "fairness.shares")
      (S.some((v) => !Number.isInteger(o?.[v]) || o[v] < 0 || o[v] > 1e3) || S.reduce((v, h) => v + (o?.[h] || 0), 0) === 0) && (r[l.key] = "Use whole shares from 0–1000; at least one tier needs a share.");
    else if (l.durationMilliseconds) {
      const v = E(o);
      (!Number.isInteger(v) || v < l.min || v > l.max) && (r[l.key] = `Enter a duration from ${ne(l)}, in whole milliseconds.`);
    } else l.min !== void 0 ? (!Number.isInteger(o) || o < l.min || o > l.max) && (r[l.key] = `Use a whole number from ${l.min}–${l.max}.`) : (!Number.isFinite(E(o)) || E(o) < 1) && (r[l.key] = "Enter a positive duration, such as 10s or 5m.");
  }
  const p = E(i["lease.timeout"]);
  return (p < 1e3 || p % 1e3 !== 0) && (r["lease.timeout"] = "Use whole seconds, at least 1s."), E(i["lease.heartbeat"]) >= p && (r["lease.heartbeat"] = "Heartbeat must be shorter than the lease timeout."), r;
}
const Le = { class: "ap perf" }, Pe = { class: "ap-body" }, Ve = {
  key: 0,
  class: "ap-hint",
  role: "status"
}, Oe = {
  key: 1,
  class: "ap-msg ap-err",
  role: "alert"
}, Ue = {
  key: 2,
  class: "ap-msg ap-err",
  role: "alert"
}, Re = {
  key: 3,
  class: "ap-msg ap-err",
  role: "alert"
}, We = {
  key: 4,
  class: "ap-loading",
  role: "status"
}, qe = {
  key: 5,
  class: "ap-cards"
}, De = {
  class: "ap-card perf-status",
  "aria-label": "Live job pool status"
}, He = { class: "ap-h" }, Je = {
  key: 0,
  class: "ks-tag kx-tag-caps"
}, Be = { class: "perf-status-grid" }, Te = { class: "perf-capacity" }, Qe = { class: "perf-stat-values" }, ze = { class: "perf-stat-title" }, Fe = { class: "perf-stat-values" }, Ke = { class: "ap-hint perf-capacity-summary" }, Ge = { key: 0 }, Xe = { class: "ap-h" }, Ye = { class: "ap-sub" }, Ze = ["data-policy-key"], es = { class: "perf-description" }, ss = { class: "perf-field-title" }, ts = ["id"], as = ["for"], is = ["data-source"], ls = ["id"], ns = ["id"], rs = {
  key: 0,
  class: "ap-hint perf-unused-note"
}, os = {
  key: 2,
  class: "ap-hint"
}, us = ["aria-labelledby", "aria-describedby"], ds = ["aria-label"], cs = { class: "perf-share-inputs" }, ps = ["for"], fs = ["id", "aria-label", "value", "disabled", "aria-invalid", "aria-describedby", "onInput"], ms = ["id"], vs = {
  key: 1,
  class: "perf-value"
}, hs = { class: "perf-input-unit" }, ys = ["id", "type", "min", "max", "value", "disabled", "aria-invalid", "aria-describedby", "onInput"], ks = ["id"], bs = /* @__PURE__ */ xe({
  __name: "performance",
  setup(i) {
    const r = b({}), p = b({}), l = b(/* @__PURE__ */ new Set()), o = b(null), v = b(!0), h = b(!1), x = b(""), k = b(""), g = b(!1), M = b(!1), q = b(-1), F = j(() => g.value && (o.value?.applied_revision ?? -1) < q.value);
    let A = null, I = !1, V = 0, N = !1;
    const K = (e) => e === void 0 ? e : JSON.parse(JSON.stringify(e)), G = (e) => $.find((s) => s.key === e), O = (e, s) => K(Ae(G(e), s)), D = (e) => g.value && (l.value.has(e) || !Ee(ie(G(e), p.value[e]), r.value[e]?.value)), U = (e) => !!o.value?.database && e.startsWith("worker.count_") && e !== `worker.count_${o.value.database}`, re = j(() => le.map((e) => {
      if (e.title !== "Workers") return e;
      const s = e.fields.filter((n) => n.key.startsWith("worker.count_"));
      return s.sort((n, t) => Number(U(n.key)) - Number(U(t.key))), { ...e, fields: [...s, ...e.fields.filter((n) => !n.key.startsWith("worker.count_"))] };
    })), X = j(() => $.some((e) => D(e.key))), w = j(() => v.value ? {} : Ie(p.value)), oe = (e) => l.value.has(e) ? "Reset on save" : { default: "Default", host: "Host", admin: "Admin" }[r.value[e]?.source] || "", ue = j(() => S.reduce((e, s) => e + Math.max(0, Number(p.value["fairness.shares"]?.[s]) || 0), 0)), H = (e) => Math.max(0, Number(p.value["fairness.shares"]?.[e]) || 0) / Math.max(1, ue.value) * 100, de = j(() => S.map((e) => `${W(e)} ${Math.round(H(e))}%`).join(", "));
    function Y(e) {
      return e?.response?.data;
    }
    function Z(e) {
      const s = Y(e), n = s?.error || s?.message || (e instanceof Error ? e.message : String(e));
      return s?.committed ? `Settings are saved; owner notification failed: ${n}` : n;
    }
    function J(e, s, n) {
      if (!(typeof n == "number" && n < q.value)) {
        typeof n == "number" && (q.value = n);
        for (const t of $) {
          const c = t.key;
          (!s || !D(c)) && (p.value[c] = O(c, e[c].value)), s && l.value.has(c) && (p.value[c] = O(c, e[c].fallback));
        }
        r.value = e, g.value = !0;
      }
    }
    function B(e) {
      return !!e && $.every((s) => e[s.key]);
    }
    function R() {
      return A ? (I = !0, A) : (A = (async () => {
        do {
          I = !1;
          try {
            const e = V, { data: s } = await ae.get("/api/v1/settings/performance");
            if (N) return;
            if (V !== e) {
              I = !0;
              continue;
            }
            if (!s?.success || !B(s.fields) || !s.pool) throw new Error(s?.error || "Could not load performance settings.");
            J(s.fields, !0, s.revision), o.value = s.pool, F.value || (x.value = ""), k.value = "";
          } catch (e) {
            N || (k.value = Z(e));
          } finally {
            N || (v.value = !1);
          }
        } while (I && !N);
      })().finally(() => {
        A = null;
      }), A);
    }
    const T = (e) => [_(e) + "-help", _(e) + "-bounds", w.value[e] ? _(e) + "-error" : ""].filter(Boolean).join(" ");
    function ce(e, s) {
      l.value.delete(e.key);
      const n = s.target.value;
      p.value[e.key] = e.min === void 0 || e.durationMilliseconds ? n : n === "" ? null : Number(n), M.value = !1;
    }
    function pe(e, s) {
      l.value.delete("fairness.shares");
      const n = s.target.value;
      p.value["fairness.shares"][e] = n === "" ? null : Number(n), M.value = !1;
    }
    function fe(e) {
      p.value[e] = O(e, r.value[e].fallback), l.value.add(e), M.value = !1;
    }
    function me() {
      if (g.value) {
        for (const e of $) p.value[e.key] = O(e.key, r.value[e.key].value);
        l.value.clear(), M.value = !1;
      }
    }
    async function ve() {
      if (!g.value || h.value || Object.keys(w.value).length || !X.value) return;
      h.value = !0, x.value = "";
      const e = {};
      for (const s of $) D(s.key) && !l.value.has(s.key) && (e[s.key] = K(ie(s, p.value[s.key])));
      try {
        const { data: s } = await ae.put("/api/v1/settings/performance", { values: e, unset: [...l.value] });
        if (N) return;
        if (!s?.success) throw { response: { data: s } };
        if (!B(s.fields)) throw new Error("The save response has no policy fields.");
        l.value.clear(), V++, J(s.fields, !1, s.revision), M.value = !0;
      } catch (s) {
        if (!N) {
          const n = Y(s);
          n?.committed && B(n.fields) && (l.value.clear(), V++, J(n.fields, !1, n.revision)), x.value = Z(s), M.value = !1;
        }
      } finally {
        N || (h.value = !1);
      }
    }
    const he = te("kickside.jobs.performance.changed", () => {
      R();
    }), ye = te("kickside.jobs.policy.changed", () => {
      R();
    });
    return be(R), Ne(() => {
      N = !0, I = !1, he(), ye();
    }), (e, s) => (u(), d("div", Le, [
      a("div", Pe, [
        Q(je, {
          dirty: X.value,
          saving: h.value,
          disabled: !g.value,
          invalid: !!Object.keys(w.value).length,
          saved: M.value,
          onDiscard: me,
          onSave: ve
        }, null, 8, ["dirty", "saving", "disabled", "invalid", "saved"]),
        F.value ? (u(), d("p", Ve, "Applying…")) : y("", !0),
        o.value?.apply_error ? (u(), d("div", Oe, f(o.value.apply_error.message), 1)) : y("", !0),
        x.value ? (u(), d("div", Ue, f(x.value), 1)) : y("", !0),
        k.value ? (u(), d("div", Re, [
          C(f(k.value) + " ", 1),
          Q(m(ee), {
            label: "Reload",
            text: "",
            onClick: R
          })
        ])) : y("", !0),
        v.value ? (u(), d("div", We, "Loading performance settings…")) : o.value ? (u(), d("div", qe, [
          a("section", De, [
            a("header", He, [
              Q(m(Se), {
                icon: "tabler:activity",
                "aria-hidden": "true"
              }),
              s[0] || (s[0] = C(" Job pool ", -1)),
              o.value.database ? (u(), d("span", Je, f(o.value.database === "postgres" ? "Postgres" : "SQLite"), 1)) : y("", !0)
            ]),
            s[6] || (s[6] = a("p", { class: "ap-sub" }, "Tune job throughput, queue fairness and execution limits.", -1)),
            a("div", Be, [
              a("div", Te, [
                s[3] || (s[3] = a("h3", { class: "perf-stat-title" }, "Slots", -1)),
                a("div", Qe, [
                  a("span", null, [
                    a("strong", null, f(o.value.busy), 1),
                    s[1] || (s[1] = C(" busy", -1))
                  ]),
                  a("span", null, [
                    a("strong", null, f(o.value.idle), 1),
                    s[2] || (s[2] = C(" idle", -1))
                  ])
                ])
              ]),
              (u(!0), d(L, null, P(m(S), (n) => (u(), d("div", {
                key: n,
                class: "perf-tier"
              }, [
                a("h3", ze, f(m(W)(n)), 1),
                a("dl", Fe, [
                  a("div", null, [
                    s[4] || (s[4] = a("dt", {
                      title: "Includes scheduled pending jobs",
                      "aria-description": "Includes scheduled pending jobs"
                    }, "Queued", -1)),
                    a("dd", null, f(o.value.queued[n] || 0), 1)
                  ]),
                  a("div", null, [
                    s[5] || (s[5] = a("dt", null, "Running", -1)),
                    a("dd", null, f(o.value.running[n] || 0), 1)
                  ])
                ])
              ]))), 128))
            ]),
            a("p", Ke, [
              C(f(o.value.total) + " total slots · " + f(o.value.awaited) + " reserved for awaited work", 1),
              o.value.applied_revision < 0 ? (u(), d("span", Ge, " · Awaiting pool startup")) : y("", !0)
            ])
          ]),
          (u(!0), d(L, null, P(re.value, (n) => (u(), d("section", {
            key: n.title,
            class: "ap-card"
          }, [
            a("h2", Xe, f(n.title), 1),
            a("p", Ye, f(n.help), 1),
            (u(!0), d(L, null, P(n.fields, (t) => (u(), d("div", {
              key: t.key,
              class: se(["perf-field", { "perf-field-unused": U(t.key) }]),
              "data-policy-key": t.key
            }, [
              a("div", es, [
                a("div", ss, [
                  t.key === "fairness.shares" ? (u(), d("span", {
                    key: 0,
                    id: m(_)(t.key)
                  }, f(t.title), 9, ts)) : (u(), d("label", {
                    key: 1,
                    for: m(_)(t.key)
                  }, f(t.title), 9, as)),
                  a("span", {
                    class: "ks-tag kx-tag-caps",
                    "data-source": r.value[t.key]?.source
                  }, f(oe(t.key)), 9, is)
                ]),
                a("p", {
                  id: m(_)(t.key) + "-help",
                  class: "ap-hint"
                }, f(t.help), 9, ls),
                a("p", {
                  id: m(_)(t.key) + "-bounds",
                  class: "perf-bounds"
                }, f(m(ne)(t)), 9, ns),
                U(t.key) ? (u(), d("p", rs, "Not used by this installation.")) : y("", !0),
                r.value[t.key]?.source === "admin" && !l.value.has(t.key) ? (u(), Me(m(ee), {
                  key: 1,
                  "aria-label": `Reset ${t.title} to default`,
                  label: "Reset to default",
                  class: "perf-reset",
                  text: "",
                  severity: "secondary",
                  disabled: h.value,
                  onClick: (c) => fe(t.key)
                }, null, 8, ["aria-label", "disabled", "onClick"])) : y("", !0),
                l.value.has(t.key) ? (u(), d("p", os, "Removes the Admin override on save. Host configuration takes precedence over the Default.")) : y("", !0)
              ]),
              t.key === "fairness.shares" ? (u(), d("div", {
                key: 0,
                class: "perf-fairness",
                role: "group",
                "aria-labelledby": m(_)(t.key),
                "aria-describedby": T(t.key)
              }, [
                a("div", {
                  class: "perf-share-bar",
                  role: "img",
                  "aria-label": de.value
                }, [
                  (u(!0), d(L, null, P(m(S), (c) => (u(), d("span", {
                    key: c,
                    class: se(`perf-share-${c}`),
                    style: $e({ width: H(c) + "%" })
                  }, null, 6))), 128))
                ], 8, ds),
                a("div", cs, [
                  (u(!0), d(L, null, P(m(S), (c) => (u(), d("div", { key: c }, [
                    a("label", {
                      for: `share-${c}`
                    }, [
                      C(f(m(W)(c)) + " ", 1),
                      a("span", null, f(Math.round(H(c))) + "%", 1)
                    ], 8, ps),
                    a("input", {
                      id: `share-${c}`,
                      class: "ks-input kx-focus-halo",
                      type: "number",
                      min: "0",
                      max: "1000",
                      step: "1",
                      "aria-label": `${m(W)(c)} shares`,
                      value: p.value[t.key]?.[c],
                      disabled: h.value,
                      "aria-invalid": !!w.value[t.key],
                      "aria-describedby": T(t.key),
                      onInput: (ke) => pe(c, ke)
                    }, null, 40, fs)
                  ]))), 128))
                ]),
                w.value[t.key] ? (u(), d("p", {
                  key: 0,
                  id: m(_)(t.key) + "-error",
                  class: "perf-invalid",
                  role: "alert"
                }, f(w.value[t.key]), 9, ms)) : y("", !0)
              ], 8, us)) : (u(), d("div", vs, [
                a("div", hs, [
                  a("input", {
                    id: m(_)(t.key),
                    class: "ks-input kx-focus-halo",
                    type: t.min === void 0 || t.durationMilliseconds ? "text" : "number",
                    min: t.durationMilliseconds ? void 0 : t.min,
                    max: t.durationMilliseconds ? void 0 : t.max,
                    step: "1",
                    value: p.value[t.key],
                    disabled: h.value,
                    "aria-invalid": !!w.value[t.key],
                    "aria-describedby": T(t.key),
                    onInput: (c) => ce(t, c)
                  }, null, 40, ys),
                  a("span", null, f(t.unit), 1)
                ]),
                w.value[t.key] ? (u(), d("p", {
                  key: 0,
                  id: m(_)(t.key) + "-error",
                  class: "perf-invalid",
                  role: "alert"
                }, f(w.value[t.key]), 9, ks)) : y("", !0)
              ]))
            ], 10, Ze))), 128))
          ]))), 128)),
          s[7] || (s[7] = a("p", { class: "ap-hint" }, "Reducing workers lets active executions finish before their slots retire. Changes apply without a restart.", -1))
        ])) : y("", !0)
      ])
    ]));
  }
}), _s = { type: "object", properties: { config: { type: "object" } } };
class gs extends _e {
  static get wippyConfig() {
    return {
      propsSchema: _s,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ge
    };
  }
  static get vueConfig() {
    return { rootComponent: bs, plugins: [we] };
  }
}
Ce(import.meta.url, gs);
//# sourceMappingURL=performance.js.map

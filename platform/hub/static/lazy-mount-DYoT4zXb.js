import { P as Vn } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as Ot, ref as A, watch as Ne, nextTick as Gt, onBeforeUnmount as Mn, openBlock as n, createElementBlock as a, normalizeStyle as Et, renderSlot as Qt, createCommentVNode as c, computed as N, onUnmounted as gn, onMounted as hn, createElementVNode as t, normalizeClass as ne, createVNode as u, unref as e, withCtx as X, createTextVNode as _, useId as Nn, Fragment as J, toDisplayString as i, withDirectives as lt, vModelText as Xt, renderList as ie, resolveComponent as An, createBlock as Ce, vShow as Ft, vModelCheckbox as Pn, isRef as _t, withKeys as qn, withModifiers as un } from "vue";
import { Icon as k } from "@iconify/vue";
import le from "primevue/button";
import Bn from "primevue/dialog";
import dn from "primevue/select";
import { m as Wt, r as it, a as tn, b as qt, c as nn, K as Lt, d as bn, e as Ie, f as vn, i as _n, g as wn, h as On, j as sn, s as zn, k as Hn, l as Fn, n as jn, o as Kn, p as Un, q as Bt, t as Yt, u as Tn, v as Gn, w as en, x as ae, y as Wn, z as Yn, A as Jn, B as Zn, C as Qn, D as jt, E as Jt, F as an, G as Kt } from "./requiredSetup-CKaPvMvx.js";
import { api as yn, loadByTagName as En, host as Ln, on as Xn } from "@wippy-fe/proxy";
import { a as es } from "./wc-runtime-BMe_f3Uc.js";
const ts = 2e3;
function $n(o) {
  const $ = o.margin ?? 8, r = o.gap ?? 4, L = Math.max(0, o.viewportWidth), s = Math.max(0, o.viewportHeight), G = Math.max(0, L - $ * 2), S = Math.min(Math.max(0, o.requestedWidth), G), E = o.align === "right" ? o.anchor.right - S : o.anchor.left, M = Math.max($, Math.min(E, L - $ - S)), P = Math.max(0, s - o.anchor.bottom - r - $), B = Math.max(0, o.anchor.top - r - $), D = P < o.requestedMaxHeight && B > P ? "above" : "below", z = D === "above" ? B : P, K = Math.round(Math.min(Math.max(0, o.requestedMaxHeight), z)), V = Math.min(Math.max(0, o.panelHeight ?? K), K), W = D === "above" ? o.anchor.top - r - V : o.anchor.bottom + r, T = o.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(M - T.left),
    width: Math.round(S),
    maxHeight: K,
    side: D,
    top: Math.round(W - T.top)
  };
}
const Dn = /* @__PURE__ */ Ot({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: ts }
  },
  emits: ["update:open"],
  setup(o, { emit: $ }) {
    const r = o, L = $, s = A(null), G = A({ position: "fixed", visibility: "hidden" });
    function S() {
      const W = r.anchor, T = s.value;
      if (!W || !T) return;
      const H = W.getBoundingClientRect(), q = r.width === "anchor" ? Math.max(r.minWidth, H.width) : Math.max(r.minWidth, r.width), x = {
        anchor: H,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: q,
        requestedMaxHeight: r.maxHeight,
        align: r.align,
        gap: r.gap
      }, F = $n(x);
      Object.assign(T.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${F.width}px`,
        maxHeight: `${F.maxHeight}px`,
        visibility: "hidden"
      });
      const l = T.getBoundingClientRect(), Q = $n({
        ...x,
        containingBlockOrigin: { left: l.left, top: l.top },
        panelHeight: l.height
      }), d = {
        position: "fixed",
        left: `${Q.left}px`,
        top: `${Q.top}px`,
        width: `${Q.width}px`,
        maxHeight: `${Q.maxHeight}px`,
        "--anchored-panel-available-height": `${Q.maxHeight}px`,
        margin: "0",
        zIndex: String(r.zIndex),
        visibility: "visible"
      };
      G.value = d;
    }
    let E = null, M = !1;
    function P() {
      M || !r.open || (M = !0, requestAnimationFrame(() => {
        M = !1, r.open && S();
      }));
    }
    function B() {
      typeof ResizeObserver > "u" || (E = new ResizeObserver(P), s.value && E.observe(s.value), r.anchor && E.observe(r.anchor));
    }
    function D() {
      E?.disconnect(), E = null, M = !1;
    }
    Ne(() => r.open, async (W) => {
      D(), W && (G.value = { position: "fixed", visibility: "hidden" }, await Gt(), S(), B());
    }, { immediate: !0 });
    function z(W) {
      if (!r.open) return;
      const T = W.composedPath();
      s.value && T.includes(s.value) || r.anchor && T.includes(r.anchor) || L("update:open", !1);
    }
    function K(W) {
      !r.open || W.key !== "Escape" || (W.preventDefault(), W.stopImmediatePropagation(), L("update:open", !1));
    }
    function V() {
      r.open && S();
    }
    return document.addEventListener("click", z), document.addEventListener("keydown", K, !0), window.addEventListener("resize", V), window.addEventListener("scroll", V, !0), Mn(() => {
      D(), document.removeEventListener("click", z), document.removeEventListener("keydown", K, !0), window.removeEventListener("resize", V), window.removeEventListener("scroll", V, !0);
    }), (W, T) => o.open ? (n(), a("div", {
      key: 0,
      ref_key: "panel",
      ref: s,
      class: "anchored-panel",
      style: Et(G.value)
    }, [
      Qt(W.$slots, "default")
    ], 4)) : c("", !0);
  }
});
function ns(o) {
  if (!o) return null;
  let $;
  if (typeof o == "number")
    $ = o;
  else {
    const r = o.trim();
    if (/^\d+$/.test(r))
      $ = Number(r);
    else {
      const L = Date.parse(r);
      return Number.isNaN(L) ? null : L;
    }
  }
  return Number.isFinite($) ? $ < 1e12 ? $ * 1e3 : $ : null;
}
function ln(o, $) {
  const r = ns(o);
  if (r === null) return "";
  const L = $?.now ?? Date.now(), s = $?.suffix ?? !0, G = $?.maxUnit ?? "day", S = $?.future ?? !1, E = 6e4, M = 60 * E, P = 24 * M, B = 30 * P, D = 365 * P, z = L - r;
  if (S && z < 0) {
    const W = -z;
    return W < E ? "in <1m" : W < M ? `in ${Math.floor(W / E)}m` : W < P ? `in ${Math.floor(W / M)}h` : `in ${Math.floor(W / P)}d`;
  }
  const K = Math.max(0, z);
  if (K < E) return "just now";
  const V = s ? " ago" : "";
  return K < M ? `${Math.floor(K / E)}m${V}` : K < P ? `${Math.floor(K / M)}h${V}` : G === "year" ? K < B ? `${Math.floor(K / P)}d${V}` : K < D ? `${Math.floor(K / B)}mo${V}` : `${Math.floor(K / D)}y${V}` : `${Math.floor(K / P)}d${V}`;
}
const pn = {
  tool: { label: "Tools", icon: "tabler:tool" },
  "agent.trait": { label: "Agent capabilities", icon: "tabler:robot" },
  "contract.binding": { label: "Contract bindings", icon: "tabler:plug-connected" },
  "contract.definition": { label: "Contracts", icon: "tabler:file-description" },
  "view.page": { label: "Pages", icon: "tabler:browser" },
  "view.component": { label: "Components", icon: "tabler:components" }
};
function ss(o) {
  const $ = o.meta?.type || "";
  return $ && pn[$] ? $ : o.kind;
}
function as(o) {
  return String(o.id).split(":").pop() || o.id;
}
function ls(o) {
  const $ = o.meta || {};
  return String($.comment || $.title || "");
}
function is(o, $) {
  return String(o.meta?.icon || $);
}
function We(o, $) {
  const r = $ instanceof Error ? $.message : String($);
  console.error(`[${o}]`, r, $);
}
function kn() {
  window.dispatchEvent(new CustomEvent("kickside:modules-changed")), window.dispatchEvent(new CustomEvent("kickside:nav-changed"));
}
function os(o) {
  const $ = /* @__PURE__ */ new Map();
  for (const r of o.dependencies || []) {
    const L = String(r.component || r.name || r.id || "");
    L && $.set(L, {
      ...r,
      dependencyId: r.id,
      component: L,
      is_root: r.is_root ?? !0,
      used_by: r.used_by || [],
      used_by_count: r.used_by_count || 0,
      source: r.source || "hub"
    });
  }
  for (const r of o.modules || []) {
    const L = String(r.name || "");
    if (!L) continue;
    const s = $.get(L);
    if (s)
      $.set(L, {
        ...s,
        version: s.version || r.version || "",
        is_root: s.is_root ?? r.is_root ?? !r.transitive,
        used_by: s.used_by || r.used_by || [],
        used_by_count: s.used_by_count ?? r.used_by_count ?? 0,
        source: s.source || r.source || "hub"
      });
    else {
      const G = r.used_by || [], S = r.used_by_count || G.length || 0;
      if (r.is_root !== !0 && r.transitive === !0 && S === 0) continue;
      const E = L.split("/");
      $.set(L, {
        id: L,
        namespace: E.length > 1 ? E[0] : "",
        name: E[E.length - 1] || L,
        component: L,
        version: r.version || "",
        is_root: r.is_root ?? !r.transitive,
        used_by: G,
        used_by_count: S,
        source: r.source || "local"
      });
    }
  }
  return Array.from($.values()).filter((r) => r.installed !== !1);
}
function Sn(o) {
  const $ = o.migrations || [];
  if ($.length === 0) return "";
  const r = $.filter((G) => G.status === "applied").length, L = $.filter((G) => G.status === "pending").length, s = [];
  return r > 0 && s.push(`${r} applied`), L > 0 && s.push(`${L} pending`), s.join(", ") || `${$.length} migrations`;
}
function rs({ hub: o, installed: $, catalog: r, installedDepFor: L, installedCanUpdate: s, installedUpdateDisabledReason: G, installedCanUninstall: S, installedIsPrivate: E }) {
  const M = A(null), P = A(null), B = A(""), D = A([]), z = A(!1), K = A("readme"), V = A([]), W = N(() => D.value.filter((b) => b.kind === "env.variable")), T = N(() => D.value.filter((b) => b.kind === "ns.requirement")), H = N(() => {
    const b = {};
    for (const R of D.value) {
      if (R.kind === "env.variable" || R.kind === "ns.requirement") continue;
      const Z = ss(R);
      (b[Z] ||= []).push(R);
    }
    return Object.entries(b).map(([R, Z]) => ({
      key: R,
      label: pn[R]?.label || R,
      icon: pn[R]?.icon || "tabler:point",
      items: Z
    })).sort((R, Z) => Z.items.length - R.items.length);
  }), q = N(() => V.value.find((b) => b.version === M.value?.version) || V.value[0]), x = N(() => M.value ? L(M.value.component) : void 0), F = N(() => !!(x.value && s(x.value))), l = N(() => x.value && !s(x.value) ? G(x.value) : ""), Q = N(() => !!(x.value && S(x.value))), d = N(() => Wt(P.value) || !!(x.value && E(x.value)));
  async function f(b) {
    try {
      const R = $.value.find((se) => se.component === b);
      return R?.entries ? R.entries : ((await o.listDependencies({ component: b, includeMigrations: !1 })).dependencies || []).find((se) => se.component === b)?.entries || [];
    } catch (R) {
      return We("modules:entries", R), [];
    }
  }
  async function w(b, R) {
    if (R && R.full_name) return R;
    const Z = r.value.find((ee) => nn(ee, b));
    if (Z) return Z;
    try {
      const ee = b.split("/").pop() || b, me = ((await o.browseModules({ query: ee, pageSize: 50 })).items || []).find((Ye) => nn(Ye, b));
      if (me) return me;
    } catch {
    }
    return { full_name: b, component: b, latest_version: "", type: "library" };
  }
  async function de(b) {
    const R = "component" in b && typeof b.component == "string" && !("full_name" in b) ? b.component : tn(b), Z = L(R), ee = "full_name" in b ? b : void 0;
    M.value = {
      component: R,
      label: ee ? qt(ee) : R,
      description: ee?.description || "",
      version: Z ? it(Z) : String(ee?.latest_version || ""),
      installed: !!Z,
      installedId: Z?.id
    }, P.value = ee || null, B.value = "", D.value = [], V.value = [], K.value = "readme", z.value = !0;
    try {
      const [se, me, Ye, ge] = await Promise.all([
        w(R, ee),
        o.getReadme(R).then((Pe) => Pe.content || "").catch(() => ""),
        Z ? f(R) : Promise.resolve([]),
        o.listVersions(R).then((Pe) => Pe.items || []).catch(() => [])
      ]);
      P.value = se, B.value = me, D.value = Ye, V.value = ge, M.value && (M.value = {
        ...M.value,
        label: qt(se),
        description: se.description || M.value.description,
        version: Z ? it(Z) : String(se.latest_version || M.value.version)
      }), me || (K.value = "overview");
    } finally {
      z.value = !1;
    }
  }
  function v() {
    M.value = null;
  }
  async function h() {
    if (!M.value) return;
    const b = M.value.component, R = L(b);
    M.value = {
      ...M.value,
      installed: !!R,
      installedId: R?.id,
      version: R ? it(R) : M.value.version
    }, D.value = R ? await f(b) : [];
  }
  return {
    selected: M,
    selectedModule: P,
    detailReadme: B,
    detailEntries: D,
    detailLoading: z,
    detailTab: K,
    detailVersions: V,
    envVars: W,
    requirements: T,
    detailGroups: H,
    versionMeta: q,
    selectedInstalledDep: x,
    selectedCanUpdate: F,
    selectedUpdateDisabledReason: l,
    selectedCanUninstall: Q,
    selectedIsPrivate: d,
    loadEntriesFor: f,
    findModule: w,
    openDetail: de,
    closeDetail: v,
    refreshSelectedDetail: h
  };
}
const us = [
  { until: 1e3, label: "Planning uninstall" },
  { until: 4e3, label: "Stopping services" },
  { until: 6e3, label: "Removing entries" },
  { until: 8e3, label: "Updating lock" },
  { until: 1 / 0, label: "Finalizing" }
];
function ds(o, $) {
  const r = A(0);
  let L = 0, s = null;
  function G() {
    s && (clearInterval(s), s = null);
  }
  Ne(o, (M) => {
    G(), M ? (L = Date.now(), r.value = 0, s = setInterval(() => {
      r.value = Date.now() - L;
    }, 200)) : r.value = 0;
  }), gn(G);
  const S = N(() => $.find((M) => r.value < M.until)?.label || $[$.length - 1].label), E = N(() => Math.floor(r.value / 1e3));
  return { phase: S, elapsedSec: E };
}
function cs({ hub: o, selected: $, selectedInstalledDep: r, installedIsRoot: L, installedUninstallDisabledReason: s, installedCanUninstall: G, refreshAll: S, refreshSelectedDetail: E, showToast: M, notifyModulesChanged: P }) {
  const B = A(!1), D = A(null), z = A("block"), K = A(!1), V = A(!1), W = A(null), T = A([]), H = A(null), q = A(null), x = A([]), { phase: F, elapsedSec: l } = ds(K, us), Q = N(() => {
    const h = r.value;
    return !$.value?.installed || !h || L(h) ? "" : s(h);
  }), d = N(() => D.value ? K.value ? "Uninstall is running." : V.value ? "Waiting for uninstall preview to finish." : x.value.length > 0 ? `Still required by: ${x.value.join(", ")}. Uninstall those root modules first.` : H.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : q.value && !W.value ? q.value : W.value ? "" : "Run Preview first so Keeper can show what will be removed." : ""), f = N(() => D.value ? K.value ? "Uninstall is running." : V.value ? "Waiting for uninstall preview to finish." : x.value.length > 0 ? `Still required by: ${x.value.join(", ")}. Uninstall those root modules first.` : H.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : "" : "No module selected.");
  async function w(h) {
    G(h) && (D.value = h, z.value = "block", H.value = null, q.value = null, x.value = [], W.value = null, T.value = [], B.value = !0, de());
  }
  async function de() {
    const h = D.value;
    if (h) {
      V.value = !0, H.value = null, q.value = null, x.value = [], W.value = null, T.value = [];
      try {
        const b = await o.uninstall({ id: h.id, component: h.component, dry_run: !0, migration_policy: z.value });
        W.value = b.preview || b.payload?.preview || null, W.value || (q.value = "Uninstall preview returned no preview data.");
      } catch (b) {
        if (We("modules:uninstall-preview", b), b instanceof Lt && (H.value = b.code, x.value = bn(b.details), b.code === "NOT_FOUND")) {
          B.value = !1, D.value = null, M("ok", "Module already removed; refreshed installed modules"), await S(), await E();
          return;
        }
        q.value = Ie(b, "uninstall preview failed");
      } finally {
        V.value = !1;
      }
    }
  }
  async function v() {
    const h = D.value;
    if (!(!h || f.value)) {
      K.value = !0, H.value = null, q.value = null, T.value = [];
      try {
        const b = await o.uninstall({ id: h.id, component: h.component, migration_policy: z.value });
        T.value = vn(b), M("ok", `Module uninstalled: ${h.id}`), P(), await S(), await E();
      } catch (b) {
        if (We("modules:uninstall", b), b instanceof Lt && (H.value = b.code, x.value = bn(b.details), T.value = vn(b.details), b.code === "NOT_FOUND")) {
          B.value = !1, D.value = null, M("ok", "Module already removed; refreshed installed modules"), await S(), await E();
          return;
        }
        q.value = Ie(b, "uninstall failed");
      } finally {
        K.value = !1;
      }
    }
  }
  return Ne(z, () => {
    B.value && D.value && !K.value && de();
  }), {
    uninstallDialogOpen: B,
    uninstallDep: D,
    uninstallPolicy: z,
    uninstallRunning: K,
    uninstallPreviewLoading: V,
    uninstallPreview: W,
    uninstallExecution: T,
    uninstallCode: H,
    uninstallError: q,
    uninstallRequiredBy: x,
    uninstallPhase: F,
    uninstallElapsedSec: l,
    selectedUninstallBlockedReason: Q,
    uninstallBlockedReason: d,
    uninstallActionBlockedReason: f,
    openUninstallDialog: w,
    previewUninstall: de,
    runUninstall: v
  };
}
function ms({ hub: o, installed: $, installedError: r, installedCanUpdate: L, installedIsRoot: s, showToast: G, notifyModulesChanged: S, refreshAll: E, refreshSelectedDetail: M }) {
  const P = A({}), B = A(!1), D = A(!1), z = N(() => $.value.filter((v) => {
    const h = q(v);
    return L(v) && s(v) && h && ["available", "failed", "blocked", "skipped"].includes(h.status) && T(h.latestVersion, it(v));
  }));
  function K(v) {
    return (String(v || "").trim().replace(/^[^\d]*/, "").match(/\d+(?:\.\d+)*/)?.[0] || "").split(".").filter(Boolean).map(Number);
  }
  function V(v, h) {
    const b = K(v), R = K(h), Z = Math.max(b.length, R.length);
    for (let ee = 0; ee < Z; ee++) {
      const se = b[ee] || 0, me = R[ee] || 0;
      if (se !== me) return se > me ? 1 : -1;
    }
    return String(v || "").localeCompare(String(h || ""));
  }
  function W(v = []) {
    const h = v.find((b) => b.is_latest) || v[0];
    return String(h?.version || "");
  }
  function T(v, h) {
    return !!(v && h && v !== h && V(v, h) > 0);
  }
  function H(v) {
    const h = String(v || "").trim().replace(/^[>=<~^]+v?/, "");
    return h ? `>=${h}` : ">=v0.0.0";
  }
  function q(v) {
    return v?.component && P.value[v.component] || null;
  }
  function x(v, h) {
    const b = P.value[v];
    P.value = {
      ...P.value,
      [v]: {
        component: v,
        currentVersion: h.currentVersion ?? b?.currentVersion ?? "",
        latestVersion: h.latestVersion ?? b?.latestVersion ?? "",
        status: h.status ?? b?.status ?? "current",
        message: h.message
      }
    };
  }
  function F(v) {
    const h = q(v);
    return h ? h.status === "available" ? `${h.currentVersion || "?"} → ${h.latestVersion || "?"}` : h.status === "queued" ? "queued" : h.status === "skipped" ? "skipped" : h.status === "planning" ? "planning" : h.status === "updating" ? "updating" : h.status === "updated" ? "updated" : h.status === "blocked" ? "blocked" : h.status === "failed" ? "failed" : "" : "";
  }
  function l(v) {
    const h = q(v)?.status;
    return h === "planning" || h === "updating" ? "tabler:loader-2" : h === "updated" ? "tabler:check" : h === "queued" ? "tabler:clock" : h === "skipped" ? "tabler:player-skip-forward" : h === "blocked" ? "tabler:lock" : h === "failed" ? "tabler:alert-triangle" : "tabler:arrow-up-circle";
  }
  function Q(v) {
    const h = q(v)?.status;
    return h === "planning" || h === "updating";
  }
  async function d() {
    if (!o || B.value) return;
    B.value = !0, r.value = null;
    const v = {};
    let h = 0, b = 0;
    try {
      for (const R of $.value) {
        if (!L(R) || !s(R)) continue;
        const Z = it(R);
        try {
          const ee = await o.listVersions(R.component), se = W(ee.items), me = T(se, Z) ? "available" : "current";
          me === "available" && h++, v[R.component] = { component: R.component, currentVersion: Z, latestVersion: se, status: me }, P.value = { ...v };
        } catch (ee) {
          b++, v[R.component] = {
            component: R.component,
            currentVersion: Z,
            latestVersion: "",
            status: "failed",
            message: Ie(ee, "version scan failed")
          }, P.value = { ...v };
        }
      }
      G("ok", `Found ${h} update${h === 1 ? "" : "s"}${b ? `, ${b} failed` : ""}`);
    } finally {
      B.value = !1;
    }
  }
  async function f(v, h) {
    x(v, { status: "planning", message: void 0 });
    try {
      const b = await o.planInstall({ component: v, version: h, run_migrations: !0 }), R = b.missing_requirements || [];
      if (R.length) {
        const Z = `Missing required settings: ${R.join(", ")}`;
        return x(v, { status: "blocked", message: Z }), null;
      }
      return b;
    } catch (b) {
      const R = Ie(b, "update plan failed");
      return x(v, { status: "failed", message: R }), null;
    }
  }
  async function w(v) {
    if (!o || !v.component) return !1;
    let h = q(v);
    if (!h) {
      const b = it(v);
      try {
        const R = await o.listVersions(v.component), Z = W(R.items);
        h = {
          component: v.component,
          currentVersion: b,
          latestVersion: Z,
          status: T(Z, b) ? "available" : "current"
        }, x(v.component, h);
      } catch (R) {
        return x(v.component, { status: "failed", message: Ie(R, "version scan failed") }), !1;
      }
    }
    if (!h.latestVersion || !T(h.latestVersion, it(v))) return !0;
    try {
      const b = H(h.latestVersion), R = await f(v.component, b);
      if (!R) return !1;
      const Z = o.install({
        ...R.install_payload,
        component: v.component,
        version: b,
        run_migrations: !0,
        migration_policy: "up"
      });
      return x(v.component, { status: "updating" }), await Z, x(v.component, {
        status: "updated",
        currentVersion: h.latestVersion,
        latestVersion: h.latestVersion,
        message: void 0
      }), S(), !0;
    } catch (b) {
      return x(v.component, { status: "failed", message: Ie(b, "update failed") }), !1;
    }
  }
  async function de() {
    if (D.value || z.value.length === 0) return;
    D.value = !0;
    const v = [...z.value];
    try {
      for (const R of v) x(R.component, { status: "planning" });
      const h = await o.planBatchInstall({
        dependencies: v.map((R) => ({
          id: R.dependencyId,
          component: R.component,
          version: H(q(R).latestVersion)
        })),
        run_migrations: !0,
        migration_policy: "up"
      }), b = /* @__PURE__ */ new Map();
      for (const R of h.plans) {
        const Z = R.missing_requirements || [], ee = (R.requirements || []).filter((se) => se.invalid).map((se) => `${se.id || se.parameter_name}: ${se.invalid_reason || "invalid value"}`);
        if (R.applicable === !1 || Z.length || ee.length) {
          const se = [
            Z.length ? `Missing required settings: ${Z.join(", ")}` : "",
            ee.length ? `Invalid settings: ${ee.join(", ")}` : ""
          ].filter(Boolean).join(". ") || "Update plan cannot be applied";
          b.set(R.dependency?.component || "Unknown module", se);
        }
      }
      if (!h.applicable || b.size) {
        for (const R of v) x(R.component, {
          status: b.has(R.component) ? "blocked" : "skipped",
          message: b.get(R.component) || "Batch not applied because its plan is blocked"
        });
        G("error", b.size ? [...b].map(([R, Z]) => `${R}: ${Z}`).join("; ") : "Update plan cannot be applied. No modules were changed.");
        return;
      }
      if (!h.install_payload?.dependencies?.length) throw new Error("Update plan returned no install payload");
      for (const R of v) x(R.component, { status: "updating" });
      await o.install(h.install_payload);
      for (const R of v) x(R.component, { status: "updated" });
      S(), G("ok", `Updated ${v.length} module${v.length === 1 ? "" : "s"}`);
    } catch (h) {
      const b = Ie(h, "update failed");
      for (const R of v) x(R.component, { status: "failed", message: b });
      G("error", b);
    } finally {
      try {
        await E(), await M();
      } catch (h) {
        G("error", `Module status could not be refreshed: ${Ie(h, "refresh failed")}`);
      } finally {
        D.value = !1;
      }
    }
  }
  return {
    updateScan: P,
    updateScanLoading: B,
    updateAllRunning: D,
    availableUpdates: z,
    updateInfoForDep: q,
    updateStatusLabel: F,
    updateStatusIcon: l,
    updateStatusBusy: Q,
    scanInstalledUpdates: d,
    updateInstalledDependency: w,
    updateAllAvailable: de
  };
}
function vs({ hub: o, loadCatalog: $ }) {
  const r = A(!1), L = A(!1), s = A(!1), G = A(!1), S = A(null), E = A(""), M = A(!1), P = A(!1), B = A(null), D = N(() => S.value?.orgs || []), z = N(() => S.value?.username || S.value?.user_id || ""), K = N(() => !!S.value?.authenticated), V = N(() => !!(S.value?.authenticated && S.value?.expired)), W = N(() => s.value ? "tabler:key" : V.value ? "tabler:alert-triangle" : "tabler:key-off"), T = N(() => s.value ? "Hub token set" : V.value ? "Hub token expired" : "Set Hub token"), H = N(() => {
    const d = S.value?.expires_at;
    if (!d) return "";
    const f = new Date(d);
    return isNaN(f.getTime()) ? "" : f.toLocaleDateString();
  });
  function q(d) {
    S.value = d?.authenticated ? d : null;
    const f = _n(d);
    s.value = f, G.value = f;
  }
  async function x() {
    try {
      const { data: d } = await yn.get("/api/v1/user/me");
      r.value = !!(d?.success && d?.security?.is_admin);
    } catch (d) {
      We("modules:auth", d), r.value = !1;
    } finally {
      L.value = !0;
    }
  }
  async function F() {
    try {
      const d = await o.authStatus();
      q(d);
    } catch (d) {
      We("modules:hub-auth", d);
    }
  }
  async function l() {
    const d = E.value.trim();
    if (!d) {
      B.value = "Paste a Hub token first.";
      return;
    }
    B.value = null, P.value = !0;
    try {
      const f = await o.authenticate(d);
      q(f), _n(f) ? (E.value = "", M.value = !1, await $()) : B.value = "That token is invalid or expired.";
    } catch (f) {
      B.value = Ie(f, "failed to save Hub token");
    } finally {
      P.value = !1;
    }
  }
  async function Q() {
    B.value = null;
    try {
      await o.logout();
    } catch (d) {
      B.value = Ie(d, "failed to clear Hub token");
      return;
    }
    q(null), await $();
  }
  return {
    isAdmin: r,
    authLoaded: L,
    hubConnected: s,
    hubUsable: G,
    hubStatus: S,
    hubToken: E,
    showTokenPanel: M,
    hubConnecting: P,
    hubError: B,
    hubOrgs: D,
    hubIdentity: z,
    hubTokenStored: K,
    hubTokenExpired: V,
    hubTokenIcon: W,
    hubTokenButtonLabel: T,
    hubExpiry: H,
    applyHubAuthStatus: q,
    loadAuth: x,
    loadHubAuth: F,
    saveHubToken: l,
    clearHubToken: Q
  };
}
const ps = ["kickside", "kickside-plugin"], Cn = "kickside", ks = "https://portal.wippy.ai/account/tokens", fs = [
  { label: "Block if any applied", value: "block" },
  { label: "Leave applied migrations", value: "leave" },
  { label: "Revert (down) - may lose data", value: "down" }
];
function gs() {
  const o = Tn(yn), $ = A(!0), r = A(null), L = vs({ hub: o, loadCatalog: Zt }), {
    isAdmin: s,
    authLoaded: G,
    hubConnected: S,
    hubUsable: E,
    hubStatus: M,
    hubToken: P,
    showTokenPanel: B,
    hubConnecting: D,
    hubError: z,
    hubOrgs: K,
    hubIdentity: V,
    hubTokenStored: W,
    hubTokenExpired: T,
    hubTokenIcon: H,
    hubTokenButtonLabel: q,
    hubExpiry: x,
    loadAuth: F,
    loadHubAuth: l,
    saveHubToken: Q,
    clearHubToken: d
  } = L, f = A([]), w = A(""), de = A("all"), v = A(!1), h = A(null), b = A(!0), R = A([]), Z = A(!1), ee = A(null), se = A(""), me = A("downloads"), Ye = rs({
    hub: o,
    installed: f,
    catalog: R,
    installedDepFor: $e,
    installedCanUpdate: pt,
    installedUpdateDisabledReason: Pt,
    installedCanUninstall: bt,
    installedIsPrivate: yt
  }), {
    selected: ge,
    selectedModule: Pe,
    detailReadme: Te,
    detailEntries: ot,
    detailLoading: qe,
    detailTab: rt,
    detailVersions: wt,
    envVars: $t,
    requirements: ye,
    detailGroups: Dt,
    versionMeta: Je,
    selectedInstalledDep: Be,
    selectedCanUpdate: ut,
    selectedUpdateDisabledReason: Ze,
    selectedCanUninstall: Oe,
    selectedIsPrivate: Ee,
    openDetail: Me,
    closeDetail: be,
    refreshSelectedDetail: ze
  } = Ye, He = cs({
    hub: o,
    selected: ge,
    selectedInstalledDep: Be,
    installedIsRoot: we,
    installedUninstallDisabledReason: Nt,
    installedCanUninstall: bt,
    refreshAll: Ut,
    refreshSelectedDetail: ze,
    showToast: y,
    notifyModulesChanged: kn
  }), {
    uninstallDialogOpen: St,
    uninstallDep: Qe,
    uninstallPolicy: Fe,
    uninstallRunning: Le,
    uninstallPreviewLoading: Ct,
    uninstallPreview: p,
    uninstallExecution: g,
    uninstallCode: I,
    uninstallError: U,
    uninstallRequiredBy: j,
    uninstallPhase: Y,
    uninstallElapsedSec: oe,
    selectedUninstallBlockedReason: fe,
    uninstallBlockedReason: Xe,
    uninstallActionBlockedReason: It,
    openUninstallDialog: ue,
    previewUninstall: Ae,
    runUninstall: et
  } = He, dt = ms({
    hub: o,
    installed: f,
    installedError: h,
    installedCanUpdate: pt,
    installedIsRoot: we,
    showToast: y,
    notifyModulesChanged: kn,
    refreshAll: Ut,
    refreshSelectedDetail: ze
  }), {
    updateScanLoading: ct,
    updateAllRunning: pe,
    availableUpdates: xe,
    updateInfoForDep: tt,
    updateStatusLabel: je,
    updateStatusIcon: zt,
    updateStatusBusy: xt,
    scanInstalledUpdates: ft,
    updateInstalledDependency: Ue,
    updateAllAvailable: De
  } = dt, mt = N(() => {
    const C = /* @__PURE__ */ new Set();
    for (const te of f.value)
      if (te.installed !== !1)
        for (const Tt of wn(te)) C.add(Tt);
    return C;
  }), vt = N(() => On(R.value, se.value)), he = N(() => vt.value.filter((C) => !kt(C))), nt = N(() => se.value.trim() || he.value.length < 7 ? [] : [...he.value].sort((C, te) => (te.total_downloads || 0) - (C.total_downloads || 0)).slice(0, 6)), Ht = N(() => new Set(nt.value.map(sn))), gt = N(() => zn(he.value.filter((C) => !Ht.value.has(sn(C))), me.value)), st = N(() => f.value.filter((C) => C.installed !== !1).length), at = N(() => {
    const C = w.value.trim().toLowerCase(), te = de.value, Tt = f.value.filter((Re) => Re.installed === !1 || te === "root" && !we(Re) || te === "transitive" && we(Re) || te === "local" && Re.source !== "local" ? !1 : C ? [
      Re.component,
      Re.id,
      Re.name,
      Re.namespace,
      Re.version,
      Re.source,
      Mt(Re),
      At(Re),
      Sn(Re),
      it(Re)
    ].filter(Boolean).join(" ").toLowerCase().includes(C) : !0);
    return Hn(Tt, _e);
  }), Ke = N(() => f.value.filter((C) => C.installed !== !1 && !!_e(C.component)).length), ke = N(() => at.value.filter((C) => !!_e(C.component)).length), Ge = N(() => G.value && !s.value), ve = A(null), Vt = N(() => ve.value !== null);
  function _e(C) {
    return R.value.find((te) => nn(te, C));
  }
  function ht(C) {
    return Yt({ full_name: C.component });
  }
  function Rt(C) {
    const te = _e(C.component);
    return te ? Bt(te) : "tabler:package";
  }
  function yt(C) {
    return Wt(_e(C.component)) || Wt(C);
  }
  function we(C) {
    return Fn(C || {});
  }
  function Mt(C) {
    return jn(C);
  }
  function At(C) {
    return Kn(C);
  }
  function Nt(C) {
    if (we(C)) return "";
    const te = At(C);
    return te ? `Installed as a dependency; ${te}` : "Installed as a dependency of another module";
  }
  function pt(C) {
    return !!(C?.component && C.source !== "local");
  }
  function Pt(C) {
    return C.source === "local" ? "Local replacement; update from source" : "No Hub dependency update action available";
  }
  function bt(C) {
    return !!(C && we(C));
  }
  function kt(C) {
    return wn(C).some((te) => mt.value.has(te));
  }
  function $e(C) {
    return f.value.find((te) => nn(te, C));
  }
  function y(C, te) {
    const Tt = Ln?.toast;
    typeof Tt == "function" ? Tt({ severity: C === "ok" ? "success" : "error", summary: te }) : (r.value = { kind: C, message: te }, setTimeout(() => {
      r.value?.message === te && (r.value = null);
    }, 5e3));
  }
  function m() {
    ge.value && O({
      full_name: ge.value.component,
      latest_version: ge.value.version,
      description: ge.value.description
    });
  }
  function Ve() {
    const C = ge.value && $e(ge.value.component);
    C && pt(C) && ce(C);
  }
  function on() {
    const C = ge.value && $e(ge.value.component);
    C && bt(C) && ue(C);
  }
  async function rn() {
    v.value = !0, h.value = null;
    try {
      f.value = os(await o.listDependencies());
    } catch (C) {
      f.value = [], We("modules:listDependencies", C), h.value = Ie(C, "dependency graph unavailable");
    }
    v.value = !1;
  }
  async function Zt() {
    Z.value = !0, ee.value = null;
    try {
      R.value = (await o.fetchAllByKeyword(ps)).filter(Gn);
    } catch (C) {
      We("modules:catalog", C), C instanceof Lt && (C.code === "UNAUTHORIZED" || C.code === "FORBIDDEN") ? E.value = !1 : ee.value = Ie(C, `failed to load ${Cn} catalog`);
    } finally {
      Z.value = !1;
    }
  }
  async function Ut() {
    await Promise.all([rn(), Zt()]);
  }
  function O(C) {
    const te = tn(C);
    ve.value = {
      mode: "install",
      component: te,
      version: C.latest_version ? String(C.latest_version) : "",
      currentId: null,
      catalogItem: _e(te) || C,
      installedDep: null
    };
  }
  function ce(C) {
    pt(C) && (ve.value = {
      mode: "update",
      component: C.component,
      // Let the dialog load and select the newest published release. Seeding
      // this with the resolved version re-submits the current package while
      // presenting the operation as an update.
      version: "",
      currentId: C.dependencyId || null,
      catalogItem: _e(C.component) || null,
      installedDep: C
    });
  }
  function re() {
    ve.value = null;
  }
  async function Se() {
    await Ut(), await ze(), re();
  }
  return hn(() => {
    En("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
    });
  }), es(async () => {
    try {
      if (await F(), !s.value) return;
      await l(), await Ut();
    } finally {
      $.value = !1;
    }
  }), {
    LABEL: Cn,
    HUB_PORTAL: ks,
    UNINSTALL_MIGRATION_OPTIONS: fs,
    initialLoading: $,
    accessDenied: Ge,
    statusBanner: r,
    hubConnected: S,
    hubStatus: M,
    hubToken: P,
    showTokenPanel: B,
    hubConnecting: D,
    hubError: z,
    hubOrgs: K,
    hubIdentity: V,
    hubTokenStored: W,
    hubTokenExpired: T,
    hubTokenIcon: H,
    hubTokenButtonLabel: q,
    hubExpiry: x,
    selected: ge,
    selectedModule: Pe,
    detailReadme: Te,
    detailEntries: ot,
    detailLoading: qe,
    detailTab: rt,
    detailVersions: wt,
    envVars: $t,
    requirements: ye,
    detailGroups: Dt,
    versionMeta: Je,
    selectedCanUpdate: ut,
    selectedUpdateDisabledReason: Ze,
    selectedCanUninstall: Oe,
    selectedIsPrivate: Ee,
    selectedUninstallBlockedReason: fe,
    entryName: as,
    entryDesc: ls,
    entryIcon: is,
    installed: f,
    installedFilter: w,
    installedKindFilter: de,
    installedTotal: st,
    updateScanLoading: ct,
    updateAllRunning: pe,
    availableUpdates: xe,
    installedLoading: v,
    installedError: h,
    installedOpen: b,
    catalog: R,
    catalogLoading: Z,
    catalogError: ee,
    catalogInstalledTotal: Ke,
    visibleCatalogInstalled: ke,
    browseFilter: se,
    sortBy: me,
    availableItems: he,
    featured: nt,
    sortedItems: gt,
    visibleInstalled: at,
    catalogItemFor: _e,
    installedAccent: ht,
    installedIcon: Rt,
    installedIsPrivate: yt,
    installedIsRoot: we,
    installedRole: Mt,
    installedUsedBy: At,
    installedCanUpdate: pt,
    installedUpdateDisabledReason: Pt,
    installedCanUninstall: bt,
    installedMigrationSummary: Sn,
    updateInfoForDep: tt,
    updateStatusLabel: je,
    updateStatusIcon: zt,
    updateStatusBusy: xt,
    scanInstalledUpdates: ft,
    updateInstalledDependency: Ue,
    updateAllAvailable: De,
    installDialogOpen: Vt,
    installTarget: ve,
    closeInstallDialog: re,
    onInstallChanged: Se,
    uninstallDialogOpen: St,
    uninstallDep: Qe,
    uninstallPolicy: Fe,
    uninstallRunning: Le,
    uninstallPreviewLoading: Ct,
    uninstallPreview: p,
    uninstallExecution: g,
    uninstallCode: I,
    uninstallError: U,
    uninstallRequiredBy: j,
    uninstallBlockedReason: Xe,
    uninstallActionBlockedReason: It,
    uninstallPhase: Y,
    uninstallElapsedSec: oe,
    previewUninstall: Ae,
    executionStepLabel: Un,
    openDetail: Me,
    closeDetail: be,
    detailInstall: m,
    detailUpdate: Ve,
    detailUninstall: on,
    refreshAll: Ut,
    saveHubToken: Q,
    clearHubToken: d,
    openUpdateDialog: ce,
    openUninstallDialog: ue,
    installedUninstallDisabledReason: Nt,
    runUninstall: et
  };
}
const hs = ["aria-label", "aria-busy"], ys = /* @__PURE__ */ Ot({
  __name: "NativeDialog",
  props: {
    visible: { type: Boolean },
    busy: { type: Boolean },
    label: {},
    headerClass: {},
    contentClass: {},
    footerClass: {}
  },
  emits: ["close"],
  setup(o, { emit: $ }) {
    const r = o, L = $, s = A(null);
    async function G() {
      await Gt();
      const E = s.value;
      E && (r.visible && !E.open ? E.showModal() : !r.visible && E.open && E.close());
    }
    function S(E) {
      E.preventDefault(), r.busy || L("close");
    }
    return Ne(() => r.visible, G), hn(G), Mn(() => {
      s.value?.open && s.value.close();
    }), (E, M) => (n(), a("dialog", {
      ref_key: "dialog",
      ref: s,
      class: "kx-native-dialog",
      "aria-label": o.label,
      "aria-modal": "true",
      "aria-busy": o.busy || void 0,
      onCancel: S,
      onClose: M[1] || (M[1] = () => {
        o.visible && !o.busy && L("close");
      })
    }, [
      t("header", {
        class: ne(o.headerClass)
      }, [
        Qt(E.$slots, "header"),
        u(e(le), {
          type: "button",
          text: "",
          severity: "secondary",
          "aria-label": "Close dialog",
          disabled: o.busy,
          onClick: M[0] || (M[0] = (P) => L("close"))
        }, {
          default: X(() => [...M[2] || (M[2] = [
            _("×", -1)
          ])]),
          _: 1
        }, 8, ["disabled"])
      ], 2),
      t("div", {
        class: ne(o.contentClass)
      }, [
        Qt(E.$slots, "default")
      ], 2),
      E.$slots.footer ? (n(), a("footer", {
        key: 0,
        class: ne(o.footerClass)
      }, [
        Qt(E.$slots, "footer")
      ], 2)) : c("", !0)
    ], 40, hs));
  }
}), bs = ["aria-expanded", "aria-controls", "aria-label", "disabled"], _s = { class: "p-select-label" }, ws = {
  key: 0,
  class: "kx-ps-val"
}, $s = { class: "kx-ps-val-label" }, Ss = {
  key: 1,
  class: "kx-ps-ph"
}, Cs = { class: "p-select-dropdown" }, Is = { class: "p-select-overlay kx-ps-panel" }, xs = { class: "p-select-header" }, Rs = ["aria-label", "aria-controls", "aria-activedescendant"], Ms = ["id", "aria-label"], As = {
  class: "p-select-option-group",
  role: "presentation"
}, Us = ["id", "aria-selected", "onClick", "onMousemove"], Ts = { class: "kx-ps-opt-body" }, Es = { class: "kx-ps-opt-title" }, Ls = {
  key: 0,
  class: "kx-ps-opt-sub"
}, Ds = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, Vs = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, Ns = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, Ps = ["disabled"], In = /* @__PURE__ */ Ot({
  __name: "PickerSelect",
  props: {
    items: {},
    modelValue: {},
    placeholder: {},
    ariaLabel: {},
    disabled: { type: Boolean },
    remote: { type: Boolean },
    loading: { type: Boolean },
    more: { type: Boolean },
    error: {}
  },
  emits: ["update:modelValue", "search", "more"],
  setup(o, { emit: $ }) {
    const r = o, L = $, s = A(null), G = A(null), S = A(!1), E = A(""), M = A(0), P = Nn(), B = N(() => {
      const T = E.value.trim().toLowerCase(), H = /* @__PURE__ */ new Map();
      for (const x of r.items) {
        if (!r.remote && T && ![x.title, x.subtitle, x.id, x.group].some((Q) => Q?.toLowerCase().includes(T))) continue;
        const F = x.group || "Other", l = H.get(F);
        l ? l.push(x) : H.set(F, [x]);
      }
      let q = 0;
      return [...H.entries()].sort((x, F) => x[0].localeCompare(F[0])).map(([x, F]) => ({ group: x, items: F.map((l) => ({ item: l, index: q++ })) }));
    }), D = N(() => B.value.flatMap((T) => T.items)), z = N(() => r.items.find((T) => T.id === r.modelValue)), K = N(() => D.value[M.value] ? `${P}-${M.value}` : void 0);
    Ne(E, () => {
      M.value = 0;
    }), Ne([S, E], ([T, H]) => {
      T && r.remote && L("search", H);
    }), Ne(() => r.disabled, (T) => {
      T && (S.value = !1);
    }), Ne(S, async (T) => {
      if (!T) {
        s.value?.focus();
        return;
      }
      E.value = "", M.value = Math.max(0, D.value.findIndex(({ item: H }) => H.id === r.modelValue)), await Gt(), G.value?.focus();
    });
    function V(T) {
      r.disabled || r.loading || (L("update:modelValue", T.id), S.value = !1);
    }
    async function W(T) {
      if (T.key === "Escape" && S.value) {
        T.preventDefault(), T.stopPropagation(), S.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(T.key)) return;
      if (T.preventDefault(), !S.value) {
        S.value = !0;
        return;
      }
      if (T.key === "Enter") {
        const x = D.value[M.value];
        x && V(x.item);
        return;
      }
      const H = D.value.length - 1;
      M.value = T.key === "Home" ? 0 : T.key === "End" ? H : Math.max(0, Math.min(H, M.value + (T.key === "ArrowDown" ? 1 : -1))), await Gt(), s.value?.getRootNode()?.querySelector(`[id="${K.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (T, H) => (n(), a(J, null, [
      t("button", {
        ref_key: "anchor",
        ref: s,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": S.value,
        "aria-controls": e(P),
        "aria-label": o.ariaLabel,
        disabled: o.disabled,
        onClick: H[0] || (H[0] = (q) => S.value = !S.value),
        onKeydown: W
      }, [
        t("span", _s, [
          z.value ? (n(), a("span", ws, [
            u(e(k), {
              icon: z.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            t("span", $s, i(z.value.title), 1)
          ])) : (n(), a("span", Ss, i(o.placeholder || "Select…"), 1))
        ]),
        t("span", Cs, [
          u(e(k), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, bs),
      u(Dn, {
        open: S.value,
        "onUpdate:open": H[3] || (H[3] = (q) => S.value = q),
        anchor: s.value
      }, {
        default: X(() => [
          t("div", Is, [
            t("div", xs, [
              lt(t("input", {
                ref_key: "search",
                ref: G,
                "onUpdate:modelValue": H[1] || (H[1] = (q) => E.value = q),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${o.ariaLabel || o.placeholder || "options"}`,
                "aria-controls": e(P),
                "aria-activedescendant": K.value,
                onKeydown: W
              }, null, 40, Rs), [
                [Xt, E.value]
              ])
            ]),
            t("ul", {
              id: e(P),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": o.ariaLabel || o.placeholder || "Options"
            }, [
              (n(!0), a(J, null, ie(B.value, (q) => (n(), a(J, {
                key: q.group
              }, [
                t("li", As, i(q.group), 1),
                (n(!0), a(J, null, ie(q.items, ({ item: x, index: F }) => (n(), a("li", {
                  id: `${e(P)}-${F}`,
                  key: x.id,
                  class: ne(["p-select-option kx-ps-option", { "p-select-option-selected": x.id === o.modelValue, "p-focus": F === M.value }]),
                  role: "option",
                  "aria-selected": x.id === o.modelValue,
                  onClick: (l) => V(x),
                  onMousemove: (l) => M.value = F
                }, [
                  u(e(k), {
                    icon: x.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  t("span", Ts, [
                    t("span", Es, i(x.title), 1),
                    x.subtitle ? (n(), a("span", Ls, i(x.subtitle), 1)) : c("", !0)
                  ])
                ], 42, Us))), 128))
              ], 64))), 128)),
              o.loading ? (n(), a("li", Ds, "Loading…")) : !D.value.length && !o.error ? (n(), a("li", Vs, "No matches")) : c("", !0)
            ], 8, Ms),
            o.error ? (n(), a("div", Ns, i(o.error), 1)) : c("", !0),
            o.more ? (n(), a("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: o.loading || o.disabled,
              onClick: H[2] || (H[2] = (q) => L("more"))
            }, "Load more", 8, Ps)) : c("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
function fn() {
  return { status: "idle", modules: [], findings: [], scanned: 0, total: 0 };
}
function qs(o) {
  return o.some(($) => $.severity === "critical") ? "critical" : o.length > 0 ? "warnings" : "clean";
}
const xn = {
  info: { label: "Info", icon: "tabler:info-circle", tone: "info" },
  warning: { label: "Warning", icon: "tabler:alert-triangle", tone: "warn" },
  critical: { label: "Critical", icon: "tabler:shield-x", tone: "danger" }
};
function Bs(o) {
  return o.severity !== "critical";
}
const Os = ["clean", "warnings", "critical", "error", "unavailable", "skipped"];
function Rn(o) {
  return Os.includes(o) ? o : "clean";
}
function zs(o) {
  return o === "critical" ? "critical" : o === "warning" ? "warning" : "info";
}
function Hs(o) {
  const $ = o && typeof o == "object" ? o : {}, r = [], L = [];
  for (const E of $.modules || []) {
    const M = String(E.module || ""), P = E.version ? String(E.version) : void 0, B = (E.findings || []).map((D, z) => ({
      id: `${M}#${z}`,
      module: M,
      version: P,
      severity: zs(D.severity),
      title: String(D.title || "Issue"),
      detail: D.detail ? String(D.detail) : void 0,
      location: D.location ? String(D.location) : void 0
    }));
    for (const D of B) L.push(D);
    r.push({
      module: M,
      version: P,
      status: Rn(E.status),
      summary: E.summary ? String(E.summary) : void 0,
      findings: B
    });
  }
  const s = typeof $.total == "number" ? $.total : r.length, G = typeof $.scanned == "number" ? $.scanned : r.length;
  return {
    status: $.overall_status ? Rn($.overall_status) : qs(L),
    summary: $.overall_summary ? String($.overall_summary) : void 0,
    modules: r,
    findings: L,
    scanned: G,
    total: s
  };
}
function Fs({ props: o, hub: $, plan: r, activeSection: L, versionArg: s, requirementPayload: G, invalidatePlan: S, refreshPlan: E, planCurrent: M }) {
  const P = A([]), B = A({}), D = A({}), z = N(() => {
    const p = /* @__PURE__ */ new Map();
    for (const g of P.value) {
      const I = String(g.module || "");
      p.has(I) || p.set(I, []), p.get(I).push(g);
    }
    return Array.from(p.entries()).map(([g, I]) => ({ module: g, items: I, direct: !I.every((U) => en(U, o.component)) })).sort((g, I) => g.direct === I.direct ? g.module.localeCompare(I.module) : g.direct ? -1 : 1);
  }), K = N(() => P.value.filter((p) => !en(p, o.component))), V = N(() => P.value.filter((p) => !Te(p))), W = N(() => P.value.length - K.value.length), T = N(() => {
    const p = [];
    for (const g of P.value) {
      const I = ae(g);
      !I || !g.required && !g.missing || v(B.value[I]) && p.push(I);
    }
    return p;
  }), H = N(() => P.value.filter((p) => !v(B.value[ae(p)])).length), q = N(() => Je().length), x = A(!1), F = A(null);
  let l = null;
  const Q = A(0), d = A({}), f = N(() => Object.keys(d.value).length);
  let w = 0;
  const de = /* @__PURE__ */ new Set();
  function v(p) {
    return p == null || p === "" || typeof p == "string" && !p.trim() || Array.isArray(p) && p.length === 0 || typeof p == "object" && Object.keys(p).length === 0;
  }
  function h(p) {
    return p == null ? "" : typeof p == "object" ? JSON.stringify(p) : String(p);
  }
  function b(p) {
    if (p.expected_type) return p.expected_type;
    const g = [p.value, p.default, ...(p.suggestions || []).map((I) => I.value)];
    for (const I of g) {
      if (typeof I == "boolean" || typeof I == "number") return typeof I;
      if (Array.isArray(I)) return "array";
      if (I && typeof I == "object") return "object";
    }
    return "string";
  }
  function R(p, g) {
    if (typeof g != "string") return g;
    const I = g.trim(), U = b(p);
    if (U === "boolean") return /^(true|false)$/.test(I) ? I === "true" : g;
    if (U === "number" || U === "integer") return I && Number.isFinite(Number(I)) ? Number(I) : g;
    if (U === "array" || U === "object")
      try {
        return JSON.parse(I);
      } catch {
        return g;
      }
    return g;
  }
  function Z(p, g) {
    const I = b(p);
    return I === "array" ? Array.isArray(g) : I === "object" ? g !== null && typeof g == "object" && !Array.isArray(g) : I === "integer" ? typeof g == "number" && Number.isInteger(g) : typeof g === I && (I !== "number" || Number.isFinite(g));
  }
  function ee(p, g) {
    const I = ae(p);
    if (!I || Te(p)) return;
    const U = R(p, g ?? "");
    JSON.stringify(B.value[I]) !== JSON.stringify(U) && (de.add(I), B.value = { ...B.value, [I]: U }, S());
  }
  function se(p) {
    const g = B.value[ae(p)];
    return !Te(p) && !v(g) && !Z(p, g);
  }
  function me(p) {
    const g = b(p);
    return g === "boolean" ? "expects true or false" : `expects ${g === "integer" || g === "object" || g === "array" ? "an" : "a"} ${g}`;
  }
  const Ye = N(() => P.value.filter(se).map(ae).filter(Boolean));
  function ge(p) {
    return h(B.value[ae(p)]);
  }
  function Pe(p) {
    return (p.required || p.missing) === !0 && v(B.value[ae(p)]);
  }
  function Te(p) {
    return en(p, o.component) && p.missing !== !0 && !de.has(ae(p));
  }
  function ot(p) {
    const g = /* @__PURE__ */ new Set(), I = [];
    for (const U of p.suggestions || []) {
      const j = h(U.value).trim();
      if (!j || g.has(j)) continue;
      g.add(j);
      const Y = String(U.label || j).trim(), oe = [U.kind, U.source, U.description].filter(Boolean).map(String).join(" | ");
      I.push({ label: Y && Y !== j ? `${Y} (${j})` : j, value: j, title: oe });
    }
    return I;
  }
  function qe() {
    const p = {}, g = (U, j) => {
      if (U = String(U || "").trim(), !U) return;
      p[U] = j;
      const Y = U.includes(":") && U.split(":").pop() || "";
      Y && p[Y] === void 0 && (p[Y] = p[U]);
    }, I = o.installedDep?.parameters;
    if (Array.isArray(I))
      for (const U of I)
        g(U.name, U.value);
    else if (I && typeof I == "object")
      for (const [U, j] of Object.entries(I)) g(U, j);
    return p;
  }
  async function rt() {
    if (D.value = {}, !!$)
      try {
        const p = await $.listDependencies({ includeEntries: !1, includeMigrations: !1 }), g = {}, I = (U, j) => {
          U = String(U || "").trim();
          const Y = String(j ?? "").trim();
          if (!U || !Y || g[U] !== void 0) return;
          g[U] = j;
          const oe = U.includes(":") && U.split(":").pop() || "";
          oe && g[oe] === void 0 && (g[oe] = g[U]);
        };
        for (const U of p.dependencies || []) {
          const j = U.parameters;
          if (Array.isArray(j))
            for (const Y of j) I(Y.name, Y.value);
          else if (j && typeof j == "object")
            for (const [Y, oe] of Object.entries(j)) I(Y, oe);
        }
        D.value = g;
      } catch (p) {
        We("install:dependency-parameters", p);
      }
  }
  function wt(p) {
    for (const g of r.value?.recommended_parameters || [])
      if (g.name === p && h(g.value).trim() !== "") return h(g.value);
    return "";
  }
  function $t(p) {
    const g = [
      ae(p),
      String(p.parameter_name || ""),
      String(p.full_id || ""),
      String(p.name || ""),
      String(p.short_name || "")
    ].map((I) => I.trim()).filter(Boolean);
    for (const I of g) {
      const U = h(D.value[I]).trim();
      if (U) return U;
      const j = I.includes(":") && I.split(":").pop() || "";
      if (j) {
        const Y = h(D.value[j]).trim();
        if (Y) return Y;
      }
    }
    return "";
  }
  function ye(p) {
    const g = ae(p);
    if (!g || Te(p) || String(B.value[g] ?? "").trim()) return "";
    const U = wt(g).trim();
    if (U) return U;
    const j = $t(p);
    if (j) return j;
    const Y = h(p.default).trim();
    if (Y) return Y;
    const oe = ot(p).map((Xe) => Xe.value).filter(Boolean);
    if (oe.length === 1) return oe[0];
    const fe = Dt(p);
    return fe.length && fe[0].score > 0 && (fe.length === 1 || fe[0].score > fe[1].score) ? fe[0].value : "";
  }
  function Dt(p) {
    return String(p.expected_kind || "").trim() !== "security.scope" ? [] : (p.suggestions || []).map((g) => {
      const I = h(g.value).trim(), U = String(g.label || "").toLowerCase(), j = String(g.description || "").toLowerCase();
      let Y = 0;
      return I || (Y -= 1e3), (U.includes("system") || j.includes("system") || j.includes("internal")) && (Y -= 50), (U.includes("admin") || j.includes("full access") || j.includes("assign sparingly")) && (Y -= 50), (j.includes("signed-in") || j.includes("authenticated")) && (Y += 30), (U === "user" || U === "member") && (Y += 20), { value: I, score: Y };
    }).filter((g) => g.value).sort((g, I) => I.score - g.score || g.value.localeCompare(I.value));
  }
  function Je() {
    const p = [];
    for (const g of V.value) {
      if (!Pe(g)) continue;
      const I = ae(g), U = ye(g);
      I && U && p.push({ name: I, value: U });
    }
    return p;
  }
  function Be(p) {
    return ye(p) !== "";
  }
  function ut(p) {
    const g = ae(p), I = ye(p);
    if (!g || !I) {
      L.value = "requirements", Q.value++;
      return;
    }
    ee(p, I);
  }
  function Ze() {
    const p = Je();
    if (!p.length) {
      L.value = "requirements", Q.value++;
      return;
    }
    for (const g of p) {
      const I = P.value.find((U) => ae(U) === g.name);
      I && ee(I, String(g.value));
    }
  }
  function Oe() {
    return V.value.filter((p) => v(B.value[ae(p)]) && (p.missing || p.value_source === "conflict" || p.expected_type || ot(p).length)).map((p) => ({ name: p.full_id || ae(p) }));
  }
  const Ee = N(() => Oe().length);
  function Me(p, g) {
    return v(g) || !Z(p, g) ? !1 : !p.expected_kind || !!p.suggestions?.some((I) => I.value === g);
  }
  function be(p) {
    const g = { ...d.value }, I = { ...B.value };
    for (const U of p) {
      const j = g[U];
      j?.value !== void 0 && (I[U] = j.value, de.add(U), delete g[U]);
    }
    return B.value = I, S(), g;
  }
  async function ze(p) {
    if (!M.value || x.value) return;
    const g = be(p), I = w;
    if (await E(), I !== w || !M.value) return;
    const U = {};
    for (const j of V.value) {
      const Y = ae(j), oe = g[Y];
      oe && v(B.value[Y]) && j.expected_type === oe.expected_type && j.expected_kind === oe.expected_kind && Me(j, oe.value) && (U[Y] = oe);
    }
    d.value = U;
  }
  function He(p) {
    const g = { ...d.value };
    for (const I of p) delete g[I];
    d.value = g;
  }
  function St(p) {
    !M.value || x.value || be(p);
  }
  async function Qe(p) {
    const g = Oe();
    if (!M.value || !g.length || x.value) return;
    Le();
    const I = w, U = new AbortController();
    l = U, x.value = !0, F.value = null, d.value = {}, await new Promise((j) => {
      let Y = !1, oe = !1;
      const fe = (ue) => {
        if (Y) return;
        if (Y = !0, clearTimeout(Xe), U.signal.aborted || I !== w || l !== U) {
          j();
          return;
        }
        l = null;
        const Ae = ue && typeof ue == "object" ? ue : {};
        if (Ae.success === !0) {
          const et = new Set(g.map((pe) => pe.name)), dt = {}, ct = new Map((Ae.requirements || []).map((pe) => [pe.full_id, pe]));
          P.value = P.value.map((pe) => ({
            ...pe,
            resolution_error: ct.get(pe.full_id)?.resolution_error
          }));
          for (const pe of Ae.parameters || []) {
            const xe = P.value.find((tt) => (tt.full_id || ae(tt)) === pe.name || ae(tt) === pe.name);
            if (!xe || !et.has(xe.full_id || ae(xe)) || !Me(xe, pe.value) || typeof pe.reason != "string" || !pe.reason.trim()) {
              F.value = { tone: "warning", code: "INVALID_CHOICE", message: "AI returns an invalid planned value or omits its reason. Choose a value manually." };
              continue;
            }
            dt[ae(xe)] = { ...xe, value: pe.value, choice_reason: pe.reason };
          }
          d.value = dt, Object.keys(dt).length ? F.value = { tone: "success", message: "Review AI suggestions before applying." } : F.value || (F.value = { tone: "warning", message: "No valid AI suggestion is available. Choose a value manually." });
        } else
          F.value = {
            tone: "warning",
            code: Ae.code,
            kind: Ae.kind,
            details: Ae.details,
            message: Ae.error || "AI could not resolve these settings. Choose a value manually."
          };
        x.value = !1, j();
      }, Xe = setTimeout(() => {
        fe({ success: !1, code: "TIMEOUT", error: "AI requirement resolution timed out." }), U.abort();
      }, 2e4);
      U.signal.addEventListener("abort", () => {
        Y || (Y = !0, clearTimeout(Xe), j());
      }, { once: !0 });
      const It = {
        component: o.component,
        ...s() ? { version: s() } : {},
        ...o.mode === "update" && o.currentId ? { current_id: o.currentId } : {},
        ...G(),
        requirements: g,
        signal: U.signal,
        accept: () => {
          Y || (oe = !0);
        },
        respond: fe
      };
      p?.dispatchEvent(new CustomEvent("instrumentRequirementResolution", { detail: It, bubbles: !0, composed: !0 })), oe || fe({ success: !1, code: "MODEL_UNAVAILABLE", error: "Configure an AI model to suggest settings, or choose values manually." });
    });
  }
  function Fe(p, g) {
    r.value = p, P.value = (p.requirements || []).filter((j) => j.name !== "required_setup" && j.short_name !== "required_setup");
    const I = qe(), U = {};
    for (const j of P.value) {
      const Y = ae(j);
      if (!Y) continue;
      const oe = String(j.name || j.short_name || Y.split(":").pop() || "");
      U[Y] = (de.has(Y) ? g[Y] : v(g[Y]) ? void 0 : g[Y]) ?? I[Y] ?? I[oe] ?? D.value[Y] ?? D.value[oe] ?? j.value ?? j.default ?? "";
    }
    B.value = U;
    for (const j of de)
      j in U || de.delete(j);
  }
  function Le() {
    l?.abort(), l = null, x.value = !1, w++, d.value = {}, F.value = null;
  }
  function Ct() {
    Le(), P.value = [], B.value = {}, de.clear(), D.value = {}, x.value = !1, F.value = null;
  }
  return {
    pendingSuggestions: d,
    pendingCount: f,
    acceptSuggestions: ze,
    rejectSuggestions: He,
    editSuggestions: St,
    displayValue: h,
    requirements: P,
    parameterValues: B,
    installedParameterHints: D,
    requirementGroups: z,
    rootRequirements: K,
    editableRequirements: V,
    transitiveRequirementCount: W,
    missingRequirements: T,
    boundRequirementCount: H,
    autoFitCount: q,
    aiResolving: x,
    aiResolutionNotice: F,
    typeInvalidRequirements: Ye,
    highlightTick: Q,
    aiResolvableCount: Ee,
    setParameter: ee,
    requirementTypeInvalid: se,
    requirementTypeHint: me,
    requirementValue: ge,
    requirementMissing: Pe,
    requirementReadOnly: Te,
    requirementOptions: ot,
    loadInstalledParameterHints: rt,
    applyPlan: Fe,
    recommendedValueFor: wt,
    hintedValueFor: $t,
    autoFitValue: ye,
    canAutoFitRequirement: Be,
    autoFitRequirement: ut,
    autoFitRequirements: Ze,
    resolveRequirementsWithAI: Qe,
    abortAI: Le,
    resetRequirements: Ct
  };
}
function cn(o) {
  return o.map(($) => [$.module, $.version || ""].join("\0")).sort().join("");
}
function js({ props: o, hub: $, plan: r, planCurrent: L, versionArg: s }) {
  const G = A(fn()), S = A(/* @__PURE__ */ new Set()), E = A(!1);
  let M = 0, P = null;
  const B = N(() => G.value.findings.filter(Bs)), D = N(() => B.value.filter((q) => !S.value.has(q.id)));
  function z(q) {
    const x = new Set(S.value);
    x.add(q.id), S.value = x;
  }
  function K() {
    const q = new Set(S.value);
    for (const x of B.value) q.add(x.id);
    S.value = q;
  }
  function V(q) {
    const x = q ? cn(q) : null;
    x !== P && (M++, P = x, G.value = { ...fn(), total: q?.length || 0 }, S.value = /* @__PURE__ */ new Set(), E.value = !1);
  }
  async function W() {
    if (!$ || !o.component || !L.value) return;
    const q = r.value?.graph || [], x = cn(q), F = ++M;
    S.value = /* @__PURE__ */ new Set(), E.value = !1, G.value = { status: "scanning", modules: [], findings: [], scanned: 0, total: q.length };
    try {
      const l = await $.scan({ component: o.component, version: s() });
      if (F !== M) return;
      const Q = Hs(l);
      if (cn(Q.modules) !== x)
        throw new Error("Security scan resolved different module versions. Refresh the install plan and scan again.");
      G.value = Q;
    } catch (l) {
      if (F === M) {
        const Q = l instanceof Lt && (l.status === 404 || l.code === "UNKNOWN" || l.code === "NETWORK");
        G.value = Q ? { status: "unavailable", modules: [], findings: [], scanned: 0, total: q.length, error: "Security scan unavailable" } : { status: "error", modules: [], findings: [], scanned: 0, total: q.length, error: Ie(l, "scan failed") };
      }
    }
  }
  function T() {
    const q = r.value?.graph || [];
    M++, G.value = {
      status: "skipped",
      modules: [],
      findings: [],
      scanned: 0,
      total: q.length,
      summary: "Security scan skipped by operator."
    }, S.value = /* @__PURE__ */ new Set(), E.value = !1;
  }
  function H() {
    M++;
  }
  return { scan: G, acknowledged: S, criticalConfirmed: E, softFindings: B, unacknowledgedSoft: D, acknowledge: z, acknowledgeAllSoft: K, resetScanForPlan: V, runScanNow: W, skipScan: T, cancelScan: H };
}
const Ks = {
  "hub.install.started": "Publishing changeset",
  "hub.install.finished": "Finalizing",
  "hub.migrations.started": "Running migrations",
  "hub.migrations.finished": "Migrations applied",
  "hub.uninstall.started": "Removing entries"
}, mn = [
  { label: "Run migrations (up)", value: "up" },
  { label: "Skip migrations (none)", value: "none" }
];
function Gs(o) {
  if (!o || typeof o != "object") return "";
  const $ = [o, o.data, o.payload, o.detail];
  for (const r of $)
    if (r && typeof r == "object" && typeof r.event == "string")
      return String(r.event);
  return "";
}
function Ws(o, $) {
  const r = Tn(yn), L = A("overview"), s = A(""), G = A("pin"), S = A([]), E = A(!1), M = N(() => [
    { label: "latest", value: "" },
    ...S.value.map((O) => String(O.version || "")).filter(Boolean).map((O) => ({ label: O, value: O }))
  ]), P = N(() => S.value.find((O) => O.version === s.value) || S.value[0]);
  function B() {
    const O = s.value.trim().replace(/^>=?/, "");
    if (O)
      return G.value === "track" ? `>=${O}` : O;
  }
  const D = N(() => o.installedDep ? it(o.installedDep) : ""), z = A(""), K = A(!1), V = A(null), W = A(!1), T = A(!1), H = A(null), q = A(null), x = A(null), F = N(() => (V.value?.graph || []).filter((O) => O.direct || O.module === o.component)), l = N(() => (V.value?.graph || []).filter((O) => !O.direct && O.module !== o.component)), Q = N(() => Wn(V.value?.graph || [])), d = N(() => {
    const O = [], ce = (re, Se) => {
      for (const C of re)
        O.push({ ...C, level: Se }), ce(C.children, Se + 1);
    };
    return ce(Q.value, 0), O;
  }), f = N(() => V.value?.module_count || V.value?.graph?.length || 0), w = N(() => (V.value?.graph || []).reduce((O, ce) => O + (ce.size_bytes || 0), 0));
  function de(O) {
    return Zn(O, { currentVersion: D.value, targetModule: o.component });
  }
  const v = Fs({ props: o, hub: r, plan: V, activeSection: L, versionArg: B, requirementPayload: ht, invalidatePlan: y, refreshPlan: kt, planCurrent: T }), {
    pendingSuggestions: h,
    pendingCount: b,
    acceptSuggestions: R,
    rejectSuggestions: Z,
    editSuggestions: ee,
    displayValue: se,
    requirements: me,
    requirementGroups: Ye,
    rootRequirements: ge,
    transitiveRequirementCount: Pe,
    parameterValues: Te,
    editableRequirements: ot,
    missingRequirements: qe,
    boundRequirementCount: rt,
    autoFitCount: wt,
    aiResolvableCount: $t,
    aiResolving: ye,
    aiResolutionNotice: Dt,
    resolveRequirementsWithAI: Je,
    highlightTick: Be,
    setParameter: ut,
    requirementValue: Ze,
    requirementMissing: Oe,
    requirementReadOnly: Ee,
    requirementOptions: Me,
    typeInvalidRequirements: be,
    requirementTypeInvalid: ze,
    requirementTypeHint: He,
    canAutoFitRequirement: St,
    autoFitRequirement: Qe,
    autoFitRequirements: Fe,
    loadInstalledParameterHints: Le,
    applyPlan: Ct,
    resetRequirements: p,
    abortAI: g
  } = v, I = A("up"), U = A([]), j = N(() => U.value.length > 0), Y = N({
    get: () => j.value ? "up" : I.value,
    set: (O) => {
      I.value = O;
    }
  }), oe = N(() => j.value ? [mn[0]] : mn), fe = N(() => V.value?.migrations || []), Xe = N(() => V.value?.dependency?.id || V.value?.install_payload?.id || ""), It = js({ props: o, hub: r, plan: V, planCurrent: T, versionArg: B }), {
    scan: ue,
    acknowledged: Ae,
    criticalConfirmed: et,
    softFindings: dt,
    unacknowledgedSoft: ct,
    acknowledge: pe,
    acknowledgeAllSoft: xe,
    resetScanForPlan: tt,
    runScanNow: je,
    skipScan: zt,
    cancelScan: xt
  } = It, ft = N(() => {
    const O = W.value || ye.value ? { tone: "loading" } : b.value ? { tone: "warn", badge: String(b.value) } : qe.value.length || be.value.length ? { tone: "danger", badge: String(qe.value.length + be.value.length) } : me.value.length ? { tone: "ok" } : { tone: "none" }, ce = {
      scanning: "loading",
      clean: "ok",
      warnings: "warn",
      critical: "danger",
      error: "danger",
      unavailable: "none",
      idle: "none",
      skipped: "none"
    }[ue.value.status] || "none";
    return {
      overview: { tone: "none" },
      modules: W.value ? { tone: "loading" } : V.value ? { tone: "none", badge: String(f.value) } : { tone: "none" },
      requirements: O,
      scan: { tone: ce, badge: ue.value.findings.length ? String(ue.value.findings.length) : void 0 },
      review: fe.value.length ? { tone: "none", badge: String(fe.value.length) } : { tone: "none" }
    };
  }), Ue = A(!1), De = A(!1), mt = A(null), vt = A(null), he = A(null), nt = A(null), Ht = N(() => vn(mt.value || nt.value)), gt = A(""), st = A(0);
  let at = null, Ke = null, ke = 0, Ge = 0, ve = 0;
  function Vt() {
    gt.value = "", st.value = 0;
    const O = Date.now();
    at = setInterval(() => {
      st.value = Math.floor((Date.now() - O) / 1e3);
    }, 250);
    try {
      const ce = Xn("keeper.hub", (re) => {
        const Se = Ks[Gs(re)];
        Se && (gt.value = Se);
      });
      Ke = typeof ce == "function" ? ce : null;
    } catch {
      Ke = null;
    }
  }
  function _e() {
    if (at && (clearInterval(at), at = null), Ke) {
      try {
        Ke();
      } catch {
      }
      Ke = null;
    }
  }
  function ht() {
    const O = [], ce = [];
    for (const re of ot.value) {
      const Se = ae(re);
      if (!Se) continue;
      const C = Te.value[Se], te = typeof C == "string" ? C.trim() : C;
      if (te == null || te === "") continue;
      (en(re, o.component) ? ce : O).push({ name: Se, value: te });
    }
    return {
      parameters: O.length ? O : void 0,
      requirement_bindings: ce.length ? ce : void 0
    };
  }
  function Rt(O, ce) {
    const re = Ln?.toast;
    typeof re == "function" && re({ severity: O === "ok" ? "success" : "error", summary: ce });
  }
  async function yt(O) {
    if (!r || !o.component || !T.value || V.value?.applicable === !1 || b.value || ye.value) return;
    const ce = ++ve, re = () => ce === ve && o.open;
    O ? De.value = !0 : Ue.value = !0, mt.value = null, he.value = null, vt.value = null, nt.value = null, O || Vt();
    let Se = !1;
    try {
      const C = await r.install({
        component: o.component,
        version: B(),
        id: o.mode === "update" && o.currentId ? o.currentId : void 0,
        dry_run: O || void 0,
        migration_policy: Y.value,
        ...ht()
      });
      if (!re()) return;
      if (C.success !== !0) throw new Lt("INSTALL_INCOMPLETE", "Keeper does not confirm a successful install.", void 0, C);
      if (O || await Qn(r, U.value, {
        isCurrent: re,
        onPhase: (te) => {
          gt.value = te;
        }
      }), !re()) return;
      if (mt.value = C, !O) {
        const te = o.mode === "update" ? "updated" : "installed";
        Rt("ok", `Module ${te}: ${C.dependency?.id || o.component}`), kn(), Se = !0;
      }
    } catch (C) {
      if (!re()) return;
      We("install:run", C), C instanceof Lt && (he.value = C.code, nt.value = C.details), vt.value = Ie(C, O ? "preview failed" : "install failed"), Rt("error", vt.value);
    } finally {
      ce === ve && (O ? De.value = !1 : (Ue.value = !1, _e()));
    }
    Se && $("changed");
  }
  const we = N(() => !V.value || H.value ? "modules" : b.value || ye.value || qe.value.length || be.value.length || !T.value || V.value.applicable === !1 || me.value.some((O) => O.invalid) ? "requirements" : ue.value.status === "idle" || ue.value.status === "scanning" || ue.value.status === "critical" && !et.value || ct.value.length ? "scan" : null), Mt = N(() => Ue.value || De.value || W.value || !V.value || !!H.value || !T.value || b.value > 0 || ye.value || ue.value.status === "scanning" || L.value === "scan" && ue.value.status === "idle"), At = N(() => {
    if (b.value) return `Review ${b.value} AI suggestion${b.value === 1 ? "" : "s"}`;
    if (ye.value) return "Resolving settings…";
    if (!T.value) return "Validating settings…";
    const O = qe.value.length;
    return O ? `${O} required setting${O === 1 ? "" : "s"} missing` : "Review requirement errors";
  }), Nt = N(() => Ue.value || De.value || W.value || !V.value || !!H.value || !T.value || b.value > 0 || ye.value), pt = N(() => Ue.value ? o.mode === "update" ? "Updating…" : "Installing…" : we.value === "scan" && ue.value.status === "idle" ? L.value === "scan" ? "Choose scan option" : "Review scan choice" : we.value === "scan" && L.value === "scan" && (ue.value.status === "warnings" || ue.value.status === "critical") ? "Install anyway" : o.mode === "update" ? "Update" : "Install");
  function Pt() {
    if (Mt.value) return;
    const O = we.value;
    if (O === "requirements") {
      L.value = "requirements", Be.value++;
      return;
    }
    if (O === "scan") {
      if (L.value !== "scan") {
        L.value = "scan";
        return;
      }
      if (ue.value.status === "idle" || ue.value.status === "scanning" || ue.value.status === "critical" && !et.value || (xe(), we.value)) return;
    }
    if (O === "modules") {
      L.value = "modules";
      return;
    }
    yt(!1);
  }
  function bt() {
    if (!T.value || V.value?.applicable === !1 || b.value || ye.value || me.value.some((O) => O.invalid) || qe.value.length || be.value.length) {
      L.value = "requirements", Be.value++;
      return;
    }
    L.value = "review", yt(!0);
  }
  async function kt() {
    if (!r || !o.component) return;
    $e && (clearTimeout($e), $e = null);
    const O = ++ke;
    T.value = !1, W.value = !0, H.value = null, q.value = null, x.value = null;
    const ce = { ...Te.value };
    try {
      const re = await r.planInstall({
        component: o.component,
        version: B(),
        id: o.mode === "update" && o.currentId ? o.currentId : void 0,
        run_migrations: Y.value === "up",
        ...ht()
      });
      if (O !== ke || !o.open) return;
      const Se = Jn(re.requirements || []);
      U.value = Se, Ct(re, ce), T.value = !0, tt(re.graph || []);
    } catch (re) {
      if (O !== ke || !o.open) return;
      We("install:plan", re), V.value = null, ue.value = fn(), H.value = Ie(re, "failed to plan install"), re instanceof Lt && (q.value = re.code, x.value = re.details);
    } finally {
      O === ke && (W.value = !1);
    }
  }
  let $e = null;
  function y() {
    ke++, T.value = !1, g(), m();
  }
  function m() {
    $e && clearTimeout($e), $e = setTimeout(() => {
      kt();
    }, 350);
  }
  async function Ve() {
    if (S.value = [], !(!r || !o.component)) {
      E.value = !0;
      try {
        const O = await r.listVersions(o.component);
        S.value = O.items || [];
      } catch (O) {
        We("install:versions", O);
      } finally {
        E.value = !1;
      }
    }
  }
  async function on() {
    if (z.value = "", !(!r || !o.component)) {
      K.value = !0;
      try {
        const O = await r.getReadme(o.component);
        z.value = O.content || "";
      } catch {
      } finally {
        K.value = !1;
      }
    }
  }
  function rn() {
    ke++, L.value = "overview", V.value = null, T.value = !1, U.value = [], Ue.value = !1, De.value = !1, H.value = null, q.value = null, x.value = null, Y.value = "up", mt.value = null, vt.value = null, he.value = null, nt.value = null, p(), tt(), z.value = "", S.value = [];
  }
  async function Zt() {
    const O = ++Ge;
    rn(), s.value = o.mode === "update" ? "" : o.version || "", G.value = "track", await Promise.all([Ve(), on(), Le()]), !(!o.open || O !== Ge) && (o.mode === "update" && !s.value && S.value.length && (s.value = String(S.value[0].version || "")), await kt());
  }
  Ne(() => o.open, (O) => {
    if (O) {
      Zt();
      return;
    }
    g(), _e(), ve++, Ue.value = !1, De.value = !1, Ge++, ke++, xt(), $e && (clearTimeout($e), $e = null);
  }, { immediate: !0 }), Ne([s, G], () => {
    o.open && r && y();
  }, { flush: "sync" }), Ne(Y, () => {
    o.open && r && V.value && y();
  }, { flush: "sync" }), gn(() => {
    ve++, g(), _e(), Ge++, ke++, xt(), $e && clearTimeout($e);
  });
  function Ut() {
    g(), ve++, Ue.value = !1, De.value = !1, _e(), $("close");
  }
  return {
    // nav
    activeSection: L,
    sectionStatus: ft,
    blockingSection: we,
    // version
    version: s,
    versionMode: G,
    versionOptions: M,
    versionsLoading: E,
    versionMeta: P,
    currentVersion: D,
    // overview
    readme: z,
    readmeLoading: K,
    // plan
    plan: V,
    planCurrent: T,
    planLoading: W,
    planError: H,
    planCode: q,
    planErrorDetails: x,
    directModules: F,
    transitiveModules: l,
    planTree: Q,
    planRows: d,
    moduleCount: f,
    totalSize: w,
    badgesForNode: de,
    // requirements
    requirements: me,
    requirementGroups: Ye,
    rootRequirements: ge,
    editableRequirements: ot,
    transitiveRequirementCount: Pe,
    parameterValues: Te,
    missingRequirements: qe,
    boundRequirementCount: rt,
    autoFitCount: wt,
    aiResolvableCount: $t,
    aiResolving: ye,
    aiResolutionNotice: Dt,
    resolveRequirementsWithAI: Je,
    pendingSuggestions: h,
    pendingCount: b,
    acceptSuggestions: R,
    rejectSuggestions: Z,
    editSuggestions: ee,
    displayValue: se,
    highlightTick: Be,
    setParameter: ut,
    requirementValue: Ze,
    requirementMissing: Oe,
    requirementReadOnly: Ee,
    requirementOptions: Me,
    requirementConfiguredBy: Yn,
    typeInvalidRequirements: be,
    requirementTypeInvalid: ze,
    requirementTypeHint: He,
    canAutoFitRequirement: St,
    autoFitRequirement: Qe,
    autoFitRequirements: Fe,
    // review / options
    requiredSetup: j,
    migrationPolicy: Y,
    migrationOptions: oe,
    migrations: fe,
    destinationId: Xe,
    INSTALL_MIGRATION_OPTIONS: mn,
    // scan
    scan: ue,
    acknowledged: Ae,
    criticalConfirmed: et,
    softFindings: dt,
    unacknowledgedSoft: ct,
    acknowledge: pe,
    acknowledgeAllSoft: xe,
    runScanNow: je,
    skipScan: zt,
    // execution
    running: Ue,
    dryRunning: De,
    result: mt,
    resultError: vt,
    resultCode: he,
    resultErrorDetails: nt,
    resultExecution: Ht,
    executionStepLabel: Un,
    progressPhase: gt,
    elapsedSec: st,
    requirementStatusMessage: At,
    primaryDisabled: Mt,
    previewDisabled: Nt,
    primaryLabel: pt,
    primaryAction: Pt,
    preview: bt,
    refreshPlan: kt,
    close: Ut
  };
}
const Ys = { class: "km-2p-head-icon" }, Js = { class: "km-2p-head-text" }, Zs = { class: "km-2p-head-title" }, Qs = { class: "km-2p-head-sub" }, Xs = { class: "km-dim km-mono" }, ea = { class: "km-2p" }, ta = {
  class: "km-2p-nav",
  "aria-label": "Install steps"
}, na = ["onClick"], sa = { class: "km-2p-navlabel" }, aa = { class: "km-2p-navstatus" }, la = {
  key: 2,
  class: "km-dot km-dot-danger",
  "aria-hidden": "true"
}, ia = {
  key: 3,
  class: "km-dot km-dot-warn",
  "aria-hidden": "true"
}, oa = {
  key: 4,
  class: "km-navbadge"
}, ra = { class: "km-sec" }, ua = { class: "km-ov-hero" }, da = { class: "km-ov-icon" }, ca = { class: "km-grow km-min0" }, ma = { class: "km-row-wrap" }, va = { class: "km-ov-name" }, pa = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, ka = {
  key: 1,
  class: "badge-warn kx-tag-caps"
}, fa = { class: "km-ov-org km-mono" }, ga = {
  key: 0,
  class: "km-ov-desc"
}, ha = {
  key: 1,
  class: "km-hint"
}, ya = { class: "km-field" }, ba = {
  class: "km-seg",
  role: "group",
  "aria-label": "Version mode"
}, _a = ["aria-pressed"], wa = ["aria-pressed"], $a = { class: "km-hint" }, Sa = { class: "km-ov-meta" }, Ca = { class: "km-meta-row" }, Ia = {
  key: 0,
  class: "km-meta-row"
}, xa = {
  key: 1,
  class: "km-meta-row"
}, Ra = ["title"], Ma = {
  key: 2,
  class: "km-meta-row"
}, Aa = {
  key: 3,
  class: "km-meta-row"
}, Ua = {
  key: 4,
  class: "km-meta-row"
}, Ta = {
  key: 5,
  class: "km-meta-row"
}, Ea = {
  key: 2,
  class: "km-loading"
}, La = {
  key: 3,
  class: "km-ov-readme"
}, Da = { class: "km-sec" }, Va = {
  key: 1,
  class: "km-msg km-msg-err"
}, Na = {
  key: 0,
  class: "km-code"
}, Pa = { class: "km-sec-title" }, qa = {
  key: 0,
  class: "km-dim"
}, Ba = {
  key: 1,
  class: "km-tree-spacer",
  "aria-hidden": "true"
}, Oa = { class: "km-mrow-badge kx-tag-caps" }, za = { class: "km-mrow-name km-mono" }, Ha = {
  key: 2,
  class: "km-mrow-ver km-mono"
}, Fa = {
  key: 3,
  class: "km-dim km-mono"
}, ja = {
  key: 4,
  class: "km-dim"
}, Ka = { class: "km-sec" }, Ga = {
  key: 1,
  class: "km-empty-inline"
}, Wa = { class: "km-sec-title" }, Ya = { class: "km-dim" }, Ja = { class: "km-req-toolbar" }, Za = {
  key: 0,
  class: "km-code"
}, Qa = {
  key: 1,
  class: "km-code"
}, Xa = {
  key: 2,
  class: "km-mono"
}, el = {
  key: 1,
  class: "km-req-toolbar",
  role: "status"
}, tl = { class: "km-grow" }, nl = { class: "km-req-group-head" }, sl = { class: "km-mono" }, al = {
  key: 0,
  class: "km-dim"
}, ll = { class: "km-req-meta" }, il = { class: "km-mono km-req-name" }, ol = {
  key: 0,
  class: "km-req-flag"
}, rl = {
  key: 1,
  class: "km-chip km-mono"
}, ul = ["aria-label", "disabled", "value", "list", "placeholder", "onInput"], dl = ["id"], cl = ["value", "title"], ml = {
  key: 1,
  class: "km-readonly-field km-mono"
}, vl = { class: "km-req-foot" }, pl = {
  key: 0,
  class: "km-req-src"
}, kl = {
  key: 1,
  class: "km-req-invalid"
}, fl = {
  key: 2,
  class: "km-req-invalid"
}, gl = {
  key: 3,
  class: "km-req-info"
}, hl = {
  key: 4,
  class: "km-req-info"
}, yl = ["aria-label"], bl = { class: "km-mono" }, _l = { class: "km-row-gap" }, wl = {
  key: 3,
  class: "km-msg km-msg-err",
  role: "alert"
}, $l = { class: "km-code" }, Sl = { key: 0 }, Cl = {
  key: 4,
  class: "km-req-desc"
}, Il = { class: "km-sec" }, xl = { class: "km-sec-title" }, Rl = {
  key: 0,
  class: "km-scan-run"
}, Ml = {
  key: 1,
  class: "km-msg km-msg-info"
}, Al = {
  key: 2,
  class: "km-scan-run"
}, Ul = { class: "km-grow" }, Tl = {
  key: 3,
  class: "km-empty-inline"
}, El = {
  key: 4,
  class: "km-msg km-msg-err"
}, Ll = {
  key: 5,
  class: "km-msg km-msg-info"
}, Dl = {
  key: 0,
  class: "km-scan-overall"
}, Vl = {
  key: 1,
  class: "km-msg km-msg-err"
}, Nl = { class: "km-scan-mod-head" }, Pl = { class: "km-mono km-scan-mod-name" }, ql = { class: "km-chip" }, Bl = {
  key: 0,
  class: "km-scan-mod-sum"
}, Ol = { class: "km-grow km-min0" }, zl = { class: "km-finding-head" }, Hl = { class: "km-finding-title" }, Fl = {
  key: 0,
  class: "km-finding-detail"
}, jl = {
  key: 1,
  class: "km-finding-loc km-mono"
}, Kl = ["onClick"], Gl = {
  key: 1,
  class: "km-dim km-scan-mod-clean"
}, Wl = {
  key: 2,
  class: "km-check km-mt"
}, Yl = { class: "km-sec" }, Jl = { class: "km-sec-title" }, Zl = { class: "km-review-grid" }, Ql = { class: "km-review-tile" }, Xl = { class: "km-review-tile" }, ei = { class: "km-review-tile" }, ti = { class: "km-review-tile" }, ni = { class: "km-field" }, si = {
  key: 0,
  class: "km-hint"
}, ai = {
  key: 1,
  class: "km-mig-list"
}, li = { class: "km-mono km-trunc" }, ii = { class: "km-chip" }, oi = { class: "km-hint" }, ri = { class: "km-adv" }, ui = { class: "km-adv-body" }, di = { class: "km-meta-row" }, ci = { class: "km-mono" }, mi = { class: "km-meta-row" }, vi = { class: "km-mono" }, pi = {
  key: 0,
  class: "km-panel km-panel-ok"
}, ki = { class: "km-panel-title" }, fi = {
  key: 0,
  class: "km-dim"
}, gi = {
  key: 1,
  class: "km-dim"
}, hi = {
  key: 0,
  class: "km-dim"
}, yi = {
  key: 1,
  class: "km-ledger"
}, bi = { class: "km-ledger-step" }, _i = { class: "km-grow" }, wi = { class: "km-chip" }, $i = {
  key: 0,
  class: "km-ledger-msg"
}, Si = {
  key: 2,
  class: "km-msg km-msg-err"
}, Ci = {
  key: 0,
  class: "km-code"
}, Ii = {
  key: 0,
  class: "km-running km-2p-progress"
}, xi = { class: "km-grow km-running-label" }, Ri = { class: "km-dim" }, Mi = {
  key: 0,
  class: "km-foot-note"
}, Ai = /* @__PURE__ */ Ot({
  __name: "InstallDialog",
  props: {
    open: { type: Boolean },
    mode: {},
    component: {},
    version: {},
    currentId: {},
    catalogItem: {},
    installedDep: {}
  },
  emits: ["close", "changed"],
  setup(o, { emit: $ }) {
    const r = o, s = Ws(r, $), G = [
      { key: "overview", label: "Overview", icon: "tabler:info-circle" },
      { key: "modules", label: "Modules", icon: "tabler:hierarchy-2" },
      { key: "requirements", label: "Requirements", icon: "tabler:adjustments" },
      { key: "scan", label: "Security scan", icon: "tabler:shield-check" },
      { key: "review", label: "Review & install", icon: "tabler:checklist" }
    ], S = N(() => r.catalogItem || { full_name: r.component, component: r.component }), E = N(() => Yt(S.value)), M = N(() => r.mode === "update" ? "Update module" : "Install module");
    function P(F) {
      const l = s.requirementOptions(F), Q = s.requirementValue(F);
      return Q && !l.some((d) => d.value === Q) ? [{ label: `${Q} (current)`, value: Q }, ...l] : l;
    }
    function B(F) {
      return `km-req-options-${ae(F).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    }
    function D(F) {
      return {
        provided: "you set this",
        provided_bare: "you set this",
        existing: "auto-detected",
        existing_bare: "auto-detected",
        default: "package default",
        registry: "from registry",
        conflict: "multiple candidates — pick one"
      }[String(F.value_source || "")] || "";
    }
    const z = A(null), K = A(!1);
    let V;
    gn(() => clearTimeout(V)), Ne(() => s.highlightTick.value, async (F, l, Q) => {
      let d = !0;
      if (Q(() => {
        d = !1;
      }), s.activeSection.value !== "requirements" || (await Gt(), !d)) return;
      z.value?.querySelector(".km-req.is-missing, .km-req.is-invalid")?.scrollIntoView({ block: "center", behavior: "smooth" }), K.value = !0, clearTimeout(V), V = setTimeout(() => {
        K.value = !1;
      }, 1200);
    });
    function W(F) {
      return xn[F.severity].tone;
    }
    function T(F) {
      return F === "critical" || F === "error" ? "km-dot-danger" : F === "warnings" ? "km-dot-warn" : "km-dot-ok";
    }
    function H(F) {
      return `km-plan-badge kx-tag-caps km-plan-badge-${F}`;
    }
    function q(F) {
      return F === "failed" || F === "rollback_failed" ? "km-ledger-bad" : F === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok";
    }
    const x = N(() => s.progressPhase.value || (r.mode === "update" ? "Updating…" : "Installing…"));
    return hn(() => {
      En("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (F, l) => {
      const Q = An("wc-render-markdown");
      return n(), Ce(ys, {
        visible: o.open,
        busy: e(s).running.value || e(s).dryRunning.value,
        label: M.value,
        class: "km-dialog km-dialog-2p",
        "header-class": "km-modal-head km-2p-head",
        "content-class": "km-dialog-content km-dialog-content-2p",
        "footer-class": "km-modal-foot km-2p-foot",
        style: Et({ "--accent": E.value }),
        onClose: l[19] || (l[19] = (d) => e(s).close())
      }, {
        header: X(() => [
          t("span", Ys, [
            u(e(k), {
              icon: e(Bt)(S.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          t("span", Js, [
            t("span", Zs, i(M.value), 1),
            t("span", Qs, [
              _(i(e(qt)(S.value)) + " ", 1),
              t("span", Xs, i(r.component), 1)
            ])
          ])
        ]),
        footer: X(() => [
          e(s).running.value ? (n(), a("div", Ii, [
            u(e(k), {
              icon: "tabler:loader-2",
              class: "km-i spin km-accent",
              "aria-hidden": "true"
            }),
            t("span", xi, i(x.value), 1),
            t("span", Ri, i(e(s).elapsedSec.value) + "s", 1)
          ])) : (n(), a(J, { key: 1 }, [
            e(s).blockingSection.value === "requirements" ? (n(), a("span", Mi, [
              u(e(k), {
                icon: "tabler:alert-triangle",
                class: "km-i-sm",
                "aria-hidden": "true"
              }),
              _(" " + i(e(s).requirementStatusMessage.value), 1)
            ])) : c("", !0),
            e(s).blockingSection.value === "requirements" ? (n(), Ce(e(le), {
              key: 1,
              size: "small",
              severity: "secondary",
              outlined: "",
              disabled: e(s).autoFitCount.value === 0,
              onClick: l[15] || (l[15] = (d) => e(s).autoFitRequirements())
            }, {
              default: X(() => [
                u(e(k), {
                  icon: "tabler:wand",
                  class: "km-i",
                  "aria-hidden": "true"
                }),
                l[75] || (l[75] = _(" Auto-fit ", -1))
              ]),
              _: 1
            }, 8, ["disabled"])) : c("", !0),
            l[78] || (l[78] = t("span", { class: "km-grow" }, null, -1)),
            u(e(le), {
              size: "small",
              severity: "secondary",
              text: "",
              onClick: l[16] || (l[16] = (d) => e(s).close())
            }, {
              default: X(() => [...l[76] || (l[76] = [
                _("Cancel", -1)
              ])]),
              _: 1
            }),
            u(e(le), {
              size: "small",
              severity: "secondary",
              outlined: "",
              disabled: e(s).previewDisabled.value,
              onClick: l[17] || (l[17] = (d) => e(s).preview())
            }, {
              default: X(() => [
                u(e(k), {
                  icon: e(s).dryRunning.value ? "tabler:loader-2" : "tabler:eye",
                  class: ne(["km-i", e(s).dryRunning.value && "spin"]),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"]),
                l[77] || (l[77] = _(" Preview changes ", -1))
              ]),
              _: 1
            }, 8, ["disabled"]),
            u(e(le), {
              size: "small",
              disabled: e(s).primaryDisabled.value,
              onClick: l[18] || (l[18] = (d) => e(s).primaryAction())
            }, {
              default: X(() => [
                u(e(k), {
                  icon: r.mode === "update" ? "tabler:refresh-dot" : "tabler:download",
                  class: "km-i",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                _(" " + i(e(s).primaryLabel.value), 1)
              ]),
              _: 1
            }, 8, ["disabled"])
          ], 64))
        ]),
        default: X(() => [
          t("div", ea, [
            t("nav", ta, [
              (n(), a(J, null, ie(G, (d) => t("button", {
                key: d.key,
                class: ne(["km-2p-navitem", { active: e(s).activeSection.value === d.key }]),
                onClick: (f) => e(s).activeSection.value = d.key
              }, [
                u(e(k), {
                  icon: d.icon,
                  class: "km-i",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                t("span", sa, i(d.label), 1),
                t("span", aa, [
                  e(s).sectionStatus.value[d.key].tone === "loading" ? (n(), Ce(e(k), {
                    key: 0,
                    icon: "tabler:loader-2",
                    class: "km-i-sm spin km-dim",
                    "aria-hidden": "true"
                  })) : e(s).sectionStatus.value[d.key].tone === "ok" ? (n(), Ce(e(k), {
                    key: 1,
                    icon: "tabler:circle-check-filled",
                    class: "km-i-sm km-sev-ok-fg",
                    "aria-hidden": "true"
                  })) : e(s).sectionStatus.value[d.key].tone === "danger" ? (n(), a("span", la)) : e(s).sectionStatus.value[d.key].tone === "warn" ? (n(), a("span", ia)) : c("", !0),
                  e(s).sectionStatus.value[d.key].badge ? (n(), a("span", oa, i(e(s).sectionStatus.value[d.key].badge), 1)) : c("", !0)
                ])
              ], 10, na)), 64))
            ]),
            t("div", {
              ref_key: "mainRef",
              ref: z,
              class: "km-2p-main"
            }, [
              lt(t("section", ra, [
                t("div", ua, [
                  t("span", da, [
                    u(e(k), {
                      icon: e(Bt)(S.value),
                      class: "km-i-lg",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  t("div", ca, [
                    t("div", ma, [
                      t("span", va, i(e(qt)(S.value)), 1),
                      e(jt)(S.value) ? (n(), a("span", pa, "app")) : c("", !0),
                      S.value.deprecated ? (n(), a("span", ka, "deprecated")) : c("", !0)
                    ]),
                    t("div", fa, i(r.component), 1)
                  ])
                ]),
                S.value.description ? (n(), a("p", ga, i(S.value.description), 1)) : c("", !0),
                r.mode === "update" && !r.currentId ? (n(), a("p", ha, " Updating this module creates an application root dependency for the selected version. This version also applies to modules that depend on it; the plan shows any conflicts. ")) : c("", !0),
                t("div", ya, [
                  l[21] || (l[21] = t("label", { class: "km-label" }, "Version", -1)),
                  u(In, {
                    modelValue: e(s).version.value,
                    "onUpdate:modelValue": l[0] || (l[0] = (d) => e(s).version.value = d),
                    items: e(s).versionOptions.value.map((d) => ({ id: d.value, title: d.label })),
                    placeholder: "latest",
                    "aria-label": "Version"
                  }, null, 8, ["modelValue", "items"]),
                  t("div", ba, [
                    t("button", {
                      class: ne(["km-seg-btn", { active: e(s).versionMode.value === "pin" }]),
                      "aria-pressed": e(s).versionMode.value === "pin",
                      onClick: l[1] || (l[1] = (d) => e(s).versionMode.value = "pin")
                    }, [
                      u(e(k), {
                        icon: "tabler:pin",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      _(" Pin " + i(e(s).version.value || "latest"), 1)
                    ], 10, _a),
                    t("button", {
                      class: ne(["km-seg-btn", { active: e(s).versionMode.value === "track" }]),
                      "aria-pressed": e(s).versionMode.value === "track",
                      onClick: l[2] || (l[2] = (d) => e(s).versionMode.value = "track")
                    }, [
                      u(e(k), {
                        icon: "tabler:arrow-up-circle",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      l[20] || (l[20] = _(" Track updates ", -1))
                    ], 10, wa)
                  ]),
                  t("p", $a, i(e(s).versionMode.value === "pin" ? "Locks to this exact version; future updates are manual." : `Tracks ${e(s).version.value ? "≥ " + e(s).version.value : "all"} releases on the next resolve.`), 1)
                ]),
                t("div", Sa, [
                  t("div", Ca, [
                    u(e(k), {
                      icon: "tabler:download",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    l[22] || (l[22] = t("span", null, "Downloads", -1)),
                    t("b", null, i(e(Jt)(S.value.total_downloads)), 1)
                  ]),
                  S.value.favorites_count ? (n(), a("div", Ia, [
                    u(e(k), {
                      icon: "tabler:star",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    l[23] || (l[23] = t("span", null, "Favorites", -1)),
                    t("b", null, i(S.value.favorites_count), 1)
                  ])) : c("", !0),
                  S.value.license ? (n(), a("div", xa, [
                    u(e(k), {
                      icon: "tabler:license",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    l[24] || (l[24] = t("span", null, "License", -1)),
                    t("b", {
                      title: S.value.license
                    }, i(e(an)(S.value.license)), 9, Ra)
                  ])) : c("", !0),
                  S.value.type ? (n(), a("div", Ma, [
                    u(e(k), {
                      icon: "tabler:category",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    l[25] || (l[25] = t("span", null, "Type", -1)),
                    t("b", null, i(S.value.type), 1)
                  ])) : c("", !0),
                  e(s).versionMeta.value?.entry_count ? (n(), a("div", Aa, [
                    u(e(k), {
                      icon: "tabler:list-numbers",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    l[26] || (l[26] = t("span", null, "Entries", -1)),
                    t("b", null, i(e(s).versionMeta.value.entry_count), 1)
                  ])) : c("", !0),
                  e(s).versionMeta.value?.size_bytes ? (n(), a("div", Ua, [
                    u(e(k), {
                      icon: "tabler:weight",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    l[27] || (l[27] = t("span", null, "Size", -1)),
                    t("b", null, i(e(Kt)(e(s).versionMeta.value.size_bytes)), 1)
                  ])) : c("", !0),
                  S.value.update_time ? (n(), a("div", Ta, [
                    u(e(k), {
                      icon: "tabler:clock",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    l[28] || (l[28] = t("span", null, "Updated", -1)),
                    t("b", null, i(e(ln)(S.value.update_time, { maxUnit: "year" })), 1)
                  ])) : c("", !0)
                ]),
                e(s).readmeLoading.value ? (n(), a("div", Ea, [
                  u(e(k), {
                    icon: "tabler:loader-2",
                    class: "km-i spin",
                    "aria-hidden": "true"
                  }),
                  l[29] || (l[29] = _(" Loading README…", -1))
                ])) : e(s).readme.value ? (n(), a("article", La, [
                  u(Q, {
                    source: e(s).readme.value
                  }, null, 8, ["source"])
                ])) : c("", !0)
              ], 512), [
                [Ft, e(s).activeSection.value === "overview"]
              ]),
              lt(t("section", Da, [
                e(s).planLoading.value ? (n(), a(J, { key: 0 }, [
                  l[30] || (l[30] = t("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "40%" }
                  }, null, -1)),
                  (n(), a(J, null, ie(4, (d) => t("div", {
                    class: "km-skel km-skel-card",
                    key: d
                  })), 64))
                ], 64)) : e(s).planError.value ? (n(), a("div", Va, [
                  e(s).planCode.value ? (n(), a("span", Na, i(e(s).planCode.value), 1)) : c("", !0),
                  _(i(e(s).planError.value), 1)
                ])) : e(s).plan.value ? (n(), a(J, { key: 2 }, [
                  t("div", Pa, [
                    u(e(k), {
                      icon: "tabler:hierarchy-2",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    _(" Installs " + i(e(s).moduleCount.value) + " module" + i(e(s).moduleCount.value === 1 ? "" : "s") + " ", 1),
                    e(s).totalSize.value ? (n(), a("span", qa, "· " + i(e(Kt)(e(s).totalSize.value)), 1)) : c("", !0)
                  ]),
                  l[32] || (l[32] = t("p", { class: "km-hint" }, "Includes these dependencies at the versions shown.", -1)),
                  (n(!0), a(J, null, ie(e(s).planRows.value, (d) => (n(), a("div", {
                    key: d.path || d.module,
                    class: ne(["km-mrow", { "km-mrow-direct": d.direct || d.module === r.component, "km-mrow-transitive": !(d.direct || d.module === r.component) }]),
                    style: Et({ "--tree-level": d.level })
                  }, [
                    d.level > 0 ? (n(), Ce(e(k), {
                      key: 0,
                      icon: "tabler:corner-down-right",
                      class: "km-i-sm km-dim",
                      "aria-hidden": "true"
                    })) : (n(), a("span", Ba)),
                    t("span", Oa, i(d.direct || d.module === r.component ? "direct" : "transitive"), 1),
                    t("span", za, i(d.module), 1),
                    d.version ? (n(), a("span", Ha, i(d.version), 1)) : c("", !0),
                    d.constraint ? (n(), a("span", Fa, i(d.constraint), 1)) : c("", !0),
                    l[31] || (l[31] = t("span", { class: "km-grow" }, null, -1)),
                    (n(!0), a(J, null, ie(e(s).badgesForNode(d), (f) => (n(), a("span", {
                      key: f.label,
                      class: ne(H(f.tone))
                    }, i(f.label), 3))), 128)),
                    d.size_bytes ? (n(), a("span", ja, i(e(Kt)(d.size_bytes)), 1)) : c("", !0)
                  ], 6))), 128))
                ], 64)) : c("", !0)
              ], 512), [
                [Ft, e(s).activeSection.value === "modules"]
              ]),
              lt(t("section", Ka, [
                e(s).planLoading.value ? (n(), a(J, { key: 0 }, [
                  l[33] || (l[33] = t("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "30%" }
                  }, null, -1)),
                  (n(), a(J, null, ie(3, (d) => t("div", {
                    class: "km-skel km-skel-field",
                    key: d
                  })), 64))
                ], 64)) : e(s).requirements.value.length ? (n(), a(J, { key: 2 }, [
                  t("div", Wa, [
                    u(e(k), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    l[35] || (l[35] = _(" Configuration ", -1)),
                    t("span", Ya, "(" + i(e(s).boundRequirementCount.value) + "/" + i(e(s).requirements.value.length) + " set)", 1)
                  ]),
                  t("div", Ja, [
                    l[37] || (l[37] = t("p", { class: "km-hint km-grow" }, "Connect required resources. Resources already configured by a dependency are shown for review.", -1)),
                    e(s).aiResolvableCount.value ? (n(), Ce(e(le), {
                      key: 0,
                      size: "small",
                      severity: "secondary",
                      outlined: "",
                      disabled: e(s).aiResolving.value || !e(s).planCurrent.value,
                      onClick: l[3] || (l[3] = (d) => e(s).resolveRequirementsWithAI(z.value))
                    }, {
                      default: X(() => [
                        u(e(k), {
                          icon: e(s).aiResolving.value ? "tabler:loader-2" : "tabler:sparkles",
                          class: ne(["km-i", e(s).aiResolving.value && "spin"]),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"]),
                        _(" " + i(e(s).aiResolving.value ? "Resolving…" : "Resolve with AI"), 1)
                      ]),
                      _: 1
                    }, 8, ["disabled"])) : c("", !0),
                    e(s).missingRequirements.value.length ? (n(), Ce(e(le), {
                      key: 1,
                      size: "small",
                      severity: "secondary",
                      outlined: "",
                      disabled: e(s).autoFitCount.value === 0,
                      onClick: l[4] || (l[4] = (d) => e(s).autoFitRequirements())
                    }, {
                      default: X(() => [
                        u(e(k), {
                          icon: "tabler:wand",
                          class: "km-i",
                          "aria-hidden": "true"
                        }),
                        l[36] || (l[36] = _(" Auto-fit ", -1))
                      ]),
                      _: 1
                    }, 8, ["disabled"])) : c("", !0)
                  ]),
                  e(s).aiResolutionNotice.value ? (n(), a("div", {
                    key: 0,
                    class: ne(["km-msg", e(s).aiResolutionNotice.value.tone === "success" ? "km-msg-ok" : "km-msg-warn"]),
                    role: "status"
                  }, [
                    e(s).aiResolutionNotice.value.code ? (n(), a("span", Za, i(e(s).aiResolutionNotice.value.code), 1)) : c("", !0),
                    e(s).aiResolutionNotice.value.kind ? (n(), a("span", Qa, i(e(s).aiResolutionNotice.value.kind), 1)) : c("", !0),
                    _(" " + i(e(s).aiResolutionNotice.value.message) + " ", 1),
                    e(s).aiResolutionNotice.value.details ? (n(), a("pre", Xa, i(JSON.stringify(e(s).aiResolutionNotice.value.details, null, 2)), 1)) : c("", !0)
                  ], 2)) : c("", !0),
                  e(s).pendingCount.value ? (n(), a("div", el, [
                    t("span", tl, "Review " + i(e(s).pendingCount.value) + " AI suggestion" + i(e(s).pendingCount.value === 1 ? "" : "s") + " before applying.", 1),
                    u(e(le), {
                      size: "small",
                      disabled: !e(s).planCurrent.value,
                      onClick: l[5] || (l[5] = (d) => e(s).acceptSuggestions(Object.keys(e(s).pendingSuggestions.value)))
                    }, {
                      default: X(() => [...l[38] || (l[38] = [
                        _("Accept all", -1)
                      ])]),
                      _: 1
                    }, 8, ["disabled"]),
                    u(e(le), {
                      size: "small",
                      severity: "secondary",
                      onClick: l[6] || (l[6] = (d) => e(s).rejectSuggestions(Object.keys(e(s).pendingSuggestions.value)))
                    }, {
                      default: X(() => [...l[39] || (l[39] = [
                        _("Reject all", -1)
                      ])]),
                      _: 1
                    }),
                    u(e(le), {
                      size: "small",
                      severity: "secondary",
                      disabled: !e(s).planCurrent.value,
                      onClick: l[7] || (l[7] = (d) => e(s).editSuggestions(Object.keys(e(s).pendingSuggestions.value)))
                    }, {
                      default: X(() => [...l[40] || (l[40] = [
                        _("Edit all", -1)
                      ])]),
                      _: 1
                    }, 8, ["disabled"])
                  ])) : c("", !0),
                  (n(!0), a(J, null, ie(e(s).requirementGroups.value, (d) => (n(), a("div", {
                    key: d.module,
                    class: "km-req-group"
                  }, [
                    t("div", nl, [
                      u(e(k), {
                        icon: d.direct ? "tabler:package" : "tabler:corner-down-right",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      t("span", sl, i(d.module), 1),
                      d.direct ? c("", !0) : (n(), a("span", al, "dependency"))
                    ]),
                    (n(!0), a(J, null, ie(d.items, (f) => (n(), a("div", {
                      key: e(ae)(f),
                      class: ne(["km-req", { "is-missing": e(s).requirementMissing(f), "is-invalid": e(s).requirementTypeInvalid(f), "is-flash": K.value && (e(s).requirementMissing(f) || e(s).requirementTypeInvalid(f)) }])
                    }, [
                      t("div", ll, [
                        t("span", il, i(f.name || e(ae)(f)), 1),
                        f.required || f.missing ? (n(), a("span", ol, "required")) : c("", !0),
                        f.expected_kind ? (n(), a("span", rl, i(f.expected_kind), 1)) : c("", !0),
                        l[42] || (l[42] = t("span", { class: "km-grow" }, null, -1)),
                        e(s).requirementMissing(f) && e(s).canAutoFitRequirement(f) ? (n(), Ce(e(le), {
                          key: 2,
                          size: "small",
                          severity: "secondary",
                          outlined: "",
                          class: "km-req-fit",
                          onClick: (w) => e(s).autoFitRequirement(f)
                        }, {
                          default: X(() => [
                            u(e(k), {
                              icon: "tabler:wand",
                              class: "km-i-sm",
                              "aria-hidden": "true"
                            }),
                            l[41] || (l[41] = _(" Auto-fit ", -1))
                          ]),
                          _: 1
                        }, 8, ["onClick"])) : c("", !0)
                      ]),
                      e(s).requirementReadOnly(f) ? (n(), a("div", ml, i(e(s).requirementValue(f) || e(s).displayValue(f.default) || "not set"), 1)) : (n(), a(J, { key: 0 }, [
                        t("input", {
                          class: "km-input km-w-full",
                          "aria-label": f.name || e(ae)(f),
                          disabled: e(s).running.value || e(s).dryRunning.value,
                          value: e(s).requirementValue(f),
                          list: P(f).length ? B(f) : void 0,
                          placeholder: e(s).displayValue(f.default) || (f.expected_kind ? `Enter ${f.expected_kind} id` : "Enter registry id or value"),
                          onInput: (w) => e(s).setParameter(f, w.target.value)
                        }, null, 40, ul),
                        P(f).length ? (n(), a("datalist", {
                          key: 0,
                          id: B(f)
                        }, [
                          (n(!0), a(J, null, ie(P(f), (w) => (n(), a("option", {
                            key: w.value,
                            value: w.value,
                            title: w.title
                          }, i(w.label), 9, cl))), 128))
                        ], 8, dl)) : c("", !0)
                      ], 64)),
                      t("div", vl, [
                        D(f) ? (n(), a("span", pl, [
                          u(e(k), {
                            icon: "tabler:wand",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          _(" " + i(D(f)), 1)
                        ])) : c("", !0),
                        e(s).requirementTypeInvalid(f) ? (n(), a("span", kl, [
                          u(e(k), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          _(" " + i(e(s).requirementTypeHint(f)), 1)
                        ])) : f.invalid ? (n(), a("span", fl, [
                          u(e(k), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          _(" " + i(f.invalid_reason || "invalid value"), 1)
                        ])) : c("", !0),
                        e(s).requirementMissing(f) && !e(s).canAutoFitRequirement(f) ? (n(), a("span", gl, [
                          u(e(k), {
                            icon: "tabler:hand-click",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          l[43] || (l[43] = _(" choose a value to continue ", -1))
                        ])) : c("", !0),
                        e(s).requirementReadOnly(f) ? (n(), a("span", hl, [
                          u(e(k), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          _(" configured by " + i(e(s).requirementConfiguredBy(f)) + "; install it directly to override ", 1)
                        ])) : c("", !0)
                      ]),
                      e(s).pendingSuggestions.value[e(ae)(f)] ? (n(), a("div", {
                        key: 2,
                        class: "km-ai-proposal",
                        role: "group",
                        "aria-label": `AI suggestion for ${f.name || e(ae)(f)}`
                      }, [
                        t("div", bl, "Suggested value: " + i(e(s).displayValue(e(s).pendingSuggestions.value[e(ae)(f)].value)), 1),
                        t("p", null, i(e(s).pendingSuggestions.value[e(ae)(f)].choice_reason), 1),
                        t("div", _l, [
                          u(e(le), {
                            size: "small",
                            disabled: !e(s).planCurrent.value,
                            onClick: (w) => e(s).acceptSuggestions([e(ae)(f)])
                          }, {
                            default: X(() => [...l[44] || (l[44] = [
                              _("Accept", -1)
                            ])]),
                            _: 1
                          }, 8, ["disabled", "onClick"]),
                          u(e(le), {
                            size: "small",
                            severity: "secondary",
                            onClick: (w) => e(s).rejectSuggestions([e(ae)(f)])
                          }, {
                            default: X(() => [...l[45] || (l[45] = [
                              _("Reject", -1)
                            ])]),
                            _: 1
                          }, 8, ["onClick"]),
                          u(e(le), {
                            size: "small",
                            severity: "secondary",
                            onClick: (w) => e(s).editSuggestions([e(ae)(f)])
                          }, {
                            default: X(() => [...l[46] || (l[46] = [
                              _("Edit", -1)
                            ])]),
                            _: 1
                          }, 8, ["onClick"])
                        ])
                      ], 8, yl)) : c("", !0),
                      f.resolution_error ? (n(), a("div", wl, [
                        t("span", $l, i(f.resolution_error.kind || f.resolution_error.code), 1),
                        _(" " + i(f.resolution_error.message) + " ", 1),
                        f.resolution_error.details ? (n(), a("pre", Sl, i(JSON.stringify(f.resolution_error.details, null, 2)), 1)) : c("", !0)
                      ])) : c("", !0),
                      f.description ? (n(), a("div", Cl, i(f.description), 1)) : c("", !0)
                    ], 2))), 128))
                  ]))), 128))
                ], 64)) : (n(), a("div", Ga, [
                  u(e(k), {
                    icon: "tabler:circle-check",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  l[34] || (l[34] = t("p", null, "Nothing to configure — this module needs no additional resources.", -1))
                ]))
              ], 512), [
                [Ft, e(s).activeSection.value === "requirements"]
              ]),
              lt(t("section", Il, [
                t("div", xl, [
                  u(e(k), {
                    icon: "tabler:shield-check",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  l[47] || (l[47] = _(" Security scan", -1))
                ]),
                l[60] || (l[60] = t("p", { class: "km-hint" }, "An agent reviews the code of every module being installed. Heuristic, not a guarantee — review flagged items before proceeding.", -1)),
                e(s).scan.value.status === "idle" ? (n(), a("div", Rl, [
                  u(e(k), {
                    icon: "tabler:shield-question",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  l[50] || (l[50] = t("span", { class: "km-grow" }, "Security scan not run. Running the reviewer may spend LLM tokens.", -1)),
                  u(e(le), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    onClick: l[8] || (l[8] = (d) => e(s).skipScan())
                  }, {
                    default: X(() => [
                      u(e(k), {
                        icon: "tabler:player-skip-forward",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      l[48] || (l[48] = _(" Skip scan ", -1))
                    ]),
                    _: 1
                  }),
                  u(e(le), {
                    size: "small",
                    disabled: !e(s).planCurrent.value,
                    onClick: l[9] || (l[9] = (d) => e(s).runScanNow())
                  }, {
                    default: X(() => [
                      u(e(k), {
                        icon: "tabler:shield-check",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      l[49] || (l[49] = _(" Run scan ", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : e(s).scan.value.status === "skipped" ? (n(), a("div", Ml, [
                  u(e(k), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  l[52] || (l[52] = _(" Security scan skipped. Install can continue without spending reviewer tokens. ", -1)),
                  u(e(le), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    class: "km-mt",
                    disabled: !e(s).planCurrent.value,
                    onClick: l[10] || (l[10] = (d) => e(s).runScanNow())
                  }, {
                    default: X(() => [
                      u(e(k), {
                        icon: "tabler:shield-check",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      l[51] || (l[51] = _(" Run scan", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : e(s).scan.value.status === "scanning" ? (n(), a("div", Al, [
                  u(e(k), {
                    icon: "tabler:loader-2",
                    class: "km-i spin km-accent",
                    "aria-hidden": "true"
                  }),
                  t("span", Ul, [
                    _("Scanning " + i(e(s).scan.value.total || "") + " module" + i(e(s).scan.value.total === 1 ? "" : "s") + "… ", 1),
                    l[53] || (l[53] = t("span", { class: "km-dim" }, "this can take a moment", -1))
                  ])
                ])) : e(s).scan.value.status === "clean" ? (n(), a("div", Tl, [
                  u(e(k), {
                    icon: "tabler:shield-check-filled",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  t("p", null, "No issues found across " + i(e(s).scan.value.scanned) + " module" + i(e(s).scan.value.scanned === 1 ? "" : "s") + ".", 1)
                ])) : e(s).scan.value.status === "error" ? (n(), a("div", El, [
                  _(" Scan failed: " + i(e(s).scan.value.error) + " ", 1),
                  u(e(le), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    class: "km-mt",
                    disabled: !e(s).planCurrent.value,
                    onClick: l[11] || (l[11] = (d) => e(s).runScanNow())
                  }, {
                    default: X(() => [
                      u(e(k), {
                        icon: "tabler:refresh",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      l[54] || (l[54] = _(" Retry", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : e(s).scan.value.status === "unavailable" ? (n(), a("div", Ll, [
                  u(e(k), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  l[56] || (l[56] = _(" Security scan unavailable ", -1)),
                  u(e(le), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    class: "km-mt",
                    disabled: !e(s).planCurrent.value,
                    onClick: l[12] || (l[12] = (d) => e(s).runScanNow())
                  }, {
                    default: X(() => [
                      u(e(k), {
                        icon: "tabler:refresh",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      l[55] || (l[55] = _(" Retry", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : (n(), a(J, { key: 6 }, [
                  e(s).scan.value.summary ? (n(), a("p", Dl, i(e(s).scan.value.summary), 1)) : c("", !0),
                  e(s).scan.value.status === "critical" ? (n(), a("div", Vl, [
                    u(e(k), {
                      icon: "tabler:shield-x",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    l[57] || (l[57] = _(" Critical findings must be reviewed and confirmed before install.", -1))
                  ])) : c("", !0),
                  (n(!0), a(J, null, ie(e(s).scan.value.modules, (d) => (n(), a("div", {
                    key: d.module,
                    class: "km-scan-mod"
                  }, [
                    t("div", Nl, [
                      t("span", {
                        class: ne(["km-dot", T(d.status)]),
                        "aria-hidden": "true"
                      }, null, 2),
                      t("span", Pl, [
                        _(i(d.module), 1),
                        d.version ? (n(), a(J, { key: 0 }, [
                          _("@" + i(d.version), 1)
                        ], 64)) : c("", !0)
                      ]),
                      l[58] || (l[58] = t("span", { class: "km-grow" }, null, -1)),
                      t("span", ql, i(d.status), 1)
                    ]),
                    d.summary ? (n(), a("p", Bl, i(d.summary), 1)) : c("", !0),
                    (n(!0), a(J, null, ie(d.findings, (f) => (n(), a("div", {
                      key: f.id,
                      class: ne(["km-finding", `km-sev-${W(f)}`])
                    }, [
                      u(e(k), {
                        icon: e(xn)[f.severity].icon,
                        class: "km-i km-finding-icon",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      t("div", Ol, [
                        t("div", zl, [
                          t("span", Hl, i(f.title), 1)
                        ]),
                        f.detail ? (n(), a("div", Fl, i(f.detail), 1)) : c("", !0),
                        f.location ? (n(), a("div", jl, i(f.location), 1)) : c("", !0),
                        f.severity !== "critical" ? (n(), a("button", {
                          key: 2,
                          class: ne(["km-ack", { done: e(s).acknowledged.value.has(f.id) }]),
                          onClick: (w) => e(s).acknowledge(f)
                        }, [
                          u(e(k), {
                            icon: e(s).acknowledged.value.has(f.id) ? "tabler:check" : "tabler:eye",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }, null, 8, ["icon"]),
                          _(" " + i(e(s).acknowledged.value.has(f.id) ? "Acknowledged" : "Acknowledge"), 1)
                        ], 10, Kl)) : c("", !0)
                      ])
                    ], 2))), 128)),
                    d.findings.length ? c("", !0) : (n(), a("p", Gl, "No issues in this module."))
                  ]))), 128)),
                  e(s).scan.value.status === "critical" ? (n(), a("label", Wl, [
                    lt(t("input", {
                      type: "checkbox",
                      "onUpdate:modelValue": l[13] || (l[13] = (d) => e(s).criticalConfirmed.value = d)
                    }, null, 512), [
                      [Pn, e(s).criticalConfirmed.value]
                    ]),
                    l[59] || (l[59] = t("span", null, "I understand the critical findings and want to install anyway.", -1))
                  ])) : c("", !0)
                ], 64))
              ], 512), [
                [Ft, e(s).activeSection.value === "scan"]
              ]),
              lt(t("section", Yl, [
                t("div", Jl, [
                  u(e(k), {
                    icon: "tabler:checklist",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  l[61] || (l[61] = _(" Review & install", -1))
                ]),
                t("div", Zl, [
                  t("div", Ql, [
                    u(e(k), {
                      icon: "tabler:package",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    t("b", null, i(e(s).moduleCount.value), 1),
                    l[62] || (l[62] = t("span", null, "modules", -1))
                  ]),
                  t("div", Xl, [
                    u(e(k), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    t("b", null, i(e(s).boundRequirementCount.value) + "/" + i(e(s).requirements.value.length), 1),
                    l[63] || (l[63] = t("span", null, "configured", -1))
                  ]),
                  t("div", ei, [
                    u(e(k), {
                      icon: "tabler:database",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    t("b", null, i(e(s).migrations.value.length), 1),
                    l[64] || (l[64] = t("span", null, "migrations", -1))
                  ]),
                  t("div", ti, [
                    u(e(k), {
                      icon: e(s).scan.value.status === "clean" ? "tabler:shield-check" : e(s).scan.value.status === "critical" ? "tabler:shield-x" : e(s).scan.value.status === "skipped" ? "tabler:shield-off" : "tabler:shield",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    t("b", null, i(e(s).scan.value.status === "scanning" ? "…" : e(s).scan.value.status === "skipped" || e(s).scan.value.status === "idle" ? "—" : e(s).scan.value.findings.length), 1),
                    l[65] || (l[65] = t("span", null, "scan findings", -1))
                  ])
                ]),
                t("div", ni, [
                  l[68] || (l[68] = t("label", { class: "km-label" }, "Migration policy", -1)),
                  u(In, {
                    modelValue: e(s).migrationPolicy.value,
                    "onUpdate:modelValue": l[14] || (l[14] = (d) => e(s).migrationPolicy.value = d),
                    items: e(s).migrationOptions.value.map((d) => ({ id: d.value, title: d.label })),
                    "aria-label": "Migration policy"
                  }, null, 8, ["modelValue", "items"]),
                  e(s).requiredSetup.value ? (n(), a("p", si, "This module requires setup. Installation completes after migrations and setup pass verification.")) : c("", !0),
                  e(s).migrations.value.length ? (n(), a("div", ai, [
                    (n(!0), a(J, null, ie(e(s).migrations.value, (d) => (n(), a("div", {
                      key: d.id,
                      class: "km-mig-row"
                    }, [
                      u(e(k), {
                        icon: "tabler:database-import",
                        class: "km-i-xs km-dim",
                        "aria-hidden": "true"
                      }),
                      t("span", li, i(d.id), 1),
                      l[66] || (l[66] = t("span", { class: "km-grow" }, null, -1)),
                      t("span", ii, i(d.status), 1)
                    ]))), 128))
                  ])) : c("", !0),
                  t("p", oi, [
                    u(e(k), {
                      icon: "tabler:shield-lock",
                      class: "km-i-xs",
                      "aria-hidden": "true"
                    }),
                    l[67] || (l[67] = _(" Changes are transactional — if any step fails, the registry, lock and migrations are rolled back.", -1))
                  ])
                ]),
                t("details", ri, [
                  l[71] || (l[71] = t("summary", null, "Advanced", -1)),
                  t("div", ui, [
                    t("div", di, [
                      l[69] || (l[69] = t("span", null, "Installs as", -1)),
                      t("b", ci, i(e(s).destinationId.value || "—"), 1)
                    ]),
                    t("div", mi, [
                      l[70] || (l[70] = t("span", null, "Version", -1)),
                      t("b", vi, i(e(s).versionMode.value === "pin" ? e(s).version.value || "latest" : "≥ " + (e(s).version.value || "0.0.0")), 1)
                    ])
                  ])
                ]),
                e(s).result.value ? (n(), a("div", pi, [
                  t("div", ki, i(e(s).result.value.dry_run ? "Dry-run preview" : "Applied"), 1),
                  e(s).result.value.dry_run ? (n(), a(J, { key: 0 }, [
                    l[72] || (l[72] = t("div", { class: "km-dim" }, "No changes were applied.", -1)),
                    e(s).resultExecution.value.length ? (n(), a("div", fi, i(e(s).resultExecution.value.length) + " planned step" + i(e(s).resultExecution.value.length === 1 ? "" : "s") + " below.", 1)) : (n(), a("div", gi, "No install steps are available for this preview."))
                  ], 64)) : (n(), a(J, { key: 1 }, [
                    l[73] || (l[73] = t("div", { class: "km-dim" }, "Changes applied successfully.", -1)),
                    e(s).result.value.apply?.message ? (n(), a("div", hi, i(e(s).result.value.apply.message), 1)) : c("", !0)
                  ], 64))
                ])) : c("", !0),
                e(s).resultExecution.value.length ? (n(), a("div", yi, [
                  l[74] || (l[74] = t("div", { class: "km-panel-title" }, "Install steps", -1)),
                  (n(!0), a(J, null, ie(e(s).resultExecution.value, (d, f) => (n(), a("div", {
                    key: `${d.step}-${f}`,
                    class: ne(["km-ledger-row", q(d.status)])
                  }, [
                    t("span", bi, i(f + 1), 1),
                    t("span", _i, i(e(s).executionStepLabel(d)), 1),
                    t("span", wi, i(d.status), 1),
                    d.message ? (n(), a("span", $i, i(d.message), 1)) : c("", !0)
                  ], 2))), 128))
                ])) : c("", !0),
                e(s).resultError.value ? (n(), a("div", Si, [
                  e(s).resultCode.value ? (n(), a("span", Ci, i(e(s).resultCode.value), 1)) : c("", !0),
                  _(i(e(s).resultError.value), 1)
                ])) : c("", !0)
              ], 512), [
                [Ft, e(s).activeSection.value === "review"]
              ])
            ], 512)
          ])
        ]),
        _: 1
      }, 8, ["visible", "busy", "label", "style"]);
    };
  }
}), Ui = { class: "d-hero" }, Ti = { class: "d-hero-icon" }, Ei = { class: "km-grow km-min0" }, Li = { class: "km-row-wrap" }, Di = { class: "d-hero-name" }, Vi = { class: "d-ver" }, Ni = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Pi = {
  key: 1,
  class: "badge-installed kx-tag-caps"
}, qi = {
  key: 2,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Bi = {
  key: 3,
  class: "badge-warn kx-tag-caps"
}, Oi = { class: "d-hero-org" }, zi = {
  key: 0,
  class: "d-hero-desc"
}, Hi = { class: "d-hero-actions" }, Fi = ["href"], ji = ["href"], Ki = { class: "d-grid" }, Gi = { class: "d-side" }, Wi = { class: "d-block" }, Yi = { class: "d-row" }, Ji = { class: "d-row-v" }, Zi = {
  key: 0,
  class: "d-row"
}, Qi = { class: "d-row-v" }, Xi = {
  key: 1,
  class: "d-row"
}, eo = ["title"], to = {
  key: 2,
  class: "d-row"
}, no = { class: "d-row-v" }, so = {
  key: 3,
  class: "d-row"
}, ao = {
  key: 4,
  class: "d-row"
}, lo = { class: "d-row-v" }, io = {
  key: 5,
  class: "d-row"
}, oo = { class: "d-row-v" }, ro = {
  key: 6,
  class: "d-row"
}, uo = { class: "d-row-v" }, co = {
  key: 0,
  class: "d-block"
}, mo = { class: "km-pills" }, vo = {
  key: 1,
  class: "d-block"
}, po = { class: "km-dep-list" }, ko = { class: "km-trunc" }, fo = { class: "km-dim" }, go = {
  key: 2,
  class: "d-block"
}, ho = { class: "km-pills" }, yo = { class: "d-main" }, bo = { class: "d-tabs" }, _o = ["disabled"], wo = {
  key: 0,
  class: "km-dim"
}, $o = { class: "d-tab-body" }, So = {
  key: 0,
  class: "km-loading"
}, Co = {
  key: 0,
  class: "d-empty"
}, Io = {
  key: 1,
  class: "rm"
}, xo = {
  key: 2,
  class: "km-stack-lg"
}, Ro = { key: 0 }, Mo = { class: "d-block-title d-accent" }, Ao = { class: "km-dim" }, Uo = { class: "km-2col" }, To = { class: "d-field-i" }, Eo = { class: "km-grow km-min0" }, Lo = { class: "d-cfg-name" }, Do = {
  key: 0,
  class: "d-cfg-desc"
}, Vo = { key: 1 }, No = { class: "d-block-title" }, Po = { class: "km-2col" }, qo = { class: "d-field-i d-field-i-req" }, Bo = { class: "km-grow km-min0" }, Oo = { class: "d-cfg-name" }, zo = {
  key: 0,
  class: "d-cfg-desc"
}, Ho = { class: "d-field-i d-field-i-req" }, Fo = { class: "km-grow km-min0" }, jo = { class: "d-cfg-name" }, Ko = {
  key: 0,
  class: "d-cfg-desc"
}, Go = {
  key: 1,
  class: "d-cfg-desc km-mono"
}, Wo = { class: "d-block-title" }, Yo = { key: 0 }, Jo = { class: "d-sub" }, Zo = { class: "km-pills" }, Qo = {
  key: 1,
  class: "km-muted"
}, Xo = {
  key: 1,
  class: "km-muted"
}, er = {
  key: 2,
  class: "km-stack"
}, tr = { class: "km-group-head" }, nr = { class: "km-dim" }, sr = { class: "km-2col" }, ar = { class: "d-entry-name" }, lr = { class: "d-entry-id" }, ir = {
  key: 0,
  class: "km-muted"
}, or = {
  key: 1,
  class: "d-vers"
}, rr = { class: "d-ver-tag" }, ur = {
  key: 0,
  class: "km-dim"
}, dr = {
  key: 1,
  class: "km-dim km-inline"
}, cr = {
  key: 2,
  class: "km-dim"
}, mr = /* @__PURE__ */ Ot({
  __name: "ModuleDetailView",
  props: {
    page: {}
  },
  setup(o) {
    const $ = o, {
      selectedModule: r,
      selectedIsPrivate: L,
      selectedCanUpdate: s,
      selectedUpdateDisabledReason: G,
      selectedCanUninstall: S,
      selectedUninstallBlockedReason: E,
      detailUpdate: M,
      detailUninstall: P,
      detailInstall: B,
      closeDetail: D,
      versionMeta: z,
      detailTab: K,
      detailReadme: V,
      detailLoading: W,
      detailVersions: T,
      envVars: H,
      requirements: q,
      entryIcon: x,
      entryName: F,
      entryDesc: l,
      detailGroups: Q
    } = $.page, d = N(() => $.page.selected.value);
    return (f, w) => {
      const de = An("wc-render-markdown");
      return n(), a("div", {
        class: "d-page",
        style: Et({ "--accent": e(r) ? e(Yt)(e(r)) : "var(--p-primary-color)" })
      }, [
        t("button", {
          class: "d-back",
          onClick: w[0] || (w[0] = //@ts-ignore
          (...v) => e(D) && e(D)(...v))
        }, [
          u(e(k), {
            icon: "tabler:arrow-left",
            class: "km-i-sm",
            "aria-hidden": "true"
          }),
          w[4] || (w[4] = _(" Back to modules ", -1))
        ]),
        t("header", Ui, [
          t("div", Ti, [
            u(e(k), {
              icon: e(r) ? e(Bt)(e(r)) : "tabler:package",
              class: "km-i-lg",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          t("div", Ei, [
            t("div", Li, [
              t("h2", Di, i(d.value.label), 1),
              t("span", Vi, i(d.value.version || "—"), 1),
              e(jt)(e(r)) ? (n(), a("span", Ni, "app")) : c("", !0),
              d.value.installed ? (n(), a("span", Pi, "installed")) : c("", !0),
              e(L) ? (n(), a("span", qi, [
                u(e(k), {
                  icon: "tabler:lock",
                  class: "km-i-xs",
                  "aria-hidden": "true"
                }),
                w[5] || (w[5] = _(" private", -1))
              ])) : c("", !0),
              e(r)?.deprecated ? (n(), a("span", Bi, "deprecated")) : c("", !0)
            ]),
            t("div", Oi, i(d.value.component), 1),
            d.value.description ? (n(), a("p", zi, i(d.value.description), 1)) : c("", !0),
            t("div", Hi, [
              d.value.installed ? (n(), a(J, { key: 0 }, [
                e(s) ? (n(), Ce(e(le), {
                  key: 0,
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  onClick: e(M)
                }, {
                  default: X(() => [
                    u(e(k), {
                      icon: "tabler:refresh-dot",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    w[6] || (w[6] = _(" Update ", -1))
                  ]),
                  _: 1
                }, 8, ["onClick"])) : (n(), Ce(e(le), {
                  key: 1,
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  disabled: "",
                  title: e(G) || void 0
                }, {
                  default: X(() => [
                    u(e(k), {
                      icon: "tabler:refresh-off",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    w[7] || (w[7] = _(" Update ", -1))
                  ]),
                  _: 1
                }, 8, ["title"])),
                e(S) ? (n(), Ce(e(le), {
                  key: 2,
                  size: "small",
                  severity: "danger",
                  text: "",
                  onClick: e(P)
                }, {
                  default: X(() => [
                    u(e(k), {
                      icon: "tabler:trash",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    w[8] || (w[8] = _(" Uninstall ", -1))
                  ]),
                  _: 1
                }, 8, ["onClick"])) : e(E) ? (n(), Ce(e(le), {
                  key: 3,
                  size: "small",
                  severity: "danger",
                  text: "",
                  disabled: "",
                  title: e(E)
                }, {
                  default: X(() => [
                    u(e(k), {
                      icon: "tabler:trash-off",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    w[9] || (w[9] = _(" Uninstall ", -1))
                  ]),
                  _: 1
                }, 8, ["title"])) : c("", !0)
              ], 64)) : (n(), Ce(e(le), {
                key: 1,
                size: "small",
                onClick: e(B)
              }, {
                default: X(() => [
                  u(e(k), {
                    icon: "tabler:download",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  w[10] || (w[10] = _(" Install ", -1))
                ]),
                _: 1
              }, 8, ["onClick"])),
              e(r)?.repository ? (n(), a("a", {
                key: 2,
                href: String(e(r).repository),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                u(e(k), {
                  icon: "tabler:brand-github",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                w[11] || (w[11] = _(" Repository", -1))
              ], 8, Fi)) : c("", !0),
              e(r)?.homepage ? (n(), a("a", {
                key: 3,
                href: String(e(r).homepage),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                u(e(k), {
                  icon: "tabler:home",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                w[12] || (w[12] = _(" Homepage", -1))
              ], 8, ji)) : c("", !0)
            ])
          ])
        ]),
        t("div", Ki, [
          t("aside", Gi, [
            t("section", Wi, [
              t("div", Yi, [
                u(e(k), {
                  icon: "tabler:download",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                w[13] || (w[13] = t("span", { class: "d-row-k" }, "Downloads", -1)),
                t("span", Ji, i(e(Jt)(e(r)?.total_downloads)), 1)
              ]),
              e(r)?.favorites_count ? (n(), a("div", Zi, [
                u(e(k), {
                  icon: "tabler:star",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                w[14] || (w[14] = t("span", { class: "d-row-k" }, "Favorites", -1)),
                t("span", Qi, i(e(r).favorites_count), 1)
              ])) : c("", !0),
              e(r)?.license ? (n(), a("div", Xi, [
                u(e(k), {
                  icon: "tabler:license",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                w[15] || (w[15] = t("span", { class: "d-row-k" }, "License", -1)),
                t("span", {
                  class: "d-row-v",
                  title: e(r).license
                }, i(e(an)(e(r).license)), 9, eo)
              ])) : c("", !0),
              e(r)?.type ? (n(), a("div", to, [
                u(e(k), {
                  icon: "tabler:category",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                w[16] || (w[16] = t("span", { class: "d-row-k" }, "Type", -1)),
                t("span", no, i(e(r).type), 1)
              ])) : c("", !0),
              e(L) ? (n(), a("div", so, [
                u(e(k), {
                  icon: "tabler:lock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                w[17] || (w[17] = t("span", { class: "d-row-k" }, "Visibility", -1)),
                w[18] || (w[18] = t("span", { class: "d-row-v" }, "Private", -1))
              ])) : c("", !0),
              e(r)?.update_time ? (n(), a("div", ao, [
                u(e(k), {
                  icon: "tabler:clock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                w[19] || (w[19] = t("span", { class: "d-row-k" }, "Updated", -1)),
                t("span", lo, i(e(ln)(e(r).update_time, { maxUnit: "year" })), 1)
              ])) : c("", !0),
              e(z)?.entry_count ? (n(), a("div", io, [
                u(e(k), {
                  icon: "tabler:list-numbers",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                w[20] || (w[20] = t("span", { class: "d-row-k" }, "Entries", -1)),
                t("span", oo, i(e(z).entry_count), 1)
              ])) : c("", !0),
              e(z)?.size_bytes ? (n(), a("div", ro, [
                u(e(k), {
                  icon: "tabler:weight",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                w[21] || (w[21] = t("span", { class: "d-row-k" }, "Size", -1)),
                t("span", uo, i(e(Kt)(e(z).size_bytes)), 1)
              ])) : c("", !0)
            ]),
            (e(r)?.keywords || []).length ? (n(), a("section", co, [
              w[22] || (w[22] = t("div", { class: "d-block-title" }, "Keywords", -1)),
              t("div", mo, [
                (n(!0), a(J, null, ie(e(r).keywords, (v) => (n(), a("span", {
                  key: v,
                  class: "provides-pill"
                }, i(v), 1))), 128))
              ])
            ])) : c("", !0),
            (e(z)?.dependencies || []).length ? (n(), a("section", vo, [
              w[23] || (w[23] = t("div", { class: "d-block-title" }, "Dependencies", -1)),
              t("div", po, [
                (n(!0), a(J, null, ie(e(z).dependencies, (v, h) => (n(), a("div", {
                  key: h,
                  class: "km-dep"
                }, [
                  t("span", ko, i(v.org) + "/" + i(v.name), 1),
                  t("span", fo, i(v.version_constraint), 1)
                ]))), 128))
              ])
            ])) : c("", !0),
            (e(z)?.lua_modules || []).length ? (n(), a("section", go, [
              w[24] || (w[24] = t("div", { class: "d-block-title" }, "Lua modules", -1)),
              t("div", ho, [
                (n(!0), a(J, null, ie(e(z).lua_modules, (v) => (n(), a("span", {
                  key: v,
                  class: "provides-pill"
                }, i(v), 1))), 128))
              ])
            ])) : c("", !0)
          ]),
          t("main", yo, [
            t("div", bo, [
              t("button", {
                class: ne(["d-tab", { active: e(K) === "readme" }]),
                disabled: !e(V) && !e(W),
                onClick: w[1] || (w[1] = (v) => K.value = "readme")
              }, "Readme", 10, _o),
              t("button", {
                class: ne(["d-tab", { active: e(K) === "overview" }]),
                onClick: w[2] || (w[2] = (v) => K.value = "overview")
              }, "Overview", 2),
              t("button", {
                class: ne(["d-tab", { active: e(K) === "versions" }]),
                onClick: w[3] || (w[3] = (v) => K.value = "versions")
              }, [
                w[25] || (w[25] = _("Versions ", -1)),
                e(T).length ? (n(), a("span", wo, i(e(T).length), 1)) : c("", !0)
              ], 2)
            ]),
            t("div", $o, [
              e(W) ? (n(), a("div", So, [
                u(e(k), {
                  icon: "tabler:loader-2",
                  class: "km-i spin",
                  "aria-hidden": "true"
                }),
                w[26] || (w[26] = _(" Loading… ", -1))
              ])) : e(K) === "readme" ? (n(), a(J, { key: 1 }, [
                e(V) ? (n(), a("article", Io, [
                  u(de, { source: e(V) }, null, 8, ["source"])
                ])) : (n(), a("div", Co, [
                  u(e(k), {
                    icon: "tabler:file-off",
                    class: "km-i-xl km-dim",
                    "aria-hidden": "true"
                  }),
                  w[27] || (w[27] = t("p", { class: "km-mt" }, "No README provided.", -1))
                ]))
              ], 64)) : e(K) === "overview" ? (n(), a("div", xo, [
                e(H).length ? (n(), a("section", Ro, [
                  t("div", Mo, [
                    u(e(k), {
                      icon: "tabler:settings-2",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    w[28] || (w[28] = _(" Environment ", -1)),
                    t("span", Ao, i(e(H).length), 1)
                  ]),
                  w[29] || (w[29] = t("p", { class: "d-sub" }, "Variables this module reads — set them in your environment.", -1)),
                  t("div", Uo, [
                    (n(!0), a(J, null, ie(e(H), (v) => (n(), a("div", {
                      key: v.id,
                      class: "d-field d-field-env"
                    }, [
                      t("span", To, [
                        u(e(k), {
                          icon: e(x)(v, "tabler:variable"),
                          class: "km-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"])
                      ]),
                      t("span", Eo, [
                        t("span", Lo, i(e(F)(v)), 1),
                        e(l)(v) ? (n(), a("span", Do, i(e(l)(v)), 1)) : c("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : c("", !0),
                e(q).length || (e(z)?.requirements || []).length ? (n(), a("section", Vo, [
                  t("div", No, [
                    u(e(k), {
                      icon: "tabler:plug-connected",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    w[30] || (w[30] = _(" Requires", -1))
                  ]),
                  w[31] || (w[31] = t("p", { class: "d-sub" }, "Host resources this module is wired to at install.", -1)),
                  t("div", Po, [
                    e(q).length ? (n(!0), a(J, { key: 0 }, ie(e(q), (v) => (n(), a("div", {
                      key: v.id,
                      class: "d-field d-field-req"
                    }, [
                      t("span", qo, [
                        u(e(k), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      t("span", Bo, [
                        t("span", Oo, i(e(F)(v)), 1),
                        e(l)(v) ? (n(), a("span", zo, i(e(l)(v)), 1)) : c("", !0)
                      ])
                    ]))), 128)) : (n(!0), a(J, { key: 1 }, ie(e(z).requirements, (v, h) => (n(), a("div", {
                      key: h,
                      class: "d-field d-field-req"
                    }, [
                      t("span", Ho, [
                        u(e(k), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      t("span", Fo, [
                        t("span", jo, i(v.name), 1),
                        v.description ? (n(), a("span", Ko, i(v.description), 1)) : c("", !0),
                        v.default ? (n(), a("span", Go, "default: " + i(v.default), 1)) : c("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : c("", !0),
                t("section", null, [
                  t("div", Wo, [
                    u(e(k), {
                      icon: "tabler:package",
                      class: "km-i-sm d-accent-i",
                      "aria-hidden": "true"
                    }),
                    w[32] || (w[32] = _(" Provides", -1))
                  ]),
                  d.value.installed ? e(Q).length ? (n(), a("div", er, [
                    (n(!0), a(J, null, ie(e(Q), (v) => (n(), a("div", {
                      key: v.key
                    }, [
                      t("div", tr, [
                        u(e(k), {
                          icon: v.icon,
                          class: "km-i-sm d-accent-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        _(" " + i(v.label) + " ", 1),
                        t("span", nr, i(v.items.length), 1)
                      ]),
                      t("div", sr, [
                        (n(!0), a(J, null, ie(v.items, (h) => (n(), a("div", {
                          key: h.id,
                          class: "d-entry"
                        }, [
                          t("div", ar, i(h.meta && h.meta.title || e(F)(h)), 1),
                          t("div", lr, i(h.id), 1)
                        ]))), 128))
                      ])
                    ]))), 128))
                  ])) : (n(), a("p", Xo, "No registry entries.")) : (n(), a("div", Yo, [
                    (e(z)?.entry_kinds || []).length ? (n(), a(J, { key: 0 }, [
                      t("p", Jo, "Publishes " + i(e(z).entry_count || e(z).entry_kinds.length) + " entries; per-entry detail resolves after install.", 1),
                      t("div", Zo, [
                        (n(!0), a(J, null, ie(e(z).entry_kinds, (v) => (n(), a("span", {
                          key: v,
                          class: "provides-pill"
                        }, i(v), 1))), 128))
                      ])
                    ], 64)) : (n(), a("p", Qo, [...w[33] || (w[33] = [
                      _("See the ", -1),
                      t("strong", null, "Readme", -1),
                      _(" tab for details.", -1)
                    ])]))
                  ]))
                ])
              ])) : (n(), a(J, { key: 3 }, [
                e(T).length ? (n(), a("div", or, [
                  (n(!0), a(J, null, ie(e(T), (v) => (n(), a("div", {
                    key: v.version,
                    class: "d-ver-row"
                  }, [
                    t("span", rr, i(v.version), 1),
                    v.create_time ? (n(), a("span", ur, i(e(ln)(v.create_time, { maxUnit: "year" })), 1)) : c("", !0),
                    w[34] || (w[34] = t("span", { class: "km-grow" }, null, -1)),
                    v.download_count ? (n(), a("span", dr, [
                      u(e(k), {
                        icon: "tabler:download",
                        class: "km-i-xs",
                        "aria-hidden": "true"
                      }),
                      _(" " + i(e(Jt)(v.download_count)), 1)
                    ])) : c("", !0),
                    v.size_bytes ? (n(), a("span", cr, i(e(Kt)(v.size_bytes)), 1)) : c("", !0)
                  ]))), 128))
                ])) : (n(), a("p", ir, "No published versions."))
              ], 64))
            ])
          ])
        ])
      ], 4);
    };
  }
}), vr = { class: "km" }, pr = {
  key: 1,
  class: "km-loading km-center km-initial-loading",
  role: "status",
  "aria-live": "polite"
}, kr = {
  key: 2,
  class: "km-denied"
}, fr = { class: "km-denied-box" }, gr = {
  key: 3,
  class: "km-scroll"
}, hr = {
  key: 1,
  class: "km-list"
}, yr = { class: "km-sec-bar km-sec-bar-toolbar" }, br = { class: "km-controls" }, _r = {
  key: 0,
  class: "km-btn-count"
}, wr = { class: "km-hub-auth-panel" }, $r = { class: "km-hub-auth-row" }, Sr = {
  key: 0,
  class: "km-hub-auth-meta"
}, Cr = {
  key: 1,
  class: "km-hub-auth-meta"
}, Ir = {
  key: 2,
  class: "km-hub-auth-orgs"
}, xr = { class: "km-hub-auth-org-name" }, Rr = {
  key: 0,
  class: "km-hub-auth-org-role"
}, Mr = { class: "km-hub-auth-hint" }, Ar = ["href"], Ur = { class: "km-hub-auth-actions" }, Tr = {
  key: 0,
  class: "km-msg km-msg-err"
}, Er = {
  key: 1,
  class: "km-msg"
}, Lr = {
  key: 2,
  class: "km-msg km-msg-err"
}, Dr = {
  key: 3,
  class: "km-loading km-center"
}, Vr = { key: 0 }, Nr = { class: "hub-section-head" }, Pr = { class: "feat-grid" }, qr = ["onClick"], Br = { class: "feat-icon" }, Or = { class: "feat-body" }, zr = { class: "km-row-wrap" }, Hr = { class: "feat-name" }, Fr = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, jr = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Kr = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, Gr = { class: "feat-org" }, Wr = {
  key: 0,
  class: "feat-desc"
}, Yr = { class: "feat-meta" }, Jr = { class: "meta-pill" }, Zr = { class: "meta-pill" }, Qr = ["title"], Xr = { class: "hub-section-head" }, eu = { class: "hub-section-title" }, tu = { class: "hub-section-sub" }, nu = { class: "mod-grid" }, su = ["onClick"], au = { class: "mod-icon" }, lu = { class: "mod-body" }, iu = { class: "km-row-wrap" }, ou = { class: "mod-name" }, ru = { class: "mod-version" }, uu = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, du = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, cu = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, mu = { class: "mod-org" }, vu = {
  key: 0,
  class: "mod-desc"
}, pu = { class: "mod-foot" }, ku = { class: "foot-stat" }, fu = {
  key: 0,
  class: "foot-stat"
}, gu = ["title"], hu = {
  key: 2,
  class: "foot-stat km-dim km-ml-auto"
}, yu = {
  key: 5,
  class: "km-empty"
}, bu = { class: "km-muted" }, _u = { class: "km-mono" }, wu = {
  key: 6,
  class: "km-empty"
}, $u = {
  key: 7,
  class: "km-empty"
}, Su = { class: "km-muted" }, Cu = { class: "km-mono" }, Iu = {
  key: 0,
  class: "km-installed"
}, xu = ["aria-expanded"], Ru = { class: "km-sub" }, Mu = {
  key: 0,
  class: "km-update-count"
}, Au = {
  key: 1,
  class: "km-update-count"
}, Uu = {
  key: 0,
  class: "km-msg km-msg-err km-mb"
}, Tu = {
  key: 1,
  class: "inst-toolbar"
}, Eu = {
  key: 2,
  class: "inst-list"
}, Lu = ["onClick"], Du = { class: "inst-icon" }, Vu = { class: "km-grow km-min0" }, Nu = { class: "km-row-tight" }, Pu = { class: "inst-name" }, qu = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Bu = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Ou = {
  key: 2,
  class: "km-chip"
}, zu = ["title"], Hu = { class: "inst-id" }, Fu = {
  key: 0,
  class: "km-dim"
}, ju = {
  key: 0,
  class: "inst-update-msg"
}, Ku = { class: "inst-ver" }, Gu = { class: "inst-migs" }, Wu = { class: "inst-actions" }, Yu = ["disabled", "aria-label", "onClick"], Ju = ["disabled", "aria-label", "onClick"], Zu = ["title", "aria-label"], Qu = ["aria-label", "onClick"], Xu = ["title", "aria-label"], ed = {
  key: 3,
  class: "km-empty inst-empty"
}, td = { class: "km-modal-body" }, nd = { class: "km-uninstall-target" }, sd = { class: "km-mono" }, ad = { class: "km-dim" }, ld = {
  key: 0,
  class: "km-msg km-msg-err"
}, id = {
  key: 0,
  class: "km-code"
}, od = {
  key: 1,
  class: "km-mt"
}, rd = {
  key: 1,
  class: "km-msg km-msg-info"
}, ud = {
  key: 2,
  class: "km-running"
}, dd = {
  key: 3,
  class: "km-uninstall-preview"
}, cd = {
  key: 0,
  class: "km-msg"
}, md = {
  key: 1,
  class: "km-preview-block"
}, vd = { class: "km-mono" }, pd = { class: "km-dim" }, kd = {
  key: 2,
  class: "km-preview-block"
}, fd = { class: "km-mono" }, gd = { class: "km-dim" }, hd = {
  key: 3,
  class: "km-preview-block"
}, yd = { class: "km-mono" }, bd = { class: "km-dim" }, _d = {
  key: 4,
  class: "km-ledger"
}, wd = { class: "km-ledger-step" }, $d = { class: "km-grow" }, Sd = { class: "km-chip" }, Cd = {
  key: 0,
  class: "km-ledger-msg"
}, Id = {
  key: 5,
  class: "km-running"
}, xd = { class: "km-grow km-running-label" }, Rd = { class: "km-dim" }, Md = /* @__PURE__ */ Ot({
  __name: "modules",
  setup(o) {
    const $ = gs(), {
      LABEL: r,
      HUB_PORTAL: L,
      UNINSTALL_MIGRATION_OPTIONS: s,
      initialLoading: G,
      accessDenied: S,
      statusBanner: E,
      hubConnected: M,
      hubStatus: P,
      hubToken: B,
      showTokenPanel: D,
      hubConnecting: z,
      hubError: K,
      hubOrgs: V,
      hubIdentity: W,
      hubTokenStored: T,
      hubTokenExpired: H,
      hubTokenIcon: q,
      hubTokenButtonLabel: x,
      hubExpiry: F,
      saveHubToken: l,
      clearHubToken: Q,
      selected: d,
      selectedModule: f,
      detailReadme: w,
      detailLoading: de,
      detailTab: v,
      detailVersions: h,
      envVars: b,
      requirements: R,
      detailGroups: Z,
      versionMeta: ee,
      selectedCanUpdate: se,
      selectedUpdateDisabledReason: me,
      selectedCanUninstall: Ye,
      selectedIsPrivate: ge,
      selectedUninstallBlockedReason: Pe,
      entryName: Te,
      entryDesc: ot,
      entryIcon: qe,
      openDetail: rt,
      closeDetail: wt,
      detailInstall: $t,
      detailUpdate: ye,
      detailUninstall: Dt,
      installed: Je,
      installedFilter: Be,
      installedKindFilter: ut,
      installedTotal: Ze,
      updateScanLoading: Oe,
      updateAllRunning: Ee,
      availableUpdates: Me,
      installedLoading: be,
      installedError: ze,
      installedOpen: He,
      catalog: St,
      catalogLoading: Qe,
      catalogError: Fe,
      catalogInstalledTotal: Le,
      visibleCatalogInstalled: Ct,
      browseFilter: p,
      sortBy: g,
      availableItems: I,
      featured: U,
      sortedItems: j,
      visibleInstalled: Y,
      catalogItemFor: oe,
      installedAccent: fe,
      installedIcon: Xe,
      installedIsRoot: It,
      installedIsPrivate: ue,
      installedRole: Ae,
      installedUsedBy: et,
      installedCanUpdate: dt,
      installedUpdateDisabledReason: ct,
      installedCanUninstall: pe,
      installedUninstallDisabledReason: xe,
      installedMigrationSummary: tt,
      updateInfoForDep: je,
      updateStatusLabel: zt,
      updateStatusIcon: xt,
      updateStatusBusy: ft,
      scanInstalledUpdates: Ue,
      updateInstalledDependency: De,
      updateAllAvailable: mt,
      refreshAll: vt,
      installTarget: he,
      closeInstallDialog: nt,
      onInstallChanged: Ht,
      openUpdateDialog: gt,
      uninstallDialogOpen: st,
      uninstallDep: at,
      uninstallPolicy: Ke,
      uninstallRunning: ke,
      uninstallPreviewLoading: Ge,
      uninstallPreview: ve,
      uninstallExecution: Vt,
      uninstallCode: _e,
      uninstallError: ht,
      uninstallRequiredBy: Rt,
      uninstallBlockedReason: yt,
      uninstallActionBlockedReason: we,
      uninstallPhase: Mt,
      uninstallElapsedSec: At,
      openUninstallDialog: Nt,
      previewUninstall: pt,
      executionStepLabel: Pt,
      runUninstall: bt
    } = $, kt = A(null);
    return ($e, y) => (n(), a("div", vr, [
      e(E) ? (n(), a("div", {
        key: 0,
        class: ne(["km-banner", e(E).kind === "ok" ? "km-banner-ok" : "km-banner-err"])
      }, i(e(E).message), 3)) : c("", !0),
      e(G) ? (n(), a("div", pr, [
        u(e(k), {
          icon: "tabler:loader-2",
          class: "km-i spin",
          "aria-hidden": "true"
        }),
        y[12] || (y[12] = _(" Loading modules… ", -1))
      ])) : e(S) ? (n(), a("div", kr, [
        t("div", fr, [
          u(e(k), {
            icon: "tabler:lock",
            class: "km-denied-icon",
            "aria-hidden": "true"
          }),
          y[13] || (y[13] = t("p", { class: "km-denied-title" }, "Admins only", -1)),
          y[14] || (y[14] = t("p", { class: "km-denied-sub" }, "You need admin access to manage modules.", -1))
        ])
      ])) : (n(), a("div", gr, [
        e(d) ? (n(), Ce(mr, {
          key: 0,
          page: e($)
        }, null, 8, ["page"])) : (n(), a("div", hr, [
          t("section", null, [
            t("div", yr, [
              t("div", br, [
                u(e(le), {
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  disabled: e(be) || e(Qe),
                  onClick: e(vt)
                }, {
                  default: X(() => [
                    u(e(k), {
                      icon: e(be) || e(Qe) ? "tabler:loader-2" : "tabler:refresh",
                      class: ne(["km-i", (e(be) || e(Qe)) && "spin"]),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    y[15] || (y[15] = _(" Refresh ", -1))
                  ]),
                  _: 1
                }, 8, ["disabled", "onClick"]),
                u(e(le), {
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  disabled: e(Oe) || e(Ee) || e(be) || e(Ze) === 0,
                  onClick: e(Ue)
                }, {
                  default: X(() => [
                    u(e(k), {
                      icon: e(Oe) ? "tabler:loader-2" : "tabler:refresh-dot",
                      class: ne(["km-i", e(Oe) && "spin"]),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    y[16] || (y[16] = _(" Scan updates ", -1))
                  ]),
                  _: 1
                }, 8, ["disabled", "onClick"]),
                u(e(le), {
                  size: "small",
                  disabled: e(Ee) || e(Oe) || e(Me).length === 0,
                  onClick: e(mt)
                }, {
                  default: X(() => [
                    u(e(k), {
                      icon: e(Ee) ? "tabler:loader-2" : "tabler:download",
                      class: ne(["km-i", e(Ee) && "spin"]),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    y[17] || (y[17] = _(" Update all ", -1)),
                    e(Me).length ? (n(), a("span", _r, i(e(Me).length), 1)) : c("", !0)
                  ]),
                  _: 1
                }, 8, ["disabled", "onClick"]),
                lt(t("input", {
                  "onUpdate:modelValue": y[0] || (y[0] = (m) => _t(p) ? p.value = m : null),
                  class: "km-input km-filter",
                  placeholder: "Filter…"
                }, null, 512), [
                  [Xt, e(p)]
                ]),
                u(e(dn), {
                  modelValue: e(g),
                  "onUpdate:modelValue": y[1] || (y[1] = (m) => _t(g) ? g.value = m : null),
                  class: "km-sort",
                  options: [
                    { label: "Top downloads", value: "downloads" },
                    { label: "Name A→Z", value: "name" },
                    { label: "Recently updated", value: "recent" }
                  ],
                  "option-label": "label",
                  "option-value": "value",
                  "aria-label": "Sort modules"
                }, null, 8, ["modelValue"]),
                t("div", {
                  ref_key: "anchorEl",
                  ref: kt,
                  class: "km-hub-auth"
                }, [
                  u(e(le), {
                    size: "small",
                    severity: e(M) ? "secondary" : e(H) ? "warn" : void 0,
                    outlined: e(M) || e(H),
                    disabled: e(z),
                    onClick: y[2] || (y[2] = (m) => D.value = !e(D))
                  }, {
                    default: X(() => [
                      u(e(k), {
                        icon: e(q),
                        class: "km-i",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      _(" " + i(e(x)) + " ", 1),
                      u(e(k), {
                        icon: "tabler:chevron-down",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      })
                    ]),
                    _: 1
                  }, 8, ["severity", "outlined", "disabled"]),
                  u(Dn, {
                    open: e(D),
                    "onUpdate:open": y[5] || (y[5] = (m) => _t(D) ? D.value = m : null),
                    anchor: kt.value,
                    align: "right",
                    width: 300
                  }, {
                    default: X(() => [
                      t("div", wr, [
                        y[21] || (y[21] = t("div", { class: "km-hub-auth-title" }, "Wippy Hub token", -1)),
                        e(T) ? (n(), a("div", {
                          key: 0,
                          class: ne(["km-hub-auth-active", e(H) && "is-expired"])
                        }, [
                          t("div", $r, [
                            u(e(k), {
                              icon: e(H) ? "tabler:alert-triangle" : "tabler:circle-check-filled",
                              class: ne(["km-i-sm", e(H) ? "km-hub-warn" : "km-hub-ok"]),
                              "aria-hidden": "true"
                            }, null, 8, ["icon", "class"]),
                            t("span", null, [
                              _(i(e(H) ? "Token expired" : "Token active"), 1),
                              e(W) ? (n(), a(J, { key: 0 }, [
                                y[18] || (y[18] = _(" — ", -1)),
                                t("strong", null, i(e(W)), 1)
                              ], 64)) : c("", !0)
                            ])
                          ]),
                          e(P)?.registry ? (n(), a("div", Sr, i(e(P).registry), 1)) : c("", !0),
                          e(F) ? (n(), a("div", Cr, "Expires " + i(e(F)), 1)) : c("", !0),
                          e(V).length ? (n(), a("div", Ir, [
                            y[19] || (y[19] = t("div", { class: "km-hub-auth-orgs-label" }, "Organizations", -1)),
                            (n(!0), a(J, null, ie(e(V), (m) => (n(), a("div", {
                              key: m.id || m.name,
                              class: "km-hub-auth-org"
                            }, [
                              u(e(k), {
                                icon: "tabler:building",
                                class: "km-i-sm",
                                "aria-hidden": "true"
                              }),
                              t("span", xr, i(m.display_name || m.name), 1),
                              m.role ? (n(), a("span", Rr, i(m.role), 1)) : c("", !0)
                            ]))), 128))
                          ])) : c("", !0)
                        ], 2)) : c("", !0),
                        t("p", Mr, [
                          _(i(e(T) ? "Replace the token, or" : "Paste a Hub registry token to browse and install private modules.") + " ", 1),
                          e(T) ? (n(), a(J, { key: 0 }, [
                            _("create a new one")
                          ], 64)) : c("", !0),
                          t("a", {
                            href: e(L),
                            target: "_blank",
                            rel: "noopener"
                          }, i(e(T) ? "↗" : "Create one →"), 9, Ar)
                        ]),
                        lt(t("input", {
                          "onUpdate:modelValue": y[3] || (y[3] = (m) => _t(B) ? B.value = m : null),
                          type: "password",
                          class: "km-input km-hub-auth-input",
                          placeholder: "wpy_…",
                          autocomplete: "off",
                          onKeyup: y[4] || (y[4] = qn(
                            //@ts-ignore
                            (...m) => e(l) && e(l)(...m),
                            ["enter"]
                          ))
                        }, null, 544), [
                          [Xt, e(B)]
                        ]),
                        t("div", Ur, [
                          u(e(le), {
                            size: "small",
                            disabled: e(z),
                            onClick: e(l)
                          }, {
                            default: X(() => [
                              u(e(k), {
                                icon: e(z) ? "tabler:loader-2" : "tabler:device-floppy",
                                class: ne(["km-i", e(z) && "spin"]),
                                "aria-hidden": "true"
                              }, null, 8, ["icon", "class"]),
                              _(" " + i(e(z) ? "Saving…" : e(T) ? "Replace token" : "Save token"), 1)
                            ]),
                            _: 1
                          }, 8, ["disabled", "onClick"]),
                          e(T) ? (n(), Ce(e(le), {
                            key: 0,
                            size: "small",
                            severity: "secondary",
                            outlined: "",
                            onClick: e(Q)
                          }, {
                            default: X(() => [
                              u(e(k), {
                                icon: "tabler:trash",
                                class: "km-i",
                                "aria-hidden": "true"
                              }),
                              y[20] || (y[20] = _(" Clear ", -1))
                            ]),
                            _: 1
                          }, 8, ["onClick"])) : c("", !0)
                        ])
                      ])
                    ]),
                    _: 1
                  }, 8, ["open", "anchor"])
                ], 512)
              ])
            ]),
            e(K) ? (n(), a("div", Tr, i(e(K)), 1)) : c("", !0),
            !e(M) && e(H) ? (n(), a("div", Er, "Your Wippy Hub token is expired.")) : c("", !0),
            e(Fe) ? (n(), a("div", Lr, i(e(Fe)), 1)) : c("", !0),
            e(Qe) || e(be) ? (n(), a("div", Dr, [
              u(e(k), {
                icon: "tabler:loader-2",
                class: "km-i spin",
                "aria-hidden": "true"
              }),
              y[22] || (y[22] = _(" Loading modules… ", -1))
            ])) : e(I).length > 0 ? (n(), a(J, { key: 4 }, [
              e(U).length ? (n(), a("div", Vr, [
                t("div", Nr, [
                  u(e(k), {
                    icon: "tabler:flame",
                    class: "km-i km-flame",
                    "aria-hidden": "true"
                  }),
                  y[23] || (y[23] = t("span", { class: "hub-section-title" }, "Most popular", -1)),
                  y[24] || (y[24] = t("span", { class: "hub-section-sub" }, "by downloads", -1))
                ]),
                t("div", Pr, [
                  (n(!0), a(J, null, ie(e(U), (m) => (n(), a("button", {
                    key: "f" + e(sn)(m),
                    class: "feat-card",
                    style: Et({ "--accent": e(Yt)(m) }),
                    onClick: (Ve) => e(rt)(m)
                  }, [
                    y[26] || (y[26] = t("span", { class: "feat-strip" }, null, -1)),
                    t("span", Br, [
                      u(e(k), {
                        icon: e(Bt)(m),
                        class: "km-i-lg",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    t("span", Or, [
                      t("span", zr, [
                        t("span", Hr, i(e(qt)(m)), 1),
                        e(jt)(m) ? (n(), a("span", Fr, "app")) : c("", !0),
                        e(Wt)(m) ? (n(), a("span", jr, [
                          u(e(k), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          y[25] || (y[25] = _(" private", -1))
                        ])) : c("", !0),
                        m.deprecated ? (n(), a("span", Kr, "deprecated")) : c("", !0)
                      ]),
                      t("span", Gr, i(e(tn)(m)), 1),
                      m.description ? (n(), a("span", Wr, i(m.description), 1)) : c("", !0),
                      t("span", Yr, [
                        t("span", Jr, [
                          u(e(k), {
                            icon: "tabler:tag",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          _(" " + i(m.latest_version || "?"), 1)
                        ]),
                        t("span", Zr, [
                          u(e(k), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          _(" " + i(e(Jt)(m.total_downloads)), 1)
                        ]),
                        m.license ? (n(), a("span", {
                          key: 0,
                          class: "meta-pill",
                          title: m.license
                        }, [
                          u(e(k), {
                            icon: "tabler:license",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          _(" " + i(e(an)(m.license)), 1)
                        ], 8, Qr)) : c("", !0)
                      ])
                    ])
                  ], 12, qr))), 128))
                ])
              ])) : c("", !0),
              t("div", {
                class: ne(e(U).length ? "km-mt-sm" : "")
              }, [
                t("div", Xr, [
                  u(e(k), {
                    icon: "tabler:apps",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  t("span", eu, i(e(U).length ? "All modules" : "Available"), 1),
                  t("span", tu, i(e(I).length) + " available", 1)
                ]),
                t("div", nu, [
                  (n(!0), a(J, null, ie(e(j), (m) => (n(), a("button", {
                    key: e(sn)(m),
                    class: "mod-card",
                    style: Et({ "--accent": e(Yt)(m) }),
                    onClick: (Ve) => e(rt)(m)
                  }, [
                    t("span", au, [
                      u(e(k), {
                        icon: e(Bt)(m),
                        class: "km-i",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    t("span", lu, [
                      t("span", iu, [
                        t("span", ou, i(e(qt)(m)), 1),
                        t("span", ru, i(m.latest_version || "—"), 1),
                        e(jt)(m) ? (n(), a("span", uu, "app")) : c("", !0),
                        e(Wt)(m) ? (n(), a("span", du, [
                          u(e(k), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          y[27] || (y[27] = _(" private", -1))
                        ])) : c("", !0),
                        m.deprecated ? (n(), a("span", cu, "deprecated")) : c("", !0)
                      ]),
                      t("span", mu, i(e(tn)(m)), 1),
                      m.description ? (n(), a("span", vu, i(m.description), 1)) : c("", !0),
                      t("span", pu, [
                        t("span", ku, [
                          u(e(k), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          _(" " + i(e(Jt)(m.total_downloads)), 1)
                        ]),
                        m.favorites_count ? (n(), a("span", fu, [
                          u(e(k), {
                            icon: "tabler:star",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          _(" " + i(m.favorites_count), 1)
                        ])) : c("", !0),
                        m.license ? (n(), a("span", {
                          key: 1,
                          class: "foot-stat km-dim",
                          title: m.license
                        }, i(e(an)(m.license)), 9, gu)) : c("", !0),
                        m.update_time ? (n(), a("span", hu, i(e(ln)(m.update_time, { maxUnit: "year" })), 1)) : c("", !0)
                      ])
                    ])
                  ], 12, su))), 128))
                ])
              ], 2)
            ], 64)) : !e(Fe) && e(St).length === 0 ? (n(), a("div", yu, [
              u(e(k), {
                icon: "tabler:package-off",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              t("p", bu, [
                y[28] || (y[28] = _(" No modules tagged ", -1)),
                t("code", _u, i(e(r)), 1),
                y[29] || (y[29] = _(" are published yet. ", -1))
              ])
            ])) : !e(Fe) && e(p) ? (n(), a("div", wu, [...y[30] || (y[30] = [
              t("p", { class: "km-muted" }, "No available modules match this filter.", -1)
            ])])) : e(Fe) ? c("", !0) : (n(), a("div", $u, [
              u(e(k), {
                icon: "tabler:circle-check",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              t("p", Su, [
                y[31] || (y[31] = _(" All ", -1)),
                t("code", Cu, i(e(r)), 1),
                y[32] || (y[32] = _(" modules are installed — manage them under Installed below. ", -1))
              ])
            ]))
          ]),
          e(Je).length > 0 || e(ze) ? (n(), a("section", Iu, [
            t("button", {
              class: "km-collapse-head",
              "aria-expanded": e(He),
              onClick: y[6] || (y[6] = (m) => He.value = !e(He))
            }, [
              u(e(k), {
                icon: e(He) ? "tabler:chevron-down" : "tabler:chevron-right",
                class: "km-i",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              y[33] || (y[33] = t("span", { class: "km-h2" }, "Installed", -1)),
              t("span", Ru, [
                _(i(e(Y).length), 1),
                e(Y).length !== e(Ze) ? (n(), a(J, { key: 0 }, [
                  _(" of " + i(e(Ze)), 1)
                ], 64)) : c("", !0),
                _(" module" + i(e(Y).length === 1 ? "" : "s"), 1)
              ]),
              e(Le) > 0 && e(Le) !== e(Ze) ? (n(), a("span", Mu, i(e(Ct)) + " of " + i(e(Le)) + " hub module" + i(e(Le) === 1 ? "" : "s"), 1)) : c("", !0),
              e(Me).length ? (n(), a("span", Au, i(e(Me).length) + " update" + i(e(Me).length === 1 ? "" : "s"), 1)) : c("", !0)
            ], 8, xu),
            e(He) ? (n(), a(J, { key: 0 }, [
              e(ze) ? (n(), a("div", Uu, i(e(ze)), 1)) : c("", !0),
              e(Je).length > 0 ? (n(), a("div", Tu, [
                lt(t("input", {
                  "onUpdate:modelValue": y[7] || (y[7] = (m) => _t(Be) ? Be.value = m : null),
                  class: "km-input km-filter inst-filter",
                  placeholder: "Search installed…",
                  "aria-label": "Search installed modules"
                }, null, 512), [
                  [Xt, e(Be)]
                ]),
                u(e(dn), {
                  modelValue: e(ut),
                  "onUpdate:modelValue": y[8] || (y[8] = (m) => _t(ut) ? ut.value = m : null),
                  class: "km-sort",
                  options: [
                    { label: "All installed", value: "all" },
                    { label: "Root only", value: "root" },
                    { label: "Transitive only", value: "transitive" },
                    { label: "Local replacements", value: "local" }
                  ],
                  "option-label": "label",
                  "option-value": "value",
                  "aria-label": "Filter installed modules"
                }, null, 8, ["modelValue"])
              ])) : c("", !0),
              e(Y).length > 0 ? (n(), a("div", Eu, [
                (n(!0), a(J, null, ie(e(Y), (m) => (n(), a("button", {
                  key: m.id,
                  class: "inst-row",
                  style: Et({ "--accent": e(fe)(m) }),
                  onClick: (Ve) => e(rt)(m)
                }, [
                  y[35] || (y[35] = t("span", {
                    class: "inst-strip",
                    "aria-hidden": "true"
                  }, null, -1)),
                  t("div", Du, [
                    u(e(k), {
                      icon: e(Xe)(m),
                      class: "km-i",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  t("div", Vu, [
                    t("div", Nu, [
                      t("span", Pu, i(m.component), 1),
                      e(jt)(e(oe)(m.component)) ? (n(), a("span", qu, "app")) : c("", !0),
                      t("span", {
                        class: ne(e(It)(m) ? "badge-installed kx-tag-caps" : "km-chip")
                      }, i(e(Ae)(m)), 3),
                      e(ue)(m) ? (n(), a("span", Bu, [
                        u(e(k), {
                          icon: "tabler:lock",
                          class: "km-i-xs",
                          "aria-hidden": "true"
                        }),
                        y[34] || (y[34] = _(" private", -1))
                      ])) : c("", !0),
                      m.source ? (n(), a("span", Ou, i(m.source), 1)) : c("", !0),
                      e(je)(m) && e(je)(m)?.status !== "current" ? (n(), a("span", {
                        key: 3,
                        class: ne(["inst-update", e(je)(m)?.status]),
                        title: e(je)(m)?.message || ""
                      }, [
                        u(e(k), {
                          icon: e(xt)(m),
                          class: ne(["km-i-xs", e(ft)(m) && "spin"]),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"]),
                        _(" " + i(e(zt)(m)), 1)
                      ], 10, zu)) : c("", !0)
                    ]),
                    t("div", Hu, [
                      _(i(m.id) + " ", 1),
                      e(et)(m) ? (n(), a("span", Fu, " · " + i(e(et)(m)), 1)) : c("", !0)
                    ]),
                    e(je)(m)?.message ? (n(), a("div", ju, i(e(je)(m)?.message), 1)) : c("", !0)
                  ]),
                  t("span", Ku, i(e(it)(m)), 1),
                  t("span", Gu, i(e(tt)(m)), 1),
                  t("div", Wu, [
                    e(je)(m)?.status === "available" || e(ft)(m) ? (n(), a("button", {
                      key: 0,
                      class: "km-icon-btn",
                      disabled: e(ft)(m) || e(Ee),
                      "aria-label": `Update ${m.component}`,
                      onClick: un((Ve) => e(De)(m), ["stop"])
                    }, [
                      u(e(k), {
                        icon: e(xt)(m),
                        class: ne(["km-i", e(ft)(m) && "spin"]),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"])
                    ], 8, Yu)) : e(dt)(m) ? (n(), a("button", {
                      key: 1,
                      class: "km-icon-btn",
                      disabled: e(Ee),
                      "aria-label": `Open update planner for ${m.component}`,
                      onClick: un((Ve) => e(gt)(m), ["stop"])
                    }, [
                      u(e(k), {
                        icon: "tabler:refresh-dot",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Ju)) : (n(), a("button", {
                      key: 2,
                      class: "km-icon-btn",
                      disabled: "",
                      title: e(ct)(m),
                      "aria-label": `Cannot update ${m.component}: ${e(ct)(m)}`
                    }, [
                      u(e(k), {
                        icon: "tabler:refresh-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Zu)),
                    e(pe)(m) ? (n(), a("button", {
                      key: 3,
                      class: "km-icon-btn km-danger",
                      "aria-label": `Uninstall ${m.component}`,
                      onClick: un((Ve) => e(Nt)(m), ["stop"])
                    }, [
                      u(e(k), {
                        icon: "tabler:trash",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Qu)) : (n(), a("button", {
                      key: 4,
                      class: "km-icon-btn",
                      disabled: "",
                      title: e(xe)(m),
                      "aria-label": `Cannot uninstall ${m.component}: ${e(xe)(m)}`
                    }, [
                      u(e(k), {
                        icon: "tabler:trash-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Xu))
                  ]),
                  u(e(k), {
                    icon: "tabler:chevron-right",
                    class: "km-i km-chev",
                    "aria-hidden": "true"
                  })
                ], 12, Lu))), 128))
              ])) : e(Je).length > 0 ? (n(), a("div", ed, [
                u(e(k), {
                  icon: "tabler:filter-off",
                  class: "km-i-xl km-dim km-block",
                  "aria-hidden": "true"
                }),
                y[36] || (y[36] = t("p", { class: "km-muted" }, "No installed modules match this filter.", -1))
              ])) : c("", !0)
            ], 64)) : c("", !0)
          ])) : c("", !0)
        ]))
      ])),
      e(he) ? (n(), Ce(Ai, {
        key: 4,
        open: !0,
        mode: e(he).mode,
        component: e(he).component,
        version: e(he).version,
        "current-id": e(he).currentId,
        "catalog-item": e(he).catalogItem,
        "installed-dep": e(he).installedDep,
        onClose: e(nt),
        onChanged: e(Ht)
      }, null, 8, ["mode", "component", "version", "current-id", "catalog-item", "installed-dep", "onClose", "onChanged"])) : c("", !0),
      u(e(Bn), {
        visible: e(st),
        "onUpdate:visible": y[11] || (y[11] = (m) => _t(st) ? st.value = m : null),
        modal: "",
        closable: !e(ke),
        "dismissable-mask": !e(ke),
        "close-on-escape": !e(ke),
        class: "km-dialog",
        pt: { header: { class: "km-modal-head" }, content: { class: "km-dialog-content" }, footer: { class: "km-modal-foot" } },
        style: { width: "min(560px, calc(100vw - 40px))" }
      }, {
        header: X(() => [...y[37] || (y[37] = [
          t("span", null, "Uninstall module", -1)
        ])]),
        footer: X(() => [
          u(e(le), {
            size: "small",
            severity: "secondary",
            text: "",
            disabled: e(ke),
            onClick: y[10] || (y[10] = (m) => st.value = !1)
          }, {
            default: X(() => [...y[50] || (y[50] = [
              _("Cancel", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]),
          u(e(le), {
            size: "small",
            severity: "secondary",
            outlined: "",
            disabled: e(ke) || e(Ge),
            onClick: e(pt)
          }, {
            default: X(() => [
              u(e(k), {
                icon: e(Ge) ? "tabler:loader-2" : "tabler:eye",
                class: ne(["km-i", e(Ge) && "spin"]),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              y[51] || (y[51] = _(" Preview ", -1))
            ]),
            _: 1
          }, 8, ["disabled", "onClick"]),
          u(e(le), {
            size: "small",
            severity: "danger",
            disabled: !!e(we),
            title: e(we) || void 0,
            onClick: e(bt)
          }, {
            default: X(() => [
              u(e(k), {
                icon: e(ke) ? "tabler:loader-2" : "tabler:trash",
                class: ne(["km-i", e(ke) && "spin"]),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              y[52] || (y[52] = _(" Uninstall ", -1))
            ]),
            _: 1
          }, 8, ["disabled", "title", "onClick"])
        ]),
        default: X(() => [
          t("div", td, [
            t("p", nd, [
              y[38] || (y[38] = _(" Uninstall ", -1)),
              t("code", sd, i(e(at)?.component), 1),
              t("span", ad, "(" + i(e(at)?.id) + ")", 1)
            ]),
            t("div", null, [
              y[39] || (y[39] = t("label", { class: "km-label" }, "Migration policy", -1)),
              u(e(dn), {
                modelValue: e(Ke),
                "onUpdate:modelValue": y[9] || (y[9] = (m) => _t(Ke) ? Ke.value = m : null),
                class: "km-sort km-w-full",
                options: e(s),
                "option-label": "label",
                "option-value": "value",
                "aria-label": "Uninstall migration policy"
              }, null, 8, ["modelValue", "options"]),
              y[40] || (y[40] = t("p", { class: "km-req-desc" }, [
                _("Default "),
                t("code", { class: "km-mono" }, "block"),
                _(". Choose "),
                t("code", { class: "km-mono" }, "down"),
                _(" only if the module's down migrations are safe; data loss is possible.")
              ], -1))
            ]),
            e(ht) ? (n(), a("div", ld, [
              e(_e) ? (n(), a("span", id, i(e(_e)), 1)) : c("", !0),
              _(i(e(ht)) + " ", 1),
              e(Rt).length ? (n(), a("div", od, "required by: " + i(e(Rt).join(", ")), 1)) : c("", !0)
            ])) : c("", !0),
            e(yt) ? (n(), a("div", rd, [
              y[41] || (y[41] = t("strong", null, "Uninstall blocked:", -1)),
              _(" " + i(e(yt)), 1)
            ])) : c("", !0),
            e(Ge) ? (n(), a("div", ud, [
              u(e(k), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              y[42] || (y[42] = t("span", { class: "km-grow km-running-label" }, "Previewing uninstall", -1))
            ])) : e(ve) ? (n(), a("div", dd, [
              e(ve).warnings?.length ? (n(), a("div", cd, [
                (n(!0), a(J, null, ie(e(ve).warnings, (m) => (n(), a("div", { key: m }, i(m), 1))), 128))
              ])) : c("", !0),
              e(ve).removed?.length ? (n(), a("div", md, [
                y[44] || (y[44] = t("div", { class: "km-preview-title" }, "Removed", -1)),
                (n(!0), a(J, null, ie(e(ve).removed, (m) => (n(), a("div", {
                  key: m.name || m.component,
                  class: "km-preview-row"
                }, [
                  u(e(k), {
                    icon: "tabler:minus",
                    class: "km-i-xs km-danger-fg",
                    "aria-hidden": "true"
                  }),
                  t("span", vd, i(m.name || m.component), 1),
                  y[43] || (y[43] = t("span", { class: "km-grow" }, null, -1)),
                  t("span", pd, i(m.version), 1)
                ]))), 128))
              ])) : c("", !0),
              e(ve).kept?.length ? (n(), a("div", kd, [
                y[46] || (y[46] = t("div", { class: "km-preview-title" }, "Kept, still needed", -1)),
                (n(!0), a(J, null, ie(e(ve).kept, (m) => (n(), a("div", {
                  key: m.name || m.component,
                  class: "km-preview-row"
                }, [
                  u(e(k), {
                    icon: "tabler:lock",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  t("span", fd, i(m.name || m.component), 1),
                  y[45] || (y[45] = t("span", { class: "km-grow" }, null, -1)),
                  t("span", gd, i(m.version), 1)
                ]))), 128))
              ])) : c("", !0),
              e(ve).kept_under_uncertainty?.length ? (n(), a("div", hd, [
                y[48] || (y[48] = t("div", { class: "km-preview-title" }, "Kept because usage is unclear", -1)),
                (n(!0), a(J, null, ie(e(ve).kept_under_uncertainty, (m) => (n(), a("div", {
                  key: m.name || m.component,
                  class: "km-preview-row"
                }, [
                  u(e(k), {
                    icon: "tabler:help",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  t("span", yd, i(m.name || m.component), 1),
                  y[47] || (y[47] = t("span", { class: "km-grow" }, null, -1)),
                  t("span", bd, i(m.reason || m.version), 1)
                ]))), 128))
              ])) : c("", !0)
            ])) : c("", !0),
            e(Vt).length ? (n(), a("div", _d, [
              y[49] || (y[49] = t("div", { class: "km-panel-title" }, "Uninstall steps", -1)),
              (n(!0), a(J, null, ie(e(Vt), (m, Ve) => (n(), a("div", {
                key: `${m.step}-${Ve}`,
                class: ne(["km-ledger-row", m.status === "failed" || m.status === "rollback_failed" ? "km-ledger-bad" : m.status === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok"])
              }, [
                t("span", wd, i(Ve + 1), 1),
                t("span", $d, i(e(Pt)(m)), 1),
                t("span", Sd, i(m.status), 1),
                m.message ? (n(), a("span", Cd, i(m.message), 1)) : c("", !0)
              ], 2))), 128))
            ])) : c("", !0),
            e(ke) ? (n(), a("div", Id, [
              u(e(k), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              t("span", xd, i(e(Mt)), 1),
              t("span", Rd, i(e(At)) + "s", 1)
            ])) : c("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible", "closable", "dismissable-mask", "close-on-escape"])
    ]));
  }
}), Bd = {
  rootComponent: Md,
  plugins: [Vn]
};
export {
  Bd as mountConfig
};
//# sourceMappingURL=lazy-mount-DYoT4zXb.js.map

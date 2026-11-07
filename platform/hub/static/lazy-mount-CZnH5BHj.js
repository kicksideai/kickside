import { P as Vn } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as Bt, ref as A, watch as Le, nextTick as Kt, onBeforeUnmount as Rn, openBlock as n, createElementBlock as a, normalizeStyle as Ut, renderSlot as Zt, createCommentVNode as c, computed as P, onUnmounted as fn, onMounted as gn, createElementVNode as t, normalizeClass as X, createVNode as v, unref as e, withCtx as pt, createTextVNode as w, useId as Dn, Fragment as J, toDisplayString as l, withDirectives as lt, vModelText as Qt, renderList as ae, resolveComponent as Mn, createBlock as Nt, vShow as Ft, vModelCheckbox as Nn, isRef as ht, withKeys as Pn, withModifiers as rn } from "vue";
import { Icon as k } from "@iconify/vue";
import qn from "primevue/dialog";
import un from "primevue/select";
import { m as Gt, r as it, a as en, b as Pt, c as tn, K as Tt, d as hn, e as $e, f as mn, i as yn, g as _n, h as Bn, j as nn, s as On, k as Hn, l as Fn, n as jn, o as zn, p as An, q as qt, t as Wt, u as Un, v as Kn, w as Xt, x as se, y as Gn, z as Wn, A as Yn, B as Jn, C as Zn, D as jt, E as Yt, F as sn, G as zt } from "./requiredSetup-CKaPvMvx.js";
import { api as bn, loadByTagName as Tn, host as En, on as Qn } from "@wippy-fe/proxy";
import { a as Xn } from "./wc-runtime-BMe_f3Uc.js";
import es from "primevue/button";
const ts = 2e3;
function wn(o) {
  const $ = o.margin ?? 8, r = o.gap ?? 4, L = Math.max(0, o.viewportWidth), s = Math.max(0, o.viewportHeight), G = Math.max(0, L - $ * 2), S = Math.min(Math.max(0, o.requestedWidth), G), E = o.align === "right" ? o.anchor.right - S : o.anchor.left, M = Math.max($, Math.min(E, L - $ - S)), V = Math.max(0, s - o.anchor.bottom - r - $), q = Math.max(0, o.anchor.top - r - $), D = V < o.requestedMaxHeight && q > V ? "above" : "below", H = D === "above" ? q : V, z = Math.round(Math.min(Math.max(0, o.requestedMaxHeight), H)), N = Math.min(Math.max(0, o.panelHeight ?? z), z), Y = D === "above" ? o.anchor.top - r - N : o.anchor.bottom + r, T = o.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(M - T.left),
    width: Math.round(S),
    maxHeight: z,
    side: D,
    top: Math.round(Y - T.top)
  };
}
const Ln = /* @__PURE__ */ Bt({
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
      const Y = r.anchor, T = s.value;
      if (!Y || !T) return;
      const K = Y.getBoundingClientRect(), B = r.width === "anchor" ? Math.max(r.minWidth, K.width) : Math.max(r.minWidth, r.width), I = {
        anchor: K,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: B,
        requestedMaxHeight: r.maxHeight,
        align: r.align,
        gap: r.gap
      }, F = wn(I);
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
      const i = T.getBoundingClientRect(), Q = wn({
        ...I,
        containingBlockOrigin: { left: i.left, top: i.top },
        panelHeight: i.height
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
    function V() {
      M || !r.open || (M = !0, requestAnimationFrame(() => {
        M = !1, r.open && S();
      }));
    }
    function q() {
      typeof ResizeObserver > "u" || (E = new ResizeObserver(V), s.value && E.observe(s.value), r.anchor && E.observe(r.anchor));
    }
    function D() {
      E?.disconnect(), E = null, M = !1;
    }
    Le(() => r.open, async (Y) => {
      D(), Y && (G.value = { position: "fixed", visibility: "hidden" }, await Kt(), S(), q());
    }, { immediate: !0 });
    function H(Y) {
      if (!r.open) return;
      const T = Y.composedPath();
      s.value && T.includes(s.value) || r.anchor && T.includes(r.anchor) || L("update:open", !1);
    }
    function z(Y) {
      r.open && Y.key === "Escape" && L("update:open", !1);
    }
    function N() {
      r.open && S();
    }
    return document.addEventListener("click", H), document.addEventListener("keydown", z), window.addEventListener("resize", N), window.addEventListener("scroll", N, !0), Rn(() => {
      D(), document.removeEventListener("click", H), document.removeEventListener("keydown", z), window.removeEventListener("resize", N), window.removeEventListener("scroll", N, !0);
    }), (Y, T) => o.open ? (n(), a("div", {
      key: 0,
      ref_key: "panel",
      ref: s,
      class: "anchored-panel",
      style: Ut(G.value)
    }, [
      Zt(Y.$slots, "default")
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
function an(o, $) {
  const r = ns(o);
  if (r === null) return "";
  const L = $?.now ?? Date.now(), s = $?.suffix ?? !0, G = $?.maxUnit ?? "day", S = $?.future ?? !1, E = 6e4, M = 60 * E, V = 24 * M, q = 30 * V, D = 365 * V, H = L - r;
  if (S && H < 0) {
    const Y = -H;
    return Y < E ? "in <1m" : Y < M ? `in ${Math.floor(Y / E)}m` : Y < V ? `in ${Math.floor(Y / M)}h` : `in ${Math.floor(Y / V)}d`;
  }
  const z = Math.max(0, H);
  if (z < E) return "just now";
  const N = s ? " ago" : "";
  return z < M ? `${Math.floor(z / E)}m${N}` : z < V ? `${Math.floor(z / M)}h${N}` : G === "year" ? z < q ? `${Math.floor(z / V)}d${N}` : z < D ? `${Math.floor(z / q)}mo${N}` : `${Math.floor(z / D)}y${N}` : `${Math.floor(z / V)}d${N}`;
}
const vn = {
  tool: { label: "Tools", icon: "tabler:tool" },
  "agent.trait": { label: "Agent capabilities", icon: "tabler:robot" },
  "contract.binding": { label: "Contract bindings", icon: "tabler:plug-connected" },
  "contract.definition": { label: "Contracts", icon: "tabler:file-description" },
  "view.page": { label: "Pages", icon: "tabler:browser" },
  "view.component": { label: "Components", icon: "tabler:components" }
};
function ss(o) {
  const $ = o.meta?.type || "";
  return $ && vn[$] ? $ : o.kind;
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
function ze(o, $) {
  const r = $ instanceof Error ? $.message : String($);
  console.error(`[${o}]`, r, $);
}
function pn() {
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
function $n(o) {
  const $ = o.migrations || [];
  if ($.length === 0) return "";
  const r = $.filter((G) => G.status === "applied").length, L = $.filter((G) => G.status === "pending").length, s = [];
  return r > 0 && s.push(`${r} applied`), L > 0 && s.push(`${L} pending`), s.join(", ") || `${$.length} migrations`;
}
function rs({ hub: o, installed: $, catalog: r, installedDepFor: L, installedCanUpdate: s, installedUpdateDisabledReason: G, installedCanUninstall: S, installedIsPrivate: E }) {
  const M = A(null), V = A(null), q = A(""), D = A([]), H = A(!1), z = A("readme"), N = A([]), Y = P(() => D.value.filter((_) => _.kind === "env.variable")), T = P(() => D.value.filter((_) => _.kind === "ns.requirement")), K = P(() => {
    const _ = {};
    for (const R of D.value) {
      if (R.kind === "env.variable" || R.kind === "ns.requirement") continue;
      const Z = ss(R);
      (_[Z] ||= []).push(R);
    }
    return Object.entries(_).map(([R, Z]) => ({
      key: R,
      label: vn[R]?.label || R,
      icon: vn[R]?.icon || "tabler:point",
      items: Z
    })).sort((R, Z) => Z.items.length - R.items.length);
  }), B = P(() => N.value.find((_) => _.version === M.value?.version) || N.value[0]), I = P(() => M.value ? L(M.value.component) : void 0), F = P(() => !!(I.value && s(I.value))), i = P(() => I.value && !s(I.value) ? G(I.value) : ""), Q = P(() => !!(I.value && S(I.value))), d = P(() => Gt(V.value) || !!(I.value && E(I.value)));
  async function g(_) {
    try {
      const R = $.value.find((ne) => ne.component === _);
      return R?.entries ? R.entries : ((await o.listDependencies({ component: _, includeMigrations: !1 })).dependencies || []).find((ne) => ne.component === _)?.entries || [];
    } catch (R) {
      return ze("modules:entries", R), [];
    }
  }
  async function y(_, R) {
    if (R && R.full_name) return R;
    const Z = r.value.find((ee) => tn(ee, _));
    if (Z) return Z;
    try {
      const ee = _.split("/").pop() || _, de = ((await o.browseModules({ query: ee, pageSize: 50 })).items || []).find((Ke) => tn(Ke, _));
      if (de) return de;
    } catch {
    }
    return { full_name: _, component: _, latest_version: "", type: "library" };
  }
  async function re(_) {
    const R = "component" in _ && typeof _.component == "string" && !("full_name" in _) ? _.component : en(_), Z = L(R), ee = "full_name" in _ ? _ : void 0;
    M.value = {
      component: R,
      label: ee ? Pt(ee) : R,
      description: ee?.description || "",
      version: Z ? it(Z) : String(ee?.latest_version || ""),
      installed: !!Z,
      installedId: Z?.id
    }, V.value = ee || null, q.value = "", D.value = [], N.value = [], z.value = "readme", H.value = !0;
    try {
      const [ne, de, Ke, ke] = await Promise.all([
        y(R, ee),
        o.getReadme(R).then((Ve) => Ve.content || "").catch(() => ""),
        Z ? g(R) : Promise.resolve([]),
        o.listVersions(R).then((Ve) => Ve.items || []).catch(() => [])
      ]);
      V.value = ne, q.value = de, D.value = Ke, N.value = ke, M.value && (M.value = {
        ...M.value,
        label: Pt(ne),
        description: ne.description || M.value.description,
        version: Z ? it(Z) : String(ne.latest_version || M.value.version)
      }), de || (z.value = "overview");
    } finally {
      H.value = !1;
    }
  }
  function m() {
    M.value = null;
  }
  async function h() {
    if (!M.value) return;
    const _ = M.value.component, R = L(_);
    M.value = {
      ...M.value,
      installed: !!R,
      installedId: R?.id,
      version: R ? it(R) : M.value.version
    }, D.value = R ? await g(_) : [];
  }
  return {
    selected: M,
    selectedModule: V,
    detailReadme: q,
    detailEntries: D,
    detailLoading: H,
    detailTab: z,
    detailVersions: N,
    envVars: Y,
    requirements: T,
    detailGroups: K,
    versionMeta: B,
    selectedInstalledDep: I,
    selectedCanUpdate: F,
    selectedUpdateDisabledReason: i,
    selectedCanUninstall: Q,
    selectedIsPrivate: d,
    loadEntriesFor: g,
    findModule: y,
    openDetail: re,
    closeDetail: m,
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
  Le(o, (M) => {
    G(), M ? (L = Date.now(), r.value = 0, s = setInterval(() => {
      r.value = Date.now() - L;
    }, 200)) : r.value = 0;
  }), fn(G);
  const S = P(() => $.find((M) => r.value < M.until)?.label || $[$.length - 1].label), E = P(() => Math.floor(r.value / 1e3));
  return { phase: S, elapsedSec: E };
}
function cs({ hub: o, selected: $, selectedInstalledDep: r, installedIsRoot: L, installedUninstallDisabledReason: s, installedCanUninstall: G, refreshAll: S, refreshSelectedDetail: E, showToast: M, notifyModulesChanged: V }) {
  const q = A(!1), D = A(null), H = A("block"), z = A(!1), N = A(!1), Y = A(null), T = A([]), K = A(null), B = A(null), I = A([]), { phase: F, elapsedSec: i } = ds(z, us), Q = P(() => {
    const h = r.value;
    return !$.value?.installed || !h || L(h) ? "" : s(h);
  }), d = P(() => D.value ? z.value ? "Uninstall is running." : N.value ? "Waiting for uninstall preview to finish." : I.value.length > 0 ? `Still required by: ${I.value.join(", ")}. Uninstall those root modules first.` : K.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : B.value && !Y.value ? B.value : Y.value ? "" : "Run Preview first so Keeper can show what will be removed." : ""), g = P(() => D.value ? z.value ? "Uninstall is running." : N.value ? "Waiting for uninstall preview to finish." : I.value.length > 0 ? `Still required by: ${I.value.join(", ")}. Uninstall those root modules first.` : K.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : "" : "No module selected.");
  async function y(h) {
    G(h) && (D.value = h, H.value = "block", K.value = null, B.value = null, I.value = [], Y.value = null, T.value = [], q.value = !0, re());
  }
  async function re() {
    const h = D.value;
    if (h) {
      N.value = !0, K.value = null, B.value = null, I.value = [], Y.value = null, T.value = [];
      try {
        const _ = await o.uninstall({ id: h.id, component: h.component, dry_run: !0, migration_policy: H.value });
        Y.value = _.preview || _.payload?.preview || null, Y.value || (B.value = "Uninstall preview returned no preview data.");
      } catch (_) {
        if (ze("modules:uninstall-preview", _), _ instanceof Tt && (K.value = _.code, I.value = hn(_.details), _.code === "NOT_FOUND")) {
          q.value = !1, D.value = null, M("ok", "Module already removed; refreshed installed modules"), await S(), await E();
          return;
        }
        B.value = $e(_, "uninstall preview failed");
      } finally {
        N.value = !1;
      }
    }
  }
  async function m() {
    const h = D.value;
    if (!(!h || g.value)) {
      z.value = !0, K.value = null, B.value = null, T.value = [];
      try {
        const _ = await o.uninstall({ id: h.id, component: h.component, migration_policy: H.value });
        T.value = mn(_), M("ok", `Module uninstalled: ${h.id}`), V(), await S(), await E();
      } catch (_) {
        if (ze("modules:uninstall", _), _ instanceof Tt && (K.value = _.code, I.value = hn(_.details), T.value = mn(_.details), _.code === "NOT_FOUND")) {
          q.value = !1, D.value = null, M("ok", "Module already removed; refreshed installed modules"), await S(), await E();
          return;
        }
        B.value = $e(_, "uninstall failed");
      } finally {
        z.value = !1;
      }
    }
  }
  return Le(H, () => {
    q.value && D.value && !z.value && re();
  }), {
    uninstallDialogOpen: q,
    uninstallDep: D,
    uninstallPolicy: H,
    uninstallRunning: z,
    uninstallPreviewLoading: N,
    uninstallPreview: Y,
    uninstallExecution: T,
    uninstallCode: K,
    uninstallError: B,
    uninstallRequiredBy: I,
    uninstallPhase: F,
    uninstallElapsedSec: i,
    selectedUninstallBlockedReason: Q,
    uninstallBlockedReason: d,
    uninstallActionBlockedReason: g,
    openUninstallDialog: y,
    previewUninstall: re,
    runUninstall: m
  };
}
function ms({ hub: o, installed: $, installedError: r, installedCanUpdate: L, installedIsRoot: s, showToast: G, notifyModulesChanged: S, refreshAll: E, refreshSelectedDetail: M }) {
  const V = A({}), q = A(!1), D = A(!1), H = P(() => $.value.filter((m) => {
    const h = B(m);
    return L(m) && s(m) && h && ["available", "failed", "blocked", "skipped"].includes(h.status) && T(h.latestVersion, it(m));
  }));
  function z(m) {
    return (String(m || "").trim().replace(/^[^\d]*/, "").match(/\d+(?:\.\d+)*/)?.[0] || "").split(".").filter(Boolean).map(Number);
  }
  function N(m, h) {
    const _ = z(m), R = z(h), Z = Math.max(_.length, R.length);
    for (let ee = 0; ee < Z; ee++) {
      const ne = _[ee] || 0, de = R[ee] || 0;
      if (ne !== de) return ne > de ? 1 : -1;
    }
    return String(m || "").localeCompare(String(h || ""));
  }
  function Y(m = []) {
    const h = m.find((_) => _.is_latest) || m[0];
    return String(h?.version || "");
  }
  function T(m, h) {
    return !!(m && h && m !== h && N(m, h) > 0);
  }
  function K(m) {
    const h = String(m || "").trim().replace(/^[>=<~^]+v?/, "");
    return h ? `>=${h}` : ">=v0.0.0";
  }
  function B(m) {
    return m?.component && V.value[m.component] || null;
  }
  function I(m, h) {
    const _ = V.value[m];
    V.value = {
      ...V.value,
      [m]: {
        component: m,
        currentVersion: h.currentVersion ?? _?.currentVersion ?? "",
        latestVersion: h.latestVersion ?? _?.latestVersion ?? "",
        status: h.status ?? _?.status ?? "current",
        message: h.message
      }
    };
  }
  function F(m) {
    const h = B(m);
    return h ? h.status === "available" ? `${h.currentVersion || "?"} → ${h.latestVersion || "?"}` : h.status === "queued" ? "queued" : h.status === "skipped" ? "skipped" : h.status === "planning" ? "planning" : h.status === "updating" ? "updating" : h.status === "updated" ? "updated" : h.status === "blocked" ? "blocked" : h.status === "failed" ? "failed" : "" : "";
  }
  function i(m) {
    const h = B(m)?.status;
    return h === "planning" || h === "updating" ? "tabler:loader-2" : h === "updated" ? "tabler:check" : h === "queued" ? "tabler:clock" : h === "skipped" ? "tabler:player-skip-forward" : h === "blocked" ? "tabler:lock" : h === "failed" ? "tabler:alert-triangle" : "tabler:arrow-up-circle";
  }
  function Q(m) {
    const h = B(m)?.status;
    return h === "planning" || h === "updating";
  }
  async function d() {
    if (!o || q.value) return;
    q.value = !0, r.value = null;
    const m = {};
    let h = 0, _ = 0;
    try {
      for (const R of $.value) {
        if (!L(R) || !s(R)) continue;
        const Z = it(R);
        try {
          const ee = await o.listVersions(R.component), ne = Y(ee.items), de = T(ne, Z) ? "available" : "current";
          de === "available" && h++, m[R.component] = { component: R.component, currentVersion: Z, latestVersion: ne, status: de }, V.value = { ...m };
        } catch (ee) {
          _++, m[R.component] = {
            component: R.component,
            currentVersion: Z,
            latestVersion: "",
            status: "failed",
            message: $e(ee, "version scan failed")
          }, V.value = { ...m };
        }
      }
      G("ok", `Found ${h} update${h === 1 ? "" : "s"}${_ ? `, ${_} failed` : ""}`);
    } finally {
      q.value = !1;
    }
  }
  async function g(m, h) {
    I(m, { status: "planning", message: void 0 });
    try {
      const _ = await o.planInstall({ component: m, version: h, run_migrations: !0 }), R = _.missing_requirements || [];
      if (R.length) {
        const Z = `Missing required settings: ${R.join(", ")}`;
        return I(m, { status: "blocked", message: Z }), null;
      }
      return _;
    } catch (_) {
      const R = $e(_, "update plan failed");
      return I(m, { status: "failed", message: R }), null;
    }
  }
  async function y(m) {
    if (!o || !m.component) return !1;
    let h = B(m);
    if (!h) {
      const _ = it(m);
      try {
        const R = await o.listVersions(m.component), Z = Y(R.items);
        h = {
          component: m.component,
          currentVersion: _,
          latestVersion: Z,
          status: T(Z, _) ? "available" : "current"
        }, I(m.component, h);
      } catch (R) {
        return I(m.component, { status: "failed", message: $e(R, "version scan failed") }), !1;
      }
    }
    if (!h.latestVersion || !T(h.latestVersion, it(m))) return !0;
    try {
      const _ = K(h.latestVersion), R = await g(m.component, _);
      if (!R) return !1;
      const Z = o.install({
        ...R.install_payload,
        component: m.component,
        version: _,
        run_migrations: !0,
        migration_policy: "up"
      });
      return I(m.component, { status: "updating" }), await Z, I(m.component, {
        status: "updated",
        currentVersion: h.latestVersion,
        latestVersion: h.latestVersion,
        message: void 0
      }), S(), !0;
    } catch (_) {
      return I(m.component, { status: "failed", message: $e(_, "update failed") }), !1;
    }
  }
  async function re() {
    if (D.value || H.value.length === 0) return;
    D.value = !0;
    const m = [...H.value];
    try {
      for (const R of m) I(R.component, { status: "planning" });
      const h = await o.planBatchInstall({
        dependencies: m.map((R) => ({
          id: R.dependencyId,
          component: R.component,
          version: K(B(R).latestVersion)
        })),
        run_migrations: !0,
        migration_policy: "up"
      }), _ = /* @__PURE__ */ new Map();
      for (const R of h.plans) {
        const Z = R.missing_requirements || [], ee = (R.requirements || []).filter((ne) => ne.invalid).map((ne) => `${ne.id || ne.parameter_name}: ${ne.invalid_reason || "invalid value"}`);
        if (R.applicable === !1 || Z.length || ee.length) {
          const ne = [
            Z.length ? `Missing required settings: ${Z.join(", ")}` : "",
            ee.length ? `Invalid settings: ${ee.join(", ")}` : ""
          ].filter(Boolean).join(". ") || "Update plan cannot be applied";
          _.set(R.dependency?.component || "Unknown module", ne);
        }
      }
      if (!h.applicable || _.size) {
        for (const R of m) I(R.component, {
          status: _.has(R.component) ? "blocked" : "skipped",
          message: _.get(R.component) || "Batch not applied because its plan is blocked"
        });
        G("error", _.size ? [..._].map(([R, Z]) => `${R}: ${Z}`).join("; ") : "Update plan cannot be applied. No modules were changed.");
        return;
      }
      if (!h.install_payload?.dependencies?.length) throw new Error("Update plan returned no install payload");
      for (const R of m) I(R.component, { status: "updating" });
      await o.install(h.install_payload);
      for (const R of m) I(R.component, { status: "updated" });
      S(), G("ok", `Updated ${m.length} module${m.length === 1 ? "" : "s"}`);
    } catch (h) {
      const _ = $e(h, "update failed");
      for (const R of m) I(R.component, { status: "failed", message: _ });
      G("error", _);
    } finally {
      try {
        await E(), await M();
      } catch (h) {
        G("error", `Module status could not be refreshed: ${$e(h, "refresh failed")}`);
      } finally {
        D.value = !1;
      }
    }
  }
  return {
    updateScan: V,
    updateScanLoading: q,
    updateAllRunning: D,
    availableUpdates: H,
    updateInfoForDep: B,
    updateStatusLabel: F,
    updateStatusIcon: i,
    updateStatusBusy: Q,
    scanInstalledUpdates: d,
    updateInstalledDependency: y,
    updateAllAvailable: re
  };
}
function vs({ hub: o, loadCatalog: $ }) {
  const r = A(!1), L = A(!1), s = A(!1), G = A(!1), S = A(null), E = A(""), M = A(!1), V = A(!1), q = A(null), D = P(() => S.value?.orgs || []), H = P(() => S.value?.username || S.value?.user_id || ""), z = P(() => !!S.value?.authenticated), N = P(() => !!(S.value?.authenticated && S.value?.expired)), Y = P(() => s.value ? "tabler:key" : N.value ? "tabler:alert-triangle" : "tabler:key-off"), T = P(() => s.value ? "Hub token set" : N.value ? "Hub token expired" : "Set Hub token"), K = P(() => {
    const d = S.value?.expires_at;
    if (!d) return "";
    const g = new Date(d);
    return isNaN(g.getTime()) ? "" : g.toLocaleDateString();
  });
  function B(d) {
    S.value = d?.authenticated ? d : null;
    const g = yn(d);
    s.value = g, G.value = g;
  }
  async function I() {
    try {
      const { data: d } = await bn.get("/api/v1/user/me");
      r.value = !!(d?.success && d?.security?.is_admin);
    } catch (d) {
      ze("modules:auth", d), r.value = !1;
    } finally {
      L.value = !0;
    }
  }
  async function F() {
    try {
      const d = await o.authStatus();
      B(d);
    } catch (d) {
      ze("modules:hub-auth", d);
    }
  }
  async function i() {
    const d = E.value.trim();
    if (!d) {
      q.value = "Paste a Hub token first.";
      return;
    }
    q.value = null, V.value = !0;
    try {
      const g = await o.authenticate(d);
      B(g), yn(g) ? (E.value = "", M.value = !1, await $()) : q.value = "That token is invalid or expired.";
    } catch (g) {
      q.value = $e(g, "failed to save Hub token");
    } finally {
      V.value = !1;
    }
  }
  async function Q() {
    q.value = null;
    try {
      await o.logout();
    } catch (d) {
      q.value = $e(d, "failed to clear Hub token");
      return;
    }
    B(null), await $();
  }
  return {
    isAdmin: r,
    authLoaded: L,
    hubConnected: s,
    hubUsable: G,
    hubStatus: S,
    hubToken: E,
    showTokenPanel: M,
    hubConnecting: V,
    hubError: q,
    hubOrgs: D,
    hubIdentity: H,
    hubTokenStored: z,
    hubTokenExpired: N,
    hubTokenIcon: Y,
    hubTokenButtonLabel: T,
    hubExpiry: K,
    applyHubAuthStatus: B,
    loadAuth: I,
    loadHubAuth: F,
    saveHubToken: i,
    clearHubToken: Q
  };
}
const ps = ["kickside", "kickside-plugin"], Sn = "kickside", ks = "https://portal.wippy.ai/account/tokens", fs = [
  { label: "Block if any applied", value: "block" },
  { label: "Leave applied migrations", value: "leave" },
  { label: "Revert (down) - may lose data", value: "down" }
];
function gs() {
  const o = Un(bn), $ = A(!0), r = A(null), L = vs({ hub: o, loadCatalog: Jt }), {
    isAdmin: s,
    authLoaded: G,
    hubConnected: S,
    hubUsable: E,
    hubStatus: M,
    hubToken: V,
    showTokenPanel: q,
    hubConnecting: D,
    hubError: H,
    hubOrgs: z,
    hubIdentity: N,
    hubTokenStored: Y,
    hubTokenExpired: T,
    hubTokenIcon: K,
    hubTokenButtonLabel: B,
    hubExpiry: I,
    loadAuth: F,
    loadHubAuth: i,
    saveHubToken: Q,
    clearHubToken: d
  } = L, g = A([]), y = A(""), re = A("all"), m = A(!1), h = A(null), _ = A(!0), R = A([]), Z = A(!1), ee = A(null), ne = A(""), de = A("downloads"), Ke = rs({
    hub: o,
    installed: g,
    catalog: R,
    installedDepFor: _e,
    installedCanUpdate: at,
    installedUpdateDisabledReason: Dt,
    installedCanUninstall: mt,
    installedIsPrivate: bt
  }), {
    selected: ke,
    selectedModule: Ve,
    detailReadme: Me,
    detailEntries: ot,
    detailLoading: De,
    detailTab: rt,
    detailVersions: yt,
    envVars: _t,
    requirements: ge,
    detailGroups: Et,
    versionMeta: Ge,
    selectedInstalledDep: Ne,
    selectedCanUpdate: ut,
    selectedUpdateDisabledReason: We,
    selectedCanUninstall: Pe,
    selectedIsPrivate: Ae,
    openDetail: Ie,
    closeDetail: be,
    refreshSelectedDetail: qe
  } = Ke, Be = cs({
    hub: o,
    selected: ke,
    selectedInstalledDep: Ne,
    installedIsRoot: ye,
    installedUninstallDisabledReason: Vt,
    installedCanUninstall: mt,
    refreshAll: Mt,
    refreshSelectedDetail: qe,
    showToast: f,
    notifyModulesChanged: pn
  }), {
    uninstallDialogOpen: wt,
    uninstallDep: Ye,
    uninstallPolicy: Oe,
    uninstallRunning: Ue,
    uninstallPreviewLoading: $t,
    uninstallPreview: p,
    uninstallExecution: b,
    uninstallCode: x,
    uninstallError: U,
    uninstallRequiredBy: j,
    uninstallPhase: W,
    uninstallElapsedSec: le,
    selectedUninstallBlockedReason: pe,
    uninstallBlockedReason: Je,
    uninstallActionBlockedReason: St,
    openUninstallDialog: oe,
    previewUninstall: Re,
    runUninstall: Ze
  } = Be, dt = ms({
    hub: o,
    installed: g,
    installedError: h,
    installedCanUpdate: at,
    installedIsRoot: ye,
    showToast: f,
    notifyModulesChanged: pn,
    refreshAll: Mt,
    refreshSelectedDetail: qe
  }), {
    updateScanLoading: ct,
    updateAllRunning: me,
    availableUpdates: Se,
    updateInfoForDep: Qe,
    updateStatusLabel: He,
    updateStatusIcon: Ot,
    updateStatusBusy: Ct,
    scanInstalledUpdates: kt,
    updateInstalledDependency: Ce,
    updateAllAvailable: Te
  } = dt, Xe = P(() => {
    const C = /* @__PURE__ */ new Set();
    for (const te of g.value)
      if (te.installed !== !1)
        for (const At of _n(te)) C.add(At);
    return C;
  }), et = P(() => Bn(R.value, ne.value)), fe = P(() => et.value.filter((C) => !vt(C))), tt = P(() => ne.value.trim() || fe.value.length < 7 ? [] : [...fe.value].sort((C, te) => (te.total_downloads || 0) - (C.total_downloads || 0)).slice(0, 6)), Ht = P(() => new Set(tt.value.map(nn))), ft = P(() => On(fe.value.filter((C) => !Ht.value.has(nn(C))), de.value)), nt = P(() => g.value.filter((C) => C.installed !== !1).length), st = P(() => {
    const C = y.value.trim().toLowerCase(), te = re.value, At = g.value.filter((xe) => xe.installed === !1 || te === "root" && !ye(xe) || te === "transitive" && ye(xe) || te === "local" && xe.source !== "local" ? !1 : C ? [
      xe.component,
      xe.id,
      xe.name,
      xe.namespace,
      xe.version,
      xe.source,
      It(xe),
      Rt(xe),
      $n(xe),
      it(xe)
    ].filter(Boolean).join(" ").toLowerCase().includes(C) : !0);
    return Hn(At, he);
  }), Fe = P(() => g.value.filter((C) => C.installed !== !1 && !!he(C.component)).length), ve = P(() => st.value.filter((C) => !!he(C.component)).length), je = P(() => G.value && !s.value), ce = A(null), Lt = P(() => ce.value !== null);
  function he(C) {
    return R.value.find((te) => tn(te, C));
  }
  function gt(C) {
    return Wt({ full_name: C.component });
  }
  function xt(C) {
    const te = he(C.component);
    return te ? qt(te) : "tabler:package";
  }
  function bt(C) {
    return Gt(he(C.component)) || Gt(C);
  }
  function ye(C) {
    return Fn(C || {});
  }
  function It(C) {
    return jn(C);
  }
  function Rt(C) {
    return zn(C);
  }
  function Vt(C) {
    if (ye(C)) return "";
    const te = Rt(C);
    return te ? `Installed as a dependency; ${te}` : "Installed as a dependency of another module";
  }
  function at(C) {
    return !!(C?.component && C.source !== "local");
  }
  function Dt(C) {
    return C.source === "local" ? "Local replacement; update from source" : "No Hub dependency update action available";
  }
  function mt(C) {
    return !!(C && ye(C));
  }
  function vt(C) {
    return _n(C).some((te) => Xe.value.has(te));
  }
  function _e(C) {
    return g.value.find((te) => tn(te, C));
  }
  function f(C, te) {
    const At = En?.toast;
    typeof At == "function" ? At({ severity: C === "ok" ? "success" : "error", summary: te }) : (r.value = { kind: C, message: te }, setTimeout(() => {
      r.value?.message === te && (r.value = null);
    }, 5e3));
  }
  function u() {
    ke.value && O({
      full_name: ke.value.component,
      latest_version: ke.value.version,
      description: ke.value.description
    });
  }
  function Ee() {
    const C = ke.value && _e(ke.value.component);
    C && at(C) && ue(C);
  }
  function ln() {
    const C = ke.value && _e(ke.value.component);
    C && mt(C) && oe(C);
  }
  async function on() {
    m.value = !0, h.value = null;
    try {
      g.value = os(await o.listDependencies());
    } catch (C) {
      g.value = [], ze("modules:listDependencies", C), h.value = $e(C, "dependency graph unavailable");
    }
    m.value = !1;
  }
  async function Jt() {
    Z.value = !0, ee.value = null;
    try {
      R.value = (await o.fetchAllByKeyword(ps)).filter(Kn);
    } catch (C) {
      ze("modules:catalog", C), C instanceof Tt && (C.code === "UNAUTHORIZED" || C.code === "FORBIDDEN") ? E.value = !1 : ee.value = $e(C, `failed to load ${Sn} catalog`);
    } finally {
      Z.value = !1;
    }
  }
  async function Mt() {
    await Promise.all([on(), Jt()]);
  }
  function O(C) {
    const te = en(C);
    ce.value = {
      mode: "install",
      component: te,
      version: C.latest_version ? String(C.latest_version) : "",
      currentId: null,
      catalogItem: he(te) || C,
      installedDep: null
    };
  }
  function ue(C) {
    at(C) && (ce.value = {
      mode: "update",
      component: C.component,
      // Let the dialog load and select the newest published release. Seeding
      // this with the resolved version re-submits the current package while
      // presenting the operation as an update.
      version: "",
      currentId: C.dependencyId || null,
      catalogItem: he(C.component) || null,
      installedDep: C
    });
  }
  function ie() {
    ce.value = null;
  }
  async function we() {
    await Mt(), await qe(), ie();
  }
  return gn(() => {
    Tn("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
    });
  }), Xn(async () => {
    try {
      if (await F(), !s.value) return;
      await i(), await Mt();
    } finally {
      $.value = !1;
    }
  }), {
    LABEL: Sn,
    HUB_PORTAL: ks,
    UNINSTALL_MIGRATION_OPTIONS: fs,
    initialLoading: $,
    accessDenied: je,
    statusBanner: r,
    hubConnected: S,
    hubStatus: M,
    hubToken: V,
    showTokenPanel: q,
    hubConnecting: D,
    hubError: H,
    hubOrgs: z,
    hubIdentity: N,
    hubTokenStored: Y,
    hubTokenExpired: T,
    hubTokenIcon: K,
    hubTokenButtonLabel: B,
    hubExpiry: I,
    selected: ke,
    selectedModule: Ve,
    detailReadme: Me,
    detailEntries: ot,
    detailLoading: De,
    detailTab: rt,
    detailVersions: yt,
    envVars: _t,
    requirements: ge,
    detailGroups: Et,
    versionMeta: Ge,
    selectedCanUpdate: ut,
    selectedUpdateDisabledReason: We,
    selectedCanUninstall: Pe,
    selectedIsPrivate: Ae,
    selectedUninstallBlockedReason: pe,
    entryName: as,
    entryDesc: ls,
    entryIcon: is,
    installed: g,
    installedFilter: y,
    installedKindFilter: re,
    installedTotal: nt,
    updateScanLoading: ct,
    updateAllRunning: me,
    availableUpdates: Se,
    installedLoading: m,
    installedError: h,
    installedOpen: _,
    catalog: R,
    catalogLoading: Z,
    catalogError: ee,
    catalogInstalledTotal: Fe,
    visibleCatalogInstalled: ve,
    browseFilter: ne,
    sortBy: de,
    availableItems: fe,
    featured: tt,
    sortedItems: ft,
    visibleInstalled: st,
    catalogItemFor: he,
    installedAccent: gt,
    installedIcon: xt,
    installedIsPrivate: bt,
    installedIsRoot: ye,
    installedRole: It,
    installedUsedBy: Rt,
    installedCanUpdate: at,
    installedUpdateDisabledReason: Dt,
    installedCanUninstall: mt,
    installedMigrationSummary: $n,
    updateInfoForDep: Qe,
    updateStatusLabel: He,
    updateStatusIcon: Ot,
    updateStatusBusy: Ct,
    scanInstalledUpdates: kt,
    updateInstalledDependency: Ce,
    updateAllAvailable: Te,
    installDialogOpen: Lt,
    installTarget: ce,
    closeInstallDialog: ie,
    onInstallChanged: we,
    uninstallDialogOpen: wt,
    uninstallDep: Ye,
    uninstallPolicy: Oe,
    uninstallRunning: Ue,
    uninstallPreviewLoading: $t,
    uninstallPreview: p,
    uninstallExecution: b,
    uninstallCode: x,
    uninstallError: U,
    uninstallRequiredBy: j,
    uninstallBlockedReason: Je,
    uninstallActionBlockedReason: St,
    uninstallPhase: W,
    uninstallElapsedSec: le,
    previewUninstall: Re,
    executionStepLabel: An,
    openDetail: Ie,
    closeDetail: be,
    detailInstall: u,
    detailUpdate: Ee,
    detailUninstall: ln,
    refreshAll: Mt,
    saveHubToken: Q,
    clearHubToken: d,
    openUpdateDialog: ue,
    openUninstallDialog: oe,
    installedUninstallDisabledReason: Vt,
    runUninstall: Ze
  };
}
const bs = ["aria-label", "aria-busy"], hs = /* @__PURE__ */ Bt({
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
      await Kt();
      const E = s.value;
      E && (r.visible && !E.open ? E.showModal() : !r.visible && E.open && E.close());
    }
    function S(E) {
      E.preventDefault(), r.busy || L("close");
    }
    return Le(() => r.visible, G), gn(G), Rn(() => {
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
        class: X(o.headerClass)
      }, [
        Zt(E.$slots, "header"),
        v(e(es), {
          type: "button",
          text: "",
          severity: "secondary",
          "aria-label": "Close dialog",
          disabled: o.busy,
          onClick: M[0] || (M[0] = (V) => L("close"))
        }, {
          default: pt(() => [...M[2] || (M[2] = [
            w("×", -1)
          ])]),
          _: 1
        }, 8, ["disabled"])
      ], 2),
      t("div", {
        class: X(o.contentClass)
      }, [
        Zt(E.$slots, "default")
      ], 2),
      E.$slots.footer ? (n(), a("footer", {
        key: 0,
        class: X(o.footerClass)
      }, [
        Zt(E.$slots, "footer")
      ], 2)) : c("", !0)
    ], 40, bs));
  }
}), ys = ["aria-expanded", "aria-controls", "aria-label", "disabled"], _s = { class: "p-select-label" }, ws = {
  key: 0,
  class: "kx-ps-val"
}, $s = { class: "kx-ps-val-label" }, Ss = {
  key: 1,
  class: "kx-ps-ph"
}, Cs = { class: "p-select-dropdown" }, xs = { class: "p-select-overlay kx-ps-panel" }, Is = { class: "p-select-header" }, Rs = ["aria-label", "aria-controls", "aria-activedescendant"], Ms = ["id", "aria-label"], As = {
  class: "p-select-option-group",
  role: "presentation"
}, Us = ["id", "aria-selected", "onClick", "onMousemove"], Ts = { class: "kx-ps-opt-body" }, Es = { class: "kx-ps-opt-title" }, Ls = {
  key: 0,
  class: "kx-ps-opt-sub"
}, Vs = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, Ds = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, Ns = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, Ps = ["disabled"], Cn = /* @__PURE__ */ Bt({
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
    const r = o, L = $, s = A(null), G = A(null), S = A(!1), E = A(""), M = A(0), V = Dn(), q = P(() => {
      const T = E.value.trim().toLowerCase(), K = /* @__PURE__ */ new Map();
      for (const I of r.items) {
        if (!r.remote && T && ![I.title, I.subtitle, I.id, I.group].some((Q) => Q?.toLowerCase().includes(T))) continue;
        const F = I.group || "Other", i = K.get(F);
        i ? i.push(I) : K.set(F, [I]);
      }
      let B = 0;
      return [...K.entries()].sort((I, F) => I[0].localeCompare(F[0])).map(([I, F]) => ({ group: I, items: F.map((i) => ({ item: i, index: B++ })) }));
    }), D = P(() => q.value.flatMap((T) => T.items)), H = P(() => r.items.find((T) => T.id === r.modelValue)), z = P(() => D.value[M.value] ? `${V}-${M.value}` : void 0);
    Le(E, () => {
      M.value = 0;
    }), Le([S, E], ([T, K]) => {
      T && r.remote && L("search", K);
    }), Le(() => r.disabled, (T) => {
      T && (S.value = !1);
    }), Le(S, async (T) => {
      if (!T) {
        s.value?.focus();
        return;
      }
      E.value = "", M.value = Math.max(0, D.value.findIndex(({ item: K }) => K.id === r.modelValue)), await Kt(), G.value?.focus();
    });
    function N(T) {
      r.disabled || r.loading || (L("update:modelValue", T.id), S.value = !1);
    }
    async function Y(T) {
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
        const I = D.value[M.value];
        I && N(I.item);
        return;
      }
      const K = D.value.length - 1;
      M.value = T.key === "Home" ? 0 : T.key === "End" ? K : Math.max(0, Math.min(K, M.value + (T.key === "ArrowDown" ? 1 : -1))), await Kt(), s.value?.getRootNode()?.querySelector(`[id="${z.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (T, K) => (n(), a(J, null, [
      t("button", {
        ref_key: "anchor",
        ref: s,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": S.value,
        "aria-controls": e(V),
        "aria-label": o.ariaLabel,
        disabled: o.disabled,
        onClick: K[0] || (K[0] = (B) => S.value = !S.value),
        onKeydown: Y
      }, [
        t("span", _s, [
          H.value ? (n(), a("span", ws, [
            v(e(k), {
              icon: H.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            t("span", $s, l(H.value.title), 1)
          ])) : (n(), a("span", Ss, l(o.placeholder || "Select…"), 1))
        ]),
        t("span", Cs, [
          v(e(k), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, ys),
      v(Ln, {
        open: S.value,
        "onUpdate:open": K[3] || (K[3] = (B) => S.value = B),
        anchor: s.value
      }, {
        default: pt(() => [
          t("div", xs, [
            t("div", Is, [
              lt(t("input", {
                ref_key: "search",
                ref: G,
                "onUpdate:modelValue": K[1] || (K[1] = (B) => E.value = B),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${o.ariaLabel || o.placeholder || "options"}`,
                "aria-controls": e(V),
                "aria-activedescendant": z.value,
                onKeydown: Y
              }, null, 40, Rs), [
                [Qt, E.value]
              ])
            ]),
            t("ul", {
              id: e(V),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": o.ariaLabel || o.placeholder || "Options"
            }, [
              (n(!0), a(J, null, ae(q.value, (B) => (n(), a(J, {
                key: B.group
              }, [
                t("li", As, l(B.group), 1),
                (n(!0), a(J, null, ae(B.items, ({ item: I, index: F }) => (n(), a("li", {
                  id: `${e(V)}-${F}`,
                  key: I.id,
                  class: X(["p-select-option kx-ps-option", { "p-select-option-selected": I.id === o.modelValue, "p-focus": F === M.value }]),
                  role: "option",
                  "aria-selected": I.id === o.modelValue,
                  onClick: (i) => N(I),
                  onMousemove: (i) => M.value = F
                }, [
                  v(e(k), {
                    icon: I.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  t("span", Ts, [
                    t("span", Es, l(I.title), 1),
                    I.subtitle ? (n(), a("span", Ls, l(I.subtitle), 1)) : c("", !0)
                  ])
                ], 42, Us))), 128))
              ], 64))), 128)),
              o.loading ? (n(), a("li", Vs, "Loading…")) : !D.value.length && !o.error ? (n(), a("li", Ds, "No matches")) : c("", !0)
            ], 8, Ms),
            o.error ? (n(), a("div", Ns, l(o.error), 1)) : c("", !0),
            o.more ? (n(), a("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: o.loading || o.disabled,
              onClick: K[2] || (K[2] = (B) => L("more"))
            }, "Load more", 8, Ps)) : c("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
function kn() {
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
function In(o) {
  return Os.includes(o) ? o : "clean";
}
function Hs(o) {
  return o === "critical" ? "critical" : o === "warning" ? "warning" : "info";
}
function Fs(o) {
  const $ = o && typeof o == "object" ? o : {}, r = [], L = [];
  for (const E of $.modules || []) {
    const M = String(E.module || ""), V = E.version ? String(E.version) : void 0, q = (E.findings || []).map((D, H) => ({
      id: `${M}#${H}`,
      module: M,
      version: V,
      severity: Hs(D.severity),
      title: String(D.title || "Issue"),
      detail: D.detail ? String(D.detail) : void 0,
      location: D.location ? String(D.location) : void 0
    }));
    for (const D of q) L.push(D);
    r.push({
      module: M,
      version: V,
      status: In(E.status),
      summary: E.summary ? String(E.summary) : void 0,
      findings: q
    });
  }
  const s = typeof $.total == "number" ? $.total : r.length, G = typeof $.scanned == "number" ? $.scanned : r.length;
  return {
    status: $.overall_status ? In($.overall_status) : qs(L),
    summary: $.overall_summary ? String($.overall_summary) : void 0,
    modules: r,
    findings: L,
    scanned: G,
    total: s
  };
}
function js({ props: o, hub: $, plan: r, activeSection: L, versionArg: s, requirementPayload: G, invalidatePlan: S, refreshPlan: E, planCurrent: M }) {
  const V = A([]), q = A({}), D = A({}), H = P(() => {
    const p = /* @__PURE__ */ new Map();
    for (const b of V.value) {
      const x = String(b.module || "");
      p.has(x) || p.set(x, []), p.get(x).push(b);
    }
    return Array.from(p.entries()).map(([b, x]) => ({ module: b, items: x, direct: !x.every((U) => Xt(U, o.component)) })).sort((b, x) => b.direct === x.direct ? b.module.localeCompare(x.module) : b.direct ? -1 : 1);
  }), z = P(() => V.value.filter((p) => !Xt(p, o.component))), N = P(() => V.value.filter((p) => !Me(p))), Y = P(() => V.value.length - z.value.length), T = P(() => {
    const p = [];
    for (const b of V.value) {
      const x = se(b);
      !x || !b.required && !b.missing || m(q.value[x]) && p.push(x);
    }
    return p;
  }), K = P(() => V.value.filter((p) => !m(q.value[se(p)])).length), B = P(() => Ge().length), I = A(!1), F = A(null);
  let i = null;
  const Q = A(0), d = A({}), g = P(() => Object.keys(d.value).length);
  let y = 0;
  const re = /* @__PURE__ */ new Set();
  function m(p) {
    return p == null || p === "" || typeof p == "string" && !p.trim() || Array.isArray(p) && p.length === 0 || typeof p == "object" && Object.keys(p).length === 0;
  }
  function h(p) {
    return p == null ? "" : typeof p == "object" ? JSON.stringify(p) : String(p);
  }
  function _(p) {
    if (p.expected_type) return p.expected_type;
    const b = [p.value, p.default, ...(p.suggestions || []).map((x) => x.value)];
    for (const x of b) {
      if (typeof x == "boolean" || typeof x == "number") return typeof x;
      if (Array.isArray(x)) return "array";
      if (x && typeof x == "object") return "object";
    }
    return "string";
  }
  function R(p, b) {
    if (typeof b != "string") return b;
    const x = b.trim(), U = _(p);
    if (U === "boolean") return /^(true|false)$/.test(x) ? x === "true" : b;
    if (U === "number" || U === "integer") return x && Number.isFinite(Number(x)) ? Number(x) : b;
    if (U === "array" || U === "object")
      try {
        return JSON.parse(x);
      } catch {
        return b;
      }
    return b;
  }
  function Z(p, b) {
    const x = _(p);
    return x === "array" ? Array.isArray(b) : x === "object" ? b !== null && typeof b == "object" && !Array.isArray(b) : x === "integer" ? typeof b == "number" && Number.isInteger(b) : typeof b === x && (x !== "number" || Number.isFinite(b));
  }
  function ee(p, b) {
    const x = se(p);
    if (!x || Me(p)) return;
    const U = R(p, b ?? "");
    JSON.stringify(q.value[x]) !== JSON.stringify(U) && (re.add(x), q.value = { ...q.value, [x]: U }, S());
  }
  function ne(p) {
    const b = q.value[se(p)];
    return !Me(p) && !m(b) && !Z(p, b);
  }
  function de(p) {
    const b = _(p);
    return b === "boolean" ? "expects true or false" : `expects ${b === "integer" || b === "object" || b === "array" ? "an" : "a"} ${b}`;
  }
  const Ke = P(() => V.value.filter(ne).map(se).filter(Boolean));
  function ke(p) {
    return h(q.value[se(p)]);
  }
  function Ve(p) {
    return (p.required || p.missing) === !0 && m(q.value[se(p)]);
  }
  function Me(p) {
    return Xt(p, o.component) && p.missing !== !0 && !re.has(se(p));
  }
  function ot(p) {
    const b = /* @__PURE__ */ new Set(), x = [];
    for (const U of p.suggestions || []) {
      const j = h(U.value).trim();
      if (!j || b.has(j)) continue;
      b.add(j);
      const W = String(U.label || j).trim(), le = [U.kind, U.source, U.description].filter(Boolean).map(String).join(" | ");
      x.push({ label: W && W !== j ? `${W} (${j})` : j, value: j, title: le });
    }
    return x;
  }
  function De() {
    const p = {}, b = (U, j) => {
      if (U = String(U || "").trim(), !U) return;
      p[U] = j;
      const W = U.includes(":") && U.split(":").pop() || "";
      W && p[W] === void 0 && (p[W] = p[U]);
    }, x = o.installedDep?.parameters;
    if (Array.isArray(x))
      for (const U of x)
        b(U.name, U.value);
    else if (x && typeof x == "object")
      for (const [U, j] of Object.entries(x)) b(U, j);
    return p;
  }
  async function rt() {
    if (D.value = {}, !!$)
      try {
        const p = await $.listDependencies({ includeEntries: !1, includeMigrations: !1 }), b = {}, x = (U, j) => {
          U = String(U || "").trim();
          const W = String(j ?? "").trim();
          if (!U || !W || b[U] !== void 0) return;
          b[U] = j;
          const le = U.includes(":") && U.split(":").pop() || "";
          le && b[le] === void 0 && (b[le] = b[U]);
        };
        for (const U of p.dependencies || []) {
          const j = U.parameters;
          if (Array.isArray(j))
            for (const W of j) x(W.name, W.value);
          else if (j && typeof j == "object")
            for (const [W, le] of Object.entries(j)) x(W, le);
        }
        D.value = b;
      } catch (p) {
        ze("install:dependency-parameters", p);
      }
  }
  function yt(p) {
    for (const b of r.value?.recommended_parameters || [])
      if (b.name === p && h(b.value).trim() !== "") return h(b.value);
    return "";
  }
  function _t(p) {
    const b = [
      se(p),
      String(p.parameter_name || ""),
      String(p.full_id || ""),
      String(p.name || ""),
      String(p.short_name || "")
    ].map((x) => x.trim()).filter(Boolean);
    for (const x of b) {
      const U = h(D.value[x]).trim();
      if (U) return U;
      const j = x.includes(":") && x.split(":").pop() || "";
      if (j) {
        const W = h(D.value[j]).trim();
        if (W) return W;
      }
    }
    return "";
  }
  function ge(p) {
    const b = se(p);
    if (!b || Me(p) || String(q.value[b] ?? "").trim()) return "";
    const U = yt(b).trim();
    if (U) return U;
    const j = _t(p);
    if (j) return j;
    const W = h(p.default).trim();
    if (W) return W;
    const le = ot(p).map((Je) => Je.value).filter(Boolean);
    if (le.length === 1) return le[0];
    const pe = Et(p);
    return pe.length && pe[0].score > 0 && (pe.length === 1 || pe[0].score > pe[1].score) ? pe[0].value : "";
  }
  function Et(p) {
    return String(p.expected_kind || "").trim() !== "security.scope" ? [] : (p.suggestions || []).map((b) => {
      const x = h(b.value).trim(), U = String(b.label || "").toLowerCase(), j = String(b.description || "").toLowerCase();
      let W = 0;
      return x || (W -= 1e3), (U.includes("system") || j.includes("system") || j.includes("internal")) && (W -= 50), (U.includes("admin") || j.includes("full access") || j.includes("assign sparingly")) && (W -= 50), (j.includes("signed-in") || j.includes("authenticated")) && (W += 30), (U === "user" || U === "member") && (W += 20), { value: x, score: W };
    }).filter((b) => b.value).sort((b, x) => x.score - b.score || b.value.localeCompare(x.value));
  }
  function Ge() {
    const p = [];
    for (const b of N.value) {
      if (!Ve(b)) continue;
      const x = se(b), U = ge(b);
      x && U && p.push({ name: x, value: U });
    }
    return p;
  }
  function Ne(p) {
    return ge(p) !== "";
  }
  function ut(p) {
    const b = se(p), x = ge(p);
    if (!b || !x) {
      L.value = "requirements", Q.value++;
      return;
    }
    ee(p, x);
  }
  function We() {
    const p = Ge();
    if (!p.length) {
      L.value = "requirements", Q.value++;
      return;
    }
    for (const b of p) {
      const x = V.value.find((U) => se(U) === b.name);
      x && ee(x, String(b.value));
    }
  }
  function Pe() {
    return N.value.filter((p) => m(q.value[se(p)]) && (p.missing || p.value_source === "conflict" || p.expected_type || ot(p).length)).map((p) => ({ name: p.full_id || se(p) }));
  }
  const Ae = P(() => Pe().length);
  function Ie(p, b) {
    return m(b) || !Z(p, b) ? !1 : !p.expected_kind || !!p.suggestions?.some((x) => x.value === b);
  }
  function be(p) {
    const b = { ...d.value }, x = { ...q.value };
    for (const U of p) {
      const j = b[U];
      j?.value !== void 0 && (x[U] = j.value, re.add(U), delete b[U]);
    }
    return q.value = x, S(), b;
  }
  async function qe(p) {
    if (!M.value || I.value) return;
    const b = be(p), x = y;
    if (await E(), x !== y || !M.value) return;
    const U = {};
    for (const j of N.value) {
      const W = se(j), le = b[W];
      le && m(q.value[W]) && j.expected_type === le.expected_type && j.expected_kind === le.expected_kind && Ie(j, le.value) && (U[W] = le);
    }
    d.value = U;
  }
  function Be(p) {
    const b = { ...d.value };
    for (const x of p) delete b[x];
    d.value = b;
  }
  function wt(p) {
    !M.value || I.value || be(p);
  }
  async function Ye(p) {
    const b = Pe();
    if (!M.value || !b.length || I.value) return;
    Ue();
    const x = y, U = new AbortController();
    i = U, I.value = !0, F.value = null, d.value = {}, await new Promise((j) => {
      let W = !1, le = !1;
      const pe = (oe) => {
        if (W) return;
        if (W = !0, clearTimeout(Je), U.signal.aborted || x !== y || i !== U) {
          j();
          return;
        }
        i = null;
        const Re = oe && typeof oe == "object" ? oe : {};
        if (Re.success === !0) {
          const Ze = new Set(b.map((me) => me.name)), dt = {}, ct = new Map((Re.requirements || []).map((me) => [me.full_id, me]));
          V.value = V.value.map((me) => ({
            ...me,
            resolution_error: ct.get(me.full_id)?.resolution_error
          }));
          for (const me of Re.parameters || []) {
            const Se = V.value.find((Qe) => (Qe.full_id || se(Qe)) === me.name || se(Qe) === me.name);
            if (!Se || !Ze.has(Se.full_id || se(Se)) || !Ie(Se, me.value) || typeof me.reason != "string" || !me.reason.trim()) {
              F.value = { tone: "warning", code: "INVALID_CHOICE", message: "AI returns an invalid planned value or omits its reason. Choose a value manually." };
              continue;
            }
            dt[se(Se)] = { ...Se, value: me.value, choice_reason: me.reason };
          }
          d.value = dt, Object.keys(dt).length ? F.value = { tone: "success", message: "Review AI suggestions before applying." } : F.value || (F.value = { tone: "warning", message: "No valid AI suggestion is available. Choose a value manually." });
        } else
          F.value = {
            tone: "warning",
            code: Re.code,
            kind: Re.kind,
            details: Re.details,
            message: Re.error || "AI could not resolve these settings. Choose a value manually."
          };
        I.value = !1, j();
      }, Je = setTimeout(() => {
        pe({ success: !1, code: "TIMEOUT", error: "AI requirement resolution timed out." }), U.abort();
      }, 2e4);
      U.signal.addEventListener("abort", () => {
        W || (W = !0, clearTimeout(Je), j());
      }, { once: !0 });
      const St = {
        component: o.component,
        ...s() ? { version: s() } : {},
        ...o.mode === "update" && o.currentId ? { current_id: o.currentId } : {},
        ...G(),
        requirements: b,
        signal: U.signal,
        accept: () => {
          W || (le = !0);
        },
        respond: pe
      };
      p?.dispatchEvent(new CustomEvent("instrumentRequirementResolution", { detail: St, bubbles: !0, composed: !0 })), le || pe({ success: !1, code: "MODEL_UNAVAILABLE", error: "Configure an AI model to suggest settings, or choose values manually." });
    });
  }
  function Oe(p, b) {
    r.value = p, V.value = (p.requirements || []).filter((j) => j.name !== "required_setup" && j.short_name !== "required_setup");
    const x = De(), U = {};
    for (const j of V.value) {
      const W = se(j);
      if (!W) continue;
      const le = String(j.name || j.short_name || W.split(":").pop() || "");
      U[W] = (re.has(W) ? b[W] : m(b[W]) ? void 0 : b[W]) ?? x[W] ?? x[le] ?? D.value[W] ?? D.value[le] ?? j.value ?? j.default ?? "";
    }
    q.value = U;
    for (const j of re)
      j in U || re.delete(j);
  }
  function Ue() {
    i?.abort(), i = null, I.value = !1, y++, d.value = {}, F.value = null;
  }
  function $t() {
    Ue(), V.value = [], q.value = {}, re.clear(), D.value = {}, I.value = !1, F.value = null;
  }
  return {
    pendingSuggestions: d,
    pendingCount: g,
    acceptSuggestions: qe,
    rejectSuggestions: Be,
    editSuggestions: wt,
    displayValue: h,
    requirements: V,
    parameterValues: q,
    installedParameterHints: D,
    requirementGroups: H,
    rootRequirements: z,
    editableRequirements: N,
    transitiveRequirementCount: Y,
    missingRequirements: T,
    boundRequirementCount: K,
    autoFitCount: B,
    aiResolving: I,
    aiResolutionNotice: F,
    typeInvalidRequirements: Ke,
    highlightTick: Q,
    aiResolvableCount: Ae,
    setParameter: ee,
    requirementTypeInvalid: ne,
    requirementTypeHint: de,
    requirementValue: ke,
    requirementMissing: Ve,
    requirementReadOnly: Me,
    requirementOptions: ot,
    loadInstalledParameterHints: rt,
    applyPlan: Oe,
    recommendedValueFor: yt,
    hintedValueFor: _t,
    autoFitValue: ge,
    canAutoFitRequirement: Ne,
    autoFitRequirement: ut,
    autoFitRequirements: We,
    resolveRequirementsWithAI: Ye,
    abortAI: Ue,
    resetRequirements: $t
  };
}
function dn(o) {
  return o.map(($) => [$.module, $.version || ""].join("\0")).sort().join("");
}
function zs({ props: o, hub: $, plan: r, planCurrent: L, versionArg: s }) {
  const G = A(kn()), S = A(/* @__PURE__ */ new Set()), E = A(!1);
  let M = 0, V = null;
  const q = P(() => G.value.findings.filter(Bs)), D = P(() => q.value.filter((B) => !S.value.has(B.id)));
  function H(B) {
    const I = new Set(S.value);
    I.add(B.id), S.value = I;
  }
  function z() {
    const B = new Set(S.value);
    for (const I of q.value) B.add(I.id);
    S.value = B;
  }
  function N(B) {
    const I = B ? dn(B) : null;
    I !== V && (M++, V = I, G.value = { ...kn(), total: B?.length || 0 }, S.value = /* @__PURE__ */ new Set(), E.value = !1);
  }
  async function Y() {
    if (!$ || !o.component || !L.value) return;
    const B = r.value?.graph || [], I = dn(B), F = ++M;
    S.value = /* @__PURE__ */ new Set(), E.value = !1, G.value = { status: "scanning", modules: [], findings: [], scanned: 0, total: B.length };
    try {
      const i = await $.scan({ component: o.component, version: s() });
      if (F !== M) return;
      const Q = Fs(i);
      if (dn(Q.modules) !== I)
        throw new Error("Security scan resolved different module versions. Refresh the install plan and scan again.");
      G.value = Q;
    } catch (i) {
      if (F === M) {
        const Q = i instanceof Tt && (i.status === 404 || i.code === "UNKNOWN" || i.code === "NETWORK");
        G.value = Q ? { status: "unavailable", modules: [], findings: [], scanned: 0, total: B.length, error: "Security scan unavailable" } : { status: "error", modules: [], findings: [], scanned: 0, total: B.length, error: $e(i, "scan failed") };
      }
    }
  }
  function T() {
    const B = r.value?.graph || [];
    M++, G.value = {
      status: "skipped",
      modules: [],
      findings: [],
      scanned: 0,
      total: B.length,
      summary: "Security scan skipped by operator."
    }, S.value = /* @__PURE__ */ new Set(), E.value = !1;
  }
  function K() {
    M++;
  }
  return { scan: G, acknowledged: S, criticalConfirmed: E, softFindings: q, unacknowledgedSoft: D, acknowledge: H, acknowledgeAllSoft: z, resetScanForPlan: N, runScanNow: Y, skipScan: T, cancelScan: K };
}
const Ks = {
  "hub.install.started": "Publishing changeset",
  "hub.install.finished": "Finalizing",
  "hub.migrations.started": "Running migrations",
  "hub.migrations.finished": "Migrations applied",
  "hub.uninstall.started": "Removing entries"
}, cn = [
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
  const r = Un(bn), L = A("overview"), s = A(""), G = A("pin"), S = A([]), E = A(!1), M = P(() => [
    { label: "latest", value: "" },
    ...S.value.map((O) => String(O.version || "")).filter(Boolean).map((O) => ({ label: O, value: O }))
  ]), V = P(() => S.value.find((O) => O.version === s.value) || S.value[0]);
  function q() {
    const O = s.value.trim().replace(/^>=?/, "");
    if (O)
      return G.value === "track" ? `>=${O}` : O;
  }
  const D = P(() => o.installedDep ? it(o.installedDep) : ""), H = A(""), z = A(!1), N = A(null), Y = A(!1), T = A(!1), K = A(null), B = A(null), I = A(null), F = P(() => (N.value?.graph || []).filter((O) => O.direct || O.module === o.component)), i = P(() => (N.value?.graph || []).filter((O) => !O.direct && O.module !== o.component)), Q = P(() => Gn(N.value?.graph || [])), d = P(() => {
    const O = [], ue = (ie, we) => {
      for (const C of ie)
        O.push({ ...C, level: we }), ue(C.children, we + 1);
    };
    return ue(Q.value, 0), O;
  }), g = P(() => N.value?.module_count || N.value?.graph?.length || 0), y = P(() => (N.value?.graph || []).reduce((O, ue) => O + (ue.size_bytes || 0), 0));
  function re(O) {
    return Jn(O, { currentVersion: D.value, targetModule: o.component });
  }
  const m = js({ props: o, hub: r, plan: N, activeSection: L, versionArg: q, requirementPayload: gt, invalidatePlan: f, refreshPlan: vt, planCurrent: T }), {
    pendingSuggestions: h,
    pendingCount: _,
    acceptSuggestions: R,
    rejectSuggestions: Z,
    editSuggestions: ee,
    displayValue: ne,
    requirements: de,
    requirementGroups: Ke,
    rootRequirements: ke,
    transitiveRequirementCount: Ve,
    parameterValues: Me,
    editableRequirements: ot,
    missingRequirements: De,
    boundRequirementCount: rt,
    autoFitCount: yt,
    aiResolvableCount: _t,
    aiResolving: ge,
    aiResolutionNotice: Et,
    resolveRequirementsWithAI: Ge,
    highlightTick: Ne,
    setParameter: ut,
    requirementValue: We,
    requirementMissing: Pe,
    requirementReadOnly: Ae,
    requirementOptions: Ie,
    typeInvalidRequirements: be,
    requirementTypeInvalid: qe,
    requirementTypeHint: Be,
    canAutoFitRequirement: wt,
    autoFitRequirement: Ye,
    autoFitRequirements: Oe,
    loadInstalledParameterHints: Ue,
    applyPlan: $t,
    resetRequirements: p,
    abortAI: b
  } = m, x = A("up"), U = A([]), j = P(() => U.value.length > 0), W = P({
    get: () => j.value ? "up" : x.value,
    set: (O) => {
      x.value = O;
    }
  }), le = P(() => j.value ? [cn[0]] : cn), pe = P(() => N.value?.migrations || []), Je = P(() => N.value?.dependency?.id || N.value?.install_payload?.id || ""), St = zs({ props: o, hub: r, plan: N, planCurrent: T, versionArg: q }), {
    scan: oe,
    acknowledged: Re,
    criticalConfirmed: Ze,
    softFindings: dt,
    unacknowledgedSoft: ct,
    acknowledge: me,
    acknowledgeAllSoft: Se,
    resetScanForPlan: Qe,
    runScanNow: He,
    skipScan: Ot,
    cancelScan: Ct
  } = St, kt = P(() => {
    const O = Y.value || ge.value ? { tone: "loading" } : _.value ? { tone: "warn", badge: String(_.value) } : De.value.length || be.value.length ? { tone: "danger", badge: String(De.value.length + be.value.length) } : de.value.length ? { tone: "ok" } : { tone: "none" }, ue = {
      scanning: "loading",
      clean: "ok",
      warnings: "warn",
      critical: "danger",
      error: "danger",
      unavailable: "none",
      idle: "none",
      skipped: "none"
    }[oe.value.status] || "none";
    return {
      overview: { tone: "none" },
      modules: Y.value ? { tone: "loading" } : N.value ? { tone: "none", badge: String(g.value) } : { tone: "none" },
      requirements: O,
      scan: { tone: ue, badge: oe.value.findings.length ? String(oe.value.findings.length) : void 0 },
      review: pe.value.length ? { tone: "none", badge: String(pe.value.length) } : { tone: "none" }
    };
  }), Ce = A(!1), Te = A(!1), Xe = A(null), et = A(null), fe = A(null), tt = A(null), Ht = P(() => mn(Xe.value || tt.value)), ft = A(""), nt = A(0);
  let st = null, Fe = null, ve = 0, je = 0, ce = 0;
  function Lt() {
    ft.value = "", nt.value = 0;
    const O = Date.now();
    st = setInterval(() => {
      nt.value = Math.floor((Date.now() - O) / 1e3);
    }, 250);
    try {
      const ue = Qn("keeper.hub", (ie) => {
        const we = Ks[Gs(ie)];
        we && (ft.value = we);
      });
      Fe = typeof ue == "function" ? ue : null;
    } catch {
      Fe = null;
    }
  }
  function he() {
    if (st && (clearInterval(st), st = null), Fe) {
      try {
        Fe();
      } catch {
      }
      Fe = null;
    }
  }
  function gt() {
    const O = [], ue = [];
    for (const ie of ot.value) {
      const we = se(ie);
      if (!we) continue;
      const C = Me.value[we], te = typeof C == "string" ? C.trim() : C;
      if (te == null || te === "") continue;
      (Xt(ie, o.component) ? ue : O).push({ name: we, value: te });
    }
    return {
      parameters: O.length ? O : void 0,
      requirement_bindings: ue.length ? ue : void 0
    };
  }
  function xt(O, ue) {
    const ie = En?.toast;
    typeof ie == "function" && ie({ severity: O === "ok" ? "success" : "error", summary: ue });
  }
  async function bt(O) {
    if (!r || !o.component || !T.value || N.value?.applicable === !1 || _.value || ge.value) return;
    const ue = ++ce, ie = () => ue === ce && o.open;
    O ? Te.value = !0 : Ce.value = !0, Xe.value = null, fe.value = null, et.value = null, tt.value = null, O || Lt();
    let we = !1;
    try {
      const C = await r.install({
        component: o.component,
        version: q(),
        id: o.mode === "update" && o.currentId ? o.currentId : void 0,
        dry_run: O || void 0,
        migration_policy: W.value,
        ...gt()
      });
      if (!ie()) return;
      if (C.success !== !0) throw new Tt("INSTALL_INCOMPLETE", "Keeper does not confirm a successful install.", void 0, C);
      if (O || await Zn(r, U.value, {
        isCurrent: ie,
        onPhase: (te) => {
          ft.value = te;
        }
      }), !ie()) return;
      if (Xe.value = C, !O) {
        const te = o.mode === "update" ? "updated" : "installed";
        xt("ok", `Module ${te}: ${C.dependency?.id || o.component}`), pn(), we = !0;
      }
    } catch (C) {
      if (!ie()) return;
      ze("install:run", C), C instanceof Tt && (fe.value = C.code, tt.value = C.details), et.value = $e(C, O ? "preview failed" : "install failed"), xt("error", et.value);
    } finally {
      ue === ce && (O ? Te.value = !1 : (Ce.value = !1, he()));
    }
    we && $("changed");
  }
  const ye = P(() => !N.value || K.value ? "modules" : _.value || ge.value || De.value.length || be.value.length || !T.value || N.value.applicable === !1 || de.value.some((O) => O.invalid) ? "requirements" : oe.value.status === "idle" || oe.value.status === "scanning" || oe.value.status === "critical" && !Ze.value || ct.value.length ? "scan" : null), It = P(() => Ce.value || Te.value || Y.value || !N.value || !!K.value || !T.value || _.value > 0 || ge.value || oe.value.status === "scanning" || L.value === "scan" && oe.value.status === "idle"), Rt = P(() => {
    if (_.value) return `Review ${_.value} AI suggestion${_.value === 1 ? "" : "s"}`;
    if (ge.value) return "Resolving settings…";
    if (!T.value) return "Validating settings…";
    const O = De.value.length;
    return O ? `${O} required setting${O === 1 ? "" : "s"} missing` : "Review requirement errors";
  }), Vt = P(() => Ce.value || Te.value || Y.value || !N.value || !!K.value || !T.value || _.value > 0 || ge.value), at = P(() => Ce.value ? o.mode === "update" ? "Updating…" : "Installing…" : ye.value === "scan" && oe.value.status === "idle" ? L.value === "scan" ? "Choose scan option" : "Review scan choice" : ye.value === "scan" && L.value === "scan" && (oe.value.status === "warnings" || oe.value.status === "critical") ? "Install anyway" : o.mode === "update" ? "Update" : "Install");
  function Dt() {
    if (It.value) return;
    const O = ye.value;
    if (O === "requirements") {
      L.value = "requirements", Ne.value++;
      return;
    }
    if (O === "scan") {
      if (L.value !== "scan") {
        L.value = "scan";
        return;
      }
      if (oe.value.status === "idle" || oe.value.status === "scanning" || oe.value.status === "critical" && !Ze.value || (Se(), ye.value)) return;
    }
    if (O === "modules") {
      L.value = "modules";
      return;
    }
    bt(!1);
  }
  function mt() {
    if (!T.value || N.value?.applicable === !1 || _.value || ge.value || de.value.some((O) => O.invalid) || De.value.length || be.value.length) {
      L.value = "requirements", Ne.value++;
      return;
    }
    L.value = "review", bt(!0);
  }
  async function vt() {
    if (!r || !o.component) return;
    _e && (clearTimeout(_e), _e = null);
    const O = ++ve;
    T.value = !1, Y.value = !0, K.value = null, B.value = null, I.value = null;
    const ue = { ...Me.value };
    try {
      const ie = await r.planInstall({
        component: o.component,
        version: q(),
        id: o.mode === "update" && o.currentId ? o.currentId : void 0,
        run_migrations: W.value === "up",
        ...gt()
      });
      if (O !== ve || !o.open) return;
      const we = Yn(ie.requirements || []);
      U.value = we, $t(ie, ue), T.value = !0, Qe(ie.graph || []);
    } catch (ie) {
      if (O !== ve || !o.open) return;
      ze("install:plan", ie), N.value = null, oe.value = kn(), K.value = $e(ie, "failed to plan install"), ie instanceof Tt && (B.value = ie.code, I.value = ie.details);
    } finally {
      O === ve && (Y.value = !1);
    }
  }
  let _e = null;
  function f() {
    ve++, T.value = !1, b(), u();
  }
  function u() {
    _e && clearTimeout(_e), _e = setTimeout(() => {
      vt();
    }, 350);
  }
  async function Ee() {
    if (S.value = [], !(!r || !o.component)) {
      E.value = !0;
      try {
        const O = await r.listVersions(o.component);
        S.value = O.items || [];
      } catch (O) {
        ze("install:versions", O);
      } finally {
        E.value = !1;
      }
    }
  }
  async function ln() {
    if (H.value = "", !(!r || !o.component)) {
      z.value = !0;
      try {
        const O = await r.getReadme(o.component);
        H.value = O.content || "";
      } catch {
      } finally {
        z.value = !1;
      }
    }
  }
  function on() {
    ve++, L.value = "overview", N.value = null, T.value = !1, U.value = [], Ce.value = !1, Te.value = !1, K.value = null, B.value = null, I.value = null, W.value = "up", Xe.value = null, et.value = null, fe.value = null, tt.value = null, p(), Qe(), H.value = "", S.value = [];
  }
  async function Jt() {
    const O = ++je;
    on(), s.value = o.mode === "update" ? "" : o.version || "", G.value = "track", await Promise.all([Ee(), ln(), Ue()]), !(!o.open || O !== je) && (o.mode === "update" && !s.value && S.value.length && (s.value = String(S.value[0].version || "")), await vt());
  }
  Le(() => o.open, (O) => {
    if (O) {
      Jt();
      return;
    }
    b(), he(), ce++, Ce.value = !1, Te.value = !1, je++, ve++, Ct(), _e && (clearTimeout(_e), _e = null);
  }, { immediate: !0 }), Le([s, G], () => {
    o.open && r && f();
  }, { flush: "sync" }), Le(W, () => {
    o.open && r && N.value && f();
  }, { flush: "sync" }), fn(() => {
    ce++, b(), he(), je++, ve++, Ct(), _e && clearTimeout(_e);
  });
  function Mt() {
    b(), ce++, Ce.value = !1, Te.value = !1, he(), $("close");
  }
  return {
    // nav
    activeSection: L,
    sectionStatus: kt,
    blockingSection: ye,
    // version
    version: s,
    versionMode: G,
    versionOptions: M,
    versionsLoading: E,
    versionMeta: V,
    currentVersion: D,
    // overview
    readme: H,
    readmeLoading: z,
    // plan
    plan: N,
    planCurrent: T,
    planLoading: Y,
    planError: K,
    planCode: B,
    planErrorDetails: I,
    directModules: F,
    transitiveModules: i,
    planTree: Q,
    planRows: d,
    moduleCount: g,
    totalSize: y,
    badgesForNode: re,
    // requirements
    requirements: de,
    requirementGroups: Ke,
    rootRequirements: ke,
    editableRequirements: ot,
    transitiveRequirementCount: Ve,
    parameterValues: Me,
    missingRequirements: De,
    boundRequirementCount: rt,
    autoFitCount: yt,
    aiResolvableCount: _t,
    aiResolving: ge,
    aiResolutionNotice: Et,
    resolveRequirementsWithAI: Ge,
    pendingSuggestions: h,
    pendingCount: _,
    acceptSuggestions: R,
    rejectSuggestions: Z,
    editSuggestions: ee,
    displayValue: ne,
    highlightTick: Ne,
    setParameter: ut,
    requirementValue: We,
    requirementMissing: Pe,
    requirementReadOnly: Ae,
    requirementOptions: Ie,
    requirementConfiguredBy: Wn,
    typeInvalidRequirements: be,
    requirementTypeInvalid: qe,
    requirementTypeHint: Be,
    canAutoFitRequirement: wt,
    autoFitRequirement: Ye,
    autoFitRequirements: Oe,
    // review / options
    requiredSetup: j,
    migrationPolicy: W,
    migrationOptions: le,
    migrations: pe,
    destinationId: Je,
    INSTALL_MIGRATION_OPTIONS: cn,
    // scan
    scan: oe,
    acknowledged: Re,
    criticalConfirmed: Ze,
    softFindings: dt,
    unacknowledgedSoft: ct,
    acknowledge: me,
    acknowledgeAllSoft: Se,
    runScanNow: He,
    skipScan: Ot,
    // execution
    running: Ce,
    dryRunning: Te,
    result: Xe,
    resultError: et,
    resultCode: fe,
    resultErrorDetails: tt,
    resultExecution: Ht,
    executionStepLabel: An,
    progressPhase: ft,
    elapsedSec: nt,
    requirementStatusMessage: Rt,
    primaryDisabled: It,
    previewDisabled: Vt,
    primaryLabel: at,
    primaryAction: Dt,
    preview: mt,
    refreshPlan: vt,
    close: Mt
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
}, ba = {
  key: 1,
  class: "km-hint"
}, ha = { class: "km-field" }, ya = {
  class: "km-seg",
  role: "group",
  "aria-label": "Version mode"
}, _a = ["aria-pressed"], wa = ["aria-pressed"], $a = { class: "km-hint" }, Sa = { class: "km-ov-meta" }, Ca = { class: "km-meta-row" }, xa = {
  key: 0,
  class: "km-meta-row"
}, Ia = {
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
}, Va = { class: "km-sec" }, Da = {
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
}, Oa = { class: "km-mrow-badge kx-tag-caps" }, Ha = { class: "km-mrow-name km-mono" }, Fa = {
  key: 2,
  class: "km-mrow-ver km-mono"
}, ja = {
  key: 3,
  class: "km-dim km-mono"
}, za = {
  key: 4,
  class: "km-dim"
}, Ka = { class: "km-sec" }, Ga = {
  key: 1,
  class: "km-empty-inline"
}, Wa = { class: "km-sec-title" }, Ya = { class: "km-dim" }, Ja = { class: "km-req-toolbar" }, Za = ["disabled"], Qa = ["disabled"], Xa = {
  key: 0,
  class: "km-code"
}, el = {
  key: 1,
  class: "km-code"
}, tl = {
  key: 2,
  class: "km-mono"
}, nl = {
  key: 1,
  class: "km-req-toolbar",
  role: "status"
}, sl = { class: "km-grow" }, al = ["disabled"], ll = ["disabled"], il = { class: "km-req-group-head" }, ol = { class: "km-mono" }, rl = {
  key: 0,
  class: "km-dim"
}, ul = { class: "km-req-meta" }, dl = { class: "km-mono km-req-name" }, cl = {
  key: 0,
  class: "km-req-flag"
}, ml = {
  key: 1,
  class: "km-chip km-mono"
}, vl = ["onClick"], pl = ["aria-label", "disabled", "value", "list", "placeholder", "onInput"], kl = ["id"], fl = ["value", "title"], gl = {
  key: 1,
  class: "km-readonly-field km-mono"
}, bl = { class: "km-req-foot" }, hl = {
  key: 0,
  class: "km-req-src"
}, yl = {
  key: 1,
  class: "km-req-invalid"
}, _l = {
  key: 2,
  class: "km-req-invalid"
}, wl = {
  key: 3,
  class: "km-req-info"
}, $l = {
  key: 4,
  class: "km-req-info"
}, Sl = ["aria-label"], Cl = { class: "km-mono" }, xl = { class: "km-row-gap" }, Il = ["disabled", "onClick"], Rl = ["onClick"], Ml = ["onClick"], Al = {
  key: 3,
  class: "km-msg km-msg-err",
  role: "alert"
}, Ul = { class: "km-code" }, Tl = { key: 0 }, El = {
  key: 4,
  class: "km-req-desc"
}, Ll = { class: "km-sec" }, Vl = { class: "km-sec-title" }, Dl = {
  key: 0,
  class: "km-scan-run"
}, Nl = ["disabled"], Pl = {
  key: 1,
  class: "km-msg km-msg-info"
}, ql = ["disabled"], Bl = {
  key: 2,
  class: "km-scan-run"
}, Ol = { class: "km-grow" }, Hl = {
  key: 3,
  class: "km-empty-inline"
}, Fl = {
  key: 4,
  class: "km-msg km-msg-err"
}, jl = ["disabled"], zl = {
  key: 5,
  class: "km-msg km-msg-info"
}, Kl = ["disabled"], Gl = {
  key: 0,
  class: "km-scan-overall"
}, Wl = {
  key: 1,
  class: "km-msg km-msg-err"
}, Yl = { class: "km-scan-mod-head" }, Jl = { class: "km-mono km-scan-mod-name" }, Zl = { class: "km-chip" }, Ql = {
  key: 0,
  class: "km-scan-mod-sum"
}, Xl = { class: "km-grow km-min0" }, ei = { class: "km-finding-head" }, ti = { class: "km-finding-title" }, ni = {
  key: 0,
  class: "km-finding-detail"
}, si = {
  key: 1,
  class: "km-finding-loc km-mono"
}, ai = ["onClick"], li = {
  key: 1,
  class: "km-dim km-scan-mod-clean"
}, ii = {
  key: 2,
  class: "km-check km-mt"
}, oi = { class: "km-sec" }, ri = { class: "km-sec-title" }, ui = { class: "km-review-grid" }, di = { class: "km-review-tile" }, ci = { class: "km-review-tile" }, mi = { class: "km-review-tile" }, vi = { class: "km-review-tile" }, pi = { class: "km-field" }, ki = {
  key: 0,
  class: "km-hint"
}, fi = {
  key: 1,
  class: "km-mig-list"
}, gi = { class: "km-mono km-trunc" }, bi = { class: "km-chip" }, hi = { class: "km-hint" }, yi = { class: "km-adv" }, _i = { class: "km-adv-body" }, wi = { class: "km-meta-row" }, $i = { class: "km-mono" }, Si = { class: "km-meta-row" }, Ci = { class: "km-mono" }, xi = {
  key: 0,
  class: "km-panel km-panel-ok"
}, Ii = { class: "km-panel-title" }, Ri = {
  key: 0,
  class: "km-dim"
}, Mi = {
  key: 1,
  class: "km-dim"
}, Ai = {
  key: 0,
  class: "km-dim"
}, Ui = { class: "km-mono" }, Ti = {
  key: 1,
  class: "km-dim"
}, Ei = {
  key: 2,
  class: "km-dim"
}, Li = {
  key: 1,
  class: "km-ledger"
}, Vi = { class: "km-ledger-step" }, Di = { class: "km-grow" }, Ni = { class: "km-chip" }, Pi = {
  key: 0,
  class: "km-ledger-msg"
}, qi = {
  key: 2,
  class: "km-msg km-msg-err"
}, Bi = {
  key: 0,
  class: "km-code"
}, Oi = {
  key: 0,
  class: "km-running km-2p-progress"
}, Hi = { class: "km-grow km-running-label" }, Fi = { class: "km-dim" }, ji = {
  key: 0,
  class: "km-foot-note"
}, zi = ["disabled"], Ki = ["disabled"], Gi = ["disabled"], Wi = /* @__PURE__ */ Bt({
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
    ], S = P(() => r.catalogItem || { full_name: r.component, component: r.component }), E = P(() => Wt(S.value)), M = P(() => r.mode === "update" ? "Update module" : "Install module");
    function V(F) {
      const i = s.requirementOptions(F), Q = s.requirementValue(F);
      return Q && !i.some((d) => d.value === Q) ? [{ label: `${Q} (current)`, value: Q }, ...i] : i;
    }
    function q(F) {
      return `km-req-options-${se(F).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
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
    const H = A(null), z = A(!1);
    let N;
    fn(() => clearTimeout(N)), Le(() => s.highlightTick.value, async (F, i, Q) => {
      let d = !0;
      if (Q(() => {
        d = !1;
      }), s.activeSection.value !== "requirements" || (await Kt(), !d)) return;
      H.value?.querySelector(".km-req.is-missing, .km-req.is-invalid")?.scrollIntoView({ block: "center", behavior: "smooth" }), z.value = !0, clearTimeout(N), N = setTimeout(() => {
        z.value = !1;
      }, 1200);
    });
    function Y(F) {
      return xn[F.severity].tone;
    }
    function T(F) {
      return F === "critical" || F === "error" ? "km-dot-danger" : F === "warnings" ? "km-dot-warn" : "km-dot-ok";
    }
    function K(F) {
      return `km-plan-badge kx-tag-caps km-plan-badge-${F}`;
    }
    function B(F) {
      return F === "failed" || F === "rollback_failed" ? "km-ledger-bad" : F === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok";
    }
    const I = P(() => s.progressPhase.value || (r.mode === "update" ? "Updating…" : "Installing…"));
    return gn(() => {
      Tn("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (F, i) => {
      const Q = Mn("wc-render-markdown");
      return n(), Nt(hs, {
        visible: o.open,
        busy: e(s).running.value || e(s).dryRunning.value,
        label: M.value,
        class: "km-dialog km-dialog-2p",
        "header-class": "km-modal-head km-2p-head",
        "content-class": "km-dialog-content km-dialog-content-2p",
        "footer-class": "km-modal-foot km-2p-foot",
        style: Ut({ "--accent": E.value }),
        onClose: i[19] || (i[19] = (d) => e(s).close())
      }, {
        header: pt(() => [
          t("span", Ys, [
            v(e(k), {
              icon: e(qt)(S.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          t("span", Js, [
            t("span", Zs, l(M.value), 1),
            t("span", Qs, [
              w(l(e(Pt)(S.value)) + " ", 1),
              t("span", Xs, l(r.component), 1)
            ])
          ])
        ]),
        footer: pt(() => [
          e(s).running.value ? (n(), a("div", Oi, [
            v(e(k), {
              icon: "tabler:loader-2",
              class: "km-i spin km-accent",
              "aria-hidden": "true"
            }),
            t("span", Hi, l(I.value), 1),
            t("span", Fi, l(e(s).elapsedSec.value) + "s", 1)
          ])) : (n(), a(J, { key: 1 }, [
            e(s).blockingSection.value === "requirements" ? (n(), a("span", ji, [
              v(e(k), {
                icon: "tabler:alert-triangle",
                class: "km-i-sm",
                "aria-hidden": "true"
              }),
              w(" " + l(e(s).requirementStatusMessage.value), 1)
            ])) : c("", !0),
            e(s).blockingSection.value === "requirements" ? (n(), a("button", {
              key: 1,
              class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
              disabled: e(s).autoFitCount.value === 0,
              onClick: i[15] || (i[15] = (d) => e(s).autoFitRequirements())
            }, [
              v(e(k), {
                icon: "tabler:wand",
                class: "km-i",
                "aria-hidden": "true"
              }),
              i[69] || (i[69] = w(" Auto-fit ", -1))
            ], 8, zi)) : c("", !0),
            i[71] || (i[71] = t("span", { class: "km-grow" }, null, -1)),
            t("button", {
              class: "km-btn km-btn-text km-btn-secondary km-btn-sm",
              onClick: i[16] || (i[16] = (d) => e(s).close())
            }, "Cancel"),
            t("button", {
              class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
              disabled: e(s).previewDisabled.value,
              onClick: i[17] || (i[17] = (d) => e(s).preview())
            }, [
              v(e(k), {
                icon: e(s).dryRunning.value ? "tabler:loader-2" : "tabler:eye",
                class: X(["km-i", e(s).dryRunning.value && "spin"]),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              i[70] || (i[70] = w(" Preview changes ", -1))
            ], 8, Ki),
            t("button", {
              class: "km-btn km-btn-sm",
              disabled: e(s).primaryDisabled.value,
              onClick: i[18] || (i[18] = (d) => e(s).primaryAction())
            }, [
              v(e(k), {
                icon: r.mode === "update" ? "tabler:refresh-dot" : "tabler:download",
                class: "km-i",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              w(" " + l(e(s).primaryLabel.value), 1)
            ], 8, Gi)
          ], 64))
        ]),
        default: pt(() => [
          t("div", ea, [
            t("nav", ta, [
              (n(), a(J, null, ae(G, (d) => t("button", {
                key: d.key,
                class: X(["km-2p-navitem", { active: e(s).activeSection.value === d.key }]),
                onClick: (g) => e(s).activeSection.value = d.key
              }, [
                v(e(k), {
                  icon: d.icon,
                  class: "km-i",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                t("span", sa, l(d.label), 1),
                t("span", aa, [
                  e(s).sectionStatus.value[d.key].tone === "loading" ? (n(), Nt(e(k), {
                    key: 0,
                    icon: "tabler:loader-2",
                    class: "km-i-sm spin km-dim",
                    "aria-hidden": "true"
                  })) : e(s).sectionStatus.value[d.key].tone === "ok" ? (n(), Nt(e(k), {
                    key: 1,
                    icon: "tabler:circle-check-filled",
                    class: "km-i-sm km-sev-ok-fg",
                    "aria-hidden": "true"
                  })) : e(s).sectionStatus.value[d.key].tone === "danger" ? (n(), a("span", la)) : e(s).sectionStatus.value[d.key].tone === "warn" ? (n(), a("span", ia)) : c("", !0),
                  e(s).sectionStatus.value[d.key].badge ? (n(), a("span", oa, l(e(s).sectionStatus.value[d.key].badge), 1)) : c("", !0)
                ])
              ], 10, na)), 64))
            ]),
            t("div", {
              ref_key: "mainRef",
              ref: H,
              class: "km-2p-main"
            }, [
              lt(t("section", ra, [
                t("div", ua, [
                  t("span", da, [
                    v(e(k), {
                      icon: e(qt)(S.value),
                      class: "km-i-lg",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  t("div", ca, [
                    t("div", ma, [
                      t("span", va, l(e(Pt)(S.value)), 1),
                      e(jt)(S.value) ? (n(), a("span", pa, "app")) : c("", !0),
                      S.value.deprecated ? (n(), a("span", ka, "deprecated")) : c("", !0)
                    ]),
                    t("div", fa, l(r.component), 1)
                  ])
                ]),
                S.value.description ? (n(), a("p", ga, l(S.value.description), 1)) : c("", !0),
                r.mode === "update" && !r.currentId ? (n(), a("p", ba, " Updating this module creates an application root dependency for the selected version. This version also applies to modules that depend on it; the plan shows any conflicts. ")) : c("", !0),
                t("div", ha, [
                  i[21] || (i[21] = t("label", { class: "km-label" }, "Version", -1)),
                  v(Cn, {
                    modelValue: e(s).version.value,
                    "onUpdate:modelValue": i[0] || (i[0] = (d) => e(s).version.value = d),
                    items: e(s).versionOptions.value.map((d) => ({ id: d.value, title: d.label })),
                    placeholder: "latest",
                    "aria-label": "Version"
                  }, null, 8, ["modelValue", "items"]),
                  t("div", ya, [
                    t("button", {
                      class: X(["km-seg-btn", { active: e(s).versionMode.value === "pin" }]),
                      "aria-pressed": e(s).versionMode.value === "pin",
                      onClick: i[1] || (i[1] = (d) => e(s).versionMode.value = "pin")
                    }, [
                      v(e(k), {
                        icon: "tabler:pin",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      w(" Pin " + l(e(s).version.value || "latest"), 1)
                    ], 10, _a),
                    t("button", {
                      class: X(["km-seg-btn", { active: e(s).versionMode.value === "track" }]),
                      "aria-pressed": e(s).versionMode.value === "track",
                      onClick: i[2] || (i[2] = (d) => e(s).versionMode.value = "track")
                    }, [
                      v(e(k), {
                        icon: "tabler:arrow-up-circle",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      i[20] || (i[20] = w(" Track updates ", -1))
                    ], 10, wa)
                  ]),
                  t("p", $a, l(e(s).versionMode.value === "pin" ? "Locks to this exact version; future updates are manual." : `Tracks ${e(s).version.value ? "≥ " + e(s).version.value : "all"} releases on the next resolve.`), 1)
                ]),
                t("div", Sa, [
                  t("div", Ca, [
                    v(e(k), {
                      icon: "tabler:download",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    i[22] || (i[22] = t("span", null, "Downloads", -1)),
                    t("b", null, l(e(Yt)(S.value.total_downloads)), 1)
                  ]),
                  S.value.favorites_count ? (n(), a("div", xa, [
                    v(e(k), {
                      icon: "tabler:star",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    i[23] || (i[23] = t("span", null, "Favorites", -1)),
                    t("b", null, l(S.value.favorites_count), 1)
                  ])) : c("", !0),
                  S.value.license ? (n(), a("div", Ia, [
                    v(e(k), {
                      icon: "tabler:license",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    i[24] || (i[24] = t("span", null, "License", -1)),
                    t("b", {
                      title: S.value.license
                    }, l(e(sn)(S.value.license)), 9, Ra)
                  ])) : c("", !0),
                  S.value.type ? (n(), a("div", Ma, [
                    v(e(k), {
                      icon: "tabler:category",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    i[25] || (i[25] = t("span", null, "Type", -1)),
                    t("b", null, l(S.value.type), 1)
                  ])) : c("", !0),
                  e(s).versionMeta.value?.entry_count ? (n(), a("div", Aa, [
                    v(e(k), {
                      icon: "tabler:list-numbers",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    i[26] || (i[26] = t("span", null, "Entries", -1)),
                    t("b", null, l(e(s).versionMeta.value.entry_count), 1)
                  ])) : c("", !0),
                  e(s).versionMeta.value?.size_bytes ? (n(), a("div", Ua, [
                    v(e(k), {
                      icon: "tabler:weight",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    i[27] || (i[27] = t("span", null, "Size", -1)),
                    t("b", null, l(e(zt)(e(s).versionMeta.value.size_bytes)), 1)
                  ])) : c("", !0),
                  S.value.update_time ? (n(), a("div", Ta, [
                    v(e(k), {
                      icon: "tabler:clock",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    i[28] || (i[28] = t("span", null, "Updated", -1)),
                    t("b", null, l(e(an)(S.value.update_time, { maxUnit: "year" })), 1)
                  ])) : c("", !0)
                ]),
                e(s).readmeLoading.value ? (n(), a("div", Ea, [
                  v(e(k), {
                    icon: "tabler:loader-2",
                    class: "km-i spin",
                    "aria-hidden": "true"
                  }),
                  i[29] || (i[29] = w(" Loading README…", -1))
                ])) : e(s).readme.value ? (n(), a("article", La, [
                  v(Q, {
                    source: e(s).readme.value
                  }, null, 8, ["source"])
                ])) : c("", !0)
              ], 512), [
                [Ft, e(s).activeSection.value === "overview"]
              ]),
              lt(t("section", Va, [
                e(s).planLoading.value ? (n(), a(J, { key: 0 }, [
                  i[30] || (i[30] = t("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "40%" }
                  }, null, -1)),
                  (n(), a(J, null, ae(4, (d) => t("div", {
                    class: "km-skel km-skel-card",
                    key: d
                  })), 64))
                ], 64)) : e(s).planError.value ? (n(), a("div", Da, [
                  e(s).planCode.value ? (n(), a("span", Na, l(e(s).planCode.value), 1)) : c("", !0),
                  w(l(e(s).planError.value), 1)
                ])) : e(s).plan.value ? (n(), a(J, { key: 2 }, [
                  t("div", Pa, [
                    v(e(k), {
                      icon: "tabler:hierarchy-2",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    w(" Installs " + l(e(s).moduleCount.value) + " module" + l(e(s).moduleCount.value === 1 ? "" : "s") + " ", 1),
                    e(s).totalSize.value ? (n(), a("span", qa, "· " + l(e(zt)(e(s).totalSize.value)), 1)) : c("", !0)
                  ]),
                  i[32] || (i[32] = t("p", { class: "km-hint" }, "The module plus its full dependency chain (ns.dependency), resolved to these versions.", -1)),
                  (n(!0), a(J, null, ae(e(s).planRows.value, (d) => (n(), a("div", {
                    key: d.path || d.module,
                    class: X(["km-mrow", { "km-mrow-direct": d.direct || d.module === r.component, "km-mrow-transitive": !(d.direct || d.module === r.component) }]),
                    style: Ut({ "--tree-level": d.level })
                  }, [
                    d.level > 0 ? (n(), Nt(e(k), {
                      key: 0,
                      icon: "tabler:corner-down-right",
                      class: "km-i-sm km-dim",
                      "aria-hidden": "true"
                    })) : (n(), a("span", Ba)),
                    t("span", Oa, l(d.direct || d.module === r.component ? "direct" : "transitive"), 1),
                    t("span", Ha, l(d.module), 1),
                    d.version ? (n(), a("span", Fa, l(d.version), 1)) : c("", !0),
                    d.constraint ? (n(), a("span", ja, l(d.constraint), 1)) : c("", !0),
                    i[31] || (i[31] = t("span", { class: "km-grow" }, null, -1)),
                    (n(!0), a(J, null, ae(e(s).badgesForNode(d), (g) => (n(), a("span", {
                      key: g.label,
                      class: X(K(g.tone))
                    }, l(g.label), 3))), 128)),
                    d.size_bytes ? (n(), a("span", za, l(e(zt)(d.size_bytes)), 1)) : c("", !0)
                  ], 6))), 128))
                ], 64)) : c("", !0)
              ], 512), [
                [Ft, e(s).activeSection.value === "modules"]
              ]),
              lt(t("section", Ka, [
                e(s).planLoading.value ? (n(), a(J, { key: 0 }, [
                  i[33] || (i[33] = t("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "30%" }
                  }, null, -1)),
                  (n(), a(J, null, ae(3, (d) => t("div", {
                    class: "km-skel km-skel-field",
                    key: d
                  })), 64))
                ], 64)) : e(s).requirements.value.length ? (n(), a(J, { key: 2 }, [
                  t("div", Wa, [
                    v(e(k), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    i[35] || (i[35] = w(" Configuration ", -1)),
                    t("span", Ya, "(" + l(e(s).boundRequirementCount.value) + "/" + l(e(s).requirements.value.length) + " set)", 1)
                  ]),
                  t("div", Ja, [
                    i[37] || (i[37] = t("p", { class: "km-hint km-grow" }, "Bind root requirements to host resources. Transitive requirements are shown for review and are configured by their owning module.", -1)),
                    e(s).aiResolvableCount.value ? (n(), a("button", {
                      key: 0,
                      class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                      disabled: e(s).aiResolving.value || !e(s).planCurrent.value,
                      onClick: i[3] || (i[3] = (d) => e(s).resolveRequirementsWithAI(H.value))
                    }, [
                      v(e(k), {
                        icon: e(s).aiResolving.value ? "tabler:loader-2" : "tabler:sparkles",
                        class: X(["km-i", e(s).aiResolving.value && "spin"]),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"]),
                      w(" " + l(e(s).aiResolving.value ? "Resolving…" : "Resolve with AI"), 1)
                    ], 8, Za)) : c("", !0),
                    e(s).missingRequirements.value.length ? (n(), a("button", {
                      key: 1,
                      class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                      disabled: e(s).autoFitCount.value === 0,
                      onClick: i[4] || (i[4] = (d) => e(s).autoFitRequirements())
                    }, [
                      v(e(k), {
                        icon: "tabler:wand",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      i[36] || (i[36] = w(" Auto-fit ", -1))
                    ], 8, Qa)) : c("", !0)
                  ]),
                  e(s).aiResolutionNotice.value ? (n(), a("div", {
                    key: 0,
                    class: X(["km-msg", e(s).aiResolutionNotice.value.tone === "success" ? "km-msg-ok" : "km-msg-warn"]),
                    role: "status"
                  }, [
                    e(s).aiResolutionNotice.value.code ? (n(), a("span", Xa, l(e(s).aiResolutionNotice.value.code), 1)) : c("", !0),
                    e(s).aiResolutionNotice.value.kind ? (n(), a("span", el, l(e(s).aiResolutionNotice.value.kind), 1)) : c("", !0),
                    w(" " + l(e(s).aiResolutionNotice.value.message) + " ", 1),
                    e(s).aiResolutionNotice.value.details ? (n(), a("pre", tl, l(JSON.stringify(e(s).aiResolutionNotice.value.details, null, 2)), 1)) : c("", !0)
                  ], 2)) : c("", !0),
                  e(s).pendingCount.value ? (n(), a("div", nl, [
                    t("span", sl, "Review " + l(e(s).pendingCount.value) + " AI suggestion" + l(e(s).pendingCount.value === 1 ? "" : "s") + " before applying.", 1),
                    t("button", {
                      class: "km-btn km-btn-sm",
                      disabled: !e(s).planCurrent.value,
                      onClick: i[5] || (i[5] = (d) => e(s).acceptSuggestions(Object.keys(e(s).pendingSuggestions.value)))
                    }, "Accept all", 8, al),
                    t("button", {
                      class: "km-btn km-btn-secondary km-btn-sm",
                      onClick: i[6] || (i[6] = (d) => e(s).rejectSuggestions(Object.keys(e(s).pendingSuggestions.value)))
                    }, "Reject all"),
                    t("button", {
                      class: "km-btn km-btn-secondary km-btn-sm",
                      disabled: !e(s).planCurrent.value,
                      onClick: i[7] || (i[7] = (d) => e(s).editSuggestions(Object.keys(e(s).pendingSuggestions.value)))
                    }, "Edit all", 8, ll)
                  ])) : c("", !0),
                  (n(!0), a(J, null, ae(e(s).requirementGroups.value, (d) => (n(), a("div", {
                    key: d.module,
                    class: "km-req-group"
                  }, [
                    t("div", il, [
                      v(e(k), {
                        icon: d.direct ? "tabler:package" : "tabler:corner-down-right",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      t("span", ol, l(d.module), 1),
                      d.direct ? c("", !0) : (n(), a("span", rl, "dependency"))
                    ]),
                    (n(!0), a(J, null, ae(d.items, (g) => (n(), a("div", {
                      key: e(se)(g),
                      class: X(["km-req", { "is-missing": e(s).requirementMissing(g), "is-invalid": e(s).requirementTypeInvalid(g), "is-flash": z.value && (e(s).requirementMissing(g) || e(s).requirementTypeInvalid(g)) }])
                    }, [
                      t("div", ul, [
                        t("span", dl, l(g.name || e(se)(g)), 1),
                        g.required || g.missing ? (n(), a("span", cl, "required")) : c("", !0),
                        g.expected_kind ? (n(), a("span", ml, l(g.expected_kind), 1)) : c("", !0),
                        i[39] || (i[39] = t("span", { class: "km-grow" }, null, -1)),
                        e(s).requirementMissing(g) && e(s).canAutoFitRequirement(g) ? (n(), a("button", {
                          key: 2,
                          class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-req-fit",
                          onClick: (y) => e(s).autoFitRequirement(g)
                        }, [
                          v(e(k), {
                            icon: "tabler:wand",
                            class: "km-i-sm",
                            "aria-hidden": "true"
                          }),
                          i[38] || (i[38] = w(" Auto-fit ", -1))
                        ], 8, vl)) : c("", !0)
                      ]),
                      e(s).requirementReadOnly(g) ? (n(), a("div", gl, l(e(s).requirementValue(g) || e(s).displayValue(g.default) || "not set"), 1)) : (n(), a(J, { key: 0 }, [
                        t("input", {
                          class: "km-input km-w-full",
                          "aria-label": g.name || e(se)(g),
                          disabled: e(s).running.value || e(s).dryRunning.value,
                          value: e(s).requirementValue(g),
                          list: V(g).length ? q(g) : void 0,
                          placeholder: e(s).displayValue(g.default) || (g.expected_kind ? `Enter ${g.expected_kind} id` : "Enter registry id or value"),
                          onInput: (y) => e(s).setParameter(g, y.target.value)
                        }, null, 40, pl),
                        V(g).length ? (n(), a("datalist", {
                          key: 0,
                          id: q(g)
                        }, [
                          (n(!0), a(J, null, ae(V(g), (y) => (n(), a("option", {
                            key: y.value,
                            value: y.value,
                            title: y.title
                          }, l(y.label), 9, fl))), 128))
                        ], 8, kl)) : c("", !0)
                      ], 64)),
                      t("div", bl, [
                        D(g) ? (n(), a("span", hl, [
                          v(e(k), {
                            icon: "tabler:wand",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          w(" " + l(D(g)), 1)
                        ])) : c("", !0),
                        e(s).requirementTypeInvalid(g) ? (n(), a("span", yl, [
                          v(e(k), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          w(" " + l(e(s).requirementTypeHint(g)), 1)
                        ])) : g.invalid ? (n(), a("span", _l, [
                          v(e(k), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          w(" " + l(g.invalid_reason || "invalid value"), 1)
                        ])) : c("", !0),
                        e(s).requirementMissing(g) && !e(s).canAutoFitRequirement(g) ? (n(), a("span", wl, [
                          v(e(k), {
                            icon: "tabler:hand-click",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          i[40] || (i[40] = w(" choose a value to continue ", -1))
                        ])) : c("", !0),
                        e(s).requirementReadOnly(g) ? (n(), a("span", $l, [
                          v(e(k), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          w(" configured by " + l(e(s).requirementConfiguredBy(g)) + "; install it directly to override ", 1)
                        ])) : c("", !0)
                      ]),
                      e(s).pendingSuggestions.value[e(se)(g)] ? (n(), a("div", {
                        key: 2,
                        class: "km-ai-proposal",
                        role: "group",
                        "aria-label": `AI suggestion for ${g.name || e(se)(g)}`
                      }, [
                        t("div", Cl, "Suggested value: " + l(e(s).displayValue(e(s).pendingSuggestions.value[e(se)(g)].value)), 1),
                        t("p", null, l(e(s).pendingSuggestions.value[e(se)(g)].choice_reason), 1),
                        t("div", xl, [
                          t("button", {
                            class: "km-btn km-btn-sm",
                            disabled: !e(s).planCurrent.value,
                            onClick: (y) => e(s).acceptSuggestions([e(se)(g)])
                          }, "Accept", 8, Il),
                          t("button", {
                            class: "km-btn km-btn-secondary km-btn-sm",
                            onClick: (y) => e(s).rejectSuggestions([e(se)(g)])
                          }, "Reject", 8, Rl),
                          t("button", {
                            class: "km-btn km-btn-secondary km-btn-sm",
                            onClick: (y) => e(s).editSuggestions([e(se)(g)])
                          }, "Edit", 8, Ml)
                        ])
                      ], 8, Sl)) : c("", !0),
                      g.resolution_error ? (n(), a("div", Al, [
                        t("span", Ul, l(g.resolution_error.kind || g.resolution_error.code), 1),
                        w(" " + l(g.resolution_error.message) + " ", 1),
                        g.resolution_error.details ? (n(), a("pre", Tl, l(JSON.stringify(g.resolution_error.details, null, 2)), 1)) : c("", !0)
                      ])) : c("", !0),
                      g.description ? (n(), a("div", El, l(g.description), 1)) : c("", !0)
                    ], 2))), 128))
                  ]))), 128))
                ], 64)) : (n(), a("div", Ga, [
                  v(e(k), {
                    icon: "tabler:circle-check",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  i[34] || (i[34] = t("p", null, "Nothing to configure — this module binds no host resources.", -1))
                ]))
              ], 512), [
                [Ft, e(s).activeSection.value === "requirements"]
              ]),
              lt(t("section", Ll, [
                t("div", Vl, [
                  v(e(k), {
                    icon: "tabler:shield-check",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  i[41] || (i[41] = w(" Security scan", -1))
                ]),
                i[54] || (i[54] = t("p", { class: "km-hint" }, "An agent reviews the code of every module being installed. Heuristic, not a guarantee — review flagged items before proceeding.", -1)),
                e(s).scan.value.status === "idle" ? (n(), a("div", Dl, [
                  v(e(k), {
                    icon: "tabler:shield-question",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  i[44] || (i[44] = t("span", { class: "km-grow" }, "Security scan not run. Running the reviewer may spend LLM tokens.", -1)),
                  t("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                    onClick: i[8] || (i[8] = (d) => e(s).skipScan())
                  }, [
                    v(e(k), {
                      icon: "tabler:player-skip-forward",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    i[42] || (i[42] = w(" Skip scan ", -1))
                  ]),
                  t("button", {
                    class: "km-btn km-btn-sm",
                    disabled: !e(s).planCurrent.value,
                    onClick: i[9] || (i[9] = (d) => e(s).runScanNow())
                  }, [
                    v(e(k), {
                      icon: "tabler:shield-check",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    i[43] || (i[43] = w(" Run scan ", -1))
                  ], 8, Nl)
                ])) : e(s).scan.value.status === "skipped" ? (n(), a("div", Pl, [
                  v(e(k), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  i[46] || (i[46] = w(" Security scan skipped. Install can continue without spending reviewer tokens. ", -1)),
                  t("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    disabled: !e(s).planCurrent.value,
                    onClick: i[10] || (i[10] = (d) => e(s).runScanNow())
                  }, [
                    v(e(k), {
                      icon: "tabler:shield-check",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    i[45] || (i[45] = w(" Run scan", -1))
                  ], 8, ql)
                ])) : e(s).scan.value.status === "scanning" ? (n(), a("div", Bl, [
                  v(e(k), {
                    icon: "tabler:loader-2",
                    class: "km-i spin km-accent",
                    "aria-hidden": "true"
                  }),
                  t("span", Ol, [
                    w("Scanning " + l(e(s).scan.value.total || "") + " module" + l(e(s).scan.value.total === 1 ? "" : "s") + "… ", 1),
                    i[47] || (i[47] = t("span", { class: "km-dim" }, "this can take a moment", -1))
                  ])
                ])) : e(s).scan.value.status === "clean" ? (n(), a("div", Hl, [
                  v(e(k), {
                    icon: "tabler:shield-check-filled",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  t("p", null, "No issues found across " + l(e(s).scan.value.scanned) + " module" + l(e(s).scan.value.scanned === 1 ? "" : "s") + ".", 1)
                ])) : e(s).scan.value.status === "error" ? (n(), a("div", Fl, [
                  w(" Scan failed: " + l(e(s).scan.value.error) + " ", 1),
                  t("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    disabled: !e(s).planCurrent.value,
                    onClick: i[11] || (i[11] = (d) => e(s).runScanNow())
                  }, [
                    v(e(k), {
                      icon: "tabler:refresh",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    i[48] || (i[48] = w(" Retry", -1))
                  ], 8, jl)
                ])) : e(s).scan.value.status === "unavailable" ? (n(), a("div", zl, [
                  v(e(k), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  i[50] || (i[50] = w(" Security scan unavailable ", -1)),
                  t("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    disabled: !e(s).planCurrent.value,
                    onClick: i[12] || (i[12] = (d) => e(s).runScanNow())
                  }, [
                    v(e(k), {
                      icon: "tabler:refresh",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    i[49] || (i[49] = w(" Retry", -1))
                  ], 8, Kl)
                ])) : (n(), a(J, { key: 6 }, [
                  e(s).scan.value.summary ? (n(), a("p", Gl, l(e(s).scan.value.summary), 1)) : c("", !0),
                  e(s).scan.value.status === "critical" ? (n(), a("div", Wl, [
                    v(e(k), {
                      icon: "tabler:shield-x",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    i[51] || (i[51] = w(" Critical findings must be reviewed and confirmed before install.", -1))
                  ])) : c("", !0),
                  (n(!0), a(J, null, ae(e(s).scan.value.modules, (d) => (n(), a("div", {
                    key: d.module,
                    class: "km-scan-mod"
                  }, [
                    t("div", Yl, [
                      t("span", {
                        class: X(["km-dot", T(d.status)]),
                        "aria-hidden": "true"
                      }, null, 2),
                      t("span", Jl, [
                        w(l(d.module), 1),
                        d.version ? (n(), a(J, { key: 0 }, [
                          w("@" + l(d.version), 1)
                        ], 64)) : c("", !0)
                      ]),
                      i[52] || (i[52] = t("span", { class: "km-grow" }, null, -1)),
                      t("span", Zl, l(d.status), 1)
                    ]),
                    d.summary ? (n(), a("p", Ql, l(d.summary), 1)) : c("", !0),
                    (n(!0), a(J, null, ae(d.findings, (g) => (n(), a("div", {
                      key: g.id,
                      class: X(["km-finding", `km-sev-${Y(g)}`])
                    }, [
                      v(e(k), {
                        icon: e(xn)[g.severity].icon,
                        class: "km-i km-finding-icon",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      t("div", Xl, [
                        t("div", ei, [
                          t("span", ti, l(g.title), 1)
                        ]),
                        g.detail ? (n(), a("div", ni, l(g.detail), 1)) : c("", !0),
                        g.location ? (n(), a("div", si, l(g.location), 1)) : c("", !0),
                        g.severity !== "critical" ? (n(), a("button", {
                          key: 2,
                          class: X(["km-ack", { done: e(s).acknowledged.value.has(g.id) }]),
                          onClick: (y) => e(s).acknowledge(g)
                        }, [
                          v(e(k), {
                            icon: e(s).acknowledged.value.has(g.id) ? "tabler:check" : "tabler:eye",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }, null, 8, ["icon"]),
                          w(" " + l(e(s).acknowledged.value.has(g.id) ? "Acknowledged" : "Acknowledge"), 1)
                        ], 10, ai)) : c("", !0)
                      ])
                    ], 2))), 128)),
                    d.findings.length ? c("", !0) : (n(), a("p", li, "No issues in this module."))
                  ]))), 128)),
                  e(s).scan.value.status === "critical" ? (n(), a("label", ii, [
                    lt(t("input", {
                      type: "checkbox",
                      "onUpdate:modelValue": i[13] || (i[13] = (d) => e(s).criticalConfirmed.value = d)
                    }, null, 512), [
                      [Nn, e(s).criticalConfirmed.value]
                    ]),
                    i[53] || (i[53] = t("span", null, "I understand the critical findings and want to install anyway.", -1))
                  ])) : c("", !0)
                ], 64))
              ], 512), [
                [Ft, e(s).activeSection.value === "scan"]
              ]),
              lt(t("section", oi, [
                t("div", ri, [
                  v(e(k), {
                    icon: "tabler:checklist",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  i[55] || (i[55] = w(" Review & install", -1))
                ]),
                t("div", ui, [
                  t("div", di, [
                    v(e(k), {
                      icon: "tabler:package",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    t("b", null, l(e(s).moduleCount.value), 1),
                    i[56] || (i[56] = t("span", null, "modules", -1))
                  ]),
                  t("div", ci, [
                    v(e(k), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    t("b", null, l(e(s).boundRequirementCount.value) + "/" + l(e(s).requirements.value.length), 1),
                    i[57] || (i[57] = t("span", null, "configured", -1))
                  ]),
                  t("div", mi, [
                    v(e(k), {
                      icon: "tabler:database",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    t("b", null, l(e(s).migrations.value.length), 1),
                    i[58] || (i[58] = t("span", null, "migrations", -1))
                  ]),
                  t("div", vi, [
                    v(e(k), {
                      icon: e(s).scan.value.status === "clean" ? "tabler:shield-check" : e(s).scan.value.status === "critical" ? "tabler:shield-x" : e(s).scan.value.status === "skipped" ? "tabler:shield-off" : "tabler:shield",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    t("b", null, l(e(s).scan.value.status === "scanning" ? "…" : e(s).scan.value.status === "skipped" || e(s).scan.value.status === "idle" ? "—" : e(s).scan.value.findings.length), 1),
                    i[59] || (i[59] = t("span", null, "scan findings", -1))
                  ])
                ]),
                t("div", pi, [
                  i[62] || (i[62] = t("label", { class: "km-label" }, "Migration policy", -1)),
                  v(Cn, {
                    modelValue: e(s).migrationPolicy.value,
                    "onUpdate:modelValue": i[14] || (i[14] = (d) => e(s).migrationPolicy.value = d),
                    items: e(s).migrationOptions.value.map((d) => ({ id: d.value, title: d.label })),
                    "aria-label": "Migration policy"
                  }, null, 8, ["modelValue", "items"]),
                  e(s).requiredSetup.value ? (n(), a("p", ki, "This module requires setup. Installation completes after migrations and setup pass verification.")) : c("", !0),
                  e(s).migrations.value.length ? (n(), a("div", fi, [
                    (n(!0), a(J, null, ae(e(s).migrations.value, (d) => (n(), a("div", {
                      key: d.id,
                      class: "km-mig-row"
                    }, [
                      v(e(k), {
                        icon: "tabler:database-import",
                        class: "km-i-xs km-dim",
                        "aria-hidden": "true"
                      }),
                      t("span", gi, l(d.id), 1),
                      i[60] || (i[60] = t("span", { class: "km-grow" }, null, -1)),
                      t("span", bi, l(d.status), 1)
                    ]))), 128))
                  ])) : c("", !0),
                  t("p", hi, [
                    v(e(k), {
                      icon: "tabler:shield-lock",
                      class: "km-i-xs",
                      "aria-hidden": "true"
                    }),
                    i[61] || (i[61] = w(" Changes are transactional — if any step fails, the registry, lock and migrations are rolled back.", -1))
                  ])
                ]),
                t("details", yi, [
                  i[65] || (i[65] = t("summary", null, "Advanced", -1)),
                  t("div", _i, [
                    t("div", wi, [
                      i[63] || (i[63] = t("span", null, "Installs as", -1)),
                      t("b", $i, l(e(s).destinationId.value || "—"), 1)
                    ]),
                    t("div", Si, [
                      i[64] || (i[64] = t("span", null, "Version", -1)),
                      t("b", Ci, l(e(s).versionMode.value === "pin" ? e(s).version.value || "latest" : "≥ " + (e(s).version.value || "0.0.0")), 1)
                    ])
                  ])
                ]),
                e(s).result.value ? (n(), a("div", xi, [
                  t("div", Ii, l(e(s).result.value.dry_run ? "Dry-run preview" : "Applied"), 1),
                  e(s).result.value.dry_run ? (n(), a(J, { key: 0 }, [
                    i[66] || (i[66] = t("div", { class: "km-dim" }, "No changes were applied.", -1)),
                    e(s).resultExecution.value.length ? (n(), a("div", Ri, l(e(s).resultExecution.value.length) + " planned step" + l(e(s).resultExecution.value.length === 1 ? "" : "s") + " below.", 1)) : (n(), a("div", Mi, "Keeper accepted the dry-run but returned no execution details."))
                  ], 64)) : (n(), a(J, { key: 1 }, [
                    e(s).result.value.apply?.stage || e(s).result.value.operation_id ? (n(), a("div", Ai, [
                      e(s).result.value.apply?.stage ? (n(), a(J, { key: 0 }, [
                        w("stage: " + l(e(s).result.value.apply.stage), 1)
                      ], 64)) : c("", !0),
                      e(s).result.value.apply?.stage && e(s).result.value.operation_id ? (n(), a(J, { key: 1 }, [
                        w(" · ")
                      ], 64)) : c("", !0),
                      e(s).result.value.operation_id ? (n(), a(J, { key: 2 }, [
                        i[67] || (i[67] = w("op: ", -1)),
                        t("code", Ui, l(e(s).result.value.operation_id), 1)
                      ], 64)) : c("", !0)
                    ])) : (n(), a("div", Ti, "Changes applied successfully.")),
                    e(s).result.value.apply?.message ? (n(), a("div", Ei, l(e(s).result.value.apply.message), 1)) : c("", !0)
                  ], 64))
                ])) : c("", !0),
                e(s).resultExecution.value.length ? (n(), a("div", Li, [
                  i[68] || (i[68] = t("div", { class: "km-panel-title" }, "Execution ledger", -1)),
                  (n(!0), a(J, null, ae(e(s).resultExecution.value, (d, g) => (n(), a("div", {
                    key: `${d.step}-${g}`,
                    class: X(["km-ledger-row", B(d.status)])
                  }, [
                    t("span", Vi, l(g + 1), 1),
                    t("span", Di, l(e(s).executionStepLabel(d)), 1),
                    t("span", Ni, l(d.status), 1),
                    d.message ? (n(), a("span", Pi, l(d.message), 1)) : c("", !0)
                  ], 2))), 128))
                ])) : c("", !0),
                e(s).resultError.value ? (n(), a("div", qi, [
                  e(s).resultCode.value ? (n(), a("span", Bi, l(e(s).resultCode.value), 1)) : c("", !0),
                  w(l(e(s).resultError.value), 1)
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
}), Yi = { class: "d-hero" }, Ji = { class: "d-hero-icon" }, Zi = { class: "km-grow km-min0" }, Qi = { class: "km-row-wrap" }, Xi = { class: "d-hero-name" }, eo = { class: "d-ver" }, to = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, no = {
  key: 1,
  class: "badge-installed kx-tag-caps"
}, so = {
  key: 2,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, ao = {
  key: 3,
  class: "badge-warn kx-tag-caps"
}, lo = { class: "d-hero-org" }, io = {
  key: 0,
  class: "d-hero-desc"
}, oo = { class: "d-hero-actions" }, ro = ["title"], uo = ["title"], co = ["href"], mo = ["href"], vo = { class: "d-grid" }, po = { class: "d-side" }, ko = { class: "d-block" }, fo = { class: "d-row" }, go = { class: "d-row-v" }, bo = {
  key: 0,
  class: "d-row"
}, ho = { class: "d-row-v" }, yo = {
  key: 1,
  class: "d-row"
}, _o = ["title"], wo = {
  key: 2,
  class: "d-row"
}, $o = { class: "d-row-v" }, So = {
  key: 3,
  class: "d-row"
}, Co = {
  key: 4,
  class: "d-row"
}, xo = { class: "d-row-v" }, Io = {
  key: 5,
  class: "d-row"
}, Ro = { class: "d-row-v" }, Mo = {
  key: 6,
  class: "d-row"
}, Ao = { class: "d-row-v" }, Uo = {
  key: 0,
  class: "d-block"
}, To = { class: "km-pills" }, Eo = {
  key: 1,
  class: "d-block"
}, Lo = { class: "km-dep-list" }, Vo = { class: "km-trunc" }, Do = { class: "km-dim" }, No = {
  key: 2,
  class: "d-block"
}, Po = { class: "km-pills" }, qo = { class: "d-main" }, Bo = { class: "d-tabs" }, Oo = ["disabled"], Ho = {
  key: 0,
  class: "km-dim"
}, Fo = { class: "d-tab-body" }, jo = {
  key: 0,
  class: "km-loading"
}, zo = {
  key: 0,
  class: "d-empty"
}, Ko = {
  key: 1,
  class: "rm"
}, Go = {
  key: 2,
  class: "km-stack-lg"
}, Wo = { key: 0 }, Yo = { class: "d-block-title d-accent" }, Jo = { class: "km-dim" }, Zo = { class: "km-2col" }, Qo = { class: "d-field-i" }, Xo = { class: "km-grow km-min0" }, er = { class: "d-cfg-name" }, tr = {
  key: 0,
  class: "d-cfg-desc"
}, nr = { key: 1 }, sr = { class: "d-block-title" }, ar = { class: "km-2col" }, lr = { class: "d-field-i d-field-i-req" }, ir = { class: "km-grow km-min0" }, or = { class: "d-cfg-name" }, rr = {
  key: 0,
  class: "d-cfg-desc"
}, ur = { class: "d-field-i d-field-i-req" }, dr = { class: "km-grow km-min0" }, cr = { class: "d-cfg-name" }, mr = {
  key: 0,
  class: "d-cfg-desc"
}, vr = {
  key: 1,
  class: "d-cfg-desc km-mono"
}, pr = { class: "d-block-title" }, kr = { key: 0 }, fr = { class: "d-sub" }, gr = { class: "km-pills" }, br = {
  key: 1,
  class: "km-muted"
}, hr = {
  key: 1,
  class: "km-muted"
}, yr = {
  key: 2,
  class: "km-stack"
}, _r = { class: "km-group-head" }, wr = { class: "km-dim" }, $r = { class: "km-2col" }, Sr = { class: "d-entry-name" }, Cr = { class: "d-entry-id" }, xr = {
  key: 0,
  class: "km-muted"
}, Ir = {
  key: 1,
  class: "d-vers"
}, Rr = { class: "d-ver-tag" }, Mr = {
  key: 0,
  class: "km-dim"
}, Ar = {
  key: 1,
  class: "km-dim km-inline"
}, Ur = {
  key: 2,
  class: "km-dim"
}, Tr = /* @__PURE__ */ Bt({
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
      detailUninstall: V,
      detailInstall: q,
      closeDetail: D,
      versionMeta: H,
      detailTab: z,
      detailReadme: N,
      detailLoading: Y,
      detailVersions: T,
      envVars: K,
      requirements: B,
      entryIcon: I,
      entryName: F,
      entryDesc: i,
      detailGroups: Q
    } = $.page, d = P(() => $.page.selected.value);
    return (g, y) => {
      const re = Mn("wc-render-markdown");
      return n(), a("div", {
        class: "d-page",
        style: Ut({ "--accent": e(r) ? e(Wt)(e(r)) : "var(--p-primary-color)" })
      }, [
        t("button", {
          class: "d-back",
          onClick: y[0] || (y[0] = //@ts-ignore
          (...m) => e(D) && e(D)(...m))
        }, [
          v(e(k), {
            icon: "tabler:arrow-left",
            class: "km-i-sm",
            "aria-hidden": "true"
          }),
          y[7] || (y[7] = w(" Back to modules ", -1))
        ]),
        t("header", Yi, [
          t("div", Ji, [
            v(e(k), {
              icon: e(r) ? e(qt)(e(r)) : "tabler:package",
              class: "km-i-lg",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          t("div", Zi, [
            t("div", Qi, [
              t("h2", Xi, l(d.value.label), 1),
              t("span", eo, l(d.value.version || "—"), 1),
              e(jt)(e(r)) ? (n(), a("span", to, "app")) : c("", !0),
              d.value.installed ? (n(), a("span", no, "installed")) : c("", !0),
              e(L) ? (n(), a("span", so, [
                v(e(k), {
                  icon: "tabler:lock",
                  class: "km-i-xs",
                  "aria-hidden": "true"
                }),
                y[8] || (y[8] = w(" private", -1))
              ])) : c("", !0),
              e(r)?.deprecated ? (n(), a("span", ao, "deprecated")) : c("", !0)
            ]),
            t("div", lo, l(d.value.component), 1),
            d.value.description ? (n(), a("p", io, l(d.value.description), 1)) : c("", !0),
            t("div", oo, [
              d.value.installed ? (n(), a(J, { key: 0 }, [
                e(s) ? (n(), a("button", {
                  key: 0,
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  onClick: y[1] || (y[1] = //@ts-ignore
                  (...m) => e(M) && e(M)(...m))
                }, [
                  v(e(k), {
                    icon: "tabler:refresh-dot",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  y[9] || (y[9] = w(" Update ", -1))
                ])) : (n(), a("button", {
                  key: 1,
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: "",
                  title: e(G) || void 0
                }, [
                  v(e(k), {
                    icon: "tabler:refresh-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  y[10] || (y[10] = w(" Update ", -1))
                ], 8, ro)),
                e(S) ? (n(), a("button", {
                  key: 2,
                  class: "km-btn km-btn-text km-btn-danger km-btn-sm",
                  onClick: y[2] || (y[2] = //@ts-ignore
                  (...m) => e(V) && e(V)(...m))
                }, [
                  v(e(k), {
                    icon: "tabler:trash",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  y[11] || (y[11] = w(" Uninstall ", -1))
                ])) : e(E) ? (n(), a("button", {
                  key: 3,
                  class: "km-btn km-btn-text km-btn-danger km-btn-sm",
                  disabled: "",
                  title: e(E)
                }, [
                  v(e(k), {
                    icon: "tabler:trash-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  y[12] || (y[12] = w(" Uninstall ", -1))
                ], 8, uo)) : c("", !0)
              ], 64)) : (n(), a("button", {
                key: 1,
                class: "km-btn km-btn-sm",
                onClick: y[3] || (y[3] = //@ts-ignore
                (...m) => e(q) && e(q)(...m))
              }, [
                v(e(k), {
                  icon: "tabler:download",
                  class: "km-i",
                  "aria-hidden": "true"
                }),
                y[13] || (y[13] = w(" Install ", -1))
              ])),
              e(r)?.repository ? (n(), a("a", {
                key: 2,
                href: String(e(r).repository),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                v(e(k), {
                  icon: "tabler:brand-github",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                y[14] || (y[14] = w(" Repository", -1))
              ], 8, co)) : c("", !0),
              e(r)?.homepage ? (n(), a("a", {
                key: 3,
                href: String(e(r).homepage),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                v(e(k), {
                  icon: "tabler:home",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                y[15] || (y[15] = w(" Homepage", -1))
              ], 8, mo)) : c("", !0)
            ])
          ])
        ]),
        t("div", vo, [
          t("aside", po, [
            t("section", ko, [
              t("div", fo, [
                v(e(k), {
                  icon: "tabler:download",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                y[16] || (y[16] = t("span", { class: "d-row-k" }, "Downloads", -1)),
                t("span", go, l(e(Yt)(e(r)?.total_downloads)), 1)
              ]),
              e(r)?.favorites_count ? (n(), a("div", bo, [
                v(e(k), {
                  icon: "tabler:star",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                y[17] || (y[17] = t("span", { class: "d-row-k" }, "Favorites", -1)),
                t("span", ho, l(e(r).favorites_count), 1)
              ])) : c("", !0),
              e(r)?.license ? (n(), a("div", yo, [
                v(e(k), {
                  icon: "tabler:license",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                y[18] || (y[18] = t("span", { class: "d-row-k" }, "License", -1)),
                t("span", {
                  class: "d-row-v",
                  title: e(r).license
                }, l(e(sn)(e(r).license)), 9, _o)
              ])) : c("", !0),
              e(r)?.type ? (n(), a("div", wo, [
                v(e(k), {
                  icon: "tabler:category",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                y[19] || (y[19] = t("span", { class: "d-row-k" }, "Type", -1)),
                t("span", $o, l(e(r).type), 1)
              ])) : c("", !0),
              e(L) ? (n(), a("div", So, [
                v(e(k), {
                  icon: "tabler:lock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                y[20] || (y[20] = t("span", { class: "d-row-k" }, "Visibility", -1)),
                y[21] || (y[21] = t("span", { class: "d-row-v" }, "Private", -1))
              ])) : c("", !0),
              e(r)?.update_time ? (n(), a("div", Co, [
                v(e(k), {
                  icon: "tabler:clock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                y[22] || (y[22] = t("span", { class: "d-row-k" }, "Updated", -1)),
                t("span", xo, l(e(an)(e(r).update_time, { maxUnit: "year" })), 1)
              ])) : c("", !0),
              e(H)?.entry_count ? (n(), a("div", Io, [
                v(e(k), {
                  icon: "tabler:list-numbers",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                y[23] || (y[23] = t("span", { class: "d-row-k" }, "Entries", -1)),
                t("span", Ro, l(e(H).entry_count), 1)
              ])) : c("", !0),
              e(H)?.size_bytes ? (n(), a("div", Mo, [
                v(e(k), {
                  icon: "tabler:weight",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                y[24] || (y[24] = t("span", { class: "d-row-k" }, "Size", -1)),
                t("span", Ao, l(e(zt)(e(H).size_bytes)), 1)
              ])) : c("", !0)
            ]),
            (e(r)?.keywords || []).length ? (n(), a("section", Uo, [
              y[25] || (y[25] = t("div", { class: "d-block-title" }, "Keywords", -1)),
              t("div", To, [
                (n(!0), a(J, null, ae(e(r).keywords, (m) => (n(), a("span", {
                  key: m,
                  class: "provides-pill"
                }, l(m), 1))), 128))
              ])
            ])) : c("", !0),
            (e(H)?.dependencies || []).length ? (n(), a("section", Eo, [
              y[26] || (y[26] = t("div", { class: "d-block-title" }, "Dependencies", -1)),
              t("div", Lo, [
                (n(!0), a(J, null, ae(e(H).dependencies, (m, h) => (n(), a("div", {
                  key: h,
                  class: "km-dep"
                }, [
                  t("span", Vo, l(m.org) + "/" + l(m.name), 1),
                  t("span", Do, l(m.version_constraint), 1)
                ]))), 128))
              ])
            ])) : c("", !0),
            (e(H)?.lua_modules || []).length ? (n(), a("section", No, [
              y[27] || (y[27] = t("div", { class: "d-block-title" }, "Lua modules", -1)),
              t("div", Po, [
                (n(!0), a(J, null, ae(e(H).lua_modules, (m) => (n(), a("span", {
                  key: m,
                  class: "provides-pill"
                }, l(m), 1))), 128))
              ])
            ])) : c("", !0)
          ]),
          t("main", qo, [
            t("div", Bo, [
              t("button", {
                class: X(["d-tab", { active: e(z) === "readme" }]),
                disabled: !e(N) && !e(Y),
                onClick: y[4] || (y[4] = (m) => z.value = "readme")
              }, "Readme", 10, Oo),
              t("button", {
                class: X(["d-tab", { active: e(z) === "overview" }]),
                onClick: y[5] || (y[5] = (m) => z.value = "overview")
              }, "Overview", 2),
              t("button", {
                class: X(["d-tab", { active: e(z) === "versions" }]),
                onClick: y[6] || (y[6] = (m) => z.value = "versions")
              }, [
                y[28] || (y[28] = w("Versions ", -1)),
                e(T).length ? (n(), a("span", Ho, l(e(T).length), 1)) : c("", !0)
              ], 2)
            ]),
            t("div", Fo, [
              e(Y) ? (n(), a("div", jo, [
                v(e(k), {
                  icon: "tabler:loader-2",
                  class: "km-i spin",
                  "aria-hidden": "true"
                }),
                y[29] || (y[29] = w(" Loading… ", -1))
              ])) : e(z) === "readme" ? (n(), a(J, { key: 1 }, [
                e(N) ? (n(), a("article", Ko, [
                  v(re, { source: e(N) }, null, 8, ["source"])
                ])) : (n(), a("div", zo, [
                  v(e(k), {
                    icon: "tabler:file-off",
                    class: "km-i-xl km-dim",
                    "aria-hidden": "true"
                  }),
                  y[30] || (y[30] = t("p", { class: "km-mt" }, "No README provided.", -1))
                ]))
              ], 64)) : e(z) === "overview" ? (n(), a("div", Go, [
                e(K).length ? (n(), a("section", Wo, [
                  t("div", Yo, [
                    v(e(k), {
                      icon: "tabler:settings-2",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    y[31] || (y[31] = w(" Environment ", -1)),
                    t("span", Jo, l(e(K).length), 1)
                  ]),
                  y[32] || (y[32] = t("p", { class: "d-sub" }, "Variables this module reads — set them in your environment.", -1)),
                  t("div", Zo, [
                    (n(!0), a(J, null, ae(e(K), (m) => (n(), a("div", {
                      key: m.id,
                      class: "d-field d-field-env"
                    }, [
                      t("span", Qo, [
                        v(e(k), {
                          icon: e(I)(m, "tabler:variable"),
                          class: "km-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"])
                      ]),
                      t("span", Xo, [
                        t("span", er, l(e(F)(m)), 1),
                        e(i)(m) ? (n(), a("span", tr, l(e(i)(m)), 1)) : c("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : c("", !0),
                e(B).length || (e(H)?.requirements || []).length ? (n(), a("section", nr, [
                  t("div", sr, [
                    v(e(k), {
                      icon: "tabler:plug-connected",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    y[33] || (y[33] = w(" Requires", -1))
                  ]),
                  y[34] || (y[34] = t("p", { class: "d-sub" }, "Host resources this module is wired to at install.", -1)),
                  t("div", ar, [
                    e(B).length ? (n(!0), a(J, { key: 0 }, ae(e(B), (m) => (n(), a("div", {
                      key: m.id,
                      class: "d-field d-field-req"
                    }, [
                      t("span", lr, [
                        v(e(k), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      t("span", ir, [
                        t("span", or, l(e(F)(m)), 1),
                        e(i)(m) ? (n(), a("span", rr, l(e(i)(m)), 1)) : c("", !0)
                      ])
                    ]))), 128)) : (n(!0), a(J, { key: 1 }, ae(e(H).requirements, (m, h) => (n(), a("div", {
                      key: h,
                      class: "d-field d-field-req"
                    }, [
                      t("span", ur, [
                        v(e(k), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      t("span", dr, [
                        t("span", cr, l(m.name), 1),
                        m.description ? (n(), a("span", mr, l(m.description), 1)) : c("", !0),
                        m.default ? (n(), a("span", vr, "default: " + l(m.default), 1)) : c("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : c("", !0),
                t("section", null, [
                  t("div", pr, [
                    v(e(k), {
                      icon: "tabler:package",
                      class: "km-i-sm d-accent-i",
                      "aria-hidden": "true"
                    }),
                    y[35] || (y[35] = w(" Provides", -1))
                  ]),
                  d.value.installed ? e(Q).length ? (n(), a("div", yr, [
                    (n(!0), a(J, null, ae(e(Q), (m) => (n(), a("div", {
                      key: m.key
                    }, [
                      t("div", _r, [
                        v(e(k), {
                          icon: m.icon,
                          class: "km-i-sm d-accent-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        w(" " + l(m.label) + " ", 1),
                        t("span", wr, l(m.items.length), 1)
                      ]),
                      t("div", $r, [
                        (n(!0), a(J, null, ae(m.items, (h) => (n(), a("div", {
                          key: h.id,
                          class: "d-entry"
                        }, [
                          t("div", Sr, l(h.meta && h.meta.title || e(F)(h)), 1),
                          t("div", Cr, l(h.id), 1)
                        ]))), 128))
                      ])
                    ]))), 128))
                  ])) : (n(), a("p", hr, "No registry entries.")) : (n(), a("div", kr, [
                    (e(H)?.entry_kinds || []).length ? (n(), a(J, { key: 0 }, [
                      t("p", fr, "Publishes " + l(e(H).entry_count || e(H).entry_kinds.length) + " entries; per-entry detail resolves after install.", 1),
                      t("div", gr, [
                        (n(!0), a(J, null, ae(e(H).entry_kinds, (m) => (n(), a("span", {
                          key: m,
                          class: "provides-pill"
                        }, l(m), 1))), 128))
                      ])
                    ], 64)) : (n(), a("p", br, [...y[36] || (y[36] = [
                      w("See the ", -1),
                      t("strong", null, "Readme", -1),
                      w(" tab for details.", -1)
                    ])]))
                  ]))
                ])
              ])) : (n(), a(J, { key: 3 }, [
                e(T).length ? (n(), a("div", Ir, [
                  (n(!0), a(J, null, ae(e(T), (m) => (n(), a("div", {
                    key: m.version,
                    class: "d-ver-row"
                  }, [
                    t("span", Rr, l(m.version), 1),
                    m.create_time ? (n(), a("span", Mr, l(e(an)(m.create_time, { maxUnit: "year" })), 1)) : c("", !0),
                    y[37] || (y[37] = t("span", { class: "km-grow" }, null, -1)),
                    m.download_count ? (n(), a("span", Ar, [
                      v(e(k), {
                        icon: "tabler:download",
                        class: "km-i-xs",
                        "aria-hidden": "true"
                      }),
                      w(" " + l(e(Yt)(m.download_count)), 1)
                    ])) : c("", !0),
                    m.size_bytes ? (n(), a("span", Ur, l(e(zt)(m.size_bytes)), 1)) : c("", !0)
                  ]))), 128))
                ])) : (n(), a("p", xr, "No published versions."))
              ], 64))
            ])
          ])
        ])
      ], 4);
    };
  }
}), Er = { class: "km" }, Lr = {
  key: 1,
  class: "km-loading km-center km-initial-loading",
  role: "status",
  "aria-live": "polite"
}, Vr = {
  key: 2,
  class: "km-denied"
}, Dr = { class: "km-denied-box" }, Nr = {
  key: 3,
  class: "km-scroll"
}, Pr = {
  key: 1,
  class: "km-list"
}, qr = { class: "km-sec-bar km-sec-bar-toolbar" }, Br = { class: "km-controls" }, Or = ["disabled"], Hr = ["disabled"], Fr = ["disabled"], jr = {
  key: 0,
  class: "km-btn-count"
}, zr = ["disabled"], Kr = { class: "km-hub-auth-panel" }, Gr = { class: "km-hub-auth-row" }, Wr = {
  key: 0,
  class: "km-hub-auth-meta"
}, Yr = { class: "km-hub-auth-meta" }, Jr = {
  key: 1,
  class: "km-hub-auth-orgs"
}, Zr = { class: "km-hub-auth-org-name" }, Qr = {
  key: 0,
  class: "km-hub-auth-org-role"
}, Xr = { class: "km-hub-auth-hint" }, eu = ["href"], tu = { class: "km-hub-auth-actions" }, nu = ["disabled"], su = {
  key: 0,
  class: "km-msg km-msg-err"
}, au = {
  key: 1,
  class: "km-msg"
}, lu = {
  key: 2,
  class: "km-msg km-msg-err"
}, iu = {
  key: 3,
  class: "km-loading km-center"
}, ou = { key: 0 }, ru = { class: "hub-section-head" }, uu = { class: "feat-grid" }, du = ["onClick"], cu = { class: "feat-icon" }, mu = { class: "feat-body" }, vu = { class: "km-row-wrap" }, pu = { class: "feat-name" }, ku = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, fu = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, gu = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, bu = { class: "feat-org" }, hu = {
  key: 0,
  class: "feat-desc"
}, yu = { class: "feat-meta" }, _u = { class: "meta-pill" }, wu = { class: "meta-pill" }, $u = ["title"], Su = { class: "hub-section-head" }, Cu = { class: "hub-section-title" }, xu = { class: "hub-section-sub" }, Iu = { class: "mod-grid" }, Ru = ["onClick"], Mu = { class: "mod-icon" }, Au = { class: "mod-body" }, Uu = { class: "km-row-wrap" }, Tu = { class: "mod-name" }, Eu = { class: "mod-version" }, Lu = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Vu = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Du = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, Nu = { class: "mod-org" }, Pu = {
  key: 0,
  class: "mod-desc"
}, qu = { class: "mod-foot" }, Bu = { class: "foot-stat" }, Ou = {
  key: 0,
  class: "foot-stat"
}, Hu = ["title"], Fu = {
  key: 2,
  class: "foot-stat km-dim km-ml-auto"
}, ju = {
  key: 5,
  class: "km-empty"
}, zu = { class: "km-muted" }, Ku = { class: "km-mono" }, Gu = {
  key: 6,
  class: "km-empty"
}, Wu = {
  key: 7,
  class: "km-empty"
}, Yu = { class: "km-muted" }, Ju = { class: "km-mono" }, Zu = {
  key: 0,
  class: "km-installed"
}, Qu = ["aria-expanded"], Xu = { class: "km-sub" }, ed = {
  key: 0,
  class: "km-update-count"
}, td = {
  key: 1,
  class: "km-update-count"
}, nd = {
  key: 0,
  class: "km-msg km-msg-err km-mb"
}, sd = {
  key: 1,
  class: "inst-toolbar"
}, ad = {
  key: 2,
  class: "inst-list"
}, ld = ["onClick"], id = { class: "inst-icon" }, od = { class: "km-grow km-min0" }, rd = { class: "km-row-tight" }, ud = { class: "inst-name" }, dd = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, cd = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, md = {
  key: 2,
  class: "km-chip"
}, vd = ["title"], pd = { class: "inst-id" }, kd = {
  key: 0,
  class: "km-dim"
}, fd = {
  key: 0,
  class: "inst-update-msg"
}, gd = { class: "inst-ver" }, bd = { class: "inst-migs" }, hd = { class: "inst-actions" }, yd = ["disabled", "aria-label", "onClick"], _d = ["disabled", "aria-label", "onClick"], wd = ["title", "aria-label"], $d = ["aria-label", "onClick"], Sd = ["title", "aria-label"], Cd = {
  key: 3,
  class: "km-empty inst-empty"
}, xd = { class: "km-modal-body" }, Id = { class: "km-uninstall-target" }, Rd = { class: "km-mono" }, Md = { class: "km-dim" }, Ad = {
  key: 0,
  class: "km-msg km-msg-err"
}, Ud = {
  key: 0,
  class: "km-code"
}, Td = {
  key: 1,
  class: "km-mt"
}, Ed = {
  key: 1,
  class: "km-msg km-msg-info"
}, Ld = {
  key: 2,
  class: "km-running"
}, Vd = {
  key: 3,
  class: "km-uninstall-preview"
}, Dd = {
  key: 0,
  class: "km-msg"
}, Nd = {
  key: 1,
  class: "km-preview-block"
}, Pd = { class: "km-mono" }, qd = { class: "km-dim" }, Bd = {
  key: 2,
  class: "km-preview-block"
}, Od = { class: "km-mono" }, Hd = { class: "km-dim" }, Fd = {
  key: 3,
  class: "km-preview-block"
}, jd = { class: "km-mono" }, zd = { class: "km-dim" }, Kd = {
  key: 4,
  class: "km-ledger"
}, Gd = { class: "km-ledger-step" }, Wd = { class: "km-grow" }, Yd = { class: "km-chip" }, Jd = {
  key: 0,
  class: "km-ledger-msg"
}, Zd = {
  key: 5,
  class: "km-running"
}, Qd = { class: "km-grow km-running-label" }, Xd = { class: "km-dim" }, ec = ["disabled"], tc = ["disabled"], nc = ["disabled", "title"], sc = /* @__PURE__ */ Bt({
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
      hubStatus: V,
      hubToken: q,
      showTokenPanel: D,
      hubConnecting: H,
      hubError: z,
      hubOrgs: N,
      hubIdentity: Y,
      hubTokenStored: T,
      hubTokenExpired: K,
      hubTokenIcon: B,
      hubTokenButtonLabel: I,
      hubExpiry: F,
      saveHubToken: i,
      clearHubToken: Q,
      selected: d,
      selectedModule: g,
      detailReadme: y,
      detailLoading: re,
      detailTab: m,
      detailVersions: h,
      envVars: _,
      requirements: R,
      detailGroups: Z,
      versionMeta: ee,
      selectedCanUpdate: ne,
      selectedUpdateDisabledReason: de,
      selectedCanUninstall: Ke,
      selectedIsPrivate: ke,
      selectedUninstallBlockedReason: Ve,
      entryName: Me,
      entryDesc: ot,
      entryIcon: De,
      openDetail: rt,
      closeDetail: yt,
      detailInstall: _t,
      detailUpdate: ge,
      detailUninstall: Et,
      installed: Ge,
      installedFilter: Ne,
      installedKindFilter: ut,
      installedTotal: We,
      updateScanLoading: Pe,
      updateAllRunning: Ae,
      availableUpdates: Ie,
      installedLoading: be,
      installedError: qe,
      installedOpen: Be,
      catalog: wt,
      catalogLoading: Ye,
      catalogError: Oe,
      catalogInstalledTotal: Ue,
      visibleCatalogInstalled: $t,
      browseFilter: p,
      sortBy: b,
      availableItems: x,
      featured: U,
      sortedItems: j,
      visibleInstalled: W,
      catalogItemFor: le,
      installedAccent: pe,
      installedIcon: Je,
      installedIsRoot: St,
      installedIsPrivate: oe,
      installedRole: Re,
      installedUsedBy: Ze,
      installedCanUpdate: dt,
      installedUpdateDisabledReason: ct,
      installedCanUninstall: me,
      installedUninstallDisabledReason: Se,
      installedMigrationSummary: Qe,
      updateInfoForDep: He,
      updateStatusLabel: Ot,
      updateStatusIcon: Ct,
      updateStatusBusy: kt,
      scanInstalledUpdates: Ce,
      updateInstalledDependency: Te,
      updateAllAvailable: Xe,
      refreshAll: et,
      installTarget: fe,
      closeInstallDialog: tt,
      onInstallChanged: Ht,
      openUpdateDialog: ft,
      uninstallDialogOpen: nt,
      uninstallDep: st,
      uninstallPolicy: Fe,
      uninstallRunning: ve,
      uninstallPreviewLoading: je,
      uninstallPreview: ce,
      uninstallExecution: Lt,
      uninstallCode: he,
      uninstallError: gt,
      uninstallRequiredBy: xt,
      uninstallBlockedReason: bt,
      uninstallActionBlockedReason: ye,
      uninstallPhase: It,
      uninstallElapsedSec: Rt,
      openUninstallDialog: Vt,
      previewUninstall: at,
      executionStepLabel: Dt,
      runUninstall: mt
    } = $, vt = A(null);
    return (_e, f) => (n(), a("div", Er, [
      e(E) ? (n(), a("div", {
        key: 0,
        class: X(["km-banner", e(E).kind === "ok" ? "km-banner-ok" : "km-banner-err"])
      }, l(e(E).message), 3)) : c("", !0),
      e(G) ? (n(), a("div", Lr, [
        v(e(k), {
          icon: "tabler:loader-2",
          class: "km-i spin",
          "aria-hidden": "true"
        }),
        f[19] || (f[19] = w(" Loading modules… ", -1))
      ])) : e(S) ? (n(), a("div", Vr, [
        t("div", Dr, [
          v(e(k), {
            icon: "tabler:lock",
            class: "km-denied-icon",
            "aria-hidden": "true"
          }),
          f[20] || (f[20] = t("p", { class: "km-denied-title" }, "Admins only", -1)),
          f[21] || (f[21] = t("p", { class: "km-denied-sub" }, [
            w("You need the "),
            t("code", { class: "km-mono" }, "app.security:admin"),
            w(" scope to manage modules.")
          ], -1))
        ])
      ])) : (n(), a("div", Nr, [
        e(d) ? (n(), Nt(Tr, {
          key: 0,
          page: e($)
        }, null, 8, ["page"])) : (n(), a("div", Pr, [
          t("section", null, [
            t("div", qr, [
              t("div", Br, [
                t("button", {
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: e(be) || e(Ye),
                  onClick: f[0] || (f[0] = //@ts-ignore
                  (...u) => e(et) && e(et)(...u))
                }, [
                  v(e(k), {
                    icon: e(be) || e(Ye) ? "tabler:loader-2" : "tabler:refresh",
                    class: X(["km-i", (e(be) || e(Ye)) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  f[22] || (f[22] = w(" Refresh ", -1))
                ], 8, Or),
                t("button", {
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: e(Pe) || e(Ae) || e(be) || e(We) === 0,
                  onClick: f[1] || (f[1] = //@ts-ignore
                  (...u) => e(Ce) && e(Ce)(...u))
                }, [
                  v(e(k), {
                    icon: e(Pe) ? "tabler:loader-2" : "tabler:refresh-dot",
                    class: X(["km-i", e(Pe) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  f[23] || (f[23] = w(" Scan updates ", -1))
                ], 8, Hr),
                t("button", {
                  class: "km-btn km-btn-sm",
                  disabled: e(Ae) || e(Pe) || e(Ie).length === 0,
                  onClick: f[2] || (f[2] = //@ts-ignore
                  (...u) => e(Xe) && e(Xe)(...u))
                }, [
                  v(e(k), {
                    icon: e(Ae) ? "tabler:loader-2" : "tabler:download",
                    class: X(["km-i", e(Ae) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  f[24] || (f[24] = w(" Update all ", -1)),
                  e(Ie).length ? (n(), a("span", jr, l(e(Ie).length), 1)) : c("", !0)
                ], 8, Fr),
                lt(t("input", {
                  "onUpdate:modelValue": f[3] || (f[3] = (u) => ht(p) ? p.value = u : null),
                  class: "km-input km-filter",
                  placeholder: "Filter…"
                }, null, 512), [
                  [Qt, e(p)]
                ]),
                v(e(un), {
                  modelValue: e(b),
                  "onUpdate:modelValue": f[4] || (f[4] = (u) => ht(b) ? b.value = u : null),
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
                  ref: vt,
                  class: "km-hub-auth"
                }, [
                  t("button", {
                    class: X(["km-btn km-btn-sm", e(M) ? "km-btn-secondary km-btn-outlined" : e(K) ? "km-btn-warning km-btn-outlined" : ""]),
                    disabled: e(H),
                    onClick: f[5] || (f[5] = (u) => D.value = !e(D))
                  }, [
                    v(e(k), {
                      icon: e(B),
                      class: "km-i",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    w(" " + l(e(I)) + " ", 1),
                    v(e(k), {
                      icon: "tabler:chevron-down",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    })
                  ], 10, zr),
                  v(Ln, {
                    open: e(D),
                    "onUpdate:open": f[10] || (f[10] = (u) => ht(D) ? D.value = u : null),
                    anchor: vt.value,
                    align: "right",
                    width: 300
                  }, {
                    default: pt(() => [
                      t("div", Kr, [
                        f[28] || (f[28] = t("div", { class: "km-hub-auth-title" }, "Wippy Hub token", -1)),
                        e(T) ? (n(), a("div", {
                          key: 0,
                          class: X(["km-hub-auth-active", e(K) && "is-expired"])
                        }, [
                          t("div", Gr, [
                            v(e(k), {
                              icon: e(K) ? "tabler:alert-triangle" : "tabler:circle-check-filled",
                              class: X(["km-i-sm", e(K) ? "km-hub-warn" : "km-hub-ok"]),
                              "aria-hidden": "true"
                            }, null, 8, ["icon", "class"]),
                            t("span", null, [
                              w(l(e(K) ? "Token expired" : "Token active"), 1),
                              e(Y) ? (n(), a(J, { key: 0 }, [
                                f[25] || (f[25] = w(" — ", -1)),
                                t("strong", null, l(e(Y)), 1)
                              ], 64)) : c("", !0)
                            ])
                          ]),
                          e(V)?.registry ? (n(), a("div", Wr, l(e(V).registry), 1)) : c("", !0),
                          t("div", Yr, [
                            e(V)?.scope ? (n(), a(J, { key: 0 }, [
                              w("scope: " + l(e(V).scope), 1)
                            ], 64)) : c("", !0),
                            e(F) ? (n(), a(J, { key: 1 }, [
                              w(" · expires " + l(e(F)), 1)
                            ], 64)) : c("", !0)
                          ]),
                          e(N).length ? (n(), a("div", Jr, [
                            f[26] || (f[26] = t("div", { class: "km-hub-auth-orgs-label" }, "Organizations", -1)),
                            (n(!0), a(J, null, ae(e(N), (u) => (n(), a("div", {
                              key: u.id || u.name,
                              class: "km-hub-auth-org"
                            }, [
                              v(e(k), {
                                icon: "tabler:building",
                                class: "km-i-sm",
                                "aria-hidden": "true"
                              }),
                              t("span", Zr, l(u.display_name || u.name), 1),
                              u.role ? (n(), a("span", Qr, l(u.role), 1)) : c("", !0)
                            ]))), 128))
                          ])) : c("", !0)
                        ], 2)) : c("", !0),
                        t("p", Xr, [
                          w(l(e(T) ? "Replace the token, or" : "Paste a Hub registry token to browse and install private modules.") + " ", 1),
                          e(T) ? (n(), a(J, { key: 0 }, [
                            w("create a new one")
                          ], 64)) : c("", !0),
                          t("a", {
                            href: e(L),
                            target: "_blank",
                            rel: "noopener"
                          }, l(e(T) ? "↗" : "Create one →"), 9, eu)
                        ]),
                        lt(t("input", {
                          "onUpdate:modelValue": f[6] || (f[6] = (u) => ht(q) ? q.value = u : null),
                          type: "password",
                          class: "km-input km-hub-auth-input",
                          placeholder: "wpy_…",
                          autocomplete: "off",
                          onKeyup: f[7] || (f[7] = Pn(
                            //@ts-ignore
                            (...u) => e(i) && e(i)(...u),
                            ["enter"]
                          ))
                        }, null, 544), [
                          [Qt, e(q)]
                        ]),
                        t("div", tu, [
                          t("button", {
                            class: "km-btn km-btn-sm",
                            disabled: e(H),
                            onClick: f[8] || (f[8] = //@ts-ignore
                            (...u) => e(i) && e(i)(...u))
                          }, [
                            v(e(k), {
                              icon: e(H) ? "tabler:loader-2" : "tabler:device-floppy",
                              class: X(["km-i", e(H) && "spin"]),
                              "aria-hidden": "true"
                            }, null, 8, ["icon", "class"]),
                            w(" " + l(e(H) ? "Saving…" : e(T) ? "Replace token" : "Save token"), 1)
                          ], 8, nu),
                          e(T) ? (n(), a("button", {
                            key: 0,
                            class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                            onClick: f[9] || (f[9] = //@ts-ignore
                            (...u) => e(Q) && e(Q)(...u))
                          }, [
                            v(e(k), {
                              icon: "tabler:trash",
                              class: "km-i",
                              "aria-hidden": "true"
                            }),
                            f[27] || (f[27] = w(" Clear ", -1))
                          ])) : c("", !0)
                        ])
                      ])
                    ]),
                    _: 1
                  }, 8, ["open", "anchor"])
                ], 512)
              ])
            ]),
            e(z) ? (n(), a("div", su, l(e(z)), 1)) : c("", !0),
            !e(M) && e(K) ? (n(), a("div", au, "Your Wippy Hub token is expired.")) : c("", !0),
            e(Oe) ? (n(), a("div", lu, l(e(Oe)), 1)) : c("", !0),
            e(Ye) || e(be) ? (n(), a("div", iu, [
              v(e(k), {
                icon: "tabler:loader-2",
                class: "km-i spin",
                "aria-hidden": "true"
              }),
              f[29] || (f[29] = w(" Loading modules… ", -1))
            ])) : e(x).length > 0 ? (n(), a(J, { key: 4 }, [
              e(U).length ? (n(), a("div", ou, [
                t("div", ru, [
                  v(e(k), {
                    icon: "tabler:flame",
                    class: "km-i km-flame",
                    "aria-hidden": "true"
                  }),
                  f[30] || (f[30] = t("span", { class: "hub-section-title" }, "Most popular", -1)),
                  f[31] || (f[31] = t("span", { class: "hub-section-sub" }, "by downloads", -1))
                ]),
                t("div", uu, [
                  (n(!0), a(J, null, ae(e(U), (u) => (n(), a("button", {
                    key: "f" + e(nn)(u),
                    class: "feat-card",
                    style: Ut({ "--accent": e(Wt)(u) }),
                    onClick: (Ee) => e(rt)(u)
                  }, [
                    f[33] || (f[33] = t("span", { class: "feat-strip" }, null, -1)),
                    t("span", cu, [
                      v(e(k), {
                        icon: e(qt)(u),
                        class: "km-i-lg",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    t("span", mu, [
                      t("span", vu, [
                        t("span", pu, l(e(Pt)(u)), 1),
                        e(jt)(u) ? (n(), a("span", ku, "app")) : c("", !0),
                        e(Gt)(u) ? (n(), a("span", fu, [
                          v(e(k), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          f[32] || (f[32] = w(" private", -1))
                        ])) : c("", !0),
                        u.deprecated ? (n(), a("span", gu, "deprecated")) : c("", !0)
                      ]),
                      t("span", bu, l(e(en)(u)), 1),
                      u.description ? (n(), a("span", hu, l(u.description), 1)) : c("", !0),
                      t("span", yu, [
                        t("span", _u, [
                          v(e(k), {
                            icon: "tabler:tag",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          w(" " + l(u.latest_version || "?"), 1)
                        ]),
                        t("span", wu, [
                          v(e(k), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          w(" " + l(e(Yt)(u.total_downloads)), 1)
                        ]),
                        u.license ? (n(), a("span", {
                          key: 0,
                          class: "meta-pill",
                          title: u.license
                        }, [
                          v(e(k), {
                            icon: "tabler:license",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          w(" " + l(e(sn)(u.license)), 1)
                        ], 8, $u)) : c("", !0)
                      ])
                    ])
                  ], 12, du))), 128))
                ])
              ])) : c("", !0),
              t("div", {
                class: X(e(U).length ? "km-mt-sm" : "")
              }, [
                t("div", Su, [
                  v(e(k), {
                    icon: "tabler:apps",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  t("span", Cu, l(e(U).length ? "All modules" : "Available"), 1),
                  t("span", xu, l(e(x).length) + " available", 1)
                ]),
                t("div", Iu, [
                  (n(!0), a(J, null, ae(e(j), (u) => (n(), a("button", {
                    key: e(nn)(u),
                    class: "mod-card",
                    style: Ut({ "--accent": e(Wt)(u) }),
                    onClick: (Ee) => e(rt)(u)
                  }, [
                    t("span", Mu, [
                      v(e(k), {
                        icon: e(qt)(u),
                        class: "km-i",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    t("span", Au, [
                      t("span", Uu, [
                        t("span", Tu, l(e(Pt)(u)), 1),
                        t("span", Eu, l(u.latest_version || "—"), 1),
                        e(jt)(u) ? (n(), a("span", Lu, "app")) : c("", !0),
                        e(Gt)(u) ? (n(), a("span", Vu, [
                          v(e(k), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          f[34] || (f[34] = w(" private", -1))
                        ])) : c("", !0),
                        u.deprecated ? (n(), a("span", Du, "deprecated")) : c("", !0)
                      ]),
                      t("span", Nu, l(e(en)(u)), 1),
                      u.description ? (n(), a("span", Pu, l(u.description), 1)) : c("", !0),
                      t("span", qu, [
                        t("span", Bu, [
                          v(e(k), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          w(" " + l(e(Yt)(u.total_downloads)), 1)
                        ]),
                        u.favorites_count ? (n(), a("span", Ou, [
                          v(e(k), {
                            icon: "tabler:star",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          w(" " + l(u.favorites_count), 1)
                        ])) : c("", !0),
                        u.license ? (n(), a("span", {
                          key: 1,
                          class: "foot-stat km-dim",
                          title: u.license
                        }, l(e(sn)(u.license)), 9, Hu)) : c("", !0),
                        u.update_time ? (n(), a("span", Fu, l(e(an)(u.update_time, { maxUnit: "year" })), 1)) : c("", !0)
                      ])
                    ])
                  ], 12, Ru))), 128))
                ])
              ], 2)
            ], 64)) : !e(Oe) && e(wt).length === 0 ? (n(), a("div", ju, [
              v(e(k), {
                icon: "tabler:package-off",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              t("p", zu, [
                f[35] || (f[35] = w(" No modules tagged ", -1)),
                t("code", Ku, l(e(r)), 1),
                f[36] || (f[36] = w(" are published yet. ", -1))
              ])
            ])) : !e(Oe) && e(p) ? (n(), a("div", Gu, [...f[37] || (f[37] = [
              t("p", { class: "km-muted" }, "No available modules match this filter.", -1)
            ])])) : e(Oe) ? c("", !0) : (n(), a("div", Wu, [
              v(e(k), {
                icon: "tabler:circle-check",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              t("p", Yu, [
                f[38] || (f[38] = w(" All ", -1)),
                t("code", Ju, l(e(r)), 1),
                f[39] || (f[39] = w(" modules are installed — manage them under Installed below. ", -1))
              ])
            ]))
          ]),
          e(Ge).length > 0 || e(qe) ? (n(), a("section", Zu, [
            t("button", {
              class: "km-collapse-head",
              "aria-expanded": e(Be),
              onClick: f[11] || (f[11] = (u) => Be.value = !e(Be))
            }, [
              v(e(k), {
                icon: e(Be) ? "tabler:chevron-down" : "tabler:chevron-right",
                class: "km-i",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              f[40] || (f[40] = t("span", { class: "km-h2" }, "Installed", -1)),
              t("span", Xu, [
                w(l(e(W).length), 1),
                e(W).length !== e(We) ? (n(), a(J, { key: 0 }, [
                  w(" of " + l(e(We)), 1)
                ], 64)) : c("", !0),
                w(" module" + l(e(W).length === 1 ? "" : "s"), 1)
              ]),
              e(Ue) > 0 && e(Ue) !== e(We) ? (n(), a("span", ed, l(e($t)) + " of " + l(e(Ue)) + " hub module" + l(e(Ue) === 1 ? "" : "s"), 1)) : c("", !0),
              e(Ie).length ? (n(), a("span", td, l(e(Ie).length) + " update" + l(e(Ie).length === 1 ? "" : "s"), 1)) : c("", !0)
            ], 8, Qu),
            e(Be) ? (n(), a(J, { key: 0 }, [
              e(qe) ? (n(), a("div", nd, l(e(qe)), 1)) : c("", !0),
              e(Ge).length > 0 ? (n(), a("div", sd, [
                lt(t("input", {
                  "onUpdate:modelValue": f[12] || (f[12] = (u) => ht(Ne) ? Ne.value = u : null),
                  class: "km-input km-filter inst-filter",
                  placeholder: "Search installed…",
                  "aria-label": "Search installed modules"
                }, null, 512), [
                  [Qt, e(Ne)]
                ]),
                v(e(un), {
                  modelValue: e(ut),
                  "onUpdate:modelValue": f[13] || (f[13] = (u) => ht(ut) ? ut.value = u : null),
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
              e(W).length > 0 ? (n(), a("div", ad, [
                (n(!0), a(J, null, ae(e(W), (u) => (n(), a("button", {
                  key: u.id,
                  class: "inst-row",
                  style: Ut({ "--accent": e(pe)(u) }),
                  onClick: (Ee) => e(rt)(u)
                }, [
                  f[42] || (f[42] = t("span", {
                    class: "inst-strip",
                    "aria-hidden": "true"
                  }, null, -1)),
                  t("div", id, [
                    v(e(k), {
                      icon: e(Je)(u),
                      class: "km-i",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  t("div", od, [
                    t("div", rd, [
                      t("span", ud, l(u.component), 1),
                      e(jt)(e(le)(u.component)) ? (n(), a("span", dd, "app")) : c("", !0),
                      t("span", {
                        class: X(e(St)(u) ? "badge-installed kx-tag-caps" : "km-chip")
                      }, l(e(Re)(u)), 3),
                      e(oe)(u) ? (n(), a("span", cd, [
                        v(e(k), {
                          icon: "tabler:lock",
                          class: "km-i-xs",
                          "aria-hidden": "true"
                        }),
                        f[41] || (f[41] = w(" private", -1))
                      ])) : c("", !0),
                      u.source ? (n(), a("span", md, l(u.source), 1)) : c("", !0),
                      e(He)(u) && e(He)(u)?.status !== "current" ? (n(), a("span", {
                        key: 3,
                        class: X(["inst-update", e(He)(u)?.status]),
                        title: e(He)(u)?.message || ""
                      }, [
                        v(e(k), {
                          icon: e(Ct)(u),
                          class: X(["km-i-xs", e(kt)(u) && "spin"]),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"]),
                        w(" " + l(e(Ot)(u)), 1)
                      ], 10, vd)) : c("", !0)
                    ]),
                    t("div", pd, [
                      w(l(u.id) + " ", 1),
                      e(Ze)(u) ? (n(), a("span", kd, " · " + l(e(Ze)(u)), 1)) : c("", !0)
                    ]),
                    e(He)(u)?.message ? (n(), a("div", fd, l(e(He)(u)?.message), 1)) : c("", !0)
                  ]),
                  t("span", gd, l(e(it)(u)), 1),
                  t("span", bd, l(e(Qe)(u)), 1),
                  t("div", hd, [
                    e(He)(u)?.status === "available" || e(kt)(u) ? (n(), a("button", {
                      key: 0,
                      class: "km-icon-btn",
                      disabled: e(kt)(u) || e(Ae),
                      "aria-label": `Update ${u.component}`,
                      onClick: rn((Ee) => e(Te)(u), ["stop"])
                    }, [
                      v(e(k), {
                        icon: e(Ct)(u),
                        class: X(["km-i", e(kt)(u) && "spin"]),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"])
                    ], 8, yd)) : e(dt)(u) ? (n(), a("button", {
                      key: 1,
                      class: "km-icon-btn",
                      disabled: e(Ae),
                      "aria-label": `Open update planner for ${u.component}`,
                      onClick: rn((Ee) => e(ft)(u), ["stop"])
                    }, [
                      v(e(k), {
                        icon: "tabler:refresh-dot",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, _d)) : (n(), a("button", {
                      key: 2,
                      class: "km-icon-btn",
                      disabled: "",
                      title: e(ct)(u),
                      "aria-label": `Cannot update ${u.component}: ${e(ct)(u)}`
                    }, [
                      v(e(k), {
                        icon: "tabler:refresh-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, wd)),
                    e(me)(u) ? (n(), a("button", {
                      key: 3,
                      class: "km-icon-btn km-danger",
                      "aria-label": `Uninstall ${u.component}`,
                      onClick: rn((Ee) => e(Vt)(u), ["stop"])
                    }, [
                      v(e(k), {
                        icon: "tabler:trash",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, $d)) : (n(), a("button", {
                      key: 4,
                      class: "km-icon-btn",
                      disabled: "",
                      title: e(Se)(u),
                      "aria-label": `Cannot uninstall ${u.component}: ${e(Se)(u)}`
                    }, [
                      v(e(k), {
                        icon: "tabler:trash-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Sd))
                  ]),
                  v(e(k), {
                    icon: "tabler:chevron-right",
                    class: "km-i km-chev",
                    "aria-hidden": "true"
                  })
                ], 12, ld))), 128))
              ])) : e(Ge).length > 0 ? (n(), a("div", Cd, [
                v(e(k), {
                  icon: "tabler:filter-off",
                  class: "km-i-xl km-dim km-block",
                  "aria-hidden": "true"
                }),
                f[43] || (f[43] = t("p", { class: "km-muted" }, "No installed modules match this filter.", -1))
              ])) : c("", !0)
            ], 64)) : c("", !0)
          ])) : c("", !0)
        ]))
      ])),
      e(fe) ? (n(), Nt(Wi, {
        key: 4,
        open: !0,
        mode: e(fe).mode,
        component: e(fe).component,
        version: e(fe).version,
        "current-id": e(fe).currentId,
        "catalog-item": e(fe).catalogItem,
        "installed-dep": e(fe).installedDep,
        onClose: e(tt),
        onChanged: e(Ht)
      }, null, 8, ["mode", "component", "version", "current-id", "catalog-item", "installed-dep", "onClose", "onChanged"])) : c("", !0),
      v(e(qn), {
        visible: e(nt),
        "onUpdate:visible": f[18] || (f[18] = (u) => ht(nt) ? nt.value = u : null),
        modal: "",
        closable: !e(ve),
        "dismissable-mask": !e(ve),
        "close-on-escape": !e(ve),
        class: "km-dialog",
        pt: { header: { class: "km-modal-head" }, content: { class: "km-dialog-content" }, footer: { class: "km-modal-foot" } },
        style: { width: "min(560px, calc(100vw - 40px))" }
      }, {
        header: pt(() => [...f[44] || (f[44] = [
          t("span", null, "Uninstall module", -1)
        ])]),
        footer: pt(() => [
          t("button", {
            class: "km-btn km-btn-text km-btn-secondary km-btn-sm",
            disabled: e(ve),
            onClick: f[15] || (f[15] = (u) => nt.value = !1)
          }, "Cancel", 8, ec),
          t("button", {
            class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
            disabled: e(ve) || e(je),
            onClick: f[16] || (f[16] = //@ts-ignore
            (...u) => e(at) && e(at)(...u))
          }, [
            v(e(k), {
              icon: e(je) ? "tabler:loader-2" : "tabler:eye",
              class: X(["km-i", e(je) && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            f[57] || (f[57] = w(" Preview ", -1))
          ], 8, tc),
          t("button", {
            class: "km-btn km-btn-danger km-btn-sm",
            disabled: !!e(ye),
            title: e(ye) || void 0,
            onClick: f[17] || (f[17] = //@ts-ignore
            (...u) => e(mt) && e(mt)(...u))
          }, [
            v(e(k), {
              icon: e(ve) ? "tabler:loader-2" : "tabler:trash",
              class: X(["km-i", e(ve) && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            f[58] || (f[58] = w(" Uninstall ", -1))
          ], 8, nc)
        ]),
        default: pt(() => [
          t("div", xd, [
            t("p", Id, [
              f[45] || (f[45] = w(" Uninstall ", -1)),
              t("code", Rd, l(e(st)?.component), 1),
              t("span", Md, "(" + l(e(st)?.id) + ")", 1)
            ]),
            t("div", null, [
              f[46] || (f[46] = t("label", { class: "km-label" }, "Migration policy", -1)),
              v(e(un), {
                modelValue: e(Fe),
                "onUpdate:modelValue": f[14] || (f[14] = (u) => ht(Fe) ? Fe.value = u : null),
                class: "km-sort km-w-full",
                options: e(s),
                "option-label": "label",
                "option-value": "value",
                "aria-label": "Uninstall migration policy"
              }, null, 8, ["modelValue", "options"]),
              f[47] || (f[47] = t("p", { class: "km-req-desc" }, [
                w("Default "),
                t("code", { class: "km-mono" }, "block"),
                w(". Choose "),
                t("code", { class: "km-mono" }, "down"),
                w(" only if the module's down migrations are safe; data loss is possible.")
              ], -1))
            ]),
            e(gt) ? (n(), a("div", Ad, [
              e(he) ? (n(), a("span", Ud, l(e(he)), 1)) : c("", !0),
              w(l(e(gt)) + " ", 1),
              e(xt).length ? (n(), a("div", Td, "required by: " + l(e(xt).join(", ")), 1)) : c("", !0)
            ])) : c("", !0),
            e(bt) ? (n(), a("div", Ed, [
              f[48] || (f[48] = t("strong", null, "Uninstall blocked:", -1)),
              w(" " + l(e(bt)), 1)
            ])) : c("", !0),
            e(je) ? (n(), a("div", Ld, [
              v(e(k), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              f[49] || (f[49] = t("span", { class: "km-grow km-running-label" }, "Previewing uninstall", -1))
            ])) : e(ce) ? (n(), a("div", Vd, [
              e(ce).warnings?.length ? (n(), a("div", Dd, [
                (n(!0), a(J, null, ae(e(ce).warnings, (u) => (n(), a("div", { key: u }, l(u), 1))), 128))
              ])) : c("", !0),
              e(ce).removed?.length ? (n(), a("div", Nd, [
                f[51] || (f[51] = t("div", { class: "km-preview-title" }, "Removed", -1)),
                (n(!0), a(J, null, ae(e(ce).removed, (u) => (n(), a("div", {
                  key: u.name || u.component,
                  class: "km-preview-row"
                }, [
                  v(e(k), {
                    icon: "tabler:minus",
                    class: "km-i-xs km-danger-fg",
                    "aria-hidden": "true"
                  }),
                  t("span", Pd, l(u.name || u.component), 1),
                  f[50] || (f[50] = t("span", { class: "km-grow" }, null, -1)),
                  t("span", qd, l(u.version), 1)
                ]))), 128))
              ])) : c("", !0),
              e(ce).kept?.length ? (n(), a("div", Bd, [
                f[53] || (f[53] = t("div", { class: "km-preview-title" }, "Kept, still needed", -1)),
                (n(!0), a(J, null, ae(e(ce).kept, (u) => (n(), a("div", {
                  key: u.name || u.component,
                  class: "km-preview-row"
                }, [
                  v(e(k), {
                    icon: "tabler:lock",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  t("span", Od, l(u.name || u.component), 1),
                  f[52] || (f[52] = t("span", { class: "km-grow" }, null, -1)),
                  t("span", Hd, l(u.version), 1)
                ]))), 128))
              ])) : c("", !0),
              e(ce).kept_under_uncertainty?.length ? (n(), a("div", Fd, [
                f[55] || (f[55] = t("div", { class: "km-preview-title" }, "Kept under uncertainty", -1)),
                (n(!0), a(J, null, ae(e(ce).kept_under_uncertainty, (u) => (n(), a("div", {
                  key: u.name || u.component,
                  class: "km-preview-row"
                }, [
                  v(e(k), {
                    icon: "tabler:help",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  t("span", jd, l(u.name || u.component), 1),
                  f[54] || (f[54] = t("span", { class: "km-grow" }, null, -1)),
                  t("span", zd, l(u.reason || u.version), 1)
                ]))), 128))
              ])) : c("", !0)
            ])) : c("", !0),
            e(Lt).length ? (n(), a("div", Kd, [
              f[56] || (f[56] = t("div", { class: "km-panel-title" }, "Execution ledger", -1)),
              (n(!0), a(J, null, ae(e(Lt), (u, Ee) => (n(), a("div", {
                key: `${u.step}-${Ee}`,
                class: X(["km-ledger-row", u.status === "failed" || u.status === "rollback_failed" ? "km-ledger-bad" : u.status === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok"])
              }, [
                t("span", Gd, l(Ee + 1), 1),
                t("span", Wd, l(e(Dt)(u)), 1),
                t("span", Yd, l(u.status), 1),
                u.message ? (n(), a("span", Jd, l(u.message), 1)) : c("", !0)
              ], 2))), 128))
            ])) : c("", !0),
            e(ve) ? (n(), a("div", Zd, [
              v(e(k), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              t("span", Qd, l(e(It)), 1),
              t("span", Xd, l(e(Rt)) + "s", 1)
            ])) : c("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible", "closable", "dismissable-mask", "close-on-escape"])
    ]));
  }
}), pc = {
  rootComponent: sc,
  plugins: [Vn]
};
export {
  pc as mountConfig
};
//# sourceMappingURL=lazy-mount-CZnH5BHj.js.map

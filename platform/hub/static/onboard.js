import { al as st, ab as at, K as it, ad as lt, u as ee, N as de, q as Ce, w as ne, a6 as rt, ae as ct, a4 as ut, a3 as dt, a5 as mt, ai as pt, aj as ft, ak as bt } from "./styles-DQ3QkZVh.js";
import { ref as z, computed as R, defineComponent as vt, onMounted as gt, onBeforeUnmount as ht, openBlock as b, createElementBlock as v, unref as e, createVNode as I, createElementVNode as n, toDisplayString as p, createCommentVNode as j, Fragment as fe, renderList as ge, createTextVNode as ue, normalizeClass as he, withDirectives as je, withKeys as yt, withModifiers as kt, vModelText as Fe, normalizeStyle as Ve } from "vue";
import { Icon as P } from "@iconify/vue";
import { api as Oe, define as wt } from "@wippy-fe/proxy";
const _t = () => st();
function Ct({ hub: o, installed: l, installedCount: i, error: s, selectableCandidates: t, candidateKey: a, candidateById: m, queuedLabel: u, profileParameters: y, loadInstalled: f, apiMessage: S }) {
  const g = z([]), h = z(!1), M = z(0), O = z(0), F = z([]), H = /* @__PURE__ */ new Map();
  function J(w) {
    return g.value.some((C) => C.toLowerCase() === a(w));
  }
  function me(w) {
    const C = ee(w).trim(), E = C.toLowerCase();
    !C || !m(C) || h.value || (g.value = J(w) ? g.value.filter((B) => B.toLowerCase() !== E) : [...g.value, C], N());
  }
  function le(w) {
    const C = [...g.value], E = new Set(C.map((B) => B.toLowerCase()));
    for (const B of w) {
      const A = m(B);
      if (!A) continue;
      const T = ee(A).trim(), G = T.toLowerCase();
      !T || E.has(G) || (E.add(G), C.push(T));
    }
    g.value = C, N();
  }
  function N() {
    M.value = 0, O.value = 0, F.value = [];
  }
  function V(w, C, E) {
    const B = w.toLowerCase();
    F.value = F.value.map((A) => A.component.toLowerCase() === B ? { ...A, status: C, message: E } : A);
  }
  function q() {
    F.value.length && (F.value = F.value.map((w) => l.value.has(w.component.toLowerCase()) && !H.has(w.component.toLowerCase()) ? { ...w, status: "installed" } : w), M.value = F.value.filter((w) => w.status === "installed").length);
  }
  async function x() {
    if (h.value || !g.value.length) return;
    h.value = !0, s.value = "";
    try {
      if (await f(), q(), w(), !g.value.length) return;
      (!O.value || !F.value.length) && (M.value = 0, O.value = g.value.length, F.value = g.value.map((A) => ({
        component: A,
        label: u(A),
        status: "pending"
      })));
      const C = [...g.value], E = [];
      let B = !1;
      g.value = [];
      for (const A of C) {
        V(A, "installing");
        try {
          const T = A.toLowerCase();
          let G = H.get(T);
          if (!l.value.has(T) || !G) {
            const oe = y(A), W = {
              component: A,
              run_migrations: !0,
              ...oe?.length ? { parameters: oe } : {}
            }, pe = Date.now() + 15e3;
            for (; !(await o.securityProjectionStatus()).current; ) {
              const L = pe - Date.now();
              if (L <= 0) throw new Error("Security permissions do not become current after installation.");
              await new Promise((K) => setTimeout(K, Math.min(250, L)));
            }
            const re = await o.planInstall(W);
            G = at(re.requirements || []);
            const te = (re.requirements || []).filter((L) => L.missing || L.invalid).map((L) => L.full_id || L.parameter_name || L.name || "unknown requirement"), ce = Array.from(/* @__PURE__ */ new Set([...re.missing_requirements || [], ...te]));
            if (ce.length)
              throw new Error(`Missing or invalid package settings: ${ce.join(", ")}`);
            G.length && H.set(T, G);
            const ae = await o.install({
              component: A,
              migration_policy: "up",
              ...oe?.length ? { parameters: oe } : {}
            });
            if (ae.success !== !0) throw new it("INSTALL_INCOMPLETE", "Keeper does not confirm a successful install.", void 0, ae);
          }
          await lt(o, G), H.delete(T);
        } catch (T) {
          const G = S(T, "Install failed.");
          V(A, "failed", G), E.push(A);
          continue;
        }
        V(A, "installed"), i.value++, M.value++, window.dispatchEvent(new CustomEvent("kickside:modules-changed")), window.dispatchEvent(new CustomEvent("kickside:nav-changed"));
        try {
          await f(), q();
        } catch {
          B = !0;
        }
      }
      g.value = E, E.length ? s.value = `${E.length} package${E.length === 1 ? "" : "s"} could not be installed. Review the failed item${E.length === 1 ? "" : "s"} below and retry.` : B && (s.value = "Packages were installed, but the installed-module list could not be refreshed. Refresh the page before continuing.");
    } catch (C) {
      s.value = S(C, "Could not refresh installed modules before starting the queue.");
    } finally {
      h.value = !1;
    }
    function w() {
      const C = new Set(t().map(a));
      g.value = g.value.filter((E, B, A) => {
        const T = E.toLowerCase();
        return (C.has(T) || H.has(T)) && A.findIndex((G) => G.toLowerCase() === T) === B;
      });
    }
  }
  return { queue: g, advancing: h, queueCompleted: M, queueTotal: O, queueLedger: F, toggleQueued: me, addQueued: le, isQueued: J, resetRunProgress: N, setLedgerStatus: V, reconcileLedgerWithInstalled: q, startQueue: x };
}
const St = [
  { id: "connections", label: "Connect services", terms: ["connection", "integration", "oauth", "provider"] },
  { id: "automation", label: "Build automations", terms: ["automation", "workflow", "sync", "webhook"] },
  { id: "knowledge", label: "Give agents knowledge", terms: ["knowledge", "documents", "search", "memory"] },
  { id: "analysis", label: "Analyze data", terms: ["analysis", "data", "statistics", "reporting"] },
  { id: "crm", label: "Manage customer data", terms: ["crm", "contacts", "customers", "sales"] },
  { id: "agents", label: "Add agent capabilities", terms: ["agents", "tools", "skills", "mcp"] }
], Qe = "kickside", At = 60, Xe = 100, Lt = 240, It = 8, Pt = 48, Mt = 80, Nt = /* @__PURE__ */ new Set([
  "about",
  "and",
  "for",
  "from",
  "into",
  "that",
  "the",
  "this",
  "with",
  "workspace",
  "want",
  "need",
  "make",
  "have",
  "help",
  "use",
  "using",
  "our",
  "your"
]);
function D(o) {
  return typeof o == "string" ? o.trim() : "";
}
function we(o, l) {
  return D(o).slice(0, l);
}
function Et(o) {
  return o.slice(0, At).map((l) => ({
    component: ee(l).trim(),
    title: we(ne(l), Xe),
    description: we(l.description, Lt),
    keywords: (l.keywords || []).slice(0, It).map((i) => we(String(i), Pt)).filter(Boolean)
  })).filter((l) => l.component);
}
function qt(o, l, i) {
  const s = /* @__PURE__ */ new Map();
  for (const u of i) {
    const y = we(ne(u), Xe);
    if (y)
      for (const f of de(u)) s.has(f) || s.set(f, y);
  }
  const t = /* @__PURE__ */ new Map(), a = (u, y, f) => {
    const S = D(u), g = S.toLowerCase();
    if (!S) return;
    const h = s.get(g), M = we(y, 48), O = t.get(g);
    t.set(g, {
      component: S,
      ...h && h.toLowerCase() !== g || O?.title ? { title: h || O?.title } : {},
      ...M || O?.version ? { version: M || O?.version } : {},
      relationship: f === "root" || O?.relationship === "root" ? "root" : "transitive"
    });
  }, m = /* @__PURE__ */ new Set();
  for (const u of o) {
    if (u.installed === !1) {
      for (const y of de(u)) m.add(y);
      continue;
    }
    a(u.component, u.version, u.is_root === !1 ? "transitive" : "root");
  }
  for (const u of l) {
    const y = de({ module: u.name, name: u.name });
    if (u.installed === !1 || y.some((S) => m.has(S))) continue;
    const f = u.used_by_count ?? u.used_by?.length ?? 0;
    u.is_root !== !0 && u.transitive === !0 && f === 0 || a(
      u.name,
      u.version,
      u.is_root === !0 || u.transitive === !1 ? "root" : "transitive"
    );
  }
  return Array.from(t.values()).sort((u, y) => +(u.relationship === "transitive") - +(y.relationship === "transitive") || X(u.component, y.component)).slice(0, Mt);
}
function X(o, l) {
  const i = o.trim().toLowerCase(), s = l.trim().toLowerCase();
  return i < s ? -1 : i > s ? 1 : 0;
}
function _e(o) {
  const l = D(o.org);
  if (l) return l;
  if (typeof o.organization == "string") return o.organization.trim();
  if (o.organization && typeof o.organization == "object") {
    const s = o.organization;
    return D(s.slug) || D(s.name);
  }
  const i = ee(o);
  return i.includes("/") ? i.split("/")[0] : "";
}
function Ge(o, l) {
  const i = /* @__PURE__ */ new Set();
  for (const t of o.toLowerCase().match(/[a-z0-9][a-z0-9_-]{2,}/g) || [])
    Nt.has(t) || i.add(t);
  const s = new Set(Array.from(l, (t) => String(t)));
  for (const t of St)
    if (s.has(t.id))
      for (const a of t.terms) i.add(a);
  return Array.from(i);
}
function Tt(o) {
  return {
    component: ee(o).toLowerCase(),
    title: ne(o).toLowerCase(),
    description: D(o.description).toLowerCase(),
    keywords: new Set((o.keywords || []).map((l) => String(l).trim().toLowerCase()).filter(Boolean))
  };
}
function Rt(o, l) {
  if (l.length === 0) return 1;
  const i = Tt(o);
  let s = 0;
  for (const t of l)
    i.keywords.has(t) && (s += 40), i.component.split(/[^a-z0-9]+/).includes(t) ? s += 28 : i.component.includes(t) && (s += 12), i.title.split(/[^a-z0-9]+/).includes(t) ? s += 24 : i.title.includes(t) && (s += 10), i.description.includes(t) && (s += 5);
  return s;
}
function Ot(o, l = []) {
  const i = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
  for (const t of o) {
    const a = de(t);
    if (t.installed === !1) {
      for (const m of a) s.add(m);
      continue;
    }
    for (const m of a) i.add(m);
  }
  for (const t of l) {
    if (t.installed === !1) continue;
    const a = de({ module: t.name, name: t.name });
    if (!a.some((m) => s.has(m)))
      for (const m of a) i.add(m);
  }
  return i;
}
function $t(o, l) {
  const i = /* @__PURE__ */ new Map(), s = o.slice().sort((t, a) => {
    const m = de(t)[0] || "", u = de(a)[0] || "";
    return X(m, u) || Number(Ce(a)) - Number(Ce(t)) || X(_e(t), _e(a)) || X(ne(t), ne(a)) || X(D(t.description), D(a.description)) || X((t.keywords || []).map(String).sort(X).join("\0"), (a.keywords || []).map(String).sort(X).join("\0")) || Ie(a.total_downloads) - Ie(t.total_downloads) || X(D(t.type), D(a.type)) || X(D(t.latest_version), D(a.latest_version)) || X(D(t.id), D(a.id));
  });
  for (const t of s) {
    if (!rt(t) || ct(t)) continue;
    const a = de(t), m = a[0];
    !m || a.some((u) => l.has(u)) || i.has(m) || i.set(m, t);
  }
  return Array.from(i.values());
}
function Ue(o, l, i = 5) {
  if (!Array.isArray(o)) return [];
  const s = /* @__PURE__ */ new Map();
  for (const m of l) {
    const u = String(m || "").trim();
    u && !s.has(u.toLowerCase()) && s.set(u.toLowerCase(), u);
  }
  const t = [], a = /* @__PURE__ */ new Set();
  for (const m of o) {
    if (typeof m != "string") continue;
    const u = m.trim().toLowerCase(), y = s.get(u);
    if (!(!y || a.has(u)) && (a.add(u), t.push(y), t.length >= i))
      break;
  }
  return t;
}
function zt(o, l = 3) {
  const i = [], s = /* @__PURE__ */ new Set();
  for (const t of o)
    for (const a of t.modules) {
      const m = ee(a).trim(), u = m.toLowerCase();
      if (!(!m || s.has(u)) && (s.add(u), i.push(m), i.length >= l))
        return i;
    }
  return i;
}
function Te(o, l) {
  return o.map((i) => ({ module: i, score: Rt(i, l) })).filter((i) => l.length === 0 || i.score > 0).sort((i, s) => s.score - i.score || Ie(s.module.total_downloads) - Ie(i.module.total_downloads) || X(ne(i.module), ne(s.module)) || X(ee(i.module), ee(s.module))).map((i) => i.module);
}
function Ie(o) {
  const l = Number(o);
  return Number.isFinite(l) ? l : 0;
}
function Re(o, l, i) {
  const s = o.filter((f) => !Ce(f)), t = Te(
    s.filter((f) => _e(f).toLowerCase() === Qe),
    l
  ), a = [];
  t.length && a.push({ id: "official", title: "Recommended by KickSide", modules: t, private: !1 });
  const m = /* @__PURE__ */ new Map(), u = i.slice().sort((f, S) => X(D(f.name), D(S.name)) || X(D(f.display_name), D(S.display_name)));
  for (const f of u) {
    const S = D(f.name).toLowerCase();
    S && !m.has(S) && m.set(S, f);
  }
  for (const [f, S] of Array.from(m.entries()).sort(([g], [h]) => X(g, h))) {
    const g = Te(
      o.filter((h) => Ce(h) && _e(h).toLowerCase() === f),
      l
    );
    g.length && a.push({
      id: `private:${f}`,
      title: `Private modules from ${D(S.display_name) || D(S.name)}`,
      modules: g,
      private: !0
    });
  }
  const y = Te(
    s.filter((f) => _e(f).toLowerCase() !== Qe),
    l
  );
  return y.length && a.push({ id: "community", title: "Other available modules", modules: y, private: !1 }), a;
}
const Ye = "kickside.hub:onboarding_profile", xt = 12, Bt = 24, Dt = 24, Kt = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i;
function Se(o) {
  return o && typeof o == "object" && !Array.isArray(o) ? o : {};
}
function se(o, l) {
  return typeof o == "string" ? o.trim().slice(0, l) : "";
}
function be(o, l) {
  const i = o.trim().toLowerCase(), s = l.trim().toLowerCase();
  return i < s ? -1 : i > s ? 1 : 0;
}
function jt(o) {
  const l = Se(o);
  return { ...Se(l.data), ...l };
}
function Ft(o) {
  if (typeof o == "boolean") return o;
  if (typeof o == "number") return Number.isFinite(o) ? o : null;
  const l = se(o, 500);
  return l || null;
}
function Vt(o) {
  if (!Array.isArray(o)) return [];
  const l = [], i = /* @__PURE__ */ new Set();
  for (const s of o.slice(0, Dt)) {
    const t = Se(s), a = se(t.name, 200), m = Ft(t.value);
    !a || m === null || i.has(a) || (i.add(a), l.push({ name: a, value: m }));
  }
  return l;
}
function Qt(o) {
  if (!Array.isArray(o)) return [];
  const l = [], i = /* @__PURE__ */ new Set();
  for (const s of o.slice(0, Bt)) {
    const t = typeof s == "string" ? { component: s } : Se(s), a = se(t.component, 200), m = a.toLowerCase();
    if (!Kt.test(a) || i.has(m)) continue;
    i.add(m);
    const u = se(t.title, 100), y = Vt(t.parameters);
    l.push({
      component: a,
      ...u ? { title: u } : {},
      ...y.length ? { parameters: y } : {}
    });
  }
  return l;
}
function Gt(o) {
  if (!Array.isArray(o)) return [];
  const l = [];
  for (const s of o) {
    const t = jt(s), a = Se(t.meta);
    if (a.type !== Ye || a.private === !0 || t.enabled === !1) continue;
    const m = se(t.profile, 80) || se(t.key, 80) || se(t.id, 160), u = se(t.title, 100);
    !m || !u || l.push({
      id: m,
      title: u,
      description: se(t.description, 280),
      icon: se(t.icon, 100) || "tabler:packages",
      order: Number.isFinite(Number(t.order)) ? Number(t.order) : 500,
      required: t.required === !0,
      packages: Qt(t.packages)
    });
  }
  l.sort((s, t) => be(s.id, t.id) || s.order - t.order || be(s.title, t.title) || be(s.description, t.description) || be(s.icon, t.icon) || Number(t.required) - Number(s.required) || be(
    s.packages.map((a) => `${a.component}\0${a.title || ""}\0${JSON.stringify(a.parameters || [])}`).join(""),
    t.packages.map((a) => `${a.component}\0${a.title || ""}\0${JSON.stringify(a.parameters || [])}`).join("")
  ));
  const i = /* @__PURE__ */ new Map();
  for (const s of l) {
    const t = s.id.toLowerCase();
    i.has(t) || i.set(t, s);
  }
  return Array.from(i.values()).sort((s, t) => s.order - t.order || be(s.title, t.title) || be(s.id, t.id)).slice(0, xt);
}
function Ut(o, l, i) {
  const s = [], t = [], a = [];
  for (const m of o.packages) {
    const u = m.component.toLowerCase();
    l.has(u) ? t.push(m) : i.has(u) ? s.push(m) : a.push(m);
  }
  return { selected: s, installed: t, unavailable: a };
}
function Xt({ hub: o, prompt: l, browseQuery: i, initializeProfileSelection: s }) {
  const t = z(!0), a = z(""), m = z(""), u = z([]), y = z(/* @__PURE__ */ new Set()), f = z([]), S = z(/* @__PURE__ */ new Set()), g = z([]), h = z([]), M = z([]), O = z(0), F = R(() => Ge(l.value, /* @__PURE__ */ new Set())), H = R(() => Ge(i.value, /* @__PURE__ */ new Set())), J = R(() => $t(f.value, S.value)), me = R(() => new Set(J.value.map(W))), le = R(() => new Set(u.value.flatMap((d) => d.packages.map((k) => k.component.toLowerCase())))), N = R(() => f.value.filter((d) => {
    const k = W(d);
    return me.value.has(k) || le.value.has(k);
  })), V = R(() => Re(J.value, [], M.value)), q = R(() => Re(J.value, F.value, M.value)), x = R(() => Re(J.value, H.value, M.value)), w = R(() => x.value.reduce((d, k) => d + k.modules.length, 0)), C = R(() => qt(
    g.value,
    h.value,
    f.value
  )), E = R(() => new Set(N.value.map(W))), B = R(() => u.value.filter((d) => y.value.has(d.id))), A = R(() => u.value.filter((d) => d.required)), T = R(() => u.value.filter((d) => !d.required)), G = R(() => T.value.filter((d) => y.value.has(d.id)).length);
  function oe(d, k) {
    const _ = d?.response?.data;
    return typeof _?.error == "string" && _.error ? _.error : d instanceof Error && d.message ? d.message : k;
  }
  function W(d) {
    return ee(d).toLowerCase();
  }
  function pe(d) {
    const k = d.toLowerCase();
    return N.value.find((_) => W(_) === k) || null;
  }
  function re(d) {
    const k = pe(d);
    return k ? ne(k) : d;
  }
  function te(d) {
    return d.packages.map((k) => {
      const _ = pe(k.component);
      return _ ? ne(_) : k.component.split("/").pop() || k.component;
    }).join(" · ");
  }
  function ce(d) {
    const k = d.toLowerCase();
    for (const _ of B.value) {
      const $ = _.packages.find((Y) => Y.component.toLowerCase() === k)?.parameters;
      if ($?.length) return $;
    }
  }
  function ae(d) {
    const k = new Map(f.value.map((_) => [W(_), _]));
    for (const _ of d) {
      const $ = W(_);
      $ && !k.has($) && k.set($, _);
    }
    f.value = Array.from(k.values());
  }
  async function L() {
    const d = await o.listDependencies({ includeEntries: !1, includeMigrations: !1 });
    g.value = d.dependencies || [], h.value = d.modules || [], S.value = Ot(
      d.dependencies || [],
      d.modules || []
    );
  }
  async function K(d) {
    M.value = d.authenticated && d.expired !== !0 ? d.orgs || [] : [];
    const k = await Promise.all(M.value.map((_) => String(_.name || "").trim()).filter(Boolean).map((_) => o.fetchAllByKeyword(_).catch(() => [])));
    for (const _ of k) ae(_);
  }
  async function ye() {
    try {
      const { data: d } = await Oe.get("/api/v1/keeper/registry/entries", {
        params: { kind: "registry.entry", "meta.type": Ye, limit: 100 }
      }), k = Array.isArray(d?.entries) ? d.entries : [], _ = await Promise.all(k.map(async ($) => {
        const Y = $ && typeof $ == "object" && typeof $.id == "string" ? $.id : "";
        if (!Y) return null;
        try {
          const { data: Z } = await Oe.get("/api/v1/keeper/registry/entry", { params: { id: Y } });
          return Z?.entry || null;
        } catch {
          return null;
        }
      }));
      u.value = Gt(_.filter(Boolean)), m.value = u.value.length ? "" : "No capability bundles are declared. You can still choose packages yourself.";
    } catch (d) {
      u.value = [], m.value = oe(d, "Capability bundles could not be loaded. You can still choose packages yourself.");
    }
  }
  async function ie() {
    const d = new Set(f.value.map(W)), k = /* @__PURE__ */ new Set();
    for (const $ of u.value)
      for (const Y of $.packages) {
        const Z = Y.component.toLowerCase();
        d.has(Z) || k.add(Y.component);
      }
    const _ = await Promise.all(Array.from(k).map(($) => {
      const Y = $.split("/").pop() || $;
      return o.browseModules({ query: Y, pageSize: 100 }).then((Z) => (Z.items || []).filter((ve) => W(ve) === $.toLowerCase())).catch(() => []);
    }));
    for (const $ of _) ae($);
  }
  async function ke() {
    t.value = !0, a.value = "", m.value = "";
    try {
      const [d] = await Promise.all([
        o.fetchAllByKeyword(["kickside", "kickside-plugin"]),
        L(),
        ye()
      ]);
      f.value = [], ae(d);
      const k = await o.authStatus().catch(() => ({ success: !0, authenticated: !1 }));
      await K(k), await ie(), s();
    } catch (d) {
      f.value = [], a.value = oe(d, "Could not load module recommendations.");
    } finally {
      t.value = !1;
    }
  }
  function Ae(d) {
    return Ut(d, S.value, E.value);
  }
  function Pe(d) {
    return Ae(d).unavailable.length === 0;
  }
  return {
    loading: t,
    error: a,
    profileError: m,
    prompt: l,
    browseQuery: i,
    profiles: u,
    selectedProfileIds: y,
    candidates: f,
    installed: S,
    installedDependencies: g,
    installedModules: h,
    organizations: M,
    installedCount: O,
    tokens: F,
    browseTokens: H,
    available: J,
    selectableCandidates: N,
    catalogGroups: V,
    matchingGroups: q,
    browseGroups: x,
    browseResultCount: w,
    workspaceComponents: C,
    availableComponentIds: E,
    selectedProfiles: B,
    requiredProfiles: A,
    optionalProfiles: T,
    optionalProfileCount: G,
    apiMessage: oe,
    candidateKey: W,
    candidateById: pe,
    queuedLabel: re,
    profilePackageLabels: te,
    profileParameters: ce,
    mergeCandidates: ae,
    loadInstalled: L,
    loadPrivateOrganizations: K,
    loadProfiles: ye,
    loadProfileCandidates: ie,
    load: ke,
    profileSelection: Ae,
    profileUsable: Pe
  };
}
function Yt({ hub: o, emit: l, prompt: i, tokens: s, catalogGroups: t, matchingGroups: a, workspaceComponents: m, mergeCandidates: u, addQueued: y, apiMessage: f, error: S }) {
  const g = z(!1), h = z(null);
  let M = null;
  async function O() {
    if (g.value) return;
    const N = s.value.slice(0, 6);
    if (N.length) {
      g.value = !0, S.value = "";
      try {
        const V = await Promise.all(N.map((w) => o.browseModules({ query: w, pageSize: 100 }).then((C) => C.items || []).catch(() => [])));
        for (const w of V) u(w);
        const q = t.value.flatMap((w) => w.modules), x = await J(q);
        if (x.status !== "success") {
          h.value = {
            tone: "warning",
            message: x.message || "AI recommendations are unavailable. You can match the live catalog or browse packages."
          };
          return;
        }
        if (!x.ids.length) {
          h.value = { tone: "info", message: "AI did not find a suitable package in the live catalog." };
          return;
        }
        y(x.ids), h.value = {
          tone: "success",
          message: `${x.ids.length} package${x.ids.length === 1 ? "" : "s"} added to your selection. Review the list, then install when ready.`
        };
      } catch (V) {
        h.value = { tone: "warning", message: f(V, "AI recommendations are unavailable.") };
      } finally {
        g.value = !1;
      }
    }
  }
  function F() {
    return i.value.trim();
  }
  function H(N, V) {
    if (Array.isArray(N)) return { status: "success", ids: Ue(N, V) };
    if (!N || typeof N != "object") return { status: "error", ids: [], message: "The recommendation service returned an invalid response." };
    const q = N;
    if (q.success === !0) return { status: "success", ids: Ue(q.component_ids, V) };
    const x = typeof q.error == "string" && q.error.trim() ? q.error.trim() : "AI recommendations are unavailable.";
    return { status: q.code === "MODEL_UNAVAILABLE" ? "unavailable" : "error", ids: [], message: x };
  }
  async function J(N) {
    const V = Et(N), q = V.map((w) => w.component);
    if (!q.length) return { status: "error", ids: [], message: "No installable catalog packages are available." };
    M && M.abort();
    const x = new AbortController();
    return M = x, new Promise((w) => {
      let C = !1, E = !1;
      const B = (T) => {
        C || (C = !0, clearTimeout(A), M === x && (M = null), w(H(T, q)));
      }, A = setTimeout(() => {
        x.abort(), B({ success: !1, code: "TIMEOUT", error: "AI recommendations timed out." });
      }, 8e3);
      l("instrumentRecommendations", {
        need: F(),
        candidate_ids: [...q],
        candidates: V,
        workspace_context: { configured_components: m.value },
        signal: x.signal,
        accept: () => {
          C || (E = !0);
        },
        respond: B
      }), E || B({ success: !1, code: "MODEL_UNAVAILABLE", error: "No configured AI model is available for this onboarding session." });
    });
  }
  function me() {
    const N = zt(a.value);
    if (!N.length) {
      h.value = { tone: "info", message: "No catalog packages matched. Try another description or browse packages." };
      return;
    }
    y(N), h.value = {
      tone: "info",
      message: `${N.length} package${N.length === 1 ? "" : "s"} matched from catalog metadata and added to your selection.`
    };
  }
  function le() {
    M?.abort(), M = null;
  }
  return { searching: g, recommendationNotice: h, recommend: O, matchCatalog: me, abort: le };
}
const Wt = { class: "obm" }, Ht = {
  key: 0,
  class: "obm-error"
}, Jt = {
  key: 1,
  class: "obm-success"
}, Zt = {
  key: 2,
  class: "obm-note"
}, en = {
  key: 3,
  class: "obm-loading"
}, tn = {
  key: 4,
  class: "obm-profiles",
  "aria-labelledby": "obm-profile-title"
}, nn = { class: "obm-profile-head" }, on = { key: 0 }, sn = {
  key: 0,
  class: "obm-menu-section"
}, an = {
  class: "obm-profile-grid",
  "aria-label": "Included capabilities"
}, ln = { class: "obm-profile-card required" }, rn = { class: "obm-profile-icon" }, cn = { class: "obm-profile-copy" }, un = { class: "obm-profile-title" }, dn = { class: "obm-profile-description" }, mn = { class: "obm-profile-packages" }, pn = {
  key: 0,
  class: "obm-profile-warning"
}, fn = {
  key: 1,
  class: "obm-menu-section"
}, bn = {
  class: "obm-profile-grid",
  "aria-label": "Optional capabilities"
}, vn = ["disabled", "aria-pressed", "onClick"], gn = { class: "obm-profile-icon" }, hn = { class: "obm-profile-copy" }, yn = { class: "obm-profile-title" }, kn = { class: "obm-profile-description" }, wn = { class: "obm-profile-packages" }, _n = {
  key: 0,
  class: "obm-profile-warning"
}, Cn = {
  class: "obm-profile-state",
  "aria-hidden": "true"
}, Sn = { class: "obm-menu-section obm-custom-section" }, An = {
  class: "obm-profile-grid obm-custom-grid",
  "aria-label": "More ways to build your setup"
}, Ln = ["disabled"], In = { class: "obm-profile-icon" }, Pn = {
  class: "obm-profile-state",
  "aria-hidden": "true"
}, Mn = ["disabled"], Nn = { class: "obm-profile-icon" }, En = {
  class: "obm-profile-state",
  "aria-hidden": "true"
}, qn = { class: "obm-custom-head" }, Tn = { key: 0 }, Rn = ["aria-busy"], On = { class: "obm-search" }, $n = ["disabled"], zn = ["disabled"], xn = {
  key: 1,
  class: "obm-browse-search"
}, Bn = {
  key: 6,
  class: "obm-groups"
}, Dn = { class: "obm-group-head" }, Kn = { class: "obm-package-list" }, jn = { class: "obm-package-icon" }, Fn = { class: "obm-package-body" }, Vn = { class: "obm-package-title" }, Qn = {
  key: 0,
  class: "obm-private"
}, Gn = ["aria-pressed", "aria-label", "disabled", "onClick"], Un = {
  key: 7,
  class: "obm-empty"
}, Xn = { key: 0 }, Yn = {
  key: 8,
  class: "obm-selection",
  "aria-labelledby": "obm-selection-title"
}, Wn = { class: "obm-selection-head" }, Hn = {
  class: "obm-selection-items",
  "aria-label": "Packages ready to install"
}, Jn = { class: "obm-selection-action" }, Zn = {
  key: 9,
  class: "obm-queue",
  "aria-labelledby": "obm-install-title",
  "aria-live": "polite"
}, eo = { class: "obm-queue-head" }, to = { id: "obm-install-title" }, no = ["aria-valuenow"], oo = {
  class: "obm-queue-items",
  "aria-label": "Selected packages"
}, so = {
  key: 0,
  class: "obm-queue-error"
}, ao = { class: "obm-foot" }, io = ["disabled"], lo = /* @__PURE__ */ vt({
  __name: "OnboardRecommendations",
  setup(o) {
    const l = _t(), i = mt(Oe), s = z(""), t = z(""), a = z(!1), m = z("recommend"), u = Xt({ hub: i, prompt: s, browseQuery: t, initializeProfileSelection: et }), {
      loading: y,
      error: f,
      profileError: S,
      profiles: g,
      selectedProfileIds: h,
      installed: M,
      installedCount: O,
      tokens: F,
      selectableCandidates: H,
      catalogGroups: J,
      matchingGroups: me,
      browseGroups: le,
      browseResultCount: N,
      workspaceComponents: V,
      selectedProfiles: q,
      requiredProfiles: x,
      optionalProfiles: w,
      optionalProfileCount: C,
      apiMessage: E,
      candidateKey: B,
      candidateById: A,
      queuedLabel: T,
      profilePackageLabels: G,
      profileParameters: oe,
      mergeCandidates: W,
      loadInstalled: pe,
      load: re,
      profileSelection: te,
      profileUsable: ce
    } = u, ae = Ct({
      hub: i,
      installed: M,
      installedCount: O,
      error: f,
      selectableCandidates: () => H.value,
      candidateKey: B,
      candidateById: A,
      queuedLabel: T,
      profileParameters: oe,
      loadInstalled: pe,
      apiMessage: E
    }), {
      queue: L,
      advancing: K,
      queueCompleted: ye,
      queueTotal: ie,
      queueLedger: ke,
      toggleQueued: Ae,
      addQueued: Pe,
      isQueued: d,
      resetRunProgress: k,
      startQueue: _
    } = ae, $ = Yt({
      hub: i,
      emit: l,
      prompt: s,
      tokens: F,
      catalogGroups: J,
      matchingGroups: me,
      workspaceComponents: V,
      mergeCandidates: W,
      addQueued: Pe,
      apiMessage: E,
      error: f
    }), { searching: Y, recommendationNotice: Z, recommend: ve, matchCatalog: $e } = $, ze = R(() => !K.value && L.value.length === 0), Me = R(() => ke.value.some((U) => U.status === "failed")), We = R(() => K.value ? "Installing packages" : Me.value ? "Some packages need attention" : ie.value ? "Packages installed" : "Selected packages"), He = R(() => Me.value ? "Retry failed" : "Install selected"), xe = R(() => !y.value && !f.value && ze.value && (a.value || q.value.length > 0)), Ne = R(() => ie.value ? Math.round(ye.value / ie.value * 100) : 0), Je = R(() => K.value ? "Installation in progress…" : L.value.length ? "Install selected packages first" : q.value.length ? "Continue with this setup ›" : a.value ? O.value ? "Continue ›" : "Continue without installing ›" : "Choose capability bundles");
    function Ze() {
      const U = [], c = /* @__PURE__ */ new Set();
      for (const r of q.value)
        for (const Q of te(r).selected) {
          const Ee = A(Q.component), qe = Ee ? ee(Ee).trim() : Q.component, Ke = qe.toLowerCase();
          !qe || c.has(Ke) || (c.add(Ke), U.push(qe));
        }
      return U;
    }
    function Le() {
      L.value = Ze(), k();
    }
    function et() {
      const U = g.value.filter((c) => c.required && ce(c)).map((c) => c.id);
      h.value = new Set(U), Le();
    }
    function tt(U) {
      if (K.value || !ce(U) || (a.value = !1, U.required)) return;
      const c = new Set(h.value);
      c.has(U.id) ? c.delete(U.id) : c.add(U.id), h.value = c, Le();
    }
    function Be(U) {
      K.value || (a.value = !0, m.value = U, Z.value = null, h.value = new Set(g.value.filter((c) => c.required).map((c) => c.id)), Le());
    }
    function De() {
      K.value || (a.value = !1, Z.value = null, Le());
    }
    function nt() {
      a.value ? De() : l("back", void 0);
    }
    function ot() {
      if (!xe.value) return;
      const U = a.value && O.value === 0, c = q.value.map((r) => r.id);
      l("done", {
        status: U ? "skipped" : "completed",
        installed_count: O.value,
        ...c.length === 1 ? { profile: c[0] } : {},
        ...c.length ? { profiles: c } : {}
      });
    }
    return gt(re), ht($.abort), (U, c) => (b(), v("div", Wt, [
      e(f) ? (b(), v("div", Ht, [
        I(e(P), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        n("span", null, p(e(f)), 1),
        n("button", {
          type: "button",
          onClick: c[0] || (c[0] = (r) => e(L).length ? e(_)() : e(re))
        }, p(e(L).length ? "Retry failed" : "Try again"), 1)
      ])) : j("", !0),
      e(O) ? (b(), v("div", Jt, [
        I(e(P), {
          icon: "tabler:circle-check",
          "aria-hidden": "true"
        }),
        n("span", null, p(e(O)) + " module" + p(e(O) === 1 ? "" : "s") + " added to this workspace.", 1)
      ])) : j("", !0),
      e(S) ? (b(), v("div", Zt, [
        I(e(P), {
          icon: "tabler:info-circle",
          "aria-hidden": "true"
        }),
        n("span", null, p(e(S)), 1)
      ])) : j("", !0),
      e(y) ? (b(), v("div", en, [
        I(e(P), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        c[11] || (c[11] = n("span", null, "Checking available modules…", -1))
      ])) : a.value ? (b(), v(fe, { key: 5 }, [
        n("div", qn, [
          n("button", {
            type: "button",
            onClick: De
          }, [
            I(e(P), {
              icon: "tabler:arrow-left",
              "aria-hidden": "true"
            }),
            c[18] || (c[18] = ue(" Profiles", -1))
          ]),
          n("h2", null, p(m.value === "recommend" ? "Recommend packages" : "Browse packages"), 1),
          m.value === "browse" ? (b(), v("span", Tn, p(e(N)) + " available", 1)) : j("", !0)
        ]),
        m.value === "recommend" ? (b(), v("div", {
          key: 0,
          class: "obm-prompt",
          "aria-busy": e(Y)
        }, [
          c[19] || (c[19] = n("label", { for: "obm-need" }, "What should this workspace do?", -1)),
          n("div", On, [
            I(e(P), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            je(n("input", {
              id: "obm-need",
              "onUpdate:modelValue": c[3] || (c[3] = (r) => s.value = r),
              placeholder: "For example: analyze sales data and create reports",
              onKeydown: c[4] || (c[4] = yt(kt(
                //@ts-ignore
                (...r) => e(ve) && e(ve)(...r),
                ["prevent"]
              ), ["enter"]))
            }, null, 544), [
              [Fe, s.value]
            ]),
            n("button", {
              type: "button",
              disabled: e(Y) || e(F).length === 0 || e(K),
              onClick: c[5] || (c[5] = //@ts-ignore
              (...r) => e(ve) && e(ve)(...r))
            }, [
              I(e(P), {
                icon: e(Y) ? "tabler:loader-2" : "tabler:sparkles",
                class: he({ spin: e(Y) }),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              ue(" " + p(e(Y) ? "Finding packages…" : "Recommend packages"), 1)
            ], 8, $n)
          ]),
          c[20] || (c[20] = n("span", null, "AI chooses only from installable packages and adds them to your review list. Nothing installs until you confirm.", -1)),
          e(Z) ? (b(), v("div", {
            key: 0,
            class: he(["obm-recommendation-result", `is-${e(Z).tone}`]),
            role: "status"
          }, [
            n("span", null, p(e(Z).message), 1),
            e(Z).tone === "warning" ? (b(), v("button", {
              key: 0,
              type: "button",
              disabled: e(K),
              onClick: c[6] || (c[6] = //@ts-ignore
              (...r) => e($e) && e($e)(...r))
            }, "Match catalog instead", 8, zn)) : j("", !0)
          ], 2)) : j("", !0)
        ], 8, Rn)) : (b(), v("div", xn, [
          I(e(P), {
            icon: "tabler:search",
            "aria-hidden": "true"
          }),
          je(n("input", {
            "onUpdate:modelValue": c[7] || (c[7] = (r) => t.value = r),
            type: "search",
            placeholder: "Search packages",
            "aria-label": "Search available packages"
          }, null, 512), [
            [Fe, t.value]
          ]),
          t.value ? (b(), v("button", {
            key: 0,
            type: "button",
            "aria-label": "Clear package search",
            onClick: c[8] || (c[8] = (r) => t.value = "")
          }, [
            I(e(P), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])) : j("", !0)
        ]))
      ], 64)) : (b(), v("section", tn, [
        n("div", nn, [
          c[12] || (c[12] = n("div", null, [
            n("h2", { id: "obm-profile-title" }, "Choose capabilities"),
            n("p", null, "Your foundation is included. Add any capabilities you need, then review and install everything together.")
          ], -1)),
          e(C) ? (b(), v("span", on, p(e(C)) + " selected", 1)) : j("", !0)
        ]),
        e(x).length ? (b(), v("div", sn, [
          c[14] || (c[14] = n("div", { class: "obm-menu-label" }, [
            n("span", null, "Included"),
            n("small", null, "Ready in every workspace")
          ], -1)),
          n("ul", an, [
            (b(!0), v(fe, null, ge(e(x), (r) => (b(), v("li", {
              key: r.id
            }, [
              n("div", ln, [
                n("span", rn, [
                  I(e(P), {
                    icon: r.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                n("span", cn, [
                  n("span", un, p(r.title), 1),
                  n("span", dn, p(r.description), 1),
                  n("span", mn, [
                    I(e(P), {
                      icon: "tabler:packages",
                      "aria-hidden": "true"
                    }),
                    ue(" " + p(e(G)(r)), 1)
                  ]),
                  e(te)(r).unavailable.length ? (b(), v("span", pn, p(e(te)(r).unavailable.length) + " package" + p(e(te)(r).unavailable.length === 1 ? "" : "s") + " unavailable in this catalog ", 1)) : j("", !0)
                ]),
                c[13] || (c[13] = n("span", { class: "obm-profile-state is-included" }, "Included", -1))
              ])
            ]))), 128))
          ])
        ])) : j("", !0),
        e(w).length ? (b(), v("div", fn, [
          c[15] || (c[15] = n("div", { class: "obm-menu-label" }, [
            n("span", null, "Add capabilities"),
            n("small", null, "Choose as many as you need")
          ], -1)),
          n("ul", bn, [
            (b(!0), v(fe, null, ge(e(w), (r) => (b(), v("li", {
              key: r.id
            }, [
              n("button", {
                type: "button",
                class: he(["obm-profile-card", { selected: e(h).has(r.id) }]),
                disabled: e(K) || !e(ce)(r),
                "aria-pressed": e(h).has(r.id),
                onClick: (Q) => tt(r)
              }, [
                n("span", gn, [
                  I(e(P), {
                    icon: r.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                n("span", hn, [
                  n("span", yn, p(r.title), 1),
                  n("span", kn, p(r.description), 1),
                  n("span", wn, [
                    I(e(P), {
                      icon: "tabler:packages",
                      "aria-hidden": "true"
                    }),
                    ue(" " + p(e(G)(r)), 1)
                  ]),
                  e(te)(r).unavailable.length ? (b(), v("span", _n, p(e(te)(r).unavailable.length) + " package" + p(e(te)(r).unavailable.length === 1 ? "" : "s") + " unavailable in this catalog ", 1)) : j("", !0)
                ]),
                n("span", Cn, [
                  I(e(P), {
                    icon: e(h).has(r.id) ? "tabler:circle-check-filled" : "tabler:circle-plus"
                  }, null, 8, ["icon"]),
                  ue(" " + p(e(h).has(r.id) ? "Selected" : "Add"), 1)
                ])
              ], 10, vn)
            ]))), 128))
          ])
        ])) : j("", !0),
        n("div", Sn, [
          n("ul", An, [
            n("li", null, [
              n("button", {
                type: "button",
                class: "obm-profile-card custom",
                disabled: e(K),
                onClick: c[1] || (c[1] = (r) => Be("recommend"))
              }, [
                n("span", In, [
                  I(e(P), {
                    icon: "tabler:sparkles",
                    "aria-hidden": "true"
                  })
                ]),
                c[16] || (c[16] = n("span", { class: "obm-profile-copy" }, [
                  n("span", { class: "obm-profile-title" }, "Recommend packages"),
                  n("span", { class: "obm-profile-description" }, "Describe what you need and let AI prepare a package shortlist for review.")
                ], -1)),
                n("span", Pn, [
                  I(e(P), { icon: "tabler:chevron-right" })
                ])
              ], 8, Ln)
            ]),
            n("li", null, [
              n("button", {
                type: "button",
                class: "obm-profile-card custom",
                disabled: e(K),
                onClick: c[2] || (c[2] = (r) => Be("browse"))
              }, [
                n("span", Nn, [
                  I(e(P), {
                    icon: "tabler:packages",
                    "aria-hidden": "true"
                  })
                ]),
                c[17] || (c[17] = n("span", { class: "obm-profile-copy" }, [
                  n("span", { class: "obm-profile-title" }, "Browse packages"),
                  n("span", { class: "obm-profile-description" }, "Search the installable catalog and add packages directly to your review.")
                ], -1)),
                n("span", En, [
                  I(e(P), { icon: "tabler:chevron-right" })
                ])
              ], 8, Mn)
            ])
          ])
        ])
      ])),
      a.value && m.value === "browse" && !e(y) && e(le).length ? (b(), v("div", Bn, [
        (b(!0), v(fe, null, ge(e(le), (r) => (b(), v("section", {
          key: r.id,
          class: "obm-group"
        }, [
          n("div", Dn, [
            I(e(P), {
              icon: r.private ? "tabler:lock" : r.id === "official" ? "tabler:rosette-discount-check" : "tabler:packages",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            n("h2", null, p(r.title), 1),
            n("span", null, p(r.modules.length), 1)
          ]),
          n("ul", Kn, [
            (b(!0), v(fe, null, ge(r.modules, (Q) => (b(), v("li", {
              key: e(ee)(Q),
              class: "obm-package-row",
              style: Ve({ "--module-accent": e(ut)(Q) })
            }, [
              n("div", jn, [
                I(e(P), {
                  icon: e(dt)(Q),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              n("div", Fn, [
                n("div", Vn, [
                  n("strong", null, p(e(ne)(Q)), 1),
                  e(Ce)(Q) ? (b(), v("span", Qn, "private")) : j("", !0)
                ]),
                n("code", null, p(e(ee)(Q)), 1),
                n("p", null, p(Q.description || "No description provided."), 1)
              ]),
              n("button", {
                type: "button",
                class: he({ selected: e(d)(Q) }),
                "aria-pressed": e(d)(Q),
                "aria-label": `${e(d)(Q) ? "Remove" : "Select"} ${e(ne)(Q)}`,
                disabled: e(K),
                onClick: (Ee) => e(Ae)(Q)
              }, [
                I(e(P), {
                  icon: e(d)(Q) ? "tabler:check" : "tabler:plus",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                ue(" " + p(e(d)(Q) ? "Selected" : "Select"), 1)
              ], 10, Gn)
            ], 4))), 128))
          ])
        ]))), 128))
      ])) : a.value && m.value === "browse" && !e(y) && !e(f) ? (b(), v("div", Un, [
        I(e(P), {
          icon: "tabler:package-off",
          "aria-hidden": "true"
        }),
        n("strong", null, p(t.value ? "No packages match this search" : "Everything available is already installed"), 1),
        t.value ? (b(), v("span", Xn, "Try another name or clear the search.")) : j("", !0)
      ])) : j("", !0),
      e(L).length && !e(K) && !e(ie) ? (b(), v("section", Yn, [
        n("div", Wn, [
          n("div", null, [
            c[21] || (c[21] = n("h2", { id: "obm-selection-title" }, "Review your setup", -1)),
            n("span", null, p(e(L).length) + " package" + p(e(L).length === 1 ? "" : "s") + " ready to install", 1)
          ]),
          I(e(P), {
            icon: "tabler:shopping-bag-check",
            "aria-hidden": "true"
          })
        ]),
        n("ul", Hn, [
          (b(!0), v(fe, null, ge(e(L), (r) => (b(), v("li", { key: r }, [
            I(e(P), {
              icon: "tabler:package",
              "aria-hidden": "true"
            }),
            n("span", null, [
              n("strong", null, p(e(T)(r)), 1),
              n("small", null, p(r), 1)
            ])
          ]))), 128))
        ]),
        n("div", Jn, [
          c[22] || (c[22] = n("span", null, "Nothing installs until you confirm.", -1)),
          n("button", {
            type: "button",
            class: "obm-queue-retry",
            onClick: c[9] || (c[9] = //@ts-ignore
            (...r) => e(_) && e(_)(...r))
          }, [
            I(e(P), {
              icon: "tabler:download",
              "aria-hidden": "true"
            }),
            ue(" Install " + p(e(L).length) + " package" + p(e(L).length === 1 ? "" : "s"), 1)
          ])
        ])
      ])) : e(K) || e(ie) ? (b(), v("section", Zn, [
        n("div", eo, [
          n("div", null, [
            n("h2", to, p(We.value), 1),
            n("span", null, p(e(ye)) + " of " + p(e(ie) || e(L).length) + " complete", 1)
          ]),
          n("strong", null, p(Ne.value) + "%", 1)
        ]),
        n("div", {
          class: "obm-queue-progress",
          role: "progressbar",
          "aria-label": "Package installation progress",
          "aria-valuemin": "0",
          "aria-valuemax": "100",
          "aria-valuenow": Ne.value
        }, [
          n("span", {
            style: Ve({ width: `${Ne.value}%` })
          }, null, 4)
        ], 8, no),
        n("ul", oo, [
          (b(!0), v(fe, null, ge(e(ke).length ? e(ke) : e(L).map((r) => ({ component: r, label: e(T)(r), status: "pending", message: void 0 })), (r) => (b(), v("li", {
            key: r.component,
            class: he(`is-${r.status}`)
          }, [
            I(e(P), {
              icon: r.status === "installed" ? "tabler:circle-check-filled" : r.status === "installing" ? "tabler:loader-2" : r.status === "failed" ? "tabler:alert-circle" : "tabler:clock",
              class: he({ spin: r.status === "installing" }),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            n("span", null, [
              n("strong", null, p(r.label), 1),
              n("small", null, p(r.component), 1),
              r.message ? (b(), v("small", so, p(r.message), 1)) : j("", !0)
            ]),
            n("em", null, p(r.status), 1)
          ], 2))), 128))
        ]),
        e(L).length && !e(K) ? (b(), v("button", {
          key: 0,
          type: "button",
          class: "obm-queue-retry",
          onClick: c[10] || (c[10] = //@ts-ignore
          (...r) => e(_) && e(_)(...r))
        }, [
          I(e(P), {
            icon: Me.value ? "tabler:refresh" : "tabler:download",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          ue(" " + p(He.value), 1)
        ])) : j("", !0)
      ])) : j("", !0),
      n("div", ao, [
        n("button", {
          type: "button",
          class: "obm-back",
          onClick: nt
        }, "‹ " + p(a.value ? "Profiles" : "Back"), 1),
        c[23] || (c[23] = n("span", null, null, -1)),
        ze.value ? (b(), v("button", {
          key: 0,
          type: "button",
          class: "obm-continue",
          disabled: !xe.value,
          onClick: ot
        }, p(Je.value), 9, io)) : j("", !0)
      ])
    ]));
  }
});
class ro extends pt {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ft
    };
  }
  static get vueConfig() {
    return { rootComponent: lo, plugins: [bt] };
  }
}
wt(import.meta.url, ro);
//# sourceMappingURL=onboard.js.map

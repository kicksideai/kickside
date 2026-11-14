function b(e) {
  return String(e || "").trim().toLowerCase();
}
function h(e) {
  if (!e) return [];
  const t = /* @__PURE__ */ new Set(), r = (s) => {
    const o = b(s);
    o && t.add(o);
  };
  if (r(e.full_name), r(e.component), r(e.module), e.org && e.name && r(`${e.org}/${e.name}`), typeof e.organization == "string" && e.name && r(`${e.organization}/${e.name}`), e.organization && typeof e.organization == "object" && e.name) {
    const s = e.organization;
    s.slug && r(`${s.slug}/${e.name}`), s.name && r(`${s.name}/${e.name}`);
  }
  e.namespace && e.name && r(`${e.namespace}/${e.name}`);
  const n = b(e.name);
  n.includes("/") && r(n);
  const i = b(e.id);
  return i.includes("/") && r(i), Array.from(t);
}
function M(e, t) {
  const r = b(t);
  return r ? h(e).includes(r) : !1;
}
function B(e) {
  return e ? e >= 1e6 ? (e / 1e6).toFixed(1) + "M" : e >= 1e3 ? (e / 1e3).toFixed(1) + "k" : String(e) : "0";
}
function D(e) {
  return e ? e >= 1048576 ? (e / 1048576).toFixed(1) + " MB" : e >= 1024 ? (e / 1024).toFixed(1) + " KB" : e + " B" : "";
}
function A(e) {
  return e?.replace(/[^\s()]+/g, (t) => t.startsWith("LicenseRef-") ? t.slice(11).replace(/-/g, " ") : t) ?? "";
}
const L = {
  library: "tabler:book-2",
  service: "tabler:server",
  application: "tabler:apps",
  app: "tabler:apps",
  page: "tabler:browser",
  agent: "tabler:robot"
}, v = [261, 200, 24, 142, 330, 174, 12, 220, 280, 50];
function O(e) {
  const t = String(e.full_name || e.name || e.id || "");
  let r = 0;
  for (let n = 0; n < t.length; n++) r = r * 31 + t.charCodeAt(n) | 0;
  return `hsl(${v[Math.abs(r) % v.length]} 70% 56%)`;
}
function $(e) {
  return L[String(e.type || "").toLowerCase()] || "tabler:package";
}
function R(e) {
  const t = String(e?.type || "").toLowerCase();
  return t === "app" || t === "application";
}
function x(e) {
  return !(!e || e.deprecated === !0);
}
function g(e) {
  return typeof e == "string" ? e.trim().toLowerCase() : "";
}
function K(e) {
  if (!e) return !1;
  if (e.is_private === !0 || e.private === !0 || (g(e.visibility) || g(e.module_visibility) || g(e.access)) === "private") return !0;
  const r = e.meta && typeof e.meta == "object" ? e.meta : void 0;
  if (!r) return !1;
  if ((g(r.visibility) || g(r.module_visibility) || g(r.access)) === "private") return !0;
  const i = r.hub && typeof r.hub == "object" ? r.hub : void 0;
  return (i ? g(i.visibility) || g(i.module_visibility) || g(i.access) : "") === "private";
}
function E(e) {
  return e.full_name ? e.full_name : e.component ? e.component : e.org && e.name ? `${e.org}/${e.name}` : e.namespace && e.name ? `${e.namespace}/${e.name}` : "";
}
function z(e) {
  return e.display_name || E(e) || e.id || "—";
}
function U(e) {
  return String(e.full_name || e.id || E(e));
}
function j(e, t) {
  const r = t.trim().toLowerCase();
  return r ? e.filter((n) => {
    const i = (n.display_name || n.name || "").toLowerCase(), s = (n.full_name || "").toLowerCase(), o = (n.description || "").toLowerCase();
    return i.includes(r) || s.includes(r) || o.includes(r);
  }) : e;
}
function V(e, t) {
  const r = [...e];
  return t === "name" ? r.sort((n, i) => String(n.display_name || n.name).localeCompare(String(i.display_name || i.name))) : t === "recent" ? r.sort((n, i) => String(i.update_time || "").localeCompare(String(n.update_time || ""))) : r.sort((n, i) => (i.total_downloads || 0) - (n.total_downloads || 0));
}
function w(e, t) {
  return R(t(e.component)) ? 0 : String(e.component || "").startsWith("kickside/") ? 1 : 2;
}
function F(e, t) {
  return e.slice().sort((r, n) => {
    const i = w(r, t) - w(n, t);
    return i !== 0 ? i : String(r.component || "").localeCompare(String(n.component || ""));
  });
}
function T(e) {
  return typeof e.is_root == "boolean" ? e.is_root : (e.used_by_count || 0) === 0 && (!e.used_by || e.used_by.length === 0);
}
function W(e) {
  return T(e) ? "root" : "transitive";
}
function H(e) {
  const t = (e.used_by || []).filter(Boolean), r = e.used_by_count ?? t.length;
  return r <= 0 ? "" : t.length > 0 ? `used by ${t.join(", ")}` : `used by ${r} root${r === 1 ? "" : "s"}`;
}
function Z(e) {
  const t = e.meta?.hub?.resolved_modules?.find((i) => i.name === e.component)?.version;
  if (t) return String(t);
  const r = (e.entries || []).find((i) => i.module === e.component && i.module_version)?.module_version;
  if (r) return String(r);
  const n = String(e.version || "").trim();
  return n === "*" || n === ">=v0.0.0" || n === ">=0.0.0" ? "" : n.replace(/^[>=<~^]+v?/, "");
}
function G(e) {
  return (e.parameter_name || e.full_id || e.id || e.name || "").trim();
}
function P(e) {
  return String(e.path || e.module || "").trim();
}
function X(e) {
  const t = e.map((s) => ({ ...s, children: [] })), r = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
  for (const s of t) {
    const o = P(s);
    o && r.set(o, s);
    const l = n.get(s.module) || [];
    l.push(s), n.set(s.module, l);
  }
  const i = [];
  for (const s of t) {
    let o;
    const l = String(s.parent || "").trim();
    if (l && (o = r.get(l) || n.get(l)?.[0]), !o && s.path && s.path.includes("/")) {
      const f = s.path.lastIndexOf("/");
      o = r.get(s.path.slice(0, f));
    }
    o && o !== s ? o.children.push(s) : i.push(s);
  }
  return i;
}
function Y(e, t) {
  const r = [], n = String(t?.currentVersion || "");
  return n && e.version && (!t?.targetModule || e.module === t.targetModule || e.direct) && n !== String(e.version) && r.push({ label: `upgrade from ${n}`, tone: "upgrade" }), e.installed ? r.push({ label: "installed", tone: "installed" }) : e.shared ? r.push({ label: "shared", tone: "shared" }) : r.push({ label: "new", tone: "new" }), r;
}
function J(e, t) {
  return e.transitive === !0 || (e.depth || 0) > 0 ? !0 : !!(t && e.module && e.module !== t);
}
function Q(e) {
  return String(e.module || e.namespace || "a dependency");
}
function ee(e) {
  if (!e || typeof e != "object") return [];
  const t = e;
  return Array.isArray(t.required_by) ? t.required_by.map(String).filter(Boolean) : t.required_by && typeof t.required_by == "object" ? Object.values(t.required_by).map(String).filter(Boolean) : typeof t.required_by_text == "string" ? t.required_by_text.split(",").map((r) => r.trim()).filter(Boolean) : [];
}
function te(e) {
  if (!e || typeof e != "object") return [];
  const t = e;
  return t.payload?.execution || t.execution || [];
}
function re(e) {
  return String(e.step || "").replace(/[._-]+/g, " ").trim() || "step";
}
function ne(e) {
  return !!(e?.authenticated && e.expired !== !0);
}
function ie(e, t = "Something went wrong") {
  if (e instanceof Error) return e.message;
  if (typeof e == "string") return e;
  if (e && typeof e == "object") {
    const r = e;
    return r.response?.data?.error || r.message || t;
  }
  return t;
}
class d extends Error {
  code;
  status;
  details;
  constructor(t, r, n, i) {
    super(r), this.name = "KeeperHubError", this.code = t, this.status = n, this.details = i;
  }
}
function c(e) {
  return e.then(({ data: t, status: r }) => {
    if (!t || typeof t != "object")
      throw new d("UNKNOWN", "empty or malformed response body", r);
    if (t.success === !1) {
      const i = t;
      throw new d(i.code || "UNKNOWN", i.error || "request failed", r, i.details);
    }
    return t;
  }).catch((t) => {
    if (t instanceof d) throw t;
    const r = t, n = r?.response?.data;
    if (n && n.success === !1)
      throw new d(n.code || "UNKNOWN", n.error || "request failed", r.response?.status, n.details);
    const i = r?.response?.status, s = t instanceof Error && t.message || "network error";
    throw new d(i === 401 ? "UNAUTHORIZED" : i === 403 ? "FORBIDDEN" : "NETWORK", s, i);
  });
}
function se(e) {
  return {
    securityProjectionStatus() {
      return c(e.get("/api/v1/security/projection"));
    },
    listDependencies(t) {
      const r = {};
      return t?.component && (r.component = t.component), t?.includeEntries === !1 && (r.entries = "0"), t?.includeMigrations === !1 && (r.migrations = "0"), c(e.get("/api/v1/keeper/hub/dependencies", { params: r }));
    },
    browseModules(t) {
      const r = {};
      return t?.query && (r.q = t.query), t?.page && (r.page = t.page), t?.pageSize && (r.page_size = t.pageSize), t?.visibility && (r.visibility = t.visibility), t?.type && (r.type = t.type), t?.sort && (r.sort = t.sort), c(e.get("/api/v1/keeper/hub/browse", { params: r }));
    },
    listVersions(t) {
      return c(e.get("/api/v1/keeper/hub/versions", { params: { module: t } }));
    },
    getReadme(t, r) {
      const n = { module: t };
      return r && (n.version = r), c(e.get("/api/v1/keeper/hub/readme", { params: n }));
    },
    listMigrations(t) {
      const r = {};
      return t && (r.component = t), c(e.get("/api/v1/keeper/hub/migrations", { params: r }));
    },
    planInstall(t) {
      return c(e.post("/api/v1/keeper/hub/dependencies/plan", t));
    },
    planBatchInstall(t) {
      return c(e.post("/api/v1/keeper/hub/dependencies/plan", t));
    },
    install(t) {
      return c(e.post("/api/v1/keeper/hub/dependencies/install", t));
    },
    uninstall(t) {
      return c(e.post("/api/v1/keeper/hub/dependencies/uninstall", t));
    },
    runMigrations(t) {
      return c(e.post("/api/v1/keeper/hub/migrations/run", t));
    },
    requiredSetupStatus(t) {
      return c(e.get("/api/v1/hub/required-setup", { params: { descriptor: t } }));
    },
    applyRequiredSetup(t) {
      return c(e.post("/api/v1/hub/required-setup", { descriptor: t }));
    },
    scan(t) {
      return c(e.post("/api/v1/keeper/hub/scan", t));
    },
    // ── Hub token (manual, native hub.auth seam, admin-set) ──────────────
    authStatus() {
      return c(e.get("/api/v1/hub/auth"));
    },
    authenticate(t) {
      return c(e.post("/api/v1/hub/auth", { token: t }));
    },
    logout() {
      return c(e.delete("/api/v1/hub/auth"));
    },
    async fetchAllByKeyword(t, r = 100) {
      const n = (Array.isArray(t) ? t : [t]).map((a) => a.trim().toLowerCase()).filter(Boolean);
      if (n.length === 0) return [];
      const i = new Set(n), s = [], o = /* @__PURE__ */ new Set(), l = 50;
      async function* f(a) {
        for (let p = 1; p <= l; p++) {
          const u = await c(e.get("/api/v1/keeper/hub/browse", {
            params: { ...a, page: p, page_size: r }
          })), y = u.items || [];
          if (yield y, typeof u.total == "number" && p * r >= u.total || y.length < r) return;
        }
      }
      for (const a of n)
        for await (const p of f({ q: a }))
          for (const u of p) {
            const y = (u.keywords || []).map((_) => String(_).trim().toLowerCase()), q = typeof u.org == "string" ? u.org : typeof u.organization == "string" ? u.organization : u.organization?.slug || u.organization?.name || String(u.full_name || "").split("/")[0], I = String(q || "").trim().toLowerCase();
            if (!y.some((_) => i.has(_)) && !i.has(I)) continue;
            const S = h(u)[0] || String(u.full_name || u.id || "").trim().toLowerCase();
            !S || o.has(S) || (o.add(S), s.push(u));
          }
      const m = /* @__PURE__ */ new Set();
      for await (const a of f({ visibility: "private" }))
        for (const p of a)
          for (const u of h(p)) m.add(u);
      for (const a of s)
        h(a).some((p) => m.has(p)) && (a.visibility = "private");
      return s;
    }
  };
}
const C = "registry:v1:", k = 3e4, N = 250;
function oe(e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e) {
    if (r.name !== "required_setup" && r.short_name !== "required_setup") continue;
    const n = String(r.value ?? "").trim() || String(r.default ?? "").trim(), i = n.startsWith(C) ? n.slice(C.length) : "";
    if (!/^[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+$/.test(i))
      throw new d("INVALID_SETUP_DESCRIPTOR", "The module declares an invalid required setup descriptor.");
    t.add(i);
  }
  return [...t];
}
async function ae(e, t, r = {}) {
  const n = () => {
    if (r.isCurrent && !r.isCurrent())
      throw new d("INSTALL_SUPERSEDED", "Installation is closed or superseded.");
  };
  for (const i of t) {
    n(), r.onPhase?.("Checking required setup…");
    const s = Date.now() + k;
    let o;
    for (; !o; ) {
      n();
      try {
        const a = await e.requiredSetupStatus(i);
        n(), a.status !== "building" && (o = a);
      } catch (a) {
        if (!(a instanceof d) || a.status !== 404) throw a;
      }
      if (o) break;
      const m = s - Date.now();
      if (m <= 0)
        throw new d("SETUP_DESCRIPTOR_NOT_VISIBLE", "Required setup does not become available after installation.");
      await new Promise((a) => setTimeout(a, Math.min(N, m)));
    }
    if (o.success && o.ready && o.status === "ready") continue;
    n(), r.onPhase?.(o.pending_label || "Running required setup…");
    const l = await e.applyRequiredSetup(i);
    if (n(), !l.success || !l.ready || l.status !== "ready")
      throw new d("SETUP_INCOMPLETE", l.error || l.detail || "Required setup fails.", void 0, l);
    r.onPhase?.("Verifying required setup…");
    const f = await e.requiredSetupStatus(i);
    if (n(), !f.success || !f.ready || f.status !== "ready")
      throw new d("SETUP_POSTCONDITION_FAILED", f.error || f.detail || "Required setup fails verification.", void 0, f);
  }
}
export {
  oe as A,
  Y as B,
  ae as C,
  R as D,
  B as E,
  A as F,
  D as G,
  d as K,
  E as a,
  z as b,
  M as c,
  ee as d,
  ie as e,
  te as f,
  h as g,
  j as h,
  ne as i,
  U as j,
  F as k,
  T as l,
  K as m,
  W as n,
  H as o,
  re as p,
  $ as q,
  Z as r,
  V as s,
  O as t,
  se as u,
  x as v,
  J as w,
  G as x,
  X as y,
  Q as z
};
//# sourceMappingURL=requiredSetup-CKaPvMvx.js.map

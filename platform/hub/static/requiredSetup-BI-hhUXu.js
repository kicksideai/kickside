function h(e) {
  return String(e || "").trim().toLowerCase();
}
function S(e) {
  if (!e) return [];
  const t = /* @__PURE__ */ new Set(), r = (s) => {
    const o = h(s);
    o && t.add(o);
  };
  if (r(e.full_name), r(e.component), r(e.module), e.org && e.name && r(`${e.org}/${e.name}`), typeof e.organization == "string" && e.name && r(`${e.organization}/${e.name}`), e.organization && typeof e.organization == "object" && e.name) {
    const s = e.organization;
    s.slug && r(`${s.slug}/${e.name}`), s.name && r(`${s.name}/${e.name}`);
  }
  e.namespace && e.name && r(`${e.namespace}/${e.name}`);
  const n = h(e.name);
  n.includes("/") && r(n);
  const i = h(e.id);
  return i.includes("/") && r(i), Array.from(t);
}
function B(e, t) {
  const r = h(t);
  return r ? S(e).includes(r) : !1;
}
function D(e) {
  return e ? e >= 1e6 ? (e / 1e6).toFixed(1) + "M" : e >= 1e3 ? (e / 1e3).toFixed(1) + "k" : String(e) : "0";
}
function A(e) {
  return e ? e >= 1048576 ? (e / 1048576).toFixed(1) + " MB" : e >= 1024 ? (e / 1024).toFixed(1) + " KB" : e + " B" : "";
}
function O(e) {
  return e?.replace(/[^\s()]+/g, (t) => t.startsWith("LicenseRef-") ? t.slice(11).replace(/-/g, " ") : t) ?? "";
}
const R = {
  library: "tabler:book-2",
  service: "tabler:server",
  application: "tabler:apps",
  app: "tabler:apps",
  page: "tabler:browser",
  agent: "tabler:robot"
}, w = [261, 200, 24, 142, 330, 174, 12, 220, 280, 50];
function $(e) {
  const t = String(e.full_name || e.name || e.id || "");
  let r = 0;
  for (let n = 0; n < t.length; n++) r = r * 31 + t.charCodeAt(n) | 0;
  return `hsl(${w[Math.abs(r) % w.length]} 70% 56%)`;
}
function x(e) {
  return R[String(e.type || "").toLowerCase()] || "tabler:package";
}
function T(e) {
  const t = String(e?.type || "").toLowerCase();
  return t === "app" || t === "application";
}
function K(e) {
  return !(!e || e.deprecated === !0);
}
function m(e) {
  return typeof e == "string" ? e.trim().toLowerCase() : "";
}
function z(e) {
  if (!e) return !1;
  if (e.is_private === !0 || e.private === !0 || (m(e.visibility) || m(e.module_visibility) || m(e.access)) === "private") return !0;
  const r = e.meta && typeof e.meta == "object" ? e.meta : void 0;
  if (!r) return !1;
  if ((m(r.visibility) || m(r.module_visibility) || m(r.access)) === "private") return !0;
  const i = r.hub && typeof r.hub == "object" ? r.hub : void 0;
  return (i ? m(i.visibility) || m(i.module_visibility) || m(i.access) : "") === "private";
}
function q(e) {
  return e.full_name ? e.full_name : e.component ? e.component : e.org && e.name ? `${e.org}/${e.name}` : e.namespace && e.name ? `${e.namespace}/${e.name}` : "";
}
function U(e) {
  return e.display_name || q(e) || e.id || "—";
}
function j(e) {
  return String(e.full_name || e.id || q(e));
}
function V(e, t) {
  const r = t.trim().toLowerCase();
  return r ? e.filter((n) => {
    const i = (n.display_name || n.name || "").toLowerCase(), s = (n.full_name || "").toLowerCase(), o = (n.description || "").toLowerCase();
    return i.includes(r) || s.includes(r) || o.includes(r);
  }) : e;
}
function F(e, t) {
  const r = [...e];
  return t === "name" ? r.sort((n, i) => String(n.display_name || n.name).localeCompare(String(i.display_name || i.name))) : t === "recent" ? r.sort((n, i) => String(i.update_time || "").localeCompare(String(n.update_time || ""))) : r.sort((n, i) => (i.total_downloads || 0) - (n.total_downloads || 0));
}
function C(e, t) {
  return T(t(e.component)) ? 0 : String(e.component || "").startsWith("kickside/") ? 1 : 2;
}
function W(e, t) {
  return e.slice().sort((r, n) => {
    const i = C(r, t) - C(n, t);
    return i !== 0 ? i : String(r.component || "").localeCompare(String(n.component || ""));
  });
}
function P(e) {
  return typeof e.is_root == "boolean" ? e.is_root : (e.used_by_count || 0) === 0 && (!e.used_by || e.used_by.length === 0);
}
function H(e) {
  return P(e) ? "root" : "transitive";
}
function Z(e) {
  const t = (e.used_by || []).filter(Boolean), r = e.used_by_count ?? t.length;
  return r <= 0 ? "" : t.length > 0 ? `used by ${t.join(", ")}` : `used by ${r} root${r === 1 ? "" : "s"}`;
}
function G(e) {
  const t = e.meta?.hub?.resolved_modules?.find((i) => i.name === e.component)?.version;
  if (t) return String(t);
  const r = (e.entries || []).find((i) => i.module === e.component && i.module_version)?.module_version;
  if (r) return String(r);
  const n = String(e.version || "").trim();
  return n === "*" || n === ">=v0.0.0" || n === ">=0.0.0" ? "" : n.replace(/^[>=<~^]+v?/, "");
}
function X(e) {
  return (e.parameter_name || e.full_id || e.id || e.name || "").trim();
}
function k(e) {
  return String(e.path || e.module || "").trim();
}
function Y(e) {
  const t = e.map((s) => ({ ...s, children: [] })), r = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
  for (const s of t) {
    const o = k(s);
    o && r.set(o, s);
    const u = n.get(s.module) || [];
    u.push(s), n.set(s.module, u);
  }
  const i = [];
  for (const s of t) {
    let o;
    const u = String(s.parent || "").trim();
    if (u && (o = r.get(u) || n.get(u)?.[0]), !o && s.path && s.path.includes("/")) {
      const g = s.path.lastIndexOf("/");
      o = r.get(s.path.slice(0, g));
    }
    o && o !== s ? o.children.push(s) : i.push(s);
  }
  return i;
}
function J(e, t) {
  const r = [], n = String(t?.currentVersion || "");
  return n && e.version && (!t?.targetModule || e.module === t.targetModule || e.direct) && n !== String(e.version) && r.push({ label: `upgrade from ${n}`, tone: "upgrade" }), e.installed ? r.push({ label: "installed", tone: "installed" }) : e.shared ? r.push({ label: "shared", tone: "shared" }) : r.push({ label: "new", tone: "new" }), r;
}
function Q(e, t) {
  return e.transitive === !0 || (e.depth || 0) > 0 ? !0 : !!(t && e.module && e.module !== t);
}
function ee(e) {
  return String(e.module || e.namespace || "a dependency");
}
function te(e) {
  if (!e || typeof e != "object") return [];
  const t = e;
  return Array.isArray(t.required_by) ? t.required_by.map(String).filter(Boolean) : t.required_by && typeof t.required_by == "object" ? Object.values(t.required_by).map(String).filter(Boolean) : typeof t.required_by_text == "string" ? t.required_by_text.split(",").map((r) => r.trim()).filter(Boolean) : [];
}
function re(e) {
  if (!e || typeof e != "object") return [];
  const t = e;
  return t.payload?.execution || t.execution || [];
}
function ne(e) {
  return String(e.step || "").replace(/[._-]+/g, " ").trim() || "step";
}
function ie(e) {
  return !!(e?.authenticated && e.expired !== !0);
}
function se(e, t = "Something went wrong") {
  if (e instanceof Error) return e.message;
  if (typeof e == "string") return e;
  if (e && typeof e == "object") {
    const r = e;
    return r.response?.data?.error || r.message || t;
  }
  return t;
}
class p extends Error {
  code;
  status;
  details;
  constructor(t, r, n, i) {
    super(r), this.name = "KeeperHubError", this.code = t, this.status = n, this.details = i;
  }
}
function a(e) {
  return e.then(({ data: t, status: r }) => {
    if (!t || typeof t != "object")
      throw new p("UNKNOWN", "empty or malformed response body", r);
    if (t.success === !1) {
      const i = t;
      throw new p(i.code || "UNKNOWN", i.error || "request failed", r, i.details);
    }
    return t;
  }).catch((t) => {
    if (t instanceof p) throw t;
    const r = t, n = r?.response?.data;
    if (n && n.success === !1)
      throw new p(n.code || "UNKNOWN", n.error || "request failed", r.response?.status, n.details);
    const i = r?.response?.status, s = t instanceof Error && t.message || "network error";
    throw new p(i === 401 ? "UNAUTHORIZED" : i === 403 ? "FORBIDDEN" : "NETWORK", s, i);
  });
}
function oe(e) {
  return {
    securityProjectionStatus() {
      return a(e.get("/api/v1/security/projection"));
    },
    listDependencies(t) {
      const r = {};
      return t?.component && (r.component = t.component), t?.includeEntries === !1 && (r.entries = "0"), t?.includeMigrations === !1 && (r.migrations = "0"), a(e.get("/api/v1/keeper/hub/dependencies", { params: r }));
    },
    browseModules(t) {
      const r = {};
      return t?.query && (r.q = t.query), t?.page && (r.page = t.page), t?.pageSize && (r.page_size = t.pageSize), t?.visibility && (r.visibility = t.visibility), t?.type && (r.type = t.type), t?.sort && (r.sort = t.sort), a(e.get("/api/v1/keeper/hub/browse", { params: r }));
    },
    listVersions(t) {
      return a(e.get("/api/v1/keeper/hub/versions", { params: { module: t } }));
    },
    getReadme(t, r) {
      const n = { module: t };
      return r && (n.version = r), a(e.get("/api/v1/keeper/hub/readme", { params: n }));
    },
    listMigrations(t) {
      const r = {};
      return t && (r.component = t), a(e.get("/api/v1/keeper/hub/migrations", { params: r }));
    },
    planInstall(t) {
      return a(e.post("/api/v1/keeper/hub/dependencies/plan", t));
    },
    planBatchInstall(t) {
      return a(e.post("/api/v1/keeper/hub/dependencies/plan", t));
    },
    install(t) {
      return a(e.post("/api/v1/keeper/hub/dependencies/install", t));
    },
    uninstall(t) {
      return a(e.post("/api/v1/keeper/hub/dependencies/uninstall", t));
    },
    runMigrations(t) {
      return a(e.post("/api/v1/keeper/hub/migrations/run", t));
    },
    requiredSetupStatus(t) {
      return a(e.get("/api/v1/hub/required-setup", { params: { descriptor: t } }));
    },
    applyRequiredSetup(t) {
      return a(e.post("/api/v1/hub/required-setup", { descriptor: t }));
    },
    scan(t) {
      return a(e.post("/api/v1/keeper/hub/scan", t));
    },
    // ── Hub token (manual, native hub.auth seam, admin-set) ──────────────
    authStatus() {
      return a(e.get("/api/v1/hub/auth"));
    },
    authenticate(t) {
      return a(e.post("/api/v1/hub/auth", { token: t }));
    },
    logout() {
      return a(e.delete("/api/v1/hub/auth"));
    },
    async fetchAllByKeyword(t, r = 100, n = !1) {
      const i = (Array.isArray(t) ? t : [t]).map((c) => c.trim().toLowerCase()).filter(Boolean);
      if (i.length === 0) return [];
      const s = new Set(i), o = [], u = /* @__PURE__ */ new Set(), g = 50;
      function y(c) {
        const l = S(c)[0] || String(c.full_name || c.id || "").trim().toLowerCase();
        !l || u.has(l) || (u.add(l), o.push(c));
      }
      async function* d(c) {
        for (let l = 1; l <= g; l++) {
          const f = await a(e.get("/api/v1/keeper/hub/browse", {
            params: { ...c, page: l, page_size: r }
          })), b = f.items || [];
          if (yield b, typeof f.total == "number" && l * r >= f.total || b.length < r) return;
        }
      }
      for (const c of i)
        for await (const l of d({ q: c }))
          for (const f of l) {
            const b = (f.keywords || []).map((_) => String(_).trim().toLowerCase()), I = typeof f.org == "string" ? f.org : typeof f.organization == "string" ? f.organization : f.organization?.slug || f.organization?.name || String(f.full_name || "").split("/")[0], L = String(I || "").trim().toLowerCase();
            !b.some((_) => s.has(_)) && !s.has(L) || y(f);
          }
      const v = /* @__PURE__ */ new Set();
      for await (const c of d({ visibility: "private" }))
        for (const l of c) {
          for (const f of S(l)) v.add(f);
          n && y(l);
        }
      for (const c of o)
        S(c).some((l) => v.has(l)) && (c.visibility = "private");
      return o;
    }
  };
}
const E = "registry:v1:", N = 3e4, M = 250;
function ae(e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e) {
    if (r.name !== "required_setup" && r.short_name !== "required_setup") continue;
    const n = String(r.value ?? "").trim() || String(r.default ?? "").trim(), i = n.startsWith(E) ? n.slice(E.length) : "";
    if (!/^[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+$/.test(i))
      throw new p("INVALID_SETUP_DESCRIPTOR", "The module declares an invalid required setup descriptor.");
    t.add(i);
  }
  return [...t];
}
async function ue(e, t, r = {}) {
  const n = () => {
    if (r.isCurrent && !r.isCurrent())
      throw new p("INSTALL_SUPERSEDED", "Installation is closed or superseded.");
  };
  for (const i of t) {
    n(), r.onPhase?.("Checking required setup…");
    const s = Date.now() + N;
    let o;
    for (; !o; ) {
      n();
      try {
        const d = await e.requiredSetupStatus(i);
        n(), d.status !== "building" && (o = d);
      } catch (d) {
        if (!(d instanceof p) || d.status !== 404) throw d;
      }
      if (o) break;
      const y = s - Date.now();
      if (y <= 0)
        throw new p("SETUP_DESCRIPTOR_NOT_VISIBLE", "Required setup does not become available after installation.");
      await new Promise((d) => setTimeout(d, Math.min(M, y)));
    }
    if (o.success && o.ready && o.status === "ready") continue;
    n(), r.onPhase?.(o.pending_label || "Running required setup…");
    const u = await e.applyRequiredSetup(i);
    if (n(), !u.success || !u.ready || u.status !== "ready")
      throw new p("SETUP_INCOMPLETE", u.error || u.detail || "Required setup fails.", void 0, u);
    r.onPhase?.("Verifying required setup…");
    const g = await e.requiredSetupStatus(i);
    if (n(), !g.success || !g.ready || g.status !== "ready")
      throw new p("SETUP_POSTCONDITION_FAILED", g.error || g.detail || "Required setup fails verification.", void 0, g);
  }
}
export {
  ae as A,
  J as B,
  ue as C,
  T as D,
  D as E,
  O as F,
  A as G,
  p as K,
  q as a,
  U as b,
  B as c,
  te as d,
  se as e,
  re as f,
  S as g,
  V as h,
  ie as i,
  j,
  W as k,
  P as l,
  z as m,
  H as n,
  Z as o,
  ne as p,
  x as q,
  G as r,
  F as s,
  $ as t,
  oe as u,
  K as v,
  Q as w,
  X as x,
  Y as y,
  ee as z
};
//# sourceMappingURL=requiredSetup-BI-hhUXu.js.map

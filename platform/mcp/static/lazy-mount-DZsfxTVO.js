import We from "primevue/config";
import Ie from "primevue/contextmenu";
import je from "primevue/menu";
import qe from "primevue/portal";
import { renderSlot as Se, createCommentVNode as E, h as Ye, Teleport as Ke, ref as k, computed as R, defineComponent as Je, openBlock as u, createElementBlock as p, createElementVNode as i, createVNode as a, unref as t, withDirectives as se, vModelText as ae, withCtx as y, normalizeClass as x, toDisplayString as v, createTextVNode as S, Fragment as I, renderList as le, withModifiers as Xe, isRef as Ge, createBlock as Qe, withKeys as Ze } from "vue";
import { Icon as c } from "@iconify/vue";
import g from "primevue/button";
import Re from "primevue/dialog";
import { api as G, host as M } from "@wippy-fe/proxy";
import { a as et } from "./wc-runtime-BMe_f3Uc.js";
const tt = "data-wippy-overlay-layer";
function De() {
  return typeof window < "u" && typeof window.document < "u";
}
function ze() {
  return De() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function nt() {
  return ze() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const ot = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let it = 0;
const ce = /* @__PURE__ */ new WeakMap();
function Te(e, s) {
  const l = e.style;
  l.setProperty("position", "fixed", "important"), l.setProperty("inset", "auto", "important"), l.setProperty("margin", "0", "important"), l.setProperty("position-anchor", s), l.setProperty("position-area", "bottom span-right"), l.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), l.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), l.setProperty("max-width", "stretch", "important");
}
function st(e, s) {
  if (!ot.test(e.className))
    return;
  const l = e.style.cssText;
  Te(e, s), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = l;
    return;
  }
  if (!ce.has(e)) {
    const h = new MutationObserver(() => {
      const d = e.style;
      (d.top !== "auto" || d.left !== "auto" || d.margin !== "0px" || d.getPropertyPriority("top") !== "important" || d.getPropertyPriority("left") !== "important" || d.getPropertyPriority("margin") !== "important" || d.getPropertyPriority("min-width") !== "important" || d.maxWidth !== "stretch" || d.getPropertyPriority("max-width") !== "important") && Te(e, s);
    });
    h.observe(e, { attributes: !0, attributeFilter: ["style"] }), ce.set(e, h);
  }
}
function _e(e) {
  const s = ce.get(e);
  s && (s.disconnect(), ce.delete(e));
}
function at(e) {
  const s = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return s instanceof ShadowRoot ? s : null;
}
function xe(e) {
  e.style.top = "0px", e.style.left = "0px";
  const s = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - s.top}px`, e.style.left = `${-window.scrollX - s.left}px`;
}
const de = /* @__PURE__ */ new Set(), we = /* @__PURE__ */ new WeakMap();
let Ee = !1, ge = !1;
function lt() {
  ge = !1;
  for (const e of de) {
    if (!e.isConnected) {
      for (const s of Array.from(e.children))
        s instanceof HTMLElement && _e(s);
      de.delete(e), we.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && xe(e);
  }
}
function Pe() {
  ge || (ge = !0, requestAnimationFrame(lt));
}
function rt(e) {
  const s = document.createElement("div");
  s.setAttribute(tt, "");
  const l = ze();
  if (s.style.cssText = l ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", l && s.setAttribute("popover", "manual"), e.appendChild(s), l) {
    try {
      s.showPopover();
    } catch {
    }
    s.matches(":popover-open") || (s.removeAttribute("popover"), s.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  xe(s);
  const h = new MutationObserver((d) => {
    const b = s.__wippyAnchorName;
    for (const L of d) {
      if (b)
        for (const w of Array.from(L.addedNodes))
          w instanceof HTMLElement && st(w, b);
      for (const w of Array.from(L.removedNodes))
        w instanceof HTMLElement && _e(w);
    }
    s.isConnected && s.childElementCount > 0 && xe(s);
  });
  return h.observe(s, { childList: !0 }), we.set(s, h), de.add(s), Ee || (Ee = !0, window.addEventListener("scroll", Pe, { capture: !0, passive: !0 }), window.addEventListener("resize", Pe, { passive: !0 })), s;
}
function Oe(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = rt(e.hostRoot), nt())) {
    const s = e.$el ? e.$el.parentElement : null;
    s && (e.anchorName = `--wippy-a-${++it}`, e.anchorTrigger = s, s.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function $e(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const s of Array.from(e.layer.children))
      s instanceof HTMLElement && _e(s);
    de.delete(e.layer), we.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Me = !1;
function ct() {
  if (Me)
    return;
  const e = je;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (s) => {
      const l = s.composedPath(), h = this.container && !l.includes(this.container), d = !(this.target && l.includes(this.target));
      this.overlayVisible && h && d ? this.hide() : !this.popup && h && d && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Me = !0);
}
let Ne = !1;
function dt() {
  if (Ne)
    return;
  const e = Ie;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (s) => {
      const l = s.composedPath(), h = this.container && !l.includes(this.container), d = this.visible ? !(this.target && l.includes(this.target)) : !0;
      h && d && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Ne = !0);
}
let Ue = !1;
function ut() {
  if (Ue)
    return;
  Ue = !0;
  const e = qe;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    De() && (this.hostRoot = at(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Oe(this), this.$watch("inline", (s) => {
      s ? $e(this) : Oe(this);
    })));
  }, e.render = function() {
    return this.inline ? Se(this.$slots, "default", { key: 0 }) : this.mounted ? Ye(Ke, { key: 1, to: this.resolvedTarget || document.body }, [
      Se(this.$slots, "default")
    ]) : E("", !0);
  }, e.unmounted = function() {
    $e(this);
  };
}
const pt = {
  install: (e) => {
    ct(), dt(), ut(), e.use(We, { theme: "none" });
  }
};
function ht(e, s) {
  if (e && typeof e == "object") {
    const l = e, h = l.response?.data?.error;
    if (typeof h == "string") return h;
    if (h && typeof h == "object" && typeof h.message == "string")
      return h.message;
    if (typeof l.message == "string" && l.message) return l.message;
  }
  return s;
}
function P(e, s) {
  if (e && typeof e == "object") {
    const l = e;
    l.response?.status === 401 && M.handleError("auth-expired", l);
  }
  return ht(e, s);
}
async function ft() {
  try {
    const { data: e } = await G.get("/api/v1/mcp/credentials");
    if (!e?.success) throw new Error(e?.error || "failed to load credentials");
    return {
      credentials: e.credentials || [],
      mcpUrl: typeof e.mcp_url == "string" ? e.mcp_url : ""
    };
  } catch (e) {
    throw new Error(P(e, "could not load credentials"));
  }
}
async function mt(e) {
  try {
    const s = e ? `/api/v1/mcp/components?parent_id=${encodeURIComponent(e)}` : "/api/v1/mcp/components", { data: l } = await G.get(s);
    if (!l?.success) throw new Error(l?.error || "failed to load components");
    return l.components || [];
  } catch (s) {
    throw new Error(P(s, "could not load components"));
  }
}
async function vt(e) {
  try {
    const { data: s } = await G.post("/api/v1/mcp/credentials", e);
    if (!s?.success || !s.credential) throw new Error(s?.error || "create failed");
    return s.credential;
  } catch (s) {
    throw new Error(P(s, "could not create credential"));
  }
}
async function yt(e, s) {
  try {
    const { data: l } = await G.patch(`/api/v1/mcp/credentials/${e}`, s);
    if (!l?.success) throw new Error(l?.error || "update failed");
  } catch (l) {
    throw new Error(P(l, "could not update credential"));
  }
}
async function kt(e) {
  try {
    const { data: s } = await G.delete("/api/v1/mcp/credentials/" + e);
    if (!s?.success) throw new Error(s?.error || "delete failed");
  } catch (s) {
    throw new Error(P(s, "could not delete credential"));
  }
}
const bt = {
  folder: "tabler:folder",
  workspace: "tabler:folder",
  knowledge_base: "tabler:books",
  agent: "tabler:robot",
  connection: "tabler:plug",
  inbox: "tabler:inbox"
};
function xt({ credentials: e, reload: s }) {
  const l = k(!1), h = k(!1), d = k(""), b = k(null), L = k({ label: "", ttl: "", traits: [] }), w = k({}), C = k([]), A = k([]), j = k([]), N = k(!1), V = k(""), q = R(() => {
    const r = typeof location < "u" ? location.origin : "";
    return r && r !== "null" ? `${r.replace(/\/$/, "")}/api/public/mcp` : "/api/public/mcp";
  }), T = R(() => b.value?.mcp_url || e.value.find((r) => r.mcp_url)?.mcp_url || V.value || q.value), U = R(() => b.value ? JSON.stringify({ type: "streamable-http", url: T.value, headers: { Authorization: `Bearer ${b.value.token}` } }, null, 2) : ""), Q = R(() => b.value ? `claude mcp add --transport http kickside ${T.value} --header "Authorization: Bearer ${b.value.token}"` : ""), ue = R(() => JSON.stringify({
    traits: L.value.traits,
    trait_contexts: w.value
  }));
  async function $(r, m) {
    N.value = !0;
    try {
      j.value = await mt(r), m && A.value.push(m);
    } catch (O) {
      j.value = [], d.value = P(O, "could not load components");
    } finally {
      N.value = !1;
    }
  }
  function pe() {
    L.value = { label: "", ttl: "", traits: [] }, w.value = {}, C.value = [], A.value = [], d.value = "", b.value = null, l.value = !0, $(void 0, null);
  }
  function he() {
    l.value = !1, b.value = null, d.value = "";
  }
  function F(r) {
    const m = A.value[r];
    A.value = A.value.slice(0, r), $(m?.id, m || null);
  }
  function Z() {
    A.value = [], $(void 0, null);
  }
  function ee(r) {
    $(r.id, { id: r.id, name: r.name || "" });
  }
  const H = R(() => A.value.length ? A.value[A.value.length - 1] : null);
  function D(r) {
    return C.value.some((m) => m.id === r);
  }
  const z = R(() => A.value.length === 0), fe = R(() => z.value ? C.value.length === 0 : D(H.value.id)), te = R(() => z.value ? C.value.length === 0 ? "Home — full account" : "Scope to home" : D(H.value.id) ? "Added" : "Add this folder");
  function me() {
    z.value ? C.value = [] : Y(H.value);
  }
  function Y(r) {
    D(r.id) ? C.value = C.value.filter((m) => m.id !== r.id) : C.value.push({ id: r.id, name: r.name || "" });
  }
  function B(r) {
    C.value = C.value.filter((m) => m.id !== r);
  }
  function ve(r) {
    return r.class && bt[r.class] || "tabler:box";
  }
  function K(r) {
    const m = r.detail;
    !Array.isArray(m?.traits) || !m.trait_contexts || typeof m.trait_contexts != "object" || Array.isArray(m.trait_contexts) || (L.value.traits = m.traits.filter((O) => typeof O == "string"), w.value = m.trait_contexts);
  }
  async function ne() {
    const r = L.value.label.trim();
    if (!r) {
      d.value = "A label is required so you can recognize this credential later.";
      return;
    }
    h.value = !0, d.value = "";
    try {
      const m = parseInt(L.value.ttl, 10), O = await vt({
        whitelist_component_ids: C.value.map((ye) => ye.id),
        label: r,
        allowed_trait_ids: L.value.traits,
        default_active_trait_ids: L.value.traits,
        agent_profile: { trait_contexts: w.value },
        expires_at: m > 0 ? Math.floor(Date.now() / 1e3) + m * 86400 : void 0
      });
      b.value = O, M.toast({ severity: "success", summary: "Credential created", detail: O.label || O.token_prefix }), await s();
    } catch (m) {
      d.value = P(m, "create failed");
    } finally {
      h.value = !1;
    }
  }
  return {
    createOpen: l,
    saving: h,
    formError: d,
    minted: b,
    form: L,
    whitelist: C,
    crumbs: A,
    children: j,
    browsing: N,
    serverMcpUrl: V,
    browserOrigin: q,
    mcpUrl: T,
    snippet: U,
    claudeCodeCmd: Q,
    traitPickerValue: ue,
    openCreate: pe,
    closeCreate: he,
    browse: $,
    crumbTo: F,
    crumbRoot: Z,
    openFolder: ee,
    currentFolder: H,
    inWhitelist: D,
    atRoot: z,
    scopeActive: fe,
    scopeLabel: te,
    addScope: me,
    toggleWhitelist: Y,
    removeWhitelist: B,
    classIcon: ve,
    onTraitPickerChange: K,
    submit: ne
  };
}
const gt = {
  active: "Active",
  revoked: "Revoked"
};
function _t(e) {
  return e ? gt[e] ?? e : "";
}
function re(e) {
  return (e.name || "").trim() || "Unknown component";
}
const wt = { class: "kx" }, Ct = { class: "kx-head" }, Lt = { class: "kx-head-icon" }, At = { class: "kx-head-actions" }, St = { class: "kx-search" }, Rt = { class: "kx-connect-strip" }, Tt = { class: "kx-connect-url" }, Et = {
  key: 0,
  class: "kx-err"
}, Pt = { class: "kx-body" }, Ot = {
  key: 0,
  class: "kx-loading"
}, $t = {
  key: 1,
  class: "kx-empty"
}, Mt = { class: "kx-empty-ico" }, Nt = { class: "kx-empty-actions" }, Ut = {
  key: 2,
  class: "kx-empty"
}, Dt = { class: "kx-empty-ico" }, zt = { class: "kx-empty-actions" }, Vt = {
  key: 3,
  class: "kx-grid"
}, Ft = { class: "kx-card-head" }, Ht = { class: "kx-ficon" }, Bt = { class: "kx-card-id" }, Wt = ["title"], It = { class: "kx-card-meta" }, jt = {
  key: 0,
  class: "kx-chip kx-tag-sm kx-ver"
}, qt = { class: "kx-card-desc" }, Yt = { key: 0 }, Kt = { key: 1 }, Jt = { class: "kx-modal-head-icon" }, Xt = { class: "kx-modal-head-text" }, Gt = { class: "kx-modal-head-title" }, Qt = { class: "kx-modal-head-sub" }, Zt = {
  key: 0,
  class: "kx-modal-body"
}, en = { class: "kx-field-row" }, tn = { class: "kx-field" }, nn = { class: "kx-field" }, on = { class: "kx-field" }, sn = {
  key: 0,
  class: "kx-scope-chips"
}, an = { class: "kx-scope-chip-name" }, ln = {
  key: 0,
  class: "kx-id"
}, rn = ["onClick"], cn = {
  key: 1,
  class: "kx-scope-note"
}, dn = { key: 0 }, un = { key: 1 }, pn = { class: "kx-browser" }, hn = { class: "kx-crumbs" }, fn = { key: 0 }, mn = ["title", "onClick"], vn = { class: "kx-browser-list" }, yn = {
  key: 0,
  class: "kx-tool-empty"
}, kn = {
  key: 1,
  class: "kx-tool-empty"
}, bn = ["onClick"], xn = {
  key: 0,
  class: "kx-id"
}, gn = ["value", "refresh-key"], _n = {
  key: 0,
  class: "kx-err inline"
}, wn = {
  key: 1,
  class: "kx-modal-body"
}, Cn = { class: "kx-field" }, Ln = { class: "kx-token" }, An = { class: "kx-field" }, Sn = { class: "kx-token" }, Rn = { class: "kx-field" }, Tn = { class: "kx-snip" }, En = { class: "kx-field" }, Pn = { class: "kx-snip" }, On = { class: "kx-connect-note" }, $n = { class: "kx-modal-body" }, Mn = { class: "kx-field" }, Nn = /* @__PURE__ */ Je({
  __name: "mcp",
  setup(e) {
    const s = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, l = k(!1), h = k(""), d = k([]), b = k(""), L = k(0);
    let w = 0, C = !1;
    const A = R(() => {
      const f = b.value.trim().toLowerCase();
      return f ? d.value.filter((o) => (o.label || "").toLowerCase().includes(f)) : d.value;
    }), j = xt({ credentials: d, reload: () => oe() }), {
      createOpen: N,
      saving: V,
      formError: q,
      minted: T,
      form: U,
      whitelist: Q,
      crumbs: ue,
      children: $,
      browsing: pe,
      serverMcpUrl: he,
      mcpUrl: F,
      snippet: Z,
      claudeCodeCmd: ee,
      traitPickerValue: H,
      openCreate: D,
      closeCreate: z,
      crumbTo: fe,
      crumbRoot: te,
      openFolder: me,
      currentFolder: Y,
      inWhitelist: B,
      atRoot: ve,
      scopeActive: K,
      scopeLabel: ne,
      addScope: r,
      toggleWhitelist: m,
      removeWhitelist: O,
      classIcon: ye,
      onTraitPickerChange: Ce,
      submit: Ve
    } = j;
    async function oe() {
      const f = ++w;
      l.value = !0, h.value = "";
      try {
        const o = await ft();
        f === w && (d.value = o.credentials, o.mcpUrl && (he.value = o.mcpUrl));
      } catch (o) {
        f === w && (d.value = [], h.value = P(o, "could not load credentials"));
      } finally {
        f === w && (l.value = !1);
      }
    }
    function Fe(f) {
      if (!f) return "";
      const o = Math.max(0, Math.round(Date.now() / 1e3 - f));
      if (o < 60) return "just now";
      const n = Math.round(o / 60);
      if (n < 60) return `${n}m ago`;
      const _ = Math.round(n / 60);
      if (_ < 24) return `${_}h ago`;
      const be = Math.round(_ / 24);
      return be < 30 ? `${be}d ago` : new Date(f * 1e3).toLocaleDateString();
    }
    const ie = k(null), W = k(""), J = k(!1);
    function He(f) {
      ie.value = f, W.value = f.label || "";
    }
    function ke() {
      ie.value = null, W.value = "";
    }
    async function Le() {
      const f = ie.value;
      if (!f) return;
      const o = W.value.trim();
      if (o) {
        J.value = !0;
        try {
          await yt(f.credential_id, { label: o }), M.toast({ severity: "success", summary: "Renamed", detail: o }), ke(), await oe();
        } catch (n) {
          h.value = P(n, "rename failed");
        } finally {
          J.value = !1;
        }
      }
    }
    async function X(f, o) {
      try {
        await navigator.clipboard.writeText(f), M.toast({ severity: "success", summary: "Copied", detail: o });
      } catch {
        M.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    async function Be(f) {
      if (await M.confirm({
        message: `Delete “${f.label || f.token_prefix}”? This permanently removes the credential and its token. This can't be undone.`,
        header: "Delete credential",
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await kt(f.credential_id), M.toast({ severity: "success", summary: "Deleted", detail: f.label || f.token_prefix }), await oe();
        } catch (n) {
          h.value = P(n, "delete failed"), M.toast({ severity: "error", summary: "Delete failed", detail: h.value });
        }
    }
    const Ae = R({
      get: () => ie.value !== null,
      set: (f) => {
        f || ke();
      }
    });
    return et(async () => {
      C && (L.value += 1), C = !0, await oe();
    }), (f, o) => (u(), p("div", wt, [
      i("header", Ct, [
        i("div", Lt, [
          a(t(c), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        o[15] || (o[15] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "MCP credentials"),
          i("p", { class: "kx-head-sub" }, "Tokens an agent can use to act as you, optionally scoped to components you pick.")
        ], -1)),
        i("div", At, [
          i("div", St, [
            a(t(c), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            se(i("input", {
              "onUpdate:modelValue": o[0] || (o[0] = (n) => b.value = n),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search credentials…",
              "aria-label": "Search credentials"
            }, null, 512), [
              [ae, b.value]
            ])
          ]),
          a(t(g), {
            type: "button",
            label: "New credential",
            onClick: t(D)
          }, {
            icon: y(({ class: n }) => [
              a(t(c), {
                icon: "tabler:plus",
                class: x(n),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["onClick"])
        ])
      ]),
      i("div", Rt, [
        a(t(c), {
          icon: "tabler:world",
          "aria-hidden": "true"
        }),
        o[16] || (o[16] = i("span", { class: "kx-connect-lbl" }, "Endpoint", -1)),
        i("code", Tt, v(t(F)), 1),
        a(t(g), {
          type: "button",
          severity: "secondary",
          outlined: "",
          size: "small",
          title: "Copy endpoint URL",
          "aria-label": "Copy endpoint URL",
          onClick: o[1] || (o[1] = (n) => X(t(F), "endpoint URL"))
        }, {
          icon: y(({ class: n }) => [
            a(t(c), {
              icon: "tabler:copy",
              class: x(n),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }),
        o[17] || (o[17] = i("span", { class: "kx-connect-hint" }, "Claude (claude.ai): Settings → Connectors → Add custom connector → paste this URL — sign-in happens here via OAuth, no token needed. Tokens below are for clients without OAuth.", -1))
      ]),
      h.value ? (u(), p("div", Et, v(h.value), 1)) : E("", !0),
      i("div", Pt, [
        l.value && !d.value.length ? (u(), p("div", Ot, [
          a(t(c), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          o[18] || (o[18] = S(" Loading…", -1))
        ])) : d.value.length ? A.value.length ? (u(), p("div", Vt, [
          (u(!0), p(I, null, le(A.value, (n) => (u(), p("div", {
            key: n.credential_id,
            class: "kx-card"
          }, [
            i("div", Ft, [
              i("span", Ht, [
                a(t(c), {
                  icon: "tabler:plug-connected",
                  "aria-hidden": "true"
                })
              ]),
              i("div", Bt, [
                i("div", {
                  class: "kx-card-name",
                  title: n.label || "(unlabeled)"
                }, v(n.label || "(unlabeled)"), 9, Wt),
                i("div", It, [
                  i("span", {
                    class: x(["kx-chip kx-tag-sm", (n.whitelist_component_ids?.length || 0) > 0 ? "kx-scope" : "kx-ver"])
                  }, [
                    a(t(c), {
                      icon: (n.whitelist_component_ids?.length || 0) > 0 ? "tabler:lock" : "tabler:world",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    S(" " + v((n.whitelist_component_ids?.length || 0) > 0 ? `${n.whitelist_component_ids.length} scoped` : "full account"), 1)
                  ], 2),
                  (n.allowed_trait_ids?.length || 0) > 0 ? (u(), p("span", jt, [
                    a(t(c), {
                      icon: "tabler:puzzle",
                      "aria-hidden": "true"
                    }),
                    S(" " + v(n.allowed_trait_ids.length) + " " + v(n.allowed_trait_ids.length === 1 ? "capability" : "capabilities"), 1)
                  ])) : E("", !0),
                  i("span", {
                    class: x(["kx-chip kx-tag-sm kx-status", n.status === "active" ? "kx-status-on" : "kx-status-off"])
                  }, v(t(_t)(n.status)), 3)
                ])
              ]),
              i("div", {
                class: "kx-card-actions",
                onClick: o[3] || (o[3] = Xe(() => {
                }, ["stop"]))
              }, [
                a(t(g), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Rename",
                  "aria-label": "Rename",
                  onClick: (_) => He(n)
                }, {
                  icon: y(({ class: _ }) => [
                    a(t(c), {
                      icon: "tabler:pencil",
                      class: x(_),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                a(t(g), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": "Delete",
                  onClick: (_) => Be(n)
                }, {
                  icon: y(({ class: _ }) => [
                    a(t(c), {
                      icon: "tabler:trash",
                      class: x(_),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ])
            ]),
            i("div", qt, [
              i("code", null, v(n.token_prefix) + "…", 1),
              n.last_used_at ? (u(), p("span", Yt, " · used " + v(Fe(n.last_used_at)), 1)) : E("", !0),
              n.expires_at ? (u(), p("span", Kt, " · expires " + v(new Date(n.expires_at * 1e3).toLocaleDateString()), 1)) : E("", !0)
            ])
          ]))), 128))
        ])) : (u(), p("div", Ut, [
          i("div", Dt, [
            a(t(c), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          o[21] || (o[21] = i("div", { class: "kx-empty-title" }, "No matches", -1)),
          i("div", zt, [
            a(t(g), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: o[2] || (o[2] = (n) => b.value = "")
            }, {
              icon: y(({ class: n }) => [
                a(t(c), {
                  icon: "tabler:x",
                  class: x(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (u(), p("div", $t, [
          i("div", Mt, [
            a(t(c), {
              icon: "tabler:plug-connected",
              "aria-hidden": "true"
            })
          ]),
          o[19] || (o[19] = i("div", { class: "kx-empty-title" }, "No credentials yet", -1)),
          o[20] || (o[20] = i("div", { class: "kx-empty-sub" }, "Mint a token an agent can use to act as you — scoped to the components and capabilities you choose.", -1)),
          i("div", Nt, [
            a(t(g), {
              type: "button",
              label: "New credential",
              onClick: t(D)
            }, {
              icon: y(({ class: n }) => [
                a(t(c), {
                  icon: "tabler:plus",
                  class: x(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["onClick"])
          ])
        ]))
      ]),
      a(t(Re), {
        visible: t(N),
        "onUpdate:visible": o[12] || (o[12] = (n) => Ge(N) ? N.value = n : null),
        modal: "",
        class: "kx-dialog kx-modal-xl",
        "aria-label": "New MCP credential",
        pt: s
      }, {
        header: y(() => [
          i("span", Jt, [
            a(t(c), {
              icon: "tabler:plug-connected",
              "aria-hidden": "true"
            })
          ]),
          i("span", Xt, [
            i("span", Gt, v(t(T) ? "Credential created" : "New credential"), 1),
            i("span", Qt, v(t(T) ? "Copy the token now — it is shown once." : "Scope it, name it, pick its capabilities."), 1)
          ])
        ]),
        footer: y(() => [
          t(T) ? (u(), Qe(t(g), {
            key: 1,
            type: "button",
            label: "Done",
            onClick: t(z)
          }, {
            icon: y(({ class: n }) => [
              a(t(c), {
                icon: "tabler:check",
                class: x(n),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["onClick"])) : (u(), p(I, { key: 0 }, [
            a(t(g), {
              type: "button",
              label: "Cancel",
              severity: "secondary",
              outlined: "",
              disabled: t(V),
              onClick: t(z)
            }, null, 8, ["disabled", "onClick"]),
            a(t(g), {
              type: "button",
              label: "Create credential",
              loading: t(V),
              disabled: t(V) || !t(U).label.trim(),
              onClick: t(Ve)
            }, {
              icon: y(({ class: n }) => [
                a(t(c), {
                  icon: "tabler:check",
                  class: x(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled", "onClick"])
          ], 64))
        ]),
        default: y(() => [
          t(T) ? (u(), p("div", wn, [
            i("div", Cn, [
              o[26] || (o[26] = i("span", { class: "kx-field-lbl" }, [
                S("Endpoint URL "),
                i("span", { class: "kx-field-hint-inline" }, "— public MCP endpoint")
              ], -1)),
              i("div", Ln, [
                i("code", null, v(t(F)), 1),
                a(t(g), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy URL",
                  "aria-label": "Copy URL",
                  onClick: o[8] || (o[8] = (n) => X(t(F), "endpoint URL"))
                }, {
                  icon: y(({ class: n }) => [
                    a(t(c), {
                      icon: "tabler:copy",
                      class: x(n),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            i("div", An, [
              o[27] || (o[27] = i("span", { class: "kx-field-lbl" }, [
                S("Bearer token "),
                i("span", { class: "kx-field-hint-inline" }, "— shown once")
              ], -1)),
              i("div", Sn, [
                i("code", null, v(t(T).token), 1),
                a(t(g), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy token",
                  "aria-label": "Copy token",
                  onClick: o[9] || (o[9] = (n) => X(t(T).token, "token"))
                }, {
                  icon: y(({ class: n }) => [
                    a(t(c), {
                      icon: "tabler:copy",
                      class: x(n),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            i("div", Rn, [
              o[28] || (o[28] = i("span", { class: "kx-field-lbl" }, [
                S("Claude Code "),
                i("span", { class: "kx-field-hint-inline" }, "— one command")
              ], -1)),
              i("div", Tn, [
                i("pre", null, v(t(ee)), 1),
                a(t(g), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy command",
                  "aria-label": "Copy command",
                  onClick: o[10] || (o[10] = (n) => X(t(ee), "command"))
                }, {
                  icon: y(({ class: n }) => [
                    a(t(c), {
                      icon: "tabler:copy",
                      class: x(n),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            i("div", En, [
              o[29] || (o[29] = i("span", { class: "kx-field-lbl" }, [
                S("Other clients "),
                i("span", { class: "kx-field-hint-inline" }, "— streamable-http config")
              ], -1)),
              i("div", Pn, [
                i("pre", null, v(t(Z)), 1),
                a(t(g), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy config",
                  "aria-label": "Copy config",
                  onClick: o[11] || (o[11] = (n) => X(t(Z), "config"))
                }, {
                  icon: y(({ class: n }) => [
                    a(t(c), {
                      icon: "tabler:copy",
                      class: x(n),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            i("div", On, [
              a(t(c), {
                icon: "tabler:info-circle",
                "aria-hidden": "true"
              }),
              o[30] || (o[30] = i("span", null, "Connecting from Claude (claude.ai)? You don't need this token — add the endpoint URL as a custom connector and approve the OAuth consent instead.", -1))
            ])
          ])) : (u(), p("div", Zt, [
            i("div", en, [
              i("label", tn, [
                o[22] || (o[22] = i("span", { class: "kx-field-lbl" }, "Label", -1)),
                se(i("input", {
                  "onUpdate:modelValue": o[4] || (o[4] = (n) => t(U).label = n),
                  class: "kx-input",
                  type: "text",
                  placeholder: "research-agent"
                }, null, 512), [
                  [ae, t(U).label]
                ])
              ]),
              i("label", nn, [
                o[23] || (o[23] = i("span", { class: "kx-field-lbl" }, [
                  S("Expires "),
                  i("span", { class: "kx-field-hint-inline" }, "— days")
                ], -1)),
                se(i("input", {
                  "onUpdate:modelValue": o[5] || (o[5] = (n) => t(U).ttl = n),
                  class: "kx-input",
                  type: "number",
                  min: "1",
                  placeholder: "never"
                }, null, 512), [
                  [ae, t(U).ttl]
                ])
              ])
            ]),
            i("div", on, [
              o[25] || (o[25] = i("span", { class: "kx-field-lbl" }, [
                S("Scope "),
                i("span", { class: "kx-field-hint-inline" }, "— leave empty for full account, or add components to confine it")
              ], -1)),
              t(Q).length ? (u(), p("div", sn, [
                (u(!0), p(I, null, le(t(Q), (n) => (u(), p("span", {
                  key: n.id,
                  class: "kx-scope-chip"
                }, [
                  a(t(c), {
                    icon: "tabler:lock",
                    "aria-hidden": "true"
                  }),
                  i("span", an, [
                    S(v(t(re)(n)), 1),
                    n.name ? E("", !0) : (u(), p("span", ln, v(n.id), 1))
                  ]),
                  i("button", {
                    class: "kx-scope-chip-x",
                    title: "Remove",
                    "aria-label": "Remove",
                    onClick: (_) => t(O)(n.id)
                  }, [
                    a(t(c), {
                      icon: "tabler:x",
                      "aria-hidden": "true"
                    })
                  ], 8, rn)
                ]))), 128))
              ])) : (u(), p("div", cn, [
                a(t(c), {
                  icon: "tabler:world",
                  "aria-hidden": "true"
                }),
                t(Y) ? (u(), p("span", dn, 'Full account so far — nothing scoped yet. Use "' + v(t(ne)) + '" to confine it to ' + v(t(re)(t(Y))) + ".", 1)) : (u(), p("span", un, "Full account — reaches everything you can."))
              ])),
              i("div", pn, [
                i("div", hn, [
                  i("button", {
                    class: "kx-crumb",
                    "aria-label": "Home",
                    onClick: o[6] || (o[6] = //@ts-ignore
                    (...n) => t(te) && t(te)(...n))
                  }, [
                    a(t(c), {
                      icon: "tabler:home",
                      "aria-hidden": "true"
                    }),
                    t(ve) ? (u(), p("span", fn, "Home")) : E("", !0)
                  ]),
                  (u(!0), p(I, null, le(t(ue), (n, _) => (u(), p(I, {
                    key: n.id
                  }, [
                    a(t(c), {
                      icon: "tabler:chevron-right",
                      class: "kx-crumb-sep",
                      "aria-hidden": "true"
                    }),
                    i("button", {
                      class: "kx-crumb",
                      title: n.name ? void 0 : n.id,
                      onClick: (be) => t(fe)(_)
                    }, v(t(re)(n)), 9, mn)
                  ], 64))), 128)),
                  a(t(g), {
                    type: "button",
                    size: "small",
                    class: "kx-crumb-add",
                    severity: t(K) ? void 0 : "secondary",
                    outlined: !t(K),
                    label: t(ne),
                    onClick: t(r)
                  }, {
                    icon: y(({ class: n }) => [
                      a(t(c), {
                        icon: t(K) ? "tabler:check" : "tabler:plus",
                        class: x(n),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"])
                    ]),
                    _: 1
                  }, 8, ["severity", "outlined", "label", "onClick"])
                ]),
                i("div", vn, [
                  t(pe) ? (u(), p("div", yn, [
                    a(t(c), {
                      icon: "tabler:loader-2",
                      class: "spin",
                      "aria-hidden": "true"
                    }),
                    o[24] || (o[24] = S(" Loading…", -1))
                  ])) : t($).length ? E("", !0) : (u(), p("div", kn, "Nothing here.")),
                  (u(!0), p(I, null, le(t($), (n) => (u(), p("div", {
                    key: n.id,
                    class: "kx-browse-row"
                  }, [
                    i("button", {
                      class: "kx-browse-open",
                      onClick: (_) => t(me)(n),
                      title: "Open"
                    }, [
                      a(t(c), {
                        icon: t(ye)(n),
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      i("span", null, [
                        S(v(t(re)(n)), 1),
                        n.name?.trim() ? E("", !0) : (u(), p("span", xn, v(n.id), 1))
                      ])
                    ], 8, bn),
                    a(t(g), {
                      type: "button",
                      size: "small",
                      severity: t(B)(n.id) ? void 0 : "secondary",
                      outlined: !t(B)(n.id),
                      label: t(B)(n.id) ? "Added" : "Add",
                      onClick: (_) => t(m)(n)
                    }, {
                      icon: y(({ class: _ }) => [
                        a(t(c), {
                          icon: t(B)(n.id) ? "tabler:check" : "tabler:plus",
                          class: x(_),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"])
                      ]),
                      _: 2
                    }, 1032, ["severity", "outlined", "label", "onClick"])
                  ]))), 128))
                ])
              ])
            ]),
            i("wc-agent-trait-picker", {
              value: t(H),
              "refresh-key": L.value,
              "keep-menu-open-on-add": "",
              onChange: o[7] || (o[7] = //@ts-ignore
              (...n) => t(Ce) && t(Ce)(...n))
            }, null, 40, gn),
            t(q) ? (u(), p("div", _n, v(t(q)), 1)) : E("", !0)
          ]))
        ]),
        _: 1
      }, 8, ["visible"]),
      a(t(Re), {
        visible: Ae.value,
        "onUpdate:visible": o[14] || (o[14] = (n) => Ae.value = n),
        modal: "",
        class: "kx-dialog",
        header: "Rename credential",
        "aria-label": "Rename credential",
        pt: s
      }, {
        footer: y(() => [
          a(t(g), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: J.value,
            onClick: ke
          }, null, 8, ["disabled"]),
          a(t(g), {
            type: "button",
            label: "Save",
            loading: J.value,
            disabled: J.value || !W.value.trim(),
            onClick: Le
          }, {
            icon: y(({ class: n }) => [
              a(t(c), {
                icon: "tabler:check",
                class: x(n),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ]),
        default: y(() => [
          i("div", $n, [
            i("div", Mn, [
              o[31] || (o[31] = i("span", { class: "kx-field-lbl" }, "Label", -1)),
              se(i("input", {
                "onUpdate:modelValue": o[13] || (o[13] = (n) => W.value = n),
                class: "kx-input",
                type: "text",
                placeholder: "A name you'll recognize",
                onKeydown: Ze(Le, ["enter"])
              }, null, 544), [
                [ae, W.value]
              ])
            ])
          ])
        ]),
        _: 1
      }, 8, ["visible"])
    ]));
  }
}), qn = {
  rootComponent: Nn,
  plugins: [pt]
};
export {
  qn as mountConfig
};
//# sourceMappingURL=lazy-mount-DZsfxTVO.js.map

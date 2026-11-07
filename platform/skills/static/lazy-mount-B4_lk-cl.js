import Ke from "primevue/config";
import qe from "primevue/contextmenu";
import We from "primevue/menu";
import Ye from "primevue/portal";
import { renderSlot as _e, createCommentVNode as x, h as Ge, Teleport as Je, defineComponent as ie, computed as re, openBlock as p, createElementBlock as v, withModifiers as W, Fragment as Y, createElementVNode as o, createTextVNode as N, toDisplayString as y, createVNode as d, unref as u, watch as pe, onBeforeUnmount as je, ref as w, onMounted as Xe, createBlock as Qe, withDirectives as Z, vModelText as ee, withCtx as A, normalizeClass as P, renderList as se, withKeys as ge } from "vue";
import T from "primevue/button";
import Ze from "primevue/progressspinner";
import { _ as et } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as tt, api as V, host as I, loadByTagName as Pe } from "@wippy-fe/proxy";
import { a as nt } from "./wc-runtime-ClNbKZcC.js";
import { Icon as S } from "@iconify/vue";
import it from "primevue/dialog";
import ot from "primevue/select";
const lt = "data-wippy-overlay-layer";
function Oe() {
  return typeof window < "u" && typeof window.document < "u";
}
function Ne() {
  return Oe() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function st() {
  return Ne() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const at = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let rt = 0;
const te = /* @__PURE__ */ new WeakMap();
function xe(e, n) {
  const l = e.style;
  l.setProperty("position", "fixed", "important"), l.setProperty("inset", "auto", "important"), l.setProperty("margin", "0", "important"), l.setProperty("position-anchor", n), l.setProperty("position-area", "bottom span-right"), l.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), l.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), l.setProperty("max-width", "stretch", "important");
}
function ct(e, n) {
  if (!at.test(e.className))
    return;
  const l = e.style.cssText;
  xe(e, n), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = l;
    return;
  }
  if (!te.has(e)) {
    const c = new MutationObserver(() => {
      const s = e.style;
      (s.top !== "auto" || s.left !== "auto" || s.margin !== "0px" || s.getPropertyPriority("top") !== "important" || s.getPropertyPriority("left") !== "important" || s.getPropertyPriority("margin") !== "important" || s.getPropertyPriority("min-width") !== "important" || s.maxWidth !== "stretch" || s.getPropertyPriority("max-width") !== "important") && xe(e, n);
    });
    c.observe(e, { attributes: !0, attributeFilter: ["style"] }), te.set(e, c);
  }
}
function ve(e) {
  const n = te.get(e);
  n && (n.disconnect(), te.delete(e));
}
function dt(e) {
  const n = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return n instanceof ShadowRoot ? n : null;
}
function ce(e) {
  e.style.top = "0px", e.style.left = "0px";
  const n = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - n.top}px`, e.style.left = `${-window.scrollX - n.left}px`;
}
const ne = /* @__PURE__ */ new Set(), fe = /* @__PURE__ */ new WeakMap();
let we = !1, de = !1;
function ut() {
  de = !1;
  for (const e of ne) {
    if (!e.isConnected) {
      for (const n of Array.from(e.children))
        n instanceof HTMLElement && ve(n);
      ne.delete(e), fe.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && ce(e);
  }
}
function Ce() {
  de || (de = !0, requestAnimationFrame(ut));
}
function pt(e) {
  const n = document.createElement("div");
  n.setAttribute(lt, "");
  const l = Ne();
  if (n.style.cssText = l ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", l && n.setAttribute("popover", "manual"), e.appendChild(n), l) {
    try {
      n.showPopover();
    } catch {
    }
    n.matches(":popover-open") || (n.removeAttribute("popover"), n.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  ce(n);
  const c = new MutationObserver((s) => {
    const r = n.__wippyAnchorName;
    for (const b of s) {
      if (r)
        for (const L of Array.from(b.addedNodes))
          L instanceof HTMLElement && ct(L, r);
      for (const L of Array.from(b.removedNodes))
        L instanceof HTMLElement && ve(L);
    }
    n.isConnected && n.childElementCount > 0 && ce(n);
  });
  return c.observe(n, { childList: !0 }), fe.set(n, c), ne.add(n), we || (we = !0, window.addEventListener("scroll", Ce, { capture: !0, passive: !0 }), window.addEventListener("resize", Ce, { passive: !0 })), n;
}
function Se(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = pt(e.hostRoot), st())) {
    const n = e.$el ? e.$el.parentElement : null;
    n && (e.anchorName = `--wippy-a-${++rt}`, e.anchorTrigger = n, n.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Le(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const n of Array.from(e.layer.children))
      n instanceof HTMLElement && ve(n);
    ne.delete(e.layer), fe.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Ee = !1;
function vt() {
  if (Ee)
    return;
  const e = We;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (n) => {
      const l = n.composedPath(), c = this.container && !l.includes(this.container), s = !(this.target && l.includes(this.target));
      this.overlayVisible && c && s ? this.hide() : !this.popup && c && s && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Ee = !0);
}
let $e = !1;
function ft() {
  if ($e)
    return;
  const e = qe;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (n) => {
      const l = n.composedPath(), c = this.container && !l.includes(this.container), s = this.visible ? !(this.target && l.includes(this.target)) : !0;
      c && s && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, $e = !0);
}
let Ae = !1;
function ht() {
  if (Ae)
    return;
  Ae = !0;
  const e = Ye;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Oe() && (this.hostRoot = dt(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Se(this), this.$watch("inline", (n) => {
      n ? Le(this) : Se(this);
    })));
  }, e.render = function() {
    return this.inline ? _e(this.$slots, "default", { key: 0 }) : this.mounted ? Ge(Je, { key: 1, to: this.resolvedTarget || document.body }, [
      _e(this.$slots, "default")
    ]) : x("", !0);
  }, e.unmounted = function() {
    Le(this);
  };
}
const mt = {
  install: (e) => {
    vt(), ft(), ht(), e.use(Ke, { theme: "none" });
  }
}, kt = { key: 0 }, yt = /* @__PURE__ */ ie({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const n = e, l = re(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (c, s) => e.state.deleting_at ? (p(), v("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: s[1] || (s[1] = W(() => {
      }, ["stop"])),
      onKeydown: s[2] || (s[2] = W(() => {
      }, ["stop"]))
    }, [
      l.value ? (p(), v(Y, { key: 0 }, [
        o("span", null, [
          s[3] || (s[3] = N("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (p(), v("span", kt, ": " + y(e.state.deletion_job.last_error), 1)) : x("", !0)
        ]),
        d(u(T), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: s[0] || (s[0] = W((r) => c.$emit("retry"), ["stop"]))
        })
      ], 64)) : (p(), v(Y, { key: 1 }, [
        d(u(Ze), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        s[4] || (s[4] = o("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : x("", !0);
  }
}), bt = /* @__PURE__ */ et(yt, [["__scopeId", "data-v-63c136c7"]]);
function q(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function _t(e, n) {
  return e;
}
function gt(e, n, l) {
  const c = q(e) ? e : {}, s = [
    c,
    q(c.data) ? c.data : null,
    q(c.payload) ? c.payload : null,
    q(c.detail) ? c.detail : null
  ].filter(Boolean);
  for (const r of s) {
    if (r.event !== "component.meta.changed" && r.event !== "component.deleting" && r.event !== "component.deleted") continue;
    const b = String(r.component_id || ""), L = String(c.topic || r.topic || "");
    if (!b && (!L.startsWith("component.") || L === "component.")) continue;
    const E = b || n || L.slice(10);
    return r.event === "component.deleting" && typeof r.deletion_job_id == "string" && r.deletion_job_id ? { event: r.event, component_id: E, deletion_job_id: r.deletion_job_id } : r.event !== "component.meta.changed" ? { event: r.event, component_id: E } : {
      event: "component.meta.changed",
      component_id: E,
      meta: _t(q(r.meta) ? r.meta : {}),
      deleted: Array.isArray(r.deleted) ? r.deleted.map(String) : []
    };
  }
  return null;
}
function xt(e, n) {
  const l = gt(e, n);
  return l && l.event !== "component.meta.changed" ? l : null;
}
function ue(e, n) {
  if (e && typeof e == "object") {
    const l = e, c = l.response?.data?.error;
    if (typeof c == "string") return c;
    if (c && typeof c == "object" && typeof c.message == "string")
      return c.message;
    if (typeof l.message == "string" && l.message) return l.message;
  }
  return n;
}
function wt(e, n, l, c) {
  let s = !0;
  const r = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Map();
  function L(h, _) {
    const m = e.value.find((G) => n(G) === h), f = b.get(h), C = _?.job_id || f?.deletion_job_id || m?.deletion_job_id, j = f ? f.deletion_job_id : m?.deleting_at ? m.deletion_job_id : void 0;
    if ((f || m?.deleting_at) && C === j) return;
    const O = {
      deleting_at: f?.deleting_at || m?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: C
    };
    b.set(h, O), m && (Object.assign(m, O), m.deletion_job = void 0);
  }
  async function E(h) {
    const _ = n(h), m = b.get(_), f = () => s && e.value.includes(h) && b.get(_) === m;
    try {
      const { data: C } = await V.get(`/api/v1/components/${encodeURIComponent(_)}`);
      if (!C?.success) throw new Error(ue(C, "Could not read deletion progress"));
      f() && (h.deleting_at = m?.deleting_at || C.deleting_at, h.deletion_job_id = C.deletion_job_id, m && (m.deletion_job_id = h.deletion_job_id), h.deletion_job = C.deletion_job ?? null);
    } catch (C) {
      f() && I.handleError("other", { message: ue(C, "Could not read deletion progress") });
    }
  }
  let R = [];
  const U = pe(() => e.value, (h, _ = []) => {
    const m = h.filter((f) => !r.has(n(f)));
    for (const f of _)
      r.has(n(f)) || m.some((C) => n(C) === n(f)) || f.deleting_at;
    if (m.length !== h.length) {
      e.value = m;
      return;
    }
    for (const f of h) {
      const C = b.get(n(f));
      C && (f.deletion_job_id !== C.deletion_job_id && (f.deletion_job = void 0), Object.assign(f, C));
      const j = _.find((O) => n(O) === n(f));
      f.deletion_job === void 0 && j?.deletion_job_id === f.deletion_job_id && (f.deletion_job = j?.deletion_job), f.deleting_at && !R.includes(f) && E(f);
    }
    R = h;
  }, { immediate: !0 }), $ = tt("@message", (h) => {
    const _ = xt(h);
    if (!_) return;
    const m = e.value.find((f) => n(f) === _.component_id);
    _.event === "component.deleted" ? (m && r.has(_.component_id), r.add(_.component_id), b.delete(_.component_id), e.value = e.value.filter((f) => n(f) !== _.component_id)) : m && L(_.component_id, { job_id: _.deletion_job_id });
  });
  return je(() => {
    s = !1, U(), typeof $ == "function" && $();
  }), { acceptDeletion: L };
}
function M(e, n) {
  if (e && typeof e == "object") {
    const l = e;
    l.response?.status === 401 && I.handleError("auth-expired", l);
  }
  return ue(e, n);
}
async function Ct() {
  try {
    const { data: e } = await V.get("/api/v1/skills?limit=100");
    if (!e?.success) throw new Error(e?.error || "failed to load skills");
    return e.skills || [];
  } catch (e) {
    throw new Error(M(e, "could not load skills"));
  }
}
async function Te(e, n) {
  try {
    const l = n != null ? `/api/v1/skills/${e}?version=${n}` : `/api/v1/skills/${e}`, { data: c } = await V.get(l);
    if (!c?.success || !c.skill) throw new Error(c?.error || "failed to load skill");
    return c.skill;
  } catch (l) {
    throw new Error(M(l, "could not load skill"));
  }
}
async function St(e) {
  try {
    const { data: n } = await V.get(`/api/v1/skills/${e}/versions`);
    if (!n?.success) throw new Error(n?.error || "failed to load versions");
    return n.versions || [];
  } catch (n) {
    throw new Error(M(n, "could not load versions"));
  }
}
async function Lt(e, n, l) {
  const { data: c } = await V.get(`/api/v1/skills/${encodeURIComponent(e)}/file?path=${encodeURIComponent(n)}&version=${l}&format=base64`);
  if (!c?.success || !c.file) throw new Error(c?.error || "could not read skill file");
  const s = c.file, r = Uint8Array.from(atob(s.content), (b) => b.charCodeAt(0));
  return new Blob([r], { type: s.mime_type || "application/octet-stream" });
}
const Et = {
  active: "Active",
  archived: "Archived"
};
function $t(e) {
  return e ? Et[e] ?? e : "";
}
const At = {
  reference: "Reference",
  asset: "Asset",
  script: "Script"
};
function Tt(e) {
  return e ? At[e] ?? e : "";
}
const jt = /* @__PURE__ */ ie({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: n }) {
    const l = e, c = n, s = w(null);
    let r = null;
    function b(E) {
      c("update:modelValue", E.detail || "");
    }
    async function L() {
      if (s.value) {
        r && r.removeEventListener("select", b), s.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await Pe("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        s.value && (r = document.createElement("wc-icon-picker"), r.setAttribute("value", l.modelValue || ""), l.fallback && r.setAttribute("fallback", l.fallback), r.addEventListener("select", b), s.value.appendChild(r));
      }
    }
    return Xe(L), pe(() => l.modelValue, (E) => {
      r && r.getAttribute("value") !== E && r.setAttribute("value", E || "");
    }), je(() => {
      r && r.removeEventListener("select", b);
    }), (E, R) => (p(), v("div", {
      ref_key: "host",
      ref: s,
      class: "wc-iconfield"
    }, null, 512));
  }
}), Pt = /* @__PURE__ */ ie({
  __name: "SelectField",
  props: {
    modelValue: {},
    options: {},
    ariaLabel: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: n }) {
    const l = n;
    return (c, s) => (p(), Qe(u(ot), {
      class: "kx-select",
      "model-value": e.modelValue,
      options: e.options,
      "option-label": "label",
      "option-value": "value",
      "aria-label": e.ariaLabel,
      placeholder: e.placeholder,
      "onUpdate:modelValue": s[0] || (s[0] = (r) => l("update:modelValue", r))
    }, null, 8, ["model-value", "options", "aria-label", "placeholder"]));
  }
}), Ot = { class: "kx" }, Nt = { class: "kx-head" }, Rt = { class: "kx-head-icon" }, Dt = { class: "kx-head-actions" }, Mt = { class: "kx-search" }, Vt = {
  key: 0,
  class: "kx-err"
}, Ut = { class: "kx-body" }, Bt = {
  key: 0,
  class: "kx-loading"
}, It = {
  key: 1,
  class: "kx-empty"
}, Ft = { class: "kx-empty-ico" }, Ht = { class: "kx-empty-actions" }, zt = {
  key: 2,
  class: "kx-empty"
}, Kt = { class: "kx-empty-ico" }, qt = { class: "kx-empty-sub" }, Wt = { class: "kx-empty-actions" }, Yt = {
  key: 3,
  class: "kx-grid"
}, Gt = ["aria-label", "onClick", "onKeydown"], Jt = { class: "kx-card-head" }, Xt = { class: "kx-ficon" }, Qt = { class: "kx-card-id" }, Zt = ["title"], en = { class: "kx-card-meta" }, tn = {
  key: 0,
  class: "kx-chip kx-tag-sm kx-ver"
}, nn = ["title"], on = {
  key: 2,
  class: "kx-chip kx-tag-sm kx-scope"
}, ln = {
  key: 3,
  class: "kx-chip kx-tag-sm kx-status"
}, sn = { class: "kx-card-desc" }, an = { class: "kx-modal-head-icon" }, rn = { class: "kx-modal-head-text" }, cn = { class: "kx-modal-head-title" }, dn = { class: "kx-modal-head-sub" }, un = {
  key: 0,
  class: "kx-chip kx-tag-sm kx-ver"
}, pn = { class: "kx-edit-cols" }, vn = { class: "kx-edit-left" }, fn = { class: "kx-field" }, hn = { class: "kx-name-row" }, mn = ["disabled"], kn = { class: "kx-field" }, yn = { class: "kx-field" }, bn = {
  key: 0,
  class: "kx-meta-line"
}, _n = { key: 0 }, gn = { key: 1 }, xn = { key: 2 }, wn = {
  key: 1,
  class: "kx-field"
}, Cn = { class: "kx-files" }, Sn = {
  key: 0,
  class: "kx-file-kind"
}, Ln = ["aria-label", "aria-busy"], En = {
  key: 0,
  role: "status"
}, $n = {
  key: 1,
  role: "alert"
}, An = {
  key: 2,
  class: "kx-file-content"
}, Tn = {
  key: 2,
  class: "kx-field"
}, jn = { class: "kx-field-lbl" }, Pn = { class: "kx-field-hint-inline" }, On = { class: "kx-vers" }, Nn = ["onClick"], Rn = { class: "kx-chip kx-tag-sm kx-ver" }, Dn = { class: "kx-ver-when" }, Mn = {
  key: 0,
  class: "kx-ver-files"
}, Vn = { class: "kx-edit-right" }, Un = { class: "kx-edit-right-head" }, Bn = { class: "kx-field-lbl" }, In = { class: "kx-field-hint-inline" }, Fn = {
  key: 0,
  class: "kx-preview-bar"
}, Hn = { class: "kx-preview-tag" }, zn = ["value"], Kn = {
  key: 0,
  class: "kx-err inline kx-edit-err"
}, ae = "tabler:bulb", qn = /* @__PURE__ */ ie({
  __name: "skills",
  setup(e) {
    const n = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, l = [
      { label: "Active", value: "active" },
      { label: "Archived", value: "archived" }
    ], c = w(!1), s = w(""), r = w([]), b = w(""), L = re(() => {
      const a = b.value.trim().toLowerCase();
      return a ? r.value.filter((i) => (i.name || "").toLowerCase().includes(a) || (i.description || "").toLowerCase().includes(a)) : r.value;
    });
    async function E() {
      c.value = !0, s.value = "";
      try {
        r.value = await Ct();
      } catch (a) {
        s.value = M(a, "could not load skills");
      } finally {
        c.value = !1;
      }
    }
    const R = w(!1), U = w(!1), $ = w(""), h = w(null), _ = w([]), m = w(null), f = w(!1), C = w(""), j = w(""), O = w("");
    async function G(a, i = !1) {
      if (!(!h.value || !m.value?.version)) {
        f.value = !0, C.value = a.path, j.value = "", O.value = "";
        try {
          const t = await Lt(h.value.skill_id, a.path, m.value.version);
          if (i) {
            const g = URL.createObjectURL(t);
            try {
              const B = document.createElement("a");
              B.href = g, B.download = a.path.split("/").pop() || a.path, B.click();
            } finally {
              URL.revokeObjectURL(g);
            }
          } else t.type.startsWith("text/") || /(?:json|xml|javascript|yaml)$/.test(t.type) ? j.value = await t.text() : j.value = "Binary file. Download to view its content.";
        } catch (t) {
          O.value = M(t, "could not read skill file");
        } finally {
          f.value = !1;
        }
      }
    }
    const k = w({ name: "", description: "", body: "", status: "active", icon: ae }), D = w([]), z = w(null), J = w(""), he = w(null), X = re(() => z.value !== null);
    function me() {
      h.value = null, m.value = null, _.value = [], D.value = [], K(), k.value = { name: "", description: "", body: "", status: "active", icon: ae }, $.value = "", R.value = !0;
    }
    async function Q(a) {
      h.value = a, m.value = null, _.value = [], D.value = [], K(), $.value = "", k.value = {
        name: a.name || "",
        description: a.description || "",
        body: "",
        status: a.status || "active",
        icon: a.icon || ae
      }, R.value = !0;
      try {
        const i = await Te(a.skill_id);
        m.value = i, k.value.body = i.body || "", k.value.description = i.description || k.value.description, k.value.status = i.status || k.value.status, k.value.icon = i.icon || k.value.icon, _.value = Array.isArray(i.files) ? i.files : [];
      } catch (i) {
        $.value = M(i, "could not load skill body");
      }
      try {
        D.value = await St(a.skill_id);
      } catch {
        D.value = [];
      }
    }
    function K() {
      C.value = "", j.value = "", O.value = "", z.value = null, J.value = "", he.value = null;
    }
    async function Re(a) {
      if (h.value) {
        $.value = "";
        try {
          const i = await Te(h.value.skill_id, a);
          he.value = i, J.value = i.body || "", z.value = a;
        } catch (i) {
          $.value = M(i, "could not load version");
        }
      }
    }
    function De() {
      K();
    }
    function Me() {
      k.value.body = J.value, K();
    }
    function Ve(a) {
      if (!a) return "";
      const i = Date.parse(a);
      if (Number.isNaN(i)) return "";
      const t = Math.max(0, Math.round((Date.now() - i) / 1e3));
      if (t < 60) return "just now";
      const g = Math.round(t / 60);
      if (g < 60) return `${g}m ago`;
      const B = Math.round(g / 60);
      if (B < 24) return `${B}h ago`;
      const be = Math.round(B / 24);
      return be < 30 ? `${be}d ago` : new Date(i).toLocaleDateString();
    }
    function ke() {
      R.value = !1, h.value = null, m.value = null, D.value = [], K(), $.value = "";
    }
    async function Ue() {
      if (!k.value.name.trim()) {
        $.value = "Name is required.";
        return;
      }
      if (!k.value.description.trim()) {
        $.value = "A description is required — it is what agents use to find the skill.";
        return;
      }
      U.value = !0, $.value = "";
      try {
        if (h.value) {
          const { data: a } = await V.patch(`/api/v1/skills/${h.value.skill_id}`, {
            body: k.value.body,
            description: k.value.description,
            status: k.value.status,
            icon: k.value.icon
          });
          if (!a?.success) throw new Error(a?.error || "save failed");
          I.toast({ severity: "success", summary: "Saved", detail: `New version of ${k.value.name}` });
        } else {
          const { data: a } = await V.post("/api/v1/skills", {
            name: k.value.name,
            description: k.value.description,
            body: k.value.body,
            status: k.value.status,
            icon: k.value.icon
          });
          if (!a?.success) throw new Error(a?.error || "create failed");
          I.toast({ severity: "success", summary: "Created", detail: k.value.name });
        }
        ke(), await E();
      } catch (a) {
        $.value = M(a, "save failed");
      } finally {
        U.value = !1;
      }
    }
    const F = w(!1), oe = w(null), H = w(null);
    let le = null;
    function Be(a) {
      oe.value = a, F.value = !0;
    }
    function Ie() {
      F.value = !1, oe.value = null;
    }
    async function Fe() {
      const a = oe.value;
      if (!H.value || !a) return;
      if (H.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Pe("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const i = document.createElement("kickside-share");
      i.setAttribute("config", JSON.stringify({
        resource_id: a.skill_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(a.skill_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(a.skill_id)}`,
        title: a.name || ""
      })), i.addEventListener("close", Ie), H.value.appendChild(i), le = i;
    }
    pe([F, H], async () => {
      F.value && H.value ? await Fe() : !F.value && le && (le = null);
    });
    async function ye(a) {
      if (await I.confirm({
        message: `Delete “${a.name || "this skill"}”? This removes it and its version history. This can't be undone.`,
        header: "Delete skill",
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          const { data: t } = await V.delete(`/api/v1/skills/${a.skill_id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          ze(a.skill_id, t), I.toast({ severity: "success", summary: "Deletion accepted", detail: a.name || "skill" }), await E();
        } catch (t) {
          s.value = M(t, "delete failed"), I.toast({ severity: "error", summary: "Delete failed", detail: s.value });
        }
    }
    function He(a) {
      return a === "script" ? "tabler:file-code" : a === "asset" ? "tabler:file-download" : "tabler:file-text";
    }
    nt(E);
    const { acceptDeletion: ze } = wt(r, (a) => a.skill_id);
    return (a, i) => (p(), v("div", Ot, [
      o("header", Nt, [
        o("div", Rt, [
          d(u(S), {
            icon: "tabler:bulb",
            "aria-hidden": "true"
          })
        ]),
        i[9] || (i[9] = o("div", { class: "kx-head-text" }, [
          o("h1", { class: "kx-title" }, "Skills"),
          o("p", { class: "kx-head-sub" }, "Reusable procedures your agents discover, follow, and refine.")
        ], -1)),
        o("div", Dt, [
          o("div", Mt, [
            d(u(S), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Z(o("input", {
              "onUpdate:modelValue": i[0] || (i[0] = (t) => b.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search skills…",
              "aria-label": "Search skills"
            }, null, 512), [
              [ee, b.value]
            ])
          ]),
          d(u(T), {
            type: "button",
            "data-testid": "skills-create",
            label: "New skill",
            onClick: me
          }, {
            icon: A(({ class: t }) => [
              d(u(S), {
                icon: "tabler:plus",
                class: P(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      s.value ? (p(), v("div", Vt, y(s.value), 1)) : x("", !0),
      o("div", Ut, [
        c.value && !r.value.length ? (p(), v("div", Bt, [
          d(u(S), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          i[10] || (i[10] = N(" Loading… ", -1))
        ])) : r.value.length ? L.value.length ? (p(), v("div", Yt, [
          (p(!0), v(Y, null, se(L.value, (t) => (p(), v("div", {
            key: t.skill_id,
            class: "kx-card",
            tabindex: "0",
            role: "button",
            "aria-label": `Open ${t.name || "skill"}`,
            onClick: (g) => !t.deleting_at && Q(t),
            onKeydown: [
              ge((g) => !t.deleting_at && Q(t), ["enter"]),
              ge(W((g) => !t.deleting_at && Q(t), ["prevent"]), ["space"])
            ]
          }, [
            d(bt, {
              state: t,
              onRetry: (g) => ye(t)
            }, null, 8, ["state", "onRetry"]),
            o("div", Jt, [
              o("span", Xt, [
                d(u(S), {
                  icon: t.icon || "tabler:bulb",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              o("div", Qt, [
                o("div", {
                  class: "kx-card-name",
                  title: t.name || "(untitled)"
                }, y(t.name || "(untitled)"), 9, Zt),
                o("div", en, [
                  t.version ? (p(), v("span", tn, "v" + y(t.version), 1)) : x("", !0),
                  t.file_count ? (p(), v("span", {
                    key: 1,
                    class: "kx-chip kx-tag-sm kx-files-badge",
                    title: `${t.file_count} bundled file${t.file_count === 1 ? "" : "s"}`
                  }, [
                    d(u(S), {
                      icon: "tabler:paperclip",
                      "aria-hidden": "true"
                    }),
                    N(" " + y(t.file_count), 1)
                  ], 8, nn)) : x("", !0),
                  t.agent_id ? (p(), v("span", on, [
                    d(u(S), {
                      icon: "tabler:robot",
                      "aria-hidden": "true"
                    }),
                    i[14] || (i[14] = N(" agent", -1))
                  ])) : x("", !0),
                  t.status && t.status !== "active" ? (p(), v("span", ln, y(u($t)(t.status)), 1)) : x("", !0)
                ])
              ]),
              o("div", {
                class: "kx-card-actions",
                onClick: i[2] || (i[2] = W(() => {
                }, ["stop"]))
              }, [
                d(u(T), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit / refine",
                  "aria-label": `Edit ${t.name}`,
                  onClick: (g) => !t.deleting_at && Q(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: g }) => [
                    d(u(S), {
                      icon: "tabler:pencil",
                      class: P(g),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                d(u(T), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${t.name}`,
                  onClick: (g) => Be(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: g }) => [
                    d(u(S), {
                      icon: "tabler:share",
                      class: P(g),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                d(u(T), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${t.name}`,
                  onClick: (g) => ye(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: g }) => [
                    d(u(S), {
                      icon: "tabler:trash",
                      class: P(g),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            o("div", sn, y(t.description || "No description"), 1)
          ], 40, Gt))), 128))
        ])) : (p(), v("div", zt, [
          o("div", Kt, [
            d(u(S), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          i[13] || (i[13] = o("div", { class: "kx-empty-title" }, "No matches", -1)),
          o("div", qt, "Nothing matches “" + y(b.value) + "”. Try a different term or clear the search.", 1),
          o("div", Wt, [
            d(u(T), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: i[1] || (i[1] = (t) => b.value = "")
            }, {
              icon: A(({ class: t }) => [
                d(u(S), {
                  icon: "tabler:x",
                  class: P(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (p(), v("div", It, [
          o("div", Ft, [
            d(u(S), {
              icon: "tabler:bulb",
              "aria-hidden": "true"
            })
          ]),
          i[11] || (i[11] = o("div", { class: "kx-empty-title" }, "No skills yet", -1)),
          i[12] || (i[12] = o("div", { class: "kx-empty-sub" }, "Skills are reusable procedures your agents discover, follow, and refine over time. Write one, or let an agent author it from a task it just did.", -1)),
          o("div", Ht, [
            d(u(T), {
              type: "button",
              "data-testid": "skills-create",
              label: "New skill",
              onClick: me
            }, {
              icon: A(({ class: t }) => [
                d(u(S), {
                  icon: "tabler:plus",
                  class: P(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]))
      ]),
      d(u(it), {
        visible: R.value,
        "onUpdate:visible": i[8] || (i[8] = (t) => R.value = t),
        modal: "",
        class: "kx-dialog kx-modal-xl",
        pt: n,
        "aria-label": "Edit skill"
      }, {
        header: A(() => [
          o("span", an, [
            d(u(S), {
              icon: k.value.icon || "tabler:bulb",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          o("span", rn, [
            o("span", cn, y(h.value ? "Refine skill" : "New skill"), 1),
            o("span", dn, y(k.value.description.trim() || "A reusable procedure your agents discover and follow."), 1)
          ]),
          h.value?.version ? (p(), v("span", un, "v" + y(h.value.version), 1)) : x("", !0)
        ]),
        footer: A(() => [
          d(u(T), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: U.value,
            onClick: ke
          }, null, 8, ["disabled"]),
          d(u(T), {
            type: "button",
            label: h.value ? "Save new version" : "Create skill",
            loading: U.value,
            disabled: U.value || X.value,
            onClick: Ue
          }, {
            icon: A(({ class: t }) => [
              d(u(S), {
                icon: h.value ? "tabler:device-floppy" : "tabler:check",
                class: P(t),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"])
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        default: A(() => [
          o("div", pn, [
            o("div", vn, [
              o("div", fn, [
                i[15] || (i[15] = o("span", { class: "kx-field-lbl" }, "Name", -1)),
                o("div", hn, [
                  d(jt, {
                    class: "kx-name-icon",
                    modelValue: k.value.icon,
                    "onUpdate:modelValue": i[3] || (i[3] = (t) => k.value.icon = t),
                    fallback: "tabler:bulb"
                  }, null, 8, ["modelValue"]),
                  Z(o("input", {
                    "onUpdate:modelValue": i[4] || (i[4] = (t) => k.value.name = t),
                    class: "kx-input",
                    type: "text",
                    disabled: !!h.value,
                    placeholder: "e.g. Triage a bug report"
                  }, null, 8, mn), [
                    [ee, k.value.name]
                  ])
                ])
              ]),
              o("label", kn, [
                i[16] || (i[16] = o("span", { class: "kx-field-lbl" }, [
                  N("Description "),
                  o("span", { class: "kx-field-hint-inline" }, "— what it does + when to use it (drives discovery)")
                ], -1)),
                Z(o("textarea", {
                  "onUpdate:modelValue": i[5] || (i[5] = (t) => k.value.description = t),
                  class: "kx-input kx-textarea kx-textarea-sm",
                  rows: "3",
                  placeholder: "Summarize a long chat into action items."
                }, null, 512), [
                  [ee, k.value.description]
                ])
              ]),
              o("div", yn, [
                i[17] || (i[17] = o("span", { class: "kx-field-lbl" }, "Status", -1)),
                d(Pt, {
                  modelValue: k.value.status,
                  "onUpdate:modelValue": i[6] || (i[6] = (t) => k.value.status = t),
                  options: l,
                  "aria-label": "Status"
                }, null, 8, ["modelValue"])
              ]),
              m.value ? (p(), v("div", bn, [
                m.value.version ? (p(), v("span", _n, "v" + y(m.value.version), 1)) : x("", !0),
                m.value.license ? (p(), v("span", gn, "· " + y(m.value.license), 1)) : x("", !0),
                m.value.file_count ? (p(), v("span", xn, "· " + y(m.value.file_count) + " file" + y(m.value.file_count === 1 ? "" : "s"), 1)) : x("", !0)
              ])) : x("", !0),
              _.value.length ? (p(), v("div", wn, [
                i[18] || (i[18] = o("span", { class: "kx-field-lbl" }, [
                  N("Bundled files "),
                  o("span", { class: "kx-field-hint-inline" }, "— loaded on demand")
                ], -1)),
                o("div", Cn, [
                  (p(!0), v(Y, null, se(_.value, (t) => (p(), v("div", {
                    key: t.path,
                    class: "kx-file"
                  }, [
                    d(u(S), {
                      icon: He(t.kind),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    d(u(T), {
                      type: "button",
                      text: "",
                      class: "kx-file-path",
                      label: t.path,
                      disabled: f.value,
                      onClick: (g) => G(t)
                    }, null, 8, ["label", "disabled", "onClick"]),
                    d(u(T), {
                      type: "button",
                      text: "",
                      "aria-label": `Download ${t.path}`,
                      disabled: f.value,
                      onClick: (g) => G(t, !0)
                    }, {
                      icon: A(({ class: g }) => [
                        d(u(S), {
                          icon: "tabler:download",
                          class: P(g),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    }, 8, ["aria-label", "disabled", "onClick"]),
                    t.kind ? (p(), v("span", Sn, y(u(Tt)(t.kind)), 1)) : x("", !0)
                  ]))), 128))
                ]),
                C.value ? (p(), v("div", {
                  key: 0,
                  role: "region",
                  "aria-label": C.value,
                  "aria-busy": f.value
                }, [
                  f.value ? (p(), v("p", En, "Reading " + y(C.value) + "…", 1)) : x("", !0),
                  O.value ? (p(), v("p", $n, y(O.value), 1)) : x("", !0),
                  j.value ? (p(), v("pre", An, y(j.value), 1)) : x("", !0)
                ], 8, Ln)) : x("", !0)
              ])) : x("", !0),
              h.value && D.value.length ? (p(), v("div", Tn, [
                o("span", jn, [
                  i[19] || (i[19] = N("Version history ", -1)),
                  o("span", Pn, "— " + y(D.value.length) + " version" + y(D.value.length === 1 ? "" : "s"), 1)
                ]),
                o("div", On, [
                  (p(!0), v(Y, null, se(D.value, (t) => (p(), v("button", {
                    key: t.version,
                    type: "button",
                    class: P(["kx-ver-row", z.value === t.version && "kx-ver-row-on"]),
                    onClick: (g) => Re(t.version)
                  }, [
                    o("span", Rn, "v" + y(t.version), 1),
                    o("span", Dn, y(Ve(t.created_at)), 1),
                    t.file_count ? (p(), v("span", Mn, [
                      d(u(S), {
                        icon: "tabler:paperclip",
                        "aria-hidden": "true"
                      }),
                      N(" " + y(t.file_count), 1)
                    ])) : x("", !0)
                  ], 10, Nn))), 128))
                ])
              ])) : x("", !0)
            ]),
            o("div", Vn, [
              o("div", Un, [
                o("span", Bn, [
                  i[20] || (i[20] = N("Skill instructions ", -1)),
                  o("span", In, "— the procedure the agent follows" + y(h.value && !X.value ? "; saving creates a new version" : ""), 1)
                ]),
                X.value ? (p(), v("div", Fn, [
                  o("span", Hn, [
                    d(u(S), {
                      icon: "tabler:eye",
                      "aria-hidden": "true"
                    }),
                    N(" Previewing v" + y(z.value) + " (read-only)", 1)
                  ]),
                  d(u(T), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    label: "Back to current",
                    onClick: De
                  }, {
                    icon: A(({ class: t }) => [
                      d(u(S), {
                        icon: "tabler:arrow-back-up",
                        class: P(t),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }),
                  d(u(T), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    label: "Restore this version",
                    onClick: Me
                  }, {
                    icon: A(({ class: t }) => [
                      d(u(S), {
                        icon: "tabler:history",
                        class: P(t),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  })
                ])) : x("", !0)
              ]),
              X.value ? (p(), v("textarea", {
                key: 0,
                value: J.value,
                class: "kx-input kx-body-editor kx-body-preview",
                readonly: "",
                "aria-label": "Previewed skill version (read-only)"
              }, null, 8, zn)) : Z((p(), v("textarea", {
                key: 1,
                "onUpdate:modelValue": i[7] || (i[7] = (t) => k.value.body = t),
                class: "kx-input kx-body-editor",
                "aria-label": "Skill instructions",
                placeholder: `1. …
2. …`
              }, null, 512)), [
                [ee, k.value.body]
              ])
            ])
          ]),
          $.value ? (p(), v("div", Kn, y($.value), 1)) : x("", !0)
        ]),
        _: 1
      }, 8, ["visible"]),
      F.value ? (p(), v("div", {
        key: 1,
        ref_key: "shareHost",
        ref: H
      }, null, 512)) : x("", !0)
    ]));
  }
}), si = {
  rootComponent: qn,
  plugins: [mt]
};
export {
  si as mountConfig
};
//# sourceMappingURL=lazy-mount-B4_lk-cl.js.map

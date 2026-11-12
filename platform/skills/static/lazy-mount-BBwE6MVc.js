import qe from "primevue/config";
import Ke from "primevue/contextmenu";
import We from "primevue/menu";
import Ye from "primevue/portal";
import { renderSlot as _e, createCommentVNode as _, h as Ge, Teleport as Je, defineComponent as ie, computed as re, openBlock as v, createElementBlock as f, withModifiers as Y, Fragment as G, createElementVNode as o, createTextVNode as N, toDisplayString as k, createVNode as u, unref as p, watch as ue, onBeforeUnmount as Te, ref as g, onMounted as Xe, createBlock as Qe, withDirectives as Z, vModelText as ee, withCtx as A, normalizeClass as P, renderList as se, withKeys as ge } from "vue";
import j from "primevue/button";
import Ze from "primevue/progressspinner";
import { on as et, api as U, host as z, loadByTagName as Pe } from "@wippy-fe/proxy";
import { a as tt } from "./wc-runtime-ClNbKZcC.js";
import { Icon as C } from "@iconify/vue";
import nt from "primevue/dialog";
import it from "primevue/select";
const ot = "data-wippy-overlay-layer";
function Oe() {
  return typeof window < "u" && typeof window.document < "u";
}
function Ne() {
  return Oe() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function lt() {
  return Ne() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const st = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let at = 0;
const te = /* @__PURE__ */ new WeakMap();
function xe(e, n) {
  const a = e.style;
  a.setProperty("position", "fixed", "important"), a.setProperty("inset", "auto", "important"), a.setProperty("margin", "0", "important"), a.setProperty("position-anchor", n), a.setProperty("position-area", "bottom span-right"), a.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), a.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), a.setProperty("max-width", "stretch", "important");
}
function rt(e, n) {
  if (!st.test(e.className))
    return;
  const a = e.style.cssText;
  xe(e, n), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = a;
    return;
  }
  if (!te.has(e)) {
    const c = new MutationObserver(() => {
      const l = e.style;
      (l.top !== "auto" || l.left !== "auto" || l.margin !== "0px" || l.getPropertyPriority("top") !== "important" || l.getPropertyPriority("left") !== "important" || l.getPropertyPriority("margin") !== "important" || l.getPropertyPriority("min-width") !== "important" || l.maxWidth !== "stretch" || l.getPropertyPriority("max-width") !== "important") && xe(e, n);
    });
    c.observe(e, { attributes: !0, attributeFilter: ["style"] }), te.set(e, c);
  }
}
function pe(e) {
  const n = te.get(e);
  n && (n.disconnect(), te.delete(e));
}
function ct(e) {
  const n = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return n instanceof ShadowRoot ? n : null;
}
function ce(e) {
  e.style.top = "0px", e.style.left = "0px";
  const n = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - n.top}px`, e.style.left = `${-window.scrollX - n.left}px`;
}
const ne = /* @__PURE__ */ new Set(), ve = /* @__PURE__ */ new WeakMap();
let we = !1, de = !1;
function dt() {
  de = !1;
  for (const e of ne) {
    if (!e.isConnected) {
      for (const n of Array.from(e.children))
        n instanceof HTMLElement && pe(n);
      ne.delete(e), ve.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && ce(e);
  }
}
function Ce() {
  de || (de = !0, requestAnimationFrame(dt));
}
function ut(e) {
  const n = document.createElement("div");
  n.setAttribute(ot, "");
  const a = Ne();
  if (n.style.cssText = a ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", a && n.setAttribute("popover", "manual"), e.appendChild(n), a) {
    try {
      n.showPopover();
    } catch {
    }
    n.matches(":popover-open") || (n.removeAttribute("popover"), n.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  ce(n);
  const c = new MutationObserver((l) => {
    const r = n.__wippyAnchorName;
    for (const S of l) {
      if (r)
        for (const L of Array.from(S.addedNodes))
          L instanceof HTMLElement && rt(L, r);
      for (const L of Array.from(S.removedNodes))
        L instanceof HTMLElement && pe(L);
    }
    n.isConnected && n.childElementCount > 0 && ce(n);
  });
  return c.observe(n, { childList: !0 }), ve.set(n, c), ne.add(n), we || (we = !0, window.addEventListener("scroll", Ce, { capture: !0, passive: !0 }), window.addEventListener("resize", Ce, { passive: !0 })), n;
}
function Se(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = ut(e.hostRoot), lt())) {
    const n = e.$el ? e.$el.parentElement : null;
    n && (e.anchorName = `--wippy-a-${++at}`, e.anchorTrigger = n, n.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Le(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const n of Array.from(e.layer.children))
      n instanceof HTMLElement && pe(n);
    ne.delete(e.layer), ve.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Ee = !1;
function pt() {
  if (Ee)
    return;
  const e = We;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (n) => {
      const a = n.composedPath(), c = this.container && !a.includes(this.container), l = !(this.target && a.includes(this.target));
      this.overlayVisible && c && l ? this.hide() : !this.popup && c && l && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Ee = !0);
}
let $e = !1;
function vt() {
  if ($e)
    return;
  const e = Ke;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (n) => {
      const a = n.composedPath(), c = this.container && !a.includes(this.container), l = this.visible ? !(this.target && a.includes(this.target)) : !0;
      c && l && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, $e = !0);
}
let Ae = !1;
function ft() {
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
    Oe() && (this.hostRoot = ct(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Se(this), this.$watch("inline", (n) => {
      n ? Le(this) : Se(this);
    })));
  }, e.render = function() {
    return this.inline ? _e(this.$slots, "default", { key: 0 }) : this.mounted ? Ge(Je, { key: 1, to: this.resolvedTarget || document.body }, [
      _e(this.$slots, "default")
    ]) : _("", !0);
  }, e.unmounted = function() {
    Le(this);
  };
}
const ht = {
  install: (e) => {
    pt(), vt(), ft(), e.use(qe, { theme: "none" });
  }
}, mt = { key: 0 }, kt = /* @__PURE__ */ ie({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const n = e, a = re(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (c, l) => e.state.deleting_at ? (v(), f("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: l[1] || (l[1] = Y(() => {
      }, ["stop"])),
      onKeydown: l[2] || (l[2] = Y(() => {
      }, ["stop"]))
    }, [
      a.value ? (v(), f(G, { key: 0 }, [
        o("span", null, [
          l[3] || (l[3] = N("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (v(), f("span", mt, ": " + k(e.state.deletion_job.last_error), 1)) : _("", !0)
        ]),
        u(p(j), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: l[0] || (l[0] = Y((r) => c.$emit("retry"), ["stop"]))
        })
      ], 64)) : (v(), f(G, { key: 1 }, [
        u(p(Ze), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        l[4] || (l[4] = o("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : _("", !0);
  }
});
function W(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function yt(e, n) {
  return e;
}
function bt(e, n, a) {
  const c = W(e) ? e : {}, l = [
    c,
    W(c.data) ? c.data : null,
    W(c.payload) ? c.payload : null,
    W(c.detail) ? c.detail : null
  ].filter(Boolean);
  for (const r of l) {
    if (r.event !== "component.meta.changed" && r.event !== "component.deleting" && r.event !== "component.deleted") continue;
    const S = String(r.component_id || ""), L = String(c.topic || r.topic || "");
    if (!S && (!L.startsWith("component.") || L === "component.")) continue;
    const $ = S || n || L.slice(10);
    return r.event === "component.deleting" && typeof r.deletion_job_id == "string" && r.deletion_job_id ? { event: r.event, component_id: $, deletion_job_id: r.deletion_job_id } : r.event !== "component.meta.changed" ? { event: r.event, component_id: $ } : {
      event: "component.meta.changed",
      component_id: $,
      meta: yt(W(r.meta) ? r.meta : {}),
      deleted: Array.isArray(r.deleted) ? r.deleted.map(String) : []
    };
  }
  return null;
}
function _t(e, n) {
  const a = bt(e, n);
  return a && a.event !== "component.meta.changed" ? a : null;
}
function gt(e, n, a, c) {
  const l = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  function S(E, x) {
    const w = e.value.find((T) => n(T) === E), d = r.get(E), h = x?.job_id || d?.state.deletion_job_id || w?.deletion_job_id, O = d ? d.state.deletion_job_id : w?.deleting_at ? w.deletion_job_id : void 0;
    if ((d || w?.deleting_at) && h === O || h && d?.superseded.has(h)) return;
    const y = {
      deleting_at: d?.state.deleting_at || w?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: h
    }, R = new Set(d?.superseded);
    for (const T of [d?.state.deletion_job_id, w?.deletion_job_id])
      T && T !== h && R.add(T);
    r.set(E, { state: y, superseded: R }), w && (Object.assign(w, y), w.deletion_job = void 0);
  }
  const L = ue(() => e.value, (E, x = []) => {
    const w = E.filter((d) => !l.has(n(d)));
    for (const d of x)
      l.has(n(d)) || w.some((h) => n(h) === n(d)) || d.deleting_at && c?.(n(d));
    if (w.length !== E.length) {
      e.value = w;
      return;
    }
    for (const d of E) {
      d.deleting_at && d.deletion_job === void 0 && !x.includes(d) && (d.deletion_job = null);
      const h = r.get(n(d));
      if (h) {
        const y = d.deletion_job_id;
        d.deleting_at && y && y !== h.state.deletion_job_id && !h.superseded.has(y) && (h.state.deletion_job_id && h.superseded.add(h.state.deletion_job_id), h.state.deletion_job_id = y), y !== h.state.deletion_job_id && (d.deletion_job = void 0), Object.assign(d, h.state);
      }
      const O = x.find((y) => n(y) === n(d));
      d.deletion_job === void 0 && O?.deletion_job_id === d.deletion_job_id && (d.deletion_job = O?.deletion_job);
    }
  }, { immediate: !0 }), $ = et("@message", (E) => {
    const x = _t(E);
    if (!x) return;
    const w = e.value.find((d) => n(d) === x.component_id);
    x.event === "component.deleted" ? (w && !l.has(x.component_id) && c?.(x.component_id), l.add(x.component_id), r.delete(x.component_id), e.value = e.value.filter((d) => n(d) !== x.component_id)) : w && S(x.component_id, { job_id: x.deletion_job_id });
  });
  return Te(() => {
    L(), typeof $ == "function" && $();
  }), { acceptDeletion: S };
}
function xt(e, n) {
  if (e && typeof e == "object") {
    const a = e, c = a.response?.data?.error;
    if (typeof c == "string") return c;
    if (c && typeof c == "object" && typeof c.message == "string")
      return c.message;
    if (typeof a.message == "string" && a.message) return a.message;
  }
  return n;
}
function V(e, n) {
  if (e && typeof e == "object") {
    const a = e;
    a.response?.status === 401 && z.handleError("auth-expired", a);
  }
  return xt(e, n);
}
async function wt() {
  try {
    const { data: e } = await U.get("/api/v1/skills?limit=100");
    if (!e?.success) throw new Error(e?.error || "failed to load skills");
    return e.skills || [];
  } catch (e) {
    throw new Error(V(e, "could not load skills"));
  }
}
async function je(e, n) {
  try {
    const a = n != null ? `/api/v1/skills/${e}?version=${n}` : `/api/v1/skills/${e}`, { data: c } = await U.get(a);
    if (!c?.success || !c.skill) throw new Error(c?.error || "failed to load skill");
    return c.skill;
  } catch (a) {
    throw new Error(V(a, "could not load skill"));
  }
}
async function Ct(e) {
  try {
    const { data: n } = await U.get(`/api/v1/skills/${e}/versions`);
    if (!n?.success) throw new Error(n?.error || "failed to load versions");
    return n.versions || [];
  } catch (n) {
    throw new Error(V(n, "could not load versions"));
  }
}
async function St(e, n, a) {
  const { data: c } = await U.get(`/api/v1/skills/${encodeURIComponent(e)}/file?path=${encodeURIComponent(n)}&version=${a}&format=base64`);
  if (!c?.success || !c.file) throw new Error(c?.error || "could not read skill file");
  const l = c.file, r = Uint8Array.from(atob(l.content), (S) => S.charCodeAt(0));
  return new Blob([r], { type: l.mime_type || "application/octet-stream" });
}
const Lt = {
  active: "Active",
  archived: "Archived"
};
function Et(e) {
  return e ? Lt[e] ?? e : "";
}
const $t = {
  reference: "Reference",
  asset: "Asset",
  script: "Script"
};
function At(e) {
  return e ? $t[e] ?? e : "";
}
const jt = /* @__PURE__ */ ie({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: n }) {
    const a = e, c = n, l = g(null);
    let r = null;
    function S($) {
      c("update:modelValue", $.detail || "");
    }
    async function L() {
      if (l.value) {
        r && r.removeEventListener("select", S), l.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await Pe("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        l.value && (r = document.createElement("wc-icon-picker"), r.setAttribute("value", a.modelValue || ""), a.fallback && r.setAttribute("fallback", a.fallback), r.addEventListener("select", S), l.value.appendChild(r));
      }
    }
    return Xe(L), ue(() => a.modelValue, ($) => {
      r && r.getAttribute("value") !== $ && r.setAttribute("value", $ || "");
    }), Te(() => {
      r && r.removeEventListener("select", S);
    }), ($, E) => (v(), f("div", {
      ref_key: "host",
      ref: l,
      class: "wc-iconfield"
    }, null, 512));
  }
});
function Tt() {
  let e = 0;
  return () => {
    const n = ++e;
    return () => n === e;
  };
}
const Pt = /* @__PURE__ */ ie({
  __name: "SelectField",
  props: {
    modelValue: {},
    options: {},
    ariaLabel: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: n }) {
    const a = n;
    return (c, l) => (v(), Qe(p(it), {
      class: "kx-select",
      "model-value": e.modelValue,
      options: e.options,
      "option-label": "label",
      "option-value": "value",
      "aria-label": e.ariaLabel,
      placeholder: e.placeholder,
      "onUpdate:modelValue": l[0] || (l[0] = (r) => a("update:modelValue", r))
    }, null, 8, ["model-value", "options", "aria-label", "placeholder"]));
  }
}), Ot = { class: "kx" }, Nt = { class: "kx-head" }, Rt = { class: "kx-head-icon" }, Mt = { class: "kx-head-actions" }, Vt = { class: "kx-search" }, Dt = {
  key: 0,
  class: "kx-err"
}, Ut = { class: "kx-body" }, Bt = {
  key: 0,
  class: "kx-loading"
}, It = {
  key: 1,
  class: "kx-empty"
}, Ht = { class: "kx-empty-ico" }, zt = { class: "kx-empty-actions" }, Ft = {
  key: 2,
  class: "kx-empty"
}, qt = { class: "kx-empty-ico" }, Kt = { class: "kx-empty-sub" }, Wt = { class: "kx-empty-actions" }, Yt = {
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
}, jn = {
  key: 2,
  class: "kx-field"
}, Tn = { class: "kx-field-lbl" }, Pn = { class: "kx-field-hint-inline" }, On = { class: "kx-vers" }, Nn = ["onClick"], Rn = { class: "kx-chip kx-tag-sm kx-ver" }, Mn = { class: "kx-ver-when" }, Vn = {
  key: 0,
  class: "kx-ver-files"
}, Dn = { class: "kx-edit-right" }, Un = { class: "kx-edit-right-head" }, Bn = { class: "kx-field-lbl" }, In = { class: "kx-field-hint-inline" }, Hn = {
  key: 0,
  class: "kx-preview-bar"
}, zn = { class: "kx-preview-tag" }, Fn = ["value"], qn = {
  key: 0,
  class: "kx-err inline kx-edit-err"
}, ae = "tabler:bulb", Kn = /* @__PURE__ */ ie({
  __name: "skills",
  setup(e) {
    const n = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, a = [
      { label: "Active", value: "active" },
      { label: "Archived", value: "archived" }
    ], c = g(!1), l = g(""), r = g([]), S = g(""), L = re(() => {
      const s = S.value.trim().toLowerCase();
      return s ? r.value.filter((i) => (i.name || "").toLowerCase().includes(s) || (i.description || "").toLowerCase().includes(s)) : r.value;
    }), $ = Tt();
    async function E() {
      const s = $();
      c.value = !0, l.value = "";
      try {
        const i = await wt();
        s() && (r.value = i);
      } catch (i) {
        s() && (l.value = V(i, "could not load skills"));
      } finally {
        s() && (c.value = !1);
      }
    }
    const x = g(!1), w = g(!1), d = g(""), h = g(null), O = g([]), y = g(null), R = g(!1), T = g(""), B = g(""), F = g("");
    async function fe(s, i = !1) {
      if (!(!h.value || !y.value?.version)) {
        R.value = !0, T.value = s.path, B.value = "", F.value = "";
        try {
          const t = await St(h.value.skill_id, s.path, y.value.version);
          if (i) {
            const b = URL.createObjectURL(t);
            try {
              const D = document.createElement("a");
              D.href = b, D.download = s.path.split("/").pop() || s.path, D.click();
            } finally {
              URL.revokeObjectURL(b);
            }
          } else t.type.startsWith("text/") || /(?:json|xml|javascript|yaml)$/.test(t.type) ? B.value = await t.text() : B.value = "Binary file. Download to view its content.";
        } catch (t) {
          F.value = V(t, "could not read skill file");
        } finally {
          R.value = !1;
        }
      }
    }
    const m = g({ name: "", description: "", body: "", status: "active", icon: ae }), M = g([]), q = g(null), J = g(""), he = g(null), X = re(() => q.value !== null);
    function me() {
      h.value = null, y.value = null, O.value = [], M.value = [], K(), m.value = { name: "", description: "", body: "", status: "active", icon: ae }, d.value = "", x.value = !0;
    }
    async function Q(s) {
      h.value = s, y.value = null, O.value = [], M.value = [], K(), d.value = "", m.value = {
        name: s.name || "",
        description: s.description || "",
        body: "",
        status: s.status || "active",
        icon: s.icon || ae
      }, x.value = !0;
      try {
        const i = await je(s.skill_id);
        y.value = i, m.value.body = i.body || "", m.value.description = i.description || m.value.description, m.value.status = i.status || m.value.status, m.value.icon = i.icon || m.value.icon, O.value = Array.isArray(i.files) ? i.files : [];
      } catch (i) {
        d.value = V(i, "could not load skill body");
      }
      try {
        M.value = await Ct(s.skill_id);
      } catch {
        M.value = [];
      }
    }
    function K() {
      T.value = "", B.value = "", F.value = "", q.value = null, J.value = "", he.value = null;
    }
    async function Re(s) {
      if (h.value) {
        d.value = "";
        try {
          const i = await je(h.value.skill_id, s);
          he.value = i, J.value = i.body || "", q.value = s;
        } catch (i) {
          d.value = V(i, "could not load version");
        }
      }
    }
    function Me() {
      K();
    }
    function Ve() {
      m.value.body = J.value, K();
    }
    function De(s) {
      if (!s) return "";
      const i = Date.parse(s);
      if (Number.isNaN(i)) return "";
      const t = Math.max(0, Math.round((Date.now() - i) / 1e3));
      if (t < 60) return "just now";
      const b = Math.round(t / 60);
      if (b < 60) return `${b}m ago`;
      const D = Math.round(b / 60);
      if (D < 24) return `${D}h ago`;
      const be = Math.round(D / 24);
      return be < 30 ? `${be}d ago` : new Date(i).toLocaleDateString();
    }
    function ke() {
      x.value = !1, h.value = null, y.value = null, M.value = [], K(), d.value = "";
    }
    async function Ue() {
      if (!m.value.name.trim()) {
        d.value = "Name is required.";
        return;
      }
      if (!m.value.description.trim()) {
        d.value = "A description is required — it is what agents use to find the skill.";
        return;
      }
      w.value = !0, d.value = "";
      try {
        if (h.value) {
          const { data: s } = await U.patch(`/api/v1/skills/${h.value.skill_id}`, {
            body: m.value.body,
            description: m.value.description,
            status: m.value.status,
            icon: m.value.icon
          });
          if (!s?.success) throw new Error(s?.error || "save failed");
          z.toast({ severity: "success", summary: "Saved", detail: `New version of ${m.value.name}` });
        } else {
          const { data: s } = await U.post("/api/v1/skills", {
            name: m.value.name,
            description: m.value.description,
            body: m.value.body,
            status: m.value.status,
            icon: m.value.icon
          });
          if (!s?.success) throw new Error(s?.error || "create failed");
          z.toast({ severity: "success", summary: "Created", detail: m.value.name });
        }
        ke(), await E();
      } catch (s) {
        d.value = V(s, "save failed");
      } finally {
        w.value = !1;
      }
    }
    const I = g(!1), oe = g(null), H = g(null);
    let le = null;
    function Be(s) {
      oe.value = s, I.value = !0;
    }
    function Ie() {
      I.value = !1, oe.value = null;
    }
    async function He() {
      const s = oe.value;
      if (!H.value || !s) return;
      if (H.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Pe("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const i = document.createElement("kickside-share");
      i.setAttribute("config", JSON.stringify({
        resource_id: s.skill_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(s.skill_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(s.skill_id)}`,
        title: s.name || ""
      })), i.addEventListener("close", Ie), H.value.appendChild(i), le = i;
    }
    ue([I, H], async () => {
      I.value && H.value ? await He() : !I.value && le && (le = null);
    });
    async function ye(s) {
      if (await z.confirm({
        message: `Delete “${s.name || "this skill"}”? This removes it and its version history. This can't be undone.`,
        header: "Delete skill",
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          const { data: t } = await U.delete(`/api/v1/skills/${s.skill_id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          Fe(s.skill_id, t), z.toast({ severity: "success", summary: "Deletion accepted", detail: s.name || "skill" }), await E();
        } catch (t) {
          l.value = V(t, "delete failed"), z.toast({ severity: "error", summary: "Delete failed", detail: l.value });
        }
    }
    function ze(s) {
      return s === "script" ? "tabler:file-code" : s === "asset" ? "tabler:file-download" : "tabler:file-text";
    }
    tt(E);
    const { acceptDeletion: Fe } = gt(r, (s) => s.skill_id, void 0, E);
    return (s, i) => (v(), f("div", Ot, [
      o("header", Nt, [
        o("div", Rt, [
          u(p(C), {
            icon: "tabler:bulb",
            "aria-hidden": "true"
          })
        ]),
        i[9] || (i[9] = o("div", { class: "kx-head-text" }, [
          o("h1", { class: "kx-title" }, "Skills"),
          o("p", { class: "kx-head-sub" }, "Reusable procedures your agents discover, follow, and refine.")
        ], -1)),
        o("div", Mt, [
          o("div", Vt, [
            u(p(C), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Z(o("input", {
              "onUpdate:modelValue": i[0] || (i[0] = (t) => S.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search skills…",
              "aria-label": "Search skills"
            }, null, 512), [
              [ee, S.value]
            ])
          ]),
          u(p(j), {
            type: "button",
            "data-testid": "skills-create",
            label: "New skill",
            onClick: me
          }, {
            icon: A(({ class: t }) => [
              u(p(C), {
                icon: "tabler:plus",
                class: P(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      l.value ? (v(), f("div", Dt, k(l.value), 1)) : _("", !0),
      o("div", Ut, [
        c.value && !r.value.length ? (v(), f("div", Bt, [
          u(p(C), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          i[10] || (i[10] = N(" Loading… ", -1))
        ])) : r.value.length ? L.value.length ? (v(), f("div", Yt, [
          (v(!0), f(G, null, se(L.value, (t) => (v(), f("div", {
            key: t.skill_id,
            class: "kx-card",
            tabindex: "0",
            role: "button",
            "aria-label": `Open ${t.name || "skill"}`,
            onClick: (b) => !t.deleting_at && Q(t),
            onKeydown: [
              ge((b) => !t.deleting_at && Q(t), ["enter"]),
              ge(Y((b) => !t.deleting_at && Q(t), ["prevent"]), ["space"])
            ]
          }, [
            u(kt, {
              state: t,
              onRetry: (b) => ye(t)
            }, null, 8, ["state", "onRetry"]),
            o("div", Jt, [
              o("span", Xt, [
                u(p(C), {
                  icon: t.icon || "tabler:bulb",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              o("div", Qt, [
                o("div", {
                  class: "kx-card-name",
                  title: t.name || "(untitled)"
                }, k(t.name || "(untitled)"), 9, Zt),
                o("div", en, [
                  t.version ? (v(), f("span", tn, "v" + k(t.version), 1)) : _("", !0),
                  t.file_count ? (v(), f("span", {
                    key: 1,
                    class: "kx-chip kx-tag-sm kx-files-badge",
                    title: `${t.file_count} bundled file${t.file_count === 1 ? "" : "s"}`
                  }, [
                    u(p(C), {
                      icon: "tabler:paperclip",
                      "aria-hidden": "true"
                    }),
                    N(" " + k(t.file_count), 1)
                  ], 8, nn)) : _("", !0),
                  t.agent_id ? (v(), f("span", on, [
                    u(p(C), {
                      icon: "tabler:robot",
                      "aria-hidden": "true"
                    }),
                    i[14] || (i[14] = N(" agent", -1))
                  ])) : _("", !0),
                  t.status && t.status !== "active" ? (v(), f("span", ln, k(p(Et)(t.status)), 1)) : _("", !0)
                ])
              ]),
              o("div", {
                class: "kx-card-actions",
                onClick: i[2] || (i[2] = Y(() => {
                }, ["stop"]))
              }, [
                u(p(j), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit / refine",
                  "aria-label": `Edit ${t.name}`,
                  onClick: (b) => !t.deleting_at && Q(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: b }) => [
                    u(p(C), {
                      icon: "tabler:pencil",
                      class: P(b),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                u(p(j), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${t.name}`,
                  onClick: (b) => Be(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: b }) => [
                    u(p(C), {
                      icon: "tabler:share",
                      class: P(b),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                u(p(j), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${t.name}`,
                  onClick: (b) => ye(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: b }) => [
                    u(p(C), {
                      icon: "tabler:trash",
                      class: P(b),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            o("div", sn, k(t.description || "No description"), 1)
          ], 40, Gt))), 128))
        ])) : (v(), f("div", Ft, [
          o("div", qt, [
            u(p(C), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          i[13] || (i[13] = o("div", { class: "kx-empty-title" }, "No matches", -1)),
          o("div", Kt, "Nothing matches “" + k(S.value) + "”. Try a different term or clear the search.", 1),
          o("div", Wt, [
            u(p(j), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: i[1] || (i[1] = (t) => S.value = "")
            }, {
              icon: A(({ class: t }) => [
                u(p(C), {
                  icon: "tabler:x",
                  class: P(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (v(), f("div", It, [
          o("div", Ht, [
            u(p(C), {
              icon: "tabler:bulb",
              "aria-hidden": "true"
            })
          ]),
          i[11] || (i[11] = o("div", { class: "kx-empty-title" }, "No skills yet", -1)),
          i[12] || (i[12] = o("div", { class: "kx-empty-sub" }, "Skills are reusable procedures your agents discover, follow, and refine over time. Write one, or let an agent author it from a task it just did.", -1)),
          o("div", zt, [
            u(p(j), {
              type: "button",
              "data-testid": "skills-create",
              label: "New skill",
              onClick: me
            }, {
              icon: A(({ class: t }) => [
                u(p(C), {
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
      u(p(nt), {
        visible: x.value,
        "onUpdate:visible": i[8] || (i[8] = (t) => x.value = t),
        modal: "",
        class: "kx-dialog kx-modal-xl",
        pt: n,
        "aria-label": "Edit skill"
      }, {
        header: A(() => [
          o("span", an, [
            u(p(C), {
              icon: m.value.icon || "tabler:bulb",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          o("span", rn, [
            o("span", cn, k(h.value ? "Refine skill" : "New skill"), 1),
            o("span", dn, k(m.value.description.trim() || "A reusable procedure your agents discover and follow."), 1)
          ]),
          h.value?.version ? (v(), f("span", un, "v" + k(h.value.version), 1)) : _("", !0)
        ]),
        footer: A(() => [
          u(p(j), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: w.value,
            onClick: ke
          }, null, 8, ["disabled"]),
          u(p(j), {
            type: "button",
            label: h.value ? "Save new version" : "Create skill",
            loading: w.value,
            disabled: w.value || X.value,
            onClick: Ue
          }, {
            icon: A(({ class: t }) => [
              u(p(C), {
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
                  u(jt, {
                    class: "kx-name-icon",
                    modelValue: m.value.icon,
                    "onUpdate:modelValue": i[3] || (i[3] = (t) => m.value.icon = t),
                    fallback: "tabler:bulb"
                  }, null, 8, ["modelValue"]),
                  Z(o("input", {
                    "onUpdate:modelValue": i[4] || (i[4] = (t) => m.value.name = t),
                    class: "kx-input",
                    type: "text",
                    disabled: !!h.value,
                    placeholder: "e.g. Triage a bug report"
                  }, null, 8, mn), [
                    [ee, m.value.name]
                  ])
                ])
              ]),
              o("label", kn, [
                i[16] || (i[16] = o("span", { class: "kx-field-lbl" }, [
                  N("Description "),
                  o("span", { class: "kx-field-hint-inline" }, "— what it does + when to use it (drives discovery)")
                ], -1)),
                Z(o("textarea", {
                  "onUpdate:modelValue": i[5] || (i[5] = (t) => m.value.description = t),
                  class: "kx-input kx-textarea kx-textarea-sm",
                  rows: "3",
                  placeholder: "Summarize a long chat into action items."
                }, null, 512), [
                  [ee, m.value.description]
                ])
              ]),
              o("div", yn, [
                i[17] || (i[17] = o("span", { class: "kx-field-lbl" }, "Status", -1)),
                u(Pt, {
                  modelValue: m.value.status,
                  "onUpdate:modelValue": i[6] || (i[6] = (t) => m.value.status = t),
                  options: a,
                  "aria-label": "Status"
                }, null, 8, ["modelValue"])
              ]),
              y.value ? (v(), f("div", bn, [
                y.value.version ? (v(), f("span", _n, "v" + k(y.value.version), 1)) : _("", !0),
                y.value.license ? (v(), f("span", gn, "· " + k(y.value.license), 1)) : _("", !0),
                y.value.file_count ? (v(), f("span", xn, "· " + k(y.value.file_count) + " file" + k(y.value.file_count === 1 ? "" : "s"), 1)) : _("", !0)
              ])) : _("", !0),
              O.value.length ? (v(), f("div", wn, [
                i[18] || (i[18] = o("span", { class: "kx-field-lbl" }, [
                  N("Bundled files "),
                  o("span", { class: "kx-field-hint-inline" }, "— loaded on demand")
                ], -1)),
                o("div", Cn, [
                  (v(!0), f(G, null, se(O.value, (t) => (v(), f("div", {
                    key: t.path,
                    class: "kx-file"
                  }, [
                    u(p(C), {
                      icon: ze(t.kind),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    u(p(j), {
                      type: "button",
                      text: "",
                      class: "kx-file-path",
                      label: t.path,
                      disabled: R.value,
                      onClick: (b) => fe(t)
                    }, null, 8, ["label", "disabled", "onClick"]),
                    u(p(j), {
                      type: "button",
                      text: "",
                      "aria-label": `Download ${t.path}`,
                      disabled: R.value,
                      onClick: (b) => fe(t, !0)
                    }, {
                      icon: A(({ class: b }) => [
                        u(p(C), {
                          icon: "tabler:download",
                          class: P(b),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    }, 8, ["aria-label", "disabled", "onClick"]),
                    t.kind ? (v(), f("span", Sn, k(p(At)(t.kind)), 1)) : _("", !0)
                  ]))), 128))
                ]),
                T.value ? (v(), f("div", {
                  key: 0,
                  role: "region",
                  "aria-label": T.value,
                  "aria-busy": R.value
                }, [
                  R.value ? (v(), f("p", En, "Reading " + k(T.value) + "…", 1)) : _("", !0),
                  F.value ? (v(), f("p", $n, k(F.value), 1)) : _("", !0),
                  B.value ? (v(), f("pre", An, k(B.value), 1)) : _("", !0)
                ], 8, Ln)) : _("", !0)
              ])) : _("", !0),
              h.value && M.value.length ? (v(), f("div", jn, [
                o("span", Tn, [
                  i[19] || (i[19] = N("Version history ", -1)),
                  o("span", Pn, "— " + k(M.value.length) + " version" + k(M.value.length === 1 ? "" : "s"), 1)
                ]),
                o("div", On, [
                  (v(!0), f(G, null, se(M.value, (t) => (v(), f("button", {
                    key: t.version,
                    type: "button",
                    class: P(["kx-ver-row", q.value === t.version && "kx-ver-row-on"]),
                    onClick: (b) => Re(t.version)
                  }, [
                    o("span", Rn, "v" + k(t.version), 1),
                    o("span", Mn, k(De(t.created_at)), 1),
                    t.file_count ? (v(), f("span", Vn, [
                      u(p(C), {
                        icon: "tabler:paperclip",
                        "aria-hidden": "true"
                      }),
                      N(" " + k(t.file_count), 1)
                    ])) : _("", !0)
                  ], 10, Nn))), 128))
                ])
              ])) : _("", !0)
            ]),
            o("div", Dn, [
              o("div", Un, [
                o("span", Bn, [
                  i[20] || (i[20] = N("Skill instructions ", -1)),
                  o("span", In, "— the procedure the agent follows" + k(h.value && !X.value ? "; saving creates a new version" : ""), 1)
                ]),
                X.value ? (v(), f("div", Hn, [
                  o("span", zn, [
                    u(p(C), {
                      icon: "tabler:eye",
                      "aria-hidden": "true"
                    }),
                    N(" Previewing v" + k(q.value) + " (read-only)", 1)
                  ]),
                  u(p(j), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    label: "Back to current",
                    onClick: Me
                  }, {
                    icon: A(({ class: t }) => [
                      u(p(C), {
                        icon: "tabler:arrow-back-up",
                        class: P(t),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }),
                  u(p(j), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    label: "Restore this version",
                    onClick: Ve
                  }, {
                    icon: A(({ class: t }) => [
                      u(p(C), {
                        icon: "tabler:history",
                        class: P(t),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  })
                ])) : _("", !0)
              ]),
              X.value ? (v(), f("textarea", {
                key: 0,
                value: J.value,
                class: "kx-input kx-body-editor kx-body-preview",
                readonly: "",
                "aria-label": "Previewed skill version (read-only)"
              }, null, 8, Fn)) : Z((v(), f("textarea", {
                key: 1,
                "onUpdate:modelValue": i[7] || (i[7] = (t) => m.value.body = t),
                class: "kx-input kx-body-editor",
                "aria-label": "Skill instructions",
                placeholder: `1. …
2. …`
              }, null, 512)), [
                [ee, m.value.body]
              ])
            ])
          ]),
          d.value ? (v(), f("div", qn, k(d.value), 1)) : _("", !0)
        ]),
        _: 1
      }, 8, ["visible"]),
      I.value ? (v(), f("div", {
        key: 1,
        ref_key: "shareHost",
        ref: H
      }, null, 512)) : _("", !0)
    ]));
  }
}), li = {
  rootComponent: Kn,
  plugins: [ht]
};
export {
  li as mountConfig
};
//# sourceMappingURL=lazy-mount-BBwE6MVc.js.map

import ze from "primevue/config";
import Be from "primevue/contextmenu";
import De from "primevue/menu";
import qe from "primevue/portal";
import { renderSlot as $e, createCommentVNode as A, h as He, Teleport as We, defineComponent as ye, ref as C, watch as he, onUnmounted as ke, openBlock as r, createElementBlock as u, createElementVNode as p, toDisplayString as x, createVNode as T, unref as w, Fragment as V, renderList as F, createTextVNode as D, computed as O, onMounted as Ye, normalizeClass as z, createBlock as j, withCtx as K } from "vue";
import { Icon as q } from "@iconify/vue";
import Ke from "primevue/tab";
import Je from "primevue/tablist";
import Ge from "primevue/tabs";
import Xe from "primevue/message";
import ce from "primevue/tag";
import { api as J, loadByTagName as de, on as Qe } from "@wippy-fe/proxy";
import { b as Ze } from "./wc-runtime-B-1gP9Y_.js";
import te from "primevue/button";
import et from "primevue/checkbox";
import tt from "primevue/inputnumber";
import nt from "primevue/inputtext";
import it from "primevue/textarea";
import ot from "primevue/select";
const rt = "data-wippy-overlay-layer";
function je() {
  return typeof window < "u" && typeof window.document < "u";
}
function Ie() {
  return je() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function st() {
  return Ie() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const at = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let lt = 0;
const ne = /* @__PURE__ */ new WeakMap();
function Ae(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function ut(e, t) {
  if (!at.test(e.className))
    return;
  const n = e.style.cssText;
  Ae(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!ne.has(e)) {
    const i = new MutationObserver(() => {
      const c = e.style;
      (c.top !== "auto" || c.left !== "auto" || c.margin !== "0px" || c.getPropertyPriority("top") !== "important" || c.getPropertyPriority("left") !== "important" || c.getPropertyPriority("margin") !== "important" || c.getPropertyPriority("min-width") !== "important" || c.maxWidth !== "stretch" || c.getPropertyPriority("max-width") !== "important") && Ae(e, t);
    });
    i.observe(e, { attributes: !0, attributeFilter: ["style"] }), ne.set(e, i);
  }
}
function be(e) {
  const t = ne.get(e);
  t && (t.disconnect(), ne.delete(e));
}
function ct(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function fe(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const ie = /* @__PURE__ */ new Set(), ge = /* @__PURE__ */ new WeakMap();
let Ce = !1, me = !1;
function dt() {
  me = !1;
  for (const e of ie) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && be(t);
      ie.delete(e), ge.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && fe(e);
  }
}
function Le() {
  me || (me = !0, requestAnimationFrame(dt));
}
function ft(e) {
  const t = document.createElement("div");
  t.setAttribute(rt, "");
  const n = Ie();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  fe(t);
  const i = new MutationObserver((c) => {
    const d = t.__wippyAnchorName;
    for (const y of c) {
      if (d)
        for (const f of Array.from(y.addedNodes))
          f instanceof HTMLElement && ut(f, d);
      for (const f of Array.from(y.removedNodes))
        f instanceof HTMLElement && be(f);
    }
    t.isConnected && t.childElementCount > 0 && fe(t);
  });
  return i.observe(t, { childList: !0 }), ge.set(t, i), ie.add(t), Ce || (Ce = !0, window.addEventListener("scroll", Le, { capture: !0, passive: !0 }), window.addEventListener("resize", Le, { passive: !0 })), t;
}
function Me(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = ft(e.hostRoot), st())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++lt}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Ne(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && be(t);
    ie.delete(e.layer), ge.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Te = !1;
function mt() {
  if (Te)
    return;
  const e = De;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (t) => {
      const n = t.composedPath(), i = this.container && !n.includes(this.container), c = !(this.target && n.includes(this.target));
      this.overlayVisible && i && c ? this.hide() : !this.popup && i && c && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Te = !0);
}
let Oe = !1;
function pt() {
  if (Oe)
    return;
  const e = Be;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (t) => {
      const n = t.composedPath(), i = this.container && !n.includes(this.container), c = this.visible ? !(this.target && n.includes(this.target)) : !0;
      i && c && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Oe = !0);
}
let Se = !1;
function vt() {
  if (Se)
    return;
  Se = !0;
  const e = qe;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    je() && (this.hostRoot = ct(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Me(this), this.$watch("inline", (t) => {
      t ? Ne(this) : Me(this);
    })));
  }, e.render = function() {
    return this.inline ? $e(this.$slots, "default", { key: 0 }) : this.mounted ? He(We, { key: 1, to: this.resolvedTarget || document.body }, [
      $e(this.$slots, "default")
    ]) : A("", !0);
  }, e.unmounted = function() {
    Ne(this);
  };
}
const yt = {
  install: (e) => {
    mt(), pt(), vt(), e.use(ze, { theme: "none" });
  }
};
function ht(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const n = e.trim();
    if (/^\d+$/.test(n))
      t = Number(n);
    else {
      const i = Date.parse(n);
      return Number.isNaN(i) ? null : i;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function Ue(e, t) {
  const n = ht(e);
  if (n === null) return "";
  const i = t?.now ?? Date.now(), c = t?.suffix ?? !0, d = t?.maxUnit ?? "day", y = t?.future ?? !1, f = 6e4, k = 60 * f, $ = 24 * k, S = 30 * $, R = 365 * $, g = i - n;
  if (y && g < 0) {
    const _ = -g;
    return _ < f ? "in <1m" : _ < k ? `in ${Math.floor(_ / f)}m` : _ < $ ? `in ${Math.floor(_ / k)}h` : `in ${Math.floor(_ / $)}d`;
  }
  const v = Math.max(0, g);
  if (v < f) return "just now";
  const h = c ? " ago" : "";
  return v < k ? `${Math.floor(v / f)}m${h}` : v < $ ? `${Math.floor(v / k)}h${h}` : d === "year" ? v < S ? `${Math.floor(v / $)}d${h}` : v < R ? `${Math.floor(v / S)}mo${h}` : `${Math.floor(v / R)}y${h}` : `${Math.floor(v / $)}d${h}`;
}
function kt(e) {
  const t = e || "";
  return t.startsWith("image/") ? "tabler:photo" : t === "application/pdf" ? "tabler:file-type-pdf" : t.includes("word") || t.includes("opendocument.text") || t === "application/rtf" ? "tabler:file-type-doc" : t.includes("sheet") || t.includes("excel") || t.includes("spreadsheet") || t === "text/csv" ? "tabler:file-type-xls" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:file-type-ppt" : t === "application/epub+zip" ? "tabler:book" : t.startsWith("text/") || t === "application/json" || t === "application/xml" ? "tabler:file-text" : "tabler:file";
}
function bt(e) {
  if (!e) return "0 B";
  const t = ["B", "KB", "MB", "GB"], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1);
  return `${(e / Math.pow(1024, n)).toFixed(n ? 1 : 0)} ${t[n]}`;
}
function G(e, t) {
  if (e && typeof e == "object") {
    const n = e, i = n.response?.data?.error;
    if (typeof i == "string") return i;
    if (i && typeof i == "object" && typeof i.message == "string")
      return i.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return t;
}
function B(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function pe(e) {
  return B(e) ? ["id", "item_type", "title", "priority", "status"].every((t) => typeof e[t] == "string") && ["content", "action", "file_version"].every((t) => e[t] === void 0 || typeof e[t] == "string") && ["created_at", "resolved_at"].every((t) => e[t] === void 0 || typeof e[t] == "number") && (e.file_count === void 0 || Number.isInteger(e.file_count) && Number(e.file_count) >= 0) && (e.files === void 0 || Array.isArray(e.files) && e.files.every((t) => B(t) && typeof t.locked == "boolean" && ["filename", "content_type", "view_url"].every((n) => t[n] === void 0 || typeof t[n] == "string") && (t.size === void 0 || typeof t.size == "number" && Number.isFinite(t.size) && t.size >= 0))) && ["metadata", "form"].every((t) => e[t] === void 0 || B(e[t])) : !1;
}
const gt = {
  class: "kx-files",
  "aria-label": "Attached files"
}, _t = {
  key: 0,
  role: "status"
}, xt = { key: 1 }, wt = { role: "alert" }, $t = { class: "kx-file-list" }, At = {
  key: 0,
  class: "kx-file-row kx-file-locked",
  "data-testid": "inbox-file-locked"
}, Ct = { class: "kx-file-row" }, Lt = { class: "kx-file-label" }, Mt = { class: "kx-file-name" }, Nt = {
  key: 0,
  class: "kx-file-size"
}, Tt = ["href"], Ot = { class: "kx-sr-only" }, St = {
  key: 0,
  class: "kx-file-preview"
}, Et = {
  key: 0,
  role: "status"
}, Rt = {
  key: 1,
  role: "alert"
}, Pt = ["content-type", "filename", "source-url"], Vt = /* @__PURE__ */ ye({
  __name: "ItemFiles",
  props: {
    itemId: {},
    files: {},
    count: {},
    version: {}
  },
  setup(e) {
    const t = e, n = C([]), i = C(!1), c = C("");
    let d = 0;
    const y = C(null), f = C(!1), k = C("");
    async function $() {
      const g = ++d;
      if (y.value = null, n.value = t.files || [], c.value = "", i.value = !1, t.files === void 0) {
        i.value = !0;
        try {
          const { data: v } = await J.get(
            `/api/v1/inbox?id=${encodeURIComponent(t.itemId)}&status=all&limit=1`
          );
          if (g !== d) return;
          const h = v?.items?.[0];
          if (!v?.success || !pe(h) || h.id !== t.itemId) throw new Error("Attached files are unavailable");
          n.value = h.files || [];
        } catch (v) {
          g === d && (c.value = G(v, "Attached files are unavailable"));
        } finally {
          g === d && (i.value = !1);
        }
      }
    }
    he(() => [t.itemId, t.files, t.count, t.version], () => {
      $();
    }, { immediate: !0 }), ke(() => {
      d += 1;
    });
    function S(g) {
      if (g)
        return /^(https?:\/\/|\/(?!\/))/i.test(g) ? g : void 0;
    }
    async function R(g) {
      if (y.value === g) {
        y.value = null;
        return;
      }
      y.value = g, f.value = !0, k.value = "";
      try {
        await de("wc-resource-view", { timeoutMs: 8e3 });
      } catch (v) {
        k.value = v instanceof Error ? v.message : String(v);
      } finally {
        f.value = !1;
      }
    }
    return (g, v) => (r(), u("section", gt, [
      v[2] || (v[2] = p("h3", null, "Files", -1)),
      i.value ? (r(), u("p", _t, "Loading attached files…")) : c.value ? (r(), u("div", xt, [
        p("p", wt, x(c.value), 1),
        T(w(te), {
          type: "button",
          size: "small",
          text: "",
          severity: "secondary",
          label: "Retry files",
          onClick: $
        })
      ])) : A("", !0),
      p("ul", $t, [
        (r(!0), u(V, null, F(n.value, (h, _) => (r(), u("li", { key: _ }, [
          h.locked ? (r(), u("div", At, [
            T(w(q), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            v[0] || (v[0] = p("span", null, "Locked file", -1))
          ])) : (r(), u(V, { key: 1 }, [
            p("div", Ct, [
              T(w(q), {
                icon: w(kt)(h.content_type || ""),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              p("div", Lt, [
                p("span", Mt, x(h.filename || "File"), 1),
                h.size !== void 0 ? (r(), u("span", Nt, x(w(bt)(h.size)), 1)) : A("", !0)
              ]),
              T(w(te), {
                type: "button",
                size: "small",
                text: "",
                severity: "secondary",
                "data-testid": "inbox-file-preview",
                label: y.value === _ ? "Close preview" : "Preview",
                "aria-expanded": y.value === _,
                onClick: (P) => R(_)
              }, null, 8, ["label", "aria-expanded", "onClick"]),
              S(h.view_url) ? (r(), u("a", {
                key: 0,
                href: S(h.view_url),
                target: "_blank",
                rel: "noopener noreferrer",
                "data-testid": "inbox-file-open"
              }, [
                v[1] || (v[1] = D("Open", -1)),
                p("span", Ot, x(h.filename || "file"), 1)
              ], 8, Tt)) : A("", !0)
            ]),
            y.value === _ ? (r(), u("div", St, [
              f.value ? (r(), u("p", Et, "Loading preview…")) : k.value ? (r(), u("p", Rt, x(k.value), 1)) : (r(), u("wc-resource-view", {
                key: 2,
                "content-type": h.content_type || "",
                filename: h.filename || "",
                "source-url": `/api/v1/inbox/${encodeURIComponent(t.itemId)}/files/${_ + 1}`
              }, null, 8, Pt))
            ])) : A("", !0)
          ], 64))
        ]))), 128))
      ])
    ]));
  }
}), Ee = {
  item_count: "integer",
  pending_count: "integer",
  resolved_count: "integer",
  urgent_count: "integer",
  high_count: "integer"
}, jt = {
  pending: "Pending",
  resolved: "Resolved",
  approved: "Approved",
  rejected: "Rejected",
  dismissed: "Dismissed"
};
function ve(e) {
  const t = e || "";
  return jt[t] || t;
}
function It(e) {
  const t = (e || "").trim();
  return t ? t.replace(/[._-]+/g, " ").replace(/\b\w/g, (n) => n.toUpperCase()) : "";
}
const Ut = 80;
function _e(e) {
  const t = e.replace(/[_-]+/g, " ").trim();
  return t ? t.split(" ").map((n) => n && n[0].toUpperCase() + n.slice(1)).join(" ") : e;
}
function Re(e) {
  return e == null ? "" : typeof e == "string" ? e : typeof e == "number" || typeof e == "boolean" ? String(e) : JSON.stringify(e, null, 2);
}
function Pe(e) {
  if (e == null || e === "") return { kind: "empty" };
  if (typeof e == "string") return { kind: "text", text: e };
  if (typeof e == "object" && !Array.isArray(e)) {
    const t = Object.entries(e).map(([n, i]) => {
      const c = Re(i);
      return { key: n, label: _e(n), value: c, long: c.length > Ut || c.includes(`
`) };
    });
    return t.length ? { kind: "rows", rows: t } : { kind: "empty" };
  }
  return { kind: "text", text: Re(e) };
}
function Fe(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean";
}
function Ft(e, t, n) {
  const i = t.default;
  return e === "checkbox" ? typeof i == "boolean" ? i : void 0 : e === "number" ? typeof i != "number" || !Number.isFinite(i) || t.type === "integer" && !Number.isInteger(i) ? void 0 : i : e === "select" ? Fe(i) && n.includes(i) ? i : void 0 : typeof i == "string" ? i : void 0;
}
function zt(e) {
  return Array.isArray(e.enum) ? "select" : e.type === "number" || e.type === "integer" ? "number" : e.type === "boolean" ? "checkbox" : e.type === "string" ? e.format === "textarea" ? "textarea" : "text" : null;
}
function Bt(e) {
  if (e && typeof e == "object" && !Array.isArray(e)) {
    const t = e, n = t.properties;
    if (!n || typeof n != "object" || Array.isArray(n)) return [];
    const i = new Set(Array.isArray(t.required) ? t.required.filter((c) => typeof c == "string") : []);
    return Object.entries(n).flatMap(([c, d]) => {
      if (!d || typeof d != "object" || Array.isArray(d)) return [];
      const y = d, f = zt(y);
      if (!f) return [];
      const k = f === "select" && Array.isArray(y.enum) ? y.enum.filter(Fe) : [], $ = Ft(f, y, k);
      return [{
        key: c,
        label: typeof y.title == "string" && y.title ? y.title : _e(c),
        type: f,
        required: i.has(c),
        options: k,
        ...$ === void 0 ? {} : { default: $ }
      }];
    });
  }
  return [];
}
function Dt(e) {
  const t = {};
  for (const n of e) t[n.key] = n.default ?? (n.type === "checkbox" ? !1 : "");
  return t;
}
function qt(e, t) {
  return e.some((n) => {
    if (!n.required) return !1;
    const i = t[n.key];
    return n.type === "checkbox" ? i !== !0 : i == null || String(i).trim() === "";
  });
}
const Ht = { class: "kx-detail" }, Wt = { class: "kx-detail-head" }, Yt = { class: "kx-detail-title-block" }, Kt = { class: "kx-detail-title" }, Jt = { class: "kx-detail-meta" }, Gt = ["title"], Xt = { class: "kx-detail-body" }, Qt = {
  key: 1,
  class: "kx-native-body"
}, Zt = ["source"], en = ["source"], tn = {
  key: 2,
  class: "kx-fields"
}, nn = ["source"], on = { key: 4 }, rn = {
  key: 0,
  "data-testid": "decision-outcome"
}, sn = {
  key: 1,
  "data-testid": "decision-submitted-form",
  class: "kx-fields"
}, an = {
  key: 5,
  class: "kx-decision-form"
}, ln = {
  key: 0,
  class: "kx-checkbox-row"
}, un = ["for"], cn = {
  key: 0,
  class: "kx-required"
}, dn = ["for"], fn = {
  key: 0,
  class: "kx-required"
}, mn = {
  key: 0,
  class: "kx-form-hint"
}, pn = {
  key: 2,
  class: "kx-native-body"
}, vn = ["source"], yn = {
  key: 1,
  class: "kx-fields"
}, hn = { class: "kx-detail-foot" }, kn = { class: "kx-resolved" }, bn = { key: 0 }, gn = /* @__PURE__ */ ye({
  __name: "InboxItem",
  props: {
    item: {},
    tag: {},
    icon: {},
    typeLabel: {},
    actions: {},
    actionOwner: {},
    resolving: { type: Boolean },
    resolvingAction: {}
  },
  emits: ["resolve", "delete"],
  setup(e, { emit: t }) {
    const n = e, i = t, c = C(null), d = C(!1);
    let y = null;
    const f = O(() => n.item.status === "pending"), k = { approve: "Approve", reject: "Reject", dismiss: "Dismiss" }, $ = O(() => (Array.isArray(n.actions) ? n.actions : []).filter((b) => typeof b == "string" && b.length > 0));
    function S(a) {
      const b = n.item.metadata;
      return a === "approve" && typeof b?.approve_label == "string" && b.approve_label ? b.approve_label : a === "reject" && typeof b?.reject_label == "string" && b.reject_label ? b.reject_label : k[a] || _e(a);
    }
    const R = O(() => {
      const a = n.item.metadata?.fields;
      return Array.isArray(a) ? a.map((b) => ({ label: String(b.label ?? b.key ?? ""), value: b.value })) : [];
    }), g = O(() => n.item.item_type === "flow_decision"), v = O(() => {
      const a = n.item.metadata?.prompt;
      return typeof a == "string" && a !== n.item.title ? a : "";
    }), h = O(() => g.value ? Pe(n.item.metadata?.context) : { kind: "empty" }), _ = O(() => g.value ? Bt(n.item.metadata?.form) : []), P = O(() => {
      const a = Pe(n.item.form);
      return a.kind !== "rows" ? [] : a.rows.map((b) => ({ ...b, label: _.value.find((s) => s.key === b.key)?.label || b.label }));
    }), L = C(Dt(_.value)), E = O(() => !qt(_.value, L.value));
    function H(a) {
      return f.value && (a !== "approve" || E.value);
    }
    function U(a) {
      return typeof a == "string" ? a : void 0;
    }
    function oe(a) {
      return typeof a == "number" ? a : void 0;
    }
    function re(a) {
      if (n.resolving || !H(a)) return;
      const b = { id: n.item.id, action: a };
      _.value.length && (b.form = { ...L.value }), i("resolve", b);
    }
    const se = O(() => n.typeLabel || It(n.item.item_type));
    function X(a) {
      return a ? new Date(a * 1e3).toLocaleString() : "";
    }
    function ae(a) {
      return Ue(a, { maxUnit: "year" });
    }
    function le(a) {
      return `kx-priority-${a === "urgent" || a === "high" || a === "low" ? a : "normal"}`;
    }
    function ue(a) {
      return a === "urgent" ? "danger" : a === "high" ? "warn" : a === "low" ? "secondary" : "info";
    }
    function Q(a) {
      const b = a.detail;
      b?.id && b?.action && i("resolve", b);
    }
    function W() {
      y && (y.removeEventListener("inbox-resolve", Q), y = null);
    }
    async function I() {
      if (!(!n.tag || !c.value)) {
        W();
        try {
          await de(n.tag, { timeoutMs: 8e3 });
          const a = document.createElement(n.tag);
          a.style.display = "block", a.style.height = "100%", a.setAttribute("item-id", n.item.id), a.setAttribute("content", n.item.content || ""), n.item.metadata && a.setAttribute("data-meta", JSON.stringify(n.item.metadata)), a.addEventListener("inbox-resolve", Q), c.value.innerHTML = "", c.value.appendChild(a), y = a;
        } catch {
          d.value = !0;
        }
      }
    }
    return Ye(() => {
      de("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      }), I();
    }), ke(W), he(() => [n.tag, n.item.id], () => {
      d.value = !1, I();
    }), (a, b) => (r(), u("div", Ht, [
      p("header", Wt, [
        p("div", {
          class: z(["kx-detail-icon", le(e.item.priority)])
        }, [
          T(w(q), {
            icon: e.icon || "tabler:inbox",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ], 2),
        p("div", Yt, [
          p("h2", Kt, x(e.item.title), 1),
          p("div", Jt, [
            T(w(ce), {
              severity: ue(e.item.priority),
              value: e.item.priority,
              class: "kx-pill kx-tag-sm"
            }, null, 8, ["severity", "value"]),
            p("span", null, x(se.value), 1),
            p("span", {
              title: X(e.item.created_at)
            }, x(ae(e.item.created_at)), 9, Gt),
            f.value ? A("", !0) : (r(), j(w(ce), {
              key: 0,
              severity: "secondary",
              value: w(ve)(e.item.status),
              class: "kx-pill kx-tag-sm"
            }, null, 8, ["value"]))
          ])
        ])
      ]),
      p("div", Xt, [
        e.tag && !d.value ? (r(), u("div", {
          key: 0,
          ref_key: "host",
          ref: c,
          class: "kx-wc-host"
        }, null, 512)) : g.value ? (r(), u("div", Qt, [
          v.value ? (r(), u("wc-render-markdown", {
            key: 0,
            class: "kx-md",
            source: v.value
          }, null, 8, Zt)) : A("", !0),
          h.value.kind === "text" ? (r(), u("wc-render-markdown", {
            key: 1,
            class: "kx-md",
            source: h.value.text
          }, null, 8, en)) : h.value.kind === "rows" ? (r(), u("dl", tn, [
            (r(!0), u(V, null, F(h.value.rows, (s) => (r(), u("div", {
              key: s.key,
              class: "kx-field-row"
            }, [
              p("dt", null, x(s.label), 1),
              p("dd", {
                class: z({ "kx-field-long": s.long })
              }, x(s.value), 3)
            ]))), 128))
          ])) : e.item.content ? (r(), u("wc-render-markdown", {
            key: 3,
            class: "kx-md",
            source: e.item.content
          }, null, 8, nn)) : A("", !0),
          f.value ? _.value.length ? (r(), u("div", an, [
            (r(!0), u(V, null, F(_.value, (s) => (r(), u("div", {
              key: s.key,
              class: "kx-form-field"
            }, [
              s.type === "checkbox" ? (r(), u("div", ln, [
                T(w(et), {
                  modelValue: L.value[s.key],
                  "onUpdate:modelValue": (o) => L.value[s.key] = o,
                  binary: "",
                  "input-id": `kx-df-${s.key}`,
                  "data-testid": `decision-${s.key}`
                }, null, 8, ["modelValue", "onUpdate:modelValue", "input-id", "data-testid"]),
                p("label", {
                  for: `kx-df-${s.key}`
                }, [
                  D(x(s.label), 1),
                  s.required ? (r(), u("span", cn, "*")) : A("", !0)
                ], 8, un)
              ])) : (r(), u(V, { key: 1 }, [
                p("label", {
                  class: "kx-form-label",
                  for: `kx-df-${s.key}`
                }, [
                  D(x(s.label), 1),
                  s.required ? (r(), u("span", fn, "*")) : A("", !0)
                ], 8, dn),
                s.type === "text" ? (r(), j(w(nt), {
                  key: 0,
                  id: `kx-df-${s.key}`,
                  "model-value": U(L.value[s.key]),
                  "data-testid": `decision-${s.key}`,
                  "onUpdate:modelValue": (o) => L.value[s.key] = o
                }, null, 8, ["id", "model-value", "data-testid", "onUpdate:modelValue"])) : s.type === "textarea" ? (r(), j(w(it), {
                  key: 1,
                  id: `kx-df-${s.key}`,
                  "model-value": U(L.value[s.key]),
                  "data-testid": `decision-${s.key}`,
                  rows: "8",
                  "auto-resize": "",
                  "onUpdate:modelValue": (o) => L.value[s.key] = o
                }, null, 8, ["id", "model-value", "data-testid", "onUpdate:modelValue"])) : s.type === "number" ? (r(), j(w(tt), {
                  key: 2,
                  "model-value": oe(L.value[s.key]),
                  "input-id": `kx-df-${s.key}`,
                  "data-testid": `decision-${s.key}`,
                  "onUpdate:modelValue": (o) => L.value[s.key] = o
                }, null, 8, ["model-value", "input-id", "data-testid", "onUpdate:modelValue"])) : (r(), j(w(ot), {
                  key: 3,
                  modelValue: L.value[s.key],
                  "onUpdate:modelValue": (o) => L.value[s.key] = o,
                  options: s.options,
                  "input-id": `kx-df-${s.key}`,
                  "data-testid": `decision-${s.key}`,
                  placeholder: "Choose…"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "input-id", "data-testid"]))
              ], 64))
            ]))), 128)),
            E.value ? A("", !0) : (r(), u("p", mn, "Fill in the required fields to approve."))
          ])) : A("", !0) : (r(), u("div", on, [
            e.item.action ? (r(), u("p", rn, "Outcome: " + x(S(e.item.action)), 1)) : A("", !0),
            P.value.length ? (r(), u("dl", sn, [
              (r(!0), u(V, null, F(P.value, (s) => (r(), u("div", {
                key: s.key,
                class: "kx-field-row"
              }, [
                p("dt", null, x(s.label), 1),
                p("dd", {
                  class: z({ "kx-field-long": s.long })
                }, x(s.value), 3)
              ]))), 128))
            ])) : A("", !0)
          ]))
        ])) : (r(), u("div", pn, [
          e.item.content ? (r(), u("wc-render-markdown", {
            key: 0,
            class: "kx-md",
            source: e.item.content
          }, null, 8, vn)) : A("", !0),
          R.value.length ? (r(), u("dl", yn, [
            (r(!0), u(V, null, F(R.value, (s, o) => (r(), u("div", {
              key: o,
              class: "kx-field-row"
            }, [
              p("dt", null, x(s.label), 1),
              p("dd", null, x(s.value), 1)
            ]))), 128))
          ])) : A("", !0)
        ])),
        e.item.file_count || e.item.files?.length ? (r(), j(Vt, {
          key: e.item.id,
          "item-id": e.item.id,
          files: e.item.files,
          count: e.item.file_count,
          version: e.item.file_version
        }, null, 8, ["item-id", "files", "count", "version"])) : A("", !0)
      ]),
      p("footer", hn, [
        f.value && e.actionOwner !== "component" ? (r(!0), u(V, { key: 0 }, F($.value, (s, o) => (r(), j(w(te), {
          key: s,
          type: "button",
          class: "kx-detail-action",
          "data-testid": "inbox-action",
          severity: o === 0 ? void 0 : "secondary",
          outlined: o !== 0,
          label: e.resolving && e.resolvingAction === s ? "Resolving…" : S(s),
          loading: e.resolving && e.resolvingAction === s,
          disabled: e.resolving || !H(s),
          onClick: (m) => re(s)
        }, null, 8, ["severity", "outlined", "label", "loading", "disabled", "onClick"]))), 128)) : f.value ? A("", !0) : (r(), u(V, { key: 1 }, [
          p("span", kn, [
            D(x(w(ve)(e.item.status)), 1),
            e.item.resolved_at ? (r(), u("span", bn, " · " + x(X(e.item.resolved_at)), 1)) : A("", !0)
          ]),
          T(w(te), {
            class: "kx-detail-action",
            type: "button",
            "data-testid": "inbox-delete",
            label: "Delete",
            severity: "secondary",
            outlined: "",
            onClick: b[0] || (b[0] = (s) => i("delete", e.item.id))
          }, {
            icon: K(({ class: s }) => [
              T(w(q), {
                icon: "tabler:trash",
                class: z(s)
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ], 64))
      ])
    ]));
  }
});
function Y(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function _n(e, t) {
  if (t == null) return t;
  switch (e) {
    case "boolean":
    case "checkbox":
      return typeof t == "boolean" ? t : t === "true" ? !0 : t === "false" ? !1 : t;
    case "number":
    case "integer": {
      if (typeof t == "number") return t;
      if (typeof t == "string" && t.trim() !== "") {
        const n = Number(t);
        if (!Number.isNaN(n)) return n;
      }
      return t;
    }
    case "object":
    case "array":
      if (typeof t == "string")
        try {
          const n = JSON.parse(t);
          if (n && typeof n == "object") return n;
        } catch {
        }
      return t;
    default:
      return t;
  }
}
function xn(e, t) {
  if (!t) return e;
  const n = {};
  for (const [i, c] of Object.entries(e))
    n[i] = _n(t[i], c);
  return n;
}
function wn(e, t, n) {
  if (t !== void 0 && !t) return null;
  const i = Y(e) ? e : {}, c = [
    i,
    Y(i.data) ? i.data : null,
    Y(i.payload) ? i.payload : null,
    Y(i.detail) ? i.detail : null
  ].filter(Boolean);
  for (const d of c) {
    if (d.event !== "component.meta.changed" && d.event !== "component.deleting" && d.event !== "component.deleted") continue;
    const y = String(d.component_id || ""), f = String(i.topic || d.topic || "");
    if (t === void 0) {
      if (!y && (!f.startsWith("component.") || f === "component.")) continue;
    } else if (y && y !== t || !y && f !== `component.${t}`) continue;
    const k = y || t || f.slice(10);
    return d.event === "component.deleting" && typeof d.deletion_job_id == "string" && d.deletion_job_id ? { event: d.event, component_id: k, deletion_job_id: d.deletion_job_id } : d.event !== "component.meta.changed" ? { event: d.event, component_id: k } : {
      event: "component.meta.changed",
      component_id: k,
      meta: xn(Y(d.meta) ? d.meta : {}, n),
      deleted: Array.isArray(d.deleted) ? d.deleted.map(String) : []
    };
  }
  return null;
}
function $n(e, t, n) {
  const i = wn(e, t, n);
  return i?.event === "component.meta.changed" ? i : null;
}
function An(e, t, n) {
  if (!e) return null;
  const i = Qe(`component.${e}`, (c) => {
    const d = $n(c, e, n);
    d && t(d);
  });
  return typeof i == "function" ? i : null;
}
const Ve = /^[ \t]*(?:>[ \t]?|#{1,6}(?=[ \t]|$)[ \t]*|[-*+][ \t]+|\d{1,9}[.)][ \t]+)/;
function Cn(e) {
  let t = e;
  for (let n = t.replace(Ve, ""); n !== t; n = t.replace(Ve, "")) t = n;
  return t.replace(/\s+/g, " ").trim();
}
function Ln(e) {
  if (!e) return "";
  for (const t of e.split(/\r?\n/)) {
    const n = Cn(t);
    if (n) return n;
  }
  return "";
}
const Mn = { class: "kx-inbox" }, Nn = { class: "kx-head-bar" }, Tn = { class: "kx-head-row" }, On = { class: "kx-head-icon" }, Sn = { class: "kx-head-text" }, En = { class: "kx-sub" }, Rn = { class: "kx-shell" }, Pn = { class: "kx-list-pane" }, Vn = {
  key: 0,
  class: "kx-loading"
}, jn = {
  key: 1,
  class: "kx-list-empty"
}, In = ["onClick"], Un = { class: "kx-item-main" }, Fn = { class: "kx-item-line" }, zn = ["title"], Bn = {
  key: 0,
  class: "kx-preview"
}, Dn = { class: "kx-detail-pane" }, qn = {
  key: 0,
  class: "kx-detail-empty"
}, Hn = {
  key: 1,
  class: "kx-detail-card"
}, Wn = /* @__PURE__ */ ye({
  __name: "inbox",
  setup(e) {
    const t = [
      { key: "pending", label: "Pending", icon: "tabler:clock" },
      { key: "resolved", label: "Resolved", icon: "tabler:checks" },
      { key: "all", label: "All", icon: "tabler:inbox" }
    ], n = C([]), i = C({}), c = C(0), d = C({}), y = C(!0), f = C(""), k = C("pending"), $ = C(""), S = C(""), R = C("");
    let g = null, v = "", h = 0, _ = !1;
    const P = /* @__PURE__ */ new Map();
    let L = 0;
    const E = O(() => n.value.find((o) => o.id === $.value) || null), H = O(() => new Map(n.value.map((o) => [o.id, Ln(o.content)]))), U = (o) => d.value[o], oe = (o, m) => Object.prototype.hasOwnProperty.call(o, m), re = O(() => k.value === "pending" ? Number(i.value.pending_count ?? c.value ?? n.value.length) : k.value === "resolved" ? Number(i.value.resolved_count ?? c.value ?? n.value.length) : k.value === "all" ? Number(i.value.item_count ?? c.value ?? n.value.length) : Number(c.value || n.value.length));
    function se(o) {
      return `kx-priority-${o === "urgent" || o === "high" || o === "low" ? o : "normal"}`;
    }
    function X(o) {
      const m = {};
      for (const l of Object.keys(Ee)) {
        const N = o[l];
        oe(o, l) && typeof N == "number" && (m[l] = N);
      }
      Object.keys(m).length && (i.value = { ...i.value, ...m });
    }
    function ae(o) {
      return Ue(o, { suffix: !1 });
    }
    function le(o) {
      return o ? new Date(o * 1e3).toLocaleString() : "";
    }
    async function ue() {
      try {
        const { data: o } = await J.get("/api/v1/inbox/item-types"), m = {};
        if (B(o) && Array.isArray(o.item_types))
          for (const l of o.item_types)
            B(l) && typeof l.value == "string" && typeof l.name == "string" && (l.icon === void 0 || typeof l.icon == "string") && (l.component_tag === void 0 || typeof l.component_tag == "string") && (l.actions === void 0 || Array.isArray(l.actions) && l.actions.every((N) => typeof N == "string")) && (l.action_owner === void 0 || l.action_owner === "component") && (m[l.value] = { value: l.value, name: l.name, icon: l.icon, component_tag: l.component_tag, actions: l.actions, action_owner: l.action_owner });
        d.value = m;
      } catch (o) {
        f.value = G(o, "Could not load inbox item types.");
      }
    }
    function Q(o) {
      return k.value === "all" || (k.value === "resolved" ? o.status !== "pending" : o.status === k.value);
    }
    function W(o, m, l, N = !0) {
      if (N)
        for (const M of o)
          M.status !== "pending" && P.delete(M.id);
      P.size || (L = 0);
      const Z = new Map(o.map((M) => [M.id, M]));
      for (const M of P.values()) {
        const ee = Z.has(M.id);
        Q(M) ? (Z.set(M.id, M), ee || (l += 1)) : Z.delete(M.id) && (l -= 1);
      }
      const xe = { urgent: 4, high: 3, normal: 2, low: 1 };
      n.value = [...Z.values()].sort((M, ee) => (xe[ee.priority] || 0) - (xe[M.priority] || 0) || (ee.created_at || 0) - (M.created_at || 0));
      const we = Math.min(m.item_count || 0, Math.max(m.resolved_count || 0, L));
      i.value = { ...m, resolved_count: we, pending_count: (m.item_count || 0) - we }, c.value = l, n.value.some((M) => M.id === $.value) || ($.value = n.value[0]?.id || "");
    }
    async function I() {
      if (_) return;
      const o = ++h;
      f.value = "";
      try {
        const { data: m } = await J.get("/api/v1/inbox?status=" + encodeURIComponent(k.value));
        if (o !== h || _) return;
        if (!B(m) || !Array.isArray(m.items) || !m.items.every(pe))
          throw new Error("Invalid inbox list response.");
        if (typeof m.component_id == "string" && s(m.component_id)) {
          await I();
          return;
        }
        W(m.items, {
          item_count: Number(m.item_count ?? 0),
          pending_count: Number(m.pending_count ?? 0),
          resolved_count: Number(m.resolved_count ?? 0),
          urgent_count: Number(m.urgent_count ?? 0),
          high_count: Number(m.high_count ?? 0)
        }, Number(m.total_count ?? m.items.length));
      } catch (m) {
        o === h && !_ && (f.value = G(m, "Could not load the inbox."));
      } finally {
        o === h && !_ && (y.value = !1);
      }
    }
    he(k, () => {
      $.value = "", I();
    });
    async function a(o) {
      f.value = "", S.value = o.id, R.value = o.action;
      const m = i.value.resolved_count || 0;
      try {
        const l = o.form ? { form: o.form } : void 0, { data: N } = await J.post(`/api/v1/inbox/${encodeURIComponent(o.id)}/${encodeURIComponent(o.action)}`, l);
        if (_) return;
        if (!B(N) || N.success !== !0 || !pe(N.item) || N.item.id !== o.id || N.item.status === "pending" || N.item.action !== o.action)
          throw new Error("Invalid inbox resolution response.");
        ++h, P.set(o.id, N.item), L = Math.max(L + 1, m + 1), W(n.value, i.value, c.value, !1), await I();
      } catch (l) {
        f.value = G(l, "Could not resolve this item.");
      } finally {
        S.value = "", R.value = "";
      }
    }
    async function b(o) {
      f.value = "";
      try {
        await J.delete(`/api/v1/inbox/${encodeURIComponent(o)}`), P.delete(o), P.size || (L = 0), $.value === o && ($.value = ""), await I();
      } catch (m) {
        f.value = G(m, "Could not delete this item.");
      }
    }
    function s(o) {
      if (!o || v === o) return !1;
      if (g && g(), g = null, v = "", g = An(o, (m) => {
        X(m.meta), I();
      }, Ee), !g) throw new Error("Could not subscribe to the inbox.");
      return v = o, !0;
    }
    return Ze(async () => {
      await Promise.all([ue(), I()]);
    }), ke(() => {
      _ = !0, ++h, P.clear(), g && g(), g = null, v = "";
    }), (o, m) => (r(), u("div", Mn, [
      p("header", Nn, [
        p("div", Tn, [
          p("div", On, [
            T(w(q), {
              icon: "tabler:inbox",
              "aria-hidden": "true"
            })
          ]),
          p("div", Sn, [
            m[1] || (m[1] = p("h1", { class: "kx-title" }, "Inbox", -1)),
            p("p", En, x(re.value) + " " + x(k.value) + " · live", 1)
          ])
        ]),
        T(w(Ge), {
          value: k.value,
          "data-kx-separator": "surface",
          "onUpdate:value": m[0] || (m[0] = (l) => k.value = String(l))
        }, {
          default: K(() => [
            T(w(Je), {
              "aria-label": "Inbox folders",
              pt: { tabList: { class: "kx-tabs-list" } }
            }, {
              default: K(() => [
                (r(), u(V, null, F(t, (l) => T(w(Ke), {
                  class: "kx-tab",
                  key: l.key,
                  value: l.key,
                  "data-testid": `inbox-tab-${l.key}`
                }, {
                  default: K(() => [
                    T(w(q), {
                      icon: l.icon,
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    D(" " + x(l.label), 1)
                  ]),
                  _: 2
                }, 1032, ["value", "data-testid"])), 64))
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["value"])
      ]),
      f.value ? (r(), j(w(Xe), {
        key: 0,
        severity: "error",
        class: "kx-alert"
      }, {
        default: K(() => [
          D(x(f.value), 1)
        ]),
        _: 1
      })) : A("", !0),
      p("main", Rn, [
        p("aside", Pn, [
          y.value ? (r(), u("div", Vn, "Loading...")) : n.value.length ? A("", !0) : (r(), u("div", jn, x(k.value === "pending" ? "Inbox zero — nothing to review." : "Nothing here."), 1)),
          (r(!0), u(V, null, F(n.value, (l) => (r(), u("button", {
            key: l.id,
            class: z(["kx-item", { active: $.value === l.id }]),
            onClick: (N) => $.value = l.id
          }, [
            p("span", {
              class: z(["kx-priority-dot", se(l.priority)])
            }, null, 2),
            p("div", Un, [
              p("div", Fn, [
                p("span", {
                  class: z(["kx-item-title", { pending: l.status === "pending" }])
                }, x(l.title), 3),
                p("span", {
                  class: "kx-time",
                  title: le(l.created_at)
                }, x(ae(l.created_at)), 9, zn)
              ]),
              H.value.get(l.id) ? (r(), u("span", Bn, x(H.value.get(l.id)), 1)) : A("", !0),
              l.status !== "pending" ? (r(), j(w(ce), {
                key: 1,
                severity: "secondary",
                value: w(ve)(l.status),
                class: "kx-status kx-tag-sm"
              }, null, 8, ["value"])) : A("", !0)
            ])
          ], 10, In))), 128))
        ]),
        p("section", Dn, [
          E.value ? (r(), u("div", Hn, [
            (r(), j(gn, {
              key: E.value.id,
              item: E.value,
              tag: U(E.value.item_type)?.component_tag,
              icon: U(E.value.item_type)?.icon,
              "type-label": U(E.value.item_type)?.name,
              actions: U(E.value.item_type)?.actions,
              "action-owner": U(E.value.item_type)?.action_owner,
              resolving: S.value === E.value.id,
              "resolving-action": R.value,
              onResolve: a,
              onDelete: b
            }, null, 8, ["item", "tag", "icon", "type-label", "actions", "action-owner", "resolving", "resolving-action"]))
          ])) : (r(), u("div", qn, " Select an item to view it. "))
        ])
      ])
    ]));
  }
}), fi = {
  rootComponent: Wn,
  plugins: [yt]
};
export {
  fi as mountConfig
};
//# sourceMappingURL=lazy-mount-DFKJcSuq.js.map

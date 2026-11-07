import Fe from "primevue/config";
import ze from "primevue/contextmenu";
import Be from "primevue/menu";
import De from "primevue/portal";
import { renderSlot as $e, createCommentVNode as C, h as qe, Teleport as He, defineComponent as ve, ref as A, watch as he, onUnmounted as ke, openBlock as r, createElementBlock as c, createElementVNode as p, toDisplayString as w, createVNode as T, unref as _, Fragment as V, renderList as F, createTextVNode as H, computed as E, onMounted as We, normalizeClass as z, createBlock as j, withCtx as K } from "vue";
import { Icon as W } from "@iconify/vue";
import G from "primevue/button";
import Ye from "primevue/tab";
import Je from "primevue/tablist";
import Ke from "primevue/tabs";
import Ge from "primevue/message";
import ue from "primevue/tag";
import { api as D, loadByTagName as de, on as Xe } from "@wippy-fe/proxy";
import { b as Qe } from "./wc-runtime-B-1gP9Y_.js";
import Ze from "primevue/checkbox";
import et from "primevue/inputnumber";
import tt from "primevue/inputtext";
import nt from "primevue/textarea";
import it from "primevue/select";
const ot = "data-wippy-overlay-layer";
function Ve() {
  return typeof window < "u" && typeof window.document < "u";
}
function je() {
  return Ve() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function rt() {
  return je() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const st = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let at = 0;
const ne = /* @__PURE__ */ new WeakMap();
function Ce(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function lt(e, t) {
  if (!st.test(e.className))
    return;
  const n = e.style.cssText;
  Ce(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
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
      const u = e.style;
      (u.top !== "auto" || u.left !== "auto" || u.margin !== "0px" || u.getPropertyPriority("top") !== "important" || u.getPropertyPriority("left") !== "important" || u.getPropertyPriority("margin") !== "important" || u.getPropertyPriority("min-width") !== "important" || u.maxWidth !== "stretch" || u.getPropertyPriority("max-width") !== "important") && Ce(e, t);
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
let Ae = !1, me = !1;
function ut() {
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
  me || (me = !0, requestAnimationFrame(ut));
}
function dt(e) {
  const t = document.createElement("div");
  t.setAttribute(ot, "");
  const n = je();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  fe(t);
  const i = new MutationObserver((u) => {
    const d = t.__wippyAnchorName;
    for (const v of u) {
      if (d)
        for (const f of Array.from(v.addedNodes))
          f instanceof HTMLElement && lt(f, d);
      for (const f of Array.from(v.removedNodes))
        f instanceof HTMLElement && be(f);
    }
    t.isConnected && t.childElementCount > 0 && fe(t);
  });
  return i.observe(t, { childList: !0 }), ge.set(t, i), ie.add(t), Ae || (Ae = !0, window.addEventListener("scroll", Le, { capture: !0, passive: !0 }), window.addEventListener("resize", Le, { passive: !0 })), t;
}
function Me(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = dt(e.hostRoot), rt())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++at}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
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
function ft() {
  if (Te)
    return;
  const e = Be;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (t) => {
      const n = t.composedPath(), i = this.container && !n.includes(this.container), u = !(this.target && n.includes(this.target));
      this.overlayVisible && i && u ? this.hide() : !this.popup && i && u && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Te = !0);
}
let Se = !1;
function mt() {
  if (Se)
    return;
  const e = ze;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (t) => {
      const n = t.composedPath(), i = this.container && !n.includes(this.container), u = this.visible ? !(this.target && n.includes(this.target)) : !0;
      i && u && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Se = !0);
}
let Oe = !1;
function pt() {
  if (Oe)
    return;
  Oe = !0;
  const e = De;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Ve() && (this.hostRoot = ct(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Me(this), this.$watch("inline", (t) => {
      t ? Ne(this) : Me(this);
    })));
  }, e.render = function() {
    return this.inline ? $e(this.$slots, "default", { key: 0 }) : this.mounted ? qe(He, { key: 1, to: this.resolvedTarget || document.body }, [
      $e(this.$slots, "default")
    ]) : C("", !0);
  }, e.unmounted = function() {
    Ne(this);
  };
}
const yt = {
  install: (e) => {
    ft(), mt(), pt(), e.use(Fe, { theme: "none" });
  }
};
function vt(e) {
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
function Ie(e, t) {
  const n = vt(e);
  if (n === null) return "";
  const i = t?.now ?? Date.now(), u = t?.suffix ?? !0, d = t?.maxUnit ?? "day", v = t?.future ?? !1, f = 6e4, k = 60 * f, $ = 24 * k, S = 30 * $, R = 365 * $, g = i - n;
  if (v && g < 0) {
    const x = -g;
    return x < f ? "in <1m" : x < k ? `in ${Math.floor(x / f)}m` : x < $ ? `in ${Math.floor(x / k)}h` : `in ${Math.floor(x / $)}d`;
  }
  const y = Math.max(0, g);
  if (y < f) return "just now";
  const h = u ? " ago" : "";
  return y < k ? `${Math.floor(y / f)}m${h}` : y < $ ? `${Math.floor(y / k)}h${h}` : d === "year" ? y < S ? `${Math.floor(y / $)}d${h}` : y < R ? `${Math.floor(y / S)}mo${h}` : `${Math.floor(y / R)}y${h}` : `${Math.floor(y / $)}d${h}`;
}
function ht(e) {
  const t = e || "";
  return t.startsWith("image/") ? "tabler:photo" : t === "application/pdf" ? "tabler:file-type-pdf" : t.includes("word") || t.includes("opendocument.text") || t === "application/rtf" ? "tabler:file-type-doc" : t.includes("sheet") || t.includes("excel") || t.includes("spreadsheet") || t === "text/csv" ? "tabler:file-type-xls" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:file-type-ppt" : t === "application/epub+zip" ? "tabler:book" : t.startsWith("text/") || t === "application/json" || t === "application/xml" ? "tabler:file-text" : "tabler:file";
}
function kt(e) {
  if (!e) return "0 B";
  const t = ["B", "KB", "MB", "GB"], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1);
  return `${(e / Math.pow(1024, n)).toFixed(n ? 1 : 0)} ${t[n]}`;
}
function q(e, t) {
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
const bt = {
  class: "kx-files",
  "aria-label": "Attached files"
}, gt = {
  key: 0,
  role: "status"
}, _t = { key: 1 }, xt = { role: "alert" }, wt = { class: "kx-file-list" }, $t = {
  key: 0,
  class: "kx-file-row kx-file-locked",
  "data-testid": "inbox-file-locked"
}, Ct = { class: "kx-file-row" }, At = { class: "kx-file-label" }, Lt = { class: "kx-file-name" }, Mt = {
  key: 0,
  class: "kx-file-size"
}, Nt = ["href"], Tt = { class: "kx-sr-only" }, St = {
  key: 0,
  class: "kx-file-preview"
}, Ot = {
  key: 0,
  role: "status"
}, Et = {
  key: 1,
  role: "alert"
}, Rt = ["content-type", "filename", "source-url"], Pt = /* @__PURE__ */ ve({
  __name: "ItemFiles",
  props: {
    itemId: {},
    files: {},
    count: {},
    version: {}
  },
  setup(e) {
    const t = e, n = A([]), i = A(!1), u = A("");
    let d = 0;
    const v = A(null), f = A(!1), k = A("");
    async function $() {
      const g = ++d;
      if (v.value = null, n.value = t.files || [], u.value = "", i.value = !1, t.files === void 0) {
        i.value = !0;
        try {
          const { data: y } = await D.get(
            `/api/v1/inbox?id=${encodeURIComponent(t.itemId)}&status=all&limit=1`
          );
          if (g !== d) return;
          const h = y?.items?.[0];
          if (!y?.success || !pe(h) || h.id !== t.itemId) throw new Error("Attached files are unavailable");
          n.value = h.files || [];
        } catch (y) {
          g === d && (u.value = q(y, "Attached files are unavailable"));
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
      if (v.value === g) {
        v.value = null;
        return;
      }
      v.value = g, f.value = !0, k.value = "";
      try {
        await de("wc-resource-view", { timeoutMs: 8e3 });
      } catch (y) {
        k.value = y instanceof Error ? y.message : String(y);
      } finally {
        f.value = !1;
      }
    }
    return (g, y) => (r(), c("section", bt, [
      y[2] || (y[2] = p("h3", null, "Files", -1)),
      i.value ? (r(), c("p", gt, "Loading attached files…")) : u.value ? (r(), c("div", _t, [
        p("p", xt, w(u.value), 1),
        T(_(G), {
          type: "button",
          size: "small",
          text: "",
          severity: "secondary",
          label: "Retry files",
          onClick: $
        })
      ])) : C("", !0),
      p("ul", wt, [
        (r(!0), c(V, null, F(n.value, (h, x) => (r(), c("li", { key: x }, [
          h.locked ? (r(), c("div", $t, [
            T(_(W), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            y[0] || (y[0] = p("span", null, "Locked file", -1))
          ])) : (r(), c(V, { key: 1 }, [
            p("div", Ct, [
              T(_(W), {
                icon: _(ht)(h.content_type || ""),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              p("div", At, [
                p("span", Lt, w(h.filename || "File"), 1),
                h.size !== void 0 ? (r(), c("span", Mt, w(_(kt)(h.size)), 1)) : C("", !0)
              ]),
              T(_(G), {
                type: "button",
                size: "small",
                text: "",
                severity: "secondary",
                "data-testid": "inbox-file-preview",
                label: v.value === x ? "Close preview" : "Preview",
                "aria-expanded": v.value === x,
                onClick: (P) => R(x)
              }, null, 8, ["label", "aria-expanded", "onClick"]),
              S(h.view_url) ? (r(), c("a", {
                key: 0,
                href: S(h.view_url),
                target: "_blank",
                rel: "noopener noreferrer",
                "data-testid": "inbox-file-open"
              }, [
                y[1] || (y[1] = H("Open", -1)),
                p("span", Tt, w(h.filename || "file"), 1)
              ], 8, Nt)) : C("", !0)
            ]),
            v.value === x ? (r(), c("div", St, [
              f.value ? (r(), c("p", Ot, "Loading preview…")) : k.value ? (r(), c("p", Et, w(k.value), 1)) : (r(), c("wc-resource-view", {
                key: 2,
                "content-type": h.content_type || "",
                filename: h.filename || "",
                "source-url": `/api/v1/inbox/${encodeURIComponent(t.itemId)}/files/${x + 1}`
              }, null, 8, Rt))
            ])) : C("", !0)
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
}, Vt = {
  pending: "Pending",
  resolved: "Resolved",
  approved: "Approved",
  rejected: "Rejected",
  dismissed: "Dismissed"
};
function ye(e) {
  const t = e || "";
  return Vt[t] || t;
}
function jt(e) {
  const t = (e || "").trim();
  return t ? t.replace(/[._-]+/g, " ").replace(/\b\w/g, (n) => n.toUpperCase()) : "";
}
const It = 80;
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
      const u = Re(i);
      return { key: n, label: _e(n), value: u, long: u.length > It || u.includes(`
`) };
    });
    return t.length ? { kind: "rows", rows: t } : { kind: "empty" };
  }
  return { kind: "text", text: Re(e) };
}
function Ue(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean";
}
function Ut(e, t, n) {
  const i = t.default;
  return e === "checkbox" ? typeof i == "boolean" ? i : void 0 : e === "number" ? typeof i != "number" || !Number.isFinite(i) || t.type === "integer" && !Number.isInteger(i) ? void 0 : i : e === "select" ? Ue(i) && n.includes(i) ? i : void 0 : typeof i == "string" ? i : void 0;
}
function Ft(e) {
  return Array.isArray(e.enum) ? "select" : e.type === "number" || e.type === "integer" ? "number" : e.type === "boolean" ? "checkbox" : e.type === "string" ? e.format === "textarea" ? "textarea" : "text" : null;
}
function zt(e) {
  if (e && typeof e == "object" && !Array.isArray(e)) {
    const t = e, n = t.properties;
    if (!n || typeof n != "object" || Array.isArray(n)) return [];
    const i = new Set(Array.isArray(t.required) ? t.required.filter((u) => typeof u == "string") : []);
    return Object.entries(n).flatMap(([u, d]) => {
      if (!d || typeof d != "object" || Array.isArray(d)) return [];
      const v = d, f = Ft(v);
      if (!f) return [];
      const k = f === "select" && Array.isArray(v.enum) ? v.enum.filter(Ue) : [], $ = Ut(f, v, k);
      return [{
        key: u,
        label: typeof v.title == "string" && v.title ? v.title : _e(u),
        type: f,
        required: i.has(u),
        options: k,
        ...$ === void 0 ? {} : { default: $ }
      }];
    });
  }
  return [];
}
function Bt(e) {
  const t = {};
  for (const n of e) t[n.key] = n.default ?? (n.type === "checkbox" ? !1 : "");
  return t;
}
function Dt(e, t) {
  return e.some((n) => {
    if (!n.required) return !1;
    const i = t[n.key];
    return n.type === "checkbox" ? i !== !0 : i == null || String(i).trim() === "";
  });
}
const qt = { class: "kx-detail" }, Ht = { class: "kx-detail-head" }, Wt = { class: "kx-detail-title-block" }, Yt = { class: "kx-detail-title" }, Jt = { class: "kx-detail-meta" }, Kt = ["title"], Gt = { class: "kx-detail-body" }, Xt = {
  key: 1,
  class: "kx-native-body"
}, Qt = ["source"], Zt = ["source"], en = {
  key: 2,
  class: "kx-fields"
}, tn = ["source"], nn = { key: 4 }, on = {
  key: 0,
  "data-testid": "decision-outcome"
}, rn = {
  key: 1,
  "data-testid": "decision-submitted-form",
  class: "kx-fields"
}, sn = {
  key: 5,
  class: "kx-decision-form"
}, an = {
  key: 0,
  class: "kx-checkbox-row"
}, ln = ["for"], cn = {
  key: 0,
  class: "kx-required"
}, un = ["for"], dn = {
  key: 0,
  class: "kx-required"
}, fn = {
  key: 0,
  class: "kx-form-hint"
}, mn = {
  key: 2,
  class: "kx-native-body"
}, pn = ["source"], yn = {
  key: 1,
  class: "kx-fields"
}, vn = { class: "kx-detail-foot" }, hn = { class: "kx-resolved" }, kn = { key: 0 }, bn = /* @__PURE__ */ ve({
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
    const n = e, i = t, u = A(null), d = A(!1);
    let v = null;
    const f = E(() => n.item.status === "pending"), k = { approve: "Approve", reject: "Reject", dismiss: "Dismiss" }, $ = E(() => (Array.isArray(n.actions) ? n.actions : []).filter((b) => typeof b == "string" && b.length > 0));
    function S(a) {
      const b = n.item.metadata;
      return a === "approve" && typeof b?.approve_label == "string" && b.approve_label ? b.approve_label : a === "reject" && typeof b?.reject_label == "string" && b.reject_label ? b.reject_label : k[a] || _e(a);
    }
    const R = E(() => {
      const a = n.item.metadata?.fields;
      return Array.isArray(a) ? a.map((b) => ({ label: String(b.label ?? b.key ?? ""), value: b.value })) : [];
    }), g = E(() => n.item.item_type === "flow_decision"), y = E(() => {
      const a = n.item.metadata?.prompt;
      return typeof a == "string" && a !== n.item.title ? a : "";
    }), h = E(() => g.value ? Pe(n.item.metadata?.context) : { kind: "empty" }), x = E(() => g.value ? zt(n.item.metadata?.form) : []), P = E(() => {
      const a = Pe(n.item.form);
      return a.kind !== "rows" ? [] : a.rows.map((b) => ({ ...b, label: x.value.find((s) => s.key === b.key)?.label || b.label }));
    }), L = A(Bt(x.value)), O = E(() => !Dt(x.value, L.value));
    function U(a) {
      return f.value && (a !== "approve" || O.value);
    }
    function X(a) {
      return typeof a == "string" ? a : void 0;
    }
    function oe(a) {
      return typeof a == "number" ? a : void 0;
    }
    function re(a) {
      if (n.resolving || !U(a)) return;
      const b = { id: n.item.id, action: a };
      x.value.length && (b.form = { ...L.value }), i("resolve", b);
    }
    const se = E(() => n.typeLabel || jt(n.item.item_type));
    function Q(a) {
      return a ? new Date(a * 1e3).toLocaleString() : "";
    }
    function ae(a) {
      return Ie(a, { maxUnit: "year" });
    }
    function le(a) {
      return `kx-priority-${a === "urgent" || a === "high" || a === "low" ? a : "normal"}`;
    }
    function ce(a) {
      return a === "urgent" ? "danger" : a === "high" ? "warn" : a === "low" ? "secondary" : "info";
    }
    function Y(a) {
      const b = a.detail;
      b?.id && b?.action && i("resolve", b);
    }
    function I() {
      v && (v.removeEventListener("inbox-resolve", Y), v = null);
    }
    async function Z() {
      if (!(!n.tag || !u.value)) {
        I();
        try {
          await de(n.tag, { timeoutMs: 8e3 });
          const a = document.createElement(n.tag);
          a.style.display = "block", a.style.height = "100%", a.setAttribute("item-id", n.item.id), a.setAttribute("content", n.item.content || ""), n.item.metadata && a.setAttribute("data-meta", JSON.stringify(n.item.metadata)), a.addEventListener("inbox-resolve", Y), u.value.innerHTML = "", u.value.appendChild(a), v = a;
        } catch {
          d.value = !0;
        }
      }
    }
    return We(() => {
      de("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      }), Z();
    }), ke(I), he(() => [n.tag, n.item.id], () => {
      d.value = !1, Z();
    }), (a, b) => (r(), c("div", qt, [
      p("header", Ht, [
        p("div", {
          class: z(["kx-detail-icon", le(e.item.priority)])
        }, [
          T(_(W), {
            icon: e.icon || "tabler:inbox",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ], 2),
        p("div", Wt, [
          p("h2", Yt, w(e.item.title), 1),
          p("div", Jt, [
            T(_(ue), {
              severity: ce(e.item.priority),
              value: e.item.priority,
              class: "kx-pill kx-tag-sm"
            }, null, 8, ["severity", "value"]),
            p("span", null, w(se.value), 1),
            p("span", {
              title: Q(e.item.created_at)
            }, w(ae(e.item.created_at)), 9, Kt),
            f.value ? C("", !0) : (r(), j(_(ue), {
              key: 0,
              severity: "secondary",
              value: _(ye)(e.item.status),
              class: "kx-pill kx-tag-sm"
            }, null, 8, ["value"]))
          ])
        ])
      ]),
      p("div", Gt, [
        e.tag && !d.value ? (r(), c("div", {
          key: 0,
          ref_key: "host",
          ref: u,
          class: "kx-wc-host"
        }, null, 512)) : g.value ? (r(), c("div", Xt, [
          y.value ? (r(), c("wc-render-markdown", {
            key: 0,
            class: "kx-md",
            source: y.value
          }, null, 8, Qt)) : C("", !0),
          h.value.kind === "text" ? (r(), c("wc-render-markdown", {
            key: 1,
            class: "kx-md",
            source: h.value.text
          }, null, 8, Zt)) : h.value.kind === "rows" ? (r(), c("dl", en, [
            (r(!0), c(V, null, F(h.value.rows, (s) => (r(), c("div", {
              key: s.key,
              class: "kx-field-row"
            }, [
              p("dt", null, w(s.label), 1),
              p("dd", {
                class: z({ "kx-field-long": s.long })
              }, w(s.value), 3)
            ]))), 128))
          ])) : e.item.content ? (r(), c("wc-render-markdown", {
            key: 3,
            class: "kx-md",
            source: e.item.content
          }, null, 8, tn)) : C("", !0),
          f.value ? x.value.length ? (r(), c("div", sn, [
            (r(!0), c(V, null, F(x.value, (s) => (r(), c("div", {
              key: s.key,
              class: "kx-form-field"
            }, [
              s.type === "checkbox" ? (r(), c("div", an, [
                T(_(Ze), {
                  modelValue: L.value[s.key],
                  "onUpdate:modelValue": (o) => L.value[s.key] = o,
                  binary: "",
                  "input-id": `kx-df-${s.key}`,
                  "data-testid": `decision-${s.key}`
                }, null, 8, ["modelValue", "onUpdate:modelValue", "input-id", "data-testid"]),
                p("label", {
                  for: `kx-df-${s.key}`
                }, [
                  H(w(s.label), 1),
                  s.required ? (r(), c("span", cn, "*")) : C("", !0)
                ], 8, ln)
              ])) : (r(), c(V, { key: 1 }, [
                p("label", {
                  class: "kx-form-label",
                  for: `kx-df-${s.key}`
                }, [
                  H(w(s.label), 1),
                  s.required ? (r(), c("span", dn, "*")) : C("", !0)
                ], 8, un),
                s.type === "text" ? (r(), j(_(tt), {
                  key: 0,
                  id: `kx-df-${s.key}`,
                  "model-value": X(L.value[s.key]),
                  "data-testid": `decision-${s.key}`,
                  "onUpdate:modelValue": (o) => L.value[s.key] = o
                }, null, 8, ["id", "model-value", "data-testid", "onUpdate:modelValue"])) : s.type === "textarea" ? (r(), j(_(nt), {
                  key: 1,
                  id: `kx-df-${s.key}`,
                  "model-value": X(L.value[s.key]),
                  "data-testid": `decision-${s.key}`,
                  rows: "8",
                  "auto-resize": "",
                  "onUpdate:modelValue": (o) => L.value[s.key] = o
                }, null, 8, ["id", "model-value", "data-testid", "onUpdate:modelValue"])) : s.type === "number" ? (r(), j(_(et), {
                  key: 2,
                  "model-value": oe(L.value[s.key]),
                  "input-id": `kx-df-${s.key}`,
                  "data-testid": `decision-${s.key}`,
                  "onUpdate:modelValue": (o) => L.value[s.key] = o
                }, null, 8, ["model-value", "input-id", "data-testid", "onUpdate:modelValue"])) : (r(), j(_(it), {
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
            O.value ? C("", !0) : (r(), c("p", fn, "Fill in the required fields to approve."))
          ])) : C("", !0) : (r(), c("div", nn, [
            e.item.action ? (r(), c("p", on, "Outcome: " + w(S(e.item.action)), 1)) : C("", !0),
            P.value.length ? (r(), c("dl", rn, [
              (r(!0), c(V, null, F(P.value, (s) => (r(), c("div", {
                key: s.key,
                class: "kx-field-row"
              }, [
                p("dt", null, w(s.label), 1),
                p("dd", {
                  class: z({ "kx-field-long": s.long })
                }, w(s.value), 3)
              ]))), 128))
            ])) : C("", !0)
          ]))
        ])) : (r(), c("div", mn, [
          e.item.content ? (r(), c("wc-render-markdown", {
            key: 0,
            class: "kx-md",
            source: e.item.content
          }, null, 8, pn)) : C("", !0),
          R.value.length ? (r(), c("dl", yn, [
            (r(!0), c(V, null, F(R.value, (s, o) => (r(), c("div", {
              key: o,
              class: "kx-field-row"
            }, [
              p("dt", null, w(s.label), 1),
              p("dd", null, w(s.value), 1)
            ]))), 128))
          ])) : C("", !0)
        ])),
        e.item.file_count || e.item.files?.length ? (r(), j(Pt, {
          key: e.item.id,
          "item-id": e.item.id,
          files: e.item.files,
          count: e.item.file_count,
          version: e.item.file_version
        }, null, 8, ["item-id", "files", "count", "version"])) : C("", !0)
      ]),
      p("footer", vn, [
        f.value && e.actionOwner !== "component" ? (r(!0), c(V, { key: 0 }, F($.value, (s, o) => (r(), j(_(G), {
          key: s,
          type: "button",
          class: "kx-detail-action",
          "data-testid": "inbox-action",
          severity: o === 0 ? void 0 : "secondary",
          outlined: o !== 0,
          label: e.resolving && e.resolvingAction === s ? "Resolving…" : S(s),
          loading: e.resolving && e.resolvingAction === s,
          disabled: e.resolving || !U(s),
          onClick: (m) => re(s)
        }, null, 8, ["severity", "outlined", "label", "loading", "disabled", "onClick"]))), 128)) : f.value ? C("", !0) : (r(), c(V, { key: 1 }, [
          p("span", hn, [
            H(w(_(ye)(e.item.status)), 1),
            e.item.resolved_at ? (r(), c("span", kn, " · " + w(Q(e.item.resolved_at)), 1)) : C("", !0)
          ]),
          T(_(G), {
            class: "kx-detail-action",
            type: "button",
            "data-testid": "inbox-delete",
            label: "Delete",
            severity: "secondary",
            outlined: "",
            onClick: b[0] || (b[0] = (s) => i("delete", e.item.id))
          }, {
            icon: K(({ class: s }) => [
              T(_(W), {
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
function J(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function gn(e, t) {
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
function _n(e, t) {
  if (!t) return e;
  const n = {};
  for (const [i, u] of Object.entries(e))
    n[i] = gn(t[i], u);
  return n;
}
function xn(e, t, n) {
  if (t !== void 0 && !t) return null;
  const i = J(e) ? e : {}, u = [
    i,
    J(i.data) ? i.data : null,
    J(i.payload) ? i.payload : null,
    J(i.detail) ? i.detail : null
  ].filter(Boolean);
  for (const d of u) {
    if (d.event !== "component.meta.changed" && d.event !== "component.deleting" && d.event !== "component.deleted") continue;
    const v = String(d.component_id || ""), f = String(i.topic || d.topic || "");
    if (t === void 0) {
      if (!v && (!f.startsWith("component.") || f === "component.")) continue;
    } else if (v && v !== t || !v && f !== `component.${t}`) continue;
    const k = v || t || f.slice(10);
    return d.event === "component.deleting" && typeof d.deletion_job_id == "string" && d.deletion_job_id ? { event: d.event, component_id: k, deletion_job_id: d.deletion_job_id } : d.event !== "component.meta.changed" ? { event: d.event, component_id: k } : {
      event: "component.meta.changed",
      component_id: k,
      meta: _n(J(d.meta) ? d.meta : {}, n),
      deleted: Array.isArray(d.deleted) ? d.deleted.map(String) : []
    };
  }
  return null;
}
function wn(e, t, n) {
  const i = xn(e, t, n);
  return i?.event === "component.meta.changed" ? i : null;
}
function $n(e, t, n) {
  if (!e) return null;
  const i = Xe(`component.${e}`, (u) => {
    const d = wn(u, e, n);
    d && t(d);
  });
  return typeof i == "function" ? i : null;
}
const Cn = { class: "kx-inbox" }, An = { class: "kx-head-bar" }, Ln = { class: "kx-head-row" }, Mn = { class: "kx-head-icon" }, Nn = { class: "kx-head-text" }, Tn = { class: "kx-sub" }, Sn = { class: "kx-head-actions" }, On = { class: "kx-shell" }, En = { class: "kx-list-pane" }, Rn = {
  key: 0,
  class: "kx-loading"
}, Pn = {
  key: 1,
  class: "kx-list-empty"
}, Vn = ["onClick"], jn = { class: "kx-item-main" }, In = { class: "kx-item-line" }, Un = ["title"], Fn = ["source"], zn = { class: "kx-detail-pane" }, Bn = {
  key: 0,
  class: "kx-detail-empty"
}, Dn = {
  key: 1,
  class: "kx-detail-card"
}, qn = /* @__PURE__ */ ve({
  __name: "inbox",
  setup(e) {
    const t = [
      { key: "pending", label: "Pending", icon: "tabler:clock" },
      { key: "resolved", label: "Resolved", icon: "tabler:checks" },
      { key: "all", label: "All", icon: "tabler:inbox" }
    ], n = A([]), i = A({}), u = A(0), d = A({}), v = A(!0), f = A(""), k = A("pending"), $ = A(""), S = A(""), R = A("");
    let g = null, y = "", h = 0, x = !1;
    const P = /* @__PURE__ */ new Map();
    let L = 0;
    const O = E(() => n.value.find((o) => o.id === $.value) || null), U = (o) => d.value[o], X = (o, m) => Object.prototype.hasOwnProperty.call(o, m), oe = E(() => k.value === "pending" ? Number(i.value.pending_count ?? u.value ?? n.value.length) : k.value === "resolved" ? Number(i.value.resolved_count ?? u.value ?? n.value.length) : k.value === "all" ? Number(i.value.item_count ?? u.value ?? n.value.length) : Number(u.value || n.value.length));
    function re(o) {
      return `kx-priority-${o === "urgent" || o === "high" || o === "low" ? o : "normal"}`;
    }
    function se(o) {
      const m = {};
      for (const l of Object.keys(Ee)) {
        const N = o[l];
        X(o, l) && typeof N == "number" && (m[l] = N);
      }
      Object.keys(m).length && (i.value = { ...i.value, ...m });
    }
    function Q(o) {
      return Ie(o, { suffix: !1 });
    }
    function ae(o) {
      return o ? new Date(o * 1e3).toLocaleString() : "";
    }
    async function le() {
      try {
        const { data: o } = await D.get("/api/v1/inbox/item-types"), m = {};
        if (B(o) && Array.isArray(o.item_types))
          for (const l of o.item_types)
            B(l) && typeof l.value == "string" && typeof l.name == "string" && (l.icon === void 0 || typeof l.icon == "string") && (l.component_tag === void 0 || typeof l.component_tag == "string") && (l.actions === void 0 || Array.isArray(l.actions) && l.actions.every((N) => typeof N == "string")) && (l.action_owner === void 0 || l.action_owner === "component") && (m[l.value] = { value: l.value, name: l.name, icon: l.icon, component_tag: l.component_tag, actions: l.actions, action_owner: l.action_owner });
        d.value = m;
      } catch (o) {
        f.value = q(o, "Could not load inbox item types.");
      }
    }
    function ce(o) {
      return k.value === "all" || (k.value === "resolved" ? o.status !== "pending" : o.status === k.value);
    }
    function Y(o, m, l, N = !0) {
      if (N)
        for (const M of o)
          M.status !== "pending" && P.delete(M.id);
      P.size || (L = 0);
      const ee = new Map(o.map((M) => [M.id, M]));
      for (const M of P.values()) {
        const te = ee.has(M.id);
        ce(M) ? (ee.set(M.id, M), te || (l += 1)) : ee.delete(M.id) && (l -= 1);
      }
      const xe = { urgent: 4, high: 3, normal: 2, low: 1 };
      n.value = [...ee.values()].sort((M, te) => (xe[te.priority] || 0) - (xe[M.priority] || 0) || (te.created_at || 0) - (M.created_at || 0));
      const we = Math.min(m.item_count || 0, Math.max(m.resolved_count || 0, L));
      i.value = { ...m, resolved_count: we, pending_count: (m.item_count || 0) - we }, u.value = l, n.value.some((M) => M.id === $.value) || ($.value = n.value[0]?.id || "");
    }
    async function I() {
      if (x) return;
      const o = ++h;
      f.value = "";
      try {
        const { data: m } = await D.get("/api/v1/inbox?status=" + encodeURIComponent(k.value));
        if (o !== h || x) return;
        if (!B(m) || !Array.isArray(m.items) || !m.items.every(pe))
          throw new Error("Invalid inbox list response.");
        if (typeof m.component_id == "string" && s(m.component_id)) {
          await I();
          return;
        }
        Y(m.items, {
          item_count: Number(m.item_count ?? 0),
          pending_count: Number(m.pending_count ?? 0),
          resolved_count: Number(m.resolved_count ?? 0),
          urgent_count: Number(m.urgent_count ?? 0),
          high_count: Number(m.high_count ?? 0)
        }, Number(m.total_count ?? m.items.length));
      } catch (m) {
        o === h && !x && (f.value = q(m, "Could not load the inbox."));
      } finally {
        o === h && !x && (v.value = !1);
      }
    }
    he(k, () => {
      $.value = "", I();
    });
    async function Z(o) {
      f.value = "", S.value = o.id, R.value = o.action;
      const m = i.value.resolved_count || 0;
      try {
        const l = o.form ? { form: o.form } : void 0, { data: N } = await D.post(`/api/v1/inbox/${encodeURIComponent(o.id)}/${encodeURIComponent(o.action)}`, l);
        if (x) return;
        if (!B(N) || N.success !== !0 || !pe(N.item) || N.item.id !== o.id || N.item.status === "pending" || N.item.action !== o.action)
          throw new Error("Invalid inbox resolution response.");
        ++h, P.set(o.id, N.item), L = Math.max(L + 1, m + 1), Y(n.value, i.value, u.value, !1), await I();
      } catch (l) {
        f.value = q(l, "Could not resolve this item.");
      } finally {
        S.value = "", R.value = "";
      }
    }
    async function a(o) {
      f.value = "";
      try {
        await D.delete(`/api/v1/inbox/${encodeURIComponent(o)}`), P.delete(o), P.size || (L = 0), $.value === o && ($.value = ""), await I();
      } catch (m) {
        f.value = q(m, "Could not delete this item.");
      }
    }
    async function b() {
      try {
        await D.post("/api/v1/inbox", {
          item_type: "notice",
          title: "Test notice " + (/* @__PURE__ */ new Date()).toLocaleTimeString(),
          content: "Created to exercise the realtime round-trip.",
          priority: "high"
        });
      } catch (o) {
        f.value = q(o, "Could not create the test notice.");
      }
    }
    function s(o) {
      if (!o || y === o) return !1;
      if (g && g(), g = null, y = "", g = $n(o, (m) => {
        se(m.meta), I();
      }, Ee), !g) throw new Error("Could not subscribe to the inbox.");
      return y = o, !0;
    }
    return Qe(async () => {
      await Promise.all([le(), I()]);
    }), ke(() => {
      x = !0, ++h, P.clear(), g && g(), g = null, y = "";
    }), (o, m) => (r(), c("div", Cn, [
      p("header", An, [
        p("div", Ln, [
          p("div", Mn, [
            T(_(W), {
              icon: "tabler:inbox",
              "aria-hidden": "true"
            })
          ]),
          p("div", Nn, [
            m[1] || (m[1] = p("h1", { class: "kx-title" }, "Inbox", -1)),
            p("p", Tn, w(oe.value) + " " + w(k.value) + " · live", 1)
          ]),
          p("div", Sn, [
            T(_(G), {
              type: "button",
              label: "New notice",
              severity: "secondary",
              outlined: "",
              onClick: b
            })
          ])
        ]),
        T(_(Ke), {
          value: k.value,
          "data-kx-separator": "surface",
          "onUpdate:value": m[0] || (m[0] = (l) => k.value = String(l))
        }, {
          default: K(() => [
            T(_(Je), {
              "aria-label": "Inbox folders",
              pt: { tabList: { class: "kx-tabs-list" } }
            }, {
              default: K(() => [
                (r(), c(V, null, F(t, (l) => T(_(Ye), {
                  class: "kx-tab",
                  key: l.key,
                  value: l.key,
                  "data-testid": `inbox-tab-${l.key}`
                }, {
                  default: K(() => [
                    T(_(W), {
                      icon: l.icon,
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    H(" " + w(l.label), 1)
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
      f.value ? (r(), j(_(Ge), {
        key: 0,
        severity: "error",
        class: "kx-alert"
      }, {
        default: K(() => [
          H(w(f.value), 1)
        ]),
        _: 1
      })) : C("", !0),
      p("main", On, [
        p("aside", En, [
          v.value ? (r(), c("div", Rn, "Loading...")) : n.value.length ? C("", !0) : (r(), c("div", Pn, w(k.value === "pending" ? "Inbox zero — nothing to review." : "Nothing here."), 1)),
          (r(!0), c(V, null, F(n.value, (l) => (r(), c("button", {
            key: l.id,
            class: z(["kx-item", { active: $.value === l.id }]),
            onClick: (N) => $.value = l.id
          }, [
            p("span", {
              class: z(["kx-priority-dot", re(l.priority)])
            }, null, 2),
            p("div", jn, [
              p("div", In, [
                p("span", {
                  class: z(["kx-item-title", { pending: l.status === "pending" }])
                }, w(l.title), 3),
                p("span", {
                  class: "kx-time",
                  title: ae(l.created_at)
                }, w(Q(l.created_at)), 9, Un)
              ]),
              l.content ? (r(), c("wc-render-markdown", {
                key: 0,
                class: "kx-preview",
                source: l.content,
                inert: ""
              }, null, 8, Fn)) : C("", !0),
              l.status !== "pending" ? (r(), j(_(ue), {
                key: 1,
                severity: "secondary",
                value: _(ye)(l.status),
                class: "kx-status kx-tag-sm"
              }, null, 8, ["value"])) : C("", !0)
            ])
          ], 10, Vn))), 128))
        ]),
        p("section", zn, [
          O.value ? (r(), c("div", Dn, [
            (r(), j(bn, {
              key: O.value.id,
              item: O.value,
              tag: U(O.value.item_type)?.component_tag,
              icon: U(O.value.item_type)?.icon,
              "type-label": U(O.value.item_type)?.name,
              actions: U(O.value.item_type)?.actions,
              "action-owner": U(O.value.item_type)?.action_owner,
              resolving: S.value === O.value.id,
              "resolving-action": R.value,
              onResolve: Z,
              onDelete: a
            }, null, 8, ["item", "tag", "icon", "type-label", "actions", "action-owner", "resolving", "resolving-action"]))
          ])) : (r(), c("div", Bn, " Select an item to view it. "))
        ])
      ])
    ]));
  }
}), ui = {
  rootComponent: qn,
  plugins: [yt]
};
export {
  ui as mountConfig
};
//# sourceMappingURL=lazy-mount-4q57BfsP.js.map

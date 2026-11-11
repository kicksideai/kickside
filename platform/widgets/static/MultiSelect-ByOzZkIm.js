import { defineComponent as _e, computed as p, reactive as ke, ref as $, watch as U, onMounted as we, onBeforeUnmount as Ce, openBlock as n, createElementBlock as c, Fragment as M, createElementVNode as v, renderList as H, createBlock as Y, unref as g, createCommentVNode as m, toDisplayString as h, withModifiers as Se, createVNode as w, withDirectives as xe, vModelText as Ie, withCtx as Ke, createTextVNode as I, normalizeClass as ie, nextTick as Ee } from "vue";
import { Icon as _ } from "@iconify/vue";
import { api as Z } from "@wippy-fe/proxy";
import { a as $e, u as Me } from "./wc-runtime-CNDpK4lj.js";
import { a as Ae } from "./pickerValue-SPnnNBeX.js";
import { _ as Pe } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-CU5LLZRq.js";
const Te = () => $e(), Le = () => Me();
function ce(l, e) {
  if (l && typeof l == "object") {
    const r = l, o = r.response?.data?.error;
    if (typeof o == "string") return o;
    if (o && typeof o == "object" && typeof o.message == "string")
      return o.message;
    if (typeof r.message == "string" && r.message) return r.message;
  }
  return e;
}
function ue(l) {
  return l.drillId || l.value;
}
class Ne {
  constructor(e, r = "server") {
    this.fetchPage = e, this.declared = r, this.serverSearch = r === "server";
  }
  rows = [];
  query = "";
  nextCursor = null;
  loading = !1;
  loaded = !1;
  error = null;
  serverSearch;
  // The containers drilled into, outermost first.
  trail = [];
  generation = 0;
  failedCursor = null;
  get hasMore() {
    return this.nextCursor !== null;
  }
  // The search text is applied to the loaded rows here, not by the source.
  get filtersLocally() {
    return !this.serverSearch && this.query !== "";
  }
  get visible() {
    if (!this.filtersLocally) return this.rows;
    const e = this.query.toLowerCase();
    return this.rows.filter((r) => r.label.toLowerCase().includes(e) || r.value.toLowerCase().includes(e) || r.description.toLowerCase().includes(e));
  }
  get parentId() {
    return this.trail.length ? this.trail[this.trail.length - 1].id : "";
  }
  // Point the pager at another source (or search mode) and forget everything
  // loaded from the previous one.
  configure(e, r) {
    this.fetchPage = e, this.declared = r, this.serverSearch = r === "server", this.trail = [], this.query = "", this.clear();
  }
  // Start over at the current level for a search text (empty lists
  // everything). A source that cannot search keeps its loaded rows and only
  // filters them.
  search(e) {
    return this.query = e.trim(), !this.serverSearch && this.loaded ? Promise.resolve() : this.restart();
  }
  drill(e) {
    return !e.drillable || !e.drillId ? Promise.resolve() : (this.trail = [...this.trail, { id: e.drillId, label: e.label }], this.restart());
  }
  // Go back to the level at `depth` (0 is the top).
  up(e) {
    return e < 0 || e >= this.trail.length ? Promise.resolve() : (this.trail = this.trail.slice(0, e), this.restart());
  }
  loadMore() {
    return this.loading || this.nextCursor === null ? Promise.resolve() : this.load(this.nextCursor);
  }
  // Repeat the request that failed: the next page when rows are already
  // loaded, the first page of the level otherwise.
  retry() {
    return this.failedCursor !== null && this.rows.length ? this.load(this.failedCursor) : this.restart();
  }
  restart() {
    return this.clear(), this.load(null);
  }
  clear() {
    this.generation++, this.rows = [], this.nextCursor = null, this.loaded = !1, this.loading = !1, this.error = null, this.failedCursor = null;
  }
  async load(e) {
    const r = ++this.generation;
    this.loading = !0, this.error = null;
    const o = this.serverSearch && this.query ? this.query : "", d = {};
    o && (d.q = o), e && (d.cursor = e), this.parentId && (d.parentId = this.parentId);
    try {
      const u = await this.fetchPage(d);
      if (r !== this.generation) return;
      const C = new Set(this.rows.map(ue)), y = u.rows.filter((K) => !C.has(ue(K)));
      this.rows = [...this.rows, ...y], this.nextCursor = u.nextCursor || null, this.loaded = !0, this.failedCursor = null, this.loading = !1, typeof u.search == "boolean" && u.search !== this.serverSearch && (this.serverSearch = u.search, u.search && this.query && !o && await this.restart());
    } catch (u) {
      if (r !== this.generation) return;
      this.error = u, this.failedCursor = e, this.loading = !1;
    }
  }
}
function Oe(l, e) {
  return l.includes(e) ? l.filter((r) => r !== e) : [...l, e];
}
const Re = ["items", "results", "rows", "data"];
function P(l) {
  return typeof l == "string" ? l : typeof l == "number" ? String(l) : "";
}
function de(l, e) {
  if (!l || typeof l != "object") return [];
  const r = l;
  if (e && Array.isArray(r[e])) return r[e];
  for (const o of Re)
    if (Array.isArray(r[o])) return r[o];
  return [];
}
function J(l, e, r) {
  const o = P(l[e.idKey]), d = P(l[e.drillKey]), u = P(l[e.labelKey]) || o || d;
  return {
    value: o,
    drillId: d,
    label: u,
    description: P(l[e.descKey]),
    icon: P(l[e.iconKey]),
    meta: e.metaKey ? P(l[e.metaKey]) : "",
    selectable: r.selectable && o !== "",
    drillable: r.drillable && d !== "",
    raw: l
  };
}
function he(l) {
  const e = l.next_cursor;
  return typeof e == "string" && e !== "" ? e : null;
}
function qe(l) {
  return async (e) => {
    const r = new URLSearchParams();
    e.q && r.set("q", e.q), r.set("limit", String(l.pageSize)), e.cursor && r.set("cursor", e.cursor), e.parentId && r.set("parent_id", e.parentId);
    const o = l.source.includes("?") ? "&" : "?", { data: d } = await Z.get(`${l.source}${o}${r.toString()}`), u = d && typeof d == "object" ? d : {};
    return {
      rows: de(u, l.responseKey).map((y) => J(y, l.keys, {
        selectable: y.selectable !== !1,
        drillable: y.drillable === !0
      })),
      nextCursor: he(u),
      search: typeof u.search == "boolean" ? u.search : void 0
    };
  };
}
class De extends Error {
}
function Ue(l) {
  const e = l.discoverPath.replace("{id}", encodeURIComponent(l.connectionId));
  return async (r) => {
    const o = { limit: l.pageSize };
    r.q && (o.q = r.q), r.cursor && (o.cursor = r.cursor), r.parentId && (o.parent_id = r.parentId);
    const { data: d } = await Z.post(e, o), u = d && typeof d == "object" ? d : {}, C = Array.isArray(u.resources) ? u.resources : [], y = Array.isArray(u.items) ? u.items : [];
    if (y.length !== C.length)
      throw new De("The connection answered a discovery page whose items do not match its resources.");
    return { rows: C.map((T, O) => J(T, l.keys, {
      selectable: y[O].selectable === !0,
      drillable: y[O].drillable === !0
    })), nextCursor: he(u) };
  };
}
const ze = { class: "ms-chip-label" }, je = ["title", "aria-label", "onClick"], Be = ["placeholder", "aria-label", "aria-expanded"], Ve = ["aria-busy"], Fe = {
  key: 0,
  class: "ms-crumbs",
  "aria-label": "Location"
}, Ge = ["onClick"], He = {
  key: 1,
  class: "ms-crumb ms-crumb-here",
  "aria-current": "location"
}, Ye = {
  key: 1,
  class: "ms-hint",
  role: "status"
}, Ze = {
  key: 2,
  class: "ms-alert",
  role: "alert"
}, Je = { class: "ms-alert-text" }, Qe = {
  key: 3,
  class: "ms-state"
}, We = {
  key: 4,
  class: "ms-state",
  role: "status"
}, Xe = {
  key: 5,
  class: "ms-state"
}, et = {
  key: 6,
  class: "ms-list",
  role: "group",
  "aria-label": "Results"
}, tt = ["aria-pressed", "onClick", "onMousemove"], st = { class: "ms-row-main" }, rt = { class: "ms-row-title" }, lt = {
  key: 0,
  class: "ms-row-tag"
}, at = {
  key: 0,
  class: "ms-row-sub"
}, ot = ["aria-label", "onClick", "onMousemove"], nt = { class: "ms-row-main" }, it = { class: "ms-row-title" }, ct = {
  key: 0,
  class: "ms-row-tag"
}, ut = {
  key: 0,
  class: "ms-row-sub"
}, dt = {
  key: 2,
  type: "button",
  class: "ms-row ms-row-off",
  disabled: ""
}, ht = { class: "ms-row-main" }, vt = { class: "ms-row-title" }, ft = { class: "ms-row-sub" }, mt = ["title", "aria-label", "onClick"], pt = {
  key: 7,
  class: "ms-foot"
}, yt = { class: "ms-count" }, bt = ["disabled"], gt = 20, _t = 1e3, kt = 180, Et = /* @__PURE__ */ _e({
  __name: "MultiSelect",
  setup(l) {
    const e = Te(), r = Le(), o = p(() => e.value?.source || ""), d = p(() => e.value?.connectionId || ""), u = p(() => e.value?.discoverPath || "/api/v1/connections/{id}/discover_resources"), C = p(() => e.value?.search === "local" ? "local" : "server"), y = p(() => {
      const t = Number(e.value?.pageSize);
      return Number.isInteger(t) && t >= 1 ? Math.min(t, _t) : gt;
    }), K = p(() => ({
      idKey: e.value?.idKey || "id",
      labelKey: e.value?.labelKey || "name",
      descKey: e.value?.descKey || "description",
      iconKey: e.value?.iconKey || "icon",
      metaKey: e.value?.metaKey || "",
      drillKey: e.value?.drillKey || "id"
    })), T = p(() => e.value?.responseKey || (d.value ? "resources" : "")), O = p(() => e.value?.unselectableHint || "This item cannot be selected."), z = p(() => e.value?.multi !== !1), Q = p(() => e.value?.placeholder || "Search…"), j = p(() => !!(d.value || o.value));
    function W() {
      return d.value ? Ue({ connectionId: d.value, discoverPath: u.value, pageSize: y.value, keys: K.value }) : qe({ source: o.value, responseKey: T.value, pageSize: y.value, keys: K.value });
    }
    const a = ke(new Ne(W(), C.value)), f = $([]), A = $({}), S = $(!1), x = $(""), k = $(-1), X = $(null), R = $(null), E = p(() => a.visible), ee = p(() => a.error ? ce(a.error, "The list could not be loaded.") : ""), ve = p(() => {
      if (a.query) return `No matches for “${a.query}”.`;
      const t = a.trail[a.trail.length - 1];
      return t ? `Nothing in ${t.label}.` : "Nothing to choose from.";
    });
    function B(t) {
      t.value && (A.value = { ...A.value, [t.value]: { label: t.label, icon: t.icon } });
    }
    function q(t) {
      return A.value[t]?.label || t;
    }
    function te(t) {
      return A.value[t]?.icon || "";
    }
    function D(t) {
      return f.value.includes(t);
    }
    function fe(t) {
      return t.drillId || t.value;
    }
    function V(t) {
      return !!t && (t.selectable || t.drillable);
    }
    async function me(t) {
      const i = t.filter((s) => !A.value[s]);
      if (!(d.value || !o.value || !i.length))
        try {
          const { data: s } = await Z.get(`${o.value}?ids=${encodeURIComponent(i.join(","))}`);
          for (const b of de(s, T.value)) B(J(b, K.value, { selectable: !0, drillable: !1 }));
        } catch (s) {
          r("error", { message: ce(s, "The selected items could not be resolved."), error: s });
        }
    }
    U(() => e.value?.selected, (t) => {
      f.value = Ae(t), me(f.value);
    }, { immediate: !0 }), U(() => a.rows, (t) => {
      for (const i of t) i.value && D(i.value) && !A.value[i.value] && B(i);
    }), U(() => a.error, (t) => {
      t && r("error", { message: ee.value, error: t });
    });
    const pe = p(() => JSON.stringify([o.value, d.value, u.value, C.value, y.value, K.value, T.value]));
    U(pe, () => {
      a.configure(W(), C.value), x.value = "", k.value = -1, S.value && j.value && a.search("");
    });
    let L = null;
    function ye() {
      oe(), k.value = -1, L && clearTimeout(L), a.serverSearch ? L = setTimeout(() => {
        a.search(x.value);
      }, kt) : a.search(x.value);
    }
    function se(t) {
      t.selectable && (B(t), z.value ? (f.value = Oe(f.value, t.value), Ee(() => R.value?.focus())) : (f.value = [t.value], x.value = "", S.value = !1), ae());
    }
    function F(t) {
      k.value = -1, a.drill(t);
    }
    function re(t) {
      k.value = -1, a.up(t);
    }
    function le(t) {
      f.value = f.value.filter((i) => i !== t), ae(), R.value?.focus();
    }
    function ae() {
      r("change", { selected: [...f.value], labels: f.value.map(q) });
    }
    function oe() {
      S.value || (S.value = !0), j.value && !a.loaded && !a.loading && !a.error && a.search(x.value);
    }
    function G() {
      oe(), R.value?.focus();
    }
    function ne(t) {
      const i = E.value;
      let s = k.value;
      for (let b = 0; b < i.length; b++)
        if (s = t === 1 ? Math.min(s + 1, i.length - 1) : Math.max(s - 1, 0), V(i[s])) {
          k.value = s;
          return;
        }
    }
    function be(t) {
      t.selectable ? se(t) : t.drillable && F(t);
    }
    function ge(t) {
      if (t.key === "Escape") {
        S.value = !1;
        return;
      }
      if (t.key === "Backspace" && !x.value && f.value.length) {
        le(f.value[f.value.length - 1]);
        return;
      }
      if (!S.value && (t.key === "ArrowDown" || t.key === "Enter")) {
        G();
        return;
      }
      if (t.key === "ArrowDown")
        t.preventDefault(), ne(1);
      else if (t.key === "ArrowUp")
        t.preventDefault(), ne(-1);
      else if (t.key === "Enter") {
        t.preventDefault();
        const i = E.value[k.value] ?? E.value.find(V);
        V(i) && be(i);
      }
    }
    return we(() => r("load", void 0)), Ce(() => {
      L && clearTimeout(L);
    }), (t, i) => (n(), c(M, null, [
      v("div", {
        ref_key: "ctrl",
        ref: X,
        class: "ms",
        onClick: G
      }, [
        (n(!0), c(M, null, H(f.value, (s) => (n(), c("span", {
          key: s,
          class: "ms-chip"
        }, [
          te(s) ? (n(), Y(g(_), {
            key: 0,
            icon: te(s),
            class: "ms-chip-ico",
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : m("", !0),
          v("span", ze, h(q(s)), 1),
          v("button", {
            type: "button",
            class: "ms-chip-x",
            title: `Remove ${q(s)}`,
            "aria-label": `Remove ${q(s)}`,
            onClick: Se((b) => le(s), ["stop"])
          }, [
            w(g(_), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ], 8, je)
        ]))), 128)),
        xe(v("input", {
          ref_key: "inputEl",
          ref: R,
          "onUpdate:modelValue": i[0] || (i[0] = (s) => x.value = s),
          class: "ms-input",
          type: "text",
          placeholder: f.value.length && z.value ? "" : Q.value,
          "aria-label": Q.value,
          "aria-expanded": S.value,
          spellcheck: "false",
          autocomplete: "off",
          onFocus: G,
          onInput: ye,
          onKeydown: ge
        }, null, 40, Be), [
          [Ie, x.value]
        ])
      ], 512),
      w(Pe, {
        open: S.value,
        "onUpdate:open": i[4] || (i[4] = (s) => S.value = s),
        anchor: X.value,
        "min-width": 260,
        "max-height": 340
      }, {
        default: Ke(() => [
          v("div", {
            class: "ms-pop",
            "aria-busy": a.loading
          }, [
            a.trail.length ? (n(), c("nav", Fe, [
              v("button", {
                type: "button",
                class: "ms-crumb",
                onClick: i[1] || (i[1] = (s) => re(0))
              }, "All"),
              (n(!0), c(M, null, H(a.trail, (s, b) => (n(), c(M, {
                key: s.id
              }, [
                w(g(_), {
                  icon: "tabler:chevron-right",
                  class: "ms-crumb-sep",
                  "aria-hidden": "true"
                }),
                b < a.trail.length - 1 ? (n(), c("button", {
                  key: 0,
                  type: "button",
                  class: "ms-crumb",
                  onClick: (N) => re(b + 1)
                }, h(s.label), 9, Ge)) : (n(), c("span", He, h(s.label), 1))
              ], 64))), 128))
            ])) : m("", !0),
            a.filtersLocally ? (n(), c("p", Ye, [
              I(" This source cannot search, so only the " + h(a.rows.length) + " loaded items are filtered.", 1),
              a.hasMore ? (n(), c(M, { key: 0 }, [
                I(" Load more to search further.")
              ], 64)) : m("", !0)
            ])) : m("", !0),
            a.error ? (n(), c("div", Ze, [
              w(g(_), {
                icon: "tabler:alert-circle",
                class: "ms-alert-ico",
                "aria-hidden": "true"
              }),
              v("span", Je, h(ee.value), 1),
              v("button", {
                type: "button",
                class: "ms-link",
                onClick: i[2] || (i[2] = (s) => a.retry())
              }, "Try again")
            ])) : m("", !0),
            j.value ? a.loading && !a.rows.length ? (n(), c("div", We, [
              w(g(_), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              I(" " + h(a.query && a.serverSearch ? "Searching…" : "Loading…"), 1)
            ])) : a.loaded && !E.value.length && !a.error ? (n(), c("div", Xe, h(ve.value), 1)) : m("", !0) : (n(), c("div", Qe, "This picker has no source to list from.")),
            E.value.length ? (n(), c("div", et, [
              (n(!0), c(M, null, H(E.value, (s, b) => (n(), c("div", {
                key: fe(s),
                class: "ms-item"
              }, [
                s.selectable ? (n(), c("button", {
                  key: 0,
                  type: "button",
                  class: ie(["ms-row", [D(s.value) && "ms-row-on", b === k.value && "ms-row-active"]]),
                  "aria-pressed": D(s.value),
                  onClick: (N) => se(s),
                  onMousemove: (N) => k.value = b
                }, [
                  w(g(_), {
                    icon: s.icon || "tabler:point",
                    class: "ms-row-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  v("span", st, [
                    v("span", rt, [
                      I(h(s.label) + " ", 1),
                      s.meta ? (n(), c("span", lt, h(s.meta), 1)) : m("", !0)
                    ]),
                    s.description ? (n(), c("span", at, h(s.description), 1)) : m("", !0)
                  ]),
                  D(s.value) ? (n(), Y(g(_), {
                    key: 0,
                    icon: "tabler:check",
                    class: "ms-row-check",
                    "aria-hidden": "true"
                  })) : m("", !0)
                ], 42, tt)) : s.drillable ? (n(), c("button", {
                  key: 1,
                  type: "button",
                  class: ie(["ms-row", b === k.value && "ms-row-active"]),
                  "aria-label": `Open ${s.label}`,
                  onClick: (N) => F(s),
                  onMousemove: (N) => k.value = b
                }, [
                  w(g(_), {
                    icon: s.icon || "tabler:folder",
                    class: "ms-row-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  v("span", nt, [
                    v("span", it, [
                      I(h(s.label) + " ", 1),
                      s.meta ? (n(), c("span", ct, h(s.meta), 1)) : m("", !0)
                    ]),
                    s.description ? (n(), c("span", ut, h(s.description), 1)) : m("", !0)
                  ]),
                  w(g(_), {
                    icon: "tabler:chevron-right",
                    class: "ms-row-go",
                    "aria-hidden": "true"
                  })
                ], 42, ot)) : (n(), c("button", dt, [
                  w(g(_), {
                    icon: s.icon || "tabler:point",
                    class: "ms-row-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  v("span", ht, [
                    v("span", vt, h(s.label), 1),
                    v("span", ft, h(O.value), 1)
                  ])
                ])),
                s.selectable && s.drillable ? (n(), c("button", {
                  key: 3,
                  type: "button",
                  class: "ms-row-drill",
                  title: `Open ${s.label}`,
                  "aria-label": `Open ${s.label}`,
                  onClick: (N) => F(s)
                }, [
                  w(g(_), {
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  })
                ], 8, mt)) : m("", !0)
              ]))), 128))
            ])) : m("", !0),
            a.hasMore ? (n(), c("div", pt, [
              v("span", yt, [
                I(h(E.value.length) + " shown", 1),
                z.value ? (n(), c(M, { key: 0 }, [
                  I(" · " + h(f.value.length) + " selected", 1)
                ], 64)) : m("", !0)
              ]),
              v("button", {
                type: "button",
                class: "ms-more",
                disabled: a.loading,
                onClick: i[3] || (i[3] = (s) => a.loadMore())
              }, [
                a.loading ? (n(), Y(g(_), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : m("", !0),
                I(" " + h(a.loading ? "Loading…" : "Load more"), 1)
              ], 8, bt)
            ])) : m("", !0)
          ], 8, Ve)
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
export {
  Et as default
};
//# sourceMappingURL=MultiSelect-ByOzZkIm.js.map

import { defineComponent as _e, computed as p, reactive as ke, ref as E, watch as U, onMounted as we, onBeforeUnmount as Ce, openBlock as o, createElementBlock as i, Fragment as M, createElementVNode as v, renderList as H, createBlock as Y, unref as g, createCommentVNode as m, toDisplayString as h, withModifiers as Se, createVNode as w, withDirectives as xe, vModelText as Ie, withCtx as Ke, createTextVNode as I, normalizeClass as ie, nextTick as $e } from "vue";
import { Icon as _ } from "@iconify/vue";
import { api as Z } from "@wippy-fe/proxy";
import { a as Ee, u as Me } from "./wc-runtime-CNDpK4lj.js";
import { a as Ae } from "./pickerValue-SPnnNBeX.js";
import { e as ce } from "./errMsg-CxKGcp1F.js";
import { _ as Pe } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
const Te = () => Ee(), Le = () => Me();
function ue(a) {
  return a.drillId || a.value;
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
    const u = this.serverSearch && this.query ? this.query : "", d = {};
    u && (d.q = u), e && (d.cursor = e), this.parentId && (d.parentId = this.parentId);
    try {
      const c = await this.fetchPage(d);
      if (r !== this.generation) return;
      const C = new Set(this.rows.map(ue)), y = c.rows.filter((K) => !C.has(ue(K)));
      this.rows = [...this.rows, ...y], this.nextCursor = c.nextCursor || null, this.loaded = !0, this.failedCursor = null, this.loading = !1, typeof c.search == "boolean" && c.search !== this.serverSearch && (this.serverSearch = c.search, c.search && this.query && !u && await this.restart());
    } catch (c) {
      if (r !== this.generation) return;
      this.error = c, this.failedCursor = e, this.loading = !1;
    }
  }
}
function Oe(a, e) {
  return a.includes(e) ? a.filter((r) => r !== e) : [...a, e];
}
const Re = ["items", "results", "rows", "data"];
function P(a) {
  return typeof a == "string" ? a : typeof a == "number" ? String(a) : "";
}
function de(a, e) {
  if (!a || typeof a != "object") return [];
  const r = a;
  if (e && Array.isArray(r[e])) return r[e];
  for (const u of Re)
    if (Array.isArray(r[u])) return r[u];
  return [];
}
function J(a, e, r) {
  const u = P(a[e.idKey]), d = P(a[e.drillKey]), c = P(a[e.labelKey]) || u || d;
  return {
    value: u,
    drillId: d,
    label: c,
    description: P(a[e.descKey]),
    icon: P(a[e.iconKey]),
    meta: e.metaKey ? P(a[e.metaKey]) : "",
    selectable: r.selectable && u !== "",
    drillable: r.drillable && d !== "",
    raw: a
  };
}
function he(a) {
  const e = a.next_cursor;
  return typeof e == "string" && e !== "" ? e : null;
}
function qe(a) {
  return async (e) => {
    const r = new URLSearchParams();
    e.q && r.set("q", e.q), r.set("limit", String(a.pageSize)), e.cursor && r.set("cursor", e.cursor), e.parentId && r.set("parent_id", e.parentId);
    const u = a.source.includes("?") ? "&" : "?", { data: d } = await Z.get(`${a.source}${u}${r.toString()}`), c = d && typeof d == "object" ? d : {};
    return {
      rows: de(c, a.responseKey).map((y) => J(y, a.keys, {
        selectable: y.selectable !== !1,
        drillable: y.drillable === !0
      })),
      nextCursor: he(c),
      search: typeof c.search == "boolean" ? c.search : void 0
    };
  };
}
class De extends Error {
}
function Ue(a) {
  const e = a.discoverPath.replace("{id}", encodeURIComponent(a.connectionId));
  return async (r) => {
    const u = { limit: a.pageSize };
    r.q && (u.q = r.q), r.cursor && (u.cursor = r.cursor), r.parentId && (u.parent_id = r.parentId);
    const { data: d } = await Z.post(e, u), c = d && typeof d == "object" ? d : {}, C = Array.isArray(c.resources) ? c.resources : [], y = Array.isArray(c.items) ? c.items : [];
    if (y.length !== C.length)
      throw new De("The connection answered a discovery page whose items do not match its resources.");
    return { rows: C.map((T, O) => J(T, a.keys, {
      selectable: y[O].selectable === !0,
      drillable: y[O].drillable === !0
    })), nextCursor: he(c) };
  };
}
const ze = { class: "ms-chip-label" }, Be = ["title", "aria-label", "onClick"], Ve = ["placeholder", "aria-label", "aria-expanded"], je = ["aria-busy"], Fe = {
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
  setup(a) {
    const e = Te(), r = Le(), u = p(() => e.value?.source || ""), d = p(() => e.value?.connectionId || ""), c = p(() => e.value?.discoverPath || "/api/v1/connections/{id}/discover_resources"), C = p(() => e.value?.search === "local" ? "local" : "server"), y = p(() => {
      const t = Number(e.value?.pageSize);
      return Number.isInteger(t) && t >= 1 ? Math.min(t, _t) : gt;
    }), K = p(() => ({
      idKey: e.value?.idKey || "id",
      labelKey: e.value?.labelKey || "name",
      descKey: e.value?.descKey || "description",
      iconKey: e.value?.iconKey || "icon",
      metaKey: e.value?.metaKey || "",
      drillKey: e.value?.drillKey || "id"
    })), T = p(() => e.value?.responseKey || (d.value ? "resources" : "")), O = p(() => e.value?.unselectableHint || "This item cannot be selected."), z = p(() => e.value?.multi !== !1), Q = p(() => e.value?.placeholder || "Search…"), B = p(() => !!(d.value || u.value));
    function W() {
      return d.value ? Ue({ connectionId: d.value, discoverPath: c.value, pageSize: y.value, keys: K.value }) : qe({ source: u.value, responseKey: T.value, pageSize: y.value, keys: K.value });
    }
    const l = ke(new Ne(W(), C.value)), f = E([]), A = E({}), S = E(!1), x = E(""), k = E(-1), X = E(null), R = E(null), $ = p(() => l.visible), ee = p(() => l.error ? ce(l.error, "The list could not be loaded.") : ""), ve = p(() => {
      if (l.query) return `No matches for “${l.query}”.`;
      const t = l.trail[l.trail.length - 1];
      return t ? `Nothing in ${t.label}.` : "Nothing to choose from.";
    });
    function V(t) {
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
    function j(t) {
      return !!t && (t.selectable || t.drillable);
    }
    async function me(t) {
      const n = t.filter((s) => !A.value[s]);
      if (!(d.value || !u.value || !n.length))
        try {
          const { data: s } = await Z.get(`${u.value}?ids=${encodeURIComponent(n.join(","))}`);
          for (const b of de(s, T.value)) V(J(b, K.value, { selectable: !0, drillable: !1 }));
        } catch (s) {
          r("error", { message: ce(s, "The selected items could not be resolved."), error: s });
        }
    }
    U(() => e.value?.selected, (t) => {
      f.value = Ae(t), me(f.value);
    }, { immediate: !0 }), U(() => l.rows, (t) => {
      for (const n of t) n.value && D(n.value) && !A.value[n.value] && V(n);
    }), U(() => l.error, (t) => {
      t && r("error", { message: ee.value, error: t });
    });
    const pe = p(() => JSON.stringify([u.value, d.value, c.value, C.value, y.value, K.value, T.value]));
    U(pe, () => {
      l.configure(W(), C.value), x.value = "", k.value = -1, S.value && B.value && l.search("");
    });
    let L = null;
    function ye() {
      oe(), k.value = -1, L && clearTimeout(L), l.serverSearch ? L = setTimeout(() => {
        l.search(x.value);
      }, kt) : l.search(x.value);
    }
    function se(t) {
      t.selectable && (V(t), z.value ? (f.value = Oe(f.value, t.value), $e(() => R.value?.focus())) : (f.value = [t.value], x.value = "", S.value = !1), ae());
    }
    function F(t) {
      k.value = -1, l.drill(t);
    }
    function re(t) {
      k.value = -1, l.up(t);
    }
    function le(t) {
      f.value = f.value.filter((n) => n !== t), ae(), R.value?.focus();
    }
    function ae() {
      r("change", { selected: [...f.value], labels: f.value.map(q) });
    }
    function oe() {
      S.value || (S.value = !0), B.value && !l.loaded && !l.loading && !l.error && l.search(x.value);
    }
    function G() {
      oe(), R.value?.focus();
    }
    function ne(t) {
      const n = $.value;
      let s = k.value;
      for (let b = 0; b < n.length; b++)
        if (s = t === 1 ? Math.min(s + 1, n.length - 1) : Math.max(s - 1, 0), j(n[s])) {
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
        const n = $.value[k.value] ?? $.value.find(j);
        j(n) && be(n);
      }
    }
    return we(() => r("load", void 0)), Ce(() => {
      L && clearTimeout(L);
    }), (t, n) => (o(), i(M, null, [
      v("div", {
        ref_key: "ctrl",
        ref: X,
        class: "ms",
        onClick: G
      }, [
        (o(!0), i(M, null, H(f.value, (s) => (o(), i("span", {
          key: s,
          class: "ms-chip"
        }, [
          te(s) ? (o(), Y(g(_), {
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
          ], 8, Be)
        ]))), 128)),
        xe(v("input", {
          ref_key: "inputEl",
          ref: R,
          "onUpdate:modelValue": n[0] || (n[0] = (s) => x.value = s),
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
        }, null, 40, Ve), [
          [Ie, x.value]
        ])
      ], 512),
      w(Pe, {
        open: S.value,
        "onUpdate:open": n[4] || (n[4] = (s) => S.value = s),
        anchor: X.value,
        "min-width": 260,
        "max-height": 340
      }, {
        default: Ke(() => [
          v("div", {
            class: "ms-pop",
            "aria-busy": l.loading
          }, [
            l.trail.length ? (o(), i("nav", Fe, [
              v("button", {
                type: "button",
                class: "ms-crumb",
                onClick: n[1] || (n[1] = (s) => re(0))
              }, "All"),
              (o(!0), i(M, null, H(l.trail, (s, b) => (o(), i(M, {
                key: s.id
              }, [
                w(g(_), {
                  icon: "tabler:chevron-right",
                  class: "ms-crumb-sep",
                  "aria-hidden": "true"
                }),
                b < l.trail.length - 1 ? (o(), i("button", {
                  key: 0,
                  type: "button",
                  class: "ms-crumb",
                  onClick: (N) => re(b + 1)
                }, h(s.label), 9, Ge)) : (o(), i("span", He, h(s.label), 1))
              ], 64))), 128))
            ])) : m("", !0),
            l.filtersLocally ? (o(), i("p", Ye, [
              I(" This source cannot search, so only the " + h(l.rows.length) + " loaded items are filtered.", 1),
              l.hasMore ? (o(), i(M, { key: 0 }, [
                I(" Load more to search further.")
              ], 64)) : m("", !0)
            ])) : m("", !0),
            l.error ? (o(), i("div", Ze, [
              w(g(_), {
                icon: "tabler:alert-circle",
                class: "ms-alert-ico",
                "aria-hidden": "true"
              }),
              v("span", Je, h(ee.value), 1),
              v("button", {
                type: "button",
                class: "ms-link",
                onClick: n[2] || (n[2] = (s) => l.retry())
              }, "Try again")
            ])) : m("", !0),
            B.value ? l.loading && !l.rows.length ? (o(), i("div", We, [
              w(g(_), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              I(" " + h(l.query && l.serverSearch ? "Searching…" : "Loading…"), 1)
            ])) : l.loaded && !$.value.length && !l.error ? (o(), i("div", Xe, h(ve.value), 1)) : m("", !0) : (o(), i("div", Qe, "This picker has no source to list from.")),
            $.value.length ? (o(), i("div", et, [
              (o(!0), i(M, null, H($.value, (s, b) => (o(), i("div", {
                key: fe(s),
                class: "ms-item"
              }, [
                s.selectable ? (o(), i("button", {
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
                      s.meta ? (o(), i("span", lt, h(s.meta), 1)) : m("", !0)
                    ]),
                    s.description ? (o(), i("span", at, h(s.description), 1)) : m("", !0)
                  ]),
                  D(s.value) ? (o(), Y(g(_), {
                    key: 0,
                    icon: "tabler:check",
                    class: "ms-row-check",
                    "aria-hidden": "true"
                  })) : m("", !0)
                ], 42, tt)) : s.drillable ? (o(), i("button", {
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
                      s.meta ? (o(), i("span", ct, h(s.meta), 1)) : m("", !0)
                    ]),
                    s.description ? (o(), i("span", ut, h(s.description), 1)) : m("", !0)
                  ]),
                  w(g(_), {
                    icon: "tabler:chevron-right",
                    class: "ms-row-go",
                    "aria-hidden": "true"
                  })
                ], 42, ot)) : (o(), i("button", dt, [
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
                s.selectable && s.drillable ? (o(), i("button", {
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
            l.hasMore ? (o(), i("div", pt, [
              v("span", yt, [
                I(h($.value.length) + " shown", 1),
                z.value ? (o(), i(M, { key: 0 }, [
                  I(" · " + h(f.value.length) + " selected", 1)
                ], 64)) : m("", !0)
              ]),
              v("button", {
                type: "button",
                class: "ms-more",
                disabled: l.loading,
                onClick: n[3] || (n[3] = (s) => l.loadMore())
              }, [
                l.loading ? (o(), Y(g(_), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : m("", !0),
                I(" " + h(l.loading ? "Loading…" : "Load more"), 1)
              ], 8, bt)
            ])) : m("", !0)
          ], 8, je)
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
export {
  Et as default
};
//# sourceMappingURL=MultiSelect-CqCpK0tR.js.map

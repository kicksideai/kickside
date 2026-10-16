import { J as St } from "./jszip.min-BtGi7ivk.js";
function Tt(t) {
  typeof console < "u" && console.warn && console.warn(`[pptx-to-html] ${t}`);
}
var T = class I {
  static domParserFactory = null;
  /**
  * Parses a string containing XML into a DOM Document
  * @param xmlString XML string to parse
  * @returns DOM Document
  */
  static parseXml(n) {
    if (I.domParserFactory) return I.domParserFactory().parseFromString(n, "application/xml");
    const s = globalThis?.DOMParser;
    if (typeof s == "function") return new s().parseFromString(n, "application/xml");
    throw Tt("No DOMParser available. Provide one through XmlHelper.setDomParser() or pptxToHtml({ domParserFactory })."), new Error("DOMParser not available in this environment");
  }
  /**
  * Gets a direct child element by local tag name
  */
  static getDirectChildrenByTagName(n, s) {
    return Array.from(n.children).filter((e) => e.localName === s);
  }
  /**
  * Gets attribute value as number, defaulting to 0
  */
  static getAttrAsNumber(n, s) {
    const e = n.getAttribute(s);
    if (e == null || e === "") return 0;
    const o = Number(e);
    return Number.isFinite(o) ? o : 0;
  }
  /** Returns the paint order of an element's top-level ancestor in a shape tree. */
  static getZIndex(n, s) {
    let e = n;
    for (; e?.parentElement && e.parentElement !== s; ) e = e.parentElement;
    return !e || e.parentElement !== s ? 0 : Array.from(s.children).indexOf(e);
  }
  /**
  * Resolves a drawing object's transform into slide coordinates. Child objects
  * inside a `p:grpSp` are expressed in the group's child coordinate system,
  * so using their local `a:xfrm` directly places them incorrectly.
  */
  static getAbsoluteTransform(n, s) {
    const e = (u) => {
      const h = u.getElementsByTagNameNS("*", "xfrm")[0] ?? null, f = h?.getElementsByTagNameNS("*", "off")[0] ?? null, g = h?.getElementsByTagNameNS("*", "ext")[0] ?? null, d = h?.getElementsByTagNameNS("*", "chOff")[0] ?? null, p = h?.getElementsByTagNameNS("*", "chExt")[0] ?? null;
      return {
        xfrm: h,
        x: f ? I.getAttrAsNumber(f, "x") : 0,
        y: f ? I.getAttrAsNumber(f, "y") : 0,
        cx: g ? I.getAttrAsNumber(g, "cx") : 1e6,
        cy: g ? I.getAttrAsNumber(g, "cy") : 5e5,
        chX: d ? I.getAttrAsNumber(d, "x") : 0,
        chY: d ? I.getAttrAsNumber(d, "y") : 0,
        chCx: p ? I.getAttrAsNumber(p, "cx") : 0,
        chCy: p ? I.getAttrAsNumber(p, "cy") : 0,
        rotationDeg: h?.getAttribute("rot") ? Number(h.getAttribute("rot")) / 6e4 : 0
      };
    }, o = e(n);
    let { x: i, y: r, cx: a, cy: m } = o, c = o.rotationDeg, l = n.parentElement;
    for (; l && l !== s; ) {
      if (l.localName === "grpSp") {
        const u = e(l), h = u.chCx > 0 ? u.cx / u.chCx : 1, f = u.chCy > 0 ? u.cy / u.chCy : 1;
        i = u.x + (i - u.chX) * h, r = u.y + (r - u.chY) * f, a *= h, m *= f, c += u.rotationDeg;
      }
      l = l.parentElement;
    }
    return {
      x: i,
      y: r,
      cx: a,
      cy: m,
      rotationDeg: c || void 0
    };
  }
  static getColorFromElement(n, s) {
    if (!n) return;
    const e = n.getElementsByTagNameNS("*", "srgbClr")[0];
    if (e) {
      const r = e.getAttribute("val");
      return r ? `#${r}` : void 0;
    }
    const o = n.getElementsByTagNameNS("*", "schemeClr")[0];
    if (o) {
      const r = o.getAttribute("val");
      return r && s ? s[{
        bg1: "lt1",
        bg2: "lt2",
        tx1: "dk1",
        tx2: "dk2"
      }[r] || r] : void 0;
    }
    const i = n.getElementsByTagNameNS("*", "sysClr")[0];
    if (i) {
      const r = i.getAttribute("lastClr");
      return r ? `#${r}` : void 0;
    }
  }
  static extractThemeColors(n) {
    if (!n) return {};
    const s = "http://schemas.openxmlformats.org/drawingml/2006/main", e = {}, o = n.getElementsByTagNameNS(s, "clrScheme")[0];
    if (!o) return {};
    for (const i of Array.from(o.children)) {
      const r = i.localName, a = i.getElementsByTagNameNS(s, "srgbClr")[0], m = i.getElementsByTagNameNS(s, "sysClr")[0], c = a?.getAttribute("val") ?? m?.getAttribute("lastClr");
      c && (e[r] = `#${c}`);
    }
    return e;
  }
  /**
  * Extracts table styles (fills and text colors per region) from theme XML.
  * Returns a map keyed by styleId (GUID or name), with region color maps.
  */
  static extractThemeTableStyles(n) {
    const s = {};
    if (!n) return s;
    const e = I.extractThemeColors(n), o = n.getElementsByTagNameNS("*", "tblStyleLst")[0] || null;
    if (!o) return s;
    const i = Array.from(o.getElementsByTagNameNS("*", "tblStyle"));
    for (const r of i) {
      const a = r.getAttribute("styleId") || r.getAttribute("name") || "";
      if (!a) continue;
      const m = {}, c = {}, l = Array.from(r.getElementsByTagNameNS("*", "tblStylePr"));
      for (const u of l) {
        const h = u.getAttribute("type") || u.getAttribute("val") || "";
        if (!h) continue;
        const f = u.getElementsByTagNameNS("*", "tcStyle")[0] || null, g = [
          (f?.getElementsByTagNameNS("*", "tcPr")[0] || null)?.getElementsByTagNameNS("*", "solidFill")[0] || null,
          f?.getElementsByTagNameNS("*", "solidFill")[0] || null,
          u.getElementsByTagNameNS("*", "solidFill")[0] || null
        ];
        let d;
        for (const $ of g) $ && !d && (d = I.getColorFromElement($, e));
        if (!d) {
          const $ = f?.getElementsByTagNameNS("*", "fillRef")[0] || u.getElementsByTagNameNS("*", "fillRef")[0] || null;
          d = I.getColorFromElement($, e);
        }
        d && (m[h] = d);
        const p = u.getElementsByTagNameNS("*", "tcTxStyle")[0] || null, y = p?.getElementsByTagNameNS("*", "solidFill")[0] || null;
        let b = I.getColorFromElement(y, e);
        if (!b) {
          const $ = p?.getElementsByTagNameNS("*", "fontRef")[0] || null;
          b = I.getColorFromElement($, e);
        }
        if (!b) {
          const $ = p?.getElementsByTagNameNS("*", "schemeClr")[0] || null;
          b = I.getColorFromElement($, e);
        }
        b && (c[h] = b);
      }
      s[a] = {
        fills: m,
        fontColors: c
      };
    }
    return s;
  }
  /** Allow a host application to provide a DOM parser instance factory. */
  static setDomParser(n) {
    I.domParserFactory = n;
  }
  /** Relationship lookup: by Type suffix (avoids querySelector CSS) */
  static findRelationshipByTypeSuffix(n, s) {
    const e = n.getElementsByTagName("Relationship");
    for (const o of Array.from(e)) if ((o.getAttribute("Type") || "").endsWith(s)) return o;
    return null;
  }
  /** Relationship lookup: by Id */
  static findRelationshipById(n, s) {
    const e = n.getElementsByTagName("Relationship");
    for (const o of Array.from(e)) if (o.getAttribute("Id") === s) return o;
    return null;
  }
}, lt = class {
  /**
  * Extracts all text elements from the slide's <spTree> node.
  * @param spTree The <spTree> element of the slide.
  * @param themeColors Theme color mapping (e.g. tx1, bg2).
  * @returns List of TextElement extracted.
  */
  static extract(t, n, s = {}) {
    if (!t) return [];
    const e = [], o = t.getElementsByTagNameNS("*", "sp");
    for (const i of Array.from(o)) {
      const r = (i.getElementsByTagNameNS("*", "nvPr")[0] ?? null)?.getElementsByTagNameNS("*", "ph")[0] ?? null, a = !!r;
      if (s.context && s.context !== "slide" && a) continue;
      const m = i.getElementsByTagNameNS("*", "txBody")[0];
      if (!m) continue;
      const c = m.getElementsByTagNameNS("*", "p"), l = m.getElementsByTagNameNS("*", "bodyPr")[0] ?? null, u = l?.getAttribute("anchor") || void 0, h = r?.getAttribute("idx") || void 0, f = r?.getAttribute("type") || (h ? s.placeholderTypes?.[h] : void 0) || void 0, g = f === "title" || f === "ctrTitle", d = u === "ctr" ? "middle" : u === "b" || g ? "bottom" : "top", p = l?.getAttribute("lIns"), y = l?.getAttribute("tIns"), b = l?.getAttribute("rIns"), $ = l?.getAttribute("bIns"), w = {
        left: p ? Number(p) / 9525 : 0,
        top: y ? Number(y) / 9525 : 0,
        right: b ? Number(b) / 9525 : 0,
        bottom: $ ? Number($) / 9525 : 0
      }, N = [];
      let v = "Arial", A = g ? 44 : f === "subTitle" ? 24 : 18, x = g ? "bold" : "normal";
      const E = g || f === "subTitle";
      let S, k;
      const C = [], M = {}, D = m.querySelector("*|lstStyle");
      if (D) for (const B of Array.from(D.children)) {
        const F = B.localName.match(/^lvl(\d+)pPr$/);
        if (!F) continue;
        const P = parseInt(F[1], 10) - 1;
        let W = "p", X;
        B.querySelector("*|buNone") ? W = "p" : B.querySelector("*|buAutoNum") ? (W = "ol", X = dt(B.querySelector("*|buAutoNum")?.getAttribute("type") || "arabicPeriod")) : B.querySelector("*|buChar") && (W = "ul", X = "disc"), M[P] = {
          kind: W,
          listStyle: X
        };
      }
      for (const B of Array.from(c)) {
        const F = B.getElementsByTagNameNS("*", "pPr")[0] ?? null, P = F?.getAttribute("algn") || void 0;
        P && !k && (k = P === "ctr" ? "center" : P === "r" ? "right" : P.startsWith("just") ? "justify" : "left");
        const W = B.getElementsByTagNameNS("*", "r");
        let X = vt(B);
        X && X.split(/\n+/).forEach((et) => {
          et && N.push(et);
        });
        for (const et of Array.from(W)) {
          const U = et.getElementsByTagNameNS("*", "rPr")[0];
          if (U) {
            v = U.getElementsByTagNameNS("*", "latin")[0]?.getAttribute("typeface") ?? v;
            const it = U.getAttribute("sz");
            if (it) {
              const ft = parseInt(it, 10);
              Number.isFinite(ft) && (A = ft / 100);
            }
            const ot = U.getAttribute("b");
            ot === "1" ? x = "bold" : ot === "0" && (x = "normal");
            const $t = U.querySelector("*|solidFill"), gt = T.getColorFromElement($t || null, n);
            gt && (S = gt);
          }
        }
        if (!S && F) {
          const et = (F.getElementsByTagNameNS("*", "endParaRPr")[0] ?? null)?.querySelector("*|solidFill") || null, U = T.getColorFromElement(et, n);
          if (U && (S = U), !S) {
            const it = (F.getElementsByTagNameNS("*", "defRPr")[0] ?? null)?.querySelector("*|solidFill") || null, ot = T.getColorFromElement(it, n);
            ot && (S = ot);
          }
        }
        const st = F?.getAttribute("lvl"), Y = st ? parseInt(st, 10) : 0;
        let Z = "p", J;
        F ? F.querySelector("*|buNone") ? Z = "p" : F.querySelector("*|buAutoNum") ? (Z = "ol", J = dt(F.querySelector("*|buAutoNum")?.getAttribute("type") || "arabicPeriod")) : F.querySelector("*|buChar") ? (Z = "ul", J = "disc") : M[Y] ? (Z = M[Y].kind, J = M[Y].listStyle) : Y > 0 && (Z = "ul", J = "disc") : M[Y] ? (Z = M[Y].kind, J = M[Y].listStyle) : Y > 0 && (Z = "ul", J = "disc"), C.push({
          kind: Z,
          text: X,
          lvl: isNaN(Y) ? 0 : Y,
          listStyle: J
        });
      }
      if (!S) {
        const B = m.querySelector("*|lstStyle *|defRPr")?.querySelector("*|solidFill"), F = T.getColorFromElement(B || null, n);
        F && (S = F);
        const P = m.querySelector("*|defRPr")?.querySelector("*|solidFill"), W = T.getColorFromElement(P || null, n);
        if (W && (S = W), !S) {
          const X = i.querySelector("p\\:spPr, spPr")?.querySelector("*|solidFill"), st = T.getColorFromElement(X || null, n);
          st && (S = st);
        }
      }
      const L = N.join(" ").trim();
      if (s.context && s.context !== "slide") {
        const B = L.toLowerCase();
        if (B.includes("click to add") || B.includes("click to edit") || B.includes("haga clic para agregar") || B.includes("haga clic para editar") || B.includes("hacer clic para agregar") || B.includes("hacer clic para editar")) continue;
      }
      if (L === "") continue;
      const R = i.getElementsByTagNameNS("*", "xfrm")[0], z = R?.getElementsByTagNameNS("*", "off")[0] ?? null, j = R?.getElementsByTagNameNS("*", "ext")[0] ?? null;
      let Q, K, _, tt, H;
      if (z && j) ({ x: Q, y: K, cx: _, cy: tt, rotationDeg: H } = T.getAbsoluteTransform(i, t));
      else if (s.placeholderGeom) {
        const B = (h ? s.placeholderGeom[h] : void 0) ?? (f ? s.placeholderGeom["type:" + f] : void 0);
        Q = B?.x ?? 0, K = B?.y ?? 0, _ = B?.cx ?? 1e6, tt = B?.cy ?? 5e5;
      } else
        Q = 0, K = 0, _ = 1e6, tt = 5e5;
      if (f === "body" && C.length > 1)
        for (const B of C) B.kind === "p" && (B.kind = "ul", B.listStyle = "disc");
      let q;
      if (C.length > 1 || C.some((B) => B.kind !== "p")) {
        const B = [];
        let F = null;
        for (const P of C) {
          if (P.kind === "p") {
            F && (B.push(F.kind === "ul" ? "</ul>" : "</ol>"), F = null), P.text.trim() && B.push(`<div style="margin-left:${P.lvl * 24}px">${ht(P.text).replace(/\n/g, "<br>")}</div>`);
            continue;
          }
          if (!F || F.kind !== P.kind) {
            F && B.push(F.kind === "ul" ? "</ul>" : "</ol>");
            const W = "list-style-position: inside; padding-left: 0; margin: 0;", X = P.kind === "ol" ? ` style="${W} list-style-type: ${P.listStyle || "decimal"};"` : ` style="${W}"`;
            B.push(P.kind === "ul" ? `<ul${X}>` : `<ol${X}>`), F = {
              kind: P.kind,
              listStyle: P.listStyle
            };
          }
          B.push(`<li style="margin-left:${P.lvl * 24}px">${ht(P.text).replace(/\n/g, "<br>")}</li>`);
        }
        F && B.push(F.kind === "ul" ? "</ul>" : "</ol>"), q = B.join("");
      }
      const G = {
        type: "text",
        zIndex: T.getZIndex(i, t),
        rotationDeg: H,
        content: L,
        position: {
          x: Q,
          y: K
        },
        size: {
          width: _,
          height: tt
        },
        font: {
          name: v,
          size: A,
          color: S ?? "#000000",
          weight: x
        },
        align: {
          horizontal: k ?? (E ? "center" : "left"),
          vertical: d
        },
        padding: w,
        html: q
      };
      e.push(G);
    }
    return e;
  }
};
function vt(t) {
  let n = "";
  for (const s of Array.from(t.childNodes)) {
    if (s.nodeType !== 1) continue;
    const e = s.localName;
    if (e === "r") {
      const o = s.getElementsByTagNameNS("*", "t")[0]?.textContent ?? "";
      n += o;
    } else if (e === "br") n += `
`;
    else if (e === "fld") {
      const o = s.getElementsByTagNameNS("*", "r");
      for (const i of Array.from(o)) {
        const r = i.getElementsByTagNameNS("*", "t")[0]?.textContent ?? "";
        n += r;
      }
    } else e === "tab" && (n += "	");
  }
  return n;
}
function dt(t) {
  const n = t.toLowerCase();
  return n.includes("alphauc") ? "upper-alpha" : n.includes("alphalc") ? "lower-alpha" : n.includes("romanu") ? "upper-roman" : n.includes("romanl") ? "lower-roman" : "decimal";
}
function ht(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function xt(t) {
  return String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function V(t, n = "transparent") {
  const s = String(t ?? "").trim();
  return /^#[0-9a-f]{3,8}$/i.test(s) || /^(transparent|currentcolor)$/i.test(s) ? s : n;
}
function bt(t) {
  const n = String(t ?? "").trim();
  return /^[\p{L}\p{N} ,._-]{1,100}$/u.test(n) ? n : "Arial";
}
function Nt(t) {
  switch (t.split(".").pop()?.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "webp":
      return "image/webp";
    case "bmp":
      return "image/bmp";
    case "tif":
    case "tiff":
      return "image/tiff";
    default:
      return "image/png";
  }
}
var ct = class {
  /**
  * Extracts image elements from the <spTree> element using rels from slide relationships.
  * @param spTree The <spTree> element of the slide.
  * @param rels XML Document for slide relationships (ppt/slides/_rels/slideX.xml.rels).
  * @param zip The JSZip archive of the entire .pptx file.
  * @returns List of ImageElement extracted.
  */
  static async extract(t, n, s, e = "ppt/slides") {
    if (!t) return [];
    const o = [], i = t.getElementsByTagNameNS("*", "pic");
    for (const r of Array.from(i)) {
      const a = r.getElementsByTagNameNS("*", "blip")[0]?.getAttribute("r:embed") ?? "";
      if (!a) continue;
      const m = (n && n.getElementsByTagName ? (function() {
        const N = n.getElementsByTagName("Relationship");
        for (const v of Array.from(N)) if (v.getAttribute("Id") === a) return v;
        return null;
      })() : null)?.getAttribute("Target");
      if (!m) continue;
      const c = this.normalizePath(m, e), l = s.file(c);
      if (!l) continue;
      const u = await l.async("base64"), h = `data:${Nt(c)};base64,${u}`, { x: f, y: g, cx: d, cy: p, rotationDeg: y } = T.getAbsoluteTransform(r, t), b = r.getElementsByTagNameNS("*", "srcRect")[0] ?? null, $ = b ? {
        left: Math.max(0, Number(b.getAttribute("l") || 0)),
        top: Math.max(0, Number(b.getAttribute("t") || 0)),
        right: Math.max(0, Number(b.getAttribute("r") || 0)),
        bottom: Math.max(0, Number(b.getAttribute("b") || 0))
      } : void 0, w = {
        type: "image",
        zIndex: T.getZIndex(r, t),
        relId: a,
        src: h,
        position: {
          x: f,
          y: g
        },
        size: {
          width: d,
          height: p
        },
        crop: $,
        rotationDeg: y
      };
      o.push(w);
    }
    return o;
  }
  /**
  * Normalizes a relative path from a slide rels file.
  * @param target Path from the relationship XML (e.g. "../media/image1.png")
  * @param basePath Base folder (e.g. "ppt/slides")
  * @returns Normalized path inside the zip (e.g. "ppt/media/image1.png")
  */
  static normalizePath(t, n) {
    if (t.startsWith("/")) return t.slice(1);
    const s = (n + "/" + t).split("/"), e = [];
    for (const o of s) o === ".." ? e.pop() : o !== "." && o !== "" && e.push(o);
    return e.join("/");
  }
}, mt = class {
  /**
  * Extracts shape and connector elements from the <spTree> element of the slide.
  * @param spTree The <spTree> element.
  * @param themeColors Theme color mapping.
  * @returns List of ShapeElement extracted.
  */
  static extract(t, n) {
    if (!t) return [];
    const s = [], e = [...Array.from(t.getElementsByTagNameNS("*", "sp")), ...Array.from(t.getElementsByTagNameNS("*", "cxnSp"))];
    for (const o of e) {
      const { x: i, y: r, cx: a, cy: m, rotationDeg: c } = T.getAbsoluteTransform(o, t), l = o.getElementsByTagNameNS("*", "prstGeom")[0]?.getAttribute("prst") ?? "rect", u = o.getElementsByTagNameNS("*", "spPr")[0];
      let h = "transparent", f = "transparent", g, d, p;
      if (u) {
        const b = u.getElementsByTagNameNS("*", "solidFill")[0] ?? null;
        h = T.getColorFromElement(b, n) ?? "transparent";
        const $ = u.getElementsByTagNameNS("*", "ln")[0], w = $?.getElementsByTagNameNS("*", "solidFill")[0] ?? null;
        f = T.getColorFromElement(w, n) ?? "transparent";
        const N = $?.getAttribute("w");
        if (N) {
          const x = Number(N);
          isNaN(x) || (g = x / 9525);
        }
        const v = $?.getElementsByTagNameNS("*", "headEnd")[0] ?? null, A = $?.getElementsByTagNameNS("*", "tailEnd")[0] ?? null;
        d = v ? {
          type: v.getAttribute("type") || void 0,
          w: v.getAttribute("w") || void 0,
          len: v.getAttribute("len") || void 0
        } : void 0, p = A ? {
          type: A.getAttribute("type") || void 0,
          w: A.getAttribute("w") || void 0,
          len: A.getAttribute("len") || void 0
        } : void 0;
      }
      if (h === "transparent") {
        const b = o.getElementsByTagNameNS("*", "style")[0]?.getElementsByTagNameNS("*", "fillRef")[0]?.getElementsByTagNameNS("*", "schemeClr")[0]?.getAttribute("val");
        b && n[b] && (h = n[b]);
      }
      const y = {
        type: "shape",
        zIndex: T.getZIndex(o, t),
        shapeType: l,
        position: {
          x: i,
          y: r
        },
        size: {
          width: a,
          height: m
        },
        fillColor: h,
        borderColor: f,
        strokeWidth: g,
        rotationDeg: c,
        headEnd: d,
        tailEnd: p
      };
      s.push(y);
    }
    return s;
  }
}, Et = class {
  static extract(t, n, s) {
    if (!t) return [];
    const e = [], o = t.getElementsByTagNameNS("*", "graphicFrame");
    for (const i of Array.from(o)) {
      const r = this.findTbl(i);
      if (!r) continue;
      const { x: a, y: m, cx: c, cy: l, rotationDeg: u } = T.getAbsoluteTransform(i, t), h = [], f = r.getElementsByTagNameNS("*", "tblGrid")[0] ?? null;
      if (f) for (const A of Array.from(f.getElementsByTagNameNS("*", "gridCol"))) {
        const x = Number(A.getAttribute("w") || 0);
        h.push(x);
      }
      const g = r.getElementsByTagNameNS("*", "tblPr")[0] ?? null, d = this.extractTableStyleFlags(g), p = this.extractTableBorders(g, n), y = this.extractTableStyleId(g), b = this.extractTableFill(g, n), $ = y && s ? s[y] : void 0, w = this.buildFallbackTableStyle(n, d), N = w || $ ? {
        fills: {
          ...w?.fills || {},
          ...$?.fills || {}
        },
        fontColors: {
          ...w?.fontColors || {},
          ...$?.fontColors || {}
        }
      } : void 0, v = [];
      for (const A of Array.from(r.getElementsByTagNameNS("*", "tr"))) {
        const x = [];
        for (const E of Array.from(A.getElementsByTagNameNS("*", "tc"))) {
          const S = E.getElementsByTagNameNS("*", "tcPr")[0] ?? null;
          if (S?.getAttribute("hMerge") === "1" || S?.getAttribute("hMerge") === "true" || S?.getAttribute("vMerge") === "1" || S?.getAttribute("vMerge") === "true" || S?.getElementsByTagNameNS("*", "hMerge")[0] || S?.getElementsByTagNameNS("*", "vMerge")[0]) continue;
          const k = E.getElementsByTagNameNS("*", "txBody")[0] ?? null, { text: C, font: M, align: D, padding: L } = this.extractCellText(k, n, E), R = {
            text: C,
            font: M,
            align: D,
            padding: L,
            fillColor: this.extractFillColor(S, n),
            borders: this.extractCellBorders(S, n)
          }, z = S?.getElementsByTagNameNS("*", "gridSpan")[0] ?? null, j = S?.getElementsByTagNameNS("*", "rowSpan")[0] ?? null;
          z && (R.colSpan = Number(z.getAttribute("val") || 1)), j && (R.rowSpan = Number(j.getAttribute("val") || 1)), x.push(R);
        }
        v.push({ cells: x });
      }
      e.push({
        type: "table",
        zIndex: T.getZIndex(i, t),
        rotationDeg: u,
        position: {
          x: a,
          y: m
        },
        size: {
          width: c,
          height: l
        },
        columns: h,
        rows: v,
        tableStyle: d,
        tableBorders: p,
        tableStyleId: y,
        tableFillColor: b,
        style: N ? {
          fills: N.fills,
          fontColors: N.fontColors
        } : void 0
      });
    }
    return e;
  }
  static buildFallbackTableStyle(t, n) {
    const s = t.accent1 || t.accent2 || t.dk1;
    if (!s) return;
    const e = t.lt1 || "#FFFFFF", o = {}, i = {};
    n?.firstRow && (o.firstRow = s, i.firstRow = e), n?.firstCol && (o.firstCol = this.lightenHex(s, 0.85), i.firstCol = void 0);
    const r = this.lightenHex(s, 0.92);
    return n?.bandRow && (o.band2H = r), n?.bandCol && (o.band2V = r), {
      fills: o,
      fontColors: i
    };
  }
  static lightenHex(t, n) {
    const s = (t || "").replace("#", "");
    if (s.length !== 6 || /[^0-9a-fA-F]/.test(s)) return t || "#FFFFFF";
    const e = parseInt(s.substring(0, 2), 16), o = parseInt(s.substring(2, 4), 16), i = parseInt(s.substring(4, 6), 16), r = Math.round(e + (255 - e) * n), a = Math.round(o + (255 - o) * n), m = Math.round(i + (255 - i) * n), c = (l) => l.toString(16).padStart(2, "0");
    return `#${c(r)}${c(a)}${c(m)}`;
  }
  static findTbl(t) {
    const n = t.getElementsByTagNameNS("*", "graphicData")[0] ?? null;
    return n ? n.getElementsByTagNameNS("*", "tbl")[0] ?? null : null;
  }
  static extractCellText(t, n, s) {
    if (!t) return {
      text: "",
      font: {},
      align: {},
      padding: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      }
    };
    const e = t.getElementsByTagNameNS("*", "bodyPr")[0] ?? null;
    let o = "top";
    const i = s?.getElementsByTagNameNS("*", "tcPr")[0] ?? null, r = i?.getAttribute("anchor") || i?.getAttribute("vAlign") || void 0, a = e?.getAttribute("anchor") || void 0, m = r || a;
    m === "ctr" ? o = "middle" : m === "b" ? o = "bottom" : o = "top";
    const c = e?.getAttribute("lIns"), l = e?.getAttribute("tIns"), u = e?.getAttribute("rIns"), h = e?.getAttribute("bIns"), f = {
      left: c ? Number(c) / 9525 : 6,
      top: l ? Number(l) / 9525 : 2,
      right: u ? Number(u) / 9525 : 6,
      bottom: h ? Number(h) / 9525 : 2
    };
    let g = "left", d = "Arial", p = 14, y, b = [];
    const $ = t.getElementsByTagNameNS("*", "p");
    for (const w of Array.from($)) {
      const N = (w.getElementsByTagNameNS("*", "pPr")[0] ?? null)?.getAttribute("algn") || void 0;
      N && (g = N === "ctr" ? "center" : N === "r" ? "right" : N.startsWith("just") ? "justify" : "left");
      for (const v of Array.from(w.childNodes)) if (v.nodeType === 1) {
        const A = v.localName;
        if (A === "r") {
          const x = v.getElementsByTagNameNS("*", "rPr")[0] ?? null;
          if (x) {
            d = (x.getElementsByTagNameNS("*", "latin")[0] ?? null)?.getAttribute("typeface") ?? d;
            const S = x.getAttribute("sz");
            S && (p = parseInt(S, 10) / 100);
            const k = x.querySelector("*|solidFill"), C = T.getColorFromElement(k || null, n);
            C && (y = C);
          }
          const E = v.getElementsByTagNameNS("*", "t")[0]?.textContent ?? "";
          b.push(E);
        } else if (A === "br") b.push(`
`);
        else if (A === "fld") {
          const x = v.getElementsByTagNameNS("*", "r");
          for (const E of Array.from(x)) {
            const S = E.getElementsByTagNameNS("*", "t")[0]?.textContent ?? "";
            b.push(S);
          }
        }
      }
    }
    return {
      text: b.join("").trim(),
      font: {
        name: d,
        size: p,
        color: y
      },
      align: {
        horizontal: g,
        vertical: o
      },
      padding: f
    };
  }
  static extractFillColor(t, n) {
    if (!t || t.getElementsByTagNameNS("*", "noFill")[0]) return;
    const s = Array.from(t.children).find((o) => o.localName === "solidFill");
    if (s) return T.getColorFromElement(s, n);
    const e = Array.from(t.getElementsByTagNameNS("*", "solidFill"));
    for (const o of e) {
      let i = o.parentElement, r = !1;
      for (; i && i !== t; ) {
        const a = i.localName;
        if (a === "ln" || a === "lnL" || a === "lnR" || a === "lnT" || a === "lnB" || a === "tcBorders") {
          r = !0;
          break;
        }
        i = i.parentElement;
      }
      if (!r) {
        const a = T.getColorFromElement(o, n);
        if (a) return a;
      }
    }
  }
  static extractCellBorders(t, n) {
    const s = {};
    if (!t) return s;
    const e = {
      lnL: "left",
      lnR: "right",
      lnT: "top",
      lnB: "bottom"
    };
    for (const o of Object.keys(e)) {
      const i = t.getElementsByTagNameNS("*", o)[0] ?? null;
      if (!i) continue;
      const r = i.getAttribute("w"), a = r ? Number(r) / 9525 : void 0, m = i.getElementsByTagNameNS("*", "solidFill")[0] ?? null, c = T.getColorFromElement(m, n), l = (i.getElementsByTagNameNS("*", "prstDash")[0] ?? null)?.getAttribute("val") || "", u = this.mapPrstDashToCss(l);
      s[e[o]] = {
        color: c,
        width: a,
        style: u
      };
    }
    return s;
  }
  static extractTableStyleFlags(t) {
    if (!t) return {};
    const n = {};
    for (const s of [
      "firstRow",
      "firstCol",
      "lastRow",
      "lastCol",
      "bandRow",
      "bandCol"
    ]) (t.getAttribute(s) === "1" || t.getAttribute(s) === "true") && (n[s] = !0);
    return n;
  }
  static extractTableStyleId(t) {
    if (!t) return;
    const n = t.getElementsByTagNameNS("*", "tblStyleId")[0] || t.getElementsByTagNameNS("*", "tblStyle")[0] || null, s = n?.getAttribute("val") || void 0, e = n?.textContent?.trim() || void 0, o = t.getAttribute("tblStyle") || void 0;
    return s || e || o || void 0;
  }
  static extractTableBorders(t, n) {
    if (!t) return;
    const s = {}, e = t.getElementsByTagNameNS("*", "tblBorders")[0] ?? null;
    if (!e) return;
    const o = {
      top: "top",
      right: "right",
      bottom: "bottom",
      left: "left",
      insideH: "insideH",
      insideV: "insideV"
    };
    for (const i of Object.keys(o)) {
      const r = e.getElementsByTagNameNS("*", i)[0] ?? null;
      if (!r) continue;
      const a = r.getElementsByTagNameNS("*", "ln")[0] ?? r, m = a.getAttribute("w"), c = m ? Number(m) / 9525 : void 0, l = a.getElementsByTagNameNS("*", "solidFill")[0] ?? null, u = T.getColorFromElement(l, n), h = (a.getElementsByTagNameNS("*", "prstDash")[0] ?? null)?.getAttribute("val") || "", f = this.mapPrstDashToCss(h);
      s[o[i]] = {
        color: u,
        width: c,
        style: f
      };
    }
    return s;
  }
  static extractTableFill(t, n) {
    if (!t) return;
    const s = Array.from(t.children).find((o) => o.localName === "solidFill");
    if (s) return T.getColorFromElement(s, n);
    const e = Array.from(t.getElementsByTagNameNS("*", "solidFill"));
    for (const o of e) {
      let i = o.parentElement, r = !1;
      for (; i && i !== t; ) {
        if (i.localName === "tblBorders") {
          r = !0;
          break;
        }
        i = i.parentElement;
      }
      if (!r) {
        const a = T.getColorFromElement(o, n);
        if (a) return a;
      }
    }
  }
  static mapPrstDashToCss(t) {
    const n = (t || "").toLowerCase();
    if (n) {
      if (n === "solid") return "solid";
      if (n.includes("dot")) return "dotted";
      if (n.includes("dash")) return "dashed";
    }
  }
}, wt = class {
  static async extract(t, n, s, e) {
    if (!t) return [];
    const o = [], i = t.getElementsByTagNameNS("*", "graphicFrame");
    for (const r of Array.from(i)) {
      const a = r.getElementsByTagNameNS("*", "graphicData")[0] ?? null;
      if (!a) continue;
      const m = a.getElementsByTagNameNS("*", "chart")[0] ?? null;
      if (!m) continue;
      const c = m.getAttribute("r:id") || m.getAttribute("r:embed") || void 0;
      if (!c) continue;
      const l = T.findRelationshipById(n, c)?.getAttribute("Target") || void 0;
      if (!l) continue;
      const u = this.resolvePath(l, "ppt/slides"), h = s.file(u);
      if (!h) continue;
      const f = await h.async("string"), g = T.parseXml(f), d = this.parseChart(g, e);
      if (!d) continue;
      const { x: p, y, cx: b, cy: $, rotationDeg: w } = T.getAbsoluteTransform(r, t);
      o.push({
        type: "chart",
        zIndex: T.getZIndex(r, t),
        rotationDeg: w,
        chartType: d.type,
        position: {
          x: p,
          y
        },
        size: {
          width: b,
          height: $
        },
        categories: d.categories,
        series: d.series,
        palette: d.palette,
        title: d.title,
        showLegend: d.showLegend,
        showDataLabels: d.showDataLabels,
        stackedMode: d.stackedMode,
        valueFormat: d.valueFormat
      });
    }
    return o;
  }
  static resolvePath(t, n) {
    if (t.startsWith("/")) return t.slice(1);
    const s = (n + "/" + t).split("/"), e = [];
    for (const o of s) o === ".." ? e.pop() : o !== "." && o !== "" && e.push(o);
    return e.join("/");
  }
  static parseChart(t, n) {
    const s = t.getElementsByTagNameNS("*", "plotArea")[0] || null;
    if (!s) return null;
    const e = this.extractTitle(t), o = !!t.getElementsByTagNameNS("*", "legend")[0], i = !!s.getElementsByTagNameNS("*", "dLbls")[0], r = s.getElementsByTagNameNS("*", "barChart")[0] || null, a = s.getElementsByTagNameNS("*", "lineChart")[0] || null, m = s.getElementsByTagNameNS("*", "areaChart")[0] || null, c = s.getElementsByTagNameNS("*", "pieChart")[0] || null, l = s.getElementsByTagNameNS("*", "doughnutChart")[0] || null, u = s.getElementsByTagNameNS("*", "scatterChart")[0] || null, h = s.getElementsByTagNameNS("*", "dLbls")[0]?.getElementsByTagNameNS("*", "numFmt")[0]?.getAttribute("formatCode") || void 0, f = [
      n.accent1,
      n.accent2,
      n.accent3,
      n.accent4,
      n.accent5,
      n.accent6
    ].filter(Boolean);
    if (r) {
      const g = this.extractCategories(r) || [], d = this.extractSeries(r, n) || [], p = (r.getElementsByTagNameNS("*", "barDir")[0]?.getAttribute("val") || "col") === "bar" ? "bar" : "column", y = r.getElementsByTagNameNS("*", "grouping")[0]?.getAttribute("val") || "clustered";
      return {
        type: p,
        categories: g,
        series: d,
        palette: f,
        title: e,
        showLegend: o,
        showDataLabels: i,
        stackedMode: y === "stacked" ? "stacked" : y === "percentStacked" ? "percent" : "none",
        valueFormat: h
      };
    }
    if (a) {
      const g = this.extractCategories(a) || [], d = this.extractSeries(a, n) || [], p = a.getElementsByTagNameNS("*", "grouping")[0]?.getAttribute("val") || "standard";
      return {
        type: "line",
        categories: g,
        series: d,
        palette: f,
        title: e,
        showLegend: o,
        showDataLabels: i,
        stackedMode: p === "stacked" ? "stacked" : p === "percentStacked" ? "percent" : "none",
        valueFormat: h
      };
    }
    if (m) {
      const g = this.extractCategories(m) || [], d = this.extractSeries(m, n) || [], p = m.getElementsByTagNameNS("*", "grouping")[0]?.getAttribute("val") || "standard";
      return {
        type: "area",
        categories: g,
        series: d,
        palette: f,
        title: e,
        showLegend: o,
        showDataLabels: i,
        stackedMode: p === "stacked" ? "stacked" : p === "percentStacked" ? "percent" : "none",
        valueFormat: h
      };
    }
    if (c || l) {
      const g = c || l;
      return {
        type: "pie",
        categories: this.extractCategories(g) || [],
        series: this.extractSeries(g, n) || [],
        palette: f,
        title: e,
        showLegend: o,
        showDataLabels: i,
        stackedMode: "none",
        valueFormat: h
      };
    }
    return u ? {
      type: "scatter",
      categories: [],
      series: this.extractScatterSeries(u, n) || [],
      palette: f,
      title: e,
      showLegend: o,
      showDataLabels: i,
      stackedMode: "none",
      valueFormat: h
    } : null;
  }
  static extractTitle(t) {
    const n = t.getElementsByTagNameNS("*", "title")[0] || null;
    if (!n) return;
    const s = n.getElementsByTagNameNS("*", "tx")[0] || null, e = s?.getElementsByTagNameNS("*", "rich")[0] || null;
    return e ? Array.from(e.getElementsByTagNameNS("*", "t")).map((o) => o.textContent || "").join("") || void 0 : s?.getElementsByTagNameNS("*", "v")[0]?.textContent || void 0;
  }
  static extractCategories(t) {
    const n = t.getElementsByTagNameNS("*", "cat")[0] || null;
    if (!n) return null;
    const s = n.getElementsByTagNameNS("*", "strCache")[0] || null;
    if (s) {
      const i = Array.from(s.getElementsByTagNameNS("*", "pt"));
      return this.indexedValues(i, (r) => r.getElementsByTagNameNS("*", "v")[0]?.textContent || "");
    }
    const e = n.getElementsByTagNameNS("*", "numCache")[0] || null;
    if (e) {
      const i = Array.from(e.getElementsByTagNameNS("*", "pt"));
      return this.indexedValues(i, (r) => Number(r.getElementsByTagNameNS("*", "v")[0]?.textContent || 0));
    }
    const o = n.getElementsByTagNameNS("*", "multiLvlStrCache")[0] || null;
    if (o) {
      const i = o.getElementsByTagNameNS("*", "lvl")[0] || null;
      if (i) {
        const r = Array.from(i.getElementsByTagNameNS("*", "pt"));
        return this.indexedValues(r, (a) => a.getElementsByTagNameNS("*", "v")[0]?.textContent || "");
      }
    }
    return null;
  }
  static extractSeries(t, n) {
    const s = [], e = Array.from(t.getElementsByTagNameNS("*", "ser"));
    for (const o of e) {
      const i = o.getElementsByTagNameNS("*", "tx")[0]?.getElementsByTagNameNS("*", "v")[0]?.textContent || void 0, r = o.getElementsByTagNameNS("*", "numCache")[0] || null;
      let a = [];
      if (r) {
        const h = Array.from(r.getElementsByTagNameNS("*", "pt"));
        a = this.indexedValues(h, (f) => Number(f.getElementsByTagNameNS("*", "v")[0]?.textContent || 0));
      }
      const m = o.getElementsByTagNameNS("*", "dLbls")[0]?.getElementsByTagNameNS("*", "numFmt")[0]?.getAttribute("formatCode") || void 0, c = (o.getElementsByTagNameNS("*", "spPr")[0] || null)?.getElementsByTagNameNS("*", "solidFill")[0] || null, l = T.getColorFromElement(c, n), u = [];
      for (const h of Array.from(o.getElementsByTagNameNS("*", "dPt"))) {
        const f = Number(h.getElementsByTagNameNS("*", "idx")[0]?.getAttribute("val") || 0), g = (h.getElementsByTagNameNS("*", "spPr")[0] || null)?.getElementsByTagNameNS("*", "solidFill")[0] || null, d = T.getColorFromElement(g, n);
        d && (u[f] = d);
      }
      s.push({
        name: i,
        values: a,
        color: l,
        valueFormat: m,
        ptColors: u.length > 0 ? u : void 0
      });
    }
    return s;
  }
  static extractScatterSeries(t, n) {
    const s = [], e = Array.from(t.getElementsByTagNameNS("*", "ser"));
    for (const o of e) {
      const i = o.getElementsByTagNameNS("*", "tx")[0]?.getElementsByTagNameNS("*", "v")[0]?.textContent || void 0, r = o.getElementsByTagNameNS("*", "xVal")[0]?.getElementsByTagNameNS("*", "numCache")[0] || null, a = o.getElementsByTagNameNS("*", "yVal")[0]?.getElementsByTagNameNS("*", "numCache")[0] || null, m = r ? Array.from(r.getElementsByTagNameNS("*", "pt")) : [], c = a ? Array.from(a.getElementsByTagNameNS("*", "pt")) : [], l = this.indexedValues(m, (y) => Number(y.getElementsByTagNameNS("*", "v")[0]?.textContent || 0)), u = this.indexedValues(c, (y) => Number(y.getElementsByTagNameNS("*", "v")[0]?.textContent || 0)), h = Math.max(l.length, u.length), f = [];
      for (let y = 0; y < h; y++) l[y] !== void 0 && u[y] !== void 0 && f.push({
        x: l[y],
        y: u[y]
      });
      const g = (o.getElementsByTagNameNS("*", "spPr")[0] || null)?.getElementsByTagNameNS("*", "solidFill")[0] || null, d = T.getColorFromElement(g, n), p = o.getElementsByTagNameNS("*", "dLbls")[0]?.getElementsByTagNameNS("*", "numFmt")[0]?.getAttribute("formatCode") || void 0;
      s.push({
        name: i,
        points: f,
        color: d,
        valueFormat: p
      });
    }
    return s;
  }
  /** OOXML caches address points by `idx`; XML order is not guaranteed. */
  static indexedValues(t, n) {
    let s = -1;
    const e = [];
    t.forEach((i, r) => {
      const a = i.getAttribute("idx"), m = a !== null && /^\d+$/.test(a) ? Number(a) : r;
      s = Math.max(s, m), e.push({
        index: m,
        value: n(i)
      });
    });
    const o = new Array(s + 1);
    for (const i of e) o[i.index] = i.value;
    return o;
  }
}, Bt = class {
  zip;
  constructor(t) {
    this.zip = t;
  }
  /**
  * Extracts all slides in order and parses their visual elements.
  * @returns An array of SlideElement lists (one per slide).
  */
  async extractSlides() {
    const t = await this.zip.file("ppt/theme/theme1.xml")?.async("string"), n = t ? T.parseXml(t) : null, s = T.extractThemeColors(n), e = T.extractThemeTableStyles(n), o = Object.keys(this.zip.files).filter((a) => /^ppt\/slides\/slide\d+\.xml$/.test(a)).sort((a, m) => parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || "0", 10) - parseInt(m.match(/slide(\d+)\.xml$/)?.[1] || "0", 10)), i = await this.getSlidePathsInPresentationOrder(o), r = [];
    for (const a of i) {
      const m = await this.zip.file(a).async("string"), c = T.parseXml(m), l = c.querySelector("p\\:spTree") || c.getElementsByTagNameNS("*", "spTree")[0];
      if (!l) {
        console.warn(`Warning: no <spTree> found in ${a}`), r.push([]);
        continue;
      }
      const u = a.replace("slides/", "slides/_rels/") + ".rels", h = this.zip.file(u) ? T.parseXml(await this.zip.file(u).async("string")) : T.parseXml("<Relationships/>"), f = T.findRelationshipByTypeSuffix(h, "/slideLayout")?.getAttribute("Target") || void 0;
      let g = null, d = null;
      if (f) {
        const q = this.resolvePath(f, "ppt/slides"), G = await this.zip.file(q)?.async("string");
        if (G) {
          const B = T.parseXml(G);
          g = B.querySelector("p\\:spTree") || B.getElementsByTagNameNS("*", "spTree")[0] || null;
          const F = q.replace("slideLayouts/", "slideLayouts/_rels/") + ".rels";
          d = this.zip.file(F) ? T.parseXml(await this.zip.file(F).async("string")) : T.parseXml("<Relationships/>");
        }
      }
      let p = null, y = null;
      if (d) {
        const q = T.findRelationshipByTypeSuffix(d, "/slideMaster")?.getAttribute("Target") || void 0;
        if (q) {
          const G = this.resolvePath(q, "ppt/slideLayouts"), B = await this.zip.file(G)?.async("string");
          if (B) {
            const F = T.parseXml(B);
            p = F.querySelector("p\\:spTree") || F.getElementsByTagNameNS("*", "spTree")[0] || null;
            const P = G.replace("slideMasters/", "slideMasters/_rels/") + ".rels";
            y = this.zip.file(P) ? T.parseXml(await this.zip.file(P).async("string")) : T.parseXml("<Relationships/>");
          }
        }
      }
      const b = await this.extractBackground(c, h, "ppt/slides", this.zip, s), $ = d ? await this.extractBackground(g?.ownerDocument || null, d, "ppt/slideLayouts", this.zip, s) : null, w = y ? await this.extractBackground(p?.ownerDocument || null, y, "ppt/slideMasters", this.zip, s) : null, N = b || $ || w;
      N && (N.zIndex = -1);
      const v = p ? lt.extract(p, s, { context: "master" }) : [], A = p && y ? await ct.extract(p, y, this.zip, "ppt/slideMasters") : [], x = p ? mt.extract(p, s) : [], E = g ? lt.extract(g, s, { context: "layout" }) : [], S = g && d ? await ct.extract(g, d, this.zip, "ppt/slideLayouts") : [], k = g ? mt.extract(g, s) : [], C = this.extractPlaceholderGeom(p), M = this.extractPlaceholderGeom(g), D = {
        ...C,
        ...M
      }, L = this.extractPlaceholderTypes(p), R = this.extractPlaceholderTypes(g), z = {
        ...L,
        ...R
      }, j = lt.extract(l, s, {
        context: "slide",
        placeholderGeom: D,
        placeholderTypes: z
      }), Q = await ct.extract(l, h, this.zip, "ppt/slides"), K = Et.extract(l, s, e), _ = await wt.extract(l, h, this.zip, s), tt = mt.extract(l, s), H = (q, G) => q.map((B) => ({
        ...B,
        zIndex: G + (B.zIndex ?? 0)
      }));
      r.push([
        ...N ? [N] : [],
        ...H(x, 0),
        ...H(A, 0),
        ...H(v, 0),
        ...H(k, 1e4),
        ...H(S, 1e4),
        ...H(E, 1e4),
        ...H(tt, 2e4),
        ...H(K, 2e4),
        ...H(_, 2e4),
        ...H(Q, 2e4),
        ...H(j, 2e4)
      ]);
    }
    return r;
  }
  /** Normalize a relative path against a base directory inside ppt folder */
  resolvePath(t, n) {
    if (t.startsWith("/")) return t.slice(1);
    const s = (n + "/" + t).split("/"), e = [];
    for (const o of s) o === ".." ? e.length && e.pop() : o !== "." && o !== "" && e.push(o);
    return e.join("/");
  }
  /** Build an `idx → type` map from layout/master placeholders so slide-level
  *  shapes that only carry `idx` can resolve their inherited placeholder
  *  type (e.g. "body", "title"). */
  extractPlaceholderTypes(t) {
    const n = {};
    if (!t) return n;
    const s = t.getElementsByTagNameNS("*", "sp");
    for (const e of Array.from(s)) {
      const o = (e.getElementsByTagNameNS("*", "nvPr")[0] ?? null)?.getElementsByTagNameNS("*", "ph")[0] ?? null;
      if (!o) continue;
      const i = o.getAttribute("idx") || void 0, r = o.getAttribute("type") || void 0;
      i && r && (n[i] = r);
    }
    return n;
  }
  extractPlaceholderGeom(t) {
    const n = {};
    if (!t) return n;
    const s = t.getElementsByTagNameNS("*", "sp");
    for (const e of Array.from(s)) {
      const o = (e.getElementsByTagNameNS("*", "nvPr")[0] ?? null)?.getElementsByTagNameNS("*", "ph")[0] ?? null, i = o?.getAttribute("idx") || void 0, r = o?.getAttribute("type") || void 0, a = i || (r ? "type:" + r : void 0);
      if (!a) continue;
      const m = e.getElementsByTagNameNS("*", "xfrm")[0] ?? null, c = m?.getElementsByTagNameNS("*", "off")[0] ?? null, l = m?.getElementsByTagNameNS("*", "ext")[0] ?? null;
      if (!c || !l) continue;
      const u = {
        x: T.getAttrAsNumber(c, "x"),
        y: T.getAttrAsNumber(c, "y"),
        cx: T.getAttrAsNumber(l, "cx"),
        cy: T.getAttrAsNumber(l, "cy")
      };
      n[a] = u, r === "title" ? n["type:ctrTitle"] = u : r === "ctrTitle" && (n["type:title"] = u);
    }
    return n;
  }
  async extractBackground(t, n, s, e, o) {
    if (!t) return null;
    const i = t.getElementsByTagNameNS("*", "bg")[0];
    if (!i) return null;
    const r = i.getElementsByTagNameNS("*", "bgPr")[0] || null, a = r?.getElementsByTagNameNS("*", "solidFill")[0] || null, m = T.getColorFromElement(a, o);
    if (m) return {
      type: "background",
      fillColor: m
    };
    const c = ((i.getElementsByTagNameNS("*", "bgRef")[0] || null)?.getElementsByTagNameNS("*", "schemeClr")[0] || null)?.getAttribute("val") || void 0;
    if (c && o[c]) return {
      type: "background",
      fillColor: o[c]
    };
    const l = ((r?.getElementsByTagNameNS("*", "blipFill")[0] || null)?.getElementsByTagNameNS("*", "blip")[0] || null)?.getAttribute("r:embed") || void 0;
    if (l && n) {
      const u = T.findRelationshipById(n, l)?.getAttribute("Target") || void 0;
      if (u) {
        const h = this.resolvePath(u, s), f = e.file(h);
        if (f) {
          const g = await f.async("base64");
          return {
            type: "background",
            imageSrc: `data:${Nt(h)};base64,${g}`
          };
        }
      }
    }
    return null;
  }
  /**
  * Slides are displayed according to `presentation.xml`'s relationship list,
  * not according to the numeric suffix in their file names. The latter is
  * commonly sequential but changes after slides are moved or duplicated.
  */
  async getSlidePathsInPresentationOrder(t) {
    const n = this.zip.file("ppt/presentation.xml"), s = this.zip.file("ppt/_rels/presentation.xml.rels");
    if (!n || !s) return t;
    try {
      const [e, o] = await Promise.all([n.async("string"), s.async("string")]), i = T.parseXml(e), r = T.parseXml(o), a = [], m = Array.from(i.getElementsByTagNameNS("*", "sldId"));
      if (m.length === 0) return t;
      for (const c of m) {
        const l = c.getAttribute("r:id");
        if (!l) continue;
        const u = T.findRelationshipById(r, l)?.getAttribute("Target");
        if (!u) continue;
        const h = this.resolvePath(u, "ppt");
        this.zip.file(h) && !a.includes(h) && a.push(h);
      }
      return a;
    } catch {
      return t;
    }
  }
}, At = class {
  zip;
  baseWidthPx;
  baseHeightPx;
  /**
  * Loads and parses a .pptx binary buffer.
  * @param buffer The binary content of a .pptx file.
  * @returns A list of slides, each represented as an array of SlideElement.
  */
  async load(t) {
    return this.zip = await St.loadAsync(t), await this.computeSlideBaseSize(), new Bt(this.zip).extractSlides();
  }
  /**
  * Returns slide base size in pixels derived from ppt/presentation.xml sldSz (if available).
  * Defaults to 960x540 when not found.
  */
  async getBaseSizePx() {
    return this.baseWidthPx && this.baseHeightPx ? {
      width: this.baseWidthPx,
      height: this.baseHeightPx
    } : (await this.computeSlideBaseSize(), {
      width: Number.isFinite(this.baseWidthPx) && this.baseWidthPx > 0 ? this.baseWidthPx : 960,
      height: Number.isFinite(this.baseHeightPx) && this.baseHeightPx > 0 ? this.baseHeightPx : 540
    });
  }
  async computeSlideBaseSize() {
    try {
      if (!this.zip) return;
      const t = this.zip.file("ppt/presentation.xml");
      if (!t) return;
      const n = await t.async("string"), s = T.parseXml(n).getElementsByTagNameNS("*", "sldSz")[0], e = s ? Number(s.getAttribute("cx") || 0) : 0, o = s ? Number(s.getAttribute("cy") || 0) : 0;
      Number.isFinite(e) && Number.isFinite(o) && e > 0 && o > 0 && (this.baseWidthPx = e / 9525, this.baseHeightPx = o / 9525);
    } catch {
    }
  }
};
function kt(t) {
  const n = (u, h = 0) => Number.isFinite(u) ? u : h, s = n(t.position?.x, 0) / 9525, e = n(t.position?.y, 0) / 9525, o = n(t.size?.width, 0) / 9525, i = n(t.size?.height, 0) / 9525, r = t.padding || {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  }, a = t.align?.horizontal || "left", m = t.align?.vertical === "middle" ? "center" : t.align?.vertical === "bottom" ? "flex-end" : "flex-start", c = t.html ? t.html : Ft(t.content), l = Number.isFinite(t.rotationDeg) && t.rotationDeg ? `transform:rotate(${t.rotationDeg}deg); transform-origin:center;` : "";
  return `<div style="
    position: absolute;
    left: ${s}px;
    top: ${e}px;
    width: ${o}px;
    height: ${i}px;
    box-sizing: border-box;
    z-index: ${Number.isFinite(t.zIndex) ? t.zIndex : 0};
    display: flex;
    flex-direction: column;
    justify-content: ${m};
    text-align: ${a};
    padding: ${r.top}px ${r.right}px ${r.bottom}px ${r.left}px;
    font-family: ${bt(t.font?.name)};
    font-size: ${n(Number(t.font?.size), 12)}pt;
    font-weight: ${t.font?.weight || "normal"};
    color: ${V(t.font?.color, "#000")};
    overflow: hidden;
    white-space: pre-wrap;
    ${l}
  ">${c}</div>`;
}
function Ft(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Ct(t) {
  const n = (l, u = 0) => Number.isFinite(l) ? l : u, s = n(t.position?.x, 0) / 9525, e = n(t.position?.y, 0) / 9525, o = n(t.size?.width, 0) / 9525, i = n(t.size?.height, 0) / 9525, r = Number.isFinite(t.zIndex) ? t.zIndex : 0, a = Number.isFinite(t.rotationDeg) && t.rotationDeg ? `transform:rotate(${t.rotationDeg}deg); transform-origin:center;` : "", m = xt(t.src), c = t.crop;
  if (c && c.left + c.right < 1e5 && c.top + c.bottom < 1e5) {
    const l = 1e5 - c.left - c.right, u = 1e5 - c.top - c.bottom, h = o * 1e5 / l, f = i * 1e5 / u;
    return `<div style="position:absolute; z-index:${r}; left:${s}px; top:${e}px; width:${o}px; height:${i}px; overflow:hidden; ${a}">
      <img src="${m}" style="position:absolute; left:${-h * c.left / 1e5}px; top:${-f * c.top / 1e5}px; width:${h}px; height:${f}px;" />
    </div>`;
  }
  return `<img src="${m}" style="
    position: absolute;
    z-index: ${r};
    left: ${s}px;
    top: ${e}px;
    width: ${o}px;
    height: ${i}px;
    object-fit: fill;
    ${a}
  " />`;
}
function zt(t) {
  switch (t) {
    case "rightArrow":
    case "arrow":
      return "POLYGON 0,25 70,25 70,0 100,50 70,100 70,75 0,75";
    case "leftArrow":
      return "POLYGON 100,25 30,25 30,0 0,50 30,100 30,75 100,75";
    case "leftRightArrow":
      return "POLYGON 0,50 30,0 30,25 70,25 70,0 100,50 70,100 70,75 30,75 30,100";
    case "triangle":
      return "POLYGON 50,0 100,100 0,100";
    case "star5":
      return "POLYGON 50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35";
    case "cloud":
      return "PATH M20,60 C10,60 10,40 25,40 C30,20 50,20 55,35 C70,30 80,40 80,50 C90,50 90,70 75,70 H25 Z";
    case "straightConnector1":
      return "LINE_ARROW 0,50 100,50";
    case "bentConnector2":
      return "POLYLINE 0,50 50,50 50,100";
    case "bentConnector3":
      return "POLYLINE_ARROW 0,50 40,50 40,70 100,70";
    case "bentConnector4":
      return "POLYLINE 0,30 30,30 30,70 70,70 70,100";
    case "bentConnector5":
      return "POLYLINE 0,20 30,20 30,50 60,50 60,80 100,80";
    case "curvedConnector2":
      return "PATH M0,50 Q50,0 100,50";
    case "curvedConnector3":
      return "PATH M0,50 Q25,0 50,50 Q75,100 100,50";
    case "curvedConnector4":
      return "PATH M0,40 Q20,0 40,40 Q60,80 80,40 Q90,20 100,40";
    case "curvedConnector5":
      return "PATH M0,50 Q20,20 40,50 Q60,80 80,50 Q90,40 100,50";
    case "bentArrow":
      return "POLYGON 0,0 70,0 70,30 100,30 50,100 50,30 0,30";
    case "notchedRightArrow":
      return "POLYGON 0,20 60,20 60,0 100,50 60,100 60,80 0,80";
    case "curvedRightArrow":
      return "PATH M0,50 Q50,0 100,50 Q50,100 0,50 Z";
    default:
      return "POLYGON 0,0 100,0 100,100 0,100";
  }
}
function Pt(t, n = {}) {
  const s = (f, g = 0) => Number.isFinite(f) ? f : g, e = s(t.position?.x, 0) / 9525, o = s(t.position?.y, 0) / 9525, i = s(t.size?.width, 0) / 9525, r = s(t.size?.height, 0) / 9525, a = t.rotationDeg && !isNaN(t.rotationDeg) ? t.rotationDeg : 0, m = a ? `transform: rotate(${a}deg); transform-origin: center;` : "", c = V(t.fillColor), l = V(t.borderColor), u = t.strokeWidth && Number.isFinite(t.strokeWidth) ? t.strokeWidth : 1, h = `
    position: absolute;
    left: ${e}px;
    top: ${o}px;
    width: ${i}px;
    height: ${r}px;
    z-index: ${Number.isFinite(t.zIndex) ? t.zIndex : 0};
    ${m}
  `;
  return t.shapeType === "rect" ? `<div style="${h}
      background-color: ${c};
      border: ${u}px solid ${l};
      box-sizing: border-box;"></div>` : t.shapeType === "ellipse" ? `<div style="${h}
      background-color: ${c};
      border: ${u}px solid ${l};
      border-radius: 50%;
      box-sizing: border-box;"></div>` : t.shapeType === "roundRect" ? `<div style="${h}
      background-color: ${c};
      border: ${u}px solid ${l};
      border-radius: 16px;
      box-sizing: border-box;"></div>` : Mt(e, o, i, r, c, l, zt(t.shapeType), t.strokeWidth && Number.isFinite(t.strokeWidth) ? t.strokeWidth : void 0, a, t.headEnd, t.tailEnd, n.scaleStrokes === !0, Number.isFinite(t.zIndex) ? t.zIndex : 0);
}
function Mt(t, n, s, e, o, i, r, a, m, c, l, u, h = 0) {
  const f = Lt(i, o), [g, ...d] = r.trim().split(/\s+/), p = g.toUpperCase().replace("_ARROW", ""), y = g.endsWith("_ARROW"), b = d.join(" "), $ = e, w = s, N = a && a > 0 ? a : 2, v = m ? `transform: rotate(${m}deg); transform-origin: center;` : "", A = `
    position: absolute;
    left: ${t}px;
    top: ${n}px;
    width: ${w}px;
    height: ${$}px;
    z-index: ${h};
    ${v}
  `;
  switch (p) {
    case "PATH": {
      const x = pt(c, l, f || "#000"), E = x.startId ? `marker-start="url(#${x.startId})"` : "", S = x.endId ? `marker-end="url(#${x.endId})"` : "";
      return `<svg viewBox="0 0 100 100" style="${A}" overflow="visible">
        ${x.defs}
        <path d="${b}" fill="none" stroke="${f || "#000"}" stroke-width="${N}" ${u ? "" : 'vector-effect="non-scaling-stroke"'} ${E} ${S} />
      </svg>`;
    }
    case "POLYLINE":
    case "LINE": {
      const x = b.split(/[\s,]+/).map((z) => parseFloat(z)).filter((z) => !isNaN(z));
      if (x.length < 4 || x.length % 2 !== 0)
        return typeof console < "u" && console.warn && console.warn(`[pptx-to-html] Invalid POLYLINE/LINE shape data: "${b}"`), "";
      const E = [];
      for (let z = 0; z < x.length; z += 2) E.push(`${x[z]},${x[z + 1]}`);
      const S = s > 0 ? s : Math.max(N * 2, 2), k = e > 0 ? e : Math.max(N * 2, 2), C = pt(c, l ?? (y ? {
        type: "triangle",
        len: "med"
      } : void 0), f || "#000"), M = C.startId ? `marker-start="url(#${C.startId})"` : "", D = C.endId ? `marker-end="url(#${C.endId})"` : "", L = [];
      for (let z = 0; z < x.length; z += 2) {
        const j = x[z] / 100 * S, Q = x[z + 1] / 100 * k;
        L.push(`${j},${Q}`);
      }
      const R = L.join(" ");
      return `
        <svg viewBox="0 0 ${S} ${k}"
            style="
              position: absolute;
              left: ${t}px;
              top: ${n}px;
              width: ${S}px;
              height: ${k}px;
              z-index: ${h};
              ${v}
            "
            overflow="visible">
          ${C.defs}
          <polyline points="${R}"
                    fill="none"
                    stroke="${f || "#000"}"
                    stroke-width="${N}"
                    ${u ? "" : 'vector-effect="non-scaling-stroke"'}
                    ${M} ${D} />
        </svg>`;
    }
    default:
      return `<svg viewBox="0 0 100 100" style="${A}">
        <polygon points="${b}" fill="${o}" stroke="${f ?? "none"}" stroke-width="${N}" ${u ? "" : 'vector-effect="non-scaling-stroke"'} />
      </svg>`;
  }
}
function pt(t, n, s) {
  const e = [];
  let o, i;
  return t && t.type && t.type !== "none" && (o = `mstart-${Math.random().toString(36).slice(2, 8)}`, e.push(yt(o, t, s))), n && n.type && n.type !== "none" && (i = `mend-${Math.random().toString(36).slice(2, 8)}`, e.push(yt(i, n, s))), {
    defs: e.length ? `<defs>${e.join(`
`)}</defs>` : "",
    startId: o,
    endId: i
  };
}
function yt(t, n, s) {
  const e = 4 * It(n.len), o = e, i = e / 2;
  switch ((n.type || "triangle").toLowerCase()) {
    case "diamond":
      return `<marker id="${t}" markerUnits="strokeWidth" markerWidth="${e}" markerHeight="${e}"
                      refX="${o}" refY="${i}" orient="auto-start-reverse">
                <polygon points="${e / 2},0 ${e},${e / 2} ${e / 2},${e} 0,${e / 2}" fill="${s}" />
              </marker>`;
    case "oval":
      return `<marker id="${t}" markerUnits="strokeWidth" markerWidth="${e}" markerHeight="${e}"
                      refX="${o}" refY="${i}" orient="auto-start-reverse">
                <circle cx="${e / 2}" cy="${e / 2}" r="${e / 2}" fill="${s}" />
              </marker>`;
    case "stealth":
      return `<marker id="${t}" markerUnits="strokeWidth" markerWidth="${e}" markerHeight="${e}"
                      refX="${o}" refY="${i}" orient="auto-start-reverse">
                <polygon points="${e},${e / 2} 0,0 0,${e}" fill="${s}" />
              </marker>`;
    default:
      return `<marker id="${t}" markerUnits="strokeWidth" markerWidth="${e}" markerHeight="${e}"
                      refX="${o}" refY="${i}" orient="auto-start-reverse">
                <polygon points="0,0 ${e},${e / 2} 0,${e}" fill="${s}" />
              </marker>`;
  }
}
function It(t) {
  switch ((t || "med").toLowerCase()) {
    case "sm":
    case "small":
      return 1.5;
    case "lg":
    case "large":
      return 2.5;
    default:
      return 2;
  }
}
function Lt(t, n) {
  if (t && t !== "transparent") return t;
  if (n && n !== "transparent") return n;
}
function Rt(t) {
  const n = (f, g = 0) => Number.isFinite(f) ? f : g, s = n(t.position?.x, 0) / 9525, e = n(t.position?.y, 0) / 9525, o = n(t.size?.width, 0) / 9525, i = n(t.size?.height, 0) / 9525, r = Number.isFinite(t.rotationDeg) && t.rotationDeg ? `transform:rotate(${t.rotationDeg}deg); transform-origin:center;` : "", a = t.columns.map((f) => n(f, 0) / 9525), m = a.reduce((f, g) => f + g, 0) || 1, c = a.map((f) => `<col style="width:${f / m * 100}%">`).join(""), l = t.tableFillColor || t.style?.fills?.wholeTbl;
  let u = 0;
  const h = t.rows.map((f) => {
    let g = 0;
    const d = f.cells.map((y) => {
      const b = y.padding || {
        left: 6,
        top: 2,
        right: 6,
        bottom: 2
      }, $ = y.align?.horizontal || "left", w = y.align?.vertical || "top", N = Dt(t, y, u, g), { bg: v, fontColor: A, emphasize: x } = Wt(t, u, g), E = x, S = `
            padding:${b.top}px ${b.right}px ${b.bottom}px ${b.left}px;
            text-align:${$};
            vertical-align:${w === "middle" ? "middle" : w};
            ${y.fillColor ? `background-color:${V(y.fillColor)};` : ""}
            ${!y.fillColor && v ? `background-color:${V(v)};` : ""}
            ${y.font?.color ? `color:${V(y.font.color, "#000")};` : A ? `color:${V(A, "#000")};` : ""}
            ${y.font?.name ? `font-family:${bt(y.font.name)};` : ""}
            ${y.font?.size ? `font-size:${y.font.size}pt;` : ""}
            ${N}
            ${E ? "font-weight:600;" : ""}
            overflow:hidden; word-break: break-word; white-space: pre-wrap;`, k = `<td${`${y.colSpan ? ` colspan="${y.colSpan}"` : ""}${y.rowSpan ? ` rowspan="${y.rowSpan}"` : ""}`} style="${S}">${Ht(y.text).replace(/\n/g, "<br>")}</td>`;
      return g += y.colSpan || 1, k;
    }).join(""), p = `<tr${t.tableStyle?.firstRow && u === 0 ? ' style="font-weight:600;"' : ""}>${d}</tr>`;
    return u += 1, p;
  }).join("");
  return `<div style="position:absolute; z-index:${Number.isFinite(t.zIndex) ? t.zIndex : 0}; left:${s}px; top:${e}px; width:${o}px; height:${i}px; ${r}">
    <table style="border-collapse:collapse; width:100%; height:100%; table-layout:fixed;${l ? ` background-color:${V(l)};` : ""}">
      <colgroup>${c}</colgroup>
      <tbody>${h}</tbody>
    </table>
  </div>`;
}
function Dt(t, n, s, e) {
  const o = [], i = [
    "top",
    "right",
    "bottom",
    "left"
  ], r = (l, u) => {
    if (!u) return;
    const h = u.width ?? 1, f = V(u.color, "#000"), g = u.style === "dashed" || u.style === "dotted" ? u.style : "solid";
    o.push(`border-${l}: ${Math.max(1, Math.round(h))}px ${g} ${f};`);
  };
  for (const l of i) {
    const u = n.borders?.[l];
    u && r(l, u);
  }
  const a = t.tableBorders || {}, m = s === t.rows.length - 1, c = e === t.columns.length - 1;
  return !n.borders?.top && s === 0 && r("top", a.top), !n.borders?.bottom && m && r("bottom", a.bottom), !n.borders?.left && e === 0 && r("left", a.left), !n.borders?.right && c && r("right", a.right), !n.borders?.top && s > 0 && r("top", a.insideH), !n.borders?.left && e > 0 && r("left", a.insideV), o.join(" ");
}
function Ht(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Wt(t, n, s) {
  const e = n === t.rows.length - 1, o = s === t.columns.length - 1, i = t.style || {}, r = i.fills || {}, a = i.fontColors || {};
  let m = !1;
  if (t.tableStyle?.firstRow && n === 0)
    return m = !0, {
      bg: r.firstRow || r.wholeTbl || "#f0f0f0",
      fontColor: a.firstRow || a.wholeTbl,
      emphasize: m
    };
  if (t.tableStyle?.lastRow && e) return {
    bg: r.lastRow || r.wholeTbl || "#f0f0f0",
    fontColor: a.lastRow || a.wholeTbl,
    emphasize: m
  };
  if (t.tableStyle?.firstCol && s === 0)
    return m = !0, {
      bg: r.firstCol || r.wholeTbl || "#f0f0f0",
      fontColor: a.firstCol || a.wholeTbl,
      emphasize: m
    };
  if (t.tableStyle?.lastCol && o) return {
    bg: r.lastCol || r.wholeTbl || "#f0f0f0",
    fontColor: a.lastCol || a.wholeTbl,
    emphasize: m
  };
  if (t.tableStyle?.bandRow) {
    const c = (t.tableStyle?.firstRow ? n - 1 : n) % 2 === 0 ? "band1H" : "band2H";
    return {
      bg: r[c] || r.wholeTbl || (n % 2 === 1 ? "#fafafa" : void 0),
      fontColor: a[c] || a.wholeTbl,
      emphasize: m
    };
  }
  if (t.tableStyle?.bandCol) {
    const c = s % 2 === 0 ? "band1V" : "band2V";
    return {
      bg: r[c] || r.wholeTbl || (s % 2 === 1 ? "#fafafa" : void 0),
      fontColor: a[c] || a.wholeTbl,
      emphasize: m
    };
  }
  return {
    bg: r.wholeTbl,
    fontColor: a.wholeTbl,
    emphasize: m
  };
}
function Xt(t) {
  const n = (l, u = 0) => Number.isFinite(l) ? l : u, s = n(t.position?.x, 0) / 9525, e = n(t.position?.y, 0) / 9525, o = Math.max(1, n(t.size?.width, 0) / 9525), i = Math.max(1, n(t.size?.height, 0) / 9525), r = 24, a = t.palette && t.palette.length > 0 ? t.palette : [
    "#4e79a7",
    "#f28e2b",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc949"
  ];
  let m = "";
  t.chartType === "column" || t.chartType === "bar" ? m = Ot(t, o, i, r, a) : t.chartType === "line" ? m = jt(t, o, i, r, a) : t.chartType === "area" ? m = qt(t, o, i, r, a) : t.chartType === "pie" ? m = Yt(t, o, i, a) : t.chartType === "scatter" && (m = Vt(t, o, i, r, a));
  const c = Number.isFinite(t.zIndex) ? t.zIndex : 0;
  return `${t.title ? `<div style="position:absolute;z-index:${c};left:${s}px;top:${e - 20}px;width:${o}px;text-align:center;font-weight:600;">${nt(t.title)}</div>` : ""}<div style="position:absolute; z-index:${c}; left:${s}px; top:${e}px; width:${o}px; height:${i}px;${Number.isFinite(t.rotationDeg) && t.rotationDeg ? ` transform:rotate(${t.rotationDeg}deg); transform-origin:center;` : ""}">
      <svg width="${o}" height="${i}" viewBox="0 0 ${o} ${i}">
        ${m}
      </svg>
    </div>`;
}
function Ot(t, n, s, e, o) {
  const i = Math.max(1, t.categories.length, ...t.series.map((d) => d.values?.length || 0)), r = n - e * 2, a = s - e * 2, m = t.chartType === "bar", c = t.stackedMode && t.stackedMode !== "none", l = t.stackedMode === "percent", u = ut(t, i, !!c, l), h = Math.max(1e-9, u.max - u.min), f = (d) => (d - u.min) / h, g = [];
  if (m ? (g.push(`<line x1="${e}" y1="${s - e}" x2="${n - e}" y2="${s - e}" stroke="#999" stroke-width="1" />`), g.push(`<line x1="${e}" y1="${e}" x2="${e}" y2="${s - e}" stroke="#999" stroke-width="1" />`), rt(u.min, u.max, 4).forEach((d) => {
    const p = e + f(d) * r, y = s - e;
    g.push(`<line x1="${p}" y1="${y}" x2="${p}" y2="${y + 4}" stroke="#999" stroke-width="1" />`), g.push(`<text x="${p}" y="${y + 16}" text-anchor="middle" font-size="10" fill="#666">${O(d, l ? "0%" : t.valueFormat)}</text>`);
  })) : (g.push(`<line x1="${e}" y1="${s - e}" x2="${n - e}" y2="${s - e}" stroke="#999" stroke-width="1" />`), g.push(`<line x1="${e}" y1="${e}" x2="${e}" y2="${s - e}" stroke="#999" stroke-width="1" />`), rt(u.min, u.max, 4).forEach((d) => {
    const p = s - e - f(d) * a;
    g.push(`<line x1="${e - 4}" y1="${p}" x2="${e}" y2="${p}" stroke="#999" stroke-width="1" />`), g.push(`<text x="${e - 6}" y="${p + 3}" text-anchor="end" font-size="10" fill="#666">${O(d, l ? "0%" : t.valueFormat)}</text>`), g.push(`<line x1="${e}" y1="${p}" x2="${n - e}" y2="${p}" stroke="#eee" stroke-width="1" />`);
  })), m) {
    const d = a / i, p = Math.max(2, d * 0.8 / (c ? 1 : t.series.length));
    t.series.forEach((b, $) => {
      const w = b.color || o[$ % o.length];
      (b.values || []).forEach((N, v) => {
        const A = e + v * d + (d - (c ? p : t.series.length * p)) / 2;
        if (c) {
          const x = t.series.reduce((z, j) => z + ((j.values || [])[v] || 0), 0) || 1, E = at(t, $, v, N), S = l ? E / x : E, k = S + (l ? N / x : N), C = f(S) * r, M = f(k) * r, D = e + Math.min(C, M), L = Math.abs(M - C), R = A;
          if (g.push(`<rect x="${D}" y="${R}" width="${L}" height="${p}" fill="${w}" />`), t.showDataLabels) {
            const z = b.valueFormat || t.valueFormat;
            g.push(`<text x="${D + L - 2}" y="${R + p / 2 + 3}" text-anchor="end" font-size="10" fill="#000">${O(l ? N / x : N, l ? "0%" : z)}</text>`);
          }
        } else {
          const x = f(0) * r, E = f(N) * r, S = Math.abs(E - x), k = A + $ * p;
          if (g.push(`<rect x="${e + Math.min(x, E)}" y="${k}" width="${S}" height="${p}" fill="${w}" />`), t.showDataLabels) {
            const C = b.valueFormat || t.valueFormat;
            g.push(`<text x="${e + S + 2}" y="${k + p / 2 + 3}" font-size="10" fill="#000">${O(N, C)}</text>`);
          }
        }
      });
    });
    const y = Math.max(10, Math.min(12, a / (i * 2)));
    t.categories.forEach((b, $) => {
      const w = e + $ * d + d / 2 + 4;
      g.push(`<text x="${e - 8}" y="${w}" text-anchor="end" font-size="${y}" fill="#333">${nt(String(b))}</text>`);
    });
  } else {
    const d = r / i, p = Math.max(2, d * 0.8 / (c ? 1 : t.series.length));
    t.series.forEach((b, $) => {
      const w = b.color || o[$ % o.length];
      (b.values || []).forEach((N, v) => {
        const A = e + v * d + (d - (c ? p : t.series.length * p)) / 2;
        if (c) {
          const x = t.series.reduce((L, R) => L + ((R.values || [])[v] || 0), 0) || 1, E = at(t, $, v, N), S = f(l ? E / x : E) * a, k = f((l ? E / x : E) + (l ? N / x : N)) * a, C = Math.abs(k - S), M = A, D = s - e - Math.max(S, k);
          if (g.push(`<rect x="${M}" y="${D}" width="${p}" height="${C}" fill="${w}" />`), t.showDataLabels) {
            const L = b.valueFormat || t.valueFormat;
            g.push(`<text x="${M + p / 2}" y="${D - 2}" text-anchor="middle" font-size="10" fill="#000">${O(l ? N / x : N, l ? "0%" : L)}</text>`);
          }
        } else {
          const x = f(0) * a, E = f(N) * a, S = Math.abs(E - x), k = A + $ * p, C = s - e - Math.max(x, E);
          if (g.push(`<rect x="${k}" y="${C}" width="${p}" height="${S}" fill="${w}" />`), t.showDataLabels) {
            const M = b.valueFormat || t.valueFormat;
            g.push(`<text x="${k + p / 2}" y="${C - 2}" text-anchor="middle" font-size="10" fill="#000">${O(N, M)}</text>`);
          }
        }
      });
    });
    const y = Math.max(10, Math.min(12, r / (i * 4)));
    t.categories.forEach((b, $) => {
      const w = e + $ * d + d / 2, N = s - e + 14;
      g.push(`<text x="${w}" y="${N}" text-anchor="middle" font-size="${y}" fill="#333">${nt(String(b))}</text>`);
    });
  }
  return t.showLegend && g.push(Qt(t, n, e, o)), g.join(`
`);
}
function jt(t, n, s, e, o) {
  const i = Math.max(1, t.categories.length, ...t.series.map((p) => p.values?.length || 0)), r = n - e * 2, a = s - e * 2, m = t.stackedMode && t.stackedMode !== "none", c = t.stackedMode === "percent", l = ut(t, i, !!m, c), u = Math.max(1e-9, l.max - l.min), h = (p) => (p - l.min) / u, f = r / Math.max(1, i - 1), g = [];
  g.push(`<line x1="${e}" y1="${s - e}" x2="${n - e}" y2="${s - e}" stroke="#999" stroke-width="1" />`), g.push(`<line x1="${e}" y1="${e}" x2="${e}" y2="${s - e}" stroke="#999" stroke-width="1" />`), rt(l.min, l.max, 4).forEach((p) => {
    const y = s - e - h(p) * a;
    g.push(`<line x1="${e - 4}" y1="${y}" x2="${e}" y2="${y}" stroke="#999" stroke-width="1" />`), g.push(`<text x="${e - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="#666">${O(p, t.valueFormat)}</text>`), g.push(`<line x1="${e}" y1="${y}" x2="${n - e}" y2="${y}" stroke="#eee" stroke-width="1" />`);
  });
  const d = c ? new Array(i).fill(0).map((p, y) => t.series.reduce((b, $) => b + (($.values || [])[y] || 0), 0)) : void 0;
  if (t.series.forEach((p, y) => {
    const b = p.color || o[y % o.length];
    let $ = "";
    (p.values || []).forEach((w, N) => {
      const v = e + N * f;
      let A = w;
      m && (A = at(t, y, N, w) + w, c && d && (A = d[N] ? A / d[N] : 0));
      const x = s - e - h(A) * a;
      $ += N === 0 ? `M ${v} ${x}` : ` L ${v} ${x}`;
    }), g.push(`<path d="${$}" fill="none" stroke="${b}" stroke-width="2" />`), t.showDataLabels && (p.values || []).forEach((w, N) => {
      const v = e + N * f, A = m ? at(t, y, N, w) : 0, x = c && d ? w / (d[N] || 1) : w, E = m ? A + w : w, S = s - e - h(c && d ? d[N] ? E / d[N] : 0 : E) * a;
      g.push(`<circle cx="${v}" cy="${S}" r="2.5" fill="${b}" />`);
      const k = p.valueFormat || t.valueFormat;
      g.push(`<text x="${v}" y="${S - 6}" text-anchor="middle" font-size="10" fill="#000">${O(x, c ? "0%" : k)}</text>`);
    });
  }), t.categories.length > 0) {
    const p = Math.max(10, Math.min(12, r / (i * 4)));
    t.categories.forEach((y, b) => {
      const $ = e + b * f;
      g.push(`<text x="${$}" y="${s - e + 14}" text-anchor="middle" font-size="${p}" fill="#333">${nt(String(y))}</text>`);
    });
  }
  return g.join(`
`);
}
function qt(t, n, s, e, o) {
  const i = Math.max(1, t.categories.length, ...t.series.map((b) => b.values?.length || 0)), r = n - e * 2, a = s - e * 2, m = t.stackedMode && t.stackedMode !== "none", c = t.stackedMode === "percent", l = ut(t, i, !!m, c), u = Math.max(1e-9, l.max - l.min), h = (b) => (b - l.min) / u, f = r / Math.max(1, i - 1), g = [];
  g.push(`<line x1="${e}" y1="${s - e}" x2="${n - e}" y2="${s - e}" stroke="#999" stroke-width="1" />`), g.push(`<line x1="${e}" y1="${e}" x2="${e}" y2="${s - e}" stroke="#999" stroke-width="1" />`);
  const d = c ? new Array(i).fill(0).map((b, $) => t.series.reduce((w, N) => w + ((N.values || [])[$] || 0), 0)) : void 0, p = new Array(i).fill(0), y = new Array(i).fill(0);
  return t.series.forEach((b, $) => {
    const w = b.color || o[$ % o.length], N = [], v = [];
    (b.values || []).forEach((x, E) => {
      const S = m ? x >= 0 ? p[E] : y[E] : 0, k = m ? S + (c && d ? d[E] ? x / d[E] : 0 : x) : x, C = s - e - h(k) * a, M = s - e - h(S) * a;
      N.push(C), v.push(M), m && (x >= 0 ? p[E] = c && d ? k : S + x : y[E] = c && d ? k : S + x);
    });
    let A = "";
    for (let x = 0; x < N.length; x++) {
      const E = e + x * f;
      A += x === 0 ? `M ${E} ${N[x]}` : ` L ${E} ${N[x]}`;
    }
    for (let x = v.length - 1; x >= 0; x--) {
      const E = e + x * f;
      A += ` L ${E} ${v[x]}`;
    }
    A += " Z", g.push(`<path d="${A}" fill="${w}" fill-opacity="0.6" stroke="none" />`);
  }), g.join(`
`);
}
function at(t, n, s, e) {
  return t.series.slice(0, n).reduce((o, i) => {
    const r = (i.values || [])[s] || 0;
    return o + (e >= 0 ? Math.max(0, r) : Math.min(0, r));
  }, 0);
}
function ut(t, n, s, e) {
  if (e) return {
    min: 0,
    max: 1
  };
  let o = 0, i = 0;
  if (s) for (let r = 0; r < n; r++) {
    let a = 0, m = 0;
    for (const c of t.series) {
      const l = (c.values || [])[r] || 0;
      l >= 0 ? a += l : m += l;
    }
    o = Math.min(o, m), i = Math.max(i, a);
  }
  else for (const r of t.series) for (const a of r.values || [])
    o = Math.min(o, a), i = Math.max(i, a);
  return o === i ? {
    min: o - 1,
    max: i + 1
  } : {
    min: o,
    max: i
  };
}
function Yt(t, n, s, e) {
  const o = t.series[0], i = o && o.values ? o.values : [], r = i.reduce((h, f) => h + Math.max(0, f), 0) || 1, a = n / 2, m = s / 2, c = Math.min(n, s) * 0.35;
  let l = 0;
  const u = [];
  return i.forEach((h, f) => {
    const g = Math.max(0, h) / r, d = l + g * 2 * Math.PI, p = a + c * Math.cos(l), y = m + c * Math.sin(l), b = a + c * Math.cos(d), $ = m + c * Math.sin(d), w = d - l > Math.PI ? 1 : 0, N = o && o.ptColors && o.ptColors[f] || o && o.color || e[f % e.length], v = g >= 1 ? `<circle cx="${a}" cy="${m}" r="${c}" fill="${N}" />` : `<path d="M ${a} ${m} L ${p} ${y} A ${c} ${c} 0 ${w} 1 ${b} ${$} Z" fill="${N}" />`;
    if (u.push(v), t.showDataLabels && g > 0) {
      const A = (l + d) / 2, x = a + (c + 12) * Math.cos(A), E = m + (c + 12) * Math.sin(A), S = String(t.categories[f] || ""), k = S ? `${nt(S)} ${(g * 100).toFixed(0)}%` : `${(g * 100).toFixed(0)}%`;
      u.push(`<text x="${x}" y="${E}" text-anchor="middle" font-size="10" fill="#000">${k}</text>`);
    }
    l = d;
  }), u.join(`
`);
}
function Vt(t, n, s, e, o) {
  const i = n - e * 2, r = s - e * 2, a = [];
  for (const f of t.series) {
    const g = f.points || [];
    for (const d of g) a.push(d);
  }
  let m = Math.min(...a.map((f) => f.x)), c = Math.max(...a.map((f) => f.x)), l = Math.min(...a.map((f) => f.y)), u = Math.max(...a.map((f) => f.y));
  (!Number.isFinite(m) || !Number.isFinite(c)) && (m = 0, c = 1), (!Number.isFinite(l) || !Number.isFinite(u)) && (l = 0, u = 1), m === c && (m -= 0.5, c += 0.5), l === u && (l -= 0.5, u += 0.5);
  const h = [];
  return h.push(`<line x1="${e}" y1="${s - e}" x2="${n - e}" y2="${s - e}" stroke="#999" stroke-width="1" />`), h.push(`<line x1="${e}" y1="${e}" x2="${e}" y2="${s - e}" stroke="#999" stroke-width="1" />`), rt(m, c, 4).forEach((f) => {
    const g = e + (f - m) / Math.max(1e-9, c - m) * i, d = s - e;
    h.push(`<line x1="${g}" y1="${d}" x2="${g}" y2="${d + 4}" stroke="#999" stroke-width="1" />`), h.push(`<text x="${g}" y="${d + 16}" text-anchor="middle" font-size="10" fill="#666">${O(f, t.valueFormat)}</text>`);
  }), rt(l, u, 4).forEach((f) => {
    const g = s - e - (f - l) / Math.max(1e-9, u - l) * r;
    h.push(`<line x1="${e - 4}" y1="${g}" x2="${e}" y2="${g}" stroke="#999" stroke-width="1" />`), h.push(`<text x="${e - 6}" y="${g + 3}" text-anchor="end" font-size="10" fill="#666">${O(f, t.valueFormat)}</text>`), h.push(`<line x1="${e}" y1="${g}" x2="${n - e}" y2="${g}" stroke="#eee" stroke-width="1" />`);
  }), t.series.forEach((f, g) => {
    const d = f.color || o[g % o.length];
    (f.points || []).forEach((p) => {
      const y = e + (p.x - m) / Math.max(1e-9, c - m) * i, b = s - e - (p.y - l) / Math.max(1e-9, u - l) * r;
      if (h.push(`<circle cx="${y}" cy="${b}" r="3" fill="${d}" />`), t.showDataLabels) {
        const $ = f.valueFormat || t.valueFormat;
        h.push(`<text x="${y + 5}" y="${b - 5}" font-size="10" fill="#000">${O(p.y, $)}</text>`);
      }
    });
  }), h.join(`
`);
}
function nt(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function rt(t, n, s) {
  const e = n - t;
  if (e <= 0) return [t, n];
  const o = Gt(e / s), i = [];
  let r = Math.ceil(t / o) * o;
  for (; r <= n + 1e-9; )
    i.push(Number(r.toFixed(10))), r += o;
  return i;
}
function Gt(t, n) {
  const s = Math.floor(Math.log10(t)), e = t / Math.pow(10, s);
  let o;
  return e < 1.5 ? o = 1 : e < 3 ? o = 2 : e < 7 ? o = 5 : o = 10, o * Math.pow(10, s);
}
function O(t, n) {
  if (!n)
    return Math.abs(t) >= 1e3 ? `${Math.round(t)}` : Math.abs(t) >= 10 ? t.toFixed(0) : Math.abs(t) >= 1 ? t.toFixed(1) : t.toFixed(2);
  let s = /%/.test(n), e = 0;
  const o = n.match(/\.([0#]+)/);
  o && (e = o[1].length);
  const i = n.match(/([$€£¥])/), r = i ? i[1] : "", a = /#,##0/.test(n);
  let m = t;
  s && (m = m * 100);
  let c = m.toFixed(e);
  if (a) {
    const [l, u] = c.split("."), h = l.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    c = u !== void 0 ? `${h}.${u}` : h;
  }
  return r && (c = r + c), s && (c = c + "%"), c;
}
function Qt(t, n, s, e) {
  let o = s;
  const i = s - 12, r = [];
  return t.series.forEach((a, m) => {
    const c = a.color || e[m % e.length], l = a.name || `Series ${m + 1}`;
    r.push(`<rect x="${o}" y="${i}" width="10" height="10" fill="${c}" />`), r.push(`<text x="${o + 14}" y="${i + 9}" font-size="10" fill="#333">${nt(l)}</text>`), o += 14 + l.length * 6 + 10;
  }), r.join(`
`);
}
var Zt = class {
  /**
  * Renders a slide to an HTML <div> with all elements positioned accordingly.
  * @param elements List of SlideElement (text, image, shape)
  * @param options Optional width and height (in px) for the slide container.
  *  - If scaleToFit=true, width/height define the outer container size and contents are scaled from the base 960x540.
  * @returns HTML string representing the slide
  */
  static render(t, n = {}) {
    const s = (l, u) => typeof l == "number" && Number.isFinite(l) && l > 0 ? l : u, e = s(n.baseWidth, 960), o = s(n.baseHeight, 540), i = s(n.width, e), r = s(n.height, o), a = n.scaleToFit === !0, m = a ? n.letterbox !== !1 : n.letterbox === !0, c = t.map((l) => {
      switch (l.type) {
        case "background": {
          const u = l.imageSrc ? `background-image: url('${xt(l.imageSrc)}'); background-size: cover; background-position: center; background-repeat: no-repeat;` : `background-color: ${V(l.fillColor)};`;
          return `<div style="position:absolute; z-index:${Number.isFinite(l.zIndex) ? l.zIndex : -1}; left:0; top:0; width:${e}px; height:${o}px; ${u}"></div>`;
        }
        case "text":
          return kt(l);
        case "image":
          return Ct(l);
        case "shape":
          return Pt(l, { scaleStrokes: a });
        case "table":
          return Rt(l);
        case "chart":
          return Xt(l);
        default:
          return typeof console < "u" && console.warn && console.warn(`[pptx-to-html] Unsupported element type: ${l?.type}`), "";
      }
    });
    if (a) if (m) {
      const l = Math.min(i / e, r / o);
      return `<div class="slide-container" style="position: relative; width: ${i}px; height: ${r}px; overflow: hidden; background-color: #000;">
            <div class="slide" style="position: absolute; left: ${(i - e * l) / 2}px; top: ${(r - o * l) / 2}px; width: ${e}px; height: ${o}px; transform: scale(${l}); transform-origin: top left; background-color: #fff;">
              ${c.join(`
`)}
            </div>
          </div>`;
    } else return `<div class="slide-container" style="position: relative; width: ${i}px; height: ${r}px; overflow: hidden;">
            <div class="slide" style="position: absolute; left: 0; top: 0; width: ${e}px; height: ${o}px; transform: scale(${i / e}, ${r / o}); transform-origin: top left; background-color: #fff;">
              ${c.join(`
`)}
            </div>
          </div>`;
    return `<div class="slide" style="position: relative; width: ${i}px; height: ${r}px; overflow: hidden; background-color: #fff;">
        ${c.join(`
`)}
      </div>`;
  }
};
async function Jt(t, n) {
  n?.domParserFactory && T.setDomParser(n.domParserFactory);
  const s = new At(), e = await s.load(t), o = await s.getBaseSizePx(), i = {
    ...n || {},
    baseWidth: o.width,
    baseHeight: o.height
  };
  return e.map((r) => Zt.render(r, i));
}
export {
  Jt as pptxToHtml
};
//# sourceMappingURL=index-Dtzr2iRB.js.map

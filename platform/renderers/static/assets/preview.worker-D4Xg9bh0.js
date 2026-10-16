const d = 25, g = 20;
function c(i, s, t) {
  return Math.max(0, Math.min(Number.isFinite(i) ? Math.floor(i) : 0, Math.max(0, Math.ceil(s / t) - 1)));
}
class w {
  markdown = null;
  sheets = [];
  sizes = [];
  pages = [];
  active = 0;
  async handle(s) {
    if (s.action === "markdown") {
      const { MarkdownPreview: e } = await import("./markdownPreview-BFRCpLPS.js");
      this.markdown = new e(s.source), this.sheets = [];
    } else if (s.action === "workbook") {
      const e = await import("./xlsx-W52I8oHK.js"), n = e.read(s.bytes, { type: "array" });
      this.markdown = null, this.sheets = n.SheetNames.map((r) => e.utils.sheet_to_json(n.Sheets[r], { header: 1, raw: !1, defval: "", blankrows: !0 }).map((o) => o.map((h) => String(h ?? "")))), this.sizes = n.SheetNames.map((r, o) => ({
        name: r,
        rows: this.sheets[o].length,
        columns: this.sheets[o].reduce((h, m) => Math.max(h, m.length), 0)
      })), this.pages = this.sizes.map(() => ({ row: 0, column: 0 })), this.active = 0;
    } else if (this.markdown)
      this.markdown.setPage(s.table, s.page);
    else {
      const e = this.sizes[s.table];
      if (!e) throw new Error("Unknown sheet");
      this.active = s.table, this.pages[this.active] = {
        row: c(s.page.row, e.rows, 25),
        column: c(s.page.column, e.columns, 20)
      };
    }
    if (this.markdown) return {
      kind: "markdown",
      tables: this.markdown.sizes,
      pages: this.markdown.pages,
      html: this.markdown.render()
    };
    const t = this.pages[this.active] || { row: 0, column: 0 }, a = t.column * 20;
    return {
      kind: "workbook",
      tables: this.sizes,
      pages: this.pages,
      active: this.active,
      cells: (this.sheets[this.active] || []).slice(t.row * 25, (t.row + 1) * 25).map((e) => e.slice(a, a + 20))
    };
  }
}
const p = new w();
let l = Promise.resolve();
self.onmessage = (i) => {
  l = l.then(async () => {
    const s = i.data;
    let t;
    try {
      t = { id: s.id, result: await p.handle(s) };
    } catch (a) {
      t = { id: s.id, error: a instanceof Error ? a.message : String(a) };
    }
    self.postMessage(t);
  });
};
export {
  g as C,
  d as R,
  c as p
};
//# sourceMappingURL=preview.worker-D4Xg9bh0.js.map

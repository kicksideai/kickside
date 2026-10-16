import { describe, it, expect } from "vitest"
import css from "../styles.css?raw"
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({
  selectors: m[1].replace(/\/\*[\s\S]*?\*\//g, "").split(",").map((s: string) => s.trim()),
  body: m[2].trim(),
}))

function colorFor(container: string, token: string): string | undefined {
  const sel = `${container} .${token}`
  return rules.find(r => r.selectors.includes(sel))?.body.match(/(?:^|;|\s)color:\s*([^;]+)/)?.[1].trim()
}

const tokens = [
  "hljs-comment", "hljs-keyword", "hljs-string", "hljs-number", "hljs-title",
  "hljs-type", "hljs-attribute", "hljs-built_in", "hljs-meta", "hljs-deletion", "hljs-addition",
]

describe("highlight.js token colors", () => {
  for (const token of tokens) {
    it(`${token} is colored in the code viewer with the same theme token as markdown`, () => {
      const md = colorFor(".md", token)
      expect(md).toMatch(/^var\(--(p|rv)-/)
      expect(colorFor(".codev", token)).toBe(md)
    })
  }
})

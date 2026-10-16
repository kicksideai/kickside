import MarkdownIt from 'markdown-it'
import markdownItKatex, { type MarkdownKatexOptions } from '@vscode/markdown-it-katex'
import type { KatexOptions } from 'katex'
import hljs from 'highlight.js'
import sanitizeHtml, { type IOptions } from 'sanitize-html'
import type Token from 'markdown-it/lib/token.mjs'

function escapeAttr(value: string): string {
  return value.replace(/[^a-z0-9_-]/gi, '')
}

export function createMarkdownParser(): MarkdownIt {
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight(source, language) {
    const lang = escapeAttr((language || '').trim())
    let value = ''
    try {
      if (lang && hljs.getLanguage(lang)) {
        value = hljs.highlight(source, { language: lang, ignoreIllegals: true }).value
      } else {
        value = hljs.highlightAuto(source).value
      }
    } catch {
      value = md.utils.escapeHtml(source)
    }
    const cls = lang ? `hljs language-${lang}` : 'hljs'
    return `<pre class="hljs"><code class="${cls}">${value}</code></pre>`
  },
})

// TeX between $...$ (inline) and $$...$$ (display) is typeset as MathML, which
// browsers draw natively, so no KaTeX stylesheet or fonts enter the bundle. A
// formula that does not parse renders as a visible katex-error with its source.
const mathOptions: MarkdownKatexOptions & KatexOptions = { output: 'mathml', throwOnError: false }
md.use(markdownItKatex, mathOptions)

// A mermaid fence is a diagram: it renders as a placeholder carrying the escaped
// source, which the viewer draws with mermaid after sanitizing.
const fence = md.renderer.rules.fence!
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  if (token.info.trim().split(/\s+/)[0] === 'mermaid') return `<div class="md-mermaid">${md.utils.escapeHtml(token.content)}</div>\n`
  return fence(tokens, idx, options, env, self)
}

// Sheet origins are converter metadata, not reader content. Consume a block
// comment explicitly while keeping raw HTML disabled and code examples intact.
md.block.ruler.before('paragraph', 'sheet_origin', (state, start, _end, silent) => {
  if (state.sCount[start] - state.blkIndent >= 4) return false
  const line = state.src.slice(state.bMarks[start] + state.tShift[start], state.eMarks[start]).trim()
  if (!/^<!-- kickside:sheet header-row=\d+ column-start=\d+ -->$/.test(line)) return false
  if (!silent) state.line = start + 1
  return true
}, { alt: ['paragraph'] })

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  token.attrSet('target', '_blank')
  token.attrSet('rel', 'noopener noreferrer')
  return self.renderToken(tokens, idx, options)
}

return md
}

const md = createMarkdownParser()

const MATHML_TAGS = [
  'math', 'semantics', 'annotation', 'mrow', 'mi', 'mo', 'mn', 'ms', 'mtext', 'mspace',
  'msup', 'msub', 'msubsup', 'mfrac', 'msqrt', 'mroot', 'mover', 'munder', 'munderover',
  'mtable', 'mtr', 'mtd', 'mstyle', 'mpadded', 'mphantom', 'menclose',
]

const sanitizeOptions: IOptions = {
  allowedTags: [
    'a',
    'blockquote',
    'br',
    'code',
    'del',
    'div',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'li',
    'ol',
    'p',
    'pre',
    's',
    'span',
    'strong',
    'table',
    'tbody',
    'td',
    'th',
    'thead',
    'tr',
    'ul',
    ...MATHML_TAGS,
  ],
  allowedAttributes: {
    table: ['aria-label'],
    a: ['href', 'name', 'target', 'rel'],
    div: ['class'],
    p: ['class', 'title'],
    span: ['class', 'title'],
    math: ['xmlns', 'display'],
    annotation: ['encoding'],
    mi: ['mathvariant'],
    mo: ['stretchy', 'fence', 'separator', 'lspace', 'rspace', 'accent', 'minsize', 'maxsize'],
    mover: ['accent'],
    munder: ['accentunder'],
    mspace: ['width'],
    mpadded: ['width', 'height', 'depth', 'lspace', 'voffset'],
    mstyle: ['scriptlevel', 'displaystyle', 'mathcolor'],
    mfrac: ['linethickness'],
    mtable: ['rowspacing', 'columnspacing', 'columnalign', 'rowlines', 'columnlines'],
    mtd: ['columnalign'],
    code: ['class'],
    pre: ['class'],
    td: ['align'],
    th: ['align'],
  },
  allowedClasses: {
    code: ['hljs', 'language-*'],
    div: ['md-mermaid'],
    p: ['katex-block', 'katex-error'],
    pre: ['hljs'],
    span: ['hljs-*', 'katex', 'katex-mathml', 'katex-error'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      target: '_blank',
      rel: 'noopener noreferrer',
    }),
  },
}

export function renderMarkdown(src: string): string {
  if (!src) return ''
  return sanitizeHtml(md.render(src), sanitizeOptions)
}

export function sanitizeMarkdownHtml(html: string): string {
  return sanitizeHtml(html, sanitizeOptions)
}

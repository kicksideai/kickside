// Minimal ambient types for sanitize-html (no @types package installed; the
// module ships no bundled declarations). Types only the surface this module
// uses: the sanitizer call, the IOptions shape passed to it, and the
// simpleTransform helper used in transformTags.
declare module 'sanitize-html' {
  type Transformer = (
    tagName: string,
    attribs: { [attr: string]: string },
  ) => { tagName: string; attribs: { [attr: string]: string } }

  interface IOptions {
    allowedTags?: string[] | false
    allowedAttributes?: { [tag: string]: string[] } | false
    allowedClasses?: { [tag: string]: Array<string> | boolean }
    allowedSchemes?: string[]
    transformTags?: { [tag: string]: string | Transformer }
  }

  interface SanitizeHtml {
    (dirty: string, options?: IOptions): string
    simpleTransform(
      newTagName: string,
      newAttribs: { [attr: string]: string },
      merge?: boolean,
    ): Transformer
  }

  const sanitizeHtml: SanitizeHtml
  export type { IOptions }
  export default sanitizeHtml
}

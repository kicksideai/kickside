# RFC 0001: Registry Documentation Catalog

- **Status:** Accepted
- **Date:** 2026-07-21

## Context

KickSide development documentation was published through the `wiki` field on
`app:definition`. That made pages a package-level map rather than discoverable
registry records. The Hub could only render a flat, path-derived sidebar, and
runtime agents had to use one application-specific reader instead of the
registry's normal typed discovery path.

## Decision

Each published documentation page is a `registry.entry` with
`meta.type: wippy.documentation.page`. The Markdown body is carried by the
entry's `content` data field. The page's stable path, title, document kind, and
status are also entry data.

One `registry.entry` with `meta.type: wippy.documentation.navigation` defines
the Hub sidebar tree. It references pages by their stable registry IDs. The
navigation record controls groups, order, labels, and whether a page is shown
in the sidebar without duplicating page content.

RFCs use `document_kind: rfc` and an explicit lifecycle status. The Hub renders
them in the RFC tree group with an RFC badge.

## Consequences

- Agents can discover pages and read a page directly from registry data:

  ```lua
  registry.find({
    [".kind"] = "registry.entry",
    ["meta.type"] = "wippy.documentation.page",
  })
  ```

- `app:documentation` remains a narrow list/read convenience tool, now backed
  by the page entries rather than `app:definition.wiki`.
- Registry documentation entries are the KickSide documentation source.
- Hub reads registry documentation entries.
- Registry page discovery is structured by ID and type. Full-text search is a
  separate future projection, not an implicit registry query.

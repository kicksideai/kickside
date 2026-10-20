# Changelog

## 0.1.68 (2026-10-20)

- Model discovery reads OpenRouter's embeddings catalog as well, so provider embedding models (OpenAI text-embedding-3) get their context window and can be enabled for knowledge bases.

## 0.1.67 (2026-10-17)

- Refresh packaged module descriptions and documentation.

## 0.1.63 (2026-10-09)

- Build frontend assets with the current published UI Kit stylesheet.

## 0.1.62 (2026-10-08)

- Deliver scope reconcile, OAuth, upload and profile signals under service identities (90ce38da7)
- build: rebuild bundles from source (6c884fef9)
- chore: refresh locks to latest published dependencies (243b4bdff)
- Complete Users management: scoped System tabs, scope catalog and declared memberships (829cb91b7)
- Default module member requirements to platform Members (a05332552)
- Declare module access bundles and invalidate changed group sessions (602c31f9d)
- Preserve sanitized model request options across catalog and editor (9cfb870ae)
- Run native PostgreSQL gates through isolated module targets (3ddb9c541)
- test(models): prove editor bundle revalidation and drawer scroll ownership (b8e0460d7)
- Restore retained trigger consolidation behavior through current modules (03eb36263)
- fix(cluster): scope durable actor ownership and retain standby contenders (1ec81dcb0)

## 0.1.60

Current published Hub version.

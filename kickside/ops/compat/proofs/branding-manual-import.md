# Branding storage transition

Owner 2026-10-14 Section A retires the request-time filesystem importer. Before updating
an existing installation, the operator runs the branding count, import and verification
steps in the single `scratchpad/sol-lanes/decisions/existing-installation-script.md` procedure.
The existing authenticated logo and setting writers preserve the selected image bytes and
store the canonical public URL. The package update performs no data conversion.

Historical filesystem bindings and registry identities remain accepted. Their live reader
and the historical tests that require automatic conversion retire. The database image row,
HTTP logo path, ETag handling and multipart upload contract remain unchanged.

`platform/ui/test/suites/branding_storage_test.lua` verifies the current storage boundary:
missing stored images return 404 without a write, uploaded bytes round-trip, cache validators
work, configured titles persist, and the login branding exposes the stored image URL. The
Section A lane records passing native lint and all 86 UI tests on SQLite and PostgreSQL
with official v0.3.47a. General logo restart and package-update smoke scenarios remain.

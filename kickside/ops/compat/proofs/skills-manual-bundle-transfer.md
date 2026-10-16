# Skills bundle transfer retirement

Owner 2026-10-14 Section A moves the one-time artifact bundle conversion into the
single existing-installation script and retires the read-time converter and tests.
The verified latest Hub package, kickside/skills 0.1.41, contains the two retired
identities: `kickside.skills:bundle_transfer` and
`kickside.skills.security:bundle_transfer_output_publish`.

Before updating, the operator runs the Skills count, source-byte/digest preflight,
copy, durable FILE_TRANSFERRED append, projection catch-up and verification steps
in `scratchpad/sol-lanes/decisions/existing-installation-script.md`. Every historical
manifest then names immutable `skill-bundle/<skill_id>/<sha256>` bytes. Missing or
inconsistent source content blocks the update. No engine migration performs this
conversion, and no request handler writes historical manifests.

The read-file and export owners now read those immutable bytes directly through
the existing bundle store. They are the converter's only source callers and migrate
in the same change. The private service-only output policy loses its only binding
with the converter's removal; it is not a selectable user grant. The FILE_TRANSFERRED
event declaration and projection fold remain for the manual append and historical
replay. Ordinary owned bundles, API paths, skill ids, version records and file bytes
retain their existing shapes. Native owned-bundle and projection tests guard those
current paths on SQLite and Postgres.

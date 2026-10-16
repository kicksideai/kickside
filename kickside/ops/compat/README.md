# Update compatibility

`make compat` runs the gate's unit tests, permanent upgrade integration tests, and
published Hub comparison. It exits nonzero on a breaking finding or any failed
migration. Python dependencies are in `ops/compat/requirements.txt`; Wippy and
Postgres client commands are on `PATH`. The Makefile exports a writable `.compat/tmp` by default. Set `TMPDIR` to a writable run directory to keep evidence and temporary runtimes in an explicit lane.
Postgres defaults to `127.0.0.1:5433`, user/password `kickside`; `PGHOST`, `PGPORT`,
`PGUSER`, and `PGPASSWORD` override those values. The user needs permission to
create scratch databases. Tests drop those databases and remove SQLite files.

```sh
python -m pip install -r ops/compat/requirements.txt
make compat COMPAT_PYTHON=python COMPAT_ARGS='--output ./compat-evidence'
python -m unittest discover -s ops/compat/tests
python -m unittest discover -s ops/compat/integration
```

The gate discovers the delivery inventory in `.github/modules.json`, fetches each
module's latest published Hub archive, verifies its digest, and compares it with
a pack of local sources. Repeat `--repo /path/to/repository` to include sibling
module inventories. `--module kickside/ui` selects a module. Downloads contact
only the configured Hub and its artifact bucket; authentication headers do not
follow cross-origin redirects. Credentials and response bodies are absent from
transport errors. `compat.json` and `compat.md` contain sorted findings, baseline
digests, and both-engine migration results.

For an installed app's dependency graph, pass `--baseline /path/to/wippy.lock`.
Without an explicit module selection, this compares the locally owned modules
that the app lock contains and lists local modules outside that lock. It does
not infer dynamically installed modules or the root app's version from a lock
that omits them. An explicit `--module` absent from the lock fails. Baseline
versions and digests come from that lock, not the latest-module resolution.
Test harness dependencies resolve fresh from the Hub; local sibling modules use
source replacements. A standalone repository uses its root `wippy.yaml` and
`embed` list when it has no delivery inventory.

The comparison covers registry ids/kinds, HTTP endpoint paths/methods, namespace
requirements and their defaults, contract methods and schemas, declared event
schemas, and event/trait discovery metadata. New required properties without
defaults, narrowed types, and removed properties fail recursively. Unknown
schema constraint changes fail conservatively. Defaults in a declaration do not
implement a migration; the product still needs a supported update path.

Every added migration requires its own recipe in `migration-fixtures.json`.
Recipes contain baseline `seed` SQL, `assertions` that preserve representative
records, optional `after` assertions, and any required environment values or
resolved registry configuration. The harness creates the database using only
published migration code and helpers, seeds it, restarts with current helpers,
then applies the added migrations twice on SQLite and Postgres. A recipe can supply `seed_before` SQL to seed a table created by an earlier
added migration immediately before its own step. These records receive the same
final preservation assertions. Repeated updates do not reseed them. Preservation
assertions run after each update. A destructive-migration regression proves
that data deletion fails the gate.

An intentional transition is an exact record in `transitions.json`, with
`module`, `baseline`, `id`, `code`, `path`, `reason`, `owner_approval`, and `proof`.
`proof` names a committed repository test or supported migration. Keep the
stable identities used by callers and migrate every affected data/caller shape
through the normal update. The owner authorizes a transition before its record
lands. There are no wildcard exemptions. Duplicate or stale declarations for
the selected baseline fail; declarations for other baselines remain separate.
`make compat` runs the permanent proofs before evaluating the declarations.

The branding proofs retain extracts from UI 0.1.33 and 0.1.36, with archive
hashes, and exercise the published public branding route before replacing its
sources with the current route/storage. Both engines preserve exact legacy
bytes and expose the new URL. UI stores one image as base64 bytes and content
type in its private `kickside.ui/branding_image` state record in the existing
settings table. New uploads overwrite it. The first legacy read imports either
the module branding directory or the instance's published `branding_fs` binding.
The public `/branding/logo` route shares the configured branding router prefix
and uses an ETag with revalidation. The old filesystem URL maps to this route.

Historical pending migrations also have fixture recipes with `"pending": true`.
The gate creates the published schema immediately before each checkpoint, seeds
its retained data, and applies the current checkpoint on both engines. Journal
migration 05 has such a recipe. Pending updates keep the session table, columns,
indexes and references intact. Its identity stays declared; retiring a model
requires no destructive DDL. The regression test still proves that the published
destructive checkpoint fails after successful baseline creation. Data already
removed by a previously applied published migration needs a backup to recover.

Baseline recipes can declare `baseline_setup` for an external action that does
not create database schema, with a reason and a repository proof. A
`baseline_checkpoint` declares an install pending a retired migration; it
requires that migration to be absent from the current module and reports the
selected database checkpoint. Checkpoints affect only that migration namespace;
other modules keep their full baseline. Exact owner-approved removals remain
checked by the identity gate. These declarations affect baseline creation only:
added migrations remain mandatory and need data-preservation fixtures.

Skills retains its published Uploads dependency. The first access to an
artifact manifest copies its bytes into the bundle and appends a `file.transferred`
event through the normal version write helper. The projection records the digest
for all references to that artifact, including historical and later carried
manifests. Read-only sharing remains read-only; the reader has a private publisher
policy for that storage event. Both artifact-only manifests and published
manifests with a digest are supported. Old exported artifact parts import into
SHA-addressed bundles; new exports transfer any remaining legacy references.
The permanent proof creates files with the published 0.1.38 writer, restarts
with current sources, reads as a shared reader, imports the published export,
removes the old artifact, and verifies repeated and refined reads on both engines.

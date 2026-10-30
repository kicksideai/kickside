# kickside/uploads

Upload storage, artifact processing, previews, and file capabilities.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/uploads
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

For repository validation, use the Wippy release pinned in
[CI](https://github.com/kicksideai/kickside/blob/main/.github/workflows/ci.yml). Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Frontend development also uses Node.js 22, npm, and Make.

## Development

From this module directory:

```sh
make lockrefresh
make lint
make test
(cd test && wippy test --profile postgres --set vars.pg_database=kickside_readme_test)
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.
Edit frontend source under `ui/` and run `make -C ../../ build MOD=uploads` from this directory;
commit regenerated tracked assets with the source.

## Use

Add a file in **Uploads** and inspect its processing state and preview. Installed processors select conversion and derived artifacts. Consumers read through Uploads content interfaces or signed purpose-bound tokens; original bytes, derived artifacts, and metadata remain owned by Uploads.

### Optional storage extensions

Packed paths, stage relocation and `uploads.delivery_url` are available starting
with Uploads 0.3.2. Storage consumers must require that version or newer; a
wildcard dependency can retain an incompatible older installed package.

The default adapter reads relative filesystem paths, `fs://<resource-id>/<path>`
and `s3://<resource-id>/<key>` packed paths. Relative paths use the upload's
`storage_id`; packed paths identify their native resource directly. Existing
filesystem records keep their behavior.

The independently installed `kickside/storage-s3` package adds a universal stage
at the lowest priority (`-100`). After processing, it copies local originals and
derived blobs, verifies object metadata and returns relocation for Uploads to
validate and commit transactionally before removing unreferenced old bytes.
An S3 original retains its path while local derivatives still relocate. Upload,
artifact, attachment and Knowledge IDs remain stable.

Relocation rejects directories and destinations whose size differs from the
original or derived blob. Superseded locations are recorded in the same Uploads
transaction as the new locations. A failed removal or restart retains that
cleanup intent; processing retries and deletion resume it without removing bytes
that still have live references. Internal cleanup does not change public recency.

Storage integrations use the existing `storage_adapter`, `processing_hooks` and
`storage_runtime_policy` requirements. Storage-s3 binds only the runtime policy,
granting exact native-resource access to Uploads' reads and processing. It owns
its Settings policy and endpoints; it does not install by default. Uploads depends
on neither Settings nor a specific storage extension.

Upload get and list responses also supply optional `view_url`, a stable relative app path
(`/uploads/<upload UUID>`). The Uploads page opens the existing preview
drawer directly from this link, including files outside the current list page.
Opening or closing a preview updates the host URL. Reading a linked file uses
the same upload READ permission as the upload endpoint. Missing or inaccessible
files show an unavailable message. If the host navigation entry cannot be read or
has no usable path, the API omits `view_url` and still returns the authorized file
data and delivery URLs.

Authorized original and artifact responses supply `raw_url`: an expiring signed
S3 URL or the authenticated raw endpoint for filesystem content. The existing raw
endpoints also read S3 content. Signed URLs last 15 minutes; reloading a record
issues a new URL after authorization. Browser delivery requires the object host
to allow the application origin for GET/HEAD requests.

The storage catalog owns logical content lookup, and original-backed artifacts
resolve the upload's current location through the canonical upload reader.
Keep native entries, credentials and runtime grants available while packed paths
reference them. Disabling placement affects future processing; uninstalling a
backend does not restore remote bytes.

**BREAKING:** the packed-path storage-s3 implementation does not read or migrate
placements written by storage-s3 0.1.0. Existing placement data is not dropped.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`CountFiles`](src/traits/_index.yaml) | See the operation schema |
| [`ListFiles`](src/traits/_index.yaml) | `limit` |
| [`ViewFiles`](src/traits/_index.yaml) | See the operation schema |
| [`FetchURL`](src/traits/_index.yaml) | See the operation schema |
| [`UploadFile`](src/traits/_index.yaml) | See the operation schema |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.uploads:database_resource`](src/_index.yaml) | Host supplies the value |
| [`kickside.uploads:storage_id`](src/_index.yaml) | Host supplies the value |
| [`kickside.uploads:storage_s3`](src/_index.yaml) | Empty string |
| [`kickside.uploads:storage_adapter`](src/_index.yaml) | Default native filesystem/S3 adapter |
| [`kickside.uploads:processing_hooks`](src/_index.yaml) | No-op hooks |
| [`kickside.uploads:storage_runtime_policy`](src/_index.yaml) | Default storage runtime policy; extension supplies its policy |
| [`kickside.uploads:env_storage`](src/_index.yaml) | Host supplies the value |
| [`kickside.uploads:document_image_artifacts_enabled`](src/_index.yaml) | `true` |
| [`kickside.uploads:archive_max_zip_bytes`](src/_index.yaml) | `2147483648` |
| [`kickside.uploads:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.uploads:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.uploads.security:user_security_scope`](src/security/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/uploads)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

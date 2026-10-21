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

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
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

### Move processed files to private S3

Bind `kickside.uploads:storage_s3` to a native `cloudstorage.s3` resource, backed
by a host-owned `config.aws` credential provider. Keep credentials in the host's
environment storage. S3-compatible endpoints, including MinIO, use the native
resource's `endpoint` field. The local `storage_id` filesystem remains necessary
for processing and temporary downloads.

In **Settings → Files & Uploads → Processed file storage**, select **Move to S3
after processing**, choose the configured destination and a relative folder
prefix, then use **Test storage** and **Save**. Storage administration requires
Settings administrator access. The test uploads, reads, verifies, and deletes a
small private object. It does not make the bucket public.

Newly completed uploads enqueue a separate supervised placement job. It copies
the original and artifact blobs with the native S3 SDK, verifies remote size and
downloaded content, commits their physical locations, and only then removes
local bytes. Transfer failures have their own retry budget; they do not rerun
conversion or OCR. Each placement attempt has a ten-minute execution limit.
Turning the option off affects future processing; it does not move old objects
back or change a destination already captured by a queued job.

Uploads owns the storage controller and its registry overlay. The controller
reconstructs native destination resources after restart from durable destination
records, without adding registry history revisions. Changing the source bucket
or endpoint creates a new destination generation; existing files retain their
previous destination. Keep those buckets and their referenced credential
providers accessible until their files have been deleted. Credential rotation
can update the referenced provider without rewriting file records.

Upload IDs, artifact IDs, deduplication addresses, session attachments, and KB
source references stay stable. Consumers continue using the Uploads content
provider. Remote reads stage into a temporary local file where a processor needs
native seek/read access; closing the handle removes it. Retention also removes
abandoned temporary files and unowned placement objects after a 24-hour grace.

On versioned buckets, ordinary deletion creates delete markers and retains old
versions according to the bucket's lifecycle policy. Configure that lifecycle
for physical reclamation. Object-lock retention can prevent deletion and will
surface as a retryable cleanup failure. This private storage policy does not
publish content to a CDN; publishing can consume the same content contract in
a separate owning module.

The optional native integration suite uses a disposable S3-compatible bucket:

From the repository root, `bash scripts/test-upload-storage-s3.sh` starts a
pinned disposable Docker service, runs upload, session, Knowledge, and restart
checks, and removes that container. The CI `platform/uploads / s3` job runs the
same script. Refresh the Uploads and Knowledge harness locks first.

To use an existing S3 test service instead:

```sh
cd test
bash prepare.sh
wippy test --profile s3 --set vars.s3_endpoint=http://127.0.0.1:18333 \
  --set vars.s3_bucket=ks-upload-storage --set vars.s3_prefix=unique-test-prefix
```

Provide `KICKSIDE_UPLOAD_STORAGE_TEST_ACCESS_KEY` and
`KICKSIDE_UPLOAD_STORAGE_TEST_SECRET_KEY` in the process environment for an
authenticated service. The defaults are demo-only. Use a dedicated bucket or
unique prefix; the suite deletes its test uploads during cleanup.

For a cold-restart check, run the following twice with the same dedicated
database file. The first run leaves a placed file and disables placement; the
second starts a fresh runtime, reads that file through the reconstructed
destination, then cleans it up. The second run can override `vars.s3_bucket`
to an unrelated name to also verify that old files retain their destination.

```sh
wippy test test app.upload_storage:restart_test --profile s3 --profile s3_restart \
  --set vars.sqlite_path=/tmp/uploads-storage-restart.sqlite
```

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
| [`kickside.uploads:env_storage`](src/_index.yaml) | Host supplies the value |
| [`kickside.uploads:document_image_artifacts_enabled`](src/_index.yaml) | `true` |
| [`kickside.uploads:archive_max_zip_bytes`](src/_index.yaml) | `2147483648` |
| [`kickside.uploads:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.uploads:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.uploads.security:user_security_scope`](src/security/_index.yaml) | `kickside.security.groups:members` |

The Settings dependency also needs its host bindings: `kickside.settings:target_db`,
`kickside.settings:api_router`, and `kickside.settings:ui_server`. Hosts that already
install Settings keep their existing explicit bindings. A standalone host or
harness must supply these when installing Uploads.

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/uploads)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

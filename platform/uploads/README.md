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

### Optional storage extensions

The base module keeps processed files in its host filesystem. S3 placement is
provided by the independently installed `kickside/storage-s3` package. That
extension owns its Settings component, policy, endpoints, durable jobs, tables,
and registry overlay controller. It is not installed by default.

Storage extensions bind the generic `storage_adapter`, `processing_hooks`, and
`storage_runtime_policy` requirements through `ns.dependency.parameters`.
The native library interfaces preserve file handles and the caller's active SQL
transaction, as the platform Component lifecycle interface does. Adapters expose
`get(storage_id, db_id, staging_id, legacy_cloud_id, query_db)` and the filesystem
read/write/stat/remove interface. Hooks implement `prepare(output)`,
`completed(tx, dbtype, job, output, trace, prepared)`, and `prune(cutoff, limit)`.
The default hooks have no effects. The default adapter uses native filesystem IO.

`kickside.uploads.binding:storage_catalog` owns SQL for logical content addresses:
`objects(db_id, upload_id)`, `get_upload(id)`, and `contains(db, storage_id, path)`.
An implementation uses this interface instead of querying Uploads' tables.
An optional runtime policy is bound only when its implementing package is installed.
Uploads depends on neither Settings nor a particular storage extension.

Disable placement before uninstalling a backend, and restore its remote content
first. Removing an implementation must not be treated as deleting its files.

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

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/uploads)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

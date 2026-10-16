# Backups and restore

Back up a consistent instance state, including application data, registry history, uploads, configuration, and the stable `ENCRYPTION_KEY`. The instance directory also holds `wippy.lock` and module packs needed to reproduce its deployment.

## SQLite

Stop the runtime before taking a filesystem backup. Copy the instance directory, including `.wippy/app.db`, `.wippy/registry.db`, `.wippy/uploads/`, and `.wippy/.env` when the runtime generates the key there. Include SQLite WAL and shared-memory files if they remain present.

Store backups separately from the instance and protect them as secrets. Registry history preserves configuration changes and installed modules; backing up only `app.db` omits that state.

## PostgreSQL

Stop application writes while taking a coordinated database and upload backup. Use PostgreSQL client tools that support the server’s version. `pg_dump` captures the whole database, including the `wippy_registry` schema:

```sh
pg_dump --format=custom --file=kickside.dump "$KICKSIDE_HISTORY_DSN"
```

Protect the dump, deployment secret configuration, upload files, and instance lock. A PostgreSQL database backup does not include filesystem upload bytes or the encryption key.

## Verify a restore

Restore into an isolated directory and database. Recreate the recorded module graph, restore application data and history together, supply the original encryption key, and restore upload files. Use the same storage profiles and public-address settings appropriate to the isolated instance.

Check login, installed modules, representative records, uploaded-file previews, and workflow state. Confirm the restored instance cannot send production integration traffic while you inspect it. Keep a restore procedure and exercise it on your backup schedule.

See [configuration](configuration.md), [storage](storage.md), and [retention](retention.md).

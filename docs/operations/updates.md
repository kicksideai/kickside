# Updates from the Hub

An established instance runs its locked module graph. Restarting with `wippy run -c` does not resolve new releases.

Administrators update modules through **System → Modules**. Inspect the Hub plan, dependency changes, resource bindings, and migrations before applying it. Module-specific guidance can require a compatibility range such as `>=`; the current deployment lock records the resolved artifacts.

For a source deployment, the application Makefile exposes `make refresh-deps`. It updates dependency resolution, then installs the result. Use the app’s preboot checks and build before starting the updated source deployment.

Back up application data, registry history, uploads, the encryption key, and deployment configuration before an update. Validate the proposed module set on an isolated instance with the same storage engine. Verify login, module surfaces, and the workflows that depend on the updated packages.

Registry history records installed-module changesets and replays them on startup. Edit deployment dependencies through the supported installer or CLI; use the lock as generated deployment state.

See [module administration](https://github.com/kicksideai/docs/blob/main/using/modules.md), [backups](backups.md), and the developer [publishing reference](../kickside-development/15-publishing.md).

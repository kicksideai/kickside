# Module lifecycle end-to-end gate

This harness boots an isolated KickSide instance and drives the same authenticated
Keeper APIs used by **System → Modules**. It does not add KickSide fixtures or
assumptions to the Wippy runtime repository.

Coverage:

- fresh install from the committed application lock;
- cold boot, login, and catalog module-type checks;
- install preview with a zero-mutation assertion;
- a real cross-dependency graph (`kickside/kb10` → `kickside/knowledge`);
- duplicate-install idempotency and lock/registry duplicate detection;
- transitive-to-root promotion and required-by uninstall blocking;
- restart persistence;
- migration-aware uninstall and exact baseline recovery;
- old-version install, update, governance undo/redo, module rollback/redo;
- failed-update atomicity, uninstall preview, delete, and final restart.

Run against a locally built runtime candidate:

```bash
WIPPY_BIN=/path/to/runtime/dist/wippy-linux-amd64 \
  tests/module-lifecycle/run.sh \
  --artifacts /tmp/kickside-module-lifecycle-proof
```

The CLI must already be authenticated to the Wippy Hub. For private catalog
access, export `KICKSIDE_E2E_HUB_TOKEN`; the harness sends it to the isolated
app's Hub-auth endpoint but never writes it to the report or logs.

The release gate reads application-owned install parameters from the live
`kickside.hub:onboarding_profile` entries. Reusable packages must expose host
requirements without choosing application resources; the app's profiles bind
those requirements for one-click installation. Blocks is already an application
root. The Workflows version scenario therefore installs only the profile's
explicit Code Execution root before exercising the version lifecycle; dependency
resolution still verifies the complete graph, while the harness does not invent
host bindings for a transitive edge. During diagnosis,
`--scenario cross|version` can isolate one half of the matrix and
`--parameter name=value` can override a declared value for an older published
package. The report records parameter names but never their values; an
overridden run is diagnostic evidence, not a passing release gate.

To exercise the published single-assembly path after publishing a release
candidate:

```bash
tests/module-lifecycle/run.sh \
  --mode published \
  --published-app kickside/kickside \
  --artifacts /tmp/kickside-published-lifecycle-proof
```

The source mode copies only `app/` to a temporary directory. Both modes use a
fresh SQLite database, generated bootstrap credentials, a free local port, and
their own runtime state. The work directory is deleted on completion unless
`--keep-workdir` is supplied. `report.json`, snapshots, command output, and the
runtime log remain in the artifact directory.

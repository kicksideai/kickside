# kickside/hub

Module discovery, install plans, requirements, and lifecycle management.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/hub
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

Wippy 0.3.x; repository validation uses the latest stable Wippy release. Use current Hub dependencies
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
Edit frontend source under `ui/` and run `make -C ../../ build MOD=hub` from this directory;
commit regenerated tracked assets with the source.

## Use

Use **System → Modules** to inspect packages, dependencies, and host requirements. Choose **Scan updates**, then **Update all** to plan the available updates together. If any module lacks required settings, the batch is not applied and the affected rows show which settings need attention. Open that module’s update dialog to configure its requirements. When the combined plan is applicable, Update all submits its returned bindings and dependencies in one install request. Planning does not reserve the registry: Keeper validates again when applying, and migration or bootloader errors can still occur after registry changes commit. Refresh module and migration status after an interrupted request before retrying. The owning modules ship data migrations; installation-specific data conversion is not part of the update procedure.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`InspectModuleArtifact`](src/instruments/_index.yaml) | `limit`, `cursor` |
| [`InspectRegistryCandidates`](src/instruments/_index.yaml) | See the operation schema |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.hub:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.hub:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.hub.instruments:admin_security_scope`](src/instruments/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/hub)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

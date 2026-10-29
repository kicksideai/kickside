# kickside/security

Administration of application roles, scopes, and policies.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/security
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

For repository validation, use the Wippy release pinned in
[CI](../../.github/workflows/ci.yml). Use current Hub dependencies
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
Edit frontend source under `ui/` and run `make -C ../../ build MOD=security` from this directory;
commit regenerated tracked assets with the source.

## Use

Compose module policies in **System → Security → Roles**, then assign the resulting roles in **System → Users**. Denies take precedence over allows. Module access and Component ACLs are separate checks. **Act-as grants** permits selecting an execution principal; it grants no access to that principal’s resources.

New accounts receive **Member**, which provides standard access to installed
applications. To give someone less access, create a **New role**, add only the
permissions they need, and assign that role **instead of Member** in Users.
Permissions from other assigned roles still apply. **Add permissions** on a
default role affects everyone assigned that role and cannot remove its original
permissions.

The picker lists permissions published by installed modules. A module permission
may cover several pages and APIs; it is not a per-page visibility switch. Access to
an individual component also depends on that component’s sharing rules.

## Reference

- [Module reference](src/README.md)

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.security:delegation_validator`](src/_index.yaml) | Empty string |
| [`kickside.security:sessions_invalidator`](src/_index.yaml) | Empty string |
| [`kickside.security:delegation_fencer`](src/_index.yaml) | `kickside.users.persist:delegation_fencer` |
| [`kickside.security:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.security:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.security:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.security:process_host`](src/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/security)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

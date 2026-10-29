# kickside/users

Authentication, user and group persistence, profiles, and administration.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/users
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
Edit frontend source under `ui/` and run `make -C ../../ build MOD=users` from this directory;
commit regenerated tracked assets with the source.

## Use

**System → Users** manages accounts and role assignments. KickSide’s default roles are Administrator and Member. Signed-in application access is applied during authentication; it is not stored as a separate User role. Users management is a separate policy from directory discovery and the signed-in user’s profile. Bots are ordinary User principals classified as bots; they cannot authenticate or own credentials. Configure their group access and grant an operator selection authority separately.

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.users:user_provisioning`](src/_index.yaml) | `get_user`, `create_passwordless_user`, `assign_group`, `complete_passwordless_user`, `apply_sourced_groups`, `mint_session` |
| [`kickside.users.profile:profile`](src/profile/_index.yaml) | `get`, `set`, `unset`, `list`, `get_namespace` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.users:bot_account_consumers`](src/_index.yaml) | `[]` |
| [`kickside.users:baseline_security_scope`](src/_index.yaml) | Empty string |
| [`kickside.users:env_storage`](src/_index.yaml) | `kickside.users.env:envs` |
| [`kickside.users:public_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.users:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.users:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.users:user_security_scope`](src/_index.yaml) | `kickside.security.groups:members` |
| [`kickside.users:admin_security_scope`](src/_index.yaml) | Host supplies the value |
| [`kickside.users:login_role_resource`](src/_index.yaml) | Host supplies the value |
| [`kickside.users:ui_server`](src/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/users)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

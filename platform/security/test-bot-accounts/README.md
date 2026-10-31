# Authenticated delegation HTTP harness

This application mounts the production Security APIs behind `token_auth` and
`endpoint_firewall`. Each caller signs in through the Users password endpoint.
Fixture setup uses a separate test-runtime policy that no login group contains.
Narrow groups distinguish endpoint administration, native policy writing, Users
management and Component ADMIN. The root-admin fixture declares the production
`app.security:admin.all_access` policy. Saving calls the production Security
handler and Component's owner-bound existence check; no host validator is wired.

Security uses a separate database from Users and Component by default. The
`shared-db` profile supplies the co-located control. For PostgreSQL, create two
owned databases and set `pg_database` and `pg_security_database`; drop both after
the run. SQLite accepts `sqlite_path` and `security_sqlite_path`.

`make lockrefresh` resolves the latest Hub dependencies with local sibling
replacements. `make test WIPPY_TEST_ARGS='test delegation_http_test'` runs the
HTTP matrix; add the Postgres profile and an owned scratch database for that
engine. The smoke scenario `bot_accounts_delegation_http` provides fresh
resolution, engine setup, evidence and database cleanup.

The existing Security CI jobs run this HTTP matrix under both database layouts.
Component's own native authority tests verify that a direct private-reader call
cannot obtain its database grant and that a caller's denied owner dispatch stays
denied.

RA-H06/07/26/31/45/50/51 cover admission, native policy evaluation, authenticated
provenance, list privacy, retained revocation and live account-read
failure. The admin-group bot fixture holds a valid
stored password and cannot log in. This harness does not qualify native bearer
admission, actual UI actions or supported installation-profile upgrades.

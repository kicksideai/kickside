# Authenticated delegation HTTP harness

This application mounts the production Security APIs behind `token_auth` and
`endpoint_firewall`. Each caller signs in through the Users password endpoint.
Fixture setup uses a separate test-runtime policy that no login group contains.
Narrow groups distinguish endpoint administration, native policy writing, Users
management and Component ADMIN. The root-admin fixture declares the production
`app.security:admin.all_access` policy. The host validator source and declarations
link directly to the application implementation.

`make lockrefresh` resolves the latest Hub dependencies with local sibling
replacements. `make test WIPPY_TEST_ARGS='test delegation_http_test'` runs the
HTTP matrix; add the Postgres profile and an owned scratch database for that
engine. The smoke scenario `bot_accounts_delegation_http` provides fresh
resolution, engine setup, evidence and database cleanup.

RA-H06/07/26/31/45/50/51 cover admission, native policy evaluation, authenticated
provenance, list privacy, retained revocation and live account-read
failure. The admin-group bot fixture holds a valid
stored password and cannot log in. This harness does not qualify native bearer
admission, actual UI actions or supported installation-profile upgrades.

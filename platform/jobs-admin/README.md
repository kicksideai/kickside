# Jobs administration

The `kickside/jobs-admin` plugin contributes **Jobs performance** to Settings
through a `kickside.settings:block` declaration. Generic Settings owns only its
catalog and mount. Core Jobs owns policy validation, persistence, execution
snapshots and pool application; this plugin calls the public Jobs facade and
owns no SQL resources or migrations.

Bind `kickside.jobs_admin:api_router` to an authenticated router with endpoint
firewall enforcement, and `kickside.jobs_admin:ui_server` to the host HTTP
service. The API is `GET`/`PUT /jobs/policy` under that router's prefix. The
self-hosted component is `<kickside-jobs-admin>`. Grant
`kickside.jobs_admin.security:admin_access` to administrators; module discovery
alone grants neither policy endpoints nor policy writes.

Policy edits retain shipped defaults unless explicitly overridden. Running jobs
keep the policy captured when claimed. Saves distinguish committed changes from
pool application, and show the applied revision and failures. Realtime events
invalidate status; there is no browser polling loop.

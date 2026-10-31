# Jobs administration

The `kickside/jobs-admin` plugin contributes **System → Jobs** through a
`ui.settings_tab` declaration. The host discovers the tab and checks the declared
Jobs endpoint permission before showing it. Core Jobs owns policy validation, persistence, execution
snapshots and pool application; this plugin calls the public Jobs facade and
owns no SQL resources or migrations.

Bind `kickside.jobs_admin:api_router` to an authenticated router with endpoint
firewall enforcement, and `kickside.jobs_admin:ui_server` to the host HTTP
service. The API is `GET`/`PUT /jobs/policy` under that router's prefix. The
self-hosted component is `<kickside-jobs-admin>`. Grant
`kickside.jobs_admin.security:admin_access` to administrators; module discovery
alone grants neither policy endpoints nor policy writes.

For a Jobs-only administrator, compose a Security scope containing the
`kickside.jobs_admin.security:admin_access` policy and assign that scope to the
user alongside ordinary membership. The policy catalog supplies grants; the
Users editor assigns scopes, so the policy ID itself is not a user group.

A host that exposes System navigation can bind
`kickside.jobs_admin:admin_navigation_policy` to its own navigation/discovery
policy. KickSide binds `kickside.ui.security:system_tabs_access`, which permits
tab discovery while each tab still checks its own endpoint permission. API-only
hosts can leave this optional requirement at its empty default.

Policy edits retain shipped defaults unless explicitly overridden. Running jobs
keep the policy captured when claimed. Saves distinguish committed changes from
pool application, and show the applied revision and failures. Realtime events
invalidate status; there is no browser polling loop.

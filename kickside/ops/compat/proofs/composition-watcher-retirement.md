# Composition watcher retirement

Owner approval: `2026-10-15 owner: remove composition watcher service, cache rebuilt on demand`.

The resident `kickside.automation.engine:composition_watcher` process, its
service, trust policy and `process_host` requirement are retired in Automation
0.1.128. The type-to-action composition is a module-level cache that
`type_action_view` rebuilds when the registry version differs from the cached
version. No data or caller shape changes. Applications that supplied
`kickside.automation.engine:process_host` drop that parameter.

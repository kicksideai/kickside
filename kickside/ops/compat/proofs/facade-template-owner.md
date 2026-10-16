Facade template permission ownership

Owner approval: 2026-10-14 owner: rectify design slop, remove bad and dead code.

Local lane: lane/slop-uploads-ui-users. Local landing replaces the GitHub PR procedure.

The verified kickside/kickside 0.2.12 Hub pack contains app.security:facade.template_runtime and app.security:facade_template_runtime_policy. The policy grants template.get on wippy.facade:templates; the requirement attaches it to wippy.facade:index_handler. The repository has no other caller of either identity.

The resolved wippy/facade 0.6.44 index_handler already declares wippy.facade:config_read_runtime. That policy grants template.get on wippy.facade:* and remains declared by the facade. Removing the two duplicate application entries preserves template access and changes no stored data or endpoint.

Guards: ops/smoke/tests/test_app_facade_resolution.py checks application ownership; platform/ui/test/suites/facade_resolver_test.lua evaluates the upstream shell template permission. Scenario slop_app_facade_dependency guards DESIGN-APP-FACADE-OWNER.

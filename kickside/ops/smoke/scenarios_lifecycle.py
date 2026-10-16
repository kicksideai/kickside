"""Permanent coverage for module mutation and mounted user surfaces."""
from harness import Scenario
from module_lifecycle_contract import module_uninstall, module_update
from gap_ui_contract import reconfigure_sync, session_freshness, session_recent_time


def http(module, *routes):
    return tuple(module + '|http|' + route for route in routes)


SYNC = ('kickside/sync|automation|kickside.sync:sync', 'kickside/sync|workspace_kind|kickside.sync:sync')
LIFECYCLE = SYNC + http('kickside/automation', 'GET /api/v1/automations/types', 'POST /api/v1/automations',
    'GET /api/v1/automations', 'GET /api/v1/automations/{id}/config') + http('kickside/inbox', 'GET /api/v1/inbox') + \
    http('kickside/webhooks', 'POST /api/v1/webhooks', 'POST /api/public/hooks/{id}')
REGISTRY = [
    Scenario('hub_module_uninstall_live', 'full', module_uninstall, ('first_agent',), features=LIFECYCLE +
        http('chestor/workspace', 'GET /api/v1/workspace/entries/types'), instance_setup=True),
    Scenario('hub_module_update_preserves_data', 'full', module_update, ('first_agent',), issues=('U04-closed', 'KEEPER-U01'), features=LIFECYCLE, instance_setup=True),
    Scenario('automation_reconfigure_ui', 'full', reconfigure_sync, ('first_agent',), issues=('T18',), features=LIFECYCLE +
        http('kickside/automation', 'PUT /api/v1/automations/{id}', 'PATCH /api/v1/automations/{id}',
            'DELETE /api/v1/automations/{id}'), instance_setup=True),
    Scenario('sessions_postgres_relative_time', 'full', session_recent_time, ('first_agent',),
        issues=('SESSION-POSTGRES-TIMESTAMP-OFFSET',), features=
        ('kickside/sessions|navigation|kickside.sessions:nav_item',), instance_setup=True),
    Scenario('sessions_mounted_freshness', 'full', session_freshness, ('first_agent',),
        issues=('SESSION-EXTERNAL-MUTATION-NOTIFICATION',), features=
        ('kickside/sessions|navigation|kickside.sessions:nav_item',), instance_setup=True),
]

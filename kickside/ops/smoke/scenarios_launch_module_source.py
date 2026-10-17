"""Installed module provenance is available to the Hub surface."""
from copy import deepcopy

from harness import Scenario, require
from module_lifecycle_contract import update_source
from runtime_fixtures import isolated_fixture


HUB_COMPONENT = 'chestor/workspace'
REPLACEMENT_COMPONENT = 'kickside/hub'


def installed_module_source(ctx):
    replacement = ctx.inst.config['replace'].get(REPLACEMENT_COMPONENT)
    require(replacement, 'Installed module provenance guard requires the local Hub source replacement')

    # Begin with a resolved Hub module, then apply a real workspace replacement
    # for a second root. The dependency endpoint must expose distinct, explicit
    # sources for both roots; the UI must not infer either one from registry state.
    config = deepcopy(ctx.inst.config)
    config['replace'] = {name: path for name, path in config['replace'].items()
                         if name not in (HUB_COMPONENT, REPLACEMENT_COMPONENT)}
    with isolated_fixture(ctx, config=config) as fixture:
        inst = fixture.inst
        inst.install(HUB_COMPONENT)
        before = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=0',
                              label='module-source-hub-root')
        hub_row = next((row for row in before['dependencies']
                        if row.get('component') == HUB_COMPONENT), None)

        update_source(fixture, replacement, REPLACEMENT_COMPONENT)
        after = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=0',
                             label='module-source-replacement-root')
        replacement_row = next((row for row in after['dependencies']
                                if row.get('component') == REPLACEMENT_COMPONENT), None)
        evidence = {
            'hub_component': HUB_COMPONENT,
            'hub_source': hub_row.get('source') if hub_row else None,
            'replacement_component': REPLACEMENT_COMPONENT,
            'replacement_source': replacement_row.get('source') if replacement_row else None,
        }
        inst.evidence.save('installed-module-source', evidence)

        require(hub_row is not None and replacement_row is not None,
                'Provenance guard does not retain both resolved dependency roots: ' + str(evidence))
        require(hub_row.get('source') == 'hub',
                'Hub-installed module has no explicit Hub source: ' + str(evidence))
        require(replacement_row.get('source') == 'replacement-tree-v1',
                'Workspace replacement has no explicit replacement source: ' + str(evidence))
        require(hub_row.get('source') != replacement_row.get('source'),
                'Hub and workspace replacement sources are indistinguishable: ' + str(evidence))


REGISTRY = [Scenario('launch_installed_module_source', 'regression', installed_module_source,
                     ('boot',), instance_setup=True,
                     issues=('LAUNCH-INSTALLED-MODULE-SOURCE', 'SMOKE-PROVENANCE-FIXTURE-REPLACEMENTS'))]

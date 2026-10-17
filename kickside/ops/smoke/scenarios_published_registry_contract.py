"""Every local module preserves its latest published registry contracts."""
import json
from pathlib import Path
import sys
import tempfile

from harness import Scenario, require


def product_repositories(replacements):
    """Return declared delivery repositories and standalone product modules."""
    from ops.compat.inventory import declared_module_identity, enclosing_delivery_root, module_identity

    repositories = set()
    for identity, value in replacements.items():
        source = Path(value).resolve()
        repository = enclosing_delivery_root(source)
        if repository is None:
            if module_identity(source) == identity:
                repositories.add(source)
        elif (repository / '.github/modules.json').is_file() and \
                declared_module_identity(repository, source) == identity:
            repositories.add(repository)
    return sorted(repositories)


def published_registry_contract(ctx):
    root = Path(__file__).resolve().parents[2]
    sys.path.insert(0, str(root))
    from ops.compat.compare import apply_transitions, compare
    from ops.compat.fetch_baselines import Hub
    from ops.compat.inventory import discover, local_entries

    repositories = product_repositories(ctx.inst.config['replace'])
    require(repositories, 'Published registry guard requires declared product module sources')
    modules = discover(sorted(repositories))
    scratch = ctx.inst.root / 'temp/published-registry-contract'
    scratch.mkdir(parents=True, exist_ok=True)
    findings, baselines = [], {}
    with tempfile.TemporaryDirectory(dir=scratch) as directory:
        work = Path(directory)
        hub = Hub()
        for identity, module in modules.items():
            target = work / identity
            target.mkdir(parents=True)
            current = local_entries(module, target / 'current')
            published = hub.baseline(identity, target, released=module['released'])
            baselines[identity] = {key: published[key] for key in ('version', 'sha256')}
            findings.extend(compare(identity, published['version'], published['entries'], current))
    declarations = json.loads((root / 'ops/compat/transitions.json').read_text())
    findings = apply_transitions(findings, declarations, root, baselines=baselines)
    ctx.inst.evidence.save('published-registry-contract', {'baselines': baselines, 'findings': findings})
    breaking = [row for row in findings if row['status'] == 'breaking']
    require(not breaking, 'Modules change published registry contracts: ' + str(breaking))


REGISTRY = [Scenario('published_registry_contract', 'regression', published_registry_contract,
                     issues=('CRM-PUBLISHED-REGISTRY-CONTRACT', 'MODULE-PUBLISHED-REGISTRY-IDENTITY',
                             'SMOKE-PUBLISHED-OWNER-TRANSITION', 'REQUIREMENT-DEFAULT-REMOVAL-COMPATIBILITY'))]

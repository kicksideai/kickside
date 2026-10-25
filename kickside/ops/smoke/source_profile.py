"""Select declared local source inputs from a prepared source cohort."""
from pathlib import Path

import yaml


CHECKOUT_IDENTITIES = {
    'docs': ('building-modules/index.md', 'reference/documentation-catalog.md'),
    'docs-site': ('mkdocs.yml', 'scripts/sync_sources.py', 'tests/test_workflows.py'),
}


def requirements(scenarios):
    """Return public modules and non-module checkouts explicitly declared by a selection."""
    return (sorted({component for scenario in scenarios for component in scenario.source_components}),
            sorted({root for scenario in scenarios for root in scenario.source_checkout_roots}))


def _identity(root):
    manifest = root / 'wippy.yaml'
    if not manifest.is_file():
        return None
    document = yaml.safe_load(manifest.read_text()) or {}
    organization, module = document.get('organization'), document.get('module')
    return organization + '/' + module if isinstance(organization, str) and isinstance(module, str) else None


def _cohort_components(source, components):
    """Index only direct sibling module checkouts, never private test fixtures."""
    roots, duplicates = {}, {}
    for candidate in source.parent.iterdir():
        if not candidate.is_dir() or not (component := _identity(candidate)):
            continue
        if component not in components:
            continue
        candidate = candidate.resolve()
        if component in roots:
            duplicates.setdefault(component, [roots[component]]).append(candidate)
        else:
            roots[component] = candidate
    if duplicates:
        details = ', '.join(component + ': ' + ', '.join(map(str, paths))
                            for component, paths in sorted(duplicates.items()))
        raise ValueError('Source cohort has duplicate module identities: ' + details)
    return roots


def _checkout_identity(name, path):
    markers = CHECKOUT_IDENTITIES.get(name)
    if markers:
        return all((path / marker).is_file() for marker in markers)
    return (path / '.kickside-module.json').is_file()


def build(source, replacements, scenarios):
    """Build a selected-source profile while keeping public and fixture inputs distinct."""
    source = Path(source).resolve()
    components, checkout_names = requirements(scenarios)
    selected = dict(replacements)
    missing_discovery = [component for component in components if not selected.get(component)]
    siblings = _cohort_components(source, missing_discovery) if missing_discovery else {}
    for component in components:
        selected.setdefault(component, str(siblings.get(component, '')))
    missing, mismatched = [], []
    for component in components:
        path = Path(selected.get(component, ''))
        if not selected.get(component) or not path.is_dir():
            missing.append(component)
        elif _identity(path) != component:
            mismatched.append(component + ' (declares ' + str(_identity(path)) + ')')
    checkouts = {name: str((source.parent / name).resolve()) for name in checkout_names}
    missing_checkouts = [name for name, path in checkouts.items()
                         if not _checkout_identity(name, Path(path))]
    messages = []
    if missing:
        messages.append('Source profile lacks selected module checkouts: ' + ', '.join(missing))
    if mismatched:
        messages.append('Source profile module identities do not match their replacement keys: ' + ', '.join(mismatched))
    if missing_checkouts:
        messages.append('Source profile lacks declared checkout identities: ' + ', '.join(missing_checkouts))
    if messages:
        raise ValueError('; '.join(messages))
    return {'replacements': selected, 'checkouts': checkouts}

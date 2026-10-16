"""Upgrade a published scratch install to candidate source with its data intact."""
from pathlib import Path

import yaml

from browser import Browser
from harness import require


def candidate_dependency_sources(replacements, roots, *, application=None):
    replacements = dict(replacements)
    if application is not None:
        application = Path(application)
        manifest = yaml.safe_load((application / 'wippy.yaml').read_text())
        require(manifest.get('type') == 'application', 'Candidate application manifest has no application type')
        identity = manifest['organization'] + '/' + manifest['module']
        replacements.setdefault(identity, str(application))
    missing = set(roots) - replacements.keys()
    if missing:
        raise ValueError('Missing candidate sources: ' + ', '.join(sorted(missing)))
    selected, pending = {}, list(roots)
    while pending:
        module = pending.pop()
        if module in selected or module not in replacements:
            continue
        selected[module] = replacements[module]
        directory = Path(replacements[module])
        manifest = yaml.safe_load((directory / 'wippy.yaml').read_text())
        source = directory / manifest.get('directories', {}).get('src', 'src')
        require(source.is_dir(), 'Candidate module has no source directory: ' + module)
        for index in source.rglob('*.yaml'):
            document = yaml.safe_load(index.read_text()) or {}
            for entry in document.get('entries', []):
                if entry['kind'] == 'ns.dependency':
                    pending.append(entry['component'])
    return dict(sorted(selected.items()))


def upgrade_application(ctx, source, replacements):
    inst = ctx.inst
    require(source and replacements, 'Upgrade fixture requires candidate app and module sources')
    dependencies = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=1')['dependencies']
    inst.evidence.save('upgrade-published-dependencies', dependencies)
    with Browser.paused(inst, [ctx], lambda context, action: action(context)):
        inst.config.update(source=source, published=None, replace=dict(replacements))
        inst.prepare_source(dependencies=dependencies)
    inst.manifest()

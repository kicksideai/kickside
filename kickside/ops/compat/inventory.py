"""Discover owned modules from repository delivery inventories."""
import json
import os
from pathlib import Path
import sys
import yaml

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '.github/scripts'))
from release_content import build_pack, content_digest


def source_roots():
    """Return the authoritative current-module roots for compatibility proofs.

    The private suite supplies harnesses and compatibility recipes, while a
    source run supplies product modules one-by-one through ``--replace``.
    Never rediscover product modules from the private suite in that case: its
    platform/core placeholders deliberately are not a checkout of product
    sources.
    """
    configured = [Path(value).resolve()
                  for value in os.environ.get('COMPAT_MODULE_ROOTS', '').split(os.pathsep)
                  if value]
    return configured or [ROOT, ROOT.parent / 'components']


def module_identity(directory):
    """Read a module identity from its manifest."""
    manifest_path = Path(directory) / 'wippy.yaml'
    manifest = yaml.safe_load(manifest_path.read_text()) or {}
    organization = manifest.get('organization')
    module = manifest.get('module')
    if not isinstance(organization, str) or not organization or not isinstance(module, str) or not module:
        raise ValueError(f'{manifest_path}: missing module identity')
    return organization + '/' + module


def enclosing_delivery_root(directory):
    """Return the nearest parent delivery root for a module directory."""
    for parent in Path(directory).resolve().parents:
        if (parent / '.github' / 'modules.json').is_file() or (parent / 'wippy.yaml').is_file():
            return parent
    return None


def declared_module_identity(root, directory):
    """Return a declared module identity, or ``None`` for an undeclared path."""
    root = Path(root).resolve()
    directory = Path(directory).resolve()
    plan = root / '.github' / 'modules.json'
    if not plan.is_file():
        return None
    declared = json.loads(plan.read_text()).get('modules')
    if not isinstance(declared, dict):
        raise ValueError(f'{plan}: missing modules')
    for relative, info in declared.items():
        if not isinstance(relative, str) or not isinstance(info, dict):
            raise ValueError(f'{plan}: invalid module declaration')
        path = info.get('path', relative)
        if not isinstance(path, str) or not path:
            raise ValueError(f'{plan}: invalid module path')
        if (root / path).resolve() == directory:
            return module_identity(directory)
    return None


def discover(roots):
    modules = {}
    for root in roots:
        plan = root / '.github/modules.json'
        releases = root / '.release-please-manifest.json'
        released_versions = json.loads(releases.read_text()) if releases.is_file() else {}
        if plan.is_file():
            declared = json.loads(plan.read_text())['modules']
        elif (root / 'wippy.yaml').is_file():
            manifest = yaml.safe_load((root / 'wippy.yaml').read_text())
            declared = {'.': {'embed': manifest.get('embed', [])}}
        else:
            raise ValueError(f'{root}: missing delivery inventory or module manifest')
        for relative, info in declared.items():
            directory = root / relative
            identity = module_identity(directory)
            if identity in modules:
                raise ValueError(f'duplicate local module {identity}')
            modules[identity] = {'root': root, 'directory': directory, 'embed': info['embed'],
                'released': released_versions.get(relative) != '0.0.0'}
    return dict(sorted(modules.items()))


def local_entries(module, work):
    from ops.compat.fetch_baselines import read_pack
    path = build_pack(module['directory'], work, '0.0.0', module['embed'])
    content_digest(path)
    return read_pack(path)

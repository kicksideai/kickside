"""Fault-injection entries load their owning production Lua source."""
from pathlib import Path

import yaml

from harness import Scenario, require


SOURCES = {
    'kickside/component': {
        'access_subject_native_source.lua': 'persist/access_subjects.lua',
        'context_storage_native_source.lua': 'persist/context_ops.lua',
        'declaration_serial_native_source.lua': 'persist/declaration_ops.lua',
        'identity_prepare_native_source.lua': 'persist/context_ops.lua',
        'identity_read_cleanup_source.lua': 'identity_access.lua',
        'identity_replay_native_source.lua': 'persist/context_ops.lua',
        'metadata_retry_source.lua': 'meta_service.lua',
        'metadata_tx_command.lua': 'command.lua',
        'metadata_tx_source.lua': 'meta_service.lua',
        'notification_access_source.lua': 'meta_service.lua',
        'placement_retry_source.lua': 'binding/set_placement_func.lua',
        'placement_tx_source.lua': 'binding/set_placement_func.lua',
        'reader_native_source.lua': 'persist/component_reader.lua',
        'update_retry_source.lua': 'binding/update_component_func.lua',
        'update_tx_source.lua': 'binding/update_component_func.lua',
    },
    'kickside/jobs': {
        'cancellation_native_source.lua': 'persist/lifecycle_cancel.lua',
        'enqueue_native_source.lua': 'persist/lifecycle_enqueue.lua',
        'lease_status_native_source.lua': 'persist/lease_status.lua',
        'retention_native_source.lua': 'persist/retention.lua',
        'row_bytes_native_source.lua': 'persist/row_bytes.lua',
        'row_mutations_native_source.lua': 'persist/row_mutations.lua',
        'slot_purge_native_source.lua': 'persist/slot_purge.lua',
        'thread_cleanup_native_source.lua': 'persist/thread_teardown.lua',
    },
}


def canonical_sources(ctx):
    checked = []
    findings = []
    for component, sources in SOURCES.items():
        module = Path(ctx.inst.config['replace'][component]).resolve()
        registered = set()
        for declaration in (module / 'test/src').rglob('_index.yaml'):
            for entry in yaml.safe_load(declaration.read_text()).get('entries', []):
                source = entry.get('source', '')
                if source.startswith('file://'):
                    registered.add(declaration.parent / source.removeprefix('file://'))
        for fixture, production in sources.items():
            path = module / 'test/src' / fixture
            canonical = module / 'src' / production
            checked.append({'component': component, 'fixture': fixture, 'production': production})
            if not path.is_symlink() or path.resolve() != canonical.resolve() or not canonical.is_file():
                findings.append(f'{component}/{fixture}: must link to src/{production}')
            if path not in registered:
                findings.append(f'{component}/{fixture}: registry source is absent')
    ctx.inst.evidence.save('harness-canonical-sources', {'checked': checked, 'findings': findings})
    require(not findings, '\n'.join(findings))


REGISTRY = [Scenario('regression_harness_canonical_sources', 'regression', canonical_sources,
                     issues=('HARNESS-CANONICAL-PRODUCTION-SOURCES',))]

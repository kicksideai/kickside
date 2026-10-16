"""Security HTTP failures keep published strings/statuses and native metadata."""
import uuid

from harness import Scenario, require
from module_harness import run_focused_module_test


def security_http_errors(ctx):
    inst = ctx.inst
    slug = 'native_http_' + uuid.uuid4().hex
    cases = (
        ('slug', '', 'slug is required'),
        ('label', 42, 'label must be a string'),
        ('description', False, 'description must be a string'),
        ('target', [], 'target must be a string'),
        ('internal', 'false', 'internal must be a boolean'),
        ('enabled', 1, 'enabled must be a boolean'),
        ('policies', 'not-an-array', 'policies must be an array'),
        ('policies', [''], 'policies must be non-empty strings'),
    )
    for field, value, message in cases:
        result = inst.request('POST', '/api/v1/security/scopes', {'slug': slug, field: value},
                              expect=(400,), label='native-security-http-' + field)
        require(result.get('success') is False and result.get('error') == message,
                'Security validation changes its published failure string or status')
        require(result.get('kind') == 'Invalid' and result.get('retryable') is False,
                'Security validation loses native kind/retryability: ' + field)
        require((result.get('details') or {}) == {'code': 'security_request_invalid', 'field': field},
                'Security validation loses native field details: ' + field)
    malformed = inst.request('POST', '/api/v1/security/scopes', raw=b'{',
                             headers={'Content-Type': 'application/json'}, expect=(400,),
                             label='native-security-http-json')
    require(malformed.get('success') is False and malformed.get('error') == 'invalid json',
            'Security JSON validation changes its published failure')
    require(malformed.get('kind') == 'Invalid' and malformed.get('retryable') is False,
            'Security JSON validation loses native kind/retryability')
    details = malformed.get('details') or {}
    require(details.get('code') == 'security_request_invalid' and details.get('field') == 'body',
            'Security JSON validation loses native details')
    missing = inst.request('DELETE', '/api/v1/security/scopes', expect=(400,),
                           label='native-security-http-delete-slug')
    require(missing.get('success') is False and missing.get('error') == 'slug is required',
            'Missing deletion slug changes its published failure')
    require(missing.get('kind') == 'Invalid' and missing.get('retryable') is False,
            'Deletion validation loses native kind/retryability')
    require((missing.get('details') or {}) == {'code': 'security_request_invalid', 'field': 'slug'},
            'Deletion validation loses native details')
    run_focused_module_test(ctx, 'kickside/security', 'http_context_native_test')
    run_focused_module_test(ctx, 'kickside/security', 'http_writer_native_test')
    run_focused_module_test(ctx, 'kickside/security', 'http_output_native_test')
    run_focused_module_test(ctx, 'kickside/contract', 'committed_error_test')
    run_focused_module_test(ctx, 'kickside/security', 'scope_write_ack_native_test')
    run_focused_module_test(ctx, 'kickside/security', 'scope_reconcile_handoff_test')


REGISTRY = [Scenario('native_errors_security_http', 'regression', security_http_errors, ('boot',),
                     instance_setup=True, issues=('NE-34', 'NE-35', 'NE-36', 'NE-37', 'NE-39', 'NE-40'), features=(
                         'kickside/security|http|POST /api/v1/security/scopes',
                         'kickside/security|http|DELETE /api/v1/security/scopes'))]

import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

import required_setup
from harness import Cleanup, Failure


class RequiredSetupTests(unittest.TestCase):
    def test_setup_member_cleanup_accepts_only_queued_deletion(self):
        with tempfile.TemporaryDirectory() as root:
            app = Path(root)
            (app / 'src').mkdir()
            cleanup = Cleanup()

            def request(method, path, body=None, expect=(200,), **kwargs):
                label = kwargs['label']
                if label == 'setup-member-delete':
                    if 202 not in expect:
                        raise Failure('Queued user deletion returns HTTP 202')
                    return {'success': True, 'result': {'deletion_queued': True, 'user_id': 'member'}}
                if label == 'setup-missing': return {'success': True, 'status': 'missing', 'ready': False}
                if label in ('setup-apply', 'setup-ready'):
                    return {'success': True, 'status': 'ready', 'ready': True, 'contract': 'smoke-setup:v1'}
                if label == 'setup-invalid': return {'code': 'INVALID_SETUP_DESCRIPTOR'}
                if label == 'setup-absent': return {'code': 'SETUP_DESCRIPTOR_NOT_FOUND'}
                if label == 'setup-member': return {'user': {'user_id': 'member'}}
                if label == 'setup-member-groups': return {'success': True}
                if label == 'setup-member-token': return {'token': 'member-token'}
                if label.startswith('setup-member-denied-'): return {'error': 'access denied'}
                raise AssertionError('Unexpected request: ' + label)

            inst = SimpleNamespace(app=app, password='fixture', cleanup=cleanup,
                                   request=Mock(side_effect=request), redactor=Mock())
            ctx = SimpleNamespace(inst=inst, restart=Mock())
            with patch.object(required_setup.Browser, 'release'):
                required_setup.required_setup(ctx)
            self.assertEqual(cleanup.run(), [])
            deletion = inst.request.call_args
            self.assertEqual(deletion.args, ('DELETE', '/api/v1/users/member'))
            self.assertEqual(deletion.kwargs['expect'], (202,))


if __name__ == '__main__':
    unittest.main()

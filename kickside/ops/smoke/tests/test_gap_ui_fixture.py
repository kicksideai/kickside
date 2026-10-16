from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from harness import Cleanup
import gap_ui_contract


class SyncUiFixtureTests(unittest.TestCase):
    def test_reconfigure_creates_its_sync_on_a_fresh_host(self):
        parent = Mock()
        parent.evidence.root = Path("evidence")
        parent.evidence.label = "guard"
        parent.request.return_value = {'automations': [{'id': 'existing', 'type': 'kickside.sync:sync'}]}
        fresh = Mock(cleanup=Cleanup())
        ctx = SimpleNamespace(inst=parent, browser_session=None, browser_check=Mock())
        reached = []
        def sync_fixture(fixture):
            reached.append(fixture.inst)
            raise StopIteration('fixture reached')
        with patch('runtime.Instance', return_value=fresh), patch('scenarios.Browser'), \
                patch.object(gap_ui_contract, 'sync_fixture', side_effect=sync_fixture):
            with self.assertRaisesRegex(StopIteration, 'fixture reached'):
                gap_ui_contract.reconfigure_sync(ctx)
        self.assertEqual(reached, [fresh])
        parent.install.assert_not_called()
        fresh.boot.assert_called_once()


if __name__ == '__main__':
    unittest.main()

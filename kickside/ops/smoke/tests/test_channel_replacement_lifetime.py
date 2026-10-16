from contextlib import nullcontext
import os
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import yaml
import channel_hot_update_contract as contract


class ChannelReplacementLifetimeTests(unittest.TestCase):
    def test_replacement_restores_on_success_body_failure_and_resolution_failure(self):
        for exit_path in ('success', 'body', 'resolution'):
            with self.subTest(exit_path=exit_path), tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
                root = Path(directory)
                source, app = root / 'source', root / 'app'
                source.mkdir()
                app.mkdir()
                (source / 'wippy.yaml').write_text('name: kickside/channel\n')
                config_path = app / '.wippy.yaml'
                original = 'version: "1.0"\nworkspace:\n  replacements:\n    kickside/channel: ' + str(source) + '\n'
                config_path.write_text(original)
                replacements = {contract.MODULE: str(source), 'another/module': 'another-source'}
                inst = Mock(root=root, app=app, config={'replace': replacements})
                ctx = SimpleNamespace(inst=inst)
                if exit_path == 'resolution':
                    inst.resolve_dependencies.side_effect = [ValueError('resolution fails'), None]
                def conversation(context, **kwargs):
                    current = context.inst.config['replace'][contract.MODULE]
                    self.assertNotEqual(current, str(source))
                    self.assertTrue(Path(current).is_dir())
                    if exit_path == 'body':
                        raise ValueError('body fails')
                with patch('browser.Browser.paused', return_value=nullcontext()), \
                        patch.object(contract, 'discord_gateway_responder', side_effect=conversation):
                    if exit_path == 'success':
                        contract.channel_hot_update(ctx)
                    else:
                        with self.assertRaisesRegex(ValueError, exit_path + ' fails'):
                            contract.channel_hot_update(ctx)
                self.assertEqual(inst.config['replace'], replacements)
                self.assertEqual(config_path.read_text(), original)
                self.assertEqual(list(root.glob('channel-hub-update-*')), [])
                self.assertEqual(inst.resolve_dependencies.call_count, 2)
                self.assertEqual(yaml.safe_load(config_path.read_text())['workspace']['replacements'][contract.MODULE], str(source))

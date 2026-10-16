import hashlib
import os
from pathlib import Path
import stat
import struct
import tempfile
import unittest
from unittest.mock import patch

import msgpack
import zstandard

from scenarios_identity_policy_upgrade import published_source


class PublishedSourceMetadataTests(unittest.TestCase):
    def test_materialized_resource_retains_content_permissions_and_last_modified_time(self):
        content = b'published static content'
        modified = 1700000000
        compressor = zstandard.ZstdCompressor()
        packed = bytearray()
        def frame(data):
            descriptor = {'Offset': len(packed), 'Size': len(data)}
            packed.extend(data)
            return descriptor
        data_frame = frame(content)
        metadata_frame = frame(compressor.compress(msgpack.packb({})))
        entries_frame = frame(compressor.compress(msgpack.packb([])))
        files = {'entry.js': {'Location': {'FrameIndex': 0, 'Offset': 0, 'Chunks': None},
            'Compressed': False, 'Size': len(content), 'Hash': hashlib.sha256(content).hexdigest(),
            'ModTime': modified, 'Mode': 0o750}}
        resource_frame = frame(compressor.compress(msgpack.packb({'Files': files})))
        index = {'Metadata': metadata_frame, 'Entries': entries_frame, 'DataFrames': [data_frame],
                 'Resources': [{'ID': {'ns': 'example.module', 'name': 'static'}, 'Frame': resource_frame}]}
        packed_index = compressor.compress(msgpack.packb(index))
        index_offset = len(packed)
        packed.extend(packed_index)
        packed.extend(struct.pack('<QQ', index_offset, len(packed_index)))
        def fetch(module, directory, baseline):
            (directory / 'baseline.wapp').write_bytes(packed)
            return {'version': 'published', 'sha256': hashlib.sha256(packed).hexdigest(),
                    'entries': {'example.module:static': {'Kind': 'fs.directory', 'Meta': {}, 'Data': {}}}}
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            source = Path(directory) / 'source'
            with patch('ops.compat.fetch_baselines.Hub') as hub:
                hub.return_value.fetch.side_effect = fetch
                published_source(source, 'example/module', None)
            materialized = source / 'resources/example.module_static/entry.js'
            self.assertEqual(materialized.read_bytes(), content)
            self.assertEqual(materialized.stat().st_mtime, modified)
            self.assertEqual(stat.S_IMODE(materialized.stat().st_mode), 0o750)

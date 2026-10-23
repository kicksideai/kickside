import io
import os
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from PIL import Image, ImageFont

from scenarios_ai import fixture


class AIFixtureFontTests(unittest.TestCase):
    def test_image_fixtures_generate_without_host_fonts(self):
        truetype = ImageFont.truetype

        def bundled_font(font, *args, **kwargs):
            self.assertIsInstance(font, io.BytesIO)
            return truetype(font, *args, **kwargs)

        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'temp').mkdir()
            ctx = SimpleNamespace(inst=SimpleNamespace(root=root))
            with patch.object(ImageFont, 'truetype', side_effect=bundled_font):
                for suffix in ('png', 'jpg', 'webp', 'tiff', 'bmp', 'gif', 'ico', 'jpeg', 'tif'):
                    with self.subTest(suffix=suffix):
                        with Image.open(fixture(ctx, suffix)) as image:
                            image.load()
                            self.assertEqual(image.size, (256, 256) if suffix == 'ico' else (1500, 1000))
                            self.assertGreater(len(image.getcolors(2_000_000)), 1)

    def test_access_png_ingestion_fixture_generates_without_host_fonts(self):
        import scenarios_access as access
        truetype = ImageFont.truetype
        def bundled_font(font, *args, **kwargs):
            self.assertIsInstance(font, io.BytesIO)
            return truetype(font, *args, **kwargs)
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'temp').mkdir()
            ctx = Mock()
            ctx.inst.root = root
            ctx.inst.wait.side_effect = lambda condition, *args, **kwargs: condition()
            images = []
            def uploaded(context, role, path):
                with Image.open(path) as image:
                    image.load()
                    self.assertEqual(image.size, (600, 180))
                    self.assertGreater(len(image.getcolors(200_000)), 1)
                images.append((role, path.name))
                return 'upload'
            with patch.object(ImageFont, 'truetype', side_effect=bundled_font), \
                 patch.object(access, 'create', return_value=SimpleNamespace(id='kb')), \
                 patch.object(access, 'upload_path', side_effect=uploaded), \
                 patch.object(access, 'request', return_value={'queued': 1, 'items': ['NW-PNG-731']}):
                access.regression_png_ingest(ctx)
            self.assertEqual([role for role, name in images], ['owner', 'owner', 'write', 'write'])

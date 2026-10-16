import io
import os
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

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

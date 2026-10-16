import hashlib
import io
import unittest
from unittest.mock import Mock

from PIL import Image
from browser import assert_image_content
from harness import Failure


class LogoPixelsTests(unittest.TestCase):
    def test_mapped_logo_url_keeps_the_uploaded_pixels(self):
        image = Image.new('RGB', (2, 2), '#17494d')
        file = io.BytesIO()
        image.save(file, format='PNG')
        expected = hashlib.sha256(image.convert('RGBA').tobytes()).hexdigest()
        locator = Mock()
        locator.evaluate.return_value = expected
        assert_image_content(locator, file.getvalue())
        locator.evaluate.return_value = hashlib.sha256(Image.new('RGB', (2, 2), 'red').convert('RGBA').tobytes()).hexdigest()
        with self.assertRaises(Failure):
            assert_image_content(locator, file.getvalue())

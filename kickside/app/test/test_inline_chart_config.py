"""The application admits static SVG charts through the host configuration contract."""
import json
from pathlib import Path
import unittest

import yaml


class InlineChartConfig(unittest.TestCase):
    def test_static_chart_elements_and_geometry_survive_sanitization(self):
        app = Path(__file__).resolve().parents[1]
        entries = yaml.safe_load((app / 'src/app/deps/_index.yaml').read_text())['entries']
        facade = next(entry for entry in entries if entry['name'] == 'facade')
        parameters = {item['name']: item['value'] for item in facade['parameters']}
        tags = json.loads(parameters.get('allow_additional_tags', '{}'))
        for tag, required in {
            'svg': {'viewbox', 'width', 'height', 'role', 'aria-label'},
            'g': {'fill', 'stroke', 'transform'},
            'rect': {'x', 'y', 'width', 'height', 'fill'},
            'path': {'d', 'fill', 'stroke'},
            'line': {'x1', 'y1', 'x2', 'y2', 'stroke'},
            'text': {'x', 'y', 'font-size', 'text-anchor'},
        }.items():
            self.assertIn(tag, tags)
            self.assertTrue(required.issubset(tags[tag]), tag)
        self.assertTrue({'title', 'desc'}.issubset(tags))
        self.assertFalse({'script', 'foreignobject', 'use', 'image', 'a'}.intersection(tags))
        for attrs in tags.values():
            self.assertFalse({'href', 'xlink:href', 'style'}.intersection(attrs))
            self.assertFalse(any(attr.startswith('on') for attr in attrs))


if __name__ == '__main__':
    unittest.main()

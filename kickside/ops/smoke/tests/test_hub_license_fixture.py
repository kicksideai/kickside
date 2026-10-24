import sys
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import scenarios_hub_license


class HubLicenseFixtureTests(unittest.TestCase):
    def test_uses_an_available_custom_licensed_card_when_atlassian_is_absent(self):
        candidates = [
            ('kickside/simplefin', 'LicenseRef-KickSide-Community-1.0'),
            ('chestor/roadmap', 'LicenseRef-KickSide-Community-1.0'),
        ]

        fixture = scenarios_hub_license.available_custom_license_fixture(candidates)

        self.assertNotIn('kickside/atlassian', [component for component, _ in candidates])
        self.assertEqual(fixture, ('kickside/simplefin', 'LicenseRef-KickSide-Community-1.0'))

    def test_requires_a_rendered_custom_license_card(self):
        self.assertIsNone(scenarios_hub_license.available_custom_license_fixture([]))

    def test_actual_scenario_uses_available_catalog_license_when_atlassian_is_absent(self):
        class Locator:
            def __init__(self, text='', title=None, class_name=''):
                self.text, self.title, self.class_name = text, title, class_name

            @property
            def first(self): return self

            @property
            def last(self): return self

            def all(self): return self.cards

            def wait_for(self, **_): pass

            def inner_text(self): return self.text

            def get_attribute(self, name):
                return {'title': self.title, 'class': self.class_name,
                        'aria-expanded': 'true'}.get(name)

            def evaluate(self, _): return 1

            def scroll_into_view_if_needed(self): pass

            def click(self): pass

            def filter(self, **_): return self

            def locator(self, _selector): return self

            def get_by_role(self, *_args, **_kwargs): return self

        custom = Locator('kickside/simplefin', class_name='mod-card')
        custom_license = Locator('KickSide Community 1.0', 'LicenseRef-KickSide-Community-1.0')
        featured = Locator('wippy/test', class_name='feat-card')
        featured_license = Locator('MPL-2.0', 'MPL-2.0')
        custom.locator = lambda _selector: custom_license if 'mod-foot' in _selector else Locator(custom.text)
        featured.locator = lambda _selector: featured_license if 'meta-pill' in _selector else Locator(featured.text)
        detail = Locator('KickSide Community 1.0', 'LicenseRef-KickSide-Community-1.0')
        dialog = Locator()
        dialog.locator = lambda _selector: detail

        class Hub(Locator):
            def __init__(self):
                super().__init__()

            def locator(self, selector):
                if selector == '.mod-card, .feat-card':
                    collection = Locator(); collection.cards = [custom, featured]
                    return collection
                if selector == '.mod-card':
                    collection = Locator(); collection.cards = [custom]
                    collection.filter = lambda **_: custom
                    return collection
                if selector == '.d-row':
                    row = Locator(); row.locator = lambda _selector: detail
                    return row
                return Locator()

            def get_by_role(self, role, **kwargs):
                if role == 'dialog': return dialog
                return Locator()

        class Browser:
            def __init__(self):
                self.frame = Locator()
                appearance = Locator()
                self.frame.locator = lambda _selector: appearance
                self.page = Locator()
                self.page.locator = lambda _selector: Locator()
                self.page.get_by_text = lambda *_args, **_kwargs: Locator()

            def screenshot(self, *_args, **_kwargs): pass

        case = self

        class Inst:
            def __init__(self):
                self.evidence = SimpleNamespace(saved=[])
                self.evidence.save = lambda name, value: self.evidence.saved.append((name, value))

            def request(self, method, path, **_):
                case.assertEqual(method, 'GET')
                case.assertIn('/api/v1/keeper/hub/browse?', path)
                return {'items': [
                    {'full_name': 'kickside/simplefin', 'license': 'LicenseRef-KickSide-Community-1.0'},
                    {'full_name': 'wippy/test', 'license': 'MPL-2.0'},
                ], 'total': 2}

        inst = Inst()
        ctx = SimpleNamespace(inst=inst)
        class Expect:
            def __call__(self, *_args, **_kwargs): return self

            def to_have_attribute(self, *_args, **_kwargs): pass

            def to_be_visible(self, *_args, **_kwargs): pass

        expect = Expect()
        with patch.object(scenarios_hub_license, 'hub_surface', return_value=(Browser(), Hub())), \
             patch.object(scenarios_hub_license, 'system'), \
             patch.dict(sys.modules, {'playwright': SimpleNamespace(), 'playwright.sync_api': SimpleNamespace(expect=expect)}):
            scenarios_hub_license.license_labels(ctx)

        self.assertEqual(len(inst.evidence.saved), 1)
        observations = inst.evidence.saved[0][1]
        self.assertEqual({row['surface'] for row in observations}, {'footer', 'featured', 'detail', 'install'})
        self.assertEqual({row['raw'] for row in observations if row['surface'] in {'detail', 'install'}},
                         {'LicenseRef-KickSide-Community-1.0'})


if __name__ == '__main__':
    unittest.main()

import unittest
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, Mock, patch

from scenarios_core import assert_branding_browser, core_appearance, logo_upgrade


class BrandingReadinessTests(unittest.TestCase):
    def test_title_input_matches_the_published_and_current_brand_capitalization(self):
        for placeholder in ('Kickside', 'KickSide'):
            with self.subTest(placeholder=placeholder), tempfile.TemporaryDirectory() as directory:
                ctx, appearance, title = Mock(), Mock(), Mock()
                ctx.inst.root = Path(directory)
                (ctx.inst.root / 'temp').mkdir()
                ctx.state = {}
                ctx.browser.frame.locator.return_value = appearance
                class TitleReached(Exception):
                    pass
                title.fill.side_effect = TitleReached()
                def input_for(expected, **options):
                    matches = expected.fullmatch(placeholder) if hasattr(expected, 'fullmatch') else expected == placeholder
                    self.assertTrue(matches, 'The published title field is not found')
                    return title
                appearance.get_by_placeholder.side_effect = input_for
                with patch('scenarios_core.system'), patch('scenarios_core.upload_appearance_logo', return_value='/logo'):
                    with self.assertRaises(TitleReached):
                        core_appearance(ctx)

    def test_branding_navigation_waits_for_the_previous_document_requests(self):
        ctx = Mock()
        ctx.inst.base = 'http://fixture'
        pending = True
        def settled():
            nonlocal pending
            pending = False
        def navigate(*args, **kwargs):
            self.assertFalse(pending, 'Navigation aborts the previous document requests')
        ctx.browser.settle.side_effect = settled
        ctx.browser.page.goto.side_effect = navigate
        with patch('playwright.sync_api.expect'):
            assert_branding_browser(ctx, '/api/public/branding/logo')

    def test_upgrade_verifies_persisted_replacement_at_the_stable_logo_url(self):
        with tempfile.TemporaryDirectory() as directory:
            fixture = Mock()
            fixture.inst.root = Path(directory)
            (fixture.inst.root / 'temp').mkdir()
            fixture.state = {'core_logo': '/api/public/branding/logo'}
            fixture.inst.request.return_value = {'logo_url': fixture.state['core_logo']}
            fixture.inst.wait.side_effect = lambda predicate, *args, **kwargs: self.assertTrue(predicate())
            fixture.browser.frame.locator.side_effect = AssertionError('Upload persists the logo; unchanged URL leaves Save disabled')
            manager = MagicMock()
            manager.__enter__.return_value = fixture
            previous = b'previous logo bytes'
            def read_logo(*args, **kwargs):
                replacement = fixture.inst.root / 'temp' / 'northwind-replacement-logo.png'
                return (replacement.read_bytes() if replacement.exists() else previous), 'image/png'
            upgrade = Mock()
            with patch('module_lifecycle_contract.published_fixture', return_value=manager), \
                    patch('scenarios_core.core_appearance'), patch('scenarios_core.system'), \
                    patch('scenarios_core.upload_appearance_logo', return_value=fixture.state['core_logo']), \
                    patch('scenarios_core.binary_request', side_effect=read_logo), \
                    patch('scenarios_core.assert_branding_browser') as rendered:
                logo_upgrade(Mock(), upgrade)
            upgrade.assert_called_once_with(fixture)
            self.assertEqual([call.args[2] for call in rendered.call_args_list[:2]], [previous, previous])
            replacement = (fixture.inst.root / 'temp' / 'northwind-replacement-logo.png').read_bytes()
            self.assertNotEqual(replacement, previous)
            self.assertEqual(rendered.call_args_list[-1].args[2], replacement)
            fixture.browser.reload.assert_called_once_with()

    def test_browser_waits_for_each_logo_to_decode_after_rendering(self):
        ctx = Mock()
        ctx.inst.base = "http://fixture"
        logo = ctx.browser.page.locator.return_value
        shell = ctx.browser.frame.locator.return_value.first
        logo.evaluate.side_effect = [False, True]
        shell.evaluate.side_effect = [False, True]
        def wait(predicate, *args, **kwargs):
            self.assertFalse(predicate())
            self.assertTrue(predicate())
        ctx.inst.wait.side_effect = wait
        with patch('playwright.sync_api.expect'):
            assert_branding_browser(ctx, '/api/public/logo')
        self.assertEqual(ctx.inst.wait.call_count, 2)

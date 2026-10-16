import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class FrontendRolloutTest(unittest.TestCase):
    def test_sticky_layer_stays_under_modal_masks(self):
        values = json.loads((ROOT / "app/static/css-variables.facade.json").read_text())
        self.assertGreater(int(values["--p-z-sticky"]), 0)
        self.assertLess(int(values["--p-z-sticky"]), int(values["--p-mask-z-index"]))

    def test_renderer_source_canvas_has_one_scheme_independent_declaration(self):
        css = (ROOT / "platform/renderers/ui/src/styles.css").read_text()
        self.assertEqual(css.count("--rv-document-canvas:"), 1)
        self.assertEqual(css.count("--rv-video-canvas:"), 1)
        self.assertIn("--rv-document-canvas: #fff", css)
        self.assertIn("--rv-video-canvas: #000", css)

    def test_security_has_no_retired_tag_containers(self):
        css = (ROOT / "platform/security/ui/src/styles.css").read_text()
        for name in ("km-tag-group", "km-tag-classes", "km-tag-caps"):
            self.assertNotIn("." + name, css)
        self.assertIn(".km-pill", css)

    def test_mcp_retains_scope_browser_empty_state_and_retires_unused_editors(self):
        css = (ROOT / "platform/mcp/ui/src/styles.css").read_text()
        self.assertIn(".kx-tool-empty", css)
        for name in ("kx-files-badge", "kx-edit-cols", "kx-files", "kx-toollist", "kx-scope-sel"):
            self.assertNotIn("." + name, css)

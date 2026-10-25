import importlib.util
import json
import subprocess
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[4]
SPEC = importlib.util.spec_from_file_location("native_error_source", ROOT / "ops/scripts/check-native-errors.py")
CHECK = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CHECK)


class NativeErrorSourceTests(unittest.TestCase):
    def test_literal_returns_include_multiline_and_long_strings(self):
        for source in ['return nil, "refused"', "return nil, 'refused'", 'return\n nil,\n "refused"',
                       'return nil, [=[refused]=]', 'if bad then return nil, "refused" .. extra end']:
            with self.subTest(source=source):
                rows = CHECK.findings(source)
                self.assertEqual([row["rule"] for row in rows], ["literal-error-return"])

    def test_comments_strings_and_native_returns_remain_clean(self):
        for source in ['-- return nil, "refused"', '--[=[return nil, "refused"]=]',
                       'local doc = [[return nil, "refused"]]', 'local doc = "return nil, \"refused\""',
                       'return nil, errors.new({message="refused", kind=errors.INVALID})',
                       'return nil, errors.wrap(err, "refused")', 'return nil, err',
                       'if errors.is(err, errors.NOT_FOUND) then return nil, err end',
                       'if err:details().code == "resource_missing" then return nil, err end',
                       'local title = value:match("%a+")', 'if type(err) == "userdata" then end',
                       'if output.failure_class == "deterministic" then end',
                       'if err:kind() == "NotFound" then end',
                       'if message.observed_registry_version ~= "" then end']:
            with self.subTest(source=source): self.assertEqual(CHECK.findings(source), [])

    def test_message_decisions_include_match_and_equality_forms(self):
        for source in ['tostring(err):find("missing")', 'tostring(err):match("missing")',
                       'string.find(tostring(err), "missing")', 'string.match(err, "missing")',
                       'err:find("missing")', 'error_message:match("missing")',
                       'failure.message:find("missing")', 'if err == "missing" then end',
                       'if "missing" ~= err then end', 'if message == "missing" then end',
                       'if failure.message == "missing" then end',
                       'if (err or fallback) == "missing" then end',
                       'if tostring(err or fallback) == "missing" then end']:
            with self.subTest(source=source):
                self.assertEqual([row["rule"] for row in CHECK.findings(source)], ["error-text-decision"])

    def test_ratchet_tracks_counts_and_rejects_new_or_removed_allowances(self):
        row = {"path":"core/example/src/item.lua", "rule":"literal-error-return", "signature":"return nil , \"retired\""}
        allowance = {**row, "count":1, "reason":"Existing stage sentinel remains published."}
        self.assertEqual(CHECK.ratchet([row], [allowance]), [])
        self.assertTrue(CHECK.ratchet([row, row], [allowance]))
        self.assertTrue(CHECK.ratchet([], [allowance]))
        self.assertTrue(CHECK.ratchet([row], []))
        with self.assertRaises(ValueError): CHECK.ratchet([row], [{**allowance, "reason":""}])

    def test_source_scope_excludes_tests_and_vendor_trees(self):
        for path in ['core/jobs/src/persist/job.lua', 'core/core/src/threads/write.lua']:
            self.assertTrue(CHECK.source_path(Path(path)))
        for path in ['core/jobs/test/src/job.lua', 'core/jobs/src/item_test.lua',
                     'core/jobs/.wippy/vendor/item.lua', 'core/jobs/tests/job.lua']:
            self.assertFalse(CHECK.source_path(Path(path)))

    def test_overlay_assertion_scans_the_working_checkout(self):
        mirror = Path.cwd().parent / "kickside-internal/kickside/ops/smoke/coverage/tests"
        result = subprocess.run([sys.executable, "-m", "unittest", "discover", "-s", str(mirror),
            "-p", "test_native_error_source.py", "-k", "committed_converted_modules_and_existing_lint_path_pass"],
            cwd=Path.cwd(), capture_output=True, text=True, timeout=60)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_committed_converted_modules_and_existing_lint_path_pass(self):
        config = json.loads((ROOT / "ops/scripts/native-error-source.json").read_text())
        self.assertTrue({"core/contract", "core/component", "core/core", "core/jobs", "core/execution", "platform/security"} <= set(config["modules"]))
        self.assertEqual(CHECK.check(Path.cwd(), config), [])
        script = (ROOT / "ops/scripts/lint-test-all.sh").read_text()
        self.assertIn("check-native-errors.py", script)
        self.assertLess(script.index("check-native-errors.py"), script.index("while IFS="))

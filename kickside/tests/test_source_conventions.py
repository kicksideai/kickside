import importlib.util
import tempfile
import unittest
from pathlib import Path

import yaml

SCRIPT = Path(__file__).resolve().parent.parent / "scripts" / "check-source-conventions.py"
spec = importlib.util.spec_from_file_location("check_source_conventions", SCRIPT)
conventions = importlib.util.module_from_spec(spec)
spec.loader.exec_module(conventions)


class JsonDecodeExpansionTest(unittest.TestCase):
    def flagged(self, source: str) -> bool:
        return bool(conventions.decode_call_expansion(source))

    def test_rejects_multi_return_call_as_final_argument(self):
        self.assertTrue(self.flagged("local body = json.decode(req:body())"))
        self.assertTrue(self.flagged("local v = json.decode(fs.read_file(path, opts))"))
        self.assertTrue(self.flagged("local v = json.decode(raw, schema.lookup(name))"))

    def test_accepts_single_values(self):
        self.assertFalse(self.flagged("local body = json.decode(raw)"))
        self.assertFalse(self.flagged('local body = json.decode(req:body() or "")'))
        self.assertFalse(self.flagged("local body = json.decode((req:body()))"))
        self.assertFalse(self.flagged("local body = json.decode(tostring(value))"))
        self.assertFalse(self.flagged("local body = json.decode(raw, Payload)"))

    def test_ignores_parentheses_inside_strings(self):
        self.assertFalse(self.flagged('local v = json.decode("(" .. raw .. ")")'))


class HarnessDatabaseTest(unittest.TestCase):
    def test_flags_memory_db_map_only_under_the_db_entry(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent) as tmp:
            root = Path(tmp)
            index = root / "core" / "x" / "test" / "_index.yaml"
            index.parent.mkdir(parents=True)
            index.write_text(
                "entries:\n"
                "  - name: cache\n"
                "    file: \":memory:\"\n"
                "  - name: db\n"
                "    kind: db.sql.sqlite\n"
                "    file: \":memory:\"\n",
                encoding="utf-8",
            )
            found = conventions.memory_db_maps(root)
            self.assertEqual(len(found), 1)
            self.assertIn(":6:", found[0])


    def fixture(self, directory, index_text, config_text):
        root = Path(directory)
        index = root / "core" / "x" / "test" / "src" / "_index.yaml"
        index.parent.mkdir(parents=True)
        index.write_text(index_text)
        (index.parent.parent / ".wippy.yaml").write_text(config_text)
        return root

    def test_accepts_equivalent_yaml_database_wiring(self):
        index = 'entries:\n  - name: db\n    kind: db.sql.sqlite\n    file: "${sqlite_path}"\n'
        configs = (
            'override:\n  "app:db:file": "${sqlite_path}"\nvars:\n  sqlite_path: ":memory:"\n',
            "override:\n  'app:db:file': '${sqlite_path}'\nvars:\n  sqlite_path: ':memory:'\n",
            "override:\n  app:db:file: ${sqlite_path}\nvars:\n  sqlite_path: ':memory:'\n",
            'override: {app:db:file: "${sqlite_path}"}\nvars: {sqlite_path: ":memory:"}\n',
            'path: &path "${sqlite_path}"\noverride: {app:db:file: *path}\nvars: {sqlite_path: ":memory:"}\n',
        )
        for config in configs:
            with self.subTest(config=config), tempfile.TemporaryDirectory(dir=SCRIPT.parent.parent / "tests") as directory:
                root = self.fixture(directory, index, config)
                self.assertEqual(conventions.sqlite_path_wiring(root), [])

    def test_checks_equivalent_index_serializations(self):
        config = 'vars: {sqlite_path: ":memory:"}\n'
        for index in (
            "entries:\n  - name: db\n    kind: db.sql.sqlite\n    file: '${sqlite_path}'\n",
            "entries:\n  - name: db\n    kind: db.sql.sqlite\n    file: ${sqlite_path}\n",
            'entries: [{name: db, kind: db.sql.sqlite, file: "${sqlite_path}"}]\n',
        ):
            with self.subTest(index=index), tempfile.TemporaryDirectory(dir=SCRIPT.parent.parent / "tests") as directory:
                root = self.fixture(directory, index, config)
                found = conventions.sqlite_path_wiring(root)
                self.assertEqual(len(found), 1)
                self.assertIn("missing app:db:file sqlite_path override", found[0])

    def test_rejects_missing_wiring_despite_matching_comments(self):
        index = 'entries:\n  - name: db\n    kind: db.sql.sqlite\n    file: "${sqlite_path}"\n'
        config = '# "app:db:file": "${sqlite_path}"\n# sqlite_path: ":memory:"\nversion: "1.0"\n'
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent.parent / "tests") as directory:
            root = self.fixture(directory, index, config)
            found = conventions.sqlite_path_wiring(root)
            self.assertEqual(len(found), 2)
            self.assertIn("missing app:db:file", found[0])
            self.assertIn("missing vars.sqlite_path", found[1])

    def test_ignores_placeholder_text_outside_database_entries(self):
        index = 'entries:\n  - name: example\n    kind: registry.entry\n    data:\n      file: "${sqlite_path}"\n'
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent.parent / "tests") as directory:
            root = self.fixture(directory, index, 'version: "1.0"\n')
            self.assertEqual(conventions.sqlite_path_wiring(root), [])

    def test_invalid_yaml_fails_instead_of_appearing_unconfigured(self):
        index = 'entries:\n  - name: db\n    kind: db.sql.sqlite\n    file: "${sqlite_path}"\n'
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent.parent / "tests") as directory:
            root = self.fixture(directory, index, 'override: [\n')
            with self.assertRaises(yaml.YAMLError):
                conventions.sqlite_path_wiring(root)


class NativeErrorConventionsTest(unittest.TestCase):
    def check(self, source):
        return conventions.native_error_violations(source)

    def test_rejects_literal_returns_across_lines(self):
        for source in ('return nil, "bad"', "return nil, 'bad' .. context", 'return\n nil,\n [=[bad]=]'):
            with self.subTest(source=source):
                self.assertTrue(any('literal error return' in item[1] for item in self.check(source)))

    def test_accepts_multi_result_stage_labels(self):
        self.assertEqual(self.check('return nil, "delete", err'), [])
        self.assertEqual(self.check('return nil, [=[begin]=], errors.wrap(err, "transaction")'), [])

    def test_rejects_literal_failure_after_multiple_empty_results(self):
        for source in (
            'return nil, nil, "invalid subject"',
            'return nil, nil, "invalid ordering" .. field',
            'return nil, nil, nil, "invalid identity"',
            'return false, nil, "validation failed"',
            'return\n nil,\n nil,\n [=[invalid subject]=]',
        ):
            with self.subTest(source=source):
                self.assertTrue(any('literal error return' in item[1] for item in self.check(source)))
        self.assertEqual(self.check('return nil, nil, errors.new({kind=errors.INVALID})'), [])
        self.assertEqual(self.check('return nil, nil, "delete", err'), [])

    def test_rejects_boolean_validation_with_string_failures(self):
        self.assertTrue(self.check('return false, "invalid principal"'))
        self.assertEqual(self.check('return false, errors.new({kind=errors.INVALID})'), [])

    def test_rejects_literal_errors_with_additional_codes_or_empty_results(self):
        for source in (
            'return nil, "invalid request", "access"',
            'return nil, "invalid request", nil',
            'return nil, "invalid request", error_code',
            'return nil, "invalid request", ERROR_CODE.INVALID',
            'return nil, [=[invalid request]=], "invalid_request"',
        ):
            with self.subTest(source=source):
                self.assertTrue(any('literal error return' in item[1] for item in self.check(source)))

    def test_rejects_error_text_matching_and_aliases(self):
        for source in (
            'if tostring(err):find("duplicate", 1, true) then end',
            'if err:find("missing") then end',
            'if tostring(err or fallback):lower() == "missing" then end',
            'local message = tostring(err):lower()\nif by_message[message] then end',
            'if string.match(tostring(open_err), "missing") then end',
            'if string.find(string.lower(tostring(err)), "duplicate", 1, true) then end',
            'if string.match(string.upper(err:message()), "MISSING") then end',
            'if string.lower(string.upper(tostring(read_err))) == "missing" then end',
            'local text = string.lower(string.upper(err:message()))\nif text:find("missing") then end',

            'if err == "not found" then end',
            'if "missing" == read_error then end',
            'if update_err == consts.ERROR.USER_NOT_FOUND then end',
            'local message = tostring(err)\nif message:find("missing") then end',
            'local text = err:message()\nif text == "missing" then end',
        ):
            with self.subTest(source=source):
                self.assertTrue(any('error text matching' in item[1] for item in self.check(source)))

    def test_accepts_native_kind_code_and_unrelated_text(self):
        self.assertEqual(self.check('local _, err = invoke()\nif errors.is(err, errors.NOT_FOUND) then return nil, errors.wrap(err, "read failed") end\nif err:details().code == "missing" then return nil, err end\nif filename:find(".lua", 1, true) then return filename end\nlocal rendered = tostring(err)\nlogger:error(rendered)\n'), [])

    def test_case_conversion_keeps_kind_code_and_unrelated_strings_allowed(self):
        for source in (
            'if string.lower(err:kind()) == "invalid" then end',
            'if string.lower(err:details().code) == "missing" then end',
            'if string.find(string.lower(filename), "image") then end',
        ):
            with self.subTest(source=source):
                self.assertEqual(self.check(source), [])

    def test_ignores_comments_and_string_contents(self):
        self.assertEqual(self.check('-- return nil, "bad"\n--[=[ if tostring(err):find("x") then end ]=]\nlocal example = [==[return nil, "bad"]==]\nlocal quoted = "if err == \\"missing\\" then end"\nreturn example\n'), [])

    def test_scans_only_declared_converted_production_modules(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent) as tmp:
            root = Path(tmp)
            for rel in ('core/execution/src/main.lua', 'core/execution/test/fixture.lua',
                        'core/execution/src/.wippy/vendor/main.lua', 'platform/unconverted/src/main.lua'):
                path = root / rel
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('return nil, "bad"')
            (root / 'scripts').mkdir()
            (root / 'scripts/native-error-modules.json').write_text('["core/execution"]')
            found = conventions.native_errors(root)
            self.assertEqual(len(found), 1)
            self.assertIn('core/execution/src/main.lua:1:', found[0])

    def test_missing_converted_module_fails_the_ratchet(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent) as tmp:
            root = Path(tmp)
            (root / 'scripts').mkdir()
            (root / 'scripts/native-error-modules.json').write_text('["core/missing"]')
            self.assertTrue(conventions.native_errors(root))


if __name__ == "__main__":
    unittest.main()

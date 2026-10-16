#!/usr/bin/env python3
"""Focused regressions for the Lua contract-usage release gate."""

from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("check-release-hygiene.py")
SPEC = importlib.util.spec_from_file_location("release_hygiene", SCRIPT)
assert SPEC and SPEC.loader
release_hygiene = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(release_hygiene)


class ContractUsageTests(unittest.TestCase):
    def check(self, source: str) -> list[str]:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            module = root / "module"
            src = module / "src"
            src.mkdir(parents=True)
            (src / "entry.lua").write_text(source)
            return release_hygiene.check_lua_contract_usage(root, module)

    def test_accepts_direct_declared_api_use(self) -> None:
        self.assertEqual(
            self.check('local kb = require("kb")\nreturn kb.query({})\n'),
            [],
        )

    def test_rejects_required_method_probe(self) -> None:
        errors = self.check(
            'local kb = require("kb")\n'
            'if type(kb.query) == "function" then return kb.query({}) end\n'
        )
        self.assertTrue(any("method-existence" in error for error in errors))

    def test_rejects_required_module_availability_branch(self) -> None:
        errors = self.check(
            'local kb = require("kb")\nif not kb then return nil, "unavailable" end\n'
        )
        self.assertTrue(any("cannot be optional" in error for error in errors))

    def test_rejects_error_shape_probe(self) -> None:
        errors = self.check(
            'local function message(err)\n'
            '  if type(err.message) == "function" then return err:message() end\n'
            '  return tostring(err)\nend\n'
        )
        self.assertTrue(any("error method-shape" in error for error in errors))

    def test_rejects_trivial_forward_wrappers(self) -> None:
        errors = self.check(
            'local function error_text(err: any): string\n'
            '  return tostring(err)\nend\n'
            'local function get_service()\n'
            '  return services.current()\nend\n'
        )
        self.assertTrue(any("trivial error_text wrapper" in error for error in errors))
        self.assertTrue(any("trivial get_service wrapper" in error for error in errors))

    def test_accepts_function_that_changes_arguments(self) -> None:
        self.assertEqual(
            self.check(
                'local function normalize(value: any): string\n'
                '  return tostring(value or "")\nend\n'
            ),
            [],
        )



class ApplicationHistoryTests(unittest.TestCase):
    def config(self):
        return {
            "registry": {"history_type": "memory"},
            "profiles": {"postgres": {"registry": {"history_type": "postgres", "history_dsn": "host='${postgres_host}' port=${postgres_port} dbname='${postgres_database}' user='${postgres_username}' password='${postgres_password}' sslmode='${postgres_sslmode}'", "history_schema": "${postgres_history_schema}"}}},
        }

    def test_accepts_memory_default_and_derived_postgres_history(self):
        self.assertEqual(release_hygiene.check_application_history(self.config()), [])

    def test_rejects_durable_default(self):
        config = self.config()
        config["registry"]["history_type"] = "sqlite"
        self.assertTrue(release_hygiene.check_application_history(config))

    def test_rejects_a_separate_history_dsn(self):
        config = self.config()
        config["profiles"]["postgres"]["registry"]["history_dsn"] = "${postgres_history_dsn}"
        self.assertTrue(release_hygiene.check_application_history(config))

    def test_accepts_explicit_history_dsn_declared_by_the_application(self):
        config = self.config()
        config['vars'] = {'postgres_history_dsn': ''}
        config['profiles']['postgres']['registry']['history_dsn'] = '${postgres_history_dsn}'
        self.assertEqual(release_hygiene.check_application_history(config), [])

    def test_rejects_another_profile_selecting_history(self):
        config = self.config()
        config["profiles"]["postgres_large"] = {"registry": {"history_type": "postgres"}}
        self.assertTrue(release_hygiene.check_application_history(config))

if __name__ == "__main__":
    unittest.main()

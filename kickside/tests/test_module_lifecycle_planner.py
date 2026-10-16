#!/usr/bin/env python3
"""Regression tests for lifecycle dependency-parameter handling."""

from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT = Path(__file__).parent / "module-lifecycle" / "lifecycle.py"
SPEC = importlib.util.spec_from_file_location("module_lifecycle", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
LIFECYCLE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = LIFECYCLE
SPEC.loader.exec_module(LIFECYCLE)


class PlannerParameterTest(unittest.TestCase):
    def gate(self, response: dict, supplied: list[dict[str, str]] | None = None):
        gate = object.__new__(LIFECYCLE.KicksideGate)
        gate.supplied_parameters = supplied or []
        gate.request = lambda *_args, **_kwargs: response
        return gate

    def test_missing_requirement_is_not_filled_from_suggestion(self):
        gate = self.gate({
            "requirements": [{
                "full_id": "kickside.example:api_router",
                "missing": True,
                "suggestions": [{"value": "app:api"}],
            }],
            "recommended_parameters": [{
                "name": "kickside.example:api_router",
                "value": "app:api",
            }],
        })

        with self.assertRaisesRegex(
            LIFECYCLE.GateFailure,
            "install plan has unresolved requirements: kickside.example:api_router",
        ):
            gate.plan("kickside/example")

    def test_only_declared_and_canonical_parameters_are_forwarded(self):
        gate = self.gate(
            {
                "requirements": [],
                "install_payload": {
                    "parameters": [{
                        "name": "kickside.example:api_router",
                        "value": "app:api",
                    }],
                },
                "recommended_parameters": [{
                    "name": "kickside.example:ui_server",
                    "value": "app:gateway",
                }],
            },
            [{"name": "kickside.example:api_router", "value": "app:api"}],
        )

        _, parameters = gate.plan("kickside/example")
        self.assertEqual(
            [{"name": "kickside.example:api_router", "value": "app:api"}],
            parameters,
        )

    def test_live_onboarding_parameters_ground_root_and_transitive_install(self):
        gate = object.__new__(LIFECYCLE.KicksideGate)
        gate.supplied_parameters = []
        gate.onboarding_package_parameters = None
        gate.request = lambda *_args, **_kwargs: {
            "entries": [{
                "data": {
                    "packages": [{
                        "component": "kickside/kb10",
                        "parameters": [
                            {"name": "kickside.kb10:target_db", "value": "app:db"},
                            {"name": "kickside.knowledge:api_router", "value": "app:api"},
                        ],
                    }],
                },
            }],
        }

        self.assertEqual(
            [
                {"name": "kickside.kb10:target_db", "value": "app:db"},
                {"name": "kickside.knowledge:api_router", "value": "app:api"},
            ],
            gate.declared_install_parameters("kickside/kb10"),
        )
        self.assertEqual(
            [{"name": "kickside.knowledge:api_router", "value": "app:api"}],
            gate.declared_install_parameters("kickside/knowledge"),
        )


class LifecycleDefaultsTest(unittest.TestCase):
    def test_defaults_match_the_published_application_baseline(self):
        with patch.object(sys, "argv", [str(SCRIPT)]):
            args = LIFECYCLE.parse_args()

        self.assertEqual(["kickside/code-execution"], args.versioned_prerequisite)
        self.assertEqual("library", args.cross_root_type)
        self.assertEqual("library", args.cross_transitive_type)
        self.assertEqual("library", args.versioned_root_type)


if __name__ == "__main__":
    unittest.main()

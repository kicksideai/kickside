"""Regression tests for dependency-safe module release ordering."""

from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "release_order.py"
SPEC = importlib.util.spec_from_file_location("release_order", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
RELEASE_ORDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(RELEASE_ORDER)


class ReleaseOrderTest(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)

    def module(self, relative: str, identity: str, dependencies: tuple[str, ...] = ()):
        organization, name = identity.split("/", 1)
        module = self.root / relative
        source = module / "src"
        source.mkdir(parents=True)
        (module / "wippy.yaml").write_text(
            f"organization: {organization}\nmodule: {name}\ntype: plugin\n"
        )
        entries = [
            "version: '1.0'",
            f"namespace: {organization}.{name}",
            "entries:",
            "  - name: definition",
            "    kind: ns.definition",
        ]
        for index, dependency in enumerate(dependencies):
            entries.extend(
                [
                    f"  - name: dep.{index}",
                    "    kind: ns.dependency",
                    f"    component: {dependency}",
                    "    version: '*'",
                ]
            )
        (source / "_index.yaml").write_text("\n".join(entries) + "\n")

    def relative_order(self, requested: list[str] | None = None) -> list[str]:
        return [
            module.relative_to(self.root).as_posix()
            for module in RELEASE_ORDER.ordered_modules(self.root, requested)
        ]

    def test_explicit_consumer_includes_transitive_local_dependencies(self):
        self.module("core/base", "kickside/base")
        self.module("platform/provider", "kickside/provider", ("kickside/base",))
        self.module("platform/consumer", "kickside/consumer", ("kickside/provider",))
        self.module("platform/unrelated", "kickside/unrelated")

        self.assertEqual(
            ["core/base", "platform/provider", "platform/consumer"],
            self.relative_order(["platform/consumer"]),
        )

    def test_explicit_arguments_cannot_force_consumer_before_provider(self):
        self.module("platform/provider", "kickside/provider")
        self.module("platform/consumer", "kickside/consumer", ("kickside/provider",))

        self.assertEqual(
            ["platform/provider", "platform/consumer"],
            self.relative_order(["platform/consumer", "platform/provider"]),
        )

    def test_cycle_in_selected_closure_fails_closed(self):
        self.module("platform/one", "kickside/one", ("kickside/two",))
        self.module("platform/two", "kickside/two", ("kickside/one",))

        with self.assertRaisesRegex(RuntimeError, "local module dependency cycle"):
            self.relative_order(["platform/one"])

    def test_unknown_or_duplicate_selection_fails(self):
        self.module("platform/one", "kickside/one")
        with self.assertRaisesRegex(RuntimeError, "not a local production module"):
            self.relative_order(["platform/missing"])
        with self.assertRaisesRegex(RuntimeError, "duplicate module argument"):
            self.relative_order(["platform/one", "platform/one"])

    def test_duplicate_local_module_identity_fails_closed(self):
        self.module("core/one", "kickside/shared")
        self.module("platform/two", "kickside/shared")
        with self.assertRaisesRegex(RuntimeError, "duplicate local module identity kickside/shared"):
            self.relative_order()


if __name__ == "__main__":
    unittest.main()

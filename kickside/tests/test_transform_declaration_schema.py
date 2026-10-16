#!/usr/bin/env python3
"""The Data Sync install schema must accept every transform declaration field."""

from __future__ import annotations

import re
import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
STRATEGIES = ROOT / "platform/transform/src/strategy"
SYNC_INDEX = ROOT / "platform/sync/src/_index.yaml"

DECLARATION_READ = re.compile(
    r"\((?:c|config)\s*::[^)]+\)(?:\.([A-Za-z_][A-Za-z0-9_]*)|\[\"([^\"]+)\"\])"
)


def consumed_fields() -> set[str]:
    found: set[str] = {"kind"}
    for path in STRATEGIES.glob("*.lua"):
        lines = [line for line in path.read_text(encoding="utf-8").splitlines()
                 if not line.lstrip().startswith("--")]
        for match in DECLARATION_READ.finditer("\n".join(lines)):
            found.add(match.group(1) or match.group(2))
    return found


def sync_transform_schema() -> dict:
    document = yaml.safe_load(SYNC_INDEX.read_text(encoding="utf-8")) or {}
    for entry in document.get("entries") or []:
        if not isinstance(entry, dict):
            continue
        meta = entry.get("meta") or {}
        inputs = meta.get("inputs") or {}
        transform = (inputs.get("properties") or {}).get("transform")
        if isinstance(transform, dict):
            return transform
    raise AssertionError("kickside/sync declares no install input schema for transform")


class TransformDeclarationSchema(unittest.TestCase):
    def test_sync_install_schema_declares_every_consumed_transform_field(self) -> None:
        # The strategy bindings read the declaration the installer
        # stores, so a field it consumes that the schema closes over cannot be
        # configured at install time.
        schema = sync_transform_schema()
        declared = set((schema.get("properties") or {}).keys())
        consumed = consumed_fields()
        self.assertIn("expr", consumed)
        self.assertIn("function", consumed)
        self.assertIn("required_mask", consumed)
        self.assertEqual(sorted(consumed - declared), [])

    def test_transform_declaration_stays_closed(self) -> None:
        # The parity check above only holds while the schema enumerates its
        # fields instead of accepting anything.
        self.assertIs(sync_transform_schema().get("additionalProperties"), False)


if __name__ == "__main__":
    unittest.main()

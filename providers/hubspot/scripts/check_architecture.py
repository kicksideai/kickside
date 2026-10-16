#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []

for path in sorted((ROOT / "src").rglob("*.lua")):
    text = path.read_text()
    if re.search(r"\bany\b", text):
        errors.append(f"{path.relative_to(ROOT)}: production values must be narrowed from unknown, never any")
    if len(text.splitlines()) > 600:
        errors.append(f"{path.relative_to(ROOT)}: mixed responsibility file exceeds 600 lines")

for path in sorted((ROOT / "src").rglob("*_test.lua")):
    errors.append(f"{path.relative_to(ROOT)}: tests belong in the standalone harness")

for path in sorted((ROOT / "src").rglob("*.yaml")):
    if re.search(r"\btype:\s*test\b", path.read_text()):
        errors.append(f"{path.relative_to(ROOT)}: tests must not be published with the provider")

suite_index = (ROOT / "test" / "suites" / "_index.yaml").read_text()
for name in ("api_test", "config_test", "object_sink_test", "pull_core_test", "traits_test"):
    if f"name: {name}" not in suite_index or f"source: file://{name}.lua" not in suite_index:
        errors.append(f"test/suites/_index.yaml: standalone {name} coverage is missing")

if errors:
    for error in errors:
        print(error)
    raise SystemExit(1)
print("HubSpot architecture: typed production boundaries, focused libraries, standalone tests.")

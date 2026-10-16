#!/usr/bin/env python3
"""Print production hot-query source locations for plan-review evidence.

The inventory is extracted from the production source used by this worktree,
so a reviewer can compare every bounded/due scanner with runner.check_plans.
"""
import re
import sys
from pathlib import Path


FILES = (
    "core/jobs/src/persist/claim.lua",
    "core/jobs/src/persist/wake.lua",
    "core/core/src/retention/prune.lua",
    "core/core/src/threads/persist/reader.lua",
    "platform/automation/src/drive.lua",
    "platform/automation/src/command.lua",
    "platform/automation/src/round/ledger.lua",
    "platform/automation/src/round/reconcile.lua",
    "platform/workflows/src/runs/maintenance.lua",
)
TABLE = re.compile(r"\b(?:FROM|JOIN)\s+([a-z_][a-z_0-9]*)|:from\([\"']([a-z_][a-z_0-9]*)",
                   re.I)
START = re.compile(r"\bSELECT\b|sql\.builder\.select\(", re.I)
HOT = re.compile(r"\bORDER BY\b|:order_by\(|\bLIMIT\b|:limit\(|\bMIN\(|wake_generation", re.I)


def main():
    root = Path(sys.argv[1])
    print("Production hot-query source inventory (generated from Lua source):")
    found = set()
    for name in FILES:
        lines = (root / name).read_text().splitlines()
        constants = dict(re.findall(r"\b([A-Za-z_]+)\.TABLE\s*=\s*[\"']([a-z_0-9]+)",
                                    "\n".join(lines)))
        for index, line in enumerate(lines):
            if not START.search(line):
                continue
            snippet = " ".join(lines[index:index + 10])
            if not HOT.search(snippet):
                continue
            tables = {a or b for a, b in TABLE.findall(snippet)}
            tables.update(table for symbol, table in constants.items()
                          if symbol + ".TABLE" in snippet)
            tables = {table for table in tables if table.startswith("kickside_")
                      or table == "workflow_runs"}
            if tables:
                found.update(tables)
                print(f"  {name}:{index + 1} {'/'.join(sorted(tables))}")
    required = {"kickside_job", "kickside_event", "kickside_thread",
                "kickside_thread_edge", "kickside_automation_drive",
                "kickside_retention_pin", "kickside_projection_cursor",
                "kickside_wake_fanout", "kickside_automation_receipt",
                "kickside_automation_command", "kickside_trigger_item_ledger",
                "workflow_runs"}
    missing = required - found
    if missing:
        raise SystemExit("hot-query source inventory missed " + ", ".join(sorted(missing)))
    plans = (root / "ops/load/src/load/driver_worker.lua").read_text()
    uncovered = {table for table in required if table not in plans}
    if uncovered:
        raise SystemExit("hot-query plan check omits " + ", ".join(sorted(uncovered)))
    if "wake_generation>wake_applied_generation" not in plans.replace(" ", ""):
        raise SystemExit("hot-query plan check omits drive wake mismatch")


if __name__ == "__main__":
    main()

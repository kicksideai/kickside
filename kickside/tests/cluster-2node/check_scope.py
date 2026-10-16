#!/usr/bin/env python3
"""Required cluster-off scope compatibility check; no runtime sources are changed."""
from __future__ import annotations

import argparse
import errno
import json
import os
from pathlib import Path
import pty
import shutil
import subprocess
import sys
import uuid


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bin", type=Path, default=Path(os.environ.get("E2E_BIN", "wippy")))
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    root = args.out / ("scope-off-" + uuid.uuid4().hex[:12])
    root.mkdir(parents=True)
    shutil.copytree(Path(__file__).parent / "scope", root / "src")
    (root / "wippy.lock").write_text("directories:\n  modules: .wippy\n  src: ./src\n")
    (root / ".wippy.yaml").write_text(
        'version: "1.0"\ncluster:\n  enabled: false\nlogger:\n  level: error\n')
    command = [str(args.bin), "run", "-x", "cluster_test:scope_probe"]
    master, slave = pty.openpty()
    try:
        child = subprocess.Popen(command, cwd=root, stdin=slave, stdout=slave, stderr=slave)
    finally:
        os.close(slave)
    chunks = []
    try:
        while True:
            try:
                chunk = os.read(master, 65536)
            except OSError as exc:
                if exc.errno != errno.EIO:
                    raise
                break
            if not chunk:
                break
            chunks.append(chunk)
    finally:
        os.close(master)
    exit_code = child.wait()
    output = b"".join(chunks).decode(errors="replace")
    (root / "runtime.log").write_text(output)
    results = []
    for line in output.splitlines():
        if line.startswith("SCOPE_RESULT "):
            results.append(json.loads(line.removeprefix("SCOPE_RESULT ")))
    evidence = {"command": command, "cluster_enabled": False,
                "runtime_exit": exit_code, "scopes": results}
    (root / "results.json").write_text(json.dumps(evidence, indent=2) + "\n")
    print(output, end="")
    print(f"Evidence: {root}")
    if {row["scope"] for row in results} != {"LOCAL", "EVENTUAL", "CONSISTENT", "STRONG"}:
        print("FAIL: runtime did not execute every scope probe", file=sys.stderr)
        return 1
    local = next(row for row in results if row["scope"] == "LOCAL")
    consistent = next(row for row in results if row["scope"] == "CONSISTENT")
    if not all(local[key] for key in ("registered", "resolves_to_self", "removed")):
        print("FAIL: LOCAL control failed; scope compatibility is inconclusive", file=sys.stderr)
        return 1
    if not all(consistent[key] for key in ("registered", "resolves_to_self", "removed")):
        print("STOP: CONSISTENT registration does not work with clustering disabled: "
              + consistent["error"], file=sys.stderr)
        return 1
    if exit_code:
        print(f"FAIL: runtime exited {exit_code}", file=sys.stderr)
        return 1
    print("PASS: CONSISTENT scope preserves cluster-off registration, lookup and release")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

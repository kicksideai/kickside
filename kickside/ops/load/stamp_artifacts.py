#!/usr/bin/env python3
"""Publish this run's CSV/JSON evidence with an explicit non-verdict mode.

Raw exports stay in the disposable runtime until host isolation is known.
Each final CSV row or JSON record states both run mode and host isolation.
"""
import csv
import json
import sys
from pathlib import Path


def stamp_json(value, mode, isolation):
    if isinstance(value, list):
        return [stamp_json(item, mode, isolation) for item in value]
    if isinstance(value, dict):
        result = {key: stamp_json(item, mode, isolation)
                  for key, item in value.items()}
        result["run_mode"] = mode
        result["host_isolation"] = isolation
        return result
    return value


def main():
    source, destination = Path(sys.argv[1]), Path(sys.argv[2])
    run_id, mode, isolation = sys.argv[3:6]
    if mode not in {"SMOKE", "UNISOLATED", "ISOLATED"}:
        raise SystemExit("invalid artifact run mode")
    if isolation not in {"UNISOLATED", "ISOLATED"}:
        raise SystemExit("invalid artifact host isolation")
    files = sorted((*source.glob(f"{run_id}*.csv"),
                    *source.glob(f"{run_id}*.json")))
    if not files:
        raise SystemExit("no evidence artifacts to publish")
    destination.mkdir(parents=True, exist_ok=True)
    for path in files:
        output = destination / path.name
        if path.suffix == ".csv":
            with path.open(newline="") as handle:
                reader = csv.DictReader(handle)
                if not reader.fieldnames:
                    raise SystemExit(f"artifact has no header: {path.name}")
                fields = [field for field in reader.fieldnames
                          if field not in {"run_mode", "host_isolation"}]
                rows = list(reader)
            with output.open("w", newline="") as handle:
                writer = csv.DictWriter(handle,
                                        fieldnames=[*fields, "run_mode", "host_isolation"])
                writer.writeheader()
                for row in rows:
                    writer.writerow({**row, "run_mode": mode,
                                     "host_isolation": isolation})
        else:
            value = json.loads(path.read_text())
            output.write_text(json.dumps(stamp_json(value, mode, isolation), indent=2) + "\n")
    print(f"Published {len(files)} {mode}/{isolation} evidence artifacts")


if __name__ == "__main__":
    main()

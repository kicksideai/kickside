"""Native compatibility rehearsal detects corruption that occurs only on repeat."""
import os
from pathlib import Path
import tempfile
import unittest

from ops.compat.migrations import rehearse


def migration(timestamp, statements):
    source = ["local sql = require('sql')", "return {migrate = function()",
              "local db, err = sql.get('app:db')", "if err then error(tostring(err)) end"]
    for statement in statements:
        source.extend(["local _, write_err = db:execute([=[" + statement + "]=])",
                       "if write_err then db:release(); error(tostring(write_err)) end"])
    source.extend(["db:release()", "return {failed = 0}", "end}"])
    return {"Kind": "function.lua", "Meta": {"type": "migration", "timestamp": timestamp},
            "Data": {"source": "\n".join(source), "method": "migrate", "modules": ["sql"]}}


class MigrationRepeatTests(unittest.TestCase):
    def test_repeat_checks_new_data_preservation_on_both_engines(self):
        with tempfile.TemporaryDirectory(dir=os.environ["TMPDIR"]) as directory:
            self.verify(("sqlite", "postgres"), Path(directory))

    def verify(self, engines, evidence):
        evidence.mkdir(parents=True, exist_ok=True)
        old = {"compat.baseline:create": migration("2026-01-01", [
            "CREATE TABLE compat_existing (id TEXT PRIMARY KEY, value TEXT NOT NULL)"])}
        recipe = {"compat.update:create": {
            "seed": ["INSERT INTO compat_existing VALUES ('published', 'unchanged')"],
            "assertions": [{"query": "SELECT id, value FROM compat_existing",
                            "rows": [{"id": "published", "value": "unchanged"}]}],
            "after": [{"query": "SELECT n FROM compat_update_receipt", "rows": [{"n": 1}]}]}}
        for engine in engines:
            for case, update in (
                ("corrupt", "ON CONFLICT (id) DO UPDATE SET n=compat_update_receipt.n+1"),
                ("safe", "ON CONFLICT (id) DO NOTHING"),
            ):
                with self.subTest(engine=engine, case=case):
                    current = dict(old, **{"compat.update:create": migration("2026-01-02", [
                        "CREATE TABLE IF NOT EXISTS compat_update_receipt (id TEXT PRIMARY KEY, n INTEGER NOT NULL)",
                        "INSERT INTO compat_update_receipt VALUES ('update', 1) " + update])})
                    work = evidence / (engine + "-" + case)
                    if case == "corrupt":
                        with self.assertRaisesRegex(ValueError, "^migration command fails; see " + engine + "-update.log$"):
                            rehearse(old, current, work, recipe, engines=(engine,))
                        log = (work / (engine + "-update.log")).read_text()
                        self.assertIn('SELECT n FROM compat_update_receipt: n: expected "1", got "2"', log)
                        self.assertIn("FAILED", log)
                    else:
                        result = rehearse(old, current, work, recipe, engines=(engine,))
                        self.assertEqual(result["engines"][engine]["status"], "pass")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--engine", choices=("sqlite", "postgres"))
    parser.add_argument("--evidence", type=Path, default=Path(os.environ["TMPDIR"]))
    args = parser.parse_args()
    MigrationRepeatTests().verify((args.engine,) if args.engine else ("sqlite", "postgres"), args.evidence)

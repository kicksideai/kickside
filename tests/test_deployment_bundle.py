# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import importlib.util
import io
import json
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch


spec = importlib.util.spec_from_file_location(
    "deployment_bundle", Path(__file__).resolve().parents[1] / ".github/scripts/deployment_bundle.py")
bundle = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bundle)


class DeploymentBundleTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        app = self.root / "app"
        app.mkdir()
        (app / "version.txt").write_text("0.2.24\n")
        (app / "wippy.lock").write_text("modules: []\n")
        (app / ".wippy.yaml").write_text("version: '1.0'\n")
        self.snapshot = self.root / "kickside.wapp"
        self.snapshot.write_bytes(b"application bytes")
        self.launcher = self.root / "launcher"
        self.launcher.write_bytes(b"launcher bytes")
        entries = []
        self.dependencies = []
        for name in ("first", "second"):
            data = (name + " module").encode()
            checksum = bundle.digest(data).removeprefix("sha256:")
            source = ".wippy/vendor/acme/" + name + "-1.0.0.wapp"
            path = app / source
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            self.dependencies.append(path)
            entries.append({"path": source.removesuffix(".wapp") + ".sha256-" + checksum + ".wapp",
                            "sha256": checksum, "source": source})
        checksum = bundle.digest(self.snapshot.read_bytes()).removeprefix("sha256:")
        entries.append({"path": ".wippy/vendor/kickside/kickside-0.2.24.sha256-" + checksum + ".wapp",
                        "sha256": checksum, "source": "kickside.wapp"})
        self.dependencies.append(self.snapshot)
        self.index = self.root / "dependencies.json"
        self.index.write_text(json.dumps(entries))

    def build(self):
        return bundle.build_bundle(self.root, self.snapshot, "kickside-v0.2.24", "a" * 40,
                                   "0.3.56a", "sha256:" + "b" * 64, "amd64", self.index, self.launcher)

    def test_valid_bundle_is_deterministic_and_preserves_dependency_bytes(self):
        data = self.build()
        self.assertEqual(data, self.build())
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
            self.assertEqual(archive.extractfile("kickside.wapp").read(), self.snapshot.read_bytes())
            manifest = json.load(archive.extractfile("deployment-manifest.json"))
            self.assertEqual(manifest["snapshot_digest"], bundle.digest(self.snapshot.read_bytes()))
            for entry, source in zip(manifest["dependencies"], self.dependencies):
                self.assertEqual(archive.extractfile(entry["path"]).read(), source.read_bytes())

    def test_expanded_budget_stops_before_reading_later_dependencies(self):
        fixed = sum(path.stat().st_size for path in (
            self.snapshot, self.launcher, self.root / "app/wippy.lock", self.root / "app/.wippy.yaml"))
        limit = fixed + self.dependencies[0].stat().st_size - 1
        with patch.object(bundle, "MAX_EXPANDED_BYTES", limit), patch.object(
                bundle, "read_file", wraps=bundle.read_file) as read:
            with self.assertRaisesRegex(ValueError, "expanded bundle exceeds"):
                self.build()
        paths = [call.args[0] for call in read.call_args_list]
        self.assertIn(self.dependencies[0], paths)
        self.assertNotIn(self.dependencies[1], paths)

    def test_expanded_budget_includes_manifest_and_accepts_exact_boundary(self):
        data = self.build()
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
            expanded = sum(member.size for member in archive.getmembers())
        with patch.object(bundle, "MAX_EXPANDED_BYTES", expanded):
            self.assertEqual(data, self.build())
        with patch.object(bundle, "MAX_EXPANDED_BYTES", expanded - 1):
            with self.assertRaisesRegex(ValueError, "expanded bundle exceeds"):
                self.build()


if __name__ == "__main__":
    unittest.main()

# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

import io
import json
import pathlib
import tarfile
import tempfile
import unittest
from unittest import mock

from deployment_bundle import build_bundle, digest
from deployment_runtime import install


class DeploymentBundleTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = pathlib.Path(self.directory.name)
        (self.root / "app").mkdir()
        (self.root / "app/version.txt").write_text("0.2.24\n")
        (self.root / "app/wippy.lock").write_text("locked module digests\n")
        (self.root / "app/.wippy.yaml").write_text("version: '1.0'\n")
        self.snapshot = self.root / "snapshot.wapp"
        self.snapshot.write_bytes(b"locked snapshot")

    def build(self, **overrides):
        args = dict(source=self.root, snapshot=self.snapshot, tag="kickside-v0.2.24", commit="a" * 40,
                    runtime_version="0.3.54a", runtime_digest="sha256:" + "b" * 64, architecture="amd64")
        args.update(overrides)
        return build_bundle(**args)

    def test_bundle_is_stable_and_binds_the_lock_and_snapshot(self):
        bundle = self.build()
        self.assertEqual(bundle, self.build())
        with tarfile.open(fileobj=io.BytesIO(bundle), mode="r:gz") as archive:
            self.assertEqual(archive.getnames(), ["kickside.wapp", "deployment-manifest.json"])
            metadata = json.load(archive.extractfile("deployment-manifest.json"))
        self.assertEqual(metadata["snapshot_digest"], digest(self.snapshot.read_bytes()))
        self.assertEqual(metadata["lock_digest"], digest((self.root / "app/wippy.lock").read_bytes()))
        self.assertEqual(metadata["config_digest"], digest((self.root / "app/.wippy.yaml").read_bytes()))
        (self.root / "app/wippy.lock").write_text("a different lock\n")
        self.assertNotEqual(bundle, self.build())

    def test_wrong_release_or_unbounded_identity_is_rejected(self):
        for changed in ({"tag": "kickside-v0.2.25"}, {"commit": "main"},
                        {"runtime_version": "latest"}, {"runtime_digest": "unknown"}, {"architecture": "aarch64"}):
            with self.assertRaises(ValueError):
                self.build(**changed)

    def test_symlink_and_empty_snapshot_are_rejected(self):
        self.snapshot.write_bytes(b"")
        with self.assertRaises(ValueError):
            self.build()
        self.snapshot.unlink()
        self.snapshot.symlink_to(self.root / "app/wippy.lock")
        with self.assertRaises(ValueError):
            self.build()

    def test_runtime_rejects_invalid_versions_before_download(self):
        with mock.patch("deployment_runtime.fetch") as fetch:
            with self.assertRaises(ValueError):
                install("latest", self.root / "runtime")
            fetch.assert_not_called()

    def test_runtime_rejects_a_foreign_platform_before_writing(self):
        with mock.patch("deployment_runtime.fetch", side_effect=[b"invalid ELF", b"A" * 88]):
            with self.assertRaises(ValueError):
                install("0.3.54a", self.root / "runtime")
        self.assertFalse((self.root / "runtime").exists())


if __name__ == "__main__":
    unittest.main()

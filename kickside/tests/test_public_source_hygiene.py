# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
from pathlib import Path
import subprocess
import json
import io
import re
import tarfile
import unittest

import yaml
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]


class PublicSourceHygieneTest(unittest.TestCase):
    def test_runtime_captures_stay_out_of_the_source_tree(self):
        tracked = subprocess.check_output(
            ["git", "ls-files", "--cached", "--ignored", "--exclude-standard", "scratchpad"],
            cwd=ROOT, text=True,
        ).splitlines()
        self.assertEqual(tracked, [])

    def test_blocks_harness_keeps_generated_modules_out_of_tracked_source(self):
        tracked = subprocess.check_output(["git", "ls-files", "platform/blocks"],
                                          cwd=ROOT, text=True).splitlines()
        captures = [path for path in tracked if "/.test-modules/" in path or path.endswith(".wapp")]
        self.assertEqual(captures, [])
        config = (ROOT / "platform/blocks/test/.wippy.yaml").read_text()
        self.assertIn("kickside/blocks: ..", config)
        self.assertTrue((ROOT / "platform/blocks/test/wippy.lock").is_file())

    def test_frontend_packages_have_one_served_output(self):
        for module in ("agents", "workflows"):
            with self.subTest(module=module):
                self.assertFalse((ROOT / "platform" / module / "ui/dist").exists())
                manifest = (ROOT / "platform" / module / "src/_index.yaml").read_text()
                self.assertIn("./static", manifest)

    def test_capture_rules_cover_arbitrary_scratchpad_locations(self):
        captures = ["scratchpad/" + directory + "capture" + suffix
                    for directory in ("", "lane/", "lane/nested/")
                    for suffix in (".png", ".jpg", ".jpeg", ".webp", ".db", ".db-wal", ".db-shm",
                                   ".sqlite", ".sqlite-wal", ".sqlite-shm", ".sqlite3", ".sqlite3-wal", ".sqlite3-shm",
                                   ".csv", ".jsonl", ".err")]
        captures += ["scratchpad/lane/captures/response.json",
                     "scratchpad/lane/forensics_dbcopies/backup",
                     "scratchpad/lane/promptmap/cache/result.json"]
        result = subprocess.run(
            ["git", "-c", "core.excludesFile=/dev/null", "check-ignore", "--no-index", "--stdin"],
            cwd=ROOT, input="\n".join(captures) + "\n", text=True, capture_output=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.splitlines(), captures)
        source = ["scratchpad/lane/report.md", "scratchpad/lane/source.lua", "scratchpad/lane/fixture.yaml"]
        result = subprocess.run(
            ["git", "-c", "core.excludesFile=/dev/null", "check-ignore", "--no-index", "--stdin"],
            cwd=ROOT, input="\n".join(source) + "\n", text=True, capture_output=True,
        )
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertEqual(result.stdout, "")

    def test_publication_boundary(self):
        prohibited = re.compile(
            r"spiral.?scout|landingwizard|\bwapps\b|ui[-_ ]?studio|kickside-[a-z]\b|wj\.wippy\.ai|"
            r"git\.wippy\.ai|100\.70\.\d+\.\d+|\btowers\b|"
            r"kickside-gate|wolfy-j|/home/[^/\s]+/kickside", re.IGNORECASE,
        )
        private = re.compile(
            r"(^|/)(ops|scratchpad|helm|evidence|internal|runbooks|handbook)/|"
            r"\.py[wco]?$|\.(test|spec)\.[cm]?[jt]sx?$|"
            r"(^|/)(AGENTS|CLAUDE|REPORT|MEMORY|SECURITY-REVIEW)\.md$"
        )
        roots = [ROOT] + sorted(path for path in ROOT.parent.iterdir()
                                if path != ROOT and (path / ".github/modules.json").is_file())
        findings = []
        for root in roots:
            archive = subprocess.check_output(["git", "archive", "--format=tar", "HEAD"], cwd=root)
            with tarfile.open(fileobj=io.BytesIO(archive)) as source:
                for member in source:
                    if not member.isfile():
                        continue
                    identity = root.name + "/" + member.name
                    if private.search(member.name):
                        findings.append(identity + ": private material")
                    content = source.extractfile(member).read()
                    if b"\x00" in content:
                        continue
                    legal = Path(member.name).name in {"LICENSE", "LICENSE.md", "CLA.md"}
                    for number, line in enumerate(content.decode("utf-8", errors="replace").splitlines(), 1):
                        if legal:
                            line = re.sub(r"spiral.?scout", "", line, flags=re.IGNORECASE)
                        if prohibited.search(line):
                            findings.append(f"{identity}:{number}: internal reference")
        self.assertEqual(findings, [])

    def test_repository_license_policy(self):
        policy = {
            'kickside': 'LicenseRef-KickSide-Community-1.0',
            'providers': 'LicenseRef-KickSide-Community-1.0',
            'crm': 'LicenseRef-KickSide-Community-1.0',
            'chestor': 'LicenseRef-KickSide-Community-1.0',
            'components': 'LicenseRef-KickSide-Community-1.0',
            'converters': 'MIT',
            'module': 'MIT',
        }
        for name, expected in policy.items():
            root = ROOT.parent / name
            catalog = json.loads((root / '.github/modules.json').read_text())
            for path in catalog['modules']:
                with self.subTest(repository=name, module=path):
                    manifest = yaml.safe_load((root / path / 'wippy.yaml').read_text())
                    self.assertEqual(manifest['license'], expected)
        self.assertTrue((ROOT.parent / 'docs/LICENSE').read_text().startswith(
            'Attribution 4.0 International'))

    def test_manifest_license_identifiers(self):
        roots = [ROOT] + sorted(path for path in ROOT.parent.iterdir()
                               if path != ROOT and (path / ".git").exists()
                               and (path / "LICENSE.md").is_file())
        for root in roots:
            paths = subprocess.check_output(["git", "ls-files", "**/wippy.yaml", "wippy.yaml"],
                                            cwd=root, text=True).splitlines()
            for path in paths:
                with self.subTest(repository=root.name, path=path):
                    text = (root / path).read_text()
                    for identifier in re.findall(r"(?m)^license:\s*[\"']?([^\"'\s]+)", text):
                        if "KickSide-Community" in identifier:
                            self.assertEqual(identifier, "LicenseRef-KickSide-Community-1.0")

        for name in subprocess.check_output(["git", "ls-files", "**/package.json"],
                                            cwd=ROOT, text=True).splitlines():
            identifier = json.loads((ROOT / name).read_text()).get("license", "")
            if isinstance(identifier, str) and "KickSide-Community" in identifier:
                self.assertEqual(identifier, "LicenseRef-KickSide-Community-1.0", name)

    def test_license_exemption_covers_only_the_licensor(self):
        def archive_for(text):
            stream = io.BytesIO()
            with tarfile.open(fileobj=stream, mode="w") as source:
                member = tarfile.TarInfo("LICENSE.md")
                data = text.encode()
                member.size = len(data)
                source.addfile(member, io.BytesIO(data))
            return stream.getvalue()

        legal = "Spiral Scout LLC d/b/a Wippy.AI\n"
        with patch("subprocess.check_output", return_value=archive_for(legal)):
            self.test_publication_boundary()
        with patch("subprocess.check_output", return_value=archive_for(legal + "https://wj.wippy.ai\n")):
            with self.assertRaises(AssertionError):
                self.test_publication_boundary()

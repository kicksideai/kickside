from pathlib import Path
import re
import unittest
import yaml

ROOT = Path(__file__).resolve().parents[1]


class DeeplinkConsolidationTest(unittest.TestCase):
    def test_modules_declare_floating_dependencies_and_no_release_version(self):
        for area in ("core", "platform"):
            for module in (ROOT / area).iterdir():
                manifest = module / "wippy.yaml"
                if not manifest.is_file():
                    continue
                with self.subTest(module=module.name):
                    self.assertNotIn("version", yaml.safe_load(manifest.read_text()))
                for path in (module / "src").rglob("*.yaml"):
                    document = yaml.safe_load(path.read_text())
                    for entry in document.get("entries", []) if isinstance(document, dict) else []:
                        if entry.get("kind") == "ns.dependency":
                            with self.subTest(path=path, entry=entry.get("name")):
                                self.assertEqual(entry.get("version"), "*")

    def test_readers_have_one_provider_metadata_spelling(self):
        for module in ("agents", "automation", "channel", "mcp", "sync"):
            for directory in ("src", "ui/src"):
                for path in (ROOT / "platform" / module / directory).rglob("*"):
                    if path.suffix in {".lua", ".vue", ".ts"}:
                        with self.subTest(path=path):
                            self.assertIsNone(re.search(r"(?:\.connection_provider\b|\bconnection_provider\s*[:=])", path.read_text()))

    def test_subject_lookup_declares_the_users_runtime_identity(self):
        entries = yaml.safe_load((ROOT / "platform/users/src/binding/_index.yaml").read_text())["entries"]
        lookup = next(entry for entry in entries if entry["name"] == "subject_lookup")
        self.assertEqual(lookup["security"]["actor"]["id"], "kickside.users.binding:subject_lookup")
        self.assertIn("kickside.users.security:login_db_access", lookup["security"]["policies"])

    def test_resource_requirements_declare_the_supported_planner_vocabulary(self):
        supported = {"function.lua", "env.storage", "fs.directory", "http.router", "http.service",
                     "process.host", "security.policy", "security.scope"}
        scalar = {"admin_lifecycle_grant", "archive_max_zip_bytes", "database_resource",
                  "component_lifecycle_impl", "document_image_artifacts_enabled",
                  "facade_static_no_store", "lifecycle_impl", "login_role_resource",
                  "storage_s3", "target_db", "user_lifecycle_grant"}
        for area in ("core", "platform"):
            for module in (ROOT / area).iterdir():
                for path in (module / "src").rglob("*.yaml"):
                    document = yaml.safe_load(path.read_text())
                    for entry in document.get("entries", []) if isinstance(document, dict) else []:
                        if entry.get("kind") == "ns.requirement" and entry["name"] not in scalar:
                            with self.subTest(path=path, entry=entry["name"]):
                                self.assertIn((entry.get("meta") or {}).get("value_kind"), supported)

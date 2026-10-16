"""Regression tests for declarative KickSide module types."""

from __future__ import annotations

import importlib.util
import tempfile
import unittest
import yaml
import json
import os
import shutil
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "check-release-hygiene.py"
SPEC = importlib.util.spec_from_file_location("check_release_hygiene", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
HYGIENE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(HYGIENE)


class ModuleTypeHygieneTest(unittest.TestCase):
    def module(self, relative: str, manifest_type: str | None, make_type: str | None = None):
        temporary = tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent)
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name)
        release_config = root / "release"
        release_config.mkdir()
        (release_config / "private-orgs.txt").write_text("acme\n")
        (release_config / "private-app-components.txt").write_text(
            "acme/orders\nacme/pim\n"
        )
        module = root / relative
        module.mkdir(parents=True)

        fields = ["organization: kickside", "module: example"]
        if manifest_type is not None:
            fields.append(f"type: {manifest_type}")
        if relative == "app":
            fields.extend(
                [
                    "exclude:",
                    "  - wippy.lock",
                    "publish:",
                    "  runtime:",
                    "    sections:",
                    "      - registry",
                ]
            )
        (module / "wippy.yaml").write_text("\n".join(fields) + "\n")
        make_lines = ["VIS := public"]
        if make_type is not None:
            make_lines.append(f"TYPE := {make_type}")
        (module / "Makefile").write_text("\n".join(make_lines) + "\n")
        if relative == "app":
            (module / "wippy.lock").write_text("modules: []\n")
            (module / ".wippy.yaml").write_text(
                "registry:\n  history_type: memory\n"
                "profiles:\n  postgres:\n    registry:\n      history_type: postgres\n"
                "      history_dsn: 'postgres://${postgres_username}:${postgres_password}@"
                "${postgres_host}:${postgres_port}/${postgres_database}?sslmode=${postgres_sslmode}'\n"
                "      history_schema: ${postgres_history_schema}\n"
            )
        source = module / "src"
        source.mkdir()
        (source / "_index.yaml").write_text(
            "namespace: kickside.example\n"
            "entries:\n"
            "  - name: definition\n"
            "    kind: ns.definition\n"
        )
        return root, module

    def errors(self, relative: str, manifest_type: str | None, make_type: str | None = None):
        root, module = self.module(relative, manifest_type, make_type)
        return HYGIENE.check_module(root, module)

    def test_repository_discovery_supports_companion_layouts_without_harnesses(self):
        temporary = tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent)
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name)
        provider = root / "telegram"
        provider.mkdir()
        (provider / "wippy.yaml").write_text("type: plugin\n")
        nested_harness = provider / "test" / "eval"
        nested_harness.mkdir(parents=True)
        (nested_harness / "wippy.yaml").write_text("type: application\n")

        self.assertEqual([provider], HYGIENE.production_modules(root))

    def test_manifest_type_is_required(self):
        self.assertIn(
            "platform/example: wippy.yaml must declare type",
            self.errors("platform/example", None),
        )

    def test_makefile_and_manifest_types_must_match(self):
        self.assertIn(
            "platform/example: Makefile TYPE=plugin does not match wippy.yaml type=library",
            self.errors("platform/example", "library", "plugin"),
        )

    def test_only_root_is_an_application(self):
        self.assertIn(
            "platform/example: only the root app may be published as type application",
            self.errors("platform/example", "application"),
        )
        self.assertIn(
            "app: root app must be published as type application",
            self.errors("app", "plugin"),
        )

    def test_matching_plugin_is_valid(self):
        self.assertEqual([], self.errors("platform/example", "plugin", "plugin"))

    def test_publish_visibility_is_required(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        (module / "Makefile").unlink()
        self.assertIn(
            "platform/example: publish visibility must be declared",
            HYGIENE.check_module(root, module),
        )

    def test_only_configured_organizations_may_be_private(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        (module / "Makefile").write_text("TYPE := plugin\nVIS := private\n")
        self.assertIn(
            "platform/example: only organizations listed in release/private-orgs.txt may be private; "
            "kickside/* must be public for Hub discovery",
            HYGIENE.check_module(root, module),
        )

        (module / "wippy.yaml").write_text(
            "organization: acme\nmodule: orders\ntype: plugin\n"
        )
        self.assertNotIn(
            "platform/example: only organizations listed in release/private-orgs.txt may be private",
            "\n".join(HYGIENE.check_module(root, module)),
        )

        (module / "Makefile").write_text("TYPE := plugin\nVIS := public\n")
        self.assertIn(
            "platform/example: organizations listed in release/private-orgs.txt must remain private",
            HYGIENE.check_module(root, module),
        )

    def test_missing_private_organization_config_means_no_private_organizations(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        (root / "release" / "private-orgs.txt").unlink()
        (module / "Makefile").write_text("TYPE := plugin\nVIS := private\n")
        self.assertIn(
            "platform/example: only organizations listed in release/private-orgs.txt may be private; "
            "kickside/* must be public for Hub discovery",
            HYGIENE.check_module(root, module),
        )

    def test_private_app_component_denylist_is_read_from_config(self):
        root, module = self.module("app", "application")
        (module / "src" / "_index.yaml").write_text(
            "namespace: app\n"
            "entries:\n"
            "  - name: orders\n"
            "    kind: ns.dependency\n"
            "    component: acme/orders\n"
            "    version: '*'\n"
        )
        self.assertIn(
            "app/src/_index.yaml: lean app must not include acme/orders",
            HYGIENE.check_module(root, module),
        )

    def test_literal_publish_visibility_is_enforced_for_application(self):
        root, module = self.module("app", "application")
        (module / "Makefile").write_text(
            "publish:\n"
            "\twippy publish --create --module-visibility private "
            "--module-type application\n"
        )
        self.assertIn(
            "app: only organizations listed in release/private-orgs.txt may be private; "
            "kickside/* must be public for Hub discovery",
            HYGIENE.check_module(root, module),
        )

        (module / "Makefile").write_text(
            "publish:\n"
            "\twippy publish --create --module-visibility public "
            "--module-type application\n"
        )
        self.assertNotIn(
            "app: only organizations listed in release/private-orgs.txt may be private",
            "\n".join(HYGIENE.check_module(root, module)),
        )

    def test_published_application_excludes_development_lock(self):
        root, module = self.module("app", "application")
        manifest = (module / "wippy.yaml").read_text()
        (module / "wippy.yaml").write_text(
            manifest.replace("exclude:\n  - wippy.lock\n", "")
        )
        self.assertIn(
            "app: published application must exclude wippy.lock",
            HYGIENE.check_module(root, module),
        )

    def test_test_locks_keep_modules_and_no_replacements(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        test_dir = module / "test"
        test_dir.mkdir()
        lock = test_dir / "wippy.lock"

        lock.write_text(
            "modules:\n"
            "  - name: kickside/example-harness\n"
            "    version: 0.1.0\n"
            "replacements:\n"
            "  - from: kickside/example-harness\n"
            "    to: .\n"
        )
        errors = HYGIENE.check_module(root, module)
        self.assertIn(
            "platform/example/test/wippy.lock: test replacements belong in .wippy.yaml "
            "workspace.replacements, not the lock",
            errors,
        )

        lock.write_text("directories:\n  src: ../src\n")
        self.assertIn(
            "platform/example/test/wippy.lock: test lock must retain a non-empty module graph",
            HYGIENE.check_module(root, module),
        )

    def test_test_locks_pin_exact_hub_versions(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        test_dir = module / "test"
        test_dir.mkdir()
        lock = test_dir / "wippy.lock"
        lock.write_text(
            "modules:\n"
            "  - name: kickside/example-harness\n"
            "    version: '>=0.1.0'\n"
        )

        self.assertIn(
            "platform/example/test/wippy.lock:kickside/example-harness: "
            "test lock must pin an exact Hub version, not '>=0.1.0'",
            HYGIENE.check_module(root, module),
        )

    def test_production_dependencies_require_explicit_forward_resolvable_versions(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        index = module / "src" / "_index.yaml"
        index.write_text(
            "namespace: kickside.example\n"
            "entries:\n"
            "  - name: definition\n"
            "    kind: ns.definition\n"
            "  - name: missing\n"
            "    kind: ns.dependency\n"
            "    component: kickside/missing\n"
        )
        self.assertIn(
            "platform/example/src/_index.yaml:missing: dependency version must be explicit "
            "and forward-resolvable (for example '*' or '>=1.2.3')",
            HYGIENE.check_module(root, module),
        )

        index.write_text(index.read_text() + "    version: '*'\n")
        self.assertNotIn(
            "dependency version must be explicit",
            "\n".join(HYGIENE.check_module(root, module)),
        )

    def test_test_replacements_must_not_escape_repository(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        test_dir = module / "test"
        test_dir.mkdir()
        (test_dir / ".wippy.yaml").write_text(
            "workspace:\n"
            "  replacements:\n"
            "    kickside/example: ..\n"
            "    kickside/example-harness: .\n"
            "    kickside/component: ../../../../component\n"
        )

        errors = HYGIENE.check_module(root, module)
        self.assertNotIn(
            "platform/example/test/.wippy.yaml:kickside/example:",
            "\n".join(errors),
        )
        self.assertNotIn(
            "platform/example/test/.wippy.yaml:kickside/example-harness:",
            "\n".join(errors),
        )
        self.assertIn(
            "platform/example/test/.wippy.yaml:kickside/component: test replacement "
            "'../../../../component' escapes the repository; keep self/harness replacements "
            "local and resolve dependencies from the exact test lock",
            errors,
        )

    def test_test_replacement_symlinks_must_not_escape_repository(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        external = tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent)
        self.addCleanup(external.cleanup)
        test_dir = module / "test"
        test_dir.mkdir()
        (test_dir / "external-dependency").symlink_to(
            Path(external.name), target_is_directory=True
        )
        (test_dir / ".wippy.yaml").write_text(
            "workspace:\n"
            "  replacements:\n"
            "    kickside/component: external-dependency\n"
        )

        self.assertIn(
            "platform/example/test/.wippy.yaml:kickside/component: test replacement "
            "'external-dependency' escapes the repository; keep self/harness replacements "
            "local and resolve dependencies from the exact test lock",
            HYGIENE.check_module(root, module),
        )

    def test_reusable_package_requirements_reject_host_owned_defaults(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        source = module / "src" / "security"
        source.mkdir(parents=True, exist_ok=True)
        (source / "_index.yaml").write_text(
            """\
namespace: kickside.example.security
entries:
  - name: user_security_scope
    kind: ns.requirement
    targets: []
"""
        )
        self.assertEqual([], HYGIENE.check_module(root, module))

        (source / "_index.yaml").write_text(
            """\
namespace: kickside.example.security
entries:
  - name: user_security_scope
    kind: ns.requirement
    default: app.security:user
    targets: []
"""
        )
        self.assertIn(
            "platform/example/src/security/_index.yaml:"
            "kickside.example.security:user_security_scope:default: reusable package "
            "must not select host-owned resource 'app.security:user'; expose a requirement "
            "and let the application or test harness bind it",
            HYGIENE.check_module(root, module),
        )

    def test_automation_requires_an_explicit_host_binding(self):
        root, module = self.module("platform/automation", "plugin", "plugin")
        source = module / "src" / "engine"
        source.mkdir()
        declaration = """\
namespace: kickside.automation.engine
entries:
  - name: process_host
    kind: ns.requirement
    default: app:processes
    targets:
      - entry: kickside.automation.engine:composition_watcher.service
        path: .host
  - name: composition_watcher.service
    kind: process.service
    host: app:processes
"""
        path = source / "_index.yaml"
        path.write_text(declaration)
        self.assertTrue(any("must not select host-owned resource" in error
                            for error in HYGIENE.check_module(root, module)))
        for changed in (
            declaration.replace("app:processes", "app:other"),
            declaration.replace("composition_watcher.service", "other.service"),
            declaration.replace("kickside.automation.engine", "kickside.other.engine"),
        ):
            with self.subTest(declaration=changed):
                path.write_text(changed)
                self.assertTrue(any("must not select host-owned resource" in error
                                    for error in HYGIENE.check_module(root, module)))

    def test_reusable_packages_reject_seeded_host_resources(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        source = module / "src"
        source.mkdir(parents=True, exist_ok=True)
        (source / "_index.yaml").write_text(
            """\
namespace: kickside.example
entries:
  - name: definition
    kind: ns.definition
  - name: endpoint
    kind: http.endpoint
    meta:
      comment: Documentation may mention app:api without becoming configuration.
      router: app:api
    method: GET
    path: /example
"""
        )
        self.assertIn(
            "platform/example/src/_index.yaml:kickside.example:endpoint:meta.router: "
            "reusable package must not select host-owned resource 'app:api'; expose a "
            "requirement and let the application or test harness bind it",
            HYGIENE.check_module(root, module),
        )

    def test_test_entries_may_use_application_stubs(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        source = module / "src"
        source.mkdir(parents=True, exist_ok=True)
        (source / "_index.yaml").write_text(
            """\
namespace: kickside.example
entries:
  - name: definition
    kind: ns.definition
  - name: conformance_test
    kind: function.lua
    meta:
      type: test
    imports:
      fixture: app:test_fixture
"""
        )
        self.assertEqual([], HYGIENE.check_module(root, module))

    def test_reusable_package_requirements_allow_internal_and_scalar_defaults(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        source = module / "src"
        source.mkdir(parents=True, exist_ok=True)
        (source / "_index.yaml").write_text(
            """\
namespace: kickside.example
entries:
  - name: definition
    kind: ns.definition
  - name: implementation
    kind: ns.requirement
    default: kickside.example:default_implementation
    targets: []
  - name: batch_size
    kind: ns.requirement
    default: 100
    targets: []
"""
        )
        self.assertEqual([], HYGIENE.check_module(root, module))

    def test_application_may_own_host_resource_defaults(self):
        root, module = self.module("app", "application")
        source = module / "src"
        source.mkdir(parents=True, exist_ok=True)
        (source / "_index.yaml").write_text(
            """\
namespace: app
entries:
  - name: definition
    kind: ns.definition
  - name: api_router
    kind: ns.requirement
    default: app:api
    targets: []
"""
        )
        self.assertEqual([], HYGIENE.check_module(root, module))

    def test_duplicate_registry_entry_ids_are_rejected(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        source = module / "src"
        nested = source / "nested"
        nested.mkdir(parents=True)
        (source / "_index.yaml").write_text(
            "namespace: kickside.example\n"
            "entries:\n"
            "  - name: definition\n"
            "    kind: ns.definition\n"
            "  - name: duplicate\n"
            "    kind: registry.entry\n"
        )
        (nested / "_index.yaml").write_text(
            "namespace: kickside.example\n"
            "entries:\n"
            "  - name: duplicate\n"
            "    kind: registry.entry\n"
        )

        self.assertIn(
            "platform/example: duplicate registry entry kickside.example:duplicate in "
            "platform/example/src/_index.yaml and platform/example/src/nested/_index.yaml",
            HYGIENE.check_module(root, module),
        )

    def test_publishable_module_requires_one_definition(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        source = module / "src"
        (source / "_index.yaml").write_text(
            "namespace: kickside.example\n"
            "entries: []\n"
        )
        self.assertIn(
            "platform/example: publishable module must contain exactly one ns.definition; found 0 (none)",
            HYGIENE.check_module(root, module),
        )

    def test_application_history_accepts_persisted_storage_and_size_profiles(self):
        config = yaml.safe_load((SCRIPT.parents[1] / "app/.wippy.yaml").read_text())
        self.assertEqual([], HYGIENE.check_application_history(config))

    def test_application_history_requires_valid_storage_configuration(self):
        config = yaml.safe_load((SCRIPT.parents[1] / "app/.wippy.yaml").read_text())
        for storage in ("sqlite", "postgres"):
            with self.subTest(storage=storage):
                registry = {"history_type": storage}
                self.assertTrue(HYGIENE.check_application_history({"registry": registry}))
        config["profiles"]["postgres"]["registry"]["history_schema"] = ""
        self.assertTrue(HYGIENE.check_application_history(config))
        config["profiles"]["postgres"]["registry"]["history_dsn"] = "postgres://fixed-host/fixed-database"
        self.assertTrue(HYGIENE.check_application_history(config))

    def test_test_replacements_accept_declared_sibling_module_sources(self):
        root, module = self.module("platform/example", "plugin", "plugin")
        sibling = root.parent / (root.name + "-providers")
        sibling.mkdir()
        self.addCleanup(shutil.rmtree, sibling)
        (sibling / ".github").mkdir()
        (sibling / ".github/modules.json").write_text(json.dumps({'modules': {'component': {'embed': []}}}))
        target = sibling / "component"
        target.mkdir()
        (target / "wippy.yaml").write_text("organization: kickside\nmodule: component\ntype: plugin\n")
        test_dir = module / "test"
        test_dir.mkdir()
        replacement = os.path.relpath(target, test_dir)
        config = test_dir / ".wippy.yaml"
        config.write_text(yaml.safe_dump({"workspace": {"replacements": {"kickside/component": replacement}}}))
        self.assertEqual([], HYGIENE.check_module(root, module))
        config.write_text(yaml.safe_dump({"workspace": {"replacements": {"kickside/wrong": replacement}}}))
        self.assertTrue(any("escapes the repository" in error for error in HYGIENE.check_module(root, module)))


    def test_application_publishes_registry_runtime_section(self):
        root, module = self.module("app", "application")
        (module / "wippy.yaml").write_text(
            "organization: kickside\n"
            "module: kickside\n"
            "type: application\n"
        )
        self.assertIn(
            "app: published application must include registry in publish.runtime.sections",
            HYGIENE.check_module(root, module),
        )


if __name__ == "__main__":
    unittest.main()

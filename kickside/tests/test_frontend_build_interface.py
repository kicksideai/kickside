from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MAKEFILE = (ROOT / "Makefile").read_text(encoding="utf-8")
POWERSHELL = (ROOT / "make.ps1").read_text(encoding="utf-8")
SEMVER = re.compile(r"^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$")


def build_recipe(makefile: str, target: str) -> str | None:
    """Return the recipe lines of `target`, or None when the target is absent."""
    lines = makefile.splitlines()
    for index, line in enumerate(lines):
        if line.startswith(f"{target}:"):
            recipe = []
            for candidate in lines[index + 1:]:
                if not candidate.startswith("\t"):
                    break
                recipe.append(candidate)
            return "\n".join(recipe)
    return None


def version_tuple(value: str) -> tuple[int, int, int]:
    match = SEMVER.fullmatch(value)
    if not match:
        raise ValueError(f"not a semantic version: {value!r}")
    return tuple(int(part) for part in match.groups())


class FrontendBuildInterfaceTest(unittest.TestCase):
    def test_local_frontend_gate_covers_every_module_source_and_bundle(self) -> None:
        import yaml

        config = yaml.safe_load((ROOT / ".pre-commit-config.yaml").read_text())
        hook = next(hook for repo in config["repos"] for hook in repo["hooks"]
                    if hook["id"] == "frontend-gate")
        pattern = re.compile(hook["files"])
        manifests = list(ROOT.glob("platform/*/ui/package.json"))
        self.assertGreater(len(manifests), 20)
        for manifest in manifests:
            with self.subTest(module=manifest.parent.parent.name):
                source = manifest.relative_to(ROOT).as_posix()
                bundle = (manifest.parent.parent / "static/index.js").relative_to(ROOT).as_posix()
                self.assertIsNotNone(pattern.search(source), source)
                self.assertIsNotNone(pattern.search(bundle), bundle)

    def test_plugin_template_declares_and_locks_its_local_typecheck_tool(self) -> None:
        directory = ROOT / "app/templates/plugin/ui"
        package = json.loads((directory / "package.json").read_text())
        lock = json.loads((directory / "package-lock.json").read_text())
        declared = package["devDependencies"]["vue-tsc"]
        self.assertTrue(declared.startswith("^"))
        self.assertEqual(lock["packages"][""]["devDependencies"]["vue-tsc"], declared)
        self.assertIn("vue-tsc", lock["packages"]["node_modules/vue-tsc"]["bin"])
        self.assertIn("typescript", package["devDependencies"])

    def test_managed_layout_line_resolves_each_test_and_typecheck_package(self) -> None:
        import subprocess

        for module, directory in (
            ("app-main", "app/frontend/applications/main"),
            ("agents", "platform/agents/ui"),
            ("settings", "platform/settings/ui"),
            ("plugin-template", "app/templates/plugin/ui"),
        ):
            for target in ("test", "typecheck"):
                with self.subTest(module=module, target=target):
                    result = subprocess.run(
                        ["make", "--no-print-directory", "-n", target, f"MOD={module}"],
                        cwd=ROOT, text=True, capture_output=True, check=True,
                    )
                    self.assertIn(f"cd {directory} &&", result.stdout)
                    if target == "typecheck":
                        self.assertIn("./node_modules/.bin/vue-tsc --noEmit -p tsconfig.json", result.stdout)
                    else:
                        self.assertIn("npm test", result.stdout)

    def test_public_login_line_builds_each_package_from_the_repository_root(self) -> None:
        import subprocess

        for module, directory in (
            ("app-main", "app/frontend/applications/main"),
            ("plugin-template", "app/templates/plugin/ui"),
            ("agents", "platform/agents/ui"),
        ):
            with self.subTest(module=module):
                result = subprocess.run(
                    ["make", "--no-print-directory", "-n", "test", f"MOD={module}"],
                    cwd=ROOT, text=True, capture_output=True, check=True,
                )
                self.assertIn(f"cd {directory} &&", result.stdout)
                self.assertIn("npm test", result.stdout)

    def test_image_stages_local_workspace_dependencies_before_npm_install(self) -> None:
        dockerfile = (ROOT / "Dockerfile").read_text(encoding="utf-8")
        web_stage = dockerfile.split(" AS web-build\n", 1)[1].split("\nFROM ", 1)[0]
        install = web_stage.index("&& npm ci")
        lock = json.loads((ROOT / "app/frontend/applications/main/package-lock.json").read_text())
        links = [name for name, package in lock["packages"].items() if package.get("link")]
        self.assertTrue(links)
        for name in links:
            package = lock["packages"][name]
            destination = "./app/frontend/applications/main/" + package["resolved"].rstrip("/") + "/"
            copies = [line for line in web_stage[:install].splitlines() if line.startswith("COPY ")]
            self.assertTrue(any(line.endswith(destination) for line in copies), destination)

    def test_runtime_image_removes_build_artifacts_before_copying_the_application(self) -> None:
        dockerfile = (ROOT / "Dockerfile").read_text()
        install_stage = dockerfile.split(" AS app-install\n", 1)[1].split("\nFROM ", 1)[0]
        command = install_stage.split("RUN --mount=type=secret,id=wippy_token", 1)[1]
        self.assertLess(command.index("wippy update"), command.index("rm -rf /app/.wippy/npm"))
        self.assertLess(command.index("wippy auth logout"), command.index("rm -rf /app/.wippy/npm"))
        runtime = dockerfile.rsplit("\nFROM ", 1)[1]
        self.assertIn("COPY --from=app-install --chown=kickside:kickside /app ./", runtime)
        self.assertNotIn("COPY --from=app-install /app/.wippy/npm", runtime)

    def test_app_build_checks_the_emitted_bundle(self) -> None:
        self.assertIn("node app/scripts/check-app-bundle.mjs", build_recipe(MAKEFILE, "build"))

    def test_typecheck_requires_the_local_tool_for_the_cloud_stage_build(self) -> None:
        import subprocess

        result = subprocess.run(
            ["make", "--no-print-directory", "-n", "typecheck", "MOD=plugin-template"],
            cwd=ROOT, text=True, capture_output=True, check=True,
        )
        self.assertIn("./node_modules/.bin/vue-tsc --noEmit", result.stdout)
        self.assertNotIn("no local vue-tsc, skipping", result.stdout)

    def test_typecheck_uses_package_local_vue_tsc(self) -> None:
        self.assertIn("./node_modules/.bin/vue-tsc --noEmit -p tsconfig.json", MAKEFILE)
        self.assertIn(r"& .\node_modules\.bin\vue-tsc.cmd --noEmit -p tsconfig.json", POWERSHELL)
        self.assertNotIn("npx vue-tsc", MAKEFILE)
        self.assertNotIn("npx vue-tsc", POWERSHELL)

    def test_typecheck_bootstraps_shared_widget_source_dependencies(self) -> None:
        self.assertIn("WIDGET_SOURCE_CONSUMERS", MAKEFILE)
        self.assertIn("$(MAKE) typecheck-shared", MAKEFILE)
        self.assertIn("platform/widgets/ui &&", MAKEFILE)
        self.assertIn("$WidgetSourceConsumers", POWERSHELL)
        self.assertIn("function Ensure-WidgetsTypecheckDependencies", POWERSHELL)

    def test_all_uses_the_shared_test_resolver(self) -> None:
        self.assertIn("$(MAKE) test MOD=$$m TEST_IF_PRESENT=--if-present", MAKEFILE)
        self.assertNotIn("cd $(call fe_dir,$$m) && npm test --if-present", MAKEFILE)
        self.assertIn("function Do-TestAll", POWERSHELL)
        self.assertIn("$m = Resolve-Module $Name", POWERSHELL)

    def test_every_typescript_package_locks_a_compatible_local_vue_tsc(self) -> None:
        invalid: list[str] = []
        for tsconfig in ROOT.glob("**/tsconfig.json"):
            if "node_modules" in tsconfig.parts:
                continue
            package_path = tsconfig.parent / "package.json"
            lock_path = tsconfig.parent / "package-lock.json"
            if not package_path.is_file():
                continue

            label = package_path.parent.relative_to(ROOT).as_posix()
            try:
                package = json.loads(package_path.read_text(encoding="utf-8"))
                lock = json.loads(lock_path.read_text(encoding="utf-8"))
                declared = package.get("devDependencies", {}).get("vue-tsc")
                locked = lock.get("packages", {}).get("node_modules/vue-tsc", {}).get("version")
                if not isinstance(declared, str) or not declared.startswith("^"):
                    raise ValueError("vue-tsc must use a compatible range")
                if not isinstance(locked, str):
                    raise ValueError("vue-tsc must be present in the lock")
                requested = version_tuple(declared[1:])
                resolved = version_tuple(locked)
                if resolved[0] != requested[0] or resolved < requested:
                    raise ValueError("lock does not satisfy the declared range")
            except (OSError, ValueError, json.JSONDecodeError):
                invalid.append(label)

        self.assertEqual(invalid, [])

    def test_every_module_build_delegates_to_the_root_interface(self) -> None:
        # The root Makefile is the only place that knows which packages consume
        # @kickside/ui-kit and materializes it before vite runs. A module whose
        # build target calls npm directly skips that step, so its build dies on
        # ENOENT for the stylesheet -- including under release.sh, which runs
        # `make -C <module> build`. app/templates/plugin is excluded: it is a
        # standalone starter copied out of this repository, where no root
        # Makefile exists above it.
        offenders: list[str] = []
        makefiles = [
            *sorted(ROOT.glob("platform/*/Makefile")),
        ]
        for makefile in makefiles:
            if not (makefile.parent / "ui/package.json").is_file():
                continue
            recipe = build_recipe(makefile.read_text(encoding="utf-8"), "build")
            label = makefile.relative_to(ROOT).as_posix()
            if recipe is None:
                offenders.append(f"{label}: no build target")
            elif "$(MAKE) -C" not in recipe or "build MOD=" not in recipe:
                offenders.append(f"{label}: {recipe.strip()}")

        app_recipe = build_recipe((ROOT / "app/Makefile").read_text(encoding="utf-8"), "build-app-main")
        self.assertIsNotNone(app_recipe)
        if "$(MAKE) -C .. build MOD=app-main" not in (app_recipe or ""):
            offenders.append(f"app/Makefile: {(app_recipe or '').strip()}")

        self.assertEqual(offenders, [], f"build targets bypassing the root interface: {offenders}")

    def test_every_module_bundle_mount_revalidates(self) -> None:
        # Every module serves its web component under a stable file name
        # (index.js), so without revalidation a browser keeps a cached bundle
        # and a shipped UI fix never reaches it.
        import yaml

        missing: list[str] = []
        for index in sorted(ROOT.glob("platform/*/src/_index.yaml")):
            document = yaml.safe_load(index.read_text(encoding="utf-8")) or {}
            for entry in document.get("entries") or []:
                if not isinstance(entry, dict) or entry.get("kind") != "http.static":
                    continue
                if not str(entry.get("fs") or "").endswith(":ui_fs"):
                    continue
                options = entry.get("options") or {}
                if str(options.get("cache") or "") != "no-cache":
                    missing.append(f"{index.parent.parent.name}:{entry.get('name')}")
        self.assertEqual(missing, [], f"module bundle mounts without cache: no-cache: {missing}")

    def test_sync_lock_matches_its_direct_css_tooling_dependencies(self) -> None:
        package_path = ROOT / "platform/sync/ui/package.json"
        lock_path = ROOT / "platform/sync/ui/package-lock.json"
        package = json.loads(package_path.read_text(encoding="utf-8"))
        lock = json.loads(lock_path.read_text(encoding="utf-8"))

        declared = package["devDependencies"]
        locked = lock["packages"][""]["devDependencies"]
        self.assertNotIn("postcss", package.get("overrides", {}))
        self.assertEqual(locked["postcss"], declared["postcss"])
        self.assertEqual(locked["tailwindcss"], declared["tailwindcss"])


if __name__ == "__main__":
    unittest.main()

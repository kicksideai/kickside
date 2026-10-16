"""Native published-account proofs for optional host credential guards."""
import json
from pathlib import Path
import socket
import uuid

import yaml

from ops.compat.integration.test_run_as_upgrade import (
    evidence_directory, make_runtime, materialize_published_modules, runtime_config,
)
from ops.compat.inventory import ROOT, discover
from ops.compat.migrations import command


def verify_credential_update(case, module, harness_path, suite, imports, modules,
                             engines, evidence_root, environment, extra_guards=None,
                             related_consumers=(), final_phases=(), host_capability=None, depends_on=()):
    extra_guards = extra_guards or {}
    label = module.split("/")[-1].replace("-", "_")
    requirement = module.replace("/", ".").replace("-", "_") + ":credential_eligibility"
    with evidence_directory(evidence_root) as directory:
        work = Path(directory)
        published = materialize_published_modules(work, (module, *related_consumers, "kickside/users", "kickside/execution"))
        runtime, source, harness = make_runtime(work, harness_path / "src", harness_path, suite,
                                               "run-as-" + label + "-upgrade", imports, modules, depends_on=depends_on)
        index_path = source / "_index.yaml"
        index = yaml.safe_load(index_path.read_text())
        dependency = next(row for row in index["entries"] if row.get("component") == module)
        parameters = [row for row in dependency["parameters"] if row["name"] != requirement]
        index["entries"].append({"name": "invalid_credential_guard", "kind": "function.lua",
            "source": "file://invalid_credential_guard.lua", "method": "check", "imports": {"plan": "app:compat_plan"}})
        (source / "invalid_credential_guard.lua").write_text(
            "local plan=require('plan')\nreturn {check=function()\n"
            "if plan.phase=='refusing_guard' then return false end\n"
            "if plan.phase=='malformed_guard' then return {} end\nreturn nil end}\n")
        for phase, guard in extra_guards.items():
            index["entries"].append({"name": guard["name"], "kind": "function.lua",
                "source": "file://" + guard["name"] + ".lua", "method": "check", "modules": guard["modules"]})
            (source / (guard["name"] + ".lua")).write_text(guard["source"])
        host_dependency = None
        host_parameters = []
        if host_capability:
            host_dependency = next((row for row in index["entries"]
                                    if row.get("component") == host_capability["module"]), None)
            if host_dependency is None:
                host_dependency = {"name": "compat_host_capability", "kind": "ns.dependency", "version": "*",
                                   "component": host_capability["module"], "parameters": []}
                index["entries"].append(host_dependency)
            host_parameters = [row for row in host_dependency.get("parameters", [])
                               if row["name"] != host_capability["requirement"]]
        current = {name: str(item["directory"]) for name, item in discover([ROOT, ROOT.parent / "components"]).items()}
        baseline = dict(published)
        consumer_phases = {
            consumer.split("/")[-1].replace("-", "_") + "_first": dict(baseline, **{consumer: current[consumer]})
            for consumer in (module, *related_consumers)
        }
        env = dict(environment, ENCRYPTION_KEY="12" * 32, KICKSIDE_USERS_ADMIN_INIT_ENABLED="false",
                   PGHOST="127.0.0.1", PGPORT="5433", PGUSER="kickside", PGPASSWORD="kickside")
        for engine in engines:
            with case.subTest(engine=engine):
                database = "bot_" + label + "_compat_" + uuid.uuid4().hex[:20]
                with socket.socket() as listener:
                    listener.bind(("127.0.0.1", 0))
                    port = listener.getsockname()[1]
                harness["vars"]["http_port"] = port
                overrides = {"app:db:file": str(runtime / (engine + ".sqlite"))}
                if engine == "postgres":
                    overrides.update({"app:db:kind": "db.sql.postgres", "app:db:host": env["PGHOST"],
                        "app:db:port": int(env["PGPORT"]), "app:db:database": database,
                        "app:db:username": env["PGUSER"], "app:db:password": env["PGPASSWORD"],
                        "app:db:options.sslmode": "disable"})
                    command(["createdb", "-T", "template0", database], runtime, work / "createdb.log", env)
                try:
                    phases = ("baseline", *consumer_phases, "update", "restart", "missing_guard",
                              "refusing_guard", "empty_guard", "malformed_guard", *extra_guards,
                              *(("host_update", "host_restart") if host_capability else ()), *final_phases)
                    for phase in phases:
                        replacements = baseline if phase == "baseline" else consumer_phases.get(phase, current)
                        bound = []
                        if phase != "baseline" and phase not in consumer_phases and phase not in ("host_update", "host_restart"):
                            target = "kickside.users.binding:credential_eligibility"
                            if phase == "missing_guard": target = "app:missing_credential_guard"
                            elif phase in extra_guards: target = "app:" + extra_guards[phase]["name"]
                            elif phase.endswith("_guard"): target = "app:invalid_credential_guard"
                            bound = [{"name": requirement, "value": target}]
                        if host_dependency is not None:
                            host_dependency["parameters"] = host_parameters + ([{"name": host_capability["requirement"],
                                "value": "kickside.users.binding:credential_eligibility"}]
                                if phase in ("host_update", "host_restart") else [])
                        dependency["parameters"] = parameters + bound
                        index_path.write_text(yaml.safe_dump(index, sort_keys=False))
                        (runtime / ".wippy.yaml").write_text(yaml.safe_dump(runtime_config(replacements, overrides, harness), sort_keys=False))
                        (source / "compat_plan.lua").write_text(
                            "return require('json').decode([=[" + json.dumps({"phase": phase}) + "]=])\n")
                        command(["wippy", "update"], runtime, work / (engine + "-" + phase + "-update.log"), env)
                        output = work / (engine + "-" + phase + ".log")
                        command(["wippy", "test"], runtime, output, env)
                        result = output.read_text()
                        case.assertIn("PASSED", result, result[-5000:])
                        case.assertNotIn("FAILED", result, result[-5000:])
                finally:
                    if engine == "postgres":
                        command(["dropdb", database], runtime, work / "dropdb.log", env)

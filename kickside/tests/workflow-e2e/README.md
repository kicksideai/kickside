# Published Workflow end-to-end gate

This gate proves the Workflow architecture through a fresh published KickSide
assembly. It starts `kickside/kickside` in an empty directory with a fresh SQLite
database, logs in through the real sign-in page, installs the app-owned
`workflows` and `automation` onboarding presets through Keeper, and exercises
one durable human review flow end to end.

The `workflows` preset explicitly installs Code Execution, Blocks, and
Workflows in that order. The separate `automation` preset intentionally
contains only Code Execution and Webhooks; selecting both reuses the same
Code Execution root. Recipes remain an independent opt-in package.

The scenario is deliberately cross-module:

1. install the Visual Workflows roots (`kickside/code-execution`,
   `kickside/blocks`, `kickside/workflows`) through Keeper and prove the Run
   Code Block catalog contract is available immediately;
2. preview and uninstall the Workflows root with down migrations, prove its
   generic Automation creation surface and the explicit Code Execution root remain,
   then reinstall it with the profile-owned bindings;
3. prove Automation discovers exactly one public **Connect a Trigger** creation surface;
4. prove Code Execution contributes only its canonical **Run Code** Block and
   Inbox contributes exactly one public **Inbox review** Block;
5. create a Workflow through the browser and assemble
   `Start -> Inbox review -> Finish / Error` through the public Workflow API;
6. publish and launch the Workflow, approve its decision in the Inbox UI, then
   verify its completed run detail and debug timeline;
7. restart the runtime against the same SQLite database and prove the Workflow,
   published version, decision, and completed run survive;
8. capture the Workflow catalog, Inbox-node palette discovery, selected-node
   configuration, and completed-run debug view in light and dark modes at
   desktop and mobile sizes (16 screenshots), while failing on browser errors,
   failed network responses, viewport overflow, off-screen dialogs, or contrast
   violations.

The browser step uses the already-installed Python `playwright` package and the
system Chrome binary. It does not download a browser or add an npm dependency.

## Run

The Wippy CLI must already be authenticated to the Hub. Public KickSide packages
need no application Hub token; private catalog access can be supplied through
`KICKSIDE_E2E_HUB_TOKEN` without writing it to logs or reports.

```bash
WIPPY_BIN=/path/to/wippy \
  tests/workflow-e2e/run.sh \
  --artifacts /tmp/kickside-workflow-e2e-proof
```

Useful options:

```bash
# Keep the isolated app directory and SQLite database for diagnosis.
tests/workflow-e2e/run.sh --keep-workdir

# Exercise a specific published application version.
tests/workflow-e2e/run.sh --published-app kickside/kickside@0.1.71

# Attach to an already-running disposable app instead of starting one.
# Credentials are required in attach mode. The harness still installs and mutates it.
KICKSIDE_E2E_EMAIL=admin@local.test \
KICKSIDE_E2E_PASSWORD=admin-local-123 \
tests/workflow-e2e/run.sh --base-url http://127.0.0.1:8085
```

The environment form keeps credentials out of the process argument list.

Artifacts include `report.json`, `runtime.log`, the 16 visual screenshots,
browser diagnostics, and API snapshots. Credentials and Hub tokens are excluded.
The normal published mode removes its temporary work directory after the run.

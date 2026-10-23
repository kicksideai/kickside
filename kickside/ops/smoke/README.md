# KickSide smoke tests

This private suite lives under export-ignored `ops/`. It moves with the other
operations tooling to `kicksideai/kickside-internal`; public exports exclude it.
`smoke.py` owns the CLI; `harness.py` owns registry contracts, results, redaction,
and cleanup; `runtime.py` owns disposable deployments and the product API;
`browser.py` owns the Playwright session, browser contexts, and evidence capture;
`scenarios.py` and `scenarios_*.py` own product checks.

Each engine has one main instance. Access, automation, converter SDK, CRM/Chestor,
CRM event, and member endpoint areas share it and retain separate browser contexts
and scenario state. Each area also owns a fixture registry, so access, core, CRM
events, and providers can run separate Jira services in one invocation. AI and
core onboarding each use a fresh isolated instance.
Providers use another isolated instance for fixture grants and endpoint overrides.
`RuntimePool` assigns unique runtime, temporary, data, port, and database identities.
The runner keeps browser drivers on their owning worker threads; independent
component checks have separate contexts and drivers. Releasing a context leaves
the other areas usable. Cleanup closes
contexts, stops instances, drops scratch databases, removes runtime directories,
and stops the browser session.
Installation-sensitive scenarios use `runtime_fixtures.isolated_fixture` for a
fresh host with owned cleanup and evidence; shared-runtime module and automation
state does not supply their baseline.

Use Wippy from `SMOKE_WIPPY_BIN` or `PATH`, Python 3.10+, `psql`, and Chromium.
Results record the version the binary reports, either a release (`v0.3.44a`) or a
nightly build (`nightly-20261005-7459f97`). `SMOKE_WIPPY_VERSION` declares the
expected version for a gate run; a different binary fails configuration. Install the unpinned Python requirements in your tooling environment:

```sh
python3 -m pip install -r ops/smoke/requirements.txt
python3 -m playwright install chromium
```

Set `TMPDIR` to your own scratch directory outside the repository when installing
tools. Runs create their own temporary directory and remove runtime files, data,
and temporary files even when a scenario fails or receives SIGINT/SIGTERM.
Screenshots, sanitized logs, JSON evidence, `results.json`, and `summary.md` remain
under the run directory. The CLI rejects output under a git repository or the
system temporary directory. Run directories have mode `0700`.

Set these environment variables:

| Variable | Purpose |
| --- | --- |
| `SMOKE_HOST` | Locally reachable address used for port allocation and browser/API requests |
| `SMOKE_RUN_ROOT` | Evidence parent outside every git repository; `--run-root` overrides it |
| `SMOKE_WIPPY_BIN` | Wippy executable; defaults to `wippy` on `PATH` |
| `SMOKE_RUNTIME_VERBOSE` | Set to `1` to use native runtime debug logging; absent leaves logging unchanged |
| `WIPPY_TOKEN` | Hub credential for private modules; inherited by dependency resolution and runtime Hub requests |
| `SMOKE_PG_HOST`, `SMOKE_PG_PORT`, `SMOKE_PG_USER`, `SMOKE_PG_PASSWORD` | PostgreSQL connection; required for `postgres` or `both` |
| `SMOKE_PG_MAINTENANCE_DB` | Maintenance database, defaults to `postgres`; account needs CREATE/DROP DATABASE |
| `SMOKE_DB_PREFIX` | Optional scratch database namespace, defaults to `smoke`; a lowercase identifier of at most 30 characters, followed by a unique suffix |
| `SMOKE_PG_SSLMODE` | Defaults to `require`; set to `disable` for local test PostgreSQL |
| `SMOKE_PG_POOL_MAX_OPEN`, `SMOKE_PG_POOL_MAX_IDLE` | Per-runtime `app:db` pool bounds, default 12 and 4. A runtime refuses to start unless the server has that many free connections; a run drops scratch databases recorded under its run root by terminated runs |
| `SMOKE_LLM_BASE_URL`, `SMOKE_LLM_API_KEY`, `SMOKE_LLM_MODEL`, `SMOKE_EMBED_MODEL` | Set all four for real model checks; embedding cards use **512 dimensions** |
| `SMOKE_ADMIN_EMAIL`, `SMOKE_ADMIN_PASSWORD` | Optional bootstrap credentials; defaults are generated per invocation |

The provider display name is **On-prem GPU server**. Model configuration comes
only from the environment. All area screenshots use Browser's masking policy for visible inputs, credential labels, known secrets of every length, email addresses, URLs, and paths in every frame; evidence
redacts credential fields, known secrets, the model base URL, and its hostname.
The suite records model-dependent scenarios as `skipped: no model configured`
when all four model variables are absent. Partial model configuration is an error.

Private-module scenarios require a Hub credential available to the runtime.
In containers, pass `WIPPY_TOKEN` into the runner as well as the dependency-refresh process.
An authenticated refresh in a separate process does not authenticate the runtime.

```sh
python3 ops/smoke/smoke.py --list --tier full
python3 ops/smoke/smoke.py --published latest --engine both --tier quick
python3 ops/smoke/smoke.py --published 0.1.145 --engine both --tier full
python3 ops/smoke/smoke.py --source "$KICKSIDE_ROOT" --engine both \
  --replace "kickside/crm=$CRM_SOURCE" --scenario crm_record
make -C ops/smoke quick PUBLISHED=0.1.145
make -C ops/smoke full PUBLISHED=0.1.145
make -C ops/smoke list
cd ops/smoke && python3 -m unittest -v
```

`--published` starts `wippy run kickside/kickside@VERSION` in a fresh directory;
`latest` lets the Hub resolve the root version. Published mode accepts no source
replacements and verifies the resolved deployment root. Optional product modules
install through the product Hub plan/install API without version pins. The suite
uses isolated provider fixture declarations for the full tier. `--source` copies the checkout's
`app/`, excludes state and `.env`, strips implicit workspace replacements, and
applies only explicit `--replace` entries. Runtime, framework, facade, web host,
and theme replacements are prohibited.

## Source gates on the tower

Use the same prepared source checkouts locally or on the tower. Create separate
lane checkouts at the desired `main` commits or PR branches and restore private
paths as described in the development checkout README. Keep model credentials,
PostgreSQL settings and the evidence parent in the machine's private environment
profile using the variables above. The suite does not require a particular host
address; on the tower itself, `SMOKE_HOST=127.0.0.1` keeps disposable listeners local.
Run container gates with the UID/GID that owns the checkouts and run directory.
Chromium's child processes need access to their scratch paths under that identity;
keep the evidence directory's private permissions intact. Keep the machine profile
outside Git and load it through the container's environment-file option.

One command builds and runs the selected source tree without publishing it:

```sh
make -C "$KICKSIDE_ROOT/ops/smoke" source \
  PYTHON="$SMOKE_PYTHON" SOURCE="$KICKSIDE_ROOT" WORKERS=4 \
  TIER=regression ARGS='--scenario boot,branding_shell,branding_logo_types' \
  REPLACEMENTS="kickside/core=$KICKSIDE_ROOT/core/core kickside/automation=$KICKSIDE_ROOT/platform/automation kickside/knowledge=$KICKSIDE_ROOT/platform/knowledge kickside/kb10=$PROVIDERS_ROOT/kb10"
```

`source` defaults to the full tier, both database engines, and four scenario
workers per engine. Set `TIER=quick`, `TIER=regression` or `TIER=chat` for another
gate; use `ARGS='--scenario name'` for a focused run. `REPLACEMENTS` is a
whitespace-separated list of `org/module=absolute-directory` pairs with no
whitespace in those paths. Different modules may point at separate branch
checkouts. Include every changed module explicitly; the app's implicit workspace
replacements are stripped. Unchanged dependencies still download from Hub.
Full and regression tiers include focused native guards that require a local
replacement for every module they exercise. For a full source run, prepare all
selected repositories and use their `.github/modules.json` catalogs to supply
the complete replacement list. A focused PR run selects its relevant scenarios.

The target prepares shared Widgets dependencies through the repository's Make
interface, then builds the app and each replacement with a `ui/package.json` through
its existing `make build` target before starting the suite. A failed build stops
the run instead of testing stale bundles. It does not fetch, switch or reset Git
branches, edit release locks, or publish packages. Prepare the checkouts and
tooling once; the same command then rebuilds and tests subsequent edits. The
existing `quick`, `full` and `chat` targets retain published mode by default and
also accept `SOURCE`, `REPLACEMENTS` and `WORKERS` for already-built sources.

`quick` covers boot, platform onboarding, the live first-agent capability catalog,
chat streaming, PDF attach/send, grounded KB answers with citations, CRM record
creation, and continuation in the same session after restart. Its target is about
ten minutes for both engines; install/model latency affects duration. `full` adds
workflow review approval/rejection across two restarts, native recurring delivery,
CRM event Data Sync delivery, webhook validation/revocation, scoped MCP access,
research completion, root/folder ChestOr entries, dashboard, member boundaries,
provider credential dialogs, and PDF/text/Markdown/HTML/DOCX/XLSX/PPTX/PNG
conversion.

`--scenario NAME` repeats or accepts comma-separated names. Prerequisites run in
registry order. Each result includes scenario, engine, status, duration, error,
evidence paths, features, and the declaring module in `owner`. `blocked_by` lists
failed direct prerequisites and `failure_roots` identifies their first real
failures. Failed prerequisites produce explicit failed downstream results;
independent scenarios continue. Core API scenarios depend on runtime readiness,
while personal onboarding depends on platform onboarding. Isolated area roots
start independently of the main instance's boot scenario. Browser console errors, page errors, failed
requests, and HTTP errors fail the active scenario. API permission-denial checks
run outside browser traffic. Any scenario or cleanup failure returns exit code 1;
configuration errors return 2. Timeouts remain at the source harness limits.

## Agent authority admission

A bounded Agent invocation uses the actor and scope admitted when it starts.
Disabling its bot or reducing groups does not require cancelling a pending model
response or replacing the frame between tool calls. The held-Agent scenarios
verify that this invocation commits once with its original identity and audit.
They then queue another invocation and require current authority to refuse it
before any additional model request or tool effect. A queued Run now receipt
acknowledges demand; it does not authorize its execution.

New durable invocations resolve the stored principal again. Workflow Await/resume
has its own admission checks and remains covered separately. These checks do not
require per-request policy rebuilding, polling or mid-invocation cancellation.

## Installation permission equality

`permission_equality_native_proof` exercises the reusable targeted comparison
through the native audit endpoint. It captures every effective policy action and
resource pair, every declared endpoint under `access`, and every component kind
under `registry.get`. Before an installation update, include the candidate
policy and registry declarations in `capture_account`; after the update,
`compare_captures` rejects changed admission, groups, refusals, proof universes,
or native decisions.

```sh
python3 ops/smoke/smoke.py --source "$KICKSIDE_ROOT" --engine both \
  --scenario permission_equality_native_proof
```

## Attached development loop

Use the gate runtime for every invocation:

```sh
export PATH="$WIPPY_RUNTIME_BIN:$PATH"
export SMOKE_HOST=127.0.0.1
export SMOKE_RUN_ROOT="$EVIDENCE_DIRECTORY"
export TMPDIR="$SCRATCH_DIRECTORY"
make -C "$KICKSIDE_ROOT/app" build
python3 ops/smoke/smoke.py --source "$KICKSIDE_ROOT" --attach \
  --replace "kickside/core=$KICKSIDE_ROOT/core/core" --scenario core_threads
python3 ops/smoke/smoke.py --source "$KICKSIDE_ROOT" --attach \
  --replace "kickside/core=$KICKSIDE_ROOT/core/core" --scenario core_threads
python3 ops/smoke/smoke.py --shutdown --engine both
```

`--attach` starts one persistent worker per engine under `SMOKE_RUN_ROOT` and
defaults to SQLite. `--engine postgres` and `--engine both` select other attached
workers. Keep the source and replacement arguments the same on subsequent runs.
Each worker retains runtime processes, API credentials, scenario state, fixtures,
browser contexts, and successful prerequisite results. A selected scenario runs
again; only its already-passed prerequisites are reused. `Scenario.instance_setup`
declares checks that establish instance-lifetime state, including first-run
onboarding, module installs, and runtime fixture declarations. Selecting one again
after it runs rebuilds its instance through the automatic-restart path before the
selection runs. All areas sharing that instance lose their cached prerequisites
and scenario state; isolated instances retain theirs. A setup attempt that fails
also requires a fresh instance on explicit retry. Skipped and blocked checks do
not count as setup attempts. Selecting an ordinary scenario reuses the current
instance and its passed prerequisites with no boot work. Failed and skipped
prerequisites run again. Explicitly rerunning a prerequisite invalidates its
cached descendants. `state.json` in `.attached-ENGINE` records satisfied names;
the running worker owns the corresponding Python objects and product state.
An invocation without `--scenario` selects the whole tier and applies the same
setup restart rule. `results.json` records each setup restart reason with its
scenario name and instance area under `timings.ENGINE.reload.restart`.

Before an attached run, the worker compares source bytes and boot inputs. Changes
to registry source files use native Keeper MCP: initialize a session, activate
`keeper.agents.traits.wippy:operator`, select a state branch, edit source entries,
and push the branch into the disposable instance's live registry. The worker waits
up to 120 seconds for Keeper's startup reconciliation before editing. The worker
adds edited source namespaces to that instance's managed namespace configuration.
It writes host app source changes into the runtime copy after a successful push;
replacement sources stay in their checkout. This operation does not publish Hub
packages or push Git branches. Keeper errors fail the invocation and retain the
previous source snapshot for a retry.

Changes to built `static/` assets synchronize into the host app runtime copy;
replacement assets stay in their live source directory. Build changed frontend
sources through the module's Makefile before rerunning a browser scenario.

Configuration, runtime binary, module manifest/lock, replacement mapping,
declaration, migration, and unmapped source changes rebuild the attached instance
automatically. A runtime without the required Keeper tools also uses a restart.
These restarts clean the old databases and runtime directories, clear cached
prerequisites, and create fresh product state. Changes to the smoke harness or
scenario Python modules restart the attached worker so its code matches disk.
The restart reason appears in `results.json`. Registry sync and module filesystem
replacements remain separate stores; the harness does not point host app
`sync_from_fs` at a module's `src/` directory.

`--shutdown` requires only the run root and engine selection. It closes browser
contexts and drivers, stops fixtures and runtime processes, drops Postgres scratch
databases, and removes runtime/data/temp directories. Evidence remains. SIGINT or
SIGTERM to the persistent worker also runs cleanup and writes `cleanup.json`.
Use a separate evidence parent for each independent development loop.

## Parallel gates and timings

Fresh invocations retain the default `--engine both`. The full gate starts SQLite
and Postgres in separate processes concurrently, creates new instances, and
cleans both engines after completion. Attached prerequisite results never enter
a fresh gate.

```sh
python3 ops/smoke/smoke.py --source "$KICKSIDE_ROOT" --tier full --workers 1
python3 ops/smoke/smoke.py --source "$KICKSIDE_ROOT" --tier full --workers 4
python3 ops/smoke/smoke.py --source "$KICKSIDE_ROOT" --attach --workers 4 \
  --scenario northwind_graph_root,northwind_graph_folder,northwind_roadmap_root,northwind_roadmap_folder,northwind_database_root,northwind_database_folder
```

`--workers` bounds scenario concurrency within each engine and defaults to one.
The six graph/roadmap/database component creation checks above create separate
components and use separate browser contexts and scenario state on one instance.
Their state is returned to the owning area for later UI and tool prerequisites.
Scenarios that create private runtime fixtures claim `instance:<scenario-name>`
in their `parallel` tuple. This claim reserves the fixture's instance and lets
shared-instance restarts run alongside it. Record-owning Automation event checks
use separate record claims, titles, browser contexts, and cleanup callbacks.
Restart and hot-update checks keep exclusive access to their instance.

Source instances share one resolved app lock per invocation when their manifest,
runtime configuration, and local dependency declarations match. Each instance
installs that lock into its own module directory. Different dependency inputs
resolve separately; later invocations resolve fresh.

Other scenarios have exclusive access unless their `Scenario.parallel` tuple
declares all shared user/component resources. Overlapping resource claims
serialize within their instance. The existing AI, core, and provider areas have
separate runtime instances and run alongside main-instance work when workers are
available. Setup, install, restart, and shared-browser scenarios retain exclusive
access to their instance. Dependencies complete before their consumers start; failed prerequisites
still produce failed downstream results with `blocked_by` and `failure_roots`.

`results.json` and `summary.md` report invocation wall time, engine wall time,
worker count, cold boot time, attached boot work, and reload/restart details.
Scenario durations retain their existing meaning. Compare fresh full-tier runs
with `--workers 1` and `--workers 4` under the same source/model configuration.
The sum of engine wall times describes sequential engine work; invocation wall
time measures the concurrent gate. An attached single-scenario rerun targets
less than two minutes; scenario-specific model and install waits retain their
existing limits.

To add a scenario, implement a callable taking `Context` and register a `Scenario`
in `REGISTRY` with its tier, preceding prerequisites, and model requirement.
Declare `instance_setup=True` when it establishes state that lasts for the
instance, so an attached rerun exercises setup against fresh product state.
Use `inst.request(..., label=...)` for API evidence, `inst.wait` for bounded
projection/model waits, and `inst.cleanup.add` for acquired resources. Assertions
raise `Failure`; retain product errors and never add a fallback to make a check
pass. Add harness behavior tests before changing registry, output, cleanup, or
redaction behavior.

The consolidation source map lives in [SOURCES.md](SOURCES.md). Maintain these
shared implementations and reference this CLI from lane/release instructions.

## Permanent regression suite

Capture a new defect before its fix: add its issue ID to
`coverage/issues.json`, then add a failing real-browser scenario in the matching
`scenarios_*.py` module. Drive the user's UI actions and assert the visible
outcome. Reuse fixtures and the shared lifecycle; declare `issues=("ISSUE-ID",)`
and only the `features=` whose behavior the scenario exercises. Keep API and
module checks alongside the browser scenario. Regenerate and commit
`coverage/scenario_map.json` with `python coverage/export_map.py`.

`python smoke.py --tier regression` selects issue guards and their required
setup on SQLite and Postgres. `--tier full` includes the regression suite.
Use `--scenario SCENARIO_ID --engine both` for focused verification. Configure
the runtime, source replacements, model and run root as for other smoke runs.
The coverage report lists every catalogued issue, its guarding scenarios and
their result on each engine. An issue without a guard or with missing, failed
or skipped execution blocks the report; planned reports provide no pass credit.

## Provider fixtures

`ops/smoke/mocks` serves deterministic Northwind API, OAuth, SSO, and page
fixtures. `ctx.fixtures.start("jira")` returns the area's fixture base URL;
`ctx.fixtures.requests("jira")` returns its recorded requests and
`ctx.fixtures.stop()` shuts down its fixtures. `mocks.Fixtures()` creates a registry. From `ops/smoke`, run `python3 -m mocks jira --port 0`.

`mocks/providers_probe.lua` supplies the provider probe that `providers_boot`
installs into each disposable instance. It checks connection access and invokes
registered provider tools, traits, and ports. `providers_origins` configures
endpoint namespace requirements through `.wippy.yaml` profile overrides and
vars. HTTP request and loopback grants apply only to these disposable fixtures.

## Opt-in real-model chat commands

`chat` runs only when selected explicitly with `--tier chat`, a named `chat_*`
scenario, or `make -C ops/smoke chat`. Quick, full, regression, release and CI
selection excludes chat scenarios, including their issue guards. Regular coverage
reports keep chat-only issues as `not_run` without requiring their execution.
Missing model configuration fails chat-tier configuration.

`chat_openai_reply_persistence` also requires `OPENAI_API_KEY`. It creates an owned
`gpt-4.1-nano` card through the OpenAI provider, sends at most two short messages,
and checks exact requested text, streamed chunks, final content and persisted
assistant text. The provider reads its key from the environment. Scenario cleanup
removes the session, agent and card. API and browser chat commands also compare
their persisted final assistant reply with the streamed chunks exactly.

Use the standard `SMOKE_LLM_*`, `SMOKE_EMBED_MODEL`, host and database profile
variables. The owner profile uses the towers OpenAI-compatible endpoint with
Gemma 4 26B and Qwen3 Embed; credentials stay in the environment or a private
profile loader. Neither endpoint nor model is hardcoded in the suite. Onboarding
selects these discovered models through the UI and creates the default agent.
The chat setup makes no model-card edits. SQLite and PostgreSQL each start from
a fresh published deployment. `--verify-replacements --replace` explicitly overlays the modules under
review while keeping the published app root, with resolved versions in the manifest.

```sh
python3 ops/smoke/smoke.py --published 0.2.4 --tier chat --engine both
python3 ops/smoke/smoke.py --published 0.2.4 --tier chat --engine both \
  --scenario chat_knowledge_document_member
```

Each role uses its default onboarding agent. Commands use the product WebSocket
API, wait for its completed streamed reply, retain each command's stream and
transcript separately, and check effects through the owning API. The Knowledge
page and the headline KB/document journey use the browser. The headline attaches
a fictional document with a unique fact, verifies persisted document/chunk and
embedding counts plus vector retrieval of that upload, and asks in the same chat
conversation. Its citation must identify an actual retrieved KB passage, and
retrieval must occur in the answering turn. Separate search and answer scenarios
start a new session to test discovery without earlier creation receipts or attachments.

The matrix covers KB creation/search/answer/ingestion, Inbox, Artifacts, file
upload/list/read, capability discovery/activation, Connections, recurring task
creation/list/run/pause with an Inbox effect, Agents/Redirect, Sessions, user/time
awareness, Hub administration and its member denial, and remote MCP write/read.
Workflow and CRM checks discover installation state; installed Workflows support
a draft creation effect, while CRM checks records or its configuration prerequisite.
The disposable MCP fixture adds test-only network grants and an owned connection
after the default-install journeys. It does not configure an existing target.

For an existing local or remote instance, explicitly select one engine and pass
its URL at run time. `SMOKE_CHAT_CREDENTIALS_FILE` points to a private file containing
`ADMIN_EMAIL` and `ADMIN_PASSWORD`; member checks also require `MEMBER_EMAIL` and
`MEMBER_PASSWORD`. The default agent must resolve to `SMOKE_LLM_MODEL`. This mode
starts no runtime, performs no onboarding or installation, changes no instance
configuration, and deletes only objects created by the selected commands.

```sh
python3 ops/smoke/smoke.py --chat-target "$SMOKE_CHAT_TARGET_URL" \
  --tier chat --engine sqlite --scenario chat_knowledge_document_admin
```

Existing-target MCP checks use an owned `SMOKE_CHAT_MCP_CONNECTION_ID`, a natural
language `SMOKE_CHAT_MCP_COMMAND`, and `SMOKE_CHAT_MCP_EXPECTED_TEXT`, plus `SMOKE_CHAT_MCP_EFFECT_PATH` for a GET
to the owning API that verifies the written value; they create
no connector configuration. Credentials never enter command transcripts or result
summaries. Preserve failed transcripts when classifying product defects, tool
contract defects and model limitations; failures retain nonzero exit status.

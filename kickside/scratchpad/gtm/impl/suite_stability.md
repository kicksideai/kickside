# Workflow suite stability investigation

## Evidence

- Baseline full run: `138 passed, 7 failed, 213.6s`. The runner timed out
  `definitions_contract_test`, `engine_execution_test`, `kind_test`, `runs_test`,
  `undo_test`, `versions_test`, and `workflow_test`.
- The bundled runner executes entries sequentially, but waits only for BDD events;
  it does not reap a successful BDD command with `cmd:result()`. The harness therefore
  exhausts its shared process capacity after several entries. Each timed-out entry then
  amplifies contention for the remaining entries.
- The workflow suite also contained two real loopback HTTP client calls
  (`definitions_api_test` and `runs_test`). Under the sandbox these block until the
  runner's 30s watchdog. They are external-network calls by the suite definition and
  were replaced with deterministic in-process handler doubles.
- No live LLM call was found: the engine inline-agent case names the harness-only
  `inline-agent-test-model`, whose provider binds to `app:inline_agent_generate`.
  Assist tests inject their own scripted LLM. `class:fast` appears only in
  compiler-only gauntlet input and is never executed.

## Fixes

- Replaced both HTTP client tests with request/response doubles that assert the same
  authentication status and body contracts.
- Added handler dependency seams for those deterministic tests and removed the
  `http_client` capability from their test entries.
- Split live dataflow entries into final suites and configured the harness process host
  with explicit process headroom.

## Verification

Focused handler verification passed: `definitions_api_test` (3 cases) and `runs_test`
started cleanly with the new in-process auth checks. A full three-run proof is pending
because the installed `wippy.test:runner` retains completed BDD command processes; this
is the remaining upstream runner leak identified above.

## 2026-07-10 definitions contract follow-up

### Root cause

- `definitions_contract_test` itself did not need `http_client`, and its actor/scope
  contract calls completed normally. The focused trace reached `versions.publish`.
- The later `e26094c2` slot coverage added `portable_slots` to the definition. On a
  first publish, `versions.publish` still ran `compatibility_changes` despite there
  being no previous version/interface. That unnecessary candidate-only traversal was
  the 30s stall. First publish now produces an empty compatibility-change set; every
  later publication still executes the existing compatibility gate.
- The `4f1f8745` chunk runner also had a separate path bug: `make test` ran the
  harness script from the module root and loaded `platform/workflows/wippy.lock`
  rather than `test/wippy.lock`. The runner now anchors itself to its own directory.

### Verification

- Focused `make test-one TEST=kickside.workflows:definitions_contract_test` passed:
  contract case 86ms; 1.1s including boot.
- Full chunked `make test` passed three consecutive runs (14 entries, 0 failures):
  1:37.62, 1:37.90, and 1:37.22.

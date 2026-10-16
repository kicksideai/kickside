# wippy.test runner retains completed command processes

## Owner-ready report

**Runtime:** `wippy v0.3.19a` (2026-07-08) with `wippy/test v0.4.12` from the
workflows harness lock. The test package is installed only as a `.wapp` pack in
this checkout; no editable `wippy/test` source is available locally.

### Reproduction

From `platform/workflows/test`:

```sh
wippy run test \
  kickside.workflows:definitions_api_test \
  kickside.workflows:definitions_contract_test
```

The runner completes the three API scenarios, starts the contract entry, then the
contract entry hits the runner's 30-second watchdog. Its final summary is:

```text
workflows (4) 1 failed 30.1s
workflows > definitions_contract_test
test timed out
3 passed 1 failed 30.1s
```

The larger unfiltered reproduction is `wippy run test` from the same directory.
The pre-containment measurement recorded in `suite_stability.md` was **138 passed,
7 failed, 213.6s**; the failures appear only after several otherwise successful
entries and then arrive in watchdog-sized (~30s) increments.

### Process evidence

The commands are retained in the runtime process host rather than as independently
visible OS children. The exact process snapshot taken after the first entry had
completed (the API output above was already written) was:

```text
BEFORE: no workflow test-runner process
AFTER_FIRST_ENTRY
2032849 2032846 Sl 00:18 wippy run test kickside.workflows:definitions_api_test kickside.workflows:definitions_contract_test
```

`ps` exposes only the outer `wippy` process; it does not expose the BDD command
handles retained inside the host. That distinction matters for triage: an OS-child
reaper will not demonstrate or cure this. The runtime's own process-host capacity
is 100 in the harness, and the pattern is that completed BDD work continues to
consume that logical capacity until the outer runner exits.

### Suspected reaping site

The installed pack's runner appears to await BDD events and advance to the next
entry without collecting the completed command handle. The likely missing operation
is at the per-entry completion boundary in `wippy.test:runner`: call the equivalent
of `cmd:result()`/join/reap before scheduling the next entry, including failure and
cancel paths. This is an inference from the black-box behavior; source inspection
was not possible because the pack is not vendored as source here.

### Local containment

- `platform/workflows/test/run-tests.sh` runs five bounded entry groups in separate
  `wippy run test` processes. Each invocation includes `app:wait_for_boot`; it also
  supplies the non-test `kickside.data:writable` filter so filtered state loading
  retains the contract bound by `workflow_kind`.
- The script reports aggregate entry pass/fail counts and returns non-zero if any
  group fails. `make test` uses it; `make test-one TEST=<entry>` remains the focused
  path.
- `platform/automation` has 17 backend entries, so it received the same containment.
  `platform/recipes` is left unchanged: its unfiltered harness passed **5/5 in 5.0s**,
  which is below the observed retention range, though it remains exposed if it grows.

### Current verification blocker

The new wrapper is in place and focused runs work (for example,
`make -C platform/workflows test-one TEST=kickside.workflows:workflow_test` passes
40 tests including setup; the equivalent automation focused run passes 29).
However, `definitions_contract_test` still times out in a fresh runner before a
subsequent chunk can start. Therefore three green full-suite runs cannot honestly be
recorded on this runtime; the same upstream command-retention defect blocks the
requested proof rather than a product-Lua failure. The upstream fix needs to land
before the three-run stability gate can pass.

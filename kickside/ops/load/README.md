# LOD load harness

`run.sh` starts its own disposable PostgreSQL 16 container on an ephemeral port,
then runs the production Jobs worker and Automation round against PostgreSQL and
SQLite. It removes the marked PostgreSQL database, cluster, SQLite database,
and copied Wippy runtime on exit. Persistent reports, PostgreSQL statement logs,
and per-transaction/per-empty-round CSVs live under
`scratchpad/fix-0924/impl/lanes/LOD/LOD2-runs/`.

A short two-engine integration check is:

```sh
export WIPPY_BIN=/path/to/wippy
LOD_SMOKE=1 SCALE=0.01 ops/load/run.sh
```

The three-run full gate, on an isolated host, is:

```sh
ops/load/full-gate.sh
```

`WIPPY_BIN` is a required caller-supplied path. The disposable Workflows
runtime uses the published `wippy/dataflow` its test lock pins. Both-engine
smokes fail unless real terminal checks, publications, and the engine's
retained terminal status succeed.

The full PostgreSQL fixture installs 200 distinct event automations across 50
source threads, each with two event drives, and 1,600 five-minute interval
automations (eight per event automation), for 1,600 interval and 400 event
drives. A separate 10,000-watcher fan-out shares one thread. Historical data comprise 5 million events, 2 million receipts,
1 million resolved ledger rows, and 300,000 job runs. SQLite installs 200
distinct event automations on one source thread with one worker. The scaled
smoke has two event automations, 16 interval automations, 100 watchers, and two SQLite
automations.

PostgreSQL uses `log_min_duration_statement=0` in the owned cluster and
`pg_stat_statements` when available. `pg_transactions.py` preserves every
logged transaction duration and pairs a claim transaction's start with an
empty round's durable completion transaction only for drives whose round
commit advanced after release and whose job finalized after the baseline.
The post-quiet snapshot saves both facts before later phases can reclaim the
same slots; the log reconstruction reads that saved cohort.
Before release it aligns source cursors and
appends a nonmatching probe event, then verifies that no provider pages were
delivered during the empty phase. The runner does no harness I/O between
empty-round release and its single completion observation. Release
and queue latency are separate from the claim-to-completion result. Append
phases sample initial fan-out and continuation-backed coalescing separately;
prune appends start only after the first prune deletion is observed.
The complete log identifies claims that race before release commits; they
are excluded because harness I/O may overlap them. All published CSV/JSON rows
carry `run_mode` and `host_isolation`; raw exports stay in the disposable
runtime until those values are known.

Every report records CPU, RAM, storage, PostgreSQL settings, host load, and
other Wippy/Codex processes. A nonisolated full run prints `UNISOLATED` and
issues no gate verdict. Smoke results also issue no verdict. Command recovery
terminates the live supervised worker loops and observes replacement pulses
and durable successful command operations. The 200-drive SQLite smoke script
repeats correctness and restart races three times. SQLite transaction-call
timings cover the claim and `reclaim_expired` boundaries; a
single-connection contention probe verifies that a competing DB call resumes
only after a held transaction commits. These are bounded observations, not a
trace of every worker transaction. The 30-minute outage uses the fixture
consumer's retriable failure path and samples protected receipts, payload,
uncertain ledger state, pending wakes, and unresolved storage growth.

SQLite additionally times 20 smoke or 400 full completed empty rounds through
`jobs.wake_job` with the production worker running. Each timer starts before
the wake and stops when `jobs.get_job` reports a later execution sequence
parked without a schedule. The subsequent drive check requires an empty
committed round. Samples include dispatch, queue, supervised worker and public
read overhead; they are conservative wake-to-completion bounds. The separate
passive worker phase counts only committed and job-completed rounds. Its fixed
quiet interval includes idle time in the denominator, so its rate is
conservative. Whole-model §15.1 approval still requires the isolated,
full-scale gate to meet every threshold.

The owning fixture tests run with `wippy test` in `ops/load/test`. They exercise
real SQLite/Postgres receipt transactions and delivery partitions. The Postgres
profile accepts `--set vars.pg_database=<scratch database>`; the caller creates
and drops that database. `python3 ops/load/test/test_contracts.py` checks fixture
declarations and surviving production seams.

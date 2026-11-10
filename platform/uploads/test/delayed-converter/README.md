<!-- SPDX-License-Identifier: MIT -->
# Conversion budget fixture

This component implements the Doc2MD result contract and spends 95 seconds in one conversion call. The upload harness substitutes its binary into the existing converter entry, preserving that entry's execution limit. The tests admit a document through the upload API and inspect the durable job attempt and upload state.

`make test-conversion-budget RUN_ROOT=/path/to/evidence` runs SQLite and PostgreSQL. Set `PGHOST`, `PGPORT`, `PGUSER` and `PGPASSWORD` for the test server. Each PostgreSQL run creates and drops its own database. The target requires the `wasm32-unknown-unknown` Rust target and `wasm-tools`.

The fixture uses a monotonic clock to bound its compute loop independently of host speed. It targets the host's WASI clock interface directly and exports the canonical allocation function required by the component ABI.

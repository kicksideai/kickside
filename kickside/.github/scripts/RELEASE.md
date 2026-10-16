# Release content checks

Release Please selects the released path and explicit version. `delivery.py publish`
builds that module, checks package boundaries, and compares its pack with the latest
Hub artifact. `release.sh --dry-run` uses the same delivery path.

The comparison verifies the downloaded artifact's published SHA-256 digest and
pack frame hashes. It compares registry entries, module metadata, embedded file
bytes and modes, module type, visibility, and yank state. Version and build
envelopes, storage coordinates, and embedded file timestamps do not change content.
Matching content skips publication. A new module or changed content retains the
explicit version and publication gates. Hub and archive errors fail the release.

Python release dependencies come from `scripts/requirements-release.txt`.
Before packing or comparing content, delivery invokes `make compat` from the
repository root through its command runner. Like `wippy`, `make` resolves through
`PATH`. The mandatory gate writes `compat.json` and `compat.md` at its output path
(`COMPAT_ARGS` accepts `--output`), prints its verdict and finding/error counts,
and fails on breaking findings or errors. A failing recipe makes `make` return 2,
which stops delivery before packaging, content comparison, or publication.

`test_delivery.py` and `test_release_content.py` exercise the delivery and content
checks against local Hub fixtures. The content fixture supplies a `make` executable
on `PATH` that accepts exactly `compat` and implements the gate's report and exit
contract. It uses the report serializer without running the gate. The fixture
checks passing, breaking, and error verdicts; compatibility proofs run separately
under `make compat`. The tests verify embedded content digests across release versions and changed
filesystem timestamps.

App release lock refresh and verification use `wippy update` with native `--set workspace.replacements.<module>=` overrides for every development replacement so dependency resolution reads the product source without loading development workspace replacements. The development `.wippy.yaml` stays unchanged. Run `delivery.py refresh-app` after publishing the dependency train.

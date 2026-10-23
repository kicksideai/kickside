# KickSide development checkout

Local canonical repositories hold product source and the private development paths. Keep `kickside`, `components`, `providers`, `converters`, `crm`, `chestor`, `module`, `docs`, `docs-site`, `.github`, `.github-private` and `kickside-internal` side by side. Repository visibility remains an owner setting. Access to the private repositories requires a GitHub account with read access.

Create the canonical SSH clones once under `~/kickside/kicksideai`:

```bash
mkdir -p "$HOME/kickside/kicksideai"
cd "$HOME/kickside/kicksideai"
for repo in kickside components providers converters crm chestor module docs docs-site .github .github-private kickside-internal; do
    git clone "git@github.com:kicksideai/$repo.git" "$repo"
done
```

From an empty lane directory, choose a new branch name and create adjacent worktrees. Restore private paths into those worktrees:

```bash
canonical_root="$HOME/kickside/kicksideai"
lane_root="$PWD"
lane_branch=lane/your-task
for repo in kickside components providers converters crm chestor module docs docs-site .github .github-private kickside-internal; do
    git -C "$canonical_root/$repo" worktree add -b "$lane_branch" "$lane_root/$repo" main
done
for repo in kickside components providers converters crm chestor module; do
    cp -a "kickside-internal/$repo/." "$repo/"
done
```

The copy uses the same private-path restoration as the existing internal CI workflows. It restores private operations, maintainer checks, release automation, and complete Makefiles. Native module harnesses, application documentation declarations, and handbook source remain with public product source. The module template maintains its handbook copy from the public application repository. No generated checkout or combined repository is required.

Edit product files in their product repository. Commit private path changes in `kickside-internal/<repository>/<original path>`, then copy those paths into the lane checkout for verification. Makefiles and package manifests with private targets have complete copies in the mirror; preserve the public command subset when changing either copy. Keep the exact product and internal commit SHAs with verification evidence. Never commit the restored private paths in a product repository.

Use the official Wippy v0.3.47a release for every runtime gate. Set `PATH` to its `bin` directory and `TMPDIR` to the lane's `run/temp` directory before running tests. Python smoke and coverage gates use the shared smoke venv. Postgres listens at `127.0.0.1:5433`, with user/password `kickside`; each gate creates and drops only its own scratch databases.

```bash
export TMPDIR="$LANE_ROOT/run/temp"
mkdir -p "$TMPDIR"
export PYTHONPATH="$PWD/kickside/ops/smoke:$PWD/kickside"
export SECURITY_MODULE_ROOTS="$PWD/components:$PWD/providers:$PWD/converters:$PWD/crm:$PWD/chestor"
cd kickside
(cd ops/smoke && "$SMOKE_PYTHON" -m unittest discover -s tests -t .)
"$SMOKE_PYTHON" -m unittest discover -s ops/smoke/coverage
"$SMOKE_PYTHON" ops/smoke/coverage/export_map.py --check
make compat COMPAT_PYTHON="$SMOKE_PYTHON" COMPAT_ARGS="--baseline $PWD/app/wippy.lock --output $LANE_ROOT/evidence/compat"
```

Run coverage tests with the restored product checkout as the working directory. The native-error integration assertion scans that directory; test and policy files may also be loaded directly from the adjacent private overlay. Running from the private mirror cannot validate product source. The repository CI restores the overlay into `source` and runs the same coverage and scenario-map checks there.

Refresh each tested module's native harness through its existing `lockrefresh` target. Harness replacements point at the lane's GitHub source checkout; dependencies outside locally owned modules resolve fresh from the Hub. Pass engine-specific database names through the existing native profile variables. App dependency resolution uses `make -C app refresh-deps`; test locks do not act as release baselines.

The documentation site uses the sibling `docs` checkout: run `make -C docs-site build PYTHON="$DOCS_PYTHON" CONTENT=../docs`. Existing source synchronization accepts `SOURCES=<absolute directory containing the restored product checkouts>`.

Release checks use the restored `.github/scripts/delivery.py` and the repository's existing release configuration. Publication requires the existing Hub credentials supplied outside Git. A verification dry run uses `wippy publish --dry-run` with the metadata from `.github/modules.json`. A dry run does not publish a new version.

Owner-local modules and their issue ledgers remain outside this development set. The product issue catalog retains every product guard; owner-local scenarios retain their original tests and timeout values in owner storage. The repository visibility and Hub visibility settings do not change during checkout preparation.

The canonical clones live under `~/kickside/kicksideai/<repository>` and clone directly from `git@github.com:kicksideai/<repository>.git`. Keep those clones clean. Create a lane branch with `git worktree add -b <branch> <lane-worktree> main` in each required canonical repository; keep the lane worktrees adjacent so sibling replacements resolve. Restore private paths only in those lane worktrees.

Local mode lands changes with `scratchpad/sol-lanes/land-merge.sh <canonical-repo> <branch> "<merge message>"`. The helper rebases onto local `main` and merges with `--no-ff` under the shared lock. Run checks locally or on the gate machine. Do not push, write through the GitHub API or publish to the Hub. GitHub setup remains deferred. Historical source clones retain their fetch URLs and refuse pushes. The former snapshot command runs boundary audits only.

The app release commit owns `app/wippy.lock` and `.github/app-release-lock.json` in the app repository. The private mirror does not override either release input. Preserve their matching digest when restoring private paths.

Native gate tools include Git, Make, Node, Python with the smoke requirements, PostgreSQL clients, `rsync` and `rg` (ripgrep). Install these tools before invoking the existing native harness preparation and smoke unit targets. Private CI checks out this repository at `kickside-internal`, beside the selected product source checkout, so local and CI gates read the same workflow definitions.

Restore private paths only in lane worktrees. Keep land clones clean. After gates, copy private edits back into this repository and commit all intended product edits in their owning repository. Before invoking the merge helper, restore each remaining shadowed tracked file to its committed public version with `git restore --source=HEAD -- <path>`; restored private Makefiles and package manifests remain owned here. Review the staged diff in both repositories before committing. The merge helper requires a worktree without uncommitted tracked changes for its rebase.

Generate dependency notices with `make -C kickside legal-notices LEGAL_ROOT=<product-worktree> LEGAL_CACHE=<lane-cache> LEGAL_TOOLS=<kicksideai/.github checkout>/actions/legal-check` after restoring private paths. The generator lives in the shared `legal-check` action, which public repository CI runs on every pull request. Validate them with `legal-check`; set `LEGAL_BASE=<base-sha>` to require SPDX headers on new source files. Changed files retain existing SPDX headers; legacy files without headers do not require a backfill. The generator uses npm's production lockfile SBOM and Cargo's locked metadata, verifies downloaded npm archive hashes, and preserves existing curated notices. It does not update dependency locks. Keep the lane cache outside product repositories.

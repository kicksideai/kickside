# KickSide Module Template

The private [kicksideai/module](https://github.com/kicksideai/module)
repository is a GitHub template for an independently versioned module.

```bash
gh repo create my-company/invoices \
  --template kicksideai/module --private --clone
cd invoices

make init \
  ORG=my-company \
  MODULE_NAME=invoices \
  TITLE="Invoices" \
  GITHUB_OWNER=my-company

make verify
```

The repository includes:

- a working `ns.definition`, typed automation port, contract binding,
  persistence layer, authenticated API, and module-owned web component;
- dual SQLite/PostgreSQL migrations and a standalone Wippy test harness;
- an idempotent one-command initializer that keeps package, namespace, UI,
  SQL, test, route, and repository identities consistent;
- deterministic checks for dependency ranges, generated assets, registry
  wiring, documentation links, frontend metadata, and credential leakage;
- Linux GitHub Actions plus Windows and POSIX command wrappers;
- `AGENTS.md`, the KickSide development Wiki, and frontend host,
  proxy, theming, accessibility, and packaging guidance.

`make verify` resolves public dependencies, runs Wippy lint, exercises the
initializer in a disposable copy, type-checks and builds the UI, and executes
the SQLite suite. The repository provides a disposable Postgres service for
the second required database matrix.

Publishing requires a Wippy account:

```bash
wippy auth login
make release-check
make publish             # private by default
make publish VIS=public  # explicit public release
```

The source manifest does not pin a release version, and `ns.dependency`
declarations use `*` or `>=` ranges, never exact pins. The publisher selects
the release; only the app lock pins resolved artifacts for reproducibility.
Update installed modules through Keeper's Hub plan/install UI/API with `>=`
ranges; never edit `wippy.lock` for updates. Root application self-update through
Hub is currently blocked by targetless cloud deployment requirements.

The starter is developed against a source-free, Hub-installed KickSide host.
After the module's first private publish/install, a machine-local
`workspace.replacements` overlay points its package identity at the checkout.
No KickSide source tree or lock-file replacement belongs in the module.

Read the repository's `AGENTS.md` before changing the module. It lists the
development and release requirements and links to the related Wiki pages.

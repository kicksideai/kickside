# Contributing to KickSide

Follow the [organization contribution guide](https://github.com/kicksideai/.github/blob/main/CONTRIBUTING.md),
[Code of Conduct](https://github.com/kicksideai/.github/blob/main/CODE_OF_CONDUCT.md), and
[CLA](https://github.com/kicksideai/.github/blob/main/CLA.md). Send the signed CLA privately to
[licensing@wippy.ai](mailto:licensing@wippy.ai) before merge.

## Development and testing

Install Wippy, Node.js 22, npm, Make, and Python 3 with PyYAML. Follow the
[application quick start](README.md#quick-start). Read the
[developer handbook](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
and [testing guide](https://github.com/kicksideai/docs/blob/main/building-modules/testing.md).

From the repository root, run:

```sh
sh scripts/local-wippy-gate.sh
sh scripts/local-frontend-gate.sh
```

The Wippy gate currently requires `WIPPY_HUB_TOKEN`; supply your own Hub token
through the environment and keep it out of commits. For a focused backend
change, run its module target, for example `make -C platform/automation test`.
Use the documented harness profiles for SQLite and PostgreSQL when persistence
or migrations change. Frontend source and generated served assets belong in the
same change; build through the checked-in Makefiles.

## Pull requests

Create a focused branch and submit a GitHub pull request to this repository.
Use a commit subject such as
`docs: clarify setup` or `fix: handle an empty result`. Explain the behavior and
validation in the PR; include relevant commands and outcomes. Maintainers review
and merge GitHub pull requests after the required checks and CLA confirmation.

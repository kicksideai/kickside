# kickside/execution

Principal encoding, delegation, actor context, and execution tracing.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/execution
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
for the contracts declared by the module.
The identity and trace harness has no SQL storage. Its PostgreSQL profile
selects the execution authority gate; database behavior belongs to consumers.
Development uses Make and the Wippy CLI.

## Development

From this module directory:

```sh
make lockrefresh
make lint
make test
cd test
wippy test --profile postgres
```

Run consumers with SQLite and PostgreSQL when changing execution or authority
boundaries that reach persistence.

## Use

Synchronous work retains the caller’s actor and scope. Deferred owners capture a canonical identity and resolve live authority before work. Selecting another principal requires delegation; sharing a component does not grant that selection permission. Jobs carry no execution identity of their own.

## Reference

- [Module reference](src/README.md)

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/execution)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

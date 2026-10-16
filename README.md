<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/kicksideai/docs/main/getting-started/assets/brand/kickside-logo-dark.png">
  <img src="https://raw.githubusercontent.com/kicksideai/docs/main/getting-started/assets/brand/kickside-logo-light.png" alt="KickSide" width="320">
</picture>

# KickSide

The runnable KickSide application and its Lua core and platform modules. The application combines an agent chat, sessions, knowledge, uploads, connections, typed workspace components, and durable automations.

- `app/` composes the application and builds its web interface.
- `core/` provides component ownership, contracts, execution, jobs, threads, and events.
- `platform/` provides the agent, connection, model, knowledge, workflow, security, and other application modules.

## Run

Install the [Wippy CLI](https://wippy.ai/en/start/installation/), then start a new installation:

```sh
mkdir my-kickside
cd my-kickside
wippy run kickside/kickside -c --profile quickstart
```

Open `http://localhost:8085` and follow the [installation guide](https://github.com/kicksideai/docs/blob/main/getting-started/index.md) for sign-in and setup.

![The KickSide application hosts a Chestor graph with fictional demonstration data](https://raw.githubusercontent.com/kicksideai/docs/main/using/assets/chestor/graph.png)

See the [module authoring guide](https://github.com/kicksideai/docs/blob/main/building-modules/index.md) to extend the application. Dashboard, Research, first-agent onboarding, and SSO live in [components](https://github.com/kicksideai/components).

License: [KickSide Community License 1.0](LICENSE.md) · [Third-party notices](THIRD_PARTY_NOTICES.md).

[Documentation](https://github.com/kicksideai/docs) · [KickSide](https://kickside.ai)

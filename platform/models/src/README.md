# kickside/models

The LLM model catalog and provider-profile settings surface for KickSide.

This module has two layers:

- Registry defaults: provider adapters, safe presets, and catalog policy in
  `catalog/_index.yaml`; no static model cards are seeded.
- Runtime overlay: DB-backed provider profiles and model cards, cached in `store.memory`.

Registry is only for shipped adapters/defaults, provider editor web components,
and safe presets. User-added endpoints, credentials, discovered models, and
class/capability edits are stored in the database and served through the same
model APIs.

The shipped class vocabulary is intentionally small: `fast`, `nano`,
`balanced`, `premium`, and `embed`. Discovered provider models do not
receive broad inferred aliases; admins can assign classes explicitly when a
model should participate in a class target.

## Providers

The settings UI exposes dedicated provider-profile web components for:

- OpenAI-compatible endpoints, including OpenRouter, Ollama, LM Studio, vLLM,
  Together AI, Groq, Fireworks, Mistral, DeepInfra, xAI, and Cerebras presets.
- OpenAI native.
- Anthropic Claude.
- Google Gemini Developer API.
- Google Vertex AI for manual model overlays and resolver context.
- AWS Bedrock.

No provider profile or model card is inserted by default. Presets only declare
safe defaults such as base URLs and environment variable names.
Provider APIs that do not match the current vendored drivers, such as
Perplexity Sonar's `/v1/sonar` surface, should be added as dedicated providers
instead of OpenAI-compatible presets.

## Provider topology

Provider discovery follows a port/adapter layout. API handlers depend on
`kickside.models.discovery:model_discovery`; that service owns orchestration,
status updates, and model-card persistence. Provider-specific endpoint, auth,
and response-shape code lives in `src/discovery/providers/`. Shared transport
helpers live in `src/discovery/common.lua`, and provider-row to model-card
mapping lives in `src/discovery/mapper.lua`.

Adding a provider should normally mean adding one provider adapter, registering
it from `src/discovery/registry.lua`, publishing it in `src/discovery/_index.yaml`,
and wiring the provider id through the DB profile types/presets. Do not patch
vendored `wippy.llm` just to add connector-level discovery.

Provider-specific runtime services that are not discovery adapters should live
under `src/providers/<provider>/` and keep stable Wippy entry ids in the parent
component. Google Vertex token refresh follows that shape at
`src/providers/google_vertex/token_supervisor.lua`.

## APIs

- `GET /models/list` — merged registry + DB models by capability.
- `GET /models/classes` — merged class view, sorted by priority.
- `GET /models/by-name?models=a,b` — resolve names and `class:<name>`.
- `GET /models/admin` — adapters, provider profiles, and public model cards.
- `POST /models/provider-profiles` — create a provider profile.
- `PUT /models/provider-profiles/{id}` — update a provider profile.
- `DELETE /models/provider-profiles/{id}` — delete a provider profile.
- `POST /models/provider-profiles/{id}/discover` — discover provider models
  from the profile connector.
- `PUT /models/cards` — create/update a DB model card overlay.
- `DELETE /models/cards?name=<name>` — delete a DB model card.

## Runtime resolution

`kickside.models:model_resolver` binds `wippy.llm:model_resolver`, so
`llm.generate`, `llm.structured_output`, `llm.embed`, and `llm.status` resolve
DB-backed model cards before falling back to registry defaults.

Provider profiles hold driver-open context such as base URL, encrypted secrets,
env references, provider-specific settings, timeout, and retry policy. Model
cards hold call defaults such as `reasoning_model_request`,
`thinking_effort`, or `temperature` in provider options. For
OpenAI-compatible profiles, `test_model` is non-secret profile config used only
by the connection-test probe; API keys remain in encrypted profile secrets or
`*_env` references.

Retry is provider-level transport policy: `retry.attempts` is the number of
transient failures to retry after the initial request, and optional
`retry.backoff_ms` is the base exponential backoff delay.

## Platform setup

Provider profiles are DB-driven. The admin UI writes profile config to
`kickside_model_provider_profiles`; secret fields such as API keys, AWS keys,
Google service-account JSON, and direct access tokens are encrypted in the
profile secret column with `ENCRYPTION_KEY`.

Environment variable names in presets are only convenience references. A
profile can either store an encrypted secret value directly or store an
`*_env` pointer such as `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
`GEMINI_API_KEY`, `GOOGLE_CREDENTIALS`, or `AWS_SECRET_ACCESS_KEY`. The
resolved runtime context is the same either way.

Google Vertex AI has a models-owned background service:
`kickside.models.providers.google_vertex:vertex_token_supervisor.service`. It auto-starts on the
configured `process_host`, scans enabled DB provider profiles for
`wippy.llm.google.vertex:provider`, signs the service-account JWT itself, and
refreshes the OAuth2 access token into the cache used by the current Vertex
driver. Profile create/update nudges the supervisor immediately. No automation
schedule is created per profile, and no vendored `wippy.llm` code is modified.

For Vertex, prefer service-account credentials in the DB profile secret
`google_credentials` or a profile `google_credentials_env` reference. Raw JSON
and base64-encoded JSON are accepted by the models supervisor. Set `project` or
`project_env` unless the service-account JSON contains `project_id`; set
`location` or `location_env`. Direct `access_token` / `access_token_env` is
supported for externally rotated tokens; the supervisor caches it but cannot
refresh it.

Model listing is intentionally connector-level today. The `wippy.llm` provider
contract exposes `status`, `generate`, `embed`, and `structured_output`; it does
not expose a universal `list_models` method. Discovery therefore runs from the
provider profile where endpoint, auth, region, project, and compatible-provider
base URL are known.

Automatic discovery is enabled only for providers with a canonical model-list
surface: OpenAI/OpenAI-compatible `/models`, Anthropic `/v1/models`, Gemini
Developer API `models.list`, and Bedrock `ListFoundationModels`. Google Vertex
AI profiles can still be used by explicit model-card overlays, but the current
publisher-model REST surface does not expose a list method.

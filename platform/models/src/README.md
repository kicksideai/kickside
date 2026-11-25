# kickside/models

The LLM model catalog and provider-profile settings surface for KickSide.

This module has two layers:

- Registry defaults: provider adapters, safe presets, and catalog policy in
  `catalog/_index.yaml`; no static model cards are seeded.
- Runtime overlay: DB-backed provider profiles and model cards, cached in `store.memory`.

Registry is only for shipped adapters/defaults, provider editor web components,
and safe presets. User-added endpoints, credentials, discovered models, and
class/capability edits are stored in the database and served through the same
model APIs. Discovery refreshes inferred capabilities with administrator
additions and removals applied; `PUT /models/cards` accepts
`reset_capabilities: ["vision"]` to return capabilities to discovery; legacy cards retain every stored capability as a positive override and establish negative overrides for omissions from the first complete discovery, after which overrides can be reset.

The shipped class vocabulary is intentionally small: `fast`, `nano`,
`balanced`, `premium`, and `embed`. Discovered provider models do not
receive broad inferred aliases; admins can assign classes explicitly when a
model should participate in a class target.

## Managed dispatch metadata

Successful `llm.generate` and `llm.embed` calls whose `metadata.route.provider_id` is
`kickside.models:provider` can return `metadata.managed_dispatch`. Its `model`,
`provider_id` and `provider_model` identify the card, native adapter and wire model
that executed the request, including a successful fallback. `revision` identifies
that method's managed routing configuration. It covers the saved profile settings
and credentials, native binding ID and defaults, and merged route options. It stays
stable across a cache reload with the same configuration and installation key.
Without the Models encryption key, the field is absent.

Compare revisions together with the actual rendered request when auditing repeated
work. Model aliases, remote deployment changes, native implementation updates and
changes to the values of environment references can affect output independently of
this revision. Comparing embeddings across deployments requires an embedding-space
contract from the provider or operator.

## Providers

The settings UI exposes dedicated provider-profile web components for:

- OpenAI-compatible endpoints, including OpenRouter, Ollama, LM Studio, vLLM,
  Together AI, Groq, Fireworks, Mistral, DeepInfra, xAI, and Cerebras presets.
  The plain-chat variant (`kickside.models:openai_compat_plain.provider`) binds
  the same `wippy.llm.openai_compat:driver` with `text_content: string`, so
  text-only messages go out as string content for endpoints that reject
  content part arrays.
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
- `GET /models/export` — provider profiles and stored model cards as one
  document (see Import and export).
- `POST /models/import` — merge an export document; reports created, updated,
  and unchanged profiles and cards.

## Import and export

The export document (`version: 1`) lists every provider profile with its
public config, `*_env` pointers included, and every stored model card in the
admin card shape. Secret values are never exported: a profile's
`secret_fields` names the stored secrets left out, so the destination sets
them on the profile or points an `*_env` variable at them. Registry cards are
not exported; they ship with code.

Profile config is stored and exported in plain text, so a URL in it may not
carry a credential: a profile save that puts userinfo (`https://user:pass@...`)
or a secret-named query parameter (`key`, `api_key`, `token`, `password`, ...)
in any config URL is refused. A stored profile that predates this rule fails
the export with that reason until its URL is corrected.

Import merges by profile `id` and card `name` through the same cleaning and
validation as the admin endpoints, in one transaction. It never deletes a
profile or card and keeps stored secrets; a document that carries or clears a
secret is refused. Any invalid item refuses the whole document. Importing an
unchanged document writes nothing. A host applies its setup on deploy with one
authenticated `POST /models/import` of the document.

The card import also rejects credential fields and credential-bearing URLs.
Credentials belong on the provider profile.

A card's `capability_ownership` (its inferred capabilities and administrator
overrides) is imported as the card's saved ownership, and the card's
`capabilities` are recorded against it as an admin save records them, so an
unedited document reproduces the source's overrides, removals included.

Discovery updates cards by the same names: it keeps an imported card's
classes, enabled state, and capability overrides, keeps its token limits where
the provider reports none, and rewrites the other discovered fields.

## Cards contract

`kickside.models.cards:cards` lets a module read, register and retire model
cards without the admin HTTP surface. `list_cards({})` returns every catalog
card and `get_card({name})` one card, disabled cards included, in the public
projection the admin surface lists. `list_card_summaries({q, limit, cursor})`
returns compact cards in name order, with an optional substring filter and
`next_cursor` when more matches remain. `upsert_card(card)` creates or updates the
card by name through the same write path as `PUT /models/cards`;
`disable_card({name})` disables a stored card and keeps its row;
`delete_card({name})` deletes a stored card once it is disabled and refuses an
enabled one, which is in use. When `metadata.train` is present it must carry
`weights_digest` and `manifest_sha256`. Card writes discard credential fields
and reject URLs containing credentials. Replies redact credential-bearing URLs
already stored on legacy cards. The contract is outside the member module
grant; a module receives it through the `kickside.models.security:card_registrar`
policy.

## Card agent tools

The `kickside.models.traits:card_manager` trait carries two tools over the cards
contract. `ModelCardsRead` (`cards_read`, MCP scope `state.read`) lists compact
card summaries in keyset pages and reads one full card. `ModelCardsManage`
(`cards_manage`, MCP scope `state.write`) upserts, disables and deletes cards. A
contract refusal returns `success = false` with its error. The trait and tools
are outside the member module grant; administrators assign them to a group
through the `kickside.models.security:card_tools` tool capability, which
includes `card_registrar`.

## Profiles contract and agent tools

`kickside.models.profiles:profiles` lets a module list, read, create, update and
delete provider profiles without the admin HTTP surface. Writes share
`catalog/profile_service` with `POST/PUT/DELETE /models/provider-profiles`, which
logs each write (action, actor, profile id, names of the secrets set) on the
`kickside.models.profiles` logger. Replies are the public projection: settings,
`*_env` pointers, `has_api_key` and `secret_fields` (names only). The contract
is granted through the `kickside.models.security:profile_registrar` policy.

The `kickside.models.traits:profile_manager` trait carries `ModelProfilesRead`
(`profiles_read`, MCP scope `state.read`: list, get) and `ModelProfilesManage`
(`profiles_manage`, MCP scope `state.write`: create, update, delete), assigned
to a group through the `kickside.models.security:profile_tools` tool capability.

Credentials: a profile setting named `api_key_env` (or the provider's other
`*_env` setting) holds the name of an environment variable the runtime resolves,
so no secret passes through the tool. A credential supplied as `api_key`,
`access_key`, `secret_key`, `session_token`, `google_credentials`,
`access_token` or `headers` is stored encrypted and never returned.

## Runtime resolution

`kickside.models:model_resolver` binds `wippy.llm:model_resolver`, so
`llm.generate`, `llm.structured_output`, `llm.embed`, and `llm.status` resolve
DB-backed model cards before falling back to registry defaults.

Provider profiles hold driver-open context such as base URL, encrypted secrets,
env references, provider-specific settings, timeout, and retry policy. Model
cards hold call defaults such as `reasoning_model_request`,
`thinking_effort`, or `temperature` in provider options. For
OpenAI and OpenAI-compatible profiles, `test_model` is non-secret profile config used only
by the connection-test probe; API keys remain in encrypted profile secrets or
`*_env` references. Card and profile filtering preserve the exact `headers` name and existing credential substrings (`secret`, `token`, `api_key`/`api-key`/`apikey`, `authorization`, `password`, `credential`), except token-quantity names containing the plural word `tokens` or singular `token` immediately followed by `budget`, `limit`, `count`, `usage`, `cost`, `rate`, `length`, `window`, `quota` or `size` after word normalization and no other credential substring; profile `*_env` references remain public and declared provider-secret keys retain their exact spelling for config/secret separation.

Profile `timeout` is stored as a positive number of seconds. Profile writes
also accept numeric strings in seconds and positive duration strings such as
`250ms`. An unset timeout uses the provider default. On update, omit the field
to keep the saved value or send an empty string to clear it.

Retry is provider-level transport policy. `retry.attempts` is the number of
transient failures to retry after the initial request, and `retry.backoff_ms`
is the base exponential backoff delay. Both fields are optional. Attempts must
be positive when set. Backoff accepts zero for an immediate retry. The transport
applies its existing rounding and limits when sending requests and sends once
if attempts is unset. Send an empty `retry` object to clear the policy.

Invalid profile numbers return HTTP 400 with `kind: "Invalid"` and the field
name in `details.field`. On upgrade, the migration converts valid timeout
strings to seconds, unsets timeout and retry values outside this contract,
preserves other settings, and logs a warning for each unreadable configuration
with its profile ID.

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

Bedrock discovery and connection testing use the profile's explicit credentials
when provided. A profile without keys can use the runtime's EC2 instance role
or container credentials at the standard regional AWS endpoint. The role needs
`bedrock:ListFoundationModels` for discovery and connection testing.

The connection test for first-party OpenAI probes generation through Responses.
When the authenticated model list has no Responses-capable generation model,
the test reports that the list succeeded and generation was skipped.
OpenAI-compatible profiles probe through Chat Completions.

# Local provider services

`start(name)` binds a fresh fixture to loopback and returns its base URL.
`requests(name)` returns detached, credential-redacted observations. `stop(name)`
closes its listener and joins its thread. Omit the name to read or stop all services.

| Name | Product contract |
| --- | --- |
| jira | Jira Cloud identity, projects, enhanced search, issues, comments, transitions, assignment and worklog |
| gitlab | GitLab user and paginated project discovery |
| confluence | Atlassian identity and Confluence space/content/CQL discovery, storage bodies and versioned writes |
| simplefin | Setup-token claim, Basic-auth account snapshots, exact decimal balances, transactions and holdings |
| mcp | Streamable HTTP initialize, initialized notification, tool discovery, persistent Northwind order note and session deletion |
| oidc | Issuer discovery, authorization redirect, single-use code exchange, PKCE, RSA-signed ID token, JWKS and userinfo |
| google | OAuth and OIDC, eight Google API services, calendar attendees, drafts, files, documents, presentations, cell writes and Custom Search |
| github | OAuth, identity and verified email, repositories and persistent issue writes |
| slack | Bot/app token validation, channel history, message writes and Socket Mode URL negotiation |
| discord | Bot identity, guilds, channel history and persistent message writes |
| hubspot | Account validation, CRM properties, search and object writes |
| telegram | Bot/chat identity, updates, message edits and file downloads |
| fireflies | Read-only GraphQL user, transcripts, sentences and meeting summaries |
| phantombuster | Organization validation, agents, launches, containers and completed snapshots |
| microsoft | OIDC discovery, PKCE, signed ID tokens, JWKS and userinfo |
| webscout | Northwind HTML page, duplicate/relative links, plain-text destination pages and unknown-route rejection |

Fixtures implement the provider's wire contract. `providers_origins` configures
API and OAuth endpoints through namespace requirements in the disposable
application profile and vars. The smoke-only `providers_probe.lua` routes allow-listed
product tools and source/sink bindings under the caller's identity; it validates
connection access and propagates errors. It supplies no provider implementation.
Only the disposable runtime configuration grants fixture URL and loopback access.
OIDC adds these policies to its public start/callback functions through runtime
configuration overrides, preserving their existing policies.

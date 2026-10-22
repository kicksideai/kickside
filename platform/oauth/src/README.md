# kickside/oauth

OAuth 2.0 connection management with PKCE support, encrypted token storage, and
background refresh. Exposes the `kickside.oauth:connector` and
`kickside.oauth:oauth_connection` contracts that provider plugins bind to.

## Features

- OAuth 2.0 authorization flows
- PKCE support for public clients
- Token refresh handling
- Connection management

The connection's `get_access_token()` refreshes an expired access token through
its provider connector. After an API 401, a provider calls
`get_access_token({ rejected_access_token = token })` and retries the API request
once. A newer stored token satisfies this request without another refresh.
Scheduled refresh runs at 75% of the token lifetime through the same executor.

An `invalid_grant` response sets `needs_reauth`; public component metadata retains
`reauth_reason`, and `get_status()` includes that reason in its description.
Network failures and temporary HTTP failures retain the connection and refresh
credentials. Authorization and successful refresh clear the previous reason.

The shared authorization URL builder includes the provider's
`oauth_extra_auth_params` with percent encoding. Google declares
`access_type=offline` and `prompt=consent` to request a refresh token at consent.
Extra parameters cannot replace the generated state, PKCE or core grant fields.

## Provider token protocols

The base connector accepts `oauth_token_auth_method` (`client_secret_post`, the default; `client_secret_basic`; or `none`) and `oauth_token_body_encoding` (`form`, the default; or `json`). Both authorization-code exchange and refresh use the same setting. Basic credentials are excluded from the body. Token requests have a 15-second timeout and a 1 MiB response limit.

`oauth_scope_separator` defaults to a space; Linear uses a comma. PKCE remains configured with `oauth_use_pkce` and `oauth_pkce_method: S256`. Existing connector IDs and default request formats remain compatible.

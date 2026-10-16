# OAuth discovery and authorization

Target: MCP authorization 2025-06-18, with the 2025-11-25 discovery and consent requirements also reviewed; RFC 9728, RFC 8414, RFC 7591 and PKCE S256. No MCP-specific issuer, client secret, encryption key or authorization-server setting is required on a fresh application install. A reverse proxy supplies the deployment’s public authority through the existing PUBLIC_API_URL setting.

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| Protected-resource metadata | Root `/.well-known/oauth-protected-resource` and path-specific `/.well-known/oauth-protected-resource/api/public/mcp`; existing path-appended alias remains. | `mcp_oauth_root_discovery`, SQLite and Postgres. |
| 401 discovery hint | `WWW-Authenticate: Bearer resource_metadata="<public-base>/.well-known/oauth-protected-resource/api/public/mcp"`. | Root guard and official SDK discovery, both engines. |
| Authorization-server metadata | Root `/.well-known/oauth-authorization-server` and path-specific `/.well-known/oauth-authorization-server/api/public/mcp/oauth`; existing path-appended alias remains. | Root guard, official SDK discovery, both engines. |
| Issuer and public endpoint URLs | Existing `PUBLIC_API_URL` takes precedence over internal request Host; the handler can read this variable through a narrow native policy. | Fresh isolated instance behind a real forwarding proxy, both engines. |
| OIDC fallback | Clients may fall back to OpenID discovery when RFC 8414 discovery is unavailable. RFC 8414 discovery exists here; this server does not advertise OpenID identity tokens or impersonate an OpenID provider. | Official MCP SDK uses the RFC 8414 route. |
| DCR | Public registration produces a client id with authentication method `none`; native metadata admission and serializable rolling/storage quotas bound new registrations. Existing clients retain their registered callbacks and exchanges. | Official SDK fresh discovery; `mcp_security_dcr_admission` and 146-test MCP gate pass on both engines. |
| Redirect validation | HTTPS, HTTP loopback and native callbacks; no fragment, wildcard, userinfo, executable scheme or remote HTTP. Authorization and exchange compare the registered callback exactly. | `mcp_security_redirects`, both engines. |
| PKCE | S256 only; 43-character unpadded base64url challenge and 43–128-character unreserved verifier; native raw SHA-256 and constant-time comparison. | RFC-vector, boundary lengths, malformed-proof, wrong-verifier and replay harness cases; focused proof smoke and official SDK, both engines. |
| Code lifetime and replay | CSPRNG code, hash lookup, 300-second expiry, atomic used transition, grant erasure. | OAuth harness expiry/replay/grant-zeroing cases, both engines. |
| Consent identity | Authenticated consent uses the ambient native user actor; the returned credential resolves as that member. | `automation_mcp_oauth`, both engines; browser rendering plus API approval. |
| State / nonce | State is preserved and percent-encoded for the client to compare. Nonce belongs to OpenID Connect; this server issues no ID token. | Harness encoded state and SDK callback state comparison. |
| Client authentication | Registered public clients use `none` plus mandatory PKCE; no confidential-client secret is issued. | Metadata and SDK flow. |
| Resource indicator | Explicit resource must match the advertised MCP URI at authorization and exchange; new OAuth credentials carry a protected audience. | `mcp_security_resource`, both engines. |
| HTTPS | Production endpoints use the host’s HTTPS listener or TLS proxy and configured public HTTPS authority. Loopback smoke uses HTTP. | HTTPS authority generation has harness coverage; the forwarding-proxy proof uses a distinct public loopback authority. No automatic certificate provisioning is present. |
| Native callbacks | Existing private native callback schemes remain supported under OAuth native-app compatibility; HTTPS and loopback clients satisfy MCP’s narrower wording. | Safe registration harness and smoke retain native callbacks; Compatibility records this extension. |
| Current consent hostname display | Context returns the validated callback URI; consent renders its hostname through textContent before enabling approval. | `mcp_security_consent_destination`, real member browser proof on SQLite and Postgres; local merge `a76092beb`. |
| Refresh | No refresh grant or token is issued or advertised. | Authorization-server metadata and token payload. |

The official SDK passes connect, ping, schema discovery, tool calls, resources and prompts using both a bearer and an OAuth access token. Its own auth provider completes metadata discovery, DCR, PKCE generation, consenting-user approval, token exchange and a protected tool call. The proxy fixture starts an isolated database and installs the MCP module without module configuration, then performs the same flow through the public forwarding hop.

Protocol metadata remains 2025-03-26; the matrix covers authorization requirements rather than complete newer protocol support.

References: [MCP 2025-06-18 authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization), [MCP 2025-11-25 authorization](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization), [RFC 7591 §3.2.1](https://www.rfc-editor.org/rfc/rfc7591#section-3.2.1), [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636).

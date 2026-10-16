<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# MCP wire and OAuth regression checks

Run against an isolated KickSide instance with `kickside/mcp` installed and
its database, public/authenticated routers, HTTP server, and user scope bound.
Source validation should use `workspace.replacements`; editing an unpacked
vendor directory does not reliably change the loaded module.

Set `MCP_TEST_BASE_URL` to that instance's public origin and
`MCP_TEST_SESSION_TOKEN` to a test user's KickSide session token. The scripts
create OAuth clients and MCP credentials, so use a disposable database.
Secrets are supplied through the environment, never command-line arguments.

```sh
export MCP_TEST_TOKEN_FILE="$(mktemp)"
python3 http_protocol_test.py
npm ci --prefix client
npm test --prefix client
```

The HTTP check verifies standard and legacy discovery, OAuth consent, PKCE,
state, code replay, mismatched clients/redirects, and both OAuth and direct
bearer access. It checks JSON object/array distinctions after HTTP serialization
for initialize, ping, tools, resources, prompts, and tool calls. Its token file
is private and consumed by the SDK check; delete it after testing.

The SDK check uses the official MCP client and validates advertised tool schemas
with Ajv. It also performs the SDK's own OAuth discovery, dynamic registration,
PKCE/token exchange, and authenticated tool call. The consent click is exercised
through the authenticated HTTP endpoint; this does not automate the browser UI.

For release validation, remove the source replacement, install the published
module, restart, and rerun both checks against the downloaded package.

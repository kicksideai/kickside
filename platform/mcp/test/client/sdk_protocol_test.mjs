import fs from 'node:fs';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { auth, discoverAuthorizationServerMetadata, discoverOAuthProtectedResourceMetadata } from '@modelcontextprotocol/sdk/client/auth.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import Ajv from 'ajv';

const config = JSON.parse(fs.readFileSync(process.env.MCP_TEST_TOKEN_FILE, 'utf8'));
const ajv = new Ajv({ strict: false });
const nativeErrorResult = {
  content: [{ type: 'text', text: 'tool error: provider unavailable' }],
  isError: true,
  structuredContent: { error: {
    kind: 'Unavailable',
    message: 'provider unavailable',
    retryable: true,
    details: { code: 'PROBE_NATIVE', nested: { marker: 'kept' } },
  } },
};
assert.deepEqual(CallToolResultSchema.parse(nativeErrorResult), nativeErrorResult);
for (const mode of ['bearer', 'oauth']) {
  const client = new Client({ name: 'kickside-regression', version: '1' });
  const transport = new StreamableHTTPClientTransport(new URL(config.url), {
    requestInit: { headers: { Authorization: `Bearer ${config[mode]}` } },
  });
  try {
    await client.connect(transport);
    await client.ping();
    const { tools } = await client.listTools();
    for (const tool of tools) assert(ajv.validateSchema(tool.inputSchema), `${tool.name}: ${ajv.errorsText()}`);
    await client.listResources();
    await client.readResource({ uri: 'mcp://scope' });
    await client.listPrompts();
    const call = await client.callTool({ name: 'session_info', arguments: {} });
    assert(!call.isError);
    console.log(`Official MCP SDK ${mode}: connect, ping, tools (${tools.length} valid schemas), resources, prompts and call PASS`);
  } finally { await client.close(); }
}
const response = await fetch(config.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'}) });
const metadataUrl = response.headers.get('www-authenticate').match(/resource_metadata="([^"]+)"/)[1];
const resource = await discoverOAuthProtectedResourceMetadata(config.url, { resourceMetadataUrl: new URL(metadataUrl) });
const metadata = await discoverAuthorizationServerMetadata(resource.authorization_servers[0]);
assert(metadata?.registration_endpoint, 'SDK could not discover OAuth registration endpoint');
console.log('Official MCP SDK OAuth metadata discovery PASS');

// Exercise the SDK's own dynamic registration, PKCE, and token exchange.
// The session represents the user approving consent in this disposable instance.
const session = process.env.MCP_TEST_SESSION_TOKEN;
assert(session, 'MCP_TEST_SESSION_TOKEN is required for OAuth consent');
let clientInformation, tokens, verifier, authorizationCode;
const provider = {
  redirectUrl: 'http://127.0.0.1:49174/callback',
  clientMetadata: { client_name: 'SDK OAuth regression', redirect_uris: ['http://127.0.0.1:49174/callback'],
    grant_types: ['authorization_code'], response_types: ['code'], token_endpoint_auth_method: 'none' },
  clientInformation: () => clientInformation,
  saveClientInformation: value => { clientInformation = value; },
  tokens: () => tokens,
  saveTokens: value => { tokens = value; },
  saveCodeVerifier: value => { verifier = value; },
  codeVerifier: () => verifier,
  state: () => 'sdk-oauth-regression-state',
  redirectToAuthorization: async url => {
    const response = await fetch(new URL('/api/v1/mcp/oauth/consent', config.url), {
      method: 'POST', headers: { Authorization: `Bearer ${session}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: Object.fromEntries(url.searchParams), mint: {} }),
    });
    assert.equal(response.status, 200, 'OAuth consent failed');
    const result = await response.json();
    assert(result.success);
    const callback = new URL(result.redirect_to);
    assert.equal(callback.searchParams.get('state'), 'sdk-oauth-regression-state');
    authorizationCode = callback.searchParams.get('code');
  },
};
assert.equal(await auth(provider, { serverUrl: config.url, resourceMetadataUrl: new URL(metadataUrl) }), 'REDIRECT');
assert(authorizationCode);
assert.equal(await auth(provider, { serverUrl: config.url, resourceMetadataUrl: new URL(metadataUrl), authorizationCode }), 'AUTHORIZED');
const oauthClient = new Client({ name: 'sdk-oauth-regression', version: '1' });
try {
  await oauthClient.connect(new StreamableHTTPClientTransport(new URL(config.url), { authProvider: provider }));
  await oauthClient.listTools();
  assert(!(await oauthClient.callTool({ name: 'session_info', arguments: {} })).isError);
  console.log('Official MCP SDK OAuth registration, consent, PKCE, token exchange and tool call PASS');
} finally { await oauthClient.close(); }

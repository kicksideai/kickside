"""MCP catalog, transport, result-size and visible-error contracts."""
from harness import require


def mcp_limits(ctx):
    from scenarios_providers import connect, probe_value
    cid = connect(ctx, 'mcp-limits', 'kickside.mcp_client:remote_connection', {
        'endpoint_url': ctx.state['provider_bases']['mcp'] + '/mcp/limits', 'auth_type': 'none',
    })
    resources = ctx.inst.request('POST', '/api/v1/connections/' + cid + '/discover_resources', {}, label='mcp-large-catalog')['resources']
    require(len(resources) == 80, 'MCP discovery loses a catalog larger than 64 tools')

    def call(name, connection=cid, context=None, *, expect_error=False):
        return probe_value(ctx, tool='kickside.mcp_client:invoke_tool', connection=connection,
                           context=context if context is not None else {'remote_tool_name': name},
                           arguments={}, label='mcp-limits-' + name, expect_error=expect_error)

    sse = call('sse_dump')
    require(sse.get('success') is not False, 'MCP SSE dump fails: ' + str(sse))
    text = sse['content'][0]['text']
    require(text.startswith('NORTHWIND-SSE-731') and len(text) == 140000, 'MCP large SSE loses text')
    recovered = call('text_dump')
    require(recovered.get('success') is not False, 'MCP text dump fails: ' + str(recovered))
    require(recovered.get('isTruncated') is not True, 'MCP direct result returns truncated text')
    require(recovered['content'][0]['text'] == '☃\\n"\\' * 240000,
            'MCP direct result loses escaped UTF-8 text')
    require('�' not in recovered['content'][0]['text'], 'MCP direct result splits a UTF-8 character')
    binary = call('binary_dump')
    require(binary.get('success') is not False, 'MCP binary dump fails: ' + str(binary))
    require(binary['content'] == [{'type': 'image', 'data': 'z' * 1200000, 'mimeType': 'image/png'}],
            'MCP direct result loses binary content or its media type')
    remote = call('remote_error')
    require(remote.get('success') is False and 'packing station' in remote.get('error', ''),
            'MCP remote domain error loses visible diagnostics')
    unknown = call('unknown_tool', expect_error=True)
    require(unknown.get('isError') is True and 'unknown fixture' in unknown['content'][0]['text'],
            'MCP protocol error loses visible diagnostics')
    missing_connection = call('no_connection', connection=None, expect_error=True)
    require(missing_connection.get('isError') is True and 'not configured' in missing_connection['content'][0]['text'],
            'MCP missing connection does not return its typed failure')
    missing_binding = call('no_binding', context={}, expect_error=True)
    require(missing_binding.get('isError') is True and 'binding is invalid' in missing_binding['content'][0]['text'],
            'MCP missing binding does not return its typed failure')
    calls = [row for row in ctx.fixtures.requests('mcp') if row['body'].get('method') == 'tools/call']
    require(calls and all(isinstance(row['body']['params']['arguments'], dict) for row in calls),
            'MCP wire arguments serialize as an array')

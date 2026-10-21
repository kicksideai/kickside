-- Shared protocol DTOs. Provider-owned schemas describe their native JSON data.
local M = {}
type Object = { [string]: unknown }
type Schema = {
    type: string?, properties: { [string]: Schema }?, required: { string }?,
    additionalProperties: boolean?, items: Schema?, enum: { unknown }?,
    minimum: number?, maximum: number?, minLength: number?, maxLength: number?,
    minItems: number?, maxItems: number?,
}
type Operation = {
    method: string, path: string, write: boolean, schema: Schema,
    query: { string }?, body: { string }?, defaults: Object?,
    document: string?, extract: string?, endpoint: string?,
    mode: string?, argument: { string }?, body_root: string?, result_array: string?,
    cursor_field: string?, has_more_field: string?, offset_page: boolean?,
    headers: { [string]: string }?, header_fields: { [string]: string }?,
    clear_parent: string?,
}
type Config = {
    provider: string, title: string, endpoints: { [string]: string },
    headers: { [string]: string }?, operations: { [string]: Operation },
    health_action: string, discovery_action: string, discovery_params: Object?, api_key_scheme: string?, query_array_format: string?,
}
type Token = { success: boolean, access_token: string?, error: string? }
type TokenSource = { get_access_token: (({ rejected_access_token: string? }?) -> (Token?, error?)) }
type Connection = { component_id: string, access_token: string?, oauth: TokenSource?, deadline: string?, api_key_scheme: string? }
type Request = { method: string, url: string, headers: { [string]: string }, body: string?, raw: boolean? }
type Prepare = (Config, Operation, Object) -> (Request?, error?)
type Result = { success: boolean, data: unknown?, error: string?, status_code: number?,
    retry_after_ms: integer?, next_cursor: string?, has_more: boolean? }
type Client = {connect: ((string, string?, boolean, string?, string?) -> (Connection?, error?)),
    request: ((Connection, Request) -> (Result?, error?))}
type Driver = {run: ((string, Object?, string?, boolean, string?) -> (Result?, error?))}
M.Object = Object
M.Schema = Schema
M.Operation = Operation
M.Config = Config
M.Token = Token
M.TokenSource = TokenSource
M.Connection = Connection
M.Request = Request
M.Prepare = Prepare
M.Result = Result
M.Client = Client
M.Driver = Driver
return M

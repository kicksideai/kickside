local test = require("test")
local exec_api = require("exec_api")
local delete_api = require("delete_api")
local run_errors = require("run_errors")
local list_published = require("list_published")
local blocks_api = require("blocks_api")
local canonical_json = require("canonical_json")
local function encode(value: any): string
    local encoded, err = canonical_json.encode(value)
    test.is_nil(err)
    test.not_nil(encoded)
    return encoded :: string
end
return test.run_cases(function()
    test.describe("Workflow HTTP runtime failures and domain results", function()
        for _, row in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 }, { errors.NOT_FOUND, 404 },
            { errors.CONFLICT, 409 }, { errors.ALREADY_EXISTS, 409 }, { errors.UNAVAILABLE, 503 },
            { errors.RATE_LIMITED, 429 }, { errors.TIMEOUT, 504 }, { errors.CANCELED, 500 },
            { errors.INTERNAL, 500 }, { errors.UNKNOWN, 500 } }) do
            test.it("preserves the original launch failure for " .. row[1], function()
                local failure = errors.new({ kind = row[1], message = "opaque" })
                test.eq(exec_api.error_status(failure), row[2])
                local api = exec_api.new({ runs_launch = { launch = function() return nil, failure end } })
                local result, err = api.run_request("workflow", { version = 1 })
                test.is_nil(result)
                test.eq(err, failure)
                test.eq(encode(api.launch_error_body(err)),
                    encode({ success = false, error = tostring(failure), code = "workflow_failed" }))
            end)
        end
        test.it("keeps explicit domain result statuses", function()
            for _, row in ipairs({ { "authentication_required", 401 }, { "access_denied", 403 },
                { "run_not_found", 404 }, { "version_not_found", 404 }, { "not_published", 409 },
                { "run_terminal", 409 }, { "dataflow_terminal", 409 }, { "await_not_pending", 409 },
                { "await_ambiguous", 409 }, { "compile_failed", 422 }, { "publish_refused", 422 },
                { "flow_ref_invalid", 400 } }) do
                test.eq(exec_api.error_status(run_errors.launch_error(row[1], "opaque")), row[2])
            end
        end)
        test.it("rejects workflow deletion without DELETE before calling teardown", function()
            local captured: any = {}
            local api = delete_api.new({
                http = {
                    CONTENT = { JSON = "application/json" },
                    STATUS = { OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401, FORBIDDEN = 403, INTERNAL_ERROR = 500 },
                    request = function() return { param = function() return "workflow" end } end,
                    response = function() return {
                        set_content_type = function() end,
                        set_status = function(_self: any, status: any) captured.status = status end,
                        write_json = function(_self: any, body: any) captured.body = body end,
                    } end,
                },
                security = { actor = function() return {} end },
                repo = { ACCESS = { DELETE = 4 }, require_access = function(id: string, mask: number)
                    test.eq(id, "workflow")
                    test.eq(mask, 4)
                    return errors.new({ kind = errors.PERMISSION_DENIED, message = "access denied" })
                end, delete = function() error("denied deletion reaches teardown") end },
            })
            api.handler()
            test.eq(captured.status, 403)
            test.eq(captured.body.success, false)
            test.not_nil(captured.body.error)
        end)

        test.it("keeps untyped failures internal", function()
            test.eq(exec_api.error_status("version not found"), 500)
            test.eq(exec_api.error_status(nil), 500)
        end)
        test.it("keeps published and Block collections compact until a caller selects fields or one item", function()
            local captured: any = {}
            local query: any = {}
            local request = { query = function(_self: any, key: string) return query[key] end }
            local http = {
                CONTENT = { JSON = "application/json" }, STATUS = { OK = 200, BAD_REQUEST = 400, NOT_FOUND = 404,
                    UNAUTHORIZED = 401, INTERNAL_ERROR = 500 },
                request = function() return request end,
                response = function() return {
                    set_content_type = function() end,
                    set_status = function(_self: any, status: any) captured.status = status end,
                    write_json = function(_self: any, body: any) captured.body = body end,
                } end,
            }
            local params = { query_int = function(_req: any, _key: string, fallback: number) return fallback end,
                bad_request = function() error("unexpected invalid request") end }
            local published = list_published.new({ http = http, http_params = params, security = { actor = function() return {} end },
                catalog = {
                    bindable_items = function() return {{ id = "flow", title = "Flow", flow_ref = { kind = "flow", id = "flow", version = 1 } }}, nil end,
                    catalog = function() return {{ id = "kickside.workflows.call:flow", input_schema = { type = "object" } }}, nil end,
                }, errors = { classify = function() return 500 end } })
            published.handler()
            test.not_nil(captured.body.items[1].flow_ref)
            test.is_nil(captured.body.items[1].input_schema)
            query.id = "flow"
            published.handler()
            test.not_nil(captured.body.item.input_schema)
            query.id = nil

            local catalog = { catalog = function() return { block = { id = "block", label = "Block", input_schema = { type = "object" },
                output_schema = { type = "object" }, config = { properties = {} }, execution = { kind = "function" },
                extension = { retained = true }, public = true } }, nil end }
            local blocks = blocks_api.new({ http = http, http_params = params, security = { actor = function() return {} end }, catalog = catalog,
                errors = { classify = function() return 500 end } })
            blocks.handler()
            test.eq(captured.body.blocks[1].id, "block")
            test.is_nil(captured.body.blocks[1].input_schema)
            query.fields = "input_schema"
            blocks.handler()
            test.not_nil(captured.body.blocks[1].input_schema)
            query.fields = nil
            query.id = "block"
            blocks.handler()
            test.not_nil(captured.body.block.input_schema)
            test.not_nil(captured.body.block.config)
            test.eq(captured.body.block.execution.kind, "function")
            test.is_true(captured.body.block.extension.retained)
        end)
    end)
end)

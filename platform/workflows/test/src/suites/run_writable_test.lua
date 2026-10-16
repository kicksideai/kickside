local test = require("test")
local json = require("json")
local registry = require("registry")
local writable_module = require("run_writable")
local writable = writable_module

type Map = { [string]: any }

-- The invoking automation: every request names it as automation_ref and as its writing origin.
local ORIGIN = "automation-1"

local function entry_data(entry: any): Map
    local e = type(entry) == "table" and (entry :: Map) or {}
    return type(e.data) == "table" and (e.data :: Map) or e
end

local function define_tests()
    test.describe("workflow run writable contract", function()
        test.it("shares the library source and dependencies across callable run entries", function()
            local library = entry_data(registry.get("kickside.workflows.runs:run_writable"))
            test.not_nil(library.source)
            for _, name in ipairs({ "run_write" }) do
                local callable = entry_data(registry.get("kickside.workflows.runs:" .. name))
                test.eq(callable.source, library.source)
                local want_imports = type(library.imports) == "table" and (library.imports :: Map) or {}
                local got_imports = type(callable.imports) == "table" and (callable.imports :: Map) or {}
                for key, value in pairs(want_imports) do test.eq(got_imports[key], value) end
                for key, value in pairs(got_imports) do test.eq(want_imports[key], value) end
                local want_modules: { [string]: boolean } = {}
                for _, value in ipairs(type(library.modules) == "table" and library.modules or {}) do
                    want_modules[tostring(value)] = true
                end
                local got_modules: { [string]: boolean } = {}
                for _, value in ipairs(type(callable.modules) == "table" and callable.modules or {}) do
                    got_modules[tostring(value)] = true
                end
                for key in pairs(want_modules) do test.is_true(got_modules[key] == true) end
                for key in pairs(got_modules) do test.is_true(want_modules[key] == true) end
            end
        end)


        test.it("requires the invoking automation on the request and a stable record key", function()
            local result = writable.write({
                config = { flow_ref = { kind = "flow", id = "flow-1", version = 2 } },
                input = { value = false }, identity_key = "record-1", idempotency_key = "delivery-1",
                sink_op = "create", origin = ORIGIN,
            })
            test.eq(result.success, false)
            test.eq(result.error.code, "invalid_request")
            local in_input = writable.write({
                config = { flow_ref = { kind = "flow", id = "flow-1", version = 2 } },
                input = { automation_ref = { kind = "automation", id = ORIGIN, revision = 1 }, value = false },
                identity_key = "record-1", idempotency_key = "delivery-1", sink_op = "create", origin = ORIGIN,
            })
            test.eq(in_input.success, false)
            test.eq(in_input.error.code, "invalid_request")
        end)

        test.it("refuses a request whose origin is missing or is not the invoking automation", function()
            local effects: { string } = {}
            local function record(effect: string): any
                return function() effects[#effects + 1] = effect; return nil, "unexpected " .. effect end
            end
            local guarded = writable_module.new({
                repo = { ACCESS = { READ = 1 }, require_access = function() effects[#effects + 1] = "access"; return nil end },
                version_read = { get = record("version_read") },
                compiler = { remint = record("remint") },
                load_identity = record("load_identity"),
                admission = { find = record("find"), reserve = record("reserve"), merge = record("merge"),
                    creation_payload = record("creation_payload") },
                client_new = record("client_new"),
            })
            local function request(origin: string?): any
                return {
                    config = { flow_ref = { kind = "flow", id = "flow-1", version = 2 } },
                    automation_ref = { kind = "automation", id = ORIGIN, revision = 4 }, origin = origin,
                    input = { value = false }, identity_key = "record-1", idempotency_key = "delivery-1",
                    sink_op = "create",
                }
            end
            for _, case in ipairs({ { name = "missing" }, { name = "empty", origin = "" },
                { name = "foreign", origin = "automation-2" } }) do
                local result = guarded.write(request(case.origin))
                test.eq(result.success, false, case.name .. " origin must be refused")
                test.eq(result.error.code, "invalid_request")
                test.is_false(result.error.retriable)
                test.eq(#effects, 0, case.name .. " origin must not reach access, admission or the engine")
            end
        end)

        test.it("rejects legacy scalar input and starts an exact object record", function()
            local started: any = nil
            local loaded_for: any = nil
            local reserved: any = nil
            local load_identity = function(automation_id: string)
                loaded_for = automation_id
                return { version = 2, principal = { kind = "user", id = "u-1" }, authorized_by = { kind = "user", id = "u-1" },
                    captured_at = "2026-09-26T00:00:00Z" }, nil
            end
            local admission_double = {
                find = function() return nil, nil end,
                reserve = function(args: any)
                    reserved = args
                    return { row = { run_id = args.run_id, dataflow_id = args.dataflow_id,
                        admission_state = "unadmitted",
                        execution_identity_json = args.execution_identity_json,
                        creation_payload_json = args.creation_payload_json } }, nil
                end,
                merge = function() return { admitted = true, terminal = false }, nil end,
                creation_payload = function(row: any)
                    return json.decode(row.creation_payload_json)
                end,
            }
            local cli: any = {}
            local status: string? = nil
            function cli:get_status(): (any?, any?)
                return status, status == nil and "Workflow not found or access denied" or nil
            end
            function cli:create_workflow(_commands: any, options: any): (any?, any?)
                status = "pending"; return options.dataflow_id, nil
            end
            function cli:start(id: string): (any?, any?) status = "running"; return id, nil end
            function cli:execute(id: string): (any?, any?) return { success = true, dataflow_id = id }, nil end
            function cli:output(): (any?, any?) return {}, nil end
            writable = writable_module.new({
                repo = { ACCESS = { READ = 1 }, require_access = function() return nil end },
                version_read = { get = function() return { compiled_commands = {}, input_schema = { type = "object" } }, nil end },
                compiler = { remint = function(_commands: any, _mint: any, input: any) started = input; return {}, {}, nil end },
                load_identity = load_identity, admission = admission_double,
                client_new = function() return cli, nil end,
            })
            local invalid_inputs = {
                { name = "scalar", input = "legacy scalar" },
                { name = "boolean", input = false },
                { name = "missing" },
            }
            for _, invalid in ipairs(invalid_inputs) do
                local invalid_request: any = {
                    config = { flow_ref = { kind = "flow", id = "flow-1", version = 2 } },
                    automation_ref = { kind = "automation", id = ORIGIN, revision = 4 }, origin = ORIGIN,
                    identity_key = "record-legacy", idempotency_key = "delivery-legacy", sink_op = "create",
                }
                if invalid.name ~= "missing" then invalid_request.input = invalid.input end
                local invalid_result = writable.write(invalid_request)
                test.eq(invalid_result.success, false, invalid.name .. " input must be rejected")
                test.eq(invalid_result.error.code, "invalid_request")
                test.is_nil(started, "invalid input must not be reminted")
                test.is_nil(reserved, "invalid input must not be reserved")
                started, reserved = nil, nil
            end
            local result = writable.write({
                config = { flow_ref = { kind = "flow", id = "flow-1", version = 2 } },
                automation_ref = { kind = "automation", id = ORIGIN, revision = 4 }, origin = ORIGIN,
                input = { value = false }, identity_key = "record-1", idempotency_key = "delivery-1",
                sink_op = "create", limit = 1,
            })
            writable = writable_module
            test.is_true(result.success, tostring(result.error and result.error.message))
            test.eq(loaded_for, "automation-1")
            test.eq(reserved.trigger_id, "automation-1")
            test.eq(reserved.dedup_key, "delivery-1")
            test.is_nil(reserved.delivery_idempotency_key)
            test.eq(type(reserved.admission_hash), "string")
            test.is_nil(reserved.limit)
            test.eq(reserved.automation_revision, 4)
            test.eq(started.value, false)
            test.is_nil(started.automation_ref)
        end)

    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }

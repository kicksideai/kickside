-- HTTP envelopes for the automation control readers: GET
-- /automations/{id}/status, GET /automations/health and POST
-- /automations/{id}/identity. Each handler delegates to a response function,
-- driven here with the automation library as the stubbed seam.

local test = require("test")
local errors = require("errors")
local control = require("control_api")

type Map = { [string]: any }

local function actor(): any
    return { id = function(): string return "viewer-1" end }
end

local function lib(calls: { Map }, answers: Map): Map
    return {
        status = function(id: string, opts: Map): (any?, any)
            calls[#calls + 1] = { op = "status", id = id, opts = opts }
            return answers.status, answers.err
        end,
        health = function(): (any?, any)
            calls[#calls + 1] = { op = "health" }
            return answers.health, answers.err
        end,
        set_execution_identity = function(id: string, args: Map): (any?, any)
            calls[#calls + 1] = { op = "set_execution_identity", id = id, args = args }
            return answers.set_execution_identity, answers.err
        end,
        control = function(id: string, args: Map): (any?, any)
            calls[#calls + 1] = { op = "control", id = id, args = args }
            return answers.control, answers.err
        end,
    }
end

local function define_tests()
    test.describe("BOT-AUTOMATION-IDENTITY-EDITOR identity reader API", function()
        test.it("returns the owned safe identity projection", function()
            local projection = {principal = {kind = "user", id = "executor"},
                authorized_by = {kind = "user", id = "operator"}, identity_generation = 3}
            local status, body = control.get_execution_identity_response(actor(), "root", {
                automations_lib = {get_execution_identity = function(id) test.eq(id, "root"); return projection, nil end}})
            test.eq(status, 200)
            test.is_true(body.success)
            test.eq(body.identity, projection)
        end)
        test.it("refuses anonymous or absent root before owner dispatch", function()
            local deps = {automations_lib = {get_execution_identity = function() error("unexpected reader dispatch") end}}
            test.eq(control.get_execution_identity_response(nil, "root", deps), 401)
            test.eq(control.get_execution_identity_response(actor(), nil, deps), 400)
        end)
        test.it("folds missing and unauthorized roots into opaque refusal", function()
            local status, body = control.get_execution_identity_response(actor(), "root", {
                automations_lib = {get_execution_identity = function()
                    return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "secret root detail"}) end}})
            test.eq(status, 404)
            test.eq(body.error.message, "automation not found or access denied")
        end)
        test.it("preserves infrastructure status without returning private context", function()
            local status, body = control.get_execution_identity_response(actor(), "root", {
                automations_lib = {get_execution_identity = function()
                    return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "store unavailable"}) end}})
            test.eq(status, 503)
            test.is_nil(body.identity)
        end)
    end)
    test.describe("automation control API", function()
        test.it("pages status with the query token and size", function()
            local calls: { Map } = {}
            local status, body = control.status_response(actor(), "a-1", { page_token = "b", page_size = "2" },
                { automations_lib = lib(calls, { status = { drives = { { drive_key = "c" } }, commands = { generation = 3 },
                    ledger_counts = { unresolved = 0, uncertain = 0 } } }) })
            test.eq(status, 200)
            test.is_true(body.success)
            test.eq(body.id, "a-1")
            test.eq(body.drives[1].drive_key, "c")
            test.eq(body.commands.generation, 3)
            test.is_nil(body.next_page_token)
            test.eq(calls[1].opts.page_token, "b")
            test.eq(calls[1].opts.page_size, 2)
        end)

        test.it("preserves the canonical status including delivery failures and retention", function()
            local projection: Map = {
                drives = { { drive_key = "main", phase = "active" } },
                delivery_failures = { count = 2, last_error = { code = "invalid_expression",
                    message = "invalid operation: int(warehouse-notes.txt)", at = "2026-10-02T00:00:00Z", item_key = "upload-1" } },
                commands = { generation = 3 }, ledger_counts = { unresolved = 0, uncertain = 0 },
                retention = { ledger = 2 }, next_page_token = "main",
            }
            local status, body = control.status_response(actor(), "a-1", {},
                { automations_lib = lib({}, { status = projection }) })
            test.eq(status, 200)
            for key, value in pairs(projection) do test.eq((body :: Map)[key], value, "status omitted " .. key) end
            test.is_true(body.success)
            test.eq(body.id, "a-1")
        end)

        test.it("refuses a non-numeric page size before reading", function()
            local calls: { Map } = {}
            local status, body = control.status_response(actor(), "a-1", { page_size = "many" },
                { automations_lib = lib(calls, {}) })
            test.eq(status, 400)
            test.eq(body.error.code, "invalid_request")
            test.eq(#calls, 0)
        end)

        test.it("hides a missing or unreadable automation behind a neutral 404", function()
            local calls: { Map } = {}
            local status, body = control.status_response(actor(), "a-1", {}, { automations_lib = lib(calls, {
                err = errors.new({ kind = errors.PERMISSION_DENIED, message = "insufficient access to component" }) }) })
            test.eq(status, 404)
            test.eq(body.error.code, "not_found")
            test.eq(body.error.message, "automation not found or access denied")
        end)

        test.it("reports caller-scoped health", function()
            local calls: { Map } = {}
            local status, body = control.health_response(actor(), { automations_lib = lib(calls, {
                health = { degraded_drives = 1, uncertain_items = 2, overdue_count = 0 } }) })
            test.eq(status, 200)
            test.eq(body.health.degraded_drives, 1)
            test.eq(calls[1].op, "health")
        end)

        test.it("passes explicit authority recovery through the existing identity endpoint", function()
            local calls: { Map } = {}
            local status = control.set_execution_identity_response(actor(), "a-1", {
                principal = { kind = "user", id = "replacement" }, request_id = "recovery",
                expected_identity_generation = 2, supersede_request_id = "blocked",
            }, { automations_lib = lib(calls, { set_execution_identity = { state = "succeeded", outcome = {} } }) })
            test.eq(status, 200)
            test.eq(calls[1].args.supersede_request_id, "blocked")
        end)

        test.it("selects an identity and returns the command state with the identity generation", function()
            local calls: { Map } = {}
            local status, body = control.set_execution_identity_response(actor(), "a-1", {
                principal = { kind = "group", id = "eng" }, request_id = "r-1", expected_identity_generation = 0,
            }, { automations_lib = lib(calls, { set_execution_identity = { request_id = "r-1", generation = 4, state = "succeeded",
                identity_generation = 1, outcome = { identity_generation = 1 } } }) })
            test.eq(status, 200)
            test.is_true(body.success)
            test.eq(body.state, "succeeded")
            test.eq(body.identity_generation, 1)
            test.eq(body.generation, 4)
            test.eq(calls[1].args.principal.kind, "group")
            test.eq(calls[1].args.request_id, "r-1")
            test.eq(calls[1].args.expected_identity_generation, 0)
        end)

        test.it("carries a typed conflict and a denial through the envelope", function()
            local calls: { Map } = {}
            local status, body = control.set_execution_identity_response(actor(), "a-1", { request_id = "r-1" }, { automations_lib = lib(calls, {
                err = errors.new({ kind = errors.CONFLICT, message = "automation a-1 has pending command other" }) }) })
            test.eq(status, 409)
            test.eq(body.error.code, "conflict")
            local denied_status, denied = control.set_execution_identity_response(actor(), "a-1", {}, { automations_lib = lib(calls, {
                err = errors.new({ kind = errors.PERMISSION_DENIED, message = "may_act_as denied for group:eng" }) }) })
            test.eq(denied_status, 403)
            test.eq(denied.error.code, "access_denied")
        end)

        test.it("runs a drive control and returns its command state", function()
            local calls: { Map } = {}
            local status, body = control.control_response(actor(), "a-1", {
                control = "resync", drive_key = "main", request_id = "r-9", from = 0,
            }, { automations_lib = lib(calls, { control = { request_id = "r-9", generation = 7, state = "succeeded",
                outcome = { event_seq = 0 } } }) })
            test.eq(status, 200)
            test.is_true(body.success)
            test.eq(body.state, "succeeded")
            test.eq(body.generation, 7)
            test.eq(body.outcome.event_seq, 0)
            test.eq(calls[1].args.control, "resync")
            test.eq(calls[1].args.drive_key, "main")
            test.eq(calls[1].args.request_id, "r-9")
            test.eq(calls[1].args.from, 0)
            local bad_status, bad = control.control_response(actor(), "a-1", { control = "explode" }, { automations_lib = lib(calls, {
                err = errors.new({ kind = errors.INVALID, message = "control must be pause, resume, run_now, replay or resync" }) }) })
            test.eq(bad_status, 400)
            test.eq(bad.error.code, "invalid_request")
        end)

        test.it("requires an authenticated caller on every reader", function()
            local calls: { Map } = {}
            local deps = { automations_lib = lib(calls, {}) }
            test.eq((control.status_response(nil, "a-1", {}, deps)), 401)
            test.eq((control.health_response(nil, deps)), 401)
            test.eq((control.set_execution_identity_response(nil, "a-1", {}, deps)), 401)
            test.eq((control.control_response(nil, "a-1", {}, deps)), 401)
            test.eq(#calls, 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options: any): any return run_cases(options) end }

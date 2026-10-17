local test = require("test")
local sync = require("sync_runtime")
local automations = require("automations_lib")

local function declaration()
    return {trigger = {source = "app.fixture:personal_record_arrived", backfill = "all"},
        sink_port = "app.fixture:round_record", transform = {kind = "none"}, enabled = true}
end

local function runtime(overrides)
    return sync.new({automations_lib = setmetatable(overrides, {__index = automations})})
end

local function define_tests()
    test.describe("native sync dependency failures", function()
        for _, stage in ipairs({"resolve_source", "resolve_sink", "source_thread"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it("retains " .. stage .. " " .. kind .. " with retryability " .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, message = "sync dependency",
                            retryable = policy.retryable, details = {code = "sync_dependency", nested = {marker = "retained"}}})
                        local service = runtime({[stage] = function() return nil, source end})
                        local result, err = service.install(declaration())
                        test.is_nil(result)
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), policy.retryable)
                        test.eq(err:details().code, "sync_dependency")
                        test.eq(err:details().nested.marker, "retained")
                    end)
                end
            end
        end
        for _, case in ipairs({
            {stage = "resolve_source", code = "sync_endpoint_missing", field = "trigger.source"},
            {stage = "resolve_sink", code = "sync_endpoint_missing", field = "sink_port"},
            {stage = "source_thread", code = "source_identity_missing", field = "trigger.config.thread_id"},
        }) do
            test.it("classifies the absent " .. case.stage .. " dependency result", function()
                local service = runtime({[case.stage] = function() return nil end})
                local result, err = service.install(declaration())
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, case.code)
                test.eq(err:details().field, case.field)
            end)
        end
        test.it("rejects an unsupported source surface natively", function()
            local service = runtime({resolve_source = function()
                return {id = "app.fixture:unsupported", surface = "store"}
            end})
            local result, err = service.install(declaration())
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "sync_declaration_invalid")
            test.eq(err:details().field, "trigger.source")
        end)
    end)
end
return {run = test.run_cases(define_tests)}

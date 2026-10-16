local test = require("test")
local funcs = require("funcs")
local reaper = require("reaper_fixture")
local dependency = require("dependency_fixture")
local consts = require("lifecycle_consts")
local M = {}

function M.probe(input)
    dependency.configure(input)
    local result, err = reaper.run({thread_id = consts.thread_id(), range = {to_seq = 42},
        events = {{type = consts.EVENT.PRINCIPAL_DELETED, body = {subject_id = "owner"}}}})
    local calls = dependency.calls
    if input.stage == "scan" or input.stage == "delete" or input.stage == "continuation" then
        test.eq(calls.discovery, 0)
        test.eq(calls.dispatch, 0)
    elseif input.stage == "discovery" then test.eq(calls.dispatch, 0)
    else test.eq(calls.dispatch, 1) end
    if input.stage == "scan" then test.eq(calls.delete, 0)
    elseif input.stage == "delete" then test.eq(calls.delete, 1)
    elseif input.stage == "continuation" then test.eq(calls.delete, 50) end
    return result, err
end

local function define_tests()
    test.describe("native lifecycle reaper failures", function()
        for _, stage in ipairs({"scan", "delete", "continuation", "discovery", "dispatch", "envelope"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, boundary in ipairs({"library", "funcs"}) do
                        if kind ~= errors.UNKNOWN or boundary == "library" then
                            test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. boundary, function()
                                local input = {stage = stage, kind = kind, retryable = options.retryable}
                                local expected = errors.new({message = "cleanup dependency failure", kind = kind, retryable = options.retryable})
                                local result, err
                                if boundary == "library" then result, err = M.probe(input)
                                else result, err = funcs.call("app:reaper_native_probe", input) end
                                test.is_nil(result)
                                test.not_nil(err)
                                test.eq(err:kind(), expected:kind())
                                test.eq(err:retryable(), expected:retryable())
                                test.eq(err:details().code, "cleanup_dependency")
                                test.eq(err:details().nested.stage, stage)
                            end)
                        end
                    end
                end
            end
        end
        test.it("retains successful cleanup and cursor advancement", function()
            local result, err = M.probe({stage = "valid", kind = errors.INTERNAL})
            test.is_nil(err)
            test.eq(result.last_seq, 42)
            test.eq(result.body.stats.reaped, 0)
        end)
    end)
end

M.run = test.run_cases(define_tests)
return M

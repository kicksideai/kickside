local test = require("test")
local io = require("portable_io")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
    errors.RATE_LIMITED, errors.UNKNOWN}
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "portable guard requires an error"})) end
    return err
end
local function retains(envelope: any, source: error): ()
    test.not_nil(envelope)
    test.eq(envelope.kind, source:kind()); test.eq(envelope.retryable, source:retryable())
    test.eq(envelope.message, source:message())
    if source:details() then
        test.eq(envelope.details.code, source:details().code)
        test.eq(envelope.details.nested.marker, "kept")
        test.eq(source:details().nested.marker, "kept")
    else test.is_nil(envelope.details) end
end
local function native(kind: string, policy: table, detailed: boolean): error
    return (errors.new({kind = kind, message = "portable dependency refusal", retryable = policy.retryable,
        details = detailed and {code = "portable_dependency", nested = {marker = "kept"}} or nil}) :: error)
end
return {run = test.run_cases(function()
    test.describe("portable JSONL native causes", function()
        for _, kind in ipairs(kinds) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detailed in ipairs({false, true}) do
                    for _, mode in ipairs({"read", "scan"}) do
                        test.it(mode .. "/decode/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                            local source = native(kind, policy, detailed)
                            fixture.source = source
                            local closed = 0
                            local storage = {readfile = function() return "{}", nil end,
                                open = function() return {read = function() return "{}\n", nil end,
                                    close = function() closed = closed + 1; return true, nil end}, nil end}
                            local calls = 0
                            local value, err
                            if mode == "read" then value, err = io.read_jsonl(storage, "data/records.jsonl")
                            else value, err = io.scan_jsonl(storage, "data/records.jsonl", function() calls = calls + 1; return true, nil end) end
                            test.is_nil(value); test.is_true(errors.is(required(err), errors.INVALID))
                            test.is_false(required(err):retryable())
                            retains(required(err):details().cause, source)
                            test.eq(calls, 0); test.eq(closed, mode == "scan" and 1 or 0)
                        end)
                    end
                    for _, stage in ipairs({"read", "import"}) do
                        for _, close_kind in ipairs(kinds) do
                            test.it(stage .. "/close/" .. kind .. "/" .. close_kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                fixture.source = nil
                                local source = native(kind, policy, detailed)
                                local close_source = native(close_kind, policy, detailed)
                                local closed, reads, calls = 0, 0, 0
                                local storage = {open = function() return {
                                    read = function()
                                        reads = reads + 1
                                        if stage == "read" then return nil, source end
                                        return "{}\n", nil
                                    end,
                                    close = function() closed = closed + 1; return nil, close_source end,
                                }, nil end}
                                local value, err = io.scan_jsonl(storage, "data/records.jsonl", function()
                                    calls = calls + 1; return nil, source
                                end)
                                test.is_nil(value)
                                test.is_true(errors.is(required(err), close_source:kind()))
                                test.eq(required(err):retryable(), close_source:retryable())
                                if stage == "read" and kind == errors.NOT_FOUND then
                                    retains({kind = required(err):kind(), message = required(err):message(),
                                        retryable = required(err):retryable(), details = required(err):details()}, close_source)
                                else
                                    retains(required(err):details().cause, close_source)
                                    retains(required(err):details().operation_error, source)
                                end
                                test.eq(closed, 1); test.eq(reads, 1); test.eq(calls, stage == "import" and 1 or 0)
                            end)
                        end
                    end
                end
            end
        end
        test.it("the real JSON decoder exposes a native invalid refusal with its cause", function()
            fixture.source = nil
            local value, err = io.read_jsonl({readfile = function() return "{", nil end}, "data/records.jsonl")
            test.is_nil(value); test.is_true(errors.is(required(err), errors.INVALID))
            test.is_false(required(err):retryable()); test.not_nil(required(err):details().cause)
        end)
        test.it("a successful stream imports rows once and closes once", function()
            fixture.source = nil
            local reads, calls, closed = 0, 0, 0
            local value, err = io.scan_jsonl({open = function() return {
                read = function() reads = reads + 1; if reads == 1 then return "{}\n{}", nil end; return "", nil end,
                close = function() closed = closed + 1; return true, nil end,
            }, nil end}, "data/records.jsonl", function() calls = calls + 1; return true, nil end)
            test.is_true(value); test.is_nil(err); test.eq(calls, 2); test.eq(closed, 1)
        end)
    end)
end)}

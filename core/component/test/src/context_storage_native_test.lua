local test = require("test")
local context = require("context")
local fixture = require("fixture")
local json = require("json")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(route: string)
    if route == "revision" then return context.context_revision_tx({} :: any, "component") end
    if route == "set" then return context.set_context({}, {component_id = "component", private_context = {new = true}}) end
    return context.patch_context({}, {component_id = "component", patch = {new = true}, delete_keys = {"old"}})
end
local function native(actual: any, source: error)
    test.eq(type(actual), "userdata"); test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    if source:details() then
        test.eq(actual:details().code, "context_storage_dependency"); test.eq(actual:details().nested.marker, "kept")
        test.eq(source:details().nested.marker, "kept")
    else test.is_nil(actual:details()) end
end
return {run = test.run_cases(function()
    test.describe("native private context storage", function()
        for _, route in ipairs({"set", "patch", "revision"}) do
            local stages = route == "revision" and {"read"} or {"lock", "read", "decode", "encode", "write"}
            for _, stage in ipairs(stages) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detail in ipairs({false, true}) do
                            test.it(route .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(detail), function()
                                local source = errors.new({kind = kind, retryable = options.retryable, message = "context dependency refuses",
                                    details = detail and {code = "context_storage_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(stage, source); local result, err = invoke(route)
                                test.is_nil(result); native(err, source)
                                test.eq(fixture.writes, stage == "write" and 1 or 0)
                                if stage == "lock" then test.eq(fixture.reads, 0) end
                                if stage == "read" then test.eq(fixture.decodes, 0); test.eq(fixture.encodes, 0) end
                                if stage == "decode" then test.eq(fixture.encodes, 0) end
                            end)
                        end
                    end
                end
            end
        end
        for _, route in ipairs({"set", "patch"}) do
            test.it("healthy/" .. route, function()
                fixture.reset("", nil); fixture.raw = {old = true, _execution_identity = {marker = "kept"}}
                local result, err = invoke(route); test.is_nil(err); test.eq(result.component_id, "component"); test.is_true(result.changes_made)
                test.eq(fixture.locks, 1); test.eq(fixture.writes, 1)
                local stored, decode_err = json.decode(fixture.written); test.is_nil(decode_err)
                test.is_true(stored.new); test.eq(stored._execution_identity.marker, "kept"); test.is_nil(stored.old)
            end)
            test.it("missing component/" .. route, function()
                fixture.reset("", nil); fixture.rows = {}
                local result, err = invoke(route); test.is_nil(result); test.is_true(errors.is(err, errors.NOT_FOUND)); test.eq(fixture.writes, 0)
            end)
        end
        test.it("present and absent context revision", function()
            fixture.reset("", nil); local revision, err = invoke("revision"); test.is_nil(err); test.eq(revision, 7)
            fixture.rows = {}; local absent, absent_err = invoke("revision"); test.is_nil(absent); test.is_nil(absent_err)
        end)
    end)
end)}

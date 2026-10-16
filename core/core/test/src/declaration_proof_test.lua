local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "declaration guard requires JSON proof"})) end
    return data
end
local function call(identity: table): error?
    return api.apply_thread_declaration(fixture.database(), "thread", "declared", identity)
end
return {run = test.run_cases(function()
    test.describe("native declared projection outcomes", function()
        for _, stage in ipairs({"read", "register", "identity"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "declaration_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source)
                        local err = call(stage == "identity" and {error = source} or {system = true})
                        test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        test.eq(encoded(err:details()), encoded(source:details()))
                        test.eq(fixture.reads, stage == "identity" and 0 or 1); test.eq(fixture.registers, stage == "register" and 1 or 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"missing_rows", "scalar_rows", "scalar_row", "sparse_rows", "keyed_rows", "missing_id", "empty_id", "invalid_id", "missing_registration", "scalar_registration"}) do
            test.it(stage .. "/mandatory proof", function()
                fixture.reset(stage, nil); local err = call({system = true})
                test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
                test.eq(fixture.registers, (stage == "missing_registration" or stage == "scalar_registration") and 1 or 0)
            end)
        end
        test.it("missing execution identity remains permanent Invalid", function()
            fixture.reset("", nil); local err = call({})
            test.not_nil(err); test.eq(err:kind(), errors.INVALID); test.is_false(err:retryable()); test.eq(err:details().error_kind, "declaration"); test.not_nil(err:details().code)
            test.eq(fixture.reads, 0); test.eq(fixture.registers, 0)
        end)
        for _, stage in ipairs({"", "existing"}) do
            for _, identity in ipairs({{system = true}, {row = {version = 2}}}) do
                test.it("healthy/" .. stage .. "/" .. tostring(identity.system), function()
                    fixture.reset(stage, nil); test.is_nil(call(identity)); test.eq(fixture.reads, 1); test.eq(fixture.registers, 1)
                end)
            end
        end
    end)
end)}

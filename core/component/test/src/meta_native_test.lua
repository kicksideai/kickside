local test = require("test")
local meta = require("meta")
local fixture = require("fixture")
local json = require("json")
local function invoke(stage)
    if stage == "lock" then return nil, meta.lock_component_tx(fixture.executor(), "component") end
    if stage == "read" then return meta.public_meta_tx(fixture.executor(), "component", true) end
    if stage == "encode" then return meta.encode_public_meta_value("public", {count = 2}) end
    if stage == "floor_read" or stage == "floor_write" then
        fixture.stage = stage == "floor_read" and "read" or "insert"
        fixture.rows = {}
        return meta.raise_meta_floor(fixture.executor(), "component", "floor", 3)
    end
    local value, changed, err = meta.set_public_meta(fixture.executor(), "component",
        stage == "delete" and {} or {public = {count = 2}}, stage == "delete" and {"public"} or nil)
    if err then test.is_false(changed) end
    return value, err
end
return {run = test.run_cases(function()
    test.describe("native component metadata boundaries", function()
        for _, stage in ipairs({"lock", "read", "encode", "owner", "delete", "insert", "touch", "floor_read", "floor_write"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
                errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "metadata dependency refusal", retryable = options.retryable,
                            details = {code = "metadata_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source)
                        local value, err = invoke(stage)
                        test.is_nil(value)
                        local native = err
                        if stage == "encode" then
                            test.is_true(errors.is(err, source:kind()))
                            test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "metadata_dependency")
                            test.eq(err:details().nested.stage, stage)
                            local encoded = err:details().cause
                            test.eq(encoded.kind, source:kind())
                            test.eq(encoded.retryable, source:retryable())
                            test.eq(encoded.details.code, "metadata_dependency")
                            test.eq(encoded.details.nested.stage, stage)
                        else
                            test.eq(native:kind(), source:kind())
                            test.eq(native:retryable(), source:retryable())
                            test.eq(native:details().code, "metadata_dependency")
                            test.eq(native:details().nested.stage, stage)
                        end
                        test.eq(source:details().nested.stage, stage)
                    end)
                end
            end
        end
        test.it("public writes and deletes retain successful data", function()
            fixture.reset(nil, nil)
            local value, changed, err = meta.set_public_meta(fixture.executor(), "component", {public = {count = 2}})
            test.is_nil(err)
            test.is_true(changed)
            test.eq(value[1].key, "public")
            test.eq(value[1].value, '{"count":2}')
            fixture.reset(nil, nil)
            value, changed, err = meta.set_public_meta(fixture.executor(), "component", {}, {"public"})
            test.is_nil(err)
            test.is_true(changed)
            test.is_true(value[1].deleted)
        end)
        test.it("reads and metadata floors retain successful data", function()
            fixture.reset(nil, nil)
            local value, err = meta.public_meta_tx(fixture.executor(), "component", true)
            test.is_nil(err)
            test.eq(value.public, "saved")
            fixture.rows = {{key = "floor", value = "4"}}
            value, err = meta.raise_meta_floor(fixture.executor(), "component", "floor", 3)
            test.is_nil(err)
            test.eq(value, 4)
        end)
        test.it("missing component remains native NotFound", function()
            fixture.reset(nil, nil)
            fixture.lock_count = 0
            local err = meta.lock_component_tx(fixture.executor(), "component")
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)
        test.it("declared owner and private keys remain Invalid", function()
            fixture.reset(nil, nil)
            fixture.owners = {{id = "declared-owner"}}
            local err = meta.validate_public_meta_key("public")
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:details().code, "component_meta_owner_required")
            err = meta.validate_public_meta_key("config")
            test.is_true(errors.is(err, errors.INVALID))
        end)
        test.it("real SDK encoder failures remain native", function()
            fixture.reset(nil, nil)
            local cycle = {}; cycle.self = cycle
            local value, err = meta.encode_public_meta_value("public", cycle)
            test.is_nil(value)
            local _, source = json.encode(cycle)
            test.not_nil(source)
            if not source then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "metadata codec guard requires SDK failure"})) end
            test.is_true(errors.is(err, source:kind())); test.eq(err:retryable(), source:retryable())
            local cause = err:details().cause
            test.eq(cause.kind, source:kind()); test.eq(cause.retryable, source:retryable()); test.eq(cause.details, source:details())
        end)
    end)
end)}

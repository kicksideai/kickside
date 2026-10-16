local test = require("test")
local access = require("access")
local fixture = require("fixture")
local function exercise(route)
    local db = fixture.executor()
    local command: any = {payload = {component_id = "component", subject_type = "user", subject_id = "user", access_mask = 1}}
    if route == "grant_update" or route == "grant_insert" then return access.grant_access(db, db, command) end
    if route == "revoke" then return access.revoke_access(db, db, command) end
    if route == "effective" then return access.check_user_access(db, "user", "component", 1, {{subject_type = "user", subject_id = "user"}}, nil, true) end
    if route == "admin" then return access.apply_subtree_access(db, db, "component", "user", 1, true, "user") end
    if route == "list" or route == "database" then return access.list_access("component") end
    if route == "reaching" then return access.reaching_grants("component") end
    if route == "owner" then return access.component_owner_record("component") end
    return access.canonicalize_email_grants(db, function() return "canonical-user", nil end)
end
return {run = test.run_cases(function()
    test.describe("native component access persistence causes", function()
        for _, route in ipairs({"grant_update", "grant_insert", "revoke", "effective", "admin", "list", "reaching", "owner", "emails", "email_upsert", "email_delete", "database"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(route .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "access dependency refusal", retryable = options.retryable,
                            details = {code = "access_dependency", nested = {marker = "kept"}}})
                        fixture.reset(route, source); local result, actual = exercise(route)
                        if route == "effective" then test.is_false(result) else test.is_nil(result) end
                        if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "access guard requires failure"})) end
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "access_dependency"); test.eq(actual:details().nested.marker, "kept")
                        test.eq(fixture.releases, (route == "list" or route == "reaching" or route == "owner") and 1 or 0)
                    end)
                end
            end
        end
        test.it("missing successful connection is permanent Internal", function()
            fixture.reset("database", nil); local result, actual = access.list_access("component")
            test.is_nil(result); test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
            test.eq(actual:details().code, "component_access_response")
        end)
        test.it("healthy email scan remains empty", function()
            fixture.reset("healthy", nil); local result, err = access.canonicalize_email_grants(fixture.executor(), function() return "user", nil end)
            test.is_true(result); test.is_nil(err); test.eq(fixture.calls, 1)
        end)
    end)
end)}

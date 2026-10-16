local test = require("test")
local subjects = require("subjects")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function native(actual: any, source: error)
    test.eq(type(actual), "userdata"); test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    if source:details() then
        test.eq(actual:details().code, "access_subject_dependency"); test.eq(actual:details().nested.marker, "kept")
        test.eq(source:details().nested.marker, "kept")
    else test.is_nil(actual:details()) end
end
return {run = test.run_cases(function()
    test.describe("native access subject dependencies", function()
        for _, stage in ipairs({"actor", "id", "meta", "get", "open", "groups"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, detail in ipairs({false, true}) do
                        local routes = stage == "actor" or stage == "id" or stage == "meta"
                        for _, route in ipairs(routes and {"resolve", "filter"} or {"principal"}) do
                            test.it(stage .. "/" .. route .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(detail), function()
                                local source = errors.new({kind = kind, retryable = options.retryable, message = "subject dependency refuses",
                                    details = detail and {code = "access_subject_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(stage, source)
                                local result, err
                                if route == "resolve" then result, err = subjects.resolve("user-1")
                                elseif route == "filter" then result, err = subjects.access_filter("user-1")
                                else result, err = subjects.principal_subjects({kind = "user", id = "user-1"}) end
                                native(err, source)
                                test.eq(#result, route == "resolve" and 1 or 0)
                                if route == "resolve" then
                                    if type(result[1]) ~= "table" then error("missing unprivileged subject") end
                                    test.eq(result[1].subject_type, "user"); test.eq(result[1].subject_id, "user-1")
                                end
                                local counts = {actor = 1, id = 2, meta = 3, get = 1, open = 2, groups = 3}
                                test.eq(#fixture.calls, counts[stage])
                            end)
                        end
                    end
                end
            end
        end
        test.it("expands and deduplicates actor groups and directory groups", function()
            fixture.reset("", nil)
            local own, err = subjects.resolve("user-1"); test.is_nil(err); test.eq(#own, 2); test.eq(own[2].subject_id, "group-a")
            local principal, principal_err = subjects.principal_subjects({kind = "user", id = "user-1"})
            test.is_nil(principal_err); test.eq(#principal, 2); test.eq(principal[2].subject_id, "directory-members")
        end)
        for _, stage in ipairs({"actor", "id"}) do
            test.it("absent/" .. stage, function()
                fixture.reset(stage, nil); local own, err = subjects.resolve("user-1")
                test.is_nil(err); test.eq(#own, 1); test.eq(own[1].subject_id, "user-1")
                local filter, filter_err = subjects.access_filter("user-1"); test.is_nil(filter); test.is_nil(filter_err)
            end)
        end
        for _, stage in ipairs({"get", "open"}) do
            test.it("absent provider/" .. stage, function()
                fixture.reset(stage, nil); local result, err = subjects.principal_subjects({kind = "user", id = "user-1"})
                test.eq(#result, 0); test.is_true(errors.is(err, errors.UNAVAILABLE)); test.is_true(err:retryable())
            end)
        end
        test.it("inactive and optional directory groups remain empty", function()
            fixture.reset("", nil); fixture.answer = {active = false, groups = {"directory-members"}}
            local inactive, err = subjects.principal_subjects({kind = "user", id = "user-1"}); test.is_nil(err); test.eq(#inactive, 0)
            fixture.answer = {active = true}; local active, active_err = subjects.principal_subjects({kind = "user", id = "user-1"})
            test.is_nil(active_err); test.eq(#active, 1)
        end)
        test.it("legacy actor keys and typed groups retain their subjects", function()
            fixture.reset("", nil)
            local legacy, err = subjects.resolve("system:automation"); test.is_nil(err); test.eq(legacy[1].subject_type, "user")
            test.eq(legacy[1].subject_id, "system:automation")
            local group, group_err = subjects.resolve("principal:group:eng"); test.is_nil(group_err)
            test.eq(#group, 1); test.eq(group[1].subject_type, "group"); test.eq(group[1].subject_id, "eng")
        end)
    end)
end)}

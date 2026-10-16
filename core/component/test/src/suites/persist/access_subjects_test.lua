local test = require("test")
local access_subjects = require("access_subjects")

local function joined(list: { any }): string
    local out: { string } = {}
    for _, v in ipairs(list or {}) do
        if type(v) == "table" then
            out[#out + 1] = tostring(v.subject_type) .. ":" .. tostring(v.subject_id)
        else
            out[#out + 1] = tostring(v)
        end
    end
    return table.concat(out, ",")
end

local function with_security(fake: any, body)
    local original = rawget(access_subjects, "_security")
    rawset(access_subjects, "_security", fake)
    local ok, err = pcall(body)
    rawset(access_subjects, "_security", original)
    if not ok then error(err) end
end

local function define_tests()
    test.describe("access_subjects.resolve", function()
        test.it("expands groups for the current actor", function()
            with_security({
                actor = function()
                    return {
                        id = function() return "user-1" end,
                        meta = function()
                            return {
                                security_groups = { "group-a" },
                                groups = { "legacy-group" },
                            }
                        end,
                    }
                end,
            }, function()
                test.eq(joined(access_subjects.resolve("user-1")), "user:user-1,group:group-a")
            end)
        end)

        test.it("returns a typed error with unprivileged subjects when the actor seam faults", function()
            with_security({
                actor = function() return nil, errors.new({message = "actor store unavailable", kind = errors.UNAVAILABLE}) end,
            }, function()
                local subjects, err = access_subjects.resolve("user-1")
                test.eq(joined(subjects), "user:user-1")
                test.not_nil(err)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
            end)
        end)

        test.it("returns a typed error when the actor id lookup faults", function()
            with_security({
                actor = function()
                    return {
                        id = function() return nil, errors.new({message = "actor id unavailable", kind = errors.UNAVAILABLE}) end,
                        meta = function() return { security_groups = { "group-a" } } end,
                    }
                end,
            }, function()
                local subjects, err = access_subjects.resolve("user-1")
                test.eq(joined(subjects), "user:user-1")
                test.not_nil(err)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
            end)
        end)

        test.it("returns a typed error when the actor meta lookup faults", function()
            with_security({
                actor = function()
                    return {
                        id = function() return "user-1" end,
                        meta = function() return nil, errors.new({message = "actor meta unavailable", kind = errors.UNAVAILABLE}) end,
                    }
                end,
            }, function()
                local subjects, err = access_subjects.resolve("user-1")
                test.eq(joined(subjects), "user:user-1")
                test.not_nil(err)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
            end)
        end)

        test.it("never catches a raised actor failure", function()
            with_security({
                actor = function() error("actor exploded") end,
            }, function()
                local ok, _ = pcall(function() access_subjects.resolve("user-1") end)
                test.is_false(ok)
            end)
        end)
    end)

    test.describe("access_subjects typed principals", function()
        test.it("EE2-2562 resolves declared user subjects from the directory even for the current actor", function()
            for _, groups in ipairs({ {}, { "forged-admin" } }) do
                with_security({ actor = function() return {
                    id = function() return "user-1" end,
                    meta = function() return { via = "mcp", security_groups = #groups > 0 and groups or nil } end,
                } end }, function()
                    local subjects, err = access_subjects.principal_subjects({ kind = "user", id = "user-1" })
                    test.is_nil(err)
                    test.eq(joined(subjects), "user:user-1,group:directory-members")
                    test.eq(joined(access_subjects.resolve("user-1")),
                        #groups > 0 and "user:user-1,group:forged-admin" or "user:user-1")
                end)
            end
        end)

        test.it("a group principal holds only its own group pair", function()
            with_security({
                actor = function()
                    return {
                        id = function() return "principal:group:eng" end,
                        meta = function() return { security_groups = { "group-a" } } end,
                    }
                end,
            }, function()
                test.eq(joined(access_subjects.resolve("principal:group:eng")), "group:eng")
            end)
        end)

        test.it("a service principal holds only its own service pair", function()
            test.eq(joined(access_subjects.resolve("principal:service:sync")), "service:sync")
        end)

        test.it("a framework actor matches the user-typed spelling it was granted under", function()
            test.eq(joined(access_subjects.resolve("system:automation")), "user:system:automation")
        end)

        test.it("resolves nothing for a missing actor id", function()
            test.eq(joined(access_subjects.resolve("")), "")
            test.eq(joined(access_subjects.resolve(nil)), "")
        end)
    end)

    test.describe("access_subjects.access_filter", function()
        local function actor_with(meta_table)
            return {
                actor = function()
                    return {
                        id = function() return "user-1" end,
                        meta = function() return meta_table end,
                    }
                end,
            }
        end

        test.it("returns nil when the actor carries no filter", function()
            with_security(actor_with({ security_groups = { "g" } }), function()
                local filter, err = access_subjects.access_filter("user-1")
                test.is_nil(err, tostring(err))
                test.is_nil(filter)
            end)
        end)

        test.it("returns the prefix list when the actor carries a filter", function()
            with_security(actor_with({ access_filter = { prefixes = { "a.b", "c" } } }), function()
                test.eq(joined(access_subjects.access_filter("user-1")), "a.b,c")
            end)
        end)

        test.it("drops non-string and empty prefixes", function()
            with_security(actor_with({ access_filter = { prefixes = { "a.b", "", 42, "c" } } }), function()
                test.eq(joined(access_subjects.access_filter("user-1")), "a.b,c")
            end)
        end)

        test.it("returns an empty list (deny-all sentinel) when prefixes is empty", function()
            with_security(actor_with({ access_filter = { prefixes = {} } }), function()
                local f = access_subjects.access_filter("user-1")
                test.not_nil(f)
                if not f then error("missing deny-all filter") end
                test.eq(#f, 0)
            end)
        end)

        test.it("never borrows another identity's filter", function()
            with_security(actor_with({ access_filter = { prefixes = { "a.b" } } }), function()
                local filter, err = access_subjects.access_filter("someone-else")
                test.is_nil(err, tostring(err))
                test.is_nil(filter)
            end)
        end)

        test.it("denies all with a typed error when actor metadata lookup faults", function()
            with_security({
                actor = function()
                    return {
                        id = function() return "user-1" end,
                        meta = function() return nil, errors.new({message = "actor meta unavailable", kind = errors.UNAVAILABLE}) end,
                    }
                end,
            }, function()
                local f, err = access_subjects.access_filter("user-1")
                test.not_nil(f)
                if not f then error("missing deny-all filter") end
                test.eq(#f, 0)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }

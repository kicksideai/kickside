local test = require("test")
local access_policy = require("access_policy")
local component_types = require("component_types")

local function define_tests()
    test.describe("native access validation", function()
        test.it("returns explicit retryability and stable access codes", function()
            local _, mask = access_policy.normalize_access_mask("1")
            test.is_true(errors.is(mask, errors.INVALID))
            test.is_false(mask:retryable())
            test.eq(mask:details().code, "component_access_invalid")
            local _, subject = access_policy.normalize_share_subject({ subject_id = "user" })
            test.is_true(errors.is(subject, errors.INVALID))
            test.is_false(subject:retryable())
            test.eq(subject:details().code, "component_access_invalid")
        end)
    end)
    test.describe("component access policy", function()
        test.it("accepts only integer masks inside the component bit range", function()
            local read = access_policy.normalize_access_mask(nil, component_types.ACCESS.READ)
            test.eq(read, component_types.ACCESS.READ)

            local full = access_policy.normalize_access_mask(component_types.ACCESS.FULL)
            test.eq(full, component_types.ACCESS.FULL)

            local _, str_err = access_policy.normalize_access_mask("1")
            test.not_nil(str_err)
            test.is_true(errors.is(str_err, errors.INVALID))

            local _, frac_err = access_policy.normalize_access_mask(1.5)
            test.not_nil(frac_err)
            test.is_true(errors.is(frac_err, errors.INVALID))

            local _, neg_err = access_policy.normalize_access_mask(-1)
            test.not_nil(neg_err)
            test.is_true(errors.is(neg_err, errors.INVALID))

            local _, high_err = access_policy.normalize_access_mask(component_types.ACCESS.FULL + 1)
            test.not_nil(high_err)
            test.is_true(errors.is(high_err, errors.INVALID))
        end)

        test.it("requires explicit subject type for subtree sharing", function()
            local _, missing_err = access_policy.normalize_share_subject({ subject_id = "app.security:admin" })
            test.not_nil(missing_err)
            test.is_true(errors.is(missing_err, errors.INVALID))

            local user, user_err = access_policy.normalize_share_subject({
                subject_id = "tenant:user",
                subject_type = "user",
            })
            test.is_nil(user_err)
            test.eq(user.id, "tenant:user")
            test.eq(user.subject_type, "user")
            test.eq(access_policy.subtree_subject(user).subject_id, "tenant:user")
            test.eq(access_policy.subtree_subject(user).subject_type, "user")

            local group, group_err = access_policy.normalize_share_subject({
                subject_id = "app.security:admin",
                subject_type = "group",
            })
            test.is_nil(group_err)
            test.eq(group.subject_type, "group")
            test.eq(access_policy.subtree_subject(group).subject_id, "app.security:admin")
            test.eq(access_policy.subtree_subject(group).subject_type, "group")
        end)

        test.it("accepts a service subject type", function()
            local service, err = access_policy.normalize_share_subject({
                subject_id = "sync",
                subject_type = "service",
            })
            test.is_nil(err)
            test.eq(service.subject_type, "service")
            test.eq(access_policy.subtree_subject(service).subject_type, "service")
        end)

        test.it("refuses an unsupported subject type", function()
            local agent, err = access_policy.normalize_share_subject({
                subject_id = "agent:019ef73f",
                subject_type = "agent",
            })
            test.is_nil(agent)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.INVALID))
        end)

        test.it("refuses a missing subject type instead of defaulting to user", function()
            local _, missing = access_policy.normalize_share_subject({ subject_id = "tenant:user" })
            test.not_nil(missing)
            test.is_true(errors.is(missing, errors.INVALID))
            local _, missing_type = access_policy.normalize_subject_type(nil)
            test.not_nil(missing_type)
            test.is_true(errors.is(missing_type, errors.INVALID))
            local _, empty_type = access_policy.normalize_subject_type("")
            test.not_nil(empty_type)
            test.is_true(errors.is(empty_type, errors.INVALID))
            local _, missing_subtree = access_policy.subtree_subject({ id = "tenant:user" })
            test.not_nil(missing_subtree)
            test.is_true(errors.is(missing_subtree, errors.INVALID))
        end)

        test.it("rejects malformed share subjects", function()
            local _, missing_id = access_policy.normalize_share_subject({ subject_type = "user" })
            test.not_nil(missing_id)
            test.is_true(errors.is(missing_id, errors.INVALID))

            local _, legacy_err = access_policy.normalize_share_subject({ user_id = "u1", subject_type = "user" })
            test.not_nil(legacy_err)
            test.is_true(errors.is(legacy_err, errors.INVALID))

            local _, bad_type = access_policy.normalize_share_subject({
                subject_id = "u1",
                subject_type = "role",
            })
            test.not_nil(bad_type)
            test.is_true(errors.is(bad_type, errors.INVALID))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }

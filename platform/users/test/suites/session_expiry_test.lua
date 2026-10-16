local test = require("test")
local sql = require("sql")
local user_repo = require("user_repo")
local lifecycle = require("user_lifecycle_repo")
local groups = require("user_groups_repo")
local session = require("session")
local expiry_time = require("expiry_time")
local real_session = require("real_session")
local consts = require("user_consts")
local security = require("security")
local function define_tests()
    test.describe("session lifetime", function()
        test.it("preserves a native token store lookup failure", function()
            local uid = "missing_session_store"
            test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local",
                password = "password-123", status = "active"})))
            test.not_nil((groups.assign_user_to_group(uid, "app.security:user")))
            local saved = consts.get_config
            consts.get_config = function()
                local config = saved()
                config.token_store = "app:missing_session_store"
                return config
            end
            local value, err = real_session.mint(assert(groups.get_user_with_groups(uid)))
            consts.get_config = saved
            local _, source = security.token_store("app:missing_session_store")
            lifecycle.delete(uid)
            test.is_nil(value)
            test.is_true(errors.is(err, source:kind()))
            test.eq(tostring(err), tostring(source))
        end)

        test.it("propagates duration failure before storing an unbounded session", function()
            local uid = "invalid_session_lifetime"
            test.not_nil((user_repo.create({user_id = uid, email = uid .. "@test.local",
                password = "password-123", status = "active"})))
            test.not_nil((groups.assign_user_to_group(uid, "app.security:user")))
            local value, err = session.mint(assert(groups.get_user_with_groups(uid)))
            local db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT token_key FROM kickside_user_sessions WHERE user_id=$1", {uid}))
            db:release()
            lifecycle.delete(uid)
            test.is_nil(value)
            test.eq(err, expiry_time.failure)
            test.eq(#rows, 0)
        end)
    end)
end
return {run = test.run_cases(define_tests)}

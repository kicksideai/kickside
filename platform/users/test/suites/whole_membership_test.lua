local test = require("test")
local sql = require("sql")
local crypto = require("crypto")
local user_groups_repo = require("user_groups_repo")
local provisioning = require("provisioning")

local function fixture(count)
    local uid, uuid_err = crypto.random.uuid()
    if uuid_err then error(tostring(uuid_err)) end
    local db, db_err = sql.get("app:db")
    if db_err then error(tostring(db_err)) end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); error(tostring(tx_err)) end
    local _, err = sql.builder.insert("app_users"):set_map({
        user_id = uid, email = uid .. "@test.local", full_name = "Whole membership",
        password_hash = "fixture", status = "active", created_at = "2000-01-01T00:00:00Z",
    }):run_with(tx):exec()
    if err then tx:rollback(); db:release(); error(tostring(err)) end
    for first = count, 1, -128 do
        local insert = sql.builder.insert("app_user_groups")
            :columns("user_id", "group_id", "source", "created_at")
        for i = first, math.max(1, first - 127), -1 do
            insert = insert:values(uid, string.format("fixture:group-%05d", i), "manual", "2000-01-01T00:00:00Z")
        end
        _, err = insert:run_with(tx):exec()
        if err then tx:rollback(); db:release(); error(tostring(err)) end
    end
    _, err = tx:commit()
    db:release()
    if err then error(tostring(err)) end
    return uid
end

local function cleanup(uid)
    local db, db_err = sql.get("app:db")
    if db_err then error(tostring(db_err)) end
    local _, groups_err = sql.builder.delete("app_user_groups"):where("user_id = ?", uid):run_with(db):exec()
    local _, user_err = sql.builder.delete("app_users"):where("user_id = ?", uid):run_with(db):exec()
    db:release()
    if groups_err then error(tostring(groups_err)) end
    if user_err then error(tostring(user_err)) end
end

local function define_tests()
    test.describe("whole account membership", function()
        test.it("returns every tied membership through account and SSO reads", function()
            local uid = fixture(121)
            local membership, membership_err = user_groups_repo.get_user_groups(uid)
            local account, account_err = user_groups_repo.get_user_with_groups(uid .. "@test.local")
            local sso = provisioning.get_user({ identifier = uid })
            cleanup(uid)
            test.is_nil(membership_err)
            test.is_nil(account_err)
            test.eq(#membership.groups, 121)
            test.eq(#account.security_groups, 121)
            test.eq(membership.groups[1], "fixture:group-00001")
            test.eq(membership.groups[121], "fixture:group-00121")
            test.is_true(sso.ok)
            test.eq(#sso.user.security_groups, 121)
        end)

        test.it("keeps an explicit page deterministic", function()
            local uid = fixture(121)
            local page, page_err = user_groups_repo.get_user_groups(uid, { limit = 7, offset = 100 })
            cleanup(uid)
            test.is_nil(page_err)
            test.eq(#page.groups, 7)
            test.eq(page.groups[1], "fixture:group-00101")
            test.eq(page.groups[7], "fixture:group-00107")
        end)

        test.it("refuses an oversized account instead of truncating its authority", function()
            local uid = fixture(10001)
            local membership, membership_err = user_groups_repo.get_user_groups(uid)
            local account, account_err = user_groups_repo.get_user_with_groups(uid)
            local sso = provisioning.get_user({ identifier = uid })
            local page, page_err = user_groups_repo.get_user_groups(uid, { limit = 10 })
            cleanup(uid)
            test.is_nil(membership)
            test.is_nil(account)
            test.not_nil(membership_err)
            test.eq(membership_err, account_err)
            test.ok(tostring(membership_err):find("10000", 1, true) ~= nil)
            test.is_false(sso.ok)
            test.eq(sso.error, membership_err)
            test.is_nil(page_err)
            test.eq(#page.groups, 10)
        end)
    end)
end

return { run = test.run_cases(define_tests) }

-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local users = require("user_repo")
local groups = require("user_groups_repo")
local list = require("list_users")

local function execute(statement: string, params: any): any?
    local db, err = sql.get("app:db")
    if err then return err end
    local _, write_err = db:execute(statement, params)
    db:release()
    return write_err
end

local function with_users(count: integer, body)
    local ids = {}
    for _ = 1, count do
        local id = uuid.v4()
        local user, err = users.create({ user_id = id, email = id .. "@page.test", password = "testpass123", status = "active" })
        if err then error(err) end
        ids[#ids + 1] = user.user_id
    end
    local ok, err = pcall(body, ids)
    for _, id in ipairs(ids) do
        local cleanup_err = execute("DELETE FROM app_users WHERE user_id=$1", { id })
        if cleanup_err then error(cleanup_err) end
    end
    if not ok then error(err) end
end

local function run()
    test.describe("User page membership batching", function()
        test.it("uses one membership read for a hundred listed users", function()
            local old_users, old_groups = list._user_repo, list._user_groups_repo
            local reads = 0
            list._user_repo = { list = function()
                local rows = {}
                for i = 1, 100 do rows[i] = { user_id = "page-user-" .. tostring(i) } end
                return rows
            end }
            list._user_groups_repo = { get_user_groups_batch = function(ids)
                reads = reads + 1
                test.eq(100, #ids)
                local by_id = {}
                for i, id in ipairs(ids) do by_id[id] = { "group-" .. tostring(i) } end
                return by_id
            end, get_user_groups = function(id)
                reads = reads + 1
                return { groups = { "group-" .. tostring(id):match("%d+$") } }
            end }
            local ok, err = pcall(function()
                local status, body = list.process(100, 0)
                test.eq(200, status)
                test.eq(1, reads)
                test.eq(100, #body.users)
                test.eq("group-1", body.users[1].security_groups[1])
                test.eq("group-100", body.users[100].security_groups[1])
            end)
            list._user_repo, list._user_groups_repo = old_users, old_groups
            if not ok then error(err) end
        end)

        test.it("matches complete singular membership order and retains users with no groups", function()
            with_users(2, function(ids)
                for _, id in ipairs(ids) do test.is_nil(execute("DELETE FROM app_user_groups WHERE user_id=$1", { id })) end
                test.is_nil(execute([[INSERT INTO app_user_groups(user_id,group_id,created_at) VALUES
                    ($1,'group-z','2026-01-01T00:00:00Z'),($1,'group-a','2026-01-01T00:00:00Z'),
                    ($1,'group-first','2025-01-01T00:00:00Z')]], { ids[1] }))
                local batch, batch_err = groups.get_user_groups_batch(ids)
                local single, single_err = groups.get_user_groups(ids[1])
                test.is_nil(batch_err)
                test.is_nil(single_err)
                test.eq(3, #batch[ids[1]])
                for i, group in ipairs(single.groups) do test.eq(group, batch[ids[1]][i]) end
                test.eq("group-first", batch[ids[1]][1])
                test.eq("group-a", batch[ids[1]][2])
                test.eq(0, #batch[ids[2]])
            end)
        end)

        test.it("refuses a missing canonical user instead of supplying empty membership", function()
            with_users(1, function(ids)
                local result, err = groups.get_user_groups_batch({ ids[1], uuid.v4() })
                test.is_nil(result)
                test.not_nil(err)
            end)
        end)

        test.it("retains the complete-membership ceiling and never returns a partial page", function()
            with_users(2, function(ids)
                test.is_nil(execute("DELETE FROM app_user_groups WHERE user_id=$1", { ids[1] }))
                test.is_nil(execute([[WITH RECURSIVE seq(n) AS
                    (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n<10000)
                    INSERT INTO app_user_groups(user_id,group_id) SELECT $1,'ceiling-' || n FROM seq]], { ids[1] }))
                local complete, complete_err = groups.get_user_groups_batch(ids)
                test.is_nil(complete_err)
                test.eq(10000, #complete[ids[1]])
                test.is_nil(execute("INSERT INTO app_user_groups(user_id,group_id) VALUES ($1,'ceiling-10001')", { ids[1] }))
                local result, err = groups.get_user_groups_batch(ids)
                test.is_nil(result)
                test.is_true(tostring(err):find("supported maximum of 10000", 1, true) ~= nil)
            end)
        end)

        test.it("keeps empty pages cheap and rejects batches beyond the API page bound", function()
            local empty, empty_err = groups.get_user_groups_batch({})
            test.is_nil(empty_err)
            test.eq(nil, next(empty))
            local ids = {}
            for i = 1, 101 do ids[i] = "id-" .. tostring(i) end
            local result, err = groups.get_user_groups_batch(ids)
            test.is_nil(result)
            test.not_nil(err)
        end)
    end)
end

return { run = test.run_cases(run) }

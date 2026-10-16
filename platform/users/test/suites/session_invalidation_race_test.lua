-- Session invalidation, default group enrollment and account deletion order on
-- the account row lock: the writer that arrives second waits, then succeeds.

local test = require("test")
local sql = require("sql")
local time = require("time")
local crypto = require("crypto")
local registry = require("registry")
local channel = require("channel")
local session_index = require("session_index")
local user_lifecycle_repo = require("user_lifecycle_repo")
local user_group_sources_repo = require("user_group_sources_repo")

local function connect()
    local db, err = sql.get("app:db")
    if err or not db then error("app:db unavailable: " .. tostring(err)) end
    return db
end

local function exec(executor, label)
    local result, err = executor:exec()
    if err then error(label .. ": " .. tostring(err)) end
    return result
end

local function fixture(group_id: string, user_id: string?): string
    local uid = user_id
    if not uid then
        local generated, uuid_err = crypto.random.uuid()
        if uuid_err or not generated then error(tostring(uuid_err)) end
        uid = generated
    end
    local db = connect()
    local tx, tx_err = db:begin()
    if tx_err or not tx then db:release(); error(tostring(tx_err)) end
    exec(sql.builder.insert("app_users"):set_map({
        user_id = uid, email = uid .. "@test.local", full_name = "Invalidation race",
        password_hash = "fixture", status = "active", created_at = "2000-01-01T00:00:00Z",
    }):run_with(tx), "insert account")
    exec(sql.builder.insert("app_user_groups"):set_map({
        user_id = uid, group_id = group_id, source = "manual", created_at = "2000-01-01T00:00:00Z",
    }):run_with(tx), "insert membership")
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then error(tostring(commit_err)) end
    return uid
end

local function cleanup(uid: string)
    local db = connect()
    exec(sql.builder.delete("app_user_groups"):where("user_id = ?", uid):run_with(db), "delete membership")
    exec(sql.builder.delete("app_users"):where("user_id = ?", uid):run_with(db), "delete account")
    db:release()
end

-- Returns once another session of this database waits on a row lock. SQLite runs
-- on one connection, so a concurrent writer waits for that connection instead.
local function await_lock_wait(db)
    if db:type() ~= sql.type.POSTGRES then return end
    local probe = connect()
    local deadline = time.now():unix() + 10
    while true do
        local rows, err = probe:query([[
            SELECT count(*) AS waiting FROM pg_stat_activity
            WHERE datname = current_database() AND wait_event_type = 'Lock']])
        if err or not rows then probe:release(); error(tostring(err)) end
        if (tonumber(rows[1].waiting) or 0) > 0 then break end
        if time.now():unix() > deadline then
            probe:release()
            error("no concurrent writer reached the account row lock")
        end
        time.sleep("20ms")
    end
    probe:release()
end

-- Runs work in a coroutine while tx holds its account lock, then commits tx.
local function race(db, tx, work, before_commit)
    local done = channel.new(1)
    coroutine.spawn(function()
        local result, err = work()
        done:send({ result = result, err = err })
    end)
    await_lock_wait(db)
    if before_commit then before_commit() end
    local _, commit_err = tx:commit()
    db:release()
    test.is_nil(commit_err)
    return done:receive()
end

local function clear_enrollment(group_id: string, enrollment_id: string)
    local db = connect()
    exec(sql.builder.delete("app_user_groups"):where("group_id = ?", group_id):run_with(db), "delete enrolled memberships")
    exec(sql.builder.delete("app_user_group_enrollments"):where("enrollment_id = ?", enrollment_id):run_with(db),
        "delete enrollment")
    db:release()
end

local function define_tests()
    test.describe("account lock order", function()
        test.it("locks every existing account across batches in byte order", function()
            local suffix = tostring(crypto.random.uuid())
            local upper = fixture("lock-order:" .. suffix, "Zlock-" .. suffix)
            local lower = fixture("lock-order:" .. suffix, "alock-" .. suffix)
            local ids = { lower }
            for i = 1, 1200 do ids[#ids + 1] = "absent-" .. suffix .. "-" .. tostring(i) end
            ids[#ids + 1] = upper
            ids[#ids + 1] = lower
            local db = connect()
            local tx, tx_err = db:begin()
            if tx_err or not tx then db:release(); error(tostring(tx_err)) end
            local locked, lock_err = session_index.lock_accounts(tx, ids)
            tx:rollback()
            db:release()
            cleanup(upper)
            cleanup(lower)
            test.is_nil(lock_err)
            test.eq(#locked, 2)
            test.eq(locked[1].user_id, upper)
            test.eq(locked[2].user_id, lower)
        end)
    end)

    test.describe("session invalidation under concurrent account deletion", function()
        test.it("group invalidation waits for an in-flight account deletion and succeeds", function()
            local suffix = crypto.random.uuid()
            local group_id = "race:" .. tostring(suffix)
            local uid = fixture(group_id)
            local db = connect()
            local tx, tx_err = db:begin()
            if tx_err or not tx then db:release(); error(tostring(tx_err)) end
            local _, invalidate_err = session_index.invalidate_user_in(tx, uid)
            test.is_nil(invalidate_err)
            exec(sql.builder.delete("app_user_groups"):where("user_id = ?", uid):run_with(tx), "delete membership")
            exec(sql.builder.delete("app_users"):where("user_id = ?", uid):run_with(tx), "delete account")

            local outcome = race(db, tx, function()
                return session_index.invalidate_groups({ group_id })
            end)
            test.is_nil(outcome.err)
            test.eq(outcome.result.users_invalidated, 0)
            test.eq(outcome.result.revoked, 0)
        end)

        test.it("account deletion waits for an in-flight group invalidation and succeeds", function()
            local suffix = crypto.random.uuid()
            local group_id = "race:" .. tostring(suffix)
            local uid = fixture(group_id)
            local db = connect()
            local tx, tx_err = db:begin()
            if tx_err or not tx then db:release(); error(tostring(tx_err)) end
            local _, invalidate_err = session_index.invalidate_user_in(tx, uid)
            test.is_nil(invalidate_err)

            local outcome = race(db, tx, function()
                return user_lifecycle_repo.prepare_delete(uid)
            end)
            cleanup(uid)
            test.is_nil(outcome.err)
            test.eq(outcome.result.user_id, uid)
        end)

        test.it("RA-H48 retries membership classification after a policy commit while waiting for the account lock", function()
            local original = assert(registry.current_version())
            local uid = fixture("app.security:run_as_membership_baseline")
            local db = connect()
            local tx = assert(db:begin())
            test.not_nil((session_index.lock_accounts(tx, {uid})))
            local outcome = race(db, tx, function()
                return user_group_sources_repo.set_user_groups(uid,
                    {"app.security:run_as_membership_baseline", "app.security:run_as_membership_allow"})
            end, function()
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = "app:membership_race_policy", kind = "security.policy", data = {
                    groups = {"app.security:run_as_membership_allow"},
                    policy = {actions = "access", resources = "app:membership_race_new", effect = "allow"},
                }})
                test.is_nil(select(2, changes:apply()))
            end)
            cleanup(uid)
            test.is_true((registry.apply_version(original)))
            test.is_nil(outcome.err)
            test.eq(outcome.result.membership_effect, "allow_only")
            test.eq(outcome.result.sessions_revoked, 0)
        end)

        test.it("RA-H48 rechecks source ownership after waiting for the account lock", function()
            local group = "app.security:run_as_membership_allow"
            local uid = fixture(group)
            local db = connect()
            local tx = assert(db:begin())
            test.not_nil((session_index.lock_accounts(tx, {uid})))
            exec(sql.builder.update("app_user_groups"):set_map({source = "race-provider"})
                :where("user_id = ?", uid):run_with(tx), "give provider ownership")
            local _, initial_commit_err = tx:commit()
            db:release()
            test.is_nil(initial_commit_err)
            db = connect()
            tx = assert(db:begin())
            test.not_nil((session_index.lock_accounts(tx, {uid})))
            local outcome = race(db, tx, function()
                return user_group_sources_repo.write_sourced_plan(uid, "race-provider", {}, {group})
            end, function()
                exec(sql.builder.update("app_user_groups"):set_map({source = "manual"})
                    :where("user_id = ?", uid):run_with(tx), "claim manual ownership")
            end)
            cleanup(uid)
            test.is_nil(outcome.err)
            test.eq(outcome.result.groups_removed, 0)
            test.eq(outcome.result.membership_effect, "unchanged")
            test.eq(outcome.result.sessions_revoked, 0)
        end)

        test.it("default group enrollment waits for an in-flight account deletion and succeeds", function()
            local suffix = crypto.random.uuid()
            local member_group = "race:" .. tostring(suffix)
            local default_group = "race-default:" .. tostring(suffix)
            local enrollment_id = "race-enrollment:" .. tostring(suffix)
            local uid = fixture(member_group)
            local db = connect()
            local tx, tx_err = db:begin()
            if tx_err or not tx then db:release(); error(tostring(tx_err)) end
            local _, invalidate_err = session_index.invalidate_user_in(tx, uid)
            test.is_nil(invalidate_err)
            exec(sql.builder.delete("app_user_groups"):where("user_id = ?", uid):run_with(tx), "delete membership")
            exec(sql.builder.delete("app_users"):where("user_id = ?", uid):run_with(tx), "delete account")

            local outcome = race(db, tx, function()
                return user_group_sources_repo.initialize_default_group(default_group, enrollment_id)
            end)
            local probe = connect()
            local orphaned, orphaned_err = sql.builder.select("user_id"):from("app_user_groups")
                :where("user_id = ?", uid):run_with(probe):query()
            probe:release()
            clear_enrollment(default_group, enrollment_id)
            test.is_nil(outcome.err)
            test.eq(outcome.result.initialized, true)
            test.is_nil(orphaned_err)
            test.eq(#(orphaned or {}), 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }

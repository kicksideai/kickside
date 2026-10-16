local test = require("test")
local repo = require("repo")
local fixture = require("fixture")
local sql = require("sql")
local uuid = require("uuid")
local function make_thread(db: sql.DB): string
    local id = uuid.v7()
    local _, err = sql.builder.insert("kickside_thread")
        :set_map({id = id, thread_class = "retention_persist_native_test", component_id = "", event_count = 0})
        :run_with(db):exec()
    if err then error(err) end
    return id
end
return {run = test.run_cases(function()
    test.describe("native retention policy persistence failures", function()
        for _, stage in ipairs({"query", "type", "execute", "notify"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local db = assert(sql.get("app:db"))
                        local id = stage == "notify" and make_thread(db) or uuid.v7()
                        local source = errors.new({kind = kind, message = "retention persistence dependency failure",
                            retryable = options.retryable, details = {code = "retention_persistence_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, false)
                        local result, err
                        if stage == "query" then result, err = repo.find_by_thread(db, id)
                        else result, err = repo.upsert(fixture.database(db), id, {}) end
                        db:release()
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "retention_persistence_dependency")
                        test.eq(err:details().nested.stage, stage)
                        test.eq(fixture.queries, stage == "query" and 1 or 0)
                        test.eq(fixture.types, stage == "query" and 0 or 1)
                        test.eq(fixture.writes, (stage == "execute" or stage == "notify") and 1 or 0)
                        test.eq(fixture.notifications, stage == "notify" and 1 or 0)
                    end)
                end
            end
        end
        test.it("rejects an absent successful write result permanently", function()
            local db = assert(sql.get("app:db"))
            fixture.reset("", nil, true)
            local result, err = repo.upsert(fixture.database(db), uuid.v7(), {})
            db:release()
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "retention_policy_response")
            test.eq(err:details().field, "execute")
            test.eq(fixture.types, 1)
            test.eq(fixture.writes, 1)
            test.eq(fixture.notifications, 0)
        end)
        for _, enabled in ipairs({true, false}) do
            test.it("retains real SQL upsert/read/" .. tostring(enabled), function()
                local db = assert(sql.get("app:db"))
                local id = make_thread(db)
                fixture.reset("", nil, false)
                local policy, err = repo.upsert(fixture.database(db), id, {enabled = enabled})
                local stored, read_err = repo.find_by_thread(db, id)
                db:release()
                test.is_nil(err)
                test.is_nil(read_err)
                test.eq(stored.enabled, enabled)
                test.eq(stored.event_hot_retention_days, policy.event_hot_retention_days)
                test.eq(stored.archive_mode, policy.archive_mode)
                test.eq(fixture.types, 1)
                test.eq(fixture.writes, 1)
                test.eq(fixture.queries, 1)
                test.eq(fixture.notifications, 1)
                test.eq(fixture.change.kind, "thread_policy_changed")
                test.eq(fixture.change.thread_id, id)
            end)
        end
        test.it("retains real SQL absent-policy lookup", function()
            local db = assert(sql.get("app:db"))
            fixture.reset("", nil, false)
            local policy, err = repo.find_by_thread(db, uuid.v7())
            db:release()
            test.is_nil(policy)
            test.is_nil(err)
            test.eq(fixture.queries, 1)
            test.eq(fixture.notifications, 0)
        end)
    end)
end)}

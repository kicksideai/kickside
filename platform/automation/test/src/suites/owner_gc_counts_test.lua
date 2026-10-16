local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local owner_gc = require("owner_gc")
local component = require("component")

local function db(): any
    local opened, err = sql.get("app:db")
    if err or not opened then error(tostring(err)) end
    return opened
end

local function count(table_name: string, key: string, id: string): integer
    local opened = db()
    local rows, err = opened:query("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE " .. key .. "=$1", { id })
    opened:release()
    test.is_nil(err, tostring(err))
    return tonumber(rows[1].n) :: integer
end

local function finish_component_delete(id: string, limit: integer): ()
    local finished = false
    for _ = 1, limit do
        local deleted, delete_err = component.system_delete(id, "reparent_root")
        if deleted then
            test.is_nil(delete_err, tostring(delete_err))
            finished = true
            break
        end
        test.not_nil(delete_err)
        test.is_true(errors.is(delete_err, errors.CONFLICT), tostring(delete_err))
        test.is_true((delete_err :: any):details().cleanup_pending, tostring(delete_err))
    end
    test.is_true(finished, "durable component continuation must finish owner cleanup")
end

local function define_tests(group: integer)
    test.describe("automation owner discard accounting", function()
        if group == 1 then
        test.it("accumulates unresolved discard counts across owner pages", function()
            local owner = uuid.v7()
            local opened = db()
            for i = 1, 205 do
                local key = string.format("item-%03d", i)
                local _, insert_err = opened:execute([[INSERT INTO kickside_trigger_item_ledger
                    (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
                     first_failed_at,last_failed_at,created_at,updated_at)
                    VALUES ($1,'source',$2,$2,$2,'{}','uncertain',$3,$3,$3,$3)]],
                    { owner, key, "2026-01-01T00:00:00Z" })
                test.is_nil(insert_err, tostring(insert_err))
            end
            opened:release()
            local result, err
            for page = 1, 3 do
                result, err = owner_gc.delete(owner)
                if page < 3 then
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.CONFLICT), tostring(err))
                    test.eq((err :: any):details().discarded.ledger_unresolved, page * 100)
                end
            end
            test.is_nil(err, tostring(err))
            test.eq(result.discarded.ledger_unresolved, 205)
        end)

        end
        if group == 2 then
        test.it("reports a committed owner page and its counts through component delete", function()
            local id = uuid.v7()
            local service, service_err = component.get_service()
            test.is_nil(service_err, tostring(service_err))
            if not service then error("component service unavailable") end
            local created, create_err = service:register({ component_id = id,
                impl_id = "kickside.automation.agent.fixture:automation_type",
                meta = { title = "Paged owner outcome" } })
            test.is_nil(create_err, tostring(create_err))
            test.is_true(created.success, tostring(created.error))
            local opened = db()
            for i = 1, 101 do
                local key = string.format("item-%03d", i)
                local _, insert_err = opened:execute([[INSERT INTO kickside_trigger_item_ledger
                    (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
                     first_failed_at,last_failed_at,created_at,updated_at)
                    VALUES ($1,'source',$2,$2,$2,'{}','uncertain',$3,$3,$3,$3)]],
                    { id, key, "2026-01-01T00:00:00Z" })
                test.is_nil(insert_err, tostring(insert_err))
            end
            opened:release()
            local partial, partial_err = service:delete({ component_id = id })
            test.is_nil(partial_err, tostring(partial_err))
            test.is_true(partial.success, tostring(partial.error))
            test.is_true(partial.in_progress)
            test.eq(partial.status, "in_progress")
            test.is_false(partial.deleted)
            test.is_true(partial.cleanup_pending)
            test.eq(partial.discarded.ledger_unresolved, 100)
            test.is_true(partial.retryable)
            finish_component_delete(id, 3)
            test.eq(count("kickside_trigger_item_ledger", "owner_id", id), 0)
            test.eq(count("kickside_components", "component_id", id), 0)
        end)

        end
        if group == 3 then
        test.it("finishes a component deletion across more than one page of automation drives", function()
            local id = uuid.v7()
            local service, service_err = component.get_service()
            test.is_nil(service_err, tostring(service_err))
            if not service then error("component service unavailable") end
            local created, create_err = service:register({ component_id = id,
                impl_id = "kickside.automation.agent.fixture:automation_type",
                meta = { title = "Paged drive owner" } })
            test.is_nil(create_err, tostring(create_err))
            test.is_true(created.success, tostring(created.error))
            local opened = db()
            local _, insert_err = opened:execute([[WITH RECURSIVE page(i) AS (
                SELECT 1 UNION ALL SELECT i + 1 FROM page WHERE i < 205
            ) INSERT INTO kickside_automation_drive
                (automation_id,drive_key,source_kind,applied_json,applied_hash,action_json,phase,enabled)
                SELECT $1,'drive:' || CAST(i AS TEXT),'timer','{}','gc','{}','pending',TRUE FROM page]], { id })
            opened:release()
            test.is_nil(insert_err, tostring(insert_err))

            local partial, partial_err = service:delete({ component_id = id })
            test.is_nil(partial_err, tostring(partial_err))
            test.is_true(partial.success, tostring(partial.error))
            test.is_true(partial.in_progress)
            test.eq(partial.status, "in_progress")
            test.is_true(partial.cleanup_pending)
            test.is_false(partial.deleted)
            test.eq(count("kickside_components", "component_id", id), 1)
            test.eq(count("kickside_automation_drive", "automation_id", id), 205)

            finish_component_delete(id, 220)
            test.eq(count("kickside_components", "component_id", id), 0)
            test.eq(count("kickside_automation_drive", "automation_id", id), 0)
            test.eq(count("kickside_automation_command", "automation_id", id), 0)
        end)


        end
    end)
end

local cases = {}
for group = 1, 3 do
    local selected = group
    cases[group] = test.run_cases(function() define_tests(selected) end)
end

return {
    run_1 = function(options: any): any return cases[1](options) end,
    run_2 = function(options: any): any return cases[2](options) end,
    run_3 = function(options: any): any return cases[3](options) end,
}

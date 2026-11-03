local test = require("test")
local process = require("process")
local time = require("time")
local channel = require("channel")
local registry = require("registry")
local events = require("events")
local sql = require("sql")
local security = require("security")
local uuid = require("uuid")
local provision = require("provision")
local consts = require("lifecycle_consts")
local logger = require("logger"):named("kickside.lifecycle")

local function log_pid(data: any): string?
    for _, field in ipairs(data.fields) do
        if field.key == "pid" then return field.string end
    end
    return nil
end

local function define_tests()
    test.describe("lifecycle boot shutdown", function()
        local child, original, subscription, trigger_name, postgres
        local function drop_refusal()
            if not trigger_name then return end
            local db = assert(sql.get("app:db"))
            local _, drop_err = db:execute("DROP TRIGGER " .. trigger_name .. (postgres and " ON kickside_retention_policy" or ""))
            test.is_nil(drop_err)
            if postgres then
                local _, function_err = db:execute("DROP FUNCTION " .. trigger_name .. "()")
                test.is_nil(function_err)
            end
            db:release()
            trigger_name = nil
        end
        test.after_each(function()
            drop_refusal()
            if child then
                local _, cancel_err = process.cancel(child)
                test.is_nil(cancel_err)
                local selected = channel.select({ process.events():case_receive(), time.after("3s"):case_receive() })
                test.eq(selected.channel, process.events())
                test.eq((selected.value :: process.Event).from, child)
                child = nil
            end
            if subscription then
                local _, close_err = subscription:close()
                test.is_nil(close_err)
                subscription = nil
            end
            if original then
                local _, restore_err = registry.apply_version(original)
                test.is_nil(restore_err)
                original = nil
            end
        end)
        test.it("stays resident after failed convergence and repairs it on an in-place upgrade", function()
            local actor = security.new_actor(consts.SYSTEM_ACTOR, { system = true, groups = { "system", "lifecycle" } })
            local scope = assert(security.named_scope(consts.SYSTEM_SCOPE))
            local _, ensure_err = provision.ensure_system(actor, scope)
            test.is_nil(ensure_err)
            local id = consts.thread_id()
            local db = assert(sql.get("app:db"))
            postgres = tostring(db:type()) == sql.type.POSTGRES
            local policy = assert(db:query("SELECT event_hot_retention_days FROM kickside_retention_policy WHERE thread_id=$1", { id }))
            local declared_days = tonumber(policy[1].event_hot_retention_days)
            if declared_days == nil then error("retention policy has no numeric event days") end
            local _, seed_err = db:execute("UPDATE kickside_retention_policy SET event_hot_retention_days=$1 WHERE thread_id=$2", { declared_days + 1, id })
            test.is_nil(seed_err)
            trigger_name = "boot_refusal_" .. uuid.v7():gsub("-", "")
            if postgres then
                local _, function_err = db:execute("CREATE FUNCTION " .. trigger_name .. "() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.thread_id = '" .. id .. "' THEN RAISE EXCEPTION 'boot retention refusal'; END IF; RETURN NEW; END $$")
                test.is_nil(function_err)
            end
            local statement = postgres and ("CREATE TRIGGER " .. trigger_name .. " BEFORE UPDATE ON kickside_retention_policy FOR EACH ROW EXECUTE FUNCTION " .. trigger_name .. "()")
                or ("CREATE TRIGGER " .. trigger_name .. " BEFORE UPDATE ON kickside_retention_policy WHEN NEW.thread_id='" .. id .. "' BEGIN SELECT RAISE(ABORT, 'boot retention refusal'); END")
            local _, trigger_err = db:execute(statement)
            test.is_nil(trigger_err)
            db:release()
            subscription = assert(events.subscribe("logs", "logs.entry"))
            local logs = subscription:channel()
            local process_events = process.events()
            -- The shared stream carries resident logs from other processes.
            logger:info("system lifecycle resident")
            child = assert(process.spawn_monitored("kickside.core.lifecycle:boot_process", "app:processes"))
            local function await_resident()
                local deadline = time.after("3s")
                local failed = false
                while true do
                    local selected = channel.select({ logs:case_receive(), process_events:case_receive(), deadline:case_receive() })
                    if selected.channel == process_events then
                        child = nil
                        error("boot exits before convergence can retry: " .. tostring(selected.value.result.value))
                    end
                    test.eq(selected.channel, logs, "boot does not become resident")
                    local data = selected.value.data
                    if log_pid(data) == tostring(child) then
                        if data.entry.message == "system lifecycle convergence failed" then failed = true end
                        if data.entry.message == "system lifecycle resident" then return failed end
                    end
                end
            end
            test.eq(await_resident(), true, "monitored boot reports failed convergence before becoming resident")
            db = assert(sql.get("app:db"))
            local refused = assert(db:query("SELECT event_hot_retention_days FROM kickside_retention_policy WHERE thread_id=$1", { id }))
            db:release()
            test.eq(tonumber(refused[1].event_hot_retention_days), declared_days + 1)
            drop_refusal()
            original = assert(registry.current_version())
            local entry = assert(registry.get("kickside.core.lifecycle:boot_process"))
            local snapshot = assert(registry.snapshot())
            local changes = snapshot:changes()
            entry.meta.comment = tostring(entry.meta.comment or "") .. " contract audit " .. uuid.v7()
            changes:update(entry)
            logger:info("system lifecycle resident")
            local _, upgrade_err = changes:apply()
            test.is_nil(upgrade_err)
            test.eq(await_resident(), false, "upgraded boot converges without failure")
            db = assert(sql.get("app:db"))
            local repaired = assert(db:query("SELECT event_hot_retention_days FROM kickside_retention_policy WHERE thread_id=$1", { id }))
            db:release()
            test.eq(tonumber(repaired[1].event_hot_retention_days), declared_days)
        end)
        test.it("exits successfully on cancellation across repeated starts", function()
            local events = process.events()
            for _ = 1, 3 do
                local pid, spawn_err = process.spawn_monitored("kickside.core.lifecycle:boot_process", "app:processes")
                test.eq(spawn_err, nil)
                test.not_nil(pid)
                local _, cancel_err = process.cancel(pid)
                test.eq(cancel_err, nil)
                local deadline = time.after("3s")
                local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                if selected.channel ~= events then
                    process.terminate(pid)
                    error("boot process ignored cancellation")
                end
                local event = selected.value
                test.eq(event.kind, process.event.EXIT)
                test.eq(event.from, pid)
                test.eq(event.result.error, nil)
                test.eq(event.result.value.ok, true)
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }

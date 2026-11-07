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
local funcs = require("funcs")
local migration_runner = require("migration_runner")
local core_db = require("core_db")

local function log_pid(data: any): string?
    for _, field in ipairs(data.fields) do
        if field.key == "pid" then return field.string end
    end
    return nil
end

local function define_tests()
    test.describe("lifecycle boot convergence", function()
        local original, subscription, logs, boot_pid, trigger_name, postgres
        local await_boot: (any, string, string) -> boolean
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
            -- Restoring the registry upgrades boot again; the next case starts
            -- once that upgrade's convergence has settled.
            if original then
                local _, restore_err = registry.apply_version(original)
                test.is_nil(restore_err)
                original = nil
                await_boot(logs, boot_pid :: string, "system lifecycle resident")
            end
            if subscription then
                local _, close_err = subscription:close()
                test.is_nil(close_err)
                subscription = nil
            end
        end)

        -- Diverges the lifecycle thread's retention policy from its declaration
        -- and, given a trigger name, refuses the write that converges it back,
        -- the way a column the installed code reads is absent until the
        -- install's migrations run.
        local function diverge_with_refusal(name: string?): (string, number)
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
            if not name then
                db:release()
                return id, declared_days
            end
            trigger_name = name
            if postgres then
                local _, function_err = db:execute("CREATE FUNCTION " .. name .. "() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.thread_id = '" .. id .. "' THEN RAISE EXCEPTION 'boot retention refusal'; END IF; RETURN NEW; END $$")
                test.is_nil(function_err)
            end
            local statement = postgres and ("CREATE TRIGGER " .. name .. " BEFORE UPDATE ON kickside_retention_policy FOR EACH ROW EXECUTE FUNCTION " .. name .. "()")
                or ("CREATE TRIGGER " .. name .. " BEFORE UPDATE ON kickside_retention_policy WHEN NEW.thread_id='" .. id .. "' BEGIN SELECT RAISE(ABORT, 'boot retention refusal'); END")
            local _, trigger_err = db:execute(statement)
            test.is_nil(trigger_err)
            db:release()
            return id, declared_days
        end

        local function retention_days(id: string): number?
            local db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT event_hot_retention_days FROM kickside_retention_policy WHERE thread_id=$1", { id }))
            db:release()
            return tonumber(rows[1].event_hot_retention_days)
        end

        local function service_pid(): string
            local pid = assert(process.registry.lookup(consts.BOOT_NAME, process.registry.CONSISTENT))
            return tostring(pid)
        end

        -- Waits for the boot's log line `until_message` and reports whether its
        -- convergence failed before it.
        await_boot = function(logs: any, pid: string, until_message: string): boolean
            local deadline = time.after("10s")
            local failed = false
            while true do
                local selected = channel.select({ logs:case_receive(), deadline:case_receive() })
                test.eq(selected.channel, logs, "boot does not log " .. until_message)
                if selected.channel ~= logs then return failed end
                local data = selected.value.data
                if log_pid(data) == pid then
                    if data.entry.message == "system lifecycle convergence failed" then failed = true end
                    if data.entry.message == until_message then return failed end
                end
            end
        end

        -- Publishes an in-place boot upgrade together with a pending migration
        -- in `namespace` on the core database, the shape of a hot install whose
        -- code reads schema a migration creates after the registry commit.
        local function upgrade_boot_with_migration(namespace: string): string
            original = assert(registry.current_version())
            local entry = assert(registry.get("kickside.core.lifecycle:boot_process"))
            local template = assert(registry.get("kickside.core.lifecycle:pending_schema_migration"))
            local migration_id = namespace .. ":pending_schema_" .. uuid.v7():gsub("-", "_")
            local snapshot = assert(registry.snapshot())
            local changes = snapshot:changes()
            entry.meta.comment = tostring(entry.meta.comment or "") .. " contract audit " .. uuid.v7()
            changes:update(entry)
            changes:create({ id = migration_id, kind = template.kind, data = template.data,
                meta = { type = "migration", target_db = core_db.id(), timestamp = "2099-01-01T00:00:00Z",
                    comment = "Pending schema the upgraded boot converges against." } })
            local _, upgrade_err = changes:apply()
            test.is_nil(upgrade_err)
            return migration_id
        end

        local function migrations_applied(): ()
            local result, call_err = funcs.call("kickside.core.lifecycle:migrations_applied")
            test.is_nil(call_err)
            test.eq(type(result) == "table" and result.status, "success")
        end

        test.it("converges an upgraded boot only once the install's migrations are applied", function()
            subscription = assert(events.subscribe("logs", "logs.entry"))
            logs = subscription:channel()
            local pid = service_pid()
            boot_pid = pid
            local id, declared_days = diverge_with_refusal("lifecycle_boot_pending_schema")
            -- The shared stream carries resident logs from other processes.
            logger:info("system lifecycle resident")
            local migration_id = upgrade_boot_with_migration("kickside.core.migrations")
            test.eq(await_boot(logs, pid, "system lifecycle resident"), false, "upgraded boot converges before the install's migrations")
            test.eq(service_pid(), pid, "boot upgrades in place")
            test.eq(retention_days(id), declared_days + 1)
            local run = migration_runner.setup(core_db.id()):run()
            test.eq(type(run) == "table" and run.status, "complete")
            trigger_name = nil
            local rows = assert(migration_runner.setup(core_db.id()):find_migrations())
            local pending = true
            for _, row in ipairs(rows) do
                if row.id == migration_id then pending = row.applied ~= true end
            end
            test.is_false(pending, "install migration applies")
            migrations_applied()
            test.eq(await_boot(logs, pid, "system lifecycle converged after migrations"), false, "boot converges once migrations are applied")
            test.eq(retention_days(id), declared_days)
        end)

        local function apply_pending_migrations(): ()
            local run = migration_runner.setup(core_db.id()):run()
            test.eq(type(run) == "table" and run.status, "complete")
            trigger_name = nil
        end

        test.it("keeps convergence parked on a migrations-applied message while a migration is pending, then converges on the retry", function()
            subscription = assert(events.subscribe("logs", "logs.entry"))
            logs = subscription:channel()
            local pid = service_pid()
            boot_pid = pid
            local id, declared_days = diverge_with_refusal("lifecycle_boot_pending_schema")
            logger:info("system lifecycle resident")
            upgrade_boot_with_migration("kickside.core.migrations")
            test.eq(await_boot(logs, pid, "system lifecycle resident"), false, "upgraded boot converges before the install's migrations")
            -- Bootloaders run without migrations; the migration lands later.
            migrations_applied()
            test.eq(await_boot(logs, pid, "system lifecycle convergence awaits migrations"), false, "message converges against a pending migration")
            test.eq(retention_days(id), declared_days + 1)
            apply_pending_migrations()
            test.eq(await_boot(logs, pid, "system lifecycle converged after migrations"), false, "parked boot converges on the retry once the migration lands")
            test.eq(retention_days(id), declared_days)
        end)

        -- Component and Users migrations reach the core database through
        -- installs whose changed modules exclude core, so no message follows.
        for _, namespace in ipairs({ "kickside.component.migrations", "kickside.users.migrations" }) do
            test.it("converges after a dependency-only upgrade's " .. namespace .. " migration without a migrations-applied message", function()
                subscription = assert(events.subscribe("logs", "logs.entry"))
                logs = subscription:channel()
                local pid = service_pid()
                boot_pid = pid
                local id, declared_days = diverge_with_refusal("lifecycle_boot_pending_schema")
                logger:info("system lifecycle resident")
                upgrade_boot_with_migration(namespace)
                test.eq(await_boot(logs, pid, "system lifecycle resident"), false, "upgraded boot converges before the " .. namespace .. " migration")
                test.eq(retention_days(id), declared_days + 1)
                apply_pending_migrations()
                test.eq(await_boot(logs, pid, "system lifecycle converged after migrations"), false, "parked boot converges on the retry once the migration lands")
                test.eq(retention_days(id), declared_days)
            end)
        end

        test.it("converges on upgrade while a migration outside the convergence schema is pending", function()
            subscription = assert(events.subscribe("logs", "logs.entry"))
            logs = subscription:channel()
            local pid = service_pid()
            boot_pid = pid
            local id, declared_days = diverge_with_refusal(nil)
            logger:info("system lifecycle resident")
            upgrade_boot_with_migration("app.unrelated.migrations")
            test.eq(await_boot(logs, pid, "system lifecycle resident"), false, "upgraded boot fails convergence")
            test.eq(retention_days(id), declared_days)
        end)

        test.it("stays resident after failed convergence and repairs it on the next migrations-applied message", function()
            subscription = assert(events.subscribe("logs", "logs.entry"))
            logs = subscription:channel()
            local pid = service_pid()
            boot_pid = pid
            local id, declared_days = diverge_with_refusal("boot_refusal_" .. uuid.v7():gsub("-", ""))
            migrations_applied()
            test.eq(await_boot(logs, pid, "system lifecycle converged after migrations"), true, "refused convergence is reported")
            test.eq(retention_days(id), declared_days + 1)
            test.eq(service_pid(), pid, "boot stays resident after failed convergence")
            drop_refusal()
            migrations_applied()
            test.eq(await_boot(logs, pid, "system lifecycle converged after migrations"), false, "boot repairs convergence on the next message")
            test.eq(retention_days(id), declared_days)
        end)
    end)

    test.describe("lifecycle boot shutdown", function()
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

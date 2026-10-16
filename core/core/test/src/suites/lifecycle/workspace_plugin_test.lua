local test = require("test")
local process = require("process")
local security = require("security")
local channel = require("channel")
local time = require("time")
local sql = require("sql")
local uuid = require("uuid")
local autoinit = require("autoinit")

return { run = test.run_cases(function()
    test.describe("workspace login provisioning", function()
        local child
        test.after_each(function()
            if child then
                local _, cancel_err = process.cancel(child)
                test.is_nil(cancel_err)
                local selected = channel.select({ process.events():case_receive(), time.after("3s"):case_receive() })
                test.eq(selected.channel, process.events())
                test.eq((selected.value :: process.Event).from, child)
                child = nil
            end
        end)
        local function login(actor_id, user_id)
            local actor = assert(security.new_actor(actor_id, { security_groups = {} }))
            local scope = assert(security.named_scope("wippy.security:process"))
            local pid, spawn_err = process.with_context({}):with_actor(actor):with_scope(scope)
                :spawn_monitored("kickside.core.threads:workspace_plugin", "app:processes", { user_id = user_id })
            test.is_nil(spawn_err)
            child = pid
            local selected = channel.select({ process.events():case_receive(), time.after("3s"):case_receive() })
            test.eq(selected.channel, process.events(), "workspace plugin does not exit")
            test.eq((selected.value :: process.Event).from, child)
            test.eq((selected.value :: process.Event).kind, process.event.EXIT)
            child = nil
            test.is_nil((selected.value :: process.Event).result.error)
            return (selected.value :: process.Event).result.value
        end
        test.it("returns native refusal details through a clean process exit", function()
            local owner = "login-native-" .. uuid.v7()
            for _, entry in ipairs({
                {actor = "other-" .. uuid.v7(), user = owner, kind = errors.PERMISSION_DENIED,
                    code = "workspace_actor_mismatch"},
                {actor = owner, user = "", kind = errors.INVALID, code = "workspace_user_required"},
            }) do
                local outcome = login(entry.actor, entry.user)
                test.eq(outcome.ok, false)
                test.is_true(errors.is(outcome.error, entry.kind))
                test.eq(outcome.error:retryable(), false)
                test.eq(outcome.error:details().code, entry.code)
            end
        end)
        test.it("exits cleanly on refusal and converges one workspace on successive logins", function()
            local owner = "login-" .. uuid.v7()
            local id = autoinit.component_id(owner, "test_ws")
            test.eq(login("other-" .. uuid.v7(), owner).ok, false)
            test.eq(login(owner, "").ok, false)
            local db = assert(sql.get("app:db"))
            local before = assert(db:query("SELECT COUNT(*) AS n FROM kickside_thread WHERE id=$1", { id }))
            db:release()
            test.eq(tonumber(before[1].n), 0)
            local first, second = login(owner, owner), login(owner, owner)
            test.eq(first.ok, true)
            test.eq(second.ok, true)
            test.is_true(first.count >= 1)
            test.eq(second.count, first.count)
            db = assert(sql.get("app:db"))
            for _, item in ipairs({ { "kickside_components", "component_id" }, { "kickside_thread", "id" },
                { "kickside_retention_policy", "thread_id" } }) do
                local rows = assert(db:query("SELECT COUNT(*) AS n FROM " .. item[1] .. " WHERE " .. item[2] .. "=$1", { id }))
                test.eq(tonumber(rows[1].n), 1)
            end
            local projections = assert(db:query("SELECT COUNT(*) AS n FROM kickside_projection WHERE thread_id=$1", { id }))
            local retention = assert(db:query("SELECT event_hot_retention_days FROM kickside_retention_policy WHERE thread_id=$1", { id }))
            db:release()
            test.eq(tonumber(projections[1].n), 1)
            test.eq(tonumber(retention[1].event_hot_retention_days), 7)
        end)
    end)
end) }

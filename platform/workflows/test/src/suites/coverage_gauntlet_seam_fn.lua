-- Actor-bound launch and generic signal seam used by the coverage gauntlet.
local runs = require("runs")
local client = require("client")
local store = require("store")
local admission = require("admission")
local maintenance = require("maintenance")

type Map = { [string]: any }

local function seam(args: any): any
    local a = type(args) == "table" and (args :: Map) or {}
    if a.op == "launch" then
        runs._client_new = function() return client.new() end
        runs._update_public_meta = function(_component_id, _patch) end
        local result, err = runs.launch(tostring(a.workflow_id or ""), {
            version = tonumber(a.version) or 1,
            input = type(a.input) == "table" and a.input or {},
            mode = "sync",
        })
        if err then return { success = false, error = tostring(err) } end
        return { success = true, result = result }
    elseif a.op == "resume" then
        local c, client_err = client.new()
        if client_err or not c then return { success = false, error = tostring(client_err) } end
        local result, err = c:signal(tostring(a.dataflow_id or ""), tostring(a.signal_id or ""), a.payload or {})
        if err then return { success = false, error = tostring(err) } end
        return { success = true, result = { ok = true, commit_id = (result :: Map).commit_id } }
    elseif a.op == "drive" then
        local c, client_err = client.new()
        if client_err or not c then return { success = false, error = tostring(client_err) } end
        local result, err = c:execute(tostring(a.dataflow_id or ""), {})
        if not result then return { success = false, error = tostring(err) } end
        return { success = true, result = result, execution_error = err and tostring(err) or nil }
    elseif a.op == "reconcile" then
        local db, open_err = store.open_db()
        if open_err or not db then return { success = false, error = tostring(open_err) } end
        local rows, row_err = db:query("SELECT run_id FROM workflow_runs WHERE dataflow_id=$1",
            { tostring(a.dataflow_id or "") })
        if row_err or not rows or #rows ~= 1 then
            db:release()
            return { success = false, error = tostring(row_err or "workflow run is not unique") }
        end
        local run_id = tostring(rows[1].run_id)
        local _, due_err = db:execute("UPDATE workflow_runs SET completion_check_at=$1"
            .. " WHERE dataflow_id=$2 AND status IN ('pending','running')",
            { admission.now(), tostring(a.dataflow_id or "") })
        db:release()
        if due_err then return { success = false, error = tostring(due_err) } end
        local result, tick_err = maintenance.tick(1, run_id)
        if tick_err then return { success = false, error = tostring(tick_err) } end
        if result.failures ~= 0 then
            return { success = false, error = "maintenance reconciliation failed: " .. tostring(result.last_error) }
        end
        local check, check_err = store.open_db()
        if check_err or not check then return { success = false, error = tostring(check_err) } end
        local _, due_publish_err = check:execute("UPDATE workflow_runs SET terminal_event_check_at=$1"
            .. " WHERE run_id=$2 AND terminal_event_pending", { admission.now(), run_id })
        check:release()
        if due_publish_err then return { success = false, error = tostring(due_publish_err) } end
        local published, publish_err = maintenance.tick(1, run_id)
        if publish_err or not published or published.failures ~= 0 then
            return { success = false, error = "terminal publication failed: "
                .. tostring(publish_err or (published and published.last_error)) }
        end
        return { success = true, result = result }
    elseif a.op == "get_status" then
        local c, err = client.new()
        if err then return { success = false, error = tostring(err) } end
        local result, status_err = c:get_status(tostring(a.dataflow_id or ""))
        if status_err then return { success = false, error = tostring(status_err) } end
        return { success = true, result = result }
    elseif a.op == "output" then
        local c, err = client.new()
        if err then return { success = false, error = tostring(err) } end
        local result, output_err = c:output(tostring(a.dataflow_id or ""))
        if output_err then return { success = false, error = tostring(output_err) } end
        return { success = true, result = result }
    end
    return { success = false, error = "unknown op" }
end

return { seam = seam }

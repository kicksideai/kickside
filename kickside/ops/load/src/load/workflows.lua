-- Real published Workflows/dataflow completion-recovery workload over the
-- published Dataflow client.
local time = require("time")
local sql = require("sql")
local support = require("driver_support")
local workflow_repo = require("workflow_repo")
local workflow = require("workflow")
local version_publish = require("version_publish")
local runs = require("runs")
local types = require("types")
local client = require("client")
local maintenance = require("maintenance")
local consts = require("consts")
local M = {}
type Map = { [string]: any }
local TERMINAL: { [string]: boolean } = {}
for _, status in ipairs({ consts.STATUS.COMPLETED_SUCCESS, consts.STATUS.COMPLETED_FAILURE,
    consts.STATUS.CANCELLED, consts.STATUS.TERMINATED }) do
    TERMINAL[status] = true
end

local function command(kind: string, body: any): any
    return { type = kind, body = body }
end

local function published_fixture(): string
    local created, create_err = workflow_repo.create("Lane LOD terminal recovery")
    if create_err or not created then support.fail("workflow creation failed: " .. tostring(create_err)) end
    local id = tostring((created :: Map).id)
    local C = types.COMMAND
    local commands = {
        command(C.NODE_ADD, { id = "start", kind = "start", title = "Start",
            config = { input_schema = { type = "object", additionalProperties = true } } }),
        command(C.NODE_ADD, { id = "work", kind = "block", ref = "app:block.engine_linear", title = "Work" }),
        command(C.NODE_ADD, { id = "finish", kind = "finish", title = "Finish",
            config = { output_schema = { type = "object", additionalProperties = true } } }),
        command(C.EDGE_ADD, { id = "start-work", source_id = "start", target_id = "work" }),
        command(C.EDGE_ADD, { id = "work-finish", source_id = "work", target_id = "finish" }),
    }
    local _, apply_err = workflow.apply(id, commands, "lane_lod_owner")
    if apply_err then support.fail("workflow apply failed: " .. tostring(apply_err)) end
    local published, publish_err = version_publish.publish(id, "lane_lod_owner")
    if publish_err or not published or (published :: Map).ok ~= true then
        support.fail("workflow publish failed: " .. tostring(publish_err))
    end
    return id
end

local function await_engine(cli: any, dataflow_id: string): ()
    local deadline = time.now():unix_nano() + 20000000000
    while time.now():unix_nano() < deadline do
        local status, err = cli:get_status(dataflow_id)
        if not err and TERMINAL[tostring(status)] then return end
        time.sleep("20ms")
    end
    support.fail("dataflow did not become terminal: " .. dataflow_id)
end

function M.terminal_checks(): Map
    local smoke = support.state_get("smoke") == "1"
    local target = smoke and 2 or 1000
    local cli, client_err = client.new()
    if client_err or not cli then support.fail("dataflow client unavailable: " .. tostring(client_err)) end
    local id = published_fixture()
    -- Setup launches real dataflows and waits for durable engine terminal proof.
    -- Re-arming a completed workflow row models a lost completion callback;
    -- the measured interval starts only after all rows are due.
    for i = 1, target do
        local launched, launch_err = runs.launch(id, { version = 1,
            input = { text = "lane-lod-" .. tostring(i), count = i } })
        if launch_err or not launched then support.fail("workflow launch failed: " .. tostring(launch_err)) end
        local dataflow_id = tostring((launched :: Map).dataflow_id or "")
        if dataflow_id == "" then support.fail("workflow launch has no dataflow id") end
        await_engine(cli, dataflow_id)
    end
    local callback_deadline = time.now():unix_nano() + 20000000000
    local callbacks = 0
    while time.now():unix_nano() < callback_deadline do
        callbacks = tonumber(support.scalar([[SELECT COUNT(*) AS n FROM workflow_runs
            WHERE workflow_id=$1 AND status IN ('completed','failed','cancelled','terminated')]],
            { id }, "n")) or 0
        if callbacks == target then break end
        time.sleep("20ms")
    end
    if callbacks ~= target then support.fail("workflow callbacks did not settle before recovery setup: "
        .. tostring(callbacks) .. "/" .. tostring(target)) end
    local due = support.dbtype() == sql.type.POSTGRES and "NOW()::text" or "CURRENT_TIMESTAMP"
    support.exec("UPDATE workflow_runs SET status='running',finished_at=NULL,"
        .. "terminal_event_pending=FALSE,terminal_event_check_at=NULL,"
        .. "completion_check_token=NULL,completion_check_at=" .. due
        .. " WHERE workflow_id=$1 AND dataflow_id IS NOT NULL", { id })
    support.state_set("workflow_id", id)
    local started = time.now():unix_nano()
    local checked, published, failures = 0, 0, 0
    for _ = 1, math.ceil(target / 50) + 2 do
        local stats, tick_err = maintenance.tick(50)
        if tick_err or not stats then support.fail("workflow maintenance failed: " .. tostring(tick_err)) end
        checked = checked + (tonumber(stats.checked) or 0)
        published = published + (tonumber(stats.published) or 0)
        failures = failures + (tonumber(stats.failures) or 0)
        if checked >= target then break end
    end
    local elapsed_ms = (time.now():unix_nano() - started) / 1000000
    local terminal = tonumber(support.scalar("SELECT COUNT(*) AS n FROM workflow_runs WHERE workflow_id=$1"
        .. " AND status IN ('completed','failed','cancelled','terminated')"
        .. " AND terminal_event_pending=FALSE AND completion_check_at IS NULL", { id }, "n")) or 0
    local valid = checked == target and terminal == target and failures == 0 and elapsed_ms <= 300000
    local status = valid and (smoke and "SMOKE" or "PASS") or "FAIL"
    support.metric("1,000 terminal checks", "1,000 ≤300,000 ms",
        tostring(checked) .. "/" .. tostring(target) .. "; " .. support.fmt(elapsed_ms) .. " ms", status,
        tostring(terminal) .. " durable terminal and publication acknowledgments; "
            .. tostring(published) .. " maintenance publications; failures=" .. tostring(failures))
    return { checked = checked, target = target, published = published,
        terminal = terminal, failures = failures, elapsed_ms = elapsed_ms }
end

-- The engine's terminal status stays addressable by the workflow run's
-- dataflow id after the provider outage.
function M.evidence_after_outage(): Map
    local id = support.state_get("workflow_id")
    if id == "" then support.fail("workflow terminal fixture is missing") end
    local row = support.query("SELECT run_id,dataflow_id,status FROM workflow_runs WHERE workflow_id=$1"
        .. " ORDER BY started_at,run_id LIMIT 1", { id })[1]
    if not row then support.fail("workflow evidence row is missing") end
    local cli, err = client.new()
    if err or not cli then support.fail("dataflow evidence client unavailable: " .. tostring(err)) end
    local status, status_err = cli:get_status(tostring(row.dataflow_id))
    local retained = not status_err and TERMINAL[tostring(status)] == true
    local smoke = support.state_get("smoke") == "1"
    support.metric("dataflow terminal evidence retained", "terminal after outage",
        retained and tostring(status) or tostring(status_err or status),
        retained and (smoke and "SMOKE" or "PASS") or "FAIL",
        "The dataflow engine's terminal status remains addressable by the workflow run after the provider outage")
    return { retained = retained }
end

return M

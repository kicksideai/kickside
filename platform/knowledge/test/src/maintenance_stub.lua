-- Deterministic optional-engine implementation used solely by the standalone
-- Knowledge harness. Production engines own their own maintenance workers.

local ctx = require("ctx")

local function component_id(): string
    local value = ctx.get("component_id")
    return type(value) == "string" and value or ""
end

local function schedule(run_type: string): any
    local kb_id = component_id()
    if kb_id == "" then return { error = "component_id not found in context" } end
    return {
        kb_id = kb_id,
        job_id = "test-job-" .. run_type,
        scheduled = true,
        run = { id = "test-run-" .. run_type, run_type = run_type, in_flight = true },
    }
end

local function schedule_resummarize(_args: any): any
    return schedule("resummarize")
end

local function schedule_reembed(_args: any): any
    return schedule("reembed")
end

local function maintenance_status(_args: any): any
    return {
        resummarize = { id = "test-run-resummarize", run_type = "resummarize", in_flight = false },
        reembed = { id = "test-run-reembed", run_type = "reembed", in_flight = true },
    }
end

return {
    schedule_resummarize = schedule_resummarize,
    schedule_reembed = schedule_reembed,
    maintenance_status = maintenance_status,
}

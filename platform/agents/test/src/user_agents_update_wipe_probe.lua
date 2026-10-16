-- Test-only probe: drives user_agents.update while its context-read service is
-- forced to fail, so a test can assert the update ABORTS instead of wiping the
-- stored config. Runs under the caller's actor/scope (invoked via a funcs executor),
-- so set_meta and the direct DB read below operate as the real request path would.
-- The constructed service fails the read in the same runtime as the update.

local sql = require("sql")
local json = require("json")
local user_agents = require("user_agents")

local function read_ctx(component_id: string): any
    local db, err = sql.get("app:db")
    if err or not db then return nil end
    local rows = sql.builder.select("private_context")
        :from("kickside_components")
        :where("component_id = ?", component_id)
        :limit(1)
        :run_with(db):query()
    db:release()
    local raw = (rows and rows[1] and (rows[1] :: any).private_context) or "{}"
    local decoded, derr = json.decode(tostring(raw))
    if derr then return nil end
    return decoded
end

local function run(args: any): any
    args = args or {}
    local component_id = args.component_id
    if type(component_id) ~= "string" or component_id == "" then
        return { ok = false, error = "component_id is required" }
    end

    local before = read_ctx(component_id)

    local instance = user_agents.new(function(): (any, any)
        return {
            get_access_context = function(_self: any, _req: any): (any, any)
                return nil, "transient context read failure"
            end,
        }, nil
    end)
    local result, failure = instance.update(component_id, {
        prompt = "WIPE PROBE SHOULD NOT PERSIST",
        title = "wipe-probe",
    })

    local after = read_ctx(component_id)

    return { ok = true, result = result, error = failure and tostring(failure), kind = errors.is(failure, errors.UNKNOWN) and errors.UNKNOWN or nil, before = before, after = after }
end

return { run = run }

local ctx = require("ctx")
local sql = require("sql")
local contract = require("contract")
local funcs = require("funcs")
local json = require("json")

local function delete(): any
    local id = ctx.get("component_id")
    local definition, contract_err = contract.get("kickside.core:threads")
    if contract_err or not definition then return { success = false, error = contract_err or "threads unavailable" } end
    local threads, open_err = definition:open()
    if open_err or not threads then return { success = false, error = open_err or "threads binding unavailable" } end
    local found, find_err = threads:find({ thread_id = id })
    if find_err or not found then return { success = false, error = find_err or "cleanup thread not found" } end
    local purged, purge_err = threads:purge({ component_id = id })
    if purge_err or not purged or purged.purged ~= true then
        return { success = false, error = purge_err or "thread purge has no proof" }
    end
    local retry, retry_err = funcs.call("kickside.component:retention", {
        change = { kind = "lease_released", owner_locator = { kind = "component", id = id } },
    })
    if retry_err then return { success = false, error = retry_err } end
    local encoded, encode_err = json.encode(retry)
    if encode_err then return { success = false, error = encode_err } end
    local db, db_err = sql.get("app:db")
    if db_err or not db then return { success = false, error = db_err or "database unavailable" } end
    local _, report_err = db:execute("INSERT INTO component_delete_retry_report(component_id,body) VALUES ($1,$2)", { id, encoded })
    if report_err then db:release(); return { success = false, error = report_err } end
    local result, delete_err = db:execute("DELETE FROM component_delete_read_model WHERE component_id=$1", { id })
    db:release()
    if delete_err or not result then return { success = false, error = delete_err or "read model purge has no proof" } end
    return { success = true }
end

return { delete = delete }

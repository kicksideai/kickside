type Map = { [string]: any }

local time = require("time")
local support = require("driver_support")
local fail = support.fail
local open_db = support.open_db
local state_get = support.state_get

local M = {}

-- Each outcome answers the item's delivery_key; the provider receipt records
-- the source item_key.
function M.deliver_event(request: any): (any, any)
    local items = type(request) == "table" and type((request :: Map).items) == "table"
        and ((request :: Map).items :: { Map }) or {}
    local delivered: { Map } = {}
    local failed: { Map } = {}
    local unavailable = state_get("provider_outage") == "1"
    if unavailable then
        for _, item in ipairs(items) do
            failed[#failed + 1] = { key = tostring(item.delivery_key),
                error = { kind = "Unavailable", message = "load fixture provider unavailable", retriable = true } }
        end
    elseif #items > 0 then
        local drive = type(request) == "table" and type((request :: Map).drive) == "table"
            and ((request :: Map).drive :: Map) or {}
        local component = require("component")
        local reference_id = state_get("reference_id")
        if reference_id == "" then fail("reference access fixture is missing") end
        local reference, access_err = component.open(reference_id, component.ACCESS.READ)
        if access_err or not reference then fail("reference access failed: " .. tostring(access_err)) end
        local db = open_db()
        local tx, begin_err = db:begin()
        if begin_err or not tx then db:release(); fail("provider receipt begin failed: " .. tostring(begin_err)) end
        local _, page_err = tx:execute([[INSERT INTO kickside_lod_page_observation
            (automation_id,drive_key,item_count,observed_at) VALUES($1,$2,$3,$4)]],
            { tostring(drive.automation_id or ""), tostring(drive.drive_key or ""), #items,
                time.now():utc():format(time.RFC3339) })
        if page_err then tx:rollback(); db:release(); fail("provider page observation failed: " .. tostring(page_err)) end
        for _, item in ipairs(items) do
            local item_key = tostring(item.item_key)
            local _, write_err = tx:execute([[INSERT INTO kickside_lod_provider_receipt
                (automation_id,item_key,observed_at) VALUES($1,$2,$3)
                ON CONFLICT(automation_id,item_key) DO UPDATE SET observed_at=excluded.observed_at]],
                { tostring(drive.automation_id or ""), item_key, time.now():utc():format(time.RFC3339) })
            if write_err then tx:rollback(); db:release(); fail("provider receipt failed: " .. tostring(write_err)) end
            delivered[#delivered + 1] = { key = tostring(item.delivery_key) }
        end
        local _, commit_err = tx:commit()
        db:release()
        if commit_err then fail("provider receipt commit failed: " .. tostring(commit_err)) end
    end
    return { delivered_items = delivered, skipped_items = {}, waiting_items = {},
        uncertain_items = {}, failed_items = failed }, nil
end

return M

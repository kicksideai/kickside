-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Settings change keeper: one per node. It keeps this node's override cache at
-- the committed revision and tells local subscribers after each change.
--
-- A writer on any node publishes its committed revision to every keeper. A
-- keeper reloads when the revision is newer than its cache, and rechecks the
-- stored revision when a keeper joins the group, which covers node starts and
-- partitions that heal. Subscribers on this node hear each revision once.

local pg = require("pg")
local process = require("process")
local channel = require("channel")
local logger = require("logger")
local cache = require("settings_cache")
local writer = require("settings_writer")
local changes = require("settings_changes")

local log = logger:named("kickside.settings.keeper")

local function main(): (any?, any?)
    local scope, err = pg.open(changes.SCOPE)
    if err or not scope then return nil, err or "settings change scope unavailable" end
    local _, jerr = scope:join(changes.KEEPERS)
    if jerr then return nil, jerr end
    local membership, _, merr = scope:monitor(changes.KEEPERS)
    if merr or not membership then return nil, merr or "settings keeper membership unavailable" end
    local inbox = process.listen(changes.TOPIC)
    local lifecycle = process.events()

    local notified: number? = nil

    -- refresh brings the cache to target, or to the stored revision when target
    -- is nil, and tells subscribers about a revision they have not heard.
    local function refresh(target: number?): any?
        if target == nil then
            local stored, serr = writer.stored_revision()
            if serr then return serr end
            target = stored
        end
        local cached = cache.revision()
        if cached == nil or (target :: number) > cached then
            local _, rerr = writer.reload()
            if rerr then return rerr end
        end
        local current = cache.revision()
        if current ~= nil and notified ~= nil and current > notified then
            local _, berr = scope:broadcast_local(changes.SUBSCRIBERS, changes.TOPIC, { revision = current })
            if berr then return berr end
        end
        if current ~= nil and (notified == nil or current > notified) then notified = current end
        return nil
    end

    local start_err = refresh(nil)
    if start_err then return nil, start_err end

    while true do
        local result = channel.select({
            inbox:case_receive(),
            membership:channel():case_receive(),
            lifecycle:case_receive(),
        })
        if not result.ok then return nil, "settings keeper channel closed" end
        local refresh_err: any? = nil
        if result.channel == inbox then
            local message = result.value
            local revision = type(message) == "table" and tonumber(message.revision) or nil
            refresh_err = refresh(revision)
        elseif result.channel == lifecycle then
            if result.value and result.value.kind == process.event.CANCEL then
                membership:close()
                scope:leave(changes.KEEPERS)
                return { status = "stopped" }, nil
            end
        elseif result.value and result.value.kind == "member.joined" then
            refresh_err = refresh(nil)
        end
        if refresh_err then
            log:error("settings keeper refresh failed", { error = tostring(refresh_err) })
            return nil, refresh_err
        end
    end
end

return { main = main }

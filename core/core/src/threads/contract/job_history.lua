-- Core resolves component access and merges Jobs-owned pages in total order.
local uuid = require("uuid")
local threads_contract = require("threads_contract")
local thread_resource = require("thread_resource")
local jobs = require("jobs")
local clock = require("clock")

local function invalid(): error
    return (errors.new({ message = "job history cursor is invalid or no longer available", kind = errors.INVALID }) :: error)
end
local function internal(message: string): error
    return (errors.new({ message = message, kind = errors.INTERNAL }) :: error)
end

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local threads_contract = deps.threads_contract or threads_contract
    local thread_resource = deps.thread_resource or thread_resource
    local jobs = deps.jobs or jobs
    local M = {}

    function M.list(collection: string, filters: table?, limit: integer, cursor: string?): (table?, error?)
        if collection ~= "jobs" and collection ~= "runs" then return nil, invalid() end
        if type(limit) ~= "number" or limit < 1 or limit > 500 or limit ~= math.floor(limit) then return nil, invalid() end
        local after: table? = nil
        if cursor ~= nil and cursor ~= "" then
            if type(cursor) ~= "string" then return nil, invalid() end
            local kind, id, owner = cursor:match("^v1:([a-z]+):([%x%-]+):([%x%-]+)$")
            if kind ~= collection or not id or not owner or not uuid.validate(id) or not uuid.validate(owner) then
                return nil, invalid()
            end
            local thread, read_err = thread_resource.find({ thread_id = owner })
            if read_err then return nil, read_err end
            if not thread then return nil, invalid() end
            after = { id = id, owner_id = owner }
        end
        local candidates: table[] = {}
        local offset = 0
        local read = collection == "jobs" and jobs.list_jobs or jobs.list_job_runs
        while true do
            local scope, scope_err = threads_contract.readable_threads({ limit = 100, offset = offset })
            if scope_err then return nil, scope_err end
            if type(scope) ~= "table" or type(scope.thread_ids) ~= "table" or type(scope.has_more) ~= "boolean"
                or type(scope.next_offset) ~= "number" or scope.next_offset < offset
                or scope.next_offset ~= math.floor(scope.next_offset) then
                return nil, internal("readable thread scope has no page verdict")
            end
            local ids: string[] = {}
            local contains_anchor = false
            for _, id in ipairs(scope.thread_ids) do
                ids[#ids + 1] = id
                if after and id == after.owner_id then contains_anchor = true end
            end
            -- Every Jobs call validates its cursor within an authorized owner set.
            if after and not contains_anchor then ids[#ids + 1] = after.owner_id end
            if #ids > 0 then
                local rows, query_err, more = read(ids, filters, limit + 1, after)
                if query_err then return nil, query_err end
                if type(rows) ~= "table" or type(more) ~= "boolean" then
                    return nil, internal("job history read has no page verdict")
                end
                local seen: { [string]: boolean } = {}
                for _, candidate in ipairs(candidates) do seen[candidate.row.id] = true end
                for _, row in ipairs(rows) do
                    if type(row) ~= "table" or type(row.id) ~= "string" or type(row.thread_id) ~= "string" then
                        return nil, internal("job history row has no owner position")
                    end
                    if not seen[row.id] then
                        local timestamp, parse_err = clock.parse(row[collection == "jobs" and "created_at" or "started_at"])
                        if parse_err or not timestamp then return nil, internal("job history row has an invalid timestamp") end
                        candidates[#candidates + 1] = { row = row, instant = timestamp:unix_nano() }
                        seen[row.id] = true
                    end
                end
                table.sort(candidates, function(a: any, b: any): boolean
                    if a.instant == b.instant then return a.row.id > b.row.id end
                    return a.instant > b.instant
                end)
                while #candidates > limit + 1 do table.remove(candidates) end
            end
            if not scope.has_more then break end
            if scope.next_offset <= offset then return nil, internal("readable thread scope does not advance") end
            offset = scope.next_offset
        end
        local more = #candidates > limit
        if more then table.remove(candidates) end
        local rows: table[] = {}
        for _, candidate in ipairs(candidates) do rows[#rows + 1] = candidate.row end
        local next_cursor: string? = nil
        if more then
            local last = rows[#rows]
            next_cursor = "v1:" .. collection .. ":" .. last.id .. ":" .. last.thread_id
        end
        return { rows = rows, count = #rows, has_more = more, cursor = next_cursor }, nil
    end
    return M
end
local default = new()
default.new = new
return default

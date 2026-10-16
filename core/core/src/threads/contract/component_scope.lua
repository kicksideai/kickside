-- The trusted component-to-thread read used by cross-owner listings. Access is
-- resolved through the component service; only Core reads the thread mapping.
local sql = require("sql")
local sql_boundary = require("sql_boundary")
local error_envelope = require("error_envelope")

local component = require("component")
local core_types = require("core_types")
local common = require("contract_common")
local open_db = common.open_db

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local component = deps.component or component

local M = {}
local MAX_SCOPE = 5000
local PAGE = 100

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "readable thread scope returns no valid " .. field .. " proof",
        details = {code = "readable_thread_scope_response", field = field}})
end

local function release(db: sql.DB, primary: error?): error?
    return error_envelope.cleanup(function(): (any, error?)
        local released, err = db:release()
        if not err and released ~= true then err = response_error("release") end
        return released, err
    end, primary, "readable thread mapping release failed")
end

-- readable_threads({limit?,offset?}) returns only the thread ids whose backing
-- components the current actor can READ. Jobs receives this typed result and
-- never reads kickside_thread itself.
function M.readable_threads(args: table?): (table?, error?)
    local limit = args and tonumber(args.limit) or MAX_SCOPE
    if not limit or limit < 1 or limit > MAX_SCOPE or limit ~= math.floor(limit) then
        return nil, (errors.new({ message = "thread scope limit must be an integer in [1, 5000]",
            kind = errors.INVALID, retryable = false, details = {code = "readable_thread_scope_invalid"} }) :: error)
    end
    local offset = args and args.offset or 0
    if type(offset) ~= "number" or offset < 0 or offset ~= math.floor(offset) then
        return nil, (errors.new({ message = "thread scope offset must be a nonnegative integer", kind = errors.INVALID, retryable = false, details = {code = "readable_thread_scope_invalid"} }) :: error)
    end
    local component_ids, access_err, _, page = component.list_thread_components(nil,
        (core_types.ACCESS.READ :: integer), limit :: integer, offset :: integer)
    if access_err then return nil, access_err end
    if type(component_ids) ~= "table" or type(page) ~= "table" or type(page.has_more) ~= "boolean"
        or type(page.next_offset) ~= "number" or page.next_offset < offset
        or (page.has_more and page.next_offset <= offset) then
        return nil, response_error("page verdict")
    end
    if #component_ids == 0 then
        return { thread_ids = {}, count = 0, has_more = page.has_more, next_offset = page.next_offset }, nil
    end

    local db, db_err = open_db()
    db, db_err = error_envelope.binding(db, db_err, "release", "open readable thread mapping", "readable_thread_scope_response")
    if db_err then return nil, db_err end
    local thread_ids: { string } = {}
    local seen: { [string]: boolean } = {}
    for first = 1, #component_ids, PAGE do
        local last = math.min(#component_ids, first + PAGE - 1)
        local chunk: { string } = {}
        local marks: { string } = {}
        for index = first, last do
            chunk[#chunk + 1] = component_ids[index]
            marks[#marks + 1] = "?"
        end
        local rows, read_err = sql.builder.select("id")
            :from("kickside_thread")
            :where(sql.builder.expr("component_id IN (" .. table.concat(marks, ",") .. ")", table.unpack(chunk)))
            :order_by("id ASC")
            :run_with(db :: sql.DB):query()
        rows, read_err = sql_boundary.rows(rows, read_err, "readable thread mapping failed", "mapping rows", response_error)
        if read_err then return nil, release(db :: sql.DB, read_err) end
        for _, row in ipairs(rows :: table[]) do
            if type(row.id) ~= "string" or row.id == "" then
                return nil, release(db :: sql.DB, response_error("mapping row id"))
            end
            local id = row.id :: string
            if id ~= "" and not seen[id] then
                thread_ids[#thread_ids + 1] = id
                seen[id] = true
            end
        end
    end
    local release_err = release(db :: sql.DB, nil)
    if release_err then return nil, release_err end
    table.sort(thread_ids)
    return { thread_ids = thread_ids, count = #thread_ids, has_more = page.has_more, next_offset = page.next_offset }, nil
end

return M
end
local default = new()
default.new = new
return default

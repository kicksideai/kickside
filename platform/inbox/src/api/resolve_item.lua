-- POST /inbox/{id}/{action} — resolve a pending item. action ∈ approve | reject
-- | dismiss. The canonical item-type declaration supplies allowed actions and
-- callbacks; the terminal event is appended only after synchronous callback success.

local http = require("http")
local json = require("json")
local security = require("security")
local http_errors = require("http_errors")
local resolve = require("inbox_resolve")
local inbox_files = require("inbox_files")

local M = { _modules = {} }

local function mod(name)
    if type(M._modules) == "table" and M._modules[name] ~= nil then return M._modules[name] end
    if name == "http" then return http end
    if name == "json" then return json end
    if name == "security" then return security end
    if name == "resolve" then return resolve end
    return nil
end

local function handler()
    local h = mod("http")
    local res = h.response()
    local req = h.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(h.CONTENT.JSON)

    if not (mod("security") :: any).actor() then
        res:set_status(h.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local id = req:param("id")
    local action = req:param("action")
    if not id or id == "" or type(action) ~= "string" then
        res:set_status(h.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "id and action are required" })
        return
    end

    -- The body is optional; form values accompany the declared action through
    -- validation, the idempotent callback, and the terminal event.
    local form: { [string]: any }? = nil
    local raw = req:body()
    if type(raw) == "string" and raw ~= "" then
        local decoded, derr = (mod("json") :: any).decode(raw)
        if not derr and type(decoded) == "table" and type((decoded :: any).form) == "table" then
            form = (decoded :: any).form :: { [string]: any }
        end
    end

    local data, err = (mod("resolve") :: any).apply(id, action, form)
    if err then
        if type(err) == "table" and (err :: any).callback_refusal == true then
            res:set_status(h.STATUS.BAD_REQUEST)
            res:write_json({ success = false, code = (err :: any).code, message = (err :: any).message, error = (err :: any).message })
            return
        end
        local status = http_errors.classify(err)
        res:set_status(status)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    local visible_files, files_err = inbox_files.list(data.files)
    if files_err then
        res:set_status(http_errors.classify(files_err))
        res:write_json({ success = false, error = tostring(files_err) })
        return
    end
    data.files = visible_files
    res:set_status(h.STATUS.OK)
    res:write_json({ success = true, item = data })
end

M.handler = handler
return M

local funcs = require("funcs")
local http = require("http")
local json = require("json")
local registry = require("registry")
local security = require("security")

local M = {}

M._funcs = nil
M._http = nil
M._json = nil
M._registry = nil
M._security = nil

local DESCRIPTOR_TYPE = "kickside.hub.required_setup"
local DESCRIPTOR_VERSION = "1"

local function entry_namespace(id: any): string?
    if type(id) ~= "string" then return nil end
    return id:match("^([%w_.%-]+):[%w_.%-]+$")
end

local function response(res: any, status: number, body: any): ()
    res:set_status(status)
    res:write_json(body)
end

function M.resolve_descriptor(id: any, registry_mod: any?): (any?, any?)
    local namespace = entry_namespace(id)
    if not namespace then
        return nil, { code = "INVALID_SETUP_DESCRIPTOR", error = "required setup descriptor id is invalid" }
    end

    local source = registry_mod or M._registry or registry
    local entry, get_err = source.get(id)
    if get_err or type(entry) ~= "table" then
        return nil, {
            code = "SETUP_DESCRIPTOR_NOT_FOUND",
            error = "required setup descriptor is not available",
            details = { descriptor = id, reason = tostring(get_err or "not found") },
        }
    end

    local data = entry.data
    local meta = type(entry.meta) == "table" and entry.meta or {}
    if type(data) ~= "table" or entry.kind ~= "registry.entry" or meta.type ~= DESCRIPTOR_TYPE or
        tostring(meta.version or "") ~= DESCRIPTOR_VERSION then
        return nil, {
            code = "INVALID_SETUP_DESCRIPTOR",
            error = "required setup descriptor has an unsupported type or version",
            details = { descriptor = id },
        }
    end

    local contract = tostring(data.contract or "")
    local status_func = tostring(data.status_func or "")
    local apply_func = tostring(data.apply_func or "")
    if contract == "" or entry_namespace(status_func) ~= namespace or entry_namespace(apply_func) ~= namespace then
        return nil, {
            code = "INVALID_SETUP_DESCRIPTOR",
            error = "required setup descriptor functions must share its namespace",
            details = { descriptor = id },
        }
    end

    return {
        id = id,
        contract = contract,
        status_func = status_func,
        apply_func = apply_func,
        title = tostring(meta.title or "Required setup"),
        pending_label = tostring(meta.pending_label or "Running required setup"),
        ready_label = tostring(meta.ready_label or "Setup ready"),
    }, nil
end

function M.invoke(id: any, action: string, dependencies: any?): (any?, any?)
    if action ~= "status" and action ~= "apply" then
        return nil, { code = "INVALID_SETUP_ACTION", error = "required setup action is invalid" }
    end
    local deps = dependencies or {}
    local descriptor, descriptor_err = M.resolve_descriptor(id, deps.registry)
    if not descriptor then return nil, descriptor_err end

    local target = action == "apply" and descriptor.apply_func or descriptor.status_func
    local caller = deps.funcs or M._funcs or funcs
    local result, call_err = caller.call(target, {
        descriptor_id = descriptor.id,
        contract = descriptor.contract,
    })
    if call_err or type(result) ~= "table" then
        return nil, {
            code = action == "apply" and "SETUP_FAILED" or "SETUP_STATUS_UNAVAILABLE",
            error = action == "apply" and "required setup failed" or "required setup status is unavailable",
            details = { descriptor = descriptor.id, reason = tostring(call_err or "invalid result") },
        }
    end
    if tostring(result.contract or "") ~= descriptor.contract then
        return nil, {
            code = "SETUP_CONTRACT_MISMATCH",
            error = "required setup returned the wrong contract",
            details = { descriptor = descriptor.id },
        }
    end

    local out = result :: { [string]: any }
    out.descriptor = descriptor.id
    out.title = descriptor.title
    out.pending_label = descriptor.pending_label
    out.ready_label = descriptor.ready_label
    if out.success == false then
        return nil, {
            code = tostring(out.code or "SETUP_FAILED"),
            error = tostring(out.error or out.detail or "required setup failed"),
            details = out,
        }
    end
    out.success = true
    return out, nil
end

local function handler(action: string): (nil?, string?)
    local http_mod = M._http or http
    local json_mod = M._json or json
    local security_mod = M._security or security
    local req, res = http_mod.request(), http_mod.response()
    if not req or not res then return nil, "HTTP context unavailable" end
    res:set_content_type(http_mod.CONTENT.JSON)

    if not security_mod.actor() then
        response(res, http_mod.STATUS.UNAUTHORIZED, {
            success = false, code = "UNAUTHORIZED", error = "authentication required",
        })
        return
    end

    local descriptor_id = nil
    if action == "status" then
        descriptor_id = req:query("descriptor")
    else
        local raw, read_err = req:body()
        if read_err then
            response(res, http_mod.STATUS.BAD_REQUEST, {
                success = false, code = "INVALID_REQUEST", error = tostring(read_err),
            })
            return
        end
        local body, decode_err = json_mod.decode(raw)
        if decode_err or type(body) ~= "table" then
            response(res, http_mod.STATUS.BAD_REQUEST, {
                success = false, code = "INVALID_REQUEST", error = "invalid JSON body",
            })
            return
        end
        descriptor_id = body.descriptor
    end

    local result, invoke_err = M.invoke(descriptor_id, action)
    if not result then
        local failure = invoke_err or { code = "SETUP_FAILED", error = "required setup failed" }
        local status = failure.code == "SETUP_DESCRIPTOR_NOT_FOUND" and http_mod.STATUS.NOT_FOUND or
            failure.code == "INVALID_SETUP_DESCRIPTOR" and http_mod.STATUS.BAD_REQUEST or
            http_mod.STATUS.INTERNAL_ERROR
        response(res, status, {
            success = false,
            code = failure.code,
            error = failure.error,
            details = failure.details,
        })
        return
    end

    response(res, http_mod.STATUS.OK, result)
end

function M.status(): (nil?, string?) return handler("status") end
function M.apply(): (nil?, string?) return handler("apply") end

return M

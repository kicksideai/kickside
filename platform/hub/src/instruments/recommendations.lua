local http = require("http")
local json = require("json")
local security = require("security")
local agent_invoke = require("agent_invoke")

local M = {}

local RECOMMENDER_ID = "kickside.hub.instruments:recommender"
local ADMIN_GATE = "kickside.ui:system_onboarding"
local MAX_NEED = 1200
local MAX_CANDIDATES = 60
local MAX_COMPONENT = 200
local MAX_TITLE = 100
local MAX_DESCRIPTION = 240
local MAX_KEYWORDS = 8
local MAX_KEYWORD = 48
local MAX_CONFIGURED_COMPONENTS = 80
local MAX_VERSION = 48
local MAX_RECOMMENDATIONS = 5

M._http = nil
M._json = nil
M._security = nil
M._agent_invoke = nil

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function bounded(value: any, max_length: integer): string
    local text = trim(value)
    if #text <= max_length then return text end
    return text:sub(1, max_length)
end

local function valid_component(value: any): boolean
    local component = trim(value)
    return component ~= ""
        and #component <= MAX_COMPONENT
        and component:match("^[%w][%w%._%-]*/[%w][%w%._%-]*$") ~= nil
end

local function normalize_keywords(value: any): { string }
    local out: { string } = {}
    if type(value) ~= "table" then return out end
    for _, raw in ipairs(value :: { any }) do
        local keyword = bounded(raw, MAX_KEYWORD)
        if keyword ~= "" then
            out[#out + 1] = keyword
            if #out >= MAX_KEYWORDS then break end
        end
    end
    return out
end

local function normalize_candidates(value: any): { any }
    local out: { any } = {}
    local seen: { [string]: boolean } = {}
    if type(value) ~= "table" then return out end
    for _, raw in ipairs(value :: { any }) do
        if type(raw) == "table" then
            local row = raw :: { [string]: any }
            local component = trim(row.component)
            if valid_component(component) and not seen[component] then
                seen[component] = true
                out[#out + 1] = {
                    component = component,
                    title = bounded(row.title, MAX_TITLE),
                    description = bounded(row.description, MAX_DESCRIPTION),
                    keywords = normalize_keywords(row.keywords),
                }
                if #out >= MAX_CANDIDATES then break end
            end
        end
    end
    return out
end

local function normalize_configured_components(value: any): { any }
    local out: { any } = {}
    local seen: { [string]: boolean } = {}
    if type(value) ~= "table" then return out end
    for _, raw in ipairs(value :: { any }) do
        if type(raw) == "table" then
            local row = raw :: { [string]: any }
            local component = trim(row.component)
            local relationship = trim(row.relationship)
            if valid_component(component)
                and not seen[component]
                and (relationship == "root" or relationship == "transitive") then
                seen[component] = true
                local title = bounded(row.title, MAX_TITLE)
                local version = bounded(row.version, MAX_VERSION)
                local normalized: { [string]: any } = {
                    component = component,
                    relationship = relationship,
                }
                if title ~= "" then normalized.title = title end
                if version ~= "" then normalized.version = version end
                out[#out + 1] = normalized
                if #out >= MAX_CONFIGURED_COMPONENTS then break end
            end
        end
    end
    return out
end

function M.normalize_request(value: any): (any?, string?)
    if type(value) ~= "table" then return nil, "JSON object body is required" end
    local body = value :: { [string]: any }
    local need = bounded(body.need, MAX_NEED)
    if need == "" then return nil, "need is required" end
    local candidates = normalize_candidates(body.candidates)
    if #candidates == 0 then return nil, "at least one valid candidate is required" end
    local workspace = type(body.workspace_context) == "table" and body.workspace_context or {}
    return {
        need = need,
        candidates = candidates,
        workspace_context = {
            configured_components = normalize_configured_components((workspace :: any).configured_components),
        },
    }, nil
end

function M.intersect_ids(value: any, candidates: { any }): { string }
    local allowed: { [string]: boolean } = {}
    for _, candidate in ipairs(candidates or {}) do
        if type(candidate) == "table" and type((candidate :: any).component) == "string" then
            allowed[(candidate :: any).component] = true
        end
    end
    local out: { string } = {}
    local seen: { [string]: boolean } = {}
    if type(value) ~= "table" then return out end
    for _, raw in ipairs(value :: { any }) do
        if type(raw) == "string" and allowed[raw] and not seen[raw] then
            seen[raw] = true
            out[#out + 1] = raw
            if #out >= MAX_RECOMMENDATIONS then break end
        end
    end
    return out
end

local function failure(kind: string, code: string, message: string): any
    return { kind = kind, code = code, message = message }
end

function M.recommend(value: any, deps: any?): (any?, any?)
    local request, request_err = M.normalize_request(value)
    if not request then
        return nil, failure("invalid", "BAD_REQUEST", tostring(request_err))
    end

    local json_mod = (deps and deps.json) or M._json or json
    local invoke_mod = (deps and deps.agent_invoke) or M._agent_invoke or agent_invoke
    local prompt_content, encode_err = json_mod.encode(request)
    if encode_err or type(prompt_content) ~= "string" then
        return nil, failure("error", "REQUEST_ENCODING_FAILED", "recommendation request could not be encoded")
    end

    local result, invoke_err = invoke_mod.invoke({
        config = {
            agent_id = RECOMMENDER_ID,
            max_iterations = 1,
        },
        input = { content = prompt_content },
        metadata = { surface = "system_onboarding" },
    })
    if invoke_err or type(result) ~= "table" then
        return nil, failure("unavailable", "RECOMMENDER_UNAVAILABLE", "module recommendations are temporarily unavailable")
    end

    local content = trim((result :: any).content)
    if content:sub(1, 1) ~= "[" or content:sub(-1) ~= "]" then
        return nil, failure("error", "INVALID_RECOMMENDER_RESPONSE", "module recommender returned an invalid response")
    end
    local decoded, decode_err = json_mod.decode(content)
    if decode_err or type(decoded) ~= "table" then
        return nil, failure("error", "INVALID_RECOMMENDER_RESPONSE", "module recommender returned invalid JSON")
    end

    return {
        success = true,
        available = true,
        component_ids = M.intersect_ids(decoded, request.candidates),
    }, nil
end

local function write_response(res: any, status: number, body: any): ()
    res:set_status(status)
    res:write_json(body)
end

function M.handler(): (nil?, string?)
    local http_mod = M._http or http
    local security_mod = M._security or security
    local req = http_mod.request()
    local res = http_mod.response()
    if not req or not res then return nil, "HTTP context unavailable" end
    res:set_content_type(http_mod.CONTENT.JSON)
    res:set_header("Cache-Control", "no-store")

    if not security_mod.actor() then
        write_response(res, http_mod.STATUS.UNAUTHORIZED, {
            success = false,
            code = "UNAUTHORIZED",
            error = "authentication required",
        })
        return nil
    end
    if security_mod.can("access", ADMIN_GATE) ~= true then
        write_response(res, http_mod.STATUS.FORBIDDEN, {
            success = false,
            code = "FORBIDDEN",
            error = "administrator access required",
        })
        return nil
    end

    local body, body_err = req:body_json()
    if body_err or type(body) ~= "table" then
        write_response(res, http_mod.STATUS.BAD_REQUEST, {
            success = false,
            code = "BAD_REQUEST",
            error = "valid JSON object body is required",
        })
        return nil
    end

    local result, err = M.recommend(body)
    if result then
        write_response(res, http_mod.STATUS.OK, result)
        return nil
    end

    local detail = type(err) == "table" and err or failure("error", "RECOMMENDATION_FAILED", "module recommendation failed")
    local status = http_mod.STATUS.INTERNAL_ERROR
    if detail.kind == "invalid" then status = http_mod.STATUS.BAD_REQUEST end
    if detail.kind == "unavailable" then status = http_mod.STATUS.SERVICE_UNAVAILABLE end
    write_response(res, status, {
        success = false,
        available = detail.kind ~= "unavailable",
        code = detail.code,
        error = detail.message,
        component_ids = {},
    })
    return nil
end

return M

local contract = require("contract")
local policy = require("policy")

local function construct(dependencies: any?): any
local deps = dependencies or {}
local contract = deps.contract or contract
local policy = deps.policy or policy
local M = {}
local function failure(kind: string, code: string, message: string): error
    return errors.new({kind = kind, retryable = kind == errors.UNAVAILABLE,
        message = message, details = {code = code}})
end

function M.notify(args: any): (any?, error?)
    if type(args) ~= "table" or type(args.user_ids) ~= "table" or #args.user_ids == 0 or #args.user_ids > 128 then
        return nil, failure(errors.INVALID, "realtime_batch_invalid", "audience requires one to 128 users")
    end
    if type(args.topic) ~= "string" or args.topic == "" then
        return nil, failure(errors.INVALID, "realtime_topic_required", "topic is required")
    end
    local audience: {string} = {}
    local seen: {[string]: boolean} = {}
    for _, user_id in ipairs(args.user_ids) do
        if type(user_id) ~= "string" or user_id == "" then
            return nil, failure(errors.INVALID, "realtime_batch_user_invalid", "batch user ID is required")
        end
        if not policy.can_notify(user_id) then
            return nil, failure(errors.PERMISSION_DENIED, "realtime_batch_denied", "batch audience is denied")
        end
        if not seen[user_id] then audience[#audience + 1] = user_id; seen[user_id] = true end
    end
    local definition, get_err = contract.get("kickside.contract:realtime")
    if get_err and not errors.is(get_err, errors.NOT_FOUND) then return nil, get_err end
    if not definition then return {success = true, status = "not_supported", notified = 0}, nil end
    local owner, open_err = definition:open()
    if open_err and not errors.is(open_err, errors.NOT_FOUND) then return nil, open_err end
    if not owner then return {success = true, status = "not_supported", notified = 0}, nil end
    local pending: {any} = {}
    local first_err: error? = nil
    for _, user_id in ipairs(audience) do
        local future, call_err = owner:notify_async({user_id = user_id, topic = args.topic, data = args.data or {}})
        if call_err then first_err = call_err; break end
        pending[#pending + 1] = future
    end
    for _, future in ipairs(pending) do
        local _, received = future:response():receive()
        local payload, result_err = future:result()
        local result = payload and payload:data()
        if first_err == nil then
            if result_err then first_err = result_err
            elseif not received then first_err = failure(errors.UNAVAILABLE, "realtime_response_closed", "realtime response closes before delivery")
            elseif type(result) ~= "table" or result.success ~= true then
                first_err = failure(errors.PERMISSION_DENIED, "realtime_notification_refused", "realtime owner refuses notification")
            end
        end
    end
    if first_err then return nil, first_err end
    return {success = true, notified = #audience}, nil
end
return M
end

local M = construct()
M.new = construct
return M

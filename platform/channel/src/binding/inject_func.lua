local contract = require("contract")
local security = require("security")
local uuid = require("uuid")
local component = require("component")

-- kickside.channel:inject -- trigger a system ambient message into a designated
-- thread (DM or channel) so its agent reacts. A thread is self-describing: its
-- attrs carry the provider, reply route, owner, and the surface's own inbound
-- contract (receive_target), so this synthesizes the inbound a real message would
-- have and RE-DISPATCHES it through the thread's declared receive seam. That reuses
-- agent resolution, run-as identity, the session mapping, the Route, and the hub's
-- reuse-or-wake of the live session -- no duplicated routing, and no engine branch
-- on the surface. The message reaches the agent as a USER turn framed by `author`
-- (default "System"), so a burst coalesces via the bridge's batching and the reply
-- (if any) goes back out the same channel.
local M = {}

local THREADS_CONTRACT = "kickside.core:threads"

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- inject(args) -> the surface receive result. args: { thread_id, text, author? }.
-- Runs under the caller's frame; the caller must have access to the thread (its
-- owner or a system tier), as threads:find is access-gated.
function M.inject(args: any): any
    args = type(args) == "table" and args or {}
    local thread_id = trim(args.thread_id)
    local text = type(args.text) == "string" and args.text or ""
    if thread_id == "" then return { accepted = false, status = "error", error = "thread_id is required" } end
    if trim(text) == "" then return { accepted = false, status = "error", error = "text is required" } end
    local author = trim(args.author) ~= "" and trim(args.author) or "System"
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return { accepted = false, status = "error", error = "authenticated channel injection is required" }
    end

    local def, gerr = contract.get(THREADS_CONTRACT)
    if gerr or not def then return { accepted = false, status = "error", error = "threads contract unavailable: " .. tostring(gerr) } end
    local inst, oerr = (def :: any):with_actor(actor):with_scope(scope):open()
    if oerr or not inst then return { accepted = false, status = "error", error = "threads open failed: " .. tostring(oerr) } end
    local thread, ferr = inst:find({ thread_id = thread_id })
    if ferr then return { accepted = false, status = "error", error = "thread lookup failed: " .. tostring(ferr) } end
    if not thread then return { accepted = false, status = "error", error = "thread not found or not accessible" } end
    local _, access_err = component.validate_access(thread_id, component.ACCESS.WRITE)
    if access_err then return { accepted = false, status = "error", error = tostring(access_err) } end

    local attrs: any = type((thread :: any).attrs) == "table" and (thread :: any).attrs or {}
    local receive_target = trim(attrs.receive_target)
    local provider = trim(attrs.provider)
    local reply_component_id = trim(attrs.reply_component_id)
    local channel_id = trim(attrs.channel_id)
    if receive_target == "" or provider == "" or reply_component_id == "" or channel_id == "" then
        return { accepted = false, status = "error", error = "thread is not a routable conversation" }
    end

    local msg_id = uuid.v4()
    local inbound = {
        provider = provider,
        reply_component_id = reply_component_id,
        reply_resource_id = trim(attrs.reply_resource_id),
        channel_id = channel_id,
        external_user_id = trim(attrs.external_user_id),
        external_username = author,
        external_display_name = author,
        external_message_id = "sys:" .. msg_id,
        text = text,
        attachments = {},
    }

    local rdef, rgerr = contract.get(receive_target)
    if rgerr or not rdef then return { accepted = false, status = "error", error = "receive contract unavailable: " .. tostring(rgerr) } end
    local rinst, roerr = (rdef :: any):with_actor(actor):with_scope(scope):open()
    if roerr or not rinst then return { accepted = false, status = "error", error = "receive open failed: " .. tostring(roerr) } end
    return rinst:receive(inbound)
end

return M

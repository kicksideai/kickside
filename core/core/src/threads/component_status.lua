-- get_status for a thread-backed component (kickside.contract:component). A thread IS
-- its component; provisioned singletons (inbox, uploads, system lifecycle) bind this so
-- the component service can report what they are without each module shipping its own
-- status func. The component meta rides the request context; class/title describe the
-- thread.
local ctx = require("ctx")
local time = require("time")

local function get_status(request_dto: any): any
    local context = (type(request_dto) == "table" and request_dto.context) or ctx.get("meta") or {}
    local title = context.title or context.name
    local class = context.class or context.thread_class or "thread"
    return {
        success = true,
        description = title and (tostring(class) .. ": " .. tostring(title)) or tostring(class),
        updated_at = time.now():utc():format(time.RFC3339),
    }
end

return { get_status = get_status }

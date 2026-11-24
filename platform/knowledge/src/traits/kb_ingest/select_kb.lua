local component = require("component")
local kb_access = require("kb_access")

local function handle(args)
    args = args or {}
    if not args.kb_id or args.kb_id == "" then
        return nil, errors.new({ message = "kb_id is required", kind = errors.INVALID })
    end

    local _, kb_err = kb_access.get(args.kb_id, component.ACCESS.WRITE,
        errors.new({ kind = errors.PERMISSION_DENIED, message = "cannot access KB" }))
    if kb_err then return nil, kb_err end

    local _, err = component.open(
        args.kb_id, component.ACCESS.WRITE, "kickside.contract:embeddable"
    )
    if err then
        return nil, errors.new({ message = tostring("cannot access KB: " .. tostring(err)), kind = errors.PERMISSION_DENIED })
    end

    return {
        success = true,
        kb_id = args.kb_id,
        message = "KB selected as active target",
        _control = {
            context = {
                session = {
                    set = { kb_id = args.kb_id }
                }
            }
        }
    }
end

return { handle = handle }

local component = require("component")

local function handle(args)
    args = args or {}
    if not args.kb_id or args.kb_id == "" then
        return nil, errors.new({ message = "kb_id is required", kind = errors.INVALID })
    end

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

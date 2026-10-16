local M = {}

-- run receives the strategy call shape: {item = {item_key, envelope, input}, config}.
function M.run(args)
    if args.config.scalar then return "scalar" end
    return {
        content = args.item.input.title,
        content_type = args.config.content_type,
    }
end

return M

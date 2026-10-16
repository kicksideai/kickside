local trigger_reconcile = require("trigger_reconcile")

-- Requests one projection pass through the shared client in the caller's frame.
local function run(args: { slug: string }): (any?, string?)
    return trigger_reconcile.trigger({ slug = args.slug })
end

return { run = run }

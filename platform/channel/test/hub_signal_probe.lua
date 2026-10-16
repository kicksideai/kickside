local receive = require("receive")

-- Hands one hub message to the session hub through the ingress seam in the
-- caller's frame.
local function run(args: { key: string }): (boolean, string?)
    return receive.send_hub({ kind = "clear", key = args.key })
end

return { run = run }

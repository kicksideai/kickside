local notifier = require("retention_notifier")

local function run(change: table): (boolean?, error?)
    return notifier.notify(change)
end

return { run = run }

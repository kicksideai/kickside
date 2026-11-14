-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local process = require("process")
local channel = require("channel")
local time = require("time")
local models_cache = require("models_cache")
local profile_reload = require("profile_reload")

local function run(args)
        local resume = process.listen("models.cache.resume")
        local replace = models_cache.replace
        models_cache.replace = function(snapshot)
            process.send(args.parent, "models.cache.probe", { event = "paused", resume_pid = tostring(process.pid()) })
            local timeout = time.after("5s")
            local selected = channel.select({ resume:case_receive(), timeout:case_receive() })
            if selected.channel ~= resume then error("older reload was never resumed") end
            replace(snapshot)
        end
        local ok, result = pcall(profile_reload.run)
        models_cache.replace = replace
        process.unlisten(resume)
        if not ok then error(result, 0) end
        if result.error then error(result.error, 0) end
end

return { run = run }

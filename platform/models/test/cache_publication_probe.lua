-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local process = require("process")
local channel = require("channel")
local time = require("time")
local models_repo = require("models_repo")
local models_cache = require("models_cache")

local function run(args)
    if args.action == "older" then
        local resume = process.listen("models.cache.resume")
        local replace = models_cache.replace
        models_cache.replace = function(snapshot)
            process.send(args.parent, "models.cache.probe", { event = "paused" })
            local timeout = time.after("5s")
            local selected = channel.select({ resume:case_receive(), timeout:case_receive() })
            if selected.channel ~= resume then error("older reload was never resumed") end
            replace(snapshot)
        end
        local _, err = models_repo.reload()
        process.unlisten(resume)
        if err then error(err) end
    else
        process.send(args.parent, "models.cache.probe", { event = "started" })
        local _, err
        if args.action == "status" then
            _, err = models_repo.set_profile_status(args.profile, "unhealthy", "newer status")
        else
            _, err = models_repo.delete_card(args.card)
        end
        if err then error(err) end
    end
    process.send(args.parent, "models.cache.probe", { event = args.action .. "_done" })
end

return { run = run }

-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local process = require("process")
local channel = require("channel")
local time = require("time")
local models_repo = require("models_repo")
local funcs = require("funcs")

local function run(args)
    if args.action == "older" then
        local _, err = funcs.call("app:cache_publication_reload", args)
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

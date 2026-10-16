local models_repo = require("models_repo")

-- Announces one profile change in the caller's frame.
local function run(args: { profile_id: string, provider_id: string }): (boolean, error?)
    return models_repo.emit_profile_changed(args.profile_id, args.provider_id, nil)
end

return { run = run }

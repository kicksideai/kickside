local access_ops = require("access_ops")
local user_repo_support = require("user_repo_support")

return require("migration").define(function()
    migration("10 canonical email grants", function()
        local function canonicalize(db)
            local _, err = access_ops.canonicalize_email_grants(db, function(subject_id)
                local user, lookup_err = user_repo_support.find_user(db, subject_id, subject_id:lower(), {"user_id"})
                if lookup_err then return nil, lookup_err end
                return user and user.user_id or nil, nil
            end)
            if err then error(tostring(err)) end
        end
        database("postgres", function() up(canonicalize) end)
        database("sqlite", function() up(canonicalize) end)
    end)
end)

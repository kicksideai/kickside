local fixture = require("fixture")
return {get = function()
    return {
        query = function()
            if fixture.stage == "worker_read" then return nil, fixture.source end
            return {{impl_id = "fixture:implementation", private_context = "{}", deleting_at = "marked", delete_intent = "{}"}}, nil
        end,
        release = function() return true end,
    }, nil
end}

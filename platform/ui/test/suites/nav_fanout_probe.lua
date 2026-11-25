local nav_providers = require("nav_providers")

-- Native futures close their response channel after delivering the result.
-- Run the collector in a separate invocation so a spinning select loop cannot
-- prevent the test's independent deadline from reporting the regression.
local function run(args)
    local cancelled = { fast = false, other = false }
    local port = {
        bindings = function()
            return { { id = "fast", priority = 100 }, { id = "other", priority = 0 } }, nil
        end,
        start = function(id)
            local response = channel.new(1)
            if id == "fast" and args.mode == "closed" then
                response:close()
            elseif id ~= "other" or args.mode ~= "pending" then
                response:send({ data = function()
                    return { items = { { id = id, title = id, path = "/" .. id, route_name = id } } }, nil
                end })
                response:close()
            end
            return {
                response = function() return response end,
                cancel = function()
                    cancelled[id] = true
                    return true, nil
                end,
            }, nil
        end,
    }
    local collected, err = nav_providers.collect(port, {})
    return {
        collected = collected,
        code = err and err:details().code or nil,
        cancelled = cancelled,
    }
end

return { run = run }

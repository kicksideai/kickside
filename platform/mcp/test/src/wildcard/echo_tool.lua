-- Harness handler shared by the app.wildcard entries; echoes its args back so the
-- suite can prove a wildcard-expanded tool is callable through the dispatcher.
local function handler(args)
    return { ok = true, echoed = args or {} }
end

return { handler = handler }

local http = require("http")

local function respond(body)
    local res = http.response()
    res:set_status(http.STATUS.OK)
    res:set_content_type("text/plain; charset=utf-8")
    res:write(body)
end

local function robots()
    respond("User-agent: *\nAllow: /\nDisallow: /api/\n")
end

local function llms()
    respond("# KickSide\n\nKickSide is a workspace for building and operating AI-powered applications.\n\n## Access\n\n- [Application](/)\n- [Sign in](/login)\n")
end

return { robots = robots, llms = llms }

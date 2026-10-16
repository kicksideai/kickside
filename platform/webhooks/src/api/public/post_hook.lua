-- The single public webhook endpoint: POST /api/public/hooks/{id}. Mounted on the
-- unauthenticated public router on purpose -- the ingress logic enforces the secret
-- itself. This is a thin transport shell: read the id, secret, and body, then defer
-- to webhook_ingress.process, which returns the status + JSON body.

local http = require("http")
local json = require("json")
local ingress = require("webhook_ingress")
local consts = require("webhook_consts")

local function read_secret(req: any): string?
    local header = req:header(consts.SECRET_HEADER)
    if type(header) == "string" and header ~= "" then return header end
    local auth = req:header("Authorization")
    if type(auth) == "string" and auth:lower():sub(1, 7) == "bearer " then
        local raw = auth:sub(8):gsub("^%s+", ""):gsub("%s+$", "")
        if raw ~= "" then return raw :: string end
    end
    return nil
end

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local webhook_id = req:param("id")
    local secret = read_secret(req)

    local payload: any = nil
    local raw = req:body()
    if type(raw) == "string" and raw ~= "" then
        local decoded, derr = json.decode(raw)
        if not derr then payload = decoded end
    end

    local status, body = ingress.process(webhook_id, secret, payload, nil, req:header("Idempotency-Key"))
    res:set_status(status)
    res:write_json(body)
end

return { handler = handler }

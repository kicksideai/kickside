local http_client = require("http_client")
local json = require("json")
local time = require("time")

local function request(url: string): (any?, any?)
    local response, err = http_client.get(url, {})
    if err then return nil, err end
    if not response or response.status_code ~= 200 then return nil, "work barrier HTTP failure" end
    return json.decode(response.body)
end

local function wait(url: string, key: string): (boolean?, any?)
    local entered, enter_err = request(url .. "/enter/" .. key)
    if enter_err then return nil, enter_err end
    local deadline = time.now():add("300s")
    while time.now():before(deadline) do
        local state, state_err = request(url .. "/state/" .. key)
        if state_err then return nil, state_err end
        if state.released then
            local effect, effect_err = request(url .. "/effect/" .. key)
            if effect_err then return nil, effect_err end
            return effect.completed, nil
        end
        time.after("100ms"):receive()
    end
    return nil, "work barrier release times out"
end

local function upload(params: any): (any?, any?)
    local ok, err = wait(params.options.url, "upload")
    if err or not ok then return nil, err or "upload work does not complete" end
    return { success = true, metadata = { hot_update_receipt = params.upload_id } }, nil
end

local function transform(params: any): (any?, any?)
    local ok, err = wait(params.config.url, "automation")
    if err or not ok then return nil, err or "automation work does not complete" end
    return { title = params.config.title, content = "One completed automation effect" }, nil
end

return { upload = upload, transform = transform }

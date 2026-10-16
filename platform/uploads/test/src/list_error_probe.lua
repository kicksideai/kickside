local api = require("api")
local http = require("http")
local model = require("model")
local function run(): any
    http.reset()
    model.list_called = false
    api.list_handler()
    return { status = http.status, body = http.body, list_called = model.list_called }
end
return { run = run }

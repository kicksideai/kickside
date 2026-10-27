local api = require("api")
local http = require("http")
return {run = function()
    http.reset()
    api.list_handler()
    return {status = http.status, body = http.body}
end}

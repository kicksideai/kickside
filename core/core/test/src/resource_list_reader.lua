local fixture = require("fixture")
return {list = function(...)
    local value, err = fixture.read(...)
    if err or not value then return nil, err end
    if fixture.stage == "empty" then return {}, nil end
    return {{id = value.thread_id, thread_class = value.thread_class}}, nil
end}

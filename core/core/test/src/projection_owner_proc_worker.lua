local security = require("security")
return {run = function(input)
    input.projection.body.ran_as = assert(security.actor()):id()
    if input.events and #input.events > 0 then
        input.projection.body.last_type = input.events[#input.events].type
    end
    return {body = input.projection.body, last_seq = input.range.to_seq}
end}

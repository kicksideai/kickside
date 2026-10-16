local json = require("json")
return {
    decode_registration = function(raw: string): (any?, any?) return json.decode(raw) end,
    register = function(_args: any): (any?, any?)
        return nil, errors.new({ message = "registration database unavailable", kind = errors.UNAVAILABLE, retryable = true })
    end,
}

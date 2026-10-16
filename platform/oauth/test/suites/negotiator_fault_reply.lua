local faults = require("faults")

-- Callback answer seam over the negotiation fault fixture.
return {
    send = function(reply_to: string, response: any): (boolean?, error?)
        return faults.send(reply_to, "oauth_callback_response", response)
    end,
}

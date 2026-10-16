local M = {}
function M.reset(reply: boolean?, source: error?): () M.reply, M.source, M.sends = reply, source, 0 end
function M.send(destination: string, topic: string, payload: table): (boolean?, error?)
    M.sends = M.sends + 1; M.destination, M.topic, M.payload = destination, topic, payload
    return M.reply, M.source
end
return M

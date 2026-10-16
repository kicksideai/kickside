-- Stub reply_provider binding handlers (discord) for the harness. Stands in for
-- the discord plugin so the reply_providers registry suite can create/find/
-- delete a reply provider and bind it to a thread.

local M = {}

type SendReplyResult = { ok: boolean }

function M.send_reply(args: any): (SendReplyResult, nil)
    return { ok = true }, nil
end

function M.update_reply(args: any): (SendReplyResult, nil)
    return { ok = true }, nil
end

function M.send_status(args: any): (SendReplyResult, nil)
    return { ok = true }, nil
end

return M

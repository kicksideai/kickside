local M = {}
function M.get()
    return { status_code = 200, body = [[{"data":[
        {"id":"anthropic/shared-model","context_length":12345},
        {"id":"openai/owned-model","context_length":67890}
    ]}]] }
end
return M

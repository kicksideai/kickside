local M = {}
function M.get(url)
    if tostring(url):find("/embeddings/models", 1, true) then
        return { status_code = 200, body = [[{"data":[
            {"id":"openai/text-embedding-3-small","context_length":8192}
        ]}]] }
    end
    return { status_code = 200, body = [[{"data":[
        {"id":"anthropic/shared-model","context_length":12345},
        {"id":"openai/owned-model","context_length":67890}
    ]}]] }
end
return M

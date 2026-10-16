local M = {}
function M.get_all(): any
    return { { name = "fixture/generate", capabilities = { "generate" }, output_tokens = 8192 },
        { name = "fixture/embed", capabilities = { "embed" }, dimensions = 512 } }
end
return M

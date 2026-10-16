local flow = require("flow")

local M = {}

function M.run(args: any): (any?, string?)
    local a = type(args) == "table" and args or {}
    local stub_func_id = tostring((a :: any).stub_func_id or "")
    if stub_func_id ~= "" then
        return flow.create()
            :with_title("seam test")
            :with_input({ seed = true })
            :cycle({
                func_id = stub_func_id,
                max_iterations = 3,
                continue_condition = "result.continue == true",
            })
            :run()
    end

    return flow.create()
        :with_title("seam upstream")
        :with_input((a :: any).input)
        :func("kickside.transform:node_snippet_search")
        :func("kickside.transform:node_analyze")
        :cycle({
            func_id = "kickside.transform:test_stub_pass",
            max_iterations = 3,
            continue_condition = "result.continue == true",
        })
        :run()
end

return M

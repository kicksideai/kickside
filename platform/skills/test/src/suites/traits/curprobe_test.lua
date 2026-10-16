local test = require("test")
local time = require("time")
local json = require("json")
local test_identity = require("test_identity")

local TOOL = "kickside.skills.traits:skill_tool"
local LIST = "kickside.core.threads:list_projections_method"

local function as_table(value: any): any
    if type(value) == "table" then return value end
    if type(value) == "string" and value ~= "" then
        local decoded = json.decode(value :: string)
        if type(decoded) == "table" then return decoded end
    end
    return {}
end

local function executor(user_id: string): any
    local exec = test_identity.executor(user_id)
    return exec
end

local function define_tests()
    test.describe("cursor probe", function()
        test.it("dumps body + cursor after create", function()
            local exec = executor("curprobe_user")
            local out = exec:call(TOOL, { action = "save", name = "curprobe", description = "p", body = "CURBODY" })
            local skill_id = out.skill_id or ""
            test.is_true(skill_id ~= "", "no id")
            local thread_id = skill_id
            local last_body: any = nil
            local last_cursor: any = nil
            for i = 1, 5 do
                local r = exec:call(LIST, { thread_id = thread_id, limit = 50 })
                local projs = type(r) == "table" and (r :: any).projections or {}
                local curs = type(r) == "table" and (r :: any).cursors or {}
                local body = (#projs > 0) and as_table((projs[1] :: any).body) or nil
                last_body = body
                last_cursor = curs[1]
                print("PB i=" .. i .. " status=" .. (curs[1] and tostring((curs[1] :: any).status) or "none") .. " last=" .. (curs[1] and tostring((curs[1] :: any).last_seq) or "x") .. " BODY=" .. json.encode(body))
                time.sleep("300ms")
            end
            test.eq((last_body or {}).current_version, 1,
                "projection must fold the created version; cursor=" .. json.encode(last_cursor) ..
                " body=" .. json.encode(last_body))
        end)
    end)
end

return test.run_cases(define_tests)

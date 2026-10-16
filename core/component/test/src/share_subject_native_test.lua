local test = require("test")
local funcs = require("funcs")
local share_subject = require("share_subject")
local M = {}

function M.probe(input)
    local id, kind, err = share_subject.normalize(input.subject)
    if err then return nil, err end
    return {id = id, subject_type = kind}, nil
end

local function define_tests()
    test.describe("native share subject normalization", function()
        local cases = {
            {field = "subject"}, {subject = false, field = "subject"},
            {subject = "member", field = "subject"}, {subject = 12, field = "subject"},
            {subject = {}, field = "subject.subject_id"},
            {subject = {subject_id = ""}, field = "subject.subject_id"},
            {subject = {subject_id = false}, field = "subject.subject_id"},
            {subject = {subject_id = 12}, field = "subject.subject_id"},
            {subject = {subject_id = {}}, field = "subject.subject_id"},
        }
        for index, case in ipairs(cases) do
            for _, boundary in ipairs({"library", "funcs"}) do
                test.it("retains subject refusal " .. index .. " at " .. boundary, function()
                    local result, err
                    if boundary == "library" then result, err = M.probe(case)
                    else result, err = funcs.call("app:share_subject_native_probe", case) end
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INVALID))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "component_share_subject_invalid")
                    test.eq(err:details().field, case.field)
                end)
            end
        end
        for _, subject_type in ipairs({"user", "group", "service"}) do
            for _, boundary in ipairs({"library", "funcs"}) do
                test.it("retains opaque " .. subject_type .. " identity at " .. boundary, function()
                    local input = {subject = {subject_id = "opaque-subject", subject_type = subject_type}}
                    local result, err
                    if boundary == "library" then result, err = M.probe(input)
                    else result, err = funcs.call("app:share_subject_native_probe", input) end
                    test.is_nil(err)
                    test.eq(result.id, "opaque-subject")
                    test.eq(result.subject_type, subject_type)
                end)
            end
        end
        for _, value in ipairs({false, "", "agent"}) do
            test.it("retains the subject-type validator's native metadata", function()
                local result, err = M.probe({subject = {subject_id = "opaque-subject", subject_type = value}})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "component_access_invalid")
            end)
        end
    end)
end
M.run = test.run_cases(define_tests)
return M

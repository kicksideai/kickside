local http = require("http")
local json = require("json")
local execution_identity = require("execution_identity")
local declaration_authority = require("declaration_authority")

local M = {}

function M.check()
    local res = assert(http.response())
    local req = assert(http.request())
    local raw, read_err = req:body()
    assert(not read_err, tostring(read_err))
    local input, decode_err = json.decode(raw)
    assert(not decode_err and type(input) == "table", tostring(decode_err))
    local operator, operator_err = execution_identity.capture()
    assert(not operator_err, tostring(operator_err))
    local selected, selected_err = execution_identity.capture({principal = input.principal})
    assert(not selected_err, tostring(selected_err))
    if input.authorized_by ~= nil then selected.authorized_by = input.authorized_by end
    local operator_allowed, operator_check_err = declaration_authority.check(operator,
        execution_identity.actor_key(operator.principal), input.refs)
    local selected_allowed, selected_check_err = declaration_authority.check(selected,
        execution_identity.actor_key(selected.principal), input.refs)
    res:set_content_type(http.CONTENT.JSON)
    res:set_status(operator_allowed and selected_allowed and http.STATUS.OK or http.STATUS.FORBIDDEN)
    res:write_json({success = operator_allowed and selected_allowed,
        operator_allowed = operator_allowed, selected_allowed = selected_allowed,
        operator_error = operator_check_err and tostring(operator_check_err) or nil,
        selected_error = selected_check_err and tostring(selected_check_err) or nil,
        principal = selected.principal, authorized_by = selected.authorized_by})
end

return M

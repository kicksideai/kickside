local contract = require("contract")
local executor = require("capacity_executor")
local M = {}

local function selected_owner(contracts: any): (any?, error?)
    local definition, get_err = contracts.get("kickside.contract:connection_capacity")
    if get_err and not errors.is(get_err, errors.NOT_FOUND) then return nil, get_err end
    if not definition then return nil, nil end
    local single, options_err = definition:with_options({retry = {max_attempts = 1}})
    if options_err then return nil, options_err end
    local owner, open_err = single:open()
    if open_err and not errors.is(open_err, errors.NOT_FOUND) then return nil, open_err end
    return owner, nil
end

function M.new(dependencies: any?): any
    local contracts = dependencies and dependencies.contract or contract
    return executor.new({
        check = function(component_id: string): (any?, error?)
            local owner, err = selected_owner(contracts)
            if err then return nil, err end
            if not owner then return {status = "not_supported"}, nil end
            return owner:check({connection_id = component_id})
        end,
        record = function(component_id: string, failure: error): (any?, error?)
            local owner, err = selected_owner(contracts)
            if err or not owner then return nil, err end
            return owner:record({connection_id = component_id, error = {
                kind = failure:kind(), message = failure:message(),
                retryable = failure:retryable(), details = failure:details(),
            }})
        end,
    })
end

return M
